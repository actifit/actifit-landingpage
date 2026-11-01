// robots.txt: Applebot keeps posts, profiles, the homepage and the main site pages,
// but not the endless tag/community listing pages. Other crawlers are unchanged.
// Rules are matched the way Google and Apple document it: the longest matching
// pattern wins, Allow wins a tie, `$` anchors the end.
const fs = require('fs')
const path = require('path')

const text = fs.readFileSync(path.join(__dirname, '../../../static/robots.txt'), 'utf8')

function groupFor (agent) {
  const groups = []
  let current = null
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const [k, ...rest] = line.split(':')
    const key = k.trim().toLowerCase()
    const value = rest.join(':').trim()
    if (key === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current) }
      current.agents.push(value.toLowerCase())
    } else if ((key === 'allow' || key === 'disallow') && current) {
      current.rules.push({ allow: key === 'allow', pattern: value })
    }
  }
  return groups.find(g => g.agents.includes(agent.toLowerCase())) || groups.find(g => g.agents.includes('*'))
}

function allowed (agent, urlPath) {
  let best = null
  for (const r of groupFor(agent).rules) {
    if (!r.pattern) continue
    const anchored = r.pattern.endsWith('$')
    const body = anchored ? r.pattern.slice(0, -1) : r.pattern
    const escape = (s) => s.replace(/[.+?^${}()|[\]\\]/g, (c) => '\\' + c)
    const re = new RegExp('^' + body.split('*').map(escape).join('.*') + (anchored ? '$' : ''))
    if (!re.test(urlPath)) continue
    if (!best || r.pattern.length > best.pattern.length || (r.pattern.length === best.pattern.length && r.allow)) best = r
  }
  return best ? best.allow : true
}

describe('robots.txt', () => {
  it('Applebot keeps posts, profiles, the homepage and main pages', () => {
    for (const p of ['/', '/@actifit', '/@actifit/some-post', '/market', '/arena', '/activity', '/communities', '/leaderboard', '/faq', '/signup', '/img/actifit_logo.png', '/_nuxt/app.js']) {
      expect([p, allowed('Applebot', p)]).toEqual([p, true])
    }
  })

  it('Applebot may crawl every page listed in the sitemap', () => {
    const sitemap = fs.readFileSync(path.join(__dirname, '../../../static/sitemap.xml'), 'utf8')
    const paths = [...sitemap.matchAll(/<loc>\s*https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map(m => m[1].trim() || '/')
    expect(paths.length > 5).toBe(true)
    for (const p of paths) expect([p, allowed('Applebot', p)]).toEqual([p, true])
  })

  it('Applebot skips tag and community listing pages', () => {
    for (const p of ['/photography', '/spanish', '/hive-193552', '/bitcoin', '/travel']) {
      expect([p, allowed('Applebot', p)]).toEqual([p, false])
    }
  })

  it('Applebot keeps the private-page rules', () => {
    for (const p of ['/login', '/settings', '/notifications', '/password', '/search']) {
      expect([p, allowed('Applebot', p)]).toEqual([p, false])
    }
  })

  it('other crawlers are unchanged', () => {
    for (const p of ['/', '/photography', '/hive-193552', '/@actifit/x']) expect(allowed('Googlebot', p)).toBe(true)
    for (const p of ['/login', '/settings', '/search']) expect(allowed('Googlebot', p)).toBe(false)
  })
})
