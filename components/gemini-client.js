
/**
 * Connecting to the Gemini API to translate text.
 * @param {string} textToTranslate The text to be translated.
 * @returns {Promise<string>} The translated text.
 */
export async function translateTextWithGemini(textToTranslate) {

  // UPDATED LIST based on your 'Available Models' screenshot:
  const modelsToTry = [
    'gemini-2.5-flash',       // Priority 1: Newest (Retry this, the 503 error was temporary)
    'gemini-2.0-flash-lite',  // Priority 2: Lite version (Great for translation, less quota usage)
    'gemini-2.0-flash',       // Priority 3: Standard 2.0 (Currently hitting quota, but keep as backup)
    'gemini-2.0-flash-exp'    // Priority 4: Experimental version
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
      const errorMessage = errorData.error?.message || response.statusText;

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
      if (error.message.includes("Configuration") || error.message.includes("Invalid Key")) {
        throw error;
      }
    }
  }

  console.error("All Gemini models failed.");
  throw lastError || new Error("Failed to translate text with any Gemini model.");
}

async function checkAvailableModels() {
  const apiKey = process.env.geminiApiKey;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();

  // Filter for models that support 'generateContent'
  const availableModels = data.models
    .filter(m => m.supportedGenerationMethods.includes('generateContent'))
    .map(m => m.name); // e.g. "models/gemini-2.5-flash"

  console.log("Available Models:", availableModels);
}

