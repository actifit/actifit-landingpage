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
// Anything it does not recognise is refused: with another chain selected, a false refusal
// costs a click, a false pass signs on the wrong chain.

// Operations with no currency of their own: on Hive they act on Hive, whatever was meant.
// account_update(2): with Blurt selected the profile page reads the BLURT profile, and
// signing it on Hive would replace the whole Hive profile with it.
const IMPLIED_CHAIN_OPS = new Set([
  'vote', 'comment', 'comment_options', 'delete_comment',
  'withdraw_vesting', 'delegate_vesting_shares', 'claim_reward_balance',
  'account_witness_vote', 'account_witness_proxy',
  'account_update', 'account_update2', 'cancel_transfer_from_savings',
])
// custom_json that acts on chain content (a Blurt post's author/permlink, a community): a
// reblog of a Blurt post signed on Hive reblogs the same permlink on Hive. The other ids the
// site uses (Hive-Engine, Actifit's own, rc) only exist on Hive.
const CONTENT_JSON_IDS = new Set(['follow', 'reblog', 'community'])
// Voting for (or proxying to) the Actifit witness is a Hive action on the profile page for
// every login method (typed keys sign it on Hive too), so it is not refused.
const HIVE_WITNESS = 'actifit'
const witnessIsActifit = (name, params) =>
  (name === 'account_witness_vote' && params.witness === HIVE_WITNESS) ||
  (name === 'account_witness_proxy' && params.proxy === HIVE_WITNESS)
// Operations whose amount names a currency: only Hive's own currencies belong on Hive.
const CURRENCY_OPS = new Set(['transfer', 'transfer_to_vesting', 'transfer_to_savings', 'transfer_from_savings'])
const HIVE_CURRENCIES = new Set(['HIVE', 'HBD'])

const currencyOf = (amount) => String(amount || '').trim().split(/\s+/).pop().toUpperCase()
const jsonIdBlocked = (id) => CONTENT_JSON_IDS.has(String(id || '').trim().toLowerCase())

export function opBlocked (op) {
  // anything but [name, params] is not an operation we can vouch for
  if (!Array.isArray(op) || typeof op[0] !== 'string' || !op[1] || typeof op[1] !== 'object') return true
  const name = op[0].trim().toLowerCase()
  const params = op[1]
  if (witnessIsActifit(name, params)) return false
  if (IMPLIED_CHAIN_OPS.has(name)) return true
  if (CURRENCY_OPS.has(name)) return !HIVE_CURRENCIES.has(currencyOf(params.amount))
  if (name === 'custom_json') return jsonIdBlocked(params.id)
  return false
}

// Keychain also accepts the operations as a JSON string, and a single operation unwrapped.
const opsBlocked = (ops) => {
  if (typeof ops === 'string') {
    try { ops = JSON.parse(ops) } catch (e) { return true }
  }
  if (!Array.isArray(ops)) return true
  if (typeof ops[0] === 'string') return opBlocked(ops)
  return ops.some(opBlocked)
}

// Keychain requests that sign nothing for the chain (login, message signing) or are Hive's
// by nature (Actifit's Hive DHF proposal vote).
const KEYCHAIN_PASS = new Set(['requestHandshake', 'requestSignBuffer', 'requestVerifyKey',
  'requestEncodeMessage', 'requestEncodeWithKeys', 'requestUpdateProposalVote'])

// Any other Keychain request is refused unless it is one of these, checked by its arguments.
export function keychainCallBlocked (method, args) {
  if (KEYCHAIN_PASS.has(method)) return false
  if (method === 'requestWitnessVote' || method === 'requestProxy') return args[1] !== HIVE_WITNESS
  if (method === 'requestTransfer') return !HIVE_CURRENCIES.has(String(args[4] || '').trim().toUpperCase())
  if (method === 'requestBroadcast') return opsBlocked(args[1])
  if (method === 'requestCustomJson') return jsonIdBlocked(args[1])
  // requestVote, requestPost, requestPowerUp/Down, requestDelegation, and anything else
  return true
}

export const selectedChain = (storage) => {
  try { return (storage.getItem('cur_bchain') || 'HIVE').toUpperCase() } catch (e) { return 'HIVE' }
}

const WRAPPED = '__actifitChainGuard'
const isRequest = (keychain, key) => /^request[A-Z]/.test(key) && typeof keychain[key] === 'function'

// Wraps the Keychain object's request methods in place. `refuse(chain)` reports the refusal
// to the user and returns the message. Keychain answers through a callback; a refused call
// answers it too (as a failure, with an empty `result` because some callers read
// response.result.id), so no caller is left waiting.
// True once every request method is wrapped; false otherwise, so the caller tries again.
export function guardKeychain (keychain, storage, refuse) {
  if (!keychain || keychain[WRAPPED]) return false
  let complete = true
  // for..in: Keychain's methods may live on a prototype
  for (const method in keychain) {
    if (!isRequest(keychain, method) || keychain[method][WRAPPED]) continue
    const original = keychain[method]
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
    guarded[WRAPPED] = true
    // A provider with a frozen object must not break the site: guard what can be guarded.
    try { keychain[method] = guarded } catch (e) { /* checked below */ }
    if (keychain[method] !== guarded) {
      complete = false
      console.warn('Keychain guard: cannot wrap ' + method)
    }
  }
  if (!complete) return false
  try { Object.defineProperty(keychain, WRAPPED, { value: true }) } catch (e) { /* frozen: wrapped methods stay marked */ }
  return true
}

// HiveAuth: HAS.broadcast(auth, keyType, ops, onWait) returns a promise that callers treat
// as failed unless it resolves with cmd 'sign_ack'.
export function guardHiveAuth (HAS, storage, refuse) {
  if (!HAS || HAS[WRAPPED] || typeof HAS.broadcast !== 'function') return false
  const original = HAS.broadcast
  const guarded = function (auth, keyType, ops, ...rest) {
    const chain = selectedChain(storage)
    if (chain !== 'HIVE' && opsBlocked(ops)) {
      const message = refuse(chain)
      return Promise.resolve({ cmd: 'sign_nack', error: 'chain_not_supported', message })
    }
    return original.call(this, auth, keyType, ops, ...rest)
  }
  try {
    HAS.broadcast = guarded
    HAS[WRAPPED] = true
  } catch (e) {
    console.warn('HiveAuth guard: cannot wrap broadcast', e)
    return false
  }
  return true
}
