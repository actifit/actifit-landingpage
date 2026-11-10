/**
 * /sitemap-posts.xml: the Actifit community's recent posts and their authors, built from
 * Hive at most hourly and served from memory, so crawler traffic never becomes Hive traffic.
 */
const handler = require('../../../api/sitemap-posts')
const fs = require('fs')
const path = require('path')

const { recentPosts, buildXml, currentXml, reset, setPost, constants } = handler._test
const NOW = Date.parse('2026-11-10T12:00:00Z')
const hoursAgo = (h) => new Date(NOW - h * 3600 * 1000).toISOString().slice(0, 19)

// A fake bridge: `posts` newest first, paged the way get_ranked_posts pages
// (the next page starts with the last post of the previous one).
function fakeHive (posts, { failNodes = [] } = {}) {
  const calls = []
  setPost(async (url, body) => {
    calls.push(url)
    if (failNodes.includes(url)) throw new Error('down')
    const { start_author: a, start_permlink: p, limit } = body.params
    const from = a ? posts.findIndex((x) => x.author === a && x.permlink === p) : 0
    return { data: { result: posts.slice(from, from + limit) } }
  })
  return calls
}

const post = (author, permlink, h, extra) => Object.assign({ author, permlink, created: hoursAgo(h), updated: hoursAgo(h) }, extra)

beforeEach(() => reset())

describe('recentPosts', () => {
  it('pages through the bridge and stops at the age limit', async () => {
    const posts = []
    for (let i = 0; i < 50; i++) posts.push(post('user' + (i % 7), 'p' + i, i * 4)) // one every 4 h
    fakeHive(posts)
    const got = await recentPosts(NOW)
    // 7 days = 168 h: posts at 0..168 h
    expect(got.map((p) => p.permlink)).toEqual(posts.filter((p, i) => i * 4 <= 168).map((p) => p.permlink))
  })

  it('leaves out hidden and greyed-out posts and names that are not Hive names', async () => {
    fakeHive([
      post('alice', 'ok', 1),
      post('bob', 'muted', 2, { stats: { gray: true } }),
      post('carl', 'hidden', 3, { stats: { hide: true } }),
      post('Evil<x>', 'p', 4),
      post('dave', 'bad/permlink', 5),
    ])
    expect((await recentPosts(NOW)).map((p) => p.permlink)).toEqual(['ok'])
  })

  it('stops at the post cap', async () => {
    const posts = []
    for (let i = 0; i < constants.MAX_POSTS + 50; i++) posts.push(post('u' + (i % 30), 'p' + i, 0.01 * i))
    fakeHive(posts)
    expect((await recentPosts(NOW)).length).toBe(constants.MAX_POSTS)
  })

  it('falls back to the second node when the first fails', async () => {
    const calls = fakeHive([post('alice', 'ok', 1)], { failNodes: ['https://hiveapi.actifit.io'] })
    expect((await recentPosts(NOW)).length).toBe(1)
    expect(calls).toContain('https://api.hive.blog')
  })
})

describe('buildXml', () => {
  it('lists each post and each author once, with dates', () => {
    const xml = buildXml([post('alice', 'two', 1), post('alice', 'one', 30), post('bob', 'b', 2)])
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/)
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs).toEqual([
      'https://actifit.io/@alice/two', 'https://actifit.io/@alice/one', 'https://actifit.io/@bob/b',
      'https://actifit.io/@alice', 'https://actifit.io/@bob',
    ])
    expect(xml).toContain('<lastmod>2026-11-10</lastmod>')
    expect(xml).toContain('<lastmod>2026-11-09</lastmod>')
  })
})

describe('serving', () => {
  const res = () => {
    const r = { headers: {}, statusCode: 0, body: undefined }
    r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v }
    r.end = (b) => { r.body = b }
    return r
  }

  it('builds once, then answers from memory until the hour is up', async () => {
    const calls = fakeHive([post('alice', 'ok', 1)])
    expect(await currentXml(NOW)).toContain('/@alice/ok')
    const n = calls.length
    await currentXml(NOW + constants.TTL_MS - 1000)
    expect(calls.length).toBe(n)
    await currentXml(NOW + constants.TTL_MS + 1000)
    // a rebuild runs in the background; the old copy is served meanwhile
    await new Promise((r) => setTimeout(r, 0))
    expect(calls.length).toBeGreaterThan(n)
  })

  it('concurrent first requests share one build', async () => {
    const calls = fakeHive([post('alice', 'ok', 1)])
    const [a, b] = await Promise.all([currentXml(NOW), currentXml(NOW)])
    expect(a).toBe(b)
    expect(calls.length).toBe(1)
  })

  it('keeps serving the last good copy when Hive fails', async () => {
    fakeHive([post('alice', 'ok', 1)])
    const good = await currentXml(NOW)
    fakeHive([], { failNodes: ['https://hiveapi.actifit.io', 'https://api.hive.blog'] })
    jest.spyOn(console, 'log').mockImplementation(() => {})
    await currentXml(NOW + constants.TTL_MS + 1) // rebuild fails in the background
    await new Promise((r) => setTimeout(r, 0))
    expect(await currentXml(NOW + constants.TTL_MS + 2)).toBe(good)
    console.log.mockRestore()
  })

  it('answers 503 with Retry-After when nothing has been built and Hive is down', async () => {
    fakeHive([], { failNodes: ['https://hiveapi.actifit.io', 'https://api.hive.blog'] })
    jest.spyOn(console, 'log').mockImplementation(() => {})
    const r = res()
    await handler({ method: 'GET' }, r)
    expect(r.statusCode).toBe(503)
    expect(r.headers['retry-after']).toBeTruthy()
    console.log.mockRestore()
  })

  it('serves XML with an hour of caching', async () => {
    fakeHive([post('alice', 'ok', 1)])
    const r = res()
    await handler({ method: 'GET' }, r)
    expect(r.statusCode).toBe(200)
    expect(r.headers['content-type']).toBe('application/xml; charset=utf-8')
    expect(r.headers['cache-control']).toBe('public, max-age=3600')
    expect(r.body).toContain('<urlset')
  })

  it('refuses other methods', async () => {
    const r = res()
    await handler({ method: 'POST' }, r)
    expect(r.statusCode).toBe(405)
  })
})

describe('wiring', () => {
  const root = path.resolve(__dirname, '../../..')
  it('is registered as server middleware and listed in robots.txt', () => {
    expect(fs.readFileSync(path.join(root, 'nuxt.config.js'), 'utf8'))
      .toMatch(/\{ path: '\/sitemap-posts\.xml', handler: '~\/api\/sitemap-posts\.js' \}/)
    const robots = fs.readFileSync(path.join(root, 'static/robots.txt'), 'utf8')
    expect(robots).toMatch(/^Sitemap: https:\/\/actifit\.io\/sitemap-posts\.xml$/m)
    expect(robots).toMatch(/^Allow: \/sitemap-posts\.xml$/m) // Applebot's allow-list
  })
})
