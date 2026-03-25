-- CreateEnum
CREATE TYPE "DealerType" AS ENUM ('RETAILER', 'DISTRIBUTOR', 'SYSTEM_INTEGRATOR', 'CONTRACTOR', 'OEM_PARTNER', 'WHOLESALER');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'DEALER', 'BRAND', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySegment" AS ENUM ('PREMIUM', 'MID_RANGE', 'BUDGET', 'ALL_SEGMENTS');

-- CreateEnum
CREATE TYPE "OutreachType" AS ENUM ('EMAIL', 'LINKEDIN', 'PHONE_CALL', 'MEETING', 'WHATSAPP', 'OTHER');

-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('SCHEDULED', 'SENT', 'DELIVERED', 'OPENED', 'REPLIED', 'MEETING_SCHEDULED', 'NOT_INTERESTED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('BRAND_IDENTIFIED', 'DEALERS_FOUND', 'QUOTES_REQUESTED', 'QUOTES_RECEIVED', 'SENT_TO_CUSTOMER', 'CLOSED');

-- CreateEnum
CREATE TYPE "QuoteResponseStatus" AS ENUM ('PENDING', 'CONTACTED', 'QUOTED', 'NO_RESPONSE', 'DECLINED');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('WHATSAPP', 'CALL', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "BrandDealerSource" AS ENUM ('MANUAL', 'SCRAPED', 'BRAND_WEBSITE', 'PLATFORM_DEALER');

-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('USER_SIGNUP', 'USER_LOGIN', 'USER_GOOGLE_SIGNIN', 'USER_GOOGLE_SIGNUP', 'USER_PROFILE_COMPLETED', 'USER_OTP_REQUESTED', 'USER_OTP_VERIFIED', 'DEALER_REGISTERED', 'DEALER_LOGIN', 'DEALER_PROFILE_UPDATED', 'DEALER_DOCUMENT_UPLOADED', 'DEALER_DOCUMENT_DELETED', 'DEALER_BRAND_ADDED', 'DEALER_CATEGORY_ADDED', 'DEALER_SERVICE_AREA_ADDED', 'DEALER_SERVICE_AREA_REMOVED', 'DEALER_VERIFIED', 'DEALER_REJECTED', 'PRODUCT_INQUIRY_SUBMITTED', 'PRODUCT_IMAGE_UPLOADED', 'MODEL_NUMBER_SUBMITTED', 'PRODUCT_SAVED', 'PRODUCT_SEARCHED', 'RFQ_CREATED', 'RFQ_PUBLISHED', 'RFQ_CANCELLED', 'QUOTE_SUBMITTED', 'QUOTE_SELECTED', 'POST_CREATED', 'COMMENT_CREATED', 'POST_UPVOTED', 'CONTACT_FORM_SUBMITTED', 'CHAT_SESSION_STARTED', 'CHAT_MESSAGE_SENT', 'ADMIN_LOGIN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DealerStatus" ADD VALUE 'DOCUMENTS_PENDING';
ALTER TYPE "DealerStatus" ADD VALUE 'UNDER_REVIEW';

-- AlterTable
ALTER TABLE "Dealer" ADD COLUMN     "cancelledCheque" TEXT,
ADD COLUMN     "dealerType" "DealerType" NOT NULL DEFAULT 'RETAILER',
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "shopLicense" TEXT,
ADD COLUMN     "yearsInOperation" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CompanyType" NOT NULL DEFAULT 'MANUFACTURER',
    "segment" "CompanySegment" NOT NULL DEFAULT 'ALL_SEGMENTS',
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedIn" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "description" TEXT,
    "productCategories" TEXT[],
    "yearEstablished" INTEGER,
    "employeeCount" TEXT,
    "annualRevenue" TEXT,
    "hasApi" BOOLEAN NOT NULL DEFAULT false,
    "digitalMaturity" TEXT,
    "dealerNetworkSize" TEXT,
    "status" TEXT NOT NULL DEFAULT 'prospect',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "tags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMContact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "linkedIn" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "decisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMOutreach" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "type" "OutreachType" NOT NULL DEFAULT 'EMAIL',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "templateUsed" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "status" "OutreachStatus" NOT NULL DEFAULT 'SCHEDULED',
    "openedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "responseContent" TEXT,
    "responseSentiment" TEXT,
    "followUpDate" TIMESTAMP(3),
    "followUpNumber" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMOutreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMMeeting" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "meetingLink" TEXT,
    "location" TEXT,
    "attendees" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "agenda" TEXT,
    "notes" TEXT,
    "outcome" TEXT,
    "nextSteps" TEXT,
    "reminders" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMPipelineStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInquiry" (
    "id" TEXT NOT NULL,
    "inquiryNumber" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "productPhoto" TEXT,
    "modelNumber" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "deliveryCity" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "internalNotes" TEXT,
    "quotedPrice" DOUBLE PRECISION,
    "shippingCost" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "estimatedDelivery" TEXT,
    "responseNotes" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "categoryId" TEXT,
    "identifiedBrandId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryDealerResponse" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quotedPrice" DOUBLE PRECISION,
    "shippingCost" DOUBLE PRECISION DEFAULT 0,
    "totalPrice" DOUBLE PRECISION,
    "estimatedDelivery" TEXT,
    "notes" TEXT,
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryDealerResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandDealer" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shopName" TEXT,
    "phone" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "pincode" TEXT,
    "address" TEXT,
    "source" "BrandDealerSource" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandDealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryPipeline" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "identifiedBrandId" TEXT,
    "identifiedBrand" TEXT,
    "identifiedProduct" TEXT,
    "identifiedCategory" TEXT,
    "status" "PipelineStatus" NOT NULL DEFAULT 'BRAND_IDENTIFIED',
    "aiAnalysis" TEXT,
    "sentToCustomerAt" TIMESTAMP(3),
    "sentVia" TEXT,
    "customerMessage" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryDealerQuote" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "brandDealerId" TEXT,
    "dealerId" TEXT,
    "dealerName" TEXT NOT NULL,
    "dealerPhone" TEXT NOT NULL,
    "dealerShopName" TEXT,
    "dealerCity" TEXT,
    "contactMethod" "ContactMethod" NOT NULL DEFAULT 'WHATSAPP',
    "contactedAt" TIMESTAMP(3),
    "whatsappMessage" TEXT,
    "quotedPrice" DOUBLE PRECISION,
    "shippingCost" DOUBLE PRECISION,
    "totalQuotedPrice" DOUBLE PRECISION,
    "deliveryDays" INTEGER,
    "warrantyInfo" TEXT,
    "quoteNotes" TEXT,
    "responseStatus" "QuoteResponseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryDealerQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevicePushToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevicePushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scrapeFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "lastScrapedAt" TIMESTAMP(3),
    "nextScrapeAt" TIMESTAMP(3),
    "catalogUrls" TEXT,
    "selectors" TEXT,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "lastScrapeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "status" "ScrapeStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "productsFound" INTEGER NOT NULL DEFAULT 0,
    "productsCreated" INTEGER NOT NULL DEFAULT 0,
    "productsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "logs" TEXT,
    "errorDetails" TEXT,
    "configSnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapedProduct" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawName" TEXT NOT NULL,
    "rawCategory" TEXT,
    "rawSubCategory" TEXT,
    "rawModelNumber" TEXT,
    "rawSku" TEXT,
    "rawDescription" TEXT,
    "rawSpecifications" TEXT,
    "rawImages" TEXT[],
    "rawDatasheetUrl" TEXT,
    "rawManualUrl" TEXT,
    "rawPrice" TEXT,
    "rawCertifications" TEXT[],
    "rawWarranty" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "productId" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "validationErrors" TEXT,
    "contentHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeMapping" (
    "id" TEXT NOT NULL,
    "brandPattern" TEXT,
    "categoryPattern" TEXT,
    "namePattern" TEXT,
    "targetCategoryId" TEXT,
    "targetSubCategoryId" TEXT,
    "targetProductTypeId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "selectors" TEXT NOT NULL,
    "brandIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "actorName" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OTP_identifier_idx" ON "OTP"("identifier");

-- CreateIndex
CREATE INDEX "OTP_expiresAt_idx" ON "OTP"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CRMCompany_slug_key" ON "CRMCompany"("slug");

-- CreateIndex
CREATE INDEX "CRMCompany_status_idx" ON "CRMCompany"("status");

-- CreateIndex
CREATE INDEX "CRMCompany_type_idx" ON "CRMCompany"("type");

-- CreateIndex
CREATE INDEX "CRMCompany_segment_idx" ON "CRMCompany"("segment");

-- CreateIndex
CREATE INDEX "CRMCompany_city_idx" ON "CRMCompany"("city");

-- CreateIndex
CREATE INDEX "CRMContact_companyId_idx" ON "CRMContact"("companyId");

-- CreateIndex
CREATE INDEX "CRMContact_email_idx" ON "CRMContact"("email");

-- CreateIndex
CREATE INDEX "CRMContact_designation_idx" ON "CRMContact"("designation");

-- CreateIndex
CREATE INDEX "CRMOutreach_companyId_idx" ON "CRMOutreach"("companyId");

-- CreateIndex
CREATE INDEX "CRMOutreach_contactId_idx" ON "CRMOutreach"("contactId");

-- CreateIndex
CREATE INDEX "CRMOutreach_status_idx" ON "CRMOutreach"("status");

-- CreateIndex
CREATE INDEX "CRMOutreach_scheduledAt_idx" ON "CRMOutreach"("scheduledAt");

-- CreateIndex
CREATE INDEX "CRMOutreach_type_idx" ON "CRMOutreach"("type");

-- CreateIndex
CREATE INDEX "CRMMeeting_companyId_idx" ON "CRMMeeting"("companyId");

-- CreateIndex
CREATE INDEX "CRMMeeting_scheduledAt_idx" ON "CRMMeeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "CRMMeeting_status_idx" ON "CRMMeeting"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CRMPipelineStage_name_key" ON "CRMPipelineStage"("name");

-- CreateIndex
CREATE INDEX "CRMPipelineStage_sortOrder_idx" ON "CRMPipelineStage"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInquiry_inquiryNumber_key" ON "ProductInquiry"("inquiryNumber");

-- CreateIndex
CREATE INDEX "ProductInquiry_status_idx" ON "ProductInquiry"("status");

-- CreateIndex
CREATE INDEX "ProductInquiry_phone_idx" ON "ProductInquiry"("phone");

-- CreateIndex
CREATE INDEX "ProductInquiry_createdAt_idx" ON "ProductInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "ProductInquiry_inquiryNumber_idx" ON "ProductInquiry"("inquiryNumber");

-- CreateIndex
CREATE INDEX "ProductInquiry_categoryId_idx" ON "ProductInquiry"("categoryId");

-- CreateIndex
CREATE INDEX "InquiryDealerResponse_inquiryId_idx" ON "InquiryDealerResponse"("inquiryId");

-- CreateIndex
CREATE INDEX "InquiryDealerResponse_dealerId_idx" ON "InquiryDealerResponse"("dealerId");

-- CreateIndex
CREATE INDEX "InquiryDealerResponse_status_idx" ON "InquiryDealerResponse"("status");

-- CreateIndex
CREATE INDEX "BrandDealer_brandId_idx" ON "BrandDealer"("brandId");

-- CreateIndex
CREATE INDEX "BrandDealer_city_idx" ON "BrandDealer"("city");

-- CreateIndex
CREATE INDEX "BrandDealer_isActive_idx" ON "BrandDealer"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BrandDealer_brandId_phone_key" ON "BrandDealer"("brandId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "InquiryPipeline_inquiryId_key" ON "InquiryPipeline"("inquiryId");

-- CreateIndex
CREATE INDEX "InquiryPipeline_status_idx" ON "InquiryPipeline"("status");

-- CreateIndex
CREATE INDEX "InquiryPipeline_identifiedBrandId_idx" ON "InquiryPipeline"("identifiedBrandId");

-- CreateIndex
CREATE INDEX "InquiryPipeline_createdAt_idx" ON "InquiryPipeline"("createdAt");

-- CreateIndex
CREATE INDEX "InquiryDealerQuote_pipelineId_idx" ON "InquiryDealerQuote"("pipelineId");

-- CreateIndex
CREATE INDEX "InquiryDealerQuote_brandDealerId_idx" ON "InquiryDealerQuote"("brandDealerId");

-- CreateIndex
CREATE INDEX "InquiryDealerQuote_responseStatus_idx" ON "InquiryDealerQuote"("responseStatus");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_revoked_idx" ON "RefreshToken"("revoked");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DevicePushToken_token_key" ON "DevicePushToken"("token");

-- CreateIndex
CREATE INDEX "DevicePushToken_userId_idx" ON "DevicePushToken"("userId");

-- CreateIndex
CREATE INDEX "DevicePushToken_userType_idx" ON "DevicePushToken"("userType");

-- CreateIndex
CREATE INDEX "DevicePushToken_isActive_idx" ON "DevicePushToken"("isActive");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeBrand_name_key" ON "ScrapeBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeBrand_slug_key" ON "ScrapeBrand"("slug");

-- CreateIndex
CREATE INDEX "ScrapeBrand_slug_idx" ON "ScrapeBrand"("slug");

-- CreateIndex
CREATE INDEX "ScrapeBrand_isActive_idx" ON "ScrapeBrand"("isActive");

-- CreateIndex
CREATE INDEX "ScrapeJob_brandId_idx" ON "ScrapeJob"("brandId");

-- CreateIndex
CREATE INDEX "ScrapeJob_status_idx" ON "ScrapeJob"("status");

-- CreateIndex
CREATE INDEX "ScrapeJob_createdAt_idx" ON "ScrapeJob"("createdAt");

-- CreateIndex
CREATE INDEX "ScrapedProduct_brandId_idx" ON "ScrapedProduct"("brandId");

-- CreateIndex
CREATE INDEX "ScrapedProduct_isProcessed_idx" ON "ScrapedProduct"("isProcessed");

-- CreateIndex
CREATE INDEX "ScrapedProduct_contentHash_idx" ON "ScrapedProduct"("contentHash");

-- CreateIndex
CREATE INDEX "ScrapedProduct_rawModelNumber_idx" ON "ScrapedProduct"("rawModelNumber");

-- CreateIndex
CREATE INDEX "ScrapedProduct_sourceUrl_idx" ON "ScrapedProduct"("sourceUrl");

-- CreateIndex
CREATE INDEX "ScrapeMapping_priority_idx" ON "ScrapeMapping"("priority");

-- CreateIndex
CREATE INDEX "ScrapeMapping_isActive_idx" ON "ScrapeMapping"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeTemplate_name_key" ON "ScrapeTemplate"("name");

-- CreateIndex
CREATE INDEX "UserActivity_actorType_actorId_idx" ON "UserActivity"("actorType", "actorId");

-- CreateIndex
CREATE INDEX "UserActivity_activityType_idx" ON "UserActivity"("activityType");

-- CreateIndex
CREATE INDEX "UserActivity_entityType_entityId_idx" ON "UserActivity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_actorEmail_idx" ON "UserActivity"("actorEmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "CRMContact" ADD CONSTRAINT "CRMContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CRMCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMOutreach" ADD CONSTRAINT "CRMOutreach_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CRMCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMOutreach" ADD CONSTRAINT "CRMOutreach_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CRMContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInquiry" ADD CONSTRAINT "ProductInquiry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInquiry" ADD CONSTRAINT "ProductInquiry_identifiedBrandId_fkey" FOREIGN KEY ("identifiedBrandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryDealerResponse" ADD CONSTRAINT "InquiryDealerResponse_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "ProductInquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryDealerResponse" ADD CONSTRAINT "InquiryDealerResponse_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDealer" ADD CONSTRAINT "BrandDealer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryPipeline" ADD CONSTRAINT "InquiryPipeline_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "ProductInquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryDealerQuote" ADD CONSTRAINT "InquiryDealerQuote_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "InquiryPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryDealerQuote" ADD CONSTRAINT "InquiryDealerQuote_brandDealerId_fkey" FOREIGN KEY ("brandDealerId") REFERENCES "BrandDealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeJob" ADD CONSTRAINT "ScrapeJob_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "ScrapeBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapedProduct" ADD CONSTRAINT "ScrapedProduct_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "ScrapeBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.5.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
