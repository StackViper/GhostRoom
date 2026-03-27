import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const LOG_FILE = '/tmp/room_auth.log';
const log = (msg: string) => {
  const line = `${new Date().toISOString()} - ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line);
};

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = 'GHOSTROOM_FIX_123'; // DEBUG HARDCODED

// Middleware to authenticate user from JWT
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  log(`DEBUG: Auth Header: ${authHeader}`);
  
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    log('ERROR: No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const rawDecoded = jwt.decode(token);
    log(`DEBUG: Raw Decoded: ${JSON.stringify(rawDecoded)}`);
    log(`DEBUG: Using Secret: ${JWT_SECRET}`);

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    log(`SUCCESS: Decoded User: ${JSON.stringify(decoded)}`);
    next();
  } catch (err: any) {
    log(`ERROR: JWT Verification Failed: ${err.message}`);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create Room
app.post('/api/rooms/create', authenticate, async (req: any, res: Response) => {
  const { name } = req.body;
  const ownerId = req.user.id;
  
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ name, owner_id: ownerId }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Automatically add owner as member
  await supabase.from('room_memberships').insert([{
    room_id: data.id,
    user_id: ownerId
  }]);

  res.status(201).json(data);
});

// Invite User to Room (Owner Only)
app.post('/api/rooms/invite', authenticate, async (req: any, res: Response) => {
  const { roomId, username } = req.body;
  const adminId = req.user.id;

  // 1. Verify requester is the owner
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('owner_id')
    .eq('id', roomId)
    .single();

  if (roomError || room.owner_id !== adminId) {
    return res.status(403).json({ error: 'Only the room owner can invite users' });
  }

  // 2. Find target user by username
  const { data: targetUser, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (userError || !targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 3. Add to room
  const { error: joinError } = await supabase
    .from('room_memberships')
    .insert([{ room_id: roomId, user_id: targetUser.id }]);

  if (joinError) {
    if (joinError.code === '23505') return res.status(400).json({ error: 'User is already in this room' });
    return res.status(400).json({ error: joinError.message });
  }

  res.status(200).json({ message: `Successfully invited ${username}` });
});

// Join Room via Invite Token
app.post('/api/rooms/join', authenticate, async (req: any, res: Response) => {
  const { roomId, token } = req.body;
  const userId = req.user.id;

  log(`INCOMING: Join request for roomId: ${roomId} with token: ${token}`);

  // 1. Verify the token (Optional but recommended)
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('access_token')
    .eq('id', roomId)
    .single();

  if (roomError) {
    log(`ERROR: Join failed - Room lookup error: ${roomError.message} for ID: ${roomId}`);
    return res.status(404).json({ error: 'Room not found. Check if the ID is a full valid UUID.' });
  }

  // If token is provided, it must match. If not provided, we allow it (UUID security)
  if (token && room.access_token !== token) {
    return res.status(403).json({ error: 'Invalid invite token' });
  }

  // 2. Add as member
  const { error } = await supabase
    .from('room_memberships')
    .insert([{ room_id: roomId, user_id: userId }]);

  if (error && error.code !== '23505') return res.status(400).json({ error: error.message });

  res.status(200).json({ message: 'Joined room successfully' });
});

// Get My Rooms
app.get('/api/rooms/my-rooms', authenticate, async (req: any, res: Response) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('room_memberships')
    .select(`
      room_id,
      rooms (*)
    `)
    .eq('user_id', userId);

  if (error) {
    log(`ERROR: Fetch my-rooms failed: ${error.message}`);
    return res.status(400).json({ error: error.message });
  }
  
  const rooms = (data || []).map((membership: any) => membership.rooms).filter(Boolean);
  res.json(rooms);
});

// Get Room Details (Requires Token OR Membership)
app.get('/api/rooms/:id', authenticate, async (req: any, res: Response) => {
  const { token } = req.query;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      owner:profiles!owner_id(username, full_name),
      members:room_memberships(user_id)
    `)
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Room not found' });

  const isMember = data.members.some((m: any) => m.user_id === userId);
  const isOwner = data.owner_id === userId;

  if (!isOwner && !isMember && data.access_token !== token) {
     return res.status(403).json({ error: 'Unauthorized access. Invite token required.' });
  }
  
  res.json(data);
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Room Service' });
});

const PORT = process.env.ROOM_PORT || 4002;
app.listen(PORT, () => console.log(`[Room Service] running on port ${PORT}`));
