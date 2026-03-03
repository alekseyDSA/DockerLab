import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiService } from '../api.service'

describe('ApiService', () => {
    const mockRegistrator = {
        ip: '192.168.1.100',
        port: 8100
    }

    beforeEach(() => {
        global.fetch = vi.fn()
    })

    it('buildUrl должен правильно строить URL с регистратором', () => {
        const url = ApiService.buildUrl('getCompanyBranches', mockRegistrator)
        expect(url).toBe('http://192.168.1.100:8100/v1/companyBranches')
    })

    it('buildUrl должен падать на localhost без регистратора', () => {
        const url = ApiService.buildUrl('getCompanyBranches')
        expect(url).toBe('http://127.0.0.1:8100/v1/companyBranches')
    })

    it('request должен обрабатывать успешный ответ', async () => {
        const mockData = { companyBranches: [] }
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        })

        const result = await ApiService.request('getCompanyBranches', {}, mockRegistrator)
        expect(result).toEqual(mockData)
    })

    it('request должен кидать ошибку при 404', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found'
        })

        await expect(
            ApiService.request('getCompanyBranches', {}, mockRegistrator)
        ).rejects.toThrow('Не найдено')
    })
})