import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import AutocompleteUsernameInput from '@/components/AutocompleteUsernameInput.vue'

jest.mock('axios')

function mountAutocomplete (props = {}) {
  return shallowMount(AutocompleteUsernameInput, { propsData: props })
}

describe('components/AutocompleteUsernameInput.vue', () => {
  afterEach(() => jest.clearAllMocks())

  describe('keyboard highlight navigation', () => {
    it('highlightNext advances and wraps around to the start', () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ mentionList: ['a', 'b', 'c'], highlightedIndex: -1 })

      wrapper.vm.highlightNext() // -1 -> 0
      expect(wrapper.vm.highlightedIndex).toBe(0)
      wrapper.vm.highlightNext() // 0 -> 1
      wrapper.vm.highlightNext() // 1 -> 2
      wrapper.vm.highlightNext() // 2 -> wrap to 0
      expect(wrapper.vm.highlightedIndex).toBe(0)
    })

    it('highlightPrevious moves back and wraps around to the end', () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ mentionList: ['a', 'b', 'c'], highlightedIndex: 0 })

      wrapper.vm.highlightPrevious() // 0 -> wrap to 2
      expect(wrapper.vm.highlightedIndex).toBe(2)
    })

    it('navigation is a no-op when the list is empty', () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ mentionList: [], highlightedIndex: -1 })
      wrapper.vm.highlightNext()
      expect(wrapper.vm.highlightedIndex).toBe(-1)
    })
  })

  describe('selection', () => {
    it('selectMention sets the value, hides the dropdown, and emits select', () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ showDropdownList: true })
      wrapper.vm.selectMention('alice')

      expect(wrapper.vm.inputValue).toBe('alice')
      expect(wrapper.vm.showDropdownList).toBe(false)
      expect(wrapper.emitted().select[0]).toEqual(['alice'])
    })

    it('selectHighlighted selects the currently highlighted mention', () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ mentionList: ['a', 'b'], highlightedIndex: 1 })
      wrapper.vm.selectHighlighted()
      expect(wrapper.emitted().select[0]).toEqual(['b'])
    })

    it('selectHighlighted does nothing when nothing is highlighted', () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ mentionList: ['a', 'b'], highlightedIndex: -1 })
      wrapper.vm.selectHighlighted()
      expect(wrapper.emitted().select).toBeUndefined()
    })
  })

  describe('onInput', () => {
    it('hides the dropdown and clears suggestions when the field is empty', () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ inputValue: '', mentionList: ['x'], showDropdownList: true })
      wrapper.vm.onInput()
      expect(wrapper.vm.showDropdownList).toBe(false)
      expect(wrapper.vm.mentionList).toEqual([])
    })
  })

  describe('fetchMentions', () => {
    beforeAll(() => { process.env.hiveApiNode = 'https://hive.test' })

    it('populates mentionList from a valid API response', async () => {
      axios.get.mockResolvedValue({ data: { input_type: 'account', input_value: ['alice', 'alicia'] } })
      const wrapper = mountAutocomplete()
      wrapper.setData({ inputValue: 'ali' })

      await wrapper.vm.fetchMentions()
      expect(wrapper.vm.mentionList).toEqual(['alice', 'alicia'])
    })

    it('clears mentionList for an invalid_input response', async () => {
      axios.get.mockResolvedValue({ data: { input_type: 'invalid_input' } })
      const wrapper = mountAutocomplete()
      wrapper.setData({ inputValue: 'zzz', mentionList: ['stale'] })

      await wrapper.vm.fetchMentions()
      expect(wrapper.vm.mentionList).toEqual([])
    })

    it('does nothing when the input is empty', async () => {
      const wrapper = mountAutocomplete()
      wrapper.setData({ inputValue: '' })
      await wrapper.vm.fetchMentions()
      expect(axios.get).not.toHaveBeenCalled()
    })
  })
})
