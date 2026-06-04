import { shallowMount } from '@vue/test-utils'
import TagInput from '@/components/TagInput.vue'

function mountTagInput (initialItems = []) {
  return shallowMount(TagInput, {
    propsData: { initialItems },
    mocks: { $t: (k) => k }
  })
}

describe('components/TagInput.vue', () => {
  describe('addItem', () => {
    it('adds a trimmed tag and clears the input', () => {
      const wrapper = mountTagInput([])
      wrapper.vm.newItem = '  fitness  '
      wrapper.vm.addItem()
      expect(wrapper.vm.items).toEqual(['fitness'])
      expect(wrapper.vm.newItem).toBe('')
    })

    it('strips a trailing comma from the tag', () => {
      const wrapper = mountTagInput([])
      wrapper.vm.newItem = 'health,'
      wrapper.vm.addItem()
      expect(wrapper.vm.items).toEqual(['health'])
    })

    it('does not add duplicate tags', () => {
      const wrapper = mountTagInput(['fitness'])
      wrapper.vm.newItem = 'fitness'
      wrapper.vm.addItem()
      expect(wrapper.vm.items).toEqual(['fitness'])
    })

    it('ignores empty / whitespace-only input', () => {
      const wrapper = mountTagInput([])
      wrapper.vm.newItem = '   '
      wrapper.vm.addItem()
      expect(wrapper.vm.items).toEqual([])
    })
  })

  describe('removeItem', () => {
    it('removes the tag at the given index', () => {
      const wrapper = mountTagInput(['a', 'b', 'c'])
      wrapper.vm.removeItem(1)
      expect(wrapper.vm.items).toEqual(['a', 'c'])
    })
  })

  describe('keyCheck', () => {
    const keyEvent = (keyCode) => ({ keyCode, preventDefault: jest.fn() })

    it.each([
      ['space', 32],
      ['comma', 188],
      ['enter', 13]
    ])('adds the current item when %s is pressed', (_label, code) => {
      const wrapper = mountTagInput([])
      wrapper.vm.newItem = 'running'
      const evt = keyEvent(code)
      wrapper.vm.keyCheck(evt)
      expect(evt.preventDefault).toHaveBeenCalled()
      expect(wrapper.vm.items).toEqual(['running'])
    })

    it('does nothing for other keys', () => {
      const wrapper = mountTagInput([])
      wrapper.vm.newItem = 'run'
      wrapper.vm.keyCheck(keyEvent(65)) // 'a'
      expect(wrapper.vm.items).toEqual([])
    })
  })

  describe('handlePaste', () => {
    const pasteEvent = (text) => ({
      clipboardData: { getData: () => text },
      preventDefault: jest.fn()
    })

    it('splits pasted text on whitespace/commas and adds the tags', () => {
      const wrapper = mountTagInput([])
      wrapper.vm.handlePaste(pasteEvent('one two,three   four'))
      expect(wrapper.vm.items).toEqual(['one', 'two', 'three', 'four'])
    })

    it('drops duplicates already present in the list', () => {
      const wrapper = mountTagInput(['one'])
      wrapper.vm.handlePaste(pasteEvent('one two'))
      expect(wrapper.vm.items).toEqual(['one', 'two'])
    })
  })
})
