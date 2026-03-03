// config/regularForm.config.js
export const regularFormConfig = {
    sections: [
        {
            id: 'server-info',
            title: 'Информация о сервере',
            description: 'Выберите сервер для регистрации',
            fields: [
                {
                    name: 'Registrator',
                    type: 'listbox',
                    label: 'Сервер',
                    autoSelectSingle: true,
                    required: true,
                    placeholder: 'Выберите сервер',
                    searchable: false,
                    options: [
                        {
                            value: {
                                id: 1,
                                ip: '192.168.80.25',
                                port: '8081',
                                name: 'Сервер 1'
                            },
                            label: 'Сервер 1 (192.168.80.25)'
                        }

                    ],
                    validation: (value) => value !== null
                }
            ]
        },
        {
            id: 'service-info',
            title: 'Информация об услуге',
            description: 'Выберите услугу и приоритет',
            fields: [
                {
                    name: 'service',
                    type: 'listbox',
                    label: 'Услуга',
                    required: true,
                    placeholder: 'Выберите услугу',
                    autoSelectSingle: true,
                    searchable: true,
                    dependsOn: {
                        field: 'Registrator',
                        condition: (registrator) => registrator !== null
                    },
                    validation: (value) => value !== null
                    // options приходят из стора
                },
                {
                    name: 'priority',
                    type: 'listbox',
                    label: 'Приоритет',
                    required: true,
                    placeholder: 'Выберите приоритет',
                    autoSelectSingle: true,
                    searchable: false,
                    validation: (value) => value !== null
                    // options приходят из стора
                }
            ]
        },
        {
            id: 'operator-info',
            title: 'Выбор оператора',
            description: 'Выберите оператора, к которому направить клиента',
            fields: [
                {
                    name: 'operator',
                    type: 'listbox',
                    label: 'Оператор',
                    required: true,
                    placeholder: 'Выберите оператора',
                    autoSelectSingle: true,
                    searchable: true,
                    dependsOn: {
                        field: 'Registrator',
                        condition: (registrator) => registrator !== null
                    },
                    validation: (value) => value !== null
                    // options будут загружаться динамически
                }
            ]
        }
    ],

    // Если понадобятся расширенные поля в будущем
    expandedSections: [],

    buttons: {
        submit: {
            label: 'Зарегистрировать'
        }
    },

    modal: {
        title: 'Пациент зарегистрирован',
        closeButton: 'Закрыть'
    },

    // Настройки по умолчанию
    defaults: {
        language: 'RUSSIAN_ru'
    }
}

// Функции для работы с полями
export const getRegularFieldByName = (name) => {
    for (const section of regularFormConfig.sections) {
        const field = section.fields.find(f => f.name === name)
        if (field) return field
    }
    for (const section of regularFormConfig.expandedSections) {
        const field = section.fields.find(f => f.name === name)
        if (field) return field
    }
    return null
}

export const getAllRegularFields = () => {
    const fields = []
    regularFormConfig.sections.forEach(section => {
        fields.push(...section.fields)
    })
    regularFormConfig.expandedSections.forEach(section => {
        fields.push(...section.fields)
    })
    return fields
}