import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

async function exploreMoglix() {
  console.log('🔍 Exploring Moglix structure...');

  const browser = await puppeteer.launch({
    headless: false, // Run with visible browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    console.log('📡 Loading Moglix homepage...');
    await page.goto('https://www.moglix.com', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('✅ Page loaded');

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot
    const screenshotPath = path.join(__dirname, 'moglix-homepage.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Save HTML
    const html = await page.content();
    const htmlPath = path.join(__dirname, 'moglix-homepage.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`💾 HTML saved: ${htmlPath}`);

    // Extract navigation structure
    console.log('\n📋 Analyzing page structure...\n');

    const structure = await page.evaluate(() => {
      const result: any = {
        title: document.title,
        mainNavigation: [] as any[],
        categoryLinks: [] as any[],
        allLinks: [] as any[],
      };

      // Find all nav elements
      const navs = document.querySelectorAll('nav, [role="navigation"], .navigation, .nav, .menu, .category-menu');
      console.log(`Found ${navs.length} navigation elements`);

      // Get all links that might be categories
      const links = document.querySelectorAll('a[href]');
      links.forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        const text = link.textContent?.trim() || '';

        if (text && href.includes('moglix.com')) {
          // Check if it's a category link
          if (
            href.includes('/category') ||
            href.includes('/shop') ||
            href.includes('/products') ||
            href.includes('/c/')
          ) {
            result.categoryLinks.push({ text, href });
          }

          // Store all internal links for analysis
          if (!href.includes('javascript:') && !href.includes('#')) {
            result.allLinks.push({ text, href });
          }
        }
      });

      // Look for category menu specifically
      const categoryMenu = document.querySelector('.category-menu, .categories, [class*="category-nav"]');
      if (categoryMenu) {
        const categoryLinks = categoryMenu.querySelectorAll('a');
        categoryLinks.forEach((link) => {
          const href = (link as HTMLAnchorElement).href;
          const text = link.textContent?.trim() || '';
          if (text && href) {
            result.mainNavigation.push({ text, href });
          }
        });
      }

      return result;
    });

    console.log('📊 Page Analysis:');
    console.log('─────────────────────────────────────');
    console.log(`Title: ${structure.title}`);
    console.log(`\nMain Navigation Items: ${structure.mainNavigation.length}`);
    if (structure.mainNavigation.length > 0) {
      structure.mainNavigation.slice(0, 10).forEach((item: any) => {
        console.log(`  - ${item.text}: ${item.href}`);
      });
    }

    console.log(`\nCategory Links Found: ${structure.categoryLinks.length}`);
    if (structure.categoryLinks.length > 0) {
      structure.categoryLinks.slice(0, 20).forEach((item: any) => {
        console.log(`  - ${item.text}: ${item.href}`);
      });
    }

    console.log(`\nTotal Links: ${structure.allLinks.length}`);

    // Save structure to JSON
    const structurePath = path.join(__dirname, 'moglix-structure.json');
    fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2));
    console.log(`\n💾 Full structure saved: ${structurePath}`);

    // Try to find the "Shop by Category" or similar menu
    console.log('\n🔍 Looking for category dropdown/menu...');

    // Hover over potential category triggers
    const categoryTriggers = await page.$$('[class*="category"], [class*="shop"]');
    console.log(`Found ${categoryTriggers.length} potential category triggers`);

    for (let i = 0; i < Math.min(categoryTriggers.length, 5); i++) {
      try {
        await categoryTriggers[i].hover();
        await new Promise(resolve => setTimeout(resolve, 2000));

        const dropdownScreenshot = path.join(__dirname, `moglix-dropdown-${i}.png`);
        await page.screenshot({ path: dropdownScreenshot });
        console.log(`📸 Dropdown screenshot ${i}: ${dropdownScreenshot}`);
      } catch (err) {
        console.log(`  ⚠️  Could not hover on trigger ${i}`);
      }
    }

    console.log('\n✅ Exploration complete!');
    console.log('\nNext steps:');
    console.log('1. Check the screenshots to see the actual Moglix UI');
    console.log('2. Review moglix-structure.json for all links');
    console.log('3. Update the scraper with correct selectors');

    // Keep browser open for manual inspection
    console.log('\n👀 Browser will stay open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Error exploring Moglix:', error);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// Run exploration
exploreMoglix()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
