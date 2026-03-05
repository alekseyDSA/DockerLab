// Конфиг для изменения текста внутри страницы, добавления DigitalQ серверов
// Для работы сервера, на него должен быть установлен DigitalqApi!!!
export const formConfig = {
    sections: [
        {
            id: 'server-selection',
            title: 'Выбор сервера',
            description: 'Выберите сервер, на котором будет выполняться регистрация',
            fields: [
                {
                    name: 'Registrator',
                    type: 'listbox',
                    label: 'Сервер',
                    autoSelectSingle: true,
                    required: true,
                    placeholder: 'Выберите сервер',
                    searchable: false,
                    validation: (value) => value !== null
                }
            ]
        },

        {
            id: 'service-selection',
            title: 'Выбор услуги',
            description: 'Выберите необходимую услугу для предварительной записи',
            fields: [
                {
                    name: 'service',
                    type: 'listbox',
                    label: 'Услуга',
                    required: true,
                    placeholder: 'Сначала выберите сервер',
                    autoSelectSingle: true,
                    searchable: false,
                    dependsOn: {
                        field: 'Registrator',
                        condition: (registrator) => registrator !== null
                    },
                    validation: (value) => value !== null
                    // options приходят из стора
                }
            ]
        }
    ],

    expandedSections: [

    ],

    buttons: {
        expand: {
            label: 'Дополнительно',
            collapsedLabel: 'Показать дополнительные поля',
            expandedLabel: 'Скрыть дополнительные поля'
        },
        submit: {
            label: 'Регистрация'
        }
    },

    modal: {
        title: '✅ Пациент предварительно записан',
        closeButton: 'Закрыть'
    }
}

// Функции для работы с полями
export const getFieldByName = (name) => {
    for (const section of formConfig.sections) {
        const field = section.fields.find(f => f.name === name)
        if (field) return field
    }
    for (const section of formConfig.expandedSections) {
        const field = section.fields.find(f => f.name === name)
        if (field) return field
    }
    return null
}

export const getAllFields = () => {
    const fields = []
    formConfig.sections.forEach(section => {
        fields.push(...section.fields)
    })
    formConfig.expandedSections.forEach(section => {
        fields.push(...section.fields)
    })
    return fields
}