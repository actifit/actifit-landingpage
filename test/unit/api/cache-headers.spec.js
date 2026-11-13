/**
 * Guard for the edge-cache middleware.
 *
 * The failure mode this protects against is not "a page is slow" but "a shared
 * cache served the wrong thing". The middleware is an ALLOWLIST precisely so a
 * new personalised route cannot silently become cacheable; these tests fail if
 * someone widens it carelessly, and in particular if any proxy prefix or
 * signed-in route ever starts emitting Cache-Control.
 */
const cacheHeaders = require('../../../api/cache-headers')

const run = (url, method = 'GET') => {
  const headers = {}
  const res = { setHeader: (k, v) => { headers[k] = v } }
  let nextCalled = false
  cacheHeaders({ url, method }, res, () => { nextCalled = true })
  return { headers, nextCalled }
}

const cacheControlOf = (url, method) => run(url, method).headers['Cache-Control']

describe('api/cache-headers', () => {
  test('always calls next() so it can never swallow a request', () => {
    for (const url of ['/', '/leaderboard', '/actifit-api/hivePrice', '/wallet', '/nope']) {
      expect(run(url).nextCalled).toBe(true)
    }
  })

  describe('cacheable', () => {
    const PUBLIC = [
      '/', '/leaderboard', '/explore', '/communities', '/activity',
      '/delegators', '/proposals', '/consultants', '/faq', '/market',
      '/yieldfarming', '/privacy-policy', '/terms-conditions', '/conduct',
    ]
    test.each(PUBLIC)('public route %s is cacheable', (url) => {
      expect(cacheControlOf(url)).toContain('s-maxage=60')
    })

    // The single most valuable thing to cache: the bot crawl walks post URLs,
    // and each one costs a Hive getContent at render time.
    test.each([
      '/@actifit/some-post-permlink',
      '/@actifit/some-post-permlink/',
      '/fitness/@actifit/some-post-permlink',
    ])('post page %s is cacheable', (url) => {
      expect(cacheControlOf(url)).toContain('s-maxage=60')
    })

    test('sets Vary so the edge keys on encoding and language', () => {
      expect(run('/leaderboard').headers.Vary).toBe('Accept-Encoding, Accept-Language')
    })

    test('max-age=0 keeps BROWSERS from caching, so a member sees fresh content', () => {
      expect(cacheControlOf('/')).toContain('max-age=0')
    })
  })

  describe('never cacheable', () => {
    // Live API data. Caching these would serve stale balances and pin one
    // response for every caller.
    test.each([
      '/actifit-api/hivePrice',
      '/hive-engine/contracts',
      '/steem-api/anything',
      '/steem-scot/anything',
      '/api/proxy',
    ])('proxy path %s is never cached', (url) => {
      expect(cacheControlOf(url)).toBeUndefined()
    })

    // Signed-in or per-visitor surfaces.
    test.each([
      '/wallet', '/settings', '/notifications', '/login', '/auth',
      '/signup', '/password', '/userrank', '/referrals', '/mods-access',
      '/search', '/transaction-success',
    ])('personalised route %s is never cached', (url) => {
      expect(cacheControlOf(url)).toBeUndefined()
    })

    test('a route not on the allowlist is left untouched', () => {
      expect(cacheControlOf('/some-future-route')).toBeUndefined()
    })

    test('query strings are not cached even on an otherwise cacheable path', () => {
      // An unknown ?param could select different content; caching it under the
      // bare path would serve the wrong variant.
      expect(cacheControlOf('/wallet?action=delegate')).toBeUndefined()
      expect(cacheControlOf('/explore?sort=trending')).toBeUndefined()
    })

    test.each(['POST', 'PUT', 'DELETE', 'PATCH'])('%s is never cached', (method) => {
      expect(cacheControlOf('/leaderboard', method)).toBeUndefined()
    })

    test('HEAD is treated like GET', () => {
      expect(cacheControlOf('/leaderboard', 'HEAD')).toContain('s-maxage=60')
    })

    test('a prefix collision does not accidentally cache a private route', () => {
      // /wallet is excluded by prefix, so anything beneath it is too.
      expect(cacheControlOf('/wallet/history')).toBeUndefined()
    })
  })
})
