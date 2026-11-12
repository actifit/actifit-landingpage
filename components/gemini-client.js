
/**
 * Connecting to the Gemini API to translate text.
 * @param {string} textToTranslate The text to be translated.
 * @returns {Promise<string>} The translated text.
 */
export async function translateTextWithGemini(textToTranslate) {

  // Tried in order; a 404 (retired model), 429 (quota) or 503 (overloaded) moves on to
  // the next. api/proxy.js accepts only these models, so change both lists together.
  // The gemini-2.0 models were retired by Google (404 since late 2026).
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ];

  const prompt = `Translate the following text to English. The text may contain Markdown or HTML formatting. Preserve the original formatting (like links, bolding, lists, etc.) as accurately as possible. Do not add any extra explanations, introductory phrases, or apologies. Return ONLY the translated text.\n\nText to translate:\n"""\n${textToTranslate}\n"""`;
  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

  // Helper to pause execution
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let lastError = null;

  // Loop through the models
  for (const model of modelsToTry) {
    try {
      console.log(`Attempting translation with model: ${model} via proxy...`);

      // Call local proxy endpoint instead of direct API
      const GEMINI_PROXY_URL = `/api/proxy/gemini?model=${model}`;

      const response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const translatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!translatedText) {
          throw new Error(`Parsed empty result from proxy for ${model}`);
        }

        console.log(`Success with ${model} via proxy`);
        return translatedText;
      }

      // Handle Errors
      const status = response.status;
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || errorData.error || response.statusText;

      // The proxy's own limit, not Google's quota: another model would only use up more
      // of this visitor's allowance.
      if (status === 429 && errorData.error === 'Too many requests') {
        const limited = new Error('Too many translations in a short time. Please wait a minute and try again.');
        limited.stop = true;
        throw limited;
      }

      // 429 = Quota Exceeded, 503 = Overloaded, 404 = Model Not Found
      if (status === 429 || status === 503 || status === 404) {
        console.warn(`Model ${model} failed (${status}): ${errorMessage}`);
        console.warn(`Switching to next available model...`);
        lastError = new Error(`API error: ${errorMessage}`);

        // Wait 1 second before trying the next model
        await wait(1000);
        continue;
      }

      throw new Error(`API Error (${model}): ${errorMessage}`);

    } catch (error) {
      lastError = error;
      if (error.stop || error.message.includes("Configuration") || error.message.includes("Invalid Key")) {
        throw error;
      }
    }
  }

  console.error("All Gemini models failed.");
  throw lastError || new Error("Failed to translate text with any Gemini model.");
}
