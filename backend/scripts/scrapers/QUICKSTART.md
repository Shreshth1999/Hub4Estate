# 🚀 Quick Start - Moglix Scraper

## Step 1: Make sure your database is ready

```bash
# Make sure PostgreSQL is running and database is migrated
npm run db:migrate
```

## Step 2: Run the scraper

### Option A: Quick test (50 products per category, 10 categories)

```bash
npm run scrape:moglix
```

This will:
- Scrape 10 categories
- Get ~50 products per category
- Download product images
- Save everything to your database
- Take approximately 1-2 hours

### Option B: Full scrape (200 products per category)

```bash
npm run scrape:moglix:full
```

This will take 3-4 hours and scrape much more data.

### Option C: Custom amount

```bash
npx tsx scripts/scrapers/moglix-scraper.ts 100
```

Replace `100` with the number of products per category you want.

## Step 3: Monitor progress

You'll see output like:

```
🚀 Initializing browser...
✅ Browser initialized

📂 Scraping categories...
✅ Found 45 main categories

📊 Total categories found: 45

🔄 Processing category: Electrical Tools

🛍️  Scraping products from: Electrical Tools
  📄 Scraping page 1...
  ✅ Found 24 products (Total: 24)
  📄 Scraping page 2...
  ✅ Found 22 products (Total: 46)

💾 Saving 46 products to database...
  ✅ Created category: Electrical Tools
  ✅ Created brand: Bosch
  ✅ Saved: Bosch GSB 500 RE Power Drill
  ✅ Saved: Makita HP1640 Impact Drill
  ...
```

## Step 4: Verify the data

### Check in Prisma Studio

```bash
npm run db:studio
```

Then open http://localhost:5555 and check:
- Categories table
- Products table
- Brands table

### Check images

Images are saved in: `backend/uploads/moglix/`

## What Gets Scraped

For each product:
- ✅ Product name
- ✅ Price and MRP
- ✅ Brand
- ✅ SKU/Model number
- ✅ Description
- ✅ Up to 5 images
- ✅ Specifications
- ✅ Category

## Stopping the Scraper

Press `Ctrl + C` to stop anytime. Already scraped data is saved.

## Troubleshooting

### "Browser not initialized" error

The scraper will handle this automatically, but if it persists:

```bash
# On macOS
xcode-select --install

# On Ubuntu/Linux
sudo apt-get install -y chromium-browser
```

### Database connection error

Check your `.env` file has correct database URL:

```
DATABASE_URL="postgresql://username:password@localhost:5432/hub4estate"
```

### Images not downloading

1. Check the directory exists: `ls backend/uploads/moglix/`
2. Check permissions: `chmod -R 755 backend/uploads/`

### Memory issues

If you see "JavaScript heap out of memory":

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run scrape:moglix
```

## Next Steps

After scraping:

1. **Test your frontend**: Products should appear in categories
2. **Check image paths**: Make sure images are accessible
3. **Remove duplicates**: Run cleanup if needed
4. **Schedule regular scrapes**: Update your catalog weekly/monthly

## Tips

- Start small (50 products) to test everything works
- Run during off-peak hours to avoid detection
- The scraper is respectful with delays, but you can increase them in the code
- Images are downloaded locally, so make sure you have enough disk space

## Need More Control?

Edit `scripts/scrapers/moglix-scraper.ts` to customize:

- Number of categories (line 349)
- Products per category (argument)
- Images per product (line 305)
- Delays between requests (various lines)
- Which categories to scrape
