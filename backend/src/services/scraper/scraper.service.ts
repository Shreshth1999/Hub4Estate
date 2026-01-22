import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import prisma from '../../config/database';
import { BrandConfig, ALL_BRAND_CONFIGS, getBrandConfig } from './brands.config';

// Types
interface ScrapedProductData {
  sourceUrl: string;
  rawName: string;
  rawCategory?: string;
  rawSubCategory?: string;
  rawModelNumber?: string;
  rawSku?: string;
  rawDescription?: string;
  rawSpecifications?: Record<string, any>;
  rawImages: string[];
  rawDatasheetUrl?: string;
  rawManualUrl?: string;
  rawPrice?: string;
  rawCertifications: string[];
  rawWarranty?: string;
}

interface ScrapeResult {
  success: boolean;
  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  errors: string[];
}

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateContentHash = (data: ScrapedProductData): string => {
  const hashContent = `${data.rawName}|${data.rawModelNumber}|${data.sourceUrl}`;
  return crypto.createHash('md5').update(hashContent).digest('hex');
};

const makeAbsoluteUrl = (url: string | undefined, baseUrl: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

// Extract attribute from selector (e.g., "img@src" -> src attribute)
const parseSelector = (selector: string): { cssSelector: string; attribute?: string } => {
  const atIndex = selector.lastIndexOf('@');
  if (atIndex > 0) {
    return {
      cssSelector: selector.substring(0, atIndex),
      attribute: selector.substring(atIndex + 1),
    };
  }
  return { cssSelector: selector };
};

// Get value from element using selector
const getElementValue = ($: cheerio.CheerioAPI, element: cheerio.Cheerio<any>, selector: string): string => {
  const { cssSelector, attribute } = parseSelector(selector);
  const target = cssSelector ? element.find(cssSelector) : element;

  if (attribute) {
    return target.attr(attribute) || '';
  }
  return target.text().trim();
};

// Main scraper class
export class ProductScraper {
  private config: BrandConfig;
  private baseUrl: string;
  private jobId: string | null = null;
  private logs: string[] = [];
  private errors: string[] = [];

  constructor(config: BrandConfig) {
    this.config = config;
    this.baseUrl = config.website;
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(`[Scraper:${this.config.slug}] ${message}`);
  }

  private logError(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const errorEntry = `[${timestamp}] ERROR: ${message} ${error ? JSON.stringify(error) : ''}`;
    this.errors.push(errorEntry);
    console.error(`[Scraper:${this.config.slug}] ERROR: ${message}`, error);
  }

  private async fetchPage(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        timeout: this.config.requestConfig?.timeout || 30000,
        headers: {
          'User-Agent': this.config.requestConfig?.userAgent ||
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          ...this.config.requestConfig?.headers,
        },
      });
      return response.data;
    } catch (error: any) {
      this.logError(`Failed to fetch ${url}`, error.message);
      return null;
    }
  }

  private parseProductList(html: string, pageUrl: string): { products: { url: string; name?: string }[]; nextPage?: string } {
    const $ = cheerio.load(html);
    const products: { url: string; name?: string }[] = [];

    const { cssSelector: listSelector } = parseSelector(this.config.selectors.productList);
    const productElements = $(listSelector);

    this.log(`Found ${productElements.length} product elements on ${pageUrl}`);

    productElements.each((_, element) => {
      const $el = $(element);

      // Get product URL
      const productUrl = getElementValue($, $el, this.config.selectors.productLink);
      if (productUrl) {
        const absoluteUrl = makeAbsoluteUrl(productUrl, this.baseUrl);

        // Get product name if available on listing page
        let name: string | undefined;
        if (this.config.selectors.productName) {
          name = getElementValue($, $el, this.config.selectors.productName);
        }

        products.push({ url: absoluteUrl, name });
      }
    });

    // Check for pagination
    let nextPage: string | undefined;
    if (this.config.selectors.pagination) {
      const { cssSelector, attribute } = parseSelector(this.config.selectors.pagination);
      const nextPageUrl = $(cssSelector).attr(attribute || 'href');
      if (nextPageUrl) {
        nextPage = makeAbsoluteUrl(nextPageUrl, this.baseUrl);
      }
    }

    return { products, nextPage };
  }

  private parseProductDetail(html: string, url: string): ScrapedProductData | null {
    try {
      const $ = cheerio.load(html);
      const selectors = this.config.selectors;

      // Get product name
      const rawName = $(selectors.detailName).text().trim();
      if (!rawName) {
        this.logError(`No product name found at ${url}`);
        return null;
      }

      // Get images
      const rawImages: string[] = [];
      const mainImage = $(selectors.detailImage).attr('src');
      if (mainImage) {
        rawImages.push(makeAbsoluteUrl(mainImage, this.baseUrl));
      }

      // Get gallery images
      if (selectors.detailGallery) {
        const { cssSelector, attribute } = parseSelector(selectors.detailGallery);
        $(cssSelector).each((_, img) => {
          const src = $(img).attr(attribute || 'src');
          if (src) {
            const absUrl = makeAbsoluteUrl(src, this.baseUrl);
            if (!rawImages.includes(absUrl)) {
              rawImages.push(absUrl);
            }
          }
        });
      }

      // Get specifications
      const rawSpecifications: Record<string, any> = {};
      if (selectors.detailSpecsTable && selectors.detailSpecRow) {
        const specTable = $(selectors.detailSpecsTable);
        specTable.find(selectors.detailSpecRow).each((_, row) => {
          const $row = $(row);
          const label = selectors.detailSpecLabel
            ? $row.find(selectors.detailSpecLabel).text().trim()
            : $row.find('th, td:first-child').text().trim();
          const value = selectors.detailSpecValue
            ? $row.find(selectors.detailSpecValue).text().trim()
            : $row.find('td:last-child').text().trim();

          if (label && value && label !== value) {
            rawSpecifications[label] = value;
          }
        });
      }

      // Get other fields
      const rawDescription = selectors.detailDescription
        ? $(selectors.detailDescription).text().trim()
        : undefined;

      const rawCategory = selectors.detailCategory
        ? $(selectors.detailCategory).text().trim()
        : undefined;

      const rawSubCategory = selectors.detailSubCategory
        ? $(selectors.detailSubCategory).text().trim()
        : undefined;

      const rawModelNumber = selectors.detailModelNumber
        ? $(selectors.detailModelNumber).text().trim()
        : undefined;

      const rawSku = selectors.detailSku
        ? $(selectors.detailSku).text().trim()
        : undefined;

      const rawPrice = selectors.detailPrice
        ? $(selectors.detailPrice).text().trim()
        : undefined;

      const rawDatasheetUrl = selectors.detailDatasheet
        ? makeAbsoluteUrl($(parseSelector(selectors.detailDatasheet).cssSelector).attr('href'), this.baseUrl)
        : undefined;

      const rawManualUrl = selectors.detailManual
        ? makeAbsoluteUrl($(parseSelector(selectors.detailManual).cssSelector).attr('href'), this.baseUrl)
        : undefined;

      const rawWarranty = selectors.detailWarranty
        ? $(selectors.detailWarranty).text().trim()
        : undefined;

      // Get certifications
      const rawCertifications: string[] = [];
      if (selectors.detailCertifications) {
        $(selectors.detailCertifications).each((_, el) => {
          const cert = $(el).text().trim();
          if (cert) rawCertifications.push(cert);
        });
      }

      return {
        sourceUrl: url,
        rawName,
        rawCategory,
        rawSubCategory,
        rawModelNumber,
        rawSku,
        rawDescription,
        rawSpecifications,
        rawImages,
        rawDatasheetUrl,
        rawManualUrl,
        rawPrice,
        rawCertifications,
        rawWarranty,
      };
    } catch (error) {
      this.logError(`Failed to parse product at ${url}`, error);
      return null;
    }
  }

  async scrapeAll(): Promise<ScrapeResult> {
    const result: ScrapeResult = {
      success: false,
      productsFound: 0,
      productsCreated: 0,
      productsUpdated: 0,
      errors: [],
    };

    try {
      // Get or create brand in database
      let scrapeBrand = await prisma.scrapeBrand.findUnique({
        where: { slug: this.config.slug },
      });

      if (!scrapeBrand) {
        scrapeBrand = await prisma.scrapeBrand.create({
          data: {
            name: this.config.name,
            slug: this.config.slug,
            website: this.config.website,
            logoUrl: this.config.logoUrl,
            catalogUrls: JSON.stringify(this.config.catalogUrls),
            selectors: JSON.stringify(this.config.selectors),
          },
        });
      }

      // Create scrape job
      const job = await prisma.scrapeJob.create({
        data: {
          brandId: scrapeBrand.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          configSnapshot: JSON.stringify(this.config.selectors),
        },
      });
      this.jobId = job.id;

      this.log(`Starting scrape job ${job.id} for ${this.config.name}`);

      // Scrape each catalog URL
      for (const catalogUrl of this.config.catalogUrls) {
        this.log(`Scraping catalog: ${catalogUrl}`);

        let currentUrl: string | undefined = catalogUrl;
        let pageCount = 0;
        const maxPages = 50; // Safety limit

        while (currentUrl && pageCount < maxPages) {
          pageCount++;
          this.log(`Fetching page ${pageCount}: ${currentUrl}`);

          const html = await this.fetchPage(currentUrl);
          if (!html) {
            currentUrl = undefined;
            continue;
          }

          const { products, nextPage } = this.parseProductList(html, currentUrl);
          result.productsFound += products.length;

          // Scrape each product detail
          for (const product of products) {
            await delay(this.config.requestConfig?.delay || 1000);

            const productHtml = await this.fetchPage(product.url);
            if (!productHtml) continue;

            const productData = this.parseProductDetail(productHtml, product.url);
            if (!productData) continue;

            // Check for existing product by content hash
            const contentHash = generateContentHash(productData);

            const existing = await prisma.scrapedProduct.findFirst({
              where: {
                brandId: scrapeBrand.id,
                contentHash,
              },
            });

            if (existing) {
              // Update existing
              await prisma.scrapedProduct.update({
                where: { id: existing.id },
                data: {
                  scrapedAt: new Date(),
                  rawDescription: productData.rawDescription,
                  rawSpecifications: productData.rawSpecifications ? JSON.stringify(productData.rawSpecifications) : null,
                  rawImages: productData.rawImages,
                  rawPrice: productData.rawPrice,
                },
              });
              result.productsUpdated++;
            } else {
              // Create new
              await prisma.scrapedProduct.create({
                data: {
                  brandId: scrapeBrand.id,
                  sourceUrl: productData.sourceUrl,
                  rawName: productData.rawName,
                  rawCategory: productData.rawCategory,
                  rawSubCategory: productData.rawSubCategory,
                  rawModelNumber: productData.rawModelNumber,
                  rawSku: productData.rawSku,
                  rawDescription: productData.rawDescription,
                  rawSpecifications: productData.rawSpecifications ? JSON.stringify(productData.rawSpecifications) : null,
                  rawImages: productData.rawImages,
                  rawDatasheetUrl: productData.rawDatasheetUrl,
                  rawManualUrl: productData.rawManualUrl,
                  rawPrice: productData.rawPrice,
                  rawCertifications: productData.rawCertifications,
                  rawWarranty: productData.rawWarranty,
                  contentHash,
                },
              });
              result.productsCreated++;
            }
          }

          currentUrl = nextPage;
          await delay(this.config.requestConfig?.delay || 1000);
        }
      }

      // Update job with results
      await prisma.scrapeJob.update({
        where: { id: this.jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          productsFound: result.productsFound,
          productsCreated: result.productsCreated,
          productsUpdated: result.productsUpdated,
          errors: this.errors.length,
          logs: JSON.stringify(this.logs),
          errorDetails: this.errors.length > 0 ? JSON.stringify(this.errors) : null,
        },
      });

      // Update brand stats
      await prisma.scrapeBrand.update({
        where: { id: scrapeBrand.id },
        data: {
          lastScrapedAt: new Date(),
          lastScrapeCount: result.productsCreated + result.productsUpdated,
          totalProducts: {
            increment: result.productsCreated,
          },
        },
      });

      result.success = true;
      result.errors = this.errors;
      this.log(`Scrape completed: ${result.productsFound} found, ${result.productsCreated} created, ${result.productsUpdated} updated`);

      return result;
    } catch (error: any) {
      this.logError('Scrape failed', error);

      // Update job with failure
      if (this.jobId) {
        await prisma.scrapeJob.update({
          where: { id: this.jobId },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            productsFound: result.productsFound,
            productsCreated: result.productsCreated,
            productsUpdated: result.productsUpdated,
            errors: this.errors.length,
            logs: JSON.stringify(this.logs),
            errorDetails: JSON.stringify([...this.errors, error.message]),
          },
        });
      }

      result.errors = this.errors;
      return result;
    }
  }
}

