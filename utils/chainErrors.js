// What the nodes answer when asked for the posts of an account that does not exist:
// Blurt "Account not found", Hive an assert whose details say "Account <name> does not exist".
export function isMissingAccountError (err) {
  if (!err) return false
  let text = String(err.message || err)
  try { text += ' ' + JSON.stringify(err) } catch (e) { /* circular: the message is enough */ }
  return /account\b[^"]{0,40}?\b(not found|does not exist)/i.test(text)
}

// hive-js answers a missing account (-32602) not with an error but with the JSON *string*
// '{"id":0, "result":[], ...}'; spread as posts, it became one "post" per character.
export function blogPostsList (posts) {
  if (Array.isArray(posts)) return posts
  if (typeof posts === 'string') {
    try {
      const parsed = JSON.parse(posts)
      if (parsed && Array.isArray(parsed.result)) return parsed.result
    } catch (e) { /* not JSON: nothing usable */ }
  }
  return []
}
