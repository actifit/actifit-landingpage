/**
 * Receives Content-Security-Policy violation reports (see `render.csp` in
 * nuxt.config.js) and logs one compact line per distinct violation.
 *
 * While the policy runs in report-only mode these lines are how we find what an
 * enforced policy would break, before enforcing it. Reports are unauthenticated
 * and attacker-controllable, so: small body cap, only a few fields kept, values
 * truncated, and each distinct violation logged at most once per hour, with a
 * cap on how many distinct keys we track.
 */

const MAX_BODY = 16 * 1024;
const MAX_KEYS = 2000;
const WINDOW_MS = 60 * 60 * 1000;
const seen = new Map(); // key -> { first, count }

const clip = (v, n = 200) => (typeof v === 'string' ? v.slice(0, n) : '');

// A URL reduced to origin + path, so query strings (tokens, search terms) are not logged.
function stripQuery(u) {
  if (typeof u !== 'string') return '';
  try {
    const p = new URL(u);
    return clip(p.origin + p.pathname);
  } catch {
    return clip(u.split('?')[0]); // 'inline', 'eval', 'data', ...
  }
}

// Accepts both the legacy `report-uri` body ({ "csp-report": {...} }) and the
// Reporting API body ([{ type: 'csp-violation', body: {...} }]).
function normalise(payload) {
  const items = Array.isArray(payload) ? payload.map((r) => r && r.body) : [payload && payload['csp-report']];
  return items.filter((r) => r && typeof r === 'object').map((r) => ({
    directive: clip(r['effective-directive'] || r.effectiveDirective || r['violated-directive'], 60),
    blocked: stripQuery(r['blocked-uri'] || r.blockedURL),
    page: stripQuery(r['document-uri'] || r.documentURL),
    source: stripQuery(r['source-file'] || r.sourceFile),
    sample: clip(r['script-sample'] || r.sample, 80),
    disposition: clip(r.disposition, 10),
  }));
}

function record(v, now = Date.now()) {
  const key = v.directive + ' ' + v.blocked + ' ' + v.source;
  const entry = seen.get(key);
  if (entry && now - entry.first < WINDOW_MS) {
    entry.count += 1;
    return false;
  }
  seen.delete(key); // re-insert at the end, so Map order stays oldest-first
  // When full, evict the oldest key rather than drop new ones: otherwise 2000 junk
  // reports would silence every real violation for an hour.
  if (seen.size >= MAX_KEYS) seen.delete(seen.keys().next().value);
  seen.set(key, { first: now, count: 1 });
  return true;
}

function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end();
  }
  if (Number(req.headers && req.headers['content-length']) > MAX_BODY) {
    res.statusCode = 413;
    return res.end();
  }
  let size = 0;
  const chunks = [];
  let aborted = false;
  req.on('data', (c) => {
    if (aborted) return;
    size += c.length;
    if (size > MAX_BODY) {
      aborted = true;
      res.statusCode = 413;
      res.end();
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on('end', () => {
    if (aborted) return;
    try {
      for (const v of normalise(JSON.parse(Buffer.concat(chunks).toString('utf8')))) {
        if (record(v)) console.log('[csp] ' + JSON.stringify(v));
      }
    } catch {
      // malformed report: ignore
    }
    res.statusCode = 204;
    res.end();
  });
}

module.exports = handler;
module.exports._test = { normalise, record, seen };
