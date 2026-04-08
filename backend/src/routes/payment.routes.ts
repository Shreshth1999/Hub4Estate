import { Router, Request, Response } from 'express';
import express from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { paymentService } from '../services/payment.service';

const router = Router();

// ============================================
// POST /create-order — Create a Razorpay order
// ============================================

const createOrderSchema = z.object({
  amount: z.number().int().positive('Amount must be positive (in paise)'),
  currency: z.string().default('INR'),
  receipt: z.string().min(1, 'Receipt reference is required'),
  notes: z.record(z.string()).optional(),
  description: z.string().optional(),
});

router.post(
  '/create-order',
  authenticate('user', 'dealer'),
  validateBody(createOrderSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const { amount, currency, receipt, notes } = req.body;

      const order = await paymentService.createOrder(amount, currency, receipt, notes);

      res.status(201).json({
        message: 'Razorpay order created',
        order,
        key: process.env.RAZORPAY_KEY_ID, // Client needs this for checkout
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      console.error('[Payment] Create order error:', error);
      res.status(500).json({ error: message });
    }
  }
);

// ============================================
// POST /verify — Verify payment after Razorpay checkout
// ============================================

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

router.post(
  '/verify',
  authenticate('user', 'dealer'),
  validateBody(verifyPaymentSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        description,
        metadata,
      } = req.body;

      const result = await paymentService.processPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        authReq.user!.id,
        authReq.user!.type as 'user' | 'dealer',
        description,
        metadata
      );

      res.json({
        message: 'Payment verified successfully',
        paymentId: result.paymentId,
        status: result.status,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment verification failed';
      console.error('[Payment] Verify error:', error);

      if (message.includes('signature verification failed')) {
        res.status(400).json({ error: message });
        return;
      }

      res.status(500).json({ error: message });
    }
  }
);

// ============================================
// POST /webhook — Razorpay webhook (NO auth middleware)
// Razorpay sends raw JSON; we must verify the X-Razorpay-Signature header.
// ============================================

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;

      if (!signature) {
        res.status(400).json({ error: 'Missing webhook signature' });
        return;
      }

      // req.body is a Buffer when using express.raw()
      const rawBody = typeof req.body === 'string' ? req.body : req.body.toString('utf8');

      const isValid = paymentService.verifyWebhookSignature(rawBody, signature);

      if (!isValid) {
        console.warn('[Payment] Webhook signature verification failed');
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }

      const event = JSON.parse(rawBody);
      const eventType = event.event as string;
      const payload = event.payload as Record<string, unknown>;

      await paymentService.handleWebhookEvent(eventType, payload);

      // Razorpay expects 200 to acknowledge receipt
      res.json({ status: 'ok' });
    } catch (error) {
      console.error('[Payment] Webhook error:', error);
      // Return 200 even on processing errors to prevent Razorpay retries
      // (we log the error for investigation)
      res.json({ status: 'error', message: 'Webhook processing failed' });
    }
  }
);

// ============================================
// GET /history — Paginated payment history
// ============================================

router.get(
  '/history',
  authenticate('user', 'dealer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

      const result = await paymentService.getPaymentsByUser(
        authReq.user!.id,
        authReq.user!.type as 'user' | 'dealer',
        page,
        limit
      );

      res.json(result);
    } catch (error) {
      console.error('[Payment] History error:', error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  }
);

// ============================================
// GET /:id — Get single payment detail
// ============================================

router.get(
  '/:id',
  authenticate('user', 'dealer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const payment = await paymentService.getPaymentById(
        req.params.id,
        authReq.user!.id,
        authReq.user!.type as 'user' | 'dealer'
      );

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      res.json({ payment });
    } catch (error) {
      console.error('[Payment] Get payment error:', error);
      res.status(500).json({ error: 'Failed to fetch payment details' });
    }
  }
);

// ============================================
// GET /:id/invoice — Get or generate invoice for a payment
// ============================================

const invoiceQuerySchema = z.object({
  buyerName: z.string().optional(),
  buyerGstin: z.string().optional(),
  buyerAddress: z.string().optional(),
});

router.get(
  '/:id/invoice',
  authenticate('user', 'dealer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;

      // Verify this payment belongs to the requester
      const payment = await paymentService.getPaymentById(
        req.params.id,
        authReq.user!.id,
        authReq.user!.type as 'user' | 'dealer'
      );

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      // Use query params for optional buyer info (useful on first generation)
      const buyerName =
        (req.query.buyerName as string) || authReq.user!.email || 'Customer';

      const invoice = await paymentService.generateInvoice(
        req.params.id,
        buyerName,
        req.query.buyerGstin as string | undefined,
        req.query.buyerAddress as string | undefined
      );

      res.json({ invoice });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate invoice';
      console.error('[Payment] Invoice error:', error);

      if (message.includes('not completed')) {
        res.status(400).json({ error: message });
        return;
      }

      res.status(500).json({ error: message });
    }
  }
);

export default router;
