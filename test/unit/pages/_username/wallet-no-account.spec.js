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
  })

  it('a normal chain switch neither shows the notice nor re-runs the setup', async () => {
    const v = vm([{ name: 'alice' }])
    await watcher.call(v, 'BLURT')
    expect(v.noAccountOnChain).toBe('')
    expect(v.initWallet).not.toHaveBeenCalled()
    expect(v.fetchUserData).toHaveBeenCalled()
  })

  it('a node failure on switch is not reported as a missing account', async () => {
    const v = vm(null)
    v.setProperNode = () => ({ api: {
      getDynamicGlobalPropertiesAsync: async () => ({}),
      getAccountsAsync: async () => { throw new Error('down') },
    } })
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await watcher.call(v, 'BLURT')
    expect(v.noAccountOnChain).toBe('')
  })
})
