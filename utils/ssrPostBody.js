// A post body as plain-text paragraphs, for the server render of a post page, so
// crawlers, link previews and AI search read the post instead of a spinner. The browser
// replaces it with the fully formatted post once loaded.
//
// Text only, on purpose. The browser's pipeline ($cleanBody, marked, highlight.js,
// Remarkable, the sanitizers) is fine in one visitor's tab, but a review of PR #536
// timed crafted 16 KB bodies at 7-15 s in it (backtracking regexes, marked's emphasis
// parser); on the server's single thread that freezes the whole site, and a post costs
// nothing to publish. Here every pattern has bounded repetition and no nested
// quantifiers, so the work grows linearly with the body, and the output is escaped text,
// so it needs no sanitizer.

const MAX_INPUT = 64 * 1024 // Hive's own limit on a post body
const MAX_TEXT = 20000 // more text than a crawler's snippet needs

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function postBodyText (body) {
  if (typeof body !== 'string') return ''
  return body.slice(0, MAX_INPUT)
    .replace(/\r\n?/g, '\n')
    .replace(/<(?:br|\/p|\/div|\/h[1-6]|\/li)\b[^<>]{0,200}>/gi, '\n\n') // block ends become breaks
    .replace(/<[^<>]{0,500}>/g, ' ') // other HTML tags
    .replace(/!\[[^\[\]\n]{0,300}\]\([^()\s]{0,1000}\)/g, ' ') // markdown images
    .replace(/\[([^\[\]\n]{0,300})\]\([^()\s]{0,1000}\)/g, '$1') // markdown links: keep the text
    .replace(/https?:\/\/[^\s<>()]{1,1000}/g, ' ') // bare URLs
    .replace(/&nbsp;/gi, ' ')
    .replace(/^ {0,3}(?:#{1,6}|>|[-*+]|\d{1,9}[.)])[ \t]/gm, '') // heading, quote and list markers
    .replace(/[*_~`|]+/g, '') // emphasis, code and table markup
    .replace(/[ \t]+/g, ' ')
    .slice(0, MAX_TEXT)
}

// Escaped <p> paragraphs, or '' when the post has no text.
export function renderPostBodyHtml (body) {
  return postBodyText(body)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((p) => '<p>' + escapeHtml(p) + '</p>')
    .join('')
}
