import DOMPurify from 'dompurify';

// $sanitize is deliberately NARROW. It has exactly two consumers and neither needs
// document structure:
//   - components/ListHeadingSection.vue:17 - a page <h1> whose text six pages build from
//     ROUTE INPUT ($route.query.q, $route.params.username), so it is attacker-controlled
//     via a bare link, rendered in the SSR response as well as after hydration.
//   - components/Product.vue:2979 - a feedback note interpolated into a URL query string.
//
// WHY THE TAG LIST SHRANK: allowing div/h1-h6/p/table alongside `class`, on a site that
// loads Bootstrap globally (nuxt.config.js:299), left a complete reflected UI-redress
// primitive even with every script vector blocked - `<div class="fixed-top w-100 h-100
// bg-white">` is a full-viewport panel on actifit.io's own origin, with actifit.io in the
// URL bar, reachable from one link. No script is involved, so no CSP would stop it.
// Pre-hydration it is worse, not better: the server response is parsed as a DOCUMENT, so
// an injected h1/div escapes the heading entirely, whereas h1.innerHTML on the client is
// fragment-parsed and confines it.
//
// What remains is the union of what the five markup-passing callers actually use:
// an <img> chain logo, an <a> modal trigger, and an <i> Font Awesome glyph.
const ALLOWED_TAGS = ['a', 'b', 'i', 'strong', 'em', 'br', 'img', 'span'];

// `name` is dropped: no caller uses it, and it is window named-property clobbering
// surface on a/img for free.
const ALLOWED_ATTR = ['href', 'target', 'src', 'alt', 'class', 'data-toggle', 'data-target'];

// Class VALUES are allow-listed, not just the attribute. Allowing arbitrary class values
// re-opens the overlay above through <span> even after the tag list is narrowed.
// These are the only classes the callers pass.
const ALLOWED_CLASS_TOKENS = [
  'mr-2', 'token-logo-md',            // chain logo sizing (communities, explore, blog, videos)
  'fas', 'fa-info-circle', 'text-white', // yieldfarming info icon
];

// Per-tag attributes for the sanitize-html (SSR) branch. This MUST stay in step with
// ALLOWED_ATTR above: sanitize-html takes a per-tag map and silently drops anything not
// listed, which is how yieldfarming's info button came to render correctly on the client
// and as an empty <a><i></i></a> in every server response - `i` had no entry at all and
// `a` was missing data-toggle/data-target.
const sanitizeHtmlAllowedAttributes = {
  a: ['href', 'target', 'data-toggle', 'data-target'],
  img: ['src', 'alt', 'class'],
  i: ['class'],
  span: ['class'],
};

const domPurifyOptions = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  // No ALLOWED_URI_REGEXP override - DOMPurify's safe default blocks javascript:, data:, vbscript:
};

// DOMPurify can allow-list attribute NAMES but not VALUES, and a global addHook would
// also apply to $cleanBody, which shares the DOMPurify singleton and legitimately needs
// many more classes (hljs, etc). So filter classes in a separate pass instead.
function filterClasses (html) {
  if (typeof document === 'undefined') return html;
  const doc = new DOMParser().parseFromString('<div id="r">' + html + '</div>', 'text/html');
  const root = doc.getElementById('r');
  if (!root) return html;
  root.querySelectorAll('[class]').forEach((el) => {
    const kept = (el.getAttribute('class') || '')
      .split(/\s+/)
      .filter((c) => ALLOWED_CLASS_TOKENS.indexOf(c) !== -1);
    if (kept.length) { el.setAttribute('class', kept.join(' ')); } else { el.removeAttribute('class'); }
  });
  return root.innerHTML;
}

export default ({ app }, inject) => {
  inject('sanitize', (dirty) => {
    // Guard the input: sanitize-html throws on a non-string ("this.buffers[0].slice is
    // not a function"), and on the server that is a 500 for the whole page rather than an
    // empty heading. $safeUrl below already guards its own input the same way.
    if (typeof dirty !== 'string') return '';

    if (process.client) {
      return filterClasses(DOMPurify.sanitize(dirty, domPurifyOptions));
    } else {
      // Keep this require inside the else: webpack 4 drops a branch of a constant
      // `if (process.client)` from the client bundle, but not code after an early
      // return, and sanitize-html's htmlparser2 does not parse in webpack 4.
      const sanitizeHtml = require('sanitize-html');
      return sanitizeHtml(dirty, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: sanitizeHtmlAllowedAttributes,
        // sanitize-html filters class values natively; the client equivalent is
        // filterClasses() above. Keep the two token lists identical.
        allowedClasses: { '*': ALLOWED_CLASS_TOKENS },
        // Any target=_blank we emit gets noopener/noreferrer, matching what $cleanBody
        // already forces in plugins/vue-custom.js.
        transformTags: {
          a: (tagName, attribs) => {
            if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer';
            return { tagName, attribs };
          },
        },
      });
    }
  });

  inject('safeUrl', (url) => {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return url;
    const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:', 'hive:', 'steem:', 'hivesigner:'];
    try {
      const parsed = new URL(url);
      if (ALLOWED_SCHEMES.includes(parsed.protocol)) return url;
    } catch {}
    return '#';
  });
};
