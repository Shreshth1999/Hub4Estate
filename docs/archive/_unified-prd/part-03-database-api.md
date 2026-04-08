# Hub4Estate -- Definitive Technical PRD
## Part 3: Database Schema & API Specification

Version 1.0 | April 2026 | Author: CTO Office
Status: **PRODUCTION** -- every model deployed, every endpoint live.

---

# SECTION 6 -- DATABASE SCHEMA

PostgreSQL 15, managed via Prisma ORM. Every model below is production-deployed. Field types are Prisma schema types; the PostgreSQL column type is noted where non-obvious.

---

## 6.1 Enums (20 total)

Every enum is a PostgreSQL enum type created by Prisma Migrate.

### 6.1.1 UserRole (8 values)

| Value | Description |
|---|---|
| `INDIVIDUAL_HOME_BUILDER` | Person building a new home from scratch |
| `RENOVATION_HOMEOWNER` | Homeowner renovating an existing property |
| `ARCHITECT` | Licensed architect (professional verification eligible) |
| `INTERIOR_DESIGNER` | Interior designer (professional verification eligible) |
| `CONTRACTOR` | General or specialized contractor |
| `ELECTRICIAN` | Licensed electrician |
| `SMALL_BUILDER` | Small-scale builder doing 1-5 projects/year |
| `DEVELOPER` | Real estate developer managing multiple sites |

### 6.1.2 UserStatus (3 values)

| Value | Description |
|---|---|
| `ACTIVE` | Normal operating state (default) |
| `SUSPENDED` | Temporarily disabled by admin |
| `DELETED` | Soft-deleted, data retained for audit |

### 6.1.3 ProfVerificationStatus (5 values)

| Value | Description |
|---|---|
| `NOT_APPLIED` | User has not submitted verification documents (default) |
| `PENDING_DOCUMENTS` | Application started, documents incomplete |
| `UNDER_REVIEW` | All documents submitted, admin reviewing |
| `VERIFIED` | Approved by admin, badge displayed |
| `REJECTED` | Documents insufficient, reason stored on ProfessionalProfile |

### 6.1.4 DealerStatus (7 values)

| Value | Description |
|---|---|
| `PENDING_VERIFICATION` | Just registered, awaiting document upload (default) |
| `DOCUMENTS_PENDING` | Registration complete, some KYC documents missing |
| `UNDER_REVIEW` | All required documents uploaded, admin reviewing |
| `VERIFIED` | Approved -- can bid on RFQs and receive inquiries |
| `REJECTED` | Application denied, rejection reason stored |
| `SUSPENDED` | Temporarily blocked by admin |
| `DELETED` | Soft-deleted |

### 6.1.5 DealerType (6 values)

| Value | Description |
|---|---|
| `RETAILER` | Retail shop selling to end consumers (default) |
| `DISTRIBUTOR` | Regional distributor with multi-brand inventory |
| `SYSTEM_INTEGRATOR` | Provides installation + materials as a package |
| `CONTRACTOR` | Contractor who also supplies materials |
| `OEM_PARTNER` | Direct partner of a manufacturer/brand |
| `WHOLESALER` | Bulk supplier, typically lowest prices |

### 6.1.6 RFQStatus (6 values)

| Value | Lifecycle Position |
|---|---|
| `DRAFT` | Created by buyer, not yet visible to dealers |
| `PUBLISHED` | Live -- matched dealers can submit quotes |
| `QUOTES_RECEIVED` | At least one dealer has submitted a quote |
| `DEALER_SELECTED` | Buyer selected a winning quote |
| `COMPLETED` | Order fulfilled and confirmed |
| `CANCELLED` | Buyer cancelled the RFQ |

### 6.1.7 QuoteStatus (4 values)

| Value | Description |
|---|---|
| `SUBMITTED` | Dealer submitted, awaiting buyer evaluation |
| `SELECTED` | Buyer chose this quote -- winner |
| `REJECTED` | Another quote was selected; loss reason recorded |
| `EXPIRED` | Quote validity period passed without selection |

### 6.1.8 PostStatus (3 values)

`PUBLISHED` | `HIDDEN` | `DELETED`

### 6.1.9 AuditAction (9 values)

`DEALER_VERIFIED` | `DEALER_REJECTED` | `DEALER_SUSPENDED` | `PRODUCT_CREATED` | `PRODUCT_UPDATED` | `CATEGORY_CREATED` | `USER_SUSPENDED` | `RFQ_FLAGGED` | `QUOTE_FLAGGED`

### 6.1.10 CompanyType (5 values)

`MANUFACTURER` | `DISTRIBUTOR` | `DEALER` | `BRAND` | `OTHER`

### 6.1.11 CompanySegment (4 values)

`PREMIUM` | `MID_RANGE` | `BUDGET` | `ALL_SEGMENTS`

### 6.1.12 OutreachType (6 values)

`EMAIL` | `LINKEDIN` | `PHONE_CALL` | `MEETING` | `WHATSAPP` | `OTHER`

### 6.1.13 OutreachStatus (9 values)

`SCHEDULED` | `SENT` | `DELIVERED` | `OPENED` | `REPLIED` | `MEETING_SCHEDULED` | `NOT_INTERESTED` | `BOUNCED` | `FAILED`

### 6.1.14 PipelineStatus (6 values)

`BRAND_IDENTIFIED` | `DEALERS_FOUND` | `QUOTES_REQUESTED` | `QUOTES_RECEIVED` | `SENT_TO_CUSTOMER` | `CLOSED`

### 6.1.15 QuoteResponseStatus (5 values)

`PENDING` | `CONTACTED` | `QUOTED` | `NO_RESPONSE` | `DECLINED`

### 6.1.16 ContactMethod (4 values)

`WHATSAPP` | `CALL` | `EMAIL` | `SMS`

### 6.1.17 BrandDealerSource (4 values)

`MANUAL` | `SCRAPED` | `BRAND_WEBSITE` | `PLATFORM_DEALER`

### 6.1.18 ScrapeStatus (5 values)

`PENDING` | `IN_PROGRESS` | `COMPLETED` | `FAILED` | `PARTIAL`

### 6.1.19 ActivityType (31 values)

Auth events: `USER_SIGNUP`, `USER_LOGIN`, `USER_GOOGLE_SIGNIN`, `USER_GOOGLE_SIGNUP`, `USER_PROFILE_COMPLETED`, `USER_OTP_REQUESTED`, `USER_OTP_VERIFIED`

Dealer events: `DEALER_REGISTERED`, `DEALER_LOGIN`, `DEALER_PROFILE_UPDATED`, `DEALER_DOCUMENT_UPLOADED`, `DEALER_DOCUMENT_DELETED`, `DEALER_BRAND_ADDED`, `DEALER_CATEGORY_ADDED`, `DEALER_SERVICE_AREA_ADDED`, `DEALER_SERVICE_AREA_REMOVED`, `DEALER_VERIFIED`, `DEALER_REJECTED`

Product events: `PRODUCT_INQUIRY_SUBMITTED`, `PRODUCT_IMAGE_UPLOADED`, `MODEL_NUMBER_SUBMITTED`, `PRODUCT_SAVED`, `PRODUCT_SEARCHED`

RFQ events: `RFQ_CREATED`, `RFQ_PUBLISHED`, `RFQ_CANCELLED`

Quote events: `QUOTE_SUBMITTED`, `QUOTE_SELECTED`

Community events: `POST_CREATED`, `COMMENT_CREATED`, `POST_UPVOTED`

Other events: `CONTACT_FORM_SUBMITTED`, `CHAT_SESSION_STARTED`, `CHAT_MESSAGE_SENT`, `ADMIN_LOGIN`

---

## 6.2 Model Definitions -- All 49 Models

Each model is documented with every field, its type, constraints, default value, and the database index that covers it. Relations are explicit.

---

### GROUP 1: USER & AUTHENTICATION

#### 6.2.1 User

Primary identity for all non-dealer, non-admin users (homeowners, contractors, architects, etc.).

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `email` | String | Yes | -- | Unique |
| `googleId` | String | Yes | -- | Unique |
| `phone` | String | Yes | -- | Unique |
| `name` | String | No | -- | -- |
| `role` | UserRole | Yes | -- | -- |
| `city` | String | Yes | -- | -- |
| `purpose` | String | Yes | -- | "new build" / "renovation" |
| `status` | UserStatus | No | `ACTIVE` | -- |
| `profileImage` | String | Yes | -- | URL |
| `isPhoneVerified` | Boolean | No | `false` | -- |
| `isEmailVerified` | Boolean | No | `false` | -- |
| `profVerificationStatus` | ProfVerificationStatus | No | `NOT_APPLIED` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:**
- `@@index([email])` -- login lookup by email
- `@@index([phone])` -- login lookup by phone
- `@@index([googleId])` -- OAuth lookup
- `@@index([city])` -- geographic filtering
- `@@index([profVerificationStatus])` -- admin verification queue

**Relations:**
- `rfqs` -> RFQ[] (one-to-many)
- `communityPosts` -> CommunityPost[] (one-to-many)
- `communityComments` -> CommunityComment[] (one-to-many)
- `savedProducts` -> SavedProduct[] (one-to-many)
- `professionalProfile` -> ProfessionalProfile? (one-to-one)

#### 6.2.2 ProfessionalProfile

