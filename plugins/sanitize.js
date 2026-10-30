import DOMPurify from 'dompurify';

// $sanitize is deliberately NARROW. None of its consumers needs document structure:
//   - components/ListHeadingSection.vue:17 - a page <h1> whose text six pages build from
//     ROUTE INPUT ($route.query.q, $route.params.username), so it is attacker-controlled
//     via a bare link, rendered in the SSR response as well as after hydration.
//   - components/Product.vue:2891 - a feedback note interpolated into a URL query string.
//   - pages/settings.vue:652 - an API message shown in a toast.
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
  // rel: transformTags below sets it, and sanitize-html filters attributes after that.
  a: ['href', 'target', 'rel', 'data-toggle', 'data-target'],
  img: ['src', 'alt', 'class'],
  i: ['class'],
  span: ['class'],
};

const domPurifyOptions = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  // Otherwise DOMPurify keeps every data-* attribute (e.g. data-content for a Bootstrap
  // popover) while the SSR branch keeps only the two listed above.
  ALLOW_DATA_ATTR: false,
  // No ALLOWED_URI_REGEXP override - DOMPurify's safe default blocks javascript:, data:, vbscript:
};

// URL VALUES are restricted too. Tags and classes alone still let a crafted link show an
// attacker image of any size, linking off-site, inside the heading on actifit.io's own
// origin. Callers only ever pass our own logos and a same-page modal trigger.
const LOCAL_IMG_RE = /^\/img\/[\w./-]+$/;
const isLocalImg = (src) => typeof src === 'string' && LOCAL_IMG_RE.test(src) && src.indexOf('..') === -1;
const isLocalHref = (href) => typeof href === 'string' && (href === '#' || (/^\/(?![/\\])/.test(href) && !/[\s\\]/.test(href)));

// DOMPurify can allow-list attribute NAMES but not VALUES, and a global addHook would
// also apply to $cleanBody, which shares the DOMPurify singleton and legitimately needs
// many more classes (hljs, etc). So filter values in a separate pass instead.
function filterValues (html) {
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
  root.querySelectorAll('img').forEach((el) => { if (!isLocalImg(el.getAttribute('src'))) el.remove(); });
  root.querySelectorAll('a[href]').forEach((el) => { if (!isLocalHref(el.getAttribute('href'))) el.removeAttribute('href'); });
  root.querySelectorAll('a[target="_blank"]').forEach((el) => el.setAttribute('rel', 'noopener noreferrer'));
  return root.innerHTML;
}

export default ({ app }, inject) => {
  inject('sanitize', (dirty) => {
    // Guard the input: sanitize-html throws on a non-string ("this.buffers[0].slice is
    // not a function"), and on the server that is a 500 for the whole page rather than an
    // empty heading. $safeUrl below already guards its own input the same way.
    if (typeof dirty !== 'string') return '';

    if (process.client) {
      return filterValues(DOMPurify.sanitize(dirty, domPurifyOptions));
    } else {
      // Keep this require inside the else: webpack 4 drops a branch of a constant
      // `if (process.client)` from the client bundle, but not code after an early
      // return, and sanitize-html's htmlparser2 does not parse in webpack 4.
      const sanitizeHtml = require('sanitize-html');
      return sanitizeHtml(dirty, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: sanitizeHtmlAllowedAttributes,
        // sanitize-html filters class values natively; the client equivalent is
        // filterValues() above. Keep the two token lists identical.
        allowedClasses: { '*': ALLOWED_CLASS_TOKENS },
        // Same URL rules as filterValues(): only our own images, only local links.
        exclusiveFilter: (frame) => frame.tag === 'img' && !isLocalImg(frame.attribs.src),
        // Any target=_blank we emit gets noopener/noreferrer, matching what $cleanBody
        // already forces in plugins/vue-custom.js.
        transformTags: {
          a: (tagName, attribs) => {
            if ('href' in attribs && !isLocalHref(attribs.href)) delete attribs.href;
            if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer';
            return { tagName, attribs };
          },
        },
      });
    }
  });

  inject('safeUrl', (url) => {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('#')) return trimmed;
    if (trimmed.startsWith('/')) {
      // Browsers drop tabs/newlines inside URLs and treat "\" like "/", so "//x",
      // "/\x" and "/<tab>/x" all leave the site. Only a single leading "/" is local.
      const probe = trimmed.replace(/[\u0000-\u001F\u007F]/g, '');
      return /^\/[/\\]/.test(probe) ? '#' : trimmed;
    }
    // No hive:, steem: or hivesigner: - nothing links them, and they open a wallet
    // signing prompt with whatever operation the link carries.
    const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];
    try {
      const parsed = new URL(trimmed);
      if (ALLOWED_SCHEMES.includes(parsed.protocol)) return trimmed;
    } catch {}
    return '#';
  });

  // Profile link for an account name taken from untrusted data (post json_metadata).
  // Anything that is not a valid Hive account name could steer the link to another
  // page of the site ("../../x", "x?y"), so it gets no link.
  inject('hiveProfileUrl', (name) =>
    (typeof name === 'string' && /^[a-z][a-z0-9-]{2,15}(\.[a-z][a-z0-9-]{2,15})*$/.test(name) && name.length <= 16)
      ? '/@' + name
      : '#');
};
