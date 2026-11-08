/**
 * Signup with keys made in the browser (actifit-bot signup_with_keys.js).
 *
 * The old signup sent the new account's master password to the server (/confirmPayment),
 * which is how keys leaked in the 2026-10-21 incident. Now the page derives the keys itself
 * and sends only the four PUBLIC keys: /app/signupQuote returns the amount and a memo bound
 * to those exact details, and /app/signupWithKeys creates the account once the payment is in.
 */
import fs from 'fs'
import path from 'path'
import qs from 'qs'
import hive from '@hiveio/hive-js'
import SignupPage from '@/pages/signup.vue'

const methods = SignupPage.options ? SignupPage.options.methods : SignupPage.methods
const ROOT = path.join(__dirname, '../../..')
const PASSWORD = 'p4ssw0rdmadeinthebrowser'
const KEYS = hive.auth.getPrivateKeys('newbie', PASSWORD, ['owner', 'active', 'posting', 'memo'])
const field = (value) => ({ value })

// a page vm wired to the real methods, with fetch answering from `answers` in order
const makeVm = (over = {}) => {
  const vm = {
    signupAvailable: true,
    quoting: false,
    checkingFunds: false,
    processStarted: false,
    resultReturned: false,
    accountCreated: false,
    quote: null,
    referrer: '',
    email: '',
    promo_code_chkbx: false,
    promo_code_val: '',
    transferType: 'HIVE',
    username_exists: '',
    username_invalid: '',
    captcha_invalid: '',
    error_proceeding: false,
    error_msg: '',
    paymentWaitUntil: 0,
    pollTimer: null,
    _isDestroyed: false,
    reg: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    $t: (k) => k,
    $refs: {
      'account-username': field('newbie'),
      'account-password': field(PASSWORD),
      'account-password-confirm': field(PASSWORD),
    },
    passSignupCaptcha: jest.fn().mockResolvedValue(true),
    ...over,
  }
  for (const [name, fn] of Object.entries(methods)) {
    if (!(name in over) && name !== 'passSignupCaptcha') vm[name] = fn.bind(vm)
  }
  return vm
}
const reply = (body) => Promise.resolve({ json: () => Promise.resolve(body) })
const answers = (...bodies) => {
  const queue = bodies.slice()
  return jest.fn(() => reply(queue.length > 1 ? queue.shift() : queue[0]))
}
// how express (body-parser urlencoded, extended: true) reads what the page sends
const sentBody = (call) => qs.parse(call[1].body)
const QUOTED = { enabled: true, reason: 'quoted', memo: 'signup:0123456789abcdef01234567', amounts: { HIVE: '8.334' }, signup_account: 'actifit.signup', afit_reward: 100 }

