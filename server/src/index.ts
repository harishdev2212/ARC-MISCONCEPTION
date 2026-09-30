import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server/.env and root .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';
import { conceptRoutes } from './routes/conceptRoutes';
import { sessionRoutes } from './routes/sessionRoutes';
import { studentRoutes } from './routes/studentRoutes';
import { teacherRoutes } from './routes/teacherRoutes';
import { diagnoseRoutes } from './routes/diagnoseRoutes';
import { evalRoutes } from './routes/evalRoutes';
import { notificationRoutes } from './routes/notificationRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/diagnose', diagnoseRoutes);
app.use('/api/eval', evalRoutes);
app.use('/api/notifications', notificationRoutes);

// Health & System Info
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    service: 'MindTrace Diagnostic Core API',
    phase: 'Phase 2A - Real MindTrace AI Diagnostic Engine',
    aiPipelineStatus: hasGeminiKey ? `Active (${process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'})` : 'Key Required (Set GEMINI_API_KEY in .env)',
    aiModel: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
    subject: 'Mathematics -> Algebra -> Linear Equations',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  console.log('====================================================');
  console.log('  🧠 MindTrace Socratic AI Tutor - API Server');
  console.log('  "Don\'t grade the answer. Trace the thinking."');
  console.log(`  🚀 Server listening on http://localhost:${PORT}`);
  console.log('  📌 Mode: Phase 2A Real AI Diagnostic Pipeline');
  console.log(`  🔑 Gemini API Key: ${hasGeminiKey ? 'Configured ✅' : 'Missing (Set GEMINI_API_KEY in .env) ⚠️'}`);
  console.log(`  🤖 Active AI Model: ${process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'}`);
  console.log('====================================================');
});
