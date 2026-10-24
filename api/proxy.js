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
const http = axios.create({ timeout: 15000 });
// When an upstream call fails WITHOUT a response - a timeout above, a refused or
// reset connection - each catch below answers 503, not 500. That is accurate (the
// service is unavailable; nothing is wrong with the request), and it is the status
// the login client maps to "try again shortly" rather than "your key is incorrect".
const T = {
  login: 15000,     // under the client's 20s abort - see above
  quick: 10000,     // captcha check, account lookup: small reads
  reward: 15000,
  translate: 30000,
  gemini: 60000,    // an LLM call; legitimately slow
  upload: 60000,    // file bodies; legitimately slow
  // Generous on purpose. Timing out here does NOT cancel the upstream - the API may
  // still confirm the payment - so a premature error would tell the user it failed
  // when it did not, and invite them to pay twice. Kept under Cloudflare's 100s.
  payment: 90000
};
const url = require('url');

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
function isRateLimited(key, maxPerWindow = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = _rateMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
  entry.count++;
  _rateMap.set(key, entry);
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

      const model = parsedUrl.query.model || 'gemini-2.5-flash';
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Gemini API key not configured on server' }));
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await http.post(geminiUrl, JSON.parse(body), {
            headers: { 'Content-Type': 'application/json' },
            timeout: T.gemini
          });
          res.end(JSON.stringify(response.data));
        } catch (error) {
          res.statusCode = error.response ? error.response.status : 503;
          res.end(JSON.stringify(error.response ? error.response.data : { error: error.message }));
        }
      });
      return;
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
          res.statusCode = error.response ? error.response.status : 503;
          res.end(JSON.stringify(error.response ? error.response.data : { error: error.message }));
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
        res.statusCode = error.response ? error.response.status : 503;
        res.end(JSON.stringify(error.response ? error.response.data : { error: error.message }));
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
         if (error.response) {
            res.statusCode = error.response.status;
            res.end(JSON.stringify(error.response.data));
         } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Upload failed', details: error.message }));
         }
      }
      return;
    }

    // 5. Confirm Payment Proxy
    if (path === '/confirmPayment') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      const apiKey = process.env.CONFIRM_PAYMENT_API_KEY;
      if (!apiKey) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Confirm Payment API key not configured on server' }));
      }

      const baseApiUrl = (process.env.ACTI_API_URL || 'http://localhost:3120').replace(/\/?$/, '/');
      const targetUrl = `${baseApiUrl}confirmPayment`;

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const params = { ...JSON.parse(body), confirm_payment_token: apiKey };
          const response = await http.post(targetUrl, params, { timeout: T.payment });
          res.end(JSON.stringify(response.data));
        } catch (error) {
          res.statusCode = error.response ? error.response.status : 503;
          res.end(JSON.stringify(error.response ? error.response.data : { error: error.message }));
        }
      });
      return;
    }

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
        res.statusCode = error.response ? error.response.status : (error.statusCode || 503);
        return res.end(JSON.stringify(error.response ? error.response.data : { error: error.message }));
      }
    }

    if (path === '/verifyLoginCaptcha') {
      if (req.method !== 'GET') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(`${ip}:${path}`, 10, 60000)) {
        res.statusCode = 429;
        return res.end(JSON.stringify({ error: 'Too many requests' }));
      }

      const token = parsedUrl.query.token;
      if (!token || typeof token !== 'string') {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing captcha token' }));
      }

      const baseApiUrl = (process.env.ACTI_API_URL || 'https://api.actifit.io').replace(/\/?$/, '/');
      try {
        const response = await http.get(`${baseApiUrl}verifyLoginCaptcha`, {
          params: { token },
          timeout: T.quick
        });
        return res.end(JSON.stringify(response.data));
      } catch (error) {
        res.statusCode = error.response ? error.response.status : 503;
        return res.end(JSON.stringify(error.response ? error.response.data : { error: error.message }));
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
        res.statusCode = error.response ? error.response.status : 503;
        return res.end(JSON.stringify(error.response ? error.response.data : { error: error.message }));
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
