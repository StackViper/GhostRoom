import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const AUTH_LOG = '/tmp/auth_service.log';
const authLog = (msg: string) => {
  fs.appendFileSync(AUTH_LOG, `${new Date().toISOString()} - ${msg}\n`);
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

// Signup Route
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { email, password, username, fullName } = req.body;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  // Update profile in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ 
      id: data.user?.id, 
      username, 
      full_name: fullName 
    }]);

  if (profileError) {
    // Cleanup auth user if profile creation fails? (Optional for robustness)
    return res.status(400).json({ error: profileError.message });
  }

  res.status(201).json({ 
    message: 'User created successfully',
    user: { id: data.user?.id, email, username } 
  });
});

// Login Route
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

  // Generate a custom JWT for microservices if needed, 
  // or just use Supabase access_token
  const internalToken = jwt.sign(
    { id: data.user.id, email: data.user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  authLog(`SUCCESS: Login for ${email} - Generated Token: ${internalToken.substring(0, 10)}...`);

  res.json({ 
    user: data.user,
    session: data.session,
    internalToken
  });
});

// Verify Token Route (Internal)
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Auth Service' });
});

const PORT = process.env.AUTH_PORT || 4001;
app.listen(PORT, () => console.log(`[Auth Service] running on port ${PORT}`));
