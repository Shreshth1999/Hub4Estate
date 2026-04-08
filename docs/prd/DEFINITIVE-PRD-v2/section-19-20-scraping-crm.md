# Hub4Estate Definitive PRD v2 -- Sections 19 & 20

> **Document**: section-19-20-scraping-crm  
> **Version**: 2.0.0  
> **Date**: 2026-04-08  
> **Author**: CTO Office, Hub4Estate  
> **Status**: Authoritative Reference  
> **Classification**: Internal -- Engineering  
> **Prerequisite Reading**: section-05-06-techstack-database.md, section-09-10-agents-design.md

---

# SECTION 19 -- SCRAPING & DATA INGESTION ENGINE

> *Hub4Estate's price intelligence is only as good as its data. If the data is stale, wrong, or incomplete, every price comparison, every savings calculation, every blind-matching recommendation becomes a lie. This section defines the complete infrastructure for acquiring, validating, normalizing, and serving fresh market data. Every scraper runs on a schedule. Every pipeline has validation gates. Every anomaly triggers an alert. Nothing ships without data quality.*

---

## 19.1 Architecture Overview

### 19.1.1 Design Principles

1. **Freshness over completeness.** A price that is 6 hours old and correct beats a comprehensive dataset that is 7 days stale. Scraping frequency is tiered by price volatility.
2. **Graceful degradation.** If a source goes down, the platform serves cached data with a freshness badge ("Last updated 18 hours ago"). It never shows nothing.
3. **Legal compliance first.** Every source is reviewed for robots.txt compliance and Terms of Service. No authentication bypass. No rate limit violation. No personal data extraction.
4. **Cost discipline.** Playwright browser instances are expensive (RAM, CPU). Use Cheerio for static HTML. Use Playwright ONLY for JavaScript-rendered pages. Never run Playwright when Cheerio can do the job.
5. **Idempotency.** Every scrape run can be re-run safely. Duplicate detection prevents data bloat. Upserts prevent stale overwrites.

### 19.1.2 Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Static HTML parsing | Cheerio 1.0.0 | 30x faster than Playwright for server-rendered pages. No browser overhead. Parses HTML string in <10ms for typical product page. |
| JS-rendered pages | Playwright 1.48+ | Cross-browser support (Chromium, Firefox, WebKit). Stealth mode via `playwright-extra` + `stealth` plugin. Better API than Puppeteer. |
| HTTP client | Axios 1.7+ | Interceptors for retry/logging. Timeout management. Proxy support via `https-proxy-agent`. |
| Job scheduling | BullMQ 5.x on Redis | Delayed jobs, repeatable jobs (cron), rate limiting per queue, retry with backoff, dead letter queue, job events for monitoring. |
| Rate limiting | Redis (Upstash) | Token bucket per domain. Sliding window counters. Shared state across worker instances. |
| Deduplication | PostgreSQL composite keys + content hash | MD5 hash of `(source + brand + model + variant)`. Index on `content_hash` for O(1) duplicate lookup. |
| Data storage | PostgreSQL (primary) + Elasticsearch (search) | Raw scraped data in PostgreSQL. Normalized + indexed data replicated to Elasticsearch for fast product search. |
| Proxy management | Custom `ProxyPool` service | Rotates through residential Indian proxies. Health-checks every 5 minutes. Removes dead proxies. Auto-replenishes from provider API. |
| CAPTCHA solving | 2Captcha API (deferred) | Not implemented in MVP. CAPTCHAs trigger job pause + admin alert. Phase 2 integration with 2Captcha for automated solving. |
| OCR (documents) | Tesseract.js 5.x | Extracts text from scanned datasheets, price lists, government PDFs. Runs server-side as worker job. |

### 19.1.3 System Architecture Diagram

```
                                   +-------------------+
                                   |   Cron Scheduler   |
                                   |  (BullMQ Repeat)   |
                                   +--------+----------+
                                            |
                                   Creates jobs on schedule
                                            |
                                            v
                              +----------------------------+
                              |       BullMQ Queues         |
                              |                            |
                              |  scrape:brand       (P1)   |
                              |  scrape:marketplace (P2)   |
                              |  scrape:commodity   (P3)   |
                              |  scrape:aggregator  (P4)   |
                              +-------------+--------------+
                                            |
                         +------------------+------------------+
                         |                  |                  |
                         v                  v                  v
                  +-----------+     +-----------+     +-----------+
                  | Worker 1  |     | Worker 2  |     | Worker 3  |
                  | (Cheerio) |     | (Playwright)|   | (Cheerio) |
                  +-----+-----+     +-----+-----+     +-----+-----+
                        |                 |                 |
                  Rate Limiter      Rate Limiter      Rate Limiter
                   (Redis)           (Redis)           (Redis)
                        |                 |                 |
                  Proxy Pool        Proxy Pool        Proxy Pool
                   (Redis)           (Redis)           (Redis)
                        |                 |                 |
                        +--------+--------+---------+------+
                                 |                  |
                                 v                  v
                         +---------------+   +--------------+
                         |   Validator   |   | Deduplicator |
                         | (Zod schemas) |   | (content hash)|
                         +-------+-------+   +------+-------+
                                 |                  |
                                 +--------+---------+
                                          |
                                          v
                                 +--------+--------+
                                 |   Normalizer    |
                                 | (price, units,  |
                                 |  names, specs)  |
                                 +--------+--------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
              +-------------------+               +-------------------+
              |   PostgreSQL      |               |  Elasticsearch    |
              |                   |               |                   |
              | scraped_products  |  -- sync -->  | products index    |
              | price_data_points |               | price_data index  |
              | scrape_jobs       |               |                   |
              | scrape_brands     |               |                   |
              +-------------------+               +-------------------+
                        |
                        v
              +-------------------+
              |  Price Intelligence|
              |  Engine (Section 8)|
              |                   |
              | - Price index     |
              | - Anomaly detect  |
              | - Trend analysis  |
              | - Alert triggers  |
              +-------------------+
```

---

## 19.2 Target Sources -- Complete Specification

### 19.2.1 Source Classification

Every data source is classified into one of four tiers based on data value, update frequency, and scraping complexity.

| Tier | Description | Budget (infra cost/month) | Worker Type |
|------|-------------|--------------------------|-------------|
| T1 -- Brand Manufacturer | Official product catalogs from Havells, Polycab, Schneider, etc. | INR 0 (Cheerio only) | Cheerio HTTP |
| T2 -- E-Commerce Marketplace | Amazon.in, Flipkart, IndiaMART, JioMart | INR 2,000 (proxy pool) | Playwright + Cheerio |
| T3 -- Price Aggregator | Google Shopping, PriceHunt, PriceDekho | INR 500 (proxy pool) | Cheerio HTTP |
| T4 -- Government/Industry | Ministry of Commerce, commodity exchanges, IEEMA | INR 0 | Cheerio + OCR |

### 19.2.2 Source-by-Source Specification

#### Source 1: Brand Manufacturer Websites (T1)

**Currently implemented.** 20 brand configs in `backend/src/services/scraper/brands.config.ts`. This section defines the target-state expansion.

| Parameter | Value |
|-----------|-------|
| Sources | 20 brands (Polycab, Finolex, RR Kabel, KEI, V-Guard, Havells, Schneider, Legrand, Anchor, ABB, L&T Electrical, Philips, Syska, Crompton, Wipro Lighting, Orient, Tata Power Solar, Luminous, Microtek, Exide) |
| Data Points | Product name, model number, SKU, category, subcategory, description, specifications (JSON), images, MRP, datasheet URL, manual URL, certifications, warranty |
| Frequency | Weekly (Monday 5:00 AM IST) for full catalog. Daily (2:00 AM IST) for price-only refresh on top-100 products per brand. |
| Method | Cheerio (all brand websites are server-rendered). Axios for HTTP. |
| Rate Limit | 1 request per 1.5 seconds per domain. Max 20 concurrent requests across all brands. |
| Proxy | Not required. Brand websites do not block datacenter IPs at this request rate. |
| Anti-Bot Risk | Low. Most brand websites are informational, not e-commerce. No aggressive bot detection. |
| Data Volume | ~15,000 products across 20 brands. ~200 new/updated products per weekly run. |
| Error Handling | If brand website returns 403/429: pause 5 minutes, retry with residential proxy. If 3 consecutive failures: disable brand, alert admin. |

**Target-state additions (Phase 2):**

| Brand | Category | Website | Priority |
|-------|----------|---------|----------|
| Bajaj Electricals | Multi | bajajelectricals.com | High |
| GM Modular | Switches | gmmodular.com | High |
| Hager | Switchgear | hager.co.in | Medium |
| C&S Electric | Switchgear | cselectric.co.in | Medium |
| Finolex Pipes | Plumbing | finolexpipes.com | Phase 3 (plumbing vertical) |
| Astral Pipes | Plumbing | astralpipes.com | Phase 3 |
| Supreme Industries | Plumbing | supreme.co.in | Phase 3 |

#### Source 2: Amazon.in (T2)

| Parameter | Value |
|-----------|-------|
| Data Points | Product title, price (deal/list), rating, review count, availability, seller name, delivery estimate, specifications, images, ASIN |
| Frequency | Every 6 hours for tracked products (top 500). Daily for category browse (discover new products). |
| Method | Cheerio for product detail pages (mostly server-rendered). Playwright for search results and dynamic filters. |
| Rate Limit | 1 request per 3 seconds. Max 5 concurrent sessions. |
| Proxy | Required. Amazon blocks datacenter IPs aggressively. Use residential Indian proxies (rotate every 10 requests). |
| Anti-Bot Risk | HIGH. Amazon has sophisticated bot detection (CAPTCHA challenges, JavaScript fingerprinting, request pattern analysis). |
| Target URLs | Category browse: `amazon.in/s?k=electrical+mcb`, `amazon.in/s?k=havells+wire`, etc. Product detail: `amazon.in/dp/{ASIN}`. |
| Data Volume | ~3,000 tracked products. ~500 new product discoveries per week. ~12,000 price data points per day. |

**Amazon-Specific Anti-Detection Strategy:**

```typescript
// packages/api/src/services/scraper/strategies/amazon.strategy.ts

const AMAZON_STRATEGY = {
  // Session management
  sessionRotation: {
    maxRequestsPerSession: 15,    // New browser context every 15 requests
    cookiePreWarm: true,          // Visit amazon.in homepage first to get session cookie
    loginRequired: false,         // Never use authenticated sessions for scraping
  },

  // Request patterns
  requestPattern: {
    minDelayMs: 3000,
    maxDelayMs: 8000,
    jitterMs: 2000,               // Random jitter added to delay
    burstSize: 3,                 // Max 3 requests in quick succession
    burstCooldownMs: 15000,       // 15s cooldown after burst
  },

  // Fingerprint randomization
  fingerprint: {
    viewports: [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
    ],
    locales: ['en-IN', 'hi-IN'],
    timezones: ['Asia/Kolkata'],
    platforms: ['Win32', 'MacIntel'],
  },

  // CAPTCHA handling
  captcha: {
    detection: 'img[src*="captcha"]',      // CSS selector for CAPTCHA presence
    action: 'pause_and_alert',             // MVP: pause job, alert admin
    maxCaptchasPerRun: 3,                  // Abort run after 3 CAPTCHAs
    futureSolver: '2captcha',              // Phase 2: auto-solve
  },

  // Data extraction selectors
  selectors: {
    // Search results page
    searchResult: '[data-component-type="s-search-result"]',
    searchTitle: 'h2 a span',
    searchPrice: '.a-price .a-offscreen',
    searchRating: '.a-icon-alt',
    searchReviews: '[aria-label*="ratings"]',
    searchAsin: '@data-asin',
    searchImage: '.s-image@src',
    searchNextPage: '.s-pagination-next@href',

    // Product detail page
    detailTitle: '#productTitle',
    detailPrice: '#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen',
    detailMrp: '.a-text-price .a-offscreen',
    detailRating: '#acrPopover .a-icon-alt',
    detailReviewCount: '#acrCustomerReviewText',
    detailAvailability: '#availability span',
    detailSeller: '#sellerProfileTriggerId',
    detailImage: '#imgTagWrapperId img@src',
    detailSpecs: '#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr',
    detailSpecLabel: 'th, td:first-child',
    detailSpecValue: 'td:last-child, td:nth-child(2)',
    detailDescription: '#productDescription',
    detailBulletPoints: '#feature-bullets li span',
  },
};
```

**Amazon Price Extraction Logic:**

```typescript
// packages/api/src/services/scraper/extractors/amazon-price.extractor.ts

interface AmazonPriceData {
  currentPrice: number | null;      // In paise
  mrp: number | null;               // In paise
  dealPrice: number | null;         // In paise (if deal active)
  discountPercent: number | null;
  priceSource: 'deal' | 'regular' | 'sale' | 'lightning_deal';
  sellerName: string | null;
  deliveryEstimate: string | null;
  inStock: boolean;
  asin: string;
  scrapedAt: Date;
}

function extractAmazonPrice($: cheerio.CheerioAPI): AmazonPriceData {
  // Amazon has multiple price display formats depending on deal type
  const priceSelectors = [
    '#priceblock_dealprice',           // Deal price
    '#priceblock_ourprice',            // Regular price
    '.a-price .a-offscreen',           // New price format (2024+)
    '#corePrice_feature_div .a-offscreen',  // Core price
    '#tp_price_block_total_price_ww .a-offscreen', // Total price
  ];

  let currentPriceStr: string | null = null;
  for (const selector of priceSelectors) {
    const text = $(selector).first().text().trim();
    if (text && text.includes('₹')) {
      currentPriceStr = text;
      break;
    }
  }

  // Parse INR string: "₹1,299.00" -> 129900 (paise)
  const parsePriceINR = (str: string | null): number | null => {
    if (!str) return null;
    const cleaned = str.replace(/[₹,\s]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return null;
    return Math.round(parsed * 100); // Convert to paise
  };

  const mrpStr = $('.a-text-price .a-offscreen').first().text().trim();
  const currentPrice = parsePriceINR(currentPriceStr);
  const mrp = parsePriceINR(mrpStr);

  // Determine price source
  let priceSource: AmazonPriceData['priceSource'] = 'regular';
  if ($('#priceblock_dealprice').length > 0) priceSource = 'deal';
  if ($('.lightning-deal-bsx-price').length > 0) priceSource = 'lightning_deal';
  if ($('#dealprice_feature_div').length > 0) priceSource = 'sale';

  // Stock status
  const availabilityText = $('#availability span').text().trim().toLowerCase();
  const inStock = !availabilityText.includes('unavailable') &&
                  !availabilityText.includes('out of stock') &&
                  availabilityText !== '';

  return {
    currentPrice,
    mrp,
    dealPrice: priceSource === 'deal' || priceSource === 'lightning_deal' ? currentPrice : null,
    discountPercent: mrp && currentPrice ? Math.round(((mrp - currentPrice) / mrp) * 100) : null,
    priceSource,
    sellerName: $('#sellerProfileTriggerId').text().trim() || null,
    deliveryEstimate: $('#mir-layout-DELIVERY_BLOCK .a-text-bold').text().trim() || null,
    inStock,
    asin: $('input[name="ASIN"]').val()?.toString() || '',
    scrapedAt: new Date(),
  };
}
```

#### Source 3: Flipkart (T2)

| Parameter | Value |
|-----------|-------|
| Data Points | Product title, price, MRP, rating, review count, specifications, seller, delivery, images |
| Frequency | Every 6 hours for tracked products. Daily for category discovery. |
| Method | Cheerio primary (Flipkart renders product pages server-side). Playwright fallback for search with dynamic filters. |
| Rate Limit | 1 request per 2 seconds. Max 8 concurrent sessions. |
| Proxy | Required. Flipkart blocks datacenter IPs. |
| Anti-Bot Risk | Medium. Less aggressive than Amazon but has rate limiting and occasional CAPTCHAs. |
| Data Volume | ~2,500 tracked products. ~8,000 price data points per day. |

**Flipkart Selectors:**

```typescript
const FLIPKART_SELECTORS = {
  // Search results
  searchResult: '._1AtVbE, ._4ddWXP',
  searchTitle: '._4rR01T, .s1Q9rs',
  searchPrice: '._30jeq3',
  searchMrp: '._3I9_wc',
  searchRating: '._3LWZlK',
  searchReviews: '._2_R_DZ span',
  searchImage: '._396cs4@src',
  searchNextPage: '._1LKTO3 a:last-child@href',

  // Product detail
  detailTitle: '.B_NuCI, ._35KyD6',
  detailPrice: '._30jeq3._16Jk6d',
  detailMrp: '._3I9_wc._2p6lqe',
  detailDiscount: '._3Ay6Sb._31Dcoz',
  detailRating: '._3LWZlK',
  detailReviewCount: '.row ._2_R_DZ span',
  detailImage: '._396cs4._2amPTt._3qGmMb@src',
  detailSpecs: '._14cfVK ._1UhVsV tr',
  detailSpecLabel: '.flxcaE',
  detailSpecValue: 'li._21Ahn-',
  detailSeller: '#sellerName span',
  detailHighlights: '._2418kt li',
  detailDescription: '._1mXcCf',
};
```

#### Source 4: IndiaMART (T2)

| Parameter | Value |
|-----------|-------|
| Data Points | Product name, price range (min-max), MOQ, supplier name, supplier location, supplier rating, certifications, lead time |
| Frequency | Daily at 2:00 AM IST. |
| Method | Playwright (IndiaMART is heavily JavaScript-rendered with infinite scroll). |
| Rate Limit | 1 request per 5 seconds. Max 3 concurrent sessions. IndiaMART is aggressive with bot detection. |
| Proxy | Required. Indian residential proxies only. |
| Anti-Bot Risk | VERY HIGH. IndiaMART has aggressive anti-bot: phone verification popups, rate limiting, IP blocking, behavior analysis. |
| Data Volume | ~5,000 listings scraped per run. Focus on electrical supplies category. |

**IndiaMART-Specific Approach:**

```typescript
const INDIAMART_STRATEGY = {
  // IndiaMART requires careful handling
  navigation: {
    startUrl: 'https://dir.indiamart.com/impcat/electrical-equipment.html',
    categoryUrls: [
      'https://dir.indiamart.com/impcat/mcb-miniature-circuit-breaker.html',
      'https://dir.indiamart.com/impcat/electrical-wires.html',
      'https://dir.indiamart.com/impcat/modular-switches.html',
      'https://dir.indiamart.com/impcat/led-lights.html',
      'https://dir.indiamart.com/impcat/distribution-board.html',
      'https://dir.indiamart.com/impcat/electrical-panel.html',
      'https://dir.indiamart.com/impcat/ceiling-fan.html',
      'https://dir.indiamart.com/impcat/solar-panel.html',
    ],
    infiniteScroll: true,
    scrollPauseMs: 2000,
    maxScrolls: 20,       // Stop after 20 scroll loads (~200 products)
  },

  selectors: {
    productCard: '.prd-card, .flx',
    productName: '.prd-name, .product-name',
    priceRange: '.prc, .price',
    moq: '.moq, .min-order',
    supplierName: '.comp-name, .company-name',
    supplierLocation: '.loc, .location',
    supplierRating: '.rating-star',
    productLink: 'a.product-link@href, a[data-producturl]@href',
    productImage: '.prd-img img@src, .lazy-load-img@data-src',
  },

  // IndiaMART prices are often ranges: "₹150 - ₹450 / Piece"
  priceParser: {
    patterns: [
      /₹([\d,]+)\s*-\s*₹([\d,]+)\s*\/\s*(\w+)/,   // Range: ₹150 - ₹450 / Piece
      /₹([\d,]+)\s*\/\s*(\w+)/,                      // Single: ₹150 / Piece
      /Get Latest Price/i,                             // No price listed
    ],
    unitMapping: {
      'piece': 'PIECE',
      'pcs': 'PIECE',
      'meter': 'METER',
      'mtr': 'METER',
      'box': 'BOX',
      'pack': 'PACK',
      'roll': 'ROLL',
      'coil': 'COIL',
      'set': 'SET',
      'kg': 'KG',
      'kilogram': 'KG',
    },
  },

  // DO NOT scrape:
  doNotScrape: [
    'supplierPhone',       // Personal data
    'supplierEmail',       // Personal data
    'gstNumber',           // Sensitive business data
  ],
};
```

