# Hub4Estate - Comprehensive Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** February 16, 2025
**Author:** Shreshth Agarwal
**Document Status:** Living Document

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Strategy](#2-product-vision--strategy)
3. [User Personas](#3-user-personas)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Database Schema & Data Models](#5-database-schema--data-models)
6. [Backend API Specifications](#6-backend-api-specifications)
7. [Frontend Architecture & Components](#7-frontend-architecture--components)
8. [User Journeys & Flows](#8-user-journeys--flows)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Core Features - Detailed Specifications](#10-core-features---detailed-specifications)
11. [File Structure & Code Organization](#11-file-structure--code-organization)
12. [Data Flow Diagrams](#12-data-flow-diagrams)
13. [Technical Stack & Dependencies](#13-technical-stack--dependencies)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)
15. [Testing Strategy](#15-testing-strategy)
16. [Performance & Scalability](#16-performance--scalability)
17. [Security & Compliance](#17-security--compliance)
18. [Analytics & Tracking](#18-analytics--tracking)
19. [Future Roadmap](#19-future-roadmap)

---

## 1. Executive Summary

### 1.1 Product Overview

Hub4Estate is India's first dealer discovery platform for electrical goods. The platform connects end-consumers (homeowners, contractors, architects, interior designers) directly with verified dealers, enabling price discovery and competitive quoting that saves buyers 20-50% compared to retail/showroom prices.

### 1.2 The Problem

- **Showrooms charge MRP or close to it** - Massive hidden margins of 20-50%
- **Buyers have zero visibility** into dealer/wholesale pricing networks
- **No platform exists** to connect end-consumers directly with the dealer ecosystem
- **Even for bulk purchases**, people don't know whom to call or how to get competitive quotes

### 1.3 The Solution

A **dealer-first marketplace** where:
1. **Users submit product inquiries** with quantities needed
2. **8-12 verified dealers compete** by submitting quotes
3. **Users compare quotes** and select the best price
4. **Transparent pricing** - every quote shows product price + shipping + warranty

### 1.4 Key Metrics (Validated with Data)

- **63 products tested** across 18 categories
- **20 dealers connected** across 15 cities
- **₹11 lakh+ total retail value tested**
- **₹3.26 lakh total savings achieved**
- **29.6% average price gap** between retail and dealer prices
- **50% maximum gap** found on specific products

### 1.5 Business Model

- **Commission per transaction** (2-5% of order value)
- **Dealer subscription plans** (Premium tier for featured listings)
- **Lead generation fees** from brands/manufacturers

---

## 2. Product Vision & Strategy

### 2.1 Vision Statement

"To become India's largest dealer discovery platform, making wholesale pricing accessible to every Indian buyer."

### 2.2 Mission

Democratize access to dealer networks across India by creating a transparent, competitive marketplace where dealers compete for the buyer.

### 2.3 Product Principles

1. **Dealer-first, not marketplace-first** - We don't sell. Dealers do.
2. **Transparency above all** - Every price breakdown is visible
3. **Quality over quantity** - Verified dealers only
4. **User empowerment** - Buyers make informed decisions with complete data
5. **Speed to value** - Get quotes within 24-48 hours

### 2.4 Success Criteria (6 months)

- 500+ verified dealers across 50 cities
- 10,000+ products in catalog
- 5,000 monthly inquiries
- 20% inquiry-to-purchase conversion rate
- 4.5+ average user rating

---

## 3. User Personas

### 3.1 Primary Personas

#### Persona 1: Homeowner (Individual)

**Name:** Rajesh Kumar
**Age:** 35
**Role:** INDIVIDUAL_HOME_BUILDER / RENOVATION_HOMEOWNER
**Location:** Tier 1/2 city
**Income:** ₹8-15 LPA

**Goals:**
- Building new home or renovating
- Needs electrical goods in bulk (switches, lights, fans, wires, MCBs)
- Wants best price without compromising quality
- Needs reliable delivery

**Pain Points:**
- Showrooms quote MRP or close to it
- No access to dealer network
- Doesn't know which brands to trust
- Confused by technical specifications

**Behavior:**
- Price-sensitive but quality-conscious
- Researches online before buying
- Trusts reviews and ratings
- Comfortable with WhatsApp and basic apps

#### Persona 2: Interior Designer / Architect

**Name:** Priya Sharma
**Age:** 32
**Role:** INTERIOR_DESIGNER / ARCHITECT
**Location:** Metro city
**Income:** ₹12-25 LPA

**Goals:**
- Sourcing products for multiple client projects
- Needs consistent dealer pricing
- Wants to showcase value to clients
- Builds long-term dealer relationships

**Pain Points:**
- Clients compare her pricing with retail
- Needs margin but can't inflate prices too much
- Managing multiple dealer relationships is time-consuming
- No centralized platform for quote comparison

**Behavior:**
- Buys in bulk across projects
- Values time over small savings
- Needs documentation (GST invoices, warranties)
- Tech-savvy, uses multiple platforms

#### Persona 3: Contractor / Electrician

**Name:** Suresh Patel
**Age:** 42
**Role:** CONTRACTOR / ELECTRICIAN
**Location:** Tier 2/3 city
**Income:** ₹6-12 LPA

**Goals:**
- Regular bulk purchases for project sites
- Needs credit terms from dealers
- Fast delivery to project sites
- Consistent quality

**Pain Points:**
- Limited dealer network in smaller cities
- Can't afford to stock inventory
- Payment terms matter more than price sometimes
- Needs local pickup options

**Behavior:**
- Loyal to reliable dealers
- Prefers phone/WhatsApp over apps
- Buys brands recommended by peers
- Values relationship over price (within reason)

### 3.2 Secondary Personas

#### Persona 4: Dealer (Supplier)

**Name:** Amit Gupta
**Age:** 38
**Role:** Authorized dealer for Havells, Polycab, Anchor
**Location:** Jaipur
**Business:** Electrical wholesale and retail

**Goals:**
- Increase sales volume
- Reach customers beyond walk-ins
- Reduce customer acquisition cost
- Build reputation online

**Pain Points:**
- Limited reach beyond local area
- High marketing costs
- Competition from Amazon/Flipkart on small items
- No platform for B2B bulk orders

**Behavior:**
- Responds fast to WhatsApp inquiries
- Willing to negotiate on bulk orders
- Values repeat customers
- Tech-adoption is moderate

---

## 4. System Architecture Overview

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  (React + TypeScript + Vite + Tailwind + Zustand)          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  User    │  │  Dealer  │  │  Admin   │  │   AI     │  │
│  │   App    │  │  Portal  │  │  Panel   │  │ Chat Bot │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / BACKEND                    │
│         (Node.js + Express + TypeScript + Prisma)           │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Authentication (Google OAuth + OTP)                │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Core Routes: Auth, Products, RFQ, Quotes, Dealer  │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Services: Email, SMS, AI, Scraper, Matching       │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│                  (PostgreSQL + Prisma ORM)                  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │ Dealers  │  │ Products │  │   RFQs   │  │
│  │   +OTP   │  │+Mappings │  │+Catalog  │  │ +Quotes  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Community │  │  Admin   │  │  CRM     │  │ Scraper  │  │
│  │+Knowledge│  │  +Audit  │  │+Outreach │  │  Data    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Google  │  │  Twilio  │  │ Claude/  │  │  Cloud   │  │
│  │   Auth   │  │ SMS/OTP  │  │ OpenAI   │  │  Storage │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router v6 (routing)
- React Query (server state)
- Axios (HTTP client)

**Backend:**
- Node.js 18+ with TypeScript
- Express.js (web framework)
- Prisma ORM (database)
- PostgreSQL 14+ (database)
- JWT (authentication tokens)
- Multer (file uploads)

**External Services:**
- Google OAuth 2.0 (social login)
- Twilio (SMS/OTP)
- Claude API / OpenAI (AI assistant)
- AWS S3 / Cloudinary (image storage)
- SendGrid / AWS SES (email)

**DevOps:**
- Docker (containerization)
- GitHub Actions (CI/CD)
- Vercel (frontend hosting)
- Render / Railway (backend hosting)
- PostgreSQL Cloud (database)

---

## 5. Database Schema & Data Models

### 5.1 Core Entities Overview

The database consists of 40+ tables organized into 10 functional domains:

1. **User Management** (User, OTP)
2. **Dealer Management** (Dealer, DealerServiceArea, DealerReview, Brand/Category Mappings)
3. **Product Catalog** (Category, SubCategory, ProductType, Product, Brand)
4. **RFQ System** (RFQ, RFQItem)
5. **Quote System** (Quote, QuoteItem)
6. **Community & Knowledge** (CommunityPost, CommunityComment, KnowledgeArticle)
7. **Admin & Audit** (Admin, AuditLog, FraudFlag)
8. **CRM System** (CRMCompany, CRMContact, CRMOutreach, CRMMeeting)
9. **Inquiry Pipeline** (ProductInquiry, InquiryPipeline, BrandDealer, InquiryDealerQuote)
10. **Scraper System** (ScrapeBrand, ScrapeJob, ScrapedProduct)
11. **Activity Tracking** (UserActivity, ChatSession, ChatMessage)

### 5.2 Detailed Entity Specifications

#### 5.2.1 User Entity

**File:** `backend/prisma/schema.prisma` (lines 31-58)

**Purpose:** Represents end-users (buyers) - homeowners, contractors, architects, etc.

**Fields:**
```prisma
model User {
  id              String      @id @default(uuid())
  email           String?     @unique
  googleId        String?     @unique
  phone           String?     @unique
  name            String
  role            UserRole?   // INDIVIDUAL_HOME_BUILDER, RENOVATION_HOMEOWNER, ARCHITECT, INTERIOR_DESIGNER, CONTRACTOR, ELECTRICIAN, SMALL_BUILDER, DEVELOPER
  city            String?
  purpose         String?     // new build / renovation
  status          UserStatus  @default(ACTIVE)
  profileImage    String?
  isPhoneVerified Boolean     @default(false)
  isEmailVerified Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

**Relationships:**
- Has many RFQs (one user creates multiple product requests)
- Has many CommunityPosts and CommunityComments
- Has many SavedProducts

**Indexes:**
- email, phone, googleId (for fast auth lookups)
- city (for location-based filtering)

**Business Rules:**
- Email OR phone OR googleId must be present (at least one identifier)
- Phone verification required for creating RFQs
- Profile completion (role + city) required for better dealer matching

#### 5.2.2 Dealer Entity

**File:** `backend/prisma/schema.prisma` (lines 99-156)

**Purpose:** Represents dealers/suppliers who quote on RFQs

**Fields:**
```prisma
model Dealer {
  id                String        @id @default(uuid())
  email             String        @unique
  password          String?
  businessName      String
  ownerName         String
  phone             String
  gstNumber         String        @unique
  panNumber         String
  shopAddress       String
  city              String
  state             String
  pincode           String

  dealerType        DealerType    @default(RETAILER) // RETAILER, DISTRIBUTOR, SYSTEM_INTEGRATOR, CONTRACTOR, OEM_PARTNER, WHOLESALER
  yearsInOperation  Int?

  // Verification documents
  gstDocument       String?
  panDocument       String?
  shopLicense       String?
  cancelledCheque   String?
  shopPhoto         String?
  brandAuthProofs   String[]

  // Onboarding
  onboardingStep    Int           @default(1)
  profileComplete   Boolean       @default(false)

  status            DealerStatus  @default(PENDING_VERIFICATION)
  verificationNotes String?
  verifiedAt        DateTime?
  verifiedBy        String?
  rejectionReason   String?

  // Performance metrics
  totalRFQsReceived Int           @default(0)
  totalQuotesSubmitted Int        @default(0)
  totalConversions  Int           @default(0)
  conversionRate    Float         @default(0)
  avgResponseTime   Int?          // minutes
}
```

**Relationships:**
- Has many DealerBrandMappings (which brands they're authorized for)
- Has many DealerCategoryMappings (which categories they serve)
- Has many DealerServiceAreas (pincodes they deliver to)
- Has many Quotes (quotes submitted)
- Has many DealerReviews (ratings from users)

**Verification Flow:**
1. Dealer registers → status: PENDING_VERIFICATION
2. Uploads documents → status: DOCUMENTS_PENDING
3. Admin reviews → status: UNDER_REVIEW
4. Admin approves → status: VERIFIED, verifiedAt set
5. Admin rejects → status: REJECTED, rejectionReason set

**Business Rules:**
- GST number must be unique (prevents duplicate registrations)
- Cannot receive RFQs until status = VERIFIED
- Must have at least 1 brand mapping and 1 category mapping
- Service areas determine which RFQs they see (location-based matching)

#### 5.2.3 Product Catalog Hierarchy

**File:** `backend/prisma/schema.prisma` (lines 190-323)

**Structure:**
```
Category (e.g., "Lighting")
  ├── SubCategory (e.g., "LED Bulbs")
  │     ├── ProductType (e.g., "B22 Base LED Bulb")
  │     │     ├── Product (e.g., "Philips 9W B22 LED Bulb Cool Daylight")
  │     │     ├── Product (e.g., "Havells 12W B22 LED Bulb Warm White")
  │     │     └── Product (e.g., "Syska 7W B22 LED Bulb")
  │     └── ProductType (e.g., "E27 Base LED Bulb")
  │           └── Products...
  └── SubCategory (e.g., "LED Panels")
        └── ProductTypes...
```

**Category Model:**
```prisma
model Category {
  id          String        @id @default(uuid())
  name        String        @unique  // "Lighting", "Fans", "Switches & Sockets"
  slug        String        @unique  // "lighting", "fans", "switches-sockets"
  description String?
  icon        String?
  sortOrder   Int           @default(0)
  isActive    Boolean       @default(true)

  // SEO & Education
  seoTitle    String?
  seoDescription String?
  whatIsIt    String?       // Explanation text
  whereUsed   String?       // Where in house
  whyQualityMatters String?
  commonMistakes String?
}
```

**Product Model:**
```prisma
model Product {
  id            String      @id @default(uuid())
  productTypeId String
  brandId       String
  name          String
  modelNumber   String?
  sku           String?     @unique
  description   String?
  specifications String?   // JSON: {voltage, wattage, material, certifications}
  images        String[]    // Array of image URLs
  datasheetUrl  String?
  manualUrl     String?
  certifications String[]  // ["ISI", "IEC", "CE"]
  warrantyYears Int?
  isActive      Boolean     @default(true)
}
```

**Business Rules:**
- Products can only belong to one ProductType
- Products must have a Brand
- SKU must be globally unique (if provided)
- Specifications stored as JSON for flexibility
- Images are stored as array of URLs (uploaded to cloud storage)

#### 5.2.4 RFQ (Request for Quote) Entity

**File:** `backend/prisma/schema.prisma` (lines 370-409)

**Purpose:** User's product request that goes to dealers

**Fields:**
```prisma
model RFQ {
  id              String      @id @default(uuid())
  userId          String
  title           String      // "Switches and MCBs for 3BHK"
  description     String?     // Additional notes

  deliveryCity    String
  deliveryPincode String
  deliveryAddress String?
  estimatedDate   DateTime?   // When user needs products

  deliveryPreference String   // "delivery", "pickup", "both"
  urgency         String?     // "normal", "urgent"

  status          RFQStatus   // DRAFT, PUBLISHED, QUOTES_RECEIVED, DEALER_SELECTED, COMPLETED, CANCELLED
  publishedAt     DateTime?
  selectedDealerId String?
  selectedQuoteId  String?
  completedAt     DateTime?

  aiSuggestions   String?     // JSON with AI suggestions
  aiFlags         String?     // JSON with warnings
}

model RFQItem {
  id          String   @id @default(uuid())
  rfqId       String
  productId   String
  quantity    Int
  notes       String?
}
```

**RFQ Lifecycle:**

```
1. DRAFT
   ↓ (user adds products, fills details)
2. PUBLISHED (publishedAt set, dealers notified)
   ↓ (dealers submit quotes)
3. QUOTES_RECEIVED (at least 1 quote received)
   ↓ (user selects a dealer)
4. DEALER_SELECTED (selectedDealerId + selectedQuoteId set)
   ↓ (user confirms delivery/pickup)
5. COMPLETED (completedAt set)
   OR
   CANCELLED (user cancels)
```

**Business Rules:**
- RFQ must have at least 1 RFQItem to publish
- Published RFQs are matched to dealers based on:
  - DealerBrandMappings (brands in RFQItems)
  - DealerCategoryMappings (categories of products)
  - DealerServiceAreas (deliveryPincode match)
- Only verified dealers (status = VERIFIED) receive RFQs
- Once DEALER_SELECTED, other quotes are marked REJECTED
- RFQs expire after 30 days if not completed

#### 5.2.5 Quote Entity

**File:** `backend/prisma/schema.prisma` (lines 438-492)

**Purpose:** Dealer's response to an RFQ

**Fields:**
```prisma
model Quote {
  id              String      @id @default(uuid())
  rfqId           String
  dealerId        String

  totalAmount     Float
  shippingCost    Float       @default(0)
  notes           String?

  deliveryDate    DateTime?   // For delivery option
  pickupDate      DateTime?   // For pickup option
  validUntil      DateTime    // Quote expiry

  status          QuoteStatus @default(SUBMITTED) // SUBMITTED, SELECTED, REJECTED, EXPIRED

  submittedAt     DateTime    @default(now())
  viewedAt        DateTime?
  selectedAt      DateTime?

  lossReason      String?     // "price", "timing", "distance"
  rankPosition    Int?        // Where this quote ranked
}

model QuoteItem {
  id          String   @id @default(uuid())
  quoteId     String
  productId   String
  quantity    Int
  unitPrice   Float
  totalPrice  Float
}
```

**Business Rules:**
- One dealer can only submit ONE quote per RFQ (unique constraint on rfqId + dealerId)
- Quote must match ALL items in RFQ
- totalAmount = sum of all QuoteItem.totalPrice
- Total including shipping = totalAmount + shippingCost
- Quotes are ranked by (totalAmount + shippingCost) ascending
- viewedAt is set when user first views the quote
- Dealers can see their rank after user views at least 3 quotes

#### 5.2.6 ProductInquiry & InquiryPipeline

**File:** `backend/prisma/schema.prisma` (lines 1009-1190)

**Purpose:** Homepage quick inquiry form → Admin workflow for dealer outreach

**Flow:**
```
User submits ProductInquiry (name, phone, product photo/model, city)
        ↓
Admin creates InquiryPipeline linked to inquiry
        ↓
AI identifies brand/product from photo or model number
        ↓
System finds 8-12 BrandDealers for that brand in user's city
        ↓
Admin contacts dealers via WhatsApp (automated template)
        ↓
Dealers respond with prices via WhatsApp
        ↓
Admin manually enters quotes into InquiryDealerQuote
        ↓
Admin compiles all quotes and sends to user via SMS/Email
        ↓
User selects a dealer, completes purchase offline
```

**Models:**
```prisma
model ProductInquiry {
  id              String    @id @default(uuid())
  inquiryNumber   String?   @unique // "HUB-HAVELLS-MCB-0001"
  name            String
  phone           String
  email           String?
  productPhoto    String?   // Uploaded image URL
  modelNumber     String?
  quantity        Int       @default(1)
  deliveryCity    String
  notes           String?

  status          String    @default("new") // new, contacted, quoted, closed
  assignedTo      String?   // Admin ID

  // Admin quote response
  quotedPrice       Float?
  shippingCost      Float?
  totalPrice        Float?
  estimatedDelivery String?
  respondedAt       DateTime?
}

model InquiryPipeline {
  id                  String          @id @default(uuid())
  inquiryId           String          @unique

  identifiedBrandId   String?
  identifiedBrand     String?
  identifiedProduct   String?
  identifiedCategory  String?

  status              PipelineStatus  // BRAND_IDENTIFIED, DEALERS_FOUND, QUOTES_REQUESTED, QUOTES_RECEIVED, SENT_TO_CUSTOMER, CLOSED

  aiAnalysis          String?         // JSON: {brandConfidence, productDetails, whatsappTemplate}

  sentToCustomerAt    DateTime?
  sentVia             String?         // "email", "sms", "both"
}

model BrandDealer {
  id              String            @id @default(uuid())
  brandId         String
  name            String
  shopName        String?
  phone           String
  whatsappNumber  String?
  email           String?
  city            String

  source          BrandDealerSource // MANUAL, SCRAPED, BRAND_WEBSITE, PLATFORM_DEALER
  isVerified      Boolean           @default(false)
  isActive        Boolean           @default(true)
}

model InquiryDealerQuote {
  id              String              @id @default(uuid())
  pipelineId      String
  brandDealerId   String?
  dealerId        String?             // Platform dealer (optional)

  dealerName      String
  dealerPhone     String

  contactMethod   ContactMethod       // WHATSAPP, CALL, EMAIL, SMS
  contactedAt     DateTime?
  whatsappMessage String?

  quotedPrice     Float?
  shippingCost    Float?
  totalQuotedPrice Float?
  deliveryDays    Int?
  warrantyInfo    String?

  responseStatus  QuoteResponseStatus // PENDING, CONTACTED, QUOTED, NO_RESPONSE, DECLINED
}
```

**This system allows Hub4Estate to manually handle inquiries before full RFQ automation is built.**

---

## 6. Backend API Specifications

### 6.1 API Route Structure

All backend routes are located in: `backend/src/routes/*.routes.ts`

**Base URL:** `https://api.hub4estate.com` (production) or `http://localhost:5000` (development)

**Authentication:** JWT token in `Authorization: Bearer <token>` header

### 6.2 Route Files & Endpoints

#### 6.2.1 Authentication Routes

**File:** `backend/src/routes/auth.routes.ts`

**Endpoints:**

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| POST | `/api/auth/google` | Google OAuth login/signup | No | `{credential: string}` | `{token, user, isNewUser}` |
| POST | `/api/auth/send-otp` | Send OTP to phone | No | `{phone: string, type: 'login' \| 'signup'}` | `{success: true, identifier}` |
| POST | `/api/auth/verify-otp` | Verify OTP and login | No | `{identifier: string, code: string, name?: string}` | `{token, user, isNewUser}` |
| GET | `/api/auth/me` | Get current user | Yes | - | `{user}` |
| PUT | `/api/auth/complete-profile` | Complete user profile after signup | Yes | `{role, city, purpose}` | `{user}` |

**Google OAuth Flow:**
1. Frontend uses Google Sign-In button
2. Gets credential (JWT from Google)
3. Sends to `/api/auth/google`
4. Backend verifies with Google
5. Creates/finds User by googleId
6. Returns JWT token + user object

**OTP Flow:**
1. User enters phone number
2. POST `/api/auth/send-otp` → generates 6-digit OTP, stores in OTP table, sends via Twilio
3. User enters OTP
4. POST `/api/auth/verify-otp` → verifies code, creates/finds User by phone
5. Returns JWT token + user object

**Code Location:** `backend/src/routes/auth.routes.ts`

**Dependencies:**
- `backend/src/services/sms.service.ts` (Twilio integration)
- `jsonwebtoken` (JWT creation)
- `google-auth-library` (Google token verification)

#### 6.2.2 Product Routes

**File:** `backend/src/routes/products.routes.ts`

**Endpoints:**

| Method | Endpoint | Description | Auth | Query/Body | Response |
|--------|----------|-------------|------|------------|----------|
| GET | `/api/products/categories` | List all categories | No | `?includeInactive=false` | `{categories}` |
| GET | `/api/products/categories/:slug` | Get category details with subcategories | No | - | `{category, subCategories}` |
| GET | `/api/products/sub-categories/:slug` | Get subcategory with product types | No | - | `{subCategory, productTypes}` |
| GET | `/api/products/product-types/:slug` | Get product type with products | No | `?brandId=uuid&page=1&limit=20` | `{productType, products, pagination}` |
| GET | `/api/products/:id` | Get product details | No | - | `{product, brand, productType}` |
| GET | `/api/products/search` | Search products | No | `?q=switch&categoryId=&brandId=&page=1` | `{products, pagination}` |
| GET | `/api/products/brands` | List all brands | No | `?categoryId=uuid` | `{brands}` |
| POST | `/api/products/save` | Save product to user's list | Yes | `{productId, notes?}` | `{saved}` |
| DELETE | `/api/products/save/:id` | Remove saved product | Yes | - | `{success}` |
| GET | `/api/products/saved` | Get user's saved products | Yes | - | `{savedProducts}` |

**Search Logic (pseudo-code):**
```typescript
// backend/src/routes/products.routes.ts ~ line 80

const searchProducts = async (req, res) => {
  const { q, categoryId, brandId, page = 1, limit = 20 } = req.query;

  const where = {
    isActive: true,
    AND: [
      q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { modelNumber: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      } : {},
      brandId ? { brandId } : {},
      categoryId ? {
        productType: {
          subCategory: {
            categoryId
          }
        }
      } : {},
    ]
  };

  const products = await prisma.product.findMany({
    where,
    include: { brand: true, productType: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { name: 'asc' }
  });

  return res.json({ products, pagination: {...} });
};
```

#### 6.2.3 RFQ Routes

**File:** `backend/src/routes/rfq.routes.ts`

**Endpoints:**

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/rfqs/create` | Create RFQ (DRAFT) | Yes | `{title, items: [{productId, quantity}]}` | `{rfq}` |
| PUT | `/api/rfqs/:id` | Update RFQ details | Yes | `{title?, description?, deliveryCity?, deliveryPincode?, deliveryAddress?, estimatedDate?, deliveryPreference?, urgency?}` | `{rfq}` |
| POST | `/api/rfqs/:id/items` | Add item to RFQ | Yes | `{productId, quantity, notes?}` | `{rfqItem}` |
| DELETE | `/api/rfqs/:id/items/:itemId` | Remove item from RFQ | Yes | - | `{success}` |
| POST | `/api/rfqs/:id/publish` | Publish RFQ (notify dealers) | Yes | - | `{rfq, matchedDealers}` |
| GET | `/api/rfqs/my` | Get user's RFQs | Yes | `?status=PUBLISHED&page=1` | `{rfqs, pagination}` |
| GET | `/api/rfqs/:id` | Get RFQ details | Yes | - | `{rfq, items, quotes}` |
| POST | `/api/rfqs/:id/select-quote` | Select a quote | Yes | `{quoteId}` | `{rfq, quote}` |
| POST | `/api/rfqs/:id/cancel` | Cancel RFQ | Yes | `{reason?}` | `{rfq}` |

**RFQ Publish Logic:**

```typescript
// backend/src/routes/rfq.routes.ts ~ line 120

const publishRFQ = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // 1. Get RFQ with items
  const rfq = await prisma.rFQ.findUnique({
    where: { id, userId },
    include: { items: { include: { product: true } } }
  });

  if (!rfq || rfq.items.length === 0) {
    return res.status(400).json({ error: 'RFQ must have at least 1 item' });
  }

  // 2. Extract brandIds and categoryIds from products
  const brandIds = [...new Set(rfq.items.map(item => item.product.brandId))];
  const categoryIds = [...]; // extract from products via productType->subCategory->category

  // 3. Find matching dealers
  const matchedDealers = await prisma.dealer.findMany({
    where: {
      status: 'VERIFIED',
      brandMappings: { some: { brandId: { in: brandIds } } },
      categoryMappings: { some: { categoryId: { in: categoryIds } } },
      serviceAreas: { some: { pincode: rfq.deliveryPincode } }
    },
    include: { brandMappings: true }
  });

  // 4. Update RFQ status
  await prisma.rFQ.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });

  // 5. Notify dealers (email + SMS)
  for (const dealer of matchedDealers) {
    await emailService.sendRFQNotification(dealer, rfq);
    await smsService.sendRFQAlert(dealer.phone, rfq.id);
  }

  return res.json({ rfq, matchedDealers: matchedDealers.length });
};
```

#### 6.2.4 Quote Routes

**File:** `backend/src/routes/quote.routes.ts`

**Endpoints:**

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/quotes/submit` | Dealer submits quote | Yes (Dealer) | `{rfqId, items: [{productId, quantity, unitPrice}], shippingCost, notes?, deliveryDate?, pickupDate?, validUntil}` | `{quote}` |
| GET | `/api/quotes/my` | Dealer's submitted quotes | Yes (Dealer) | `?status=SUBMITTED&page=1` | `{quotes, pagination}` |
| GET | `/api/quotes/:id` | Get quote details | Yes | - | `{quote, items}` |
| PUT | `/api/quotes/:id` | Update quote (before user views) | Yes (Dealer) | `{items?, shippingCost?, notes?, deliveryDate?}` | `{quote}` |
| DELETE | `/api/quotes/:id` | Withdraw quote | Yes (Dealer) | - | `{success}` |

**Submit Quote Logic:**

```typescript
// backend/src/routes/quote.routes.ts ~ line 30

const submitQuote = async (req, res) => {
  const dealerId = req.dealer.id; // from JWT
  const { rfqId, items, shippingCost, notes, deliveryDate, pickupDate, validUntil } = req.body;

  // 1. Verify dealer is verified
  const dealer = await prisma.dealer.findUnique({ where: { id: dealerId } });
  if (dealer.status !== 'VERIFIED') {
    return res.status(403).json({ error: 'Dealer not verified' });
  }

  // 2. Verify RFQ exists and is PUBLISHED
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { items: true }
  });

  if (!rfq || rfq.status !== 'PUBLISHED') {
    return res.status(400).json({ error: 'RFQ not published' });
  }

  // 3. Verify dealer hasn't already quoted
  const existingQuote = await prisma.quote.findUnique({
    where: { rfqId_dealerId: { rfqId, dealerId } }
  });

  if (existingQuote) {
    return res.status(400).json({ error: 'Already submitted quote for this RFQ' });
  }

  // 4. Verify all RFQ items are covered
  const rfqItemIds = rfq.items.map(i => i.id);
  const quoteItemProductIds = items.map(i => i.productId);
  const rfqProductIds = rfq.items.map(i => i.productId);

  const allCovered = rfqProductIds.every(pid => quoteItemProductIds.includes(pid));
  if (!allCovered) {
    return res.status(400).json({ error: 'Quote must cover all RFQ items' });
  }

  // 5. Calculate totalAmount
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);

  // 6. Create quote with items
  const quote = await prisma.quote.create({
    data: {
      rfqId,
      dealerId,
      totalAmount,
      shippingCost,
      notes,
      deliveryDate,
      pickupDate,
      validUntil,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity
        }))
      }
    },
    include: { items: true }
  });

  // 7. Update RFQ status to QUOTES_RECEIVED
  await prisma.rFQ.update({
    where: { id: rfqId },
    data: { status: 'QUOTES_RECEIVED' }
  });

  // 8. Update dealer metrics
  await prisma.dealer.update({
    where: { id: dealerId },
    data: {
      totalQuotesSubmitted: { increment: 1 }
    }
  });

  // 9. Notify user (email/SMS)
  await emailService.sendQuoteReceivedNotification(rfq.userId, quote);

  return res.json({ quote });
};
```

#### 6.2.5 Dealer Routes

**File:** `backend/src/routes/dealer.routes.ts`

**Endpoints:**

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/dealers/register` | Dealer registration | No | `{email, businessName, ownerName, phone, gstNumber, panNumber, shopAddress, city, state, pincode}` | `{dealer, tempToken}` |
| POST | `/api/dealers/login` | Dealer login | No | `{email, password}` | `{token, dealer}` |
| GET | `/api/dealers/me` | Get dealer profile | Yes (Dealer) | - | `{dealer, brandMappings, categoryMappings, serviceAreas}` |
| PUT | `/api/dealers/profile` | Update profile | Yes (Dealer) | `{businessName?, phone?, shopAddress?, ...}` | `{dealer}` |
| POST | `/api/dealers/documents/upload` | Upload verification doc | Yes (Dealer) | `FormData: {type: 'gst'\|'pan'\|'license', file}` | `{url}` |
| POST | `/api/dealers/brands/add` | Add brand mapping | Yes (Dealer) | `{brandId, authProofUrl?}` | `{mapping}` |
| DELETE | `/api/dealers/brands/:id` | Remove brand | Yes (Dealer) | - | `{success}` |
| POST | `/api/dealers/categories/add` | Add category | Yes (Dealer) | `{categoryId}` | `{mapping}` |
| DELETE | `/api/dealers/categories/:id` | Remove category | Yes (Dealer) | - | `{success}` |
| POST | `/api/dealers/service-areas/add` | Add service pincode | Yes (Dealer) | `{pincode}` | `{area}` |
| DELETE | `/api/dealers/service-areas/:id` | Remove pincode | Yes (Dealer) | - | `{success}` |
| GET | `/api/dealers/rfqs` | Get RFQs for dealer | Yes (Dealer) | `?status=PUBLISHED&page=1` | `{rfqs, pagination}` |
| GET | `/api/dealers/dashboard` | Dashboard stats | Yes (Dealer) | - | `{stats}` |

**Dealer Onboarding Steps:**

```typescript
// Onboarding flow tracked by dealer.onboardingStep

Step 1: Basic Info (email, business name, owner, phone, GST, PAN, address)
  → dealer.onboardingStep = 1

Step 2: Upload Documents (GST doc, PAN doc, shop license, cheque, shop photo)
  → dealer.onboardingStep = 2

Step 3: Add Brands (select brands they're authorized for, upload auth certificates)
  → dealer.onboardingStep = 3

Step 4: Add Categories (select product categories they deal in)
  → dealer.onboardingStep = 4

Step 5: Add Service Areas (pincodes they deliver to)
  → dealer.onboardingStep = 5
  → dealer.profileComplete = true
  → dealer.status = 'DOCUMENTS_PENDING' (ready for admin review)
```

**Dealer Dashboard Stats API:**

```typescript
// backend/src/routes/dealer.routes.ts ~ line 180

const getDashboard = async (req, res) => {
  const dealerId = req.dealer.id;

  // Total RFQs received (matched to this dealer)
  const totalRFQsReceived = await prisma.rFQ.count({
    where: {
      status: 'PUBLISHED',
      items: {
        some: {
          product: {
            brand: {
              dealerMappings: {
                some: { dealerId }
              }
            }
          }
        }
      },
      deliveryPincode: {
        in: (await prisma.dealerServiceArea.findMany({
          where: { dealerId },
          select: { pincode: true }
        })).map(a => a.pincode)
      }
    }
  });

  // Quotes submitted
  const quotesSubmitted = await prisma.quote.count({
    where: { dealerId }
  });

  // Quotes selected (won)
  const quotesWon = await prisma.quote.count({
    where: { dealerId, status: 'SELECTED' }
  });

  const conversionRate = quotesSubmitted > 0 ? (quotesWon / quotesSubmitted) * 100 : 0;

  // Recent RFQs (pending quote submission)
  const pendingRFQs = await prisma.rFQ.findMany({
    where: {
      status: 'PUBLISHED',
      // ... (same matching logic as totalRFQsReceived)
    },
    include: { items: { include: { product: true } } },
    take: 10,
    orderBy: { publishedAt: 'desc' }
  });

  return res.json({
    stats: {
      totalRFQsReceived,
      quotesSubmitted,
      quotesWon,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgResponseTime: dealer.avgResponseTime || null
    },
    pendingRFQs
  });
};
```

#### 6.2.6 Admin Routes

**File:** `backend/src/routes/admin.routes.ts`

**Endpoints:**

| Method | Endpoint | Description | Auth | Request | Response |
|--------|----------|-------------|------|---------|----------|
| POST | `/api/admin/login` | Admin login | No | `{email, password}` | `{token, admin}` |
| GET | `/api/admin/dashboard` | Dashboard stats | Yes (Admin) | - | `{stats}` |
| GET | `/api/admin/dealers` | List dealers | Yes (Admin) | `?status=PENDING_VERIFICATION&page=1` | `{dealers, pagination}` |
| GET | `/api/admin/dealers/:id` | Get dealer details | Yes (Admin) | - | `{dealer, documents, brandMappings, serviceAreas}` |
| POST | `/api/admin/dealers/:id/verify` | Verify dealer | Yes (Admin) | `{notes?}` | `{dealer}` |
| POST | `/api/admin/dealers/:id/reject` | Reject dealer | Yes (Admin) | `{reason}` | `{dealer}` |
| POST | `/api/admin/dealers/:id/suspend` | Suspend dealer | Yes (Admin) | `{reason}` | `{dealer}` |
| GET | `/api/admin/rfqs` | List all RFQs | Yes (Admin) | `?status=&page=1` | `{rfqs, pagination}` |
| GET | `/api/admin/products` | List products | Yes (Admin) | `?categoryId=&brandId=&page=1` | `{products, pagination}` |
| POST | `/api/admin/products/create` | Create product | Yes (Admin) | `{productTypeId, brandId, name, specifications, ...}` | `{product}` |
| PUT | `/api/admin/products/:id` | Update product | Yes (Admin) | `{...}` | `{product}` |
| DELETE | `/api/admin/products/:id` | Delete product | Yes (Admin) | - | `{success}` |
| GET | `/api/admin/analytics` | Analytics data | Yes (Admin) | `?period=7d\|30d\|90d` | `{analytics}` |

**Admin Dashboard API:**

```typescript
// backend/src/routes/admin.routes.ts ~ line 40

const getDashboard = async (req, res) => {
  const today = new Date();
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Users
  const totalUsers = await prisma.user.count();
  const newUsersThisWeek = await prisma.user.count({
    where: { createdAt: { gte: last7Days } }
  });

  // Dealers
  const totalDealers = await prisma.dealer.count();
  const verifiedDealers = await prisma.dealer.count({ where: { status: 'VERIFIED' } });
  const pendingVerification = await prisma.dealer.count({ where: { status: 'PENDING_VERIFICATION' } });

  // RFQs
  const totalRFQs = await prisma.rFQ.count();
  const activeRFQs = await prisma.rFQ.count({ where: { status: 'PUBLISHED' } });
  const completedRFQs = await prisma.rFQ.count({ where: { status: 'COMPLETED' } });

  // Quotes
  const totalQuotes = await prisma.quote.count();
  const avgQuotesPerRFQ = totalRFQs > 0 ? totalQuotes / totalRFQs : 0;

  // Product Inquiries
  const totalInquiries = await prisma.productInquiry.count();
  const newInquiries = await prisma.productInquiry.count({
    where: { status: 'new' }
  });

  // Growth charts (last 30 days)
  const userGrowth = await getUserGrowthData(last30Days);
  const rfqGrowth = await getRFQGrowthData(last30Days);

  return res.json({
    overview: {
      totalUsers,
      newUsersThisWeek,
      totalDealers,
      verifiedDealers,
      pendingVerification,
      totalRFQs,
      activeRFQs,
      completedRFQs,
      totalQuotes,
      avgQuotesPerRFQ: Math.round(avgQuotesPerRFQ * 10) / 10,
      totalInquiries,
      newInquiries
    },
    charts: {
      userGrowth,
      rfqGrowth
    }
  });
};
```

#### 6.2.7 Inquiry & Pipeline Routes

**File:** `backend/src/routes/inquiry.routes.ts` and `backend/src/routes/inquiry-pipeline.routes.ts`

**Public Inquiry Submission:**

| Method | Endpoint | Description | Auth | Request | Response |
|--------|----------|-------------|------|---------|----------|
| POST | `/api/inquiries/submit` | Submit product inquiry | No | `FormData: {name, phone, email?, productPhoto?, modelNumber?, quantity, deliveryCity, notes?}` | `{inquiry, inquiryNumber}` |
| GET | `/api/inquiries/track/:inquiryNumber` | Track inquiry status | No | - | `{inquiry, status, quotes?}` |

**Admin Pipeline Management:**

| Method | Endpoint | Description | Auth | Request | Response |
|--------|----------|-------------|------|---------|----------|
| GET | `/api/admin/inquiry-pipeline` | List pipelines | Yes (Admin) | `?status=BRAND_IDENTIFIED` | `{pipelines}` |
| POST | `/api/admin/inquiry-pipeline/:id/identify-brand` | AI brand identification | Yes (Admin) | - | `{pipeline, identifiedBrand, dealers}` |
| POST | `/api/admin/inquiry-pipeline/:id/add-dealer` | Add dealer to quote | Yes (Admin) | `{brandDealerId OR dealerId, contactMethod}` | `{dealerQuote}` |
| PUT | `/api/admin/inquiry-pipeline/:id/dealer-quotes/:quoteId` | Update dealer quote | Yes (Admin) | `{quotedPrice, shippingCost, deliveryDays, warrantyInfo, responseStatus}` | `{dealerQuote}` |
| POST | `/api/admin/inquiry-pipeline/:id/send-to-customer` | Compile and send quotes | Yes (Admin) | `{sentVia: 'email'\|'sms'\|'both', message?}` | `{pipeline, inquiry}` |

**AI Brand Identification Logic:**

```typescript
// backend/src/routes/inquiry-pipeline.routes.ts ~ line 60
// backend/src/services/ai.service.ts

const identifyBrand = async (req, res) => {
  const { id } = req.params; // pipeline ID

  const pipeline = await prisma.inquiryPipeline.findUnique({
    where: { id },
    include: { inquiry: true }
  });

  const inquiry = pipeline.inquiry;

  // If product photo exists, use vision API
  let aiResult;
  if (inquiry.productPhoto) {
    aiResult = await aiService.identifyProductFromImage(inquiry.productPhoto);
  } else if (inquiry.modelNumber) {
    aiResult = await aiService.identifyProductFromModel(inquiry.modelNumber);
  } else {
    return res.status(400).json({ error: 'Need photo or model number' });
  }

  // aiResult = {
  //   brand: "Havells",
  //   brandConfidence: 0.95,
  //   product: "Crabtree Athena 6A Switch",
  //   category: "Switches & Sockets",
  //   modelNumber: "ACASXXW062",
  //   suggestedWhatsAppMessage: "Hello! We received an inquiry for Havells Crabtree Athena 6A switch..."
  // }

  // Find brand in database
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { equals: aiResult.brand, mode: 'insensitive' } },
        { name: { contains: aiResult.brand, mode: 'insensitive' } }
      ]
    }
  });

  if (!brand) {
    return res.status(404).json({ error: 'Brand not found in database' });
  }

  // Update pipeline
  await prisma.inquiryPipeline.update({
    where: { id },
    data: {
      identifiedBrandId: brand.id,
      identifiedBrand: brand.name,
      identifiedProduct: aiResult.product,
      identifiedCategory: aiResult.category,
      aiAnalysis: JSON.stringify(aiResult),
      status: 'BRAND_IDENTIFIED'
    }
  });

  // Find dealers for this brand in user's city
  const dealers = await prisma.brandDealer.findMany({
    where: {
      brandId: brand.id,
      city: inquiry.deliveryCity,
      isActive: true
    },
    take: 12
  });

  return res.json({
    pipeline,
    brand,
    identifiedProduct: aiResult.product,
    confidence: aiResult.brandConfidence,
    dealers,
    suggestedMessage: aiResult.suggestedWhatsAppMessage
  });
};
```

#### 6.2.8 Scraper Routes

**File:** `backend/src/routes/scraper.routes.ts`

**Purpose:** Admin panel for managing product data scraping from brand websites

| Method | Endpoint | Description | Auth | Request | Response |
|--------|----------|-------------|------|---------|----------|
| GET | `/api/admin/scraper/brands` | List scrape brands | Yes (Admin) | - | `{brands}` |
| POST | `/api/admin/scraper/brands/create` | Add brand to scrape | Yes (Admin) | `{name, website, catalogUrls, selectors}` | `{brand}` |
| POST | `/api/admin/scraper/brands/:id/run` | Trigger scrape job | Yes (Admin) | - | `{job}` |
| GET | `/api/admin/scraper/jobs` | List scrape jobs | Yes (Admin) | `?status=COMPLETED` | `{jobs}` |
| GET | `/api/admin/scraper/jobs/:id` | Get job details | Yes (Admin) | - | `{job, logs, products}` |
| GET | `/api/admin/scraper/products` | List scraped products | Yes (Admin) | `?isProcessed=false` | `{products}` |
| POST | `/api/admin/scraper/products/:id/process` | Convert scraped to Product | Yes (Admin) | `{productTypeId, brandId, ...}` | `{product}` |

**Scrape Job Execution:**

```typescript
// backend/src/services/scraper/scraper.service.ts

class ScraperService {
  async runScrapeJob(brandId: string) {
    const brand = await prisma.scrapeBrand.findUnique({ where: { id: brandId } });

    const job = await prisma.scrapeJob.create({
      data: {
        brandId,
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });

    try {
      const catalogUrls = JSON.parse(brand.catalogUrls || '[]');
      const selectors = JSON.parse(brand.selectors || '{}');

      let productsFound = 0;
      let productsCreated = 0;

      for (const url of catalogUrls) {
        const products = await this.scrapePage(url, selectors);
        productsFound += products.length;

        for (const rawProduct of products) {
          // Check if already scraped (by contentHash)
          const hash = this.generateHash(rawProduct);
          const existing = await prisma.scrapedProduct.findFirst({
            where: { contentHash: hash }
          });

          if (!existing) {
            await prisma.scrapedProduct.create({
              data: {
                brandId,
                sourceUrl: url,
                rawName: rawProduct.name,
                rawCategory: rawProduct.category,
                rawModelNumber: rawProduct.modelNumber,
                rawSpecifications: JSON.stringify(rawProduct.specifications),
                rawImages: rawProduct.images,
                contentHash: hash
              }
            });
            productsCreated++;
          }
        }
      }

      await prisma.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          productsFound,
          productsCreated
        }
      });

    } catch (error) {
      await prisma.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorDetails: JSON.stringify({ message: error.message })
        }
      });
    }
  }

  private async scrapePage(url: string, selectors: any) {
    // Uses Puppeteer or Cheerio to extract product data
    // Returns array of {name, category, modelNumber, specifications, images}
  }

  private generateHash(product: any): string {
    // Create hash from name + modelNumber to detect duplicates
    return crypto.createHash('md5')
      .update(product.name + (product.modelNumber || ''))
      .digest('hex');
  }
}
```

---

## 7. Frontend Architecture & Components

### 7.1 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Buttons, Inputs, Modals, etc.
│   │   ├── layouts/          # MainLayout, AdminLayout, DealerLayout
│   │   ├── product/          # ProductCard, CategoryCard, etc.
│   │   └── ...
│   ├── pages/                # Route pages
│   │   ├── auth/             # Login, Signup, ProfileCompletion
│   │   ├── admin/            # Admin panel pages
│   │   ├── dealer/           # Dealer portal pages
│   │   ├── products/         # Product browsing pages
│   │   ├── rfq/              # RFQ creation and management
│   │   └── ...
│   ├── lib/                  # Utilities and configs
│   │   ├── api.ts            # Axios instance with interceptors
│   │   ├── store.ts          # Zustand store (global state)
│   │   ├── utils.ts          # Helper functions
│   │   └── types.ts          # TypeScript types
│   ├── hooks/                # Custom React hooks
│   ├── App.tsx               # Root component with routing
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### 7.2 State Management (Zustand)

**File:** `frontend/src/lib/store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email?: string;
  name: string;
  role?: string;
  city?: string;
  profileImage?: string;
}

interface Dealer {
  id: string;
  email: string;
  businessName: string;
  status: string;
  // ...
}

interface AuthStore {
  // User state
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Dealer state
  dealerToken: string | null;
  dealer: Dealer | null;
  isDealerAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: User) => void;
  setDealerAuth: (token: string, dealer: Dealer) => void;
  logout: () => void;
  logoutDealer: () => void;
  updateUser: (user: Partial<User>) => void;
  updateDealer: (dealer: Partial<Dealer>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      dealerToken: null,
      dealer: null,
      isDealerAuthenticated: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      setDealerAuth: (token, dealer) => set({ dealerToken: token, dealer, isDealerAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      logoutDealer: () => set({ dealerToken: null, dealer: null, isDealerAuthenticated: false }),
      updateUser: (updates) => set((state) => ({ user: { ...state.user!, ...updates } })),
      updateDealer: (updates) => set((state) => ({ dealer: { ...state.dealer!, ...updates } })),
    }),
    {
      name: 'hub4estate-auth',
    }
  )
);

// RFQ Builder Store (temporary state while creating RFQ)
interface RFQItem {
  productId: string;
  product: any;
  quantity: number;
  notes?: string;
}

interface RFQBuilderStore {
  title: string;
  description: string;
  items: RFQItem[];
  deliveryCity: string;
  deliveryPincode: string;
  deliveryAddress: string;
  deliveryPreference: 'delivery' | 'pickup' | 'both';
  urgency: 'normal' | 'urgent';

  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  addItem: (item: RFQItem) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  setDeliveryDetails: (details: any) => void;
  reset: () => void;
}

export const useRFQBuilder = create<RFQBuilderStore>((set) => ({
  title: '',
  description: '',
  items: [],
  deliveryCity: '',
  deliveryPincode: '',
  deliveryAddress: '',
  deliveryPreference: 'delivery',
  urgency: 'normal',

  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (productId) => set((state) => ({ items: state.items.filter(i => i.productId !== productId) })),
  updateItemQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(i => i.productId === productId ? { ...i, quantity } : i)
  })),
  setDeliveryDetails: (details) => set(details),
  reset: () => set({
    title: '',
    description: '',
    items: [],
    deliveryCity: '',
    deliveryPincode: '',
    deliveryAddress: '',
    deliveryPreference: 'delivery',
    urgency: 'normal',
  }),
}));
```

### 7.3 API Client Configuration

**File:** `frontend/src/lib/api.ts`

```typescript
import axios from 'axios';
import { useAuthStore } from './store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const { token, dealerToken } = useAuthStore.getState();

    // Check if it's a dealer route
    if (config.url?.includes('/dealers/') || config.url?.includes('/quotes/')) {
      if (dealerToken) {
        config.headers.Authorization = `Bearer ${dealerToken}`;
      }
    } else {
      // User routes
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout, logoutDealer } = useAuthStore.getState();

      // Check if dealer route
      if (error.config.url?.includes('/dealers/') || error.config.url?.includes('/quotes/')) {
        logoutDealer();
        window.location.href = '/dealer/login';
      } else {
        logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Typed API functions
export const authAPI = {
  googleLogin: (credential: string) => api.post('/auth/google', { credential }),
  sendOTP: (phone: string, type: 'login' | 'signup') => api.post('/auth/send-otp', { phone, type }),
  verifyOTP: (identifier: string, code: string, name?: string) => api.post('/auth/verify-otp', { identifier, code, name }),
  getMe: () => api.get('/auth/me'),
  completeProfile: (data: { role: string; city: string; purpose: string }) => api.put('/auth/complete-profile', data),
};

export const productsAPI = {
  getCategories: () => api.get('/products/categories'),
  getCategory: (slug: string) => api.get(`/products/categories/${slug}`),
  getProductType: (slug: string, params?: any) => api.get(`/products/product-types/${slug}`, { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  searchProducts: (params: any) => api.get('/products/search', { params }),
  getBrands: (categoryId?: string) => api.get('/products/brands', { params: { categoryId } }),
  saveProduct: (productId: string, notes?: string) => api.post('/products/save', { productId, notes }),
  getSavedProducts: () => api.get('/products/saved'),
};

export const rfqAPI = {
  createRFQ: (data: any) => api.post('/rfqs/create', data),
  updateRFQ: (id: string, data: any) => api.put(`/rfqs/${id}`, data),
  publishRFQ: (id: string) => api.post(`/rfqs/${id}/publish`),
  getMyRFQs: (params?: any) => api.get('/rfqs/my', { params }),
  getRFQ: (id: string) => api.get(`/rfqs/${id}`),
  selectQuote: (rfqId: string, quoteId: string) => api.post(`/rfqs/${rfqId}/select-quote`, { quoteId }),
  cancelRFQ: (id: string, reason?: string) => api.post(`/rfqs/${id}/cancel`, { reason }),
};

export const dealerAPI = {
  register: (data: any) => api.post('/dealers/register', data),
  login: (email: string, password: string) => api.post('/dealers/login', { email, password }),
  getProfile: () => api.get('/dealers/me'),
  updateProfile: (data: any) => api.put('/dealers/profile', data),
  uploadDocument: (type: string, file: File) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    return api.post('/dealers/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  addBrand: (brandId: string, authProofUrl?: string) => api.post('/dealers/brands/add', { brandId, authProofUrl }),
  addCategory: (categoryId: string) => api.post('/dealers/categories/add', { categoryId }),
  addServiceArea: (pincode: string) => api.post('/dealers/service-areas/add', { pincode }),
  getRFQs: (params?: any) => api.get('/dealers/rfqs', { params }),
  getDashboard: () => api.get('/dealers/dashboard'),
};

export const quoteAPI = {
  submitQuote: (data: any) => api.post('/quotes/submit', data),
  getMyQuotes: (params?: any) => api.get('/quotes/my', { params }),
  getQuote: (id: string) => api.get(`/quotes/${id}`),
  updateQuote: (id: string, data: any) => api.put(`/quotes/${id}`, data),
};
```

### 7.4 Key Page Components

#### 7.4.1 HomePage

**File:** `frontend/src/pages/HomePage.tsx`

**Purpose:** Landing page with hero, product inquiry form, category grid, how it works

**Layout:**
```tsx
<MainLayout>
  <HeroSection />
  <QuickInquiryForm />
  <InteractiveCategoryGrid />
  <HowItWorksSection />
  <StatsSection />
  <CTASection />
</MainLayout>
```

**Quick Inquiry Form Logic:**

```typescript
const QuickInquiryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    productPhoto: null as File | null,
    modelNumber: '',
    quantity: 1,
    deliveryCity: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    try {
      const response = await api.post('/inquiries/submit', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Show success modal with inquiry number
      alert(`Inquiry submitted! Track with: ${response.data.inquiryNumber}`);
    } catch (error) {
      console.error('Submission failed', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Your Name" required onChange={e => setFormData({...formData, name: e.target.value})} />
      <input type="tel" placeholder="Phone" required onChange={e => setFormData({...formData, phone: e.target.value})} />
      <input type="file" accept="image/*" onChange={e => setFormData({...formData, productPhoto: e.target.files?.[0] || null})} />
      <input type="text" placeholder="Model Number (if known)" onChange={e => setFormData({...formData, modelNumber: e.target.value})} />
      <input type="number" placeholder="Quantity" min={1} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
      <input type="text" placeholder="Delivery City" required onChange={e => setFormData({...formData, deliveryCity: e.target.value})} />
      <textarea placeholder="Additional Notes" onChange={e => setFormData({...formData, notes: e.target.value})} />
      <button type="submit" className="btn-primary">Get Best Quotes</button>
    </form>
  );
};
```

#### 7.4.2 Create RFQ Flow

**Files:**
- `frontend/src/pages/rfq/CreateRFQPage.tsx`
- `frontend/src/components/rfq/ProductSelector.tsx`
- `frontend/src/components/rfq/DeliveryDetailsForm.tsx`

**Multi-step Flow:**

```
Step 1: Add Products
  → Search for products
  → Add to RFQ (stores in useRFQBuilder)
  → Set quantities

Step 2: Delivery Details
  → Enter city, pincode, address
  → Select delivery preference (delivery/pickup/both)
  → Set urgency

Step 3: Review & Publish
  → Review all items
  → Review delivery details
  → Add title & description
  → Publish (POST /api/rfqs/:id/publish)
```

**Code Example:**

```tsx
// frontend/src/pages/rfq/CreateRFQPage.tsx

const CreateRFQPage = () => {
  const [step, setStep] = useState(1);
  const rfqBuilder = useRFQBuilder();
  const [rfqId, setRfqId] = useState<string | null>(null);

  // Step 1: Create draft RFQ
  const createDraftRFQ = async () => {
    const response = await rfqAPI.createRFQ({
      title: rfqBuilder.title || 'Product Request',
      items: rfqBuilder.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes
      }))
    });
    setRfqId(response.data.rfq.id);
    setStep(2);
  };

  // Step 2: Add delivery details
  const updateDeliveryDetails = async () => {
    await rfqAPI.updateRFQ(rfqId!, {
      deliveryCity: rfqBuilder.deliveryCity,
      deliveryPincode: rfqBuilder.deliveryPincode,
      deliveryAddress: rfqBuilder.deliveryAddress,
      deliveryPreference: rfqBuilder.deliveryPreference,
      urgency: rfqBuilder.urgency
    });
    setStep(3);
  };

  // Step 3: Publish RFQ
  const publishRFQ = async () => {
    await rfqAPI.publishRFQ(rfqId!);
    rfqBuilder.reset();
    navigate(`/rfq/${rfqId}`);
  };

  return (
    <div className="create-rfq-wizard">
      {step === 1 && <ProductSelector onNext={createDraftRFQ} />}
      {step === 2 && <DeliveryDetailsForm onNext={updateDeliveryDetails} />}
      {step === 3 && <ReviewAndPublish onPublish={publishRFQ} />}
    </div>
  );
};
```

#### 7.4.3 RFQ Detail Page (User View)

**File:** `frontend/src/pages/rfq/RFQDetailPage.tsx`

**Purpose:** View RFQ details, see all dealer quotes, compare, select winner

**Layout:**
```tsx
<div className="rfq-detail-page">
  <RFQHeader rfq={rfq} />
  <RFQItems items={rfq.items} />

  {quotes.length > 0 && (
    <>
      <QuoteComparison quotes={quotes} />
      <QuoteList quotes={quotes} onSelectQuote={handleSelectQuote} />
    </>
  )}

  {rfq.status === 'DEALER_SELECTED' && (
    <SelectedDealerInfo dealer={selectedDealer} quote={selectedQuote} />
  )}
</div>
```

**Quote Comparison Table:**

```tsx
const QuoteComparison = ({ quotes }) => {
  // Sort quotes by total price (incl shipping)
  const sortedQuotes = quotes.sort((a, b) =>
    (a.totalAmount + a.shippingCost) - (b.totalAmount + b.shippingCost)
  );

  return (
    <table className="quote-comparison-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Dealer</th>
          <th>City</th>
          <th>Product Total</th>
          <th>Shipping</th>
          <th>Grand Total</th>
          <th>Savings vs #1</th>
          <th>Delivery</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {sortedQuotes.map((quote, idx) => {
          const total = quote.totalAmount + quote.shippingCost;
          const bestTotal = sortedQuotes[0].totalAmount + sortedQuotes[0].shippingCost;
          const extraCost = idx > 0 ? total - bestTotal : 0;

          return (
            <tr key={quote.id} className={idx === 0 ? 'best-quote' : ''}>
              <td>{idx + 1}</td>
              <td>{quote.dealer.businessName}</td>
              <td>{quote.dealer.city}</td>
              <td>₹{quote.totalAmount.toLocaleString()}</td>
              <td>₹{quote.shippingCost.toLocaleString()}</td>
              <td className="font-bold">₹{total.toLocaleString()}</td>
              <td>{extraCost > 0 ? `+₹${extraCost.toLocaleString()}` : '✓ Best'}</td>
              <td>{quote.deliveryDate ? formatDate(quote.deliveryDate) : 'TBD'}</td>
              <td>
                <button onClick={() => onSelectQuote(quote.id)}>
                  Select
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
```

#### 7.4.4 Dealer Dashboard

**File:** `frontend/src/pages/dealer/DealerDashboard.tsx`

**Purpose:** Overview of dealer's performance, pending RFQs, recent quotes

**Layout:**
```tsx
<DealerLayout>
  <StatsCards stats={dashboardData.stats} />
  <ChartsSection />
  <PendingRFQsTable rfqs={dashboardData.pendingRFQs} />
  <RecentQuotesTable quotes={recentQuotes} />
</DealerLayout>
```

**Stats Cards:**

```tsx
const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-4 gap-4">
    <StatCard
      title="RFQs Received"
      value={stats.totalRFQsReceived}
      icon={<InboxIcon />}
      color="blue"
    />
    <StatCard
      title="Quotes Submitted"
      value={stats.quotesSubmitted}
      icon={<DocumentIcon />}
      color="green"
    />
    <StatCard
      title="Quotes Won"
      value={stats.quotesWon}
      icon={<CheckCircleIcon />}
      color="purple"
    />
    <StatCard
      title="Conversion Rate"
      value={`${stats.conversionRate}%`}
      icon={<TrendingUpIcon />}
      color="orange"
    />
  </div>
);
```

**Pending RFQs Table:**

```tsx
const PendingRFQsTable = ({ rfqs }) => (
  <table className="pending-rfqs">
    <thead>
      <tr>
        <th>RFQ ID</th>
        <th>Title</th>
        <th>Items</th>
        <th>Delivery Location</th>
        <th>Published</th>
        <th>Urgency</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {rfqs.map(rfq => (
        <tr key={rfq.id}>
          <td>{rfq.id.slice(0, 8)}</td>
          <td>{rfq.title}</td>
          <td>{rfq.items.length} items</td>
          <td>{rfq.deliveryCity}, {rfq.deliveryPincode}</td>
          <td>{formatDate(rfq.publishedAt)}</td>
          <td>
            <Badge color={rfq.urgency === 'urgent' ? 'red' : 'gray'}>
              {rfq.urgency}
            </Badge>
          </td>
          <td>
            <Link to={`/dealer/rfqs/${rfq.id}/quote`}>
              <button className="btn-sm btn-primary">Submit Quote</button>
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

#### 7.4.5 Admin Inquiry Pipeline Page

**File:** `frontend/src/pages/admin/AdminInquiryPipelinePage.tsx`

**Purpose:** Manage product inquiries → AI brand identification → dealer outreach → quote collection

**Layout:**
```tsx
<AdminLayout>
  <Tabs>
    <Tab label="New Inquiries" count={newCount}>
      <InquiryList status="new" />
    </Tab>
    <Tab label="Brand Identified" count={identifiedCount}>
      <PipelineList status="BRAND_IDENTIFIED" />
    </Tab>
    <Tab label="Quotes Requested" count={requestedCount}>
      <PipelineList status="QUOTES_REQUESTED" />
    </Tab>
    <Tab label="Sent to Customer" count={sentCount}>
      <PipelineList status="SENT_TO_CUSTOMER" />
    </Tab>
  </Tabs>
</AdminLayout>
```

**Pipeline Detail Modal:**

```tsx
const PipelineDetailModal = ({ pipelineId, onClose }) => {
  const [pipeline, setPipeline] = useState(null);
  const [dealerQuotes, setDealerQuotes] = useState([]);

  useEffect(() => {
    loadPipeline();
  }, [pipelineId]);

  const loadPipeline = async () => {
    const res = await api.get(`/admin/inquiry-pipeline/${pipelineId}`);
    setPipeline(res.data.pipeline);
    setDealerQuotes(res.data.dealerQuotes);
  };

  const handleIdentifyBrand = async () => {
    const res = await api.post(`/admin/inquiry-pipeline/${pipelineId}/identify-brand`);
    setPipeline(res.data.pipeline);
    // Show dealers list
  };

  const handleAddDealer = async (brandDealerId) => {
    await api.post(`/admin/inquiry-pipeline/${pipelineId}/add-dealer`, {
      brandDealerId,
      contactMethod: 'WHATSAPP'
    });
    loadPipeline();
  };

  const handleUpdateQuote = async (quoteId, data) => {
    await api.put(`/admin/inquiry-pipeline/${pipelineId}/dealer-quotes/${quoteId}`, data);
    loadPipeline();
  };

  const handleSendToCustomer = async () => {
    await api.post(`/admin/inquiry-pipeline/${pipelineId}/send-to-customer`, {
      sentVia: 'sms'
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>Inquiry Pipeline</h2>

      {/* Inquiry Details */}
      <div className="inquiry-info">
        <p>Customer: {pipeline.inquiry.name} ({pipeline.inquiry.phone})</p>
        {pipeline.inquiry.productPhoto && (
          <img src={pipeline.inquiry.productPhoto} alt="Product" />
        )}
        <p>Model: {pipeline.inquiry.modelNumber}</p>
        <p>Quantity: {pipeline.inquiry.quantity}</p>
        <p>City: {pipeline.inquiry.deliveryCity}</p>
      </div>

      {/* AI Brand Identification */}
      {pipeline.status === 'BRAND_IDENTIFIED' && !pipeline.identifiedBrandId && (
        <button onClick={handleIdentifyBrand}>
          Identify Brand with AI
        </button>
      )}

      {pipeline.identifiedBrand && (
        <div className="identified-brand">
          <h3>Identified: {pipeline.identifiedBrand}</h3>
          <p>Product: {pipeline.identifiedProduct}</p>
          <p>Category: {pipeline.identifiedCategory}</p>
        </div>
      )}

      {/* Dealer List */}
      {pipeline.identifiedBrandId && (
        <div className="dealers-section">
          <h3>Add Dealers to Quote</h3>
          <DealerList brandId={pipeline.identifiedBrandId} onAddDealer={handleAddDealer} />
        </div>
      )}

      {/* Dealer Quotes Table */}
      {dealerQuotes.length > 0 && (
        <table className="dealer-quotes-table">
          <thead>
            <tr>
              <th>Dealer</th>
              <th>Phone</th>
              <th>Contacted</th>
              <th>Status</th>
              <th>Quote</th>
              <th>Shipping</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dealerQuotes.map(dq => (
              <tr key={dq.id}>
                <td>{dq.dealerName}</td>
                <td>{dq.dealerPhone}</td>
                <td>{dq.contactedAt ? 'Yes' : 'No'}</td>
                <td>{dq.responseStatus}</td>
                <td>
                  <input
                    type="number"
                    defaultValue={dq.quotedPrice}
                    onBlur={e => handleUpdateQuote(dq.id, { quotedPrice: parseFloat(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={dq.shippingCost}
                    onBlur={e => handleUpdateQuote(dq.id, { shippingCost: parseFloat(e.target.value) })}
                  />
                </td>
                <td>₹{(dq.quotedPrice + dq.shippingCost).toLocaleString()}</td>
                <td>
                  <select
                    value={dq.responseStatus}
                    onChange={e => handleUpdateQuote(dq.id, { responseStatus: e.target.value })}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUOTED">Quoted</option>
                    <option value="NO_RESPONSE">No Response</option>
                    <option value="DECLINED">Declined</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Send to Customer */}
      {dealerQuotes.some(dq => dq.responseStatus === 'QUOTED') && (
        <button onClick={handleSendToCustomer} className="btn-primary">
          Send Quotes to Customer
        </button>
      )}
    </Modal>
  );
};
```

---

## 8. User Journeys & Flows

### 8.1 User Journey: First-Time Buyer Creating RFQ

**Persona:** Rajesh Kumar (Homeowner building new home)

**Entry Point:** Google search "best price for Havells switches" → Lands on Hub4Estate

**Journey:**

```
1. Homepage
   ↓
   Sees hero: "Save 20-50% on Electrical Goods"
   Reads how it works
   ↓

2. Browse Categories
   Clicks "Switches & Sockets"
   ↓
   Sees subcategories: Modular Switches, Sockets, Plates
   Clicks "Modular Switches"
   ↓

3. Browse Products
   Filters by brand: Havells
   Sees products: Crabtree Athena 6A, Pearlz 16A, etc.
   Clicks on "Havells Crabtree Athena 6A Switch"
   ↓

4. Product Detail
   Reads specifications
   Clicks "Add to RFQ"
   → Prompted to login/signup (not yet authenticated)
   ↓

5. Authentication
   Clicks "Continue with Google"
   → Redirected to Google OAuth
   → Approves
   → Back to Hub4Estate
   ↓
   Prompted to complete profile:
   - Role: Individual Home Builder
   - City: Mumbai
   - Purpose: New Build
   → Profile saved
   ↓

6. Create RFQ (Step 1: Add Products)
   Product already added from step 4
   Sets quantity: 50 pieces
   Searches and adds more:
   - Havells 16A Socket: 25 pieces
   - Havells MCB 32A: 10 pieces
   Clicks "Next"
   ↓

7. Create RFQ (Step 2: Delivery Details)
   Enters:
   - Delivery City: Mumbai
   - Pincode: 400001
   - Address: Andheri West
   - Preference: Delivery
   - Urgency: Normal
   Clicks "Next"
   ↓

8. Create RFQ (Step 3: Review & Publish)
   Reviews all items
   Adds title: "Switches and MCBs for 3BHK"
   Clicks "Publish RFQ"
   ↓

9. RFQ Published
   Sees success message: "Your RFQ has been sent to 12 verified dealers"
   Receives SMS: "Your RFQ has been published. You'll receive quotes within 24-48 hours."
   ↓

10. Wait for Quotes (24-48 hours)
    Dealers submit quotes
    User receives notification: "5 quotes received for your RFQ"
    ↓

11. Compare Quotes
    Opens RFQ detail page
    Sees quote comparison table:
    - Dealer 1 (Mumbai): ₹48,500 (Best)
    - Dealer 2 (Mumbai): ₹52,000
    - Dealer 3 (Thane): ₹49,500
    - Dealer 4 (Mumbai): ₹54,200
    - Dealer 5 (Navi Mumbai): ₹51,800

    Clicks on Dealer 1 quote
    Reviews item-by-item pricing
    Checks delivery date: 3-5 days
    Clicks "Select This Quote"
    ↓

12. Dealer Selected
    Status changes to DEALER_SELECTED
    Dealer notified
    User receives dealer contact info
    User and dealer connect offline (WhatsApp/call)
    Complete transaction offline
    ↓

13. Post-Purchase
    User marks RFQ as COMPLETED
    Prompted to rate dealer (1-5 stars)
    Submits review

    End of Journey
```

**Total Time:** 15 minutes (RFQ creation) + 24-48 hours (quote collection) + offline transaction

**Touchpoints:**
- Web (desktop/mobile)
- Email notifications (quote received, dealer selected)
- SMS notifications (RFQ published, quote received)
- WhatsApp (dealer contact)

### 8.2 User Journey: Quick Inquiry (No Signup)

**Persona:** Priya Sharma (Interior Designer, busy, needs quick quote)

**Entry Point:** Homepage

**Journey:**

```
1. Homepage
   Sees "Quick Inquiry" form
   Fills:
   - Name: Priya Sharma
   - Phone: 9876543210
   - Uploads product photo (switch plate)
   - Quantity: 100 pieces
   - City: Bangalore
   - Notes: "Need premium finish, warm white color"

   Clicks "Get Best Quotes"
   ↓

2. Inquiry Submitted
   Receives inquiry number: HUB-HAVELLS-0042
   Sees message: "We'll send you quotes within 24 hours"
   Receives SMS confirmation with inquiry number
   ↓

3. Admin Workflow (Backend)
   Admin receives inquiry
   AI identifies brand: Havells Crabtree
   Admin creates pipeline
   System finds 10 Havells dealers in Bangalore
   Admin sends WhatsApp to all 10 dealers with product photo
   ↓

4. Dealers Respond (via WhatsApp to Admin)
   8 dealers respond within 2 hours
   Admin manually enters quotes in system:
   - Dealer A: ₹12,500
   - Dealer B: ₹11,800
   - Dealer C: ₹13,200
   - Dealer D: ₹12,000
   - Dealer E: ₹11,500 (Best)
   - Dealer F: ₹14,000
   - Dealer G: ₹12,800
   - Dealer H: ₹13,500
   ↓

5. Admin Sends Quotes to User
   Admin compiles best 5 quotes
   Sends SMS to user:
   "Hi Priya, we received 8 quotes for Havells Crabtree switch plates.
   Best price: ₹11,500 for 100 pieces from XYZ Electricals, Bangalore.
   Full quote list: https://hub4estate.com/track/HUB-HAVELLS-0042"
   ↓

6. User Clicks Link (No Login Required)
   Opens tracking page
   Sees all 8 quotes ranked by price
   Clicks "Contact Best Dealer"
   Gets dealer phone number
   Calls dealer, negotiates, completes order

   End of Journey
```

**Total Time:** 5 minutes (submission) + 2-4 hours (quote collection) + offline transaction

**Key Difference from RFQ:** No signup required, admin-managed, faster for small inquiries

### 8.3 Dealer Journey: Onboarding to First Quote

**Persona:** Amit Gupta (Electrical Dealer in Jaipur, authorized dealer for Havells, Polycab)

**Entry Point:** Heard about Hub4Estate from a brand partner

**Journey:**

```
1. Landing Page
   Visits hub4estate.com/dealer
   Clicks "Register as Dealer"
   ↓

2. Registration (Step 1: Basic Info)
   Fills form:
   - Business Name: Gupta Electricals
   - Owner Name: Amit Gupta
   - Email: amit@guptaelectricals.com
   - Phone: 9876543210
   - GST: 08XXXXX1234X1ZA
   - PAN: ABCDE1234F
   - Shop Address: Shop 42, Malviya Nagar, Jaipur
   - City: Jaipur
   - State: Rajasthan
   - Pincode: 302017

   Creates password
   Clicks "Register"
   → Account created, status: PENDING_VERIFICATION
   ↓

3. Email Verification
   Receives email: "Verify your email"
   Clicks verification link
   Email verified
   Redirected to onboarding
   ↓

4. Onboarding (Step 2: Upload Documents)
   Uploads:
   - GST Certificate (PDF)
   - PAN Card (JPG)
   - Shop License (PDF)
   - Cancelled Cheque (JPG)
   - Shop Photo (JPG)

   Clicks "Next"
   ↓

5. Onboarding (Step 3: Add Brands)
   Searches and selects:
   - Havells (uploads authorization certificate)
   - Polycab (uploads authorization certificate)
   - Anchor (no certificate, marks "applying for")

   Clicks "Next"
   ↓

6. Onboarding (Step 4: Add Categories)
   Selects:
   - Switches & Sockets ✓
   - Wires & Cables ✓
   - MCBs & Distribution Boards ✓
   - Lighting ✓
   - Fans ✓

   Clicks "Next"
   ↓

7. Onboarding (Step 5: Service Areas)
   Adds pincodes:
   - 302017 (own area)
   - 302018
   - 302001
   - 302015
   - 303001 (nearby areas)

   Clicks "Submit for Verification"
   → Status changes to DOCUMENTS_PENDING
   ↓

8. Admin Verification (1-3 business days)
   Admin reviews:
   - Verifies GST on govt portal
   - Checks PAN validity
   - Reviews shop license
   - Calls dealer to verify

   Admin approves
   → Status changes to VERIFIED
   → Dealer receives email: "Congratulations! Your account is verified."
   ↓

9. First Login After Verification
   Logs in
   Sees dashboard:
   - Total RFQs Received: 0
   - Quotes Submitted: 0
   - Quotes Won: 0
   - Pending RFQs: 3 (matched RFQs awaiting quotes)
   ↓

10. First RFQ (Matched)
    Opens "Pending RFQs" tab
    Sees:
    RFQ #0023: "Switches and MCBs for Office"
    - Location: Jaipur (302017)
    - Items: Havells 6A switches (100 pcs), Havells MCB 32A (20 pcs)
    - Urgency: Normal
    - Published: 2 hours ago

    Clicks "Submit Quote"
    ↓

11. Quote Submission Form
    For each item:
    - Havells 6A Switch: Unit price ₹45, Qty 100 → ₹4,500
    - Havells MCB 32A: Unit price ₹350, Qty 20 → ₹7,000

    Total: ₹11,500
    Shipping: ₹200
    Grand Total: ₹11,700

    Delivery Date: 3 days from now
    Valid Until: 7 days from now
    Notes: "GST invoice provided. 1-year warranty on MCBs."

    Clicks "Submit Quote"
    → Quote submitted successfully
    → User notified
    ↓

12. Wait for User Selection
    Dealer waits 24-48 hours
    User compares 8 quotes
    Dealer's quote ranked #2 (not selected)

    Dealer receives notification: "Your quote was not selected. You ranked #2 out of 8 quotes."
    Dealer sees loss reason: "Price" (₹11,700 vs winner's ₹11,200)
    ↓

13. Second RFQ (Next Day)
    New RFQ arrives
    Dealer submits quote with more competitive pricing
    This time, wins the quote!

    Status: SELECTED
    Dealer receives: "Congratulations! Your quote was selected. Customer will contact you."
    User's phone number shared

    Dealer and user connect
    Transaction completed offline

    End of Journey
```

**Total Onboarding Time:** 30 minutes (registration + document upload) + 1-3 days (admin verification)

**Key Success Metrics:**
- Time to first quote submission: < 1 day after verification
- Quote win rate: Target 20-30% (depends on pricing competitiveness)

### 8.4 Admin Journey: Managing Product Inquiry Pipeline

**Persona:** Admin staff handling incoming inquiries

**Journey:**

```
1. Morning Routine
   Admin logs into admin panel
   Dashboard shows:
   - 15 new product inquiries
   - 8 pipelines waiting for brand identification
   - 12 pipelines with quotes pending
   - 5 pipelines ready to send to customer
   ↓

2. Process New Inquiry
   Clicks "New Inquiries" tab
   Opens inquiry #HUB-0156

   Inquiry Details:
   - Name: Suresh Patel
   - Phone: 9123456780
   - Product Photo: [Image of MCB]
   - Model Number: (blank)
   - Quantity: 30 pieces
   - City: Ahmedabad
   - Notes: "Need for construction project, urgent"

   Clicks "Create Pipeline"
   ↓

3. AI Brand Identification
   Pipeline created
   Clicks "Identify Brand with AI"

   AI analyzes product photo using vision API
   Returns:
   - Brand: Havells (Confidence: 92%)
   - Product: Havells DHMGCSPXXXX Series MCB
   - Category: MCBs & Distribution Boards
   - Model: 32A C-Curve
   - Suggested WhatsApp Message: "Hi, we received an inquiry for Havells 32A MCB..."

   Admin reviews, confirms brand
   Clicks "Find Dealers"
   ↓

4. Dealer Selection
   System finds 18 BrandDealers for Havells in Ahmedabad
   Admin filters:
   - Active dealers only
   - Sort by response rate
   - Select top 10

   Clicks "Add to Pipeline" for 10 dealers
   ↓

5. Contact Dealers (WhatsApp Automation)
   For each dealer, system prepares WhatsApp message:

   "Hi [Dealer Name],

   We have an urgent inquiry for:
   **Havells 32A MCB**
   Quantity: 30 pieces
   Location: Ahmedabad

   Can you quote? Reply with:
   1. Unit price
   2. Shipping cost
   3. Delivery timeline

   - Hub4Estate Team"

   Admin reviews, clicks "Send to All Dealers via WhatsApp"
   → 10 messages sent via WhatsApp Business API
   ↓

6. Wait for Dealer Responses (2-4 hours)
   Dealers respond via WhatsApp

   Dealer A: "₹320/pc, Free shipping, 2 days"
   Dealer B: "₹335/pc, ₹200 shipping, 1 day"
   Dealer C: "₹310/pc, Free shipping, 3 days"
   Dealer D: "Out of stock"
   Dealer E: "₹328/pc, Free shipping, 2 days"
   Dealer F: No response (after 4 hours)
   Dealer G: "₹315/pc, ₹150 shipping, 2 days"
   Dealer H: "₹340/pc, Free shipping, Same day"
   Dealer I: "₹325/pc, Free shipping, 2 days"
   Dealer J: "Not dealing in this model"
   ↓

7. Enter Dealer Quotes
   Admin opens pipeline detail
   For each dealer response, enters:

   Dealer A:
   - Status: QUOTED
   - Quoted Price: ₹320
   - Shipping: ₹0
   - Total: ₹320
   - Delivery Days: 2
   - Warranty: "1 year manufacturer"

   [Repeats for all dealers]

   Dealer D: Status → NO_RESPONSE
   Dealer F: Status → DECLINED
   ↓

8. Compile & Rank Quotes
   System auto-sorts by total price:

   1. Dealer C: ₹310 + ₹0 = ₹310/pc → Total ₹9,300
   2. Dealer G: ₹315 + ₹5 = ₹320/pc → Total ₹9,600
   3. Dealer A: ₹320 + ₹0 = ₹320/pc → Total ₹9,600
   4. Dealer I: ₹325 + ₹0 = ₹325/pc → Total ₹9,750
   5. Dealer E: ₹328 + ₹0 = ₹328/pc → Total ₹9,840

   Admin reviews, selects top 5 quotes to send
   ↓

9. Send Quotes to Customer
   Admin clicks "Send to Customer"

   Selects method: SMS + Email

   SMS message auto-generated:
   "Hi Suresh,

   We received quotes for Havells 32A MCB (30 pcs):

   Best Price: ₹9,300 total (₹310/pc)
   Dealer: ABC Electricals, Ahmedabad
   Delivery: 3 days

   See all 5 quotes: https://hub4estate.com/track/HUB-0156

   - Hub4Estate"

   Email contains:
   - Full quote comparison table
   - Dealer contact details (name, phone, shop address)
   - Product details
   - Next steps

   Admin clicks "Send"
   → SMS + Email sent
   → Pipeline status: SENT_TO_CUSTOMER
   ↓

10. Customer Follow-up (Next Day)
    Customer calls dealer
    Negotiates slightly (₹9,000 final)
    Completes purchase

    Admin calls customer for feedback
    Marks inquiry as CLOSED
    Updates dealer response rates in system

    End of Pipeline
```

**Key Metrics Tracked:**
- Time from inquiry to brand identification: Target < 30 minutes
- Time from brand ID to dealer contact: Target < 1 hour
- Dealer response rate: Target > 70%
- Time to send quotes to customer: Target < 4 hours total

---

## 9. Authentication & Authorization

### 9.1 Authentication Methods

**For Users:**
1. **Google OAuth 2.0** (Primary, recommended)
2. **OTP-based Phone Authentication** (Fallback)

**For Dealers:**
1. **Email + Password** (Primary)
2. **OTP-based Phone Authentication** (For login after registration)

**For Admins:**
1. **Email + Password** (Only method)

### 9.2 Google OAuth Flow (Users)

**Implementation:**

```typescript
// Frontend: Google Sign-In Button
// File: frontend/src/components/auth/GoogleSignInButton.tsx

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

const GoogleSignInButton = () => {
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await authAPI.googleLogin(credentialResponse.credential);

      setAuth(response.data.token, response.data.user);

      if (response.data.isNewUser) {
        // Redirect to profile completion
        navigate('/auth/complete-profile');
      } else {
        // Redirect to dashboard or return URL
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login failed', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error('Google login error')}
        useOneTap
        theme="filled_blue"
        text="continue_with"
      />
    </GoogleOAuthProvider>
  );
};
```

```typescript
// Backend: Verify Google Token
// File: backend/src/routes/auth.routes.ts

import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/auth/google', async (req, res) => {
  const { credential } = req.body;

  try {
    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { googleId } });
    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          profileImage: picture,
          isEmailVerified: true, // Google email is pre-verified
        }
      });
      isNewUser = true;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({ token, user, isNewUser });

  } catch (error) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }
});
```

### 9.3 OTP-based Phone Authentication

**Flow:**

```
1. User enters phone number
   ↓
2. Backend generates 6-digit OTP
   ↓
3. Backend stores OTP in database with 10-minute expiry
   ↓
4. Backend sends OTP via Twilio SMS
   ↓
5. User enters OTP
   ↓
6. Backend verifies OTP matches and not expired
   ↓
7. Backend finds/creates User by phone
   ↓
8. Backend generates JWT and returns
```

**Implementation:**

```typescript
// Backend: Send OTP
// File: backend/src/routes/auth.routes.ts
// File: backend/src/services/sms.service.ts

import crypto from 'crypto';
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/auth/send-otp', async (req, res) => {
  const { phone, type } = req.body; // type: 'login' | 'signup'

  // Validate phone format (Indian: 10 digits)
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  // Generate 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();

  // Store in database
  const identifier = `+91${phone}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.oTP.create({
    data: {
      identifier,
      code,
      type,
      expiresAt,
    }
  });

  // Send SMS via Twilio
  await twilioClient.messages.create({
    body: `Your Hub4Estate OTP is: ${code}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: identifier,
  });

  return res.json({ success: true, identifier });
});

router.post('/auth/verify-otp', async (req, res) => {
  const { identifier, code, name } = req.body;

  // Find OTP
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      identifier,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    // Increment attempts
    await prisma.oTP.updateMany({
      where: { identifier },
      data: { attempts: { increment: 1 } },
    });

    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  // Mark OTP as verified
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Extract phone from identifier (+91XXXXXXXXXX)
  const phone = identifier.replace('+91', '');

  // Find or create user
  let user = await prisma.user.findUnique({ where: { phone } });
  let isNewUser = false;

  if (!user) {
    if (!name) {
      return res.status(400).json({ error: 'Name required for signup' });
    }

    user = await prisma.user.create({
      data: {
        phone,
        name,
        isPhoneVerified: true,
      }
    });
    isNewUser = true;
  } else {
    // Mark phone as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({ token, user, isNewUser });
});
```

### 9.4 JWT Token Structure

**User Token:**
```json
{
  "userId": "uuid",
  "type": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Dealer Token:**
```json
{
  "dealerId": "uuid",
  "type": "dealer",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Admin Token:**
```json
{
  "adminId": "uuid",
  "type": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 9.5 Authorization Middleware

**File:** `backend/src/middleware/auth.middleware.ts`

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'user') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateDealer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'dealer') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const dealer = await prisma.dealer.findUnique({ where: { id: decoded.dealerId } });

    if (!dealer) {
      return res.status(401).json({ error: 'Dealer not found' });
    }

    req.dealer = dealer;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Admin not found or inactive' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization helper - check if dealer is verified
export const requireVerifiedDealer = async (req: Request, res: Response, next: NextFunction) => {
  if (req.dealer.status !== 'VERIFIED') {
    return res.status(403).json({ error: 'Dealer not verified. Complete onboarding first.' });
  }
  next();
};

// Authorization helper - check if user profile is complete
export const requireCompleteProfile = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user.role || !req.user.city) {
    return res.status(403).json({ error: 'Please complete your profile first' });
  }
  next();
};
```

**Usage in Routes:**

```typescript
// User routes
router.get('/rfqs/my', authenticateUser, requireCompleteProfile, getMyRFQs);

// Dealer routes
router.post('/quotes/submit', authenticateDealer, requireVerifiedDealer, submitQuote);

// Admin routes
router.get('/admin/dashboard', authenticateAdmin, getDashboard);
```

---

**[Document continues with sections 10-19...]**

**Due to length constraints, this PRD document will be saved and you can reference specific sections. The complete document covers:**

- ✅ Sections 1-9 (above)
- Section 10: Core Features - Detailed Specifications
- Section 11: File Structure & Code Organization
- Section 12: Data Flow Diagrams
- Section 13: Technical Stack & Dependencies
- Section 14: Deployment & Infrastructure
- Section 15: Testing Strategy
- Section 16: Performance & Scalability
- Section 17: Security & Compliance
- Section 18: Analytics & Tracking
- Section 19: Future Roadmap

**The document is saved at:** `/Users/apple/Desktop/Hub4Estate Claude Code /hub4estate copy 2/PRODUCT_REQUIREMENTS_DOCUMENT.md`

Would you like me to continue writing sections 10-19, or would you like me to expand on any specific section above?
