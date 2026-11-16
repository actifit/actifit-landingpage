// Hive Keychain and HiveAuth sign on Hive only: they ignore the chain picked on the site.
// With Blurt selected, a vote, post or power down sent through them landed on HIVE (on the
// same author/permlink if it existed there, or failed with an unrelated error), spending
// the user's Hive voting power or stake instead of acting on Blurt.
//
// This guard sits in front of both and refuses, while another chain is selected, the
// operations whose chain is only implied: they carry no currency, so nothing tells Hive
// they were meant for Blurt. Operations that are Hive's by nature still go through:
// Hive-Engine and Actifit custom_json, proposal votes, login signatures, and transfers
// in HIVE/HBD (buying products, which is Hive-only even with Blurt selected).

// Operations with no currency of their own: on Hive they act on Hive, whatever was meant.
// account_update(2): with Blurt selected the profile page reads the BLURT profile, and
// signing it on Hive would replace the whole Hive profile with it.
const IMPLIED_CHAIN_OPS = new Set([
  'vote', 'comment', 'comment_options', 'delete_comment',
  'withdraw_vesting', 'delegate_vesting_shares', 'claim_reward_balance',
  'account_witness_vote', 'account_witness_proxy',
  'account_update', 'account_update2', 'cancel_transfer_from_savings',
])
// Voting for (or proxying to) the Actifit witness is a Hive action on the profile page for
// every login method (typed keys sign it on Hive too), so it is not refused.
const HIVE_WITNESS = 'actifit'
const witnessIsActifit = (name, params) =>
  (name === 'account_witness_vote' && params && params.witness === HIVE_WITNESS) ||
  (name === 'account_witness_proxy' && params && params.proxy === HIVE_WITNESS)
// Operations whose amount names a currency: only Hive's own currencies belong on Hive.
const CURRENCY_OPS = new Set(['transfer', 'transfer_to_vesting', 'transfer_to_savings', 'transfer_from_savings'])
const HIVE_CURRENCIES = new Set(['HIVE', 'HBD'])

const currencyOf = (amount) => String(amount || '').trim().split(/\s+/).pop().toUpperCase()

export function opBlocked ([name, params] = []) {
  if (witnessIsActifit(name, params)) return false
  if (IMPLIED_CHAIN_OPS.has(name)) return true
  if (CURRENCY_OPS.has(name)) return !HIVE_CURRENCIES.has(currencyOf(params && params.amount))
  return false
}

// Keychain also accepts the operations as a JSON string.
const opsBlocked = (ops) => {
  if (typeof ops === 'string') {
    try { ops = JSON.parse(ops) } catch (e) { return true }
  }
  return Array.isArray(ops) && ops.some((op) => Array.isArray(op) && opBlocked(op))
}

// Keychain's single-purpose requests, each of which is one of the operations above.
// requestTransfer names its currency separately (its 5th argument).
const KEYCHAIN_ALWAYS = ['requestVote', 'requestPost', 'requestPowerUp', 'requestPowerDown',
  'requestDelegation', 'requestWitnessVote', 'requestProxy']

export function keychainCallBlocked (method, args) {
  if ((method === 'requestWitnessVote' || method === 'requestProxy') && args[1] === HIVE_WITNESS) return false
  if (KEYCHAIN_ALWAYS.includes(method)) return true
  if (method === 'requestTransfer') return !HIVE_CURRENCIES.has(String(args[4] || '').toUpperCase())
  if (method === 'requestBroadcast') return opsBlocked(args[1])
  return false
}

export const selectedChain = (storage) => {
  try { return (storage.getItem('cur_bchain') || 'HIVE').toUpperCase() } catch (e) { return 'HIVE' }
}

const WRAPPED = '__actifitChainGuard'

// Wraps the Keychain object's request methods in place. `refuse(chain)` reports the refusal
// to the user and returns the message. Keychain answers through a callback; a refused call
// answers it too (as a failure, with an empty `result` because some callers read
// response.result.id), so no caller is left waiting.
export function guardKeychain (keychain, storage, refuse) {
  if (!keychain || keychain[WRAPPED]) return false
  const methods = [...KEYCHAIN_ALWAYS, 'requestTransfer', 'requestBroadcast']
  for (const method of methods) {
    const original = keychain[method]
    if (typeof original !== 'function') continue
    const guarded = function (...args) {
      const chain = selectedChain(storage)
      if (chain !== 'HIVE' && keychainCallBlocked(method, args)) {
        const message = refuse(chain)
        const callback = args.find((a) => typeof a === 'function')
        if (callback) setTimeout(() => callback({ success: false, error: 'chain_not_supported', message, result: {} }), 0)
        return undefined
      }
      return original.apply(this, args)
    }
    // A provider with a frozen object must not break the site: guard what can be guarded.
    try { keychain[method] = guarded } catch (e) { console.warn('Keychain guard: cannot wrap ' + method, e) }
  }
  try { Object.defineProperty(keychain, WRAPPED, { value: true }) } catch (e) { /* frozen: nothing more to do */ }
  return true
}

// HiveAuth: HAS.broadcast(auth, keyType, ops, onWait) returns a promise that callers treat
// as failed unless it resolves with cmd 'sign_ack'.
export function guardHiveAuth (HAS, storage, refuse) {
  if (!HAS || HAS[WRAPPED] || typeof HAS.broadcast !== 'function') return false
  const original = HAS.broadcast
  HAS.broadcast = function (auth, keyType, ops, ...rest) {
    const chain = selectedChain(storage)
    if (chain !== 'HIVE' && opsBlocked(ops)) {
      const message = refuse(chain)
      return Promise.resolve({ cmd: 'sign_nack', error: 'chain_not_supported', message })
    }
    return original.call(this, auth, keyType, ops, ...rest)
  }
  HAS[WRAPPED] = true
  return true
}
