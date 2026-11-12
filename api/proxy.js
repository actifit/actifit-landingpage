const axios = require('axios');

// Every upstream call goes through this instance, and every one has a timeout.
//
// None of them had one. When an upstream stalled, the request hung, the Nuxt server
// held it open, and requests piled up behind it until Cloudflare gave up with a 504 -
// observed right after the signed-challenge login deployed (2026-10-24): login routes
// 504ing or taking 13-16s while the API answered directly in under a second.
//
// A LOCAL instance, not axios.defaults: require('axios') is a process-wide singleton,
// so changing its defaults here would silently change the timeout for every other
// axios caller in the server.
//
// Limits are per purpose (see T below). The binding constraint is login: the client
// aborts at 20s, so the proxy must give up FIRST and return a real error, rather than
// letting the browser's own abort or Cloudflare's 504 decide what the user sees.
const http = axios.create({
  timeout: 15000,
  // Cap upstream response bodies. Every upstream here is first-party, Google or DeepL, so
  // the risk is low - but the default is unlimited, and one oversized body can exhaust
  // the process for every user. /upload overrides this for itself.
  maxContentLength: 10 * 1024 * 1024
});

// axios `timeout` is NOT a total deadline. Under Node it bounds only the wait for the
// response HEADERS; after that just a socket-idle timer remains, so an upstream that
// drips its body slowly is never cut off (measured: a 40s drip succeeded through a 15s
// limit) - which is exactly the request pile-up these timeouts exist to stop. So every
// request also gets an AbortController fired at the same deadline.
//
// A manual AbortController, NOT AbortSignal.timeout(): production runs Node 16.20.2
// (package.json engines), and AbortSignal.timeout() only exists from Node 17.3. It would
// have thrown on every single upstream call.
http.interceptors.request.use((config) => {
  if (config.timeout && !config.signal) {
    const controller = new AbortController();
    config.signal = controller.signal;
    config.deadlineTimer = setTimeout(() => controller.abort(), config.timeout);
  }
  return config;
});
const clearDeadline = (config) => {
  if (config && config.deadlineTimer) clearTimeout(config.deadlineTimer);
};
http.interceptors.response.use(
  (response) => { clearDeadline(response.config); return response; },
  (error) => { clearDeadline(error.config); return Promise.reject(error); }
);

// The one failure path for every upstream call.
//
// Pass an upstream status through ONLY if it is a real error (>= 400). An upstream that
// stalls after sending its headers fails with error.response.status === 200, and passing
// that through answered the browser with a 200 and an empty body - which the login client
// then reported as "your key is incorrect". Anything without a real error status means
// the service is unavailable: 503, the status the client maps to "try again shortly".
//
// The body is generic on that path. It used to be error.message, which leaked internals
// to the browser (e.g. "connect ECONNREFUSED 127.0.0.1:3120").
const upstreamFailed = (res, error, route) => {
  const status = error && error.response && error.response.status;
  if (status && status >= 400) {
    res.statusCode = status;
    return res.end(JSON.stringify(error.response.data));
  }
  // Logged, so a timeout is diagnosable from pm2 instead of being a silent 503.
  console.warn('[proxy] upstream unavailable on ' + route + ':',
    (error && (error.code || error.name)) || '', (error && error.message) || '');
  res.statusCode = 503;
  return res.end(JSON.stringify({ error: 'Service temporarily unavailable' }));
};
// When an upstream call fails WITHOUT a response - a timeout above, a refused or
// reset connection - each catch below answers 503, not 500. That is accurate (the
// service is unavailable; nothing is wrong with the request), and it is the status
// the login client maps to "try again shortly" rather than "your key is incorrect".
const T = {
  login: 15000,     // under the client's 20s abort - see above
  quick: 10000,     // account lookup: a small read
  reward: 15000,
  translate: 30000,
  gemini: 60000,    // an LLM call; legitimately slow
  // The deadline covers the whole request INCLUDING the browser's upload, which is
  // streamed through (data: req) at the user's connection speed. 60s cut off a ~10MB
  // phone photo on a slow uplink. Kept under Cloudflare's 100s.
  upload: 90000
};
const url = require('url');

