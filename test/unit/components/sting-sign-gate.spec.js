/**
 * The Sting chat bridge must not be a general-purpose signing oracle -- but it must
 * still sign everything the chat legitimately needs.
 *
 * components/StingChat.vue loads https://chat.peakd.com/stwidget.js into the actifit.io
 * origin and, in posting-key mode, answers the chat frame's `requestSignBuffer` by
 * signing sha256(args[1]) with the user's private posting key: no prompt, no content
 * check. The broadcast branch beside it gates on widget.isAllowedOperation(); this one
 * gated on nothing.
 *
 * That matters most with actifit-bot's signed-challenge login: a signature over its
 * challenge message IS a full API session, so a compromised chat origin could have this
 * bridge sign one and log in as the user without ever holding the key.
 *
 * THE TRAP THIS SPEC EXISTS TO PREVENT: a first version of the gate allowed only
 * `upload/...`, on the assumption that image upload was the bridge's only job. It is not.
 * Sting signs message sends, DMs, edits, flags, preferences writes, downloads and its own
 * login proof through the same call -- so that gate would have broken chat entirely while
 * every test stayed green. The payload shapes below are taken from Sting's live bundles
 * (stuploader.js, stlib.js, the embed bundle), not inferred.
 */
import StingChat, { isStingSignable } from '@/components/StingChat.vue'
import hive from '@hiveio/hive-js'

const USER = 'alice'
const SHA = 'a'.repeat(64)
const CHALLENGE = ['Log in to actifit.io', 'user: alice', 'nonce: ' + 'a'.repeat(64)].join('\n')

// stlib.js SignableMessage.toSignableTextFormat():
//   JSON.stringify(type), mentions, conversation, json, timestamp -- joined by commas
const envelope = (json = '["t","hello there"]', user = USER) =>
  ['w', user, 'hive-193552/0', json, 1761300000000].map((v) => JSON.stringify(v)).join(',')

describe('isStingSignable - must ALLOW everything Sting really signs', () => {
  it('allows an image-upload challenge', () => {
    expect(isStingSignable('upload/12345/' + SHA, USER)).toBe(true)
  })

  it('allows a file-download challenge', () => {
    expect(isStingSignable('download/abc-123/1761300000000', USER)).toBe(true)
  })

  it('allows the first-time login proof for the signed-in user', () => {
    expect(isStingSignable('{login:"' + USER + '"}', USER)).toBe(true)
  })

  // The one the first attempt would have broken: every message, DM, edit, flag and
  // preferences write goes through this shape.
  it('allows a chat message envelope', () => {
    expect(isStingSignable(envelope(), USER)).toBe(true)
  })

  it('allows an envelope whose body is arbitrary user text', () => {
    expect(isStingSignable(envelope('["t","hi, there! 100% eee"]'), USER)).toBe(true)
    expect(isStingSignable(envelope('["t",""]'), USER)).toBe(true)
  })

  it('allows the presence write, which is Stings own and NOT a foreign challenge', () => {
    const presence = ['m', USER, '$online', JSON.stringify(['o', true, null, 0, 1]), 1761300000000]
      .map((v) => JSON.stringify(v)).join(',')
    expect(isStingSignable(presence, USER)).toBe(true)
  })
})

