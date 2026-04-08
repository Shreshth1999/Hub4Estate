// ============================================
// @hub4estate/shared-types — Barrel Export
// ============================================

// User Management
export {
  UserRole,
  UserStatus,
  ProfVerificationStatus,
} from './user.types';
export type {
  User,
  ProfessionalProfile,
  ProfessionalDocument,
  OTP,
  UserPreference,
  SavedProduct,
  RefreshToken,
  PasswordResetToken,
} from './user.types';

// Dealer Management
export {
  DealerStatus,
  DealerType,
  DealerTier,
  SubscriptionStatus,
} from './dealer.types';
export type {
  Dealer,
  DealerServiceArea,
  DealerReview,
  DealerBrandMapping,
  DealerCategoryMapping,
  DealerScore,
  SubscriptionPlan,
  DealerSubscription,
  LeadCreditTransaction,
} from './dealer.types';

// Product Catalog & Pricing
export type {
  Category,
  SubCategory,
  ProductType,
  Brand,
  Product,
  PriceDataPoint,
  PriceTrend,
  PredictedPrice,
  ScrapedPricePoint,
  CommodityPrice,
} from './product.types';

// Product Inquiries & Pipeline
export {
  PipelineStatus,
  QuoteResponseStatus,
  ContactMethod,
  BrandDealerSource,
} from './inquiry.types';
export type {
  ProductInquiry,
  InquiryDealerResponse,
  InquiryPipeline,
  BrandDealer,
  InquiryDealerQuote,
} from './inquiry.types';

// RFQ & Quotes
export {
  RFQStatus,
  QuoteStatus,
} from './rfq.types';
export type {
  RFQ,
  RFQItem,
  Quote,
  QuoteItem,
} from './rfq.types';

// Payments & Invoices
export {
  PaymentStatus,
} from './payment.types';
export type {
  Payment,
  Invoice,
} from './payment.types';

// Messaging
export {
  MessageType,
} from './message.types';
export type {
  Conversation,
  ConversationParticipant,
  Message,
} from './message.types';

// Community & Knowledge
export {
  PostStatus,
} from './community.types';
export type {
  CommunityPost,
  CommunityComment,
  CommunityVote,
  KnowledgeArticle,
} from './community.types';

// Notifications
export type {
  Notification,
  DevicePushToken,
} from './notification.types';

// AI & Agentic Systems
export {
  AgentType,
  AgentSessionStatus,
  NegotiationStatus,
  NegotiationStrategy,
} from './ai.types';
export type {
  AgentSession,
  AgentMessage,
  AITokenUsage,
  AICache,
  NegotiationSession,
  NegotiationRound,
  ChatSession,
  ChatMessage,
} from './ai.types';

// Admin, Audit & Security
export {
  AuditAction,
  ActivityType,
} from './admin.types';
export type {
  Admin,
  AuditLog,
  FraudFlag,
  UserActivity,
  PlatformSetting,
  FeatureFlag,
  ContactSubmission,
  EmailTemplate,
} from './admin.types';

// Search
export type {
  SearchHistory,
} from './search.types';

// CRM
export {
  CompanyType,
  CompanySegment,
  OutreachType,
  OutreachStatus,
} from './crm.types';
export type {
  CRMCompany,
  CRMContact,
  CRMOutreach,
  CRMMeeting,
  CRMPipelineStage,
} from './crm.types';

// Scraping System
export {
  ScrapeStatus,
} from './scraping.types';
export type {
  ScrapeBrand,
  ScrapeJob,
  ScrapedProduct,
  ScrapeMapping,
  ScrapeTemplate,
} from './scraping.types';

// API Utilities
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  ApiValidationError,
  PaginationParams,
  SearchParams,
} from './api.types';
