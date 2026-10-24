/**
 * Ask the user for a private key, for exactly one signing operation.
 *
 * A promise-based bridge between code that needs a key ($processTrxFunc) and the one
 * component that collects it (components/KeyPromptModal.vue, mounted in the layout).
 *
 * The key is handed straight back to the caller through the promise. It is NEVER put in
 * Vuex, web storage, or anything else long-lived by this module: an active key in
 * particular can move funds, so it should exist only for the duration of the one
 * transaction it signs. Whether a POSTING key is then remembered for the session is the
 * caller's decision, not this module's.
 *
 * One request at a time. A second request while one is open cancels the first (it
 * resolves with null) rather than queueing, so a stale prompt can never end up
 * answering a newer operation it was not shown for.
 */
let pending = null
let showPrompt = null

export function registerKeyPrompt (fn) {
  showPrompt = fn
}

export function requestKey (type, account) {
  if (pending) {
    const prev = pending
    pending = null
    prev(null)
  }
  return new Promise((resolve) => {
    // No prompt component mounted (e.g. a page rendered without the layout): answer
    // null immediately rather than leaving the caller waiting forever.
    if (!showPrompt) return resolve(null)
    pending = resolve
    showPrompt({ type, account })
  })
}

export function resolveKeyRequest (wif) {
  const done = pending
  pending = null
  if (done) done(wif || null)
}