// The models components/gemini-client.js tries, in order. Google retires models: when one
// starts answering 404, replace it in both places.
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
const GEMINI_MAX_BODY = 256 * 1024;
const VALID_USER_RE = /^[a-z][a-z0-9.-]{2,15}$/;
const ALLOWED_URL_HOSTS = ['actifit.io', 'peakd.com', 'ecency.com', 'hive.blog'];

function isAllowedPostUrl(rawUrl) {
  try {
    const { hostname } = new URL(rawUrl);
    return ALLOWED_URL_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

// Simple in-memory sliding-window rate limiter
const _rateMap = new Map();
const RATE_MAP_MAX = 10000;
function isRateLimited(key, maxPerWindow = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = _rateMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
  entry.count++;
  _rateMap.set(key, entry);
  // Entries were never removed, so every new key (one per visitor and route) stayed for
  // the life of the process. Drop expired ones, and if a flood of new keys still leaves
  // too many, the oldest.
  if (_rateMap.size > RATE_MAP_MAX) {
    for (const [k, e] of _rateMap) if (now > e.resetAt) _rateMap.delete(k);
    for (const k of _rateMap.keys()) {
      if (_rateMap.size <= RATE_MAP_MAX) break;
      _rateMap.delete(k);
    }
  }
  return entry.count > maxPerWindow;
}

function readRequestBody(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bodySize = 0;
    req.on('data', chunk => {
      bodySize += Buffer.byteLength(chunk);
      if (bodySize > maxBytes) {
        const error = new Error('Request body too large');
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

module.exports = async function (req, res, next) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Set default response headers
  // Note: For /upload, we might override this or let the upstream response set it
  if (path !== '/upload') {
      res.setHeader('Content-Type', 'application/json');
  }

  try {
    // 1. Google Gemini Proxy
    if (path === '/gemini') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      // Only the translation models, at a translation pace: this route spends the site's
      // own Gemini key, so it must not run any model, any number of times, for anyone.
      const model = parsedUrl.query.model || GEMINI_MODELS[0];
      if (!GEMINI_MODELS.includes(model)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Model not allowed' }));
      }
      // cf-connecting-ip is set by Cloudflare; x-forwarded-for keeps whatever the caller
      // sent, so a made-up value per request would get a fresh allowance each time.
      const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(`${ip}:${path}`, 20, 60000)) {
        res.statusCode = 429;
        return res.end(JSON.stringify({ error: 'Too many requests' }));
      }
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Gemini API key not configured on server' }));
      }

      // A translation request is a post or comment (Hive caps a body at 64 KB) plus the
      // prompt; anything far larger is not one, and reading it all would fill memory.
      let payload;
      try {
        payload = JSON.parse(await readRequestBody(req, GEMINI_MAX_BODY));
      } catch (error) {
        res.statusCode = error.statusCode || 400;
        return res.end(JSON.stringify({ error: error.statusCode ? 'Request body too large' : 'Invalid request body' }));
      }
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await http.post(geminiUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: T.gemini
        });
        return res.end(JSON.stringify(response.data));
      } catch (error) {
        return upstreamFailed(res, error, path);
      }
    }

    // 2. DeepL Proxy
    if (path === '/deepl') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      const apiKey = process.env.DEEPL_WEB_KEY;
      if (!apiKey) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'DeepL API key not configured on server' }));
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const params = JSON.parse(body);
          const response = await http.post('https://api.deepl.com/v2/translate', null, {
            timeout: T.translate,
            params: {
              ...params,
              auth_key: apiKey
            }
          });
          res.end(JSON.stringify(response.data));
        } catch (error) {
          return upstreamFailed(res, error, path);
        }
      });
      return;
    }

    // 3. Actifit Reward Proxies (Vote, Comment, Edit)
    const rewardEndpoints = {
      '/reward-vote': { key: process.env.WEB_VOTE_REWARD_KEY, endpoint: 'rewardActifitWebVote', param: 'web_vote_token' },
      '/reward-comment': { key: process.env.WEB_COMMENT_REWARD_KEY, endpoint: 'rewardActifitWebComment', param: 'web_comment_token' },
      '/reward-edit': { key: process.env.WEB_EDIT_REWARD_KEY, endpoint: 'rewardActifitWebEdit', param: 'web_edit_token' }
    };

    if (rewardEndpoints[path]) {
      const { key, endpoint, param } = rewardEndpoints[path];
      const user = parsedUrl.query.user;
      const postUrl = parsedUrl.query.url;

      if (!key) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: `${path} token not configured on server` }));
      }

      if (!user || !VALID_USER_RE.test(user)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid username' }));
      }

      if (!postUrl || !isAllowedPostUrl(postUrl)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid or disallowed URL' }));
      }

      const userToken = req.headers['x-acti-token'] || '';
      if (!userToken) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Authentication required' }));
      }

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(`${ip}:${path}`, 10, 60000) || isRateLimited(`${ip}:${user}:${path}`, 5, 60000)) {
        res.statusCode = 429;
        return res.end(JSON.stringify({ error: 'Too many requests' }));
      }

      const baseApiUrl = (process.env.ACTI_API_URL || 'https://api2.actifit.io').replace(/\/?$/, '/');
      const targetUrl = `${baseApiUrl}${endpoint}/${user}`;

      try {
        const response = await http.get(targetUrl, {
            timeout: T.reward,
            params: { [param]: key, url: postUrl },
            headers: { 'x-acti-token': userToken },
        });
        return res.end(JSON.stringify(response.data));
      } catch (error) {
        return upstreamFailed(res, error, path);
        return;
      }
    }

    // 4. Image Upload Proxy
    if (path === '/upload') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      const apiKey = process.env.SEC_IMG_UPL_KEY;
      if (!apiKey) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Upload key not configured on server' }));
      }

      const targetUrl = 'https://usermedia.actifit.io/upload';

      const headers = {
        'Authorization': apiKey,
        'Content-Type': req.headers['content-type'],
        'Content-Length': req.headers['content-length']
      };

      try {
        const response = await http({
          method: 'post',
          url: targetUrl,
          timeout: T.upload,
          data: req,
          headers: headers,
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        });

        // The response from Actifit media server is usually JSON
        res.end(JSON.stringify(response.data));

      } catch (error) {
         console.error("Proxy upload error:", error.message);
         upstreamFailed(res, error, path);
      }
      return;
    }

    // 5. (removed) /confirmPayment: the old signup sent the new account's master password
    // through here. Signup now makes the keys in the browser and calls the API's
    // /app/signupQuote + /app/signupWithKeys directly with public keys only.

    // 6. Login proxies
    // /loginChallenge + /loginVerify are the signed-challenge login (actifit-bot #147).
    // The posting key is signed in the browser and only the SIGNATURE crosses the wire,
    // so no raw key passes through this proxy on those two routes.
    const loginPostEndpoints = ['/loginAuth', '/loginKeychain', '/loginKeychainVerify',
      '/loginChallenge', '/loginVerify'];
    if (loginPostEndpoints.includes(path)) {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(`${ip}:${path}`, 10, 60000)) {
        res.statusCode = 429;
        return res.end(JSON.stringify({ error: 'Too many requests' }));
      }

      const baseApiUrl = (process.env.ACTI_API_URL || 'https://api.actifit.io').replace(/\/?$/, '/');
      const targetUrl = `${baseApiUrl}${path.slice(1)}`;

      try {
        const body = await readRequestBody(req);
        const response = await http.post(targetUrl, body ? JSON.parse(body) : {}, {
          headers: { 'Content-Type': 'application/json' },
          timeout: T.login
        });
        return res.end(JSON.stringify(response.data));
      } catch (error) {
        return upstreamFailed(res, error, path);
      }
    }

    if (path === '/getAccountData') {
      if (req.method !== 'GET') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(`${ip}:${path}`, 10, 60000)) {
        res.statusCode = 429;
        return res.end(JSON.stringify({ error: 'Too many requests' }));
      }

      const user = parsedUrl.query.user;
      const bchain = parsedUrl.query.bchain;
      if (!user || !VALID_USER_RE.test(user)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid username' }));
      }
      if (!['HIVE', 'STEEM', 'BLURT'].includes(bchain)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid blockchain' }));
      }

      const baseApiUrl = (process.env.ACTI_API_URL || 'https://api.actifit.io').replace(/\/?$/, '/');
      try {
        const response = await http.get(`${baseApiUrl}getAccountData`, {
          params: { user, bchain },
          timeout: T.quick
        });
        return res.end(JSON.stringify(response.data));
      } catch (error) {
        return upstreamFailed(res, error, path);
      }
    }

    // Default: Not Found
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));

  } catch (error) {
    console.error("Proxy middleware error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
  }
};