Extended profile for verified professionals (architects, contractors, etc.). One-to-one with User.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `userId` | String | No | -- | Unique, FK -> User.id (CASCADE) |
| `businessName` | String | Yes | -- | -- |
| `registrationNo` | String | Yes | -- | COA number, trade license, etc. |
| `websiteUrl` | String | Yes | -- | -- |
| `portfolioUrl` | String | Yes | -- | -- |
| `bio` | String | Yes | -- | -- |
| `officeAddress` | String | Yes | -- | -- |
| `city` | String | Yes | -- | -- |
| `state` | String | Yes | -- | -- |
| `pincode` | String | Yes | -- | -- |
| `yearsExperience` | Int | Yes | -- | -- |
| `verifiedAt` | DateTime | Yes | -- | Set when admin approves |
| `verifiedBy` | String | Yes | -- | Admin ID |
| `rejectionReason` | String | Yes | -- | -- |
| `adminNotes` | String | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([userId])`

**Relations:** `user` -> User, `documents` -> ProfessionalDocument[]

#### 6.2.3 ProfessionalDocument

Documents uploaded by professionals for verification (certificates, licenses, portfolios).

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `profileId` | String | No | -- | FK -> ProfessionalProfile.id (CASCADE) |
| `docType` | String | No | -- | "coa_certificate", "trade_license", "gst_certificate", "id_proof", "portfolio", "primary", "additional" |
| `fileUrl` | String | No | -- | -- |
| `fileName` | String | Yes | -- | -- |
| `fileSize` | Int | Yes | -- | Bytes |
| `mimeType` | String | Yes | -- | -- |
| `isVerified` | Boolean | No | `false` | -- |
| `verifiedAt` | DateTime | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([profileId])`, `@@index([docType])`

#### 6.2.4 OTP

One-time passwords for phone and email verification. Records are deleted after verification or expiry.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `identifier` | String | No | -- | Phone number or email address |
| `code` | String | No | -- | 6-digit numeric string |
| `type` | String | No | -- | "login" or "signup" |
| `expiresAt` | DateTime | No | -- | 10 minutes from creation |
| `verified` | Boolean | No | `false` | -- |
| `attempts` | Int | No | `0` | Max 3 before lockout |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([identifier])`, `@@index([expiresAt])`

#### 6.2.5 RefreshToken

Persistent refresh tokens for mobile stay-logged-in. Rotated on each use (old token revoked, new token issued).

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `token` | String | No | -- | Unique, 64-byte random hex |
| `userId` | String | No | -- | -- |
| `userType` | String | No | -- | "user", "dealer", "admin" |
| `revoked` | Boolean | No | `false` | -- |
| `revokedAt` | DateTime | Yes | -- | -- |
| `expiresAt` | DateTime | No | -- | 30 days from creation |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([userId])`, `@@index([token])`, `@@index([expiresAt])`, `@@index([revoked])`

#### 6.2.6 PasswordResetToken

Time-limited, single-use tokens for dealer password reset.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `token` | String | No | -- | Unique, 32-byte random hex |
| `email` | String | No | -- | -- |
| `userType` | String | No | -- | "dealer" (future: "user") |
| `used` | Boolean | No | `false` | -- |
| `expiresAt` | DateTime | No | -- | 1 hour from creation |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([token])`, `@@index([email])`, `@@index([expiresAt])`

#### 6.2.7 Admin

Back-office admin accounts. Passwords are bcrypt-hashed. Separate from User model for security isolation.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `email` | String | No | -- | Unique |
| `password` | String | No | -- | bcrypt hash |
| `name` | String | No | -- | -- |
| `role` | String | No | `"admin"` | "admin" or "super_admin" |
| `isActive` | Boolean | No | `true` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([email])`

---

### GROUP 2: DEALER

#### 6.2.8 Dealer

Verified dealer accounts. Dealers have their own authentication flow (email/password), separate from User.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `email` | String | No | -- | Unique |
| `password` | String | Yes | -- | bcrypt hash |
| `businessName` | String | No | -- | -- |
| `ownerName` | String | No | -- | -- |
| `phone` | String | No | -- | -- |
| `gstNumber` | String | No | -- | Unique, 15 chars |
| `panNumber` | String | No | -- | 10 chars |
| `shopAddress` | String | No | -- | -- |
| `city` | String | No | -- | -- |
| `state` | String | No | -- | -- |
| `pincode` | String | No | -- | 6 digits |
| `dealerType` | DealerType | No | `RETAILER` | -- |
| `yearsInOperation` | Int | Yes | -- | -- |
| `gstDocument` | String | Yes | -- | Upload URL |
| `panDocument` | String | Yes | -- | Upload URL |
| `shopLicense` | String | Yes | -- | Upload URL |
| `cancelledCheque` | String | Yes | -- | Upload URL |
| `shopPhoto` | String | Yes | -- | Upload URL |
| `shopImages` | String[] | No | `[]` | Max 6 images |
| `brandAuthProofs` | String[] | No | `[]` | Authorization proof URLs |
| `description` | String (Text) | Yes | -- | Public-facing bio |
| `establishedYear` | Int | Yes | -- | -- |
| `certifications` | String[] | No | `[]` | e.g., "ISI Authorized" |
| `website` | String | Yes | -- | -- |
| `onboardingStep` | Int | No | `1` | 1-based progress tracker |
| `profileComplete` | Boolean | No | `false` | -- |
| `status` | DealerStatus | No | `PENDING_VERIFICATION` | -- |
| `verificationNotes` | String | Yes | -- | Admin notes |
| `verifiedAt` | DateTime | Yes | -- | -- |
| `verifiedBy` | String | Yes | -- | Admin ID |
| `rejectionReason` | String | Yes | -- | -- |
| `totalRFQsReceived` | Int | No | `0` | -- |
| `totalQuotesSubmitted` | Int | No | `0` | -- |
| `totalConversions` | Int | No | `0` | -- |
| `conversionRate` | Float | No | `0` | quotesWon / quotesSubmitted |
| `avgResponseTime` | Int | Yes | -- | Minutes |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:**
- `@@index([email])` -- login lookup
- `@@index([gstNumber])` -- KYC dedup check
- `@@index([city])` -- geographic matching
- `@@index([status])` -- admin filtering

**Relations:** `brandMappings` -> DealerBrandMapping[], `categoryMappings` -> DealerCategoryMapping[], `serviceAreas` -> DealerServiceArea[], `quotes` -> Quote[], `reviews` -> DealerReview[], `inquiryResponses` -> InquiryDealerResponse[]

#### 6.2.9 DealerServiceArea

Pincodes a dealer can serve. Used by RFQ matching engine.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `dealerId` | String | No | -- | FK -> Dealer.id (CASCADE) |
| `pincode` | String | No | -- | 6 digits |
| `createdAt` | DateTime | No | `now()` | -- |

**Constraints:** `@@unique([dealerId, pincode])`
**Indexes:** `@@index([pincode])`

#### 6.2.10 DealerReview

Transaction-based reviews from buyers after RFQ completion.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `dealerId` | String | No | -- | FK -> Dealer.id (CASCADE) |
| `userId` | String | No | -- | -- |
| `rfqId` | String | No | -- | -- |
| `rating` | Int | No | -- | 1-5 |
| `comment` | String | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([dealerId])`, `@@index([rfqId])`

#### 6.2.11 DealerBrandMapping

Links a dealer to the brands they stock. `isVerified` flipped by admin after proof review.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `dealerId` | String | No | -- | FK -> Dealer.id (CASCADE) |
| `brandId` | String | No | -- | FK -> Brand.id (CASCADE) |
| `authProofUrl` | String | Yes | -- | Authorization document URL |
| `isVerified` | Boolean | No | `false` | -- |
| `createdAt` | DateTime | No | `now()` | -- |

**Constraints:** `@@unique([dealerId, brandId])`
**Indexes:** `@@index([dealerId])`, `@@index([brandId])`

#### 6.2.12 DealerCategoryMapping

Links a dealer to the product categories they serve.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `dealerId` | String | No | -- | FK -> Dealer.id (CASCADE) |
| `categoryId` | String | No | -- | FK -> Category.id (CASCADE) |
| `createdAt` | DateTime | No | `now()` | -- |

**Constraints:** `@@unique([dealerId, categoryId])`
**Indexes:** `@@index([dealerId])`, `@@index([categoryId])`

---

### GROUP 3: PRODUCT CATALOG

#### 6.2.13 Category

Top-level product categories (e.g., "Wires & Cables", "MCBs & Distribution", "Lighting").

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `name` | String | No | -- | Unique |
| `slug` | String | No | -- | Unique |
| `description` | String | Yes | -- | -- |
| `icon` | String | Yes | -- | Lucide icon name or URL |
| `sortOrder` | Int | No | `0` | -- |
| `isActive` | Boolean | No | `true` | -- |
| `seoTitle` | String | Yes | -- | -- |
| `seoDescription` | String | Yes | -- | -- |
| `whatIsIt` | String | Yes | -- | Educational content |
| `whereUsed` | String | Yes | -- | Where in house |
| `whyQualityMatters` | String | Yes | -- | -- |
| `commonMistakes` | String | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([slug])`
**Relations:** `subCategories` -> SubCategory[], `dealerMappings` -> DealerCategoryMapping[], `inquiries` -> ProductInquiry[]

#### 6.2.14 SubCategory

Second-level grouping within a category (e.g., "House Wiring" under "Wires & Cables").

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `categoryId` | String | No | -- | FK -> Category.id (CASCADE) |
| `name` | String | No | -- | -- |
| `slug` | String | No | -- | -- |
| `description` | String | Yes | -- | -- |
| `sortOrder` | Int | No | `0` | -- |
| `isActive` | Boolean | No | `true` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Constraints:** `@@unique([categoryId, slug])`
**Indexes:** `@@index([slug])`
**Relations:** `category` -> Category, `productTypes` -> ProductType[]

