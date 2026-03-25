import axios from 'axios';
import prisma from '../config/database';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export const notificationService = {
  /**
   * Send a push notification to all active devices for a user.
   */
  sendToUser: async (
    userId: string,
    userType: 'user' | 'dealer',
    message: { title: string; body: string; data?: Record<string, unknown> }
  ): Promise<void> => {
    const tokens = await prisma.devicePushToken.findMany({
      where: { userId, userType, isActive: true },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    const messages: PushMessage[] = tokens.map(t => ({
      to: t.token,
      title: message.title,
      body: message.body,
      data: message.data,
      sound: 'default',
      channelId: 'default',
    }));

    await sendInChunks(messages);

    // Persist notification record for in-app notification center
    await prisma.notification.create({
      data: {
        userId,
        userType,
        title: message.title,
        body: message.body,
        data: message.data ? JSON.stringify(message.data) : null,
      },
    });
  },

  /**
   * Notify all dealers in a city about a new inquiry.
   */
  notifyDealersAboutInquiry: async (
    dealerIds: string[],
    inquiryData: { inquiryNumber: string; product: string; city: string }
  ): Promise<void> => {
    if (dealerIds.length === 0) return;

    const tokens = await prisma.devicePushToken.findMany({
      where: { userId: { in: dealerIds }, userType: 'dealer', isActive: true },
      select: { token: true, userId: true },
    });

    if (tokens.length === 0) return;

    const messages: PushMessage[] = tokens.map(t => ({
      to: t.token,
      title: 'New Inquiry Available',
      body: `${inquiryData.product} — ${inquiryData.city}. Inquiry #${inquiryData.inquiryNumber}`,
      data: { type: 'new_inquiry', ...inquiryData },
      sound: 'default',
      channelId: 'inquiries',
    }));

    await sendInChunks(messages);
  },

  /**
   * Notify a buyer when their inquiry gets a quote response.
   */
  notifyBuyerQuoteReceived: async (
    userId: string,
    inquiryNumber: string
  ): Promise<void> => {
    await notificationService.sendToUser(userId, 'user', {
      title: 'Quote Received!',
      body: `Your inquiry #${inquiryNumber} has received a new quote. Tap to view.`,
      data: { type: 'quote_received', inquiryNumber },
    });
  },

  /**
   * Get unread notifications for a user.
   */
  getUnreadCount: async (userId: string): Promise<number> => {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  /**
   * Mark notifications as read.
   */
  markRead: async (userId: string, notificationIds?: string[]): Promise<void> => {
    await prisma.notification.updateMany({
      where: {
        userId,
        ...(notificationIds ? { id: { in: notificationIds } } : {}),
      },
      data: { read: true, readAt: new Date() },
    });
  },
};

async function sendInChunks(messages: PushMessage[]): Promise<void> {
  // Expo accepts up to 100 messages per request
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const response = await axios.post(EXPO_PUSH_URL, chunk, {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      // Handle invalid tokens — deactivate them
      const results = response.data?.data;
      if (Array.isArray(results)) {
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === 'error' && result.details?.error === 'DeviceNotRegistered') {
            const token = chunk[j]?.to;
            if (token) {
              await prisma.devicePushToken
                .updateMany({ where: { token }, data: { isActive: false } })
                .catch(() => {});
            }
          }
        }
      }
    } catch (err) {
      console.error('[Push] Failed to send chunk:', err);
    }
  }
}

// Unused but exported for future receipt validation
export { EXPO_RECEIPTS_URL };
