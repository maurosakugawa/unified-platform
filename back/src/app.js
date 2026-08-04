import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/requireAuth.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';
import eventRoutes from './routes/events.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', phase: 1 });
});

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas protegidas
app.use('/api/contacts', requireAuth, contactRoutes);
app.use('/api/events', requireAuth, eventRoutes);

// Error handler (sempre por último)
app.use(errorHandler);

export default app;
