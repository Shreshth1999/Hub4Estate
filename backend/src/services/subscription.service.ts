import prisma from '../config/database';

// ============================================
// SUBSCRIPTION SERVICE — Dealer Lead Credit Model
// ============================================

export const subscriptionService = {
  /**
   * Get all active subscription plans, sorted by sortOrder.
   */
  getPlans: async (): Promise<
    Array<{
      id: string;
      name: string;
      displayName: string;
      priceMonthlyPaise: number;
      priceYearlyPaise: number | null;
      leadsPerMonth: number;
      quotesPerMonth: number;
      features: string[];
      sortOrder: number;
    }>
  > => {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        priceMonthlyPaise: true,
        priceYearlyPaise: true,
        leadsPerMonth: true,
        quotesPerMonth: true,
        features: true,
        sortOrder: true,
      },
    });

    return plans;
  },

  /**
   * Subscribe a dealer to a plan.
   * Creates or updates their DealerSubscription record.
   * Returns the subscription ID and new period dates.
   */
  subscribeDealerToPlan: async (
    dealerId: string,
    planId: string
  ): Promise<{
    subscriptionId: string;
    planName: string;
    periodStart: Date;
    periodEnd: Date;
    leadsTotal: number;
    quotesTotal: number;
  }> => {
    // Verify plan exists and is active
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    if (!plan.isActive) {
      throw new Error('This subscription plan is no longer available');
    }

    // Verify dealer exists
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { id: true, status: true },
    });

    if (!dealer) {
      throw new Error('Dealer not found');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Upsert subscription — dealerId is @unique so only one active subscription per dealer
    const subscription = await prisma.dealerSubscription.upsert({
      where: { dealerId },
      create: {
        dealerId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        leadsUsed: 0,
        quotesUsed: 0,
      },
      update: {
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        leadsUsed: 0,
        quotesUsed: 0,
        cancelledAt: null,
        cancelReason: null,
      },
    });

    // Record a credit purchase transaction
    await prisma.leadCreditTransaction.create({
      data: {
        dealerId,
        amount: plan.leadsPerMonth,
        type: 'purchase',
        balanceAfter: plan.leadsPerMonth,
        description: `Subscribed to ${plan.displayName} plan — ${plan.leadsPerMonth} lead credits`,
        referenceId: subscription.id,
        referenceType: 'subscription',
      },
    });

    return {
      subscriptionId: subscription.id,
      planName: plan.displayName,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      leadsTotal: plan.leadsPerMonth,
      quotesTotal: plan.quotesPerMonth,
    };
  },

  /**
   * Check a dealer's remaining lead credits for the current period.
   */
  checkCredits: async (
    dealerId: string
  ): Promise<{
    remaining: number;
    total: number;
    quotesRemaining: number;
    quotesTotal: number;
    periodEnd: Date | null;
  }> => {
    const subscription = await prisma.dealerSubscription.findUnique({
      where: { dealerId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return {
        remaining: 0,
        total: 0,
        quotesRemaining: 0,
        quotesTotal: 0,
        periodEnd: null,
      };
    }

    // Check if subscription period has expired
    if (new Date() > subscription.currentPeriodEnd) {
      return {
        remaining: 0,
        total: subscription.plan.leadsPerMonth,
        quotesRemaining: 0,
        quotesTotal: subscription.plan.quotesPerMonth,
        periodEnd: subscription.currentPeriodEnd,
      };
    }

    return {
      remaining: subscription.plan.leadsPerMonth - subscription.leadsUsed,
      total: subscription.plan.leadsPerMonth,
      quotesRemaining: subscription.plan.quotesPerMonth - subscription.quotesUsed,
      quotesTotal: subscription.plan.quotesPerMonth,
      periodEnd: subscription.currentPeriodEnd,
    };
  },

  /**
   * Deduct one lead credit from a dealer's subscription.
   * Creates a LeadCreditTransaction record for audit.
   * Throws if no credits remaining.
   */
  deductCredit: async (
    dealerId: string,
    inquiryId: string
  ): Promise<{
    creditsRemaining: number;
    transactionId: string;
  }> => {
    const subscription = await prisma.dealerSubscription.findUnique({
      where: { dealerId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new Error(`Subscription is ${subscription.status.toLowerCase()}, not active`);
    }

    // Check period expiry
    if (new Date() > subscription.currentPeriodEnd) {
      throw new Error('Subscription period has expired. Please renew.');
    }

    const remaining = subscription.plan.leadsPerMonth - subscription.leadsUsed;
    if (remaining <= 0) {
      throw new Error('No lead credits remaining for this period');
    }

    // Atomic update — increment leadsUsed
    const updated = await prisma.dealerSubscription.update({
      where: { dealerId },
      data: { leadsUsed: { increment: 1 } },
    });

    const newRemaining = subscription.plan.leadsPerMonth - updated.leadsUsed;

    // Create audit transaction
    const transaction = await prisma.leadCreditTransaction.create({
      data: {
        dealerId,
        amount: -1,
        type: 'deduction',
        balanceAfter: newRemaining,
        description: `Lead credit used for inquiry`,
        referenceId: inquiryId,
        referenceType: 'inquiry',
      },
    });

    return {
      creditsRemaining: newRemaining,
      transactionId: transaction.id,
    };
  },

  /**
   * Get paginated credit transaction history for a dealer.
   */
  getTransactionHistory: async (
    dealerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    transactions: Array<{
      id: string;
      amount: number;
      type: string;
      balanceAfter: number;
      description: string | null;
      referenceId: string | null;
      referenceType: string | null;
      createdAt: Date;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> => {
    const skip = (page - 1) * limit;
    const where = { dealerId };

    const [transactions, total] = await Promise.all([
      prisma.leadCreditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          type: true,
          balanceAfter: true,
          description: true,
          referenceId: true,
          referenceType: true,
          createdAt: true,
        },
      }),
      prisma.leadCreditTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Cancel a dealer's active subscription.
   * Sets status to CANCELLED and records cancellation timestamp.
   */
  cancelSubscription: async (
    dealerId: string,
    reason?: string
  ): Promise<{ cancelled: boolean; periodEnd: Date }> => {
    const subscription = await prisma.dealerSubscription.findUnique({
      where: { dealerId },
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    if (subscription.status === 'CANCELLED') {
      throw new Error('Subscription is already cancelled');
    }

    const updated = await prisma.dealerSubscription.update({
      where: { dealerId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || null,
      },
    });

    return {
      cancelled: true,
      periodEnd: updated.currentPeriodEnd,
    };
  },

  /**
   * Check if a dealer has an active, non-expired subscription.
   */
  isSubscriptionActive: async (dealerId: string): Promise<boolean> => {
    const subscription = await prisma.dealerSubscription.findUnique({
      where: { dealerId },
      select: { status: true, currentPeriodEnd: true },
    });

    if (!subscription) return false;
    if (subscription.status !== 'ACTIVE') return false;
    if (new Date() > subscription.currentPeriodEnd) return false;

    return true;
  },

  /**
   * Get a dealer's full subscription status including plan details.
   */
  getSubscriptionStatus: async (
    dealerId: string
  ): Promise<{
    hasSubscription: boolean;
    subscription: Record<string, unknown> | null;
    plan: Record<string, unknown> | null;
    credits: { remaining: number; total: number };
    quotes: { remaining: number; total: number };
  }> => {
    const subscription = await prisma.dealerSubscription.findUnique({
      where: { dealerId },
      include: { plan: true },
    });

    if (!subscription) {
      return {
        hasSubscription: false,
        subscription: null,
        plan: null,
        credits: { remaining: 0, total: 0 },
        quotes: { remaining: 0, total: 0 },
      };
    }

    const isActive =
      subscription.status === 'ACTIVE' &&
      new Date() <= subscription.currentPeriodEnd;

    const leadsRemaining = isActive
      ? subscription.plan.leadsPerMonth - subscription.leadsUsed
      : 0;
    const quotesRemaining = isActive
      ? subscription.plan.quotesPerMonth - subscription.quotesUsed
      : 0;

    return {
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelledAt: subscription.cancelledAt,
        cancelReason: subscription.cancelReason,
        isActive,
      },
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        displayName: subscription.plan.displayName,
        priceMonthlyPaise: subscription.plan.priceMonthlyPaise,
        priceYearlyPaise: subscription.plan.priceYearlyPaise,
        features: subscription.plan.features,
      },
      credits: {
        remaining: Math.max(0, leadsRemaining),
        total: subscription.plan.leadsPerMonth,
      },
      quotes: {
        remaining: Math.max(0, quotesRemaining),
        total: subscription.plan.quotesPerMonth,
      },
    };
  },
};
