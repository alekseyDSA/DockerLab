import { rest } from 'msw'

export const handlers = [
    // Мок для companyBranches
    rest.get('*/v1/companyBranches', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                companyBranches: [
                    {
                        id: 1,
                        defaultName: 'Тестовый филиал',
                        queueServices: [
                            {
                                id: 101,
                                defaultName: 'Тестовая услуга',
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
            })
        )
    }),

    // Мок для предрегистрации
    rest.post('*/v1/preRegistration', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                preRegistrations: [
                    {
                        preregistrationId: 12345,
                        clientCode: 'TEST123',
                        date: '24.03.2026',
                        time: '09:00',
                        registrationTime: '2026-03-24T10:30:00',
                        status: 'ACTIVE'
                    }
                ]
            })
        )
    })
]