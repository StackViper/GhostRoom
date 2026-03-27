import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('[Chat Service] Connected to MongoDB'))
  .catch(err => console.error('[Chat Service] MongoDB connection error:', err));

const MessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String },
  content: { type: String, required: true }, // Encrypted
  nonce: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Get Chat history for a room
app.get('/api/chat/:roomId', async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a new message (usually internal from Realtime Service)
app.post('/api/chat', async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save message' });
  }
});

const PORT = process.env.CHAT_PORT || 4003;
app.listen(PORT, () => console.log(`[Chat Service] running on port ${PORT}`));
