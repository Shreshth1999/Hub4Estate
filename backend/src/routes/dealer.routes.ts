import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { authenticateDealer, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { analyzeDealerPerformance } from '../services/ai.service';
import { env } from '../config/env';
import { logActivity } from '../services/activity.service';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(env.UPLOAD_DIR, 'dealer-documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const dealerId = (req as AuthRequest).user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname.replace(/[^a-z0-9]/gi, '_');
    cb(null, `${dealerId}_${safeName}_${timestamp}${ext}`);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 5MB default
  },
});

// Get dealer profile
router.get('/profile', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: {
        brandMappings: {
          include: {
            brand: true,
          },
        },
        categoryMappings: {
          include: {
            category: true,
          },
        },
        serviceAreas: true,
      },
    });

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Count quotes and calculate stats
    const quotesStats = await prisma.quote.groupBy({
      by: ['status'],
      where: { dealerId },
      _count: true,
    });

    const totalQuotes = quotesStats.reduce((acc, s) => acc + s._count, 0);
    const wonQuotes = quotesStats.find(s => s.status === 'SELECTED')?._count || 0;

    const { password, ...dealerData } = dealer;

    // Return dealer data with computed fields matching frontend interface
    return res.json({
      ...dealerData,
      totalRFQs: totalQuotes,
      quotesSubmitted: totalQuotes,
      quotesWon: wonQuotes,
      conversionRate: totalQuotes > 0 ? wonQuotes / totalQuotes : 0,
    });
  } catch (error) {
    console.error('Get dealer profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update dealer profile
const updateProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  shopAddress: z.string().min(10).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().length(6).optional(),
});

router.patch('/profile', authenticateDealer, validateBody(updateProfileSchema), async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    const dealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: req.body,
      select: {
        id: true,
        email: true,
        businessName: true,
        ownerName: true,
        phone: true,
        shopAddress: true,
        city: true,
        state: true,
        pincode: true,
      },
    });

    logActivity({
      actorType: 'dealer',
      actorId: dealerId,
      actorEmail: dealer.email,
      actorName: dealer.ownerName,
      activityType: 'DEALER_PROFILE_UPDATED',
      description: `Dealer profile updated: ${dealer.businessName}`,
      metadata: { updatedFields: Object.keys(req.body) },
      entityType: 'dealer',
      entityId: dealerId,
      req,
    });

    return res.json({ dealer });
  } catch (error) {
    console.error('Update dealer profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add brand mapping
const addBrandSchema = z.object({
  brandId: z.string().uuid(),
  authProofUrl: z.string().url().optional(),
});

router.post('/brands', authenticateDealer, validateBody(addBrandSchema), async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    const brand = await prisma.brand.findUnique({
      where: { id: req.body.brandId },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const mapping = await prisma.dealerBrandMapping.create({
      data: {
        dealerId,
        brandId: req.body.brandId,
        authProofUrl: req.body.authProofUrl,
        isVerified: false,
      },
      include: {
        brand: true,
      },
    });

    logActivity({
      actorType: 'dealer',
      actorId: dealerId,
      actorEmail: req.user!.email,
      activityType: 'DEALER_BRAND_ADDED',
      description: `Dealer added brand: ${brand.name}`,
      metadata: { brandId: brand.id, brandName: brand.name },
      entityType: 'dealer',
      entityId: dealerId,
      req,
    });

    return res.status(201).json({ mapping });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Brand already added' });
    }
    console.error('Add brand error:', error);
    return res.status(500).json({ error: 'Failed to add brand' });
  }
});

// Add category mapping
const addCategorySchema = z.object({
  categoryId: z.string().uuid(),
});

router.post('/categories', authenticateDealer, validateBody(addCategorySchema), async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    const category = await prisma.category.findUnique({
      where: { id: req.body.categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const mapping = await prisma.dealerCategoryMapping.create({
      data: {
        dealerId,
        categoryId: req.body.categoryId,
      },
      include: {
        category: true,
      },
    });

    logActivity({
      actorType: 'dealer',
      actorId: dealerId,
      actorEmail: req.user!.email,
      activityType: 'DEALER_CATEGORY_ADDED',
      description: `Dealer added category: ${category.name}`,
      metadata: { categoryId: category.id, categoryName: category.name },
      entityType: 'dealer',
      entityId: dealerId,
      req,
    });

    return res.status(201).json({ mapping });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category already added' });
    }
    console.error('Add category error:', error);
    return res.status(500).json({ error: 'Failed to add category' });
  }
});

// Add service area
const addServiceAreaSchema = z.object({
  pincode: z.string().length(6),
});

router.post('/service-areas', authenticateDealer, validateBody(addServiceAreaSchema), async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    const serviceArea = await prisma.dealerServiceArea.create({
      data: {
        dealerId,
        pincode: req.body.pincode,
      },
    });

    logActivity({
      actorType: 'dealer',
      actorId: dealerId,
      actorEmail: req.user!.email,
      activityType: 'DEALER_SERVICE_AREA_ADDED',
      description: `Dealer added service area: ${req.body.pincode}`,
      metadata: { pincode: req.body.pincode },
      entityType: 'dealer',
      entityId: dealerId,
      req,
    });

    return res.status(201).json({ serviceArea });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Service area already added' });
    }
    console.error('Add service area error:', error);
    return res.status(500).json({ error: 'Failed to add service area' });
  }
});

