import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

// ============================================
// COMPANIES
// ============================================

// List all companies with filters
router.get('/companies', authenticateAdmin, async (req, res) => {
  try {
    const {
      status,
      type,
      segment,
      city,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (segment) where.segment = segment;
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { website: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.cRMCompany.findMany({
        where,
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              contacts: true,
              outreaches: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      prisma.cRMCompany.count({ where }),
    ]);

    return res.json({
      companies,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get single company with all details
router.get('/companies/:id', authenticateAdmin, async (req, res) => {
  try {
    const company = await prisma.cRMCompany.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: {
          orderBy: [{ isPrimary: 'desc' }, { decisionMaker: 'desc' }],
        },
        outreaches: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            contact: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    return res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company
const createCompanySchema = z.object({
  name: z.string().min(2),
  type: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'DEALER', 'BRAND', 'OTHER']).default('MANUFACTURER'),
  segment: z.enum(['PREMIUM', 'MID_RANGE', 'BUDGET', 'ALL_SEGMENTS']).default('ALL_SEGMENTS'),
  website: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default('India'),
  description: z.string().optional().nullable(),
  productCategories: z.array(z.string()).default([]),
  yearEstablished: z.number().int().optional().nullable(),
  employeeCount: z.string().optional().nullable(),
  annualRevenue: z.string().optional().nullable(),
  hasApi: z.boolean().default(false),
  digitalMaturity: z.string().optional().nullable(),
  dealerNetworkSize: z.string().optional().nullable(),
  status: z.string().default('prospect'),
  priority: z.string().default('medium'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
});

router.post('/companies', authenticateAdmin, validateBody(createCompanySchema), async (req, res) => {
  try {
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const company = await prisma.cRMCompany.create({
      data: {
        ...req.body,
        slug,
      },
    });

    return res.status(201).json({ company });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Company already exists' });
    }
    console.error('Create company error:', error);
    return res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/companies/:id', authenticateAdmin, async (req, res) => {
  try {
    const company = await prisma.cRMCompany.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({ company });
  } catch (error) {
    console.error('Update company error:', error);
    return res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
router.delete('/companies/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.cRMCompany.delete({
      where: { id: req.params.id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    return res.status(500).json({ error: 'Failed to delete company' });
  }
});

// ============================================
// CONTACTS
// ============================================

// List contacts for a company
router.get('/companies/:companyId/contacts', authenticateAdmin, async (req, res) => {
  try {
    const contacts = await prisma.cRMContact.findMany({
      where: { companyId: req.params.companyId },
      orderBy: [{ isPrimary: 'desc' }, { decisionMaker: 'desc' }],
    });

    return res.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create contact
const createContactSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  designation: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  decisionMaker: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
  status: z.string().default('active'),
  notes: z.string().optional().nullable(),
});

router.post('/contacts', authenticateAdmin, validateBody(createContactSchema), async (req, res) => {
  try {
    // If this is set as primary, unset other primaries
    if (req.body.isPrimary) {
      await prisma.cRMContact.updateMany({
        where: { companyId: req.body.companyId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.cRMContact.create({
      data: req.body,
    });

    return res.status(201).json({ contact });
  } catch (error) {
    console.error('Create contact error:', error);
    return res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/contacts/:id', authenticateAdmin, async (req, res) => {
  try {
    const contact = await prisma.cRMContact.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({ contact });
  } catch (error) {
    console.error('Update contact error:', error);
    return res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/contacts/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.cRMContact.delete({
      where: { id: req.params.id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ============================================
// OUTREACH
// ============================================

// List outreaches with filters
router.get('/outreaches', authenticateAdmin, async (req, res) => {
  try {
    const {
      companyId,
      contactId,
      status,
      type,
      page = '1',
      limit = '20',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (contactId) where.contactId = contactId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [outreaches, total] = await Promise.all([
      prisma.cRMOutreach.findMany({
        where,
        include: {
          company: {
            select: { name: true, slug: true },
          },
          contact: {
            select: { name: true, email: true, designation: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.cRMOutreach.count({ where }),
    ]);

    return res.json({
      outreaches,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get outreaches error:', error);
    return res.status(500).json({ error: 'Failed to fetch outreaches' });
  }
});

// Create outreach
const createOutreachSchema = z.object({
  companyId: z.string().uuid(),
  contactId: z.string().uuid().optional().nullable(),
  type: z.enum(['EMAIL', 'LINKEDIN', 'PHONE_CALL', 'MEETING', 'WHATSAPP', 'OTHER']).default('EMAIL'),
  subject: z.string().optional().nullable(),
  content: z.string(),
  templateUsed: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  status: z.enum(['SCHEDULED', 'SENT', 'DELIVERED', 'OPENED', 'REPLIED', 'MEETING_SCHEDULED', 'NOT_INTERESTED', 'BOUNCED', 'FAILED']).default('SCHEDULED'),
  followUpDate: z.string().datetime().optional().nullable(),
  followUpNumber: z.number().int().default(1),
  notes: z.string().optional().nullable(),
});

router.post('/outreaches', authenticateAdmin, validateBody(createOutreachSchema), async (req, res) => {
  try {
    const data: any = { ...req.body };
    if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);
    if (data.followUpDate) data.followUpDate = new Date(data.followUpDate);

    const outreach = await prisma.cRMOutreach.create({
      data,
      include: {
        company: { select: { name: true } },
        contact: { select: { name: true, email: true } },
      },
    });

    return res.status(201).json({ outreach });
  } catch (error) {
    console.error('Create outreach error:', error);
    return res.status(500).json({ error: 'Failed to create outreach' });
  }
});

// Update outreach
router.put('/outreaches/:id', authenticateAdmin, async (req, res) => {
  try {
    const data: any = { ...req.body };
    if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);
    if (data.followUpDate) data.followUpDate = new Date(data.followUpDate);
    if (data.sentAt) data.sentAt = new Date(data.sentAt);
    if (data.openedAt) data.openedAt = new Date(data.openedAt);
    if (data.repliedAt) data.repliedAt = new Date(data.repliedAt);

    const outreach = await prisma.cRMOutreach.update({
      where: { id: req.params.id },
      data,
    });

    return res.json({ outreach });
  } catch (error) {
    console.error('Update outreach error:', error);
    return res.status(500).json({ error: 'Failed to update outreach' });
  }
});

// Mark outreach as sent
router.post('/outreaches/:id/sent', authenticateAdmin, async (req, res) => {
  try {
    const outreach = await prisma.cRMOutreach.update({
      where: { id: req.params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return res.json({ outreach });
  } catch (error) {
    console.error('Mark outreach sent error:', error);
    return res.status(500).json({ error: 'Failed to update outreach' });
  }
});

// Record response
const recordResponseSchema = z.object({
  responseContent: z.string(),
  responseSentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  notes: z.string().optional(),
});

router.post('/outreaches/:id/response', authenticateAdmin, validateBody(recordResponseSchema), async (req, res) => {
  try {
    const outreach = await prisma.cRMOutreach.update({
      where: { id: req.params.id },
      data: {
        status: 'REPLIED',
        repliedAt: new Date(),
        responseContent: req.body.responseContent,
        responseSentiment: req.body.responseSentiment,
        notes: req.body.notes,
      },
    });

    // Update company status based on sentiment
    if (req.body.responseSentiment === 'positive') {
      await prisma.cRMCompany.update({
        where: { id: outreach.companyId },
        data: { status: 'interested' },
      });
    }

    return res.json({ outreach });
  } catch (error) {
    console.error('Record response error:', error);
    return res.status(500).json({ error: 'Failed to record response' });
  }
});

// ============================================
// MEETINGS
// ============================================

// List meetings
router.get('/meetings', authenticateAdmin, async (req, res) => {
  try {
    const { companyId, status, upcoming } = req.query;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (upcoming === 'true') {
      where.scheduledAt = { gte: new Date() };
      where.status = 'scheduled';
    }

    const meetings = await prisma.cRMMeeting.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });

    return res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    return res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Create meeting
const createMeetingSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().default(30),
  meetingLink: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  attendees: z.string().optional().nullable(),
  agenda: z.string().optional().nullable(),
});

router.post('/meetings', authenticateAdmin, validateBody(createMeetingSchema), async (req, res) => {
  try {
    const meeting = await prisma.cRMMeeting.create({
      data: {
        ...req.body,
        scheduledAt: new Date(req.body.scheduledAt),
      },
    });

    // Update company status
    await prisma.cRMCompany.update({
      where: { id: req.body.companyId },
      data: { status: 'interested' },
    });

    return res.status(201).json({ meeting });
  } catch (error) {
    console.error('Create meeting error:', error);
    return res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Update meeting
router.put('/meetings/:id', authenticateAdmin, async (req, res) => {
  try {
    const data: any = { ...req.body };
    if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);

    const meeting = await prisma.cRMMeeting.update({
      where: { id: req.params.id },
      data,
    });

    return res.json({ meeting });
  } catch (error) {
    console.error('Update meeting error:', error);
    return res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Complete meeting with notes
const completeMeetingSchema = z.object({
  notes: z.string(),
  outcome: z.enum(['positive', 'follow_up_needed', 'not_interested']),
  nextSteps: z.string().optional(),
});

router.post('/meetings/:id/complete', authenticateAdmin, validateBody(completeMeetingSchema), async (req, res) => {
  try {
    const meeting = await prisma.cRMMeeting.update({
      where: { id: req.params.id },
      data: {
        status: 'completed',
        notes: req.body.notes,
        outcome: req.body.outcome,
        nextSteps: req.body.nextSteps,
      },
    });

    // Update company status based on outcome
    if (req.body.outcome === 'positive') {
      await prisma.cRMCompany.update({
        where: { id: meeting.companyId },
        data: { status: 'negotiating' },
      });
    } else if (req.body.outcome === 'not_interested') {
      await prisma.cRMCompany.update({
        where: { id: meeting.companyId },
        data: { status: 'inactive' },
      });
    }

    return res.json({ meeting });
  } catch (error) {
    console.error('Complete meeting error:', error);
    return res.status(500).json({ error: 'Failed to complete meeting' });
  }
});

// ============================================
// EMAIL TEMPLATES
// ============================================

// List templates
router.get('/email-templates', authenticateAdmin, async (req, res) => {
  try {
    const { category } = req.query;

    const where: any = { isActive: true };
    if (category) where.category = category;

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { category: 'asc' },
    });

    return res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/email-templates/:id', authenticateAdmin, async (req, res) => {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: req.params.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    return res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create template
const createTemplateSchema = z.object({
  name: z.string().min(2),
  subject: z.string().min(2),
  body: z.string(),
  category: z.string(),
  placeholders: z.array(z.string()).default([]),
});

router.post('/email-templates', authenticateAdmin, validateBody(createTemplateSchema), async (req, res) => {
  try {
    const template = await prisma.emailTemplate.create({
      data: req.body,
    });

    return res.status(201).json({ template });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Template name already exists' });
    }
    console.error('Create template error:', error);
    return res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/email-templates/:id', authenticateAdmin, async (req, res) => {
  try {
    const template = await prisma.emailTemplate.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    return res.status(500).json({ error: 'Failed to update template' });
  }
});

// ============================================
// PIPELINE OVERVIEW
// ============================================

router.get('/pipeline', authenticateAdmin, async (req, res) => {
  try {
    const [
      prospects,
      contacted,
      interested,
      negotiating,
      partners,
      inactive,
    ] = await Promise.all([
      prisma.cRMCompany.count({ where: { status: 'prospect' } }),
      prisma.cRMCompany.count({ where: { status: 'contacted' } }),
      prisma.cRMCompany.count({ where: { status: 'interested' } }),
      prisma.cRMCompany.count({ where: { status: 'negotiating' } }),
      prisma.cRMCompany.count({ where: { status: 'partner' } }),
      prisma.cRMCompany.count({ where: { status: 'inactive' } }),
    ]);

    const recentOutreaches = await prisma.cRMOutreach.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true } },
        contact: { select: { name: true } },
      },
    });

    const upcomingMeetings = await prisma.cRMMeeting.findMany({
      where: {
        scheduledAt: { gte: new Date() },
        status: 'scheduled',
      },
      take: 5,
      orderBy: { scheduledAt: 'asc' },
    });

    const pendingFollowUps = await prisma.cRMOutreach.findMany({
      where: {
        followUpDate: { lte: new Date() },
        status: { in: ['SENT', 'DELIVERED', 'OPENED'] },
      },
      take: 10,
      include: {
        company: { select: { name: true } },
        contact: { select: { name: true, email: true } },
      },
    });

    return res.json({
      pipeline: {
        prospects,
        contacted,
        interested,
        negotiating,
        partners,
        inactive,
      },
      recentOutreaches,
      upcomingMeetings,
      pendingFollowUps,
    });
  } catch (error) {
    console.error('Get pipeline error:', error);
    return res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// ============================================
// BULK IMPORT COMPANIES
// ============================================

const bulkImportSchema = z.object({
  companies: z.array(z.object({
    name: z.string(),
    type: z.string().optional(),
    segment: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    productCategories: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })),
});

router.post('/companies/bulk-import', authenticateAdmin, validateBody(bulkImportSchema), async (req, res) => {
  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const company of req.body.companies) {
      try {
        const slug = company.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        await prisma.cRMCompany.create({
          data: {
            ...company,
            slug,
            type: (company.type as any) || 'MANUFACTURER',
            segment: (company.segment as any) || 'ALL_SEGMENTS',
            productCategories: company.productCategories || [],
          },
        });
        results.created++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          results.skipped++;
        } else {
          results.errors.push(`${company.name}: ${error.message}`);
        }
      }
    }

    return res.json({ results });
  } catch (error) {
    console.error('Bulk import error:', error);
    return res.status(500).json({ error: 'Failed to import companies' });
  }
});

export default router;
