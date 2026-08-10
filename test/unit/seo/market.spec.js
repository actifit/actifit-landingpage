const fs = require('fs')

describe('market technical SEO', () => {
  const marketPage = fs.readFileSync('pages/market.vue', 'utf8')
  const productComponent = fs.readFileSync('components/Product.vue', 'utf8')
  const defaultLayout = fs.readFileSync('layouts/default.vue', 'utf8')

  it('keeps the market title, description, and Open Graph metadata', () => {
    expect(marketPage).toContain('Actifit Market - Actifit.io')
    expect(marketPage).toContain("hid: 'description'")
    expect(marketPage).toContain("hid: 'ogdescription'")
    expect(marketPage).toContain("property: 'og:description'")
    expect(marketPage).toContain("hid: 'ogtitle'")
    expect(marketPage).toContain("property: 'og:title'")
  })

  it('keeps the semantic page heading and route-specific canonical metadata', () => {
    expect(marketPage).toContain('<ListHeadingSection :textualDisplay="$t(\'market_title\')" />')
    expect(defaultLayout).toContain('getCanonicalUrl(this.$route.path)')
    expect(defaultLayout).toContain("hid: 'canonical'")
    expect(defaultLayout).toContain("property: 'og:url'")
  })

  it('keeps the audited image and external-link safeguards', () => {
    const marketImages = marketPage.match(/<img\b[^>]*>/gi) || []
    const productImages = productComponent.match(/<img\b[^>]*>/gi) || []

    marketImages.concat(productImages).forEach(image => {
      expect(image).toMatch(/(?:^|\s)(?::)?alt\s*=/)
    })
    expect(productComponent).toContain('target="_blank" rel="noopener noreferrer"')
  })
})
