import axios from 'axios';

export async function translateText(text, targetLang = 'en') {
    try {
        const response = await axios.post('/api/proxy/deepl', {
            text,
            target_lang: targetLang,
        });
        
        return response.data;

    } catch (error) {
        throw new Error('Translation via proxy failed: ' + error.message);
    }
}

export default {
    translateText,
};
