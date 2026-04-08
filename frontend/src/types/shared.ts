// =============================================================================
// Hub4Estate — Shared TypeScript Types
// Mirrors backend Prisma schema for full type safety across the stack.
// =============================================================================

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole =
  | 'INDIVIDUAL_HOME_BUILDER'
  | 'RENOVATION_HOMEOWNER'
  | 'ARCHITECT'
  | 'INTERIOR_DESIGNER'
  | 'CONTRACTOR'
  | 'ELECTRICIAN'
  | 'SMALL_BUILDER'
  | 'DEVELOPER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type ProfVerificationStatus =
  | 'NOT_APPLIED'
  | 'PENDING_DOCUMENTS'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED';

export type DealerStatus =
  | 'PENDING_VERIFICATION'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'DELETED';

export type DealerType =
  | 'RETAILER'
  | 'DISTRIBUTOR'
  | 'SYSTEM_INTEGRATOR'
  | 'CONTRACTOR'
  | 'OEM_PARTNER'
  | 'WHOLESALER';

export type DealerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type RFQStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'QUOTES_RECEIVED'
  | 'DEALER_SELECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type QuoteStatus = 'SUBMITTED' | 'SELECTED' | 'REJECTED' | 'EXPIRED';

export type PostStatus = 'PUBLISHED' | 'HIDDEN' | 'DELETED';

export type AuditAction =
  | 'DEALER_VERIFIED'
  | 'DEALER_REJECTED'
  | 'DEALER_SUSPENDED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'CATEGORY_CREATED'
  | 'USER_SUSPENDED'
  | 'RFQ_FLAGGED'
  | 'QUOTE_FLAGGED'
  | 'PAYMENT_PROCESSED'
  | 'SUBSCRIPTION_CHANGED'
  | 'CONVERSATION_FLAGGED'
  | 'ADMIN_SETTING_CHANGED'
  | 'FEATURE_FLAG_TOGGLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'GRACE_PERIOD';

export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM' | 'TOOL_RESULT';

export type NegotiationStatus =
  | 'INIT'
  | 'ANALYZING'
  | 'COUNTER_OFFER_BUYER'
  | 'WAITING_DEALER'
  | 'COUNTER_OFFER_DEALER'
  | 'WAITING_BUYER'
  | 'AGREEMENT'
  | 'HUMAN_APPROVAL'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'ABORTED'
  | 'TIMED_OUT';

export type NegotiationStrategy =
  | 'AGGRESSIVE'
  | 'BALANCED'
  | 'RELATIONSHIP_PRESERVING';

export type AgentType =
  | 'PROCUREMENT_COPILOT'
  | 'NEGOTIATION'
  | 'CHAT'
  | 'BOQ_GENERATOR'
  | 'PRICE_PREDICTOR'
  | 'CONVERSATION_INTEL';

export type AgentSessionStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type PipelineStatus =
  | 'BRAND_IDENTIFIED'
  | 'DEALERS_FOUND'
  | 'QUOTES_REQUESTED'
  | 'QUOTES_RECEIVED'
  | 'SENT_TO_CUSTOMER'
  | 'CLOSED';

export type QuoteResponseStatus =
  | 'PENDING'
  | 'CONTACTED'
  | 'QUOTED'
  | 'NO_RESPONSE'
  | 'DECLINED';

export type ContactMethod = 'WHATSAPP' | 'CALL' | 'EMAIL' | 'SMS';

export type BrandDealerSource = 'MANUAL' | 'SCRAPED' | 'BRAND_WEBSITE' | 'PLATFORM_DEALER';

export type CompanyType =
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'DEALER'
  | 'BRAND'
  | 'OTHER';

export type CompanySegment = 'PREMIUM' | 'MID_RANGE' | 'BUDGET' | 'ALL_SEGMENTS';

export type OutreachType =
  | 'EMAIL'
  | 'LINKEDIN'
  | 'PHONE_CALL'
  | 'MEETING'
  | 'WHATSAPP'
  | 'OTHER';

export type OutreachStatus =
  | 'SCHEDULED'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'REPLIED'
  | 'MEETING_SCHEDULED'
  | 'NOT_INTERESTED'
  | 'BOUNCED'
  | 'FAILED';

