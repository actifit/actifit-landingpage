import Vue from 'vue'
import { Remarkable } from 'remarkable'

// The options the post page passes to SafeRemarkable.
const OPTIONS = { html: true, breaks: true, typographer: true }

// A post body as HTML, for the server render of a post page: the same pipeline the page
// runs in the browser ($cleanBody, then SafeRemarkable's Remarkable + $sanitizePostHtml),
// so crawlers and link previews get the post text instead of a spinner. On the server
// both sanitize steps take their sanitize-html branch (plugins/vue-custom.js).
export function renderPostBodyHtml (body) {
  if (typeof body !== 'string' || !body.trim()) return ''
  const cleaned = Vue.prototype.$cleanBody(body)
  if (!cleaned || !cleaned.trim()) return ''
  return Vue.prototype.$sanitizePostHtml(new Remarkable(OPTIONS).render(cleaned.trim()))
}
