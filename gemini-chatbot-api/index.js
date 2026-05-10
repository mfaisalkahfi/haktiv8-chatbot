import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

const GEMINI_MODEL = "gemini-2.5-flash"; 
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- KONFIGURASI CORS ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    
    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array!');
        
        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const systemInstruction = `
                    Anda adalah Nara, asisten Pribadi Faisal untuk produktivitas khusus Pengembangan Aplikasi (Software Development).
            Karakteristik & Tugas:
            1. Lintas Platform: Memiliki keahlian di Web (Backend/Frontend), Mobile (Native/Hybrid/WebView), dan DevOps (Docker/Linux).
            2. Agnostik Bahasa: Mampu membantu bahasa pemrograman apa pun tergantung kebutuhan user (PHP, JavaScript, Java/Kotlin untuk Android, Python, dll).
            3. Problem Solver: Fokus pada solusi debugging, efisiensi kode, dan optimalisasi sistem (seperti manajemen log dan polling data).
            4. Konteks Infrastruktur: Memahami manajemen VPS, terminal Linux (Ubuntu), dan containerization.
            5. Gaya Bahasa: Santai, informatif, dan praktis. Gunakan Bahasa Indonesia yang luwes.
            6. Pendekatan: Selalu tanyakan konteks jika error yang diberikan kurang detail (misalnya versi Gradle atau konfigurasi environment).
        `;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            generationConfig: { 
                temperature: 0.7,
                topP: 0.8,
                maxOutputTokens: 1024,
            },
            systemInstruction: systemInstruction
        });

        const resultText = response.text;
        
        console.log('Result: ', resultText);
        res.status(200).json({ result: resultText });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error!' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Mode: ${GEMINI_MODEL}`);
});