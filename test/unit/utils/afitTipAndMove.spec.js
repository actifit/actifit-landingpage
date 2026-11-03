// Sending AFIT to another user (/tipAccount) and starting / adjusting a daily AFIT -> H-E
// move (/initiateAFITMoveSE) are back after the post-incident maintenance. Both are
// authorised by the login session (no funds password). The checks and requests live in
// utils/sessionActions.js because jest cannot load wallet.vue; the pages are checked at
// source level, and index.vue's tip method runs against a mocked `this`.
import fs from 'fs'
import path from 'path'
import {
  normalizeHiveUsername, isValidHiveUsername, afitAmountError, validateAfitTip,
  requestAfitTip, requestAfitMoveToHe, sessionActionErrorText
} from '~/utils/sessionActions'

const t = (k) => k
const gate = (o) => (o && ['KEY_ROTATION_REQUIRED', 'TRY_AGAIN'].includes(o.code) ? o.message : null)
const ROOT = path.join(__dirname, '../../..')
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
const methodBody = (src, sig) => {
  const start = src.indexOf(sig)
  expect(start).toBeGreaterThan(0)
  const next = src.slice(start + sig.length).search(/\n {4}(async )?[A-Za-z_]+ ?\([^)]*\) ?\{/)
  return src.slice(start, next < 0 ? undefined : start + sig.length + next)
}

afterEach(() => { delete global.fetch })

describe('recipient username', () => {
  it('normalises what people type or paste', () => {
    expect(normalizeHiveUsername('  @Alice ')).toBe('alice')
    expect(normalizeHiveUsername(null)).toBe('')
  })
  it.each(['abc', 'alice', 'actifit-bot', 'a1b', 'abc.def', 'abcdefghijklmnop'])('accepts %s', (n) => {
    expect(isValidHiveUsername(n)).toBe(true)
  })
  it.each(['', 'ab', 'abcdefghijklmnopq', '1abc', 'abc-', '-abc', 'ab.cde', 'my.acc', 'al ice', 'alice!', 'a_b_c', '<img>', 'Alice'])(
    'rejects %p', (n) => {
      expect(isValidHiveUsername(n)).toBe(false)
    })
})

describe('afitAmountError', () => {
  it.each([
    ['', 'amount_positive_int'],
    ['abc', 'amount_positive_int'],
    ['0', 'amount_positive_int'],
    ['0.000', 'amount_positive_int'],
    ['-5', 'amount_positive_int'],
    ['1e3', 'amount_positive_int'],
    ['1.2345', 'amount_max_3_decimals'],
    ['0.0001', 'amount_max_3_decimals'],
    ['100.001', 'amount_above_balance'],
    ['5', null],
    [' 5.5 ', null],
    ['.5', null],
    ['100', null],
    ['99.999', null]
  ])('%p -> %p (balance 100)', (raw, key) => {
    expect(afitAmountError(raw, '100')).toBe(key)
  })
  it('an unknown balance counts as not enough', () => {
    expect(afitAmountError('1', null)).toBe('amount_above_balance')
    expect(afitAmountError('1', '')).toBe('amount_above_balance')
  })
  it('compares with the balance numerically, not as text', () => {
    expect(afitAmountError('9', '10.5')).toBeNull()
    expect(afitAmountError('0.3', 0.3)).toBeNull()
  })
})

describe('validateAfitTip', () => {
  const ok = { sender: 'alice', recipient: '@Bob', amount: '1.5', balance: 10 }
  it('returns the cleaned recipient and amount', () => {
    expect(validateAfitTip(ok)).toEqual({ recipient: 'bob', amount: '1.5' })
  })
  it.each([
    ['not logged in', { sender: '' }, 'Need_login_tip'],
    ['no recipient', { recipient: '' }, 'tip_invalid_recipient'],
    ['invalid recipient', { recipient: 'b' }, 'tip_invalid_recipient'],
    ['self', { recipient: ' @ALICE' }, 'Cannot_tip_self'],
    ['no amount', { amount: '' }, 'amount_positive_int'],
    ['too precise', { amount: '1.0001' }, 'amount_max_3_decimals'],
    ['over balance', { amount: '11' }, 'amount_above_balance']
  ])('%s', (_, over, key) => {
    expect(validateAfitTip({ ...ok, ...over })).toEqual({ error: key })
  })
})

