import { shallowMount } from '@vue/test-utils'
import ListHeadingSection from '~/components/ListHeadingSection.vue'

describe('ListHeadingSection', () => {
  it('renders the page title as the only h1', () => {
    const wrapper = shallowMount(ListHeadingSection, {
      propsData: {
        textualDisplay: 'Activity Reports'
      }
    })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Activity Reports')
    expect(wrapper.find('h2').exists()).toBe(false)
  })
})
