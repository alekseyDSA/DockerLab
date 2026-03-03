import { describe, it, expect } from 'vitest'
import { CompanyService } from '../company.service'

describe('CompanyService', () => {
    const mockBranchData = {
        queueServices: [
            {
                id: 1,
                defaultName: 'Хирургия',
                preRegistrationDates: [
                    {
                        date: '24.03.2026',
                        preRegistrationIntervals: [
                            { time: '09:00', availableClientsCount: 5 },
                            { time: '10:00', availableClientsCount: 0 },
                            { time: '11:00', availableClientsCount: 2 }
                        ]
                    }
                ]
            }
        ]
    }

    it('extractFreeSlots должен возвращать только доступные слоты', () => {
        const slots = CompanyService.extractFreeSlots(mockBranchData)

        expect(slots).toHaveLength(2)
        expect(slots[0]).toMatchObject({
            serviceId: 1,
            date: '24.03.2026',
            time: '09:00',
            availableCount: 5
        })
    })

    it('findFirstAvailableSlot должен находить первый доступный слот', () => {
        const slot = CompanyService.findFirstAvailableSlot(mockBranchData, 1)

        expect(slot).toEqual({
            date: '24.03.2026',
            time: '09:00'
        })
    })

    it('findFirstAvailableSlot должен возвращать null, если слотов нет', () => {
        const noSlotsData = {
            queueServices: [
                {
                    id: 1,
                    preRegistrationDates: [
                        {
                            date: '24.03.2026',
                            preRegistrationIntervals: [
                                { time: '09:00', availableClientsCount: 0 }
                            ]
                        }
                    ]
                }
            ]
        }

        const slot = CompanyService.findFirstAvailableSlot(noSlotsData, 1)
        expect(slot).toBeNull()
    })
})