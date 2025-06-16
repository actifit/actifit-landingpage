

/**
 * Connecting to the Gemini API to translate text.
 * @param {string} textToTranslate The text to be translated.
 * @returns {Promise<string>} The translated text.
 */
export async function translateTextWithGemini(textToTranslate) {
  
  const apiKey = process.env.geminiApiKey;

  if (!apiKey) {
    console.error("Gemini API key is not configured in nuxt.config.js's env block.");
    throw new Error("Configuration error: Gemini API key is missing.");
  }
  

  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;


  const prompt = `Translate the following text to English. The text may contain Markdown or HTML formatting. Preserve the original formatting (like links, bolding, lists, etc.) as accurately as possible. Do not add any extra explanations, introductory phrases, or apologies. Return ONLY the translated text.\n\nText to translate:\n"""\n${textToTranslate}\n"""`;
  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

 
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Google API Error:', errorData);
    throw new Error('The API call to Google failed.');
  }


  const data = await response.json();
  
 
  const translatedText = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

  if (!translatedText) {
    throw new Error('Could not parse translated text from the API response.');
  }

  return translatedText;
}