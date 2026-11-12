// Which links in a post open without the "you are leaving Actifit" warning.
//
// The check used to be a prefix regex, so "https://youtube.com.evil.com",
// "https://actifit.io@evil.com" (goes to evil.com) and "//evil.com" all passed as
// trusted. This parses the link with the same URL parser the browser uses, so the host
// checked is the host the browser will open.

const TRUSTED_LINK_HOSTS = [
  'actifit.io', 'peakd.com', 'ecency.com', 'hive.blog', 'leofinance.io', 'travelfeed.com',
  '3speak.tv', 'steemit.com', 'hivesigner.com', 'vimm.tv', 'd.tube', 'bit.ly',
  'youtube.com', 'youtu.be', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
  'discord.gg', 'discord.com', 'telegram.me', 't.me',
]

// As a browser reads an href: spaces and control characters trimmed from the ends,
// tabs and newlines dropped inside ("/<tab>/evil.com" is "//evil.com").
const normalize = (href) => href.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '').replace(/[\t\n\r]/g, '')

// A link to a page or anchor on this site. "//x" and "/\x" leave the site.
export function isSiteLink (href) {
  if (typeof href !== 'string') return false
  const h = normalize(href)
  return h.startsWith('#') || /^\/(?![/\\])/.test(h)
}

export function isTrustedLink (href) {
  if (typeof href !== 'string') return false
  if (isSiteLink(href)) return true
  let url
  try { url = new URL(normalize(href)) } catch { return false }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
  if (url.username || url.password) return false
  const host = url.hostname.toLowerCase().replace(/\.$/, '') // "peakd.com." is peakd.com
  return TRUSTED_LINK_HOSTS.some((h) => host === h || host.endsWith('.' + h))
}
