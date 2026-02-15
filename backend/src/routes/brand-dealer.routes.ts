import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require admin auth
router.use(authenticateAdmin);

const createSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(2),
  shopName: z.string().optional(),
  phone: z.string().min(10),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().min(2),
  state: z.string().optional(),
  pincode: z.string().optional(),
  address: z.string().optional(),
  source: z.enum(['MANUAL', 'SCRAPED', 'BRAND_WEBSITE', 'PLATFORM_DEALER']).default('MANUAL'),
  sourceUrl: z.string().optional(),
  isVerified: z.boolean().default(false),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial().omit({ brandId: true });

// GET /api/brand-dealers - List with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { brandId, city, search, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = { isActive: true };

    if (brandId) where.brandId = String(brandId);
    if (city) where.city = { contains: String(city), mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { shopName: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search) } },
        { city: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.brandDealer.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        include: {
          brand: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.brandDealer.count({ where }),
    ]);

    res.json({
      data,
      total,
      page: parseInt(String(page)),
      pages: Math.ceil(total / parseInt(String(limit))),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/brand-dealers/brands-summary - Dealer count per brand
router.get('/brands-summary', async (_req: AuthRequest, res) => {
  try {
    const summary = await prisma.brandDealer.groupBy({
      by: ['brandId'],
      where: { isActive: true },
      _count: true,
    });

    // Fetch brand names
    const brandIds = summary.map(s => s.brandId);
    const brands = await prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, slug: true },
    });

    const result = summary.map(s => {
      const brand = brands.find(b => b.id === s.brandId);
      return {
        brandId: s.brandId,
        brandName: brand?.name || 'Unknown',
        brandSlug: brand?.slug || '',
        dealerCount: s._count,
      };
    });

    res.json({ data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/brand-dealers - Create
router.post('/', async (req: AuthRequest, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    const dealer = await prisma.brandDealer.create({
      data: {
        brandId: data.brandId,
        name: data.name,
        shopName: data.shopName || null,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber || null,
        email: data.email || null,
        city: data.city,
        state: data.state || null,
        pincode: data.pincode || null,
        address: data.address || null,
        source: data.source,
        sourceUrl: data.sourceUrl || null,
        isVerified: data.isVerified,
        notes: data.notes || null,
      },
      include: {
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    return res.status(201).json({ dealer });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A dealer with this phone number already exists for this brand' });
    }
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/brand-dealers/:id - Update
router.patch('/:id', async (req: AuthRequest, res): Promise<any> => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const dealer = await prisma.brandDealer.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: {
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json({ dealer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/brand-dealers/:id - Soft delete
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.brandDealer.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: 'Dealer deactivated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
