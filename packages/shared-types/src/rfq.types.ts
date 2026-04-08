// ============================================
// RFQ & Quote System Types
// ============================================

export enum RFQStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  QUOTES_RECEIVED = 'QUOTES_RECEIVED',
  DEALER_SELECTED = 'DEALER_SELECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum QuoteStatus {
  SUBMITTED = 'SUBMITTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface RFQ {
  id: string;
  userId: string;
  title: string;
  description: string | null;

  // Location & Timeline
  deliveryCity: string;
  deliveryPincode: string;
  deliveryAddress: string | null;
  /** When user needs products */
  estimatedDate: string | null;

  /** "delivery", "pickup", or "both" */
  deliveryPreference: string;
  /** "normal" or "urgent" */
  urgency: string | null;

  status: RFQStatus;
  publishedAt: string | null;
  selectedDealerId: string | null;
  selectedQuoteId: string | null;
  completedAt: string | null;

  /** JSON string with AI suggestions */
  aiSuggestions: string | null;
  /** JSON string with warnings/flags */
  aiFlags: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface RFQItem {
  id: string;
  rfqId: string;
  productId: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
}

export interface Quote {
  id: string;
  rfqId: string;
  dealerId: string;

  totalAmount: number;
  shippingCost: number;
  notes: string | null;

  /** Delivery date for delivery option */
  deliveryDate: string | null;
  /** Pickup date for pickup option */
  pickupDate: string | null;
  /** Quote expiry date */
  validUntil: string;

  status: QuoteStatus;

  // Performance tracking
  submittedAt: string;
  viewedAt: string | null;
  selectedAt: string | null;

  /** Reason this quote lost: price, timing, distance */
  lossReason: string | null;
  /** Where this quote ranked among competing quotes */
  rankPosition: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}
