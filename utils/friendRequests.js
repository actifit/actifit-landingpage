import escapeHtml from './escapeHtml'

/**
 * Friend-request helpers shared by components/FriendshipModal.vue and
 * pages/_username/index.vue.
 *
 * Adding a friend signs and broadcasts an on-chain custom_json BEFORE the backend
 * is told about it, and the backend refuses a duplicate request. So the UI checks
 * what it already knows first and never asks the user to sign a transaction that
 * is bound to be refused.
 *
 * The two callers load the friend data for different accounts:
 *  - the modal loads the LOGGED-IN user's `userFriends/` and `userFriendRequests/`
 *  - the profile page loads them for the PROFILE OWNER (the add target)
 * `owner` says whose data `friends` / `requests` are, so both read it correctly.
 * `requests` is the `userFriendRequests/<owner>` reply: { sent_pending: [{target}],
 * received_pending: [{initiator}] }. `friends` is the `userFriends/<owner>` reply:
 * [{friend}].
 *
 * Returns the i18n key of the refusal that applies, or null when the add may go ahead.
 */
export function friendAddRefusal ({ me, target, owner, friends, requests }) {
  if (!me || !target) return null
  if (me === target) return 'Cannot_friend_self'

  const ownerIsMe = owner === me
  const other = ownerIsMe ? target : me
  const list = (v) => (Array.isArray(v) ? v : [])

  if (list(friends).some(f => f && f.friend === other)) return 'Already_friends'

  const reqs = requests || {}
  const sent = list(reqs.sent_pending)
  const received = list(reqs.received_pending)

  // me -> target pending
  const iSent = ownerIsMe
    ? sent.some(r => r && r.target === target)
    : received.some(r => r && r.initiator === me)
  if (iSent) return 'Friend_request_already_sent'

  // target -> me pending
  const theySent = ownerIsMe
    ? received.some(r => r && r.initiator === target)
    : sent.some(r => r && r.target === me)
  if (theySent) return 'Friend_request_received_accept_instead'

  return null
}

/**
 * Text to show when a friend endpoint answers with something other than success.
 * The backend's own `message` wins when present (e.g. "Friend request already sent"),
 * otherwise the caller's generic fallback. The server message is escaped because the
 * error slots render with v-html (they also carry our own translated markup).
 */
export function friendErrorText (outcome, fallback) {
  const msg = outcome && typeof outcome.message === 'string' ? outcome.message.trim() : ''
  return msg ? escapeHtml(msg) : fallback
}
