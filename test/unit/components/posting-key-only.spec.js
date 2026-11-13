/**
 * A typed key that is actually the ACTIVE or OWNER key must be refused.
 *
 * Users paste the wrong key more often than you would expect, and the consequences are
 * not symmetric: a posting key can post and vote, an active key can move funds, an owner
 * key can take the account. Someone who types an owner key into a web form has made a
 * much larger mistake than a failed login, and they will never find out from us unless
 * we tell them — the login would otherwise SUCCEED, because an owner key satisfies
 * posting authority on chain.
 *
 * hive.blog does the same check (condenser src/app/redux/UserSaga.js):
 *   "This login gives owner or active permissions and should not be used here."
 *
 * The guard FAILS OPEN on any lookup problem, which these tests pin: it protects the
 * user from their own slip, not us from an attacker — someone holding the owner key does
 * not need to get past a client-side check. Blocking login because a chain read failed
 * would trade a real outage for no security.
 */
import hive from '@hiveio/hive-js'
import signedChallengeLogin from '@/mixins/signedChallengeLogin'

const USER = 'alice'
const POSTING = hive.auth.toWif(USER, 'pw-posting', 'posting')
const ACTIVE = hive.auth.toWif(USER, 'pw-active', 'active')
const OWNER = hive.auth.toWif(USER, 'pw-owner', 'owner')

const pub = (wif) => hive.auth.wifToPublic(wif)

const account = () => ({
  HIVE: {
    name: USER,
    owner: { key_auths: [[pub(OWNER), 1]] },
    active: { key_auths: [[pub(ACTIVE), 1]] },
    posting: { key_auths: [[pub(POSTING), 1]] }
  }
})

const makeVm = () => {
  const vm = { error_proceeding: false, error_msg: '', login_in_progress: true, $t: (k) => k }
  Object.keys(signedChallengeLogin.methods).forEach((k) => {
    vm[k] = signedChallengeLogin.methods[k].bind(vm)
  })
  return vm
}

const respondWith = (body) => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true, status: 200, json: () => Promise.resolve(body)
  }))
}

describe('assertPostingOnlyKey', () => {
  afterEach(() => { delete global.fetch })

  it('allows the posting key', async () => {
    respondWith(account())
    const vm = makeVm()

    await expect(vm.assertPostingOnlyKey(USER, POSTING)).resolves.toBe(true)
    expect(vm.error_msg).toBe('')
  })

  it('REFUSES the active key, and says which key to use', async () => {
    respondWith(account())
    const vm = makeVm()

    await expect(vm.assertPostingOnlyKey(USER, ACTIVE)).resolves.toBe(false)
    expect(vm.error_msg).toBe('posting_key_only_login')
    expect(vm.error_proceeding).toBe(true)
    // the spinner must stop, or the button looks stuck
    expect(vm.login_in_progress).toBe(false)
  })

  it('REFUSES the owner key', async () => {
    respondWith(account())
    const vm = makeVm()

    await expect(vm.assertPostingOnlyKey(USER, OWNER)).resolves.toBe(false)
    expect(vm.error_msg).toBe('posting_key_only_login')
  })

  it('checks every key_auths entry, not just the first', async () => {
    // Multi-key accounts are ordinary; checking only [0] would miss the match.
    const multi = account()
    const other = hive.auth.toWif(USER, 'pw-other', 'active')
    multi.HIVE.active.key_auths = [[pub(other), 1], [pub(ACTIVE), 1]]
    respondWith(multi)
    const vm = makeVm()

    await expect(vm.assertPostingOnlyKey(USER, ACTIVE)).resolves.toBe(false)
  })

  describe('fails open rather than locking people out', () => {
    it('allows when the account lookup throws', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('offline')))
      const vm = makeVm()

      await expect(vm.assertPostingOnlyKey(USER, POSTING)).resolves.toBe(true)
      expect(vm.error_msg).toBe('')
    })

    it('allows when the account body is empty or malformed', async () => {
      for (const body of [{}, { HIVE: {} }, null]) {
        respondWith(body)
        const vm = makeVm()
        await expect(vm.assertPostingOnlyKey(USER, POSTING)).resolves.toBe(true)
      }
    })

    it('allows an unparseable WIF through, so the signer reports it', async () => {
      // A bad key is a different error with a different message; this guard is not the
      // place to diagnose it.
      respondWith(account())
      const vm = makeVm()

      await expect(vm.assertPostingOnlyKey(USER, 'not-a-wif')).resolves.toBe(true)
      expect(vm.error_msg).toBe('')
    })
  })
})
