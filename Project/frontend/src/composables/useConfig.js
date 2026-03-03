import { ref, onMounted } from 'vue'

const configCache = ref(null)
const loading = ref(false)
const error = ref(null)

export function useConfig(type = 'pre') {
    const config = ref(null)

    const loadConfig = async () => {
        // Если уже загружено для этого типа, возвращаем
        if (configCache.value?.[type]) {
            config.value = configCache.value[type]
            return config.value
        }

        loading.value = true
        error.value = null

        try {
            const fileName = type === 'pre' ? 'servers.pre.json' : 'servers.regular.json'
            const response = await fetch(`/config/${fileName}`)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()

            // Кэшируем
            if (!configCache.value) configCache.value = {}
            configCache.value[type] = data
            config.value = data

            return data
        } catch (e) {
            error.value = `Ошибка загрузки конфигурации: ${e.message}`
            console.error(e)
            return null
        } finally {
            loading.value = false
        }
    }

    // Функция для форматирования опций для listbox
    const getRegistratorOptions = () => {
        if (!config.value?.registrators) return []
        return config.value.registrators.map(r => ({
            value: {
                id: r.id,
                ip: r.ip,
                port: r.port,
                name: r.name
            },
            label: `${r.name} (${r.ip})`
        }))
    }

    // Загружаем при создании
    onMounted(() => {
        loadConfig()
    })

    return {
        config,
        loading,
        error,
        loadConfig,
        getRegistratorOptions
    }
}