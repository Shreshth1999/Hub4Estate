// ============================================
// User Management Types
// ============================================

export enum UserRole {
  INDIVIDUAL_HOME_BUILDER = 'INDIVIDUAL_HOME_BUILDER',
  RENOVATION_HOMEOWNER = 'RENOVATION_HOMEOWNER',
  ARCHITECT = 'ARCHITECT',
  INTERIOR_DESIGNER = 'INTERIOR_DESIGNER',
  CONTRACTOR = 'CONTRACTOR',
  ELECTRICIAN = 'ELECTRICIAN',
  SMALL_BUILDER = 'SMALL_BUILDER',
  DEVELOPER = 'DEVELOPER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum ProfVerificationStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  email: string | null;
  googleId: string | null;
  phone: string | null;
  name: string;
  role: UserRole | null;
  city: string | null;
  /** "new build" or "renovation" */
  purpose: string | null;
  status: UserStatus;
  profileImage: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  profVerificationStatus: ProfVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  businessName: string | null;
  /** COA number (Architect), trade license number, etc. */
  registrationNo: string | null;
  websiteUrl: string | null;
  portfolioUrl: string | null;
  bio: string | null;
  officeAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  yearsExperience: number | null;
  verifiedAt: string | null;
  /** Admin ID who verified */
  verifiedBy: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalDocument {
  id: string;
  profileId: string;
  /** coa_certificate, trade_license, gst_certificate, id_proof, portfolio */
  docType: string;
  fileUrl: string;
  fileName: string | null;
  /** File size in bytes */
  fileSize: number | null;
  mimeType: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export interface OTP {
  id: string;
  /** Phone number or email address */
  identifier: string;
  /** 6-digit OTP code */
  code: string;
  /** "login" or "signup" */
  type: string;
  expiresAt: string;
  verified: boolean;
  attempts: number;
  createdAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  /** Language code: en, hi, ta, te, kn, bn */
  language: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  notifyPush: boolean;
  marketingEmails: boolean;
  analyticsConsent: boolean;
  thirdPartyConsent: boolean;
  /** realtime, daily, weekly, none */
  digestFrequency: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProduct {
  id: string;
  userId: string;
  productId: string;
  notes: string | null;
  createdAt: string;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  /** "user", "dealer", or "admin" */
  userType: string;
  revoked: boolean;
  revokedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface PasswordResetToken {
  id: string;
  token: string;
  email: string;
  /** "user" or "dealer" */
  userType: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
}
