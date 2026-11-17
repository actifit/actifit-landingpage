// /@user/blog with Blurt selected, for an account with no Blurt account (most Hive accounts
// made since 2020): the node answers "Account not found", the load threw before the spinner
// was cleared, and the page showed an endless loader. Now it says the account is not on
// that chain and offers Hive; any other failure offers a retry.
import fs from 'fs'
import path from 'path'
import { compile } from 'vue-template-compiler'
import { isMissingAccountError, blogPostsList } from '~/utils/chainErrors'

const mockBlog = { hive: jest.fn(), blurt: jest.fn() }
jest.mock('@hiveio/hive-js', () => ({
  config: { set: jest.fn() },
  api: { setOptions: jest.fn(), getDiscussionsByBlog: (...a) => mockBlog.hive(...a) },
}))
jest.mock('steem', () => ({ api: { setOptions: jest.fn() } }))
jest.mock('@blurtfoundation/blurtjs', () => ({
  api: { setOptions: jest.fn(), getDiscussionsByBlog: (...a) => mockBlog.blurt(...a) },
}))
import actions from '@/store/actions'

const src = fs.readFileSync(path.join(__dirname, '../../../../pages/_username/blog/index.vue'), 'utf8')
const template = src.slice(src.indexOf('<template>') + '<template>'.length, src.lastIndexOf('</template>'))

const method = (signature, params = [], end = '\n    },') => {
  const start = src.indexOf(`    ${signature} {`)
  expect(start).toBeGreaterThan(-1)
  const body = src.slice(src.indexOf('{', start) + 1, src.indexOf(end, start))
  // eslint-disable-next-line no-new-func
  return new Function('isMissingAccountError', ...params, `return (async () => {${body}})()`)
}
const loadPostsFn = method('async loadPosts()')
const showLoadErrorFn = method('showLoadError(err, chain)', ['err', 'chain'])
const fetchFn = method('async fetchPostsRecursively()')
const switchFn = method('async switchToHive()')
const loadMoreFn = method('async loadMore()')
// the last watcher: it ends the watch block
const watcherFn = method('bchain: async function (newBchain)', ['newBchain'], '\n    }\n  },')

// what blurtjs hands the callback for a missing account (checked against rpc.blurt.blog)
const blurtError = Object.assign(new Error('Account not found'), { name: 'RPCError', code: -32602 })

const page = (fetchResult, extra = {}) => {
  const v = {
    loading: true, loadingMore: false, noAccountOnChain: '', loadFailed: false,
    bchain: 'BLURT', userPosts: [], moreUserPostsAvailable: false,
    $store: { commit: jest.fn(), dispatch: jest.fn() },
    ...extra,
  }
  v.fetchPostsRecursively = jest.fn(async () => { if (fetchResult instanceof Error) throw fetchResult })
  v.showLoadError = (err, chain) => showLoadErrorFn.call(v, isMissingAccountError, err, chain)
  v.loadPosts = jest.fn(() => loadPostsFn.call(v, isMissingAccountError))
  return v
}

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => jest.restoreAllMocks())

describe('missing-account errors', () => {
  it('recognises what the nodes answer', () => {
    expect(isMissingAccountError(blurtError)).toBe(true)
    expect(isMissingAccountError({ message: 'Account not found' })).toBe(true)
    // Hive's own message, should a client pass it on
    expect(isMissingAccountError({ message: 'Assert Exception:Account zzqq does not exist' })).toBe(true)
  })

  it.each([
    new Error('network timeout'), new Error('Bad Gateway'), new Error('HTTP 404: Not Found'),
    new Error('account_history_api not enabled'), new Error('Could not find method get_account_x'), null,
  ])('%p is not a missing account', (err) => {
    expect(isMissingAccountError(err)).toBe(false)
  })
})

