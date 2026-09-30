import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from '../data/db/database';
import { requireAuth, AuthenticatedRequest, JWT_SECRET } from '../middleware/authMiddleware';

export const authRoutes = Router();

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    gradeLevel: user.gradeLevel,
    subject: user.subject,
    department: user.department,
    school: user.school,
    isDemo: user.isDemo ?? false,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt
  };
}

/**
 * POST /api/auth/register
 * Real user registration with password hashing and database persistence
 */
authRoutes.post('/register', (req: Request, res: Response) => {
  const { 
    name, 
    email, 
    password, 
    role = 'student', 
    gradeLevel, 
    subject, 
    department, 
    school 
  } = req.body;

  // 1. Validation
  const trimmedName = (name || '').trim();
  if (!trimmedName || trimmedName.length < 2) {
    return res.status(400).json({ error: 'Please enter your full name (minimum 2 characters).' });
  }

  const trimmedEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (role !== 'student' && role !== 'teacher') {
    return res.status(400).json({ error: 'Role must be either student or teacher.' });
  }

  if (role === 'student' && !gradeLevel) {
    return res.status(400).json({ error: 'Please specify your grade level or class.' });
  }

  if (role === 'teacher' && !subject && !department) {
    return res.status(400).json({ error: 'Please specify your subject or academic department.' });
  }

  // 2. Uniqueness check
  const existingUser = db.findUserByEmail(trimmedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  // 3. Password Hashing
  const passwordHash = bcrypt.hashSync(password, 10);

  // 4. Create User in Persistent Database
  const newUser = db.createUser({
    name: trimmedName,
    email: trimmedEmail,
    passwordHash,
    role,
    gradeLevel: role === 'student' ? (gradeLevel || 'Grade 9') : undefined,
    subject: role === 'teacher' ? (subject || 'Mathematics') : undefined,
    department: role === 'teacher' ? (department || 'Science & Math') : undefined,
    school: school || 'MindTrace Learning Academy'
  });

  // 5. Issue JWT Authentication Token
  const token = jwt.sign(
    { userId: newUser.id, role: newUser.role, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    token,
    user: sanitizeUser(newUser)
  });
});

/**
 * POST /api/auth/login
 * Real authentication against persistent database with bcrypt verification
 */
authRoutes.post('/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const trimmedEmail = (email || '').trim().toLowerCase();
  if (!trimmedEmail) {
    return res.status(400).json({ error: 'Please enter your email or username.' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Please enter your password.' });
  }

  // 1. Look up user by email or username
  const user = db.findUserByEmailOrUsername(trimmedEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // 2. Verify password with bcrypt
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // 3. Verify role match if tab specified
  if (role && user.role !== role) {
    return res.status(401).json({ 
      error: `This account is registered as a ${user.role}. Please select the ${user.role === 'student' ? 'Student' : 'Teacher'} tab.` 
    });
  }

  // 4. Update last active timestamp
  db.touchUserActive(user.id);

  // 5. Issue JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: sanitizeUser(user)
  });
});

/**
 * GET /api/auth/me
 * Restores session from JWT token on page reload
 */
authRoutes.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    user: sanitizeUser(req.user!)
  });
});

/**
 * POST /api/auth/logout
 * Invalidate session on server
 */
authRoutes.post('/logout', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});
