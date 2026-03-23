import 'dotenv/config';
import dns from 'node:dns';
import express from 'express';

// Prefer IPv4 when resolving hostnames (helps on some Windows / dual-stack networks).
dns.setDefaultResultOrder('ipv4first');
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import { redirectByShortCode } from './controllers/redirectController.js';
import { errorMiddleware, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow frontend (Vite) to call API in development
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());

// Health check (does not conflict with short-code redirect)
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'url-shortener-api' });
});

// API routes — must be registered before GET /:shortCode
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/collections', collectionRoutes);

// Short link redirect — single segment at root (avoid shadowing /api, etc.)
const RESERVED_SHORT_SEGMENTS = new Set(['api', 'favicon.ico', 'robots.txt']);
app.get('/:shortCode', (req, res, next) => {
  const seg = req.params.shortCode;
  if (RESERVED_SHORT_SEGMENTS.has(seg.toLowerCase())) {
    return notFoundHandler(req, res);
  }
  return redirectByShortCode(req, res, next);
});

app.use(notFoundHandler);
app.use(errorMiddleware);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
