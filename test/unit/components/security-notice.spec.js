/**
 * The post-login security notice must reach the user and survive the redirect.
 *
 * actifit-bot (#144) no longer refuses a flagged account. /loginAuth SUCCEEDS and adds to
 * the success body, for an account whose posting key has not been rotated since the
 * 2026-10-21 incident:
 *     security_notice: { code: 'KEY_ROTATION_RECOMMENDED', message: '<guidance>' }
 *
 * WHY IT IS NOT RENDERED BY THE LOGIN COMPONENTS: the request was to show a banner "in
 * LoginModal.vue and pages/login.vue", but LoginModal calls closeModal() on success and
 * pages/login.vue calls postLoginRedirect() — a banner in either is destroyed before it
 * can be read. So those two CAPTURE it (store + localStorage) and layouts/default.vue
 * renders it on every page until dismissed. These tests pin the capture half; the banner
 * component is covered below.
 */
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import LoginModal from '@/components/LoginModal.vue'
import LoginPage from '@/pages/login.vue'
import SecurityNoticeBanner from '@/components/SecurityNoticeBanner.vue'
import { mount } from '@vue/test-utils'
import fs from 'fs'
import path from 'path'

const methodsOf = (C) => (C.options ? C.options.methods : C.methods)
const NOTICE = 'For your security, please change your Hive posting key.'

const makeVm = (C) => {
  const commits = []
  return {
    commits,
    is_logged_in: false,
    error_proceeding: false,
    error_msg: '',
    login_in_progress: true,
    $store: { commit: (...a) => commits.push(a), dispatch: jest.fn() },
    $t: (k) => k,
    closeModal: jest.fn(),
    resetForm: jest.fn(),
    postLoginRedirect: jest.fn(),
    $emit: jest.fn(),
    captureSecurityNotice: methodsOf(C).captureSecurityNotice,
  }
}

const login = (C, json) => {
  const vm = makeVm(C)
  methodsOf(C).setUserLoginStatus.call(vm, json, '5Kposting')
  return vm
}

const OK = { success: true, token: 'tok', userdata: { name: 'alice' } }

describe.each([['LoginModal', LoginModal], ['pages/login', LoginPage]])(
  '%s captures the security notice on successful login', (_name, C) => {
    afterEach(() => localStorage.clear())

    it('stores the notice so it survives closeModal/redirect', () => {
      const vm = login(C, { ...OK, security_notice: { code: 'KEY_ROTATION_RECOMMENDED', message: NOTICE } })

      expect(vm.commits).toContainEqual(['setSecurityNotice', NOTICE])
      // localStorage is what carries it across the redirect and a later reload.
      expect(localStorage.getItem('acti_security_notice')).toBe(NOTICE)
    })

    it('does not block the login', () => {
      // The gate is advisory: the account still works. If this ever started failing,
      // flagged users would be locked out by a notice meant only to inform them.
      const vm = login(C, { ...OK, security_notice: { code: 'KEY_ROTATION_RECOMMENDED', message: NOTICE } })
      expect(vm.error_proceeding).toBeFalsy()
      expect(localStorage.getItem('std_login_name')).toBe('alice')
    })

    it('stores nothing for an ordinary login', () => {
      login(C, OK)
      expect(localStorage.getItem('acti_security_notice')).toBeNull()
    })

    it.each([
      ['an unrecognised code', { code: 'SOMETHING_ELSE', message: 'arbitrary server text' }],
      ['no message', { code: 'KEY_ROTATION_RECOMMENDED' }],
      ['a blank message', { code: 'KEY_ROTATION_RECOMMENDED', message: '   ' }],
      ['no code', { message: 'Mongo refused at 10.1.2.3' }],
    ])('ignores a notice with %s', (_label, security_notice) => {
      // The allow-list stops an unexpected field putting arbitrary server text on every
      // page of the site — note the last case, an internal error.
      login(C, { ...OK, security_notice })
      expect(localStorage.getItem('acti_security_notice')).toBeNull()
    })
  })