#### Source 5: Google Shopping (T3)

| Parameter | Value |
|-----------|-------|
| Data Points | Product title, price, seller, availability, product URL, image |
| Frequency | Daily at 3:00 AM IST. |
| Method | Cheerio (Google Shopping search results are mostly server-rendered). |
| Rate Limit | 1 request per 5 seconds. Max 2 concurrent sessions. Google is extremely aggressive with bot detection. |
| Proxy | Required. Residential Indian proxies with different /24 subnets. |
| Anti-Bot Risk | EXTREME. Google has the most sophisticated bot detection on the internet. |
| Mitigation | Use SerpAPI (paid service, $50/month, 5000 searches) as primary. Direct scraping as fallback only. |
| Data Volume | ~1,000 products per day (limited by API quota). |

**SerpAPI Integration (preferred over direct scraping):**

```typescript
// packages/api/src/services/scraper/strategies/google-shopping.strategy.ts

interface SerpApiConfig {
  apiKey: string;             // env: SERPAPI_KEY
  engine: 'google_shopping';
  gl: 'in';                  // Country: India
  hl: 'en';                  // Language: English
  location: string;          // e.g., 'Jaipur, Rajasthan, India'
  currency: 'INR';
}

interface GoogleShoppingResult {
  title: string;
  price: string;             // "₹1,299"
  extractedPrice: number;    // 1299.00
  source: string;            // "Amazon.in", "Flipkart"
  link: string;
  thumbnail: string;
  rating: number | null;
  reviews: number | null;
  delivery: string | null;
  productId: string | null;
}

// Search queries are product-specific, not generic category browse
const SEARCH_QUERIES = [
  'Havells MCB 32A price',
  'Polycab 2.5mm FRLS wire price',
  'Schneider 63A DP MCB price',
  'Legrand Lyncus modular switch price',
  'Philips 15W LED panel price',
  'Crompton ceiling fan price',
  // ... (auto-generated from product catalog -- see 19.3.5)
];
```

#### Source 6: Government & Commodity Portals (T4)

| Parameter | Value |
|-----------|-------|
| Sources | MCX (Multi Commodity Exchange), LME (London Metal Exchange) via proxy, Ministry of Commerce (dgft.gov.in), BIS (bis.gov.in) |
| Data Points | Copper price/kg, Aluminum price/kg, Steel price/kg, PVC resin price/kg, BIS certification status |
| Frequency | Daily at 4:00 AM IST (commodity prices). Monthly for certifications. |
| Method | Cheerio for HTML pages. Tesseract.js OCR for scanned PDF price lists. |
| Rate Limit | 1 request per 10 seconds. Government sites are fragile. |
| Anti-Bot Risk | Low. Government sites rarely have bot detection. But they are slow and unreliable. |
| Data Volume | ~50 data points per day (commodity prices). ~500 certification records per month. |

**Commodity Price Impact Model:**

```typescript
// packages/api/src/services/scraper/commodity-impact.ts

// Commodity prices directly affect electrical product costs
// These coefficients are used by the Price Prediction model (Section 9)

const COMMODITY_IMPACT = {
  copper: {
    affectedCategories: ['wires', 'cables', 'bus_bars', 'motor_windings'],
    priceCorrelation: 0.72,     // Strong positive correlation
    lagDays: 14,                // Commodity price change takes ~14 days to reach retail
    elasticity: 0.35,           // 10% copper increase -> ~3.5% wire price increase
  },
  aluminum: {
    affectedCategories: ['cables', 'bus_bars', 'heat_sinks', 'enclosures'],
    priceCorrelation: 0.58,
    lagDays: 21,
    elasticity: 0.28,
  },
  steel: {
    affectedCategories: ['panels', 'enclosures', 'conduits', 'cable_trays'],
    priceCorrelation: 0.45,
    lagDays: 30,
    elasticity: 0.20,
  },
  pvc_resin: {
    affectedCategories: ['wire_insulation', 'conduits', 'junction_boxes'],
    priceCorrelation: 0.61,
    lagDays: 21,
    elasticity: 0.25,
  },
  abs_plastic: {
    affectedCategories: ['switches', 'sockets', 'modular_plates', 'fan_blades'],
    priceCorrelation: 0.40,
    lagDays: 30,
    elasticity: 0.15,
  },
};
```

#### Source 7: Dealer Websites (T1)

| Parameter | Value |
|-----------|-------|
| Sources | Registered Hub4Estate dealers who have their own websites |
| Data Points | Product availability, local pricing, stock levels, delivery zones |
| Frequency | Weekly on Monday at 5:00 AM IST. |
| Method | Playwright (dealer websites vary wildly in quality -- many are WordPress/Shopify with JS rendering). |
| Rate Limit | 1 request per 3 seconds per dealer domain. |
| Data Volume | ~50 dealer websites initially. ~2,000 products per run. |
| Special Handling | Dealer must opt-in to website scraping during onboarding. Consent recorded in `dealer_profiles.allowWebsiteScraping`. |

#### Source 8: Manufacturer Price Lists (T4)

| Parameter | Value |
|-----------|-------|
| Sources | Quarterly price lists issued by major brands (PDF/Excel) |
| Data Points | MRP per SKU, dealer price per SKU, effective date, region-specific pricing |
| Frequency | Quarterly (manual trigger when new price list is received). |
| Method | Tesseract.js OCR for scanned PDFs. `xlsx` library for Excel files. Manual upload by admin. |
| Data Volume | ~5,000 SKU prices per brand per quarter. |
| Special Handling | Price lists are confidential dealer documents. Store in encrypted S3 bucket. Access restricted to admin role. |

**Price List Ingestion Flow:**

```typescript
// packages/api/src/services/scraper/price-list-ingestion.service.ts

interface PriceListUpload {
  brandId: string;
  fileUrl: string;                  // S3 presigned URL
  fileType: 'pdf' | 'xlsx' | 'csv';
  effectiveDate: Date;
  region: string;                   // 'ALL' | 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
  priceType: 'MRP' | 'DEALER' | 'DISTRIBUTOR';
  uploadedBy: string;               // Admin user ID
}

interface ExtractedPrice {
  modelNumber: string;
  sku: string | null;
  productName: string;
  mrp: number;                      // In paise
  dealerPrice: number | null;       // In paise
  distributorPrice: number | null;  // In paise
  unit: string;                     // 'PIECE', 'METER', 'BOX', etc.
  effectiveDate: Date;
  expiryDate: Date | null;
}

// Extraction pipeline:
// 1. Upload PDF/Excel to S3
// 2. BullMQ job created: 'pricelist:extract'
// 3. For PDF: OCR with Tesseract.js -> structured text -> parse with regex/Claude Haiku
// 4. For Excel: xlsx.readFile -> iterate rows -> map columns
// 5. Validate: every SKU must match known product or create placeholder
// 6. Upsert into price_data_points with source='MANUFACTURER_PRICE_LIST'
// 7. Update product.mrp if newer than current
```

### 19.2.3 Source Priority Matrix

When the same product has prices from multiple sources, the system must decide which price to display and which to use for intelligence.

| Priority | Source | Trust Level | Staleness Tolerance | Use Case |
|----------|--------|-------------|---------------------|----------|
| 1 | Manufacturer Price List | Highest (official MRP) | 90 days | MRP reference, savings calculation |
| 2 | Hub4Estate Dealer Quotes | High (real transactable price) | 7 days | Actual procurement pricing |
| 3 | Amazon.in | Medium (retail price, may include marketplace seller markup) | 24 hours | Market comparison |
| 4 | Flipkart | Medium | 24 hours | Market comparison |
| 5 | Google Shopping | Medium (aggregated, may be stale) | 48 hours | Broad market signal |
| 6 | IndiaMART | Low-Medium (often indicative, not final price) | 7 days | B2B price range estimation |
| 7 | Brand Website | Low for pricing (often shows MRP only) / High for specs | 30 days | Specification reference |
| 8 | Government Portals | High for commodities | 24 hours | Cost basis estimation |

---

## 19.3 Scraper Implementation -- Complete Specification

### 19.3.1 Base Scraper Class (Target State)

The existing `ProductScraper` class in `backend/src/services/scraper/scraper.service.ts` handles brand website scraping with Cheerio. The target-state architecture introduces a layered scraper framework that supports both Cheerio and Playwright, with shared rate limiting, proxy management, and retry logic.

```typescript
// packages/api/src/services/scraper/base/base-scraper.ts

import { CheerioAPI } from 'cheerio';
import { Page, BrowserContext } from 'playwright';
import { Logger } from '@/utils/logger';
import { ProxyPool } from '../infra/proxy-pool';
import { RateLimiter } from '../infra/rate-limiter';
import { MetricsCollector } from '../infra/metrics';

export type ScraperEngine = 'cheerio' | 'playwright';

export interface ScraperConfig {
  source: string;                       // Unique identifier: 'amazon_in', 'flipkart', 'havells', etc.
  displayName: string;                  // Human-readable: 'Amazon India'
  engine: ScraperEngine;
  baseUrl: string;
  rateLimit: {
    maxRequestsPerMinute: number;       // Per-domain limit
    minDelayMs: number;                 // Minimum delay between requests
    maxDelayMs: number;                 // Maximum delay (random jitter applied)
    concurrency: number;                // Max parallel requests for this source
  };
  proxy: {
    required: boolean;
    pool: 'residential_in' | 'datacenter' | 'none';
    rotateEvery: number;                // Rotate proxy every N requests
  };
  retry: {
    maxAttempts: number;
    backoffBase: number;                // Base delay in ms (exponential: base * 2^attempt)
    backoffMax: number;                 // Cap on backoff delay
    retryableStatuses: number[];        // HTTP status codes to retry: [429, 500, 502, 503, 504]
  };
  timeout: {
    requestMs: number;                  // Per-request timeout
    pageLoadMs: number;                 // Playwright page load timeout
    jobMs: number;                      // Total job timeout (kill after this)
  };
  userAgents: string[];                 // Rotated per request
  headers: Record<string, string>;      // Default headers
}

export interface ScrapedItem {
  source: string;                       // Source identifier
  sourceUrl: string;                    // URL this item was scraped from
  sourceProductId: string | null;       // Source's product ID (ASIN, Flipkart PID, etc.)
  scrapedAt: Date;
  rawData: Record<string, unknown>;     // Raw extracted data (source-specific)
  contentHash: string;                  // MD5 of dedup key fields
}

export interface ScrapeRunResult {
  source: string;
  jobId: string;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  startedAt: Date;
  completedAt: Date;
  itemsFound: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;                 // Duplicates or validation failures
  errors: ScrapeError[];
  durationMs: number;
  requestCount: number;
  bytesTransferred: number;
}

export interface ScrapeError {
  url: string;
  statusCode: number | null;
  message: string;
  retryable: boolean;
  timestamp: Date;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected logger: Logger;
  protected rateLimiter: RateLimiter;
  protected proxyPool: ProxyPool;
  protected metrics: MetricsCollector;
  protected errors: ScrapeError[] = [];
  protected requestCount: number = 0;
  protected bytesTransferred: number = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.logger = new Logger(`scraper:${config.source}`);
    this.rateLimiter = new RateLimiter(config.source, config.rateLimit);
    this.proxyPool = new ProxyPool(config.proxy.pool);
    this.metrics = new MetricsCollector(config.source);
  }

  /**
   * Main entry point. Called by BullMQ worker.
   * Subclasses implement scrapeItems() to define source-specific logic.
   */
  async run(jobId: string): Promise<ScrapeRunResult> {
    const startedAt = new Date();
    this.logger.info('Scrape run started', { jobId });

    let status: ScrapeRunResult['status'] = 'COMPLETED';
    let itemsFound = 0;
    let itemsCreated = 0;
    let itemsUpdated = 0;
    let itemsSkipped = 0;

    try {
      const items = await this.scrapeItems();
      itemsFound = items.length;

      for (const item of items) {
        try {
          const validated = await this.validate(item);
          if (!validated) {
            itemsSkipped++;
            continue;
          }

          const dedupResult = await this.deduplicate(validated);
          if (dedupResult === 'skip') {
            itemsSkipped++;
            continue;
          }

          const normalized = await this.normalize(validated);
          await this.store(normalized, dedupResult);

          if (dedupResult === 'create') itemsCreated++;
          if (dedupResult === 'update') itemsUpdated++;
        } catch (err) {
          this.logger.error('Item processing failed', { url: item.sourceUrl, error: err });
          itemsSkipped++;
        }
      }

      if (this.errors.length > 0 && itemsFound > 0) {
        status = 'PARTIAL';
      }
    } catch (err) {
      this.logger.error('Scrape run failed', { jobId, error: err });
      status = 'FAILED';
    }

    const result: ScrapeRunResult = {
      source: this.config.source,
      jobId,
      status,
      startedAt,
      completedAt: new Date(),
      itemsFound,
      itemsCreated,
      itemsUpdated,
      itemsSkipped,
      errors: this.errors,
      durationMs: Date.now() - startedAt.getTime(),
      requestCount: this.requestCount,
      bytesTransferred: this.bytesTransferred,
    };

    this.metrics.recordRun(result);
    return result;
  }

  /** Source-specific scraping logic. Returns raw scraped items. */
  protected abstract scrapeItems(): Promise<ScrapedItem[]>;

  /** Validate scraped item against source-specific rules. Returns null if invalid. */
  protected abstract validate(item: ScrapedItem): Promise<ScrapedItem | null>;

  /** Normalize item data to Hub4Estate internal format. */
  protected abstract normalize(item: ScrapedItem): Promise<NormalizedScrapedItem>;

  /**
   * Check if item already exists. Returns 'create', 'update', or 'skip'.
   * 'skip' = item exists and data has not changed.
   * 'update' = item exists but data (especially price) has changed.
   * 'create' = item is new.
   */
  protected async deduplicate(item: ScrapedItem): Promise<'create' | 'update' | 'skip'> {
    const existing = await prisma.scrapedPricePoint.findFirst({
      where: {
        source: item.source,
        contentHash: item.contentHash,
      },
      orderBy: { scrapedAt: 'desc' },
    });

    if (!existing) return 'create';

    // Check if price or key data has changed
    const existingData = existing.rawData as Record<string, unknown>;
    const newPrice = (item.rawData as any).price ?? (item.rawData as any).currentPrice;
    const oldPrice = (existingData as any).price ?? (existingData as any).currentPrice;

    if (newPrice !== oldPrice) return 'update';

    // Data hasn't changed but update lastSeenAt
    await prisma.scrapedPricePoint.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date() },
    });

    return 'skip';
  }

  /** Store normalized item in database. */
  protected async store(
    item: NormalizedScrapedItem,
    action: 'create' | 'update'
  ): Promise<void> {
    if (action === 'create') {
      await prisma.scrapedPricePoint.create({
        data: {
          source: item.source,
          sourceUrl: item.sourceUrl,
          sourceProductId: item.sourceProductId,
          contentHash: item.contentHash,
          productName: item.productName,
          brandName: item.brandName,
          modelNumber: item.modelNumber,
          categorySlug: item.categorySlug,
          pricePaise: item.pricePaise,
          mrpPaise: item.mrpPaise,
          unit: item.unit,
          currency: 'INR',
          city: item.city,
          sellerName: item.sellerName,
          inStock: item.inStock,
          rawData: item.rawData as any,
          scrapedAt: item.scrapedAt,
          lastSeenAt: item.scrapedAt,
        },
      });
    } else {
      // Update: create new price point (for history) and update the product mapping
      await prisma.scrapedPricePoint.create({
        data: {
          source: item.source,
          sourceUrl: item.sourceUrl,
          sourceProductId: item.sourceProductId,
          contentHash: item.contentHash,
          productName: item.productName,
          brandName: item.brandName,
          modelNumber: item.modelNumber,
          categorySlug: item.categorySlug,
          pricePaise: item.pricePaise,
          mrpPaise: item.mrpPaise,
          unit: item.unit,
          currency: 'INR',
          city: item.city,
          sellerName: item.sellerName,
          inStock: item.inStock,
          rawData: item.rawData as any,
          scrapedAt: item.scrapedAt,
          lastSeenAt: item.scrapedAt,
          isUpdate: true,
        },
      });
    }
  }

  /** Make HTTP request with rate limiting, proxy rotation, retry, and logging. */
  protected async fetchHtml(url: string): Promise<string | null> {
    await this.rateLimiter.acquire();
    this.requestCount++;

    const proxy = this.config.proxy.required ? this.proxyPool.next() : undefined;
    const userAgent = this.config.userAgents[
      Math.floor(Math.random() * this.config.userAgents.length)
    ];

    for (let attempt = 0; attempt < this.config.retry.maxAttempts; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: this.config.timeout.requestMs,
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            ...this.config.headers,
          },
          ...(proxy ? { httpsAgent: proxy.agent } : {}),
          decompress: true,
        });

        this.bytesTransferred += Buffer.byteLength(response.data, 'utf8');
        return response.data;
      } catch (err: any) {
        const status = err.response?.status;
        const retryable = this.config.retry.retryableStatuses.includes(status);

        if (!retryable || attempt === this.config.retry.maxAttempts - 1) {
          this.errors.push({
            url,
            statusCode: status ?? null,
            message: err.message,
            retryable,
            timestamp: new Date(),
          });
          return null;
        }

        // Exponential backoff
        const delay = Math.min(
          this.config.retry.backoffBase * Math.pow(2, attempt),
          this.config.retry.backoffMax
        );
        await new Promise(r => setTimeout(r, delay + Math.random() * 1000));

        // Rotate proxy on retry
        if (this.config.proxy.required) {
          this.proxyPool.markFailed(proxy!);
        }
      }
    }

    return null;
  }
}
```

### 19.3.2 Normalized Data Interface

All scraped data from all sources converges to a single normalized format before storage:

```typescript
// packages/api/src/services/scraper/types/normalized.ts

export interface NormalizedScrapedItem {
  // Identification
  source: string;                   // 'amazon_in', 'flipkart', 'indiamart', 'havells', etc.
  sourceUrl: string;
  sourceProductId: string | null;   // ASIN, Flipkart PID, IndiaMART catalog ID
  contentHash: string;              // MD5(source + brand + model + variant + city)

  // Product identity
  productName: string;              // Normalized: "Havells MCB 32A SP"
  brandName: string;                // Normalized: "Havells" (not "HAVELLS" or "havells")
  modelNumber: string | null;       // "DHMGCSPF032" (brand-specific model number)
  categorySlug: string;             // 'mcb', 'wire_frls', 'led_panel', etc.
  sku: string | null;

  // Pricing (ALL prices stored in paise to avoid floating point issues)
  pricePaise: number | null;        // Current selling price in paise (129900 = Rs 1,299.00)
  mrpPaise: number | null;          // MRP in paise
  dealPricePaise: number | null;    // Special deal price if applicable
  bulkPricePaise: number | null;    // Bulk/wholesale price if available
  unit: PriceUnit;                  // 'PIECE', 'METER', 'BOX', 'ROLL', 'KG', 'SET', 'PACK'
  moq: number | null;               // Minimum order quantity
  currency: 'INR';

  // Location
  city: string | null;              // 'Sri Ganganagar', 'Jaipur', 'Mumbai', null (national)
  state: string | null;
  pincode: string | null;

  // Availability
  inStock: boolean;
  sellerName: string | null;
  deliveryEstimate: string | null;

  // Quality signals
  rating: number | null;            // 0.0 - 5.0
  reviewCount: number | null;

  // Specifications (normalized keys)
  specifications: Record<string, string> | null;  // { "current_rating_a": "32", "poles": "1", "breaking_capacity_ka": "10" }

  // Media
  imageUrls: string[];
  datasheetUrl: string | null;

  // Metadata
  rawData: Record<string, unknown>;  // Original extracted data for audit
  scrapedAt: Date;
}

export type PriceUnit = 'PIECE' | 'METER' | 'BOX' | 'ROLL' | 'KG' | 'SET' | 'PACK' | 'COIL' | 'BUNDLE';
```

### 19.3.3 Rate Limiting Infrastructure