#### 6.2.15 ProductType

Third-level classification (e.g., "FRLS Wires" under "House Wiring"). Products are attached here.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `subCategoryId` | String | No | -- | FK -> SubCategory.id (CASCADE) |
| `name` | String | No | -- | -- |
| `slug` | String | No | -- | -- |
| `description` | String | Yes | -- | -- |
| `technicalInfo` | String | Yes | -- | JSON string |
| `useCases` | String | Yes | -- | JSON array |
| `sortOrder` | Int | No | `0` | -- |
| `isActive` | Boolean | No | `true` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Constraints:** `@@unique([subCategoryId, slug])`
**Indexes:** `@@index([slug])`
**Relations:** `subCategory` -> SubCategory, `products` -> Product[]

#### 6.2.16 Brand

Manufacturer or brand entity (e.g., Havells, Polycab, Anchor).

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `name` | String | No | -- | Unique |
| `slug` | String | No | -- | Unique |
| `logo` | String | Yes | -- | URL |
| `description` | String | Yes | -- | -- |
| `website` | String | Yes | -- | -- |
| `isActive` | Boolean | No | `true` | -- |
| `isPremium` | Boolean | No | `false` | Featured brand flag |
| `priceSegment` | String | Yes | -- | "Budget", "Mid-range", "Premium" |
| `qualityRating` | Float | Yes | -- | 1-5 editorial rating |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([slug])`
**Relations:** `products` -> Product[], `dealerMappings` -> DealerBrandMapping[], `brandDealers` -> BrandDealer[], `identifiedInquiries` -> ProductInquiry[]

#### 6.2.17 Product

Individual SKU/product. Attached to a ProductType and Brand.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `productTypeId` | String | No | -- | FK -> ProductType.id (CASCADE) |
| `brandId` | String | No | -- | FK -> Brand.id (CASCADE) |
| `name` | String | No | -- | -- |
| `modelNumber` | String | Yes | -- | -- |
| `sku` | String | Yes | -- | Unique |
| `description` | String | Yes | -- | -- |
| `specifications` | String | Yes | -- | JSON: voltage, load, material, etc. |
| `images` | String[] | No | `[]` | Array of image URLs |
| `datasheetUrl` | String | Yes | -- | -- |
| `manualUrl` | String | Yes | -- | -- |
| `certifications` | String[] | No | `[]` | ISI, IEC, etc. |
| `warrantyYears` | Int | Yes | -- | -- |
| `isActive` | Boolean | No | `true` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([brandId])`, `@@index([productTypeId])`, `@@index([sku])`
**Relations:** `productType` -> ProductType, `brand` -> Brand, `rfqItems` -> RFQItem[], `savedProducts` -> SavedProduct[]

#### 6.2.18 SavedProduct

User bookmarks. Unique constraint prevents duplicate saves.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `userId` | String | No | -- | FK -> User.id (CASCADE) |
| `productId` | String | No | -- | FK -> Product.id (CASCADE) |
| `notes` | String | Yes | -- | User's private notes |
| `createdAt` | DateTime | No | `now()` | -- |

**Constraints:** `@@unique([userId, productId])`
**Indexes:** `@@index([userId])`

---

### GROUP 4: RFQ SYSTEM

#### 6.2.19 RFQ

Request for Quotation. A buyer's procurement request containing one or more product line items.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `userId` | String | No | -- | FK -> User.id (CASCADE) |
| `title` | String | No | -- | Min 5 chars |
| `description` | String | Yes | -- | -- |
| `deliveryCity` | String | No | -- | -- |
| `deliveryPincode` | String | No | -- | 6 digits |
| `deliveryAddress` | String | Yes | -- | -- |
| `estimatedDate` | DateTime | Yes | -- | When user needs products |
| `deliveryPreference` | String | No | -- | "delivery", "pickup", "both" |
| `urgency` | String | Yes | -- | "normal" or "urgent" |
| `status` | RFQStatus | No | `DRAFT` | -- |
| `publishedAt` | DateTime | Yes | -- | -- |
| `selectedDealerId` | String | Yes | -- | -- |
| `selectedQuoteId` | String | Yes | -- | -- |
| `completedAt` | DateTime | Yes | -- | -- |
| `aiSuggestions` | String | Yes | -- | JSON: AI-generated suggestions |
| `aiFlags` | String | Yes | -- | JSON: warnings/flags |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([userId])`, `@@index([status])`, `@@index([deliveryPincode])`, `@@index([publishedAt])`
**Relations:** `user` -> User, `items` -> RFQItem[], `quotes` -> Quote[]

#### 6.2.20 RFQItem

Individual line item within an RFQ.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `rfqId` | String | No | -- | FK -> RFQ.id (CASCADE) |
| `productId` | String | No | -- | FK -> Product.id (CASCADE) |
| `quantity` | Int | No | -- | Positive integer |
| `notes` | String | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([rfqId])`, `@@index([productId])`

---

### GROUP 5: QUOTE SYSTEM

#### 6.2.21 Quote

A dealer's sealed bid in response to an RFQ. One quote per dealer per RFQ (enforced by unique constraint).

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `rfqId` | String | No | -- | FK -> RFQ.id (CASCADE) |
| `dealerId` | String | No | -- | FK -> Dealer.id (CASCADE) |
| `totalAmount` | Float | No | -- | Total quote value |
| `shippingCost` | Float | No | `0` | -- |
| `notes` | String | Yes | -- | -- |
| `deliveryDate` | DateTime | Yes | -- | -- |
| `pickupDate` | DateTime | Yes | -- | -- |
| `validUntil` | DateTime | No | -- | Quote expiry |
| `status` | QuoteStatus | No | `SUBMITTED` | -- |
| `submittedAt` | DateTime | No | `now()` | -- |
| `viewedAt` | DateTime | Yes | -- | When buyer first views |
| `selectedAt` | DateTime | Yes | -- | -- |
| `lossReason` | String | Yes | -- | "price", "timing", "distance", "other" |
| `rankPosition` | Int | Yes | -- | Where this quote ranked |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Constraints:** `@@unique([rfqId, dealerId])`
**Indexes:** `@@index([rfqId])`, `@@index([dealerId])`, `@@index([status])`
**Relations:** `rfq` -> RFQ, `dealer` -> Dealer, `items` -> QuoteItem[]

#### 6.2.22 QuoteItem

Line-item pricing within a quote.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `quoteId` | String | No | -- | FK -> Quote.id (CASCADE) |
| `productId` | String | No | -- | -- |
| `quantity` | Int | No | -- | -- |
| `unitPrice` | Float | No | -- | -- |
| `totalPrice` | Float | No | -- | quantity * unitPrice |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([quoteId])`

---

### GROUP 6: PRODUCT INQUIRY SYSTEM

#### 6.2.23 ProductInquiry

Quick inquiry from homepage. No auth required. Admin triages and responds with pricing.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `inquiryNumber` | String | Yes | -- | Unique, format: HUB-{PRODUCT}-{SEQ} |
| `name` | String | No | -- | -- |
| `phone` | String | No | -- | -- |
| `email` | String | Yes | -- | -- |
| `productPhoto` | String | Yes | -- | Uploaded image path |
| `modelNumber` | String | Yes | -- | -- |
| `quantity` | Int | No | `1` | -- |
| `deliveryCity` | String | No | -- | -- |
| `notes` | String (Text) | Yes | -- | -- |
| `status` | String | No | `"new"` | "new", "contacted", "quoted", "closed" |
| `assignedTo` | String | Yes | -- | Admin ID |
| `internalNotes` | String (Text) | Yes | -- | -- |
| `quotedPrice` | Float | Yes | -- | Price per unit |
| `shippingCost` | Float | Yes | -- | -- |
| `totalPrice` | Float | Yes | -- | Including shipping |
| `estimatedDelivery` | String | Yes | -- | e.g., "3-5 business days" |
| `responseNotes` | String (Text) | Yes | -- | -- |
| `respondedAt` | DateTime | Yes | -- | -- |
| `respondedBy` | String | Yes | -- | Admin ID |
| `categoryId` | String | Yes | -- | FK -> Category.id |
| `identifiedBrandId` | String | Yes | -- | FK -> Brand.id |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([status])`, `@@index([phone])`, `@@index([createdAt])`, `@@index([inquiryNumber])`, `@@index([categoryId])`
**Relations:** `pipeline` -> InquiryPipeline?, `category` -> Category?, `identifiedBrand` -> Brand?, `dealerResponses` -> InquiryDealerResponse[]

#### 6.2.24 InquiryDealerResponse

A platform-registered dealer's response to a product inquiry.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `inquiryId` | String | No | -- | FK -> ProductInquiry.id (CASCADE) |
| `dealerId` | String | No | -- | FK -> Dealer.id (CASCADE) |
| `status` | String | No | `"pending"` | "pending", "viewed", "quoted", "declined" |
| `quotedPrice` | Float | Yes | -- | -- |
| `shippingCost` | Float | Yes | `0` | -- |
| `totalPrice` | Float | Yes | -- | -- |
| `estimatedDelivery` | String | Yes | -- | -- |
| `notes` | String (Text) | Yes | -- | -- |
| `viewedAt` | DateTime | Yes | -- | -- |
| `respondedAt` | DateTime | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([inquiryId])`, `@@index([dealerId])`, `@@index([status])`

---

### GROUP 7: INQUIRY PIPELINE (Admin Workflow)

#### 6.2.25 InquiryPipeline

Admin-driven workflow for sourcing quotes from external dealers after receiving a product inquiry.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `inquiryId` | String | No | -- | Unique, FK -> ProductInquiry.id (CASCADE) |
| `identifiedBrandId` | String | Yes | -- | -- |
| `identifiedBrand` | String | Yes | -- | Brand name string |
| `identifiedProduct` | String | Yes | -- | -- |
| `identifiedCategory` | String | Yes | -- | -- |
| `status` | PipelineStatus | No | `BRAND_IDENTIFIED` | -- |
| `aiAnalysis` | String (Text) | Yes | -- | JSON: brand confidence, product details |
| `sentToCustomerAt` | DateTime | Yes | -- | -- |
| `sentVia` | String | Yes | -- | "email", "sms", "both" |
| `customerMessage` | String (Text) | Yes | -- | -- |
| `createdBy` | String | Yes | -- | Admin ID |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([status])`, `@@index([identifiedBrandId])`, `@@index([createdAt])`
**Relations:** `inquiry` -> ProductInquiry, `dealerQuotes` -> InquiryDealerQuote[]

