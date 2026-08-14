const fs = require('fs')

describe('internal navigation', () => {
  const primaryNavigation = fs.readFileSync('components/NavbarBrand.vue', 'utf8')
  const footerNavigation = fs.readFileSync('components/NewFooterDesign.vue', 'utf8')
  const conductPage = fs.readFileSync('pages/conduct.vue', 'utf8')
  const homePage = fs.readFileSync('pages/index.vue', 'utf8')

  // Only assert on links a crawler can actually reach. The composer links
  // (/blog/new, /videos/new) sit behind v-if="user" and are locale-aware via
  // localePath(), so they are neither statically greppable nor visible to a
  // logged-out crawler -- asserting on them tested nothing.
  it.each([
    '/activity',
    '/market'
  ])('links to %s from the primary navigation', route => {
    expect(primaryNavigation).toContain(`href="${route}"`)
  })

  it('links to the code of conduct from the legal footer', () => {
    expect(footerNavigation).toContain('to="/conduct"')
  })

  it('renders shared navigation on the code of conduct page', () => {
    expect(conductPage).toContain("import NavbarBrand from '~/components/NavbarBrand'")
    expect(conductPage).toContain("import Footer from '~/components/Footer'")
  })

  it('server-renders the primary navigation on the homepage', () => {
    expect(homePage).toContain('<div id="navbar-container" ref="navbar-container">')
    expect(homePage).not.toContain('ref="navbar-container" v-if="renderReady"')
  })
})
