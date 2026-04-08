// ============================================
// Admin, Audit & Security Types
// ============================================

export enum AuditAction {
  DEALER_VERIFIED = 'DEALER_VERIFIED',
  DEALER_REJECTED = 'DEALER_REJECTED',
  DEALER_SUSPENDED = 'DEALER_SUSPENDED',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  RFQ_FLAGGED = 'RFQ_FLAGGED',
  QUOTE_FLAGGED = 'QUOTE_FLAGGED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  SUBSCRIPTION_CHANGED = 'SUBSCRIPTION_CHANGED',
  CONVERSATION_FLAGGED = 'CONVERSATION_FLAGGED',
  ADMIN_SETTING_CHANGED = 'ADMIN_SETTING_CHANGED',
  FEATURE_FLAG_TOGGLED = 'FEATURE_FLAG_TOGGLED',
}

export enum ActivityType {
  // Auth events
  USER_SIGNUP = 'USER_SIGNUP',
  USER_LOGIN = 'USER_LOGIN',
  USER_GOOGLE_SIGNIN = 'USER_GOOGLE_SIGNIN',
  USER_GOOGLE_SIGNUP = 'USER_GOOGLE_SIGNUP',
  USER_PROFILE_COMPLETED = 'USER_PROFILE_COMPLETED',
  USER_OTP_REQUESTED = 'USER_OTP_REQUESTED',
  USER_OTP_VERIFIED = 'USER_OTP_VERIFIED',

  // Dealer events
  DEALER_REGISTERED = 'DEALER_REGISTERED',
  DEALER_LOGIN = 'DEALER_LOGIN',
  DEALER_PROFILE_UPDATED = 'DEALER_PROFILE_UPDATED',
  DEALER_DOCUMENT_UPLOADED = 'DEALER_DOCUMENT_UPLOADED',
  DEALER_DOCUMENT_DELETED = 'DEALER_DOCUMENT_DELETED',
  DEALER_BRAND_ADDED = 'DEALER_BRAND_ADDED',
  DEALER_CATEGORY_ADDED = 'DEALER_CATEGORY_ADDED',
  DEALER_SERVICE_AREA_ADDED = 'DEALER_SERVICE_AREA_ADDED',
  DEALER_SERVICE_AREA_REMOVED = 'DEALER_SERVICE_AREA_REMOVED',
  DEALER_VERIFIED = 'DEALER_VERIFIED',
  DEALER_REJECTED = 'DEALER_REJECTED',

  // Product events
  PRODUCT_INQUIRY_SUBMITTED = 'PRODUCT_INQUIRY_SUBMITTED',
  PRODUCT_IMAGE_UPLOADED = 'PRODUCT_IMAGE_UPLOADED',
  MODEL_NUMBER_SUBMITTED = 'MODEL_NUMBER_SUBMITTED',
  PRODUCT_SAVED = 'PRODUCT_SAVED',
  PRODUCT_SEARCHED = 'PRODUCT_SEARCHED',

  // RFQ events
  RFQ_CREATED = 'RFQ_CREATED',
  RFQ_PUBLISHED = 'RFQ_PUBLISHED',
  RFQ_CANCELLED = 'RFQ_CANCELLED',

  // Quote events
  QUOTE_SUBMITTED = 'QUOTE_SUBMITTED',
  QUOTE_SELECTED = 'QUOTE_SELECTED',

  // Community events
  POST_CREATED = 'POST_CREATED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  POST_UPVOTED = 'POST_UPVOTED',

  // Contact events
  CONTACT_FORM_SUBMITTED = 'CONTACT_FORM_SUBMITTED',

  // Chat events
  CHAT_SESSION_STARTED = 'CHAT_SESSION_STARTED',
  CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT',

  // Admin events
  ADMIN_LOGIN = 'ADMIN_LOGIN',
}

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  /** "admin" or "super_admin" */
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  /** Entity type: dealer, product, rfq, etc. */
  entityType: string;
  entityId: string;
  /** Admin ID who performed the action */
  performedBy: string;
  /** JSON string with additional info */
  details: string | null;
  createdAt: string;
}

export interface FraudFlag {
  id: string;
  /** Entity type: user, dealer, rfq, quote */
  entityType: string;
  entityId: string;
  /** Flag type: duplicate_gst, fake_quote, spam_rfq, etc. */
  flagType: string;
  /** low, medium, high, critical */
  severity: string;
  description: string;
  /** open, investigating, resolved, false_positive */
  status: string;
  /** System or admin ID */
  flaggedBy: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  /** "user", "dealer", "admin", or "anonymous" */
  actorType: string;
  /** User/Dealer/Admin ID (null for anonymous) */
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  activityType: ActivityType;
  /** Human-readable description */
  description: string;
  /** JSON string: product details, model numbers, image paths, etc. */
  metadata: string | null;
  /** Related entity type: user, dealer, product, rfq, quote, inquiry, etc. */
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  /** "string", "number", "boolean", or "json" */
  type: string;
  description: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  /** 0-100 for gradual rollout */
  rolloutPercent: number;
  /** Empty array means all roles */
  targetRoles: string[];
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  /** homeowner, contractor, dealer, brand, other */
  role: string;
  message: string;
  /** contact_form, ai_assistant, etc. */
  source: string;
  /** new, contacted, qualified, converted, closed */
  status: string;
  /** Admin ID */
  assignedTo: string | null;
  /** Internal notes */
  notes: string | null;
  emailSent: boolean;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  /** Internal name for selection */
  name: string;
  subject: string;
  /** HTML template with placeholders */
  body: string;
  /** outreach, follow_up, partnership, etc. */
  category: string;
  /** List of available placeholders, e.g. ["company_name", "contact_name"] */
  placeholders: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
