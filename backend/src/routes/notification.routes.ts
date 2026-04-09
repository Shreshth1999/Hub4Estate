import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import prisma from '../config/database';
import { notificationService } from '../services/notification.service';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

// ============================================
// GET NOTIFICATIONS (paginated, newest first)
// GET /api/notifications?page=1&limit=20&type=quote
// ============================================

router.get('/', async (req: any, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined;

    const where: any = { userId: req.user.id };
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          data: true,
          read: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
      notificationService.getUnreadCount(req.user.id),
    ]);

    // Parse JSON data field for each notification
    const parsed = notifications.map((n) => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    }));

    return res.json({
      notifications: parsed,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Notification] List error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ============================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ============================================

router.get('/unread-count', async (req: any, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return res.json({ unreadCount: count });
  } catch (error) {
    console.error('[Notification] Unread count error:', error);
    return res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// (must be registered before /:id/read to avoid
//  Express matching "read-all" as an :id param)
// ============================================

router.patch('/read-all', async (req: any, res) => {
  try {
    await notificationService.markRead(req.user.id);
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[Notification] Mark all read error:', error);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// ============================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ============================================

router.patch('/:id/read', async (req: any, res) => {
  try {
    const { id } = req.params;

    const updated = await notificationService.markOneRead(req.user.id, id);

    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('[Notification] Mark read error:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ============================================
// MARK SELECTED NOTIFICATIONS AS READ (batch)
// POST /api/notifications/mark-read
// ============================================

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(), // if omitted, marks all as read
});

router.post('/mark-read', validateBody(markReadSchema), async (req: any, res) => {
  try {
    await notificationService.markRead(req.user.id, req.body.ids);
    return res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('[Notification] Batch mark read error:', error);
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// ============================================
// REGISTER DEVICE PUSH TOKEN
// POST /api/notifications/device-token
// ============================================

const registerTokenSchema = z.object({
  token: z.string().min(10, 'Invalid push token'),
  platform: z.enum(['ios', 'android', 'web']),
});

router.post('/device-token', validateBody(registerTokenSchema), async (req: any, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;
    const userType = req.user.type as 'user' | 'dealer';

    // Upsert: update if token exists (user may switch devices or re-login)
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
// UNREGISTER DEVICE PUSH TOKEN
// DELETE /api/notifications/device-token/:token
// ============================================

router.delete('/device-token/:token', async (req: any, res) => {
  try {
    const { token } = req.params;

    const result = await prisma.devicePushToken.updateMany({
      where: { token, userId: req.user.id },
      data: { isActive: false },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    return res.json({ message: 'Push token unregistered' });
  } catch (error) {
    console.error('[Notification] Deregister token error:', error);
    return res.status(500).json({ error: 'Failed to deregister push token' });
  }
});

// ============================================
// LEGACY: REGISTER TOKEN (backward-compat)
// POST /api/notifications/register-token
// ============================================

router.post('/register-token', validateBody(registerTokenSchema), async (req: any, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;
    const userType = req.user.type as 'user' | 'dealer';

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
// LEGACY: DEREGISTER TOKEN (backward-compat)
// POST /api/notifications/deregister-token
// ============================================

const deregisterTokenSchema = z.object({
  token: z.string().min(10, 'Invalid push token'),
});

router.post('/deregister-token', validateBody(deregisterTokenSchema), async (req: any, res) => {
  try {
    const { token } = req.body;

    await prisma.devicePushToken.updateMany({
      where: { token, userId: req.user.id },
      data: { isActive: false },
    });

    return res.json({ message: 'Push token deregistered' });
  } catch (error) {
    console.error('[Notification] Deregister token error:', error);
    return res.status(500).json({ error: 'Failed to deregister push token' });
  }
});

export default router;
