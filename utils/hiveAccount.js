/**
 * Does a Hive account exist? Used to answer an unknown profile URL with a real 404.
 *
 * Returns true or false only when the answer is certain, and null when it is not
 * (node down, slow, rate-limited, odd reply). Callers must treat null as "render the
 * page normally": a network problem must never turn a real profile into a 404.
 */

// Hive's own rule (protocol is_valid_account_name): 3-16 characters, dot-separated
// labels of 3+ characters, each starting with a letter and ending with a letter or
// digit, with only lowercase letters, digits and hyphens. A name that fails this
// cannot exist, so no lookup is needed - and the node rejects it with an error
// rather than an empty result anyway.
export function isValidHiveAccountName (name) {
  if (typeof name !== 'string' || name.length < 3 || name.length > 16) return false
  return name.split('.').every(label => /^[a-z][a-z0-9-]*[a-z0-9]$/.test(label) && label.length >= 3)
}

const LOOKUP_TIMEOUT_MS = 4000

// Definite answers (true/false) are remembered for a while, so a crawler walking the
// same unknown URLs does not cost a node call each time. Unknown (null) is not cached.
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX = 500
const cache = new Map() // name -> { exists, at }

export function clearHiveAccountCache () {
  cache.clear()
}

function remember (name, exists, now) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value) // oldest first
  cache.set(name, { exists, at: now })
}

export async function hiveAccountExists (name, { node, fetchImpl = (typeof fetch === 'function' ? fetch : undefined), timeoutMs = LOOKUP_TIMEOUT_MS, now = Date.now() } = {}) {
  if (!isValidHiveAccountName(name)) return false
  const hit = cache.get(name)
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.exists
  if (hit) cache.delete(name)
  if (!node || typeof fetchImpl !== 'function') return null
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  let timer
  try {
    const lookup = fetchImpl(node, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'condenser_api.get_accounts', params: [[name]], id: 1 }),
      signal: controller ? controller.signal : undefined
    }).then(async (res) => {
      if (!res.ok) return null
      const json = await res.json()
      if (!json || !Array.isArray(json.result)) return null
      return json.result.some(a => a && a.name === name)
    })
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => {
        if (controller) controller.abort() // do not leave the request running
        resolve(null)
      }, timeoutMs)
    })
    const exists = await Promise.race([lookup, timeout])
    if (exists !== null) remember(name, exists, now)
    return exists
  } catch (e) {
    return null
  } finally {
    clearTimeout(timer)
  }
}
