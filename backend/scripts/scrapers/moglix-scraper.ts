import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, Prisma } from '@prisma/client';
import * as pLimit from 'p-limit';

const prisma = new PrismaClient();
const limit = pLimit.default(3); // Max 3 concurrent requests

interface ScrapedCategory {
  name: string;
  url: string;
  imageUrl?: string;
  subcategories?: ScrapedCategory[];
}

interface ScrapedProduct {
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

interface ScrapedBrand {
  name: string;
  url?: string;
  logo?: string;
}

class MoglixScraper {
  private browser: Browser | null = null;
  private baseUrl = 'https://www.moglix.com';
  private imageDir = path.join(__dirname, '../../uploads/moglix');
  private scrapedProducts = new Set<string>(); // Track scraped URLs to avoid duplicates

  constructor() {
    // Create image directory if it doesn't exist
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
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
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

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async downloadImage(url: string, filename: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const ext = path.extname(new URL(url).pathname) || '.jpg';
      const fullFilename = `${filename}${ext}`;
      const filepath = path.join(this.imageDir, fullFilename);

      fs.writeFileSync(filepath, response.data);
      return `/uploads/moglix/${fullFilename}`;
    } catch (error) {
      console.error(`Failed to download image ${url}:`, error);
      return null;
    }
  }

  async scrapeCategories(): Promise<ScrapedCategory[]> {
    console.log('\n📂 Scraping categories...');
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    try {
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.delay(2000);

      // Extract main categories
      const categories = await page.evaluate(() => {
        const categoryLinks: { name: string; url: string; imageUrl?: string }[] = [];

        // Try multiple selectors as Moglix structure might vary
        const selectors = [
          '.category-list a',
          '.main-category a',
          '.horizontal-category-flyout a',
          'nav a[href*="/category/"]',
          '[class*="category"] a[href*="/"]',
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach((el) => {
              const anchor = el as HTMLAnchorElement;
              const name = anchor.textContent?.trim() || '';
              const url = anchor.href;
              const img = anchor.querySelector('img') as HTMLImageElement;
              const imageUrl = img?.src || undefined;

              if (name && url && url.includes('/') && !url.includes('javascript:')) {
                categoryLinks.push({ name, url, imageUrl });
              }
            });
            break; // Stop if we found categories
          }
        }

        return categoryLinks;
      });

      console.log(`✅ Found ${categories.length} main categories`);

      // Remove duplicates
      const uniqueCategories = Array.from(
        new Map(categories.map(cat => [cat.name, cat])).values()
      );

      await page.close();
      return uniqueCategories;
    } catch (error) {
      console.error('Error scraping categories:', error);
      await page.close();
      return [];
    }
  }