#### 6.2.26 InquiryDealerQuote

Each external dealer contacted during the pipeline sourcing process.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `pipelineId` | String | No | -- | FK -> InquiryPipeline.id (CASCADE) |
| `brandDealerId` | String | Yes | -- | FK -> BrandDealer.id (SET NULL) |
| `dealerId` | String | Yes | -- | Platform dealer ID (no FK) |
| `dealerName` | String | No | -- | Denormalized for history |
| `dealerPhone` | String | No | -- | -- |
| `dealerShopName` | String | Yes | -- | -- |
| `dealerCity` | String | Yes | -- | -- |
| `contactMethod` | ContactMethod | No | `WHATSAPP` | -- |
| `contactedAt` | DateTime | Yes | -- | -- |
| `whatsappMessage` | String (Text) | Yes | -- | -- |
| `quotedPrice` | Float | Yes | -- | -- |
| `shippingCost` | Float | Yes | -- | -- |
| `totalQuotedPrice` | Float | Yes | -- | -- |
| `deliveryDays` | Int | Yes | -- | -- |
| `warrantyInfo` | String | Yes | -- | -- |
| `quoteNotes` | String (Text) | Yes | -- | -- |
| `responseStatus` | QuoteResponseStatus | No | `PENDING` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([pipelineId])`, `@@index([brandDealerId])`, `@@index([responseStatus])`

---

### GROUP 8: BRAND-DEALER NETWORK

#### 6.2.27 BrandDealer

External dealer contacts sourced from brand websites, field visits, or referrals. NOT platform-registered dealers.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `brandId` | String | No | -- | FK -> Brand.id (CASCADE) |
| `name` | String | No | -- | -- |
| `shopName` | String | Yes | -- | -- |
| `phone` | String | No | -- | -- |
| `whatsappNumber` | String | Yes | -- | -- |
| `email` | String | Yes | -- | -- |
| `city` | String | No | -- | -- |
| `state` | String | Yes | -- | -- |
| `pincode` | String | Yes | -- | -- |
| `address` | String | Yes | -- | -- |
| `source` | BrandDealerSource | No | `MANUAL` | -- |
| `sourceUrl` | String | Yes | -- | -- |
| `isVerified` | Boolean | No | `false` | -- |
| `isActive` | Boolean | No | `true` | -- |
| `notes` | String (Text) | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Constraints:** `@@unique([brandId, phone])`
**Indexes:** `@@index([brandId])`, `@@index([city])`, `@@index([isActive])`
**Relations:** `brand` -> Brand, `inquiryQuotes` -> InquiryDealerQuote[]

---

### GROUP 9: COMMUNITY & KNOWLEDGE

#### 6.2.28 CommunityPost

User-generated discussion posts. City-based and category-tagged.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `userId` | String | No | -- | FK -> User.id (CASCADE) |
| `title` | String | No | -- | 5-200 chars |
| `content` | String | No | -- | Min 10 chars |
| `city` | String | Yes | -- | -- |
| `category` | String | Yes | -- | Discussion category |
| `tags` | String[] | No | `[]` | -- |
| `upvotes` | Int | No | `0` | -- |
| `status` | PostStatus | No | `PUBLISHED` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([userId])`, `@@index([city])`, `@@index([status])`, `@@index([createdAt])`
**Relations:** `user` -> User, `comments` -> CommunityComment[]

#### 6.2.29 CommunityComment

Threaded comments on community posts. Self-referential for nesting.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `postId` | String | No | -- | FK -> CommunityPost.id (CASCADE) |
| `userId` | String | No | -- | FK -> User.id (CASCADE) |
| `content` | String | No | -- | -- |
| `parentId` | String | Yes | -- | Self-FK for threading (CASCADE) |
| `upvotes` | Int | No | `0` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([postId])`, `@@index([userId])`, `@@index([parentId])`
**Relations:** `post` -> CommunityPost, `user` -> User, `parent` -> CommunityComment? (self), `replies` -> CommunityComment[]

#### 6.2.30 KnowledgeArticle

Editorial content about electrical products, buying guides, safety standards.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `title` | String | No | -- | -- |
| `slug` | String | No | -- | Unique |
| `content` | String | No | -- | Rich text / Markdown |
| `category` | String | No | -- | -- |
| `tags` | String[] | No | `[]` | -- |
| `metaTitle` | String | Yes | -- | SEO |
| `metaDescription` | String | Yes | -- | SEO |
| `coverImage` | String | Yes | -- | -- |
| `views` | Int | No | `0` | Auto-incremented on read |
| `isPublished` | Boolean | No | `false` | -- |
| `authorId` | String | No | -- | Admin ID |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |
| `publishedAt` | DateTime | Yes | -- | -- |

**Indexes:** `@@index([slug])`, `@@index([category])`, `@@index([isPublished])`

---

### GROUP 10: CHAT & AI

#### 6.2.31 ChatSession

AI chat sessions. Can be anonymous or linked to an authenticated user.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `userId` | String | Yes | -- | -- |
| `userEmail` | String | Yes | -- | For anonymous users |
| `userName` | String | Yes | -- | -- |
| `title` | String | Yes | -- | Auto-generated from first message |
| `status` | String | No | `"active"` | "active" or "closed" |
| `messageCount` | Int | No | `0` | -- |
| `lastMessageAt` | DateTime | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([userId])`, `@@index([userEmail])`, `@@index([createdAt])`
**Relations:** `messages` -> ChatMessage[]

#### 6.2.32 ChatMessage

Individual messages within a chat session. Supports user, assistant, system, and tool roles.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `sessionId` | String | No | -- | FK -> ChatSession.id (CASCADE) |
| `role` | String | No | -- | "user" or "assistant" |
| `content` | String (Text) | No | -- | -- |
| `tokenCount` | Int | Yes | -- | API usage tracking |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([sessionId])`, `@@index([createdAt])`

---

### GROUP 11: CRM

#### 6.2.33 CRMCompany

B2B partner companies tracked in the internal CRM (manufacturers, brands, distributors).

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `name` | String | No | -- | -- |
| `slug` | String | No | -- | Unique |
| `type` | CompanyType | No | `MANUFACTURER` | -- |
| `segment` | CompanySegment | No | `ALL_SEGMENTS` | -- |
| `website` | String | Yes | -- | -- |
| `email` | String | Yes | -- | -- |
| `phone` | String | Yes | -- | -- |
| `linkedIn` | String | Yes | -- | -- |
| `address` | String | Yes | -- | -- |
| `city` | String | Yes | -- | -- |
| `state` | String | Yes | -- | -- |
| `country` | String | No | `"India"` | -- |
| `description` | String (Text) | Yes | -- | -- |
| `productCategories` | String[] | No | `[]` | -- |
| `yearEstablished` | Int | Yes | -- | -- |
| `employeeCount` | String | Yes | -- | Range string |
| `annualRevenue` | String | Yes | -- | Range string |
| `hasApi` | Boolean | No | `false` | -- |
| `digitalMaturity` | String | Yes | -- | low/medium/high |
| `dealerNetworkSize` | String | Yes | -- | small/medium/large |
| `status` | String | No | `"prospect"` | prospect/contacted/interested/negotiating/partner/inactive |
| `priority` | String | No | `"medium"` | low/medium/high |
| `tags` | String[] | No | `[]` | -- |
| `notes` | String (Text) | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([status])`, `@@index([type])`, `@@index([segment])`, `@@index([city])`
**Relations:** `contacts` -> CRMContact[], `outreaches` -> CRMOutreach[]

#### 6.2.34 CRMContact

Individual contacts within a CRM company.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `companyId` | String | No | -- | FK -> CRMCompany.id (CASCADE) |
| `name` | String | No | -- | -- |
| `email` | String | Yes | -- | -- |
| `phone` | String | Yes | -- | -- |
| `linkedIn` | String | Yes | -- | -- |
| `designation` | String | Yes | -- | CEO, Head of Sales, etc. |
| `department` | String | Yes | -- | Sales, Technology, etc. |
| `decisionMaker` | Boolean | No | `false` | -- |
| `isPrimary` | Boolean | No | `false` | -- |
| `status` | String | No | `"active"` | active/left_company/do_not_contact |
| `notes` | String (Text) | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([companyId])`, `@@index([email])`, `@@index([designation])`
**Relations:** `company` -> CRMCompany, `outreaches` -> CRMOutreach[]

#### 6.2.35 CRMOutreach

Every outreach attempt (email, call, WhatsApp, LinkedIn) tracked with full lifecycle.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `companyId` | String | No | -- | FK -> CRMCompany.id (CASCADE) |
| `contactId` | String | Yes | -- | FK -> CRMContact.id (SET NULL) |
| `type` | OutreachType | No | `EMAIL` | -- |
| `subject` | String | Yes | -- | -- |
| `content` | String (Text) | No | -- | -- |
| `templateUsed` | String | Yes | -- | Template name if used |
| `scheduledAt` | DateTime | Yes | -- | -- |
| `sentAt` | DateTime | Yes | -- | -- |
| `status` | OutreachStatus | No | `SCHEDULED` | -- |
| `openedAt` | DateTime | Yes | -- | -- |
| `repliedAt` | DateTime | Yes | -- | -- |
| `responseContent` | String (Text) | Yes | -- | -- |
| `responseSentiment` | String | Yes | -- | positive/neutral/negative |
| `followUpDate` | DateTime | Yes | -- | -- |
| `followUpNumber` | Int | No | `1` | -- |
| `notes` | String (Text) | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([companyId])`, `@@index([contactId])`, `@@index([status])`, `@@index([scheduledAt])`, `@@index([type])`

