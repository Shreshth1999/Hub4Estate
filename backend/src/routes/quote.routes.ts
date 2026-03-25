import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateDealer, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

// Get RFQs available for dealer
router.get('/available-rfqs', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    // Get dealer's brand and category mappings
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: {
        brandMappings: {
          where: { isVerified: true },
          select: { brandId: true },
        },
        categoryMappings: {
          select: { categoryId: true },
        },
        serviceAreas: {
          select: { pincode: true },
        },
      },
    });

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    const brandIds = dealer.brandMappings.map((m) => m.brandId);
    const categoryIds = dealer.categoryMappings.map((m) => m.categoryId);
    const pincodes = dealer.serviceAreas.map((a) => a.pincode);

    // Find matching RFQs
    const rfqs = await prisma.rFQ.findMany({
      where: {
        status: 'PUBLISHED',
        deliveryPincode: { in: pincodes },
        items: {
          some: {
            product: {
              brandId: { in: brandIds },
              productType: {
                subCategory: {
                  categoryId: { in: categoryIds },
                },
              },
            },
          },
        },
        quotes: {
          none: {
            dealerId,
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                productType: {
                  include: {
                    subCategory: {
                      include: {
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            city: true,
            role: true,
            profVerificationStatus: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return res.json({ rfqs });
  } catch (error) {
    console.error('Get available RFQs error:', error);
    return res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
});

// Submit quote for RFQ
const submitQuoteSchema = z.object({
  rfqId: z.string().uuid(),
  totalAmount: z.number().positive(),
  shippingCost: z.number().min(0).default(0),
  deliveryDate: z.string().datetime().optional(),
  pickupDate: z.string().datetime().optional(),
  validUntil: z.string().datetime(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      totalPrice: z.number().positive(),
    })
  ).min(1),
});

router.post('/submit', authenticateDealer, validateBody(submitQuoteSchema), async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;
    const { rfqId, items, ...quoteData } = req.body;

    // Check if RFQ exists and is published
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        items: true,
        quotes: {
          where: { dealerId },
        },
      },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    if (rfq.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'RFQ not accepting quotes' });
    }

    if (rfq.quotes.length > 0) {
      return res.status(400).json({ error: 'Quote already submitted for this RFQ' });
    }

    // Validate items match RFQ
    const rfqProductIds = rfq.items.map((item) => item.productId);
    const quoteProductIds = items.map((item) => item.productId);

    const allMatch = quoteProductIds.every((id) => rfqProductIds.includes(id));
    if (!allMatch) {
      return res.status(400).json({ error: 'Quote items do not match RFQ items' });
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        rfqId,
        dealerId,
        ...quoteData,
        deliveryDate: quoteData.deliveryDate ? new Date(quoteData.deliveryDate) : null,
        pickupDate: quoteData.pickupDate ? new Date(quoteData.pickupDate) : null,
        validUntil: new Date(quoteData.validUntil),
        status: 'SUBMITTED',
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });

    // Update dealer metrics
    await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        totalQuotesSubmitted: { increment: 1 },
      },
    });

    // Update RFQ status
    await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        status: 'QUOTES_RECEIVED',
      },
    });

    return res.status(201).json({ quote });
  } catch (error) {
    console.error('Submit quote error:', error);
    return res.status(500).json({ error: 'Failed to submit quote' });
  }
});

// Get dealer's quotes
router.get('/my-quotes', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = { dealerId };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          rfq: {
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      brand: true,
                    },
                  },
                },
              },
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.quote.count({ where }),
    ]);

    return res.json({
      quotes,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    return res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get quote performance analytics
router.get('/analytics', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    const [dealer, quotes] = await Promise.all([
      prisma.dealer.findUnique({
        where: { id: dealerId },
        select: {
          totalRFQsReceived: true,
          totalQuotesSubmitted: true,
          totalConversions: true,
          conversionRate: true,
          avgResponseTime: true,
        },
      }),
      prisma.quote.findMany({
        where: { dealerId },
        select: {
          status: true,
          lossReason: true,
          rankPosition: true,
          totalAmount: true,
        },
      }),
    ]);

    const lossReasons = quotes
      .filter((q) => q.status === 'REJECTED')
      .reduce((acc, q) => {
        const reason = q.lossReason || 'unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const avgQuoteAmount = quotes.length > 0
      ? quotes.reduce((sum, q) => sum + q.totalAmount, 0) / quotes.length
      : 0;

    return res.json({
      metrics: dealer,
      insights: {
        totalQuotes: quotes.length,
        lossReasons,
        avgQuoteAmount,
        statusBreakdown: {
          submitted: quotes.filter((q) => q.status === 'SUBMITTED').length,
          selected: quotes.filter((q) => q.status === 'SELECTED').length,
          rejected: quotes.filter((q) => q.status === 'REJECTED').length,
          expired: quotes.filter((q) => q.status === 'EXPIRED').length,
        },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
