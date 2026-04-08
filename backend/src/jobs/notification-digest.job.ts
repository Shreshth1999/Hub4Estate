import prisma from '../config/database';

/**
 * Identifies users with unread notifications from the last 24 hours
 * and logs a digest summary per user.
 * Email/WhatsApp dispatch can be wired in once the notification
 * channel integrations are production-ready.
 *
 * Intended to run daily (e.g., 09:00 IST).
 */
export async function sendNotificationDigests(): Promise<{ sent: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const usersWithNotifications = await prisma.notification.groupBy({
    by: ['userId'],
    where: {
      read: false,
      createdAt: { gte: oneDayAgo },
    },
    _count: true,
  });

  for (const entry of usersWithNotifications) {
    process.stdout.write(JSON.stringify({
      type: 'notification_digest',
      userId: entry.userId,
      unreadCount: entry._count,
    }) + "\n");
  }

  return { sent: usersWithNotifications.length };
}