#### 6.2.36 CRMMeeting

Scheduled meetings with CRM companies.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `companyId` | String | No | -- | -- |
| `title` | String | No | -- | -- |
| `description` | String (Text) | Yes | -- | -- |
| `scheduledAt` | DateTime | No | -- | -- |
| `duration` | Int | No | `30` | Minutes |
| `meetingLink` | String | Yes | -- | Zoom/Meet link |
| `location` | String | Yes | -- | -- |
| `attendees` | String (Text) | Yes | -- | JSON array |
| `status` | String | No | `"scheduled"` | scheduled/completed/cancelled/rescheduled |
| `agenda` | String (Text) | Yes | -- | -- |
| `notes` | String (Text) | Yes | -- | -- |
| `outcome` | String | Yes | -- | positive/follow_up_needed/not_interested |
| `nextSteps` | String (Text) | Yes | -- | -- |
| `reminders` | String | Yes | -- | JSON array of reminder times |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([companyId])`, `@@index([scheduledAt])`, `@@index([status])`

#### 6.2.37 CRMPipelineStage

Configurable pipeline stages for the CRM funnel.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `name` | String | No | -- | Unique |
| `displayName` | String | No | -- | -- |
| `color` | String | No | -- | Hex color |
| `sortOrder` | Int | No | `0` | -- |
| `isActive` | Boolean | No | `true` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([sortOrder])`

#### 6.2.38 EmailTemplate

Reusable email templates for CRM outreach with placeholder support.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `name` | String | No | -- | Unique |
| `subject` | String | No | -- | -- |
| `body` | String (Text) | No | -- | HTML with placeholders |
| `category` | String | No | -- | outreach/follow_up/partnership |
| `placeholders` | String[] | No | `[]` | Available placeholders |
| `isActive` | Boolean | No | `true` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([category])`

---

### GROUP 12: SCRAPING SYSTEM

#### 6.2.39 ScrapeBrand

Configuration for brand websites to scrape product data from.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `name` | String | No | -- | Unique |
| `slug` | String | No | -- | Unique |
| `website` | String | No | -- | -- |
| `logoUrl` | String | Yes | -- | -- |
| `isActive` | Boolean | No | `true` | -- |
| `scrapeFrequency` | String | No | `"weekly"` | daily/weekly/monthly |
| `lastScrapedAt` | DateTime | Yes | -- | -- |
| `nextScrapeAt` | DateTime | Yes | -- | -- |
| `catalogUrls` | String (Text) | Yes | -- | JSON array of URLs |
| `selectors` | String (Text) | Yes | -- | JSON CSS selectors |
| `totalProducts` | Int | No | `0` | -- |
| `lastScrapeCount` | Int | No | `0` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([slug])`, `@@index([isActive])`
**Relations:** `scrapeJobs` -> ScrapeJob[], `scrapedProducts` -> ScrapedProduct[]

#### 6.2.40 ScrapeJob

Individual scrape job execution records.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `brandId` | String | No | -- | FK -> ScrapeBrand.id (CASCADE) |
| `status` | ScrapeStatus | No | `PENDING` | -- |
| `startedAt` | DateTime | Yes | -- | -- |
| `completedAt` | DateTime | Yes | -- | -- |
| `productsFound` | Int | No | `0` | -- |
| `productsCreated` | Int | No | `0` | -- |
| `productsUpdated` | Int | No | `0` | -- |
| `errors` | Int | No | `0` | -- |
| `logs` | String (Text) | Yes | -- | JSON array of log entries |
| `errorDetails` | String (Text) | Yes | -- | JSON array of errors |
| `configSnapshot` | String (Text) | Yes | -- | JSON snapshot of selectors used |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([brandId])`, `@@index([status])`, `@@index([createdAt])`

#### 6.2.41 ScrapedProduct

Raw product data before normalization. Linked to a Product after admin-approved processing.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `brandId` | String | No | -- | FK -> ScrapeBrand.id (CASCADE) |
| `sourceUrl` | String (Text) | No | -- | -- |
| `scrapedAt` | DateTime | No | `now()` | -- |
| `rawName` | String | No | -- | -- |
| `rawCategory` | String | Yes | -- | -- |
| `rawSubCategory` | String | Yes | -- | -- |
| `rawModelNumber` | String | Yes | -- | -- |
| `rawSku` | String | Yes | -- | -- |
| `rawDescription` | String (Text) | Yes | -- | -- |
| `rawSpecifications` | String (Text) | Yes | -- | JSON object |
| `rawImages` | String[] | No | `[]` | -- |
| `rawDatasheetUrl` | String | Yes | -- | -- |
| `rawManualUrl` | String | Yes | -- | -- |
| `rawPrice` | String | Yes | -- | MRP if available |
| `rawCertifications` | String[] | No | `[]` | -- |
| `rawWarranty` | String | Yes | -- | -- |
| `isProcessed` | Boolean | No | `false` | -- |
| `processedAt` | DateTime | Yes | -- | -- |
| `productId` | String | Yes | -- | Link to normalized Product |
| `isValid` | Boolean | No | `true` | -- |
| `validationErrors` | String (Text) | Yes | -- | JSON array |
| `contentHash` | String | Yes | -- | Deduplication hash |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([brandId])`, `@@index([isProcessed])`, `@@index([contentHash])`, `@@index([rawModelNumber])`, `@@index([sourceUrl])`

#### 6.2.42 ScrapeMapping

Rules for mapping raw scraped data to normalized categories.

Fields: `id`, `brandPattern`, `categoryPattern`, `namePattern`, `targetCategoryId`, `targetSubCategoryId`, `targetProductTypeId`, `priority` (Int, default 0), `isActive` (Boolean, default true), `createdAt`, `updatedAt`.

**Indexes:** `@@index([priority])`, `@@index([isActive])`

#### 6.2.43 ScrapeTemplate

Reusable scraping configuration templates shared across brands.

Fields: `id`, `name` (unique), `description`, `selectors` (Text, JSON), `brandIds` (String[]), `createdAt`, `updatedAt`.

---

### GROUP 13: SYSTEM & AUDIT

#### 6.2.44 AuditLog

Immutable record of all admin actions for compliance and forensics.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `action` | AuditAction | No | -- | -- |
| `entityType` | String | No | -- | "dealer", "product", "rfq", etc. |
| `entityId` | String | No | -- | -- |
| `performedBy` | String | No | -- | Admin ID |
| `details` | String | Yes | -- | JSON |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([entityType, entityId])`, `@@index([performedBy])`, `@@index([createdAt])`

#### 6.2.45 FraudFlag

System-generated or admin-raised fraud alerts.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `entityType` | String | No | -- | user/dealer/rfq/quote |
| `entityId` | String | No | -- | -- |
| `flagType` | String | No | -- | duplicate_gst, fake_quote, spam_rfq, etc. |
| `severity` | String | No | -- | low/medium/high/critical |
| `description` | String | No | -- | -- |
| `status` | String | No | `"open"` | open/investigating/resolved/false_positive |
| `flaggedBy` | String | Yes | -- | System or Admin ID |
| `resolvedBy` | String | Yes | -- | -- |
| `resolvedAt` | DateTime | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([entityType, entityId])`, `@@index([status])`, `@@index([severity])`

#### 6.2.46 ContactSubmission

Public contact form submissions with CRM-style status tracking.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `name` | String | No | -- | -- |
| `email` | String | No | -- | -- |
| `phone` | String | Yes | -- | -- |
| `role` | String | No | -- | homeowner/contractor/dealer/brand/other |
| `message` | String (Text) | No | -- | -- |
| `source` | String | No | `"contact_form"` | contact_form/ai_assistant |
| `status` | String | No | `"new"` | new/contacted/qualified/converted/closed |
| `assignedTo` | String | Yes | -- | Admin ID |
| `notes` | String (Text) | Yes | -- | Internal notes |
| `emailSent` | Boolean | No | `false` | -- |
| `emailSentAt` | DateTime | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([email])`, `@@index([status])`, `@@index([createdAt])`

#### 6.2.47 UserActivity

Comprehensive activity log for all platform events. The analytics backbone.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `actorType` | String | No | -- | user/dealer/admin/anonymous |
| `actorId` | String | Yes | -- | -- |
| `actorEmail` | String | Yes | -- | -- |
| `actorName` | String | Yes | -- | -- |
| `activityType` | ActivityType | No | -- | -- |
| `description` | String | No | -- | Human-readable |
| `metadata` | String (Text) | Yes | -- | JSON payload |
| `entityType` | String | Yes | -- | -- |
| `entityId` | String | Yes | -- | -- |
| `ipAddress` | String | Yes | -- | -- |
| `userAgent` | String | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([actorType, actorId])`, `@@index([activityType])`, `@@index([entityType, entityId])`, `@@index([createdAt])`, `@@index([actorEmail])`

