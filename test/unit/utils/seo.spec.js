import { getCanonicalUrl } from '~/utils/seo'
import fs from 'fs'

describe('SEO helpers', () => {
  it.each([
    ['/', 'https://actifit.io'],
    ['/activity', 'https://actifit.io/activity'],
    ['/activity/', 'https://actifit.io/activity'],
    ['/@alice/post-name', 'https://actifit.io/@alice/post-name'],
    ['/search?q=running', 'https://actifit.io/search'],
    ['/faq#rewards', 'https://actifit.io/faq']
  ])('builds the canonical URL for %s', (routePath, expectedUrl) => {
    expect(getCanonicalUrl(routePath)).toBe(expectedUrl)
  })

  it('handles missing and relative route paths', () => {
    expect(getCanonicalUrl()).toBe('https://actifit.io')
    expect(getCanonicalUrl('signup')).toBe('https://actifit.io/signup')
  })

  it('wires the route path into the SSR layout canonical and og:url', () => {
    const layout = fs.readFileSync('layouts/default.vue', 'utf8')

    expect(layout).toContain('getCanonicalUrl(this.$route.path)')
    expect(layout).toContain("hid: 'canonical'")
    expect(layout).toContain("property: 'og:url'")
  })
})
