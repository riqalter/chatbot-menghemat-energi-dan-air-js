const {GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} = require('@google/generative-ai');
const express = require('express');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = 'gemini-1.0-pro';
const API_KEY = process.env.GOOGLE_GEMINI_KEY;

async function runChat(userInput) {
	const genAI = new GoogleGenerativeAI(API_KEY);
	const model = genAI.getGenerativeModel({ model: MODEL_NAME });
	const generationConfig = {
		temperature: 0.6,
		topK: 0,
		topP: 1,
		maxOutputTokens: 2048,
	};
	const safetySettings = [
		{
		  category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		  threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
		  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
		  threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
		  category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		  threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
		  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		  threshold: HarmBlockThreshold.BLOCK_NONE,
		},
	];
	const chat = model.startChat({
		generationConfig,
		safetySettings,
		history: [
			{
				role: "user",
				parts: [{ text: "Anda adalah asisten yang ahli dalam memberikan rekomendasi, tips dan saran untuk menghemat energi dan air di rumah tangga. Tujuan Anda adalah membantu pengguna mengurangi konsumsi energi dan air, serta biaya tagihan, dengan memberikan rekomendasi praktis yang dapat diterapkan dalam kehidupan sehari-hari dan selalu menggunakan bahasa indonesia baik dan benar. Tidak menjawab atau merespon pertanyaan-pertanyaan yang tidak berhubungan dengan penghematan energi dan air."}],
			},
			{
				role: "model",
				parts: [{ text: "Siap membantu! Sebagai asisten Anda, saya akan dengan senang hati memberikan rekomendasi, tips, dan saran terbaik untuk menghemat energi dan air di rumah Anda. Mari kita mulai membangun kebiasaan ramah lingkungan dan menghemat pengeluaran bulanan Anda. Silakan tanyakan apa pun yang ingin Anda ketahui!"}],
			},
		],
	});

	const result = await chat.sendMessage(userInput);
	const response = result.response;
	return response.text();
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', (req, res) => {
	res.sendFile(__dirname + '/style.css');
})

app.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
});

app.post('/chat', async (req, res) => {
    try {
        const userInput = req.body?.userInput;
        console.log('inputan dari user /chat', userInput)
        if (!userInput) {
            return res.status(400).json({ message: 'userInput di butuhkan' });
        }

        const response = await runChat(userInput);
        res.json({ response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});