---

### GROUP 14: NOTIFICATIONS

#### 6.2.48 DevicePushToken

Expo push tokens registered by mobile apps.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `token` | String | No | -- | Unique |
| `userId` | String | No | -- | -- |
| `userType` | String | No | -- | user/dealer |
| `platform` | String | No | -- | ios/android |
| `isActive` | Boolean | No | `true` | -- |
| `createdAt` | DateTime | No | `now()` | -- |
| `updatedAt` | DateTime | No | `@updatedAt` | -- |

**Indexes:** `@@index([userId])`, `@@index([userType])`, `@@index([isActive])`

#### 6.2.49 Notification

In-app notification records displayed in the notification center.

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | String (UUID) | No | `uuid()` | PK |
| `userId` | String | No | -- | -- |
| `userType` | String | No | -- | user/dealer |
| `title` | String | No | -- | -- |
| `body` | String | No | -- | -- |
| `data` | String | Yes | -- | JSON payload |
| `read` | Boolean | No | `false` | -- |
| `readAt` | DateTime | Yes | -- | -- |
| `createdAt` | DateTime | No | `now()` | -- |

**Indexes:** `@@index([userId])`, `@@index([read])`, `@@index([createdAt])`

---

## 6.3 Database Configuration

**Engine:** PostgreSQL 15
**ORM:** Prisma Client (generator: prisma-client-js)
**Connection:** Single `DATABASE_URL` environment variable
**Migrations:** Prisma Migrate (`npx prisma migrate dev` / `npx prisma migrate deploy`)

### Extensions (planned for Phase 2)
- `uuid-ossp` -- UUID generation (currently handled by Prisma)
- `pg_trgm` -- Trigram-based fuzzy search for product names
- `pgvector` -- Vector similarity search for AI-powered recommendations
- `pg_stat_statements` -- Query performance monitoring

### Soft Delete Strategy
- Dealers: `status = DELETED` (enum value, not actual row deletion)
- Users: `status = DELETED` (enum value)
- BrandDealers: `isActive = false` (boolean flag)
- Products, Categories, SubCategories, ProductTypes: `isActive = false`
- All other tables: Hard delete with CASCADE where appropriate

### Audit Fields Convention
Every model includes `createdAt` (DateTime, default `now()`) and `updatedAt` (DateTime, `@updatedAt`). Write-once tables (OTP, AuditLog, UserActivity, ChatMessage) include only `createdAt`.

---

## 6.4 Entity Relationship Summary

```
User 1--* RFQ 1--* RFQItem *--1 Product *--1 ProductType *--1 SubCategory *--1 Category
User 1--* CommunityPost 1--* CommunityComment (self-referential for threading)
User 1--* SavedProduct *--1 Product
User 1--1 ProfessionalProfile 1--* ProfessionalDocument

Dealer 1--* DealerBrandMapping *--1 Brand
Dealer 1--* DealerCategoryMapping *--1 Category
Dealer 1--* DealerServiceArea
Dealer 1--* Quote *--1 RFQ
Dealer 1--* DealerReview
Dealer 1--* InquiryDealerResponse *--1 ProductInquiry

Product *--1 Brand
Product *--1 ProductType

ProductInquiry 1--1 InquiryPipeline 1--* InquiryDealerQuote *--? BrandDealer *--1 Brand

ChatSession 1--* ChatMessage

CRMCompany 1--* CRMContact
CRMCompany 1--* CRMOutreach *--? CRMContact

ScrapeBrand 1--* ScrapeJob
ScrapeBrand 1--* ScrapedProduct
```

---

# SECTION 7 -- API SPECIFICATION

Express.js REST API. Base URL: `/api`. All responses are JSON. Authentication via Bearer JWT in the `Authorization` header.

---

## 7.1 Authentication Routes (`/api/auth/*`)

20 route files, 131+ endpoints total. Auth routes are the foundation.

| # | Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/auth/send-otp` | None | otpLimiter (5/15min) | Send 6-digit OTP via email or SMS |
| 2 | `POST` | `/api/auth/verify-otp` | None | loginLimiter (10/15min) | Verify OTP and return JWT (or signal profile needed) |
| 3 | `POST` | `/api/auth/user/signup` | None | -- | Create user after OTP verification |
| 4 | `GET` | `/api/auth/me` | Token (any) | -- | Get current authenticated user/dealer/admin |
| 5 | `GET` | `/api/auth/google` | None | -- | Initiate Google OAuth flow |
| 6 | `GET` | `/api/auth/google/callback` | None | -- | OAuth callback, redirects with JWT |
| 7 | `POST` | `/api/auth/complete-profile` | Token (user) | -- | Set role, city, phone after OAuth signup |
| 8 | `POST` | `/api/auth/dealer/register` | None | -- | Register new dealer (email, password, GST, KYC) |
| 9 | `POST` | `/api/auth/dealer/login` | None | credentialLoginLimiter (10/15min) | Dealer email+password login |
| 10 | `POST` | `/api/auth/admin/login` | None | credentialLoginLimiter (10/15min) | Admin email+password login |
| 11 | `POST` | `/api/auth/refresh-token` | None | refreshLimiter (20/hr) | Rotate refresh token, issue new JWT |
| 12 | `POST` | `/api/auth/logout` | None | -- | Revoke refresh token |
| 13 | `POST` | `/api/auth/logout-all` | Token (any) | -- | Revoke all refresh tokens for user |
| 14 | `POST` | `/api/auth/forgot-password` | None | passwordResetLimiter (3/hr) | Send password reset link (dealers) |
| 15 | `POST` | `/api/auth/reset-password` | None | -- | Reset password with token |

### Key Request/Response Types

**POST /api/auth/send-otp**
```typescript
// Request
{ phone?: string; email?: string; type: "login" | "signup" }
// Response 200
{ message: string; debug_otp?: string /* dev only */ }
```

**POST /api/auth/verify-otp**
```typescript
// Request
{ phone?: string; email?: string; otp: string; type: "login" | "signup" }
// Response 200 (existing user)
{ token: string; user: { id, email, phone, name, role, city, type } }
// Response 200 (new signup, needs profile)
{ requiresProfile: true; identifier: string; identifierType: "phone" | "email" }
```

**POST /api/auth/dealer/register**
```typescript
// Request
{ email: string; password: string; businessName: string; ownerName: string;
  phone: string; gstNumber: string; panNumber?: string;
  dealerType?: DealerType; yearsInOperation?: number;
  shopAddress: string; city: string; state: string; pincode: string }
// Response 201
{ message: string; token: string;
  dealer: { id, email, businessName, status, onboardingStep } }
```

**GET /api/auth/me**
```typescript
// Response 200
{ user: { id, email, phone?, name, role, city, type: "user"|"dealer"|"admin",
           profileComplete: boolean, status? } }
```

---

## 7.2 Product Routes (`/api/products/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/products/categories` | None | List all active categories with subcategories |
| 2 | `GET` | `/api/products/categories/:slug` | None | Single category with subcategories and product types |
| 3 | `GET` | `/api/products/subcategories/:slug` | None | Subcategory with product types |
| 4 | `GET` | `/api/products/product-types/:slug` | None | Product type with paginated products and brand filter |
| 5 | `GET` | `/api/products/:id` | None | Single product with brand, type hierarchy, and 6 similar products |
| 6 | `GET` | `/api/products/search/query?q=` | None | Full-text search across name, description, modelNumber |
| 7 | `POST` | `/api/products/:id/save` | Optional | Save/bookmark product (requires auth) |
| 8 | `GET` | `/api/products/saved/list` | Optional | Get user's saved products |
| 9 | `GET` | `/api/products/brands/list` | None | List all active brands |

### Query Parameters for Product Type Listing
```
GET /api/products/product-types/:slug?brandId=uuid&page=1&limit=20
```

### Search Response
```typescript
{
  products: Product[];
  pagination: { total: number; page: number; limit: number; pages: number }
}
```

---

## 7.3 Inquiry Routes (`/api/inquiry/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/inquiry/submit` | None | Submit product inquiry (multipart, supports photo upload) |
| 2 | `GET` | `/api/inquiry/track?phone=X&number=Y` | None | Track inquiry status by phone or inquiry number |
| 3 | `GET` | `/api/inquiry/admin/list` | Admin | List all inquiries with pagination, status filter, search |
| 4 | `GET` | `/api/inquiry/admin/:id` | Admin | Single inquiry detail with dealer responses |
| 5 | `PATCH` | `/api/inquiry/admin/:id/respond` | Admin | Send quote/response to inquiry |
| 6 | `PATCH` | `/api/inquiry/admin/:id/status` | Admin | Quick status update |

---

## 7.4 RFQ Routes (`/api/rfqs/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/rfqs/` | User | Create RFQ with items (generates AI suggestions) |
| 2 | `POST` | `/api/rfqs/:id/publish` | User | Publish RFQ, match dealers, send notifications |
| 3 | `GET` | `/api/rfqs/` | User | List user's RFQs with pagination |
| 4 | `GET` | `/api/rfqs/:id` | User | Single RFQ with quotes ranked by price |
| 5 | `POST` | `/api/rfqs/:id/select-quote` | User | Select winning quote (transaction: updates RFQ, quote statuses, dealer metrics, loss analysis) |
| 6 | `POST` | `/api/rfqs/:id/cancel` | User | Cancel RFQ |

---