// Remove service area
router.delete('/service-areas/:id', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    await prisma.dealerServiceArea.delete({
      where: {
        id: req.params.id,
        dealerId,
      },
    });

    return res.json({ message: 'Service area removed' });
  } catch (error) {
    console.error('Remove service area error:', error);
    return res.status(500).json({ error: 'Failed to remove service area' });
  }
});

// Upload document
const documentTypes = ['gstDocument', 'panDocument', 'shopLicense', 'cancelledCheque', 'shopPhoto'] as const;

router.post(
  '/documents',
  authenticateDealer,
  upload.single('document'),
  async (req: AuthRequest, res) => {
    try {
      const dealerId = req.user!.id;
      const { documentType } = req.body;

      if (!documentType || !documentTypes.includes(documentType)) {
        return res.status(400).json({
          error: 'Invalid document type',
          validTypes: documentTypes,
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get the relative path for storage
      const relativePath = `/uploads/dealer-documents/${req.file.filename}`;

      // Update dealer record with document URL
      const updateData: Record<string, string> = {
        [documentType]: relativePath,
      };

      // Check if all required documents are uploaded to update status
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        select: {
          gstDocument: true,
          panDocument: true,
          status: true,
        },
      });

      // If GST and PAN are now uploaded, update status to UNDER_REVIEW
      const hasGst = documentType === 'gstDocument' || dealer?.gstDocument;
      const hasPan = documentType === 'panDocument' || dealer?.panDocument;

      if (hasGst && hasPan && dealer?.status === 'DOCUMENTS_PENDING') {
        updateData.status = 'UNDER_REVIEW';
      }

      const updatedDealer = await prisma.dealer.update({
        where: { id: dealerId },
        data: updateData,
        select: {
          id: true,
          gstDocument: true,
          panDocument: true,
          shopLicense: true,
          cancelledCheque: true,
          shopPhoto: true,
          status: true,
        },
      });

      console.log(`Document uploaded for dealer ${dealerId}: ${documentType} -> ${relativePath}`);

      logActivity({
        actorType: 'dealer',
        actorId: dealerId,
        actorEmail: req.user!.email,
        activityType: 'DEALER_DOCUMENT_UPLOADED',
        description: `Dealer uploaded ${documentType}: ${req.file.originalname}`,
        metadata: { documentType, fileName: req.file.originalname, filePath: relativePath, fileSize: req.file.size, mimeType: req.file.mimetype },
        entityType: 'dealer',
        entityId: dealerId,
        req,
      });

      return res.json({
        message: 'Document uploaded successfully',
        documentType,
        url: relativePath,
        dealer: updatedDealer,
      });
    } catch (error) {
      console.error('Document upload error:', error);
      return res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

// Delete document
router.delete('/documents/:documentType', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;
    const { documentType } = req.params;

    if (!documentTypes.includes(documentType as any)) {
      return res.status(400).json({
        error: 'Invalid document type',
        validTypes: documentTypes,
      });
    }

    // Get current document path
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { [documentType]: true },
    });

    if (!dealer || !dealer[documentType as keyof typeof dealer]) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from disk
    const documentPath = (dealer as unknown as Record<string, string | null>)[documentType];
    const filePath = path.join('.', documentPath || '');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update dealer record
    await prisma.dealer.update({
      where: { id: dealerId },
      data: { [documentType]: null },
    });

    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document delete error:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get AI performance insights
router.get('/insights', authenticateDealer, async (req: AuthRequest, res) => {
  try {
    const dealerId = req.user!.id;

    const insights = await analyzeDealerPerformance(dealerId);

    return res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    return res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

export default router;
