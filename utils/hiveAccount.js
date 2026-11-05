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

export async function hiveAccountExists (name, { node, fetchImpl = (typeof fetch === 'function' ? fetch : undefined), timeoutMs = LOOKUP_TIMEOUT_MS } = {}) {
  if (!isValidHiveAccountName(name)) return false
  if (!node || typeof fetchImpl !== 'function') return null
  let timer
  try {
    const lookup = fetchImpl(node, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'condenser_api.get_accounts', params: [[name]], id: 1 })
    }).then(async (res) => {
      if (!res.ok) return null
      const json = await res.json()
      if (!json || !Array.isArray(json.result)) return null
      return json.result.some(a => a && a.name === name)
    })
    const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs) })
    return await Promise.race([lookup, timeout])
  } catch (e) {
    return null
  } finally {
    clearTimeout(timer)
  }
}
