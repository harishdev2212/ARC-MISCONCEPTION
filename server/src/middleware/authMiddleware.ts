import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from '../data/db/database';

export const JWT_SECRET = process.env.JWT_SECRET || 'mindtrace-super-secure-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; email: string };
    let user = db.findUserById(payload.userId);
    if (!user && payload.email) {
      user = db.findUserByEmail(payload.email);
    }
    if (!user) {
      return res.status(401).json({ error: 'User account not found. Please log in again.' });
    }

    req.user = user;
    db.touchUserActive(user.id);
    next();
  } catch (err: any) {
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

export function requireStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ error: 'Access restricted to student accounts.' });
    }
    next();
  });
}

export function requireTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ error: 'Access restricted to teacher accounts.' });
    }
    next();
  });
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = db.findUserById(payload.userId);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token failure for optional auth
    }
  }
  next();
}
