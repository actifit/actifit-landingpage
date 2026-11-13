/**
 * Edge-cacheability headers for anonymous, server-rendered HTML.
 *
 * WHY THIS IS SAFE HERE, and the one thing to re-check before widening it:
 *
 * Actifit keeps its entire session in localStorage - `access_token`, `expires`
 * and `key` (see plugins/vue-custom.js). It sets no auth cookie. localStorage is
 * never transmitted with an HTTP request, so the server genuinely cannot tell one
 * visitor from another: the SSR output for a given URL is byte-identical for
 * everyone, logged in or not. All personalisation happens client-side after
 * hydration, which is also why /userrank and /referrals render an empty container
 * to a logged-out crawler.
 *
 * That makes shared (CDN) caching of this HTML safe. If an auth COOKIE is ever
 * introduced, this assumption dies and this middleware must be revisited - a
 * shared cache would then be able to hand one member's rendered page to another.
 *
 * WHY IT IS WORTH DOING: every request currently triggers a fresh SSR render,
 * each one blocking on upstream Hive calls. The DO CDN metrics during the
 * 2026-09-28/29 incident showed nearly 100% cache MISS, so a bot crawl of
 * nonexistent post URLs cost one full render each - which is what exhausted the
 * V8 heap and crash-looped the container. Caching the anonymous HTML means a
 * repeat crawl of the same URL is answered at the edge and never reaches Node.
 *
 * ALLOWLIST, NOT DENYLIST. Only routes known to be impersonal are marked
 * cacheable. Anything not matched here is left untouched and keeps whatever
 * headers Nuxt already sends. A denylist would silently start caching any new
 * personalised route somebody adds later.
 */

// Exact public routes with no per-visitor content.
const CACHEABLE_EXACT = new Set([
  '/',
  '/leaderboard',
  '/explore',
  '/communities',
  '/activity',
  '/delegators',
  '/proposals',
  '/consultants',
  '/faq',
  '/market',
  '/yieldfarming',
  '/privacy-policy',
  '/terms-conditions',
  '/conduct',
]);

// Post pages: /@author/permlink and /tag/@author/permlink. These are the single
// most valuable thing to cache - they are what the bot crawl walks, and each one
// costs a Hive getContent at render time.
const POST_RE = /^\/(?:[a-z0-9-]+\/)?@[a-z0-9.-]{3,16}\/[a-z0-9-]+\/?$/i;

// Never cacheable, even if a pattern above would otherwise match. /actifit-api/
// and the other proxy prefixes carry live API data; caching those at the edge
// would serve stale balances and, worse, pin one response for every caller.
const NEVER = [
  '/actifit-api/',
  '/hive-engine/',
  '/steem-api/',
  '/steem-scot/',
  '/api/',
  '/_nuxt/',
  '/wallet',
  '/settings',
  '/notifications',
  '/login',
  '/auth',
  '/signup',
  '/password',
  '/userrank',
  '/referrals',
  '/mods-access',
  '/search',
  '/transaction-success',
];

// 60s at the edge is enough to absorb a crawl burst while keeping leaderboards
// and feeds visibly live. stale-while-revalidate lets the edge serve the slightly
// stale copy during the revalidate, so a cache expiry never costs a visitor a
// full SSR wait. max-age=0 keeps BROWSERS from caching, so a member navigating
// the site still sees fresh content immediately after acting.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';

function isCacheable(pathname) {
  if (NEVER.some((p) => pathname === p || pathname.startsWith(p))) return false;
  if (CACHEABLE_EXACT.has(pathname)) return true;
  return POST_RE.test(pathname);
}

module.exports = function cacheHeaders(req, res, next) {
  // Only idempotent reads. A POST/PUT must never be treated as cacheable.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  // Anything carrying a query string is left alone. The intent is conservative
  // rather than clever: an unknown ?param may select different content, and a CDN
  // configured to ignore query strings would then serve the wrong variant to
  // everybody. The traffic worth caching - post URLs and the public listings - is
  // requested bare, so excluding query strings costs essentially nothing.
  const url = req.url || '';
  if (url.indexOf('?') !== -1) return next();
  const pathname = url;

  if (!isCacheable(pathname)) return next();

  res.setHeader('Cache-Control', CACHE_CONTROL);
  // Content negotiation happens on these, so a shared cache must key on them or
  // it will hand a gzipped body to a client that cannot read it, or the wrong
  // language to the wrong visitor.
  res.setHeader('Vary', 'Accept-Encoding, Accept-Language');
  return next();
};
