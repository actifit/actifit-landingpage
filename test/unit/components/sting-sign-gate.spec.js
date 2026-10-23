/**
 * The Sting chat bridge must not be a general-purpose signing oracle.
 *
 * components/StingChat.vue loads https://chat.peakd.com/stwidget.js into the actifit.io
 * origin and, in posting-key mode, answers the chat frame's `requestSignBuffer` by
 * signing sha256(args[1]) with the user's private posting key -- no prompt, no content
 * check. The broadcast branch beside it gates on widget.isAllowedOperation(); this one
 * gated on nothing.
 *
 * That matters most with actifit-bot's signed-challenge login (#147): its challenge is
 * the "Log in to actifit.io / user / nonce" message, and a signature over it IS a full
 * API session. A compromised or malicious chat origin could request the challenge, have
 * this bridge sign it, and log in as the user without ever holding the key.
 *
 * The only payload this bridge legitimately signs is Sting's image-upload challenge
 * (upload/<id>/<token>) -- see the end-to-end case in StingChat.spec.js, which must keep
 * passing: a gate that breaks chat uploads is not a fix.
 */
import StingChat, { isStingSignable } from '@/components/StingChat.vue'
import hive from '@hiveio/hive-js'

describe('isStingSignable', () => {
  it('accepts the Sting upload challenge', () => {
    expect(isStingSignable('upload/123/abc123')).toBe(true)
    expect(isStingSignable('upload/a-b_c.d~e/0123456789abcdef')).toBe(true)
    expect(isStingSignable('upload/one/two/three')).toBe(true)
  })

  // The attack this gate exists for.
  it('REFUSES an actifit login challenge', () => {
    const challenge = 'Log in to actifit.io\nuser: mcfarhat\nnonce: ' + 'a'.repeat(64)
    expect(isStingSignable(challenge)).toBe(false)
  })

  it('refuses a login challenge dressed up with the upload prefix', () => {
    // the pattern is anchored AND excludes whitespace, so neither prefixing nor
    // appending the real challenge can smuggle it through
    expect(isStingSignable('upload/x/y Log in to actifit.io')).toBe(false)
    expect(isStingSignable('upload/x/y\nLog in to actifit.io\nnonce: aaa')).toBe(false)
    expect(isStingSignable('Log in to actifit.io\nupload/123/abc123')).toBe(false)
  })

  it('refuses other services challenges', () => {
    expect(isStingSignable(JSON.stringify({ token: 'x', ts: 1 }))).toBe(false)
    expect(isStingSignable('hiveauth:challenge:deadbeef')).toBe(false)
    expect(isStingSignable('"m","mcfarhat","$online"')).toBe(false)
  })

  it('refuses anything outside the upload namespace', () => {
    expect(isStingSignable('uploads/123/abc')).toBe(false)
    expect(isStingSignable('upload')).toBe(false)
    expect(isStingSignable('upload/')).toBe(false)
    expect(isStingSignable('/upload/123/abc')).toBe(false)
    expect(isStingSignable('sign me')).toBe(false)
    expect(isStingSignable('')).toBe(false)
  })

  it('refuses non-strings rather than coercing them', () => {
    expect(isStingSignable(null)).toBe(false)
    expect(isStingSignable(undefined)).toBe(false)
    expect(isStingSignable({ toString: () => 'upload/123/abc' })).toBe(false)
    expect(isStingSignable(['upload/123/abc'])).toBe(false)
  })

  it('bounds the length, so the digest input cannot be unbounded', () => {
    expect(isStingSignable('upload/' + 'a'.repeat(257))).toBe(false)
    expect(isStingSignable('upload/' + 'a'.repeat(200))).toBe(true)
  })
})

// The helper above is only half the fix: StWidget's own frameOrigin defaults to '*', so
// anything able to postMessage into the page could drive this bridge. These two drive the
// real handler rather than the helper.
describe('chat bridge guards', () => {
  const senderKey = hive.auth.toWif('alice', 'posting-key-test', 'posting')
  const LOGIN_CHALLENGE = ['Log in to actifit.io', 'user: alice', 'nonce: ' + 'a'.repeat(64)].join('\n')

  const driveBridge = (origin, payload) => {
    const postMessage = jest.fn()
    const widget = { messageName: 'stlib0' }
    const vm = {
      widget,
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

  it('refuses a signing request from an unexpected origin', async () => {
    const postMessage = driveBridge('https://evil.example', 'upload/123/abc123')
    await Promise.resolve()
    await Promise.resolve()

    // postWalletResponse unwraps failures to their readable string (Sting's modal
    // coerces an object to "[object Object]"), so a refusal arrives as text.
    const response = JSON.parse(postMessage.mock.calls[0][0][2])
    expect(typeof response).toBe('string')
    expect(response).toMatch(/refus|reject/i)
    // and nothing resembling a signature came back
    expect(response).not.toMatch(/^[0-9a-f]{130}$/)
  })

  it('refuses a login challenge even from the real chat origin', async () => {
    const postMessage = driveBridge('https://chat.peakd.com', LOGIN_CHALLENGE)
    await Promise.resolve()
    await Promise.resolve()

    // postWalletResponse unwraps failures to their readable string (Sting's modal
    // coerces an object to "[object Object]"), so a refusal arrives as text.
    const response = JSON.parse(postMessage.mock.calls[0][0][2])
    expect(typeof response).toBe('string')
    expect(response).toMatch(/refus|reject/i)
    // and nothing resembling a signature came back
    expect(response).not.toMatch(/^[0-9a-f]{130}$/)
  })
})
