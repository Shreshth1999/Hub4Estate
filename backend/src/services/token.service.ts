import crypto from 'crypto';
import prisma from '../config/database';

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export const tokenService = {
  /**
   * Create a refresh token for a user and persist it to the database.
   * Returns the raw token string (store in SecureStore on mobile, httpOnly cookie on web).
   */
  createRefreshToken: async (
    userId: string,
    userType: 'user' | 'dealer' | 'admin'
  ): Promise<string> => {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    await prisma.refreshToken.create({
      data: { token, userId, userType, expiresAt },
    });

    return token;
  },

  /**
   * Validate a refresh token. Returns the stored record or null if invalid/expired/revoked.
   */
  validateRefreshToken: async (token: string) => {
    if (!token || token.length < 64) return null;

    const record = await prisma.refreshToken.findUnique({ where: { token } });

    if (!record) return null;
    if (record.revoked) return null;
    if (new Date() > record.expiresAt) {
      await prisma.refreshToken.delete({ where: { token } }).catch(() => {});
      return null;
    }

    return record;
  },

  /**
   * Revoke a single refresh token (single-device logout).
   */
  revokeToken: async (token: string): Promise<void> => {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true, revokedAt: new Date() },
    });
  },

  /**
   * Revoke ALL refresh tokens for a user (logout all devices).
   */
  revokeAllUserTokens: async (userId: string): Promise<void> => {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
  },

  /**
   * Clean up expired and old revoked tokens. Safe to run on a cron schedule.
   */
  cleanupExpiredTokens: async (): Promise<number> => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true, revokedAt: { lt: cutoff } },
        ],
      },
    });
    return result.count;
  },
};
