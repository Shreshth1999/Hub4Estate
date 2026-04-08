import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/database';
import { env } from '../config/env';
import { calculateGST, isInterState } from '../utils/gst';

// ============================================
// RAZORPAY CLIENT INITIALIZATION
// ============================================

function getRazorpayInstance(): Razorpay {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    console.warn('[Payment] Razorpay keys not configured — payment operations will fail');
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

// ============================================
// INVOICE NUMBER GENERATION
// ============================================

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: `H4E-INV-${year}-` } },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  let seq = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `H4E-INV-${year}-${String(seq).padStart(4, '0')}`;
}

// ============================================
// PAYMENT SERVICE
// ============================================

export const paymentService = {
  /**
   * Create a Razorpay order for payment initiation.
   * Amount is in paise (e.g. 99900 = Rs 999).
   */
  createOrder: async (
    amountPaise: number,
    currency: string = 'INR',
    receipt: string,
    notes?: Record<string, string>
  ): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    receipt: string;
  }> => {
    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt,
      notes: notes || {},
    });

    return {
      razorpayOrderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      receipt: order.receipt ?? receipt,
    };
  },

  /**
   * Verify the Razorpay payment signature using HMAC SHA256.
   * Returns true if signature matches, false otherwise.
   */
  verifyPaymentSignature: (
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean => {
    if (!env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay key secret not configured for signature verification.');
    }

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  },

  /**
   * Process a completed payment: verify signature, persist Payment record, update order status.
   */
  processPayment: async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    payerAccountId: string,
    payerAccountType: 'user' | 'dealer',
    description?: string,
    metadata?: Record<string, unknown>
  ): Promise<{ paymentId: string; status: string }> => {
    // 1. Verify signature
    const isValid = paymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      // Create a failed payment record for audit trail
      await prisma.payment.create({
        data: {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: 0,
          currency: 'INR',
          status: 'FAILED',
          payerAccountId,
          payerAccountType,
          failureReason: 'Signature verification failed',
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
      throw new Error('Payment signature verification failed');
    }

    // 2. Fetch order details from Razorpay to get the actual amount
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.fetch(razorpayOrderId);

    // 3. Fetch payment details for method info
    const rpPayment = await razorpay.payments.fetch(razorpayPaymentId);

    // 4. Create payment record in a transaction
    const payment = await prisma.payment.create({
      data: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: order.amount as number,
        currency: (order.currency as string) || 'INR',
        status: 'COMPLETED',
        method: (rpPayment.method as string) || null,
        payerAccountId,
        payerAccountType,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return { paymentId: payment.id, status: payment.status };
  },

  /**
   * Create a refund via Razorpay.
   * If amount is omitted, full refund is issued.
   * Amount is in paise.
   */
  createRefund: async (
    paymentDbId: string,
    amountPaise?: number,
    reason?: string
  ): Promise<{ refundId: string; amount: number; status: string }> => {
    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentDbId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.razorpayPaymentId) {
      throw new Error('No Razorpay payment ID associated with this payment');
    }

    if (payment.status === 'REFUNDED') {
      throw new Error('Payment has already been fully refunded');
    }

    if (payment.status !== 'COMPLETED' && payment.status !== 'PARTIALLY_REFUNDED') {
      throw new Error(`Cannot refund a payment with status: ${payment.status}`);
    }

    const razorpay = getRazorpayInstance();
    const refundAmount = amountPaise || payment.amount;

    // Prevent over-refunding
    const alreadyRefunded = payment.refundedAmount || 0;
    if (alreadyRefunded + refundAmount > payment.amount) {
      throw new Error(
        `Refund amount (${refundAmount}) exceeds remaining refundable amount (${payment.amount - alreadyRefunded})`
      );
    }

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmount,
      notes: { reason: reason || 'Customer requested refund' },
    });

    // Update payment record
    const newRefundedTotal = alreadyRefunded + refundAmount;
    const isFullRefund = newRefundedTotal >= payment.amount;

    await prisma.payment.update({
      where: { id: paymentDbId },
      data: {
        status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundedAmount: newRefundedTotal,
        refundedAt: new Date(),
      },
    });

    return {
      refundId: refund.id,
      amount: refundAmount,
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
    };
  },

  /**
   * Get paginated payment history for a user or dealer.
   */
  getPaymentsByUser: async (
    accountId: string,
    accountType: 'user' | 'dealer',
    page: number = 1,
    limit: number = 20
  ): Promise<{
    payments: Array<Record<string, unknown>>;
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
    const where = { payerAccountId: accountId, payerAccountType: accountType };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalPaise: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      payments: payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method,
        description: p.description,
        invoice: p.invoice,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
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
   * Get a single payment by ID, scoped to the requesting account.
   */
  getPaymentById: async (
    paymentId: string,
    accountId: string,
    accountType: 'user' | 'dealer'
  ): Promise<Record<string, unknown> | null> => {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        payerAccountId: accountId,
        payerAccountType: accountType,
      },
      include: {
        invoice: true,
      },
    });

    return payment as Record<string, unknown> | null;
  },

  /**
   * Generate a GST-compliant invoice for a completed payment.
   * If an invoice already exists for this payment, returns the existing one.
   */
  generateInvoice: async (
    paymentId: string,
    buyerName: string,
    buyerGstin?: string,
    buyerAddress?: string,
    items?: Array<{ description: string; quantity: number; unitPricePaise: number; hsn?: string }>,
    sellerGstin?: string
  ): Promise<{
    invoiceId: string;
    invoiceNumber: string;
    totalPaise: number;
  }> => {
    // Check for existing invoice
    const existing = await prisma.invoice.findUnique({
      where: { paymentId },
    });

    if (existing) {
      return {
        invoiceId: existing.id,
        invoiceNumber: existing.invoiceNumber,
        totalPaise: existing.totalPaise,
      };
    }

    // Fetch the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new Error('Cannot generate invoice for a payment that is not completed');
    }

    // Determine if inter-state transaction (affects GST split)
    const hub4estateGstin = sellerGstin || 'PENDING';
    const isInterStateTx = buyerGstin && hub4estateGstin !== 'PENDING'
      ? isInterState(hub4estateGstin, buyerGstin)
      : false;

    // Calculate GST on the payment amount
    const gst = calculateGST(payment.amount, isInterStateTx);

    // Build line items
    const invoiceItems = items || [
      {
        description: payment.description || 'Hub4Estate platform service',
        quantity: 1,
        unitPricePaise: payment.amount,
        hsn: '998314',
      },
    ];

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        paymentId,
        invoiceNumber,
        buyerName,
        buyerGstin: buyerGstin || null,
        buyerAddress: buyerAddress || null,
        sellerName: 'HUB4ESTATE LLP',
        sellerGstin: hub4estateGstin,
        items: JSON.stringify(invoiceItems),
        subtotalPaise: gst.subtotalPaise,
        cgstPaise: gst.cgstPaise,
        sgstPaise: gst.sgstPaise,
        igstPaise: gst.igstPaise,
        totalPaise: gst.totalPaise,
        isInterState: isInterStateTx,
      },
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalPaise: invoice.totalPaise,
    };
  },

  /**
   * Verify a Razorpay webhook signature.
   * Used for async payment events (payment.captured, refund.processed, etc.).
   */
  verifyWebhookSignature: (
    body: string | Buffer,
    signature: string
  ): boolean => {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('Razorpay webhook secret not configured.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch {
      return false;
    }
  },

  /**
   * Handle Razorpay webhook events.
   * Updates payment status based on event type.
   */
  handleWebhookEvent: async (
    event: string,
    payload: Record<string, unknown>
  ): Promise<void> => {
    const entity = (payload as Record<string, Record<string, unknown>>).payment?.entity as
      | Record<string, unknown>
      | undefined;

    if (!entity) {
      console.warn(`[Payment] Webhook event ${event} has no payment entity`);
      return;
    }

    const razorpayPaymentId = entity.id as string | undefined;
    const razorpayOrderId = entity.order_id as string | undefined;

    if (!razorpayPaymentId) return;

    switch (event) {
      case 'payment.captured': {
        // Mark payment as completed if we have a record
        await prisma.payment.updateMany({
          where: {
            razorpayOrderId: razorpayOrderId || undefined,
            status: { in: ['PENDING', 'PROCESSING'] },
          },
          data: {
            razorpayPaymentId,
            status: 'COMPLETED',
            method: (entity.method as string) || null,
          },
        });
        break;
      }

      case 'payment.failed': {
        await prisma.payment.updateMany({
          where: {
            razorpayOrderId: razorpayOrderId || undefined,
            status: { in: ['PENDING', 'PROCESSING'] },
          },
          data: {
            razorpayPaymentId,
            status: 'FAILED',
            failureReason: (entity.error_description as string) || 'Payment failed',
          },
        });
        break;
      }

      case 'refund.processed': {
        const refundEntity = (payload as Record<string, Record<string, unknown>>).refund
          ?.entity as Record<string, unknown> | undefined;
        if (refundEntity) {
          const refundPaymentId = refundEntity.payment_id as string;
          const refundAmount = refundEntity.amount as number;
          const payment = await prisma.payment.findUnique({
            where: { razorpayPaymentId: refundPaymentId },
          });

          if (payment) {
            const newRefundedTotal = (payment.refundedAmount || 0) + refundAmount;
            const isFullRefund = newRefundedTotal >= payment.amount;
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
                refundedAmount: newRefundedTotal,
                refundedAt: new Date(),
              },
            });
          }
        }
        break;
      }

      default:
        console.info(`[Payment] Unhandled webhook event: ${event}`);
    }
  },
};
