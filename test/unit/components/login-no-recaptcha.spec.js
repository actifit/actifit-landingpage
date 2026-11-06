/**
 * Login does not use reCAPTCHA (removed in 1.14.32).
 *
 * The v3 token was never sent to the login endpoints: the server checks a signature over
 * its own nonce against the account's posting authority on chain, whichever wallet made
 * it. The captcha only added up to 8s before the button responded and broke login in
 * Brave and other privacy browsers. Signup still uses it (accounts there cost money), so
 * these tests also pin that signup keeps registering the plugin itself.
 *
 * Each case gives the vm $recaptcha / $recaptchaLoaded spies, so a reintroduced call is
 * caught even when it would succeed.
 */
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import fs from 'fs'
import path from 'path'
import hive from '@hiveio/hive-js'
import LoginModal from '@/components/LoginModal.vue'
import LoginPage from '@/pages/login.vue'
import signedChallengeLogin from '@/mixins/signedChallengeLogin'

const methodsOf = (C) => (C.options ? C.options.methods : C.methods)
const mixin = signedChallengeLogin.methods

const POSTING_WIF = hive.auth.toWif('alice', 'posting-key-test', 'posting')
const NONCE = '3f9a'.repeat(16)
const CHALLENGE = { success: true, nonce: NONCE, message: 'Log in to actifit.io\nuser: alice\nnonce: ' + NONCE, expires_in: 120 }
const SESSION = { success: true, token: 'tok', userdata: { name: 'alice' } }
const ok = (body) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
const loginFetch = () => jest.fn().mockImplementation((url) => {
  const u = String(url)
  if (u.includes('loginChallenge')) return ok(CHALLENGE)
  if (u.includes('loginVerify')) return ok(SESSION)
  return ok({})
})
const flush = async () => { for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 0)) }

const makeVm = (over = {}) => {
  const vm = {
    error_proceeding: false,
    error_msg: '',
    login_in_progress: false,
    keychain_available: false,
    hiveauth_wait: false,
    bchain_val: 'HIVE',
    keep_loggedin_val: false,
    $t: (k) => k,
    $store: { commit: jest.fn(), dispatch: jest.fn() },
    $refs: { username: { value: 'alice' }, ppkey: { value: POSTING_WIF } },
    $nextTick: (fn) => fn && fn(),
    $recaptcha: jest.fn().mockResolvedValue('tkn'),
    $recaptchaLoaded: jest.fn().mockResolvedValue(true),
    setUserLoginStatus: jest.fn(),
    setKeychainLoginStatus: jest.fn(),
    setHiveauthLoginStatus: jest.fn(),
    ...over
  }
  Object.keys(mixin).forEach((k) => { if (!(k in over)) vm[k] = mixin[k].bind(vm) })
  return vm
}

const expectNoCaptcha = (vm) => {
  expect(vm.$recaptcha).not.toHaveBeenCalled()
  expect(vm.$recaptchaLoaded).not.toHaveBeenCalled()
  const called = global.fetch.mock.calls.map((c) => String(c[0]))
  expect(called.some((u) => /captcha/i.test(u))).toBe(false)
}

afterEach(() => {
  delete window.hive_keychain
  delete global.fetch
  localStorage.clear()
})

describe.each([['LoginModal', LoginModal], ['pages/login', LoginPage]])('%s logs in without reCAPTCHA', (name, C) => {
  it('posting key', async () => {
    global.fetch = loginFetch()
    const vm = makeVm()
    await methodsOf(C).proceedLogin.call(vm)
    expectNoCaptcha(vm)
    expect(vm.setUserLoginStatus).toHaveBeenCalledWith(SESSION, POSTING_WIF)
  })

  it('Keychain', async () => {
    global.fetch = loginFetch()
    window.hive_keychain = {
      requestHandshake: (cb) => cb(),
      requestSignBuffer: (acct, msg, role, cb) => cb({ success: true, result: 'ab'.repeat(65) })
    }
    const vm = makeVm()
    await methodsOf(C).loginKeychain.call(vm)
    expectNoCaptcha(vm)
    expect(vm.setKeychainLoginStatus).toHaveBeenCalledWith(SESSION)
  })

  it('HiveAuth', async () => {
    global.fetch = loginFetch()
    const sig = 'cd'.repeat(65)
    const vm = makeVm({
      verifyHiveauth: jest.fn().mockReturnValue(true),
      $HAS: { authenticate: jest.fn().mockResolvedValue({ cmd: 'auth_ack', data: { expire: 1, token: 't', challenge: { challenge: sig, pubkey: 'STM' } } }) }
    })
    await methodsOf(C).loginHiveauth.call(vm)
    await flush()
    expectNoCaptcha(vm)
    expect(vm.setHiveauthLoginStatus).toHaveBeenCalledWith(SESSION)
    const verify = global.fetch.mock.calls.find((c) => String(c[0]).includes('loginVerify'))
    expect(JSON.parse(verify[1].body)).toMatchObject({ signature: sig, method: 'hiveauth' })
  })
})

describe('reCAPTCHA registration', () => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '../../..', f), 'utf8')

  it('is gone from the login modal, the /login page and the login mixin', () => {
    ;['components/LoginModal.vue', 'pages/login.vue', 'mixins/signedChallengeLogin.js'].forEach((f) => {
      const src = read(f)
      expect(src).not.toMatch(/vue-recaptcha/)
      expect(src).not.toMatch(/\$recaptcha/)
      expect(src).not.toMatch(/verifyLoginCaptcha/)
    })
    // The proxy route served only login; signup calls the bot directly.
    expect(read('api/proxy.js')).not.toMatch(/verifyLoginCaptcha/)
  })

  it('stays on signup, registered at module level (deferring it broke tokens in 1.12.0)', () => {
    const src = read('pages/signup.vue')
    const script = src.slice(src.indexOf('<script>'))
    const use = script.indexOf('Vue.use(VueReCaptcha')
    expect(use).toBeGreaterThan(-1)
    // Before `export default`, i.e. not inside mounted() or a method.
    expect(use).toBeLessThan(script.indexOf('export default'))
    expect(src).toMatch(/\$recaptcha\('signup'\)/)
  })

  // Nuxt prefetches a visible <nuxt-link>'s page chunk at idle, which evaluates
  // signup.vue and so its Vue.use - loading reCAPTCHA on every page that shows the link
  // (UserMenu does, for every logged-out visitor).
  it('no nuxt-link to /signup prefetches the signup page', () => {
    const root = path.join(__dirname, '../../..')
    const vueFiles = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? vueFiles(path.join(dir, d.name)) : (d.name.endsWith('.vue') ? [path.join(dir, d.name)] : []))
    const links = ['pages', 'components', 'layouts']
      .filter((d) => fs.existsSync(path.join(root, d)))
      .flatMap(vueFiles)
      .flatMap((f) => (read(f).match(/<(nuxt-link|NuxtLink)\b[^>]*>/g) || [])
        .filter((tag) => /\/signup\b/.test(tag))
        .map((tag) => ({ f, tag })))
    expect(links.length).toBeGreaterThanOrEqual(2) // UserMenu, arena/_id
    links.forEach(({ f, tag }) => expect(`${f}: ${tag}`).toMatch(/\bno-prefetch\b/))
  })

  it('shows the hidden-badge attribution site-wide, not only on /signup', () => {
    const footer = read('components/NewFooterDesign.vue')
    expect(footer).toMatch(/<div class="bottom-row">\s*<div class="bottom-bar-item recaptcha-attribution">/)
  })
})
