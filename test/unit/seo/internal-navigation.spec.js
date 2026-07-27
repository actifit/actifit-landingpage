const fs = require('fs')

describe('internal navigation', () => {
  const primaryNavigation = fs.readFileSync('components/NavbarBrand.vue', 'utf8')
  const footerNavigation = fs.readFileSync('components/NewFooterDesign.vue', 'utf8')
  const conductPage = fs.readFileSync('pages/conduct.vue', 'utf8')

  it.each([
    '/blog/new',
    '/videos/new',
    '/consultants'
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
})
