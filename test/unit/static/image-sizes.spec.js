// Profile badges are shown at 75-100 px; they were 768 px PNGs of up to 900 KB each.
// The homepage showcase photos are served as WebP with a JPEG fallback.
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '../../..')

// width and height of a PNG from its IHDR chunk
function pngSize (file) {
  const b = fs.readFileSync(file)
  return [b.readUInt32BE(16), b.readUInt32BE(20)]
}

describe('image sizes', () => {
  const badgeDir = path.join(root, 'static/img/badges')
  const badges = fs.readdirSync(badgeDir).filter(f => f.endsWith('.png'))

  it('badges stay at most 256 px and under 150 KB', () => {
    expect(badges.length).toBeGreaterThan(10)
    for (const f of badges) {
      const p = path.join(badgeDir, f)
      const [w, h] = pngSize(p)
      expect(Math.max(w, h)).toBeLessThanOrEqual(256)
      expect(fs.statSync(p).size).toBeLessThan(150 * 1024)
    }
  })

  it('every homepage showcase photo has a WebP version, lazy-loaded, under 150 KB', () => {
    const index = fs.readFileSync(path.join(root, 'pages/index.vue'), 'utf8')
    const jpegs = index.match(/\/img\/landingimgs\/[\w-]+\.jpeg/g)
    expect(jpegs.length).toBe(3)
    for (const j of jpegs) {
      const webp = j.replace(/\.jpeg$/, '.webp')
      expect(index).toContain(`srcset="${webp}" type="image/webp"`)
      expect(fs.statSync(path.join(root, 'static', webp)).size).toBeLessThan(150 * 1024)
    }
    expect(index.match(/landingimgs\/[\w-]+\.jpeg"[^>]*loading="lazy"/g).length).toBe(3)
  })
})
