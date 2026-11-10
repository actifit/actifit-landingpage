/**
 * /sitemap-posts.xml: the Actifit community's recent posts and their authors, built from
 * Hive at most hourly and served from memory, so crawler traffic never becomes Hive
 * traffic and never waits on a build.
 */
const handler = require('../../../api/sitemap-posts')
const fs = require('fs')
const path = require('path')

const { recentPosts, buildXml, currentXml, whenBuilt, reset, setPost, constants } = handler._test
const NOW = Date.parse('2026-11-10T12:00:00Z')
const hoursAgo = (h) => new Date(NOW - h * 3600 * 1000).toISOString().slice(0, 19)
const BOTH_NODES = ['https://hiveapi.actifit.io', 'https://api.hive.blog']

// A fake bridge: `posts` newest first, paged the way get_ranked_posts pages: the next
// page starts AFTER the start post (checked live). `overlap` mimics condenser-style
// paging, which repeats it.
function fakeHive (posts, { failNodes = [], overlap = false } = {}) {
  const calls = []
  setPost(async (url, body) => {
    calls.push(url)
    if (failNodes.includes(url)) throw new Error('down')
    const { start_author: a, start_permlink: p, limit } = body.params
    const from = a ? posts.findIndex((x) => x && x.author === a && x.permlink === p) + (overlap ? 0 : 1) : 0
    return { data: { result: posts.slice(from, from + limit) } }
  })
  return calls
}

const post = (author, permlink, h, extra) => Object.assign({ author, permlink, created: hoursAgo(h), updated: hoursAgo(h) }, extra)

// Serve once to start a build, wait for it, serve again.
const built = async (now = NOW) => { currentXml(now); await whenBuilt(); return currentXml(now) }

beforeEach(() => reset())
// a build left running would write into the next test's cache
afterEach(async () => { await whenBuilt(); jest.restoreAllMocks() })

describe('recentPosts', () => {
  it('pages through the bridge and stops at the age limit', async () => {
    const posts = []
    for (let i = 0; i < 50; i++) posts.push(post('user' + (i % 7), 'p' + i, i * 4)) // one every 4 h
    fakeHive(posts)
    const got = await recentPosts(NOW)
    // 7 days = 168 h: posts at 0..168 h
    expect(got.map((p) => p.permlink)).toEqual(posts.filter((p, i) => i * 4 <= 168).map((p) => p.permlink))
  })

  it('lists every post once across pages, without dropping the page boundaries', async () => {
    // slicing off a "repeated" first item dropped one real post per page (~35 a build)
    const posts = []
    for (let i = 0; i < 95; i++) posts.push(post('user' + (i % 9), 'p' + i, i))
    fakeHive(posts)
    expect((await recentPosts(NOW)).map((p) => p.permlink)).toEqual(posts.map((p) => p.permlink))
    reset()
    fakeHive(posts, { overlap: true }) // a node that does repeat the start post
    expect((await recentPosts(NOW)).map((p) => p.permlink)).toEqual(posts.map((p) => p.permlink))
  })

  it('skips old pinned posts, which the bridge lists first whatever their age, and keeps recent ones', async () => {
    // an old pinned post first used to end the walk at once: an empty sitemap, every hour
    fakeHive([
      post('mod', 'rules', 24 * 60, { stats: { is_pinned: true } }),
      post('mod', 'event', 5, { stats: { is_pinned: true } }),
      post('alice', 'today', 1),
      post('mod', 'event', 5), // the pinned post again, in its date position
    ])
    expect((await recentPosts(NOW)).map((p) => p.permlink)).toEqual(['event', 'today'])
  })

  it('leaves out hidden and greyed-out posts and names that are not Hive names', async () => {
    fakeHive([
      post('alice', 'ok', 1),
      post('bob', 'muted', 2, { stats: { gray: true } }),
      post('carl', 'hidden', 3, { stats: { hide: true } }),
      post('Evil<x>', 'p', 4),
      post('dave', 'bad/permlink', 5),
      post('ab', 'too-short-name', 6),
    ])
    expect((await recentPosts(NOW)).map((p) => p.permlink)).toEqual(['ok'])
  })

  it('a malformed item is skipped, not fatal to the build', async () => {
    fakeHive([null, 'x', post('alice', 'no-date', 1, { created: undefined }), post('bob', 'bad-date', 1, { created: 'soon' }),
      post('carl', 'ok', 2), post('dave', 'no-updated', 3, { updated: undefined })])
    const got = await recentPosts(NOW)
    expect(got.map((p) => p.permlink)).toEqual(['ok', 'no-updated'])
    expect(got[1].updated).toBe(got[1].created)
    expect(() => buildXml(got)).not.toThrow()
  })

  it('keeps only the fields it needs (the bridge sends whole bodies), with the edit time', async () => {
    fakeHive([post('alice', 'ok', 30, { updated: hoursAgo(2), body: 'x'.repeat(1000), json_metadata: '{}' })])
    const [p] = await recentPosts(NOW)
    expect(Object.keys(p).sort()).toEqual(['author', 'created', 'permlink', 'updated'])
    expect(p.updated).toBe(Date.parse(hoursAgo(2) + 'Z'))
    expect(p.created).toBe(Date.parse(hoursAgo(30) + 'Z'))
  })

  it('stops at the post cap', async () => {
    const posts = []
    for (let i = 0; i < constants.MAX_POSTS + 50; i++) posts.push(post('user' + (i % 30), 'p' + i, 0.01 * i))
    fakeHive(posts)
    expect((await recentPosts(NOW)).length).toBe(constants.MAX_POSTS)
  })

  it('falls back to the second node when the first fails', async () => {
    const calls = fakeHive([post('alice', 'ok', 1)], { failNodes: [BOTH_NODES[0]] })
    expect((await recentPosts(NOW)).length).toBe(1)
    expect(calls).toContain(BOTH_NODES[1])
  })

  it('gives up at the build deadline', async () => {
    fakeHive([post('alice', 'ok', 1)])
    await expect(recentPosts(NOW, Date.now() - 1)).rejects.toThrow(/deadline/)
  })
})

