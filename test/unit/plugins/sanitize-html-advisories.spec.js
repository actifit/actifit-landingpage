// Importing the plugin registers $sanitizePostHtml; stub what it pulls in on import.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import Vue from 'vue'
import '@/plugins/vue-custom'
import sanitizePlugin from '@/plugins/sanitize'

// sanitize-html 2.17.5 has four open advisories, and every fixed release needs Node 22
// (htmlparser2 12 is ESM-only), while the server runs Node 16. Each one only applies
// when the sanitizer allows a tag we do not allow:
//   GHSA-g8qq-57p8-ggw5  SVG <animate attributeName="href" values="#a;javascript:...">
//   GHSA-jxwj-j7wr-gfrw  <textarea>/<xmp> in allowedTags + a literal "</textarea/>"
//   GHSA-x3q4-9hxx-gx8m  <noscript> added to nonTextTags
//   GHSA-cv27-6wvh-8x7j  <meta http-equiv="refresh" content="0;url=javascript:...">
// These run each published proof of concept through both server sanitizers, so allowing
// svg, textarea, xmp or meta later fails here instead of shipping the hole. The noscript
// cases are weaker: with noscript in nonTextTags, x3q4 can only let through markup the
// allow-list already permits, so they check that nothing runs, not the config itself.
// Upgrade sanitize-html once the server is on Node 22; these stay as regression tests.
const POCS = {
  'SVG SMIL href list (GHSA-g8qq)':
    '<svg><a><animate attributeName="href" values="#safe;javascript:alert(1)" dur=".01s" fill="freeze"></animate><text y="30">Click me</text></a></svg>',
  'textarea solidus close (GHSA-jxwj)':
    '<textarea></textarea/><img src=x onerror="alert(document.domain)">',
  'xmp solidus close (GHSA-jxwj)':
    '<xmp></xmp/><img src=x onerror="alert(1)">',
  'noscript implied close (GHSA-x3q4)':
    '<div><noscript></div><img src="/img/a.png" onerror="alert(1)"></noscript>',
  'noscript behind CDATA (GHSA-x3q4)':
    '<p>Hi</p><![CDATA[ x > <noscript>]]><a href="javascript:alert(1)">Reset</a><img src="/img/a.png" onerror="alert(1)"></noscript>',
  'meta refresh (GHSA-cv27)':
    '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  // Not an advisory: our own cheerio link pass used to decode iframe text and write it
  // back unescaped (plugins/vue-custom.js, server branch).
  'escaped markup inside an iframe':
    '<iframe>&lt;/iframe&gt;&lt;img src=x onerror=alert(1)&gt;</iframe>',
  'escaped markup inside a trusted iframe':
    '<iframe src="https://www.youtube.com/embed/x">&lt;/iframe&gt;&lt;img src=x onerror=alert(1)&gt;</iframe>',
  'markup in an attribute inside an iframe':
    '<iframe><span title="</iframe><img src=x onerror=alert(1)>">x</span></iframe>',
}

// Parse the output the way the browser will, then look for anything that could run.
function problems (html, allowedTags) {
  const root = document.createElement('div')
  root.innerHTML = html
  const found = []
  root.querySelectorAll('*').forEach((el) => {
    const tag = el.tagName.toLowerCase()
    if (!allowedTags.includes(tag)) found.push(`tag <${tag}>`)
    Array.from(el.attributes).forEach(({ name, value }) => {
      if (/^on/i.test(name)) found.push(`${tag}[${name}]`)
      if (/(java|vb)script:|data:text\/html/i.test(value.replace(/[\s\u0000-\u001F]/g, ''))) found.push(`${tag}[${name}=${value}]`)
    })
  })
  return found
}

describe('sanitize-html advisories cannot reach the server sanitizers', () => {
  let narrow
  beforeAll(() => {
    process.client = false
    sanitizePlugin({ app: {} }, (name, fn) => { if (name === 'sanitize') narrow = fn })
  })
  afterAll(() => { delete process.client })

  // What each sanitizer allows today (plugins/vue-custom.js, plugins/sanitize.js). An
  // output tag outside these lists fails the test, so allowing svg, textarea, xmp,
  // noscript or meta later shows up here.
  const POST_TAGS = ['img', 'iframe', 'details', 'summary', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'sub', 'sup', 'div', 'a', 'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span']
  const HEADING_TAGS = ['a', 'b', 'i', 'strong', 'em', 'br', 'img', 'span']

  describe.each(Object.entries(POCS))('%s', (_, payload) => {
    it('post body ($sanitizePostHtml)', () => {
      const out = Vue.prototype.$sanitizePostHtml(payload)
      expect(problems(out, POST_TAGS)).toEqual([])
    })

    it('page heading ($sanitize)', () => {
      expect(problems(narrow(payload), HEADING_TAGS)).toEqual([])
    })
  })
})
