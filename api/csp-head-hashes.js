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

// Finds each `data-hid="<hid>"` marker with indexOf and checks the tag around it,
// so the scan stays linear in the size of <head> whatever its content.
function headHashes(html) {
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) return [];
  const head = html.slice(0, headEnd);
  const hashes = [];
  for (const hid of TRUSTED_HIDS) {
    const marker = 'data-hid="' + hid + '"';
    let at = head.indexOf(marker);
    // Each trusted script appears once per page; a few tries bound the work.
    for (let tries = 0; at !== -1 && tries < 4; tries++) {
      const tagStart = head.lastIndexOf('<', at);
      const tagEnd = head.indexOf('>', at);
      if (tagEnd === -1) break;
      const close = head.indexOf('</script>', tagEnd);
      const openTag = tagStart === -1 ? '' :head.slice(tagStart, tagEnd);
      if (close !== -1 && /^<script\s/i.test(openTag) && !/\bsrc\s*=/i.test(openTag)) {
        const body = head.slice(tagEnd + 1, close);
        hashes.push(`'sha256-${crypto.createHash('sha256').update(body).digest('base64')}'`);
      }
      at = head.indexOf(marker, at + marker.length);
    }
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
