import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import HomeView from '../HomeView.vue'
import { useCompanyStore } from '@/stores/company'
import { RegistrationService } from '@/services/registration.service'

// Мокаем сервисы
vi.mock('@/services/registration.service', () => ({
    RegistrationService: {
        registerPatient: vi.fn()
    }
}))

// Мокаем композаблы
vi.mock('@/composables/useForm', () => ({
    useForm: () => ({
        formData: {
            value: {
                Registrator: { ip: '192.168.1.100', name: 'Test' },
                service: { id: 1, name: 'Хирургия' },
                doctorName: 'Иванов'
            }
        },
        isExpanded: { value: false },
        isFormValid: { value: true },
        toggleExpanded: vi.fn()
    })
}))

vi.mock('@/composables/useLogs', () => ({
    useLogs: () => ({
        userLogs: { value: [] },
        addLog: vi.fn(),
        clearLogs: vi.fn(),
        isNewLog: vi.fn()
    })
}))

describe('HomeView', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('рендерит заголовок', () => {
        const wrapper = mount(HomeView, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })

        expect(wrapper.find('.page-title').text()).toContain('Предварительная запись')
    })

    it('показывает ошибку из стора', () => {
        const wrapper = mount(HomeView, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            error: 'Сервер недоступен'
                        }
                    }
                })]
            }
        })

        expect(wrapper.find('.error-message').exists()).toBe(true)
        expect(wrapper.find('.error-message').text()).toContain('Сервер недоступен')
    })

    it('вызывает регистрацию при сабмите', async () => {
        RegistrationService.registerPatient.mockResolvedValueOnce({
            success: true,
            data: {
                clientCode: 'ABC123',
                serviceName: 'Хирургия',
                date: '24.03.2026',
                preregistrationId: 12345
            }
        })

        const wrapper = mount(HomeView, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    stubActions: false
                })]
            }
        })

        await wrapper.find('form').trigger('submit.prevent')

        expect(RegistrationService.registerPatient).toHaveBeenCalledWith(
            { ip: '192.168.1.100', name: 'Test' },
            1
        )

        // Ждем обновления DOM
        await wrapper.vm.$nextTick()

        // Проверяем, что модалка открылась
        expect(wrapper.find('.success-modal').exists()).toBe(true)
        expect(wrapper.find('.client-code').text()).toBe('ABC123')
    })
})