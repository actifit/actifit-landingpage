// A Keychain session whose extension is not on the page (it crashed in the user's browser):
// every Keychain action fell through to the typed-key path, which refuses Keychain sessions,
// and each flow showed its own generic error ("error voting") with no popup. Now one notice
// says what is wrong, for every flow, and the generic toasts that follow it are dropped.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@blurtfoundation/blurtjs', () => ({ broadcast: { send: jest.fn() }, api: { setOptions: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import '@/plugins/vue-custom'
import plugin from '@/plugins/keychain-missing'
import hive from '@hiveio/hive-js'
import { requestKey } from '@/utils/keyPrompt'
import { MUTE_MS, NOTICE_GROUP, createKeychainMissingNotice, keychainExpectedButMissing } from '@/utils/keychainMissing'

const read = (file) => fs.readFileSync(path.resolve(__dirname, '../../..', file), 'utf8')
const MSG = 'Hive Keychain was not detected.'
const keychainSession = () => {
  localStorage.setItem('std_login', 'true')
  localStorage.setItem('acti_login_method', 'keychain')
  delete window.hive_keychain
}
// the toasts actually shown (not the clearing calls)
const texts = (fn) => fn.mock.calls.map(([p]) => p).filter((p) => !p.clean).map((p) => p.text)

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  delete window.hive_keychain
  jest.useRealTimers()
})

describe('keychainExpectedButMissing', () => {
  it('only a site login with Keychain as the method, and no Keychain on the page', () => {
    const store = (o) => ({ getItem: (k) => (k in o ? o[k] : null) })
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: 'keychain' }), {})).toBe(true)
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: 'keychain' }), { hive_keychain: {} })).toBe(false)
    // HiveSigner session with a leftover method (not cleared on logout)
    expect(keychainExpectedButMissing(store({ acti_login_method: 'keychain' }), {})).toBe(false)
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: 'hiveauth' }), {})).toBe(false)
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: '' }), {})).toBe(false)
    expect(keychainExpectedButMissing({ getItem: () => { throw new Error('blocked') } }, {})).toBe(false)
  })
})

describe('the notice', () => {
  it('replaces the one showing (never stacks, always visible), in its own group', () => {
    const notify = jest.fn()
    const n = createKeychainMissingNotice({ notify, message: () => MSG, now: () => 1 })
    n.report()
    n.report() // a second click, after the first notice was dismissed or is still up
    expect(notify.mock.calls.map(([p]) => p)).toEqual([
      { group: NOTICE_GROUP, clean: true },
      expect.objectContaining({ group: NOTICE_GROUP, text: MSG }),
      { group: NOTICE_GROUP, clean: true },
      expect.objectContaining({ group: NOTICE_GROUP, text: MSG }),
    ])
  })

  it('after a refused action, drops the generic errors that follow, for MUTE_MS only', () => {
    let t = 1000
    const n = createKeychainMissingNotice({ notify: jest.fn(), message: () => MSG, now: () => t })
    expect(n.allows({ group: 'error', text: 'x' })).toBe(true)
    n.report()
    expect(n.allows({ group: 'error', text: 'error voting' })).toBe(false)
    // not errors, clearing calls, plain strings (default group): untouched
    expect(n.allows({ group: 'success', text: 'ok' })).toBe(true)
    expect(n.allows({ group: 'warn', text: 'w' })).toBe(true)
    expect(n.allows({ group: 'error', clean: true })).toBe(true)
    expect(n.allows('plain')).toBe(true)
    t += MUTE_MS
    expect(n.allows({ group: 'error', text: 'later, unrelated' })).toBe(true)
  })

  it('the page-load notice mutes nothing (it follows no failed action)', () => {
    const n = createKeychainMissingNotice({ notify: jest.fn(), message: () => MSG, now: () => 1 })
    n.report({ mute: false })
    expect(n.allows({ group: 'error', text: 'a page fetch failed' })).toBe(true)
  })
})

