import axios from 'axios';

const authKey = process.env.DEEPL_WEB_KEY; 

export async function translateText(text, targetLang = 'en') {
    try {
        const response = await axios.post('https://api.deepl.com/v2/translate', null, {
            params: {
                auth_key: authKey,
                text,
                target_lang: targetLang,
            }
        });
        
        return response.data;

    } catch (error) {
        throw new Error('Translation failed: ' + error.message);
    }
}

export default {
    translateText,
};
