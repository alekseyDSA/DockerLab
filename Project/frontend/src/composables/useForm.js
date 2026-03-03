import { ref, computed, onMounted } from 'vue'
import { formConfig, getAllFields, getFieldByName } from '../config/form.config'

export function useForm() {
    const formData = ref({})
    const isExpanded = ref(false)

    const initForm = () => {
        const allFields = getAllFields()
        allFields.forEach(field => {
            if (field.type === 'checkbox') {
                formData.value[field.name] = false
            } else if (field.type === 'select' || field.type === 'listbox') {
                formData.value[field.name] = null
            } else {
                formData.value[field.name] = ''
            }
        })
    }


    const isFormValid = computed(() => {
        const allFields = getAllFields()

        for (const field of allFields) {
            if (isFieldRequired(field)) {
                const value = formData.value[field.name]
                if (value === null || value === undefined || value === '') {
                    return false
                }
                if (field.validation && !field.validation(value)) {
                    return false
                }
            }
        }
        return true
    })

    const isFieldRequired = (field) => {
        if (!field.required) return false

        if (typeof field.required === 'object' && field.required.dependsOn) {
            const dependsField = formData.value[field.required.dependsOn.field]
            return dependsField === field.required.dependsOn.value
        }

        return field.required
    }

    const shouldShowField = (field) => {
        if (field.showIf) {
            const dependsField = formData.value[field.showIf.field]
            return dependsField === field.showIf.value
        }
        return true
    }

    const getFieldDisplayValue = (field) => {
        const value = formData.value[field.name]

        if (value === null || value === undefined || value === '') {
            return 'Не выбрано'
        }

        if (field.type === 'listbox' || field.type === 'select') {
            const option = field.options?.find(opt => {
                if (typeof opt.value === 'object') {
                    return opt.value.id === value?.id
                }
                return opt.value === value
            })
            return option?.label || value
        }

        if (field.type === 'checkbox') {
            return value ? 'Да' : 'Нет'
        }

        return value
    }

    const toggleExpanded = () => {
        isExpanded.value = !isExpanded.value
    }

    const resetForm = () => {
        initForm()
    }

    onMounted(() => {
        initForm()
    })

    return {
        formData,
        isExpanded,
        isFormValid,
        formConfig,
        getFieldByName,
        isFieldRequired,
        shouldShowField,
        getFieldDisplayValue,
        toggleExpanded,
        resetForm,
        initForm
    }
}