describe('blog posts from the store', () => {
  it('hive-js answers a missing account with a JSON string: an empty list, not one post per character', () => {
    expect(blogPostsList('{"id":0, "result":[], "jsonrpc":"2.0"}')).toEqual([])
    expect(blogPostsList('not json')).toEqual([])
    expect(blogPostsList(undefined)).toEqual([])
    const posts = [{ author: 'a', permlink: 'p' }]
    expect(blogPostsList(posts)).toBe(posts)
  })

  const store = (bchain) => {
    const state = { bchain, userPosts: [] }
    const commit = jest.fn((type, value) => { if (type === 'setUserPosts') state.userPosts = value })
    const dispatch = jest.fn(() => Promise.resolve())
    return { state, commit, dispatch }
  }

  it('fetchUserPosts on Hive for a missing account: no posts, no crash', async () => {
    mockBlog.hive.mockImplementation((q, cb) => cb(null, '{"id":0, "result":[], "jsonrpc":"2.0"}'))
    const s = store('HIVE')
    await actions.fetchUserPosts(s, 'zzqq')
    expect(s.state.userPosts).toEqual([])
  })

  it('fetchUserPosts drops an answer that arrives after the chain changed', async () => {
    let answer
    mockBlog.blurt.mockImplementation((q, cb) => { answer = () => cb(null, [{ author: 'old', permlink: 'p' }]) })
    const s = store('BLURT')
    const done = actions.fetchUserPosts(s, 'alice')
    s.state.bchain = 'HIVE'
    answer()
    await done
    expect(s.commit).not.toHaveBeenCalledWith('setUserPosts', expect.anything())
  })

  it('a failed "more posts" check hides the button instead of an unhandled rejection', async () => {
    mockBlog.blurt.mockImplementation((q, cb) => cb(null, [{ author: 'a', permlink: 'p' }]))
    const s = store('BLURT')
    s.dispatch = jest.fn(() => Promise.reject(new Error('down')))
    await actions.fetchUserPosts(s, 'alice')
    await new Promise((r) => setTimeout(r, 0))
    expect(s.commit).toHaveBeenCalledWith('setMoreUserPostsAvailable', false)
  })

  it('checkIfMoreUserPostsAvailable: a missing account on Hive is "no more", and a stale answer is dropped', async () => {
    mockBlog.hive.mockImplementation((q, cb) => cb(null, '{"id":0, "result":[], "jsonrpc":"2.0"}'))
    const s = store('HIVE')
    await actions.checkIfMoreUserPostsAvailable(s, 'zzqq')
    expect(s.commit).toHaveBeenCalledWith('setMoreUserPostsAvailable', false)

    let answer
    mockBlog.blurt.mockImplementation((q, cb) => { answer = () => cb(null, [{}, {}]) })
    const t = store('BLURT')
    const done = actions.checkIfMoreUserPostsAvailable(t, 'alice')
    t.state.bchain = 'HIVE'
    answer()
    await done
    expect(t.commit).not.toHaveBeenCalled()
  })
})

