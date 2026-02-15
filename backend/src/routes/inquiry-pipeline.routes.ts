import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import {
  createPipeline,
  findMatchingDealers,
  addDealerToPipeline,
  updateDealerQuote,
  compileBestQuotes,
  sendToCustomer,
} from '../services/inquiry-pipeline.service';
import { sendEmail } from '../services/email.service';
import { getQuoteCompilationEmail } from '../services/email.service';

const router = Router();

// All routes require admin auth
router.use(authenticateAdmin);

// POST /api/inquiry-pipeline/:inquiryId/create - Create pipeline + AI analysis
router.post('/:inquiryId/create', async (req: AuthRequest, res) => {
  try {
    const pipeline = await createPipeline(req.params.inquiryId, req.user!.id);
    res.status(201).json({ pipeline });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inquiry-pipeline/:inquiryId - Get pipeline with all dealer quotes
router.get('/:inquiryId', async (req: AuthRequest, res) => {
  try {
    const pipeline = await prisma.inquiryPipeline.findUnique({
      where: { inquiryId: req.params.inquiryId },
      include: {
        inquiry: true,
        dealerQuotes: {
          include: {
            brandDealer: {
              select: { id: true, name: true, shopName: true, phone: true, city: true, source: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found for this inquiry' });
    }

    return res.json({ pipeline });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/inquiry-pipeline/:pipelineId/auto-match - Auto-find matching dealers
router.post('/:pipelineId/auto-match', async (req: AuthRequest, res) => {
  try {
    const pipeline = await prisma.inquiryPipeline.findUnique({
      where: { id: req.params.pipelineId },
      include: { inquiry: true },
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    const dealers = await findMatchingDealers(
      pipeline.identifiedBrand,
      pipeline.inquiry.deliveryCity
    );

    return res.json({
      identifiedBrand: pipeline.identifiedBrand,
      city: pipeline.inquiry.deliveryCity,
      dealers,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/inquiry-pipeline/:pipelineId/add-dealer - Add dealer to pipeline
const addDealerSchema = z.object({
  brandDealerId: z.string().uuid().optional(),
  dealerId: z.string().uuid().optional(),
  dealerName: z.string().min(1),
  dealerPhone: z.string().min(10),
  dealerShopName: z.string().optional(),
  dealerCity: z.string().optional(),
  contactMethod: z.enum(['WHATSAPP', 'CALL', 'EMAIL', 'SMS']).default('WHATSAPP'),
  whatsappMessage: z.string().optional(),
  saveToDirectory: z.boolean().default(false),
  brandId: z.string().uuid().optional(),
});

router.post('/:pipelineId/add-dealer', async (req: AuthRequest, res) => {
  try {
    const parsed = addDealerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const quote = await addDealerToPipeline(req.params.pipelineId, parsed.data as any);
    return res.status(201).json({ quote });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inquiry-pipeline/:pipelineId/quotes/:quoteId - Update dealer quote/price
const updateQuoteSchema = z.object({
  quotedPrice: z.coerce.number().min(0).optional(),
  shippingCost: z.coerce.number().min(0).optional(),
  deliveryDays: z.coerce.number().int().min(0).optional(),
  warrantyInfo: z.string().optional(),
  quoteNotes: z.string().optional(),
  responseStatus: z.enum(['PENDING', 'CONTACTED', 'QUOTED', 'NO_RESPONSE', 'DECLINED']).optional(),
});

router.patch('/:pipelineId/quotes/:quoteId', async (req: AuthRequest, res) => {
  try {
    const parsed = updateQuoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const quote = await updateDealerQuote(req.params.quoteId, parsed.data);
    return res.json({ quote });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/inquiry-pipeline/:pipelineId/quotes/:quoteId - Remove dealer from pipeline
router.delete('/:pipelineId/quotes/:quoteId', async (req: AuthRequest, res) => {
  try {
    await prisma.inquiryDealerQuote.delete({
      where: { id: req.params.quoteId },
    });
    res.json({ message: 'Dealer removed from pipeline' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inquiry-pipeline/:pipelineId/send-to-customer - Compile & send best quotes
const sendSchema = z.object({
  sentVia: z.enum(['email', 'sms', 'both']).default('email'),
  customMessage: z.string().optional(),
});

router.post('/:pipelineId/send-to-customer', async (req: AuthRequest, res) => {
  try {
    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const compiled = await compileBestQuotes(req.params.pipelineId);
    const message = parsed.data.customMessage || compiled.customerMessage;
    const bestQuote = compiled.bestQuote;

    // Send email if requested
    if (['email', 'both'].includes(parsed.data.sentVia) && compiled.pipeline.inquiry.email) {
      const emailContent = getQuoteCompilationEmail({
        customerName: compiled.pipeline.inquiry.name,
        inquiryNumber: compiled.pipeline.inquiry.inquiryNumber || '',
        productDescription: compiled.pipeline.identifiedProduct || compiled.pipeline.inquiry.modelNumber || 'Your product',
        quantity: compiled.pipeline.inquiry.quantity,
        quotes: compiled.topQuotes.map(q => ({
          dealerName: q.dealerShopName || q.dealerName,
          city: q.dealerCity || 'N/A',
          price: q.quotedPrice || 0,
          shippingCost: q.shippingCost || 0,
          totalPrice: q.totalQuotedPrice || q.quotedPrice || 0,
          deliveryDays: q.deliveryDays,
          warrantyInfo: q.warrantyInfo,
        })),
      });

      await sendEmail({
        to: compiled.pipeline.inquiry.email,
        subject: emailContent.subject,
        html: emailContent.html,
        replyTo: 'hello@hub4estate.com',
      });
    }

    // Mark as sent
    const pipeline = await sendToCustomer(
      req.params.pipelineId,
      req.user!.id,
      parsed.data.sentVia,
      message,
      bestQuote.quotedPrice || undefined,
      bestQuote.shippingCost || undefined,
      bestQuote.deliveryDays ? `${bestQuote.deliveryDays} days` : undefined
    );

    return res.json({
      message: 'Quotes sent to customer',
      pipeline,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