```typescript
// packages/api/src/services/scraper/infra/rate-limiter.ts

import Redis from 'ioredis';

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  minDelayMs: number;
  maxDelayMs: number;
  concurrency: number;
}

export class RateLimiter {
  private domain: string;
  private config: RateLimitConfig;
  private redis: Redis;
  private lastRequestAt: number = 0;

  constructor(domain: string, config: RateLimitConfig) {
    this.domain = domain;
    this.config = config;
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  /**
   * Acquire a rate limit token. Blocks until a request can be made.
   * Uses Redis sliding window counter for distributed rate limiting.
   */
  async acquire(): Promise<void> {
    const key = `ratelimit:scraper:${this.domain}`;
    const windowMs = 60_000; // 1 minute window

    while (true) {
      const now = Date.now();

      // Sliding window: remove entries older than window
      await this.redis.zremrangebyscore(key, 0, now - windowMs);

      // Count current window
      const count = await this.redis.zcard(key);

      if (count < this.config.maxRequestsPerMinute) {
        // Add this request to the window
        await this.redis.zadd(key, now.toString(), `${now}-${Math.random()}`);
        await this.redis.expire(key, 120); // TTL: 2 minutes

        // Enforce minimum delay between requests
        const elapsed = now - this.lastRequestAt;
        const requiredDelay = this.config.minDelayMs +
          Math.random() * (this.config.maxDelayMs - this.config.minDelayMs);

        if (elapsed < requiredDelay) {
          await new Promise(r => setTimeout(r, requiredDelay - elapsed));
        }

        this.lastRequestAt = Date.now();
        return;
      }

      // Window is full. Wait until oldest entry expires.
      const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      if (oldest.length >= 2) {
        const oldestTime = parseInt(oldest[1]);
        const waitMs = (oldestTime + windowMs) - now + 100; // +100ms buffer
        await new Promise(r => setTimeout(r, Math.max(waitMs, 1000)));
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  /**
   * Check current utilization without acquiring.
   * Returns number between 0.0 (idle) and 1.0 (at limit).
   */
  async utilization(): Promise<number> {
    const key = `ratelimit:scraper:${this.domain}`;
    const now = Date.now();
    await this.redis.zremrangebyscore(key, 0, now - 60_000);
    const count = await this.redis.zcard(key);
    return count / this.config.maxRequestsPerMinute;
  }
}
```

### 19.3.4 Proxy Pool Manager

```typescript
// packages/api/src/services/scraper/infra/proxy-pool.ts

import { HttpsProxyAgent } from 'https-proxy-agent';
import Redis from 'ioredis';

interface ProxyEntry {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  type: 'residential_in' | 'datacenter';
  city: string | null;              // e.g., 'Mumbai', 'Delhi' (residential proxies)
  successCount: number;
  failureCount: number;
  lastUsedAt: Date | null;
  lastCheckedAt: Date | null;
  isHealthy: boolean;
  avgLatencyMs: number;
}

export interface ProxyConfig {
  agent: HttpsProxyAgent<string>;
  entry: ProxyEntry;
}

export class ProxyPool {
  private redis: Redis;
  private poolType: 'residential_in' | 'datacenter' | 'none';
  private currentIndex: number = 0;

  constructor(poolType: 'residential_in' | 'datacenter' | 'none') {
    this.poolType = poolType;
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  /**
   * Get next healthy proxy from the pool (round-robin with health filtering).
   */
  next(): ProxyConfig {
    if (this.poolType === 'none') {
      throw new Error('ProxyPool.next() called on "none" pool type');
    }

    // Pool is loaded from Redis on init and refreshed every 5 minutes
    // Proxies are sorted by (successRate DESC, avgLatency ASC)
    // Round-robin through top 80% of healthy proxies

    const entry = this.getNextHealthy();
    const url = `http://${entry.username}:${entry.password}@${entry.host}:${entry.port}`;

    return {
      agent: new HttpsProxyAgent(url),
      entry,
    };
  }

  /**
   * Mark a proxy as failed (increments failure counter).
   * If failure rate exceeds 30%, proxy is marked unhealthy.
   */
  markFailed(proxy: ProxyConfig): void {
    const key = `proxy:${proxy.entry.id}:failures`;
    this.redis.incr(key);
    this.redis.expire(key, 3600); // Track failures per hour

    const totalKey = `proxy:${proxy.entry.id}:total`;
    this.redis.incr(totalKey);
    this.redis.expire(totalKey, 3600);
  }

  /**
   * Health check all proxies. Called every 5 minutes by a scheduled job.
   */
  async healthCheck(): Promise<{ healthy: number; unhealthy: number; total: number }> {
    // For each proxy:
    // 1. Make a test request to httpbin.org/ip
    // 2. Verify the response IP matches expected proxy IP
    // 3. Measure latency
    // 4. Update isHealthy and avgLatencyMs in Redis
    // Returns summary
    // Implementation omitted for brevity -- see proxy-health.job.ts
    return { healthy: 0, unhealthy: 0, total: 0 }; // placeholder
  }

  private getNextHealthy(): ProxyEntry {
    // Implementation: read sorted set from Redis, skip unhealthy, round-robin
    throw new Error('Not implemented -- see proxy-pool.service.ts for full implementation');
  }
}
```

**Proxy Provider Configuration:**

| Provider | Type | Pool Size | Monthly Cost (INR) | Coverage |
|----------|------|-----------|-------------------|----------|
| Bright Data (primary) | Residential India | 20 IPs | ~2,500 | All major cities |
| Oxylabs (fallback) | Residential India | 10 IPs | ~1,800 | Mumbai, Delhi, Bangalore |
| Datacenter (self-managed) | Datacenter | 5 IPs | ~400 (AWS EC2 Nano) | Mumbai region |

### 19.3.5 User Agent Rotation

```typescript
// packages/api/src/services/scraper/infra/user-agents.ts

// 50 real browser user agents, weighted by Indian market share (StatCounter Q1 2026)
export const USER_AGENTS: { ua: string; weight: number }[] = [
  // Chrome (Windows) -- 42% market share
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', weight: 12 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', weight: 10 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', weight: 8 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', weight: 6 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', weight: 6 },

  // Chrome (macOS) -- 8% market share
  { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', weight: 4 },
  { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', weight: 4 },

  // Chrome (Android) -- 28% market share
  { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36', weight: 8 },
  { ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36', weight: 6 },
  { ua: 'Mozilla/5.0 (Linux; Android 14; Redmi Note 13 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36', weight: 6 },
  { ua: 'Mozilla/5.0 (Linux; Android 13; OnePlus 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36', weight: 4 },
  { ua: 'Mozilla/5.0 (Linux; Android 12; Realme 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36', weight: 4 },

  // Firefox (Windows) -- 4% market share
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0', weight: 2 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0', weight: 2 },

  // Safari (macOS) -- 5% market share
  { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15', weight: 3 },
  { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15', weight: 2 },

  // Safari (iOS) -- 7% market share
  { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', weight: 4 },
  { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1', weight: 3 },

  // Edge (Windows) -- 3% market share
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0', weight: 2 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0', weight: 2 },
];

export function getWeightedRandomUserAgent(): string {
  const totalWeight = USER_AGENTS.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  for (const entry of USER_AGENTS) {
    random -= entry.weight;
    if (random <= 0) return entry.ua;
  }
  return USER_AGENTS[0].ua;
}
```

### 19.3.6 Playwright Stealth Configuration

```typescript
// packages/api/src/services/scraper/infra/playwright-stealth.ts

import { chromium, BrowserContext, LaunchOptions } from 'playwright';
// Using playwright-extra and stealth plugin for evasion
import { chromium as chromiumExtra } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromiumExtra.use(stealth());

interface StealthBrowserOptions {
  proxy?: { host: string; port: number; username: string; password: string };
  viewport?: { width: number; height: number };
  locale?: string;
  timezone?: string;
}

export async function createStealthContext(
  options: StealthBrowserOptions = {}
): Promise<BrowserContext> {
  const viewports = [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1280, height: 720 },
  ];

  const viewport = options.viewport ?? viewports[Math.floor(Math.random() * viewports.length)];
  const locale = options.locale ?? (Math.random() > 0.5 ? 'en-IN' : 'hi-IN');
  const timezone = options.timezone ?? 'Asia/Kolkata';

  const launchOptions: LaunchOptions = {
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  };

  if (options.proxy) {
    launchOptions.proxy = {
      server: `http://${options.proxy.host}:${options.proxy.port}`,
      username: options.proxy.username,
      password: options.proxy.password,
    };
  }

  const browser = await chromiumExtra.launch(launchOptions);

  const context = await browser.newContext({
    viewport,
    locale,
    timezoneId: timezone,
    userAgent: getWeightedRandomUserAgent(),
    geolocation: {
      latitude: 26.9124,   // Jaipur coordinates (default)
      longitude: 75.7873,
    },
    permissions: ['geolocation'],
    javaScriptEnabled: true,
    bypassCSP: false,
    ignoreHTTPSErrors: false,
  });

  // Override navigator properties that leak automation
  await context.addInitScript(() => {
    // Override webdriver flag
    Object.defineProperty(navigator, 'webdriver', { get: () => false });

    // Override plugins (headless Chrome has 0 plugins)
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' },
      ],
    });

    // Override languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-IN', 'en-US', 'en', 'hi'],
    });

    // Override platform
    Object.defineProperty(navigator, 'platform', {
      get: () => 'Win32',
    });

    // Override hardware concurrency (headless often reports 1)
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 4 + Math.floor(Math.random() * 8),
    });

    // Override device memory
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => [4, 8, 16][Math.floor(Math.random() * 3)],
    });
  });

  return context;
}
```

---

## 19.4 Data Processing Pipeline

### 19.4.1 Product Name Normalization

Product names from different sources are inconsistent. The normalizer must map them to a canonical form.

```typescript
// packages/api/src/services/scraper/normalizers/product-name.normalizer.ts

interface ProductNameParts {
  brand: string;          // "Havells"
  productType: string;    // "MCB"
  series: string | null;  // "Oro" (for switches), null for generic
  rating: string | null;  // "32A" or "2.5 sq mm"
  poles: string | null;   // "SP", "DP", "TP", "TPN"
  variant: string | null; // "C Curve", "Type B"
  color: string | null;   // "White", "Black" (for switches/sockets)
  pack: string | null;    // "Pack of 6", "Box of 10"
}

// Normalization rules:
const NORMALIZATION_RULES = {
  // Brand name aliases -> canonical name
  brandAliases: {
    'HAVELLS': 'Havells',
    'havells india': 'Havells',
    'Havells India Ltd': 'Havells',
    'Havells India Limited': 'Havells',
    'POLYCAB': 'Polycab',
    'Polycab India': 'Polycab',
    'SCHNEIDER': 'Schneider Electric',
    'Schneider': 'Schneider Electric',
    'SE': 'Schneider Electric',
    'LEGRAND': 'Legrand',
    'legrand india': 'Legrand',
    'Anchor': 'Anchor Panasonic',
    'anchor panasonic': 'Anchor Panasonic',
    'ANCHOR ROMA': 'Anchor Panasonic',
    'L&T': 'L&T Electrical',
    'LT': 'L&T Electrical',
    'Larsen & Toubro': 'L&T Electrical',
    // ... (complete mapping for all 20+ brands)
  },

  // Product type aliases -> canonical name
  productTypeAliases: {
    'MCB': 'MCB',
    'Miniature Circuit Breaker': 'MCB',
    'miniature circuit breaker': 'MCB',
    'RCCB': 'RCCB',
    'Residual Current Circuit Breaker': 'RCCB',
    'ELCB': 'RCCB',          // Old name for RCCB
    'RCBO': 'RCBO',
    'DB': 'Distribution Board',
    'Distribution Board': 'Distribution Board',
    'SPN': 'Distribution Board',
    'TPN': 'Distribution Board',
    'FRLS': 'FRLS Wire',
    'FRLS Wire': 'FRLS Wire',
    'House Wire': 'FRLS Wire',
    'house wiring': 'FRLS Wire',
    'LED Panel': 'LED Panel',
    'LED Panel Light': 'LED Panel',
    'Panel Light': 'LED Panel',
    'Slim Panel': 'LED Panel',
    'LED Bulb': 'LED Bulb',
    'LED Lamp': 'LED Bulb',
    // ... (complete mapping for all product types in electrical vertical)
  },

  // Unit standardization
  unitAliases: {
    'sq mm': 'sq_mm',
    'sqmm': 'sq_mm',
    'sq.mm': 'sq_mm',
    'square mm': 'sq_mm',
    'mm2': 'sq_mm',
    'mm²': 'sq_mm',
    'amp': 'A',
    'amps': 'A',
    'ampere': 'A',
    'amperes': 'A',
    'watt': 'W',
    'watts': 'W',
    'volt': 'V',
    'volts': 'V',
    'kilowatt': 'kW',
    'kw': 'kW',
    'meter': 'm',
    'meters': 'm',
    'mtr': 'm',
    'metre': 'm',
  },

  // Rating extraction patterns
  ratingPatterns: [
    /(\d+(?:\.\d+)?)\s*(?:sq\.?\s*mm|sqmm|mm2|mm²)/i,   // Wire gauge: "2.5 sq mm"
    /(\d+)\s*(?:A|amp|amps|ampere)/i,                      // Current: "32A"
    /(\d+)\s*(?:W|watt|watts)/i,                            // Power: "15W"
    /(\d+)\s*(?:V|volt|volts)/i,                            // Voltage: "230V"
    /(\d+)\s*(?:kA)/i,                                      // Breaking capacity: "10kA"
  ],

  // Pole identification
  polePatterns: [
    /\b(SP|SPN|1P|single[\s-]?pole)\b/i,     // Single Pole
    /\b(DP|2P|double[\s-]?pole)\b/i,          // Double Pole
    /\b(TP|3P|triple[\s-]?pole)\b/i,          // Triple Pole
    /\b(TPN|TP\+N|3P\+N|four[\s-]?pole)\b/i, // Triple Pole + Neutral
    /\b(4P|FP)\b/i,                            // Four Pole
  ],
};

/**
 * Normalize a product name from any source to Hub4Estate canonical format.
 * 
 * Input:  "HAVELLS 32 AMP MCB SINGLE POLE C CURVE"
 * Output: "Havells MCB 32A SP C-Curve"
 * 
 * Input:  "Polycab FRLS 2.5sqmm house wire 90m red"
 * Output: "Polycab FRLS Wire 2.5 sq mm 90m Red"
 */
export function normalizeProductName(raw: string): {
  normalized: string;
  parts: ProductNameParts;
  confidence: number;       // 0.0 - 1.0 (how confident we are in the parse)
} {
  // Implementation: regex-based parsing with fallback to Claude Haiku for ambiguous names
  // ...
  throw new Error('Implementation in normalizers/product-name.normalizer.ts');
}
```

### 19.4.2 Price Validation Rules

```typescript
// packages/api/src/services/scraper/validators/price.validator.ts

import { z } from 'zod';

export interface PriceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  adjustedPricePaise: number | null;  // If price was corrected (e.g., per-meter to per-coil)
}

export const PRICE_VALIDATION_RULES = {
  // Absolute bounds (in paise) by category
  // These are sanity checks -- no MCB costs Rs 50,000 and no wire costs Rs 0.10/meter
  absoluteBounds: {
    mcb:                { minPaise: 5000,     maxPaise: 1500000 },   // Rs 50 - Rs 15,000
    rccb:               { minPaise: 20000,    maxPaise: 5000000 },   // Rs 200 - Rs 50,000
    wire_frls:          { minPaise: 500,      maxPaise: 50000 },     // Rs 5/m - Rs 500/m
    wire_flexible:      { minPaise: 300,      maxPaise: 30000 },     // Rs 3/m - Rs 300/m
    led_bulb:           { minPaise: 3000,     maxPaise: 500000 },    // Rs 30 - Rs 5,000
    led_panel:          { minPaise: 10000,    maxPaise: 1500000 },   // Rs 100 - Rs 15,000
    ceiling_fan:        { minPaise: 80000,    maxPaise: 5000000 },   // Rs 800 - Rs 50,000
    switch_modular:     { minPaise: 2000,     maxPaise: 500000 },    // Rs 20 - Rs 5,000
    distribution_board: { minPaise: 30000,    maxPaise: 10000000 },  // Rs 300 - Rs 1,00,000
    solar_panel:        { minPaise: 1000000,  maxPaise: 50000000 },  // Rs 10,000 - Rs 5,00,000
    inverter:           { minPaise: 200000,   maxPaise: 20000000 },  // Rs 2,000 - Rs 2,00,000
    battery:            { minPaise: 300000,   maxPaise: 30000000 },  // Rs 3,000 - Rs 3,00,000
  },

  // Relative bounds: price must be within X times the known MRP
  relativeBounds: {
    minMultiplierOfMrp: 0.30,   // Price cannot be less than 30% of MRP (suspicious)
    maxMultiplierOfMrp: 1.20,   // Price cannot exceed 120% of MRP (overcharge or data error)
    warnMultiplierOfMrp: 0.50,  // Warn if price is less than 50% of MRP (might be per-unit error)
  },

  // Historical deviation: flag if price changed more than X% from last known
  historicalDeviation: {
    warnPercent: 15,    // Warn if >15% change
    rejectPercent: 50,  // Reject if >50% change (likely data error)
  },

  // Completeness requirements
  requiredFields: ['source', 'sourceUrl', 'productName', 'brandName', 'scrapedAt'],
  recommendedFields: ['pricePaise', 'modelNumber', 'categorySlug'],
};

