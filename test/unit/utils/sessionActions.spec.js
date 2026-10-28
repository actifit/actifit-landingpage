// Funds passwords retired after the 2026-10-21 incident (every one is presumed known to
// the attacker). What still works - cancelling a pending AFIT -> H-E move and re-issuing
// an ebook download - is authorised by the login session instead (utils/sessionActions.js).
import fs from 'fs'
import path from 'path'
import {
  AFIT_TIPS_AVAILABLE, AFIT_MOVE_TO_HE_AVAILABLE, BUY_AFIT_AVAILABLE, MOD_ACTIONS_AVAILABLE,
  cancelAfitMoveRequest, requestCancelAfitMove, reissueDownloadTokenUrl, requestReissueDownloadToken,
  reissueErrorText, ebookDownloadHref
} from '~/utils/sessionActions'
import { exchangeErrorText } from '~/utils/afitExchange'

const t = (k) => k
const gate = (o) => (o && ['KEY_ROTATION_REQUIRED', 'TRY_AGAIN'].includes(o.code) ? o.message : null)

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
  it('requestCancelAfitMove sends the session and keeps the HTTP status', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ status: 'Success' }) })
    const r = await requestCancelAfitMove({ apiUrl: 'https://api.test/', user: 'alice', sessionToken: 'jwt' })
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.test/cancelAFITMoveSE/')
    expect(opts.method).toBe('POST')
    expect(opts.headers['x-acti-token']).toBe('Bearer jwt')
    expect(JSON.parse(opts.body)).toEqual({ user: 'alice' })
    expect(r).toEqual({ status: 200, outcome: { status: 'Success' } })
  })
  it('a plain-text 429 (express-rate-limit) reads as too many attempts, not a generic error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 429, json: async () => { throw new Error('Too many requests') } })
    const { status, outcome } = await requestCancelAfitMove({ apiUrl: 'x/', user: 'a', sessionToken: 'j' })
    expect({ status, outcome }).toEqual({ status: 429, outcome: {} })
    expect(exchangeErrorText(status, outcome, t, gate)).toBe('too_many_attempts')
  })
  it.each([
    ['an expired session (checkHdrs 200 + success:false)', 200, { success: false, message: 'Token is not valid' }, 'session_expired_login_again'],
    ['a revoked session', 200, { error: 'Authentication failed. Key not found' }, 'session_expired_login_again'],
    ['another account', 200, { error: 'User mismatch' }, 'User mismatch']
  ])('cancel error: %s', (_, status, outcome, shown) => {
    expect(exchangeErrorText(status, outcome, t, gate)).toBe(shown)
  })
  it('wallet.vue uses the status-keeping helper, retries once after a keychain refresh, and shows exchangeErrorText', () => {
    const src = fs.readFileSync(path.join(ROOT, 'pages/_username/wallet.vue'), 'utf8')
    expect(src).toMatch(/requestCancelAfitMove\(\{/)
    expect(src).toMatch(/this\.isAuthFailure\(outcome\) && await this\.ensureKeychainToken\(\)/)
    expect(src).toMatch(/afit_se_move_err_msg = exchangeErrorText\(status, outcome/)
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

  it.each([
    ['no purchase record', 200, { error: 'Access token record not found' }, 'no_purchase_record_for_product'],
    ['raw server reasons become the generic error', 200, { error: 'User mismatch' }, 'error_performing_operation'],
    ['generic error', 200, { error: 'generic error' }, 'error_performing_operation'],
    ['database failure', 500, { error: 'Database update failed' }, 'error_performing_operation'],
    ['an expired session', 200, { success: false, message: 'Token is not valid' }, 'session_expired_login_again'],
    ['a revoked session', 200, { error: 'Authentication failed. Key not found' }, 'session_expired_login_again'],
    ['the key-rotation gate', 403, { code: 'KEY_ROTATION_REQUIRED', error: 'x', message: 'Rotate your posting key first' }, 'Rotate your posting key first'],
    ['the rate limit (plain-text 429)', 429, {}, 'too_many_attempts'],
    ['an old server without the route (non-JSON 404)', 404, {}, 'error_performing_operation']
  ])('re-download error: %s', (_, status, outcome, shown) => {
    expect(reissueErrorText(status, outcome, t, gate)).toBe(shown)
  })

  it('Product.vue re-downloads through it (no password field)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'components/Product.vue'), 'utf8')
    expect(src).toMatch(/requestReissueDownloadToken\(\{/)
    expect(src).toMatch(/sessionToken: localStorage\.getItem\('access_token'\)/)
    expect(src).toMatch(/errorDownloadAgain = reissueErrorText\(status, outcome/)
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
  it('mods-access hides the /modAction forms and never sends one while disabled', () => {
    const src = fs.readFileSync(path.join(ROOT, 'pages/mods-access.vue'), 'utf8')
    const start = src.indexOf('<template v-if="modActionsAvailable">')
    expect(start).toBeGreaterThan(0)
    const block = src.slice(start, src.indexOf('</template>', start))
    for (const action of ['verifynewbie', 'freesignup', "'ban'", "'unban'", "'reward'"]) expect(block).toContain(action)
    expect(src).toMatch(/async processAction \(targetAction\)\{\s*\/\/[^\n]*\n\s*if \(!this\.modActionsAvailable\) return;/)
  })
})

describe('no funds-password functionality is left on the site', () => {
  // all site source (lang/ is checked separately below); comments may still explain the
  // retirement, so they are stripped first
  const DIRS = ['pages', 'components', 'plugins', 'utils', 'store', 'layouts', 'middleware', 'mixins', 'static']
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.(vue|js)$/.test(e.name) ? [p] : []
  })
  const FILES = DIRS.filter((d) => fs.existsSync(path.join(ROOT, d))).flatMap((d) => walk(path.join(ROOT, d)))
  const stripComments = (src) => src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:\\'"])\/\/.*$/gm, '$1')
  // old ?action=set_funds_pass links still land on the AFIT exchange (wallet.vue)
  const ALLOWED = /action === 'set_funds_pass'/g
  const BANNED = /fundsPass|funds-pass|funds_pass|setUserFundsPass|resetFundsPass|confirmPaymentPasswordVerify|userHasFundsPassSet|validatePassForDownload|set-funds-pass-link|Funds_Password|FundsPass/

  it('scans the whole site (guards against a broken walker)', () => {
    expect(FILES.length).toBeGreaterThan(100)
    expect(FILES.some((f) => f.endsWith('wallet.vue'))).toBe(true)
  })
  it('no site source file mentions the funds password outside comments', () => {
    const hits = FILES.flatMap((f) => {
      const m = stripComments(fs.readFileSync(f, 'utf8')).replace(ALLOWED, '').match(BANNED)
      return m ? [path.relative(ROOT, f) + ': ' + m[0]] : []
    })
    expect(hits).toEqual([])
  })
  it('the comment stripper does not hide code (sanity)', () => {
    expect(stripComments("x = 'https://a/b'; y = fundsPass // c")).toMatch(BANNED)
    expect(stripComments('// fundsPass\n/* fundsPass */ <!-- fundsPass -->')).not.toMatch(BANNED)
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
    for (const k of ['afit_tips_unavailable', 'afit_move_he_unavailable', 'buy_afit_unavailable', 'mod_actions_unavailable', 'no_purchase_record_for_product']) {
      expect(typeof m[k]).toBe('string')
    }
    // the exchange still uses these two
    expect(typeof m.wallet.step3_desc1).toBe('string')
    expect(typeof m.wallet.step3_desc2).toBe('string')
  })
})
