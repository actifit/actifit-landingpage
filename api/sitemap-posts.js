/**
 * GET /sitemap-posts.xml - the Actifit community's recent posts and their authors'
 * profiles, for search engines.
 *
 * static/sitemap.xml lists only the 16 fixed pages, so crawlers found posts and
 * profiles only by following links (the 2026-10-30 SEO audit's "orphans" item).
 *
 * Built from Hive (bridge.get_ranked_posts, newest first, 20 a page) at most once an
 * hour and kept in memory; every other request is answered from that copy, so crawler
 * traffic never turns into Hive traffic. One build costs about 35 small calls. If a
 * build fails the last good copy is served; with none yet, a 503 asks the crawler to
 * come back later.
 */
const axios = require('axios')

const SITE = 'https://actifit.io'
const COMMUNITY = 'hive-193552'
const NODES = ['https://hiveapi.actifit.io', 'https://api.hive.blog']
const DAYS = 7
const MAX_POSTS = 1000
const PAGE_SIZE = 20 // the bridge's maximum
// pages after the first repeat one post, so each adds PAGE_SIZE - 1
const MAX_PAGES = Math.ceil(MAX_POSTS / (PAGE_SIZE - 1)) + 1
const TTL_MS = 60 * 60 * 1000
const RETRY_MS = 5 * 60 * 1000 // after a failed build, before trying Hive again

const http = axios.create({ timeout: 10000, maxContentLength: 5 * 1024 * 1024 })
let post = (url, body) => http.post(url, body) // replaced in tests

const escapeXml = (s) => String(s).replace(/[<>&'"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))

// Hive names and permlinks: anything else is not linked.
const SAFE_NAME = /^[a-z0-9][a-z0-9.-]{1,15}$/
const SAFE_PERMLINK = /^[a-z0-9-]{1,255}$/

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

// Posts from the last DAYS days, newest first, at most MAX_POSTS. Hidden and greyed-out
// (muted or downvoted) posts are left out.
async function recentPosts (now = Date.now()) {
  const since = now - DAYS * 24 * 60 * 60 * 1000
  const out = []
  let start = null
  for (let i = 0; i < MAX_PAGES && out.length < MAX_POSTS; i++) {
    const raw = await rankedPage(start)
    // a page starts with the post the previous one ended on
    const page = start ? raw.slice(1) : raw
    if (!page.length) break
    for (const p of page) {
      if (Date.parse(p.created + 'Z') < since) return out
      const hidden = p.stats && (p.stats.hide || p.stats.gray)
      if (!hidden && SAFE_NAME.test(p.author) && SAFE_PERMLINK.test(p.permlink)) out.push(p)
      if (out.length >= MAX_POSTS) return out
    }
    if (raw.length < PAGE_SIZE) break // the bridge has no more
    const last = page[page.length - 1]
    start = { author: last.author, permlink: last.permlink }
  }
  return out
}

function buildXml (posts) {
  const day = (t) => new Date(Date.parse(t + 'Z')).toISOString().slice(0, 10)
  const urls = []
  const authors = new Map() // author -> their newest post's date (posts are newest first)
  for (const p of posts) {
    urls.push(`  <url><loc>${SITE}/@${escapeXml(p.author)}/${escapeXml(p.permlink)}</loc><lastmod>${day(p.updated || p.created)}</lastmod></url>`)
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

async function currentXml (now = Date.now()) {
  // a build already running: wait for it only when there is nothing to serve yet
  if (building) return cache.xml || building
  const fresh = cache.xml && now - cache.builtAt < TTL_MS
  const coolingDown = now - cache.failedAt < RETRY_MS
  if (fresh || coolingDown) return cache.xml
  building = recentPosts(now)
    .then((posts) => {
      cache = { xml: buildXml(posts), builtAt: now, failedAt: 0 }
      return cache.xml
    })
    .catch((err) => {
      console.log('sitemap-posts: build failed - ' + (err && err.message))
      cache.failedAt = now
      return cache.xml
    })
    .finally(() => { building = null })
  return cache.xml || building
}

async function handler (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    return res.end()
  }
  let xml = null
  try { xml = await currentXml() } catch (_) { /* answered as unavailable below */ }
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

// A build takes ~35 s, too long to make the first crawler wait: build once shortly
// after the server starts.
if (process.env.NODE_ENV !== 'test') {
  const warm = setTimeout(() => { currentXml().catch(() => {}) }, 30 * 1000)
  if (warm.unref) warm.unref()
}

module.exports = handler
module.exports._test = {
  recentPosts, buildXml, currentXml,
  reset: () => { cache = { xml: null, builtAt: 0, failedAt: 0 }; building = null },
  setPost: (fn) => { post = fn },
  constants: { DAYS, MAX_POSTS, TTL_MS, RETRY_MS },
}
