// One request per URL, shared by every component that asks for it.
//
// Every post card, comment and modal fetched /moderators, /getRank/<author> and
// /getPostReward for itself. A scrolled feed sent about three API calls per card, the
// same moderator list hundreds of times, and on 2026-10-29 the API ran out of
// connections - which is what made logins time out. Callers asking for the same URL
// now get the same promise, and its answer is reused for a short while.
//
// Only successful answers are kept. A failed or non-2xx request is dropped at once, so
// one bad moment does not hide the data until the TTL runs out.

const DEFAULT_TTL_MS = 5 * 60 * 1000
const MAX_ENTRIES = 500

const cache = new Map()

export function fetchJsonShared (url, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now()
  const hit = cache.get(url)
  if (hit && now - hit.at < ttlMs) return hit.promise

  const promise = fetch(url).then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return res.json()
  })
  const forget = () => {
    const current = cache.get(url)
    if (current && current.promise === promise) cache.delete(url)
  }
  promise.catch(forget)

  cache.delete(url) // re-insert at the end: eviction drops the earliest-fetched entry
  cache.set(url, { promise, at: now })
  if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value)
  return promise
}

export function clearSharedFetchCache () {
  cache.clear()
}
