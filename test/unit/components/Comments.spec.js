const fs = require('fs')
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Comments from '@/components/Comments.vue'
import CardActions from '@/components/CardActions.vue'

function mountComments(user = { account: { name: 'alice' } }) {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const store = new Vuex.Store({
    state: { moderators: [], bchain: 'HIVE' },
    getters: {
      moderators: (state) => state.moderators,
      bchain: (state) => state.bchain
    },
    actions: {
      fetchModerators: jest.fn()
    },
    mutations: {
      setPostToVote: jest.fn(),
      setBchain: jest.fn()
    },
    modules: {
      steemconnect: {
        namespaced: true,
        getters: {
          user: () => user,
          stdLogin: () => true
        }
      }
    }
  })

  return mount(Comments, {
    localVue,
    store,
    propsData: {
      author: 'bob',
      body: 'A comment',
      depth: 1,
      reply_entries: [],
      main_post_author: 'bob',
      main_post_permlink: 'post',
      main_post_cat: 'hive-123',
      translationCache: {},
      full_data: {
        author: 'bob',
        permlink: 'comment',
        body: 'A comment',
        created: '2026-08-01T12:34:00Z',
        active_votes: [],
        children: 2,
        pending_payout_value: '0.000 HBD',
        total_payout_value: '0.000 HBD',
        curator_payout_value: '0.000 HBD',
        beneficiaries: [],
        is_paidout: false,
        last_payout: '2026-08-01T00:00:00Z',
        cashout_time: '2026-08-15T00:00:00Z',
        json_metadata: '{}'
      }
    },
    mocks: {
      $t: (key) => key,
      $cleanBody: (value) => value,
      $getTimeDifference: () => '1 hour ago',
      $notify: jest.fn()
    },
    stubs: {
      CardActions: false,
      CustomTextEditor: true,
      SafeRemarkable: true,
      UserHoverCard: true
    }
  })
}

describe('Comments nested replies', () => {
  const component = fs.readFileSync('components/Comments.vue', 'utf8')

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({})
    }))
    localStorage.clear()
  })

  afterEach(() => {
    delete global.fetch
  })

  it('drives the real CardActions replies and reply-editor handlers', async () => {
    const wrapper = mountComments()
    const actions = wrapper.findComponent(CardActions)
    const repliesToggle = actions.find('button.post-detail-action')
    const replyAction = actions.findAll('.post-detail-action').at(0)

    expect(actions.exists()).toBe(true)
    expect(repliesToggle.attributes('aria-expanded')).toBe('true')

    await repliesToggle.trigger('click')
    expect(wrapper.vm.nestedRepliesOpen).toBe(false)
    expect(repliesToggle.attributes('aria-expanded')).toBe('false')

    await replyAction.trigger('click')
    expect(wrapper.vm.commentBoxOpen).toBe(true)

    wrapper.destroy()
  })

  it('keeps top-level comments visible and nests opened replies inside their parent card', () => {
    expect(component).toContain('nestedRepliesOpen: this.depth === 1')
    expect(component).toContain('<CardActions')
    expect(component).toContain('@open-modal="nestedRepliesOpen = !nestedRepliesOpen"')
    expect(component).toContain('v-if="nestedRepliesOpen" class="cmt-nested-replies"')
    expect(component).toContain('v-if="depth === 0"')
    expect(component).toContain(':comments-active="nestedRepliesOpen"')
    expect(component).toContain('border-left: 2px solid var(--cmt-thread-rail);')
  })

  it('preserves comment header actions', () => {
    expect(component).toContain(':href="buildLink"')
    expect(component).toContain('v-on:click="copyContent"')
    expect(component).toContain('v-on:click="translateContent"')
    expect(component).toContain('@click="commentMinimized = true"')
  })

  it('offers whole-card collapse controls only on main comments', () => {
    expect(component).toContain('v-if="depth === 1"')
    expect(component).toContain('@click="commentMinimized = true"')
    expect(component).toContain('@click="commentMinimized = false"')
    expect(component).not.toContain('cmt-replies-toggle__icon')
  })

  it('automatically minimizes comments from low-reputation authors', () => {
    expect(component).toContain("import hive from '@hiveio/hive-js'")
    expect(component).toContain('this.fetchAuthorReputation();')
    expect(component).toContain('if (this.authorReputation <= 10)')
    expect(component).toContain('this.hiddenDueToLowRep = true;')
    expect(component).toContain("$t('hidden_low_reputation', [author])")
  })

  it('uses a neutral payout color when pending HBD is zero', () => {
    expect(component).toContain("'cmt-payout__pending--zero': parseFloat(full_data.pending_payout_value) <= 0")
    expect(component).toContain('.cmt-payout__pending--zero')
    expect(component).toContain('color: var(--cmt-muted);')
  })

  it('provides dark-mode colors for cards, threads, content, and the editor', () => {
    expect(component).toContain('.dark-mode .cmt-thread {')
    expect(component).toContain('--cmt-surface: var(--background-color);')
    expect(component).toContain('--cmt-surface-subtle: var(--background-color-1);')
    expect(component).toContain('--cmt-text: var(--text-color);')
    expect(component).toContain('.dark-mode .cmt-body blockquote')
    expect(component).toContain('.dark-mode .cmt-editor .v-note-wrapper')
  })

  it('constrains images rendered inside comment bodies', () => {
    expect(component).toContain('.cmt-body img {')
    expect(component).toContain('max-width: 100%;')
    expect(component).toContain('height: auto;')
  })
})