export function validatePrice(
  item: NormalizedScrapedItem,
  knownMrpPaise: number | null,
  lastKnownPricePaise: number | null,
): PriceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let adjustedPricePaise: number | null = null;

  // Rule 1: Required fields
  for (const field of PRICE_VALIDATION_RULES.requiredFields) {
    if (!(item as any)[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Rule 2: Absolute bounds
  if (item.pricePaise !== null && item.categorySlug) {
    const bounds = (PRICE_VALIDATION_RULES.absoluteBounds as any)[item.categorySlug];
    if (bounds) {
      if (item.pricePaise < bounds.minPaise) {
        errors.push(`Price ${item.pricePaise} paise below absolute minimum ${bounds.minPaise} for ${item.categorySlug}`);
      }
      if (item.pricePaise > bounds.maxPaise) {
        errors.push(`Price ${item.pricePaise} paise above absolute maximum ${bounds.maxPaise} for ${item.categorySlug}`);
      }
    }
  }

  // Rule 3: Relative to MRP
  if (item.pricePaise !== null && knownMrpPaise !== null) {
    const ratio = item.pricePaise / knownMrpPaise;
    if (ratio < PRICE_VALIDATION_RULES.relativeBounds.minMultiplierOfMrp) {
      errors.push(`Price is ${(ratio * 100).toFixed(1)}% of MRP -- likely data error or per-unit mismatch`);
    }
    if (ratio > PRICE_VALIDATION_RULES.relativeBounds.maxMultiplierOfMrp) {
      errors.push(`Price exceeds MRP by ${((ratio - 1) * 100).toFixed(1)}% -- likely data error`);
    }
    if (ratio < PRICE_VALIDATION_RULES.relativeBounds.warnMultiplierOfMrp) {
      warnings.push(`Price is only ${(ratio * 100).toFixed(1)}% of MRP -- verify unit/quantity`);
    }
  }

  // Rule 4: Historical deviation
  if (item.pricePaise !== null && lastKnownPricePaise !== null) {
    const changePercent = Math.abs((item.pricePaise - lastKnownPricePaise) / lastKnownPricePaise) * 100;
    if (changePercent > PRICE_VALIDATION_RULES.historicalDeviation.rejectPercent) {
      errors.push(`Price changed ${changePercent.toFixed(1)}% from last known -- exceeds rejection threshold`);
    } else if (changePercent > PRICE_VALIDATION_RULES.historicalDeviation.warnPercent) {
      warnings.push(`Price changed ${changePercent.toFixed(1)}% from last known -- verify`);
    }
  }

  // Rule 5: Freshness
  const ageMs = Date.now() - item.scrapedAt.getTime();
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
  if (ageMs > maxAgeMs) {
    errors.push(`Data is ${Math.round(ageMs / (24 * 60 * 60 * 1000))} days old -- exceeds 30-day staleness limit`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    adjustedPricePaise,
  };
}
```

### 19.4.3 Category Classification

When a scraped product cannot be confidently mapped to a Hub4Estate category through rules-based matching, it is classified using Claude Haiku.

```typescript
// packages/api/src/services/scraper/classifiers/category.classifier.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface ClassificationResult {
  categorySlug: string;         // 'mcb', 'wire_frls', 'led_panel', etc.
  subcategorySlug: string | null;
  confidence: number;           // 0.0 - 1.0
  reasoning: string;
}

const CATEGORY_CLASSIFICATION_PROMPT = `You are a product categorization engine for Hub4Estate, an Indian electrical supplies marketplace. Given a product name and optional specifications, classify it into exactly ONE category.

AVAILABLE CATEGORIES:
- mcb: Miniature Circuit Breakers (single pole, double pole, triple pole)
- rccb: Residual Current Circuit Breakers / ELCB
- rcbo: Combined MCB + RCCB units
- isolator: Isolator switches, changeover switches
- distribution_board: DB boxes, SPN/TPN boards, enclosures
- wire_frls: FRLS house wires (single core, solid conductor)
- wire_flexible: Flexible cables, multi-strand
- wire_industrial: Armored cables, control cables, power cables
- switch_modular: Modular switches, sockets, plates, dimmers
- switch_piano: Piano type / conventional switches
- led_bulb: LED bulbs, lamps
- led_panel: LED panel lights (round, square, slim)
- led_batten: LED tube lights, battens
- led_downlight: LED downlights, spotlights, COB lights
- led_flood: Floodlights, outdoor LED
- led_strip: LED strip lights, rope lights
- ceiling_fan: Ceiling fans (regular, decorative, BLDC)
- table_fan: Table fans, pedestal fans, wall fans
- exhaust_fan: Exhaust fans, ventilation fans
- water_heater: Geysers, water heaters
- solar_panel: Solar panels, modules
- solar_inverter: Solar inverters, hybrid inverters
- inverter: Home UPS, inverters
- battery: Inverter batteries, solar batteries, tubular batteries
- conduit: Electrical conduits, PVC pipes, fittings
- cable_tray: Cable trays, cable management
- earthing: Earthing electrodes, earth pits, earth wire
- meter: Energy meters, sub-meters
- stabilizer: Voltage stabilizers
- ups: UPS systems (not solar)
- junction_box: Junction boxes, adaptors, connectors
- surge_protector: Surge protectors, SPDs

Respond with JSON only:
{"categorySlug": "...", "subcategorySlug": "..." | null, "confidence": 0.0-1.0, "reasoning": "one sentence"}`;

export async function classifyProduct(
  productName: string,
  specifications: Record<string, string> | null,
  brandName: string | null,
): Promise<ClassificationResult> {
  // Step 1: Rules-based classification (fast, free)
  const rulesResult = rulesBasedClassify(productName, specifications);
  if (rulesResult && rulesResult.confidence >= 0.85) {
    return rulesResult;
  }

  // Step 2: Claude Haiku classification (if rules-based confidence < 0.85)
  const userMessage = [
    `Product: ${productName}`,
    brandName ? `Brand: ${brandName}` : null,
    specifications ? `Specifications: ${JSON.stringify(specifications)}` : null,
  ].filter(Boolean).join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: CATEGORY_CLASSIFICATION_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text);

  return {
    categorySlug: parsed.categorySlug,
    subcategorySlug: parsed.subcategorySlug,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
  };
}

function rulesBasedClassify(
  name: string,
  specs: Record<string, string> | null,
): ClassificationResult | null {
  const lower = name.toLowerCase();

  // MCB detection
  if (/\bmcb\b/.test(lower) || /miniature\s+circuit\s+breaker/.test(lower)) {
    return { categorySlug: 'mcb', subcategorySlug: null, confidence: 0.95, reasoning: 'Contains "MCB" keyword' };
  }

  // RCCB detection
  if (/\brccb\b/.test(lower) || /\belcb\b/.test(lower) || /residual\s+current/.test(lower)) {
    return { categorySlug: 'rccb', subcategorySlug: null, confidence: 0.95, reasoning: 'Contains "RCCB/ELCB" keyword' };
  }

  // Wire detection
  if (/\bfrls\b/.test(lower) || /house\s*wire/.test(lower)) {
    return { categorySlug: 'wire_frls', subcategorySlug: null, confidence: 0.90, reasoning: 'Contains "FRLS" or "house wire"' };
  }
  if (/\bflexible\s*cable\b/.test(lower)) {
    return { categorySlug: 'wire_flexible', subcategorySlug: null, confidence: 0.90, reasoning: 'Contains "flexible cable"' };
  }

  // LED detection
  if (/\bled\s*panel\b/.test(lower) || /\bpanel\s*light\b/.test(lower)) {
    return { categorySlug: 'led_panel', subcategorySlug: null, confidence: 0.88, reasoning: 'Contains "LED panel" or "panel light"' };
  }
  if (/\bled\s*bulb\b/.test(lower) || /\bled\s*lamp\b/.test(lower)) {
    return { categorySlug: 'led_bulb', subcategorySlug: null, confidence: 0.88, reasoning: 'Contains "LED bulb/lamp"' };
  }
  if (/\bled\s*batten\b/.test(lower) || /\bled\s*tube\b/.test(lower)) {
    return { categorySlug: 'led_batten', subcategorySlug: null, confidence: 0.88, reasoning: 'Contains "LED batten/tube"' };
  }

  // Fan detection
  if (/\bceiling\s*fan\b/.test(lower)) {
    return { categorySlug: 'ceiling_fan', subcategorySlug: null, confidence: 0.92, reasoning: 'Contains "ceiling fan"' };
  }

  // Switch detection
  if (/\bmodular\s*switch\b/.test(lower) || /\b(1|2|3|4|6)\s*module\b/.test(lower)) {
    return { categorySlug: 'switch_modular', subcategorySlug: null, confidence: 0.85, reasoning: 'Contains "modular switch" or module count' };
  }

  // Distribution board detection
  if (/\bdistribution\s*board\b/.test(lower) || /\bdb\s*box\b/.test(lower) || /\b(spn|tpn)\b/.test(lower)) {
    return { categorySlug: 'distribution_board', subcategorySlug: null, confidence: 0.88, reasoning: 'Contains "distribution board" or "DB box"' };
  }

  // Solar detection
  if (/\bsolar\s*panel\b/.test(lower) || /\bsolar\s*module\b/.test(lower)) {
    return { categorySlug: 'solar_panel', subcategorySlug: null, confidence: 0.90, reasoning: 'Contains "solar panel/module"' };
  }

  // Confidence too low -- fallback to LLM
  return null;
}
```

---

## 19.5 Scheduling & Job Management

### 19.5.1 BullMQ Queue Configuration

```typescript
// packages/api/src/services/scraper/queues/scraper-queues.ts

import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

// ============================================
// QUEUE DEFINITIONS
// ============================================

/**
 * Queue 1: Brand Manufacturer Scraping
 * - Weekly full catalog scrape
 * - Daily price refresh for top products
 */
export const brandScrapeQueue = new Queue('scrape:brand', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },    // Keep last 100 completed jobs
    removeOnFail: { count: 200 },         // Keep last 200 failed jobs
    timeout: 30 * 60 * 1000,              // 30 minute job timeout
  },
});

/**
 * Queue 2: E-Commerce Marketplace Scraping (Amazon, Flipkart)
 * - 6-hourly price tracking
 * - Daily category discovery
 */
export const marketplaceScrapeQueue = new Queue('scrape:marketplace', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 100 },
    timeout: 60 * 60 * 1000,              // 1 hour job timeout (large catalogs)
  },
});

/**
 * Queue 3: IndiaMART Scraping
 * - Daily category scrape
 * - Playwright-based (heavy)
 */
export const indiamartScrapeQueue = new Queue('scrape:indiamart', {
  connection,
  defaultJobOptions: {
    attempts: 2,                           // IndiaMART is flaky -- fewer retries
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 50 },
    timeout: 90 * 60 * 1000,              // 90 minute timeout (infinite scroll is slow)
  },
});

/**
 * Queue 4: Price Aggregator Scraping (Google Shopping via SerpAPI)
 * - Daily price comparison
 */
export const aggregatorScrapeQueue = new Queue('scrape:aggregator', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
    timeout: 30 * 60 * 1000,
  },
});

/**
 * Queue 5: Commodity Price Scraping (Government portals)
 * - Daily commodity indices
 */
export const commodityScrapeQueue = new Queue('scrape:commodity', {
  connection,
  defaultJobOptions: {
    attempts: 5,                           // Govt sites are unreliable -- more retries
    backoff: { type: 'exponential', delay: 60000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
    timeout: 15 * 60 * 1000,
  },
});

/**
 * Queue 6: Price List Ingestion (manual trigger)
 * - Admin uploads brand price list (PDF/Excel)
 * - OCR + parsing + upsert
 */
export const priceListQueue = new Queue('scrape:pricelist', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
    timeout: 30 * 60 * 1000,
  },
});

/**
 * Queue 7: Data Processing (post-scrape)
 * - Normalization
 * - Elasticsearch indexing
 * - Price intelligence update
 */
export const dataProcessingQueue = new Queue('scrape:process', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
    timeout: 10 * 60 * 1000,
  },
});
```

### 19.5.2 Cron Schedule (Complete)

```typescript
// packages/api/src/services/scraper/scheduler.ts

import { brandScrapeQueue, marketplaceScrapeQueue, indiamartScrapeQueue,
         aggregatorScrapeQueue, commodityScrapeQueue } from './queues/scraper-queues';

/**
 * Initialize all repeatable scraping jobs.
 * Called once on server startup.
 * All times in IST (UTC+5:30). Cron expressions are in UTC.
 */
export async function initScraperSchedule(): Promise<void> {

  // =============================================
  // BRAND MANUFACTURER SCRAPERS
  // =============================================

  // Weekly full catalog (Monday 5:00 AM IST = Sunday 23:30 UTC)
  await brandScrapeQueue.add(
    'weekly-full-catalog',
    { mode: 'full', brands: 'all' },
    { repeat: { cron: '30 23 * * 0' } }  // Sunday 23:30 UTC = Monday 05:00 IST
  );

  // Daily top-100 price refresh (2:00 AM IST = previous day 20:30 UTC)
  await brandScrapeQueue.add(
    'daily-price-refresh',
    { mode: 'price_only', brands: 'all', limit: 100 },
    { repeat: { cron: '30 20 * * *' } }  // 20:30 UTC daily = 02:00 IST
  );

  // =============================================
  // E-COMMERCE MARKETPLACE SCRAPERS
  // =============================================

  // Amazon: Every 6 hours (00:00, 06:00, 12:00, 18:00 IST)
  await marketplaceScrapeQueue.add(
    'amazon-6hourly',
    { source: 'amazon_in', mode: 'tracked_products' },
    { repeat: { cron: '30 18,0,6,12 * * *' } }  // UTC times for IST 00, 06, 12, 18
  );

  // Amazon: Daily category discovery (1:00 AM IST)
  await marketplaceScrapeQueue.add(
    'amazon-category-discovery',
    { source: 'amazon_in', mode: 'category_browse' },
    { repeat: { cron: '30 19 * * *' } }  // 19:30 UTC = 01:00 IST
  );

  // Flipkart: Every 6 hours
  await marketplaceScrapeQueue.add(
    'flipkart-6hourly',
    { source: 'flipkart', mode: 'tracked_products' },
    { repeat: { cron: '0 19,1,7,13 * * *' } }  // Offset 30 min from Amazon to avoid peak load
  );

  // Flipkart: Daily category discovery (1:30 AM IST)
  await marketplaceScrapeQueue.add(
    'flipkart-category-discovery',
    { source: 'flipkart', mode: 'category_browse' },
    { repeat: { cron: '0 20 * * *' } }
  );

  // =============================================
  // INDIAMART SCRAPER
  // =============================================

  // Daily at 2:00 AM IST (heavy job -- single instance only)
  await indiamartScrapeQueue.add(
    'indiamart-daily',
    { categories: 'all' },
    { repeat: { cron: '30 20 * * *' } }
  );

  // =============================================
  // PRICE AGGREGATOR SCRAPERS
  // =============================================

  // Google Shopping (via SerpAPI): Daily at 3:00 AM IST
  await aggregatorScrapeQueue.add(
    'google-shopping-daily',
    { source: 'google_shopping', querySource: 'top_products' },
    { repeat: { cron: '30 21 * * *' } }
  );

  // =============================================
  // COMMODITY PRICE SCRAPERS
  // =============================================

  // MCX Copper, Aluminum: Daily at 4:00 AM IST (after market close)
  await commodityScrapeQueue.add(
    'commodity-daily',
    { commodities: ['copper', 'aluminum', 'steel', 'pvc_resin'] },
    { repeat: { cron: '30 22 * * *' } }
  );

  // =============================================
  // PROXY HEALTH CHECK
  // =============================================

  // Every 5 minutes
  await brandScrapeQueue.add(
    'proxy-health-check',
    { action: 'health_check' },
    { repeat: { every: 5 * 60 * 1000 } }
  );
}
```

### 19.5.3 Worker Configuration

```typescript
// packages/api/src/services/scraper/workers/scraper-worker.ts

import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

// Worker concurrency settings -- tuned for a single EC2 t3.medium (2 vCPU, 4 GB RAM)
const WORKER_CONFIG = {
  'scrape:brand':       { concurrency: 3 },   // Cheerio is lightweight
  'scrape:marketplace': { concurrency: 1 },   // Playwright is heavy (1 browser at a time)
  'scrape:indiamart':   { concurrency: 1 },   // Playwright + slow infinite scroll
  'scrape:aggregator':  { concurrency: 2 },   // SerpAPI calls are fast
  'scrape:commodity':   { concurrency: 2 },   // Small payloads
  'scrape:pricelist':   { concurrency: 1 },   // OCR is CPU-intensive
  'scrape:process':     { concurrency: 5 },   // Normalization is lightweight DB work
};

// Memory guardrails: abort job if process memory exceeds 3.2 GB (80% of 4 GB)
const MEMORY_LIMIT_BYTES = 3.2 * 1024 * 1024 * 1024;

function checkMemory(): boolean {
  const used = process.memoryUsage().heapUsed;
  return used < MEMORY_LIMIT_BYTES;
}
```

---

## 19.6 Database Schema -- Scraping Tables

### 19.6.1 Existing Models (in production)

The following Prisma models already exist in `backend/prisma/schema.prisma`:

- `ScrapeBrand` -- Brand scraping configurations
- `ScrapeJob` -- Individual scrape job runs
- `ScrapedProduct` -- Raw scraped product data (from brand websites)
- `ScrapeMapping` -- Rules for mapping raw data to categories
- `ScrapeTemplate` -- Reusable scraping configuration templates
- `ScrapeStatus` enum -- PENDING, IN_PROGRESS, COMPLETED, FAILED, PARTIAL

### 19.6.2 New Models (target state)

```prisma
// ============================================
// MULTI-SOURCE PRICE DATA
// ============================================

enum PriceDataSource {
  BRAND_WEBSITE
  AMAZON_IN
  FLIPKART
  INDIAMART
  GOOGLE_SHOPPING
  MANUFACTURER_PRICE_LIST
  COMMODITY_EXCHANGE
  GOVERNMENT_PORTAL
  DEALER_WEBSITE
  MANUAL_ENTRY
}

enum PriceUnit {
  PIECE
  METER
  BOX
  ROLL
  KG
  SET
  PACK
  COIL
  BUNDLE
}

model ScrapedPricePoint {
  id                String          @id @default(uuid())

  // Source identification
  source            PriceDataSource
  sourceUrl         String          @db.Text
  sourceProductId   String?         // ASIN, Flipkart PID, IndiaMART catalog ID

  // Deduplication
  contentHash       String          // MD5(source + brand + model + variant + city)

  // Product identity (denormalized for query speed)
  productName       String
  brandName         String
  modelNumber       String?
  categorySlug      String?
  sku               String?

  // Pricing (in paise)
  pricePaise        Int?
  mrpPaise          Int?
  dealPricePaise    Int?
  bulkPricePaise    Int?
  unit              PriceUnit       @default(PIECE)
  moq               Int?
  currency          String          @default("INR")

  // Location
  city              String?
  state             String?
  pincode           String?

  // Availability
  inStock           Boolean         @default(true)
  sellerName        String?
  deliveryEstimate  String?

  // Quality signals
  rating            Float?
  reviewCount       Int?

  // Raw data (full JSON from scraper)
  rawData           Json?

  // Timestamps
  scrapedAt         DateTime        @default(now())
  lastSeenAt        DateTime        @default(now())
  isUpdate          Boolean         @default(false)

  // Link to normalized product (set after product matching)
  productId         String?
  product           Product?        @relation(fields: [productId], references: [id])

  // Validation
  isValid           Boolean         @default(true)
  validationErrors  String?         @db.Text

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([source, contentHash])
  @@index([brandName, modelNumber])
  @@index([categorySlug, source])
  @@index([productId])
  @@index([scrapedAt])
  @@index([source, scrapedAt])
  @@index([pricePaise])
  @@index([city, categorySlug])
}

// ============================================
// COMMODITY PRICES
// ============================================

enum CommodityType {
  COPPER
  ALUMINUM
  STEEL
  PVC_RESIN
  ABS_PLASTIC
  BRASS
  ZINC
  TIN
  LEAD
}

model CommodityPrice {
  id              String        @id @default(uuid())
  commodity       CommodityType
  pricePerKgPaise Int           // Price in paise per kilogram
  source          String        // 'MCX', 'LME', 'DGFT', etc.
  sourceUrl       String?
  date            DateTime      @db.Date  // Date of the price (not scrape time)
  scrapedAt       DateTime      @default(now())

  createdAt       DateTime      @default(now())

  @@unique([commodity, source, date])
  @@index([commodity, date])
  @@index([date])
}

// ============================================
// SCRAPER MONITORING
// ============================================

model ScraperHealthLog {
  id              String        @id @default(uuid())
  source          String        // 'amazon_in', 'flipkart', 'havells', etc.
  jobId           String?
  status          ScrapeStatus
  itemsFound      Int           @default(0)
  itemsCreated    Int           @default(0)
  itemsUpdated    Int           @default(0)
  itemsSkipped    Int           @default(0)
  errorCount      Int           @default(0)
  durationMs      Int           @default(0)
  requestCount    Int           @default(0)
  bytesTransferred BigInt       @default(0)

  // Error details (first 5 errors only to limit storage)
  errors          Json?         // Array of { url, statusCode, message }

  createdAt       DateTime      @default(now())

  @@index([source, createdAt])
  @@index([status, createdAt])
}

// ============================================
// PRODUCT TRACKING (which products to scrape from which source)
// ============================================

model TrackedProduct {
  id              String        @id @default(uuid())
  productId       String        // Hub4Estate product ID
  product         Product       @relation(fields: [productId], references: [id])

  source          PriceDataSource
  sourceProductId String        // ASIN, Flipkart PID, etc.
  sourceUrl       String        @db.Text
  isActive        Boolean       @default(true)

  // Last known data from this source
  lastPricePaise  Int?
  lastScrapedAt   DateTime?
  lastStatus      String?       // 'in_stock', 'out_of_stock', 'discontinued'

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([productId, source])
  @@index([source, isActive])
  @@index([lastScrapedAt])
}
```

---

## 19.7 Monitoring & Alerting

### 19.7.1 Scraper Health Dashboard (Admin Panel)

| Metric | Calculation | Threshold | Alert Channel |
|--------|------------|-----------|---------------|
| Success Rate (per source) | `completed / (completed + failed + partial)` over last 7 days | < 80% | Slack #scraper-alerts + email to CTO |
| Data Freshness (per source per category) | `avg(now() - lastSeenAt)` for all active price points | > 48 hours | Slack #scraper-alerts |
| Volume (per source per run) | `itemsFound` from latest job | < 50% of historical average | Slack #scraper-alerts |
| Error Rate (per source) | `errors / requestCount` per run | > 20% | Slack #scraper-alerts |
| New Products Discovered | `itemsCreated` per day across all sources | < 10/day (after initial catalog load) | Dashboard only (informational) |
| Price Change Rate | Number of price changes detected per day | Anomaly: >3x or <0.3x historical average | Slack #price-alerts |
| Proxy Health | `healthy / total` proxy pool utilization | < 60% healthy | Slack #infra-alerts |
| Queue Backlog | `waiting + delayed` jobs per queue | > 50 jobs waiting | Slack #infra-alerts |
| Worker Memory | `process.memoryUsage().heapUsed` | > 80% of limit | Slack #infra-alerts |

### 19.7.2 Alert Configuration

```typescript
// packages/api/src/services/scraper/monitoring/alerts.ts

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  windowMinutes: number;
  channels: ('slack' | 'email' | 'sms')[];
  cooldownMinutes: number;          // Don't re-alert within this window
  severity: 'info' | 'warning' | 'critical';
}