## 7.5 Quote Routes (`/api/quotes/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/quotes/available-rfqs` | Dealer | RFQs matching dealer's brands, categories, service areas |
| 2 | `POST` | `/api/quotes/submit` | Dealer | Submit sealed bid for an RFQ |
| 3 | `GET` | `/api/quotes/my-quotes` | Dealer | List dealer's submitted quotes with pagination |
| 4 | `GET` | `/api/quotes/analytics` | Dealer | Performance analytics (win rate, loss reasons, avg quote) |

---

## 7.6 Dealer Routes (`/api/dealer/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/dealer/profile` | Dealer | Full profile with brand/category mappings and stats |
| 2 | `PATCH` | `/api/dealer/profile` | Dealer | Update profile fields |
| 3 | `POST` | `/api/dealer/brands` | Dealer | Add brand mapping |
| 4 | `POST` | `/api/dealer/categories` | Dealer | Add category mapping |
| 5 | `POST` | `/api/dealer/service-areas` | Dealer | Add service area (pincode) |
| 6 | `DELETE` | `/api/dealer/service-areas/:id` | Dealer | Remove service area |
| 7 | `POST` | `/api/dealer/documents` | Dealer | Upload KYC document (multipart) |
| 8 | `DELETE` | `/api/dealer/documents/:documentType` | Dealer | Delete uploaded document |
| 9 | `POST` | `/api/dealer/shop-images` | Dealer | Upload shop image (max 6) |
| 10 | `DELETE` | `/api/dealer/shop-images/:index` | Dealer | Delete shop image by index |
| 11 | `GET` | `/api/dealer/insights` | Dealer | AI-generated performance insights |

---

## 7.7 Dealer Inquiry Routes (`/api/dealer-inquiry/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/dealer-inquiry/available` | Dealer | Inquiries matching dealer's brands/categories |
| 2 | `GET` | `/api/dealer-inquiry/:id` | Dealer | Single inquiry detail (auto-marks as viewed) |
| 3 | `POST` | `/api/dealer-inquiry/:id/quote` | Dealer | Submit quote for product inquiry |
| 4 | `GET` | `/api/dealer-inquiry/my-quotes/list` | Dealer | List all quotes this dealer has submitted |

---

## 7.8 Admin Routes (`/api/admin/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/admin/dealers` | Admin | List dealers with status/search/pagination |
| 2 | `GET` | `/api/admin/dealers/pending` | Admin | Legacy: pending verification dealers |
| 3 | `POST` | `/api/admin/dealers/:id/verify` | Admin | Verify or reject dealer |
| 4 | `POST` | `/api/admin/dealers/:id/suspend` | Admin | Suspend dealer |
| 5 | `POST` | `/api/admin/categories` | Admin | Create product category |
| 6 | `POST` | `/api/admin/brands` | Admin | Create brand |
| 7 | `POST` | `/api/admin/products` | Admin | Create product |
| 8 | `GET` | `/api/admin/dashboard/stats` | Admin | Platform-wide metrics |
| 9 | `GET` | `/api/admin/products` | Admin | List products with search/filter |
| 10 | `GET` | `/api/admin/rfqs` | Admin | List all RFQs |
| 11 | `GET` | `/api/admin/fraud-flags` | Admin | Open fraud flags |
| 12 | `POST` | `/api/admin/fraud-flags/:id/resolve` | Admin | Resolve fraud flag |
| 13 | `GET` | `/api/admin/professionals/pending` | Admin | Professionals awaiting verification |
| 14 | `POST` | `/api/admin/professionals/:id/verify` | Admin | Approve or reject professional |
| 15 | `GET` | `/api/admin/ai-insights` | Admin | AI-generated platform insights |

---

## 7.9 Professional Routes (`/api/professional/*`)

All routes require `authenticateToken`.

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/professional/profile` | Token | Get professional profile with documents |
| 2 | `POST` | `/api/professional/onboarding` | Token | Submit profile + documents for verification (multipart) |
| 3 | `POST` | `/api/professional/portfolio` | Token | Upload portfolio image |
| 4 | `DELETE` | `/api/professional/documents/:id` | Token | Delete uploaded document |
| 5 | `PATCH` | `/api/professional/profile` | Token | Update profile fields |

---

## 7.10 Community Routes (`/api/community/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/community/posts` | Optional | List posts with city/category filter |
| 2 | `GET` | `/api/community/posts/:id` | Optional | Single post with threaded comments |
| 3 | `POST` | `/api/community/posts` | User | Create post |
| 4 | `POST` | `/api/community/comments` | User | Create comment (supports threading via parentId) |
| 5 | `POST` | `/api/community/posts/:id/upvote` | User | Upvote post |

---

## 7.11 Knowledge Routes (`/api/knowledge/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `GET` | `/api/knowledge/articles` | None | List published articles with search and category filter |
| 2 | `GET` | `/api/knowledge/articles/:slug` | None | Single article (auto-increments view count) |
| 3 | `GET` | `/api/knowledge/categories` | None | Distinct article categories |

---

## 7.12 Chat Routes (`/api/chat/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/chat/sessions` | Optional | Create new AI chat session |
| 2 | `POST` | `/api/chat/message` | Optional | Send message, get AI response (with tool use) |
| 3 | `POST` | `/api/chat/message/stream` | Optional | SSE streaming chat response |
| 4 | `GET` | `/api/chat/sessions/:sessionId/messages` | Optional | Get session message history |
| 5 | `POST` | `/api/chat/parse-quote` | Optional | Parse raw text into structured dealer quote (AI) |
| 6 | `GET` | `/api/chat/admin/sessions` | Admin | List all chat sessions |
| 7 | `GET` | `/api/chat/admin/sessions/:sessionId` | Admin | Session detail with all messages |
| 8 | `GET` | `/api/chat/admin/stats` | Admin | Chat analytics |
| 9 | `PATCH` | `/api/chat/admin/sessions/:sessionId` | Admin | Update session status |

### SSE Stream Format
```
data: {"type":"text","text":"Hello..."}
data: {"type":"tool_use","name":"search_products","input":{...}}
data: {"type":"tool_result","content":"Found 3 products..."}
data: {"type":"done","messageId":"uuid"}
```

---

## 7.13 CRM Routes (`/api/crm/*`)

All routes require Admin authentication.

| # | Method | Path | Description |
|---|---|---|---|
| 1 | `GET` | `/api/crm/companies` | List companies with filters (status, type, segment, city, search) |
| 2 | `GET` | `/api/crm/companies/:id` | Company detail with contacts and outreach history |
| 3 | `POST` | `/api/crm/companies` | Create company (auto-generates slug) |
| 4 | `PUT` | `/api/crm/companies/:id` | Update company |
| 5 | `DELETE` | `/api/crm/companies/:id` | Delete company |
| 6 | `POST` | `/api/crm/companies/bulk-import` | Bulk import companies from JSON array |
| 7 | `GET` | `/api/crm/companies/:companyId/contacts` | List contacts for a company |
| 8 | `POST` | `/api/crm/contacts` | Create contact |
| 9 | `PUT` | `/api/crm/contacts/:id` | Update contact |
| 10 | `DELETE` | `/api/crm/contacts/:id` | Delete contact |
| 11 | `GET` | `/api/crm/outreaches` | List outreaches with filters |
| 12 | `POST` | `/api/crm/outreaches` | Create outreach |
| 13 | `PUT` | `/api/crm/outreaches/:id` | Update outreach |
| 14 | `POST` | `/api/crm/outreaches/:id/sent` | Mark outreach as sent |
| 15 | `POST` | `/api/crm/outreaches/:id/response` | Record outreach response (auto-updates company status) |
| 16 | `GET` | `/api/crm/meetings` | List meetings |
| 17 | `POST` | `/api/crm/meetings` | Create meeting |
| 18 | `PUT` | `/api/crm/meetings/:id` | Update meeting |
| 19 | `POST` | `/api/crm/meetings/:id/complete` | Complete meeting with notes and outcome |
| 20 | `GET` | `/api/crm/email-templates` | List email templates |
| 21 | `GET` | `/api/crm/email-templates/:id` | Single template |
| 22 | `POST` | `/api/crm/email-templates` | Create template |
| 23 | `PUT` | `/api/crm/email-templates/:id` | Update template |
| 24 | `GET` | `/api/crm/pipeline` | Pipeline overview (counts by stage, recent outreaches, upcoming meetings, pending follow-ups) |

---

## 7.14 Inquiry Pipeline Routes (`/api/inquiry-pipeline/*`)

All routes require Admin authentication.

| # | Method | Path | Description |
|---|---|---|---|
| 1 | `POST` | `/api/inquiry-pipeline/:inquiryId/create` | Create pipeline with AI analysis for an inquiry |
| 2 | `GET` | `/api/inquiry-pipeline/:inquiryId` | Get pipeline with all dealer quotes |
| 3 | `POST` | `/api/inquiry-pipeline/:pipelineId/auto-match` | Auto-find matching dealers from BrandDealer directory |
| 4 | `POST` | `/api/inquiry-pipeline/:pipelineId/add-dealer` | Add dealer to pipeline |
| 5 | `PATCH` | `/api/inquiry-pipeline/:pipelineId/quotes/:quoteId` | Update dealer quote/price/status |
| 6 | `DELETE` | `/api/inquiry-pipeline/:pipelineId/quotes/:quoteId` | Remove dealer from pipeline |
| 7 | `POST` | `/api/inquiry-pipeline/:pipelineId/send-to-customer` | Compile best quotes and email to customer |

---

## 7.15 Brand Dealer Routes (`/api/brand-dealers/*`)

All routes require Admin authentication.

