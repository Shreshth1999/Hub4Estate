import puppeteer, { Browser } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, Prisma } from '@prisma/client';
import * as pLimit from 'p-limit';

const prisma = new PrismaClient();
const limit = pLimit.default(5); // Max 5 concurrent requests

interface Category {
  name: string;
  url: string;
  id: string;
}

interface Product {
  name: string;
  url: string;
  price?: number;
  mrp?: number;
  brand?: string;
  sku?: string;
  description?: string;
  images: string[];
  specifications?: Record<string, string>;
  category: string;
}

class MoglixSitemapScraper {
  private browser: Browser | null = null;
  private imageDir = path.join(__dirname, '../../uploads/moglix');
  private scrapedProducts = new Set<string>();
  private failedProducts = new Set<string>();

  // All categories from Moglix sitemap
  private categories: Category[] = [
    { name: 'Automotive', url: 'https://www.moglix.com/automotive/216000000', id: '216000000' },
    { name: 'Bearings & Power Transmission', url: 'https://www.moglix.com/bearings-power-transmission/123000000', id: '123000000' },
    { name: 'Cutting Tools & Machining', url: 'https://www.moglix.com/cutting-tools-machining/113000000', id: '113000000' },
    { name: 'Hand Tools', url: 'https://www.moglix.com/hand-tools/112000000', id: '112000000' },
    { name: 'Electricals', url: 'https://www.moglix.com/electricals/211000000', id: '211000000' },
    { name: 'Lab Supplies', url: 'https://www.moglix.com/lab-supplies/217000000', id: '217000000' },
    { name: 'Plumbing', url: 'https://www.moglix.com/plumbing/118000000', id: '118000000' },
    { name: 'Hardware', url: 'https://www.moglix.com/hardware/218000000', id: '218000000' },
    { name: 'Safety & Security', url: 'https://www.moglix.com/safety-and-security/116000000', id: '116000000' },
    { name: 'Measurement & Testing', url: 'https://www.moglix.com/measurement-testing/115000000', id: '115000000' },
    { name: 'Appliances & Utilities', url: 'https://www.moglix.com/appliances-and-utilities/230000000', id: '230000000' },
    { name: 'Medical Supplies', url: 'https://www.moglix.com/medical-supplies/215000000', id: '215000000' },
    { name: 'Fasteners', url: 'https://www.moglix.com/fasteners/111000000', id: '111000000' },
    { name: 'Lighting & Luminaries', url: 'https://www.moglix.com/lighting-luminaries/212000000', id: '212000000' },
    { name: 'IT & Electronics', url: 'https://www.moglix.com/it-electronics/250000000', id: '250000000' },
    { name: 'Office Supplies', url: 'https://www.moglix.com/office-supplies/214000000', id: '214000000' },
    { name: 'Kitchen & Pantry Supplies', url: 'https://www.moglix.com/kitchen-and-pantry-supplies/240000000', id: '240000000' },
    { name: 'Paints & Coatings', url: 'https://www.moglix.com/paints-coatings/127000000', id: '127000000' },
    { name: 'Pumps & Motors', url: 'https://www.moglix.com/pumps-motors/128000000', id: '128000000' },
    { name: 'Pneumatics', url: 'https://www.moglix.com/pneumatics/350000000', id: '350000000' },
    { name: 'Hospitality & Furniture', url: 'https://www.moglix.com/hospitality-and-furnitures/220000000', id: '220000000' },
    { name: 'Power Tools', url: 'https://www.moglix.com/power-tools/114000000', id: '114000000' },
    { name: 'Welding', url: 'https://www.moglix.com/welding/126000000', id: '126000000' },
    { name: 'Gardening & Outdoor Equipment', url: 'https://www.moglix.com/gardening-outdoor-equipments/129000000', id: '129000000' },
    { name: 'Hose, Tube & Fittings', url: 'https://www.moglix.com/hose-tube-fittings/670000000', id: '670000000' },
    { name: 'Security', url: 'https://www.moglix.com/security/120000000', id: '120000000' },
    { name: 'Material Handling & Packaging', url: 'https://www.moglix.com/material-handling-packagings/124000000', id: '124000000' },
    { name: 'Lubricants, Coolants & Industrial Oils', url: 'https://www.moglix.com/lubricants-coolants-industrial-oils/125000000', id: '125000000' },
    { name: 'Agriculture & Farming', url: 'https://www.moglix.com/agriculture-farming/600000000', id: '600000000' },
    { name: 'Abrasives', url: 'https://www.moglix.com/abrasives/122000000', id: '122000000' },
    { name: 'Cleaning', url: 'https://www.moglix.com/cleaning/121000000', id: '121000000' },
    { name: 'Electronic Components', url: 'https://www.moglix.com/electronic-components/330000000', id: '330000000' },
    { name: 'Personal Hygiene', url: 'https://www.moglix.com/personal-hygiene/360000000', id: '360000000' },
    { name: 'Solar', url: 'https://www.moglix.com/solar/213000000', id: '213000000' },
    { name: 'Chemical Reagents & Catalysts', url: 'https://www.moglix.com/chemical-reagents-catalysts/450000000', id: '450000000' },
    { name: 'Tapes, Adhesives & Sealants', url: 'https://www.moglix.com/tapes-adhesives-sealants/117000000', id: '117000000' },
  ];

