import { shallowMount } from '@vue/test-utils'
import CardActions from '@/components/CardActions.vue'

function mountCardActions(props = {}) {
  return shallowMount(CardActions, {
    propsData: {
      cardData: {
        author: 'bob',
        children: 3,
        ...props.cardData
      },
      voteCount: 7,
      hasVoted: false,
      ...props
    },
    mocks: {
      $t: (key) => key
    }
  })
}

describe('components/CardActions.vue', () => {
  it('keeps the vote button wired to the shared vote modal target by default', () => {
    const wrapper = mountCardActions()

    expect(wrapper.props('voteModalTarget')).toBe('#voteModal')
    expect(wrapper.find('a[data-target="#voteModal"]').exists()).toBe(true)

    wrapper.destroy()
  })

  it('keeps the comments action on the provided modal target', () => {
    const wrapper = mountCardActions({ modalTarget: '#postModal' })

    expect(wrapper.find('a[data-target="#postModal"]').exists()).toBe(true)

    wrapper.destroy()
  })

  it('emits the expected action events when clicked', async () => {
    const wrapper = mountCardActions({ showReply: true })

    await wrapper.findAll('.post-detail-action').at(0).trigger('click')
    await wrapper.findAll('.post-detail-action').at(1).trigger('click')
    await wrapper.findAll('.post-detail-action').at(2).trigger('click')

    expect(wrapper.emitted('reply')).toBeTruthy()
    expect(wrapper.emitted('vote-prompt')).toBeTruthy()
    expect(wrapper.emitted('open-modal')).toBeTruthy()

    wrapper.destroy()
  })
})
