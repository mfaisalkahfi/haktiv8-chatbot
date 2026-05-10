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
    const {conversation} = req.body;
    
    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array!');
        
        const contents =  conversation.map(({role,text}) => ({
            role,
            parts: [{text}]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: "Jawab hanya bahasa Indonesia"
            }
        }) ;

        console.log('result: ', response.text);
        res.status(200).json({ result: response.text});
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'internal server error!'})
    }
 })

// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 20 * 1024 * 1024, // maxl 20MB
//     },
//     fileFilter: (req, file, cb) => {
//         const allowedMimeTypes = [
//             'image/jpeg', 'image/png', 'image/webp', 'image/heic', 
//             'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac',  
//             'application/pdf', 'text/plain'                      
//         ];

//         if (allowedMimeTypes.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error(`Format file ${file.mimetype} tidak didukung!`), false);
//         }
//     }
// });

// app.use(express.json());

// // --- ROUTES ---

// // text
// app.post('/generate-text', async (req, res) => {
//     const { prompt } = req.body;
//     if (!prompt) return res.status(400).json({ error: "Prompt harus diisi!" });

//     try {
//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: [{ role: 'user', parts: [{ text: prompt }] }]
//         });
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });

// // image
// app.post('/generate-from-image', upload.single("image"), async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ error: "File gambar (field: image) wajib ada!" });
        
//         const { prompt } = req.body;
//         const base64Data = req.file.buffer.toString("base64");

//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: [{
//                 role: 'user',
//                 parts: [
//                     { text: prompt || "Jelaskan gambar ini" },
//                     { inlineData: { data: base64Data, mimeType: req.file.mimetype } }
//                 ]
//             }],
//         });
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });

// // audio
// app.post('/generate-from-audio', upload.single("audio"), async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ error: "File audio (field: audio) wajib ada!" });

//         const { prompt } = req.body;
//         const base64Data = req.file.buffer.toString("base64");

//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: [{
//                 role: 'user',
//                 parts: [
//                     { text: prompt || "Tolong buat transkrip dan ringkasan dari audio ini." },
//                     { inlineData: { data: base64Data, mimeType: req.file.mimetype } }
//                 ]
//             }],
//         });
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });

// // document
// app.post('/generate-from-document', upload.single("document"), async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ error: "File dokumen (field: document) wajib ada!" });

//         const { prompt } = req.body;
//         const base64Data = req.file.buffer.toString("base64");

//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: [{
//                 role: 'user',
//                 parts: [
//                     { text: prompt || "Tolong ringkas dokumen ini." },
//                     { inlineData: { data: base64Data, mimeType: req.file.mimetype } }
//                 ]
//             }],
//         });
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });

// // middleware
// app.use((err, req, res, next) => {
//     if (err instanceof multer.MulterError) {
//         if (err.code === 'LIMIT_FILE_SIZE') {
//             return res.status(400).json({ error: "File terlalu besar! Maksimal 20MB." });
//         }
//         return res.status(400).json({ error: err.message });
//     } else if (err) {
//         return res.status(400).json({ error: err.message });
//     }
//     next();
// });

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Mode: ${GEMINI_MODEL}`);
});