describe('isStingSignable - must REFUSE the login-challenge oracle', () => {
  it('REFUSES an actifit login challenge', () => {
    expect(isStingSignable(CHALLENGE, USER)).toBe(false)
  })

  it('refuses it however it is dressed up', () => {
    expect(isStingSignable('upload/1/' + SHA + '\n' + CHALLENGE, USER)).toBe(false)
    expect(isStingSignable(CHALLENGE + '\nupload/1/' + SHA, USER)).toBe(false)
    expect(isStingSignable('"' + CHALLENGE + '"', USER)).toBe(false)
  })

  // Smuggling it into the envelope body is harmless -- the signed bytes are the whole
  // envelope, so the signature does not verify against the bare challenge -- but the
  // 5-value structure is what makes that true, so pin it.
  it('a challenge inside an envelope body is not a signature over the challenge', () => {
    const smuggled = envelope(JSON.stringify(CHALLENGE))
    expect(isStingSignable(smuggled, USER)).toBe(true)
    expect(smuggled).not.toBe(CHALLENGE)
    expect(smuggled.indexOf('\n')).toBe(-1) // JSON-escaped, so the signed bytes differ
  })

  it('refuses a login proof naming a DIFFERENT user', () => {
    expect(isStingSignable('{login:"victim"}', USER)).toBe(false)
  })

  it('refuses free-form text and malformed envelopes', () => {
    expect(isStingSignable('sign me', USER)).toBe(false)
    expect(isStingSignable('', USER)).toBe(false)
    expect(isStingSignable('"w","alice","hive-193552/0"', USER)).toBe(false)   // 3 values
    expect(isStingSignable(envelope() + ',"extra"', USER)).toBe(false)         // 6 values
    expect(isStingSignable('"w","alice","conv","json","notanumber"', USER)).toBe(false)
  })

  it('refuses malformed upload/download shapes', () => {
    expect(isStingSignable('upload/notdigits/' + SHA, USER)).toBe(false)
    expect(isStingSignable('upload/1/NOTHEX' + 'z'.repeat(58), USER)).toBe(false)
    expect(isStingSignable('upload/../../etc/passwd', USER)).toBe(false)
    expect(isStingSignable('download/abc/notatime', USER)).toBe(false)
  })

  it('refuses non-strings rather than coercing them', () => {
    expect(isStingSignable(null, USER)).toBe(false)
    expect(isStingSignable(undefined, USER)).toBe(false)
    expect(isStingSignable({ toString: () => 'upload/1/' + SHA }, USER)).toBe(false)
    expect(isStingSignable(['upload/1/' + SHA], USER)).toBe(false)
  })
})

// The helper is only half the fix: StWidget's frameOrigin defaults to '*', so anything
// able to postMessage into the page could drive this bridge. These drive the real handler.
describe('chat bridge guards', () => {
  const senderKey = hive.auth.toWif('alice', 'posting-key-test', 'posting')

  const driveBridge = (origin, payload) => {
    const postMessage = jest.fn()
    const widget = { messageName: 'stlib0' }
    const vm = {
      widget,
      postingKeyUsername: USER,
      postWalletResponse: (...args) => StingChat.methods.postWalletResponse.call(vm, ...args),
      readableError: (error) => StingChat.methods.readableError.call(vm, error)
    }
    StingChat.methods.configurePostingKeyPassthrough.call(vm, senderKey)
    widget.handleWithHivejs(
      { source: { postMessage }, origin },
      'msg-1',
      'requestSignBuffer',
      ['alice', payload, 'Posting']
    )
    return postMessage
  }

  const parse = (pm) => JSON.parse(pm.mock.calls[0][0][2])

  it('signs a real chat message from the chat origin', async () => {
    const pm = driveBridge('https://chat.peakd.com', envelope())
    await Promise.resolve()
    await Promise.resolve()

    const response = parse(pm)
    expect(response.success).toBe(true)
    expect(response.result).toMatch(/^[0-9a-f]{130}$/)
  })

  it('refuses a signing request from an unexpected origin', async () => {
    const pm = driveBridge('https://evil.example', envelope())
    await Promise.resolve()
    await Promise.resolve()

    // postWalletResponse unwraps failures to their readable string
    const response = parse(pm)
    expect(typeof response).toBe('string')
    expect(response).toMatch(/refus|reject/i)
  })

  it('refuses a login challenge even from the real chat origin', async () => {
    const pm = driveBridge('https://chat.peakd.com', CHALLENGE)
    await Promise.resolve()
    await Promise.resolve()

    const response = parse(pm)
    expect(typeof response).toBe('string')
    expect(response).toMatch(/refus|reject/i)
  })
})
