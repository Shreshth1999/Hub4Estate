import prisma from '../config/database';

/**
 * Deletes expired OTP and password reset tokens from the database.
 * Intended to run daily via a scheduled job (e.g., cron or BullMQ).
 */
export async function cleanupExpiredTokens(): Promise<{ deletedOTPs: number; deletedResetTokens: number }> {
  const now = new Date();

  const [otpResult, resetResult] = await Promise.all([
    prisma.oTP.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
  ]);

  const summary = {
    deletedOTPs: otpResult.count,
    deletedResetTokens: resetResult.count,
  };

  process.stdout.write(JSON.stringify({
    type: 'token_cleanup',
    timestamp: now.toISOString(),
    ...summary,
  }) + "\n");

  return summary;
}
