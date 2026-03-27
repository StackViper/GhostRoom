import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.AI_SERVICE_PORT || 4005;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  const { messages, roomName } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI Service: GEMINI_API_KEY is not configured' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const chatHistory = messages
      .map(m => `${m.sender}: ${m.text}`)
      .join('\n');

    const prompt = `
      You are an AI assistant for the GhostRoom virtual meeting platform. 
      Summarize the following chat history from the room "${roomName}". 
      Highlight the key points, decisions made, and follow-up actions.
      Keep the summary concise (under 200 words).
      
      Chat History:
      ${chatHistory}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });
  } catch (error: any) {
    console.error('[AI Service] Summarization failed:', error);
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', service: 'AI Service' });
});

app.listen(PORT, () => {
  console.log(`[AI Service] running on port ${PORT}`);
});
