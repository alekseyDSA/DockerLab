// config/api.config.js
export const apiConfig = {
    // Убираем baseUrl, теперь будем использовать конкретные endpoints с их портами
    timeout: 10000,

    endpoints: {
        // Предварительная запись (порт 8100)
        getCompanyBranches: {
            path: '/v1/companyBranches',
            port: 8100,
            protocol: 'http',
            method: 'GET'
        },
        createPreRegistration: {
            path: '/v1/preRegistration',
            port: 8100,
            protocol: 'http',
            method: 'POST'
        },

        // Обычная запись (порт 8081)
        getQueueServices: {
            path: '/queueService/list',
            port: 8081,
            protocol: 'https',
            method: 'GET'
        },
        getPriorities: {
            path: '/priority/all',
            port: 8081,
            protocol: 'https',
            method: 'GET'
        },
        forceStartTicket: {  // обновляем название и путь
            path: '/client/forceStartTicketByNumber',
            port: 8081,
            protocol: 'https',
            method: 'POST'
        },
        getOperators: {
            path: '/operator/operatorWorkplace/list',
            port: 8081,
            protocol: 'https',
            method: 'GET'
        }
    },

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    errors: {
        400: 'Неверный запрос',
        401: 'Не авторизован',
        403: 'Доступ запрещен',
        404: 'Не найдено',
        500: 'Ошибка сервера'
    }
}

export const getEndpointConfig = (endpointName) => {
    return apiConfig.endpoints[endpointName]
}