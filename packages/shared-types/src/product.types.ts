// ============================================
// Product Catalog Types
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;

  // SEO & Education
  seoTitle: string | null;
  seoDescription: string | null;
  /** Explanation text: what is this category */
  whatIsIt: string | null;
  /** Where in the house this is used */
  whereUsed: string | null;
  whyQualityMatters: string | null;
  commonMistakes: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductType {
  id: string;
  subCategoryId: string;
  name: string;
  slug: string;
  description: string | null;
  /** JSON string with technical details */
  technicalInfo: string | null;
  /** JSON array of use cases */
  useCases: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
  isPremium: boolean;
  /** Budget, Mid-range, or Premium */
  priceSegment: string | null;
  /** 1-5 quality rating */
  qualityRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  productTypeId: string;
  brandId: string;
  name: string;
  modelNumber: string | null;
  sku: string | null;
  description: string | null;

  /** JSON string: voltage, load, material, compliance standards, etc. */
  specifications: string | null;

  /** Array of image URLs */
  images: string[];
  datasheetUrl: string | null;
  manualUrl: string | null;

  /** e.g. ["ISI", "IEC"] */
  certifications: string[];
  warrantyYears: number | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// Price Intelligence Types
// ============================================

export interface PriceDataPoint {
  id: string;
  productId: string | null;
  brandId: string | null;
  categoryId: string | null;
  city: string | null;
  /** dealer_quote, scrape_amazon, scrape_flipkart, manual */
  source: string;
  /** Price in paise */
  pricePaise: number;
  /** MRP in paise */
  mrpPaise: number | null;
  /** e.g. "piece" */
  unit: string;
  dealerId: string | null;
  sourceUrl: string | null;
  createdAt: string;
}

export interface PriceTrend {
  id: string;
  productId: string | null;
  categoryId: string | null;
  city: string | null;
  /** "weekly" or "monthly" */
  period: string;
  avgPricePaise: number;
  minPricePaise: number;
  maxPricePaise: number;
  medianPricePaise: number;
  /** 25th percentile price in paise */
  p25PricePaise: number;
  /** 75th percentile price in paise */
  p75PricePaise: number;
  quoteCount: number;
  /** "up", "down", or "stable" */
  trendDirection: string | null;
  changePercent: number | null;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface PredictedPrice {
  id: string;
  productId: string;
  city: string;
  /** Predicted price in paise */
  predictedPaise: number;
  /** Lower bound of confidence interval in paise */
  confidenceLow: number;
  /** Upper bound of confidence interval in paise */
  confidenceHigh: number;
  /** 0-1 confidence score */
  confidenceScore: number;
  /** Model version identifier, e.g. "xgboost_v1" */
  model: string;
  /** JSON string: input features used for prediction */
  features: string | null;
  /** "buy_now", "wait", or "neutral" */
  recommendation: string | null;
  validUntil: string;
  createdAt: string;
}

export interface ScrapedPricePoint {
  id: string;
  /** amazon, flipkart, indiamart, brand_website */
  source: string;
  sourceUrl: string | null;
  sourceProductId: string | null;
  contentHash: string | null;
  productName: string;
  brandName: string | null;
  modelNumber: string | null;
  categorySlug: string | null;
  /** Price in paise */
  pricePaise: number;
  /** MRP in paise */
  mrpPaise: number | null;
  unit: string;
  currency: string;
  city: string | null;
  sellerName: string | null;
  inStock: boolean | null;
  /** JSON string of raw scraped data */
  rawData: string | null;
  scrapedAt: string;
  lastSeenAt: string;
  isUpdate: boolean;
}

export interface CommodityPrice {
  id: string;
  /** copper, aluminum, steel, pvc */
  commodity: string;
  /** mcx, lme, government_portal */
  source: string;
  /** Price in paise */
  pricePaise: number;
  /** kg, ton, meter */
  unit: string;
  currency: string;
  /** Date only (YYYY-MM-DD) */
  date: string;
  createdAt: string;
}
