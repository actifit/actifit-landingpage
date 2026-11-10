/**
 * Images on the home page and in the footer (on every page) declare their size, so the
 * browser reserves the space before the file arrives and nothing below them jumps.
 *
 * The 2026-10-30 SEO audit counted 0 of 15 actifit.io images with width/height. The
 * attributes give only the aspect ratio: each image's CSS still sets the size it is
 * shown at, with the other dimension `auto`, so how the page looks does not change.
 */
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../../..')
const FILES = ['components/NewFooterDesign.vue', 'pages/index.vue']

// Pixel size from the file header (PNG IHDR; JPEG SOF; WebP VP8 / VP8L / VP8X; SVG viewBox).
function intrinsicSize (file) {
  const b = fs.readFileSync(file)
  if (file.endsWith('.svg')) {
    const vb = b.toString('utf8').match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/)
    return vb ? [Number(vb[1]), Number(vb[2])] : null
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9;) {
      if (b[i] !== 0xff) { i++; continue }
      if (b[i + 1] >= 0xc0 && b[i + 1] <= 0xc2) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]
      i += 2 + b.readUInt16BE(i + 2)
    }
    return null
  }
  if (b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return [b.readUInt32BE(16), b.readUInt32BE(20)]
  }
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16)
    if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21)
      return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]
    }
    if (chunk === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1]
  }
  return null
}

const staticImages = (file) => {
  const src = fs.readFileSync(path.join(root, file), 'utf8')
  return (src.match(/<img\b[^>]*>/g) || [])
    .map((tag) => ({ tag, src: (tag.match(/\ssrc=["'](\/img\/[^"']+)["']/) || [])[1] }))
    .filter((i) => i.src)
}

describe.each(FILES)('%s', (file) => {
  const images = staticImages(file)

  it('has static images to check', () => {
    expect(images.length).toBeGreaterThan(0)
  })

  // The ratio is what reserves the space. A <picture> may declare its WebP source's
  // pixel size while its fallback <img src> is a larger JPEG of the same shape.
  it.each(images.map((i) => [i.src, i.tag]))('%s declares a width and height of its real shape', (src, tag) => {
    const size = intrinsicSize(path.join(root, 'static', src))
    expect(size).not.toBeNull()
    const w = Number((tag.match(/\swidth=["'](\d+)["']/) || [])[1])
    const h = Number((tag.match(/\sheight=["'](\d+)["']/) || [])[1])
    expect(w).toBeGreaterThan(0)
    expect(h).toBeGreaterThan(0)
    expect(Math.abs(w / h - size[0] / size[1])).toBeLessThan(0.01)
  })
})

describe('the CSS still sets the shown size', () => {
  // A width attribute next to a height-only rule would stretch the image to that width.
  // These match the rules as written: reformatting them means updating the patterns, and
  // a later rule elsewhere that sets one side of these images is not caught here.
  it('height-only rules let the width follow the image', () => {
    const footer = fs.readFileSync(path.join(root, 'components/NewFooterDesign.vue'), 'utf8')
    expect(footer).toMatch(/\.footer-logo \{ height: 50px; width: auto;/)
    expect(footer).toMatch(/\.app-store-buttons img \{ height: 50px; width: auto;/)
    expect(footer).toMatch(/\.hive-logo-bottom \{ height: 20px; width: auto;/)
    const home = fs.readFileSync(path.join(root, 'pages/index.vue'), 'utf8')
    expect(home).toMatch(/\.intro \.intro-logo \{\s*height: 50px;\s*width: auto;/)
    expect(home).toMatch(/\.app-buttons-container img\{height:55px;width:auto;/)
    expect(home).toMatch(/#infrastructure \.logo-icon\{width:auto;height:auto;max-height:80px/)
    expect(home).toMatch(/\.arena-promo-img \{\s*position: absolute;\s*width: 74%;\s*height: auto;/)
  })
})
