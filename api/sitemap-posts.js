/**
 * GET /sitemap-posts.xml - the Actifit community's recent posts and their authors'
 * profiles, for search engines.
 *
 * static/sitemap.xml lists only the 16 fixed pages, so crawlers found posts and
 * profiles only by following links (the 2026-10-30 SEO audit's "orphans" item).
 *
 * Built from Hive (bridge.get_ranked_posts, newest first, 20 a page) at most once an
 * hour and kept in memory; every request is answered from that copy at once, so crawler
 * traffic never turns into Hive traffic and never waits on a build. A build is about 35
 * pages (~145 KB each, the bridge returns whole bodies) and has a hard deadline. If it
 * fails the last good copy is served; with none yet, a 503 asks the crawler to come
 * back later. The first build runs shortly after the server starts.
 */
const axios = require('axios')

const SITE = 'https://actifit.io'
const COMMUNITY = 'hive-193552'
const NODES = ['https://hiveapi.actifit.io', 'https://api.hive.blog']
const DAYS = 7
const MAX_POSTS = 1000
const PAGE_SIZE = 20 // the bridge's maximum
// pages after the first repeat one post, so each adds PAGE_SIZE - 1
const MAX_PAGES = 1 + Math.ceil((MAX_POSTS - PAGE_SIZE) / (PAGE_SIZE - 1))
const TTL_MS = 60 * 60 * 1000
const RETRY_MS = 5 * 60 * 1000 // after a failed build, before trying Hive again
const CALL_MS = 15 * 1000 // one bridge call, start to finish
const BUILD_MS = 90 * 1000 // a whole build

const http = axios.create({ maxContentLength: 5 * 1024 * 1024 })
// axios's `timeout` only bounds the gap between packets on Node, so a node that trickles
// data could hold a call open indefinitely: abort at a hard deadline instead.
// (A manual AbortController: production runs Node 16, which lacks AbortSignal.timeout.)
let post = async (url, body) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CALL_MS)
  try { return await http.post(url, body, { signal: controller.signal }) } finally { clearTimeout(timer) }
}

const escapeXml = (s) => String(s).replace(/[<>&'"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))

// Hive account names (3-16 chars) and permlinks: anything else is not linked.
const SAFE_NAME = /^[a-z][a-z0-9.-]{1,14}[a-z0-9]$/
const SAFE_PERMLINK = /^[a-z0-9-]{1,255}$/
const time = (t) => (typeof t === 'string' ? Date.parse(t + 'Z') : NaN) // the bridge's UTC, no Z

async function rankedPage (start) {
  const params = { sort: 'created', tag: COMMUNITY, limit: PAGE_SIZE }
  if (start) { params.start_author = start.author; params.start_permlink = start.permlink }
  let lastErr
  for (const node of NODES) {
    try {
      const { data } = await post(node, { jsonrpc: '2.0', method: 'bridge.get_ranked_posts', params, id: 1 })
      if (data && Array.isArray(data.result)) return data.result
      lastErr = new Error((data && data.error && data.error.message) || 'no result')
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

// Posts from the last DAYS days, newest first, at most MAX_POSTS, as
// {author, permlink, created, updated} (times in ms). Pinned posts (listed first,
// whatever their age), hidden and greyed-out (muted or downvoted) posts, and malformed
// items are left out.
async function recentPosts (now = Date.now(), deadline = Date.now() + BUILD_MS) {
  const since = now - DAYS * 24 * 60 * 60 * 1000
  const out = []
  let start = null
  for (let i = 0; i < MAX_PAGES && out.length < MAX_POSTS; i++) {
    if (Date.now() > deadline) throw new Error('build deadline passed')
    const raw = await rankedPage(start)
    // a page starts with the post the previous one ended on
    const page = start ? raw.slice(1) : raw
    if (!page.length) break
    for (const p of page) {
      if (!p || typeof p !== 'object') continue
      const stats = p.stats || {}
      if (stats.is_pinned) continue
      const created = time(p.created)
      if (!Number.isFinite(created)) continue
      if (created < since) return out
      if (stats.hide || stats.gray) continue
      if (!SAFE_NAME.test(p.author) || !SAFE_PERMLINK.test(p.permlink)) continue
      const updated = time(p.updated)
      out.push({ author: p.author, permlink: p.permlink, created, updated: Number.isFinite(updated) ? updated : created })
      if (out.length >= MAX_POSTS) return out
    }
    if (raw.length < PAGE_SIZE) break // the bridge has no more
    const last = raw[raw.length - 1]
    if (!last || typeof last.author !== 'string' || typeof last.permlink !== 'string') break
    start = { author: last.author, permlink: last.permlink }
  }
  return out
}

function buildXml (posts) {
  const day = (ms) => new Date(ms).toISOString().slice(0, 10)
  const urls = []
  const authors = new Map() // author -> their newest post's date (posts are newest first)
  for (const p of posts) {
    urls.push(`  <url><loc>${SITE}/@${escapeXml(p.author)}/${escapeXml(p.permlink)}</loc><lastmod>${day(p.updated)}</lastmod></url>`)
    if (!authors.has(p.author)) authors.set(p.author, day(p.created))
  }
  for (const [author, lastmod] of authors) {
    urls.push(`  <url><loc>${SITE}/@${escapeXml(author)}</loc><lastmod>${lastmod}</lastmod></url>`)
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n'
}

let cache = { xml: null, builtAt: 0, failedAt: 0 }
let building = null

// Starts a build when one is due; never waits for it. The returned promise never rejects.
function startBuildIfDue (now) {
  if (building) return building
  const fresh = cache.xml && now - cache.builtAt < TTL_MS
  const coolingDown = now - cache.failedAt < RETRY_MS
  if (fresh || coolingDown) return null
  building = recentPosts(now)
    .then((posts) => { cache = { xml: buildXml(posts), builtAt: now, failedAt: 0 } })
    .catch((err) => {
      console.log('sitemap-posts: build failed - ' + (err && err.message))
      cache.failedAt = now
    })
    .finally(() => { building = null })
  return building
}

// What to serve right now: the last good copy, or null while there is none.
function currentXml (now = Date.now()) {
  startBuildIfDue(now)
  return cache.xml
}

function handler (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    return res.end()
  }
  const xml = currentXml()
  if (!xml) {
    res.statusCode = 503
    res.setHeader('Retry-After', '600')
    return res.end()
  }
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.end(req.method === 'HEAD' ? undefined : xml)
}

// Build once shortly after the server starts, so the first crawler finds a copy.
if (process.env.NODE_ENV !== 'test') {
  const warm = setTimeout(() => startBuildIfDue(Date.now()), 30 * 1000)
  if (warm.unref) warm.unref()
}

module.exports = handler
module.exports._test = {
  recentPosts, buildXml, currentXml, startBuildIfDue,
  // the build currently running, if any (tests wait on it)
  whenBuilt: () => building || Promise.resolve(),
  reset: () => { cache = { xml: null, builtAt: 0, failedAt: 0 }; building = null },
  setPost: (fn) => { post = fn },
  constants: { DAYS, MAX_POSTS, TTL_MS, RETRY_MS, BUILD_MS },
}
