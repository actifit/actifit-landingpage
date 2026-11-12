// Open Graph tags: Facebook reads only `property=`, and a page's tag must replace the
// site default rather than sit beside it. vue-meta merges tags by `hid`, so the default
// in nuxt.config.js and every page must use the same hid for a given og: property.
// Before this, the default og:title (hid 'title') came first on most pages, so a shared
// FAQ or Arena link previewed as "Actifit - It Pays to be Fit".
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../../..')
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(vue|js)$/.test(e.name) ? [path.join(dir, e.name)] : [])
const files = ['pages', 'components', 'layouts', 'mixins', 'plugins', 'store', 'middleware', 'utils']
  .flatMap((d) => walk(path.join(root, d))).concat(path.join(root, 'nuxt.config.js'))

// every line that mentions an og:/fb: property, as [file, line]
const entries = files.flatMap((f) => fs.readFileSync(f, 'utf8').split(/\r?\n/)
  .filter((l) => /['"](og|fb):[a-z_:]+['"]/.test(l))
  .map((l) => [path.relative(root, f), l.trim()]))

describe('Open Graph meta tags', () => {
  it('finds the tags', () => {
    expect(entries.length).toBeGreaterThan(50)
  })

  // the checks below read one line at a time, so a tag split over lines would slip past
  it('each sit on one line', () => {
    expect(entries.filter(([, l]) => !/content:/.test(l) || !/hid:/.test(l) && !/fb:app_id/.test(l))).toEqual([])
  })

  it('use property=, never name=', () => {
    expect(entries.filter(([, l]) => /name:\s*['"](og|fb):/.test(l))).toEqual([])
    expect(entries.filter(([, l]) => !/property:\s*['"](og|fb):/.test(l))).toEqual([])
  })

  it('use one hid per property everywhere, so a page replaces the site default', () => {
    const hids = {}
    for (const [, l] of entries) {
      const prop = l.match(/property:\s*['"](og:[a-z_:]+)['"]/)
      if (!prop) continue
      const hid = (l.match(/hid:\s*['"]([^'"]+)['"]/) || [])[1]
      ;(hids[prop[1]] = hids[prop[1]] || new Set()).add(hid)
    }
    for (const [prop, set] of Object.entries(hids)) {
      expect({ [prop]: set.size }).toEqual({ [prop]: 1 })
    }
    expect([...hids['og:title']]).toEqual(['ogtitle'])
    expect([...hids['og:image']]).toEqual(['ogimage'])
  })
})
