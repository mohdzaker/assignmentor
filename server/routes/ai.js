import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize LLM7 (OpenAI Compatible)
const openai = new OpenAI({
    baseURL: 'https://api.llm7.io/v1',
    apiKey: process.env.LLM7_API_KEY || 'unused', // User indicated they added a key, or 'unused' for public/free tier if applicable
});

router.post('/generate', async (req, res) => {
    try {
        const { prompt, topic, wordLimit } = req.body;

        // Construct a focused academic prompt
        const finalPrompt = `
      You are an expert academic assistant acting as a student.
      Assignment Topic: "${topic}"
      Word Limit Request: ${wordLimit || 'approx 500'} words.
      User Instruction: ${prompt}

      Please generate a comprehensive, well-structured academic response suitable for a college assignment.
      Include standardized headings and paragraphs. 
      Do not include "Here is the assignment" chatter. Just return the content.
    `;

        const completion = await openai.chat.completions.create({
            model: "default",
            messages: [
                { role: "user", content: finalPrompt }
            ],
        });

        const text = completion.choices[0]?.message?.content || "";

        res.json({ content: text });
    } catch (error) {
        console.error('LLM7/OpenAI API Error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { messages, topic } = req.body;

        const lastMessage = messages[messages.length - 1];
        const chatPrompt = `
            Context: Writing an assignment on "${topic}".
            User: ${lastMessage.content}
            
            Provide a helpful, concise academic assistance response.
        `;

        const completion = await openai.chat.completions.create({
            model: "default",
            messages: [
                { role: "user", content: chatPrompt }
            ],
        });

        const text = completion.choices[0]?.message?.content || "";

        res.json({ content: text });
    } catch (error) {
        console.error('LLM7/OpenAI Chat Error:', error);
        res.status(500).json({ error: 'Chat generation failed' });
    }
});

export default router;
