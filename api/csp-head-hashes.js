/**
 * Nuxt hashes only its own inline state script (window.__NUXT__) into the CSP.
 * Inline scripts that modules add to <head> through vue-meta - today only the
 * Google Tag Manager bootstrap (@nuxtjs/gtm, hid "gtm-script") - would be
 * blocked once the policy is enforced.
 *
 * This adds their hashes, but only for scripts that sit inside <head> AND carry a
 * hid from TRUSTED_HIDS. Hashing every inline script on the page would hand the
 * policy's approval to any script an attacker gets into the server-rendered HTML.
 */
const crypto = require('crypto');

const TRUSTED_HIDS = ['gtm-script'];

const INLINE_SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function headHashes(html) {
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) return [];
  const head = html.slice(0, headEnd);
  const hashes = [];
  let m;
  while ((m = INLINE_SCRIPT_RE.exec(head)) !== null) {
    const attrs = m[1];
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const hid = /\bdata-hid="([^"]*)"/i.exec(attrs);
    if (!hid || !TRUSTED_HIDS.includes(hid[1])) continue;
    hashes.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`);
  }
  return hashes;
}

// Nuxt `render:route` hook. result.cspScriptSrcHashes is the array Nuxt builds the
// CSP header from right after this hook runs.
function addHeadHashes(url, result) {
  if (!result || typeof result.html !== 'string' || !Array.isArray(result.cspScriptSrcHashes)) return;
  for (const h of headHashes(result.html)) {
    if (!result.cspScriptSrcHashes.includes(h)) result.cspScriptSrcHashes.push(h);
  }
}

module.exports = { headHashes, addHeadHashes, TRUSTED_HIDS };
