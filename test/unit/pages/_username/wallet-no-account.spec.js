// A Hive-only account opened with Blurt selected (most accounts made since 2020) used to
// get an empty wallet on first load, and on a chain switch kept the previous chain's
// account, whose vests were then converted at Blurt's rate. It now says the account is
// not on that chain and offers Hive.
// wallet.vue cannot be loaded by jest (see wallet-total.spec.js), so this checks the source
// and runs the chain watcher on its own.
import fs from 'fs'
import path from 'path'
import { compile } from 'vue-template-compiler'

const src = fs.readFileSync(path.join(__dirname, '../../../../pages/_username/wallet.vue'), 'utf8')
const template = src.slice(src.indexOf('<template>') + '<template>'.length, src.lastIndexOf('</template>'))

describe('no account on the selected chain', () => {
  it('the template compiles, and the notice replaces the wallet', () => {
    expect(compile(template).errors).toEqual([])
    expect(template).toMatch(/v-if="noAccountOnChain">[\s\S]{0,400}wallet_no_account_on_chain[\s\S]{0,400}switchWalletToHive[\s\S]{0,200}<div class="container wallet-page wallet-shell pt-5 mt-5 pb-5" v-else-if="user \|\| displayUser">/)
  })

  it('first load: a missing account on a non-Hive chain sets the notice', () => {
    expect(src).toMatch(/console\.error\(`Account \$\{this\.displayUser\} not found\.`\);\s*if \(this\.cur_bchain !== 'HIVE'\) this\.noAccountOnChain = this\.cur_bchain;/)
  })

  // the bchain watcher, extracted and run with stubs
  const start = src.indexOf('    bchain: async function (newBchain) {')
  const body = src.slice(src.indexOf('{', start) + 1, src.indexOf('\n    },', start))
  // eslint-disable-next-line no-new-func
  const watcher = new Function('newBchain', `return (async () => {${body}})()`)
  const vm = (accounts, extra = {}) => ({
    displayUser: 'alice', user: null, walletInitialized: true, noAccountOnChain: '',
    displayUserData: { name: 'alice', vesting_shares: '6255584.165781 VESTS' },
    $store: { dispatch: jest.fn() },
    setProperNode: () => ({ api: {
      getDynamicGlobalPropertiesAsync: async () => ({}),
      getAccountsAsync: async () => accounts,
    } }),
    fetchUserData: jest.fn(), fetchTokenBalance: jest.fn(), fetchAFITHE: jest.fn(),
    formattedTotAccountVal: jest.fn(), $forceUpdate: jest.fn(), initWallet: jest.fn(),
    setupQuickActionsOverflow: jest.fn(), $nextTick: jest.fn((fn) => fn()),
    ...extra,
  })

  it('switching to a chain without the account shows the notice and keeps the old account out of the numbers', async () => {
    const v = vm([])
    const hiveAccount = v.displayUserData
    await watcher.call(v, 'BLURT')
    expect(v.noAccountOnChain).toBe('BLURT')
    expect(v.fetchUserData).not.toHaveBeenCalled()
    expect(v.displayUserData).toBe(hiveAccount)
  })

  it('switching back to Hive clears it and, after a first load that stopped there, finishes the setup', async () => {
    const v = vm([{ name: 'alice' }], { noAccountOnChain: 'BLURT', walletInitialized: false })
    await watcher.call(v, 'HIVE')
    expect(v.noAccountOnChain).toBe('')
    expect(v.initWallet).toHaveBeenCalledWith('alice')
    // the action bar mounted() could not set up while the notice showed
    expect(v.setupQuickActionsOverflow).toHaveBeenCalled()
    // initWallet loads the data itself
    expect(v.fetchUserData).not.toHaveBeenCalled()
  })

  it('a missing account on Hive itself is not "no account on this chain"', async () => {
    const v = vm([])
    await watcher.call(v, 'HIVE')
    expect(v.noAccountOnChain).toBe('')
  })

  it('a wallet still loading (not stopped at the notice) is not set up from the watcher', async () => {
    const v = vm([{ name: 'alice' }], { walletInitialized: false })
    await watcher.call(v, 'BLURT')
    expect(v.initWallet).not.toHaveBeenCalled()
  })

  it('a normal chain switch neither shows the notice nor re-runs the setup', async () => {
    const v = vm([{ name: 'alice' }])
    await watcher.call(v, 'BLURT')
    expect(v.noAccountOnChain).toBe('')
    expect(v.initWallet).not.toHaveBeenCalled()
    expect(v.fetchUserData).toHaveBeenCalled()
  })

  it('a node failure on switch is not reported as a missing account, and does not convert the old account', async () => {
    for (const notice of ['', 'BLURT']) {
      const v = vm(null, { noAccountOnChain: notice })
      v.setProperNode = () => ({ api: {
        getDynamicGlobalPropertiesAsync: async () => ({}),
        getAccountsAsync: async () => { throw new Error('down') },
      } })
      jest.spyOn(console, 'error').mockImplementation(() => {})
      await watcher.call(v, 'STEEM')
      expect(v.noAccountOnChain).toBe(notice)
      expect(v.fetchUserData).not.toHaveBeenCalled()
      // marked, so the next refresh re-reads the account before converting anything
      expect(v.accountStale).toBe(true)
    }
  })

  describe('the refresh after a failed switch', () => {
    const mStart = src.indexOf('    async rereadStaleAccount() {')
    const mBody = src.slice(src.indexOf('{', mStart) + 1, src.indexOf('\n    },', mStart))
    // eslint-disable-next-line no-new-func
    const reread = new Function(`return (async () => {${mBody}})()`)
    const stale = (result, extra) => ({
      accountStale: true, noAccountOnChain: '', cur_bchain: 'BLURT', displayUser: 'alice', user: null,
      displayUserData: { name: 'alice', from: 'hive' },
      setProperNode: () => ({ api: { getAccountsAsync: async () => { if (result instanceof Error) throw result; return result } } }),
      ...extra,
    })

    it('fetchUserData re-reads a stale account before converting anything', () => {
      expect(src).toMatch(/if \(this\.noAccountOnChain\) return;\s*if \(this\.accountStale && !\(await this\.rereadStaleAccount\(\)\)\) return;/)
    })

    it('uses the account read on the selected chain', async () => {
      const v = stale([{ name: 'alice', from: 'blurt' }])
      expect(await reread.call(v)).toBe(true)
      expect(v.displayUserData).toEqual({ name: 'alice', from: 'blurt' })
      expect(v.accountStale).toBe(false)
    })

    it('still failing: converts nothing and tries again next time', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const v = stale(new Error('down'))
      expect(await reread.call(v)).toBe(false)
      expect(v.accountStale).toBe(true)
      expect(v.displayUserData).toEqual({ name: 'alice', from: 'hive' })
    })

    it('not on this chain: shows the notice', async () => {
      const v = stale([])
      expect(await reread.call(v)).toBe(false)
      expect(v.noAccountOnChain).toBe('BLURT')
      expect(v.displayUserData).toEqual({ name: 'alice', from: 'hive' })
    })
  })

  it('a found account clears a notice left by another user (Switch User, log in again)', () => {
    expect(src).toMatch(/this\.displayUserData = account_res\[0\];\s*\/\/[^\n]*\n\s*this\.noAccountOnChain = '';\s*\/\/ Step 5:/)
  })

  it('refreshes do nothing while the notice shows (the account held is another chain\'s)', () => {
    expect(src).toMatch(/async fetchUserData\(\) \{\s*\/\/[^\n]*\n\s*if \(this\.noAccountOnChain\) return;/)
  })

  describe('"Switch to Hive"', () => {
    const mStart = src.indexOf('    async switchWalletToHive() {')
    const mBody = src.slice(src.indexOf('{', mStart) + 1, src.indexOf('\n    },', mStart))
    // eslint-disable-next-line no-new-func
    const switchWalletToHive = new Function(`return (async () => {${mBody}})()`)
    const btn = (extra) => {
      const v = {
        bchain: 'BLURT', cur_bchain: 'BLURT', noAccountOnChain: 'BLURT', walletInitialized: false,
        displayUser: 'alice', user: null,
        setupQuickActionsOverflow: jest.fn(), $nextTick: jest.fn((fn) => fn()),
        ...extra,
      }
      // like Vuex: the getter follows the commit at once
      v.$store = { commit: jest.fn((type, chain) => { v.bchain = chain }) }
      // the notice must be gone before loading: fetchUserData does nothing while it shows
      v.initWallet = jest.fn(function () { expect(v.noAccountOnChain).toBe('') })
      v.refreshAllWalletData = jest.fn(function () { expect(v.noAccountOnChain).toBe('') })
      return v
    }
    afterEach(() => localStorage.removeItem('cur_bchain'))

    it('saves Hive and lets the chain watcher reload when the store changes', async () => {
      const v = btn()
      await switchWalletToHive.call(v)
      expect(localStorage.getItem('cur_bchain')).toBe('HIVE')
      expect(v.$store.commit).toHaveBeenCalledWith('setBchain', 'HIVE')
      expect(v.initWallet).not.toHaveBeenCalled()
      expect(v.refreshAllWalletData).not.toHaveBeenCalled()
    })

    it('when the store already says HIVE (the watcher will not fire), it loads the wallet itself', async () => {
      const first = btn({ bchain: 'HIVE' })
      await switchWalletToHive.call(first)
      expect(first.noAccountOnChain).toBe('')
      expect(first.cur_bchain).toBe('HIVE')
      expect(first.initWallet).toHaveBeenCalledWith('alice')
      expect(first.setupQuickActionsOverflow).toHaveBeenCalled()

      const later = btn({ bchain: 'HIVE', walletInitialized: true })
      await switchWalletToHive.call(later)
      expect(later.refreshAllWalletData).toHaveBeenCalled()
      expect(later.initWallet).not.toHaveBeenCalled()
    })
  })
})
