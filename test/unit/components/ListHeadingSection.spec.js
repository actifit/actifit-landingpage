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

  it('renders a fixed-size avatar without Bootstrap column classes', async () => {
    const wrapper = shallowMount(ListHeadingSection, {
      propsData: {
        username: 'pjansen',
        textualDisplay: 'Activity Reports by pjansen'
      }
    })

    const avatar = wrapper.find('.list-heading-avatar')

    expect(avatar.exists()).toBe(true)
    expect(avatar.element.tagName).toBe('IMG')
    expect(avatar.attributes('width')).toBe('30')
    expect(avatar.attributes('height')).toBe('30')
    expect(avatar.attributes('src')).toContain('/u/pjansen/avatar')
    expect(avatar.classes()).not.toContain('col-12')
    expect(avatar.classes()).not.toContain('col-md-12')

    await avatar.trigger('error')

    expect(wrapper.find('.list-heading-avatar').attributes('src')).toBe('/img/actifit_logo_32.png')
  })
})
