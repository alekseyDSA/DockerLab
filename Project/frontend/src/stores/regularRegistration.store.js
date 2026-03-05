// stores/regularRegistration.store.js
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api.service'
import { regularFormConfig } from '@/config/regularForm.config'

export const useRegularRegistrationStore = defineStore('regularRegistration', {
    state: () => ({
        services: [],
        priorities: [],
        operators: [],
        loading: false,
        error: null,
        currentRegistrator: null
    }),

    getters: {
        // Услуги в формате для listbox
        serviceOptions: (state) => {
            if (!state.services || !Array.isArray(state.services)) return []
            return state.services.map(service => ({
                value: {
                    id: service.id,
                    name: service.name,
                    priority: service.priority,
                    numberingPrefix: service.numberingPrefix,
                    ...service
                },
                label: service.name || 'Без названия'
            }))
        },

        // Приоритеты для listbox
        priorityOptions: (state) => {
            if (!state.priorities || !Array.isArray(state.priorities)) return []
            return state.priorities.map(priority => ({
                value: priority.id,
                label: `${priority.name} (приоритет ${priority.priority})`,
                originalPriority: priority.priority,
                ...priority
            }))
        },

        // Операторы для listbox - ИСПРАВЛЕНО: выносим функцию отдельно
        operatorOptions: (state) => {
            if (!state.operators || !Array.isArray(state.operators)) return []

            return state.operators.map(operator => {
                // Форматируем метку прямо внутри map
                let label = operator.name || 'Без имени'

                // Добавляем локацию
                if (operator.room || operator.floor) {
                    const location = []
                    if (operator.floor) location.push(`эт.${operator.floor}`)
                    if (operator.room) location.push(`каб.${operator.room}`)
                    if (location.length) label += ` (${location.join(', ')})`
                }

                // Добавляем статус
                if (operator.status) {
                    const statusMap = {
                        'WAITING_CLIENT': '🟢',
                        'DOES_NOT_RESPOND': '🔴',
                        'SERVING_CLIENT': '🟡'
                    }
                    label = `${statusMap[operator.status] || '⚪'} ${label}`
                }

                return {
                    value: {
                        id: operator.id,
                        name: operator.name,
                        room: operator.room,
                        floor: operator.floor,
                        workplaceCustomId: operator.workplaceCustomId,
                        status: operator.status,
                        ...operator
                    },
                    label: label
                }
            })
        },

        hasServices: (state) => state.services && state.services.length > 0,
        hasPriorities: (state) => state.priorities && state.priorities.length > 0,
        hasOperators: (state) => state.operators && state.operators.length > 0,
        hasError: (state) => !!state.error
    },

    actions: {
        async loadServices(registrator) {
            if (!registrator?.ip) {
                this.error = 'Не указан IP регистратора'
                return
            }

            this.loading = true
            this.error = null
            this.currentRegistrator = registrator

            try {
                console.log(`📡 Загружаем услуги с ${registrator.ip}`)
                const services = await ApiService.getQueueServices(registrator)
                this.services = Array.isArray(services) ? services : []

                await this.loadPriorities(registrator)
                await this.loadOperators(registrator)

                console.log(`✅ Загружено ${this.services.length} услуг`)
            } catch (error) {
                this.error = error.message
                console.error('❌ Ошибка загрузки услуг:', error)
                this.services = []
            } finally {
                this.loading = false
            }
        },

        async loadPriorities(registrator) {
            if (!registrator?.ip) return

            try {
                console.log(`📡 Загружаем приоритеты с ${registrator.ip}`)
                const response = await ApiService.getPriorities(registrator)
                this.priorities = (response?.priorities || response || [])
                console.log(`✅ Загружено ${this.priorities.length} приоритетов`)
            } catch (error) {
                console.error('❌ Ошибка загрузки приоритетов:', error)
                this.priorities = []
            }
        },

        async loadOperators(registrator) {
            if (!registrator?.ip) return

            try {
                console.log(`📡 Загружаем операторов с ${registrator.ip}`)
                const operators = await ApiService.getOperators(registrator)
                this.operators = Array.isArray(operators) ? operators : []
                console.log(`✅ Загружено ${this.operators.length} операторов`)
            } catch (error) {
                console.error('❌ Ошибка загрузки операторов:', error)
                this.operators = []
            }
        },

        async registerTicket(formData) {
            if (!this.currentRegistrator) {
                throw new Error('Не выбран регистратор')
            }

            this.loading = true
            this.error = null

            try {
                const selectedService = formData.service?.value || formData.service
                const selectedPriority = formData.priority?.value || formData.priority
                const selectedOperator = formData.operator?.value || formData.operator

                if (!selectedOperator?.id) {
                    throw new Error('Не выбран оператор')
                }

                // Генерируем номер талона
                const ticketNumber = this.generateTicketNumber(selectedService)

                // Формируем тело запроса
                const requestData = {
                    workplaceId: selectedOperator.id,
                    operatorId: selectedOperator.id,
                    ticketNumber: ticketNumber,
                    queueServices: [selectedService?.id],
                    priorityId: selectedPriority,
                    language: regularFormConfig.defaults.language
                }

                console.log('📝 Отправляем запрос на создание талона:', requestData)

                const result = await ApiService.forceStartTicket(requestData, this.currentRegistrator)

                console.log('✅ Ответ от сервера:', result)

                // Извлекаем нужные данные из ответа
                const clientDTO = result.clientDTO || result

                return {
                    success: true,
                    data: result,
                    ticketNumber: clientDTO.ticketNumber,
                    clientId: clientDTO.id,
                    serviceName: this.getServiceNameById(selectedService?.id),
                    priorityName: this.getPriorityNameById(selectedPriority),
                    operatorName: selectedOperator.name || 'Неизвестный оператор',
                    operatorRoom: selectedOperator.room,
                    operatorFloor: selectedOperator.floor,
                    registrationTime: clientDTO.registrationTime,
                    status: clientDTO.clientStatus
                }
            } catch (error) {
                this.error = error.message
                console.error('❌ Ошибка регистрации:', error)
                return {
                    success: false,
                    message: error.message
                }
            } finally {
                this.loading = false
            }
        },

        // Вспомогательные методы
        generateTicketNumber(service) {
            const prefix = service?.numberingPrefix || ''
            const randomNum = Math.floor(Math.random() * 9000) + 1000
            return `${prefix}${randomNum}`
        },

        getServiceNameById(serviceId) {
            const service = this.services.find(s => s.id === serviceId)
            return service?.name || 'Неизвестная услуга'
        },

        getPriorityNameById(priorityId) {
            const priority = this.priorities.find(p => p.id === priorityId)
            return priority ? `${priority.name} (${priority.priority})` : 'Неизвестный приоритет'
        },

        clearData() {
            this.services = []
            this.priorities = []
            this.operators = []
            this.loading = false
            this.error = null
            this.currentRegistrator = null
        }
    }
})