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
})
