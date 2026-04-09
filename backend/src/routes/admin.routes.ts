import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { generateAdminInsights } from '../services/ai.service';
import { adminAiInsightsRateLimit } from '../middleware/rateLimiter';

const router = Router();

// ============================================
// DEALER MANAGEMENT
// ============================================

// List all dealers with optional status/search/page filter
router.get('/dealers', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = '1', limit = '20', search } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (search) {
      where.OR = [
        { businessName: { contains: String(search), mode: 'insensitive' } },
        { ownerName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { gstNumber: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [dealers, total, pending, verified, suspended, rejected] = await Promise.all([
      prisma.dealer.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dealer.count({ where }),
      prisma.dealer.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.dealer.count({ where: { status: 'VERIFIED' } }),
      prisma.dealer.count({ where: { status: 'SUSPENDED' } }),
      prisma.dealer.count({ where: { status: 'REJECTED' } }),
    ]);

    return res.json({
      dealers,
      counts: { pending, verified, suspended, rejected },
      pagination: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        pages: Math.ceil(total / parseInt(String(limit))),
      },
    });
  } catch (error) {
    console.error('Get dealers error:', error);
    return res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// Get pending dealers (legacy, keep for compat)
router.get('/dealers/pending', authenticateAdmin, async (req, res) => {
  try {
    const dealers = await prisma.dealer.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ dealers });
  } catch (error) {
    console.error('Get pending dealers error:', error);
    return res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// Verify or reject dealer
const verifyDealerSchema = z.object({
  action: z.enum(['verify', 'reject']),
  notes: z.string().optional(),
});

router.post('/dealers/:id/verify', authenticateAdmin, validateBody(verifyDealerSchema), async (req: AuthRequest, res) => {
  try {
    const dealerId = req.params.id;
    const adminId = req.user!.id;
    const { action, notes } = req.body;

    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
    });

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    const newStatus = action === 'verify' ? 'VERIFIED' : 'REJECTED';

    const updatedDealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        status: newStatus,
        verifiedAt: action === 'verify' ? new Date() : null,
        verifiedBy: adminId,
        verificationNotes: notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: action === 'verify' ? 'DEALER_VERIFIED' : 'DEALER_REJECTED',
        entityType: 'dealer',
        entityId: dealerId,
        performedBy: adminId,
        details: JSON.stringify({ notes }),
      },
    });

    return res.json({ dealer: updatedDealer });
  } catch (error) {
    console.error('Verify dealer error:', error);
    return res.status(500).json({ error: 'Failed to verify dealer' });
  }
});

// Suspend dealer
router.post('/dealers/:id/suspend', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.params.id;
    const adminId = req.user!.id;
    const { reason } = req.body;

    const dealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        status: 'SUSPENDED',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DEALER_SUSPENDED',
        entityType: 'dealer',
        entityId: dealerId,
        performedBy: adminId,
        details: JSON.stringify({ reason }),
      },
    });

    return res.json({ dealer });
  } catch (error) {
    console.error('Suspend dealer error:', error);
    return res.status(500).json({ error: 'Failed to suspend dealer' });
  }
});

// ============================================
// PRODUCT CATALOG MANAGEMENT
// ============================================

// Create category
const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
  whatIsIt: z.string().optional(),
  whereUsed: z.string().optional(),
  whyQualityMatters: z.string().optional(),
  commonMistakes: z.string().optional(),
});

router.post('/categories', authenticateAdmin, validateBody(createCategorySchema), async (req: AuthRequest, res) => {
  try {
    const adminId = req.user!.id;

    const category = await prisma.category.create({
      data: req.body,
    });

    await prisma.auditLog.create({
      data: {
        action: 'CATEGORY_CREATED',
        entityType: 'category',
        entityId: category.id,
        performedBy: adminId,
      },
    });

    return res.status(201).json({ category });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category slug already exists' });
    }
    console.error('Create category error:', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// Create brand
const createBrandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  logo: z.string().url().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  priceSegment: z.enum(['Budget', 'Mid-range', 'Premium']).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  isPremium: z.boolean().default(false),
});

router.post('/brands', authenticateAdmin, validateBody(createBrandSchema), async (req: AuthRequest, res) => {
  try {
    const brand = await prisma.brand.create({
      data: req.body,
    });

    return res.status(201).json({ brand });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Brand already exists' });
    }
    console.error('Create brand error:', error);
    return res.status(500).json({ error: 'Failed to create brand' });
  }
});

// Create product
const createProductSchema = z.object({
  productTypeId: z.string().uuid(),
  brandId: z.string().uuid(),
  name: z.string().min(2),
  modelNumber: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  datasheetUrl: z.string().url().optional(),
  manualUrl: z.string().url().optional(),
  certifications: z.array(z.string()).default([]),
  warrantyYears: z.number().int().optional(),
});

router.post('/products', authenticateAdmin, validateBody(createProductSchema), async (req: AuthRequest, res) => {
  try {
    const adminId = req.user!.id;

    const product = await prisma.product.create({
      data: req.body,
      include: {
        brand: true,
        productType: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_CREATED',
        entityType: 'product',
        entityId: product.id,
        performedBy: adminId,
      },
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// ============================================
// DASHBOARD STATS
// ============================================

router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalDealers,
      pendingDealers,
      totalRFQs,
      activeRFQs,
      totalProducts,
      totalInquiries,
      openFraudFlags,
      totalQuotes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dealer.count({ where: { status: 'VERIFIED' } }),
      prisma.dealer.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productInquiry.count(),
      prisma.fraudFlag.count({ where: { status: 'open' } }),
      prisma.quote.count(),
    ]);

    const [recentRFQs, recentDealers] = await Promise.all([
      prisma.rFQ.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          deliveryCity: true,
        },
      }),
      prisma.dealer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          ownerName: true,
          city: true,
          state: true,
          status: true,
          dealerType: true,
          createdAt: true,
        },
      }),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalDealers,
        pendingDealers,
        totalRFQs,
        activeRFQs,
        totalProducts,
        totalInquiries,
        openFraudFlags,
        totalQuotes,
      },
      recentRFQs,
      recentDealers,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================
