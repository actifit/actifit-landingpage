// The homepage hero was a 2.4 MB PNG loaded as a CSS background. It now uses WebP
// (with a JPEG fallback and a small phone version) and is preloaded.
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '../../..')
const index = fs.readFileSync(path.join(root, 'pages/index.vue'), 'utf8')

describe('homepage hero image', () => {
  it('every hero image the page references exists and stays small', () => {
    const files = [...new Set(index.match(/\/img\/hero-home[\w-]*\.(webp|jpg)/g))]
    expect(files.sort()).toEqual(['/img/hero-home-768.webp', '/img/hero-home.jpg', '/img/hero-home.webp'])
    for (const f of files) {
      const size = fs.statSync(path.join(root, 'static', f)).size
      expect(size).toBeLessThan(300 * 1024)
    }
  })

  it('no longer loads the 2.4 MB PNG', () => {
    expect(index).not.toMatch(/header-5\(2\)\.png/)
  })

  it('static files are cached for a day', () => {
    const config = fs.readFileSync(path.join(root, 'nuxt.config.js'), 'utf8')
    expect(config).toMatch(/static:\s*\{[\s\S]*?maxAge:\s*'1d'/)
  })
})
