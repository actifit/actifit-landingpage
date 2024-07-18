const express = require('express');
const bodyParser = require('body-parser');
const deepl = require('deepl-node');

const app = express();
const port = 3000;
const authKey = 'YOUR_AUTH_KEY'; // Replace with your actual DeepL API key
const translator = new deepl.Translator(authKey);

app.use(bodyParser.json());

app.post('/translate', async (req, res) => {
    const { text, targetLang } = req.body;
    try {
        const result = await translator.translateText(text, null, targetLang);
        res.json({ translatedText: result.text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Translation server running at http://localhost:${port}`);
});