export const SCRAPER_ALERT_RULES: AlertRule[] = [
  {
    id: 'scraper_source_down',
    name: 'Scraper Source Unavailable',
    metric: 'consecutive_failures',
    condition: 'gt',
    threshold: 3,
    windowMinutes: 1440,            // 24 hours
    channels: ['slack', 'email'],
    cooldownMinutes: 360,           // 6 hours
    severity: 'critical',
  },
  {
    id: 'scraper_low_success_rate',
    name: 'Scraper Low Success Rate',
    metric: 'success_rate_7d',
    condition: 'lt',
    threshold: 0.80,
    windowMinutes: 10080,           // 7 days
    channels: ['slack'],
    cooldownMinutes: 1440,          // 24 hours
    severity: 'warning',
  },
  {
    id: 'scraper_stale_data',
    name: 'Stale Price Data',
    metric: 'max_data_age_hours',
    condition: 'gt',
    threshold: 48,
    windowMinutes: 60,
    channels: ['slack'],
    cooldownMinutes: 720,           // 12 hours
    severity: 'warning',
  },
  {
    id: 'price_anomaly_detected',
    name: 'Price Anomaly Detected',
    metric: 'price_change_percent',
    condition: 'gt',
    threshold: 50,
    windowMinutes: 1440,
    channels: ['slack'],
    cooldownMinutes: 60,
    severity: 'info',
  },
  {
    id: 'proxy_pool_degraded',
    name: 'Proxy Pool Degraded',
    metric: 'healthy_proxy_ratio',
    condition: 'lt',
    threshold: 0.60,
    windowMinutes: 30,
    channels: ['slack', 'email'],
    cooldownMinutes: 60,
    severity: 'critical',
  },
  {
    id: 'queue_backlog_high',
    name: 'Queue Backlog High',
    metric: 'total_waiting_jobs',
    condition: 'gt',
    threshold: 50,
    windowMinutes: 30,
    channels: ['slack'],
    cooldownMinutes: 120,
    severity: 'warning',
  },
];
```

---

## 19.8 Data Quality Assurance

### 19.8.1 Automated Quality Checks

| Check | Frequency | Method | Action on Failure |
|-------|-----------|--------|-------------------|
| Price range validation | Every scrape run | Zod schema + custom validators (see 19.4.2) | Reject item, log to `validationErrors` |
| Brand name resolution | Every scrape run | Fuzzy match against known brands (Levenshtein distance < 3) | Flag for manual review if no match |
| Category classification | Every scrape run | Rules-based + Claude Haiku fallback (see 19.4.3) | Accept with low confidence flag |
| Duplicate detection | Every scrape run | Content hash lookup | Skip or update based on price change |
| Cross-source price correlation | Daily batch job (5:00 AM IST) | Compare same product price across 2+ sources. Flag if variance > 30%. | Dashboard alert for manual review |
| Stale data cleanup | Weekly (Sunday 6:00 AM IST) | Delete `ScrapedPricePoint` records where `lastSeenAt` < 90 days ago | Soft delete (set `isValid = false`) |
| Product matching accuracy | Weekly manual audit | Sample 50 random `ScrapedPricePoint` records with `productId` set. Human verifies match. | Target: >95% accuracy. If <90%, review matching algorithm. |

### 19.8.2 Source Reliability Score

Each source gets a reliability score updated daily, used by the Price Intelligence Engine to weight data.

```typescript
// packages/api/src/services/scraper/quality/source-reliability.ts

interface SourceReliabilityScore {
  source: string;
  score: number;              // 0.0 - 1.0
  components: {
    uptime: number;           // 0-0.3: % of scheduled runs that succeeded
    accuracy: number;         // 0-0.3: % of prices that pass cross-source validation
    freshness: number;        // 0-0.2: inverse of avg data age
    volume: number;           // 0-0.2: % of expected products actually scraped
  };
  calculatedAt: Date;
  trend: 'improving' | 'stable' | 'degrading';
}

// Target scores by source:
const TARGET_RELIABILITY: Record<string, number> = {
  'brand_website':    0.85,
  'amazon_in':        0.80,
  'flipkart':         0.80,
  'indiamart':        0.60,   // IndiaMART is inherently less reliable (bot detection)
  'google_shopping':  0.75,
  'manufacturer_pricelist': 0.95,
  'commodity_exchange': 0.90,
  'government_portal': 0.70,
};
```

---

## 19.9 Legal & Ethical Framework

### 19.9.1 Compliance Matrix

| Requirement | Implementation |
|-------------|---------------|
| robots.txt compliance | Every scraper checks `robots.txt` on first run. Disallowed paths are stored in Redis and respected. Re-checked weekly. |
| Rate limit compliance | Per-domain rate limits set BELOW the site's stated limits. If no stated limit, default to 1 req/3s. |
| Terms of Service | Legal team reviews ToS of each target source before scraping begins. Review documented in `docs/legal/scraping-tos-review.md`. |
| No authentication bypass | Scrapers NEVER log in, submit forms, or bypass login walls. Only publicly accessible pages are scraped. |
| No personal data | Scrapers extract product/pricing data ONLY. Supplier phone numbers, email addresses, GST numbers are explicitly excluded (see `doNotScrape` arrays). |
| Data use restriction | Scraped data is used exclusively for Hub4Estate's internal price intelligence. Never resold. Never shared with third parties in raw form. |
| Copyright compliance | Scraped product descriptions and images are not republished. Only structured data (prices, specs, availability) is used. Product images on Hub4Estate come from official brand CDNs (hotlinked with permission or downloaded with brand agreement). |

### 19.9.2 robots.txt Checker

```typescript
// packages/api/src/services/scraper/infra/robots-checker.ts

import { parse as parseRobots } from 'robots-parser';

export class RobotsChecker {
  private cache: Map<string, ReturnType<typeof parseRobots>> = new Map();
  private redis: Redis;

  async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
    const domain = new URL(url).origin;
    const cacheKey = `robots:${domain}`;

    // Check Redis cache first (TTL: 7 days)
    let robotsTxt = await this.redis.get(cacheKey);

    if (!robotsTxt) {
      try {
        const response = await axios.get(`${domain}/robots.txt`, { timeout: 10000 });
        robotsTxt = response.data;
        await this.redis.setex(cacheKey, 7 * 24 * 3600, robotsTxt);
      } catch {
        // No robots.txt = everything allowed
        return true;
      }
    }

    const parsed = parseRobots(`${domain}/robots.txt`, robotsTxt);
    return parsed.isAllowed(url, userAgent) ?? true;
  }
}
```

---

## 19.10 API Endpoints -- Scraper Management

All scraper management endpoints require `ADMIN` role authentication.

### 19.10.1 Existing Endpoints (in production)

These endpoints exist in `backend/src/routes/scraper.routes.ts`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scraper/brands` | List all configured brand scrapers with stats |
| GET | `/api/scraper/stats` | Get overall scraping statistics |
| GET | `/api/scraper/jobs` | List recent scrape jobs (paginated, filterable) |
| GET | `/api/scraper/jobs/:id` | Get specific job with logs |
| POST | `/api/scraper/scrape/:brandSlug` | Start scrape for a specific brand |
| POST | `/api/scraper/scrape-all` | Start scraping all brands |
| GET | `/api/scraper/products` | List scraped products (paginated, filterable) |
| GET | `/api/scraper/products/:id` | Get specific scraped product detail |
| POST | `/api/scraper/products/:id/process` | Process (normalize) a scraped product |
| DELETE | `/api/scraper/products/:id` | Delete a scraped product |

### 19.10.2 New Endpoints (target state)

| Method | Path | Auth | Description | Request Body | Response |
|--------|------|------|-------------|-------------|----------|
| GET | `/api/v1/admin/scraper/sources` | Admin | List all scraper sources with health status | -- | `{ sources: SourceHealth[] }` |
| GET | `/api/v1/admin/scraper/sources/:source/health` | Admin | Detailed health for a source (7-day history) | -- | `{ health: SourceHealthDetail }` |
| POST | `/api/v1/admin/scraper/sources/:source/trigger` | Admin | Manually trigger a scrape for a source | `{ mode: 'full' | 'price_only', categories?: string[] }` | `{ jobId: string }` |
| POST | `/api/v1/admin/scraper/sources/:source/pause` | Admin | Pause scheduled scraping for a source | `{ durationMinutes: number, reason: string }` | `{ paused: true }` |
| POST | `/api/v1/admin/scraper/sources/:source/resume` | Admin | Resume paused source | -- | `{ resumed: true }` |
| GET | `/api/v1/admin/scraper/price-points` | Admin | Query scraped price points | Query params: `source`, `brand`, `category`, `minPrice`, `maxPrice`, `since`, `page`, `limit` | `{ pricePoints: ScrapedPricePoint[], pagination: {...} }` |
| GET | `/api/v1/admin/scraper/price-points/anomalies` | Admin | List price anomalies (flagged by validation) | Query params: `since`, `severity`, `page`, `limit` | `{ anomalies: PriceAnomaly[] }` |
| POST | `/api/v1/admin/scraper/price-points/:id/resolve` | Admin | Mark anomaly as reviewed | `{ action: 'accept' | 'reject' | 'adjust', adjustedPricePaise?: number }` | `{ resolved: true }` |
| POST | `/api/v1/admin/scraper/price-lists/upload` | Admin | Upload manufacturer price list for ingestion | Multipart: `file` (PDF/XLSX/CSV) + `brandId`, `effectiveDate`, `region`, `priceType` | `{ jobId: string }` |
| GET | `/api/v1/admin/scraper/commodities` | Admin | Get commodity price history | Query params: `commodity`, `since`, `until` | `{ prices: CommodityPrice[] }` |
| GET | `/api/v1/admin/scraper/tracked-products` | Admin | List products being tracked across sources | Query params: `source`, `isActive`, `page`, `limit` | `{ trackedProducts: TrackedProduct[] }` |
| POST | `/api/v1/admin/scraper/tracked-products` | Admin | Add a product to tracking for a source | `{ productId, source, sourceProductId, sourceUrl }` | `{ trackedProduct: TrackedProduct }` |
| DELETE | `/api/v1/admin/scraper/tracked-products/:id` | Admin | Remove product from tracking | -- | `{ deleted: true }` |

---

## 19.11 Cost Analysis

### 19.11.1 MVP (~50 users, current state)

| Component | Monthly Cost (INR) | Notes |
|-----------|-------------------|-------|
| Cheerio scraping (CPU time) | 0 | Runs on existing EC2 instance |
| Playwright (extra memory) | 0 | Only brand websites, Cheerio-based |
| Proxy pool | 0 | No proxy needed for brand websites |
| SerpAPI | 0 | Not used in MVP |
| Redis (scraping queues) | 0 | Shared with existing Redis |
| Storage (scraped data) | ~50 | ~1 GB in PostgreSQL |
| **Total** | **~50/mo** | |

### 19.11.2 Growth (~1,000 users)

| Component | Monthly Cost (INR) | Notes |
|-----------|-------------------|-------|
| Cheerio scraping (CPU time) | ~200 | Minimal CPU overhead |
| Playwright instances | ~500 | 1 concurrent browser for Amazon/Flipkart |
| Proxy pool (Bright Data) | 2,500 | 20 residential Indian IPs |
| SerpAPI | 4,200 | $50/mo at 5,000 searches |
| Redis (scraping queues) | 0 | Shared |
| Storage | ~200 | ~5 GB |
| 2Captcha (Phase 2) | 500 | ~$6/mo for 1,000 CAPTCHAs |
| **Total** | **~8,100/mo** | |

### 19.11.3 Scale (~10,000 users)

| Component | Monthly Cost (INR) | Notes |
|-----------|-------------------|-------|
| Dedicated scraper worker (EC2 t3.medium) | 2,520 | Separate from API server |
| Playwright instances | 1,500 | 3 concurrent browsers |
| Proxy pool (Bright Data + Oxylabs) | 5,000 | 30 residential IPs |
| SerpAPI | 12,600 | $150/mo at 15,000 searches |
| Redis (dedicated scraping namespace) | 840 | ~1 GB dedicated |
| Storage | ~1,000 | ~20 GB |
| 2Captcha | 1,200 | ~$14/mo |
| Tesseract.js (price list OCR) | 0 | Runs on scraper worker |
| **Total** | **~24,660/mo** | |

---

---

# SECTION 20 -- CRM & LEAD MANAGEMENT SYSTEM

> *Hub4Estate is not just a marketplace. It is a relationship engine. The CRM is the nervous system that tracks every touchpoint -- from a buyer's first Google search to their fifth reorder. Every email, every WhatsApp message, every inquiry, every quote, every order feeds into a unified lead score that determines how the platform prioritizes, communicates with, and retains each user. No lead falls through the cracks. No dealer churns without a fight.*

---

## 20.1 CRM Architecture Overview

Hub4Estate operates a **dual-CRM architecture**:

| CRM Layer | Owner | Purpose | Data Scope |
|-----------|-------|---------|------------|
| **Platform CRM** | Hub4Estate internal team | Manage all users (buyers + dealers) as leads. Drive onboarding, activation, retention, reactivation. | All platform data: registrations, inquiries, quotes, orders, logins, page views, email opens. |
| **Dealer CRM** | Each individual dealer | Manage their own buyer relationships post-blind-matching reveal. Track repeat orders, follow-ups, notes. | Dealer's own transactions: buyers they've served, order history, communication threads. Scoped to dealer's data only. |

**Critical constraint**: The dealer CRM must NEVER expose buyer identity before blind matching is complete. A dealer only sees a buyer in their CRM after the buyer has selected that dealer's quote and identity has been revealed per the blind matching protocol (see Section 1.4 of section-01-executive-foundation.md).

### 20.1.1 System Context

```
+------------------------------------------------------------------+
|                      HUB4ESTATE PLATFORM                         |
|                                                                  |
|  +------------------------+     +---------------------------+    |
|  |   PLATFORM CRM         |     |    DEALER CRM (per dealer) |   |
|  |                        |     |                           |    |
|  |  - All user leads      |     |  - Post-reveal buyers    |    |
|  |  - Pipeline management |     |  - Order history          |    |
|  |  - Lead scoring        |     |  - Follow-up reminders    |    |
|  |  - Campaign engine     |     |  - Notes & tags           |    |
|  |  - Sales team tools    |     |  - Reorder predictions    |    |
|  |  - Churn prediction    |     |  - Revenue analytics      |    |
|  |                        |     |                           |    |
|  +----------+-------------+     +-----------+---------------+    |
|             |                               |                    |
|             +---------------+---------------+                    |
|                             |                                    |
|                     +-------+--------+                           |
|                     | Shared Services |                          |
|                     |                |                           |
|                     | - Email (Resend)                           |
|                     | - WhatsApp (Gupshup)                       |
|                     | - SMS (MSG91)                              |
|                     | - Analytics pipeline                       |
|                     | - Notification engine                      |
|                     +----------------+                           |
+------------------------------------------------------------------+
```

---

## 20.2 Platform CRM -- Complete Specification

### 20.2.1 Lead Lifecycle -- Buyers

Every user who interacts with Hub4Estate is a lead in the platform CRM. The lifecycle is a linear pipeline with re-entry points.

```
ANONYMOUS → AWARE → REGISTERED → ACTIVATED → ENGAGED → CONVERTED → ACTIVE → AT_RISK → CHURNED
     ↑                                                                              |
     +------------------------ RE-ENGAGEMENT CAMPAIGNS <----------------------------+
```

| Stage | Definition | Entry Trigger | Exit Trigger | Automated Actions |
|-------|-----------|---------------|-------------|-------------------|
| ANONYMOUS | Visited website but no identity captured | First page view (tracked via PostHog, no PII) | Registers or provides email | None (no contact info) |
| AWARE | Identified but not registered | Provides email via lead magnet, chatbot, or partial registration | Completes registration | Email: "Welcome to Hub4Estate" (1 email) |
| REGISTERED | Account created, profile incomplete | Completes registration (email verified OR Google OAuth) | Submits first inquiry | Email: Onboarding sequence (see 20.4.1). In-app: "Complete your profile" nudge. |
| ACTIVATED | Has submitted at least one inquiry | First inquiry submitted | Receives first quote from a dealer | In-app: "Your inquiry is live" notification. Push: "Dealers are reviewing your request". |
| ENGAGED | Receiving quotes, comparing options | First dealer quote received | Selects a quote (first order) | Email: "You have new quotes!" In-app: Quote comparison tool highlighted. |
| CONVERTED | First order completed | First order confirmed | Second order completed or 30 days of activity | Email: Post-order satisfaction survey (NPS). Email: Referral ask. In-app: "Rate your experience" prompt. |
| ACTIVE | Regular user with multiple orders | Second order or 30 days of regular activity (>3 logins/week) | Activity drops below threshold (see AT_RISK definition) | Periodic: Monthly savings report email. In-app: Personalized product recommendations. |
| AT_RISK | Activity declining | No login for 14 days OR no inquiry for 30 days OR NPS score < 7 | Reactivation (any activity) or churn (60-day inactivity) | Email: Re-engagement sequence (see 20.4.3). WhatsApp: "We miss you" message. Push: Deal alert for their category. |
| CHURNED | Inactive for 60+ days | No login for 60 days AND no inquiry for 90 days | Any new activity (reactivation) | Email: Win-back campaign (monthly for 3 months, then quarterly). |

### 20.2.2 Lead Lifecycle -- Dealers

| Stage | Definition | Entry Trigger | Exit Trigger | Automated Actions |
|-------|-----------|---------------|-------------|-------------------|
| PROSPECT | Identified potential dealer (not yet on platform) | Manual entry by sales team OR scraped from public business directories | Starts registration | Sales team: outreach call/email. |
| APPLIED | Started registration, KYC incomplete | Begins dealer registration | KYC documents submitted | Email: "Complete your KYC" reminder (3 emails over 7 days). |
| PENDING_REVIEW | KYC submitted, awaiting verification | All KYC documents uploaded | Admin approves or rejects | In-app: "Your application is under review." Email: Status updates. |
| VERIFIED | KYC approved, profile live | Admin approves KYC | First quote submitted OR subscription started | Email: "You're verified! Start bidding." In-app: Guided tour of dealer dashboard. |
| TRIAL | Free tier, testing platform | Account active on free tier | Submits 5+ quotes OR subscribes to paid plan | Email: "You've submitted N quotes -- upgrade to Growth for unlimited." In-app: Feature gating prompts. |
| PAYING | Active paid subscription | First subscription payment | Activity drops OR subscription expires | Monthly: Performance report email. In-app: Advanced analytics unlocked. |
| ACTIVE | Regular quoting and winning bids | >3 quotes/week AND >1 won bid/month | Activity drops below threshold | Priority support. Featured dealer badge. |
| AT_RISK | Declining activity or approaching subscription expiry | <1 quote/week for 2 consecutive weeks OR subscription expires in <7 days | Reactivation or churn | Email: Renewal reminder sequence (see 20.4.4). Call: Account manager reaches out. |
| CHURNED | Subscription expired, no activity for 30 days | No subscription AND no activity for 30 days | Reactivation | Email: Win-back campaign. Call: Re-activation offer (e.g., 1 month free). |

### 20.2.3 Lead Scoring Model

