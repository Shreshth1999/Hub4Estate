// ============================================
// Product Inquiry Types (Homepage Quick Form)
// ============================================

export enum PipelineStatus {
  BRAND_IDENTIFIED = 'BRAND_IDENTIFIED',
  DEALERS_FOUND = 'DEALERS_FOUND',
  QUOTES_REQUESTED = 'QUOTES_REQUESTED',
  QUOTES_RECEIVED = 'QUOTES_RECEIVED',
  SENT_TO_CUSTOMER = 'SENT_TO_CUSTOMER',
  CLOSED = 'CLOSED',
}

export enum QuoteResponseStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  QUOTED = 'QUOTED',
  NO_RESPONSE = 'NO_RESPONSE',
  DECLINED = 'DECLINED',
}

export enum ContactMethod {
  WHATSAPP = 'WHATSAPP',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum BrandDealerSource {
  MANUAL = 'MANUAL',
  SCRAPED = 'SCRAPED',
  BRAND_WEBSITE = 'BRAND_WEBSITE',
  PLATFORM_DEALER = 'PLATFORM_DEALER',
}

export interface ProductInquiry {
  id: string;
  /** Formatted inquiry number, e.g. HUB-HAVELLS-MCB-0001 */
  inquiryNumber: string | null;
  name: string;
  phone: string;
  email: string | null;
  /** Uploaded image path */
  productPhoto: string | null;
  modelNumber: string | null;
  quantity: number;
  deliveryCity: string;
  notes: string | null;

  /** new, contacted, quoted, closed */
  status: string;
  /** Admin ID assigned to this inquiry */
  assignedTo: string | null;
  internalNotes: string | null;

  // Admin response (quote sent back to user)
  /** Price per unit */
  quotedPrice: number | null;
  /** Shipping charges */
  shippingCost: number | null;
  /** Total including shipping */
  totalPrice: number | null;
  /** e.g. "3-5 business days" */
  estimatedDelivery: string | null;
  responseNotes: string | null;
  respondedAt: string | null;
  /** Admin ID who responded */
  respondedBy: string | null;

  /** Category identification */
  categoryId: string | null;
  identifiedBrandId: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface InquiryDealerResponse {
  id: string;
  inquiryId: string;
  dealerId: string;

  /** pending, viewed, quoted, declined */
  status: string;
  quotedPrice: number | null;
  shippingCost: number | null;
  totalPrice: number | null;
  estimatedDelivery: string | null;
  notes: string | null;

  viewedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** One pipeline per inquiry -- tracks admin workflow for dealer quote automation */
export interface InquiryPipeline {
  id: string;
  inquiryId: string;

  /** AI-identified brand ID */
  identifiedBrandId: string | null;
  /** AI-identified brand name */
  identifiedBrand: string | null;
  /** AI-identified product name/description */
  identifiedProduct: string | null;
  /** AI-identified category */
  identifiedCategory: string | null;

  status: PipelineStatus;

  /** JSON string: brand confidence, product details, WhatsApp template */
  aiAnalysis: string | null;

  /** When the quote was sent to the customer */
  sentToCustomerAt: string | null;
  /** email, sms, both */
  sentVia: string | null;
  customerMessage: string | null;

  /** Admin ID who created this pipeline */
  createdBy: string | null;

  createdAt: string;
  updatedAt: string;
}

/** External dealer contacts (NOT platform-registered dealers) */
export interface BrandDealer {
  id: string;
  brandId: string;

  name: string;
  shopName: string | null;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;

  city: string;
  state: string | null;
  pincode: string | null;
  address: string | null;

  source: BrandDealerSource;
  sourceUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

/** Each dealer contacted for a pipeline */
export interface InquiryDealerQuote {
  id: string;
  pipelineId: string;

  /** External BrandDealer ID */
  brandDealerId: string | null;
  /** Platform dealer ID (no strict FK) */
  dealerId: string | null;

  // Denormalized dealer info (preserved even if dealer is deleted)
  dealerName: string;
  dealerPhone: string;
  dealerShopName: string | null;
  dealerCity: string | null;

  contactMethod: ContactMethod;
  contactedAt: string | null;
  whatsappMessage: string | null;

  // Quote details
  quotedPrice: number | null;
  shippingCost: number | null;
  totalQuotedPrice: number | null;
  deliveryDays: number | null;
  warrantyInfo: string | null;
  quoteNotes: string | null;

  responseStatus: QuoteResponseStatus;

  createdAt: string;
  updatedAt: string;
}
