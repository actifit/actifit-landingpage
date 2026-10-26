// AFIT -> vote reward boost exchange (utils/afitExchange.js, used by wallet.vue).
//
// The exchange used to be authorised by the funds password alone (no session). Every
// funds password is treated as known to the attacker since 2026-10-21, so the server now
// requires the login session (x-acti-token) and the wallet no longer asks for the password.
import fs from 'fs'
import path from 'path'
import { requestAfitExchange, exchangeErrorText } from '~/utils/afitExchange'

const t = (k) => k
const gate = (o) => (o && ['KEY_ROTATION_REQUIRED', 'TRY_AGAIN'].includes(o.code) ? o.message : null)

afterEach(() => { delete global.fetch })

describe('requestAfitExchange', () => {
  it('sends the login session and NO funds password', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ status: 'Success' }) })
    const r = await requestAfitExchange({ apiUrl: 'https://api.test/', user: 'alice', tokens: '50', sessionToken: 'jwt' })

    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.test/performAfitSteemExchange')
    expect(opts.method).toBe('POST')
    expect(opts.headers['x-acti-token']).toBe('Bearer jwt')
    expect(JSON.parse(opts.body)).toEqual({ user: 'alice', tokens: '50' })
    expect(r).toEqual({ status: 200, outcome: { status: 'Success' } })
  })

  it('a non-JSON reply (e.g. a proxy error page) comes back as an empty outcome, not a throw', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 502, json: async () => { throw new Error('not json') } })
    await expect(requestAfitExchange({ apiUrl: 'x/', user: 'a', tokens: '50', sessionToken: 'j' }))
      .resolves.toEqual({ status: 502, outcome: {} })
  })
})

describe('exchangeErrorText - the server reason, in words the user can act on', () => {
  it.each([
    ['key rotation required', 403, { code: 'KEY_ROTATION_REQUIRED', message: 'Rotate your posting key first' }, 'Rotate your posting key first'],
    ['try again', 503, { code: 'TRY_AGAIN', message: 'Please try again shortly' }, 'Please try again shortly'],
    ['an expired or invalid session (checkHdrs: 200 + success:false)', 200, { success: false, message: 'Token is not valid' }, 'session_expired_login_again'],
    ['login again (key gate 401)', 401, { code: 'LOGIN_AGAIN', error: 'x' }, 'session_expired_login_again'],
    ['another account', 200, { error: 'User mismatch' }, 'User mismatch'],
    ['already being processed', 200, { error: 'An exchange is already being processed' }, 'An exchange is already being processed'],
    ['a non-tier amount', 200, { error: 'Invalid AFIT amount. Choose one of: 50, 100, 150, 200' }, 'Invalid AFIT amount. Choose one of: 50, 100, 150, 200'],
    ['an empty / non-JSON reply', 502, {}, 'error_performing_operation']
  ])('%s', (_, status, outcome, shown) => {
    expect(exchangeErrorText(status, outcome, t, gate)).toBe(shown)
  })
})

describe('wallet.vue no longer asks for the funds password to exchange', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../../pages/_username/wallet.vue'), 'utf8')
  it('has no funds-password field or "enter your funds password" step for the exchange', () => {
    expect(src).not.toMatch(/funds-pass-entry/)
    expect(src).not.toMatch(/enter_funds_pass_proceed/)
    // the exchange wizard's "set / verify a funds password" steps are gone
    expect(src).not.toMatch(/<transition name="fade" v-if="!userHasFundsPass">/)
    expect(src).not.toMatch(/<transition name="fade" v-else-if="!userFundsPassVerified">/)
  })
  it('sends the exchange through the session helper', () => {
    expect(src).toMatch(/requestAfitExchange\(/)
    expect(src).not.toMatch(/pass: this\.\$refs\['funds-pass-entry'\]/)
  })
})
