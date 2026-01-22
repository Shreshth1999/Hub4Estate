import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { validateBody } from '../middleware/validation';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { env } from '../config/env';
import {
  sendEmail,
  getContactNotificationEmail,
  getContactAutoReplyEmail,
} from '../services/email.service';

const router = Router();

// ============================================
// PUBLIC ENDPOINTS
// ============================================

// Submit contact form (public)
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  role: z.enum(['homeowner', 'contractor', 'dealer', 'brand', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

router.post('/submit', validateBody(contactSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, message } = req.body;

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone,
        role,
        message,
        source: 'contact_form',
      },
    });

    // Send notification email to admin
    const notificationEmail = getContactNotificationEmail({ name, email, phone, role, message });
    const notificationSent = await sendEmail({
      to: env.NOTIFICATION_EMAIL,
      subject: notificationEmail.subject,
      html: notificationEmail.html,
      replyTo: email,
    });

    // Send auto-reply to user
    const autoReplyEmail = getContactAutoReplyEmail(name);
    await sendEmail({
      to: email,
      subject: autoReplyEmail.subject,
      html: autoReplyEmail.html,
    });

    // Update email sent status
    if (notificationSent) {
      await prisma.contactSubmission.update({
        where: { id: submission.id },
        data: { emailSent: true, emailSentAt: new Date() },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all contact submissions
router.get('/submissions', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = status ? { status: status as string } : {};

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    return res.json({
      submissions,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get single submission
router.get('/submissions/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Update submission status
const updateStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'closed']),
  notes: z.string().optional(),
});

router.patch(
  '/submissions/:id',
  authenticateAdmin,
  validateBody(updateStatusSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const submission = await prisma.contactSubmission.update({
        where: { id },
        data: {
          status,
          notes,
          assignedTo: req.user!.id,
        },
      });

      return res.json({ submission });
    } catch (error) {
      console.error('Update submission error:', error);
      return res.status(500).json({ error: 'Failed to update submission' });
    }
  }
);

// Delete submission
router.delete('/submissions/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.contactSubmission.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete submission error:', error);
    return res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// Get submission stats
router.get('/stats', authenticateAdmin, async (_req: Request, res: Response) => {
  try {
    const [total, byStatus, recent] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.contactSubmission.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return res.json({
      total,
      byStatus: byStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {}
      ),
      recentWeek: recent,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
