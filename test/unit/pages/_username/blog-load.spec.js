// /@user/blog with Blurt selected, for an account with no Blurt account (most Hive accounts
// made since 2020): the node answers "Account not found", the load threw before the spinner
// was cleared, and the page showed an endless loader. Now it says the account is not on
// that chain and offers Hive; any other failure offers a retry.
import fs from 'fs'
import path from 'path'
import { compile } from 'vue-template-compiler'
import { isMissingAccountError } from '~/utils/chainErrors'

const src = fs.readFileSync(path.join(__dirname, '../../../../pages/_username/blog/index.vue'), 'utf8')
const template = src.slice(src.indexOf('<template>') + '<template>'.length, src.lastIndexOf('</template>'))

const method = (signature, params = []) => {
  const start = src.indexOf(`    ${signature} {`)
  expect(start).toBeGreaterThan(-1)
  const body = src.slice(src.indexOf('{', start) + 1, src.indexOf('\n    },', start))
  // eslint-disable-next-line no-new-func
  return new Function('isMissingAccountError', ...params, `return (async () => {${body}})()`)
}
const loadPostsFn = method('async loadPosts()')
const showLoadErrorFn = method('showLoadError(err)', ['err'])
const fetchFn = method('async fetchPostsRecursively()')
const switchFn = method('async switchToHive()')

const blurtError = Object.assign(new Error('Account not found'), { code: -32602 })
const hiveError = Object.assign(new Error('Assert Exception'), {
  data: { extension: { assertion_expression: 'Account zzqq does not exist' } },
})

const page = (fetchResult, extra = {}) => {
  const v = {
    loading: true, loadingMore: false, noAccountOnChain: '', loadFailed: false,
    bchain: 'BLURT', userPosts: [], moreUserPostsAvailable: false,
    $store: { commit: jest.fn(), dispatch: jest.fn() },
    ...extra,
  }
  v.fetchPostsRecursively = jest.fn(async () => { if (fetchResult instanceof Error) throw fetchResult })
  v.showLoadError = (err) => showLoadErrorFn.call(v, isMissingAccountError, err)
  return v
}
const loadPosts = (v) => loadPostsFn.call(v, isMissingAccountError)

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => jest.restoreAllMocks())

describe('missing-account errors', () => {
  it('recognises what Blurt and Hive answer', () => {
    expect(isMissingAccountError(blurtError)).toBe(true)
    expect(isMissingAccountError(hiveError)).toBe(true)
    expect(isMissingAccountError({ message: 'Account not found' })).toBe(true)
  })

  it('anything else is not a missing account', () => {
    expect(isMissingAccountError(new Error('network timeout'))).toBe(false)
    expect(isMissingAccountError(new Error('Bad Gateway'))).toBe(false)
    expect(isMissingAccountError(null)).toBe(false)
  })
})

describe('blog loading', () => {
  it('the template compiles and shows the notice or a retry in place of the posts', () => {
    expect(compile(template).errors).toEqual([])
    expect(template).toMatch(/v-if="loading">[\s\S]{0,600}v-else-if="noAccountOnChain">[\s\S]{0,600}switchToHive[\s\S]{0,300}v-else-if="loadFailed">[\s\S]{0,200}posts_load_failed[\s\S]{0,300}loadPosts/)
    // "no posts yet" is not shown on top of them
    expect(template).toContain('v-if="!filteredUserPosts.length && !loading && !noAccountOnChain && !loadFailed"')
    // the URL user name is inserted literally ($ patterns are not expanded)
    expect(template).toContain(".replace('_USER_', () => username)")
  })

  it('no account on Blurt: the spinner stops and the notice names Blurt', async () => {
    const v = page(blurtError)
    await loadPosts(v)
    expect(v.loading).toBe(false)
    expect(v.noAccountOnChain).toBe('BLURT')
    expect(v.loadFailed).toBe(false)
  })

  it('a missing account on Hive falls back to the usual "no posts" line', async () => {
    const v = page(hiveError, { bchain: 'HIVE' })
    await loadPosts(v)
    expect(v.loading).toBe(false)
    expect(v.noAccountOnChain).toBe('')
    expect(v.loadFailed).toBe(false)
  })

  it('a node failure: the spinner stops and a retry is offered', async () => {
    const v = page(new Error('Bad Gateway'))
    await loadPosts(v)
    expect(v.loading).toBe(false)
    expect(v.loadFailed).toBe(true)
    expect(v.noAccountOnChain).toBe('')
  })

  it('a retry (or a switch) starts clean', async () => {
    const v = page(undefined, { loading: false, noAccountOnChain: 'BLURT', loadFailed: true })
    await loadPosts(v)
    expect(v.noAccountOnChain).toBe('')
    expect(v.loadFailed).toBe(false)
    expect(v.loading).toBe(false)
    expect(v.$store.commit).toHaveBeenCalledWith('setUserPosts', [])
    expect(v.fetchPostsRecursively).toHaveBeenCalled()
  })

  it('mounted and the chain watcher both go through loadPosts', () => {
    expect(src).toMatch(/\/\/ Initial fetch\s*await this\.loadPosts\(\);/)
    expect(src).toMatch(/bchain: async function \(newBchain\) \{[\s\S]{0,600}await this\.loadPosts\(\);/)
  })

  it('a failed fetch never leaves "load more" spinning', async () => {
    const v = page(undefined, { userPosts: [], moreUserPostsAvailable: true })
    v.$store.dispatch = jest.fn(async () => { throw blurtError })
    v.ensureMinimumPosts = jest.fn()
    await expect(fetchFn.call(v, isMissingAccountError)).rejects.toThrow('Account not found')
    expect(v.loadingMore).toBe(false)
  })

  describe('"Switch to Hive"', () => {
    afterEach(() => localStorage.removeItem('cur_bchain'))

    it('saves Hive and lets the chain watcher reload', async () => {
      const v = page(undefined, { bchain: 'BLURT' })
      v.loadPosts = jest.fn()
      await switchFn.call(v, isMissingAccountError)
      expect(localStorage.getItem('cur_bchain')).toBe('HIVE')
      expect(v.$store.commit).toHaveBeenCalledWith('setBchain', 'HIVE')
      expect(v.loadPosts).not.toHaveBeenCalled()
    })

    it('when the store already says HIVE (the watcher will not fire), it reloads itself', async () => {
      const v = page(undefined, { bchain: 'HIVE' })
      v.loadPosts = jest.fn()
      await switchFn.call(v, isMissingAccountError)
      expect(v.loadPosts).toHaveBeenCalled()
    })
  })
})
