jest.mock('dsteem', () => ({ Client: jest.fn() }))
jest.mock('@hiveio/dhive', () => ({ Client: jest.fn() }))

import fs from 'fs'
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ReportPage from '@/pages/_username/_permlink/index.vue'
import CardActions from '@/components/CardActions.vue'

const SocialSharingStub = {
  template: '<div class="social-sharing-stub"><slot /></div>'
}

const NetworkStub = {
  template: '<span class="network-stub"><slot /></span>'
}

const SimpleStub = {
  template: '<div><slot /></div>'
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
    parent_author: '',
    parent_permlink: '',
    ...overrides
  }
}

function mountReportPage(reportOverrides = {}, user = { account: { name: 'alice' } }) {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const store = new Vuex.Store({
    state: {
      commentEntries: null,
      newlyVotedPosts: [],
      bchain: 'HIVE',
      moderators: [],
      commentCountToday: 0
    },
    getters: {
      commentEntries: (state) => state.commentEntries,
      newlyVotedPosts: (state) => state.newlyVotedPosts,
      bchain: (state) => state.bchain,
      moderators: (state) => state.moderators,
      commentCountToday: (state) => state.commentCountToday
    },
    actions: {
      'steemconnect/login': jest.fn(),
      fetchReportComments: jest.fn(() => Promise.resolve())
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

  return mount(ReportPage, {
    localVue,
    store,
    mocks: {
      $route: {
        params: {
          username: '@bob',
          permlink: 'sample-report'
        },
        path: '/@bob/sample-report'
      },
      $t: (key) => key,
      $cleanBody: (value) => value,
      $getTimeDifference: () => '1 hour ago',
      $fetchReportTags: jest.fn(() => ''),
      $reblog: jest.fn(),
      $notify: jest.fn(),
      $router: { push: jest.fn() }
    },
    data() {
      return {
        isLoading: false,
        report: buildReport(reportOverrides),
        errorDisplay: '',
        authorAccountInfo: null,
        authorAfitBalance: null,
        userRank: null,
        afitReward: 0,
        fullAFITReward: '',
        tokenRewards: [],
        commentsLoading: false,
        commentBoxOpen: false,
        replyBody: '',
        responsePosted: false,
        responseBody: '',
        moderatorSignature: '',
        loading: false,
        pageTitle: 'Actifit Report',
        showTranslated: false,
        safety_post_content: '',
        translationLoading: false,
        translatedText: '',
        reload: 0,
        resizeObserver: null,
        displayMorePayoutData: false,
        cur_bchain: 'HIVE',
        socialSharingDesc: 'desc',
        socialSharingQuote: 'quote',
        hashtags: 'actifit',
        heightSyncObserver: null,
        deleting: false
      }
    },
    stubs: {
      NavbarBrand: SimpleStub,
      ChainSelection: SimpleStub,
      Footer: SimpleStub,
      VoteModal: SimpleStub,
      NotifyModal: SimpleStub,
      UserHoverCard: SimpleStub,
      CustomTextEditor: SimpleStub,
      Comments: true,
      SocialSharing: SocialSharingStub,
      'social-sharing': SocialSharingStub,
      network: NetworkStub,
      SafeRemarkable: SimpleStub,
      UserSidebar: SimpleStub,
      EditPostModal: SimpleStub,
      'client-only': SimpleStub,
      notifications: SimpleStub,
      CardActions: false
    }
  })
}

describe('permlink page vote wiring and legacy-strip selector', () => {
  beforeEach(() => {
    jest.spyOn(ReportPage.methods, 'fetchPageData').mockImplementation(jest.fn())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('keeps the footer vote button on the shared vote modal target', () => {
    const wrapper = mountReportPage()
    const cardActions = wrapper.findComponent(CardActions)

    expect(cardActions.exists()).toBe(true)
    expect(cardActions.props('voteModalTarget')).toBe('#voteModal')
    expect(cardActions.props('modalTarget')).toBe(null)

    wrapper.destroy()
  })

  it('toggles the reply editor through the page method', async () => {
    const wrapper = mountReportPage()
    const replyButton = wrapper.findComponent(CardActions).find('.post-detail-action')

    expect(wrapper.vm.commentBoxOpen).toBe(false)
    await replyButton.trigger('click')
    expect(wrapper.vm.commentBoxOpen).toBe(true)

    wrapper.destroy()
  })

  it('renders the action strip in the post header (not the removed legacy strip)', () => {
    const source = fs.readFileSync('pages/_username/_permlink/index.vue', 'utf8')

    // The old hidden legacy strip was replaced by a CardActions in the header (top + bottom).
    expect(source).toContain('header-post-actions')
    expect(source).not.toContain('legacy-post-actions')
  })
})
