// Сервис для обработки данных компании
export class CompanyService {
    // Извлечение свободных слотов
    static extractFreeSlots(branchData) {
        const slots = []

        if (!branchData?.queueServices) return slots

        branchData.queueServices.forEach(service => {
            service.preRegistrationDates?.forEach(dateItem => {
                dateItem.preRegistrationIntervals?.forEach(interval => {
                    if (interval.availableClientsCount > 0) {
                        slots.push({
                            serviceId: service.id,
                            serviceName: service.defaultName || service.localizedNames?.[1]?.name || 'Без названия',
                            date: dateItem.date,
                            time: interval.time,
                            availableCount: interval.availableClientsCount,
                            datetime: `${dateItem.date} ${interval.time}`
                        })
                    }
                })
            })
        })

        return slots.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    }

    // Извлечение услуг - убрали multiplyClients
    static extractServices(branchData) {
        if (!branchData?.queueServices) return []

        return branchData.queueServices.map(service => ({
            id: service.id,
            name: service.defaultName || service.localizedNames?.[1]?.name || 'Без названия',
            hasSlots: service.preRegistrationDates?.some(d =>
                d.preRegistrationIntervals?.some(i => i.availableClientsCount > 0)
            ) || false
        }))
    }

    // Извлечение дат
    static extractDates(branchData) {
        if (!branchData?.queueServices) return []

        const datesSet = new Set()

        branchData.queueServices.forEach(service => {
            service.preRegistrationDates?.forEach(dateItem => {
                datesSet.add(dateItem.date)
            })
        })

        return Array.from(datesSet).sort((a, b) => {
            const [d1, m1, y1] = a.split('.')
            const [d2, m2, y2] = b.split('.')
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`)
        })
    }
    /**
     * НОВЫЙ МЕТОД: Находит первый доступный слот для указанной услуги
     * @param {Array} branchData - данные о филиале (ответ от /v1/companyBranches)
     * @param {string|number} serviceId - ID выбранной услуги
     * @returns {Object|null} - объект { date, time } или null, если слотов нет
     */
    static findFirstAvailableSlot(branchData, serviceId) {
        if (!branchData?.queueServices) return null;

        // Ищем нужную услугу
        const targetService = branchData.queueServices.find(s => s.id == serviceId);
        if (!targetService?.preRegistrationDates) return null;

        // Проходим по всем датам и интервалам в поисках первого свободного места
        for (const dateItem of targetService.preRegistrationDates) {
            // Сортируем интервалы по времени, чтобы найти самый ранний
            const sortedIntervals = [...(dateItem.preRegistrationIntervals || [])].sort((a, b) => a.time.localeCompare(b.time));

            for (const interval of sortedIntervals) {
                if (interval.availableClientsCount > 0) {
                    return {
                        date: dateItem.date,
                        time: interval.time
                    };
                }
            }
        }

        return null; // Свободных слотов нет
    }
}