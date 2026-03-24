const axios = require('axios');
const url = require('url');

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
          const response = await axios.post(geminiUrl, JSON.parse(body), {
            headers: { 'Content-Type': 'application/json' }
          });
          res.end(JSON.stringify(response.data));
        } catch (error) {
          res.statusCode = error.response ? error.response.status : 500;
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
          const response = await axios.post('https://api.deepl.com/v2/translate', null, {
            params: {
              ...params,
              auth_key: apiKey
            }
          });
          res.end(JSON.stringify(response.data));
        } catch (error) {
          res.statusCode = error.response ? error.response.status : 500;
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

      const baseApiUrl = process.env.ACTI_API_URL || 'https://api2.actifit.io/';
      const targetUrl = `${baseApiUrl}${endpoint}/${user}`;
      
      try {
        const response = await axios.get(targetUrl, {
            params: {
            [param]: key,
            url: postUrl
            }
        });
        return res.end(JSON.stringify(response.data));
      } catch (error) {
        res.statusCode = error.response ? error.response.status : 500;
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
        const response = await axios({
          method: 'post',
          url: targetUrl,
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

    // Default: Not Found
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));

  } catch (error) {
    console.error("Proxy middleware error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
  }
};
