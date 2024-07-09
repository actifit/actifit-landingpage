// services/translationService.js
import axios from 'axios';

const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
const apiUrl = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';

export const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post(
      apiUrl,
      [{ Text: text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/json',
        },
        params: {
          to: targetLanguage,
        },
      }
    );
    return response.data[0].translations[0].text;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};
