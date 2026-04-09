import axios from 'axios';
import prisma from '../config/database';
import { env } from '../config/env';
import { sendEmail as sendResendEmail } from './email.service';
import { sendTransactionalSMS } from './sms.service';

// ============================================
// TYPES
// ============================================

type NotificationType = 'general' | 'inquiry' | 'quote' | 'payment' | 'system' | 'welcome';
type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

interface NotifyOptions {
  title: string;
  body: string;
  type?: NotificationType;
  channels: NotificationChannel[];
  metadata?: Record<string, unknown>;
  // Email-specific (only used if 'email' channel is included)
  email?: string;
  emailSubject?: string;
  emailHtml?: string;
  emailText?: string;
  // SMS-specific (only used if 'sms' channel is included)
  phone?: string;
  smsMessage?: string;
}

// ============================================
// PUSH NOTIFICATION TRANSPORT
// ============================================

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const FCM_PUSH_URL = 'https://fcm.googleapis.com/fcm/send';

/**
 * Send push notifications via Expo Push Service (existing tokens).
 * Falls back gracefully if tokens are invalid.
 */
async function sendExpoPush(messages: PushMessage[]): Promise<void> {
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

      // Deactivate invalid tokens
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
      console.error('[Push] Expo chunk failed:', err);
    }
  }
}

/**
 * Send push notification via Firebase Cloud Messaging.
 * Only used if FCM_SERVER_KEY is configured.
 */
