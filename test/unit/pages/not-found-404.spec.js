// Unknown URLs answer a real 404 on the server render, but only on a definite
// "does not exist". A lookup that fails for network reasons renders the page as before.
jest.mock('dsteem', () => ({ Client: jest.fn() }))
jest.mock('@hiveio/dhive', () => ({ Client: jest.fn() }))
jest.mock('~/utils/hiveAccount', () => ({ hiveAccountExists: jest.fn() }))

import ProfilePage from '~/pages/_username/index.vue'
import PostPage from '~/pages/_username/_permlink/index.vue'
import DetailPage from '~/pages/arena/_id.vue'
import ErrorLayout from '~/layouts/error.vue'
import hive from '@hiveio/hive-js'
import { hiveAccountExists } from '~/utils/hiveAccount'

const withServer = async (fn) => {
  const prev = process.server
  process.server = true
  try { return await fn() } finally { process.server = prev }
}

describe('profile page (/:username)', () => {
  const validate = ProfilePage.validate

  it('404s when Hive says the account does not exist', async () => {
    hiveAccountExists.mockResolvedValueOnce(false)
    expect(await withServer(() => validate({ params: { username: 'zzqqxx-not-a-user' } }))).toBe(false)
    expect(hiveAccountExists).toHaveBeenLastCalledWith('zzqqxx-not-a-user', expect.anything())
  })
  it('renders a real account, with or without the @', async () => {
    hiveAccountExists.mockResolvedValueOnce(true)
    expect(await withServer(() => validate({ params: { username: '@actifit' } }))).toBe(true)
    expect(hiveAccountExists).toHaveBeenLastCalledWith('actifit', expect.anything())
  })
  it('renders the page when the lookup could not tell (node down or slow)', async () => {
    hiveAccountExists.mockResolvedValueOnce(null)
    expect(await withServer(() => validate({ params: { username: 'actifit' } }))).toBe(true)
  })
  it('does not look anything up on client-side navigation', async () => {
    hiveAccountExists.mockClear()
    expect(await validate({ params: { username: 'zzqqxx-not-a-user' } })).toBe(true)
    expect(hiveAccountExists).not.toHaveBeenCalled()
  })
})

describe('post page (/:username/:permlink)', () => {
  let getContent
  beforeEach(() => {
    jest.spyOn(hive.api, 'setOptions').mockImplementation(() => {})
    getContent = jest.spyOn(hive.api, 'getContentAsync')
  })
  afterEach(() => jest.restoreAllMocks())
  const run = () => {
    const error = jest.fn()
    return withServer(() => PostPage.asyncData({ params: { username: 'some', permlink: 'random' }, app: {}, error }))
      .then(result => ({ result, error }))
  }

  it('404s when the node says the post does not exist', async () => {
    // hive-js hands hivemind's -32602 "Post a/b does not exist" back as a JSON string
    getContent.mockResolvedValue('{"id":0, "result":[], "jsonrpc":"2.0"}')
    const { error } = await run()
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }))
  })
  it('renders the page when the lookup fails', async () => {
    getContent.mockRejectedValue(new Error('HTTP 429'))
    const { result, error } = await run()
    expect(error).not.toHaveBeenCalled()
    expect(result).toEqual({ desc: '', postImg: '' })
  })
})

describe('arena challenge page (/arena/:id)', () => {
  const store = (rejection) => ({ commit: jest.fn(), dispatch: jest.fn((a) => a === 'fetchArenaChallenge' ? Promise.reject(rejection) : Promise.resolve()) })

  it('404s when the API answers 404', async () => {
    const error = jest.fn()
    await DetailPage.asyncData({ store: store(Object.assign(new Error('HTTP Error: 404'), { status: 404 })), params: { id: 'nope' }, error })
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }))
  })
  it('keeps the in-page message when the API is unreachable', async () => {
    const error = jest.fn()
    const result = await DetailPage.asyncData({ store: store(new TypeError('Failed to fetch')), params: { id: 'x' }, error })
    expect(error).not.toHaveBeenCalled()
    expect(result).toEqual({ notFound: true })
  })
})

describe('error layout', () => {
  it('says "page not found" for a 404 and something generic otherwise', () => {
    expect(ErrorLayout.computed.notFound.call({ error: { statusCode: 404 } })).toBe(true)
    expect(ErrorLayout.computed.notFound.call({ error: { statusCode: 500 } })).toBe(false)
  })
})
