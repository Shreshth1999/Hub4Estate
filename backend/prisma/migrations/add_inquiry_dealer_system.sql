-- Add category and dealer relation fields to ProductInquiry
ALTER TABLE "ProductInquiry" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "ProductInquiry" ADD COLUMN IF NOT EXISTS "subcategoryId" TEXT;
ALTER TABLE "ProductInquiry" ADD COLUMN IF NOT EXISTS "identifiedBrandId" TEXT;

-- Create InquiryDealerResponse table for dealer quotes
CREATE TABLE IF NOT EXISTS "InquiryDealerResponse" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quotedPrice" DOUBLE PRECISION,
    "shippingCost" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "estimatedDelivery" TEXT,
    "notes" TEXT,
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryDealerResponse_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "ProductInquiry" ADD CONSTRAINT "ProductInquiry_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductInquiry" ADD CONSTRAINT "ProductInquiry_subcategoryId_fkey"
    FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductInquiry" ADD CONSTRAINT "ProductInquiry_identifiedBrandId_fkey"
    FOREIGN KEY ("identifiedBrandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InquiryDealerResponse" ADD CONSTRAINT "InquiryDealerResponse_inquiryId_fkey"
    FOREIGN KEY ("inquiryId") REFERENCES "ProductInquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InquiryDealerResponse" ADD CONSTRAINT "InquiryDealerResponse_dealerId_fkey"
    FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "InquiryDealerResponse_inquiryId_idx" ON "InquiryDealerResponse"("inquiryId");
CREATE INDEX IF NOT EXISTS "InquiryDealerResponse_dealerId_idx" ON "InquiryDealerResponse"("dealerId");
CREATE INDEX IF NOT EXISTS "InquiryDealerResponse_status_idx" ON "InquiryDealerResponse"("status");
CREATE INDEX IF NOT EXISTS "ProductInquiry_categoryId_idx" ON "ProductInquiry"("categoryId");
CREATE INDEX IF NOT EXISTS "ProductInquiry_status_idx" ON "ProductInquiry"("status");
