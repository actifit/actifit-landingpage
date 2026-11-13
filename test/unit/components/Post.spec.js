import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Post from '@/components/Post.vue'
import CardActions from '@/components/CardActions.vue'
import { clearSharedFetchCache } from '@/utils/sharedFetch'

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

describe('card API calls (commonCardMixin)', () => {
  let observers
  beforeEach(() => {
    clearSharedFetchCache()
    process.env.actiAppUrl = 'https://api.test/'
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ token_count: 3 }) }))
    observers = []
    global.IntersectionObserver = class {
      constructor (cb) { this.cb = cb; observers.push(this) }
      observe () {}
      disconnect () {}
    }
    global.$ = jest.fn(() => ({ on: jest.fn(), modal: jest.fn(), hasClass: jest.fn(() => false) }))
  })
  afterEach(() => {
    delete global.fetch
    delete global.IntersectionObserver
    delete global.$
  })

  const statCalls = () => global.fetch.mock.calls.map(c => c[0]).filter(u => /getRank|getPostReward/.test(u))

  it('waits until a card is near the screen, then shares one rank request per author', async () => {
    const a = mountPost({ permlink: 'p1', url: '/@bob/p1' })
    const b = mountPost({ permlink: 'p2', url: '/@bob/p2' })
    await a.vm.$nextTick()
    expect(statCalls()).toEqual([])

    observers.forEach(o => o.cb([{ isIntersecting: true }]))
    await new Promise(resolve => setTimeout(resolve, 0))

    const calls = statCalls()
    expect(calls.filter(u => u === 'https://api.test/getRank/bob')).toHaveLength(1)
    expect(calls.filter(u => u.includes('getPostReward'))).toHaveLength(2)
    expect(a.vm.afitReward).toBe(3)
    a.destroy()
    b.destroy()
  })
})
