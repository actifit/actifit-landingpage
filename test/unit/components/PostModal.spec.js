import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import PostModal from '@/components/PostModal.vue'

const SocialSharingStub = {
  template: '<div class="social-sharing-stub"><slot /></div>'
}

const NetworkStub = {
  template: '<span class="network-stub"><slot /></span>'
}

function buildPost(overrides = {}) {
  return {
    author: 'bob',
    permlink: 'sample-post',
    created: '2026-08-01T12:34:00Z',
    active_votes: [{ voter: 'alice' }],
    json_metadata: '{}',
    pending_payout_value: '12.345 HBD',
    children: 7,
    category: 'hive-123',
    body: '<p>Hello world</p>',
    url: 'https://actifit.io/@bob/sample-post',
    beneficiaries: [],
    is_paidout: false,
    last_payout: '2026-08-01T00:00:00Z',
    cashout_time: '2026-08-15T00:00:00Z',
    ...overrides
  }
}

function mountPostModal(postOverrides = {}) {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const store = new Vuex.Store({
    state: {
      commentEntries: { author: 'bob', body: 'Nice post', reply_entries: [] },
      commentCountToday: 0,
      moderators: [],
      bchain: 'HIVE'
    },
    getters: {
      commentEntries: (state) => state.commentEntries,
      commentCountToday: (state) => state.commentCountToday,
      moderators: (state) => state.moderators,
      bchain: (state) => state.bchain
    },
    actions: {
      fetchPostComments: jest.fn(() => Promise.resolve()),
      fetchModerators: jest.fn(() => Promise.resolve())
    },
    modules: {
      steemconnect: {
        namespaced: true,
        state: {},
        getters: {
          user: () => ({ account: { name: 'alice' } }),
          stdLogin: () => true
        }
      }
    }
  })

  return mount(PostModal, {
    localVue,
    store,
    propsData: { post: buildPost(postOverrides) },
    mocks: {
      $t: (key) => key,
      $cleanBody: (value) => value,
      $getTimeDifference: () => '1 hour ago',
      $router: { push: jest.fn() },
      $fetchReportTags: jest.fn(() => ''),
      $reblog: jest.fn(),
      $notify: jest.fn(),
      $uuidv4: jest.fn(() => 'uuid-1')
    },
    stubs: {
      Comments: true,
      CustomTextEditor: true,
      SafeRemarkable: true,
      UserHoverCard: true,
      'social-sharing': SocialSharingStub,
      network: NetworkStub,
      CardActions: false
    }
  })
}

describe('PostModal footer layout', () => {
  beforeEach(() => {
    global.$ = jest.fn(() => ({ on: jest.fn(), modal: jest.fn() }))
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({ token_count: 0 })
    }))
  })

  afterEach(() => {
    delete global.$
    delete global.fetch
  })

  it('renders the consolidated footer actions in the new layout', () => {
    const wrapper = mountPostModal()

    expect(wrapper.find('#modal-footer .post-detail-footer__actions').exists()).toBe(true)
    expect(wrapper.find('#modal-footer .post-detail-footer__payout').exists()).toBe(true)
    expect(wrapper.find('#modal-footer .post-detail-footer__sharing').exists()).toBe(true)
    expect(wrapper.find('#modal-footer .post-detail-payout-toggle').exists()).toBe(true)
    expect(wrapper.findAll('#modal-footer .post-detail-footer__actions .post-detail-action').length).toBe(4)

    wrapper.destroy()
  })

  it('keeps the sharing row inside the same footer block', () => {
    const wrapper = mountPostModal()

    const footer = wrapper.find('#modal-footer.post-detail-footer')

    expect(footer.exists()).toBe(true)
    expect(footer.find('.post-detail-footer__payout').exists()).toBe(true)
    expect(footer.find('.post-detail-footer__sharing').exists()).toBe(true)

    wrapper.destroy()
  })
})
