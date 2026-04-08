import prisma from '../config/database';
import { DealerTier } from '@prisma/client';

interface DealerScoreComponents {
  responseSpeed: number;      // 0-100, weight 25%
  priceCompetitiveness: number; // 0-100, weight 30%
  reliability: number;        // 0-100, weight 25%
  volume: number;             // 0-100, weight 20%
}

/**
 * Dealer Scoring Service (PRD §8, System 13).
 * Composite 0-100 score: response speed (25%), price competitiveness (30%),
 * reliability (25%), volume (20%).
 * Tiers: BRONZE (0-39), SILVER (40-59), GOLD (60-79), PLATINUM (80-100).
 */
class DealerScoringService {
  /**
   * Recalculate score for a single dealer.
   */
  async calculateScore(dealerId: string): Promise<{
    score: number;
    tier: DealerTier;
    components: DealerScoreComponents;
  }> {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: {
        totalQuotesSubmitted: true,
        totalConversions: true,
        avgResponseTime: true,
        inquiryResponses: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            status: true,
            quotedPrice: true,
            createdAt: true,
            respondedAt: true,
          },
        },
      },
    });

    if (!dealer) {
      return { score: 0, tier: DealerTier.BRONZE, components: { responseSpeed: 0, priceCompetitiveness: 0, reliability: 0, volume: 0 } };
    }

    const components = this.computeComponents(dealer);
    const compositeScore = Math.round(
      components.responseSpeed * 0.25 +
      components.priceCompetitiveness * 0.30 +
      components.reliability * 0.25 +
      components.volume * 0.20
    );

    const tier = this.getTier(compositeScore);

    // Upsert DealerScore
    await prisma.dealerScore.upsert({
      where: { dealerId },
      create: {
        dealerId,
        ...components,
        compositeScore,
        tier,
        totalQuotes: dealer.totalQuotesSubmitted,
        totalWins: dealer.totalConversions,
        avgResponseMinutes: dealer.avgResponseTime ? dealer.avgResponseTime : undefined,
        lastCalculatedAt: new Date(),
      },
      update: {
        ...components,
        compositeScore,
        tier,
        totalQuotes: dealer.totalQuotesSubmitted,
        totalWins: dealer.totalConversions,
        avgResponseMinutes: dealer.avgResponseTime ? dealer.avgResponseTime : undefined,
        lastCalculatedAt: new Date(),
      },
    });

    return { score: compositeScore, tier, components };
  }

  private computeComponents(dealer: {
    totalQuotesSubmitted: number;
    totalConversions: number;
    avgResponseTime: number | null;
    inquiryResponses: Array<{
      status: string;
      quotedPrice: number | null;
      createdAt: Date;
      respondedAt: Date | null;
    }>;
  }): DealerScoreComponents {
    const responses = dealer.inquiryResponses;

    // Response Speed: based on average response time in minutes
    // <30min = 100, <60min = 80, <120min = 60, <240min = 40, >240min = 20
    let responseSpeed = 50;
    if (dealer.avgResponseTime !== null) {
      const mins = dealer.avgResponseTime;
      if (mins < 30) responseSpeed = 100;
      else if (mins < 60) responseSpeed = 80;
      else if (mins < 120) responseSpeed = 60;
      else if (mins < 240) responseSpeed = 40;
      else responseSpeed = 20;
    }

    // Price Competitiveness: what % of quotes were competitive (selected or among lowest)
    const quotedResponses = responses.filter(r => r.status === 'quoted' || r.status === 'pending');
    const selectedResponses = responses.filter(r => r.status === 'quoted');
    const priceCompetitiveness = quotedResponses.length > 0
      ? Math.min(100, Math.round((selectedResponses.length / quotedResponses.length) * 100 * 1.5))
      : 50;

    // Reliability: conversion rate (quotes that led to orders)
    const reliability = dealer.totalQuotesSubmitted > 0
      ? Math.min(100, Math.round((dealer.totalConversions / dealer.totalQuotesSubmitted) * 100 * 2))
      : 50;

    // Volume: based on total quotes (log scale)
    const totalQuotes = dealer.totalQuotesSubmitted;
    let volume = 0;
    if (totalQuotes >= 500) volume = 100;
    else if (totalQuotes >= 200) volume = 80;
    else if (totalQuotes >= 50) volume = 60;
    else if (totalQuotes >= 10) volume = 40;
    else if (totalQuotes >= 1) volume = 20;

    return { responseSpeed, priceCompetitiveness, reliability, volume };
  }

  private getTier(score: number): DealerTier {
    if (score >= 80) return DealerTier.PLATINUM;
    if (score >= 60) return DealerTier.GOLD;
    if (score >= 40) return DealerTier.SILVER;
    return DealerTier.BRONZE;
  }

  /**
   * Batch recalculate scores for all active dealers.
   * Run as a scheduled job.
   */
  async recalculateAll(): Promise<number> {
    const dealers = await prisma.dealer.findMany({
      where: { status: 'VERIFIED' },
      select: { id: true },
    });

    let count = 0;
    for (const dealer of dealers) {
      await this.calculateScore(dealer.id);
      count++;
    }
    return count;
  }
}

export const dealerScoringService = new DealerScoringService();