describe('blog loading', () => {
  it('the template compiles and shows the notice or a retry in place of the posts', () => {
    expect(compile(template).errors).toEqual([])
    expect(template).toMatch(/v-if="loading">[\s\S]{0,600}v-else-if="noAccountOnChain">[\s\S]{0,600}switchToHive[\s\S]{0,300}v-else-if="loadFailed">[\s\S]{0,200}posts_load_failed[\s\S]{0,300}loadPosts/)
    // neither "no posts yet" nor "load more" shows on top of them
    expect(template).toContain('v-if="!filteredUserPosts.length && !loading && !noAccountOnChain && !loadFailed"')
    expect(template).toContain('v-if="moreUserPostsAvailable && !noAccountOnChain && !loadFailed"')
    // the URL user name is inserted literally ($ patterns are not expanded), the chain by name
    expect(template).toContain(".replace('_USER_', () => username).replace('_CHAIN_', () => chainLabel(noAccountOnChain))")
  })

  it('no account on Blurt: the spinner stops and the notice names Blurt', async () => {
    const v = page(blurtError)
    await v.loadPosts()
    expect(v.loading).toBe(false)
    expect(v.noAccountOnChain).toBe('BLURT')
    expect(v.loadFailed).toBe(false)
  })

  it('the same on Steem', async () => {
    const v = page(blurtError, { bchain: 'STEEM' })
    await v.loadPosts()
    expect(v.noAccountOnChain).toBe('STEEM')
  })

  it('a missing-account error on Hive shows no "not on this chain" notice', async () => {
    const v = page(blurtError, { bchain: 'HIVE' })
    await v.loadPosts()
    expect(v.loading).toBe(false)
    expect(v.noAccountOnChain).toBe('')
    expect(v.loadFailed).toBe(false)
  })

  it('a node failure: the spinner stops and a retry is offered', async () => {
    const v = page(new Error('Bad Gateway'))
    await v.loadPosts()
    expect(v.loading).toBe(false)
    expect(v.loadFailed).toBe(true)
    expect(v.noAccountOnChain).toBe('')
  })

  it('a retry (or a switch) starts clean', async () => {
    const v = page(undefined, { loading: false, noAccountOnChain: 'BLURT', loadFailed: true })
    await v.loadPosts()
    expect(v.noAccountOnChain).toBe('')
    expect(v.loadFailed).toBe(false)
    expect(v.loading).toBe(false)
    expect(v.$store.commit).toHaveBeenCalledWith('setUserPosts', [])
    expect(v.fetchPostsRecursively).toHaveBeenCalled()
  })

  it('a switch during a load (ignored by the watcher) is loaded once that load ends', async () => {
    // Hive -> Blurt -> quickly Hive: the Blurt load fails after Hive is selected again
    const v = page(undefined)
    v.fetchPostsRecursively = jest.fn(async () => {
      if (v.fetchPostsRecursively.mock.calls.length === 1) { v.bchain = 'HIVE'; throw blurtError }
    })
    await v.loadPosts()
    expect(v.loadPosts).toHaveBeenCalledTimes(2)
    expect(v.cur_bchain).toBe('HIVE')
    // not "no account on Blurt", not "no posts yet" from Blurt's failure: Hive's posts
    expect(v.noAccountOnChain).toBe('')
    expect(v.loadFailed).toBe(false)
    expect(v.loading).toBe(false)
  })

  it('the notice names the chain the failed load was for, not the one selected since', () => {
    const v = page(undefined, { bchain: 'HIVE' })
    v.showLoadError(blurtError, 'BLURT')
    expect(v.noAccountOnChain).toBe('BLURT')
  })

  it('mounted goes through loadPosts', () => {
    expect(src).toMatch(/\/\/ Initial fetch\s*await this\.loadPosts\(\);/)
  })

  it('the chain watcher still loads when refreshing the user fails', async () => {
    const v = page(undefined, { loading: false, cur_bchain: 'HIVE' })
    v.$store.dispatch = jest.fn(async () => { throw new Error('refresh failed') })
    await watcherFn.call(v, isMissingAccountError, 'BLURT')
    expect(v.loadPosts).toHaveBeenCalled()
    expect(v.loading).toBe(false)
  })

  it('a failed fetch never leaves "load more" spinning', async () => {
    const v = page(undefined, { userPosts: [], moreUserPostsAvailable: true })
    v.$store.dispatch = jest.fn(async () => { throw blurtError })
    v.ensureMinimumPosts = jest.fn()
    await expect(fetchFn.call(v, isMissingAccountError)).rejects.toThrow('Account not found')
    expect(v.loadingMore).toBe(false)
  })

  it('"load more" failing shows an error toast instead of an unhandled rejection', async () => {
    const v = page(new Error('down'))
    v.$notify = jest.fn()
    v.$t = (k) => k
    await loadMoreFn.call(v, isMissingAccountError)
    expect(v.$notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'error', text: 'posts_load_failed' }))
  })

  describe('"Switch to Hive"', () => {
    afterEach(() => localStorage.removeItem('cur_bchain'))

    it('saves Hive and lets the chain watcher reload', async () => {
      const v = page(undefined, { bchain: 'BLURT' })
      await switchFn.call(v, isMissingAccountError)
      expect(localStorage.getItem('cur_bchain')).toBe('HIVE')
      expect(v.$store.commit).toHaveBeenCalledWith('setBchain', 'HIVE')
      expect(v.loadPosts).not.toHaveBeenCalled()
    })

    it('when the store already says HIVE (the watcher will not fire), it reloads itself', async () => {
      const v = page(undefined, { bchain: 'HIVE' })
      await switchFn.call(v, isMissingAccountError)
      expect(v.loadPosts).toHaveBeenCalled()
    })
  })
})