async function sendFCMPush(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!env.FCM_SERVER_KEY) {
    console.log('[Push FCM] FCM_SERVER_KEY not set — skipping FCM push');
    return;
  }

  // FCM supports multicast to up to 1000 tokens
  for (let i = 0; i < tokens.length; i += 1000) {
    const chunk = tokens.slice(i, i + 1000);
    try {
      const response = await axios.post(
        FCM_PUSH_URL,
        {
          registration_ids: chunk,
          notification: { title, body, sound: 'default' },
          data: data || {},
          priority: 'high',
        },
        {
          headers: {
            Authorization: `key=${env.FCM_SERVER_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      // Deactivate failed tokens
      const results = response.data?.results;
      if (Array.isArray(results)) {
        for (let j = 0; j < results.length; j++) {
          if (results[j].error === 'NotRegistered' || results[j].error === 'InvalidRegistration') {
            const token = chunk[j];
            if (token) {
              await prisma.devicePushToken
                .updateMany({ where: { token }, data: { isActive: false } })
                .catch(() => {});
            }
          }
        }
      }
    } catch (err) {
      console.error('[Push] FCM chunk failed:', err);
    }
  }
}

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  // ------------------------------------------
  // IN-APP NOTIFICATION
  // ------------------------------------------

  /**
   * Create an in-app notification record in the database.
   */
  sendInApp: async (
    userId: string,
    title: string,
    body: string,
    type: NotificationType = 'general',
    metadata?: Record<string, unknown>
  ): Promise<string> => {
    const notification = await prisma.notification.create({
      data: {
        userId,
        userType: 'user', // will be overridden in notify() if dealer
        type,
        title,
        body,
        data: metadata ? JSON.stringify(metadata) : null,
      },
    });
    return notification.id;
  },

  // ------------------------------------------
  // EMAIL
  // ------------------------------------------

  /**
   * Send an email via Resend. Falls back to console.log in dev mode
   * if RESEND_API_KEY is not configured.
   */
  sendEmail: async (
    to: string | string[],
    subject: string,
    htmlBody: string,
    textBody?: string
  ): Promise<boolean> => {
    if (!env.RESEND_API_KEY) {
      console.log('[Email Dev]', {
        to,
        subject,
        bodyPreview: htmlBody.substring(0, 200) + '...',
      });
      return true;
    }

    return sendResendEmail({ to, subject, html: htmlBody });
  },

  // ------------------------------------------
  // SMS
  // ------------------------------------------

  /**
   * Send an SMS via MSG91/Twilio. Falls back to console.log in dev mode.
   */
  sendSMS: async (phone: string, message: string): Promise<boolean> => {
    const result = await sendTransactionalSMS(phone, message);
    return result.success;
  },

  // ------------------------------------------
  // PUSH NOTIFICATION
  // ------------------------------------------

  /**
   * Send a push notification to all active device tokens for a user.
   * Supports both Expo push tokens and FCM tokens.
   */
  sendPush: async (
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> => {
    const tokens = await prisma.devicePushToken.findMany({
      where: { userId, isActive: true },
      select: { token: true, platform: true },
    });

    if (tokens.length === 0) {
      console.log(`[Push] No active tokens for user ${userId}`);
      return;
    }

    // Separate Expo tokens (ExponentPushToken[...]) from FCM tokens
    const expoTokens: string[] = [];
    const fcmTokens: string[] = [];

    for (const t of tokens) {
      if (t.token.startsWith('ExponentPushToken[')) {
        expoTokens.push(t.token);
      } else {
        fcmTokens.push(t.token);
      }
    }

    const promises: Promise<void>[] = [];

    // Send via Expo
    if (expoTokens.length > 0) {
      const messages: PushMessage[] = expoTokens.map((token) => ({
        to: token,
        title,
        body,
        data,
        sound: 'default',
        channelId: 'default',
      }));
      promises.push(sendExpoPush(messages));
    }

    // Send via FCM
    if (fcmTokens.length > 0) {
      promises.push(sendFCMPush(fcmTokens, title, body, data));
    }

    await Promise.allSettled(promises);
  },

  // ------------------------------------------
  // UNIFIED NOTIFY
  // ------------------------------------------

  /**
   * Send notifications across multiple channels in a single call.
   * This is the primary method consumers should use.
   *
   * @example
   * await notificationService.notify(userId, {
   *   title: 'Quote Received!',
   *   body: 'Your inquiry #INQ-001 has a new quote.',
   *   type: 'quote',
   *   channels: ['in_app', 'email', 'push'],
   *   email: 'user@example.com',
   *   metadata: { inquiryId: 'abc', quoteId: 'def' },
   * });
   */
  notify: async (
    userId: string,
    opts: NotifyOptions,
    userType: 'user' | 'dealer' = 'user'
  ): Promise<{ inAppId?: string; emailSent?: boolean; smsSent?: boolean; pushSent?: boolean }> => {
    const results: {
      inAppId?: string;
      emailSent?: boolean;
      smsSent?: boolean;
      pushSent?: boolean;
    } = {};

    const type = opts.type || 'general';
    const promises: Promise<void>[] = [];

    // IN-APP
    if (opts.channels.includes('in_app')) {
      promises.push(
        (async () => {
          const notification = await prisma.notification.create({
            data: {
              userId,
              userType,
              type,
              title: opts.title,
              body: opts.body,
              data: opts.metadata ? JSON.stringify(opts.metadata) : null,
            },
          });
          results.inAppId = notification.id;
        })()
      );
    }

    // EMAIL
    if (opts.channels.includes('email') && opts.email) {
      promises.push(
        (async () => {
          const subject = opts.emailSubject || opts.title;
          const html = opts.emailHtml || wrapInEmailTemplate(opts.title, opts.body);
          results.emailSent = await notificationService.sendEmail(opts.email!, subject, html, opts.emailText);
        })()
      );
    }

    // SMS
    if (opts.channels.includes('sms') && opts.phone) {
      promises.push(
        (async () => {
          const smsText = opts.smsMessage || `Hub4Estate: ${opts.title} — ${opts.body}`;
          results.smsSent = await notificationService.sendSMS(opts.phone!, smsText);
        })()
      );
    }

    // PUSH
    if (opts.channels.includes('push')) {
      promises.push(
        (async () => {
          await notificationService.sendPush(userId, opts.title, opts.body, opts.metadata);
          results.pushSent = true;
        })()
      );
    }

    await Promise.allSettled(promises);
    return results;
  },

  // ------------------------------------------
  // CONVENIENCE METHODS (keep backward compat)
  // ------------------------------------------

  /**
   * Send a push notification + create in-app record for a user.
   * Backward-compatible with existing callers.
   */
  sendToUser: async (
    userId: string,
    userType: 'user' | 'dealer',
    message: { title: string; body: string; data?: Record<string, unknown> }
  ): Promise<void> => {
    await notificationService.notify(
      userId,
      {
        title: message.title,
        body: message.body,
        type: 'general',
        channels: ['in_app', 'push'],
        metadata: message.data,
      },
      userType
    );
  },

  /**
   * Notify all dealers about a new inquiry.
   */
  notifyDealersAboutInquiry: async (
    dealerIds: string[],
    inquiryData: { inquiryNumber: string; product: string; city: string }
  ): Promise<void> => {
    if (dealerIds.length === 0) return;

    // Get all active tokens for these dealers
    const tokens = await prisma.devicePushToken.findMany({
      where: { userId: { in: dealerIds }, userType: 'dealer', isActive: true },
      select: { token: true, userId: true },
    });

    if (tokens.length > 0) {
      const messages: PushMessage[] = tokens.map((t) => ({
        to: t.token,
        title: 'New Inquiry Available',
        body: `${inquiryData.product} — ${inquiryData.city}. Inquiry #${inquiryData.inquiryNumber}`,
        data: { type: 'new_inquiry', ...inquiryData } as Record<string, unknown>,
        sound: 'default' as const,
        channelId: 'inquiries',
      }));
      await sendExpoPush(messages);
    }

    // Also create in-app notifications for each dealer
    await prisma.notification.createMany({
      data: dealerIds.map((dealerId) => ({
        userId: dealerId,
        userType: 'dealer',
        type: 'inquiry',
        title: 'New Inquiry Available',
        body: `${inquiryData.product} — ${inquiryData.city}. Inquiry #${inquiryData.inquiryNumber}`,
        data: JSON.stringify({ type: 'new_inquiry', ...inquiryData }),
      })),
    });
  },

  /**
   * Notify a buyer when their inquiry gets a quote response.
   */
  notifyBuyerQuoteReceived: async (
    userId: string,
    inquiryNumber: string
  ): Promise<void> => {
    await notificationService.notify(userId, {
      title: 'Quote Received!',
      body: `Your inquiry #${inquiryNumber} has received a new quote. Tap to view.`,
      type: 'quote',
      channels: ['in_app', 'push'],
      metadata: { type: 'quote_received', inquiryNumber },
    });
  },

  // ------------------------------------------
  // READ STATE MANAGEMENT
  // ------------------------------------------

  /**
   * Get count of unread notifications for a user.
   */
  getUnreadCount: async (userId: string): Promise<number> => {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  /**
   * Mark specific notifications (or all) as read for a user.
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

  /**
   * Mark a single notification as read by its ID.
   * Returns true if the notification was found and updated.
   */
  markOneRead: async (userId: string, notificationId: string): Promise<boolean> => {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
    });
    return result.count > 0;
  },
};

// ============================================
// HELPERS
// ============================================

/**
 * Wraps a plain title + body into a simple branded HTML email template.
 * Used as a fallback when no custom emailHtml is provided in notify().
 */
function wrapInEmailTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border: 2px solid #171717;">
          <tr>
            <td style="background-color: #171717; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 900;">Hub4Estate</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #171717; font-size: 20px; font-weight: 700;">
                ${title}
              </h2>
              <p style="margin: 0 0 24px 0; color: #525252; font-size: 16px; line-height: 1.6;">
                ${body.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px 32px; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0; color: #a3a3a3; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Hub4Estate LLP. India's #1 Electrical Products Marketplace.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
