import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../data/db/database';
import { NotificationResponse } from '@shared/types';

export const notificationRoutes = Router();

/**
 * GET /api/notifications
 * Fetch user notifications based on role and authenticated user id.
 * Strictly respects role isolation: students never see other students' notifications;
 * teachers receive cohort alerts and teacher notifications.
 */
notificationRoutes.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifications = db.getNotifications(user.id, user.role);
  const unreadCount = notifications.filter(n => !n.read).length;

  const response: NotificationResponse = {
    notifications,
    unreadCount
  };

  res.json(response);
});

/**
 * POST /api/notifications/:id/read
 * Mark a single notification as read.
 */
notificationRoutes.post('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const success = db.markNotificationRead(id, user.id);
  if (!success) {
    return res.status(404).json({ error: 'Notification not found or access denied.' });
  }

  const notifications = db.getNotifications(user.id, user.role);
  const unreadCount = notifications.filter(n => !n.read).length;

  res.json({
    success: true,
    id,
    unreadCount
  });
});

/**
 * POST /api/notifications/read-all
 * Mark all unread notifications for the active user as read.
 */
notificationRoutes.post('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const count = db.markAllNotificationsRead(user.id, user.role);

  res.json({
    success: true,
    markedCount: count,
    unreadCount: 0
  });
});

/**
 * POST /api/notifications
 * Create a new notification (useful for custom events or testing)
 */
notificationRoutes.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { 
    type, 
    title, 
    message, 
    category, 
    actionUrl, 
    relatedTopic, 
    relatedStudentId, 
    targetUserId, 
    targetRole 
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const recipientId = targetUserId || user.id;
  const recipientRole = targetRole || user.role;

  const created = db.addNotification({
    userId: recipientId,
    role: recipientRole,
    type: type || 'system_update',
    category: category || 'ai',
    title,
    message,
    actionUrl,
    relatedTopic,
    relatedStudentId
  });

  res.status(201).json(created);
});
