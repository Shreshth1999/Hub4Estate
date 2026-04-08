import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { env } from '../config/env';
import { logActivity } from '../services/activity.service';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Configure multer for product photo uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(env.UPLOAD_DIR, 'inquiry-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `inquiry_${timestamp}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
});

// Generate readable inquiry number: HUB-PRODUCT-0001
async function generateInquiryNumber(modelNumber?: string | null): Promise<string> {
  // Get the next sequence number
  const count = await prisma.productInquiry.count();
  const seq = String(count + 1).padStart(4, '0');

  // Extract product keyword from model number
  let productTag = 'REQ';
  if (modelNumber) {
    productTag = modelNumber
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 20);
  }

  return `HUB-${productTag}-${seq}`;
}

const inquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  modelNumber: z.string().optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).default(1),
  deliveryCity: z.string().min(2, 'City is required'),
  notes: z.string().optional().or(z.literal('')),
});

// POST /api/inquiry/submit - No auth required
router.post('/submit', upload.single('productPhoto'), async (req, res) => {
  try {
    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const productPhoto = req.file
      ? `/uploads/inquiry-photos/${req.file.filename}`
      : null;

    const inquiryNumber = await generateInquiryNumber(data.modelNumber);

    const inquiry = await prisma.productInquiry.create({
      data: {
        inquiryNumber,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        modelNumber: data.modelNumber || null,
        quantity: data.quantity,
        deliveryCity: data.deliveryCity,
        notes: data.notes || null,
        productPhoto,
      },
    });

    process.stdout.write(JSON.stringify({ level: 'info', event: 'inquiry_created', inquiryNumber, name: data.name, phone: data.phone }) + '\n');

    logActivity({
      actorType: 'anonymous',
      actorEmail: data.email || undefined,
      actorName: data.name,
      activityType: productPhoto ? 'PRODUCT_IMAGE_UPLOADED' : (data.modelNumber ? 'MODEL_NUMBER_SUBMITTED' : 'PRODUCT_INQUIRY_SUBMITTED'),
      description: `Product inquiry ${inquiryNumber} from ${data.name} (${data.phone})${data.modelNumber ? ` - Model: ${data.modelNumber}` : ''}${productPhoto ? ' - With photo' : ''}`,
      metadata: {
        inquiryNumber,
        name: data.name,
        phone: data.phone,
        email: data.email,
        modelNumber: data.modelNumber,
        quantity: data.quantity,
        deliveryCity: data.deliveryCity,
        hasPhoto: !!productPhoto,
        photoPath: productPhoto,
        notes: data.notes,
      },
      entityType: 'inquiry',
      entityId: inquiry.id,
      req,
    });

    return res.status(201).json({
      message: 'Inquiry submitted successfully! We will get back to you shortly.',
      inquiryId: inquiry.id,
      inquiryNumber: inquiry.inquiryNumber,
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// GET /api/inquiry/track - Track inquiry by phone or inquiry number (no auth required)
router.get('/track', async (req, res) => {
  try {
    const { phone, id, number } = req.query;

    if (!phone && !id && !number) {
      return res.status(400).json({ error: 'Please provide a phone number or inquiry number' });
    }

    const where: any = {};
    if (id) {
      where.id = String(id);
    } else if (number) {
      where.inquiryNumber = String(number);
    } else if (phone) {
      where.phone = String(phone);
    }

    const inquiries = await prisma.productInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        inquiryNumber: true,
        name: true,
        phone: true,
        modelNumber: true,
        quantity: true,
        deliveryCity: true,
        productPhoto: true,
        status: true,
        notes: true,
        // Response fields (visible to user)
        quotedPrice: true,
        shippingCost: true,
        totalPrice: true,
        estimatedDelivery: true,
        responseNotes: true,
        respondedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (inquiries.length === 0) {
      return res.status(404).json({ error: 'No inquiries found' });
    }

    return res.json({ inquiries });
  } catch (error) {
    console.error('Track inquiry error:', error);
    return res.status(500).json({ error: 'Failed to fetch inquiry status' });
  }
});

// ============================================
// ADMIN ENDPOINTS (require admin auth)
// ============================================

// GET /api/inquiry/admin/list - Get all inquiries for admin dashboard
router.get('/admin/list', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (status && status !== 'all') where.status = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search), mode: 'insensitive' } },
        { modelNumber: { contains: String(search), mode: 'insensitive' } },
        { inquiryNumber: { contains: String(search), mode: 'insensitive' } },
        { deliveryCity: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total, statusCounts] = await Promise.all([
      (prisma.productInquiry.findMany as any)({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        include: {
          pipeline: {
            select: { id: true, status: true, identifiedBrand: true },
          },
        },
      }),
      prisma.productInquiry.count({ where }),
      prisma.productInquiry.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const counts: Record<string, number> = {};
    statusCounts.forEach(s => { counts[s.status] = s._count; });

    res.json({
      data,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      pages: Math.ceil(total / parseInt(String(limit))),
      statusCounts: counts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inquiry/admin/:id - Get single inquiry detail with all dealer responses
router.get('/admin/:id', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const inquiry = await prisma.productInquiry.findUnique({
      where: { id: req.params.id },
      include: {
        category: { select: { id: true, name: true } },
        identifiedBrand: { select: { id: true, name: true, logo: true } },
      },
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    // Get all dealer responses
    const dealerResponses = await prisma.inquiryDealerResponse.findMany({
      where: { inquiryId: req.params.id },
      include: {
        dealer: {
          select: {
            id: true,
            businessName: true,
            city: true,
            phone: true,
            email: true,
            conversionRate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      inquiry,
      dealerResponses,
      totalResponses: dealerResponses.length,
      quotedResponses: dealerResponses.filter(r => r.status === 'quoted').length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inquiry/admin/:id/respond - Admin sends quote/response
const respondSchema = z.object({
  quotedPrice: z.coerce.number().min(0).optional(),
  shippingCost: z.coerce.number().min(0).optional(),
  totalPrice: z.coerce.number().min(0).optional(),
  estimatedDelivery: z.string().min(1).optional(),
  responseNotes: z.string().optional(),
  status: z.enum(['new', 'contacted', 'quoted', 'closed']).optional(),
  internalNotes: z.string().optional(),
});

router.patch('/admin/:id/respond', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const parsed = respondSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const adminId = req.user!.id;

    // Auto-calculate total if not provided
    if (data.quotedPrice !== undefined && data.shippingCost !== undefined && data.totalPrice === undefined) {
      const inquiry = await prisma.productInquiry.findUnique({ where: { id: req.params.id }, select: { quantity: true } });
      if (inquiry) {
        data.totalPrice = (data.quotedPrice * inquiry.quantity) + data.shippingCost;
      }
    }

    // If admin is sending a quote, auto-set status to quoted and mark respondedAt
    const updateData: any = { ...data };
    if (data.quotedPrice !== undefined) {
      updateData.respondedAt = new Date();
      updateData.respondedBy = adminId;
      if (!data.status) {
        updateData.status = 'quoted';
      }
    }

    const inquiry = await prisma.productInquiry.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logActivity({
      actorType: 'admin',
      actorId: adminId,
      actorEmail: req.user!.email,
      activityType: 'PRODUCT_INQUIRY_SUBMITTED',
      description: `Admin responded to inquiry ${inquiry.inquiryNumber}: ₹${data.quotedPrice || 'N/A'} per unit`,
      metadata: {
        inquiryId: inquiry.id,
        inquiryNumber: inquiry.inquiryNumber,
        quotedPrice: data.quotedPrice,
        shippingCost: data.shippingCost,
        totalPrice: data.totalPrice || updateData.totalPrice,
        estimatedDelivery: data.estimatedDelivery,
        status: updateData.status,
      },
      entityType: 'inquiry',
      entityId: inquiry.id,
      req,
    });

    return res.json({
      message: 'Response saved successfully',
      inquiry,
    });
  } catch (error: any) {
    console.error('Admin respond error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inquiry/admin/:id/status - Quick status update
router.patch('/admin/:id/status', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'quoted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const inquiry = await prisma.productInquiry.update({
      where: { id: req.params.id },
      data: { status },
    });

    return res.json({ inquiry });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;