import { Router, Request, Response } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * GET /api/database/overview
 * Get counts of all tables in the database
 */
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const [
      users,
      dealers,
      admins,
      products,
      categories,
      subCategories,
      productTypes,
      brands,
      rfqs,
      rfqItems,
      quotes,
      quoteItems,
      dealerBrandMappings,
      dealerCategoryMappings,
      dealerServiceAreas,
      dealerReviews,
      communityPosts,
      communityComments,
      knowledgeArticles,
      savedProducts,
      contactSubmissions,
      productInquiries,
      chatSessions,
      chatMessages,
      auditLogs,
      fraudFlags,
      otps,
      crmCompanies,
      crmContacts,
      crmOutreaches,
      crmMeetings,
      emailTemplates,
      scrapeBrands,
      scrapeJobs,
      scrapedProducts,
      userActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dealer.count(),
      prisma.admin.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.subCategory.count(),
      prisma.productType.count(),
      prisma.brand.count(),
      prisma.rFQ.count(),
      prisma.rFQItem.count(),
      prisma.quote.count(),
      prisma.quoteItem.count(),
      prisma.dealerBrandMapping.count(),
      prisma.dealerCategoryMapping.count(),
      prisma.dealerServiceArea.count(),
      prisma.dealerReview.count(),
      prisma.communityPost.count(),
      prisma.communityComment.count(),
      prisma.knowledgeArticle.count(),
      prisma.savedProduct.count(),
      prisma.contactSubmission.count(),
      prisma.productInquiry.count(),
      prisma.chatSession.count(),
      prisma.chatMessage.count(),
      prisma.auditLog.count(),
      prisma.fraudFlag.count(),
      prisma.oTP.count(),
      prisma.cRMCompany.count(),
      prisma.cRMContact.count(),
      prisma.cRMOutreach.count(),
      prisma.cRMMeeting.count(),
      prisma.emailTemplate.count(),
      prisma.scrapeBrand.count(),
      prisma.scrapeJob.count(),
      prisma.scrapedProduct.count(),
      prisma.userActivity.count(),
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      tables: {
        // User Management
        users,
        dealers,
        admins,
        // Products
        categories,
        subCategories,
        productTypes,
        brands,
        products,
        // RFQ & Quotes
        rfqs,
        rfqItems,
        quotes,
        quoteItems,
        // Dealer
        dealerBrandMappings,
        dealerCategoryMappings,
        dealerServiceAreas,
        dealerReviews,
        // Community
        communityPosts,
        communityComments,
        knowledgeArticles,
        // User Interactions
        savedProducts,
        contactSubmissions,
        productInquiries,
        // Chat
        chatSessions,
        chatMessages,
        // Admin & Security
        auditLogs,
        fraudFlags,
        otps,
        // CRM
        crmCompanies,
        crmContacts,
        crmOutreaches,
        crmMeetings,
        emailTemplates,
        // Scraping
        scrapeBrands,
        scrapeJobs,
        scrapedProducts,
        // Activity Tracking
        userActivities,
      },
    });
  } catch (error: any) {
    console.error('Database overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/users
 * Get all users with pagination
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', search } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          city: true,
          purpose: true,
          status: true,
          googleId: true,
          profileImage: true,
          isPhoneVerified: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { rfqs: true, savedProducts: true, communityPosts: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/dealers
 * Get all dealers with full details
 */
router.get('/dealers', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { businessName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { ownerName: { contains: String(search), mode: 'insensitive' } },
        { gstNumber: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.dealer.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          businessName: true,
          ownerName: true,
          phone: true,
          gstNumber: true,
          panNumber: true,
          shopAddress: true,
          city: true,
          state: true,
          pincode: true,
          dealerType: true,
          yearsInOperation: true,
          gstDocument: true,
          panDocument: true,
          shopLicense: true,
          cancelledCheque: true,
          shopPhoto: true,
          onboardingStep: true,
          profileComplete: true,
          status: true,
          verificationNotes: true,
          verifiedAt: true,
          rejectionReason: true,
          totalRFQsReceived: true,
          totalQuotesSubmitted: true,
          totalConversions: true,
          conversionRate: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { brandMappings: true, categoryMappings: true, serviceAreas: true, quotes: true } },
        },
      }),
      prisma.dealer.count({ where }),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/products
 * Get all products with brand and category info
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', search } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { modelNumber: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        include: {
          brand: { select: { name: true, slug: true } },
          productType: { select: { name: true, subCategory: { select: { name: true, category: { select: { name: true } } } } } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/inquiries
 * Get all product inquiries (image uploads, model numbers)
 */
router.get('/inquiries', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search), mode: 'insensitive' } },
        { modelNumber: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.productInquiry.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.productInquiry.count({ where }),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/rfqs
 * Get all RFQs with items and quotes
 */
router.get('/rfqs', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', status } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true, sku: true } } } },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/quotes
 * Get all quotes with dealer info
 */
router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', status } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        include: {
          dealer: { select: { businessName: true, email: true, city: true } },
          rfq: { select: { title: true, deliveryCity: true } },
          items: true,
        },
      }),
      prisma.quote.count({ where }),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/activities
 * Get all user activities (the comprehensive activity log)
 */
router.get('/activities', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '100', activityType, actorType, search } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const where: any = {};
    if (activityType) where.activityType = String(activityType);
    if (actorType) where.actorType = String(actorType);
    if (search) {
      where.OR = [
        { description: { contains: String(search), mode: 'insensitive' } },
        { actorEmail: { contains: String(search), mode: 'insensitive' } },
        { actorName: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userActivity.count({ where }),
    ]);

    // Parse metadata JSON for each activity
    const parsed = data.map(a => ({
      ...a,
      metadata: a.metadata ? JSON.parse(a.metadata) : null,
    }));

    res.json({ data: parsed, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/contacts
 * Get all contact form submissions
 */
router.get('/contacts', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [data, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactSubmission.count(),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/chat-sessions
 * Get all chat sessions with message counts
 */
router.get('/chat-sessions', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [data, total] = await Promise.all([
      prisma.chatSession.findMany({
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { messages: true } } },
      }),
      prisma.chatSession.count(),
    ]);

    res.json({ data, total, page: parseInt(String(page)), limit: parseInt(String(limit)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/categories
 * Get all categories with subcategories
 */
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        subCategories: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { productTypes: true } } },
        },
        _count: { select: { dealerMappings: true } },
      },
    });

    res.json({ data, total: data.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/database/brands
 * Get all brands
 */
router.get('/brands', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true, dealerMappings: true } } },
    });

    res.json({ data, total: data.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;