describe('what leaves the page', () => {
  const realFetch = global.fetch
  afterEach(() => { global.fetch = realFetch })

  test('the four public keys, as an object the API parses, and nothing secret', async () => {
    global.fetch = answers(QUOTED)
    const vm = makeVm({ referrer: 'mcfarhat', email: 'me@example.com' })
    await expect(vm.getQuote()).resolves.toBe(true)
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe(process.env.actiAppUrl + 'app/signupQuote')
    expect(opts.method).toBe('POST')
    // a "simple" request: the browser sends it cross-site without a CORS preflight
    expect(opts.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    expect(sentBody(global.fetch.mock.calls[0])).toEqual({
      new_account: 'newbie',
      sent_cur: 'HIVE',
      referrer: 'mcfarhat',
      email: 'me@example.com',
      keys: { owner: KEYS.ownerPubkey, active: KEYS.activePubkey, posting: KEYS.postingPubkey, memo: KEYS.memoPubkey },
    })
    for (const k of Object.values(sentBody(global.fetch.mock.calls[0]).keys)) expect(k).toMatch(/^STM[1-9A-HJ-NP-Za-km-z]{50}$/)
  })

  test('the password and the private keys are never in any request', async () => {
    global.fetch = answers(QUOTED, { accountCreated: true, reason: 'created', paymentReceivedTx: 'abc' })
    const vm = makeVm()
    await vm.getQuote()
    await vm.checkFunds()
    expect(vm.accountCreated).toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(2)
    for (const [url, opts] of global.fetch.mock.calls) {
      for (const secret of [PASSWORD, KEYS.owner, KEYS.active, KEYS.posting, KEYS.memo]) {
        expect(url + opts.body).not.toContain(secret)
      }
      expect(opts.body).not.toMatch(/new_pass|password/)
    }
  })

  test('the account request repeats the quoted details plus the memo', async () => {
    global.fetch = answers(QUOTED, { accountCreated: true, reason: 'created' })
    const vm = makeVm()
    await vm.getQuote()
    await vm.checkFunds()
    const [url] = global.fetch.mock.calls[1]
    expect(url).toBe(process.env.actiAppUrl + 'app/signupWithKeys')
    expect(sentBody(global.fetch.mock.calls[1])).toEqual({ ...sentBody(global.fetch.mock.calls[0]), memo: QUOTED.memo })
  })

  test('a referral to yourself or an empty promo code is left out', () => {
    const vm = makeVm({ referrer: 'newbie', promo_code_chkbx: true, promo_code_val: '  ' })
    const f = vm.signupFields()
    expect(f).not.toHaveProperty('referrer')
    expect(f).not.toHaveProperty('promo_code')
  })
})

describe('the quote', () => {
  const realFetch = global.fetch
  afterEach(() => { global.fetch = realFetch })

  test('shows the server amount, account, memo and AFIT reward', async () => {
    global.fetch = answers(QUOTED)
    const vm = makeVm()
    await vm.getQuote()
    expect(vm.quote).toMatchObject({ memo: QUOTED.memo, amount: '8.334', currency: 'HIVE', account: 'actifit.signup', afit_reward: 100 })
  })

  test('a referral link to an account that does not exist: quoted again without it', async () => {
    global.fetch = answers({ reason: 'invalid_referrer' }, QUOTED)
    const vm = makeVm({ referrer: 'nobodyhere' })
    await expect(vm.getQuote()).resolves.toBe(true)
    expect(sentBody(global.fetch.mock.calls[1])).not.toHaveProperty('referrer')
    expect(vm.quote.fields).not.toHaveProperty('referrer')
  })

  test.each([
    [{ enabled: true, reason: 'username_taken' }, 'choose_proper_username'],
    [{ enabled: false, reason: 'signup_disabled' }, 'swk_paused'],
    [{ enabled: true, reason: 'promo_invalid' }, 'swk_promo_invalid'],
    [{ reason: 'rate_limited', retry_after: 3600 }, 'swk_rate_limited'],
    [{ enabled: true, reason: 'price_unavailable', retryable: true }, 'swk_try_again'],
    // a paid quote must carry an amount and an account, or nothing can be paid
    [{ enabled: true, reason: 'quoted', memo: 'signup:0123456789abcdef01234567' }, 'swk_try_again'],
  ])('%j: no payment details, and says why', async (body, msg) => {
    global.fetch = answers(body)
    const vm = makeVm()
    await expect(vm.getQuote()).resolves.toBe(false)
    expect(vm.quote).toBe(null)
    expect(vm.error_msg).toBe(msg)
    expect(vm.quoting).toBe(false)
  })

  test('API unreachable: an error, not a stuck button', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const vm = makeVm()
    await expect(vm.getQuote()).resolves.toBe(false)
    expect(vm.error_msg).toBe('swk_try_again')
    expect(vm.quoting).toBe(false)
  })

  test('local checks run first: a password that was not confirmed sends nothing', async () => {
    global.fetch = jest.fn()
    const vm = makeVm()
    vm.$refs['account-password-confirm'] = field('typo')
    await vm.getQuote()
    expect(global.fetch).not.toHaveBeenCalled()
    expect(vm.error_msg).toBe('copy_password_confirm')
  })

  test('editing the details drops the quote, but not while a payment is being checked', () => {
    const vm = makeVm({ quote: { memo: 'm' }, checkingFunds: true })
    vm.editDetails()
    expect(vm.quote).not.toBe(null)
    vm.checkingFunds = false
    vm.editDetails()
    expect(vm.quote).toBe(null)
  })
})