describe('requests', () => {
  it('a tip posts the recipient and amount with the login session, no funds password', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ status: 'Success', tipAmount: 2 }) })
    const r = await requestAfitTip({ apiUrl: 'https://api.test/', targetUser: 'bob', amount: '2', sessionToken: 'jwt' })
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.test/tipAccount/')
    expect(opts.method).toBe('POST')
    expect(opts.headers['x-acti-token']).toBe('Bearer jwt')
    expect(JSON.parse(opts.body)).toEqual({ targetUser: 'bob', amount: '2' })
    expect(r).toEqual({ status: 200, outcome: { status: 'Success', tipAmount: 2 } })
  })
  it('a move posts only the amount with the login session', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ status: 'Success' }) })
    await requestAfitMoveToHe({ apiUrl: 'https://api.test/', amount: 50, sessionToken: 'jwt' })
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.test/initiateAFITMoveSE/')
    expect(opts.headers['x-acti-token']).toBe('Bearer jwt')
    expect(JSON.parse(opts.body)).toEqual({ amount: 50 })
  })
  it('a non-JSON reply keeps its status with an empty outcome', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 503, json: async () => { throw new Error('html') } })
    await expect(requestAfitTip({ apiUrl: 'x/', targetUser: 'bob', amount: '1', sessionToken: 'j' }))
      .resolves.toEqual({ status: 503, outcome: {} })
  })
  it('a network failure resolves (status 0) instead of throwing', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(requestAfitMoveToHe({ apiUrl: 'x/', amount: 1, sessionToken: 'j' }))
      .resolves.toEqual({ status: 0, outcome: {} })
  })
})

describe('sessionActionErrorText', () => {
  it.each([
    ['503 switched off for maintenance', 503, { error: 'This feature is temporarily disabled for security maintenance.' }, 'afit_tips_unavailable'],
    ['503 with a non-JSON body', 503, {}, 'afit_tips_unavailable'],
    ['the server reason', 400, { error: 'Not enough AFIT' }, 'Not enough AFIT'],
    ['an expired session', 200, { success: false, message: 'Token is not valid' }, 'session_expired_login_again'],
    ['a revoked session', 200, { error: 'Authentication failed. Key not found' }, 'session_expired_login_again'],
    ['the key-rotation gate', 403, { code: 'KEY_ROTATION_REQUIRED', message: 'Rotate your posting key first' }, 'Rotate your posting key first'],
    ['the rate limit', 429, {}, 'too_many_attempts'],
    ['a network failure', 0, {}, 'error_performing_operation']
  ])('%s', (_, status, outcome, shown) => {
    expect(sessionActionErrorText(status, outcome, t, gate, 'afit_tips_unavailable')).toBe(shown)
  })
})

