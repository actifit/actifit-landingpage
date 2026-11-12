// Links in posts open without the "leaving Actifit" warning only when they really go to
// a trusted site. The old prefix regex trusted lookalike domains, credentials tricks and
// protocol-relative links.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import Vue from 'vue'
import '@/plugins/vue-custom'
import { isSiteLink, isTrustedLink } from '@/utils/trustedLinks'
import sanitizePlugin from '@/plugins/sanitize'
import SafeRemarkable from '@/components/SafeRemarkable.vue'

const LEAVES_SITE = [
  'https://youtube.com.evil.com/watch',
  'https://peakd.com.evil.com',
  'https://evilpeakd.com',
  'https://actifit.io@evil.com/',
  'https://user:pw@peakd.com/',
  '//evil.com',
  '/\\evil.com',
  '/\t/evil.com',
  ' //evil.com',
  'https://evil.com/?r=https://peakd.com',
  'https://evil.com#https://actifit.io',
  'javascript:alert(1)',
  'data:text/html,x',
  'ftp://peakd.com',
  'relative/page',
  'https:\\evil.com',
  'https:/\\evil.com',
  'https://evil.com\\@peakd.com',
  'https://peakd.com%2eevil.com',
  '',
]

describe('isTrustedLink', () => {
  it('trusts the listed sites and their subdomains', () => {
    for (const u of ['https://peakd.com/@alice/post', 'http://hive.blog', 'https://www.youtube.com/watch?v=x',
      'https://m.facebook.com/x', 'HTTPS://ECENCY.COM/x', 'https://t.me/actifit', 'https://actifit.io/@a/b',
      '  https://peakd.com/x  ', 'https://peakd.com./x', 'https://pe%61kd.com/x']) {
      expect([u, isTrustedLink(u)]).toEqual([u, true])
    }
  })

  it('trusts links within the site', () => {
    for (const u of ['/@alice', '/@alice/post', '#comments', '/']) {
      expect([u, isTrustedLink(u)]).toEqual([u, true])
    }
  })

  it('does not trust lookalikes, credentials, protocol-relative links or other schemes', () => {
    for (const u of LEAVES_SITE) {
      expect([u, isTrustedLink(u)]).toEqual([u, false])
    }
    expect(isTrustedLink(undefined)).toBe(false)
    expect(isTrustedLink(null)).toBe(false)
  })
})

describe('isSiteLink', () => {
  it('is true only for a single leading slash or an anchor', () => {
    expect(isSiteLink('/@alice')).toBe(true)
    expect(isSiteLink('#x')).toBe(true)
    for (const u of ['//evil.com', '/\\evil.com', '/\t/evil.com', '\n//evil.com', 'https://actifit.io/x']) {
      expect([u, isSiteLink(u)]).toEqual([u, false])
    }
  })
})

describe('$sanitizePostHtml links', () => {
  beforeAll(() => { process.client = true })
  afterAll(() => { delete process.client })

  const link = (href) => {
    const el = document.createElement('div')
    el.innerHTML = Vue.prototype.$sanitizePostHtml(`<a href="${href}">x</a>`)
    return el.querySelector('a')
  }

  it('warns before a lookalike domain and opens it in a new tab', () => {
    const a = link('https://youtube.com.evil.com/watch')
    expect(a.classList.contains('external-link')).toBe(true)
    expect(a.getAttribute('data-external-href')).toBe('https://youtube.com.evil.com/watch')
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener ugc')
  })

  it('warns before a protocol-relative link', () => {
    const a = link('//evil.com/x')
    expect(a.classList.contains('external-link')).toBe(true)
    expect(a.getAttribute('target')).toBe('_blank')
  })

  it('opens trusted sites in a new tab without a warning', () => {
    const a = link('https://peakd.com/@alice')
    expect(a.classList.contains('external-link')).toBe(false)
    expect(a.getAttribute('target')).toBe('_blank')
  })

  it('keeps links within the site in the same tab, without a warning', () => {
    const a = link('/@alice/post')
    expect(a.classList.contains('external-link')).toBe(false)
    expect(a.hasAttribute('target')).toBe(false)
  })
})

describe('$sanitizePostHtml links on the server (sanitize-html path)', () => {
  beforeAll(() => { process.client = false })
  afterAll(() => { delete process.client })

  it('warns before a lookalike domain and keeps trusted sites plain', () => {
    const el = document.createElement('div')
    el.innerHTML = Vue.prototype.$sanitizePostHtml(
      '<a href="https://youtube.com.evil.com/w">a</a><a href="https://peakd.com/@alice">b</a><a href="/@alice">c</a>')
    const [bad, good, local] = el.querySelectorAll('a')
    expect(bad.classList.contains('external-link')).toBe(true)
    expect(bad.getAttribute('target')).toBe('_blank')
    expect(good.classList.contains('external-link')).toBe(false)
    expect(local.hasAttribute('target')).toBe(false)
  })
})

describe('the warning\'s Continue button', () => {
  const safeUrl = (() => { const out = {}; sanitizePlugin({ app: {} }, (n, fn) => { out[n] = fn }); return out.safeUrl })()
  const open = (href) => {
    const spy = jest.spyOn(window, 'open').mockImplementation(() => null)
    SafeRemarkable.methods.openExternalLink.call({ externalLinkUrl: href, $safeUrl: safeUrl, closeModal () {} })
    const calls = spy.mock.calls.map((c) => c[0])
    spy.mockRestore()
    return calls
  }

  it('opens a protocol-relative link at its real address', () => {
    expect(open('//evil.com/x')).toEqual([window.location.protocol + '//evil.com/x'])
  })

  it('opens an ordinary off-site link', () => {
    expect(open('https://example.com/page')).toEqual(['https://example.com/page'])
  })

  it('never opens a script link', () => {
    expect(open('javascript:alert(1)')).toEqual([])
  })
})
