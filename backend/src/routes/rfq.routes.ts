import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { matchDealersForRFQ } from '../services/dealer-matching.service';
import { getAISuggestions } from '../services/ai.service';

const router = Router();

// Create RFQ
const createRFQSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  deliveryCity: z.string().min(2),
  deliveryPincode: z.string().length(6),
  deliveryAddress: z.string().optional(),
  estimatedDate: z.string().datetime().optional(),
  deliveryPreference: z.enum(['delivery', 'pickup', 'both']),
  urgency: z.enum(['normal', 'urgent']).optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ).min(1),
});

router.post('/', authenticateUser, validateBody(createRFQSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { items, ...rfqData } = req.body;

    // Get AI suggestions for the RFQ
    const aiSuggestions = await getAISuggestions({
      items,
      city: rfqData.deliveryCity,
      urgency: rfqData.urgency,
    });

    const rfq = await prisma.rFQ.create({
      data: {
        ...rfqData,
        userId,
        estimatedDate: rfqData.estimatedDate ? new Date(rfqData.estimatedDate) : null,
        status: 'DRAFT',
        aiSuggestions: JSON.stringify(aiSuggestions),
        items: {
          create: items,
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
      },
    });

    return res.status(201).json({ rfq });
  } catch (error) {
    console.error('RFQ creation error:', error);
    return res.status(500).json({ error: 'Failed to create RFQ' });
  }
});

// Publish RFQ (makes it visible to dealers)
router.post('/:id/publish', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const rfqId = req.params.id;

    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, userId },
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
      },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    if (rfq.status !== 'DRAFT') {
      return res.status(400).json({ error: 'RFQ already published' });
    }

    // Match dealers
    const matchedDealers = await matchDealersForRFQ(rfq);

    // Update RFQ status
    const updatedRFQ = await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                productType: true,
              },
            },
          },
        },
      },
    });

    // Update dealer metrics
    await Promise.all(
      matchedDealers.map((dealerId) =>
        prisma.dealer.update({
          where: { id: dealerId },
          data: {
            totalRFQsReceived: { increment: 1 },
          },
        })
      )
    );

    return res.json({
      rfq: updatedRFQ,
      matchedDealersCount: matchedDealers.length,
    });
  } catch (error) {
    console.error('RFQ publish error:', error);
    return res.status(500).json({ error: 'Failed to publish RFQ' });
  }
});

// Get user's RFQs
router.get('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { status, page = '1', limit = '10' } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
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
          quotes: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.rFQ.count({ where }),
    ]);

    return res.json({
      rfqs,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get RFQs error:', error);
    return res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
});

// Get single RFQ with quotes
router.get('/:id', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const rfqId = req.params.id;

    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, userId },
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
        quotes: {
          where: {
            status: { not: 'EXPIRED' },
          },
          include: {
            dealer: {
              select: {
                id: true,
                businessName: true,
                city: true,
                conversionRate: true,
              },
            },
            items: true,
          },
          orderBy: { totalAmount: 'asc' },
        },
      },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    // Calculate rankings and distances
    const quotesWithRanking = rfq.quotes.map((quote, index) => ({
      ...quote,
      ranking: index + 1,
    }));

    return res.json({
      ...rfq,
      quotes: quotesWithRanking,
    });
  } catch (error) {
    console.error('Get RFQ error:', error);
    return res.status(500).json({ error: 'Failed to fetch RFQ' });
  }
});

// Select dealer quote
router.post('/:id/select-quote', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const rfqId = req.params.id;
    const { quoteId } = req.body;

    if (!quoteId) {
      return res.status(400).json({ error: 'Quote ID required' });
    }

    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, userId },
      include: {
        quotes: true,
      },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    if (rfq.status === 'DEALER_SELECTED' || rfq.status === 'COMPLETED') {
      return res.status(400).json({ error: 'RFQ already finalized' });
    }

    const selectedQuote = rfq.quotes.find((q) => q.id === quoteId);
    if (!selectedQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Update RFQ and quotes in transaction
    await prisma.$transaction(async (tx) => {
      // Update RFQ
      await tx.rFQ.update({
        where: { id: rfqId },
        data: {
          status: 'DEALER_SELECTED',
          selectedDealerId: selectedQuote.dealerId,
          selectedQuoteId: quoteId,
        },
      });

      // Update selected quote
      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'SELECTED',
          selectedAt: new Date(),
        },
      });

      // Update dealer conversion metrics
      await tx.dealer.update({
        where: { id: selectedQuote.dealerId },
        data: {
          totalConversions: { increment: 1 },
        },
      });

      // Recalculate conversion rate
      const dealer = await tx.dealer.findUnique({
        where: { id: selectedQuote.dealerId },
        select: { totalQuotesSubmitted: true, totalConversions: true },
      });

      if (dealer && dealer.totalQuotesSubmitted > 0) {
        await tx.dealer.update({
          where: { id: selectedQuote.dealerId },
          data: {
            conversionRate: (dealer.totalConversions + 1) / dealer.totalQuotesSubmitted,
          },
        });
      }

      // Update rejected quotes with loss analysis
      const sortedQuotes = rfq.quotes
        .filter((q) => q.id !== quoteId)
        .sort((a, b) => a.totalAmount - b.totalAmount);

      for (let i = 0; i < sortedQuotes.length; i++) {
        const quote = sortedQuotes[i];
        let lossReason = 'other';

        if (quote.totalAmount > selectedQuote.totalAmount) {
          lossReason = 'price';
        } else if (quote.deliveryDate && selectedQuote.deliveryDate) {
          if (new Date(quote.deliveryDate) > new Date(selectedQuote.deliveryDate)) {
            lossReason = 'timing';
          }
        }

        await tx.quote.update({
          where: { id: quote.id },
          data: {
            status: 'REJECTED',
            lossReason,
            rankPosition: i + 2, // +2 because selected quote is rank 1
          },
        });
      }
    });

    return res.json({ message: 'Quote selected successfully' });
  } catch (error) {
    console.error('Select quote error:', error);
    return res.status(500).json({ error: 'Failed to select quote' });
  }
});

// Cancel RFQ
router.post('/:id/cancel', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const rfqId = req.params.id;

    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, userId },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    if (rfq.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel completed RFQ' });
    }

    await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: 'CANCELLED' },
    });

    return res.json({ message: 'RFQ cancelled successfully' });
  } catch (error) {
    console.error('Cancel RFQ error:', error);
    return res.status(500).json({ error: 'Failed to cancel RFQ' });
  }
});

export default router;
