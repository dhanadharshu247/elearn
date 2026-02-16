const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate-quiz', upload.single('file'), async (req, res) => {
    try {
        let text = req.body.text || '';

        // Handle file upload
        if (req.file) {
            const buffer = fs.readFileSync(req.file.path);
            if (req.file.mimetype === 'application/pdf') {
                const data = await pdf(buffer);
                text += '\n' + data.text;
            } else {
                // Assume text file
                text += '\n' + buffer.toString();
            }
            // Clean up
            fs.unlinkSync(req.file.path);
        }

        if (!text.trim()) {
            return res.status(400).json({ detail: 'No text or file provided' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Generate a quiz based on the following text. 
        Create 5 multiple choice questions.
        Return ONLY a raw JSON array (no markdown code blocks) with this structure:
        [
            {
                "questionText": "Question here",
                "options": [
                    {"text": "Option 1"},
                    {"text": "Option 2"},
                    {"text": "Option 3"},
                    {"text": "Option 4"}
                ],
                "correctOptionIndex": 0
            }
        ]
        
        Text to process:
        ${text.substring(0, 5000)} 
        `; // Limit text length for safety

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean markdown if present
        const jsonStr = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');

        try {
            const quiz = JSON.parse(jsonStr);
            res.json(quiz);
        } catch (e) {
            console.error('AI Parse Error:', textResponse);
            res.status(500).json({ detail: 'Failed to parse AI response', raw: textResponse });
        }

    } catch (error) {
        console.error('AI Generation Error:', error);
        console.error('Stack:', error.stack);
        if (error.response) {
            console.error('Gemini API Error details:', error.response);
        }
        res.status(500).json({ detail: 'AI Generation Failed: ' + error.message });
    }
});

module.exports = router;