export type ScrapeStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export type ActivityType =
  // Auth events
  | 'USER_SIGNUP'
  | 'USER_LOGIN'
  | 'USER_GOOGLE_SIGNIN'
  | 'USER_GOOGLE_SIGNUP'
  | 'USER_PROFILE_COMPLETED'
  | 'USER_OTP_REQUESTED'
  | 'USER_OTP_VERIFIED'
  // Dealer events
  | 'DEALER_REGISTERED'
  | 'DEALER_LOGIN'
  | 'DEALER_PROFILE_UPDATED'
  | 'DEALER_DOCUMENT_UPLOADED'
  | 'DEALER_DOCUMENT_DELETED'
  | 'DEALER_BRAND_ADDED'
  | 'DEALER_CATEGORY_ADDED'
  | 'DEALER_SERVICE_AREA_ADDED'
  | 'DEALER_SERVICE_AREA_REMOVED'
  | 'DEALER_VERIFIED'
  | 'DEALER_REJECTED'
  // Product events
  | 'PRODUCT_INQUIRY_SUBMITTED'
  | 'PRODUCT_IMAGE_UPLOADED'
  | 'MODEL_NUMBER_SUBMITTED'
  | 'PRODUCT_SAVED'
  | 'PRODUCT_SEARCHED'
  // RFQ events
  | 'RFQ_CREATED'
  | 'RFQ_PUBLISHED'
  | 'RFQ_CANCELLED'
  // Quote events
  | 'QUOTE_SUBMITTED'
  | 'QUOTE_SELECTED'
  // Community events
  | 'POST_CREATED'
  | 'COMMENT_CREATED'
  | 'POST_UPVOTED'
  // Contact events
  | 'CONTACT_FORM_SUBMITTED'
  // Chat events
  | 'CHAT_SESSION_STARTED'
  | 'CHAT_MESSAGE_SENT'
  // Admin events
  | 'ADMIN_LOGIN';

// =============================================================================
// CORE ENTITY INTERFACES
// =============================================================================

// --- User Management ---

export interface User {
  id: string;
  email?: string;
  googleId?: string;
  phone?: string;
  name: string;
  role?: UserRole;
  city?: string;
  purpose?: string;
  status: UserStatus;
  profileImage?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  profVerificationStatus: ProfVerificationStatus;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, included when API joins)
  professionalProfile?: ProfessionalProfile;
  rfqs?: RFQ[];
  communityPosts?: CommunityPost[];
  savedProducts?: SavedProduct[];
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  businessName?: string;
  registrationNo?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  officeAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  yearsExperience?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  documents?: ProfessionalDocument[];
}

export interface ProfessionalDocument {
  id: string;
  profileId: string;
  docType: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

// --- Dealer Management ---

export interface Dealer {
  id: string;
  email: string;
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
  yearsInOperation?: number;
  gstDocument?: string;
  panDocument?: string;
  shopLicense?: string;
  cancelledCheque?: string;
  shopPhoto?: string;
  shopImages: string[];
  brandAuthProofs: string[];
  description?: string;
  establishedYear?: number;
  certifications: string[];
  website?: string;
  onboardingStep: number;
  profileComplete: boolean;
  status: DealerStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  totalRFQsReceived: number;
  totalQuotesSubmitted: number;
  totalConversions: number;
  conversionRate: number;
  avgResponseTime?: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  brandMappings?: DealerBrandMapping[];
  categoryMappings?: DealerCategoryMapping[];
  serviceAreas?: DealerServiceArea[];
  quotes?: Quote[];
  reviews?: DealerReview[];
  inquiryResponses?: InquiryDealerResponse[];
  score?: DealerScore;
  subscription?: DealerSubscription;
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
  rating: number;
  comment?: string;
  createdAt: string;
  // Relations
  dealer?: Dealer;
}

export interface DealerBrandMapping {
  id: string;
  dealerId: string;
  brandId: string;
  authProofUrl?: string;
  isVerified: boolean;
  createdAt: string;
  // Relations
  dealer?: Dealer;
  brand?: Brand;
}

export interface DealerCategoryMapping {
  id: string;
  dealerId: string;
  categoryId: string;
  createdAt: string;
  // Relations
  dealer?: Dealer;
  category?: Category;
}

export interface DealerScore {
  id: string;
  dealerId: string;
  responseSpeed: number;
  priceCompetitiveness: number;
  reliability: number;
  volume: number;
  compositeScore: number;
  tier: DealerTier;
  totalQuotes: number;
  totalWins: number;
  avgResponseMinutes?: number;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  dealer?: Dealer;
}

// --- Product Catalog ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  whatIsIt?: string;
  whereUsed?: string;
  whyQualityMatters?: string;
  commonMistakes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  subCategories?: SubCategory[];
  // Computed (returned by some API endpoints)
  productCount?: number;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  category?: Category;
  productTypes?: ProductType[];
}