// Service functions
export async function scrapeAllBrands(): Promise<{ brand: string; result: ScrapeResult }[]> {
  const results: { brand: string; result: ScrapeResult }[] = [];

  for (const config of ALL_BRAND_CONFIGS) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Starting scrape for: ${config.name}`);
    console.log(`${'='.repeat(50)}\n`);

    const scraper = new ProductScraper(config);
    const result = await scraper.scrapeAll();
    results.push({ brand: config.name, result });

    // Wait between brands to be respectful
    await delay(5000);
  }

  return results;
}

export async function scrapeBrand(slug: string): Promise<ScrapeResult> {
  const config = getBrandConfig(slug);
  if (!config) {
    throw new Error(`Brand config not found for: ${slug}`);
  }

  const scraper = new ProductScraper(config);
  return scraper.scrapeAll();
}

export async function getScrapeStats() {
  const brands = await prisma.scrapeBrand.findMany({
    include: {
      _count: {
        select: {
          scrapedProducts: true,
          scrapeJobs: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const recentJobs = await prisma.scrapeJob.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      brand: {
        select: { name: true, slug: true },
      },
    },
  });

  const totalProducts = await prisma.scrapedProduct.count();
  const processedProducts = await prisma.scrapedProduct.count({
    where: { isProcessed: true },
  });

  return {
    brands,
    recentJobs,
    stats: {
      totalBrands: brands.length,
      totalProducts,
      processedProducts,
      unprocessedProducts: totalProducts - processedProducts,
    },
  };
}

export async function getUnprocessedProducts(limit = 100) {
  return prisma.scrapedProduct.findMany({
    where: { isProcessed: false, isValid: true },
    take: limit,
    include: {
      brand: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default {
  scrapeAllBrands,
  scrapeBrand,
  getScrapeStats,
  getUnprocessedProducts,
  ProductScraper,
};
