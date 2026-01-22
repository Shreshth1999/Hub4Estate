import { Router } from 'express';
import prisma from '../config/database';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all categories with subcategories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category with details
router.get('/categories/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug, isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          include: {
            productTypes: {
              where: { isActive: true },
              take: 5,
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Get subcategory with product types
router.get('/subcategories/:slug', async (req, res) => {
  try {
    const subCategory = await prisma.subCategory.findFirst({
      where: { slug: req.params.slug, isActive: true },
      include: {
        category: true,
        productTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!subCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    return res.json({ subCategory });
  } catch (error) {
    console.error('Get subcategory error:', error);
    return res.status(500).json({ error: 'Failed to fetch subcategory' });
  }
});

// Get product type with products
router.get('/product-types/:slug', async (req, res) => {
  try {
    const { brandId, priceSegment: _priceSegment, page = '1', limit = '20' } = req.query;

    const productType = await prisma.productType.findFirst({
      where: { slug: req.params.slug, isActive: true },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!productType) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    const where: any = {
      productTypeId: productType.id,
      isActive: true,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [products, total, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
        },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: { productTypeId: productType.id, isActive: true },
        select: {
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              priceSegment: true,
            },
          },
        },
        distinct: ['brandId'],
      }),
    ]);

    const uniqueBrands = Array.from(
      new Map(brands.map((p) => [p.brand.id, p.brand])).values()
    );

    return res.json({
      productType,
      products,
      brands: uniqueBrands,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get product type error:', error);
    return res.status(500).json({ error: 'Failed to fetch product type' });
  }
});

// Get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id, isActive: true },
      include: {
        brand: true,
        productType: {
          include: {
            subCategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        productTypeId: product.productTypeId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        brand: true,
      },
      take: 6,
    });

    return res.json({
      product,
      similarProducts,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products
router.get('/search/query', async (req, res) => {
  try {
    const { q, category, brand, page = '1', limit = '20' } = req.query;

    if (!q || (q as string).length < 2) {
      return res.status(400).json({ error: 'Search query too short' });
    }

    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { modelNumber: { contains: q as string, mode: 'insensitive' } },
      ],
    };

    if (brand) {
      where.brandId = brand;
    }

    if (category) {
      where.productType = {
        subCategory: {
          categoryId: category,
        },
      };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          productType: {
            include: {
              subCategory: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      products,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Search products error:', error);
    return res.status(500).json({ error: 'Failed to search products' });
  }
});

// Save product (for authenticated users)
router.post('/:id/save', optionalAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authReq.user.id;
    const productId = req.params.id;
    const { notes } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const saved = await prisma.savedProduct.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
        notes,
      },
      update: {
        notes,
      },
    });

    return res.json({ saved });
  } catch (error) {
    console.error('Save product error:', error);
    return res.status(500).json({ error: 'Failed to save product' });
  }
});

// Get saved products
router.get('/saved/list', optionalAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authReq.user.id;

    const savedProducts = await prisma.savedProduct.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            productType: {
              include: {
                subCategory: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ savedProducts });
  } catch (error) {
    console.error('Get saved products error:', error);
    return res.status(500).json({ error: 'Failed to fetch saved products' });
  }
});

// Get all brands
router.get('/brands/list', async (_req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    return res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

export default router;