  constructor() {
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  async initialize() {
    console.log('🚀 Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
      ],
    });
    console.log('✅ Browser initialized');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
    await prisma.$disconnect();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async downloadImage(url: string, filename: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const ext = path.extname(new URL(url).pathname) || '.jpg';
      const fullFilename = `${filename}${ext}`;
      const filepath = path.join(this.imageDir, fullFilename);

      fs.writeFileSync(filepath, response.data);
      return `/uploads/moglix/${fullFilename}`;
    } catch (error) {
      return null;
    }
  }

  async getProductUrlsFromSitemap(limit?: number): Promise<string[]> {
    console.log('\n📦 Fetching product URLs from sitemaps...');
    const productUrls: string[] = [];

    try {
      // Fetch first product sitemap
      const sitemapUrl = 'https://www.moglix.com/sitemap_001_products_image1.xml';
      const response = await axios.get(sitemapUrl, { timeout: 30000 });
      const $ = cheerio.load(response.data, { xmlMode: true });

      $('url > loc').each((_, el) => {
        const url = $(el).text();
        if (url && !productUrls.includes(url)) {
          productUrls.push(url);
        }
      });

      console.log(`✅ Found ${productUrls.length} product URLs from sitemap`);

      if (limit && productUrls.length > limit) {
        return productUrls.slice(0, limit);
      }

      return productUrls;
    } catch (error) {
      console.error('❌ Error fetching product sitemap:', error);
      return [];
    }
  }

  async scrapeProductPage(productUrl: string): Promise<Product | null> {
    if (!this.browser) throw new Error('Browser not initialized');

    if (this.scrapedProducts.has(productUrl) || this.failedProducts.has(productUrl)) {
      return null;
    }

    const page = await this.browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    try {
      await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.delay(2000);

      // Extract data step by step to avoid JavaScript errors
      const name = await page.$eval('h1', el => el?.textContent?.trim()).catch(() => '');
      if (!name) {
        await page.close();
        this.failedProducts.add(productUrl);
        return null;
      }

      const priceText = await page.$eval('[class*="price"]', el => el?.textContent?.trim()).catch(() => '');
      const priceMatch = priceText.match(/₹?\s*([\d,]+(?:\.\d{2})?)/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : undefined;

      const brand = await page.$eval('[class*="brand"]', el => el?.textContent?.trim()).catch(() => '');
      const sku = await page.$eval('[class*="sku"], [class*="model"]', el => el?.textContent?.trim()).catch(() => '');
      const description = await page.$eval('[class*="description"]', el => el?.textContent?.trim()).catch(() => '');

      // Extract images
      const images = await page.$$eval('img', (imgs) => {
        const urls: string[] = [];
        imgs.forEach((img) => {
          const src = img.src || img.getAttribute('data-src') || '';
          if (src && (src.includes('cdn.moglix.com') || src.includes('cloudinary')) &&
              !src.includes('placeholder') && !src.includes('logo') && !src.includes('.gif')) {
            urls.push(src);
          }
        });
        return [...new Set(urls)].slice(0, 5);
      }).catch(() => []);

      const product = {
        name,
        price,
        mrp: undefined,
        brand,
        sku,
        description,
        images,
        specifications: {},
        category: 'General',
      };

      await page.close();

      if (!product.name) {
        this.failedProducts.add(productUrl);
        return null;
      }

      this.scrapedProducts.add(productUrl);
      return { ...product, url: productUrl };
    } catch (error) {
      console.error(`  ❌ Error scraping ${productUrl}:`, (error as Error).message);
      try {
        await page.close();
      } catch (e) {
        // Page already closed
      }
      this.failedProducts.add(productUrl);
      return null;
    }
  }

  async saveProductToDatabase(product: Product) {
    try {
      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: { equals: product.category, mode: 'insensitive' } },
      });

      if (!category) {
        try {
          category = await prisma.category.create({
            data: {
              name: product.category,
              slug: product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: `${product.category} products`,
            },
          });
        } catch (e) {
          // Handle race condition - another request created it
          category = await prisma.category.findFirst({
            where: { name: { equals: product.category, mode: 'insensitive' } },
          });
        }
      }

      if (!category) return; // Skip if still no category

      // Find or create subcategory
      let subCategory = await prisma.subCategory.findFirst({
        where: {
          categoryId: category.id,
          name: 'General',
        },
      });

      if (!subCategory) {
        try {
          subCategory = await prisma.subCategory.create({
            data: {
              categoryId: category.id,
              name: 'General',
              slug: 'general',
              description: 'General products',
            },
          });
        } catch (e) {
          subCategory = await prisma.subCategory.findFirst({
            where: {
              categoryId: category.id,
              name: 'General',
            },
          });
        }
      }

      if (!subCategory) return;

      // Find or create product type
      let productType = await prisma.productType.findFirst({
        where: {
          subCategoryId: subCategory.id,
          name: 'General',
        },
      });

      if (!productType) {
        try {
          productType = await prisma.productType.create({
            data: {
              subCategoryId: subCategory.id,
              name: 'General',
              slug: 'general',
              description: 'General products',
            },
          });
        } catch (e) {
          productType = await prisma.productType.findFirst({
            where: {
              subCategoryId: subCategory.id,
              name: 'General',
            },
          });
        }
      }

      if (!productType) return;

      // Find or create brand
      let brand = null;
      if (product.brand) {
        brand = await prisma.brand.findFirst({
          where: { name: { equals: product.brand, mode: 'insensitive' } },
        });

        if (!brand) {
          try {
            brand = await prisma.brand.create({
              data: {
                name: product.brand,
                slug: product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              },
            });
          } catch (e) {
            brand = await prisma.brand.findFirst({
              where: { name: { equals: product.brand, mode: 'insensitive' } },
            });
          }
        }
      }

      if (!brand) return; // Skip if no brand

      // Download images
      const savedImages: string[] = [];
      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        const filename = `${product.sku || Date.now()}_${i}`;
        const savedPath = await this.downloadImage(imageUrl, filename);
        if (savedPath) {
          savedImages.push(savedPath);
        }
      }

      // Check if product exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { name: product.name },
            { sku: product.sku || undefined },
          ],
        },
      });

      if (existingProduct) {
        return;
      }

      // Create product (generate SKU if missing)
      const finalSku = product.sku && product.sku.trim() ? product.sku : `MOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await prisma.product.create({
        data: {
          name: product.name,
          modelNumber: product.sku || undefined,
          sku: finalSku,
          description: product.description || `${product.name}`,
          specifications: JSON.stringify(product.specifications || {}),
          images: savedImages,
          certifications: [],
          productTypeId: productType.id,
          brandId: brand.id,
        },
      });

      console.log(`  ✅ Saved: ${product.name}`);
    } catch (error) {
      console.error(`  ❌ Error saving product: ${error}`);
    }
  }

  async scrapeAll(maxProducts: number = 1000) {
    try {
      await this.initialize();

      console.log(`\n🎯 Starting to scrape ${maxProducts} products from Moglix...\n`);

      // Get product URLs from sitemap
      const productUrls = await this.getProductUrlsFromSitemap(maxProducts);

      if (productUrls.length === 0) {
        console.log('❌ No product URLs found');
        return;
      }

      console.log(`\n📦 Scraping ${productUrls.length} products...`);

      let scraped = 0;
      let failed = 0;

      // Scrape products with concurrency limit
      const scrapePromises = productUrls.map((url, index) =>
        limit(async () => {
          const product = await this.scrapeProductPage(url);

          if (product) {
            await this.saveProductToDatabase(product);
            scraped++;
          } else {
            failed++;
          }

          if ((scraped + failed) % 10 === 0) {
            console.log(`📊 Progress: ${scraped} saved, ${failed} failed, ${scraped + failed}/${productUrls.length} total`);
          }

          await this.delay(500 + Math.random() * 1000);
        })
      );

      await Promise.all(scrapePromises);

      console.log('\n🎉 Scraping completed!');
      console.log(`✅ Successfully scraped: ${scraped} products`);
      console.log(`❌ Failed: ${failed} products`);
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.close();
    }
  }
}

// Run the scraper
if (require.main === module) {
  const scraper = new MoglixSitemapScraper();
  const maxProducts = parseInt(process.argv[2]) || 1000;

  scraper.scrapeAll(maxProducts)
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export default MoglixSitemapScraper;