describe('SecurityNoticeBanner', () => {
  const mountBanner = (storeNotice, stored) => {
    if (stored) localStorage.setItem('acti_security_notice', stored)
    return mount(SecurityNoticeBanner, {
      mocks: {
        $store: { getters: { securityNotice: storeNotice }, commit: jest.fn() },
        $t: (k) => k,
      },
    })
  }
  afterEach(() => localStorage.clear())

  it('renders the notice text', () => {
    expect(mountBanner(NOTICE).text()).toContain(NOTICE)
  })

  it('renders nothing when there is no notice', () => {
    expect(mountBanner(null).find('.security-notice-banner').exists()).toBe(false)
  })

  it('rehydrates from localStorage after a reload', async () => {
    // The user has to leave the site to rotate a key; the notice must outlive that.
    // mounted() sets data, so the re-render needs a tick before asserting.
    const w = mountBanner(null, NOTICE)
    await w.vm.$nextTick()
    expect(w.text()).toContain(NOTICE)
  })

  it('dismisses and clears the stored copy', async () => {
    const w = mountBanner(null, NOTICE)
    await w.vm.$nextTick()
    w.find('.security-notice-close').trigger('click')
    await w.vm.$nextTick()
    expect(localStorage.getItem('acti_security_notice')).toBeNull()
    expect(w.find('.security-notice-banner').exists()).toBe(false)
  })

  it('renders the notice as TEXT, never as markup', () => {
    // The string comes from the API, so the banner must not be an HTML sink.
    // Asserted on the DOM, not on w.html(): escaped text legitimately still CONTAINS
    // the substring "onerror" (as &lt;img ... onerror=...&gt;), so a string match here
    // would fail on correct behaviour.
    const payload = '<img src=x onerror="alert(1)">'
    const w = mountBanner(payload)

    expect(w.element.querySelectorAll('img').length).toBe(0)
    expect(w.element.querySelectorAll('*[onerror]').length).toBe(0)
    // It survives as literal text, which is the point.
    expect(w.text()).toContain(payload)
  })

  it('offers the key-rotation link, since that is the action being asked for', () => {
    const link = mountBanner(NOTICE).find('a[href="/password"]')
    expect(link.exists()).toBe(true)
    // The destination alone is not enough. The banner asks the user to CHANGE a key,
    // so the call to action has to say that. It previously reused
    // 'forgot_my_posting_key' ("Forgot my posting key?"), which reads as key RECOVERY
    // and sends a user who is being told to rotate looking for something they did not
    // lose. $t is mocked as identity here, so the key name is what renders.
    expect(link.text()).toBe('change_my_keys_now')
    expect(link.text()).not.toBe('forgot_my_posting_key')
  })

  // NavbarBrand is Bootstrap `fixed-top` (position:fixed, z-index:1030). The banner
  // first shipped in normal flow at the top of layouts/default.vue, so the navbar
  // rendered over it and the first line of the notice was unreadable in production.
  // jsdom does not apply scoped CSS, so this asserts on the component source -- it
  // guards the positioning contract, not the computed layout.
  it('is pinned clear of the fixed navbar', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../../components/SecurityNoticeBanner.vue'), 'utf8')
    // Scope to the .security-notice-banner RULE, not the whole <style> block. Matching
    // the block passes if ANY rule in it happens to carry these declarations -- proved
    // by putting a decoy rule beside a fully reverted banner and watching it stay green.
    const rule = src.match(/\.security-notice-banner\s*\{([^}]*)\}/)
    expect(rule).not.toBeNull()
    const decls = rule[1]

    expect(decls).toMatch(/position:\s*fixed/)
    // the regression that started this: a top-of-flow banner renders under the navbar
    expect(decls).not.toMatch(/border-bottom/)
    // stacked above the cookie consent bar, which also sits at bottom:0
    expect(decls).toMatch(/bottom:\s*var\(--cookie-banner-height/)
    // must out-rank .fixed-top (1030) but stay BELOW the consent bar (9999),
    // which has to remain clickable
    const z = decls.match(/z-index:\s*(\d+)/)
    expect(z).not.toBeNull()
    expect(Number(z[1])).toBeGreaterThan(1030)
    expect(Number(z[1])).toBeLessThan(9999)
  })

  it('reserves the SUM of both bars, and out-ranks the cookie bar rule', () => {
    // Footer.vue reserves only the cookie bar:
    //   body.cookie-consent-visible { padding-bottom: var(--cookie-banner-height) }
    // A same-specificity rule here loses on source order, because Footer's style tag is
    // always emitted after this one - with both bars up the padding collapsed to the
    // cookie bar alone and the notice covered the footer's last row. jsdom applies no
    // CSS, so this pins the two properties that make the cascade come out right.
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../../components/SecurityNoticeBanner.vue'), 'utf8')
    const footer = fs.readFileSync(
      path.resolve(__dirname, '../../../components/Footer.vue'), 'utf8')

    const ours = src.match(/([^{}\n]*security-notice-visible[^{}\n]*)\{([^}]*)\}/)
    expect(ours).not.toBeNull()
    const theirs = footer.match(/([^{}\n]*cookie-consent-visible[^{}\n]*)\{([^}]*)\}/)
    expect(theirs).not.toBeNull()

    // 1. it reserves BOTH heights, not one
    expect(ours[2]).toMatch(/--cookie-banner-height/)
    expect(ours[2]).toMatch(/--security-notice-height/)

    // 2. it is strictly MORE specific than Footer's rule, so source order cannot decide
    const specificity = (sel) => {
      const s = sel.trim()
      const classes = (s.match(/\.[\w-]+/g) || []).length
      const elements = s.replace(/\.[\w-]+/g, '').split(/\s+/).filter(Boolean).length
      return classes * 10 + elements
    }
    expect(specificity(ours[1])).toBeGreaterThan(specificity(theirs[1]))
  })
})