describe('waiting for the payment', () => {
  const realFetch = global.fetch
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => { jest.useRealTimers(); global.fetch = realFetch })
  const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve() }

  test('payment_pending checks again after retry_after, then creates the account', async () => {
    global.fetch = answers(
      { accountCreated: false, reason: 'payment_pending', retryable: true, retry_after: 10 },
      { accountCreated: true, reason: 'created', paymentReceivedTx: 'abc' })
    const vm = makeVm({ quote: { fields: { new_account: 'newbie' }, memo: QUOTED.memo, amount: '8.334' } })
    await vm.checkFunds()
    expect(vm.checkingFunds).toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(10000)
    await flush()
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(vm.accountCreated).toBe(true)
    expect(vm.checkingFunds).toBe(false)
    expect(vm.resultReturned).toBe(true)
  })

  test('after 20 minutes without a payment it stops and says to try again later', async () => {
    global.fetch = answers({ accountCreated: false, reason: 'payment_pending', retryable: true, retry_after: 10 })
    const vm = makeVm({ quote: { fields: {}, memo: QUOTED.memo, amount: '1' } })
    await vm.checkFunds()
    for (let i = 0; i < 130; i++) { jest.advanceTimersByTime(10000); await flush() }
    expect(vm.checkingFunds).toBe(false)
    expect(vm.error_msg).toBe('swk_not_seen_yet')
    // not a failure: no "contact support" box, and the quote stays for the next click
    expect(vm.resultReturned).toBe(false)
    expect(vm.quote).not.toBe(null)
    expect(global.fetch.mock.calls.length).toBeLessThanOrEqual(121)
  })

  test('a long retry_after (rate limit) is not polled', async () => {
    global.fetch = answers({ accountCreated: false, reason: 'rate_limited', retryable: true, retry_after: 3600 })
    const vm = makeVm({ quote: { fields: {}, memo: QUOTED.memo } })
    await vm.checkFunds()
    expect(vm.checkingFunds).toBe(false)
    expect(vm.error_msg).toBe('swk_rate_limited')
    expect(jest.getTimerCount()).toBe(0)
  })

  test('underpaid: stops and points to support', async () => {
    global.fetch = answers({ accountCreated: false, reason: 'payment_insufficient', retryable: false })
    const vm = makeVm({ quote: { fields: {}, memo: QUOTED.memo } })
    await vm.checkFunds()
    expect(vm.error_msg).toBe('swk_underpaid')
    expect(vm.resultReturned).toBe(true)
    expect(vm.accountCreated).toBe(false)
  })

  test('leaving the page stops the checks', async () => {
    global.fetch = answers({ accountCreated: false, reason: 'payment_pending', retryable: true, retry_after: 10 })
    const vm = makeVm({ quote: { fields: {}, memo: QUOTED.memo } })
    await vm.checkFunds()
    SignupPage.options ? SignupPage.options.beforeDestroy.call(vm) : SignupPage.beforeDestroy.call(vm)
    jest.advanceTimersByTime(60000)
    await flush()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('a double click sends one account request', async () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    const vm = makeVm({ quote: { fields: {}, memo: QUOTED.memo } })
    vm.checkFunds()
    vm.checkFunds()
    await flush()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('nothing is sent while the kill switch is off', async () => {
    global.fetch = jest.fn()
    const vm = makeVm({ signupAvailable: false, quote: { fields: {}, memo: QUOTED.memo } })
    await vm.checkFunds()
    await vm.getQuote()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

describe('promo code signup', () => {
  const realFetch = global.fetch
  afterEach(() => { global.fetch = realFetch })

  test('one click: quote, then create, with the code bound into both', async () => {
    global.fetch = answers({ enabled: true, reason: 'quoted', memo: 'signup:aaaaaaaaaaaaaaaaaaaaaaaa' }, { accountCreated: true, reason: 'created' })
    const vm = makeVm({ promo_code_chkbx: true, promo_code_val: ' FREE-1 ' })
    await vm.checkFunds()
    expect(sentBody(global.fetch.mock.calls[0]).promo_code).toBe('FREE-1')
    expect(sentBody(global.fetch.mock.calls[1])).toMatchObject({ promo_code: 'FREE-1', memo: 'signup:aaaaaaaaaaaaaaaaaaaaaaaa' })
    expect(vm.accountCreated).toBe(true)
  })

  test('a wrong code: says so and lets the user change it', async () => {
    global.fetch = answers({ enabled: true, reason: 'quoted', memo: 'signup:aaaaaaaaaaaaaaaaaaaaaaaa' }, { accountCreated: false, reason: 'promo_invalid', retryable: false })
    const vm = makeVm({ promo_code_chkbx: true, promo_code_val: 'WRONG' })
    await vm.checkFunds()
    expect(vm.error_msg).toBe('swk_promo_invalid')
    expect(vm.quote).toBe(null)
    expect(vm.resultReturned).toBe(false)
  })
})

describe('the master password', () => {
  test('comes from the secure generator, about 50 characters of a-z 0-9', () => {
    //this jsdom has no window.crypto; every browser the site supports does
    if (!window.crypto) Object.defineProperty(window, 'crypto', { value: require('crypto').webcrypto, configurable: true })
    const spy = jest.spyOn(window.crypto, 'getRandomValues')
    const pw = methods.generatePassword(4)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
    expect(pw).toMatch(/^[a-z0-9]{40,52}$/)
    expect(methods.generatePassword(4)).not.toBe(pw)
  })
})

describe('page source', () => {
  const src = fs.readFileSync(path.join(ROOT, 'pages/signup.vue'), 'utf8')
  test('the old master-password route is gone from the page and the proxy', () => {
    expect(src).not.toMatch(/new_pass|confirmPayment/)
    expect(fs.readFileSync(path.join(ROOT, 'api/proxy.js'), 'utf8')).not.toMatch(/path === '\/confirmPayment'|CONFIRM_PAYMENT_API_KEY/)
  })
  test('the details are locked once quoted, so the memo always matches what is shown', () => {
    for (const id of ['account-username', 'account-password', 'account-password-confirm', 'account-email']) {
      expect(src).toMatch(new RegExp('id="' + id + '"[^>]*:readonly="!!quote"'))
    }
    expect(src).toMatch(/id="invested-crypto"[^>]*:disabled="!!quote"/)
  })
  test('every locale has every new message', () => {
    const keys = [...new Set(src.match(/swk_[a-z_]+/g))]
    expect(keys.length).toBeGreaterThanOrEqual(11)
    const langDir = path.join(ROOT, 'lang')
    for (const f of fs.readdirSync(langDir).filter((f) => f.endsWith('.js'))) {
      const mod = require(path.join(langDir, f))
      const strings = mod.default || mod
      for (const k of keys) expect([f, k, typeof strings[k]]).toEqual([f, k, 'string'])
      expect([f, strings.swk_send_exactly.includes('_AMOUNT_') && strings.swk_send_exactly.includes('_CUR_')]).toEqual([f, true])
    }
  })
})

describe('review round 1 fixes', () => {
  const realFetch = global.fetch
  afterEach(() => { jest.useRealTimers(); global.fetch = realFetch })

  test('promo box ticked with a blank code: stops before anything is sent', async () => {
    global.fetch = jest.fn()
    for (const code of ['', '   ']) {
      const vm = makeVm({ promo_code_chkbx: true, promo_code_val: code })
      await vm.checkFunds()
      expect(vm.error_msg).toBe('swk_promo_invalid')
      expect(vm.checkingFunds).toBe(false)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a quote whose mode does not match the promo box is refused', async () => {
    // promo box on, but the server quoted a paid signup (amount + account)
    global.fetch = answers(QUOTED)
    const vm = makeVm({ promo_code_chkbx: true, promo_code_val: 'X' })
    vm.signupFields = () => ({ new_account: 'newbie', sent_cur: 'HIVE' })
    await expect(vm.getQuote()).resolves.toBe(false)
    expect(vm.quote).toBe(null)
  })

  test('the backup and the screen hold the private halves of exactly the keys sent', async () => {
    global.fetch = answers(QUOTED)
    const vm = makeVm({ privatePostKey: 'stale', privateActiveKey: 'stale', privateOwnerKey: 'stale', privateMemoKey: 'stale' })
    await vm.getQuote()
    const sent = sentBody(global.fetch.mock.calls[0]).keys
    for (const [role, priv] of [['posting', vm.privatePostKey], ['active', vm.privateActiveKey], ['owner', vm.privateOwnerKey], ['memo', vm.privateMemoKey]]) {
      expect(hive.auth.wifToPublic(priv)).toBe(sent[role])
    }
  })

  test('switched off after the user may have paid: never says "don\'t send any payment"', async () => {
    global.fetch = answers({ accountCreated: false, reason: 'signup_disabled', retryable: true, retry_after: 3600 })
    const vm = makeVm({ quote: { fields: {}, memo: QUOTED.memo, amount: '1' } })
    await vm.checkFunds()
    expect(vm.error_msg).toBe('swk_not_seen_yet')
  })

  test('once "I\'ve sent payment" is clicked, the details can no longer be changed from the page', async () => {
    global.fetch = answers({ accountCreated: false, reason: 'payment_insufficient', retryable: false })
    const vm = makeVm({ quote: { fields: {}, memo: QUOTED.memo, amount: '1' } })
    await vm.checkFunds()
    expect(vm.paymentSent).toBe(true)
    const src = fs.readFileSync(path.join(ROOT, 'pages/signup.vue'), 'utf8')
    expect(src).toMatch(/v-if="quote && !paymentSent && !checkingFunds && !accountCreated" @click\.prevent="editDetails"/)
  })

  test('after the account exists, the payment details and the paid button are gone', () => {
    const src = fs.readFileSync(path.join(ROOT, 'pages/signup.vue'), 'utf8')
    expect(src).toContain('<div v-if="quote && quote.amount && !accountCreated">')
    expect(src).toMatch(/v-else-if="!promo_code_chkbx && !accountCreated"/)
  })

  test('the backup file carries the memo and the payment details', () => {
    let blob
    const realBlob = global.Blob
    global.Blob = function (parts) { blob = parts.join('') }
    URL.createObjectURL = () => 'blob:x'
    URL.revokeObjectURL = () => {}
    try {
      const vm = makeVm({ quote: { fields: { email: 'me@example.com', referrer: 'mcfarhat' }, memo: QUOTED.memo, amount: '8.334', currency: 'HBD', account: 'actifit.signup' } })
      vm.generateAndDownloadFile()
    } finally { global.Blob = realBlob }
    expect(blob).toContain('Memo:' + QUOTED.memo)
    expect(blob).toContain('Amount:8.334 HBD')
    expect(blob).toContain('Send to:actifit.signup')
    expect(blob).toContain('Referrer:mcfarhat')
  })
})
