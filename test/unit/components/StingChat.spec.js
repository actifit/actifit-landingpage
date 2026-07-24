import StingChat from '@/components/StingChat.vue'
import hive from '@hiveio/hive-js'
import { PrivateKey, Signature, cryptoUtils } from '@hiveio/dhive'

describe('components/StingChat.vue', () => {
  afterEach(() => {
    localStorage.clear()
    delete window.hive_keychain
    delete window.peakvault
    delete global.StWidget
  })

  it('uses the session posting key before an installed Keychain extension', () => {
    localStorage.setItem('acti_login_method', '')
    window.hive_keychain = { requestHandshake: jest.fn() }

    const widget = {
      messageName: 'stlib0',
      setProperties: jest.fn(),
      setPostingKey: jest.fn(),
      setUser: jest.fn(),
      createElement: jest.fn(() => document.createElement('div')),
      setStyle: jest.fn()
    }
    global.StWidget = jest.fn(() => widget)

    const vm = {
      widget: null,
      widgetError: '',
      chatPostingKey: '5Kposting',
      user: { account: { name: 'alice' } },
      $refs: { widgetContainer: document.createElement('div') }
    }
    vm.configurePostingKey = (username, postingKey) => {
      StingChat.methods.configurePostingKey.call(vm, username, postingKey)
    }
    vm.configurePostingKeyPassthrough = (postingKey) => {
      StingChat.methods.configurePostingKeyPassthrough.call(vm, postingKey)
    }
    vm.postWalletResponse = (...args) => {
      StingChat.methods.postWalletResponse.call(vm, ...args)
    }
    vm.readableError = (error) => StingChat.methods.readableError.call(vm, error)

    StingChat.methods.initWidget.call(vm)

    expect(widget.setPostingKey).toHaveBeenCalledWith('5Kposting', expect.anything())
    expect(widget.setUser).toHaveBeenCalledWith('alice')
    expect(widget.enableKeychainPassthrough).toBe(false)
    expect(widget.enablePeakVaultPassthrough).toBe(false)
  })

  it('routes a fresh Keychain session through the Keychain extension', async () => {
    localStorage.setItem('acti_login_method', 'keychain')
    const postMessage = jest.fn()
    window.hive_keychain = {
      requestCustomJson: jest.fn((...args) => {
        args[args.length - 1]({ success: true, result: { id: 'signed' } })
      })
    }

    const widget = {
      messageName: 'stlib0',
      allowedCustomJson: ['sting-chat'],
      setProperties: jest.fn(),
      setUser: jest.fn(),
      createElement: jest.fn(() => document.createElement('div')),
      setStyle: jest.fn()
    }
    global.StWidget = jest.fn(() => widget)

    const vm = {
      widget: null,
      widgetError: '',
      chatPostingKey: null,
      user: { account: { name: 'alice' } },
      $refs: { widgetContainer: document.createElement('div') }
    }
    vm.configureKeychainPassthrough = () => StingChat.methods.configureKeychainPassthrough.call(vm)
    vm.callKeychain = (...args) => StingChat.methods.callKeychain.call(vm, ...args)
    vm.normalizeWalletResponse = (response) => StingChat.methods.normalizeWalletResponse.call(vm, response)
    vm.postWalletResponse = (...args) => StingChat.methods.postWalletResponse.call(vm, ...args)
    vm.readableError = (error) => StingChat.methods.readableError.call(vm, error)

    StingChat.methods.initWidget.call(vm)

    expect(widget.enableKeychainPassthrough).toBe(true)
    expect(widget.enablePeakVaultPassthrough).toBe(false)
    expect(widget.handleWithHivejs).toBeNull()
    expect(widget.handleWithKeychain).toEqual(expect.any(Function))
    expect(widget.setUser).toHaveBeenCalledWith('alice', 'keychain')

    widget.handleWithKeychain(
      { source: { postMessage }, origin: 'https://chat.peakd.com' },
      'message-1',
      'requestCustomJson',
      ['alice', 'sting-chat', 'Posting', '{}', 'Sting chat']
    )
    await Promise.resolve()
    await Promise.resolve()

    expect(window.hive_keychain.requestCustomJson).toHaveBeenCalledWith(
      'alice',
      'sting-chat',
      'Posting',
      '{}',
      'Sting chat',
      expect.any(Function)
    )
    expect(postMessage).toHaveBeenCalledTimes(1)
  })

  it('does not reuse a posting key that was bound to another account', () => {
    localStorage.setItem('acti_login_method', 'keychain')
    window.hive_keychain = { requestHandshake: jest.fn() }
    const widget = {
      allowedCustomJson: [],
      setProperties: jest.fn(),
      setPostingKey: jest.fn(),
      setUser: jest.fn(),
      createElement: jest.fn(() => document.createElement('div')),
      setStyle: jest.fn()
    }
    global.StWidget = jest.fn(() => widget)

    const vm = {
      widget: null,
      widgetError: '',
      chatPostingKey: '5KalicePostingKey',
      postingKeyUsername: 'alice',
      user: { account: { name: 'bob' } },
      $refs: { widgetContainer: document.createElement('div') }
    }
    vm.configurePostingKey = jest.fn()
    vm.configureKeychainPassthrough = () => StingChat.methods.configureKeychainPassthrough.call(vm)

    StingChat.methods.initWidget.call(vm)

    expect(vm.configurePostingKey).not.toHaveBeenCalled()
    expect(widget.setPostingKey).not.toHaveBeenCalled()
    expect(widget.setUser).toHaveBeenCalledWith('bob', 'keychain')
    expect(widget.enableKeychainPassthrough).toBe(true)
  })

  it('removes the old signer immediately when the posting key is cleared', async () => {
    const oldHiveSigner = jest.fn()
    const oldKeychainSigner = jest.fn()
    const widget = {
      handleWithHivejs: oldHiveSigner,
      handleWithKeychain: oldKeychainSigner,
      enableKeychainPassthrough: false,
      enablePeakVaultPassthrough: false,
      cleanup: jest.fn()
    }
    const container = document.createElement('div')
    container.appendChild(document.createElement('div'))
    const vm = {
      widget,
      widgetSessionVersion: 0,
      isBeingDestroyed: false,
      widgetError: '',
      $refs: { widgetContainer: container },
      $nextTick: (callback) => callback(),
      loadWidgetScript: jest.fn(() => Promise.resolve()),
      initWidget: jest.fn(),
      $t: (key) => key
    }
    vm.teardownWidget = () => StingChat.methods.teardownWidget.call(vm)
    vm.restartWidgetSession = () => StingChat.methods.restartWidgetSession.call(vm)

    StingChat.watch.chatPostingKey.call(vm, null)

    expect(vm.widget).toBeNull()
    expect(widget.handleWithHivejs).toBeNull()
    expect(widget.handleWithKeychain).toBeNull()
    expect(widget.enableKeychainPassthrough).toBe(true)
    expect(widget.enablePeakVaultPassthrough).toBe(true)
    expect(widget.cleanup).toHaveBeenCalledTimes(1)
    expect(container.childElementCount).toBe(0)

    await Promise.resolve()
    await Promise.resolve()
    expect(vm.initWidget).toHaveBeenCalledTimes(1)
  })

  it('restarts the widget session when the active account changes', () => {
    const vm = { restartWidgetSession: jest.fn() }

    StingChat.watch.activeUsername.call(vm, 'bob', 'alice')

    expect(vm.restartWidgetSession).toHaveBeenCalledTimes(1)
  })

  it('encodes a direct message locally with the supplied recipient key', async () => {
    const senderKey = hive.auth.toWif('alice', 'posting-key-test', 'posting')
    const recipientKey = hive.auth.toWif('bob', 'posting-key-test', 'posting')
    const recipientPublicKey = hive.auth.wifToPublic(recipientKey)
    const postMessage = jest.fn()
    const widget = { messageName: 'stlib0' }
    const vm = {
      widget,
      postWalletResponse: (...args) => {
        StingChat.methods.postWalletResponse.call(vm, ...args)
      },
      readableError: (error) => StingChat.methods.readableError.call(vm, error)
    }

    StingChat.methods.configurePostingKeyPassthrough.call(vm, senderKey)
    widget.handleWithHivejs(
      { source: { postMessage }, origin: 'https://chat.peakd.com' },
      'message-1',
      'requestEncodeMessage',
      ['alice', 'bob', 'hello', 'Posting', recipientPublicKey]
    )
    await Promise.resolve()
    await Promise.resolve()

    expect(postMessage).toHaveBeenCalledTimes(1)
    const response = JSON.parse(postMessage.mock.calls[0][0][2])
    expect(response.success).toBe(true)
    expect(response.result).toEqual(expect.any(String))
  })

  it('sends posting-key failures to Sting as readable strings', async () => {
    const postMessage = jest.fn()
    const widget = { messageName: 'stlib0' }
    const vm = {
      widget,
      postWalletResponse: (...args) => {
        StingChat.methods.postWalletResponse.call(vm, ...args)
      },
      readableError: (error) => StingChat.methods.readableError.call(vm, error)
    }

    StingChat.methods.configurePostingKeyPassthrough.call(vm, '5Kposting')
    widget.handleWithHivejs(
      { source: { postMessage }, origin: 'https://chat.peakd.com' },
      'message-1',
      'unknownRequest',
      []
    )
    await Promise.resolve()
    await Promise.resolve()

    const response = JSON.parse(postMessage.mock.calls[0][0][2])
    expect(response).toBe('Unsupported chat signing request: unknownRequest')
  })

  it('signs Sting image-upload challenges with the posting key', async () => {
    const senderKey = hive.auth.toWif('alice', 'posting-key-test', 'posting')
    const postMessage = jest.fn()
    const widget = { messageName: 'stlib0' }
    const vm = {
      widget,
      postWalletResponse: (...args) => {
        StingChat.methods.postWalletResponse.call(vm, ...args)
      },
      readableError: (error) => StingChat.methods.readableError.call(vm, error)
    }

    StingChat.methods.configurePostingKeyPassthrough.call(vm, senderKey)
    widget.handleWithHivejs(
      { source: { postMessage }, origin: 'https://chat.peakd.com' },
      'upload-1',
      'requestSignBuffer',
      ['alice', 'upload/123/abc123', 'Posting']
    )
    await Promise.resolve()
    await Promise.resolve()

    const response = JSON.parse(postMessage.mock.calls[0][0][2])
    expect(response.success).toBe(true)
    expect(response.result).toMatch(/^[0-9a-f]{130}$/)
    const recoveredKey = Signature.fromString(response.result)
      .recover(cryptoUtils.sha256('upload/123/abc123'))
      .toString()
    expect(recoveredKey).toBe(PrivateKey.fromString(senderKey).createPublic().toString())
  })

  it('attaches a validated posting key that arrives after the widget mounts', () => {
    const widget = { setPostingKey: jest.fn(), setUser: jest.fn() }
    const vm = {
      widget,
      widgetError: 'Chat key expired.',
      user: { account: { name: 'alice' } },
      activeUsername: 'alice',
      configurePostingKey: (username, postingKey) => {
        StingChat.methods.configurePostingKey.call(vm, username, postingKey)
      },
      configurePostingKeyPassthrough: (postingKey) => {
        StingChat.methods.configurePostingKeyPassthrough.call(vm, postingKey)
      },
      postWalletResponse: (...args) => {
        StingChat.methods.postWalletResponse.call(vm, ...args)
      },
      readableError: (error) => StingChat.methods.readableError.call(vm, error)
    }

    StingChat.watch.chatPostingKey.call(vm, '5Kposting')

    expect(widget.setPostingKey).toHaveBeenCalledWith('5Kposting', expect.anything())
    expect(widget.setUser).toHaveBeenCalledWith('alice')
    expect(vm.widgetError).toBe('')
  })

  it('prompts a posting-key user instead of opening chat when the memory key is missing', () => {
    localStorage.setItem('acti_login_method', '')
    const container = { hidden: true }
    const vm = {
      user: { account: { name: 'alice' } },
      chatPostingKey: null,
      $refs: { widgetContainer: container },
      openPostingKeyPrompt: jest.fn()
    }

    StingChat.methods.toggleWidget.call(vm)

    expect(vm.openPostingKeyPrompt).toHaveBeenCalledTimes(1)
    expect(container.hidden).toBe(true)
  })

  it('validates and attaches a prompted posting key without persisting it', () => {
    const postingKey = hive.auth.toWif('alice', 'posting-key-test', 'posting')
    const publicKey = hive.auth.wifToPublic(postingKey)
    const container = { hidden: true }
    const store = { commit: jest.fn() }
    const vm = {
      postingKeyInput: postingKey,
      postingKeyError: '',
      showPostingKeyPrompt: true,
      user: {
        account: {
          posting: { key_auths: [[publicKey, 1]] }
        }
      },
      $store: store,
      $refs: { widgetContainer: container },
      $t: (key) => key,
      $nextTick: (callback) => callback()
    }
    vm.isValidPostingKey = (key) => StingChat.methods.isValidPostingKey.call(vm, key)
    vm.closePostingKeyPrompt = () => StingChat.methods.closePostingKeyPrompt.call(vm)

    StingChat.methods.submitPostingKey.call(vm)

    expect(store.commit).toHaveBeenCalledWith('setChatPostingKey', postingKey)
    expect(localStorage.getItem('chatPostingKey')).toBeNull()
    expect(vm.postingKeyInput).toBe('')
    expect(vm.showPostingKeyPrompt).toBe(false)
    expect(container.hidden).toBe(false)
  })

  it('rejects a posting key that does not belong to the logged-in account', () => {
    const accountKey = hive.auth.toWif('alice', 'posting-key-test', 'posting')
    const differentKey = hive.auth.toWif('bob', 'posting-key-test', 'posting')
    const store = { commit: jest.fn() }
    const vm = {
      postingKeyInput: differentKey,
      postingKeyError: '',
      user: {
        account: {
          posting: { key_auths: [[hive.auth.wifToPublic(accountKey), 1]] }
        }
      },
      $store: store,
      $t: (key) => key
    }
    vm.isValidPostingKey = (key) => StingChat.methods.isValidPostingKey.call(vm, key)

    StingChat.methods.submitPostingKey.call(vm)

    expect(store.commit).not.toHaveBeenCalled()
    expect(vm.postingKeyError).toBe('sting_chat_invalid_posting_key')
  })
})
