import { Router } from 'express';
import prisma from '../config/database';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { cached, invalidateCache } from '../config/redis';

const router = Router();

// Cache TTLs (seconds)
const CACHE_TTL = {
  CATEGORIES: 300,    // 5 minutes — rarely changes
  BRANDS: 300,        // 5 minutes — rarely changes
  PRODUCT_TYPE: 120,  // 2 minutes — products may update
  PRODUCT_DETAIL: 60, // 1 minute  — individual product
  SEARCH: 60,         // 1 minute  — search results
} as const;

// Get all categories with subcategories (cached 5 min)
router.get('/categories', async (_req, res) => {
  try {
    const categories = await cached('products:categories', CACHE_TTL.CATEGORIES, () =>
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          subCategories: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })
    );

    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category with details (cached 5 min)
router.get('/categories/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const category = await cached(`products:category:${slug}`, CACHE_TTL.CATEGORIES, () =>
      prisma.category.findUnique({
        where: { slug, isActive: true },
        include: {
          subCategories: {
            where: { isActive: true },
            include: {
              productTypes: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      })
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Get subcategory with product types (cached 5 min)
router.get('/subcategories/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const subCategory = await cached(`products:subcategory:${slug}`, CACHE_TTL.CATEGORIES, () =>
      prisma.subCategory.findFirst({
        where: { slug, isActive: true },
        include: {
          category: true,
          productTypes: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      })
    );

    if (!subCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    return res.json({ subCategory });
  } catch (error) {
    console.error('Get subcategory error:', error);
    return res.status(500).json({ error: 'Failed to fetch subcategory' });
  }
});

// Get product type with products (cached 2 min per slug+page+brand combo)
router.get('/product-types/:slug', async (req, res) => {
  try {
    const { brandId, priceSegment: _priceSegment, page = '1', limit = '20' } = req.query;
    const slug = req.params.slug;
    const cacheKey = `products:type:${slug}:p${page}:l${limit}:b${brandId || 'all'}`;

    const result = await cached(cacheKey, CACHE_TTL.PRODUCT_TYPE, async () => {
      const productType = await prisma.productType.findFirst({
        where: { slug, isActive: true },
        include: {
          subCategory: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!productType) return null;

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
          include: { brand: true },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.product.count({ where }),
        prisma.product.findMany({
          where: { productTypeId: productType.id, isActive: true },
          select: {
            brand: {
              select: { id: true, name: true, slug: true, priceSegment: true },
            },
          },
          distinct: ['brandId'],
        }),
      ]);

      const uniqueBrands = Array.from(
        new Map(brands.map((p) => [p.brand.id, p.brand])).values()
      );

      return {
        productType,
        products,
        brands: uniqueBrands,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      };
    });

    if (!result) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    return res.json(result);
  } catch (error) {
    console.error('Get product type error:', error);
    return res.status(500).json({ error: 'Failed to fetch product type' });
  }
});

// Get single product details (cached 1 min)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await cached(`products:detail:${id}`, CACHE_TTL.PRODUCT_DETAIL, async () => {
      const product = await prisma.product.findUnique({
        where: { id, isActive: true },
        include: {
          brand: true,
          productType: {
            include: {
              subCategory: {
                include: { category: true },
              },
            },
          },
        },
      });

      if (!product) return null;

      // Get similar products (now parallel-safe since we have the product)
      const similarProducts = await prisma.product.findMany({
        where: {
          productTypeId: product.productTypeId,
          id: { not: product.id },
          isActive: true,
        },
        include: { brand: true },
        take: 6,
      });

      return { product, similarProducts };
    });

    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(result);
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products (cached 1 min per query combo)
router.get('/search/query', async (req, res) => {
  try {
    const { q, category, brand, page = '1', limit = '20' } = req.query;

    if (!q || (q as string).length < 2) {
      return res.status(400).json({ error: 'Search query too short' });
    }

    const cacheKey = `products:search:${(q as string).toLowerCase()}:p${page}:l${limit}:b${brand || ''}:c${category || ''}`;

    const result = await cached(cacheKey, CACHE_TTL.SEARCH, async () => {
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
                  include: { category: true },
                },
              },
            },
          },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Search products error:', error);
    return res.status(500).json({ error: 'Failed to search products' });
  }
});

// Search autocomplete suggestions (cached 10 min)
router.get('/search/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) {
      return res.json({ suggestions: [] });
    }

    const query = (q as string).trim().toLowerCase();
    const cacheKey = `products:suggest:${query}`;

    const result = await cached(cacheKey, 600, async () => {
      const [products, brands, categories] = await Promise.all([
        prisma.product.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { modelNumber: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: { name: true },
          take: 5,
          distinct: ['name'],
        }),
        prisma.brand.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          select: { name: true },
          take: 3,
        }),
        prisma.category.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          select: { name: true },
          take: 3,
        }),
      ]);

      const suggestions = [
        ...products.map(p => p.name),
        ...brands.map(b => b.name),
        ...categories.map(c => c.name),
      ];
      return { suggestions: [...new Set(suggestions)].slice(0, 8) };
    });

    return res.json(result);
  } catch (error) {
    console.error('Search suggest error:', error);
    return res.json({ suggestions: [] });
  }
});

// Trending searches (cached 1 hour)
router.get('/search/trending', async (_req, res) => {
  try {
    const trending = await cached('products:trending', 3600, async () => {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: { name: true },
        take: 10,
      });
      return products.map(p => p.name);
    });

    return res.json({ trending });
  } catch (error) {
    console.error('Trending error:', error);
    return res.json({ trending: [] });
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

// Get all brands (cached 5 min)
router.get('/brands/list', async (_req, res) => {
  try {
    const brands = await cached('products:brands', CACHE_TTL.BRANDS, () =>
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      })
    );

    return res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    return res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

export default router;
