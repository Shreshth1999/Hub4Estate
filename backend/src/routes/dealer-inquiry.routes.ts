import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateDealer, AuthRequest } from '../middleware/auth';
import { logActivity } from '../services/activity.service';
import {
  stripBuyerIdentity,
  stripBuyerFromInquiryResponse,
} from '../middleware/blindMatching';
import { canRevealIdentityForInquiry } from '../services/blind-matching.service';

const router = Router();

// GET /api/dealer-inquiry/available - Get all inquiries available to this dealer
router.get('/available', authenticateDealer, async (req: AuthRequest, res): Promise<any> => {
  try {
    const dealerId = req.user!.id;
    const { page = '1', limit = '20', status = 'all' } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    // Get dealer's brands and categories to filter inquiries
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: {
        brandMappings: { select: { brandId: true } },
        categoryMappings: { select: { categoryId: true } },
      },
    });

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    const brandIds = dealer.brandMappings.map(b => b.brandId);
    const categoryIds = dealer.categoryMappings.map(c => c.categoryId);

    // Build where clause to match dealer's brands/categories
    const where: any = {
      status: status === 'all' ? undefined : String(status),
      OR: [
        // Match by identified brand
        brandIds.length > 0 ? { identifiedBrandId: { in: brandIds } } : undefined,
        // Match by category
        categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : undefined,
        // If no brand/category match, show all new inquiries
        { status: 'new', identifiedBrandId: null, categoryId: null },
      ].filter(Boolean),
    };

    const [inquiries, total] = await Promise.all([
      prisma.productInquiry.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          identifiedBrand: { select: { id: true, name: true } },
        },
      }),
      prisma.productInquiry.count({ where }),
    ]);

    // Check which inquiries this dealer has already responded to
    const inquiryIds = inquiries.map(i => i.id);
    const dealerResponses = await prisma.inquiryDealerResponse.findMany({
      where: {
        dealerId,
        inquiryId: { in: inquiryIds },
      },
      select: { inquiryId: true, status: true, quotedPrice: true },
    });

    const responseMap = new Map(
      dealerResponses.map(r => [r.inquiryId, r])
    );

    // Add dealer response status to each inquiry, stripping buyer identity
    const inquiriesWithStatus = inquiries.map(inquiry => ({
      ...stripBuyerIdentity(inquiry as Record<string, any>),
      dealerResponse: responseMap.get(inquiry.id) || null,
    }));

    res.json({
      data: inquiriesWithStatus,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      pages: Math.ceil(total / parseInt(String(limit))),
    });
  } catch (error: any) {
    console.error('Dealer inquiry list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dealer-inquiry/:id - View single inquiry detail
router.get('/:id', authenticateDealer, async (req: AuthRequest, res): Promise<any> => {
  try {
    const dealerId = req.user!.id;
    const inquiryId = req.params.id;

    const inquiry = await prisma.productInquiry.findUnique({
      where: { id: inquiryId },
      include: {
        category: { select: { id: true, name: true } },
        identifiedBrand: { select: { id: true, name: true, logo: true } },
      },
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    // Get this dealer's response if exists
    const dealerResponse = await prisma.inquiryDealerResponse.findFirst({
      where: {
        inquiryId,
        dealerId,
      },
    });

    // Mark as viewed
    if (!dealerResponse) {
      await prisma.inquiryDealerResponse.create({
        data: {
          inquiryId,
          dealerId,
          status: 'viewed',
          viewedAt: new Date(),
        },
      });
    } else if (!dealerResponse.viewedAt) {
      await prisma.inquiryDealerResponse.update({
        where: { id: dealerResponse.id },
        data: { viewedAt: new Date() },
      });
    }

    logActivity({
      actorType: 'dealer',
      actorId: dealerId,
      actorEmail: req.user!.email,
      activityType: 'PRODUCT_SEARCHED',
      description: `Dealer viewed inquiry ${inquiry.inquiryNumber}`,
      metadata: { inquiryId, inquiryNumber: inquiry.inquiryNumber },
      entityType: 'inquiry',
      entityId: inquiryId,
      req,
    });

    // Check if identity can be revealed (dealer's quote was selected/accepted)
    const identityRevealed = await canRevealIdentityForInquiry(inquiryId, dealerId);

    // Strip buyer identity unless identity reveal is authorized
    const safeInquiry = identityRevealed
      ? inquiry
      : stripBuyerIdentity(inquiry as Record<string, any>);

    res.json({
      inquiry: safeInquiry,
      dealerResponse,
      identityRevealed,
    });
  } catch (error: any) {
    console.error('Dealer inquiry detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dealer-inquiry/:id/quote - Submit quote for inquiry
const quoteSchema = z.object({
  quotedPrice: z.coerce.number().min(0, 'Price must be positive'),
  shippingCost: z.coerce.number().min(0).optional().default(0),
  estimatedDelivery: z.string().min(1, 'Delivery estimate required'),
  notes: z.string().optional(),
});

router.post('/:id/quote', authenticateDealer, async (req: AuthRequest, res): Promise<any> => {
  try {
    const dealerId = req.user!.id;
    const inquiryId = req.params.id;

    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    // Check if inquiry exists
    const inquiry = await prisma.productInquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true, inquiryNumber: true, quantity: true, status: true },
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    if (inquiry.status === 'closed') {
      return res.status(400).json({ error: 'This inquiry is already closed' });
    }

    // Calculate total
    const totalPrice = (data.quotedPrice * inquiry.quantity) + data.shippingCost;

    // Check if dealer already quoted
    const existing = await prisma.inquiryDealerResponse.findFirst({
      where: { inquiryId, dealerId },
    });

    let response;
    if (existing) {
      // Update existing quote
      response = await prisma.inquiryDealerResponse.update({
        where: { id: existing.id },
        data: {
          quotedPrice: data.quotedPrice,
          shippingCost: data.shippingCost,
          totalPrice,
          estimatedDelivery: data.estimatedDelivery,
          notes: data.notes,
          status: 'quoted',
          respondedAt: new Date(),
        },
      });
    } else {
      // Create new quote
      response = await prisma.inquiryDealerResponse.create({
        data: {
          inquiryId,
          dealerId,
          quotedPrice: data.quotedPrice,
          shippingCost: data.shippingCost,
          totalPrice,
          estimatedDelivery: data.estimatedDelivery,
          notes: data.notes,
          status: 'quoted',
          viewedAt: new Date(),
          respondedAt: new Date(),
        },
      });
    }

    // Update inquiry status to 'contacted' if still 'new'
    if (inquiry.status === 'new') {
      await prisma.productInquiry.update({
        where: { id: inquiryId },
        data: { status: 'contacted' },
      });
    }

    // Log activity
    logActivity({
      actorType: 'dealer',
      actorId: dealerId,
      actorEmail: req.user!.email,
      activityType: 'QUOTE_SUBMITTED',
      description: `Dealer submitted quote for inquiry ${inquiry.inquiryNumber}: ₹${data.quotedPrice}/unit`,
      metadata: {
        inquiryId,
        inquiryNumber: inquiry.inquiryNumber,
        quotedPrice: data.quotedPrice,
        totalPrice,
        estimatedDelivery: data.estimatedDelivery,
      },
      entityType: 'inquiry',
      entityId: inquiryId,
      req,
    });

    res.status(201).json({
      message: 'Quote submitted successfully',
      response,
    });
  } catch (error: any) {
    console.error('Dealer quote submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dealer-inquiry/my-quotes - Get all quotes this dealer has submitted
router.get('/my-quotes/list', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;
    const { page = '1', limit = '20', status } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = { dealerId };
    if (status && status !== 'all') {
      where.status = String(status);
    }

    const [quotes, total] = await Promise.all([
      prisma.inquiryDealerResponse.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        include: {
          inquiry: {
            select: {
              id: true,
              inquiryNumber: true,
              name: true,
              phone: true,
              email: true,
              productPhoto: true,
              modelNumber: true,
              quantity: true,
              deliveryCity: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.inquiryDealerResponse.count({ where }),
    ]);

    // Strip buyer identity from nested inquiry data unless quote is selected/accepted
    const safeQuotes = quotes.map((q) => {
      const isRevealed = q.status === 'selected' || q.status === 'accepted';
      if (isRevealed) return q;
      return stripBuyerFromInquiryResponse(q as Record<string, any>);
    });

    res.json({
      data: safeQuotes,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      pages: Math.ceil(total / parseInt(String(limit))),
    });
  } catch (error: any) {
    console.error('Dealer quotes list error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