export interface ProductType {
  id: string;
  subCategoryId: string;
  name: string;
  slug: string;
  description?: string;
  technicalInfo?: string;
  useCases?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  subCategory?: SubCategory;
  products?: Product[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  isPremium: boolean;
  priceSegment?: string;
  qualityRating?: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  products?: Product[];
}

export interface Product {
  id: string;
  productTypeId: string;
  brandId: string;
  name: string;
  modelNumber?: string;
  sku?: string;
  description?: string;
  specifications?: string; // JSON string
  images: string[];
  datasheetUrl?: string;
  manualUrl?: string;
  certifications: string[];
  warrantyYears?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  productType?: ProductType;
  brand?: Brand;
}

export interface SavedProduct {
  id: string;
  userId: string;
  productId: string;
  notes?: string;
  createdAt: string;
  // Relations
  user?: User;
  product?: Product;
}

// --- RFQ System ---

export interface RFQ {
  id: string;
  userId: string;
  title: string;
  description?: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryAddress?: string;
  estimatedDate?: string;
  deliveryPreference: string;
  urgency?: string;
  status: RFQStatus;
  publishedAt?: string;
  selectedDealerId?: string;
  selectedQuoteId?: string;
  completedAt?: string;
  aiSuggestions?: string; // JSON string
  aiFlags?: string; // JSON string
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  items?: RFQItem[];
  quotes?: Quote[];
}

export interface RFQItem {
  id: string;
  rfqId: string;
  productId: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  // Relations
  rfq?: RFQ;
  product?: Product;
}

// --- Quote System ---

export interface Quote {
  id: string;
  rfqId: string;
  dealerId: string;
  totalAmount: number;
  shippingCost: number;
  notes?: string;
  deliveryDate?: string;
  pickupDate?: string;
  validUntil: string;
  status: QuoteStatus;
  submittedAt: string;
  viewedAt?: string;
  selectedAt?: string;
  lossReason?: string;
  rankPosition?: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  rfq?: RFQ;
  dealer?: Dealer;
  items?: QuoteItem[];
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

// --- Product Inquiry System ---

export interface ProductInquiry {
  id: string;
  inquiryNumber?: string;
  name: string;
  phone: string;
  email?: string;
  productPhoto?: string;
  modelNumber?: string;
  quantity: number;
  deliveryCity: string;
  notes?: string;
  status: string;
  assignedTo?: string;
  internalNotes?: string;
  quotedPrice?: number;
  shippingCost?: number;
  totalPrice?: number;
  estimatedDelivery?: string;
  responseNotes?: string;
  respondedAt?: string;
  respondedBy?: string;
  categoryId?: string;
  identifiedBrandId?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  pipeline?: InquiryPipeline;
  category?: Category;
  identifiedBrand?: Brand;
  dealerResponses?: InquiryDealerResponse[];
}

export interface InquiryDealerResponse {
  id: string;
  inquiryId: string;
  dealerId: string;
  status: string;
  quotedPrice?: number;
  shippingCost?: number;
  totalPrice?: number;
  estimatedDelivery?: string;
  notes?: string;
  viewedAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  inquiry?: ProductInquiry;
  dealer?: Dealer;
}

// --- Inquiry Pipeline ---

export interface InquiryPipeline {
  id: string;
  inquiryId: string;
  identifiedBrandId?: string;
  identifiedBrand?: string;
  identifiedProduct?: string;
  identifiedCategory?: string;
  status: PipelineStatus;
  aiAnalysis?: string; // JSON string
  sentToCustomerAt?: string;
  sentVia?: string;
  customerMessage?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  inquiry?: ProductInquiry;
  dealerQuotes?: InquiryDealerQuote[];
}

export interface InquiryDealerQuote {
  id: string;
  pipelineId: string;
  brandDealerId?: string;
  dealerId?: string;
  dealerName: string;
  dealerPhone: string;
  dealerShopName?: string;
  dealerCity?: string;
  contactMethod: ContactMethod;
  contactedAt?: string;
  whatsappMessage?: string;
  quotedPrice?: number;
  shippingCost?: number;
  totalQuotedPrice?: number;
  deliveryDays?: number;
  warrantyInfo?: string;
  quoteNotes?: string;
  responseStatus: QuoteResponseStatus;
  createdAt: string;
  updatedAt: string;
  // Relations
  pipeline?: InquiryPipeline;
  brandDealer?: BrandDealer;
}

export interface BrandDealer {
  id: string;
  brandId: string;
  name: string;
  shopName?: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  city: string;
  state?: string;
  pincode?: string;
  address?: string;
  source: BrandDealerSource;
  sourceUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  brand?: Brand;
  inquiryQuotes?: InquiryDealerQuote[];
}

// --- Community & Knowledge ---

export interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  city?: string;
  category?: string;
  tags: string[];
  upvotes: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  comments?: CommunityComment[];
  // Computed
  commentCount?: number;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  post?: CommunityPost;
  user?: User;
  parent?: CommunityComment;
  replies?: CommunityComment[];
}

export interface CommunityVote {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  value: number;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  coverImage?: string;
  views: number;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// --- AI Chat Sessions ---

export interface ChatSession {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  title?: string;
  status: string;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  tokenCount?: number;
  createdAt: string;
}

// --- AI / Agentic Systems ---

export interface AgentSession {
  id: string;
  userId?: string;
  dealerId?: string;
  agentType: AgentType;
  status: AgentSessionStatus;
  context?: string; // JSON string
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  messages?: AgentMessage[];
  negotiation?: NegotiationSession;
}

export interface AgentMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  toolName?: string;
  toolInput?: string; // JSON string
  toolOutput?: string; // JSON string
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  createdAt: string;
}

export interface AITokenUsage {
  id: string;
  userId?: string;
  dealerId?: string;
  agentType: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheHit: boolean;
  latencyMs?: number;
  costUsd?: number;
  sessionId?: string;
  createdAt: string;
}

export interface AICache {
  id: string;
  promptHash: string;
  agentType: string;
  model: string;
  response: string;
  expiresAt: string;
  createdAt: string;
}

// --- Negotiation System ---

export interface NegotiationSession {
  id: string;
  inquiryId?: string;
  quoteId?: string;
  buyerId?: string;
  dealerId?: string;
  agentSessionId?: string;
  status: NegotiationStatus;
  strategy: NegotiationStrategy;
  buyerBatna?: number;
  dealerBatna?: number;
  zopaMin?: number;
  zopaMax?: number;
  nashPrice?: number;
  targetPrice?: number;
  walkawayPrice?: number;
  maxRounds: number;
  currentRound: number;
  initialQuotePrice?: number;
  finalAgreedPrice?: number;
  savingsAmount?: number;
  savingsPercent?: number;
  timeoutAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  agentSession?: AgentSession;
  rounds?: NegotiationRound[];
}

export interface NegotiationRound {
  id: string;
  negotiationId: string;
  roundNumber: number;
  offeredBy: string;
  offeredPrice: number;
  offeredDeliveryDays?: number;
  justification?: string;
  strategyUsed?: string;
  response?: string;
  responseAt?: string;
  responseMessage?: string;
  agentReasoning?: string; // JSON string
  createdAt: string;
}

// --- Messaging System ---

export interface Conversation {
  id: string;
  title?: string;
  type: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  participants?: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  accountId: string;
  accountType: string;
  lastReadAt?: string;
  isMuted: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  type: MessageType;
  content: string;
  metadata?: string; // JSON string
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Notifications ---

export interface Notification {
  id: string;
  userId: string;
  userType: string;
  title: string;
  body: string;
  data?: string; // JSON string
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface DevicePushToken {
  id: string;
  token: string;
  userId: string;
  userType: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Payment & Invoices ---

export interface Payment {
  id: string;
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // In paise
  currency: string;
  status: PaymentStatus;
  method?: string;
  payerAccountId: string;
  payerAccountType: string;
  description?: string;
  metadata?: string; // JSON string
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  invoice?: Invoice;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  buyerName: string;
  buyerGstin?: string;
  buyerAddress?: string;
  sellerName: string;
  sellerGstin: string;
  items: string; // JSON string — line items array
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
  sacCode: string;
  isInterState: boolean;
  pdfUrl?: string;
  createdAt: string;
  // Relations
  payment?: Payment;
}

// --- Dealer Subscriptions ---

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  priceMonthlyPaise: number;
  priceYearlyPaise?: number;
  leadsPerMonth: number;
  quotesPerMonth: number;
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
  razorpaySubId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  cancelReason?: string;
  leadsUsed: number;
  quotesUsed: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  dealer?: Dealer;
  plan?: SubscriptionPlan;
}

export interface LeadCreditTransaction {
  id: string;
  dealerId: string;
  amount: number;
  type: string;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

// --- Price Intelligence ---

export interface PriceDataPoint {
  id: string;
  productId?: string;
  brandId?: string;
  categoryId?: string;
  city?: string;
  source: string;
  pricePaise: number;
  mrpPaise?: number;
  unit: string;
  dealerId?: string;
  sourceUrl?: string;
  createdAt: string;
}

export interface PriceTrend {
  id: string;
  productId?: string;
  categoryId?: string;
  city?: string;
  period: string;
  avgPricePaise: number;
  minPricePaise: number;
  maxPricePaise: number;
  medianPricePaise: number;
  p25PricePaise: number;
  p75PricePaise: number;
  quoteCount: number;
  trendDirection?: string;
  changePercent?: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface PredictedPrice {
  id: string;
  productId: string;
  city: string;
  predictedPaise: number;
  confidenceLow: number;
  confidenceHigh: number;
  confidenceScore: number;
  model: string;
  features?: string; // JSON string
  recommendation?: string;
  validUntil: string;
  createdAt: string;
}

export interface ScrapedPricePoint {
  id: string;
  source: string;
  sourceUrl?: string;
  sourceProductId?: string;
  contentHash?: string;
  productName: string;
  brandName?: string;
  modelNumber?: string;
  categorySlug?: string;
  pricePaise: number;
  mrpPaise?: number;
  unit: string;
  currency: string;
  city?: string;
  sellerName?: string;
  inStock?: boolean;
  rawData?: string; // JSON string
  scrapedAt: string;
  lastSeenAt: string;
  isUpdate: boolean;
}

export interface CommodityPrice {
  id: string;
  commodity: string;
  source: string;
  pricePaise: number;
  unit: string;
  currency: string;
  date: string;
  createdAt: string;
}

// --- Admin & Audit ---

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  performedBy: string;
  details?: string; // JSON string
  createdAt: string;
}

export interface FraudFlag {
  id: string;
  entityType: string;
  entityId: string;
  flagType: string;
  severity: string;
  description: string;
  status: string;
  flaggedBy?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Contact & CRM ---

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  message: string;
  source: string;
  status: string;
  assignedTo?: string;
  notes?: string;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMCompany {
  id: string;
  name: string;
  slug: string;
  type: CompanyType;
  segment: CompanySegment;
  website?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  description?: string;
  productCategories: string[];
  yearEstablished?: number;
  employeeCount?: string;
  annualRevenue?: string;
  hasApi: boolean;
  digitalMaturity?: string;
  dealerNetworkSize?: string;
  status: string;
  priority: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  contacts?: CRMContact[];
  outreaches?: CRMOutreach[];
}

export interface CRMContact {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  designation?: string;
  department?: string;
  decisionMaker: boolean;
  isPrimary: boolean;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  company?: CRMCompany;
  outreaches?: CRMOutreach[];
}

export interface CRMOutreach {
  id: string;
  companyId: string;
  contactId?: string;
  type: OutreachType;
  subject?: string;
  content: string;
  templateUsed?: string;
  scheduledAt?: string;
  sentAt?: string;
  status: OutreachStatus;
  openedAt?: string;
  repliedAt?: string;
  responseContent?: string;
  responseSentiment?: string;
  followUpDate?: string;
  followUpNumber: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  company?: CRMCompany;
  contact?: CRMContact;
}

export interface CRMMeeting {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  meetingLink?: string;
  location?: string;
  attendees?: string; // JSON string
  status: string;
  agenda?: string;
  notes?: string;
  outcome?: string;
  nextSteps?: string;
  reminders?: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface CRMPipelineStage {
  id: string;
  name: string;
  displayName: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Email Templates ---

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  placeholders: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Scraping System ---

export interface ScrapeBrand {
  id: string;
  name: string;
  slug: string;
  website: string;
  logoUrl?: string;
  isActive: boolean;
  scrapeFrequency: string;
  lastScrapedAt?: string;
  nextScrapeAt?: string;
  catalogUrls?: string; // JSON string
  selectors?: string; // JSON string
  totalProducts: number;
  lastScrapeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapeJob {
  id: string;
  brandId: string;
  status: ScrapeStatus;
  startedAt?: string;
  completedAt?: string;
  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  errors: number;
  logs?: string; // JSON string
  errorDetails?: string; // JSON string
  configSnapshot?: string; // JSON string
  createdAt: string;
  updatedAt: string;
  // Relations
  brand?: ScrapeBrand;
}

export interface ScrapedProduct {
  id: string;
  brandId: string;
  sourceUrl: string;
  scrapedAt: string;
  rawName: string;
  rawCategory?: string;
  rawSubCategory?: string;
  rawModelNumber?: string;
  rawSku?: string;
  rawDescription?: string;
  rawSpecifications?: string; // JSON string
  rawImages: string[];
  rawDatasheetUrl?: string;
  rawManualUrl?: string;
  rawPrice?: string;
  rawCertifications: string[];
  rawWarranty?: string;
  isProcessed: boolean;
  processedAt?: string;
  productId?: string;
  isValid: boolean;
  validationErrors?: string; // JSON string
  contentHash?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  brand?: ScrapeBrand;
}

export interface ScrapeMapping {
  id: string;
  brandPattern?: string;
  categoryPattern?: string;
  namePattern?: string;
  targetCategoryId?: string;
  targetSubCategoryId?: string;
  targetProductTypeId?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapeTemplate {
  id: string;
  name: string;
  description?: string;
  selectors: string; // JSON string
  brandIds: string[];
  createdAt: string;
  updatedAt: string;
}

// --- User Activity & Preferences ---

export interface UserActivity {
  id: string;
  actorType: string;
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  activityType: ActivityType;
  description: string;
  metadata?: string; // JSON string
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  language: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  notifyPush: boolean;
  marketingEmails: boolean;
  analyticsConsent: boolean;
  thirdPartyConsent: boolean;
  digestFrequency: string;
  createdAt: string;
  updatedAt: string;
}

// --- Platform Settings ---

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  description?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercent: number;
  targetRoles: string[];
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Search ---

export interface SearchHistory {
  id: string;
  userId?: string;
  query: string;
  filters?: string; // JSON string
  resultCount: number;
  clickedId?: string;
  sessionId?: string;
  createdAt: string;
}

// --- Auth Tokens (rarely sent to frontend, but typed for admin views) ---

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  userType: string;
  revoked: boolean;
  revokedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface OTP {
  id: string;
  identifier: string;
  type: string;
  expiresAt: string;
  verified: boolean;
  attempts: number;
  createdAt: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  code?: string;
}

export interface ApiSuccess<T = void> {
  success: true;
  data?: T;
  message?: string;
}

/** Generic envelope used by most API endpoints */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================================================
// FORM / REQUEST TYPES
// =============================================================================

export interface CreateInquiryRequest {
  name: string;
  phone: string;
  email?: string;
  productPhoto?: string;
  modelNumber?: string;
  quantity?: number;
  deliveryCity: string;
  notes?: string;
  categoryId?: string;
}

export interface SubmitQuoteRequest {
  rfqId: string;
  dealerId: string;
  totalAmount: number;
  shippingCost?: number;
  notes?: string;
  deliveryDate?: string;
  pickupDate?: string;
  validUntil: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface DealerRegistrationRequest {
  email: string;
  password: string;
  ownerName: string;
  businessName: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  dealerType?: DealerType;
}

export interface CreateRFQRequest {
  title: string;
  description?: string;
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryAddress?: string;
  estimatedDate?: string;
  deliveryPreference: string;
  urgency?: string;
}

export interface UserRegistrationRequest {
  name: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  city?: string;
  purpose?: string;
}

export interface UserLoginRequest {
  email?: string;
  phone?: string;
  googleIdToken?: string;
}

export interface OTPVerifyRequest {
  identifier: string;
  code: string;
  type: string;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  role: string;
  message: string;
}

export interface CreateCommunityPostRequest {
  title: string;
  content: string;
  city?: string;
  category?: string;
  tags?: string[];
}

export interface CreateCommunityCommentRequest {
  postId: string;
  content: string;
  parentId?: string;
}

export interface DealerOnboardingUpdateRequest {
  onboardingStep: number;
  // Step-specific fields
  description?: string;
  establishedYear?: number;
  certifications?: string[];
  website?: string;
  yearsInOperation?: number;
  brandIds?: string[];
  categoryIds?: string[];
  serviceAreaPincodes?: string[];
}

export interface InquiryDealerQuoteRequest {
  pipelineId: string;
  brandDealerId?: string;
  dealerId?: string;
  dealerName: string;
  dealerPhone: string;
  dealerShopName?: string;
  dealerCity?: string;
  contactMethod?: ContactMethod;
  whatsappMessage?: string;
}

export interface UpdateInquiryStatusRequest {
  status: string;
  assignedTo?: string;
  internalNotes?: string;
  quotedPrice?: number;
  shippingCost?: number;
  totalPrice?: number;
  estimatedDelivery?: string;
  responseNotes?: string;
}

// =============================================================================
// DASHBOARD STAT TYPES
// =============================================================================

export interface AdminDashboardStats {
  totalUsers: number;
  totalDealers: number;
  verifiedDealers: number;
  pendingDealers: number;
  totalInquiries: number;
  activeInquiries: number;
  totalProducts: number;
  totalCategories: number;
  totalRFQs: number;
  totalQuotes: number;
  totalRevenuePaise: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    entityId?: string;
    entityType?: string;
  }>;
}

export interface DealerDashboardStats {
  totalQuotes: number;
  acceptedQuotes: number;
  pendingQuotes: number;
  winRate: number;
  activeInquiries: number;
  creditsRemaining: number;
  revenueThisMonth: number;
  tier: DealerTier;
  compositeScore: number;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: string;
  leadsUsed: number;
  leadsTotal: number;
}

export interface UserDashboardStats {
  totalInquiries: number;
  activeInquiries: number;
  totalRFQs: number;
  activeRFQs: number;
  savedProducts: number;
  totalSavings: number;
  recentInquiries: ProductInquiry[];
  recentRFQs: RFQ[];
}

// =============================================================================
// SEARCH & FILTER TYPES
// =============================================================================

export interface ProductSearchFilters {
  query?: string;
  categoryId?: string;
  subCategoryId?: string;
  productTypeId?: string;
  brandId?: string;
  brandIds?: string[];
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'brand';
  sortOrder?: 'asc' | 'desc';
}

export interface DealerSearchFilters {
  query?: string;
  city?: string;
  state?: string;
  status?: DealerStatus;
  dealerType?: DealerType;
  tier?: DealerTier;
  brandId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'businessName' | 'conversionRate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InquirySearchFilters {
  query?: string;
  status?: string;
  categoryId?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'status' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface RFQSearchFilters {
  userId?: string;
  status?: RFQStatus;
  deliveryCity?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Make selected fields required from a partial interface */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/** Extract the data type from a paginated response */
export type PaginatedData<T> = T extends PaginatedResponse<infer U> ? U : never;

/** Common ID-name pair used in dropdowns */
export interface SelectOption {
  id: string;
  name: string;
  slug?: string;
}

/** Auth token pair returned after login */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userType: 'user' | 'dealer' | 'admin';
}

/** Authenticated session context */
export interface AuthSession {
  user?: User;
  dealer?: Dealer;
  admin?: Admin;
  tokens: AuthTokens;
}
