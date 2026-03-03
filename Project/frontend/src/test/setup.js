import { expect, afterEach } from 'vitest'
import { cleanup } from '@vue/test-utils'
import matchers from '@testing-library/jest-dom/matchers'

// Добавляем матчеры из jest-dom
expect.extend(matchers)

// Очистка после каждого теста
afterEach(() => {
    cleanup()
})