import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ReportModal from '@/components/ReportModal.vue'
import CardActions from '@/components/CardActions.vue'

const SocialSharingStub = {
  template: '<div class="social-sharing-stub"><slot /></div>'
}

const NetworkStub = {
  template: '<span class="network-stub"><slot /></span>'
}

const SafeRemarkableStub = {
  template: '<div class="safe-remarkable-stub"></div>'
}

function buildReport(overrides = {}) {
  return {
    author: 'bob',
    permlink: 'sample-report',
    title: 'Sample report',
    created: '2026-08-01T12:34:00Z',
    active_votes: [{ voter: 'alice' }],
    json_metadata: '{}',
    pending_payout_value: '12.345 HBD',
    total_payout_value: '0.000 HBD',
    curator_payout_value: '0.000 HBD',
    children: 0,
    category: 'hive-123',
    body: '<p>Hello world</p>',
    url: 'https://actifit.io/@bob/sample-report',
    beneficiaries: [],
    is_paidout: false,
    last_payout: '2026-08-01T00:00:00Z',
    cashout_time: '2026-08-15T00:00:00Z',
    ...overrides
  }
}

function mountReportModal(reportOverrides = {}, user = null) {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const store = new Vuex.Store({
    state: {
      commentEntries: null,
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
      fetchReportComments: jest.fn(() => Promise.resolve()),
      fetchModerators: jest.fn(() => Promise.resolve())
    },
    mutations: {
      setBchain: jest.fn()
    },
    modules: {
      steemconnect: {
        namespaced: true,
        state: {},
        getters: {
          user: () => user,
          stdLogin: () => true
        }
      }
    }
  })

  return mount(ReportModal, {
    localVue,
    store,
    propsData: { report: buildReport(reportOverrides) },
    mocks: {
      $t: (key) => key,
      $cleanBody: (value) => value,
      $getTimeDifference: () => '1 hour ago',
      $fetchReportTags: jest.fn(() => ''),
      $safeUrl: (value) => value,
      $reblog: jest.fn(),
      $notify: jest.fn(),
      $uuidv4: jest.fn(() => 'uuid-1')
    },
    stubs: {
      Comments: true,
      CustomTextEditor: true,
      SafeRemarkable: SafeRemarkableStub,
      UserHoverCard: true,
      'social-sharing': SocialSharingStub,
      network: NetworkStub,
      CardActions: false
    }
  })
}

describe('ReportModal vote wiring and logged-out guard', () => {
  beforeEach(() => {
    global.$ = jest.fn(() => ({ on: jest.fn(), modal: jest.fn(), hasClass: jest.fn(() => false) }))
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({ token_count: 0 })
    }))
    localStorage.setItem('cur_bchain', 'HIVE')
  })

  afterEach(() => {
    delete global.$
    delete global.fetch
    localStorage.removeItem('cur_bchain')
  })

  it('mounts safely for logged-out visitors and keeps the vote button on #voteModal', async () => {
    const wrapper = mountReportModal({}, null)

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const cardActions = wrapper.findComponent(CardActions)

    expect(cardActions.exists()).toBe(true)
    expect(cardActions.props('hasVoted')).toBe(false)
    expect(cardActions.props('voteModalTarget')).toBe('#voteModal')
    expect(cardActions.props('modalTarget')).toBe(null)
    expect(() => wrapper.vm.userVotedThisPost()).not.toThrow()
    expect(wrapper.vm.userVotedThisPost()).toBe(false)

    wrapper.destroy()
  })
})
