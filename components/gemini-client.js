// Tried in order; a 404 (retired model), 429 (Google's quota), 502 (empty answer), 503
// (overloaded or timed out) or this file's own timeout moves on to the next. api/proxy.js
// accepts only these models, so change both lists together.
export const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];

// Per model. The proxy gives up at 40 s and answers 503; this only fires if that answer
// never arrives, so the spinner cannot run for minutes.
export const MODEL_TIMEOUT_MS = 45000;

const RETRY_STATUSES = [404, 429, 502, 503];
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Translates a post or comment to English through the site's Gemini proxy, which builds
 * the prompt itself (the browser sends only the text).
 * @param {string} textToTranslate The text to be translated.
 * @returns {Promise<string>} The translated text.
 */
export async function translateTextWithGemini(textToTranslate) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    // A manual AbortController: AbortSignal.timeout() is missing from older browsers.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
    try {
      const response = await fetch(`/api/proxy/gemini?model=${model}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (!data.text) throw new Error(`Empty translation from ${model}`);
        return data.text;
      }

      const errorMessage = (data.error && data.error.message) || data.error || response.statusText;

      // The proxy's own limit, not Google's quota: another model would only use up more
      // of this visitor's allowance.
      if (response.status === 429 && data.error === 'Too many requests') {
        const limited = new Error('Too many translations in a short time. Please wait a minute and try again.');
        limited.stop = true;
        throw limited;
      }

      if (RETRY_STATUSES.includes(response.status)) {
        console.warn(`Model ${model} failed (${response.status}): ${errorMessage}; trying the next one`);
        lastError = new Error(`API error: ${errorMessage}`);
        await wait(1000);
        continue;
      }

      // 400 (bad request), 500 (no key on the server): the next model would fail the same way.
      const fatal = new Error(`Translation failed: ${errorMessage}`);
      fatal.stop = true;
      throw fatal;
    } catch (error) {
      if (error.stop) throw error;
      lastError = error.name === 'AbortError'
        ? new Error(`Translation timed out on ${model}`)
        : error;
    } finally {
      clearTimeout(timer);
    }
  }

  console.error('All Gemini models failed.');
  throw lastError || new Error('Failed to translate text with any Gemini model.');
}
