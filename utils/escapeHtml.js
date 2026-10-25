/**
 * Escape text for an HTML context.
 *
 * vue-notification renders a toast's `title` and `text` with v-html, and several
 * components render `errorProceed` with v-html too. Anything that did not come from our
 * own translation files - an RPC node's error message, a transaction id - goes through
 * this first, so a hostile or merely odd string is shown as text, never run as markup.
 */
export default function escapeHtml (value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
