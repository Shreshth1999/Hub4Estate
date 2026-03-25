import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import prisma from '../config/database';
import { notificationService } from '../services/notification.service';

const router = Router();

// ============================================
// DEVICE TOKEN REGISTRATION
// ============================================

const registerTokenSchema = z.object({
  token: z.string().min(10, 'Invalid push token'),
  platform: z.enum(['ios', 'android']),
});

router.post('/register-token', authenticateToken, validateBody(registerTokenSchema), async (req: any, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;
    const userType = req.user.type as 'user' | 'dealer';

    // Upsert: update if token exists (user may change devices)
    await prisma.devicePushToken.upsert({
      where: { token },
      create: { token, userId, userType, platform, isActive: true },
      update: { userId, userType, platform, isActive: true },
    });

    return res.json({ message: 'Push token registered' });
  } catch (error) {
    console.error('[Notification] Register token error:', error);
    return res.status(500).json({ error: 'Failed to register push token' });
  }
});

// ============================================
// DEREGISTER ON LOGOUT
// ============================================

const deregisterTokenSchema = z.object({
  token: z.string().min(10, 'Invalid push token'),
});

router.post('/deregister-token', authenticateToken, validateBody(deregisterTokenSchema), async (req: any, res) => {
  try {
    const { token } = req.body;

    await prisma.devicePushToken.updateMany({
      where: { token, userId: req.user.id },
      data: { isActive: false },
    });

    return res.json({ message: 'Push token deregistered' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to deregister push token' });
  }
});

// ============================================
// GET NOTIFICATIONS (in-app notification center)
// ============================================

router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          body: true,
          data: true,
          read: true,
          readAt: true,
          createdAt: true,
        },
      }),
      notificationService.getUnreadCount(req.user.id),
    ]);

    return res.json({ notifications, unreadCount, page, limit });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ============================================
// MARK AS READ
// ============================================

const markReadSchema = z.object({
  ids: z.array(z.string()).optional(), // if omitted, marks all as read
});

router.post('/mark-read', authenticateToken, validateBody(markReadSchema), async (req: any, res) => {
  try {
    await notificationService.markRead(req.user.id, req.body.ids);
    return res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

export default router;