describe('plugin', () => {
  let shown
  const install = () => {
    shown = jest.fn()
    shown.close = jest.fn()
    Vue.notify = shown
    Vue.prototype.$notify = shown
    plugin({ app: { i18n: { t: (k) => (k === 'keychain_not_detected' ? MSG + " <l'extension>" : k) } } })
  }

  it('is registered client-side, after vue-notification and vue-custom.js', () => {
    const cfg = read('nuxt.config.js')
    const at = (s) => cfg.indexOf(s)
    expect(at("{ src: '~/plugins/keychain-missing.js', mode: 'client' }")).toBeGreaterThan(at("{ src: '~plugins/vue-custom.js' }"))
    expect(at("{ src: '~plugins/vue-custom.js' }")).toBeGreaterThan(at("{ src: '~plugins/vue-notification', ssr: false }"))
  })

  it('the notice group is rendered in the layout, so it shows on every page', () => {
    expect(read('layouts/default.vue')).toMatch(new RegExp(`<notifications group="${NOTICE_GROUP}"`))
  })

  it('keeps vue-notification\'s close()', () => {
    install()
    expect(Vue.notify.close).toBe(shown.close)
    expect(Vue.prototype.$notify.close).toBe(shown.close)
  })

  it('$keychainMissing: false (nothing shown) when Keychain is there, or for other logins', () => {
    install()
    localStorage.setItem('std_login', 'true')
    localStorage.setItem('acti_login_method', 'keychain')
    window.hive_keychain = {}
    expect(Vue.prototype.$keychainMissing()).toBe(false)
    localStorage.setItem('acti_login_method', '')
    delete window.hive_keychain
    expect(Vue.prototype.$keychainMissing()).toBe(false)
    expect(shown).not.toHaveBeenCalled()
  })

  it('$keychainMissing: true, one escaped notice, and the generic error after it is dropped', () => {
    install()
    keychainSession()
    expect(Vue.prototype.$keychainMissing()).toBe(true)
    new Vue().$notify({ group: 'error', text: 'error voting' })
    Vue.notify({ group: 'error', text: 'error performing operation' })
    new Vue().$notify({ group: 'success', text: 'saved' })
    expect(texts(shown)).toEqual([MSG + ' &lt;l&#39;extension&gt;', 'saved'])
  })

  const vmWithUser = () => {
    const vm = new Vue()
    vm.user = { account: { name: 'alice' } }
    vm.$t = (k) => k
    vm.$store = { state: {}, commit: jest.fn() }
    return vm
  }

  // the path every flow's typed-key fallback takes
  it('every flow: a Keychain session failing through $processTrxFunc shows only the Keychain notice', async () => {
    install()
    keychainSession()
    const vm = vmWithUser()
    const res = await vm.$processTrxFunc('vote', { voter: 'alice' }, false)
    // what a caller then does on failure
    if (!res.success) vm.$notify({ group: 'error', text: 'error voting' })
    expect(res.success).toBe(false)
    expect(texts(shown)).toHaveLength(1)
    expect(texts(shown)[0]).toContain(MSG)
    // nothing was asked for or signed
    expect(requestKey).not.toHaveBeenCalled()
    expect(hive.broadcast.send).not.toHaveBeenCalled()
  })

  it('memo decoding (3Speak sessions) shows the notice too', async () => {
    install()
    keychainSession()
    const res = await vmWithUser().$decodeMemo('#encrypted')
    expect(res.error).toBeTruthy()
    expect(texts(shown)).toHaveLength(1)
    expect(hive.memo.decode).not.toHaveBeenCalled()
  })

  it('once per tab, a few seconds after load, when Keychain never showed up', () => {
    jest.useFakeTimers()
    keychainSession()
    install()
    jest.advanceTimersByTime(5000)
    expect(texts(shown)).toHaveLength(1)
    // another page load in the same tab
    install()
    jest.advanceTimersByTime(5000)
    expect(shown).not.toHaveBeenCalled()
  })

  it('no load notice if one was already shown for an action, if Keychain arrived in time, or for other logins', () => {
    jest.useFakeTimers()
    keychainSession()
    install()
    Vue.prototype.$keychainMissing() // e.g. videos/new connects to 3Speak on mount
    shown.mockClear()
    jest.advanceTimersByTime(5000)
    expect(shown).not.toHaveBeenCalled()
    sessionStorage.clear()
    install()
    window.hive_keychain = {}
    jest.advanceTimersByTime(5000)
    localStorage.setItem('acti_login_method', '')
    delete window.hive_keychain
    install()
    jest.advanceTimersByTime(5000)
    expect(shown).not.toHaveBeenCalled()
  })
})

// These ask a Keychain user (whose extension is missing) for a typed ACTIVE key, and several
// sign with it directly through hive-js, never reaching the refusal: they must stop first.
describe('actions that would ask for a typed active key stop first', () => {
  const ACTIONS = {
    'pages/_username/wallet.vue': ['claimSavingsRewards', 'cancelSavingsWithdrawal', 'proceedRemoveSavings', 'proceedTransferSavings', 'proceedTransfer', 'proceedPowerUp', 'proceedDelegation', 'proceedPowerDown', 'cancelPowerDown', 'proceedMoveSEPower', 'proceedMoveAFIT', 'proceedMoveAFITX', 'proceedPowerUpToken', 'proceedDelegateToken', 'proceedUnDelegateToken', 'proceedPowerDownToken', 'proceedTransferToken', 'proceedTransferBSC', 'proceedWithdrawToken'],
    'pages/_username/index.vue': ['proceedWitnessVote'],
    'components/CartModal.vue': ['buyNowHive', 'proceedBuyNowHive'],
    'components/Product.vue': ['buyNowHive', 'proceedBuyNowHive', 'proceedBuyReal'],
    'pages/arena/_id.vue': ['broadcastArenaOp'],
  }
  for (const [file, names] of Object.entries(ACTIONS)) {
    it.each(names)(`${file}: %s`, (name) => {
      const src = read(file)
      const m = src.match(new RegExp(`(?:^|\\}, )[ \\t]*(?:async )?${name} ?\\([^)]*\\) ?\\{\\r?\\n(?:[ \\t]*//[^\\n]*\\n)*(?:[ \\t]*if \\(!this\\.bscBridgeAvailable\\) return;\\n(?:[ \\t]*//[^\\n]*\\n)*)?[ \\t]*(.*)`, 'm'))
      expect(m).toBeTruthy()
      // the first statement
      expect(m[1]).toMatch(/^if \(this\.\$keychainMissing && this\.\$keychainMissing\(\)\) return( false)?;?\r?$/)
    })
  }

  // every function that opens an active-key branch is in the list above
  it.each(['pages/_username/wallet.vue', 'pages/_username/index.vue'])('%s: no unguarded typed-active-key action', (file) => {
    const src = read(file)
    const guarded = ACTIONS[file]
    const fnRx = /^\s{4,6}(?:async\s+)?([A-Za-z_]\w*)\s*\([^)]*\)\s*\{\s*$/
    let cur = null
    const unguarded = new Set()
    for (const line of src.split('\n')) {
      const m = line.match(fnRx)
      if (m && !['if', 'for', 'while', 'switch', 'catch', 'function'].includes(m[1])) cur = m[1]
      if (/!this\.isKeychainLogin(\(\))? && !this\.isHiveauthLogin(\(\))?/.test(line) && cur && !guarded.includes(cur)) unguarded.add(cur)
    }
    expect([...unguarded]).toEqual([])
  })
})