  async scrapeCategoryProducts(
    categoryUrl: string,
    categoryName: string,
    maxPages: number = 10
  ): Promise<ScrapedProduct[]> {
    console.log(`\n🛍️  Scraping products from: ${categoryName}`);
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const products: ScrapedProduct[] = [];

    try {
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const pageUrl = `${categoryUrl}?page=${pageNum}`;

        if (this.scrapedProducts.has(pageUrl)) {
          console.log(`⏭️  Skipping already scraped page ${pageNum}`);
          continue;
        }

        console.log(`  📄 Scraping page ${pageNum}...`);

        try {
          await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });
          await this.delay(2000);

          // Extract products from current page
          const pageProducts = await page.evaluate((catName) => {
            const productData: any[] = [];

            // Try multiple product card selectors
            const selectors = [
              '.product-card',
              '.product-item',
              '[class*="product"]',
              '.item',
            ];

            let productElements: NodeListOf<Element> | null = null;
            for (const selector of selectors) {
              productElements = document.querySelectorAll(selector);
              if (productElements.length > 0) break;
            }

            if (!productElements || productElements.length === 0) {
              return [];
            }

            productElements.forEach((el) => {
              try {
                // Extract product details
                const nameEl = el.querySelector('h3, h4, .product-name, [class*="name"]');
                const name = nameEl?.textContent?.trim() || '';

                const linkEl = el.querySelector('a');
                const url = linkEl?.href || '';

                const priceEl = el.querySelector('.price, [class*="price"]:not([class*="mrp"])');
                const priceText = priceEl?.textContent?.replace(/[^0-9.]/g, '') || '';
                const price = priceText ? parseFloat(priceText) : undefined;

                const mrpEl = el.querySelector('.mrp, [class*="mrp"]');
                const mrpText = mrpEl?.textContent?.replace(/[^0-9.]/g, '') || '';
                const mrp = mrpText ? parseFloat(mrpText) : undefined;

                const brandEl = el.querySelector('.brand, [class*="brand"]');
                const brand = brandEl?.textContent?.trim() || undefined;

                const images: string[] = [];
                const imgElements = el.querySelectorAll('img');
                imgElements.forEach((img) => {
                  if (img.src && !img.src.includes('placeholder')) {
                    images.push(img.src);
                  }
                });

                if (name && url) {
                  productData.push({
                    name,
                    url,
                    price,
                    mrp,
                    brand,
                    images,
                    category: catName,
                  });
                }
              } catch (err) {
                console.error('Error parsing product:', err);
              }
            });

            return productData;
          }, categoryName);

          if (pageProducts.length === 0) {
            console.log(`  ⚠️  No products found on page ${pageNum}, stopping pagination`);
            break;
          }

          products.push(...pageProducts);
          this.scrapedProducts.add(pageUrl);
          console.log(`  ✅ Found ${pageProducts.length} products (Total: ${products.length})`);

          // Random delay to avoid rate limiting
          await this.delay(1000 + Math.random() * 2000);
        } catch (pageError) {
          console.error(`  ❌ Error on page ${pageNum}:`, pageError);
          break;
        }
      }

      await page.close();
      return products;
    } catch (error) {
      console.error(`Error scraping category products:`, error);
      await page.close();
      return products;
    }
  }

  async scrapeProductDetails(productUrl: string): Promise<Partial<ScrapedProduct> | null> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    try {
      await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.delay(1500);

      const details = await page.evaluate(() => {
        // Extract detailed product information
        const descEl = document.querySelector('.description, [class*="description"]');
        const description = descEl?.textContent?.trim() || undefined;

        const skuEl = document.querySelector('.sku, [class*="sku"], [class*="model"]');
        const sku = skuEl?.textContent?.trim() || undefined;

        // Extract specifications
        const specifications: Record<string, string> = {};
        const specRows = document.querySelectorAll('.specifications tr, [class*="spec"] tr');
        specRows.forEach((row) => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const key = cells[0].textContent?.trim() || '';
            const value = cells[1].textContent?.trim() || '';
            if (key && value) {
              specifications[key] = value;
            }
          }
        });

        // Get all product images
        const images: string[] = [];
        const imgElements = document.querySelectorAll('.product-image img, .gallery img');
        imgElements.forEach((img) => {
          const src = (img as HTMLImageElement).src;
          if (src && !src.includes('placeholder')) {
            images.push(src);
          }
        });

        return { description, sku, specifications, images };
      });

      await page.close();
      return details;
    } catch (error) {
      console.error(`Error scraping product details from ${productUrl}:`, error);
      await page.close();
      return null;
    }
  }

  async saveToDatabase(products: ScrapedProduct[]) {
    console.log(`\n💾 Saving ${products.length} products to database...`);

    for (const product of products) {
      try {
        // Find or create category
        let category = await prisma.category.findFirst({
          where: { name: { equals: product.category, mode: 'insensitive' } },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: product.category,
              slug: product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: `${product.category} products`,
            },
          });
          console.log(`  ✅ Created category: ${category.name}`);
        }

        // Find or create brand
        let brand = null;
        if (product.brand) {
          brand = await prisma.brand.findFirst({
            where: { name: { equals: product.brand, mode: 'insensitive' } },
          });

          if (!brand) {
            brand = await prisma.brand.create({
              data: {
                name: product.brand,
                slug: product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              },
            });
            console.log(`  ✅ Created brand: ${brand.name}`);
          }
        }

        // Download and save images
        const savedImages: string[] = [];
        for (let i = 0; i < Math.min(product.images.length, 5); i++) {
          const imageUrl = product.images[i];
          const filename = `${product.sku || Date.now()}_${i}`;
          const savedPath = await this.downloadImage(imageUrl, filename);
          if (savedPath) {
            savedImages.push(savedPath);
          }
        }

        // Create product
        const existingProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { name: product.name },
              { sku: product.sku || undefined },
            ],
          },
        });

        if (existingProduct) {
          console.log(`  ⏭️  Product already exists: ${product.name}`);
          continue;
        }

        await prisma.product.create({
          data: {
            name: product.name,
            slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: product.description || `${product.name} - High quality product`,
            price: product.price || 0,
            mrp: product.mrp,
            sku: product.sku,
            categoryId: category.id,
            brandId: brand?.id,
            images: savedImages,
            specifications: (product.specifications || {}) as Prisma.JsonObject,
            inStock: true,
            featured: false,
          },
        });

        console.log(`  ✅ Saved: ${product.name}`);
      } catch (error) {
        console.error(`  ❌ Error saving product ${product.name}:`, error);
      }
    }
  }

  async scrapeAll(maxProductsPerCategory: number = 50) {
    try {
      await this.initialize();

      // Step 1: Scrape categories
      const categories = await this.scrapeCategories();
      console.log(`\n📊 Total categories found: ${categories.length}`);

      // Step 2: Scrape products from each category
      const maxPagesPerCategory = Math.ceil(maxProductsPerCategory / 20); // Assuming ~20 products per page

      for (const category of categories) { // Scrape ALL categories
        console.log(`\n🔄 Processing category: ${category.name}`);

        const products = await this.scrapeCategoryProducts(
          category.url,
          category.name,
          maxPagesPerCategory
        );

        // Step 3: Enrich product details (for first few products)
        const enrichedProducts: ScrapedProduct[] = [];
        for (const product of products.slice(0, 30)) { // Enrich first 30 products per category
          const details = await this.scrapeProductDetails(product.url);
          if (details) {
            enrichedProducts.push({ ...product, ...details });
          } else {
            enrichedProducts.push(product);
          }
          await this.delay(1000 + Math.random() * 1000);
        }

        // Add remaining products without enrichment
        enrichedProducts.push(...products.slice(30));

        // Step 4: Save to database
        if (enrichedProducts.length > 0) {
          await this.saveToDatabase(enrichedProducts);
        }

        // Delay between categories
        await this.delay(3000 + Math.random() * 2000);
      }

      console.log('\n🎉 Scraping completed successfully!');
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.close();
    }
  }
}

// Run the scraper
if (require.main === module) {
  const scraper = new MoglixScraper();

  const maxProductsPerCategory = parseInt(process.argv[2]) || 50;

  scraper.scrapeAll(maxProductsPerCategory)
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export default MoglixScraper;
