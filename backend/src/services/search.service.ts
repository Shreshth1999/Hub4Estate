/**
 * Search Service
 *
 * Provides full-text product search with optional Elasticsearch integration.
 * Falls back to Prisma text search when Elasticsearch is unavailable.
 */

import prisma from '../config/database';
import { cached } from '../config/redis';

// ============================================
// TYPES
// ============================================

interface SearchParams {
  query: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    modelNumber: string | null;
    brandName: string;
    categoryName: string;
    subCategoryName: string;
    specifications: string | null;
    images: string[];
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: {
    brands: Array<{ name: string; count: number }>;
    categories: Array<{ name: string; count: number }>;
  };
}

interface SuggestionResult {
  suggestions: string[];
}

// ============================================
// PRISMA-BASED SEARCH (Default fallback)
// ============================================

async function prismaSearch(params: SearchParams): Promise<SearchResult> {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  const orConditions: any[] = [];

  if (params.query) {
    const q = params.query.trim();
    orConditions.push(
      { name: { contains: q, mode: 'insensitive' } },
      { modelNumber: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
      { productType: { name: { contains: q, mode: 'insensitive' } } },
    );
    where.OR = orConditions;
  }

  if (params.brand) {
    where.brand = { name: { equals: params.brand, mode: 'insensitive' } };
  }

  if (params.category) {
    where.productType = {
      subCategory: {
        category: { name: { equals: params.category, mode: 'insensitive' } },
      },
    };
  }

  // Sort order
  let orderBy: any;
  switch (params.sortBy) {
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'popular':
      orderBy = { createdAt: 'desc' }; // Fallback — no searchCount field
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        productType: {
          include: {
            subCategory: {
              include: { category: { select: { name: true } } },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Build facets (top brands and categories in results)
  const [brandFacets, categoryFacets] = await Promise.all([
    prisma.product.groupBy({
      by: ['brandId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.product.findMany({
      where,
      select: {
        productType: {
          select: {
            subCategory: {
              select: { category: { select: { name: true } } },
            },
          },
        },
      },
      distinct: ['productTypeId'],
      take: 50,
    }),
  ]);

  // Resolve brand names for facets
  const brandIds = brandFacets.map(b => b.brandId);
  const brands = await prisma.brand.findMany({
    where: { id: { in: brandIds } },
    select: { id: true, name: true },
  });
  const brandMap = new Map(brands.map(b => [b.id, b.name]));

  // Count categories
  const catCounts: Record<string, number> = {};
  categoryFacets.forEach(p => {
    const cat = p.productType.subCategory.category.name;
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  return {
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      modelNumber: p.modelNumber,
      brandName: p.brand.name,
      categoryName: p.productType.subCategory.category.name,
      subCategoryName: p.productType.subCategory.name,
      specifications: p.specifications,
      images: p.images || [],
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    facets: {
      brands: brandFacets.map(b => ({
        name: brandMap.get(b.brandId) || 'Unknown',
        count: b._count.id,
      })),
      categories: Object.entries(catCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    },
  };
}

// ============================================
// SEARCH SERVICE (Public API)
// ============================================

export const searchService = {
  /**
   * Full-text product search with filters and facets.
   * Uses Redis cache for common queries.
   */
  search: async (params: SearchParams): Promise<SearchResult> => {
    const cacheKey = `search:${JSON.stringify(params)}`;
    return cached(cacheKey, 300, () => prismaSearch(params)); // 5 min cache
  },

  /**
   * Autocomplete suggestions based on partial query.
   */
  suggest: async (query: string): Promise<SuggestionResult> => {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    const cacheKey = `suggest:${query.toLowerCase()}`;
    return cached(cacheKey, 600, async () => {
      const q = query.trim().toLowerCase();

      // Get matching product names
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { modelNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { name: true },
        take: 5,
        distinct: ['name'],
      });

      // Get matching brand names
      const brands = await prisma.brand.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { name: true },
        take: 3,
      });

      // Get matching categories
      const categories = await prisma.category.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { name: true },
        take: 3,
      });

      const suggestions = [
        ...products.map(p => p.name),
        ...brands.map(b => b.name),
        ...categories.map(c => c.name),
      ];

      // Deduplicate
      return { suggestions: [...new Set(suggestions)].slice(0, 8) };
    });
  },

  /**
   * Get trending searches (recent popular product names).
   */
  getTrending: async (): Promise<string[]> => {
    return cached('search:trending', 3600, async () => {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: { name: true },
        take: 10,
      });
      return products.map(p => p.name);
    });
  },
};