describe('buildXml', () => {
  it('lists each post and each author once, with dates', () => {
    const t = (h) => Date.parse(hoursAgo(h) + 'Z')
    const xml = buildXml([
      { author: 'alice', permlink: 'two', created: t(30), updated: t(1) },
      { author: 'alice', permlink: 'one', created: t(40), updated: t(40) },
      { author: 'bob', permlink: 'b', created: t(2), updated: t(2) },
    ])
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/)
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1] + ' ' + m[2])
    expect(urls).toEqual([
      'https://actifit.io/@alice/two 2026-11-10', // edited: lastmod is the edit
      'https://actifit.io/@alice/one 2026-11-08',
      'https://actifit.io/@bob/b 2026-11-10',
      'https://actifit.io/@alice 2026-11-09', // the author's newest post
      'https://actifit.io/@bob 2026-11-10',
    ])
  })
})

describe('serving', () => {
  const res = () => {
    const r = { headers: {}, statusCode: 0, body: 'unset' }
    r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v }
    r.end = (b) => { r.body = b }
    return r
  }
  const quiet = () => jest.spyOn(console, 'log').mockImplementation(() => {})

  it('never waits for a build: 503 at once while there is no copy yet', () => {
    fakeHive([post('alice', 'ok', 1)])
    const r = res()
    handler({ method: 'GET' }, r)
    expect(r.statusCode).toBe(503)
    expect(r.headers['retry-after']).toBeTruthy()
  })

  it('builds once, then answers from memory until the hour is up', async () => {
    const calls = fakeHive([post('alice', 'ok', 1)])
    expect(await built()).toContain('/@alice/ok')
    const n = calls.length
    currentXml(NOW + constants.TTL_MS - 1000)
    await whenBuilt()
    expect(calls.length).toBe(n)
  })

  it('serves the old copy immediately while an hourly rebuild runs', async () => {
    fakeHive([post('alice', 'ok', 1)])
    const old = await built()
    let release
    setPost(() => new Promise((resolve) => { release = () => resolve({ data: { result: [post('bob', 'new', 1)] } }) }))
    expect(currentXml(NOW + constants.TTL_MS + 1)).toBe(old) // the rebuild is pending
    release()
    await whenBuilt()
    expect(currentXml(NOW + constants.TTL_MS + 2)).toContain('/@bob/new')
  })

  it('concurrent requests share one build', async () => {
    const calls = fakeHive([post('alice', 'ok', 1)])
    currentXml(NOW); currentXml(NOW); currentXml(NOW)
    await whenBuilt()
    expect(calls.length).toBe(1)
  })

  it('keeps serving the last good copy when Hive fails, and waits before retrying', async () => {
    fakeHive([post('alice', 'ok', 1)])
    const good = await built()
    quiet()
    const calls = fakeHive([], { failNodes: BOTH_NODES })
    const failAt = NOW + constants.TTL_MS + 1
    currentXml(failAt)
    await whenBuilt()
    expect(currentXml(failAt + 1000)).toBe(good)
    await whenBuilt()
    const n = calls.length
    currentXml(failAt + constants.RETRY_MS - 1000) // cooling down: no new Hive calls
    await whenBuilt()
    expect(calls.length).toBe(n)
    currentXml(failAt + constants.RETRY_MS + 1000) // then it tries again
    await whenBuilt()
    expect(calls.length).toBeGreaterThan(n)
  })

  it('serves XML with an hour of caching, and no body to HEAD', async () => {
    fakeHive([post('alice', 'ok', 1)])
    await built(Date.now())
    const r = res()
    handler({ method: 'GET' }, r)
    expect(r.statusCode).toBe(200)
    expect(r.headers['content-type']).toBe('application/xml; charset=utf-8')
    expect(r.headers['cache-control']).toBe('public, max-age=3600')
    expect(r.body).toContain('<urlset')
    const h = res()
    handler({ method: 'HEAD' }, h)
    expect(h.statusCode).toBe(200)
    expect(h.body).toBeUndefined()
  })

  it('refuses other methods', () => {
    const r = res()
    handler({ method: 'POST' }, r)
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
