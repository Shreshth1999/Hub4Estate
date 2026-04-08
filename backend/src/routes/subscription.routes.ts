import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { subscriptionService } from '../services/subscription.service';

const router = Router();

// ============================================
// GET /plans — List all active subscription plans (public)
// ============================================

router.get(
  '/plans',
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const plans = await subscriptionService.getPlans();

      res.json({
        plans: plans.map((p) => ({
          ...p,
          priceMonthly: p.priceMonthlyPaise / 100, // Also return in rupees for convenience
          priceYearly: p.priceYearlyPaise ? p.priceYearlyPaise / 100 : null,
        })),
      });
    } catch (error) {
      console.error('[Subscription] Get plans error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
  }
);

// ============================================
// POST /subscribe — Subscribe dealer to a plan
// ============================================

const subscribeSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
});

router.post(
  '/subscribe',
  authenticate('dealer'),
  validateBody(subscribeSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const { planId } = req.body;

      const result = await subscriptionService.subscribeDealerToPlan(
        authReq.user!.id,
        planId
      );

      res.status(201).json({
        message: `Subscribed to ${result.planName} plan`,
        subscription: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe';
      console.error('[Subscription] Subscribe error:', error);

      if (message.includes('not found') || message.includes('no longer available')) {
        res.status(400).json({ error: message });
        return;
      }

      res.status(500).json({ error: message });
    }
  }
);

// ============================================
// GET /status — Get dealer's subscription status + credits
// ============================================

router.get(
  '/status',
  authenticate('dealer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const status = await subscriptionService.getSubscriptionStatus(authReq.user!.id);

      res.json(status);
    } catch (error) {
      console.error('[Subscription] Status error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
  }
);

// ============================================
// GET /transactions — Credit transaction history
// ============================================

router.get(
  '/transactions',
  authenticate('dealer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

      const result = await subscriptionService.getTransactionHistory(
        authReq.user!.id,
        page,
        limit
      );

      res.json(result);
    } catch (error) {
      console.error('[Subscription] Transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
  }
);

// ============================================
// POST /cancel — Cancel active subscription
// ============================================

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

router.post(
  '/cancel',
  authenticate('dealer'),
  validateBody(cancelSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const { reason } = req.body;

      const result = await subscriptionService.cancelSubscription(
        authReq.user!.id,
        reason
      );

      res.json({
        message: 'Subscription cancelled. You can continue using remaining credits until the period ends.',
        periodEnd: result.periodEnd,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      console.error('[Subscription] Cancel error:', error);

      if (message.includes('already cancelled') || message.includes('No subscription')) {
        res.status(400).json({ error: message });
        return;
      }

      res.status(500).json({ error: message });
    }
  }
);

export default router;
