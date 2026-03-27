import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import axios from 'axios';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict to frontend domain
    methods: ["GET", "POST"]
  }
});

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('[Realtime Service] Connected to MongoDB'))
  .catch(err => console.error('[Realtime Service] MongoDB connection error:', err));

// Activity Schema for Presence/Logs
const Activity = mongoose.model('Activity', new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  action: { type: String, enum: ['JOIN', 'LEAVE', 'SHARE_SCREEN', 'STOP_SHARE'], required: true },
  timestamp: { type: Date, default: Date.now }
}));

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:4003';

io.on('connection', (socket) => {
  console.log('[Socket] New connection:', socket.id);

  socket.on('join_room', async ({ roomId, userId, username }) => {
    socket.join(roomId);
    socket.data.userId = userId;
    socket.data.roomId = roomId;
    
    // Log Activity
    await Activity.create({ roomId, userId, action: 'JOIN' });
    
    // Broadcast to others in the room
    socket.to(roomId).emit('user_joined', { userId, username, socketId: socket.id });
    console.log(`[Socket] User ${userId} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    // data: { roomId, content, nonce, senderId, senderName }
    
    // 1. Broadcast to room immediately for real-time feel
    io.to(data.roomId).emit('new_message', {
        ...data,
        timestamp: new Date()
    });

    // 2. Persist to MongoDB via Chat Service
    try {
        await axios.post(`${CHAT_SERVICE_URL}/api/chat`, data);
    } catch (err: any) {
        console.error('Signaling error:', err.message);
    }
  });

  // --- WebRTC Signaling ---
  
  socket.on('signal_offer', ({ to, offer, type }) => {
    io.to(to).emit('signal_offer', { from: socket.id, offer, type });
  });

  socket.on('signal_answer', ({ to, answer }) => {
    io.to(to).emit('signal_answer', { from: socket.id, answer });
  });

  socket.on('signal_ice', ({ to, candidate }) => {
    io.to(to).emit('signal_ice', { from: socket.id, candidate });
  });

  // --- Leave/Disconnect ---

  socket.on('leave_room', async () => {
    const { roomId, userId } = socket.data;
    if (roomId && userId) {
        socket.leave(roomId);
        await Activity.create({ roomId, userId, action: 'LEAVE' });
        socket.to(roomId).emit('user_left', { userId });
    }
  });

  socket.on('disconnect', async () => {
    const { roomId, userId } = socket.data;
    if (roomId && userId) {
        await Activity.create({ roomId, userId, action: 'LEAVE' });
        socket.to(roomId).emit('user_left', { userId });
    }
    console.log('[Socket] Disconnected:', socket.id);
  });
});

const PORT = process.env.REALTIME_PORT || 4004;
httpServer.listen(PORT, () => {
  console.log(`[Realtime Service] running on port ${PORT}`);
});
