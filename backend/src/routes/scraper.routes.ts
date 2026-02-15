import { Router, Request, Response } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import scraperService from '../services/scraper/scraper.service';
import { ALL_BRAND_CONFIGS } from '../services/scraper/brands.config';
import prisma from '../config/database';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * GET /api/scraper/brands
 * Get all configured brand scrapers
 */
router.get('/brands', async (_req: Request, res: Response) => {
  try {
    // Get configured brands from config
    const configuredBrands = ALL_BRAND_CONFIGS.map(config => ({
      name: config.name,
      slug: config.slug,
      website: config.website,
      category: config.category,
      catalogUrls: config.catalogUrls.length,
    }));

    // Get database brands with stats
    const dbBrands = await prisma.scrapeBrand.findMany({
      include: {
        _count: {
          select: {
            scrapedProducts: true,
            scrapeJobs: true,
          },
        },
      },
    });

    // Merge data
    const brands = configuredBrands.map(config => {
      const dbBrand = dbBrands.find(b => b.slug === config.slug);
      return {
        ...config,
        lastScrapedAt: dbBrand?.lastScrapedAt,
        totalProducts: dbBrand?._count.scrapedProducts || 0,
        totalJobs: dbBrand?._count.scrapeJobs || 0,
        isActive: dbBrand?.isActive ?? true,
      };
    });

    res.json({ brands });
  } catch (error: any) {
    console.error('Failed to get brands:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/stats
 * Get overall scraping statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await scraperService.getScrapeStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/jobs
 * Get recent scrape jobs
 */
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { brandSlug, status, limit = '20', page = '1' } = req.query;

    const where: any = {};
    if (brandSlug) {
      const brand = await prisma.scrapeBrand.findUnique({
        where: { slug: String(brandSlug) },
      });
      if (brand) where.brandId = brand.id;
    }
    if (status) where.status = String(status).toUpperCase();

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [jobs, total] = await Promise.all([
      prisma.scrapeJob.findMany({
        where,
        take: parseInt(String(limit)),
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.scrapeJob.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        pages: Math.ceil(total / parseInt(String(limit))),
      },
    });
  } catch (error: any) {
    console.error('Failed to get jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/jobs/:id
 * Get a specific scrape job with logs
 */
router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await prisma.scrapeJob.findUnique({
      where: { id: req.params.id },
      include: {
        brand: true,
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({
      job: {
        ...job,
        logs: job.logs ? JSON.parse(job.logs) : [],
        errorDetails: job.errorDetails ? JSON.parse(job.errorDetails) : [],
      },
    });
  } catch (error: any) {
    console.error('Failed to get job:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scraper/scrape/:brandSlug
 * Start a scrape job for a specific brand
 */
router.post('/scrape/:brandSlug', async (req: Request, res: Response) => {
  try {
    const { brandSlug } = req.params;

    // Check if brand config exists
    const config = ALL_BRAND_CONFIGS.find(b => b.slug === brandSlug);
    if (!config) {
      res.status(404).json({ error: 'Brand not found in configuration' });
      return;
    }

    // Check if there's already a running job for this brand
    const existingBrand = await prisma.scrapeBrand.findUnique({
      where: { slug: brandSlug },
    });

    if (existingBrand) {
      const runningJob = await prisma.scrapeJob.findFirst({
        where: {
          brandId: existingBrand.id,
          status: 'IN_PROGRESS',
        },
      });

      if (runningJob) {
        res.status(409).json({
          error: 'A scrape job is already running for this brand',
          jobId: runningJob.id,
        });
        return;
      }
    }

    // Start scraping in background
    res.json({
      message: `Scrape job started for ${config.name}`,
      brand: config.name,
    });

    // Run scrape asynchronously (don't await)
    scraperService.scrapeBrand(brandSlug)
      .then(result => {
        console.log(`Scrape completed for ${brandSlug}:`, result);
      })
      .catch(error => {
        console.error(`Scrape failed for ${brandSlug}:`, error);
      });

  } catch (error: any) {
    console.error('Failed to start scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scraper/scrape-all
 * Start scraping all brands (warning: this takes a long time!)
 */
router.post('/scrape-all', async (_req: Request, res: Response) => {
  try {
    res.json({
      message: 'Scrape all brands started',
      totalBrands: ALL_BRAND_CONFIGS.length,
      brands: ALL_BRAND_CONFIGS.map(b => b.name),
    });

    // Run in background
    scraperService.scrapeAllBrands()
      .then(results => {
        console.log('All brands scraping completed:', results);
      })
      .catch(error => {
        console.error('Scrape all failed:', error);
      });

  } catch (error: any) {
    console.error('Failed to start scrape all:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/products
 * Get scraped products (raw data)
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const {
      brandSlug,
      isProcessed,
      search,
      limit = '50',
      page = '1',
    } = req.query;

    const where: any = {};

    if (brandSlug) {
      const brand = await prisma.scrapeBrand.findUnique({
        where: { slug: String(brandSlug) },
      });
      if (brand) where.brandId = brand.id;
    }

    if (isProcessed !== undefined) {
      where.isProcessed = isProcessed === 'true';
    }

    if (search) {
      where.OR = [
        { rawName: { contains: String(search), mode: 'insensitive' } },
        { rawModelNumber: { contains: String(search), mode: 'insensitive' } },
        { rawCategory: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const [products, total] = await Promise.all([
      prisma.scrapedProduct.findMany({
        where,
        take: parseInt(String(limit)),
        skip,
        orderBy: { scrapedAt: 'desc' },
        include: {
          brand: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.scrapedProduct.count({ where }),
    ]);

    // Parse specifications JSON for each product
    const parsedProducts = products.map(p => ({
      ...p,
      rawSpecifications: p.rawSpecifications ? JSON.parse(p.rawSpecifications) : null,
    }));

    res.json({
      products: parsedProducts,
      pagination: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        pages: Math.ceil(total / parseInt(String(limit))),
      },
    });
  } catch (error: any) {
    console.error('Failed to get products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/products/:id
 * Get a specific scraped product
 */
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.scrapedProduct.findUnique({
      where: { id: req.params.id },
      include: {
        brand: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({
      product: {
        ...product,
        rawSpecifications: product.rawSpecifications ? JSON.parse(product.rawSpecifications) : null,
        validationErrors: product.validationErrors ? JSON.parse(product.validationErrors) : null,
      },
    });
  } catch (error: any) {
    console.error('Failed to get product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scraper/products/:id/process
 * Process a scraped product (normalize and create actual product)
 */
router.post('/products/:id/process', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      subCategoryId,
      productTypeId,
      brandId, // Actual Brand ID in products table
      name,
      modelNumber,
      sku,
      description,
      specifications,
      images,
      certifications,
      warrantyYears,
    } = req.body;

    // Get scraped product
    const scrapedProduct = await prisma.scrapedProduct.findUnique({
      where: { id },
    });

    if (!scrapedProduct) {
      res.status(404).json({ error: 'Scraped product not found' });
      return;
    }

    // Create normalized product
    const product = await prisma.product.create({
      data: {
        productTypeId,
        brandId,
        name: name || scrapedProduct.rawName,
        modelNumber: modelNumber || scrapedProduct.rawModelNumber,
        sku: sku || scrapedProduct.rawSku,
        description: description || scrapedProduct.rawDescription,
        specifications: specifications ? JSON.stringify(specifications) : scrapedProduct.rawSpecifications,
        images: images || scrapedProduct.rawImages,
        datasheetUrl: scrapedProduct.rawDatasheetUrl,
        manualUrl: scrapedProduct.rawManualUrl,
        certifications: certifications || scrapedProduct.rawCertifications,
        warrantyYears,
        isActive: true,
      },
    });

    // Mark scraped product as processed
    await prisma.scrapedProduct.update({
      where: { id },
      data: {
        isProcessed: true,
        processedAt: new Date(),
        productId: product.id,
      },
    });

    res.json({
      message: 'Product processed successfully',
      product,
    });
  } catch (error: any) {
    console.error('Failed to process product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/scraper/products/:id
 * Delete a scraped product (if invalid or duplicate)
 */
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    await prisma.scrapedProduct.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
