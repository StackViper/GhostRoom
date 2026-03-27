import express, { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const GATEWAY_LOG = '/tmp/gateway.log';
const gatewayLog = (msg: string) => {
  fs.appendFileSync(GATEWAY_LOG, `${new Date().toISOString()} - ${msg}\n`);
};

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());

// Log All Requests
app.use((req, res, next) => {
  gatewayLog(`INCOMING: ${req.method} ${req.url} - Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  next();
});

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || 'http://localhost:4002';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:4003';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:4005';
const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || 'http://localhost:4004';

// Proxy Routes
app.use('/api/auth', createProxyMiddleware({ 
  target: AUTH_SERVICE_URL, 
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' } 
}));

app.use('/api/rooms', createProxyMiddleware({ 
  target: ROOM_SERVICE_URL, 
  changeOrigin: true,
  pathRewrite: { '^/api/rooms': '/api/rooms' }
}));

app.use('/api/chat', createProxyMiddleware({ 
  target: CHAT_SERVICE_URL, 
  changeOrigin: true,
  pathRewrite: { '^/api/chat': '/api/chat' }
}));

app.use('/api/ai', createProxyMiddleware({
  target: AI_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/api/ai' },
}));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', service: 'API Gateway' });
});

const PORT = process.env.GATEWAY_PORT || 4000;
app.listen(PORT, () => {
  console.log(`[API Gateway] running on port ${PORT}`);
  console.log(`[Proxy] Auth: ${AUTH_SERVICE_URL}`);
  console.log(`[Proxy] Room: ${ROOM_SERVICE_URL}`);
  console.log(`[Proxy] Chat: ${CHAT_SERVICE_URL}`);
  console.log(`[Proxy] AI: ${AI_SERVICE_URL}`);
});