Every user gets a real-time lead score (0-100) updated on every event. The score drives automation rules and sales team prioritization.

```typescript
// packages/api/src/services/crm/lead-scoring.service.ts

interface LeadScore {
  userId: string;
  userType: 'BUYER' | 'DEALER';
  total: number;                // 0-100
  components: {
    demographic: number;        // 0-25: business size, location, industry match
    behavioral: number;         // 0-40: platform actions (inquiries, quotes, orders)
    engagement: number;         // 0-20: communication interactions (emails, in-app)
    recency: number;            // 0-15: time since last meaningful activity
  };
  trend: 'rising' | 'stable' | 'falling';
  lastCalculatedAt: Date;
}
```

#### Buyer Lead Scoring Rules

| Event | Points | Max Contribution | Decay |
|-------|--------|-----------------|-------|
| **Demographic Component (0-25)** | | | |
| Profile complete (name, phone, city, role) | +8 | 8 | Never |
| Business role: Builder/Developer | +7 | 7 | Never |
| Business role: Contractor/Electrician | +5 | 5 | Never |
| Business role: Homeowner | +3 | 3 | Never |
| City: Tier 1 (Mumbai, Delhi, Bangalore, etc.) | +5 | 5 | Never |
| City: Tier 2 (Jaipur, Lucknow, Pune, etc.) | +3 | 3 | Never |
| City: Tier 3 (Sri Ganganagar, etc.) | +2 | 2 | Never |
| GST number provided (verified) | +5 | 5 | Never |
| **Behavioral Component (0-40)** | | | |
| Created account | +5 | 5 | Never |
| Submitted inquiry | +8 (each, up to 5) | 40 | -2/inquiry after 30 days of no activity |
| Received quote | +3 (each) | 15 | -- |
| Viewed quote details | +2 (each) | 10 | -- |
| Selected winning quote (order placed) | +10 (each) | 40 | -5/order after 60 days of no activity |
| Used AI assistant (Volt) | +3 (each session) | 9 | -- |
| Searched products | +1 (each, up to 5) | 5 | -- |
| Saved product to wishlist | +2 (each) | 6 | -- |
| Compared products (comparison tool) | +2 | 2 | -- |
| **Engagement Component (0-20)** | | | |
| Opened email | +1 (each) | 5 | -- |
| Clicked email link | +2 (each) | 6 | -- |
| Logged in (unique day) | +1 (each, up to 7) | 7 | -1/day after 7 days no login |
| Responded to in-app prompt | +2 | 4 | -- |
| Referred another user | +5 (each) | 10 | Never |
| Left a review | +3 | 6 | -- |
| Contacted support | +1 | 2 | -- |
| **Recency Component (0-15)** | | | |
| Last activity today | +15 | 15 | -- |
| Last activity 1-3 days ago | +12 | 12 | -- |
| Last activity 4-7 days ago | +8 | 8 | -- |
| Last activity 8-14 days ago | +4 | 4 | -- |
| Last activity 15-30 days ago | +1 | 1 | -- |
| Last activity >30 days ago | 0 | 0 | -- |

#### Dealer Lead Scoring Rules

| Event | Points | Max Contribution | Decay |
|-------|--------|-----------------|-------|
| **Demographic (0-25)** | | | |
| KYC verified | +10 | 10 | Never |
| GST verified | +5 | 5 | Never |
| Profile complete (logo, description, brands, zones) | +5 | 5 | Never |
| Inventory uploaded (>50 products) | +5 | 5 | Never |
| **Behavioral (0-40)** | | | |
| Quote submitted | +3 (each) | 30 | -1/quote after 14 days no activity |
| Quote won (bid awarded) | +8 (each) | 40 | -3/win after 30 days no activity |
| Order fulfilled (delivery confirmed) | +5 (each) | 25 | -- |
| Inventory updated | +2 (each update) | 6 | -- |
| Responded to inquiry within 2 hours | +3 (each) | 12 | -- |
| **Engagement (0-20)** | | | |
| Logged in (unique day) | +1 (each, up to 7) | 7 | -1/day after 7 days |
| Opened email | +1 | 4 | -- |
| Subscribed to paid plan | +8 | 8 | -4 if subscription lapses |
| **Recency (0-15)** | | | |
| Same as buyer recency scoring | -- | 15 | -- |

#### Lead Score Calculation Engine

```typescript
// packages/api/src/services/crm/lead-scoring.engine.ts

import prisma from '@/config/database';

export async function calculateLeadScore(userId: string): Promise<LeadScore> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      inquiries: { orderBy: { createdAt: 'desc' }, take: 20 },
      orders: { orderBy: { createdAt: 'desc' }, take: 20 },
      activities: { orderBy: { createdAt: 'desc' }, take: 100 },
    },
  });

  if (!user) throw new Error(`User not found: ${userId}`);

  const isDealer = user.dealerId !== null;
  const rules = isDealer ? DEALER_SCORING_RULES : BUYER_SCORING_RULES;

  // Calculate each component
  const demographic = calculateDemographic(user, rules.demographic);
  const behavioral = calculateBehavioral(user, rules.behavioral);
  const engagement = calculateEngagement(user, rules.engagement);
  const recency = calculateRecency(user);

  const total = Math.min(100, demographic + behavioral + engagement + recency);

  // Determine trend (compare with score from 7 days ago)
  const previousScore = await getPreviousScore(userId, 7);
  let trend: LeadScore['trend'] = 'stable';
  if (previousScore !== null) {
    if (total > previousScore + 5) trend = 'rising';
    if (total < previousScore - 5) trend = 'falling';
  }

  // Persist score
  await prisma.leadScore.upsert({
    where: { userId },
    create: {
      userId,
      userType: isDealer ? 'DEALER' : 'BUYER',
      total,
      demographic,
      behavioral,
      engagement,
      recency,
      trend,
      calculatedAt: new Date(),
    },
    update: {
      total,
      demographic,
      behavioral,
      engagement,
      recency,
      trend,
      calculatedAt: new Date(),
    },
  });

  // Check automation triggers
  await checkScoreTriggers(userId, total, trend);

  return {
    userId,
    userType: isDealer ? 'DEALER' : 'BUYER',
    total,
    components: { demographic, behavioral, engagement, recency },
    trend,
    lastCalculatedAt: new Date(),
  };
}

/**
 * Recalculate scores for all users. Run daily at 6:00 AM IST.
 * Batch processing: 100 users at a time to avoid DB overload.
 */
export async function recalculateAllScores(): Promise<{ processed: number; duration: number }> {
  const startTime = Date.now();
  let processed = 0;
  let cursor: string | undefined;

  while (true) {
    const users = await prisma.user.findMany({
      take: 100,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { status: 'ACTIVE' },
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) break;

    for (const user of users) {
      try {
        await calculateLeadScore(user.id);
        processed++;
      } catch (err) {
        // Log error but continue with other users
        console.error(`Failed to calculate score for ${user.id}:`, err);
      }
    }

    cursor = users[users.length - 1].id;
  }

  return { processed, duration: Date.now() - startTime };
}
```

### 20.2.4 Automated Actions (Score-Based Triggers)

```typescript
// packages/api/src/services/crm/automation-triggers.ts

interface AutomationRule {
  id: string;
  name: string;
  trigger: TriggerCondition;
  actions: AutomationAction[];
  cooldownHours: number;          // Don't re-trigger within this window
  isActive: boolean;
}

type TriggerCondition =
  | { type: 'score_crosses_above'; threshold: number }
  | { type: 'score_crosses_below'; threshold: number }
  | { type: 'score_trend'; trend: 'falling'; durationDays: number }
  | { type: 'event'; eventType: string }
  | { type: 'time_since_event'; eventType: string; daysAfter: number }
  | { type: 'lifecycle_stage_entered'; stage: string }
  | { type: 'lifecycle_stage_duration'; stage: string; daysInStage: number };

type AutomationAction =
  | { type: 'send_email'; templateId: string; delay?: number }
  | { type: 'send_whatsapp'; templateId: string }
  | { type: 'send_sms'; templateId: string }
  | { type: 'send_push'; title: string; body: string }
  | { type: 'assign_to_sales'; teamId: string }
  | { type: 'create_task'; assigneeId: string; title: string; dueInHours: number }
  | { type: 'update_lifecycle_stage'; newStage: string }
  | { type: 'add_tag'; tag: string }
  | { type: 'trigger_campaign'; campaignId: string }
  | { type: 'send_in_app_nudge'; nudgeId: string };

export const AUTOMATION_RULES: AutomationRule[] = [
  // =============================================
  // BUYER AUTOMATIONS
  // =============================================
  {
    id: 'buyer_registered_no_inquiry_3d',
    name: 'New buyer: no inquiry after 3 days',
    trigger: {
      type: 'time_since_event',
      eventType: 'USER_SIGNUP',
      daysAfter: 3,
    },
    actions: [
      { type: 'send_email', templateId: 'buyer_first_inquiry_guide' },
      { type: 'send_in_app_nudge', nudgeId: 'create_first_inquiry' },
    ],
    cooldownHours: 72,
    isActive: true,
  },
  {
    id: 'buyer_registered_no_inquiry_7d',
    name: 'New buyer: no inquiry after 7 days',
    trigger: {
      type: 'time_since_event',
      eventType: 'USER_SIGNUP',
      daysAfter: 7,
    },
    actions: [
      { type: 'send_email', templateId: 'buyer_value_proposition' },
      { type: 'send_whatsapp', templateId: 'whatsapp_inquiry_reminder' },
    ],
    cooldownHours: 168,
    isActive: true,
  },
  {
    id: 'buyer_first_order_completed',
    name: 'Buyer completed first order',
    trigger: { type: 'event', eventType: 'ORDER_COMPLETED' },
    actions: [
      { type: 'send_email', templateId: 'post_order_nps', delay: 86400 }, // 24h after
      { type: 'send_email', templateId: 'referral_ask', delay: 172800 },  // 48h after
      { type: 'update_lifecycle_stage', newStage: 'CONVERTED' },
    ],
    cooldownHours: 0, // Always trigger (once per first order)
    isActive: true,
  },
  {
    id: 'buyer_at_risk_detection',
    name: 'Buyer score falling to AT_RISK zone',
    trigger: { type: 'score_crosses_below', threshold: 30 },
    actions: [
      { type: 'update_lifecycle_stage', newStage: 'AT_RISK' },
      { type: 'trigger_campaign', campaignId: 'buyer_reengagement' },
      { type: 'add_tag', tag: 'at_risk' },
    ],
    cooldownHours: 336, // 14 days
    isActive: true,
  },
  {
    id: 'buyer_high_value_lead',
    name: 'Buyer score crosses 70 -- assign to sales',
    trigger: { type: 'score_crosses_above', threshold: 70 },
    actions: [
      { type: 'assign_to_sales', teamId: 'buyer_success' },
      { type: 'create_task', assigneeId: 'auto', title: 'High-value buyer: personal outreach', dueInHours: 24 },
      { type: 'add_tag', tag: 'high_value' },
    ],
    cooldownHours: 720, // 30 days
    isActive: true,
  },
  {
    id: 'buyer_churned',
    name: 'Buyer inactive 60 days -- mark churned',
    trigger: {
      type: 'lifecycle_stage_duration',
      stage: 'AT_RISK',
      daysInStage: 46, // 14 (AT_RISK threshold) + 46 = 60 days total inactivity
    },
    actions: [
      { type: 'update_lifecycle_stage', newStage: 'CHURNED' },
      { type: 'trigger_campaign', campaignId: 'buyer_winback' },
    ],
    cooldownHours: 0,
    isActive: true,
  },

  // =============================================
  // DEALER AUTOMATIONS
  // =============================================
  {
    id: 'dealer_kyc_incomplete_3d',
    name: 'Dealer: KYC incomplete after 3 days',
    trigger: {
      type: 'time_since_event',
      eventType: 'DEALER_REGISTERED',
      daysAfter: 3,
    },
    actions: [
      { type: 'send_email', templateId: 'dealer_kyc_reminder_1' },
      { type: 'send_whatsapp', templateId: 'whatsapp_kyc_reminder' },
    ],
    cooldownHours: 72,
    isActive: true,
  },
  {
    id: 'dealer_kyc_incomplete_7d',
    name: 'Dealer: KYC incomplete after 7 days',
    trigger: {
      type: 'time_since_event',
      eventType: 'DEALER_REGISTERED',
      daysAfter: 7,
    },
    actions: [
      { type: 'send_email', templateId: 'dealer_kyc_reminder_2' },
      { type: 'send_sms', templateId: 'sms_kyc_urgent' },
      { type: 'assign_to_sales', teamId: 'dealer_onboarding' },
      { type: 'create_task', assigneeId: 'auto', title: 'Call dealer for KYC follow-up', dueInHours: 4 },
    ],
    cooldownHours: 168,
    isActive: true,
  },
  {
    id: 'dealer_verified_no_quote_5d',
    name: 'Dealer verified but no quote in 5 days',
    trigger: {
      type: 'time_since_event',
      eventType: 'DEALER_VERIFIED',
      daysAfter: 5,
    },
    actions: [
      { type: 'send_email', templateId: 'dealer_first_quote_guide' },
      { type: 'send_in_app_nudge', nudgeId: 'submit_first_quote' },
    ],
    cooldownHours: 120,
    isActive: true,
  },
  {
    id: 'dealer_subscription_expiring_7d',
    name: 'Dealer subscription expiring in 7 days',
    trigger: {
      type: 'time_since_event',
      eventType: 'SUBSCRIPTION_RENEWAL_DUE',
      daysAfter: -7, // 7 days BEFORE expiry (negative = future event)
    },
    actions: [
      { type: 'send_email', templateId: 'dealer_renewal_7d' },
    ],
    cooldownHours: 168,
    isActive: true,
  },
  {
    id: 'dealer_subscription_expiring_3d',
    name: 'Dealer subscription expiring in 3 days',
    trigger: {
      type: 'time_since_event',
      eventType: 'SUBSCRIPTION_RENEWAL_DUE',
      daysAfter: -3,
    },
    actions: [
      { type: 'send_email', templateId: 'dealer_renewal_3d' },
      { type: 'send_whatsapp', templateId: 'whatsapp_renewal_urgent' },
    ],
    cooldownHours: 72,
    isActive: true,
  },
  {
    id: 'dealer_subscription_expiring_1d',
    name: 'Dealer subscription expiring tomorrow',
    trigger: {
      type: 'time_since_event',
      eventType: 'SUBSCRIPTION_RENEWAL_DUE',
      daysAfter: -1,
    },
    actions: [
      { type: 'send_email', templateId: 'dealer_renewal_1d' },
      { type: 'send_sms', templateId: 'sms_renewal_final' },
      { type: 'send_push', title: 'Subscription expires tomorrow', body: 'Renew now to keep receiving buyer inquiries.' },
      { type: 'create_task', assigneeId: 'auto', title: 'Urgent: dealer subscription expiring tomorrow', dueInHours: 4 },
    ],
    cooldownHours: 24,
    isActive: true,
  },
  {
    id: 'dealer_at_risk',
    name: 'Dealer score drops below 30',
    trigger: { type: 'score_crosses_below', threshold: 30 },
    actions: [
      { type: 'update_lifecycle_stage', newStage: 'AT_RISK' },
      { type: 'assign_to_sales', teamId: 'dealer_retention' },
      { type: 'create_task', assigneeId: 'auto', title: 'At-risk dealer: retention call needed', dueInHours: 8 },
      { type: 'trigger_campaign', campaignId: 'dealer_reengagement' },
    ],
    cooldownHours: 336,
    isActive: true,
  },
];
```

---

## 20.3 Dealer CRM -- Complete Specification

### 20.3.1 Data Access Rules

The dealer CRM is a **scoped view** of platform data. A dealer can ONLY see:

| Data | Visibility Rule |
|------|----------------|
| Buyer identity (name, phone, company) | ONLY after buyer selects this dealer's quote (blind matching reveal) |
| Order history | ONLY orders where this dealer is the seller |
| Communication history | ONLY messages in conversations where this dealer is a participant |
| Buyer preferences | ONLY inferred from orders with this dealer (not global search/inquiry history) |

A dealer can NEVER see:
- Buyers who have not selected their quote
- Other dealers' quotes, prices, or performance
- Buyers' interactions with other dealers
- Platform-wide analytics (only their own metrics)

### 20.3.2 Dealer CRM Features

#### Contact Management

```typescript
// packages/api/src/services/crm/dealer-crm.service.ts

interface DealerContact {
  id: string;
  dealerId: string;
  buyerUserId: string;

  // Buyer info (populated after reveal)
  buyerName: string;
  buyerPhone: string | null;         // Shown only if buyer has shared it
  buyerEmail: string | null;
  buyerCompany: string | null;
  buyerCity: string;
  buyerRole: string;                  // 'Builder', 'Contractor', 'Homeowner', etc.

  // Relationship data
  firstOrderDate: Date;
  lastOrderDate: Date;
  totalOrders: number;
  totalRevenuePaise: number;          // Lifetime revenue from this buyer
  averageOrderPaise: number;
  lastInteractionAt: Date;

  // Dealer-specific enrichment
  tags: string[];                     // 'vip', 'bulk_buyer', 'price_sensitive', etc.
  notes: string | null;               // Private dealer notes
  temperature: 'HOT' | 'WARM' | 'COLD';   // Manual classification
  nextFollowUpAt: Date | null;        // Scheduled reminder

  // AI predictions
  predictedNextOrderDate: Date | null;    // Based on purchase frequency
  predictedNextOrderCategory: string | null;
  churnRisk: number;                  // 0.0 - 1.0

  createdAt: Date;
  updatedAt: Date;
}
```

#### Transaction History (per contact)

```typescript
interface DealerContactTransaction {
  orderId: string;
  inquiryId: string;
  orderDate: Date;
  status: string;                    // 'COMPLETED', 'IN_DELIVERY', 'CANCELLED', etc.
  items: {
    productName: string;
    quantity: number;
    unitPricePaise: number;
    totalPaise: number;
  }[];
  totalPaise: number;
  deliveryDate: Date | null;
  buyerRating: number | null;        // Rating buyer gave to this dealer for this order
  dealerNotes: string | null;        // Dealer's private note for this transaction
}
```

#### Follow-Up Reminders

```typescript
interface FollowUpReminder {
  id: string;
  dealerId: string;
  contactId: string;                 // DealerContact ID
  reminderAt: Date;                  // When to remind the dealer
  title: string;                     // "Follow up on MCB order"
  notes: string | null;
  status: 'PENDING' | 'COMPLETED' | 'SNOOZED' | 'CANCELLED';
  completedAt: Date | null;
  snoozeUntil: Date | null;
  createdAt: Date;
}
```

### 20.3.3 Dealer CRM Analytics

| Metric | Calculation | Dashboard Location |
|--------|------------|-------------------|
| **Customer Lifetime Value (CLV)** | `SUM(order_total)` per contact | Contact detail page |
| **Top Buyers by Revenue** | Ranked list of contacts by CLV | Dealer CRM > Analytics |
| **Buyer Retention Rate** | `buyers_with_repeat_orders / total_buyers` over last 90 days | Dealer CRM > Analytics |
| **Average Order Value (AOV)** | `SUM(order_total) / COUNT(orders)` across all contacts | Dealer CRM > Analytics |
| **Repeat Purchase Rate** | `buyers_with_2+_orders / total_buyers` | Dealer CRM > Analytics |
| **Average Days Between Orders** | `AVG(order_date[n+1] - order_date[n])` per contact | Contact detail page |
| **Category Mix** | Revenue breakdown by product category | Dealer CRM > Analytics |
| **Quote Win Rate** | `won_quotes / total_quotes_submitted` | Dealer dashboard (not CRM-specific) |
| **Response Time** | `AVG(quote_submitted_at - inquiry_created_at)` | Dealer dashboard |

### 20.3.4 Reorder Prediction

The platform predicts when a buyer is likely to reorder, enabling dealers to proactively reach out.

