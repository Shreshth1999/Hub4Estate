// ============================================
// Product Scraping System Types
// ============================================

export enum ScrapeStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

export interface ScrapeBrand {
  id: string;
  name: string;
  slug: string;
  website: string;
  logoUrl: string | null;

  isActive: boolean;
  /** daily, weekly, monthly */
  scrapeFrequency: string;
  lastScrapedAt: string | null;
  nextScrapeAt: string | null;

  /** JSON string: array of category URLs to scrape */
  catalogUrls: string | null;
  /** JSON string: CSS selectors for product data extraction */
  selectors: string | null;

  totalProducts: number;
  lastScrapeCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface ScrapeJob {
  id: string;
  brandId: string;

  status: ScrapeStatus;
  startedAt: string | null;
  completedAt: string | null;

  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  errors: number;

  /** JSON string: array of log entries */
  logs: string | null;
  /** JSON string: array of error details */
  errorDetails: string | null;
  /** JSON string: snapshot of selectors used for this job */
  configSnapshot: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ScrapedProduct {
  id: string;
  brandId: string;

  sourceUrl: string;
  scrapedAt: string;

  // Raw data
  rawName: string;
  rawCategory: string | null;
  rawSubCategory: string | null;
  rawModelNumber: string | null;
  rawSku: string | null;
  rawDescription: string | null;
  /** JSON string of all specs */
  rawSpecifications: string | null;
  rawImages: string[];
  rawDatasheetUrl: string | null;
  rawManualUrl: string | null;
  /** MRP if available */
  rawPrice: string | null;
  rawCertifications: string[];
  rawWarranty: string | null;

  isProcessed: boolean;
  processedAt: string | null;
  /** Link to normalized Product if created */
  productId: string | null;

  isValid: boolean;
  /** JSON string: array of validation issues */
  validationErrors: string | null;

  /** Hash of key fields for deduplication */
  contentHash: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ScrapeMapping {
  id: string;
  /** Regex pattern for brand name */
  brandPattern: string | null;
  /** Regex pattern for raw category */
  categoryPattern: string | null;
  /** Regex pattern for product name */
  namePattern: string | null;

  targetCategoryId: string | null;
  targetSubCategoryId: string | null;
  targetProductTypeId: string | null;

  /** Higher priority = checked first */
  priority: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ScrapeTemplate {
  id: string;
  name: string;
  description: string | null;
  /** JSON string of common CSS selectors */
  selectors: string;
  /** Array of brand IDs using this template */
  brandIds: string[];
  createdAt: string;
  updatedAt: string;
}
