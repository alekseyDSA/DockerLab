import { ref } from 'vue'
import { RegistrationService } from '../services/registration.service'

export function useRegistration() {
    const isLoading = ref(false)
    const error = ref(null)
    const result = ref(null)

    const register = async (formData) => {
        isLoading.value = true
        error.value = null
        result.value = null

        try {
            const registrator = formData.Registrator
            const service = formData.service
            const doctor = formData.doctorName

            if (!registrator?.ip) {
                throw new Error('Не выбран сервер')
            }

            if (!service?.id) {
                throw new Error('Не выбрана услуга')
            }

            const registrationResult = await RegistrationService.registerPatient(
                registrator,
                service.id,
                doctor
            )

            if (registrationResult.success) {
                result.value = registrationResult
                return registrationResult
            } else {
                throw new Error(registrationResult.message)
            }
        } catch (e) {
            error.value = e.message
            console.error('Registration error:', e)
            return { success: false, message: e.message }
        } finally {
            isLoading.value = false
        }
    }

    const reset = () => {
        isLoading.value = false
        error.value = null
        result.value = null

    }

    return {
        isLoading,
        error,
        result,
        register,
        reset
    }
}