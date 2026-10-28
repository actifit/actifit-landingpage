// Funds passwords retired after the 2026-10-21 incident (every one is presumed known to
// the attacker). What still works - cancelling a pending AFIT -> H-E move and re-issuing
// an ebook download - is authorised by the login session instead (utils/sessionActions.js).
import fs from 'fs'
import path from 'path'
import {
  AFIT_TIPS_AVAILABLE, AFIT_MOVE_TO_HE_AVAILABLE, BUY_AFIT_AVAILABLE, MOD_ACTIONS_AVAILABLE,
  cancelAfitMoveRequest, reissueDownloadTokenUrl, requestReissueDownloadToken, ebookDownloadHref
} from '~/utils/sessionActions'

const ROOT = path.join(__dirname, '../../..')
afterEach(() => { delete global.fetch })

describe('cancelAfitMoveRequest', () => {
  it('posts to /cancelAFITMoveSE with only the (session-matched) user - no funds password', () => {
    const r = cancelAfitMoveRequest('https://api.test/', 'alice')
    expect(r.url).toBe('https://api.test/cancelAFITMoveSE/')
    expect(JSON.parse(r.body)).toEqual({ user: 'alice' })
  })
  it('sends an empty body when no user is known (the server takes the session user)', () => {
    expect(JSON.parse(cancelAfitMoveRequest('x/').body)).toEqual({})
  })
  it('wallet.vue sends it through the authed POST helper with keychain retry', () => {
    const src = fs.readFileSync(path.join(ROOT, 'pages/_username/wallet.vue'), 'utf8')
    expect(src).toMatch(/cancelAfitMoveRequest\(process\.env\.actiAppUrl, this\.user\.account\.name\)/)
    expect(src).toMatch(/this\.withAuthRetry\(\(\) => this\.postAuthed\(cancelReq\.url, cancelReq\.body\)\)/)
  })
})

describe('requestReissueDownloadToken', () => {
  it('GETs /reissueDownloadToken for the product with the login session, and no user/pass in the URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ success: 'success', access_token: 'tok' }) })
    const r = await requestReissueDownloadToken({ apiUrl: 'https://api.test/', productId: 'p 1', sessionToken: 'jwt' })

    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.test/reissueDownloadToken?product_id=p%201')
    expect(url).not.toMatch(/pass=|user=/)
    expect(opts.method).toBeUndefined() // GET
    expect(opts.headers['x-acti-token']).toBe('Bearer jwt')
    expect(r).toEqual({ status: 200, outcome: { success: 'success', access_token: 'tok' } })
  })

  it('a non-JSON reply (old server: 404 page) comes back as an empty outcome, not a throw', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 404, json: async () => { throw new Error('html') } })
    await expect(requestReissueDownloadToken({ apiUrl: 'x/', productId: '1', sessionToken: 'j' }))
      .resolves.toEqual({ status: 404, outcome: {} })
  })

  it('builds the download link from the issued token', () => {
    expect(reissueDownloadTokenUrl('a/', 'abc')).toBe('a/reissueDownloadToken?product_id=abc')
    expect(ebookDownloadHref('https://api.test/', 'alice', 'abc', 't&1'))
      .toBe('https://api.test/downEbook/?user=alice&product_id=abc&access_token=t%261')
  })

  it('Product.vue re-downloads through it (no password field)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'components/Product.vue'), 'utf8')
    expect(src).toMatch(/requestReissueDownloadToken\(\{/)
    expect(src).toMatch(/sessionToken: localStorage\.getItem\('access_token'\)/)
  })
})

describe('server-disabled actions show a note instead of their form', () => {
  it('flags are off until the backend re-enables them', () => {
    expect([AFIT_TIPS_AVAILABLE, AFIT_MOVE_TO_HE_AVAILABLE, BUY_AFIT_AVAILABLE, MOD_ACTIONS_AVAILABLE])
      .toEqual([false, false, false, false])
  })
  it.each([
    ['pages/_username/wallet.vue', ['afit_tips_unavailable', 'afit_move_he_unavailable', 'buy_afit_unavailable']],
    ['pages/_username/index.vue', ['afit_tips_unavailable']],
    ['pages/mods-access.vue', ['mod_actions_unavailable']]
  ])('%s', (file, keys) => {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8')
    for (const k of keys) expect(src).toContain(`$t('${k}')`)
  })
})

describe('no funds-password functionality is left on the site', () => {
  const FILES = ['pages/_username/wallet.vue', 'pages/_username/index.vue', 'components/Product.vue', 'pages/mods-access.vue']
  const BANNED = ['fundsPass', 'funds-pass', 'setUserFundsPass', 'resetFundsPass', 'confirmPaymentPasswordVerify',
    'userHasFundsPassSet', 'validatePassForDownload', 'set-funds-pass-link', 'Funds_Password', 'FundsPass']
  it.each(FILES)('%s', (file) => {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8')
    for (const word of BANNED) expect({ word, found: src.includes(word) }).toEqual({ word, found: false })
  })

  const LOCALES = fs.readdirSync(path.join(ROOT, 'lang')).filter((f) => f.endsWith('.js'))
  it.each(LOCALES)('lang/%s has no funds-password FAQ or prompts', (file) => {
    const mod = require(path.join(ROOT, 'lang', file))
    const m = mod.default || mod
    for (const k of ['q22', 'a22', 'q24', 'a24']) expect(m.faq[k]).toBeUndefined()
    expect(m.faq.a23).not.toMatch(/set_funds_pass/)
    for (const k of ['Funds_Password', 'error_missing_funds_pass', 'create_funds_pass', 'create_pass_short', 'No_funds_pass_wallet', 'Provide_funds_pass']) {
      expect(m[k]).toBeUndefined()
    }
    for (const k of ['afit_tips_unavailable', 'afit_move_he_unavailable', 'buy_afit_unavailable', 'mod_actions_unavailable']) {
      expect(typeof m[k]).toBe('string')
    }
    // the exchange still uses these two
    expect(typeof m.wallet.step3_desc1).toBe('string')
    expect(typeof m.wallet.step3_desc2).toBe('string')
  })
})
