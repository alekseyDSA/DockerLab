// services/api.service.js
import { apiConfig, getEndpointConfig } from '../config/api.config'

export class ApiService {
    /**
     * Динамически строит URL на основе выбранного регистратора
     */
    static buildUrl(endpointName, registrator = null) {
        const config = getEndpointConfig(endpointName)

        if (!config) {
            throw new Error(`Неизвестный эндпоинт: ${endpointName}`)
        }

        // Если есть регистратор, используем его IP и порт
        if (registrator?.ip) {
            return `${config.protocol}://${registrator.ip}:${config.port}${config.path}`
        }

        // fallback на localhost
        return `${config.protocol}://127.0.0.1:${config.port}${config.path}`
    }

    static async request(endpointName, options = {}, registrator = null) {
        const config = getEndpointConfig(endpointName)

        if (!config) {
            throw new Error(`Неизвестный эндпоинт: ${endpointName}`)
        }

        // Динамически строим URL с IP выбранного сервера
        const url = this.buildUrl(endpointName, registrator)

        const defaultOptions = {
            method: config.method,
            headers: {
                ...apiConfig.headers,
                'X-Requested-With': 'XMLHttpRequest',
            },
            ...options
        }

        console.log(`📡 [${config.method}] ${endpointName} -> ${url}`)
        console.log(`📍 Используем сервер: ${registrator?.ip || '127.0.0.1'}:${config.port}`)

        try {
            const response = await fetch(url, defaultOptions)

            if (!response.ok) {
                const errorMessage = apiConfig.errors[response.status] ||
                    `Ошибка ${response.status}: ${response.statusText}`
                throw new Error(errorMessage)
            }

            const data = await response.json()
            console.log(`✅ ${endpointName} успешно получен`)
            return data
        } catch (error) {
            console.error(`❌ Ошибка ${endpointName}:`, error)
            throw error
        }
    }

    static async get(endpointName, registrator = null) {
        return this.request(endpointName, {}, registrator)
    }

    static async post(endpointName, data, registrator = null) {
        return this.request(endpointName, {
            method: 'POST',
            body: JSON.stringify(data)
        }, registrator)
    }

    static async getCompanyBranches(registrator = null) {
        return this.get('getCompanyBranches', registrator)
    }

    static async createPreRegistration(data, registrator, doctor = null) {
        return this.post('createPreRegistration', data, registrator)
    }

    static async getQueueServices(registrator = null) {
        return this.get('getQueueServices', registrator)
    }

    static async getPriorities(registrator = null) {
        return this.get('getPriorities', registrator)
    }

    static async getOperators(registrator = null) {
        return this.get('getOperators', registrator)
    }

    static async forceStartTicket(data, registrator = null) {
        return this.post('forceStartTicket', data, registrator)
    }
}