// ADMIN PRODUCTS LISTING
// ============================================

router.get('/products', authenticateAdmin, async (req, res) => {
  try {
    const { search, categoryId, brandId, page = '1', limit = '20' } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { modelNumber: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (brandId) {
      where.brandId = String(brandId);
    }

    if (categoryId) {
      where.productType = {
        subCategory: {
          categoryId: String(categoryId),
        },
      };
    }

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [products, total, totalBrands, totalCategories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          productType: {
            select: {
              id: true,
              name: true,
              subCategory: {
                select: {
                  name: true,
                  category: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
      prisma.brand.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
    ]);

    return res.json({
      products,
      stats: {
        totalProducts: total,
        totalBrands,
        totalCategories,
      },
      pagination: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        pages: Math.ceil(total / parseInt(String(limit))),
      },
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ============================================
// ADMIN RFQs LISTING
// ============================================

router.get('/rfqs', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) {
      where.status = String(status);
    }

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, brand: { select: { name: true } } },
              },
            },
          },
          quotes: {
            select: { id: true, status: true },
          },
        },
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return res.json({
      rfqs,
      pagination: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        pages: Math.ceil(total / parseInt(String(limit))),
      },
    });
  } catch (error) {
    console.error('Get admin RFQs error:', error);
    return res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
});

// ============================================
// FRAUD FLAGS
// ============================================

router.get('/fraud-flags', authenticateAdmin, async (req, res) => {
  try {
    const flags = await prisma.fraudFlag.findMany({
      where: { status: 'open' },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    return res.json({ flags });
  } catch (error) {
    console.error('Get fraud flags error:', error);
    return res.status(500).json({ error: 'Failed to fetch fraud flags' });
  }
});

// Resolve fraud flag
const resolveFlagSchema = z.object({
  status: z.enum(['resolved', 'false_positive']),
  notes: z.string().optional(),
});

router.post('/fraud-flags/:id/resolve', authenticateAdmin, validateBody(resolveFlagSchema), async (req: AuthRequest, res) => {
  try {
    const adminId = req.user!.id;

    const flag = await prisma.fraudFlag.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
    });

    return res.json({ flag });
  } catch (error) {
    console.error('Resolve fraud flag error:', error);
    return res.status(500).json({ error: 'Failed to resolve flag' });
  }
});

// ============================================
// PROFESSIONAL VERIFICATION
// ============================================

// Get professionals pending verification
router.get('/professionals/pending', authenticateAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { profVerificationStatus: 'UNDER_REVIEW' },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        profVerificationStatus: true, createdAt: true,
        professionalProfile: {
          include: { documents: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ professionals: users });
  } catch (err) {
    console.error('GET /admin/professionals/pending error:', err);
    res.status(500).json({ error: 'Failed to fetch pending professionals' });
  }
});

// Verify or reject professional
router.post('/professionals/:id/verify', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be approve or reject' });
    }

    const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';

    await prisma.user.update({
      where: { id },
      data: { profVerificationStatus: newStatus },
    });

    if (action === 'approve') {
      await prisma.professionalProfile.updateMany({
        where: { userId: id },
        data: {
          verifiedAt: new Date(),
          verifiedBy: req.user?.id,
          rejectionReason: null,
        },
      });
    } else {
      await prisma.professionalProfile.updateMany({
        where: { userId: id },
        data: { rejectionReason: notes || 'Documents not sufficient' },
      });
    }

    return res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('POST /admin/professionals/:id/verify error:', err);
    return res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// ============================================
// AI INSIGHTS ENDPOINT
// ============================================

router.get('/ai-insights', authenticateAdmin, adminAiInsightsRateLimit, async (_req, res) => {
  try {
    // Pull real-time platform data
    const [
      totalInquiries,
      activeRFQs,
      totalQuotes,
      pendingDealers,
      openFraudFlags,
      recentInquiries,
    ] = await Promise.all([
      prisma.productInquiry.count(),
      prisma.rFQ.count({ where: { status: 'PUBLISHED' } }),
      prisma.quote.count(),
      prisma.dealer.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.fraudFlag.count({ where: { status: 'OPEN' } }),
      prisma.productInquiry.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        select: {
          deliveryCity: true,
          modelNumber: true,
          category: { select: { name: true } },
        },
      }),
    ]);

    // Aggregate top cities
    const cityCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const recentProducts: string[] = [];

    for (const inq of recentInquiries) {
      if (inq.deliveryCity) cityCounts[inq.deliveryCity] = (cityCounts[inq.deliveryCity] || 0) + 1;
      const catName = inq.category?.name;
      if (catName) categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      if (inq.modelNumber) recentProducts.push(inq.modelNumber);
    }

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const insights = await generateAdminInsights({
      totalInquiries,
      topCities,
      topCategories,
      pendingDealers,
      openFraudFlags,
      activeRFQs,
      totalQuotes,
      recentProducts,
    });

    return res.json({ insights, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('AI Insights error:', error);
    return res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;
