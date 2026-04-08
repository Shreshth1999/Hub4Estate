// ============================================
// Dealer Management Types
// ============================================

export enum DealerStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum DealerType {
  RETAILER = 'RETAILER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  SYSTEM_INTEGRATOR = 'SYSTEM_INTEGRATOR',
  CONTRACTOR = 'CONTRACTOR',
  OEM_PARTNER = 'OEM_PARTNER',
  WHOLESALER = 'WHOLESALER',
}

export enum DealerTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  GRACE_PERIOD = 'GRACE_PERIOD',
}

export interface Dealer {
  id: string;
  email: string;
  password: string | null;
  businessName: string;
  ownerName: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;

  dealerType: DealerType;
  yearsInOperation: number | null;

  // Verification documents
  gstDocument: string | null;
  panDocument: string | null;
  shopLicense: string | null;
  cancelledCheque: string | null;
  shopPhoto: string | null;
  /** Multiple shop/warehouse/product images */
  shopImages: string[];
  /** Array of brand authorization proof URLs */
  brandAuthProofs: string[];

  // Storefront / public profile
  /** About the shop -- public facing */
  description: string | null;
  /** Year business was established */
  establishedYear: number | null;
  /** e.g. ["ISI Authorized", "Havells Certified Dealer"] */
  certifications: string[];
  /** Optional website URL */
  website: string | null;

  /** Onboarding progress step (1-based) */
  onboardingStep: number;
  profileComplete: boolean;

  status: DealerStatus;
  verificationNotes: string | null;
  verifiedAt: string | null;
  /** Admin ID who verified */
  verifiedBy: string | null;
  rejectionReason: string | null;

  // Performance metrics
  totalRFQsReceived: number;
  totalQuotesSubmitted: number;
  totalConversions: number;
  conversionRate: number;
  /** Average response time in minutes */
  avgResponseTime: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface DealerServiceArea {
  id: string;
  dealerId: string;
  pincode: string;
  createdAt: string;
}

export interface DealerReview {
  id: string;
  dealerId: string;
  userId: string;
  rfqId: string;
  /** 1-5 star rating */
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface DealerBrandMapping {
  id: string;
  dealerId: string;
  brandId: string;
  /** URL to authorization document */
  authProofUrl: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface DealerCategoryMapping {
  id: string;
  dealerId: string;
  categoryId: string;
  createdAt: string;
}

export interface DealerScore {
  id: string;
  dealerId: string;
  /** 0-100 score */
  responseSpeed: number;
  /** 0-100 score */
  priceCompetitiveness: number;
  /** 0-100 score */
  reliability: number;
  /** 0-100 score */
  volume: number;
  /** 0-100 composite score */
  compositeScore: number;
  tier: DealerTier;
  totalQuotes: number;
  totalWins: number;
  avgResponseMinutes: number | null;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  /** Internal name: starter, growth, premium, enterprise */
  name: string;
  displayName: string;
  /** Price in paise (e.g. 99900 = INR 999) */
  priceMonthlyPaise: number;
  /** Yearly price in paise */
  priceYearlyPaise: number | null;
  leadsPerMonth: number;
  quotesPerMonth: number;
  /** Feature list for display */
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealerSubscription {
  id: string;
  dealerId: string;
  planId: string;
  status: SubscriptionStatus;
  /** Razorpay subscription ID */
  razorpaySubId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  leadsUsed: number;
  quotesUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreditTransaction {
  id: string;
  dealerId: string;
  /** Positive = credit, negative = debit */
  amount: number;
  /** purchase, deduction, refund, bonus */
  type: string;
  balanceAfter: number;
  description: string | null;
  /** Payment ID or inquiry ID */
  referenceId: string | null;
  /** "payment" or "inquiry" */
  referenceType: string | null;
  createdAt: string;
}
