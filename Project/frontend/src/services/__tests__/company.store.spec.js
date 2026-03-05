import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCompanyStore } from '../company'
import { ApiService } from '@/services/api.service'

// Мокаем API сервис
vi.mock('@/services/api.service', () => ({
    ApiService: {
        getCompanyBranches: vi.fn()
    }
}))

describe('company store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('изначально пустой', () => {
        const store = useCompanyStore()
        expect(store.services).toEqual([])
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
    })

    it('loadForRegistrator загружает и обрабатывает данные', async () => {
        const mockResponse = {
            companyBranches: [
                {
                    id: 1,
                    defaultName: 'Главный корпус',
                    queueServices: [
                        {
                            id: 101,
                            defaultName: 'Хирургия',
                            preRegistrationDates: [
                                {
                                    date: '24.03.2026',
                                    preRegistrationIntervals: [
                                        { time: '09:00', availableClientsCount: 5 }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        ApiService.getCompanyBranches.mockResolvedValueOnce(mockResponse)

        const store = useCompanyStore()
        const registrator = { ip: '192.168.1.100', name: 'Test' }

        await store.loadForRegistrator(registrator)

        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.services).toHaveLength(1)
        expect(store.services[0]).toMatchObject({
            id: 101,
            name: 'Хирургия'
        })
        expect(store.currentRegistrator).toEqual(registrator)
    })

    it('serviceOptions правильно форматирует услуги', () => {
        const store = useCompanyStore()
        store.services = [
            { id: 1, name: 'Хирургия' },
            { id: 2, name: 'Терапия' }
        ]

        expect(store.serviceOptions).toEqual([
            { value: { id: 1, name: 'Хирургия' }, label: 'Хирургия' },
            { value: { id: 2, name: 'Терапия' }, label: 'Терапия' }
        ])
    })

    it('обрабатывает ошибки загрузки', async () => {
        ApiService.getCompanyBranches.mockRejectedValueOnce(new Error('Network error'))

        const store = useCompanyStore()
        const registrator = { ip: '192.168.1.100' }

        await store.loadForRegistrator(registrator)

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Network error')
        expect(store.services).toEqual([])
    })
})