```typescript
// packages/api/src/services/crm/reorder-predictor.ts

interface ReorderPrediction {
  contactId: string;
  predictedDate: Date;
  confidence: number;               // 0.0 - 1.0
  likelyCategory: string;
  likelyQuantity: number;
  reasoning: string;                // "Buyer orders FRLS wire every 45 days. Last order was 38 days ago."
}

/**
 * Predict reorder timing based on:
 * 1. Historical purchase frequency per contact per category
 * 2. Seasonal patterns (construction activity peaks Oct-March in India)
 * 3. Order size patterns (bulk orders are less frequent)
 * 4. Project lifecycle signals (if buyer has active projects)
 */
export async function predictReorder(
  dealerId: string,
  contactId: string,
): Promise<ReorderPrediction | null> {
  const orders = await prisma.order.findMany({
    where: {
      dealerId,
      buyerId: contactId, // Actually the buyer's userId mapped via DealerContact
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'asc' },
    include: { items: true },
  });

  if (orders.length < 2) return null; // Need at least 2 orders to predict

  // Calculate inter-order intervals by category
  const categoryIntervals: Record<string, number[]> = {};
  for (let i = 1; i < orders.length; i++) {
    const intervalDays = Math.round(
      (orders[i].createdAt.getTime() - orders[i - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const item of orders[i].items) {
      const cat = item.categorySlug || 'unknown';
      if (!categoryIntervals[cat]) categoryIntervals[cat] = [];
      categoryIntervals[cat].push(intervalDays);
    }
  }

  // Find category with most predictable pattern
  let bestCategory: string | null = null;
  let bestAvgInterval = Infinity;
  let bestConfidence = 0;

  for (const [category, intervals] of Object.entries(categoryIntervals)) {
    if (intervals.length < 2) continue;

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length
    );
    const cv = stdDev / avg; // Coefficient of variation

    // Lower CV = more predictable pattern
    const confidence = Math.max(0, Math.min(1, 1 - cv));

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestCategory = category;
      bestAvgInterval = avg;
    }
  }

  if (!bestCategory || bestConfidence < 0.3) return null;

  const lastOrderDate = orders[orders.length - 1].createdAt;
  const predictedDate = new Date(lastOrderDate.getTime() + bestAvgInterval * 24 * 60 * 60 * 1000);

  // Adjust for seasonality (construction peaks Oct-March)
  const month = predictedDate.getMonth();
  const isPeakSeason = month >= 9 || month <= 2; // Oct-March
  if (isPeakSeason) {
    // During peak season, orders come ~15% faster
    const adjustment = bestAvgInterval * 0.15 * 24 * 60 * 60 * 1000;
    predictedDate.setTime(predictedDate.getTime() - adjustment);
  }

  const daysSinceLastOrder = Math.round(
    (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    contactId,
    predictedDate,
    confidence: bestConfidence,
    likelyCategory: bestCategory,
    likelyQuantity: Math.round(
      orders
        .flatMap(o => o.items.filter(i => i.categorySlug === bestCategory))
        .reduce((sum, i) => sum + i.quantity, 0) / orders.length
    ),
    reasoning: `Buyer orders ${bestCategory} every ~${Math.round(bestAvgInterval)} days. Last order was ${daysSinceLastOrder} days ago.`,
  };
}
```

---

## 20.4 Campaign Management

### 20.4.1 Email Sequences (Complete Definitions)

All emails are sent via Resend API. Templates use MJML for responsive HTML email rendering.

#### Sequence 1: Buyer Welcome (3 emails over 7 days)

| # | Delay | Subject | Content Summary | CTA |
|---|-------|---------|----------------|-----|
| 1 | Immediate | Welcome to Hub4Estate | Brief intro, platform value prop, "How it works" in 3 steps | "Create your first inquiry" |
| 2 | Day 3 | How Ravi saved Rs 24,000 on LED panels | Case study of a real deal (anonymized). Show savings percentage. | "Get quotes for your project" |
| 3 | Day 7 | Your personalized price dashboard is ready | Explain price intelligence feature. Show sample price trends for their city. | "Check prices in your area" |

**Trigger**: Buyer completes registration.
**Exit conditions**: Buyer creates inquiry (skip remaining emails) OR buyer unsubscribes.

#### Sequence 2: Buyer Onboarding (5 emails over 14 days)

