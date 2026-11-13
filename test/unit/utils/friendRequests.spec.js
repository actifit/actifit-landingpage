import { friendAddRefusal, friendErrorText } from '~/utils/friendRequests'

// alice (logged in) wants to add bob.
describe('friendAddRefusal', () => {
  describe('data loaded for the logged-in user (FriendshipModal)', () => {
    const base = { me: 'alice', target: 'bob', owner: 'alice' }

    it('allows the add when nothing is pending', () => {
      expect(friendAddRefusal({ ...base, friends: [{ friend: 'carol' }], requests: { sent_pending: [{ target: 'dave' }], received_pending: [{ initiator: 'erin' }] } })).toBeNull()
    })
    it('refuses adding yourself', () => {
      expect(friendAddRefusal({ ...base, target: 'alice', friends: [], requests: {} })).toBe('Cannot_friend_self')
    })
    it('refuses when already friends', () => {
      expect(friendAddRefusal({ ...base, friends: [{ friend: 'bob' }], requests: {} })).toBe('Already_friends')
    })
    it('refuses when alice already sent bob a request', () => {
      expect(friendAddRefusal({ ...base, friends: [], requests: { sent_pending: [{ target: 'bob' }], received_pending: [] } })).toBe('Friend_request_already_sent')
    })
    it('refuses when bob already sent alice a request', () => {
      expect(friendAddRefusal({ ...base, friends: [], requests: { sent_pending: [], received_pending: [{ initiator: 'bob' }] } })).toBe('Friend_request_received_accept_instead')
    })
  })

  describe('data loaded for the profile owner (profile page)', () => {
    const base = { me: 'alice', target: 'bob', owner: 'bob' }

    it('allows the add when bob has unrelated requests', () => {
      expect(friendAddRefusal({ ...base, friends: [{ friend: 'carol' }], requests: { sent_pending: [{ target: 'carol' }], received_pending: [{ initiator: 'dave' }] } })).toBeNull()
    })
    it('refuses when already friends (bob lists alice)', () => {
      expect(friendAddRefusal({ ...base, friends: [{ friend: 'alice' }], requests: {} })).toBe('Already_friends')
    })
    it('refuses when alice already sent bob a request (bob received it)', () => {
      expect(friendAddRefusal({ ...base, friends: [], requests: { sent_pending: [], received_pending: [{ initiator: 'alice' }] } })).toBe('Friend_request_already_sent')
    })
    it('refuses when bob already sent alice a request', () => {
      expect(friendAddRefusal({ ...base, friends: [], requests: { sent_pending: [{ target: 'alice' }], received_pending: [] } })).toBe('Friend_request_received_accept_instead')
    })
  })

  it('tolerates data that has not loaded yet (initial [] / null / error object)', () => {
    for (const requests of [[], null, undefined, { status: 'error' }]) {
      expect(friendAddRefusal({ me: 'alice', target: 'bob', owner: 'alice', friends: null, requests })).toBeNull()
    }
  })
})

describe('friendErrorText', () => {
  it('shows the server message when present', () => {
    expect(friendErrorText({ status: 'error', message: 'Friend request already sent' }, 'unknown_error')).toBe('Friend request already sent')
  })
  it('escapes the server message (rendered with v-html)', () => {
    expect(friendErrorText({ status: 'error', message: '<img src=x onerror=alert(1)>' }, 'x')).toBe('&lt;img src=x onerror=alert(1)&gt;')
  })
  it('falls back when there is no usable message', () => {
    expect(friendErrorText({ status: 'error' }, 'unknown_error')).toBe('unknown_error')
    expect(friendErrorText({ status: 'error', message: '   ' }, 'unknown_error')).toBe('unknown_error')
    expect(friendErrorText({ status: 'error', message: { a: 1 } }, 'unknown_error')).toBe('unknown_error')
    expect(friendErrorText(null, 'unknown_error')).toBe('unknown_error')
  })
})
