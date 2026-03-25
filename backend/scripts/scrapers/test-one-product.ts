import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testProduct() {
  console.log('🧪 Testing single product scrape...\n');

  // First, get one product URL from sitemap
  console.log('📡 Fetching product URL from sitemap...');
  const sitemapUrl = 'https://www.moglix.com/sitemap_001_products_image1.xml';
  const response = await axios.get(sitemapUrl, { timeout: 30000 });
  const $ = cheerio.load(response.data, { xmlMode: true });

  const productUrls: string[] = [];
  $('url > loc').each((_, el) => {
    productUrls.push($(el).text());
  });

  const testUrl = productUrls[0]; // Get first product
  console.log(`✅ Got test URL: ${testUrl}\n`);

  // Now try to scrape it
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false, // Run visible to see what happens
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  console.log(`📄 Loading page: ${testUrl}...`);

  try {
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('✅ Page loaded successfully');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    await page.screenshot({ path: 'scripts/scrapers/test-product.png', fullPage: true });
    console.log('📸 Screenshot saved: scripts/scrapers/test-product.png');

    // Try to extract data
    console.log('\n🔍 Extracting data...\n');

    const data = await page.evaluate(() => {
      const result: any = {};

      // Try multiple selectors
      result.h1 = document.querySelector('h1')?.textContent?.trim();
      result.title = document.title;

      result.productName_1 = document.querySelector('.product-name')?.textContent?.trim();
      result.productName_2 = document.querySelector('[class*="product-title"]')?.textContent?.trim();
      result.productName_3 = document.querySelector('[class*="ProductTitle"]')?.textContent?.trim();

      result.price_1 = document.querySelector('.price')?.textContent?.trim();
      result.price_2 = document.querySelector('.product-price')?.textContent?.trim();
      result.price_3 = document.querySelector('[class*="price"]')?.textContent?.trim();

      result.brand_1 = document.querySelector('.brand')?.textContent?.trim();
      result.brand_2 = document.querySelector('[class*="brand"]')?.textContent?.trim();

      // Count images
      const images = document.querySelectorAll('img');
      result.totalImages = images.length;
      result.sampleImageSrcs = Array.from(images).slice(0, 5).map(img => img.src);

      return result;
    });

    console.log('📊 Extracted data:');
    console.log(JSON.stringify(data, null, 2));

    // Save HTML for analysis
    const html = await page.content();
    const fs = await import('fs');
    fs.writeFileSync('scripts/scrapers/test-product.html', html);
    console.log('\n💾 HTML saved: scripts/scrapers/test-product.html');

    console.log('\n✅ Test complete! Check the screenshot and HTML to see the actual page structure.');
    console.log('⏳ Browser will stay open for 15 seconds...');

    await new Promise(resolve => setTimeout(resolve, 15000));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

testProduct()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
