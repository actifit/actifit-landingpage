import DOMPurify from 'dompurify';

// DOMPurify expects ALLOWED_ATTR as a flat array of attribute names.
// The sanitize-html (SSR) path needs the per-tag object form — kept separate below.
const domPurifyOptions = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
  ],
  ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'class'],
  // No ALLOWED_URI_REGEXP override — DOMPurify's safe default blocks javascript:, data:, vbscript:
};

// Per-tag allowedAttributes for sanitize-html (SSR path)
const sanitizeHtmlAllowedAttributes = {
  a: ['href', 'name', 'target'],
  img: ['src', 'alt', 'class'],
  div: ['class'],
  span: ['class'],
};


export default ({ app }, inject) => {
  inject('sanitize', (dirty) => {
    if (process.client) {
      return DOMPurify.sanitize(dirty, domPurifyOptions);
    } else {
      const sanitizeHtml = require('sanitize-html');
      return sanitizeHtml(dirty, {
        allowedTags: domPurifyOptions.ALLOWED_TAGS,
        allowedAttributes: sanitizeHtmlAllowedAttributes,
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
