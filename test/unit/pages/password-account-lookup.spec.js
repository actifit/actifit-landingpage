import PasswordPage from '~/pages/password.vue'

const originalFetch = global.fetch

const makeContext = (overrides = {}) => ({
  captchaValid: true,
  captcha_invalid: '',
  user: null,
  fetchingPass: false,
  errorFetch: '',
  privatePostKey: '',
  privateActKey: '',
  privateOwnKey: '',
  privateMemoKey: '',
  $refs: {
    username: { value: 'missing-user' },
    passfetchdata: { value: 'password' }
  },
  $t: jest.fn(key => key),
  resetKeys: jest.fn(),
  genQRCodes: jest.fn(),
  verifyUserPass: jest.fn(),
  setProperNode: jest.fn(),
  getAccountsWithTimeout: jest.fn(),
  ...overrides
})

describe('password account lookup', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
    global.fetch = originalFetch
  })

  it('rejects an invalid username before making a network request', async () => {
    const chain = {
      utils: { validateAccountName: jest.fn(() => 'Account name should be shorter.') }
    }
    const context = makeContext({
      setProperNode: jest.fn(() => chain)
    })

    await PasswordPage.methods.fetchKeys.call(context)

    expect(context.errorFetch).toBe('invalid_account_name')
    expect(context.getAccountsWithTimeout).not.toHaveBeenCalled()
    expect(context.fetchingPass).toBe(false)
  })

  it('shows user not found and stops loading when the account does not exist', async () => {
    const chain = {
      utils: { validateAccountName: jest.fn(() => null) }
    }
    const context = makeContext({
      setProperNode: jest.fn(() => chain),
      getAccountsWithTimeout: jest.fn(() => Promise.resolve([]))
    })

    await PasswordPage.methods.fetchKeys.call(context)

    expect(context.errorFetch).toBe('user_not_found_error')
    expect(context.getAccountsWithTimeout).toHaveBeenCalledWith('missing-user')
    expect(context.fetchingPass).toBe(false)
  })

  it('stops loading when the account request fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const chain = {
      utils: { validateAccountName: jest.fn(() => null) }
    }
    const context = makeContext({
      setProperNode: jest.fn(() => chain),
      getAccountsWithTimeout: jest.fn(() => Promise.reject(new Error('node unavailable')))
    })

    await PasswordPage.methods.fetchKeys.call(context)

    expect(context.errorFetch).toBe('account_lookup_failed')
    expect(context.fetchingPass).toBe(false)
    expect(consoleError).toHaveBeenCalled()
  })

  it('still derives keys for an existing account with the correct password', async () => {
    const account = {
      posting: { key_auths: [['posting-key', 1]] },
      active: { key_auths: [['active-key', 1]] },
      owner: { key_auths: [['owner-key', 1]] }
    }
    const privateKeys = {
      posting: 'private-posting',
      active: 'private-active',
      owner: 'private-owner',
      memo: 'private-memo'
    }
    const chain = {
      utils: { validateAccountName: jest.fn(() => null) },
      auth: { getPrivateKeys: jest.fn(() => privateKeys) }
    }
    const context = makeContext({
      $refs: {
        username: { value: ' Alice ' },
        passfetchdata: { value: 'correct-password' }
      },
      setProperNode: jest.fn(() => chain),
      getAccountsWithTimeout: jest.fn(() => Promise.resolve([account])),
      verifyUserPass: jest.fn(() => true)
    })

    await PasswordPage.methods.fetchKeys.call(context)

    expect(context.getAccountsWithTimeout).toHaveBeenCalledWith('alice')
    expect(context.verifyUserPass).toHaveBeenCalledWith('correct-password', {
      posting: account.posting.key_auths,
      active: account.active.key_auths,
      owner: account.owner.key_auths
    }, 'alice')
    expect(chain.auth.getPrivateKeys).toHaveBeenCalledWith('alice', 'correct-password')
    expect(context.privatePostKey).toBe(privateKeys.posting)
    expect(context.privateActKey).toBe(privateKeys.active)
    expect(context.privateOwnKey).toBe(privateKeys.owner)
    expect(context.privateMemoKey).toBe(privateKeys.memo)
    expect(context.genQRCodes).toHaveBeenCalledWith(privateKeys)
    expect(context.errorFetch).toBe('')
    expect(context.fetchingPass).toBe(false)
  })

  it('times out an account request after ten seconds', async () => {
    jest.useFakeTimers()
    let requestSignal
    global.fetch = jest.fn((url, options) => {
      requestSignal = options.signal
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const error = new Error('aborted')
          error.name = 'AbortError'
          reject(error)
        })
      })
    })
    const context = {
      _accountLookupController: null,
      cancelAccountLookup: PasswordPage.methods.cancelAccountLookup,
      getAccountApiNode: jest.fn(() => 'https://api.hive.blog')
    }

    const lookup = PasswordPage.methods.getAccountsWithTimeout.call(context, 'missing-user')
    const assertion = expect(lookup).rejects.toMatchObject({
      message: 'Account lookup timed out',
      code: 'ACCOUNT_LOOKUP_TIMEOUT'
    })
    jest.advanceTimersByTime(10000)

    await assertion
    expect(requestSignal.aborted).toBe(true)
    expect(context._accountLookupController).toBe(null)
  })

  it('uses the selected node for an abortable JSON-RPC account lookup', async () => {
    const account = { name: 'alice' }
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ result: [account] })
    }))
    const context = {
      _accountLookupController: null,
      cancelAccountLookup: PasswordPage.methods.cancelAccountLookup,
      getAccountApiNode: jest.fn(() => 'https://api.hive.blog')
    }

    const result = await PasswordPage.methods.getAccountsWithTimeout.call(context, 'alice')

    expect(result).toEqual([account])
    expect(global.fetch).toHaveBeenCalledWith('https://api.hive.blog', expect.objectContaining({
      method: 'POST',
      signal: expect.any(AbortSignal)
    }))
    const request = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(request).toMatchObject({
      method: 'condenser_api.get_accounts',
      params: [['alice']]
    })
  })
})
