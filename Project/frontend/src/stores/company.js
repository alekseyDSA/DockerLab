// stores/companyStore.js

// Импортируем функцию для создания стора из Pinia
import { defineStore } from 'pinia'

// Импортируем сервисы для работы с API и обработки данных
import { ApiService } from '@/services/api.service'
import { CompanyService } from '@/services/company.service'

// Создаем стор с именем 'company'
export const useCompanyStore = defineStore('company', {

    state: () => ({
        // Список филиалов компании
        branches: [],

        // Список услуг (упрощенных, для отображения в списке)
        services: [],

        // Свободные слоты для записи
        freeSlots: [],

        // Доступные даты
        dates: [],

        // Флаг загрузки (показывать спиннер или нет)
        loading: false,

        // Ошибка, если что-то пошло не так
        error: null,

        // Какой регистратор сейчас выбран
        currentRegistrator: null
    }),


    actions: {
        // Загружаем данные для конкретного регистратора
        async loadForRegistrator(registrator) {
            // Проверяем, передали ли нам нормальный объект регистратора
            if (!registrator?.ip) {
                console.warn('Не указан IP регистратора');
                return;
            }

            console.log(`Загружаем данные для ${registrator.name}`);

            // Включаем режим загрузки
            this.loading = true;

            // Сбрасываем старую ошибку
            this.error = null;

            // Запоминаем, для какого регистратора грузим
            this.currentRegistrator = registrator;

            try {
                // 1. Делаем запрос к API
                const response = await ApiService.getCompanyBranches(registrator);

                // 2. Проверяем, что нам вернулось
                if (response?.companyBranches?.length > 0) {
                    // Сохраняем все филиалы
                    this.branches = response.companyBranches;

                    // Важное допущение: в текущей конфигурации для поликлиник
                    // бэкенд всегда возвращает ровно один филиал.
                    // Если это изменится в будущем, потребуется доработка UI для выбора филиала.
                    const firstBranch = response.companyBranches[0];

                    // 3. Обрабатываем данные через CompanyService
                    // и сохраняем в стор
                    this.freeSlots = CompanyService.extractFreeSlots(firstBranch);
                    this.services = CompanyService.extractServices(firstBranch);
                    this.dates = CompanyService.extractDates(firstBranch);

                    console.log('Услуг загружено:', this.services.length);
                } else {
                    // Если данных нет, очищаем списки
                    console.warn('Нет данных для этого регистратора');
                    this.services = [];
                    this.freeSlots = [];
                    this.dates = [];
                }

            } catch (error) {
                // Если ошибка - записываем её в стор
                // временно
                this.error = error.message;
                console.error('Ошибка загрузки:', error);

                // При ошибке тоже очищаем данные
                this.services = [];
                this.freeSlots = [];
                this.dates = [];
            } finally {
                // В любом случае выключаем режим загрузки
                this.loading = false;
            }
        },

        // Функция для ручной очистки данных (на всякий случай)
        clearData() {
            this.branches = [];
            this.services = [];
            this.freeSlots = [];
            this.dates = [];
            this.error = null;
            this.currentRegistrator = null;
        }
    },

    getters: {
        // Этот геттер будет отдавать услуги в формате,
        // который нужен для listbox (value + label)
        serviceOptions: (state) => {
            // Проходим по всем услугам из state.services
            return state.services.map(service => ({
                //
                value: {
                    id: service.id,
                    ...service  // добавляем все поля
                },
                // название услуги
                label: service.name || 'Без названия'
            }));
        },

        // Проверяем, есть ли услуги
        hasServices: (state) => state.services.length > 0,

        // Проверяем, есть ли ошибка
        hasError: (state) => !!state.error
    }
});