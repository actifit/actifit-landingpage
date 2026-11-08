/**
 * Signup when reCAPTCHA is blocked or rejects the token (#533).
 *
 * Before: with Google blocked, $recaptcha was undefined and calling it threw a TypeError,
 * so the button silently did nothing. The server's answer was read off the fetch Response
 * (outc.error) instead of its JSON body, so a rejected token was never caught.
 */
import fs from 'fs'
import path from 'path'
import SignupPage from '@/pages/signup.vue'

const methods = SignupPage.options ? SignupPage.options.methods : SignupPage.methods
const mounted = SignupPage.options ? SignupPage.options.mounted : SignupPage.mounted

const makeVm = (over = {}) => ({
  error_proceeding: false,
  error_msg: '',
  recaptchaUnavailable: false,
  $t: (k) => k,
  ...over,
})
const answer = (body) => jest.fn().mockResolvedValue({ json: () => Promise.resolve(body) })

describe('signup passSignupCaptcha', () => {
  const realFetch = global.fetch
  afterEach(() => { global.fetch = realFetch })

  test('Google blocked: no $recaptcha, shows the unavailable message and stops', async () => {
    global.fetch = jest.fn()
    const vm = makeVm()
    await expect(methods.passSignupCaptcha.call(vm)).resolves.toBe(false)
    expect(vm.error_msg).toBe('captcha_unavailable')
    expect(vm.recaptchaUnavailable).toBe(true)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('token request throws or returns nothing: unavailable, stops', async () => {
    global.fetch = jest.fn()
    for (const $recaptcha of [jest.fn().mockRejectedValue(new Error('x')), jest.fn().mockResolvedValue('')]) {
      const vm = makeVm({ $recaptcha })
      await expect(methods.passSignupCaptcha.call(vm)).resolves.toBe(false)
      expect(vm.error_msg).toBe('captcha_unavailable')
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('server accepts the token: signup goes on', async () => {
    global.fetch = answer({ success: true })
    const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('tok+/=') })
    await expect(methods.passSignupCaptcha.call(vm)).resolves.toBe(true)
    expect(global.fetch.mock.calls[0][0]).toContain('verifyLoginCaptcha?token=tok%2B%2F%3D')
    expect(vm.error_proceeding).toBe(false)
  })

  test('server rejects the token: reads the JSON body and shows captcha_invalid', async () => {
    global.fetch = answer({ error: 'error', reason: 'timeout-or-duplicate' })
    const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('tok') })
    await expect(methods.passSignupCaptcha.call(vm)).resolves.toBe(false)
    expect(vm.error_msg).toBe('captcha_invalid')
  })

  test('our server cannot reach Google, or does not answer: not the user\'s fault, signup goes on', async () => {
    global.fetch = answer({ error: 'error', reason: 'verify-unreachable' })
    let vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('tok') })
    await expect(methods.passSignupCaptcha.call(vm)).resolves.toBe(true)

    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('tok') })
    await expect(methods.passSignupCaptcha.call(vm)).resolves.toBe(true)
  })
})

describe('signup warns before payment when reCAPTCHA cannot load', () => {
  const realFetch = global.fetch
  afterEach(() => { global.fetch = realFetch })
  const pageVm = ($recaptchaLoaded) => makeVm({
    $store: { dispatch: jest.fn().mockResolvedValue() },
    $route: { query: {} },
    setPasswordVal: jest.fn(),
    setMemoValue: jest.fn(),
    $recaptchaLoaded,
  })

  test('a failed load sets recaptchaUnavailable instead of an unhandled rejection', async () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    const vm = pageVm(jest.fn().mockRejectedValue(new Error('blocked')))
    await expect(mounted.call(vm)).resolves.toBeUndefined()
    expect(vm.recaptchaUnavailable).toBe(true)
  })

  test('a normal load leaves the warning off', async () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    const vm = pageVm(jest.fn().mockResolvedValue(true))
    await mounted.call(vm)
    expect(vm.recaptchaUnavailable).toBe(false)
  })

  test('the warning sits in the payment step and every locale has the text', () => {
    const vue = fs.readFileSync(path.join(__dirname, '../../../pages/signup.vue'), 'utf8')
    expect(vue).toMatch(/v-if="recaptchaUnavailable">\{\{ \$t\('captcha_unavailable'\) \}\}/)
    expect(vue.indexOf('recaptchaUnavailable">')).toBeLessThan(vue.indexOf('actifit-address'))
    const langDir = path.join(__dirname, '../../../lang')
    for (const f of fs.readdirSync(langDir).filter((f) => f.endsWith('.js'))) {
      expect([f, /captcha_unavailable: "/.test(fs.readFileSync(path.join(langDir, f), 'utf8'))]).toEqual([f, true])
    }
  })
})
