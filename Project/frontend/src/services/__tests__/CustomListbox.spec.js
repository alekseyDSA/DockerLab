import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomListbox from '../CustomListbox.vue'

describe('CustomListbox', () => {
    const options = [
        { value: 1, label: 'Опция 1' },
        { value: 2, label: 'Опция 2' },
        { value: 3, label: 'Опция 3' }
    ]

    it('рендерит кнопку с плейсхолдером', () => {
        const wrapper = mount(CustomListbox, {
            props: {
                options: [],
                placeholder: 'Выберите...'
            }
        })

        expect(wrapper.find('.listbox-button').text()).toContain('Выберите...')
    })

    it('отображает выбранную опцию', () => {
        const wrapper = mount(CustomListbox, {
            props: {
                options,
                modelValue: 2
            }
        })

        expect(wrapper.find('.listbox-label').text()).toBe('Опция 2')
    })

    it('открывает список при клике', async () => {
        const wrapper = mount(CustomListbox, {
            props: { options }
        })

        expect(wrapper.find('.listbox-dropdown').exists()).toBe(false)

        await wrapper.find('.listbox-button').trigger('click')

        expect(wrapper.find('.listbox-dropdown').exists()).toBe(true)
        expect(wrapper.findAll('.listbox-option')).toHaveLength(3)
    })

    it('эмитит событие при выборе опции', async () => {
        const wrapper = mount(CustomListbox, {
            props: { options }
        })

        await wrapper.find('.listbox-button').trigger('click')
        await wrapper.findAll('.listbox-option')[1].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(2)
        expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({
            value: 2,
            label: 'Опция 2'
        })
    })

    it('фильтрует опции при поиске', async () => {
        const wrapper = mount(CustomListbox, {
            props: {
                options,
                searchable: true
            }
        })

        await wrapper.find('.listbox-button').trigger('click')

        const searchInput = wrapper.find('.listbox-search-input')
        await searchInput.setValue('Опция 1')

        expect(wrapper.findAll('.listbox-option')).toHaveLength(1)
        expect(wrapper.find('.listbox-option').text()).toContain('Опция 1')
    })
})