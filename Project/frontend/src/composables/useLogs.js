// composables/useLogs.js (обновлённый addLog)
import { ref, onMounted } from 'vue'
import { storageService } from '../services/storage.service'

const LOGS_COOKIE_NAME = 'user_registration_logs'
const LOGS_EXPIRY_DAYS = 7

export function useLogs() {
    const userLogs = ref([])

    const loadLogs = () => {
        const savedLogs = storageService.get(LOGS_COOKIE_NAME)
        if (savedLogs && Array.isArray(savedLogs)) {
            userLogs.value = savedLogs
        }
    }

    const saveLogs = () => {
        storageService.set(LOGS_COOKIE_NAME, userLogs.value, LOGS_EXPIRY_DAYS)
    }

    const addLog = (logData) => {
        const newLog = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            ...logData
        }

        // Добавляем в начало массива (новые сверху)
        userLogs.value = [newLog, ...userLogs.value]

        // Ограничиваем количество логов до 50
        if (userLogs.value.length > 50) {
            userLogs.value = userLogs.value.slice(0, 50)
        }

        saveLogs()
    }

    const clearLogs = () => {
        if (confirm('Вы уверены, что хотите очистить историю регистраций?')) {
            userLogs.value = []
            saveLogs()
        }
    }

    const isNewLog = (log) => {
        const logTime = new Date(log.timestamp).getTime()
        const now = new Date().getTime()
        const fiveMinutes = 5 * 60 * 1000
        return now - logTime < fiveMinutes
    }

    onMounted(() => {
        loadLogs()
    })

    return {
        userLogs,
        addLog,
        clearLogs,
        isNewLog
    }
}