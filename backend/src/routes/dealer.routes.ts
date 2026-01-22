import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateDealer, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { analyzeDealerPerformance } from '../services/ai.service';

const router = Router();

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

    const { password, ...dealerData } = dealer;

    return res.json({ dealer: dealerData });
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
