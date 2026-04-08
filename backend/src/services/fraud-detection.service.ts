import prisma from '../config/database';

interface FraudCheckResult {
  isFlagged: boolean;
  ruleId: string;
  severity: number;
  description: string;
}

/**
 * Rule-based fraud detection engine.
 * 8 rules per PRD §8 (FRAUD-001 through FRAUD-008).
 */
class FraudDetectionService {
  /**
   * Run all applicable fraud checks for a given entity.
   * Creates FraudFlag records for any triggered rules.
   */
  async checkInquiry(inquiryId: string, phone: string, ip?: string): Promise<FraudCheckResult[]> {
    const results: FraudCheckResult[] = [];

    // FRAUD-001: Duplicate Inquiries — same phone, 5+ in 24h
    const recentInquiries = await prisma.productInquiry.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentInquiries >= 5) {
      results.push({
        isFlagged: true,
        ruleId: 'FRAUD-001',
        severity: 60,
        description: `${recentInquiries} inquiries from same phone in 24h`,
      });
    }

    // FRAUD-003: Multiple Accounts Same IP — 3+ accounts from same IP in 1h
    if (ip) {
      const recentActivities = await prisma.userActivity.count({
        where: {
          ipAddress: ip,
          activityType: { in: ['USER_SIGNUP', 'DEALER_REGISTERED'] },
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });
      if (recentActivities >= 3) {
        results.push({
          isFlagged: true,
          ruleId: 'FRAUD-003',
          severity: 80,
          description: `${recentActivities} account registrations from same IP in 1h`,
        });
      }
    }

    // Create FraudFlag records for triggered rules
    for (const result of results) {
      await prisma.fraudFlag.create({
        data: {
          entityType: 'inquiry',
          entityId: inquiryId,
          flagType: result.ruleId,
          severity: result.severity > 70 ? 'high' : result.severity > 40 ? 'medium' : 'low',
          description: result.description,
          flaggedBy: 'system',
        },
      });
    }

    return results;
  }

  /**
   * Check dealer quote for fraud patterns.
   */
  async checkDealerQuote(
    dealerId: string,
    quotedPrice: number,
    categoryAvgPrice: number
  ): Promise<FraudCheckResult[]> {
    const results: FraudCheckResult[] = [];

    // FRAUD-002: Price Anomaly — quote >50% below category average
    if (categoryAvgPrice > 0 && quotedPrice < categoryAvgPrice * 0.5) {
      results.push({
        isFlagged: true,
        ruleId: 'FRAUD-002',
        severity: 70,
        description: `Quote ₹${quotedPrice} is ${Math.round((1 - quotedPrice / categoryAvgPrice) * 100)}% below category avg ₹${categoryAvgPrice}`,
      });
    }

    // FRAUD-004: Rapid Quote Submission — 10+ quotes in 5 min
    const recentQuotes = await prisma.inquiryDealerResponse.count({
      where: {
        dealerId,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });
    if (recentQuotes >= 10) {
      results.push({
        isFlagged: true,
        ruleId: 'FRAUD-004',
        severity: 50,
        description: `${recentQuotes} quotes submitted in 5 minutes`,
      });
    }

    // FRAUD-007: Unrealistic Pricing — 7/10 recent quotes rejected for high price
    const recentResponses = await prisma.inquiryDealerResponse.findMany({
      where: { dealerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { status: true },
    });
    const rejectedCount = recentResponses.filter(r => r.status === 'declined').length;
    if (recentResponses.length >= 10 && rejectedCount >= 7) {
      results.push({
        isFlagged: true,
        ruleId: 'FRAUD-007',
        severity: 40,
        description: `${rejectedCount}/10 recent quotes rejected — potential price gouging`,
      });
    }

    // Create FraudFlag records
    for (const result of results) {
      await prisma.fraudFlag.create({
        data: {
          entityType: 'dealer',
          entityId: dealerId,
          flagType: result.ruleId,
          severity: result.severity > 70 ? 'high' : result.severity > 40 ? 'medium' : 'low',
          description: result.description,
          flaggedBy: 'system',
        },
      });
    }

    return results;
  }
}

export const fraudDetectionService = new FraudDetectionService();
