import prisma from '../config/database';

/**
 * Aggregates daily analytics: new users, new dealers, new inquiries, new quotes.
 * Intended to run once per day at end-of-day (e.g., 23:59 IST).
 */
export async function aggregateDailyAnalytics(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateRange = { gte: today, lt: tomorrow };

  const [newUsers, newDealers, newInquiries, newQuotes] = await Promise.all([
    prisma.user.count({ where: { createdAt: dateRange } }),
    prisma.dealer.count({ where: { createdAt: dateRange } }),
    prisma.productInquiry.count({ where: { createdAt: dateRange } }),
    prisma.quote.count({ where: { createdAt: dateRange } }),
  ]);

  process.stdout.write(JSON.stringify({
    type: 'daily_analytics',
    date: today.toISOString().split('T')[0],
    newUsers,
    newDealers,
    newInquiries,
    newQuotes,
  }) + "\n");
}
