// The reCAPTCHA badge must be hidden by the site's own CSS, not only by
// vue-recaptcha-v3's autoHideBadge (which runs only after reCAPTCHA loads, so a
// browser that blocks Google kept the "Could not connect" badge on every page).
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '../../..')

describe('reCAPTCHA badge', () => {
  it('is hidden by a global stylesheet', () => {
    const css = fs.readFileSync(path.join(root, 'assets/css/normal.css'), 'utf8')
    expect(css).toMatch(/\.grecaptcha-badge\s*\{\s*visibility:\s*hidden\s*!important;?\s*\}/)
    const config = fs.readFileSync(path.join(root, 'nuxt.config.js'), 'utf8')
    expect(config).toMatch(/'~\/assets\/css\/normal\.css'/)
  })

  it('keeps the attribution Google requires when the badge is hidden', () => {
    const footer = fs.readFileSync(path.join(root, 'components/NewFooterDesign.vue'), 'utf8')
    expect(footer).toMatch(/This site is protected by reCAPTCHA/)
  })
})
