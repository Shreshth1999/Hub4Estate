# Moglix Scraper

Comprehensive web scraper for extracting product data from Moglix.

## ⚠️ Legal Disclaimer

This scraper is provided for educational and research purposes only. Web scraping may violate the website's Terms of Service and copyright laws. Use at your own risk. Always:

1. Check the website's robots.txt and Terms of Service
2. Respect rate limits and server resources
3. Consider reaching out for official API access
4. Use scraped data responsibly and legally

## Features

- ✅ Scrapes categories and subcategories
- ✅ Extracts product information (name, price, brand, SKU)
- ✅ Downloads product images
- ✅ Scrapes detailed product specifications
- ✅ Saves everything to PostgreSQL database via Prisma
- ✅ Rate limiting and respectful scraping
- ✅ Duplicate detection
- ✅ Error handling and retry logic

## Prerequisites

```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth p-limit
```

## Usage

### Basic Usage (50 products per category, first 10 categories)

```bash
npx tsx scripts/scrapers/moglix-scraper.ts
```

### Custom number of products per category

```bash
npx tsx scripts/scrapers/moglix-scraper.ts 100
```

This will scrape 100 products from each category.

### Advanced Usage

You can modify the scraper directly:

```typescript
import MoglixScraper from './scripts/scrapers/moglix-scraper';

const scraper = new MoglixScraper();

// Scrape 200 products per category
await scraper.scrapeAll(200);
```

## What Gets Scraped

### Categories
- Category name
- Category URL
- Category image (if available)

### Products
- Product name
- Product URL
- Price (current selling price)
- MRP (maximum retail price)
- Brand name
- SKU/Model number
- Product description
- Product images (up to 5 per product)
- Specifications (key-value pairs)
- Category association

### Brands
- Brand name
- Brand URL
- Brand logo (if available)

## Database Structure

The scraper creates/updates the following database entities:

- **Categories**: Moglix categories mapped to your database
- **Brands**: All unique brands found
- **Products**: Complete product information with images and specs

## Output

- **Database**: All data saved to PostgreSQL via Prisma
- **Images**: Downloaded to `backend/uploads/moglix/`
- **Logs**: Console output with progress and errors

## Rate Limiting

The scraper implements respectful rate limiting:

- 1-3 second delay between page requests
- 3 concurrent requests maximum
- Random delays to avoid detection
- Respects server response times

## Error Handling

- Skips already scraped pages
- Continues on individual product failures
- Logs all errors for debugging
- Saves progress incrementally

## Customization

### Change target categories

Edit line 349 in `moglix-scraper.ts`:

```typescript
for (const category of categories.slice(0, 10)) { // Change 10 to desired number
```

### Change products per category

Pass as argument or edit `maxProductsPerCategory` default.

### Change image limit per product

Edit line 305:

```typescript
for (let i = 0; i < Math.min(product.images.length, 5); i++) { // Change 5
```

## Performance

- **Speed**: ~5-10 products per minute (respects rate limits)
- **Categories**: Processes 10 categories by default
- **Products**: 50 products per category by default
- **Total time**: ~2-4 hours for 500 products with enrichment

## Monitoring

Watch the console output for:

```
🚀 Initializing browser...
✅ Browser initialized
📂 Scraping categories...
✅ Found 45 main categories
🛍️  Scraping products from: Electrical Tools
  📄 Scraping page 1...
  ✅ Found 24 products (Total: 24)
💾 Saving 24 products to database...
  ✅ Created category: Electrical Tools
  ✅ Created brand: Bosch
  ✅ Saved: Bosch GSB 500 RE Power Drill
```

## Troubleshooting

### Browser fails to launch

```bash
# Linux: Install Chrome dependencies
sudo apt-get install -y chromium-browser

# macOS: Ensure Xcode command line tools installed
xcode-select --install
```

### Memory issues

Reduce concurrent requests in the scraper:

```typescript
const limit = pLimit(2); // Reduce from 3 to 2
```

### Images not downloading

Check:
1. `backend/uploads/moglix/` directory exists
2. Write permissions on uploads folder
3. Network connectivity

### Database errors

Ensure:
1. PostgreSQL is running
2. Prisma schema is migrated: `npm run db:migrate`
3. Database connection string in `.env` is correct

## Stopping the Scraper

Press `Ctrl+C` to stop. Already scraped data is saved.

## Next Steps

After scraping:

1. **Verify data**: Check database for products
2. **Test frontend**: Ensure products display correctly
3. **Clean up**: Remove duplicates if any
4. **Optimize images**: Compress large images
5. **Update regularly**: Run scraper periodically for new products

## Support

For issues or questions, check the main project documentation.