| # | Delay | Subject | Content Summary | CTA |
|---|-------|---------|----------------|-----|
| 1 | Day 1 | Your inquiry guide: get the best price in 3 steps | Step-by-step guide to creating an inquiry. Screenshots. | "Create inquiry now" |
| 2 | Day 3 | Meet Volt, your AI procurement assistant | Introduce AI assistant. Show example conversation. | "Ask Volt a question" |
| 3 | Day 5 | How blind matching protects your interests | Explain the blind matching mechanism. Why it gets better prices. Trust signal. | "See how it works" |
| 4 | Day 10 | Your first month: tips from power users | Tips from actual users. "5 things to include in your inquiry for best quotes." | "Update your inquiry" |
| 5 | Day 14 | Your savings report (even if you haven't ordered yet) | Show estimated savings based on their inquiry categories vs market prices. | "View your dashboard" |

**Trigger**: Buyer creates first inquiry but has not ordered.
**Exit conditions**: Buyer completes order OR buyer unsubscribes.

#### Sequence 3: Buyer Re-engagement (3 emails over 10 days)

| # | Delay | Subject | Content Summary | CTA |
|---|-------|---------|----------------|-----|
| 1 | Immediate | Prices have dropped in [their category] | Real price drop data for categories they've searched/inquired about. | "See updated prices" |
| 2 | Day 4 | [Name], your builders are still getting better deals | Social proof: "X users in [their city] saved Rs Y this month." | "Get a quote" |
| 3 | Day 10 | We'd love your feedback (60 second survey) | Short survey: why they stopped using the platform. + "Is there anything we can help with?" | "Take quick survey" |

**Trigger**: Lead score drops below 30 (AT_RISK stage).
**Exit conditions**: Any platform activity OR buyer unsubscribes.

#### Sequence 4: Dealer Subscription Renewal (3 emails)

| # | Delay | Subject | Content Summary | CTA |
|---|-------|---------|----------------|-----|
| 1 | 7 days before expiry | Your Hub4Estate subscription renews in 7 days | Summary of what they've achieved this period: quotes sent, bids won, revenue earned. "Keep the momentum going." | "Renew now" |
| 2 | 3 days before expiry | Don't lose your dealer badge and buyer access | Explain what they lose on expiry: no incoming inquiries, dashboard downgraded, analytics restricted. | "Renew now (takes 30 seconds)" |
| 3 | 1 day before expiry | Last day: your subscription expires tomorrow | Urgency. "Your Rs [X] in pipeline opportunities will be paused." Final CTA. | "Renew now" |

**Trigger**: Subscription expiry date approaching.
**Exit conditions**: Dealer renews OR subscription expires (hand off to win-back campaign).

#### Sequence 5: Post-Order (2 emails)

| # | Delay | Subject | Content Summary | CTA |
|---|-------|---------|----------------|-----|
| 1 | 24 hours after delivery confirmed | How was your experience with [dealer name]? | NPS question (0-10 scale). Quick feedback on product quality, delivery speed, communication. | "Rate your experience" |
| 2 | 48 hours after delivery confirmed | Know someone who buys electrical supplies? | Referral program pitch. "Share your referral link and earn Hub4Estate credits on your next order." | "Refer a friend" |

**Trigger**: Order delivery confirmed.
**Exit conditions**: N/A (always sends both).

### 20.4.2 WhatsApp Templates

All WhatsApp messages must use pre-approved templates (WhatsApp Business Policy). Templates are submitted via Gupshup.

| Template ID | Category | Template Text | Variables |
|------------|----------|---------------|-----------|
| `wha_welcome` | MARKETING | Hi {{1}}! Welcome to Hub4Estate. You're now connected to 100+ verified electrical dealers. Create your first inquiry and get quotes within hours. | `{{1}}`: buyer name |
| `wha_inquiry_live` | UTILITY | Hi {{1}}, your inquiry for {{2}} is now live. {{3}} dealers in your area can see it. You'll receive quotes soon. | `{{1}}`: name, `{{2}}`: product category, `{{3}}`: dealer count |
| `wha_new_quote` | UTILITY | Good news, {{1}}! You've received a new quote for your {{2}} inquiry. {{3}} dealers have responded so far. Check your dashboard: {{4}} | `{{1}}`: name, `{{2}}`: category, `{{3}}`: quote count, `{{4}}`: link |
| `wha_order_confirmed` | UTILITY | Hi {{1}}, your order #{{2}} is confirmed! Expected delivery: {{3}}. Track your order: {{4}} | `{{1}}`: name, `{{2}}`: order ID, `{{3}}`: date, `{{4}}`: link |
| `wha_kyc_reminder` | UTILITY | Hi {{1}}, complete your KYC to start receiving buyer inquiries on Hub4Estate. Upload your documents: {{2}} | `{{1}}`: dealer name, `{{2}}`: link |
| `wha_renewal_reminder` | MARKETING | Hi {{1}}, your Hub4Estate subscription expires in {{2}} days. You've earned Rs {{3}} through the platform. Renew: {{4}} | `{{1}}`: name, `{{2}}`: days, `{{3}}`: revenue, `{{4}}`: link |
| `wha_reengagement` | MARKETING | Hi {{1}}, prices for {{2}} have dropped {{3}}% this week. See current prices: {{4}} | `{{1}}`: name, `{{2}}`: category, `{{3}}`: percent, `{{4}}`: link |

**Rate limits**: WhatsApp Business API Tier 1 (new account): 1,000 unique users/24h. Scale to Tier 4 (100K/24h) as messaging quality score improves.

**Opt-out handling**: Every marketing template includes "Reply STOP to opt out." Opt-out stored in `notification_preferences.whatsapp_marketing = false`. Utility messages (order confirmations, OTP) cannot be opted out.

### 20.4.3 SMS Templates (MSG91)

SMS is used only for critical transactional messages. No marketing SMS.

| Template ID | Template Text | Variables |
|------------|---------------|-----------|
| `sms_otp` | `{{otp}} is your Hub4Estate verification code. Valid for 10 minutes. Do not share.` | `{{otp}}`: 6-digit code |
| `sms_order_confirmed` | `Hub4Estate: Order #{{orderId}} confirmed. Total: Rs {{amount}}. Track: {{link}}` | `{{orderId}}`, `{{amount}}`, `{{link}}` |
| `sms_delivery_complete` | `Hub4Estate: Your order #{{orderId}} has been delivered. Rate your experience: {{link}}` | `{{orderId}}`, `{{link}}` |
| `sms_kyc_urgent` | `Hub4Estate: Complete your dealer KYC to start receiving inquiries. Upload docs: {{link}}` | `{{link}}` |
| `sms_renewal_final` | `Hub4Estate: Your subscription expires tomorrow. Renew now to keep receiving buyer leads: {{link}}` | `{{link}}` |

### 20.4.4 Campaign Audience Segmentation

```typescript
// packages/api/src/services/crm/campaign/audience-builder.ts

interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  filters: SegmentFilter[];
  estimatedSize: number;          // Computed on creation and refreshed daily
  lastRefreshedAt: Date;
}

type SegmentFilter =
  | { field: 'userType'; operator: 'eq'; value: 'BUYER' | 'DEALER' }
  | { field: 'lifecycleStage'; operator: 'in'; value: string[] }
  | { field: 'leadScore'; operator: 'gte' | 'lte' | 'between'; value: number | [number, number] }
  | { field: 'city'; operator: 'in'; value: string[] }
  | { field: 'state'; operator: 'in'; value: string[] }
  | { field: 'registeredAfter'; operator: 'gte'; value: Date }
  | { field: 'lastActiveAt'; operator: 'gte' | 'lte'; value: Date }
  | { field: 'totalOrders'; operator: 'gte' | 'lte'; value: number }
  | { field: 'totalSpendPaise'; operator: 'gte' | 'lte'; value: number }
  | { field: 'categoryInterest'; operator: 'in'; value: string[] }
  | { field: 'dealerTier'; operator: 'in'; value: string[] }
  | { field: 'subscriptionPlan'; operator: 'in'; value: string[] }
  | { field: 'subscriptionExpiresWithin'; operator: 'lte'; value: number } // days
  | { field: 'hasTag'; operator: 'in'; value: string[] }
  | { field: 'hasNotTag'; operator: 'nin'; value: string[] }
  | { field: 'npsScore'; operator: 'gte' | 'lte'; value: number };

// Pre-defined segments
export const DEFAULT_SEGMENTS: Omit<AudienceSegment, 'id' | 'estimatedSize' | 'lastRefreshedAt'>[] = [
  {
    name: 'Active Buyers - High Value',
    description: 'Buyers with lead score > 60 and at least 1 order',
    filters: [
      { field: 'userType', operator: 'eq', value: 'BUYER' },
      { field: 'leadScore', operator: 'gte', value: 60 },
      { field: 'totalOrders', operator: 'gte', value: 1 },
    ],
  },
  {
    name: 'At-Risk Buyers',
    description: 'Buyers in AT_RISK or CHURNED stage',
    filters: [
      { field: 'userType', operator: 'eq', value: 'BUYER' },
      { field: 'lifecycleStage', operator: 'in', value: ['AT_RISK', 'CHURNED'] },
    ],
  },
  {
    name: 'New Buyers - Unactivated',
    description: 'Registered in last 14 days but no inquiry yet',
    filters: [
      { field: 'userType', operator: 'eq', value: 'BUYER' },
      { field: 'registeredAfter', operator: 'gte', value: new Date(Date.now() - 14 * 86400000) },
      { field: 'totalOrders', operator: 'lte', value: 0 },
    ],
  },
  {
    name: 'Dealers - Subscription Expiring',
    description: 'Dealers whose subscription expires within 7 days',
    filters: [
      { field: 'userType', operator: 'eq', value: 'DEALER' },
      { field: 'subscriptionExpiresWithin', operator: 'lte', value: 7 },
    ],
  },
  {
    name: 'Dealers - Sri Ganganagar',
    description: 'All verified dealers in Sri Ganganagar',
    filters: [
      { field: 'userType', operator: 'eq', value: 'DEALER' },
      { field: 'city', operator: 'in', value: ['Sri Ganganagar'] },
      { field: 'lifecycleStage', operator: 'in', value: ['VERIFIED', 'TRIAL', 'PAYING', 'ACTIVE'] },
    ],
  },
  {
    name: 'Bulk Buyers',
    description: 'Buyers who have placed orders totaling > Rs 1,00,000',
    filters: [
      { field: 'userType', operator: 'eq', value: 'BUYER' },
      { field: 'totalSpendPaise', operator: 'gte', value: 10000000 }, // Rs 1,00,000
    ],
  },
];
```

### 20.4.5 A/B Testing for Campaigns

```typescript
// packages/api/src/services/crm/campaign/ab-testing.ts

interface ABTest {
  id: string;
  campaignId: string;
  name: string;
  variants: ABVariant[];
  splitMethod: 'random' | 'stratified';   // Random = 50/50. Stratified = balanced by lead score.
  metrics: ABMetric[];
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  winnerVariantId: string | null;
  winnerSelectedAt: Date | null;
  winnerSelectionMethod: 'manual' | 'auto_significance';
  confidenceThreshold: number;             // Default: 0.95 (95% statistical significance)
  minimumSampleSize: number;               // Default: 100 per variant
  startedAt: Date | null;
  completedAt: Date | null;
}

interface ABVariant {
  id: string;
  name: string;                            // 'Variant A', 'Variant B'
  weight: number;                          // Traffic split: 0.5 = 50%
  // For email campaigns:
  subjectLine: string | null;
  preheaderText: string | null;
  templateId: string;
  sendTimeOffset: number | null;           // Hours offset from scheduled time (for send-time testing)
  // Metrics
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;                       // Completed target action (e.g., created inquiry, renewed subscription)
}

interface ABMetric {
  name: 'open_rate' | 'click_rate' | 'conversion_rate' | 'unsubscribe_rate';
  isPrimary: boolean;                      // Primary metric used for winner selection
}
```

---

## 20.5 Sales Team Tools

### 20.5.1 Deal Pipeline

Hub4Estate's sales team (starting with Shreshth + 1 sales intern) uses the CRM to acquire and manage dealer accounts.

```typescript
// packages/api/src/services/crm/sales/deal-pipeline.ts

enum DealStage {
  LEAD = 'LEAD',                     // Identified a potential dealer
  CONTACTED = 'CONTACTED',           // First outreach made (call/email/WhatsApp)
  DEMO_SCHEDULED = 'DEMO_SCHEDULED', // Demo call scheduled
  DEMO_DONE = 'DEMO_DONE',           // Demo completed
  NEGOTIATION = 'NEGOTIATION',       // Discussing pricing/terms
  PROPOSAL_SENT = 'PROPOSAL_SENT',   // Formal proposal sent
  CLOSED_WON = 'CLOSED_WON',        // Dealer signed up / subscribed
  CLOSED_LOST = 'CLOSED_LOST',      // Deal lost (with reason)
}

interface Deal {
  id: string;
  dealerId: string | null;           // Linked to dealer record once they register
  
  // Contact info (for pre-registration leads)
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  businessName: string;
  city: string;
  category: string;                  // 'electrical', 'plumbing', 'multi', etc.

  // Pipeline
  stage: DealStage;
  probability: number;               // 0-100, auto-set based on stage
  expectedRevenuePaise: number;      // Expected monthly subscription revenue
  expectedCloseDate: Date;

  // Assignment
  ownerId: string;                   // Sales team member ID
  ownerName: string;

  // Tracking
  lostReason: string | null;         // If CLOSED_LOST: 'price', 'competitor', 'not_ready', 'no_response', 'other'
  notes: string | null;
  lastActivityAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Auto-probability by stage
const STAGE_PROBABILITIES: Record<DealStage, number> = {
  LEAD: 10,
  CONTACTED: 20,
  DEMO_SCHEDULED: 40,
  DEMO_DONE: 55,
  NEGOTIATION: 70,
  PROPOSAL_SENT: 80,
  CLOSED_WON: 100,
  CLOSED_LOST: 0,
};
```

### 20.5.2 Activity Logging

```typescript
// packages/api/src/services/crm/sales/activity-log.ts

enum ActivityType {
  CALL_OUTBOUND = 'CALL_OUTBOUND',
  CALL_INBOUND = 'CALL_INBOUND',
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_RECEIVED = 'EMAIL_RECEIVED',
  WHATSAPP_SENT = 'WHATSAPP_SENT',
  WHATSAPP_RECEIVED = 'WHATSAPP_RECEIVED',
  MEETING = 'MEETING',
  DEMO = 'DEMO',
  NOTE = 'NOTE',
  STAGE_CHANGE = 'STAGE_CHANGE',
  DEAL_CREATED = 'DEAL_CREATED',
  DEAL_WON = 'DEAL_WON',
  DEAL_LOST = 'DEAL_LOST',
  TASK_COMPLETED = 'TASK_COMPLETED',
}

interface SalesActivity {
  id: string;
  dealId: string;
  activityType: ActivityType;
  description: string;               // "Called Ramesh. Interested in Growth plan. Will discuss with partner."
  durationMinutes: number | null;     // For calls and meetings
  outcome: string | null;             // 'positive', 'neutral', 'negative', 'no_answer'
  nextAction: string | null;          // "Schedule demo for Tuesday 3 PM"
  nextActionDueAt: Date | null;
  loggedBy: string;                   // User ID of sales person
  isAutomatic: boolean;               // True for system-generated entries
  createdAt: Date;
}
```

### 20.5.3 Sales Reporting

| Report | Calculation | Frequency | Audience |
|--------|------------|-----------|----------|
| **Pipeline Value** | `SUM(expectedRevenuePaise * probability/100)` for all open deals | Real-time | Sales team, Shreshth |
| **Pipeline Velocity** | `AVG(days from LEAD to CLOSED_WON)` over last 30 days | Weekly | Sales team, Shreshth |
| **Conversion Rate by Stage** | `COUNT(stage_n+1) / COUNT(stage_n)` per transition | Weekly | Sales team |
| **Win Rate** | `CLOSED_WON / (CLOSED_WON + CLOSED_LOST)` over last 30 days | Weekly | Shreshth |
| **Revenue Forecast** | `SUM(expectedRevenue * probability)` grouped by expectedCloseDate month | Monthly | Shreshth |
| **Activity Volume** | Count of activities per sales person per day/week | Daily | Sales team lead |
| **Lost Reason Analysis** | Distribution of `lostReason` for CLOSED_LOST deals | Monthly | Shreshth, Sales team |
| **Time to First Response** | `AVG(first_activity_date - deal_created_date)` for new leads | Weekly | Sales team lead |

---

## 20.6 Database Schema -- CRM Tables

### 20.6.1 New Prisma Models

```prisma
// ============================================
// CRM: LEAD SCORING
// ============================================

enum LeadTrend {
  RISING
  STABLE
  FALLING
}

model LeadScore {
  id              String      @id @default(uuid())
  userId          String      @unique
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  userType        String      // 'BUYER' | 'DEALER'
  total           Int         // 0-100
  demographic     Int         // 0-25
  behavioral      Int         // 0-40
  engagement      Int         // 0-20
  recency         Int         // 0-15
  
  trend           LeadTrend   @default(STABLE)
  calculatedAt    DateTime    @default(now())
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([total])
  @@index([userType, total])
  @@index([trend])
  @@index([calculatedAt])
}

model LeadScoreHistory {
  id              String      @id @default(uuid())
  userId          String
  total           Int
  demographic     Int
  behavioral      Int
  engagement      Int
  recency         Int
  calculatedAt    DateTime    @default(now())

  @@index([userId, calculatedAt])
}

// ============================================
// CRM: LIFECYCLE & PIPELINE
// ============================================

enum LifecycleStage {
  // Buyer stages
  ANONYMOUS
  AWARE
  REGISTERED
  ACTIVATED
  ENGAGED
  CONVERTED
  ACTIVE
  AT_RISK
  CHURNED
  
  // Dealer-specific stages
  PROSPECT
  APPLIED
  PENDING_REVIEW
  VERIFIED
  TRIAL
  PAYING
  // ACTIVE, AT_RISK, CHURNED shared with buyer
}

model UserLifecycle {
  id              String          @id @default(uuid())
  userId          String          @unique
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  currentStage    LifecycleStage
  previousStage   LifecycleStage?
  stageEnteredAt  DateTime        @default(now())
  
  // Time spent in each stage (in hours)
  stageHistory    Json?           // Array of { stage, enteredAt, exitedAt, durationHours }
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([currentStage])
  @@index([stageEnteredAt])
}

// ============================================
// CRM: DEALER CONTACTS (Dealer CRM)
// ============================================

enum ContactTemperature {
  HOT
  WARM
  COLD
}

model DealerContact {
  id              String              @id @default(uuid())
  dealerId        String
  dealer          Dealer              @relation(fields: [dealerId], references: [id], onDelete: Cascade)
  buyerUserId     String
  buyerUser       User                @relation(fields: [buyerUserId], references: [id], onDelete: Cascade)

  // Denormalized buyer info (snapshot at reveal time)
  buyerName       String
  buyerPhone      String?
  buyerEmail      String?
  buyerCompany    String?
  buyerCity       String
  buyerRole       String?

  // Relationship metrics
  firstOrderDate  DateTime
  lastOrderDate   DateTime
  totalOrders     Int                 @default(1)
  totalRevenuePaise BigInt            @default(0)
  averageOrderPaise BigInt            @default(0)
  lastInteractionAt DateTime          @default(now())

  // Dealer enrichment
  tags            String[]            @default([])
  notes           String?             @db.Text
  temperature     ContactTemperature  @default(WARM)
  nextFollowUpAt  DateTime?

  // AI predictions
  predictedNextOrderDate  DateTime?
  predictedNextCategory   String?
  churnRisk       Float?              @default(0)

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  // Relations
  followUps       FollowUpReminder[]

  @@unique([dealerId, buyerUserId])
  @@index([dealerId, temperature])
  @@index([dealerId, lastInteractionAt])
  @@index([dealerId, totalRevenuePaise])
  @@index([nextFollowUpAt])
}

model FollowUpReminder {
  id              String          @id @default(uuid())
  dealerId        String
  contactId       String
  contact         DealerContact   @relation(fields: [contactId], references: [id], onDelete: Cascade)

  reminderAt      DateTime
  title           String
  notes           String?
  status          String          @default("PENDING") // PENDING, COMPLETED, SNOOZED, CANCELLED
  completedAt     DateTime?
  snoozeUntil     DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([dealerId, status, reminderAt])
  @@index([contactId])
}

// ============================================
// CRM: SALES DEALS
// ============================================

enum DealStage {
  LEAD
  CONTACTED
  DEMO_SCHEDULED
  DEMO_DONE
  NEGOTIATION
  PROPOSAL_SENT
  CLOSED_WON
  CLOSED_LOST
}

model SalesDeal {
  id                  String      @id @default(uuid())
  dealerId            String?     // Linked when dealer registers
  
  // Contact info
  contactName         String
  contactPhone        String
  contactEmail        String?
  businessName        String
  city                String
  category            String      @default("electrical")

  // Pipeline
  stage               DealStage   @default(LEAD)
  probability         Int         @default(10)    // 0-100
  expectedRevenuePaise BigInt     @default(0)
  expectedCloseDate   DateTime?

  // Assignment
  ownerId             String      // Admin/sales user ID
  
  // Outcome
  lostReason          String?     // 'price', 'competitor', 'not_ready', 'no_response', 'other'
  lostNotes           String?     @db.Text
  wonAt               DateTime?
  lostAt              DateTime?

  // Tracking
  notes               String?     @db.Text
  lastActivityAt      DateTime    @default(now())

  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  // Relations
  activities          SalesActivity[]

  @@index([stage])
  @@index([ownerId, stage])
  @@index([expectedCloseDate])
  @@index([city])
}

model SalesActivity {
  id                  String      @id @default(uuid())
  dealId              String
  deal                SalesDeal   @relation(fields: [dealId], references: [id], onDelete: Cascade)

  activityType        String      // CALL_OUTBOUND, EMAIL_SENT, DEMO, NOTE, STAGE_CHANGE, etc.
  description         String      @db.Text
  durationMinutes     Int?
  outcome             String?     // 'positive', 'neutral', 'negative', 'no_answer'
  nextAction          String?
  nextActionDueAt     DateTime?
  loggedBy            String      // User ID
  isAutomatic         Boolean     @default(false)

  createdAt           DateTime    @default(now())

  @@index([dealId, createdAt])
  @@index([loggedBy, createdAt])
  @@index([activityType])
}

// ============================================
// CRM: CAMPAIGNS
// ============================================

enum CampaignStatus {
  DRAFT
  SCHEDULED
  RUNNING
  PAUSED
  COMPLETED
  CANCELLED
}

enum CampaignChannel {
  EMAIL
  WHATSAPP
  SMS
  PUSH
  IN_APP
}

model Campaign {
  id                  String          @id @default(uuid())
  name                String
  description         String?
  channel             CampaignChannel
  status              CampaignStatus  @default(DRAFT)
  
  // Audience
  segmentId           String?         // Link to saved audience segment
  segmentFilters      Json?           // Inline filters (if no saved segment)
  audienceSize        Int             @default(0)

  // Content
  templateId          String?
  subjectLine         String?         // For email
  body                String?         @db.Text

  // Scheduling
  scheduledAt         DateTime?
  startedAt           DateTime?
  completedAt         DateTime?

  // A/B Testing
  isAbTest            Boolean         @default(false)
  abTestConfig        Json?           // { variants: [...], splitMethod, confidenceThreshold }

  // Metrics
  sent                Int             @default(0)
  delivered           Int             @default(0)
  opened              Int             @default(0)
  clicked             Int             @default(0)
  converted           Int             @default(0)
  bounced             Int             @default(0)
  unsubscribed        Int             @default(0)
  complained          Int             @default(0)  // Spam complaints

  // Ownership
  createdBy           String
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  @@index([status])
  @@index([channel, status])
  @@index([scheduledAt])
}

model CampaignRecipient {
  id                  String      @id @default(uuid())
  campaignId          String
  userId              String
  
  // Delivery status
  sentAt              DateTime?
  deliveredAt         DateTime?
  openedAt            DateTime?
  clickedAt           DateTime?
  convertedAt         DateTime?
  bouncedAt           DateTime?
  unsubscribedAt      DateTime?

  // A/B test variant (if applicable)
  variantId           String?

  createdAt           DateTime    @default(now())

  @@unique([campaignId, userId])
  @@index([campaignId, sentAt])
  @@index([userId])
}

// ============================================
// CRM: AUTOMATION EXECUTION LOG
// ============================================

model AutomationExecution {
  id                  String      @id @default(uuid())
  ruleId              String      // ID from AUTOMATION_RULES constant
  userId              String
  
  triggeredBy         String      // Description of what triggered the rule
  actionsExecuted     Json        // Array of { actionType, status, result }
  
  status              String      @default("COMPLETED") // COMPLETED, PARTIAL, FAILED
  errorMessage        String?

  createdAt           DateTime    @default(now())

  @@index([ruleId, createdAt])
  @@index([userId, createdAt])
}

// ============================================
// CRM: NOTIFICATION PREFERENCES (CRM-specific overlay)
// ============================================

model CrmNotificationPreference {
  id                  String      @id @default(uuid())
  userId              String      @unique
  
  emailMarketing      Boolean     @default(true)
  emailTransactional  Boolean     @default(true)     // Cannot be false (required by law for order confirmations)
  whatsappMarketing   Boolean     @default(true)
  whatsappUtility     Boolean     @default(true)     // Cannot be false
  smsMarketing        Boolean     @default(false)    // Opt-in only (Indian TRAI regulations)
  smsTransactional    Boolean     @default(true)     // Cannot be false
  pushNotifications   Boolean     @default(true)
  inAppNudges         Boolean     @default(true)
  
  // Digest preferences
  emailDigestFrequency String    @default("realtime") // 'realtime', 'daily', 'weekly', 'none'
  
  // Unsubscribe tracking
  globalUnsubscribedAt DateTime?  // If set, NO marketing messages on any channel
  
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
}
```

---

## 20.7 API Endpoints -- CRM

### 20.7.1 Platform CRM APIs (Admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/crm/leads` | Admin | List all leads with filters (stage, score range, city, type) |
| GET | `/api/v1/admin/crm/leads/:userId` | Admin | Get complete lead profile (score, lifecycle, activities, campaigns) |
| GET | `/api/v1/admin/crm/leads/:userId/timeline` | Admin | Get full activity timeline for a lead |
| PUT | `/api/v1/admin/crm/leads/:userId/stage` | Admin | Manually update lifecycle stage |
| PUT | `/api/v1/admin/crm/leads/:userId/tags` | Admin | Add/remove tags on a lead |
| POST | `/api/v1/admin/crm/leads/:userId/note` | Admin | Add a note to a lead |
| GET | `/api/v1/admin/crm/scores/distribution` | Admin | Lead score distribution histogram |
| POST | `/api/v1/admin/crm/scores/recalculate` | Admin | Trigger full score recalculation (async job) |
| GET | `/api/v1/admin/crm/pipeline` | Admin | Get sales pipeline summary (deal counts + values by stage) |
| GET | `/api/v1/admin/crm/deals` | Admin | List sales deals with filters |
| POST | `/api/v1/admin/crm/deals` | Admin | Create a new sales deal |
| PUT | `/api/v1/admin/crm/deals/:dealId` | Admin | Update deal (stage, notes, probability, etc.) |
| POST | `/api/v1/admin/crm/deals/:dealId/activities` | Admin | Log an activity on a deal |
| GET | `/api/v1/admin/crm/deals/:dealId/activities` | Admin | List activities for a deal |
| GET | `/api/v1/admin/crm/campaigns` | Admin | List all campaigns |
| POST | `/api/v1/admin/crm/campaigns` | Admin | Create a new campaign |
| PUT | `/api/v1/admin/crm/campaigns/:campaignId` | Admin | Update campaign (content, schedule, audience) |
| POST | `/api/v1/admin/crm/campaigns/:campaignId/send` | Admin | Send/schedule a campaign |
| POST | `/api/v1/admin/crm/campaigns/:campaignId/pause` | Admin | Pause a running campaign |
| GET | `/api/v1/admin/crm/campaigns/:campaignId/analytics` | Admin | Get campaign performance metrics |
| GET | `/api/v1/admin/crm/segments` | Admin | List saved audience segments |
| POST | `/api/v1/admin/crm/segments` | Admin | Create a new segment |
| GET | `/api/v1/admin/crm/segments/:segmentId/preview` | Admin | Preview users matching a segment (first 50) |
| GET | `/api/v1/admin/crm/automations` | Admin | List automation rules and their execution stats |
| PUT | `/api/v1/admin/crm/automations/:ruleId` | Admin | Enable/disable an automation rule |
| GET | `/api/v1/admin/crm/automations/:ruleId/log` | Admin | Get execution log for a specific rule |
| GET | `/api/v1/admin/crm/reports/pipeline-velocity` | Admin | Pipeline velocity report |
| GET | `/api/v1/admin/crm/reports/conversion-funnel` | Admin | Stage-by-stage conversion rates |
| GET | `/api/v1/admin/crm/reports/revenue-forecast` | Admin | Revenue forecast by month |
| GET | `/api/v1/admin/crm/reports/churn-risk` | Admin | Users at risk of churning (sorted by risk score) |

### 20.7.2 Dealer CRM APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/dealer/crm/contacts` | Dealer | List dealer's contacts (post-reveal buyers) |
| GET | `/api/v1/dealer/crm/contacts/:contactId` | Dealer | Get contact detail with transaction history |
| PUT | `/api/v1/dealer/crm/contacts/:contactId` | Dealer | Update contact (tags, notes, temperature) |
| GET | `/api/v1/dealer/crm/contacts/:contactId/transactions` | Dealer | List orders with this buyer |
| POST | `/api/v1/dealer/crm/contacts/:contactId/follow-ups` | Dealer | Create a follow-up reminder |
| GET | `/api/v1/dealer/crm/follow-ups` | Dealer | List all pending follow-ups |
| PUT | `/api/v1/dealer/crm/follow-ups/:id` | Dealer | Update follow-up (complete, snooze, cancel) |
| GET | `/api/v1/dealer/crm/analytics/top-buyers` | Dealer | Top buyers by revenue |
| GET | `/api/v1/dealer/crm/analytics/retention` | Dealer | Buyer retention rate and trends |
| GET | `/api/v1/dealer/crm/analytics/reorder-predictions` | Dealer | List reorder predictions for contacts |
| GET | `/api/v1/dealer/crm/analytics/category-mix` | Dealer | Revenue breakdown by category |

### 20.7.3 User Notification Preferences APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/user/notification-preferences` | User | Get notification preferences |
| PUT | `/api/v1/user/notification-preferences` | User | Update notification preferences |
| POST | `/api/v1/user/unsubscribe` | Public (via token) | Global unsubscribe (email link) |

---

## 20.8 Integration Points

### 20.8.1 CRM <-> Analytics Pipeline

Every CRM event is also an analytics event. The following events flow from CRM into the PostHog analytics pipeline:

| CRM Event | PostHog Event Name | Properties |
|-----------|-------------------|------------|
| Lead score calculated | `crm_score_calculated` | `score`, `trend`, `userType` |
| Lifecycle stage changed | `crm_stage_changed` | `fromStage`, `toStage`, `userType` |
| Automation triggered | `crm_automation_triggered` | `ruleId`, `ruleName`, `actionsCount` |
| Campaign sent | `crm_campaign_sent` | `campaignId`, `channel`, `audienceSize` |
| Campaign opened | `crm_campaign_opened` | `campaignId`, `channel` |
| Campaign converted | `crm_campaign_converted` | `campaignId`, `channel` |
| Deal stage changed | `crm_deal_stage_changed` | `dealId`, `fromStage`, `toStage`, `probability` |

### 20.8.2 CRM <-> Notification Engine

The CRM automation engine dispatches messages through the centralized notification engine (Section 15 of the PRD). The CRM does NOT send emails directly -- it creates notification jobs:

```typescript
// CRM automation triggers a notification
await notificationEngine.dispatch({
  userId: lead.userId,
  channel: 'email',
  templateId: 'buyer_first_inquiry_guide',
  variables: {
    name: lead.name,
    city: lead.city,
    categoryHint: lead.lastSearchedCategory || 'electrical supplies',
  },
  metadata: {
    source: 'crm_automation',
    ruleId: 'buyer_registered_no_inquiry_3d',
    campaignId: null,
  },
});
```

### 20.8.3 CRM <-> Volt AI Assistant

The Volt AI Procurement Copilot (Section 9) has read access to CRM data for personalization:

| Data Point | Volt's Use |
|-----------|-----------|
| Lead score | Prioritize high-value leads for proactive recommendations |
| Lifecycle stage | Adjust conversation tone (onboarding vs. power user) |
| Purchase history | Recommend products based on past orders |
| Category interest | Pre-fill inquiry suggestions |
| City | Show location-relevant pricing and dealer availability |

Volt NEVER writes to CRM directly. It can only read. CRM updates happen through the event pipeline when Volt's conversations result in inquiries, orders, or other tracked actions.

---

## 20.9 Cost Analysis

### 20.9.1 Communication Costs (per 1,000 users)

| Channel | Volume/Month | Cost/Unit (INR) | Monthly Cost (INR) |
|---------|-------------|----------------|-------------------|
| Email (Resend) | 5,000 emails | 0.08 | 400 |
| WhatsApp (Gupshup) | 1,000 messages | 0.50 | 500 |
| SMS (MSG91) | 500 messages | 0.18 | 90 |
| Push (FCM) | 2,000 notifications | Free | 0 |
| **Total** | | | **~990/mo** |

### 20.9.2 Scale Projection

| Users | Email/mo | WhatsApp/mo | SMS/mo | Total Comms Cost/mo (INR) |
|-------|----------|------------|--------|--------------------------|
| 50 (current) | 250 | 50 | 25 | ~50 |
| 1,000 | 5,000 | 1,000 | 500 | ~990 |
| 10,000 | 50,000 | 10,000 | 5,000 | ~9,900 |
| 100,000 | 500,000 | 100,000 | 50,000 | ~99,000 |

*At 100K users, communication cost is ~0.8% of projected revenue (Rs 1.25 Cr/mo). Well within acceptable range.*

---

## 20.10 Compliance

### 20.10.1 Indian Regulatory Compliance

| Regulation | Requirement | Implementation |
|-----------|-------------|---------------|
| TRAI DND (Telecom Regulatory Authority) | Do Not Disturb registry compliance for SMS | Check DND registry before sending promotional SMS. Transactional SMS exempt. MSG91 handles this. |
| DPDP Act 2023 | User consent for data processing, right to erasure | Explicit opt-in for marketing. Unsubscribe link in every email. Global opt-out stored in `CrmNotificationPreference`. Data deletion on request within 30 days. |
| IT Act 2000 Section 43A | Reasonable security for sensitive personal data | PII encrypted at rest. Access logged. No PII in plain-text logs. |
| CAN-SPAM (for international recipients) | Unsubscribe mechanism, physical address in emails | Footer in every email: unsubscribe link + Hub4Estate registered address. |
| WhatsApp Business Policy | Pre-approved templates only for marketing. 24-hour window for free-form messages after user interaction. | All outbound WhatsApp uses approved templates. Free-form replies only within 24h of user message. |

### 20.10.2 Data Retention for CRM

| Data Type | Retention Period | After Retention |
|-----------|-----------------|-----------------|
| Lead scores | Indefinite (needed for trend analysis) | -- |
| Lead score history | 365 days | Aggregate and delete individual records |
| Campaign analytics | Indefinite | -- |
| Campaign recipient details | 180 days after campaign | Delete individual recipient records, keep aggregate stats |
| Sales deal records | Indefinite | -- |
| Sales activity logs | 365 days | Archive to cold storage |
| Automation execution logs | 90 days | Delete |
| Dealer CRM contacts | Until dealer requests deletion or account is closed | Anonymize buyer data, retain aggregate stats |
| Follow-up reminders (completed) | 90 days after completion | Delete |

---

*End of Sections 19 & 20. Next: Section 21 -- Analytics & Business Intelligence.*
