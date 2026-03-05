// Сервис для работы с хранилищем (cookie/localStorage)
export const storageService = {
    // Cookie методы
    setCookie(name, value, days) {
        const expires = new Date()
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
        document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`
    },

    getCookie(name) {
        const cookies = document.cookie.split('; ')
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=')
            if (cookieName === name) {
                try {
                    return JSON.parse(cookieValue)
                } catch {
                    return null
                }
            }
        }
        return null
    },

    removeCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    },

    // Унифицированный интерфейс
    set(key, value, days = 7) {
        this.setCookie(key, value, days)
    },

    get(key) {
        return this.getCookie(key)
    },

    remove(key) {
        this.removeCookie(key)
    }
}