| # | Method | Path | Description |
|---|---|---|---|
| 1 | `GET` | `/api/brand-dealers/` | List with filters (brandId, city, search) |
| 2 | `GET` | `/api/brand-dealers/brands-summary` | Dealer count per brand |
| 3 | `POST` | `/api/brand-dealers/` | Create external dealer entry |
| 4 | `PATCH` | `/api/brand-dealers/:id` | Update dealer |
| 5 | `DELETE` | `/api/brand-dealers/:id` | Soft delete (isActive = false) |

---

## 7.16 Contact Routes (`/api/contact/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/contact/submit` | None | Submit contact form (sends admin notification + auto-reply) |
| 2 | `GET` | `/api/contact/submissions` | Admin | List all submissions |
| 3 | `GET` | `/api/contact/submissions/:id` | Admin | Single submission |
| 4 | `PATCH` | `/api/contact/submissions/:id` | Admin | Update status and notes |
| 5 | `DELETE` | `/api/contact/submissions/:id` | Admin | Delete submission |
| 6 | `GET` | `/api/contact/stats` | Admin | Submission statistics |

---

## 7.17 Notification Routes (`/api/notifications/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/notifications/register-token` | Token | Register Expo push token |
| 2 | `POST` | `/api/notifications/deregister-token` | Token | Deregister push token on logout |
| 3 | `GET` | `/api/notifications/` | Token | Get in-app notifications with unread count |
| 4 | `POST` | `/api/notifications/mark-read` | Token | Mark notifications as read (specific IDs or all) |

---

## 7.18 Slip Scanner Routes (`/api/slip-scanner/*`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/slip-scanner/parse` | None | Upload image/PDF, parse with Claude Vision AI |
| 2 | `GET` | `/api/slip-scanner/brand-suggestions?productName=` | None | Top 5 brand suggestions for a product name |
| 3 | `POST` | `/api/slip-scanner/create-inquiries` | User | Bulk-create inquiries from parsed slip data |

---

## 7.19 Scraper Routes (`/api/admin/scraper/*`)

All routes require Admin authentication.

| # | Method | Path | Description |
|---|---|---|---|
| 1 | `GET` | `/api/admin/scraper/brands` | List configured brand scrapers with stats |
| 2 | `GET` | `/api/admin/scraper/stats` | Overall scraping statistics |
| 3 | `GET` | `/api/admin/scraper/jobs` | List recent scrape jobs with pagination |
| 4 | `GET` | `/api/admin/scraper/jobs/:id` | Single job with parsed logs |
| 5 | `POST` | `/api/admin/scraper/scrape/:brandSlug` | Start scrape job (async, returns immediately) |
| 6 | `POST` | `/api/admin/scraper/scrape-all` | Start scraping all brands (async) |
| 7 | `GET` | `/api/admin/scraper/products` | List scraped products (raw data) |
| 8 | `GET` | `/api/admin/scraper/products/:id` | Single scraped product |
| 9 | `POST` | `/api/admin/scraper/products/:id/process` | Normalize scraped product into catalog Product |
| 10 | `DELETE` | `/api/admin/scraper/products/:id` | Delete invalid/duplicate scraped product |

---

## 7.20 Database Routes (`/api/database/*`)

Admin-only diagnostic/exploration endpoints. All require Admin authentication.

| # | Method | Path | Description |
|---|---|---|---|
| 1 | `GET` | `/api/database/overview` | Row counts for all 36+ tables |
| 2 | `GET` | `/api/database/users` | Paginated user listing |
| 3 | `GET` | `/api/database/dealers` | Paginated dealer listing |
| 4 | `GET` | `/api/database/products` | Paginated product listing |
| 5 | `GET` | `/api/database/inquiries` | Paginated inquiry listing |
| 6 | `GET` | `/api/database/rfqs` | Paginated RFQ listing |
| 7 | `GET` | `/api/database/quotes` | Paginated quote listing |
| 8 | `GET` | `/api/database/activities` | Paginated activity log |
| 9 | `GET` | `/api/database/contacts` | Contact submissions |
| 10 | `GET` | `/api/database/chat-sessions` | Chat sessions with message counts |
| 11 | `GET` | `/api/database/categories` | Categories with subcategory tree |
| 12 | `GET` | `/api/database/brands` | Brands with product/dealer counts |

---

## 7.21 Middleware Chain

Every request passes through this ordered middleware stack:

| Order | Middleware | Source | Purpose |
|---|---|---|---|
| 1 | `cors` | `cors` | Origin whitelist: frontend URL + localhost |
| 2 | `helmet` | `helmet` | Base security headers (HSTS, X-Frame-Options) |
| 3 | `securityHeaders` | Custom | CSP, Permissions-Policy, Referrer-Policy |
| 4 | `requestId` | Custom | Attach UUID `X-Request-ID` to every request |
| 5 | `blockMaliciousAgents` | Custom | Block sqlmap, nikto, mass scanners |
| 6 | `preventParamPollution` | Custom | Normalize array query params to last value |
| 7 | `morgan` | `morgan` | HTTP request logging (`combined` format) |
| 8 | `express.json` | Express | JSON body parsing (50MB limit) |
| 9 | `express.urlencoded` | Express | URL-encoded body parsing |
| 10 | `sanitizeInputs` | Custom | Strip `<>` and null bytes from all string values |
| 11 | `detectAttacks` | Custom | Block SQL injection, XSS, path traversal, template injection patterns (skips auth/chat/multipart routes) |
| 12 | `cookieParser` | `cookie-parser` | Parse cookies for session support |
| 13 | `passport.initialize` | Passport | Google OAuth strategy initialization |

**Per-route middleware (applied at the route level, not globally):**
- `authenticateUser` -- JWT verification, user type must be "user"
- `authenticateDealer` -- JWT verification, user type must be "dealer"
- `authenticateAdmin` -- JWT verification, user type must be "admin"
- `authenticateToken` -- JWT verification, any user type
- `optionalAuth` -- JWT verification if present, proceeds regardless
- `validateBody(schema)` -- Zod schema validation on `req.body`
- Rate limiters (per-route, see 7.22)

---

## 7.22 Rate Limiting Configuration

| Limiter | Window | Max Requests | Applied To |
|---|---|---|---|
| `otpLimiter` | 15 min | 5 | POST /api/auth/send-otp |
| `loginLimiter` | 15 min | 10 | POST /api/auth/verify-otp |
| `credentialLoginLimiter` | 15 min | 10 (skip success) | POST /api/auth/dealer/login, POST /api/auth/admin/login |
| `passwordResetLimiter` | 1 hour | 3 | POST /api/auth/forgot-password |
| `refreshLimiter` | 1 hour | 20 | POST /api/auth/refresh-token |
| `uploadLimiter` | 15 min | 20 | File upload endpoints |
| `inquiryLimiter` | 1 hour | 10 | POST /api/inquiry/submit |
| `contactLimiter` | 1 hour | 5 | POST /api/contact/submit |
| `rfqLimiter` | 1 hour | 20 | POST /api/rfqs/ |
| `quoteLimiter` | 1 hour | 50 | POST /api/quotes/submit |
| `adminLimiter` | 15 min | 300 | All /api/admin/* |
| `scraperLimiter` | 1 hour | 5 | POST /api/admin/scraper/scrape/* |
| `aiLimiter` | 15 min | 30 | POST /api/chat/message, /api/chat/message/stream |

All limiters include `Retry-After` header in 429 responses.

---

## 7.23 Error Response Format

Every error response follows this structure:

```typescript
// Standard error
{
  "error": "Human-readable error message"
}

// Validation error (Zod)
{
  "error": "Validation failed",
  "details": [
    { "path": "email", "message": "Invalid email address" },
    { "path": "phone", "message": "Phone must be at least 10 digits" }
  ]
}

// Rate limit error
{
  "error": "Too many OTP requests. Please wait 15 minutes.",
  "retryAfter": "See Retry-After header"
}
```

### HTTP Status Code Usage

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created (new resource) |
| 400 | Validation error, bad request |
| 401 | No token / invalid token / expired token |
| 403 | Valid token but insufficient permissions (wrong user type, account suspended) |
| 404 | Resource not found |
| 409 | Conflict (duplicate GST, duplicate brand mapping) |
| 413 | Request body too large |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 7.24 Pagination Standard

All list endpoints use offset-based pagination with consistent structure:

```typescript
// Query parameters
?page=1&limit=20&status=VERIFIED&search=havells

// Response envelope
{
  data: T[];            // or domain-specific key: "dealers", "products", "rfqs"
  pagination: {
    total: number;      // Total matching records
    page: number;       // Current page (1-based)
    limit: number;      // Items per page
    pages: number;      // Total pages (ceil(total/limit))
  }
}
```

Default page size: 20 (configurable per endpoint, max 100).

---

## 7.25 Authentication Flow Summary

```
User Flow:
  Send OTP -> Verify OTP -> (if new) Signup -> JWT issued
  OR: Google OAuth -> Callback -> JWT issued -> Complete Profile

Dealer Flow:
  Register (email, password, GST, KYC) -> JWT issued (pending status)
  Login (email, password) -> JWT issued

Admin Flow:
  Login (email, password) -> JWT issued (24h expiry)

JWT Structure:
  { id, email, name?, type: "user"|"dealer"|"admin", role?, city? }
  Expiry: 7d (user/dealer), 24h (admin)

Refresh Token:
  POST /api/auth/refresh-token { refreshToken } -> new JWT + new refreshToken
  Old refresh token revoked immediately (rotation)
```

---

*End of Part 3. This document covers all 49 production database models and 131+ API endpoints derived directly from the deployed codebase.*
