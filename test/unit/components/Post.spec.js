import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Post from '@/components/Post.vue'
import CardActions from '@/components/CardActions.vue'

function buildPost(overrides = {}) {
  return {
    author: 'bob',
    permlink: 'sample-post',
    title: 'Sample post',
    created: '2026-08-01T12:34:00Z',
    active_votes: [{ voter: 'alice' }],
    json_metadata: '{}',
    pending_payout_value: '12.345 HBD',
    total_payout_value: '0.000 HBD',
    curator_payout_value: '0.000 HBD',
    children: 0,
    category: 'hive-123',
    body: '<p>Hello world</p>',
    url: 'https://actifit.io/@bob/sample-post',
    beneficiaries: [],
    is_paidout: false,
    last_payout: '2026-08-01T00:00:00Z',
    cashout_time: '2026-08-15T00:00:00Z',
    parent_author: '',
    ...overrides
  }
}

function mountPost(overrides = {}) {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const store = new Vuex.Store({
    state: {
      moderators: [],
      userPosts: []
    },
    getters: {
      moderators: (state) => state.moderators,
      userPosts: (state) => state.userPosts
    },
    actions: {
      fetchModerators: jest.fn(() => Promise.resolve())
    },
    modules: {
      steemconnect: {
        namespaced: true,
        state: {},
        getters: {
          user: () => ({ account: { name: 'alice' } })
        }
      }
    }
  })

  return mount(Post, {
    localVue,
    store,
    propsData: {
      post: buildPost(overrides),
      pstId: 'pst-1'
    },
    mocks: {
      $t: (key) => key,
      $cleanBody: (value) => value,
      $getTimeDifference: () => '1 hour ago',
      $reblog: jest.fn(),
      $notify: jest.fn(),
      $uuidv4: jest.fn(() => 'uuid-1')
    },
    stubs: {
      CardHeader: true,
      CardBody: true,
      UserHoverCard: true,
      SocialSharing: true,
      network: true
    }
  })
}

describe('components/Post.vue', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({ token_count: 0 })
    }))
    global.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    }
    global.$ = jest.fn(() => ({ on: jest.fn(), modal: jest.fn(), hasClass: jest.fn(() => false) }))
  })

  afterEach(() => {
    delete global.fetch
    delete global.IntersectionObserver
    delete global.$
  })

  it('passes the shared vote modal target to CardActions', () => {
    const wrapper = mountPost()

    const cardActions = wrapper.findComponent(CardActions)

    expect(cardActions.exists()).toBe(true)
    expect(cardActions.props('modalTarget')).toBe('#postModal')
    expect(cardActions.props('voteModalTarget')).toBe('#voteModal')

    wrapper.destroy()
  })
})