describe('profile page tip (index.vue proceedTipActivity on a mocked this)', () => {
  // the page is too heavy for jest; pull the method out of the source and bind it
  const src = read('pages/_username/index.vue')
  const body = methodBody(src, '    async proceedTipActivity() {')
  // eslint-disable-next-line no-new-func
  const make = new Function('validateAfitTip', 'requestAfitTip', 'sessionActionErrorText', 'process', 'localStorage', 'console',
    'return {' + body.replace(/,\s*$/, '') + '}.proceedTipActivity')
  const deps = { process: { env: { actiAppUrl: 'https://api.test/' } }, localStorage: { getItem: () => 'jwt' } }
  const fn = make(validateAfitTip, requestAfitTip, sessionActionErrorText, deps.process, deps.localStorage, { error: () => {} })

  function ctx (over = {}) {
    return {
      user: { account: { name: 'alice' } },
      displayUser: 'bob',
      userTokens: 100,
      userTokenCount: 5,
      tipError: '',
      tipInProgress: false,
      proceedTip: true,
      $refs: { 'tip-amount': { value: '2' } },
      $t: (k) => k,
      $gateMessage: gate,
      $notify: jest.fn(),
      $store: { dispatch: jest.fn() },
      $processTrxFunc: jest.fn().mockResolvedValue({ success: true }),
      ...over
    }
  }

  it('sends, confirms, closes the form and records the tip for the right recipient', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ status: 'Success', tipAmount: 2, recipientTokenCount: 7 }) })
    const c = ctx()
    await fn.call(c)
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ targetUser: 'bob', amount: '2' })
    expect(c.$notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'success', text: 'tip_successfully_sent' }))
    expect(c.proceedTip).toBe(false)
    expect(c.userTokenCount).toBe(7)
    expect(JSON.parse(c.$processTrxFunc.mock.calls[0][1].json)).toEqual({ action: 'Tip', amount: 2, recipient: 'bob' })
    expect(c.tipError).toBe('')
    expect(c.tipInProgress).toBe(false)
  })

  it('a 503 shows the maintenance note, keeps the form, nothing recorded', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 503, json: async () => ({ error: 'This feature is temporarily disabled for security maintenance.' }) })
    const c = ctx()
    await fn.call(c)
    expect(c.tipError).toBe('afit_tips_unavailable')
    expect(c.proceedTip).toBe(true)
    expect(c.$notify).not.toHaveBeenCalled()
    expect(c.$processTrxFunc).not.toHaveBeenCalled()
    expect(c.tipInProgress).toBe(false)
  })

  it('the server reason is shown as given (rendered as text by the template)', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 400, json: async () => ({ error: '<b>Daily limit reached</b>' }) })
    const c = ctx()
    await fn.call(c)
    expect(c.tipError).toBe('<b>Daily limit reached</b>')
  })

  it('invalid input never reaches the server', async () => {
    global.fetch = jest.fn()
    for (const [over, key] of [
      [{ user: null }, 'Need_login_tip'],
      [{ displayUser: 'alice' }, 'Cannot_tip_self'],
      [{ $refs: { 'tip-amount': { value: '1.2345' } } }, 'amount_max_3_decimals'],
      [{ $refs: { 'tip-amount': { value: '101' } } }, 'amount_above_balance']
    ]) {
      const c = ctx(over)
      await fn.call(c)
      expect(c.tipError).toBe(key)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('a second click while sending does nothing', async () => {
    global.fetch = jest.fn()
    const c = ctx({ tipInProgress: true })
    await fn.call(c)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

describe('the pages use the shared checks and handling', () => {
  const wallet = read('pages/_username/wallet.vue')
  const index = read('pages/_username/index.vue')

  it('wallet send-AFIT: validated, one at a time, session retry, 503 note, right recipient on chain', () => {
    const body = methodBody(wallet, '    async proceedTipActivity() {')
    expect(body).toMatch(/if \(this\.tipInProgress\) return;/)
    expect(body).toMatch(/validateAfitTip\(\{/)
    expect(body).toMatch(/requestAfitTip\(\{/)
    expect(body).toMatch(/this\.isAuthFailure\(outcome\) && await this\.ensureKeychainToken\(\)/)
    expect(body).toMatch(/sessionActionErrorText\(status, outcome, [^\n]*'afit_tips_unavailable'\)/)
    expect(body).toMatch(/recipient: checked\.recipient/)
    expect(body).not.toMatch(/recipient: this\.displayUser/)
    expect(body).toMatch(/finally \{\s*this\.tipInProgress = false;/)
    expect(wallet).toMatch(/v-on:click="proceedTipActivity" :disabled="tipInProgress"/)
  })

  it('wallet move to H-E: one at a time, session retry, 503 note', () => {
    const body = methodBody(wallet, '    async proceedMoveToSE() {')
    expect(body).toMatch(/if \(this\.initiateInProgress\) return;/)
    expect(body).toMatch(/requestAfitMoveToHe\(\{/)
    expect(body).toMatch(/this\.isAuthFailure\(outcome\) && await this\.ensureKeychainToken\(\)/)
    expect(body).toMatch(/sessionActionErrorText\(status, outcome, [^\n]*'afit_move_he_unavailable'\)/)
    expect(wallet.match(/v-on:click="proceedMoveToSE" :disabled="initiateInProgress"/g)).toHaveLength(2)
  })

  it('errors are rendered as text, never v-html', () => {
    expect(wallet).toMatch(/<div v-if="tipError" [^>]*>\{\{ tipError \}\}<\/div>/)
    expect(index).toMatch(/<div v-if="tipError" [^>]*>\{\{ tipError \}\}<\/div>/)
    expect(wallet).not.toMatch(/v-html="(tipError|afit_se_move_err_msg)"/)
    expect(index).not.toMatch(/v-html="tipError"/)
  })
})

describe('translations', () => {
  const LOCALES = fs.readdirSync(path.join(ROOT, 'lang')).filter((f) => f.endsWith('.js'))
  const load = (f) => { const m = require(path.join(ROOT, 'lang', f)); return m.default || m }
  const en = load('en_US.js')
  it.each(LOCALES)('lang/%s has the new and reworded strings, translated', (file) => {
    const m = load(file)
    for (const k of ['tip_invalid_recipient', 'amount_max_3_decimals', 'afit_tips_unavailable', 'afit_move_he_unavailable']) {
      expect(typeof m[k]).toBe('string')
      expect(m[k].length).toBeGreaterThan(10)
      if (file !== 'en_US.js') expect(m[k]).not.toBe(en[k])
    }
    // the FAQ no longer says tips are unavailable, and still needs no funds password
    expect(m.faq.a23).toMatch(/10[,.\s]?000/)
  })
})
