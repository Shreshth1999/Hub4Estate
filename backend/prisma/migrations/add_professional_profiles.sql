-- Migration: Add professional profiles and verification system
-- Run this on the production database after deploying the code changes

-- 1. Add ProfVerificationStatus enum
CREATE TYPE "ProfVerificationStatus" AS ENUM (
  'NOT_APPLIED',
  'PENDING_DOCUMENTS',
  'UNDER_REVIEW',
  'VERIFIED',
  'REJECTED'
);

-- 2. Add profVerificationStatus column to User table
ALTER TABLE "User"
  ADD COLUMN "profVerificationStatus" "ProfVerificationStatus" NOT NULL DEFAULT 'NOT_APPLIED';

-- 3. Create ProfessionalProfile table
CREATE TABLE "ProfessionalProfile" (
  "id"              TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "businessName"    TEXT,
  "registrationNo"  TEXT,
  "websiteUrl"      TEXT,
  "portfolioUrl"    TEXT,
  "bio"             TEXT,
  "officeAddress"   TEXT,
  "city"            TEXT,
  "state"           TEXT,
  "pincode"         TEXT,
  "yearsExperience" INTEGER,
  "verifiedAt"      TIMESTAMP(3),
  "verifiedBy"      TEXT,
  "rejectionReason" TEXT,
  "adminNotes"      TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProfessionalProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProfessionalProfile_userId_key" UNIQUE ("userId"),
  CONSTRAINT "ProfessionalProfile_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Create ProfessionalDocument table
CREATE TABLE "ProfessionalDocument" (
  "id"          TEXT NOT NULL,
  "profileId"   TEXT NOT NULL,
  "docType"     TEXT NOT NULL,
  "fileUrl"     TEXT NOT NULL,
  "fileName"    TEXT,
  "fileSize"    INTEGER,
  "mimeType"    TEXT,
  "isVerified"  BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt"  TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProfessionalDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProfessionalDocument_profileId_fkey" FOREIGN KEY ("profileId")
    REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Create indexes
CREATE INDEX "ProfessionalProfile_userId_idx" ON "ProfessionalProfile"("userId");
CREATE INDEX "ProfessionalDocument_profileId_idx" ON "ProfessionalDocument"("profileId");
CREATE INDEX "ProfessionalDocument_docType_idx" ON "ProfessionalDocument"("docType");
CREATE INDEX "User_profVerificationStatus_idx" ON "User"("profVerificationStatus");
