# PRD 02 — Database Architecture, Security Architecture & File Structure

> **Document**: 02-DATABASE-SECURITY-FILE-STRUCTURE  
> **Version**: 1.0.0  
> **Last Updated**: 2026-04-02  
> **Author**: CTO Office, Hub4Estate  
> **Status**: Authoritative Reference  
> **Classification**: Internal — Engineering

---

## Table of Contents

1. [Complete Database Architecture](#1-complete-database-architecture)
   1. [Entity-Relationship Overview](#11-entity-relationship-overview)
   2. [Model Group 1 — User Management](#12-model-group-1--user-management)
   3. [Model Group 2 — Dealer Management](#13-model-group-2--dealer-management)
   4. [Model Group 3 — Product Catalog](#14-model-group-3--product-catalog)
   5. [Model Group 4 — Procurement Flow](#15-model-group-4--procurement-flow)
   6. [Model Group 5 — Community](#16-model-group-5--community)
   7. [Model Group 6 — CRM](#17-model-group-6--crm)
   8. [Model Group 7 — AI/Chat](#18-model-group-7--aichat)
   9. [Model Group 8 — Scraping](#19-model-group-8--scraping)
   10. [Model Group 9 — System](#110-model-group-9--system)
   11. [Database Scaling Strategy](#111-database-scaling-strategy)
   12. [Future Schema Additions](#112-future-schema-additions)
2. [Security Architecture](#2-security-architecture)
   1. [Authentication](#21-authentication)
   2. [Authorization](#22-authorization)
   3. [Data Protection](#23-data-protection)
   4. [API Security](#24-api-security)
   5. [Infrastructure Security](#25-infrastructure-security)
   6. [Fraud Detection](#26-fraud-detection)
   7. [Audit & Compliance](#27-audit--compliance)
   8. [Threat Model (STRIDE)](#28-threat-model-stride)
3. [Complete File Structure](#3-complete-file-structure)
   1. [Current File Structure](#31-current-file-structure)
   2. [Target File Structure](#32-target-file-structure)

---

## 1. Complete Database Architecture

### 1.1 Entity-Relationship Overview

The Hub4Estate database consists of **49 Prisma models** and **19 enums** organized into 9 logical groups. PostgreSQL is the backing store, managed through Prisma ORM, hosted on AWS RDS.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HUB4ESTATE ENTITY-RELATIONSHIP MAP                   │
│                          49 Models · 19 Enums · PostgreSQL                  │
└─────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════╗     ╔═══════════════════════════════════╗
║     USER MANAGEMENT (7 models)    ║     ║    DEALER MANAGEMENT (5 models)   ║
║                                   ║     ║                                   ║
║  ┌──────────┐   ┌──────────────┐  ║     ║  ┌──────────┐                     ║
║  │   User   │──▶│ ProfProfile  │  ║     ║  │  Dealer  │──┐                  ║
║  └────┬─────┘   └──────┬───────┘  ║     ║  └──┬──┬──┬─┘  │                  ║
║       │                │          ║     ║     │  │  │     │                  ║
║       │         ┌──────▼───────┐  ║     ║  ┌──▼┐ │ ┌▼──┐ ┌▼─────────────┐  ║
║       │         │  ProfDoc     │  ║     ║  │DSA│ │ │DRv│ │DealerBrandMap│  ║
║       │         └──────────────┘  ║     ║  └───┘ │ └───┘ └──────────────┘  ║
║  ┌────▼─────┐                     ║     ║     ┌──▼──────────────┐           ║
║  │   OTP    │   ┌──────────────┐  ║     ║     │DealerCategoryMap│           ║
║  └──────────┘   │    Admin     │  ║     ║     └─────────────────┘           ║
║                 └──────────────┘  ║     ║                                   ║
║  ┌──────────────┐ ┌────────────┐  ║     ╚═══════════════════════════════════╝
║  │ RefreshToken │ │ PwdReset   │  ║
║  └──────────────┘ └────────────┘  ║     ╔═══════════════════════════════════╗
╚═══════════════════════════════════╝     ║    PRODUCT CATALOG (7 models)     ║
                                          ║                                   ║
╔═══════════════════════════════════╗     ║  ┌──────────┐   ┌──────────┐      ║
║    PROCUREMENT FLOW (9 models)    ║     ║  │ Category │──▶│SubCateg. │      ║
║                                   ║     ║  └──────────┘   └────┬─────┘      ║
║  ┌───────┐     ┌───────────┐      ║     ║                ┌─────▼──────┐     ║
║  │  RFQ  │────▶│  RFQItem  │      ║     ║                │ProductType │     ║
║  └───┬───┘     └───────────┘      ║     ║                └─────┬──────┘     ║
║      │                            ║     ║        ┌─────┐ ┌─────▼──────┐     ║
║  ┌───▼───┐     ┌───────────┐      ║     ║        │Brand│▶│  Product   │     ║
║  │ Quote │────▶│ QuoteItem │      ║     ║        └──┬──┘ └─────┬──────┘     ║
║  └───────┘     └───────────┘      ║     ║           │    ┌─────▼──────┐     ║
║                                   ║     ║           │    │SavedProduct│     ║
║  ┌────────────┐  ┌────────────┐   ║     ║           │    └────────────┘     ║
║  │ ProdInquiry│─▶│InqDlrResp │   ║     ║  ┌────────▼──────────┐            ║
║  └─────┬──────┘  └────────────┘   ║     ║  │DealerBrandMapping │            ║
║        │                          ║     ║  └───────────────────┘            ║
║  ┌─────▼──────┐  ┌────────────┐   ║     ╚═══════════════════════════════════╝
║  │InqPipeline │─▶│InqDlrQuote│   ║
║  └────────────┘  └──────┬─────┘   ║     ╔═══════════════════════════════════╗
║                  ┌──────▼─────┐   ║     ║      COMMUNITY (3 models)         ║
║                  │BrandDealer │   ║     ║                                   ║
║                  └────────────┘   ║     ║  ┌──────────┐   ┌──────────────┐  ║
╚═══════════════════════════════════╝     ║  │CommPost  │──▶│ CommComment  │  ║
                                          ║  └──────────┘   └──────┬───────┘  ║
╔═══════════════════════════════════╗     ║                        │ self-ref  ║
║       CRM (5 models)              ║     ║  ┌──────────────┐      ▼          ║
║                                   ║     ║  │KnowledgeArt. │  (nested)       ║
║  ┌──────────┐   ┌──────────┐      ║     ║  └──────────────┘                 ║
║  │CRMCompany│──▶│CRMContact│      ║     ╚═══════════════════════════════════╝
║  └────┬─────┘   └────┬─────┘      ║
║       │              │            ║     ╔═══════════════════════════════════╗
║  ┌────▼──────────────▼──┐         ║     ║       AI/CHAT (2 models)          ║
║  │    CRMOutreach       │         ║     ║                                   ║
║  └──────────────────────┘         ║     ║  ┌────────────┐  ┌────────────┐   ║
║  ┌──────────┐   ┌──────────────┐  ║     ║  │ChatSession │─▶│ChatMessage │   ║
║  │CRMMeeting│   │CRMPipeline  │   ║     ║  └────────────┘  └────────────┘   ║
║  └──────────┘   │   Stage      │  ║     ╚═══════════════════════════════════╝
║                 └──────────────┘  ║
╚═══════════════════════════════════╝     ╔═══════════════════════════════════╗
                                          ║      SCRAPING (5 models)          ║
╔═══════════════════════════════════╗     ║                                   ║
║     SYSTEM (7 models)             ║     ║  ┌───────────┐  ┌─────────────┐   ║
║                                   ║     ║  │ScrapeBrand│─▶│  ScrapeJob  │   ║
║  ┌──────────┐ ┌──────────────┐    ║     ║  └─────┬─────┘  └─────────────┘   ║
║  │ AuditLog │ │  FraudFlag   │    ║     ║  ┌─────▼─────────┐               ║
║  └──────────┘ └──────────────┘    ║     ║  │ScrapedProduct │               ║
║  ┌──────────────┐ ┌───────────┐   ║     ║  └───────────────┘               ║
║  │ContactSubmit │ │EmailTempl │   ║     ║  ┌─────────────┐ ┌────────────┐  ║
║  └──────────────┘ └───────────┘   ║     ║  │ScrapeMapping│ │ScrapeTmpl  │  ║
║  ┌──────────────┐ ┌───────────┐   ║     ║  └─────────────┘ └────────────┘  ║
║  │ Notification │ │DevicePush │   ║     ╚═══════════════════════════════════╝
║  └──────────────┘ └───────────┘   ║
║  ┌──────────────┐                 ║
║  │UserActivity  │                 ║
║  └──────────────┘                 ║
╚═══════════════════════════════════╝
```

**Enum Summary (19 enums)**:

| Enum | Used By | Values |
|------|---------|--------|
| `UserRole` | User | INDIVIDUAL_HOME_BUILDER, RENOVATION_HOMEOWNER, ARCHITECT, INTERIOR_DESIGNER, CONTRACTOR, ELECTRICIAN, SMALL_BUILDER, DEVELOPER |
| `UserStatus` | User | ACTIVE, SUSPENDED, DELETED |
| `ProfVerificationStatus` | User | NOT_APPLIED, PENDING_DOCUMENTS, UNDER_REVIEW, VERIFIED, REJECTED |
| `DealerStatus` | Dealer | PENDING_VERIFICATION, DOCUMENTS_PENDING, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED, DELETED |
| `DealerType` | Dealer | RETAILER, DISTRIBUTOR, SYSTEM_INTEGRATOR, CONTRACTOR, OEM_PARTNER, WHOLESALER |
| `RFQStatus` | RFQ | DRAFT, PUBLISHED, QUOTES_RECEIVED, DEALER_SELECTED, COMPLETED, CANCELLED |
| `QuoteStatus` | Quote | SUBMITTED, SELECTED, REJECTED, EXPIRED |
| `PostStatus` | CommunityPost | PUBLISHED, HIDDEN, DELETED |
| `AuditAction` | AuditLog | DEALER_VERIFIED, DEALER_REJECTED, DEALER_SUSPENDED, PRODUCT_CREATED, PRODUCT_UPDATED, CATEGORY_CREATED, USER_SUSPENDED, RFQ_FLAGGED, QUOTE_FLAGGED |
| `CompanyType` | CRMCompany | MANUFACTURER, DISTRIBUTOR, DEALER, BRAND, OTHER |
| `CompanySegment` | CRMCompany | PREMIUM, MID_RANGE, BUDGET, ALL_SEGMENTS |
| `OutreachType` | CRMOutreach | EMAIL, LINKEDIN, PHONE_CALL, MEETING, WHATSAPP, OTHER |
| `OutreachStatus` | CRMOutreach | SCHEDULED, SENT, DELIVERED, OPENED, REPLIED, MEETING_SCHEDULED, NOT_INTERESTED, BOUNCED, FAILED |
| `PipelineStatus` | InquiryPipeline | BRAND_IDENTIFIED, DEALERS_FOUND, QUOTES_REQUESTED, QUOTES_RECEIVED, SENT_TO_CUSTOMER, CLOSED |
| `QuoteResponseStatus` | InquiryDealerQuote | PENDING, CONTACTED, QUOTED, NO_RESPONSE, DECLINED |
| `ContactMethod` | InquiryDealerQuote | WHATSAPP, CALL, EMAIL, SMS |
| `BrandDealerSource` | BrandDealer | MANUAL, SCRAPED, BRAND_WEBSITE, PLATFORM_DEALER |
| `ScrapeStatus` | ScrapeJob | PENDING, IN_PROGRESS, COMPLETED, FAILED, PARTIAL |
| `ActivityType` | UserActivity | 30+ event types covering auth, dealer, product, RFQ, quote, community, contact, chat, admin |

---

### 1.2 Model Group 1 — User Management

**Models**: User, ProfessionalProfile, ProfessionalDocument, OTP, Admin, RefreshToken, PasswordResetToken

**Business Context**: Hub4Estate serves anyone who wants to buy electrical products at the best price. Users range from individual homeowners to architects and contractors. The user management system supports multi-strategy authentication (Google OAuth, Phone OTP, Email/Password) and professional verification for credentialed roles.

#### User

**Purpose**: The central identity for all buyers on the platform. Supports multiple authentication entry points and tracks role-based profile completion.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID (PK) | Prisma-generated. UUIDs prevent enumeration attacks and support distributed ID generation. |
| `email` | String? (unique) | Optional because phone-first auth is the primary flow in India. Indexed for O(1) lookup on login. |
| `googleId` | String? (unique) | Stores Google OAuth sub-identifier. Unique ensures one Google account = one Hub4Estate user. |
| `phone` | String? (unique) | Indian mobile number. Primary auth channel for tier-2/3 city users. |
| `name` | String | Display name. Required at signup. |
| `role` | UserRole? | Nullable until profile completion. Determines UI experience and feature access. |
| `city` | String? | For geographically matching to nearby dealers. Indexed because dealer-matching queries filter by city. |
| `purpose` | String? | "new build" or "renovation" — determines product recommendation flow. |
| `status` | UserStatus | ACTIVE by default. SUSPENDED blocks login. DELETED triggers GDPR cascade. |
| `profileImage` | String? | S3 URL. Displayed in community posts and reviews. |
| `isPhoneVerified` | Boolean | Unlocks inquiry submission (requires verified phone for lead quality). |
| `isEmailVerified` | Boolean | Unlocks email-based notifications and password recovery. |
| `profVerificationStatus` | ProfVerificationStatus | Tracks professional verification workflow for architects, designers, contractors. |

**Indexes and Rationale**:
- `@@index([email])` — Login and duplicate-check queries.
- `@@index([phone])` — OTP-based login lookup. Most common auth path.
- `@@index([googleId])` — OAuth callback lookup.
- `@@index([city])` — Dealer matching and geo-filtered queries.
- `@@index([profVerificationStatus])` — Admin dashboard filters for verification queue.

**Cascade Behavior**: User deletion cascades to RFQs, CommunityPosts, CommunityComments, SavedProducts, and ProfessionalProfile. This ensures GDPR compliance — when a user requests deletion, all their data is removed in a single transaction.

#### ProfessionalProfile

**Purpose**: Extended profile for architects, interior designers, contractors, and electricians seeking verified professional status. Verification unlocks a "Verified Professional" badge, priority in community, and (future) professional pricing.

**Key Fields**: `businessName`, `registrationNo` (COA number for architects, trade license for contractors), `yearsExperience`, `verifiedAt`, `verifiedBy` (admin ID), `rejectionReason`.

**Cascade**: `onDelete: Cascade` from User. If user account is deleted, professional profile goes with it. Documents cascade from profile.

#### ProfessionalDocument

**Purpose**: Stores uploaded verification documents — COA certificates, trade licenses, GST certificates, ID proofs, portfolio PDFs. Each document is individually verifiable by admin.

**Key Fields**: `docType` (string enum: coa_certificate, trade_license, gst_certificate, id_proof, portfolio), `fileUrl` (S3 path), `fileSize` (bytes, for upload quota enforcement), `mimeType` (for content-type validation), `isVerified`.

**Indexes**: `@@index([profileId])` for loading all docs for a profile, `@@index([docType])` for admin filtering.

#### OTP

**Purpose**: Time-limited one-time passwords for phone/email verification. Stateless-friendly — the OTP is validated against this table, not session state.

**Key Fields**: `identifier` (phone or email), `code` (6-digit), `type` (login vs signup — different rate limits), `expiresAt` (5-minute TTL), `verified` (prevents reuse), `attempts` (max 3 before lockout).

**Indexes**: `@@index([identifier])` for lookup, `@@index([expiresAt])` for cleanup cron.

**Security Note**: OTPs are stored as plain 6-digit strings (not hashed) because they are ephemeral (5-minute window) and the table is cleaned frequently. The `attempts` counter prevents brute-force within the window.

#### Admin

**Purpose**: Separate identity table for platform administrators. Admins do not share the User table because admin credentials use bcrypt password auth (no OAuth/OTP), and admin sessions have different security requirements (stricter rate limits, audit logging).

**Key Fields**: `email` (unique), `password` (bcrypt hash), `role` (string: "admin" or "super_admin"), `isActive`.

**Design Decision**: Admin is a separate table (not a role on User) to enforce complete separation of concerns. An admin cannot accidentally be treated as a buyer, and admin credentials are never exposed to user-facing auth flows.

#### RefreshToken

**Purpose**: Persistent refresh tokens for maintaining sessions across app restarts. The token rotation pattern ensures that a stolen refresh token can only be used once before the legitimate user detects the theft (their next refresh fails).

**Key Fields**: `token` (128-char hex, unique), `userId`, `userType` (user/dealer/admin), `revoked`, `revokedAt`, `expiresAt` (30-day TTL).

**Indexes**: `@@index([userId])` for "revoke all" operations (logout all devices), `@@index([token])` for O(1) validation, `@@index([expiresAt])` for cleanup cron, `@@index([revoked])` for filtering active tokens.

**Cleanup**: A background interval in `index.ts` runs every 6 hours, deleting expired tokens and revoked tokens older than 7 days.

#### PasswordResetToken

**Purpose**: One-time-use tokens for password reset flows. Sent via email, valid for a limited window.

**Key Fields**: `token` (unique), `email`, `userType` (user or dealer — admins use a different recovery flow), `used` (prevents reuse), `expiresAt`.

---

### 1.3 Model Group 2 — Dealer Management

**Models**: Dealer, DealerServiceArea, DealerReview, DealerBrandMapping, DealerCategoryMapping

**Business Context**: Dealers are the supply side of the marketplace. They register with business credentials (GST, PAN, shop license), go through admin verification, and then receive RFQs and product inquiries matched by brand, category, and geography.

#### Dealer

**Purpose**: The central identity for all sellers on the platform. Tracks the full lifecycle from registration through verification to active quoting.

| Field | Type | Purpose |
|-------|------|---------|
| `email` | String (unique, required) | Primary login credential. Required (unlike User) because dealers are businesses. |
| `password` | String? | Bcrypt hash. Nullable for future OAuth dealer onboarding. |
| `businessName` | String | Registered business name. Displayed on quotes and storefront. |
| `ownerName` | String | Owner's personal name for communication. |
| `gstNumber` | String (unique) | GST IN. Unique constraint prevents duplicate dealer registrations. |
| `panNumber` | String | PAN for tax compliance. Not unique because multiple businesses can share owner PAN. |
| `dealerType` | DealerType | RETAILER, DISTRIBUTOR, WHOLESALER, etc. Affects quote routing — distributors get bulk RFQs. |
| `shopImages` | String[] | Array of S3 URLs. Multiple shop/warehouse photos build buyer trust. |
| `brandAuthProofs` | String[] | Brand authorization documents. Verified by admin before "Authorized Dealer" badge. |
| `onboardingStep` | Int | 1-based step tracker. Frontend shows progress bar; backend validates required fields per step. |
| `profileComplete` | Boolean | Set true when all mandatory fields + at least one brand mapping exist. Gates access to RFQ feed. |
| `status` | DealerStatus | 7-state lifecycle. Only VERIFIED dealers can receive and respond to inquiries. |
| `totalRFQsReceived` | Int | Denormalized counter. Avoids COUNT(*) queries on the RFQ table for dealer dashboards. |
| `totalQuotesSubmitted` | Int | Denormalized counter for dealer performance metrics. |
| `totalConversions` | Int | Number of quotes that became orders. Key metric for dealer ranking. |
| `conversionRate` | Float | Pre-calculated: `totalConversions / totalQuotesSubmitted`. Used for dealer ranking algorithm. |
| `avgResponseTime` | Int? | Minutes. Calculated from median of quote submission times. Displayed to buyers. |

**Indexes**:
- `@@index([email])` — Login lookup.
- `@@index([gstNumber])` — Duplicate GST check during registration.
- `@@index([city])` — Geographic matching for inquiry routing.
- `@@index([status])` — Admin dashboard filtering (pending verifications, active dealers, etc.).

**Cascade**: Dealer deletion cascades to all brand/category mappings, service areas, quotes, reviews, and inquiry responses.

#### DealerServiceArea

**Purpose**: Maps dealers to the pincodes they can deliver to. A dealer in Jaipur might service pincodes 302001-302030. When a user submits an inquiry with a delivery pincode, the system matches to dealers who have that pincode in their service areas.

**Unique Constraint**: `@@unique([dealerId, pincode])` prevents duplicate entries. `@@index([pincode])` enables O(1) lookup when matching inquiries to dealers.

#### DealerReview

**Purpose**: Post-transaction reviews from users who selected a dealer's quote. Ratings feed into the dealer's conversion metrics and search ranking.

**Key Fields**: `rating` (1-5 integer), `comment` (optional text), `rfqId` (links review to specific transaction for authenticity).

#### DealerBrandMapping

**Purpose**: Records which brands a dealer sells, with optional authorization proof. The `isVerified` flag is set by admin after reviewing `authProofUrl`. Only verified brand mappings display the "Authorized Dealer" badge.

**Unique Constraint**: `@@unique([dealerId, brandId])` — one mapping per dealer-brand pair. Dual indexes on both FKs for bidirectional queries (all brands for a dealer, all dealers for a brand).

#### DealerCategoryMapping

**Purpose**: Records which product categories a dealer operates in. Used for routing RFQs — a dealer mapped to "MCBs & Distribution Boards" receives MCB-related inquiries.

---

### 1.4 Model Group 3 — Product Catalog

**Models**: Category, SubCategory, ProductType, Brand, Product, SavedProduct, DealerBrandMapping (cross-listed with Dealer group)

**Business Context**: The product catalog is platform-owned, not dealer-owned. Hub4Estate curates the catalog (categories, brands, product types) and dealers simply declare which brands/categories they sell. This ensures consistent product data and prevents catalog fragmentation.

#### Category → SubCategory → ProductType → Product (4-level hierarchy)

```
Category (e.g., "Wires & Cables")
  └── SubCategory (e.g., "House Wiring Cables")
       └── ProductType (e.g., "FRLS 1.5mm² Single Core")
            └── Product (e.g., "Havells Lifeline FRLS 1.5mm² — 90m coil")
```

**Why 4 levels?** Electrical products have deep categorization. A user looking for "wires" needs to narrow to house wiring vs industrial, then to wire gauge, then to specific brand/model. The hierarchy powers the drill-down browsing experience and structured product inquiry forms.

#### Category

**Key Fields Beyond Name/Slug**:
- `seoTitle`, `seoDescription` — Server-side rendered meta tags for Google indexing.
- `whatIsIt`, `whereUsed`, `whyQualityMatters`, `commonMistakes` — Educational content rendered on category pages. Hub4Estate differentiates by educating buyers (most don't know the difference between FRLS and PVC wiring).
- `sortOrder` — Manual ordering for homepage grid display.

**Index**: `@@index([slug])` for URL-based lookups (`/categories/wires-and-cables`).

#### SubCategory / ProductType

Both follow the same pattern: `name`, `slug`, `description`, `sortOrder`, `isActive`, plus a foreign key to the parent level.

**Unique Constraints**:
- SubCategory: `@@unique([categoryId, slug])` — Slugs unique within a category.
- ProductType: `@@unique([subCategoryId, slug])` — Slugs unique within a subcategory.

This allows the same slug (e.g., "standard") to exist in different parents without collision.

#### Brand

**Purpose**: Centralized brand registry. Brands are linked to Products (for catalog) and to DealerBrandMapping (for supply matching).

**Key Fields**: `isPremium` (affects UI treatment — premium brands get highlighted cards), `priceSegment` (Budget/Mid-range/Premium — used in comparison views), `qualityRating` (1-5 float — editorial rating by Hub4Estate team).

#### Product

**Purpose**: The atomic unit of the catalog. Represents a specific SKU from a specific brand.

**Key Fields**:
- `specifications` — JSON string containing structured technical specs (voltage, load capacity, material, compliance standards). JSON allows schema-per-product-type flexibility without separate spec tables.
- `images` — String array of S3 URLs. Array type because products can have 1-10 images.
- `certifications` — String array (ISI, IEC, BIS, etc.). Displayed as trust badges.
- `datasheetUrl`, `manualUrl` — Links to manufacturer PDFs hosted on S3.

**Indexes**: `@@index([brandId])` for brand catalog pages, `@@index([productTypeId])` for browsing within a product type, `@@index([sku])` for search-by-SKU (common for professionals who know exact model numbers).

#### SavedProduct

**Purpose**: User's wishlist/bookmark for products they want to include in future RFQs. Simple join table with optional notes field.

**Unique Constraint**: `@@unique([userId, productId])` — prevents duplicate saves.

---

### 1.5 Model Group 4 — Procurement Flow

**Models**: RFQ, RFQItem, Quote, QuoteItem, ProductInquiry, InquiryDealerResponse, InquiryPipeline, InquiryDealerQuote, BrandDealer

**Business Context**: Hub4Estate operates two parallel procurement paths:
1. **RFQ Path** (structured): User browses catalog, adds products to cart, creates an RFQ. Matched dealers submit formal quotes with line-item pricing.
2. **Inquiry Path** (unstructured): User submits a quick inquiry with product photo/model number. Admin identifies the product, finds relevant dealers (platform or external), collects quotes, and sends best price to customer.

The Inquiry Path is the current primary revenue flow — it is the manual "concierge" model that validates the marketplace hypothesis before full automation.

#### RFQ → RFQItem

**Purpose**: Structured multi-product quote request. User creates an RFQ with delivery location, timeline, and one or more product items.

**Key Fields on RFQ**:
- `deliveryCity`, `deliveryPincode`, `deliveryAddress` — Geographic targeting for dealer matching.
- `deliveryPreference` (delivery/pickup/both) — Filters dealers by fulfillment capability.
- `urgency` (normal/urgent) — Urgent RFQs are pushed to dealers via push notification.
- `aiSuggestions`, `aiFlags` — JSON fields where the AI service stores recommendations (e.g., "consider brand X for this specification") and warnings (e.g., "this quantity seems unusually high for a residential project").
- `selectedDealerId`, `selectedQuoteId` — Set when user accepts a quote. Triggers dealer performance counter update.

**Status Lifecycle**: DRAFT → PUBLISHED → QUOTES_RECEIVED → DEALER_SELECTED → COMPLETED (or CANCELLED at any point).

**Indexes**: `@@index([userId])` for user's RFQ history, `@@index([status])` for admin overview, `@@index([deliveryPincode])` for dealer matching, `@@index([publishedAt])` for chronological feed.

#### Quote → QuoteItem

**Purpose**: A dealer's formal response to an RFQ. One quote per dealer per RFQ (enforced by `@@unique([rfqId, dealerId])`).

**Key Fields on Quote**:
- `totalAmount`, `shippingCost` — Financial data. QuoteItems contain per-product breakdown.
- `validUntil` — Quote expiry. Frontend shows countdown. Expired quotes are auto-rejected.
- `lossReason`, `rankPosition` — Populated after RFQ closes. Enables dealer analytics ("you lost 3 RFQs this month on price").
- `viewedAt` — Tracks when user first saw this quote. Used for "time to decision" analytics.

#### ProductInquiry

**Purpose**: The lightweight, high-conversion entry point. A user submits name, phone, optional photo, optional model number, quantity, and delivery city. No login required. This is the form that generates the real validated deals referenced in Hub4Estate's pitch.

**Key Fields**:
- `inquiryNumber` — Human-readable ID (e.g., `HUB-HAVELLS-MCB-0001`). Auto-generated when admin identifies the brand/category.
- `productPhoto` — S3 URL of user-uploaded product image. Fed to AI parser for brand/model identification.
- `quotedPrice`, `shippingCost`, `totalPrice` — Admin's response quote sent back to the user.
- `categoryId`, `identifiedBrandId` — Set by AI or admin during triage. Links the unstructured inquiry to structured catalog.

**Status Lifecycle**: new → contacted → quoted → closed.

#### InquiryDealerResponse

**Purpose**: When the platform routes an inquiry to registered dealers (as opposed to external BrandDealers), their responses are tracked here. This is the marketplace-automated path that supplements the manual pipeline.

**Status**: pending → viewed → quoted → declined.

#### InquiryPipeline

**Purpose**: The admin's workflow tracker for processing an inquiry. One pipeline per inquiry. Tracks the journey from AI analysis through dealer outreach to customer notification.

**Key Fields**:
- `identifiedBrand`, `identifiedProduct`, `identifiedCategory` — Denormalized text fields (in addition to `identifiedBrandId` FK) so the pipeline remains readable even if brand records change.
- `aiAnalysis` — JSON blob from the AI parser: brand confidence score, product identification details, suggested WhatsApp template for dealer outreach.
- `sentToCustomerAt`, `sentVia` — Tracks when and how the best quote was communicated back to the user.

**Status Lifecycle**: BRAND_IDENTIFIED → DEALERS_FOUND → QUOTES_REQUESTED → QUOTES_RECEIVED → SENT_TO_CUSTOMER → CLOSED.

#### InquiryDealerQuote

**Purpose**: Tracks each individual dealer contacted within a pipeline. A single inquiry pipeline may have 3-8 dealers contacted, each with their own quote status.

**Key Design Decision**: This model references EITHER a `BrandDealer` (external, not registered on platform) OR a platform `Dealer` via `dealerId` (string, no FK constraint). This flexibility allows mixing external and internal dealer quotes in the same pipeline.

**Denormalized Fields**: `dealerName`, `dealerPhone`, `dealerShopName`, `dealerCity` — Stored separately from the FK so the quote history remains intact even if the dealer record is deleted or modified.

#### BrandDealer

**Purpose**: External dealer contacts sourced from brand websites, scraped directories, or manual data entry. These are NOT registered platform dealers — they are real-world dealers contacted via WhatsApp/phone for one-off quotes.

**Key Fields**: `source` (MANUAL, SCRAPED, BRAND_WEBSITE, PLATFORM_DEALER), `sourceUrl` (provenance tracking), `isVerified`, `isActive`.

**Unique Constraint**: `@@unique([brandId, phone])` — One entry per brand-phone combination. A dealer who sells both Havells and Polycab gets separate entries for each brand.

---

### 1.6 Model Group 5 — Community

**Models**: CommunityPost, CommunityComment, KnowledgeArticle

**Business Context**: Community features build user retention and organic traffic. Forum posts help users share buying experiences and ask questions. Knowledge articles are Hub4Estate-authored educational content that drives SEO traffic and establishes authority.

#### CommunityPost

**Purpose**: User-generated discussion threads. Filtered by city and category for local relevance.

**Self-referencing Comments**: CommunityComment has a `parentId` self-reference for nested reply threads. `onDelete: Cascade` on the parent relation ensures deleting a comment removes its entire reply subtree.

#### KnowledgeArticle

**Purpose**: Admin-authored educational content. Supports rich text/Markdown, SEO meta tags, and cover images. The `views` counter is incremented on each pageview for content performance analytics.

**Indexes**: `@@index([slug])` for URL routing, `@@index([category])` for category pages, `@@index([isPublished])` for excluding drafts from public queries.

---

### 1.7 Model Group 6 — CRM

**Models**: CRMCompany, CRMContact, CRMOutreach, CRMMeeting, CRMPipelineStage

**Business Context**: The CRM manages Hub4Estate's B2B relationships with manufacturers, distributors, and brands. This is the internal tool for tracking outreach to companies like Havells, Polycab, Finolex, etc. — potential partners who might list their dealer networks on the platform or integrate their catalogs.

#### CRMCompany

**Purpose**: Represents a company Hub4Estate is pursuing for a partnership. Rich metadata for segmentation: `type` (MANUFACTURER, DISTRIBUTOR, BRAND), `segment` (PREMIUM, MID_RANGE, BUDGET), `digitalMaturity` (low/medium/high), `dealerNetworkSize`.

**Pipeline Status**: `status` field tracks the overall relationship stage: prospect → contacted → interested → partner → inactive.

#### CRMContact

**Purpose**: Individual people at CRM companies. Tracks `designation`, `department`, `decisionMaker` flag, and `isPrimary` flag. Multiple contacts per company.

#### CRMOutreach

**Purpose**: Every communication touchpoint. Supports EMAIL, LINKEDIN, PHONE_CALL, MEETING, WHATSAPP, and OTHER. Tracks the full lifecycle: SCHEDULED → SENT → DELIVERED → OPENED → REPLIED (or BOUNCED/FAILED).

**Key Fields**: `templateUsed` (links to EmailTemplate for email outreach), `responseSentiment` (positive/neutral/negative — admin assessment), `followUpDate`, `followUpNumber` (1st, 2nd, 3rd follow-up tracking).

#### CRMMeeting

**Purpose**: Scheduled meetings with CRM companies. Stores `agenda`, `notes`, `outcome`, `nextSteps`. `attendees` field is JSON because attendee structure varies per meeting.

#### CRMPipelineStage

**Purpose**: Configuration table for pipeline stages. Defines the kanban board columns in the CRM UI. `color` (hex) for visual rendering, `sortOrder` for column positioning.

---

### 1.8 Model Group 7 — AI/Chat

**Models**: ChatSession, ChatMessage

**Business Context**: The floating AI assistant widget helps users find products, understand specifications, and submit inquiries through conversational interaction. Powered by Anthropic Claude API. Sessions persist across page navigation.

#### ChatSession

**Purpose**: Groups messages into conversations. Optionally linked to a logged-in user (`userId`), or tracks anonymous users by `userEmail` if they provide it during chat.

**Key Fields**: `title` (auto-generated from first message for session list UI), `messageCount` (denormalized for analytics without COUNT(*)), `lastMessageAt` (for sorting recent sessions).

#### ChatMessage

**Purpose**: Individual messages in a chat. `role` is "user" or "assistant". `tokenCount` tracks API token usage for cost monitoring.

**Cascade**: Session deletion cascades to all messages.

---

### 1.9 Model Group 8 — Scraping

**Models**: ScrapeBrand, ScrapeJob, ScrapedProduct, ScrapeMapping, ScrapeTemplate

**Business Context**: Hub4Estate scrapes product catalogs from manufacturer websites to build its product database. This avoids manual data entry for thousands of SKUs. The scraping system is designed for scheduled, repeatable, auditable data collection.

#### ScrapeBrand

**Purpose**: Represents a brand website to scrape. Contains the scraping configuration: `catalogUrls` (JSON array of starting URLs), `selectors` (JSON CSS selectors for product name, price, specs, images, etc.), `scrapeFrequency` (daily/weekly/monthly).

**Key Fields**: `totalProducts` (running count), `lastScrapedAt` / `nextScrapeAt` (scheduler state).

#### ScrapeJob

**Purpose**: An individual scrape execution. Logs `productsFound`, `productsCreated`, `productsUpdated`, `errors`. The `configSnapshot` field captures the exact selectors used — if selectors change later, you can still understand what a past job did.

**Status Lifecycle**: PENDING → IN_PROGRESS → COMPLETED (or FAILED / PARTIAL).

#### ScrapedProduct

**Purpose**: Raw scraped data before normalization. All fields are prefixed `raw*` to distinguish from the clean Product model. `contentHash` enables deduplication — if a re-scrape finds the same product (same hash), it updates rather than duplicates.

**Processing Pipeline**: ScrapedProduct (`isProcessed: false`) → ScrapeMapping rules → normalized Product (`productId` backlink).

#### ScrapeMapping

**Purpose**: Rules for automatically mapping raw scraped data to Hub4Estate's catalog hierarchy. Pattern-based: `brandPattern` (regex on brand name), `categoryPattern` (regex on raw category string), `namePattern` (regex on product name) → target category/subcategory/product type IDs.

**Priority**: Higher priority rules are evaluated first. This allows specific rules to override general ones.

#### ScrapeTemplate

**Purpose**: Reusable scraping configurations shared across brands with similar website structures. Contains common CSS selectors as JSON. `brandIds` array links to brands using this template.

---

### 1.10 Model Group 9 — System

**Models**: AuditLog, FraudFlag, ContactSubmission, EmailTemplate, Notification, DevicePushToken, UserActivity

#### AuditLog

**Purpose**: Immutable record of every admin action. Required for compliance and incident investigation. Every dealer verification, rejection, product modification, or user suspension is logged with the admin ID, entity reference, and details JSON.

**Key Enum**: `AuditAction` — 10 action types covering dealer, product, user, and RFQ operations.

**Indexes**: `@@index([entityType, entityId])` for viewing all actions on a specific entity, `@@index([performedBy])` for auditing a specific admin, `@@index([createdAt])` for chronological review.

#### FraudFlag

**Purpose**: Tracks suspicious activity across the platform. Can be raised by automated systems or manually by admins.

**Key Fields**: `entityType` (user/dealer/rfq/quote), `flagType` (duplicate_gst, fake_quote, spam_rfq, etc.), `severity` (low/medium/high/critical), `status` (open → investigating → resolved/false_positive).

**Workflow**: System detects anomaly → creates FraudFlag → admin reviews → resolves or marks false positive. Resolution is tracked with `resolvedBy` and `resolvedAt`.

#### ContactSubmission

**Purpose**: Captures all inbound leads from the contact form, AI assistant, and other entry points. Tracks the lead lifecycle from submission through qualification to conversion.

**Key Fields**: `role` (homeowner/contractor/dealer/brand/other — segments the lead), `source` (contact_form/ai_assistant), `status` (new → contacted → qualified → converted → closed), `assignedTo` (admin who owns this lead).

#### EmailTemplate

**Purpose**: Reusable HTML email templates for outreach. Supports placeholder syntax (`{{company_name}}`, `{{contact_name}}`, etc.). Used by the CRM outreach system and automated notification emails.

#### Notification

**Purpose**: In-app notification records. Stored per-user, tracks read/unread state. `data` field is JSON payload for deep-linking (e.g., tapping a "New quote received" notification navigates to the specific RFQ).

#### DevicePushToken

**Purpose**: Expo push tokens for mobile apps. Tracks per-device tokens with platform (iOS/Android) and active state. Used by the notification service to send push notifications.

#### UserActivity

**Purpose**: Comprehensive event log for analytics and debugging. Every significant user action is recorded: signups, logins, inquiries, searches, quote submissions, community posts, admin logins.

**Key Fields**:
- `actorType` (user/dealer/admin/anonymous) + `actorId` — Who did it.
- `activityType` — What happened (30+ enum values covering the entire platform).
- `metadata` — JSON blob with context-specific details (product names, model numbers, search queries, etc.).
- `entityType` + `entityId` — What it was done to.
- `ipAddress`, `userAgent` — Request context for security analysis.

**Indexes**: `@@index([actorType, actorId])` for user activity timeline, `@@index([activityType])` for aggregate analytics, `@@index([entityType, entityId])` for entity history, `@@index([createdAt])` for time-range queries, `@@index([actorEmail])` for cross-referencing anonymous to authenticated activity.

---

### 1.11 Database Scaling Strategy

#### Read Replicas

Analytics queries (admin dashboard aggregations, dealer performance reports, scraping stats) will be routed to a read replica to avoid impacting the primary database's write performance.

**Implementation**: Prisma supports multiple datasources. Define a `readReplica` datasource in schema.prisma and use `prisma.$extends` to route read-only queries.

**Trigger**: When analytics queries consistently exceed 500ms or admin dashboard loads degrade below 2s target.

#### Table Partitioning

The `UserActivity` table grows the fastest (every user action = a row). At scale (100K+ daily active users), this table will contain billions of rows.

**Strategy**: Time-based range partitioning on `createdAt`. Monthly partitions (e.g., `user_activity_2026_04`, `user_activity_2026_05`). Queries naturally filter by date range, so partition pruning keeps performance constant regardless of total table size.

**Implementation**: Native PostgreSQL `PARTITION BY RANGE` on the `createdAt` column. Prisma raw queries for partition management (Prisma doesn't natively support partitioning, but the underlying table can be partitioned transparently).

#### Connection Pooling (PgBouncer)

**Current State**: Prisma's built-in connection pool (default 10 connections per serverless function instance). Adequate for current traffic (<1000 concurrent users).

**Scaling Plan**: Deploy PgBouncer as a sidecar on the EC2 instance. Transaction-mode pooling to support higher concurrency without exhausting PostgreSQL's connection limit (max_connections = 100 on RDS db.t3.micro, 200 on db.t3.small).

**Configuration Target**:
- PgBouncer pool_size: 20
- PgBouncer max_client_conn: 200
- PostgreSQL max_connections: 100
- Prisma connection_limit: 5 per instance (Prisma talks to PgBouncer, not directly to PostgreSQL)

#### Vacuum and Maintenance

**PostgreSQL Autovacuum** is enabled by default on RDS but needs tuning for high-churn tables:

| Table | Autovacuum Scale Factor | Reason |
|-------|------------------------|--------|
| UserActivity | 0.01 (1%) | High INSERT volume, needs aggressive vacuuming |
| OTP | 0.05 (5%) | Frequent INSERT + DELETE cycles |
| RefreshToken | 0.05 (5%) | Regular cleanup cycles |
| ChatMessage | 0.02 (2%) | High INSERT volume |
| All others | 0.2 (20% — default) | Standard churn |

**Maintenance Window**: RDS maintenance window set to Sunday 03:00-04:00 IST (low traffic period).

#### Backup Strategy

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Automated RDS snapshot | Daily at 02:00 IST | 35 days | RDS (included) |
| Point-in-time recovery | Continuous (5-min RPO) | 35 days | RDS transaction logs |
| Manual snapshot | Before major migrations | Permanent until deleted | RDS |
| Logical backup (pg_dump) | Weekly (Sunday 04:00 IST) | 90 days | S3 Glacier |
| Schema-only backup | On every migration | Permanent | Git (migration files) |

**Recovery Testing**: Quarterly restore test to a staging RDS instance. Verify data integrity by comparing row counts and checksums.

---

### 1.12 Future Schema Additions

These models are planned for the next development phases. Listed here so current schema design decisions account for forward compatibility.

#### PaymentTransaction (Phase 2 — Dealer Subscriptions)

```
model PaymentTransaction {
  id                String   @id @default(uuid())
  dealerId          String
  subscriptionId    String?
  amount            Float
  currency          String   @default("INR")
  paymentGateway    String   // razorpay, stripe
  gatewayOrderId    String   @unique
  gatewayPaymentId  String?  @unique
  status            String   // created, authorized, captured, failed, refunded
  receiptUrl        String?
  metadata          String?  @db.Text
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### SubscriptionPlan + DealerSubscription (Phase 2)

```
model SubscriptionPlan {
  id              String   @id @default(uuid())
  name            String   // Basic, Pro, Enterprise
  price           Float    // Monthly in INR
  maxLeadsPerMonth Int
  maxBrands       Int
  features        String[] // Feature flags
  isActive        Boolean  @default(true)
}

model DealerSubscription {
  id          String   @id @default(uuid())
  dealerId    String
  planId      String
  status      String   // active, cancelled, expired, past_due
  startDate   DateTime
  endDate     DateTime
  autoRenew   Boolean  @default(true)
}
```

#### PriceHistory (Phase 3 — Market Intelligence)

```
model PriceHistory {
  id          String   @id @default(uuid())
  productId   String
  brandId     String
  price       Float
  source      String   // dealer_quote, scrape, manual
  sourceId    String?  // Quote ID or ScrapeJob ID
  recordedAt  DateTime @default(now())

  @@index([productId, recordedAt])
  @@index([brandId, recordedAt])
}
```

#### DealerScore (Phase 3 — ML-Based Ranking)

```
model DealerScore {
  id                String   @id @default(uuid())
  dealerId          String   @unique
  overallScore      Float    // 0-100 composite
  priceScore        Float    // How competitive are their quotes
  responseScore     Float    // How fast do they respond
  reliabilityScore  Float    // Do they fulfill quoted terms
  reviewScore       Float    // Customer satisfaction
  calculatedAt      DateTime @default(now())
  factors           String?  @db.Text // JSON breakdown
}
```

#### SearchLog (Phase 2 — Search Analytics)

```
model SearchLog {
  id          String   @id @default(uuid())
  query       String
  userId      String?
  resultCount Int
  clickedId   String?  // Product/Category/Brand they clicked
  source      String   // homepage, catalog, chat
  createdAt   DateTime @default(now())

  @@index([query])
  @@index([createdAt])
}
```

#### ABTestVariant (Phase 4 — Experimentation)

```
model ABTestVariant {
  id          String   @id @default(uuid())
  testName    String
  variantName String   // control, variant_a, variant_b
  userId      String
  assignedAt  DateTime @default(now())
  convertedAt DateTime?
  metadata    String?  @db.Text

  @@unique([testName, userId])
  @@index([testName, variantName])
}
```

---

## 2. Security Architecture

### 2.1 Authentication

Hub4Estate implements a multi-strategy authentication system designed for the Indian market where phone-first authentication is the primary path, supplemented by Google OAuth for tech-savvy users and email/password for dealers.

#### Authentication Strategies

| Strategy | User Type | Implementation | Entry Point |
|----------|-----------|----------------|-------------|
| Google OAuth 2.0 | Users | Passport.js Google Strategy | `/api/auth/google` |
| Phone OTP | Users | MSG91 / Twilio SMS gateway | `/api/auth/otp/send` → `/api/auth/otp/verify` |
| Email + Password | Dealers | bcrypt hash (cost factor 12) | `/api/auth/dealer/login` |
| Email + Password | Admins | bcrypt hash (cost factor 12) | `/api/auth/admin/login` |

#### Token Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                            │
│                                                              │
│  Login Success                                               │
│       │                                                      │
│       ├──▶ Access Token (JWT)                                │
│       │    ├─ Payload: { id, email, type }                   │
│       │    ├─ Signed with: JWT_SECRET (HS256)                │
│       │    ├─ Expiry: 15 minutes                             │
│       │    └─ Stored: localStorage (web) / SecureStore (app) │
│       │                                                      │
│       └──▶ Refresh Token                                     │
│            ├─ Format: 128-char crypto.randomBytes hex         │
│            ├─ Expiry: 30 days                                │
│            ├─ Stored: RefreshToken table (server-side)        │
│            ├─ Rotation: new token issued on each refresh      │
│            └─ Revocation: revokeToken() / revokeAllTokens()  │
│                                                              │
│  Token Refresh Flow:                                         │
│    Client sends expired access token + refresh token         │
│    Server validates refresh token in DB                      │
│    Server revokes old refresh token                          │
│    Server issues new access token + new refresh token        │
│    (If refresh token is already revoked → token theft        │
│     detected → revoke ALL user tokens → force re-login)     │
└─────────────────────────────────────────────────────────────┘
```

#### OTP Security

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Length | 6 digits | Standard for Indian SMS OTPs. Balances usability and security. |
| Expiry | 5 minutes | Short enough to prevent relay attacks, long enough for SMS delivery delays. |
| Max attempts | 3 per OTP | Prevents brute-force (10^6 / 3 attempts = impossible). |
| Rate limit | 5 OTP sends per 15 min per IP | Prevents SMS bombing (expensive and abusive). |
| Cooldown | Implicit via rate limiter | If 5 OTPs sent, must wait full 15 minutes. |
| Storage | Plain text in DB | Acceptable because of 5-minute TTL + 3 attempts + rate limit. Not worth the bcrypt overhead. |
| Cleanup | Expired OTPs deleted by index on `expiresAt` | Prevents table bloat. |

#### Rate Limits on Auth Endpoints

| Endpoint | Limit | Window | Implementation |
|----------|-------|--------|----------------|
| `POST /api/auth/otp/send` | 5 | 15 min | `otpLimiter` |
| `POST /api/auth/otp/verify` | 10 | 15 min | `loginLimiter` |
| `POST /api/auth/dealer/login` | 10 | 15 min | `credentialLoginLimiter` (skips successful) |
| `POST /api/auth/admin/login` | 10 | 15 min | `credentialLoginLimiter` |
| `POST /api/auth/password-reset` | 3 | 60 min | `passwordResetLimiter` |
| `POST /api/auth/refresh` | 20 | 60 min | `refreshLimiter` |

---

### 2.2 Authorization

#### Role-Based Access Control (RBAC)

```
┌──────────────────────────────────────────────────────────────┐
│                    RBAC MATRIX                                │
├──────────────┬───────┬────────┬───────┬──────────┬──────────┤
│ Resource      │ User  │ Dealer │ Admin │ Prof.    │ SuperAdm │
├──────────────┼───────┼────────┼───────┼──────────┼──────────┤
│ Browse Catalog│  R    │   R    │  RW   │   R      │   RW     │
│ Submit Inquiry│  C    │   -    │  RW   │   C      │   RW     │
│ Create RFQ    │  C    │   -    │  R    │   C      │   RW     │
│ Submit Quote  │  -    │   C    │  R    │   -      │   RW     │
│ Own RFQs      │  RW   │   -    │  RW   │   RW     │   RW     │
│ Own Quotes    │  -    │   RW   │  RW   │   -      │   RW     │
│ Dealer Profile│  -    │   RW   │  RW   │   -      │   RW     │
│ Verify Dealers│  -    │   -    │  RW   │   -      │   RW     │
│ CRM           │  -    │   -    │  RW   │   -      │   RW     │
│ Scraper       │  -    │   -    │  RW   │   -      │   RW     │
│ Fraud Flags   │  -    │   -    │  RW   │   -      │   RW     │
│ Admin Mgmt    │  -    │   -    │  R    │   -      │   RW     │
│ Community Post│  CRW  │   -    │  RWD  │   CRW    │   RWD    │
│ Community Cmnt│  CRW  │   -    │  RWD  │   CRW    │   RWD    │
│ Knowledge     │  R    │   R    │  CRWD │   R      │   CRWD   │
├──────────────┴───────┴────────┴───────┴──────────┴──────────┤
│ C=Create  R=Read  W=Write/Update  D=Delete  -=No Access     │
└──────────────────────────────────────────────────────────────┘
```

#### Middleware Chain

Every API request passes through the following middleware chain in order:

```
Request
  │
  ▼
requestId()            ─ Attach unique X-Request-ID for tracing
  │
  ▼
blockMaliciousAgents() ─ Reject known scanner/exploit user agents
  │
  ▼
helmet()               ─ Set standard security headers
  │
  ▼
securityHeaders()      ─ Set CSP, Permissions-Policy, X-Frame-Options
  │
  ▼
preventParamPollution()─ Deduplicate query parameters
  │
  ▼
cors()                 ─ Validate request origin against whitelist
  │
  ▼
express.json()         ─ Parse JSON body (10MB limit)
  │
  ▼
sanitizeInputs()       ─ Strip HTML/null bytes from all string values
  │
  ▼
detectAttacks()        ─ Regex scan for SQLi, XSS, path traversal, template injection
  │
  ▼
session()              ─ Express session for OAuth flow state
  │
  ▼
passport()             ─ Initialize Passport for OAuth
  │
  ▼
[route-level limiter]  ─ Per-endpoint rate limiting (otpLimiter, rfqLimiter, etc.)
  │
  ▼
[auth middleware]       ─ authenticateUser / authenticateDealer / authenticateAdmin
  │
  ▼
[validation]           ─ Zod schema validation on body/query/params
  │
  ▼
[handler]              ─ Route handler (business logic)
```

#### Resource-Level Permissions

Beyond role checks, the system enforces resource ownership:

- **Dealer sees own quotes only**: Query filter `WHERE dealerId = req.user.id`.
- **User sees own RFQs only**: Query filter `WHERE userId = req.user.id`.
- **Dealer cannot view other dealers' profiles**: Storefront pages show public data only (no financial metrics).
- **Admin actions are scoped by role**: `super_admin` can create/deactivate admins; `admin` cannot.

---

### 2.3 Data Protection

#### Password Hashing

- **Algorithm**: bcrypt
- **Cost Factor**: 12 (configured via `BCRYPT_ROUNDS` env var)
- **Rationale**: Cost factor 12 produces ~250ms hash time on the EC2 instance. Fast enough for login UX, slow enough to make brute-force infeasible (2^12 = 4,096 iterations).

#### PII Handling

| Data Type | At Rest | In Transit | In Logs | Deletion Policy |
|-----------|---------|------------|---------|-----------------|
| Password | bcrypt hash | TLS 1.2+ | Never logged | Cascade on account delete |
| Phone number | Plaintext in DB | TLS | Masked (last 4 digits) | Cascade on account delete |
| Email | Plaintext in DB | TLS | Masked (first 3 chars) | Cascade on account delete |
| GST number | Plaintext in DB | TLS | Full (business data) | Retained for compliance |
| PAN number | Plaintext in DB | TLS | Masked | Retained for compliance |
| OTP codes | Plaintext in DB | TLS | Never logged | Auto-deleted after expiry |
| JWT tokens | N/A (stateless) | TLS | Never logged | Self-expire (15 min) |
| Refresh tokens | Hashed hex in DB | TLS | Never logged | Cleanup cron (7 days post-revoke) |

**Target Improvement**: Encrypt phone numbers and PAN numbers at the application level using AES-256-GCM before storage. This protects against database-level breaches. Key management via AWS Secrets Manager.

#### File Upload Security

| Check | Implementation | Rationale |
|-------|----------------|-----------|
| File type validation | Check MIME type AND magic bytes (not just extension) | Prevents renamed malicious files |
| File size limit | 10MB per file (configurable via `MAX_FILE_SIZE`) | Prevents storage exhaustion |
| Filename sanitization | Strip path traversal chars (`../`), whitespace, special chars | Prevents directory traversal |
| Storage isolation | S3 bucket with no public access | Files only accessible via pre-signed URLs |
| Upload rate limit | 20 per 15 min per IP (`uploadLimiter`) | Prevents storage flooding |

**Future**: ClamAV virus scanning pipeline — uploaded files pass through a scanning queue before being marked as available.

#### GDPR-Aligned Data Deletion

When a user account is deleted (status set to DELETED), the following cascade occurs:

1. User record: hard delete
2. ProfessionalProfile + ProfessionalDocuments: cascade delete (including S3 file cleanup)
3. RFQs + RFQItems: cascade delete
4. Quotes (as buyer): cascade delete
5. CommunityPosts + CommunityComments: cascade delete
6. SavedProducts: cascade delete
7. ChatSessions (where userId matches): unlink (set userId to null, preserve anonymized chat data for training)
8. UserActivity: retain for 90 days (anonymize actorId), then delete
9. Notifications: cascade delete
10. DevicePushTokens: cascade delete

---

### 2.4 API Security

#### CORS Policy

```typescript
// Allowed origins (from FRONTEND_URL env, comma-separated)
const allowedOrigins = [
  'https://hub4estate.com',
  'https://www.hub4estate.com',
  'https://app.hub4estate.com',     // Future: separate app subdomain
  'http://localhost:3000',           // Dev: Vite default
  'http://localhost:5173',           // Dev: Vite alt
];

// Also allowed: *.vercel.app, *.replit.dev, *.hub4estate.com
// Rejected: all other origins
```

**credentials: true** is set because the frontend sends JWT tokens via Authorization header.

#### HTTP Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.anthropic.com https://accounts.google.com https://exp.host; frame-src https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'` | Prevents XSS, clickjacking, data injection |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter (defense in depth) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Disables unnecessary browser APIs |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS (via Helmet HSTS) |

#### Input Validation

Every API endpoint validates input using Zod schemas before the handler executes.

```typescript
// Middleware pattern:
router.post('/inquiry',
  inquiryLimiter,              // Rate limit
  authenticateUser,            // Auth check
  validateBody(inquirySchema), // Zod validation
  handleCreateInquiry          // Handler
);

// Zod schema example:
const inquirySchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),  // Indian mobile
  email: z.string().email().optional(),
  quantity: z.number().int().min(1).max(10000),
  deliveryCity: z.string().min(2).max(100),
});
```

#### Attack Detection

The `detectAttacks()` middleware scans serialized request data (URL + body + query + params) for known attack patterns:

| Pattern | What It Catches | Example |
|---------|-----------------|---------|
| SQL keywords | SQLi attempts | `SELECT * FROM users WHERE 1=1` |
| `<script>` tags | Stored XSS | `<script>alert('xss')</script>` |
| `javascript:` | XSS via protocol handler | `javascript:alert(1)` |
| `on*=` | Event handler injection | `onerror=alert(1)` |
| `../` | Path traversal | `../../etc/passwd` |
| `\x00` | Null byte injection | `file.php%00.jpg` |
| `${}` / `{{}}` | Template injection | `${7*7}`, `{{constructor.constructor('return this')()}}` |

**Exclusions**: Auth routes (OAuth callbacks contain `=` and `&`), chat routes (natural language contains `()`, `!`, `*`), and multipart form uploads (checked separately) are excluded from pattern scanning.

#### SQL Injection Prevention

Prisma ORM parameterizes all queries by default. No raw SQL strings are constructed. The few `prisma.$queryRaw` calls use tagged template literals which auto-parameterize:

```typescript
// SAFE: Prisma parameterized query
await prisma.$queryRaw`SELECT 1`;

// NEVER used: string concatenation
// await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${id}'`);
```

#### XSS Prevention

Three layers of defense:
1. **React**: JSX auto-escapes all interpolated values. `dangerouslySetInnerHTML` is not used.
2. **CSP Header**: Blocks inline scripts (except `unsafe-inline` for Google OAuth — to be removed when migrating to nonce-based CSP).
3. **Server-side sanitization**: `sanitizeInputs()` middleware strips `<`, `>`, and null bytes from all string values in request bodies before they reach handlers.

---

### 2.5 Infrastructure Security

#### Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VPC (us-east-1)                      │
│                                                              │
│  ┌─────────────────────────┐  ┌────────────────────────────┐│
│  │    Public Subnet         │  │    Private Subnet           ││
│  │                          │  │                             ││
│  │  ┌──────────────────┐    │  │  ┌───────────────────┐     ││
│  │  │   EC2 Instance    │    │  │  │    RDS PostgreSQL  │     ││
│  │  │  (3.110.172.191)  │────│──│─▶│   (Private IP)     │     ││
│  │  │                   │    │  │  │                    │     ││
│  │  │  Port 3001 (API)  │    │  │  │  Port 5432 only    │     ││
│  │  │  Port 443 (HTTPS) │    │  │  │  from EC2 SG       │     ││
│  │  │  Port 22 (SSH)    │    │  │  └───────────────────┘     ││
│  │  └──────────────────┘    │  │                             ││
│  │                          │  │  ┌───────────────────┐     ││
│  │  ┌──────────────────┐    │  │  │   S3 Bucket        │     ││
│  │  │  Nginx Reverse   │    │  │  │   (Private)        │     ││
│  │  │  Proxy            │    │  │  │   Pre-signed URLs  │     ││
│  │  └──────────────────┘    │  │  └───────────────────┘     ││
│  └─────────────────────────┘  └────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────┐                                 │
│  │  AWS Amplify (Frontend)  │                                 │
│  │  CDN + Static Hosting    │                                 │
│  └─────────────────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

#### Security Groups

| Security Group | Inbound Rules | Purpose |
|---------------|---------------|---------|
| EC2 SG | 443 from 0.0.0.0/0 | HTTPS from internet |
| EC2 SG | 22 from admin IP only | SSH access restricted to founder's IP |
| EC2 SG | 3001 from EC2 SG only | API port not publicly exposed (Nginx proxies) |
| RDS SG | 5432 from EC2 SG only | Database only accessible from API server |

#### SSL/TLS

- **Certificate**: Let's Encrypt (auto-renewed via certbot cron)
- **Protocol**: TLS 1.2 minimum (TLS 1.0/1.1 disabled in Nginx config)
- **HSTS**: `max-age=31536000; includeSubDomains` — browsers remember HTTPS for 1 year
- **Certificate Transparency**: Let's Encrypt publishes to CT logs by default

#### S3 Security

| Setting | Value | Purpose |
|---------|-------|---------|
| Block Public Access | All enabled | No accidental public exposure |
| Bucket Policy | Deny all except IAM role | Only EC2's IAM role can access |
| Upload | Pre-signed PUT URLs (15-min expiry) | Client uploads directly to S3 without touching backend |
| Download | Pre-signed GET URLs (1-hour expiry) | Time-limited access to private files |
| Encryption | SSE-S3 (AES-256) | At-rest encryption for all objects |

#### Secret Management

**Current**: Environment variables in `.env` files on EC2 (not committed to git).

**Target**: AWS Secrets Manager for all secrets. Application retrieves secrets at startup via IAM role (no credentials in environment).

| Secret | Current Location | Target Location |
|--------|-----------------|-----------------|
| DATABASE_URL | .env on EC2 | AWS Secrets Manager |
| JWT_SECRET | .env on EC2 | AWS Secrets Manager |
| SESSION_SECRET | .env on EC2 | AWS Secrets Manager |
| GOOGLE_CLIENT_SECRET | .env on EC2 | AWS Secrets Manager |
| ANTHROPIC_API_KEY | .env on EC2 | AWS Secrets Manager |
| RESEND_API_KEY | .env on EC2 | AWS Secrets Manager |
| MSG91_AUTH_KEY | .env on EC2 | AWS Secrets Manager |

---

### 2.6 Fraud Detection

#### Detection Rules

| Rule | Detection Method | Severity | Action |
|------|-----------------|----------|--------|
| Duplicate GST | Unique constraint on `Dealer.gstNumber` | Critical | Registration blocked |
| Duplicate phone inquiry | Same phone + similar product within 24h | Medium | Auto-flag, admin review |
| Dealer collusion | Multiple dealer registrations from same IP within 1h | High | All flagged, admin review |
| Spam RFQs | >20 RFQs from same user in 1h | Medium | Rate limited + flagged |
| Quote manipulation | Quote price <50% or >200% of median for same product | High | Quote hidden, admin review |
| Fake reviews | Review from user who never transacted with dealer | Critical | Review deleted, user flagged |
| Suspicious login | Login from new IP + different country | Medium | Notification to user |
| Mass OTP | >5 OTP requests for different numbers from same IP | High | IP blocked for 1h |

#### FraudFlag Workflow

```
Detection (automated/manual)
  │
  ▼
FraudFlag created
  status: "open"
  severity: low/medium/high/critical
  │
  ▼
Admin notification (push + email for high/critical)
  │
  ▼
Admin investigation
  status: "investigating"
  │
  ├──▶ False positive → status: "false_positive"
  │
  └──▶ Confirmed fraud → status: "resolved"
       │
       ├──▶ User: suspend account
       ├──▶ Dealer: suspend + revoke verification
       ├──▶ RFQ/Quote: cancel + notify affected parties
       └──▶ AuditLog entry created
```

---

### 2.7 Audit & Compliance

#### Audit Logging

Every admin action that modifies platform state creates an AuditLog entry:

```typescript
await prisma.auditLog.create({
  data: {
    action: 'DEALER_VERIFIED',
    entityType: 'dealer',
    entityId: dealer.id,
    performedBy: adminId,
    details: JSON.stringify({
      dealerName: dealer.businessName,
      previousStatus: 'UNDER_REVIEW',
      newStatus: 'VERIFIED',
      verificationNotes: notes,
    }),
  },
});
```

#### UserActivity Logging

Every user-facing action is logged via the `activity.service.ts`:

```typescript
await activityService.log({
  actorType: 'user',
  actorId: user.id,
  actorEmail: user.email,
  activityType: 'PRODUCT_INQUIRY_SUBMITTED',
  description: `User submitted inquiry for ${modelNumber}`,
  metadata: JSON.stringify({ modelNumber, quantity, city }),
  entityType: 'inquiry',
  entityId: inquiry.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

#### Log Retention

| Log Type | Hot Storage (DB) | Cold Storage (S3) | Total Retention |
|----------|------------------|--------------------|-----------------|
| AuditLog | 90 days | S3 Glacier (compressed) | 7 years (LLP compliance) |
| UserActivity | 90 days | S3 Glacier (compressed) | 2 years |
| FraudFlag | Permanent (DB) | N/A | Permanent |
| ChatMessage | 1 year | S3 Glacier | 3 years |
| Application logs (PM2) | 30 days (disk) | S3 Standard | 1 year |

#### LLP Compliance

| Requirement | Implementation |
|-------------|----------------|
| GST validation | Regex validation on registration + future: GST API verification |
| PAN verification | Format validation + future: NSDL PAN verification API |
| Invoice records | Quote acceptance creates immutable record (AuditLog + Quote status) |
| Annual filing | Automated export of transaction summary (future) |

---

### 2.8 Threat Model (STRIDE)

#### Flow 1: Inquiry Submission → Quote Comparison → Dealer Selection

| Threat | Category | Risk | Mitigation |
|--------|----------|------|------------|
| Attacker submits fake inquiries to waste dealer time | Spoofing | Medium | Phone verification required, rate limiting (10/hr), duplicate detection |
| Man-in-the-middle reads inquiry data | Tampering | Low | TLS everywhere, HSTS |
| Dealer submits impossibly low quote to win, then raises price | Repudiation | High | Quote is immutable after submission, audit trail, user can report |
| Competitor scrapes all dealer quotes | Information Disclosure | Medium | Quotes only visible to inquiry owner and responding dealer |
| Bot floods inquiry endpoint | Denial of Service | Medium | Rate limiter (10/hr/IP), CAPTCHA (future) |
| User selects dealer based on manipulated ratings | Elevation of Privilege | Medium | Reviews tied to real transactions, admin moderation |

#### Flow 2: Dealer Onboarding → Document Upload → Verification

| Threat | Category | Risk | Mitigation |
|--------|----------|------|------------|
| Fake dealer registers with forged GST | Spoofing | High | Manual admin verification, GST API validation (future) |
| Malicious file uploaded as "document" | Tampering | High | File type validation (magic bytes), size limit, S3 isolation |
| Dealer denies submitting a quote | Repudiation | Medium | AuditLog + UserActivity + timestamp chain |
| Admin accidentally exposes dealer PAN/financial data | Information Disclosure | Medium | PII masking in logs, role-based admin access |
| Bulk fake registrations exhaust admin review capacity | Denial of Service | Medium | Rate limiting, email verification before admin queue |
| Dealer escalates own status to "verified" | Elevation of Privilege | Low | Status changes only via admin endpoints (separate auth) |

#### Flow 3: Admin Panel Access → Data Modification → Audit Trail

| Threat | Category | Risk | Mitigation |
|--------|----------|------|------------|
| Unauthorized access to admin panel | Spoofing | Critical | Separate Admin table, bcrypt auth, IP restriction (future) |
| Admin modifies data without audit trail | Tampering | High | Every admin action creates AuditLog entry |
| Admin denies making a change | Repudiation | Medium | Immutable AuditLog with admin ID, timestamp, details |
| Admin exports sensitive user data | Information Disclosure | High | Export endpoints restricted to super_admin, logged |
| Admin account brute-forced | Denial of Service | Medium | 10 attempts / 15 min rate limit, account lockout (future) |
| Regular admin accesses super_admin functions | Elevation of Privilege | Medium | Role check in middleware, separate permissions for admin vs super_admin |

---

## 3. Complete File Structure

### 3.1 Current File Structure

This is the actual file structure as of 2026-04-02, with descriptions of what each file currently contains.

```
hub4estate/
│
├── frontend/                              # React 18 + Vite + TypeScript + Tailwind
│   ├── .env                               # VITE_BACKEND_API_URL, VITE_GOOGLE_CLIENT_ID
│   ├── .env.example                       # Template for env vars
│   ├── Dockerfile                         # Multi-stage: build + nginx serve
│   ├── index.html                         # Vite entry HTML
│   ├── nginx.conf                         # Nginx config for containerized frontend
│   ├── package.json                       # Dependencies: react, react-router, zustand, etc.
│   ├── package-lock.json                  # Lockfile
│   ├── postcss.config.js                  # PostCSS config for Tailwind
│   ├── tailwind.config.js                 # Tailwind theme: Hub4Estate amber palette
│   ├── tsconfig.json                      # TypeScript strict config
│   ├── tsconfig.node.json                 # TS config for Vite node context
│   ├── vercel.json                        # Vercel deployment: SPA rewrites
│   ├── vite.config.ts                     # Vite: proxy /api to backend in dev
│   │
│   └── src/
│       ├── main.tsx                       # App bootstrap: React.StrictMode + BrowserRouter
│       ├── App.tsx                        # Route definitions: all pages + auth guards
│       ├── index.css                      # Tailwind directives + global styles
│       ├── vite-env.d.ts                  # Vite type declarations
│       │
│       ├── components/
│       │   ├── Layout.tsx                 # Public layout: navbar + footer wrapper
│       │   ├── AuthProvider.tsx           # Token verification on mount, auto-redirect
│       │   ├── ProtectedRoute.tsx         # Auth guard: redirects to login if !authenticated
│       │   ├── ErrorBoundary.tsx          # React error boundary with fallback UI
│       │   ├── AIAssistantWidget.tsx      # Floating chatbot bubble + conversation UI
│       │   ├── AISection.tsx              # Homepage: AI features showcase section
│       │   ├── InteractiveCategoryGrid.tsx# Homepage: animated category cards
│       │   ├── ElectricWireDivider.tsx    # Decorative animated wire divider
│       │   ├── ElectricalCursor.tsx       # Custom cursor with electrical theme
│       │   ├── RFQChat.tsx                # Conversational RFQ builder
│       │   ├── SmartSlipScanner.tsx       # OCR-powered receipt/quotation scanner
│       │   │
│       │   ├── common/
│       │   │   ├── ImagePreview.tsx       # Zoomable image preview modal
│       │   │   └── UserBadge.tsx          # Role-based user badge (Verified Pro, etc.)
│       │   │
│       │   ├── layouts/
│       │   │   ├── index.ts              # Barrel export
│       │   │   ├── AdminLayout.tsx        # Admin sidebar + header + content area
│       │   │   ├── DealerLayout.tsx       # Dealer sidebar + header + content area
│       │   │   ├── UserLayout.tsx         # User sidebar + header + content area
│       │   │   └── ProfessionalLayout.tsx # Professional sidebar + content area
│       │   │
│       │   └── ui/
│       │       ├── index.tsx             # Barrel export for all UI primitives
│       │       └── OTPInput.tsx          # 6-digit OTP input with auto-focus
│       │
│       ├── pages/
│       │   ├── HomePage.tsx              # Landing page: hero + inquiry form + sections
│       │   ├── AboutPage.tsx             # About Hub4Estate page
│       │   ├── ContactPage.tsx           # Contact form page
│       │   ├── ComparePage.tsx           # Product comparison tool
│       │   ├── PrivacyPage.tsx           # Privacy policy
│       │   ├── TermsPage.tsx             # Terms of service
│       │   ├── MessagesPage.tsx          # User messaging interface
│       │   ├── TrackInquiryPage.tsx      # Track inquiry status by phone
│       │   ├── AIAssistantPage.tsx       # Full-page AI chat
│       │   ├── SmartSlipScanPage.tsx     # OCR slip scanner page
│       │   ├── JoinTeamPage.tsx          # Careers/join team page
│       │   │
│       │   ├── auth/
│       │   │   ├── UserAuthPage.tsx      # User login/signup (OTP + Google OAuth)
│       │   │   ├── DealerLoginPage.tsx   # Dealer email+password login
│       │   │   ├── AdminLoginPage.tsx    # Admin login page
│       │   │   ├── AuthCallback.tsx      # Google OAuth callback handler
│       │   │   ├── ProfileCompletionPage.tsx  # Post-signup profile form
│       │   │   └── RoleSelectionPage.tsx # Role picker after first login
│       │   │
│       │   ├── admin/
│       │   │   ├── AdminDashboard.tsx    # Admin overview: stats, pending actions
│       │   │   ├── AdminDealersPage.tsx  # Dealer verification queue + management
│       │   │   ├── AdminProductsPage.tsx # Product catalog CRUD
│       │   │   ├── AdminInquiriesPage.tsx# Inquiry management + response
│       │   │   ├── AdminInquiryPipelinePage.tsx # Pipeline workflow UI
│       │   │   ├── AdminRFQsPage.tsx     # RFQ oversight
│       │   │   ├── AdminLeadsPage.tsx    # Contact submission management
│       │   │   ├── AdminCRMPage.tsx      # CRM: companies, contacts, outreach
│       │   │   ├── AdminChatsPage.tsx    # AI chat session browser
│       │   │   ├── AdminAnalyticsPage.tsx# Analytics dashboard
│       │   │   ├── AdminFraudPage.tsx    # Fraud flag management
│       │   │   ├── AdminScraperPage.tsx  # Scraper configuration + job runner
│       │   │   ├── AdminBrandDealersPage.tsx # External brand dealer management
│       │   │   ├── AdminProfessionalsPage.tsx # Professional verification queue
│       │   │   └── AdminSettingsPage.tsx # Platform settings
│       │   │
│       │   ├── dealer/
│       │   │   ├── DealerDashboard.tsx   # Dealer home: stats, recent inquiries
│       │   │   ├── DealerOnboarding.tsx  # Multi-step dealer registration form
│       │   │   ├── DealerProfilePage.tsx # Edit dealer profile + storefront
│       │   │   ├── DealerRFQsPage.tsx    # Available RFQs for dealer
│       │   │   ├── DealerQuotesPage.tsx  # Dealer's submitted quotes
│       │   │   ├── DealerQuoteSubmitPage.tsx # Quote creation form
│       │   │   ├── DealerAvailableInquiriesPage.tsx # Product inquiries for dealer
│       │   │   └── DealerRegistrationStatus.tsx # Verification status tracker
│       │   │
│       │   ├── user/
│       │   │   └── UserDashboard.tsx     # User home: active RFQs, saved products
│       │   │
│       │   ├── professional/
│       │   │   ├── ProfessionalDashboard.tsx # Professional home page
│       │   │   ├── ProfessionalOnboarding.tsx # Verification document upload flow
│       │   │   └── ProfessionalProfilePage.tsx # Edit professional profile
│       │   │
│       │   ├── products/
│       │   │   ├── CategoriesPage.tsx    # Category listing grid
│       │   │   ├── CategoryDetailPage.tsx# Subcategories + product types in category
│       │   │   ├── ProductTypePage.tsx   # Products within a product type
│       │   │   └── ProductDetailPage.tsx # Individual product page + RFQ cart add
│       │   │
│       │   ├── rfq/
│       │   │   ├── CreateRFQPage.tsx     # RFQ creation from cart items
│       │   │   ├── MyRFQsPage.tsx        # User's RFQ history
│       │   │   └── RFQDetailPage.tsx     # Single RFQ with received quotes
│       │   │
│       │   ├── community/
│       │   │   ├── CommunityPage.tsx     # Forum listing + create post
│       │   │   └── PostDetailPage.tsx    # Single post + comments
│       │   │
│       │   └── knowledge/
│       │       └── KnowledgePage.tsx     # Knowledge base article listing
│       │
│       ├── hooks/
│       │   └── useInView.ts             # Intersection Observer hook for animations
│       │
│       ├── lib/
│       │   ├── api.ts                   # Axios instance + interceptors + API functions
│       │   ├── store.ts                 # Zustand stores: useAuthStore, useRFQStore
│       │   └── analytics.ts            # Event tracking utilities
│       │
│       ├── contexts/
│       │   └── LanguageContext.tsx       # i18n context: language switcher state
│       │
│       └── i18n/
│           └── translations.ts          # Translation strings: en, hi
│
├── backend/                              # Node.js + Express + TypeScript + Prisma
│   ├── .env                              # DATABASE_URL, JWT_SECRET, API keys (NOT committed)
│   ├── .env.example                      # Template
│   ├── Dockerfile                        # Multi-stage build
│   ├── package.json                      # Dependencies: express, prisma, jsonwebtoken, etc.
│   ├── tsconfig.json                     # TypeScript config
│   ├── eng.traineddata                   # Tesseract OCR training data (English)
│   │
│   ├── prisma/
│   │   ├── schema.prisma                 # 49 models, 19 enums (full schema)
│   │   └── migrations/
│   │       ├── 20260119073250_init/                          # Initial schema
│   │       ├── 20260121203756_add_contact_chat_email_tables/ # Chat + contact models
│   │       ├── 20260325000000_sync_schema/                   # Schema sync migration
│   │       ├── add_dealer_storefront_fields.sql              # Manual SQL: storefront columns
│   │       ├── add_professional_profiles.sql                 # Manual SQL: professional models
│   │       └── migration_lock.toml                           # Prisma migration lock
│   │
│   └── src/
│       ├── index.ts                      # Express app: middleware chain, route mounting, server start
│       │
│       ├── config/
│       │   ├── database.ts              # Prisma client singleton
│       │   ├── env.ts                   # Zod-validated environment variables
│       │   └── passport.ts             # Passport.js Google OAuth strategy config
│       │
│       ├── middleware/
│       │   ├── auth.ts                  # authenticateUser, authenticateDealer, authenticateAdmin, optionalAuth, authenticateToken
│       │   ├── rateLimiter.ts           # 13 rate limiters: otp, login, credential, upload, inquiry, contact, rfq, quote, admin, scraper, ai, refresh, passwordReset
│       │   ├── security.ts             # requestId, sanitizeInputs, detectAttacks, securityHeaders, preventParamPollution, blockMaliciousAgents, enforceBodySize
│       │   └── validation.ts           # Zod validation middleware: validate(), validateBody()
│       │
│       ├── routes/
│       │   ├── auth.routes.ts           # Google OAuth, OTP send/verify, dealer/admin login, refresh, logout
│       │   ├── products.routes.ts       # Categories, subcategories, product types, brands, products CRUD
│       │   ├── rfq.routes.ts            # RFQ create, list, detail, publish, select dealer
│       │   ├── quote.routes.ts          # Quote submit, list by dealer, list by RFQ
│       │   ├── dealer.routes.ts         # Dealer registration, profile, onboarding, dashboard stats
│       │   ├── admin.routes.ts          # Admin CRUD, dealer verification, user management, analytics
│       │   ├── community.routes.ts      # Posts CRUD, comments CRUD, upvotes
│       │   ├── knowledge.routes.ts      # Knowledge articles CRUD
│       │   ├── contact.routes.ts        # Contact form submission
│       │   ├── chat.routes.ts           # AI chat: create session, send message, history
│       │   ├── crm.routes.ts            # CRM companies, contacts, outreach, meetings, pipeline
│       │   ├── scraper.routes.ts        # Scrape brands, jobs, trigger scrape, scraped products
│       │   ├── inquiry.routes.ts        # Product inquiry submit, list, respond
│       │   ├── inquiry-pipeline.routes.ts # Pipeline CRUD, dealer quote management
│       │   ├── brand-dealer.routes.ts   # External brand dealer CRUD
│       │   ├── database.routes.ts       # Database health, stats (admin only)
│       │   ├── dealer-inquiry.routes.ts # Dealer-facing inquiry endpoints
│       │   ├── slip-scanner.routes.ts   # OCR receipt/quotation scanning
│       │   ├── notification.routes.ts   # Push token registration, notification list
│       │   └── professional.routes.ts   # Professional profile, document upload, verification
│       │
│       └── services/
│           ├── activity.service.ts      # UserActivity logging helper
│           ├── ai.service.ts            # Claude API integration for chat
│           ├── ai-parser.service.ts     # AI product identification from images/text
│           ├── dealer-matching.service.ts # Match inquiries to dealers by brand/category/location
│           ├── email.service.ts         # Resend email sending + templates
│           ├── inquiry-pipeline.service.ts # Pipeline workflow automation
│           ├── notification.service.ts  # Push notification via Expo
│           ├── ocr.service.ts           # Tesseract OCR for slip scanning
│           ├── sms.service.ts           # MSG91/Twilio SMS gateway
│           ├── token.service.ts         # Refresh token CRUD + rotation + cleanup
│           └── scraper/
│               ├── scraper.service.ts   # Web scraping engine (Puppeteer/Cheerio)
│               └── brands.config.ts     # Per-brand scraping configurations
│
├── mobile/                               # React Native + Expo
│   ├── App.tsx                           # Root component: navigation container
│   ├── app.json                          # Expo config: app name, icon, splash
│   ├── eas.json                          # EAS Build configuration
│   ├── index.ts                          # Entry point: registerRootComponent
│   ├── package.json                      # Dependencies: expo, react-navigation, etc.
│   ├── tsconfig.json                     # TypeScript config
│   │
│   └── src/
│       ├── components/
│       │   ├── index.ts                 # Barrel export
│       │   ├── Button.tsx               # Themed button component
│       │   ├── Card.tsx                 # Card container component
│       │   ├── Input.tsx                # Themed text input
│       │   └── Loading.tsx              # Loading spinner/skeleton
│       │
│       ├── navigation/
│       │   ├── index.tsx                # Root navigator: auth vs main
│       │   ├── types.ts                # Navigation type definitions
│       │   ├── AuthNavigator.tsx        # Login → OTP → Profile flow
│       │   ├── UserNavigator.tsx        # User tab navigator
│       │   └── DealerNavigator.tsx      # Dealer tab navigator
│       │
│       ├── screens/
│       │   ├── LoadingScreen.tsx        # App loading / auth check screen
│       │   ├── auth/
│       │   │   ├── WelcomeScreen.tsx    # Welcome / onboarding
│       │   │   ├── LoginScreen.tsx      # Phone number entry
│       │   │   ├── OTPVerifyScreen.tsx  # OTP entry + verification
│       │   │   ├── ProfileCompleteScreen.tsx # Post-signup profile
│       │   │   └── DealerLoginScreen.tsx # Dealer credential login
│       │   ├── user/
│       │   │   ├── HomeScreen.tsx       # User home tab
│       │   │   ├── CategoriesScreen.tsx # Browse categories
│       │   │   ├── InquirySubmitScreen.tsx # Submit product inquiry
│       │   │   ├── TrackInquiryScreen.tsx  # Track inquiry status
│       │   │   └── UserDashboardScreen.tsx # User dashboard tab
│       │   └── dealer/
│       │       ├── DealerDashboardScreen.tsx   # Dealer dashboard
│       │       ├── AvailableInquiriesScreen.tsx # Inquiries to quote
│       │       └── QuoteSubmitScreen.tsx       # Submit quote for inquiry
│       │
│       ├── services/
│       │   ├── api.ts                   # Axios instance with SecureStore token
│       │   ├── auth.ts                  # Auth API calls
│       │   ├── inquiry.ts              # Inquiry API calls
│       │   ├── quote.ts               # Quote API calls
│       │   └── aiScan.ts              # AI product scan API calls
│       │
│       ├── store/
│       │   └── authStore.ts            # Zustand auth store with SecureStore persist
│       │
│       ├── theme/
│       │   ├── index.ts               # Theme export
│       │   ├── colors.ts             # Hub4Estate color palette
│       │   ├── spacing.ts            # Spacing scale
│       │   └── typography.ts         # Font sizes + weights
│       │
│       └── types/
│           ├── auth.ts               # Auth type definitions
│           ├── inquiry.ts           # Inquiry type definitions
│           └── quote.ts             # Quote type definitions
│
├── nginx/
│   ├── nginx.conf                       # Reverse proxy config: 443 → localhost:3001
│   └── proxy_params                     # Proxy headers config
│
├── scripts/
│   ├── check-env.sh                     # Validate environment variable presence
│   ├── db-backup.sh                     # PostgreSQL backup to S3
│   ├── health-check.sh                  # API + DB health check script
│   ├── rotate-secrets.sh                # JWT + session secret rotation
│   ├── security-audit.sh               # Run security checks (npm audit, etc.)
│   ├── database/                        # Database utility scripts
│   ├── generators/                      # Code generation scripts
│   └── scrapers/                        # Standalone scraping scripts
│
├── docs/
│   ├── CONTRIBUTING.md                  # Contribution guidelines
│   ├── DEPLOYMENT.md                    # Deployment runbook
│   ├── PRODUCT_REQUIREMENTS_DOCUMENT.md # Legacy PRD
│   ├── SECURITY.md                      # Security overview
│   ├── api/                             # API documentation
│   ├── architecture/                    # Architecture docs
│   ├── assets/                          # Doc assets (images, diagrams)
│   └── prd/                             # Modular PRD system (this document)
│
├── docker-compose.yml                   # Local dev: backend + frontend + postgres
├── render.yaml                          # Render.com deployment config
├── amplify.yml                          # AWS Amplify build spec
├── package.json                         # Root workspace config
├── package-lock.json                    # Root lockfile
└── LICENSE                              # Project license
```

---

### 3.2 Target File Structure

This is the target architecture. Additions and reorganizations over the current structure are marked with `[NEW]` or `[MOVED]`. This structure implements the services pattern on the backend, feature-based organization on the frontend, a shared types package, full testing structure, and CI/CD configuration.

```
hub4estate/
│
├── .github/                                          [NEW] GitHub Actions + templates
│   ├── workflows/
│   │   ├── ci.yml                                   # CI: lint + typecheck + test on PR
│   │   ├── deploy-staging.yml                       # Deploy to staging on merge to develop
│   │   ├── deploy-production.yml                    # Deploy to production on merge to main
│   │   ├── security-scan.yml                        # Weekly: npm audit + Snyk + OWASP ZAP
│   │   └── database-backup.yml                      # Scheduled: daily pg_dump to S3
│   ├── PULL_REQUEST_TEMPLATE.md                     # PR template: checklist + test plan
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md                            # Bug report template
│       ├── feature_request.md                       # Feature request template
│       └── security_vulnerability.md                # Security disclosure template
│
├── packages/                                         [NEW] Monorepo shared packages
│   └── shared-types/
│       ├── package.json                             # @hub4estate/shared-types
│       ├── tsconfig.json                            # Strict TS config
│       └── src/
│           ├── index.ts                             # Barrel export
│           ├── user.ts                              # User, UserRole, UserStatus types
│           ├── dealer.ts                            # Dealer, DealerStatus, DealerType types
│           ├── product.ts                           # Category, Brand, Product types
│           ├── rfq.ts                               # RFQ, RFQItem, Quote types
│           ├── inquiry.ts                           # ProductInquiry, Pipeline types
│           ├── community.ts                         # CommunityPost, Comment types
│           ├── crm.ts                               # CRM types
│           ├── chat.ts                              # ChatSession, ChatMessage types
│           ├── notification.ts                      # Notification, DevicePushToken types
│           ├── api.ts                               # API response wrapper types, pagination
│           └── enums.ts                             # All shared enum types
│
├── frontend/
│   ├── .env                                         # Environment variables
│   ├── .env.example                                 # Template
│   ├── .env.staging                                  [NEW] Staging environment
│   ├── .env.production                               [NEW] Production environment
│   ├── Dockerfile                                   # Multi-stage Docker build
│   ├── index.html                                   # Vite HTML entry
│   ├── nginx.conf                                   # Container nginx config
│   ├── package.json                                 # Dependencies
│   ├── postcss.config.js                            # PostCSS for Tailwind
│   ├── tailwind.config.js                           # Tailwind theme config
│   ├── tsconfig.json                                # TypeScript config
│   ├── tsconfig.node.json                           # Vite node TS config
│   ├── vite.config.ts                               # Vite config
│   ├── vitest.config.ts                              [NEW] Vitest test config
│   ├── .eslintrc.cjs                                 [NEW] ESLint rules
│   ├── .prettierrc                                   [NEW] Prettier config
│   │
│   └── src/
│       ├── main.tsx                                 # Bootstrap: providers + router
│       ├── App.tsx                                  # Route definitions
│       ├── index.css                                # Tailwind + global styles
│       ├── vite-env.d.ts                            # Vite types
│       │
│       ├── components/
│       │   ├── Layout.tsx                           # Public layout wrapper
│       │   ├── AuthProvider.tsx                     # Auth state management on mount
│       │   ├── ProtectedRoute.tsx                   # Auth guard HOC
│       │   ├── ErrorBoundary.tsx                    # Error boundary with fallback UI
│       │   │
│       │   ├── common/
│       │   │   ├── ImagePreview.tsx                 # Zoomable image preview
│       │   │   ├── UserBadge.tsx                    # Role badge component
│       │   │   ├── EmptyState.tsx                    [NEW] Reusable empty state illustration
│       │   │   ├── LoadingSkeleton.tsx               [NEW] Skeleton loading states
│       │   │   ├── Pagination.tsx                    [NEW] Pagination control
│       │   │   ├── SearchInput.tsx                   [NEW] Debounced search input
│       │   │   ├── FileUpload.tsx                    [NEW] Drag-and-drop file upload
│       │   │   ├── ConfirmDialog.tsx                 [NEW] Confirmation modal
│       │   │   └── StatusBadge.tsx                   [NEW] Generic status badge
│       │   │
│       │   ├── layouts/
│       │   │   ├── index.ts                         # Barrel export
│       │   │   ├── AdminLayout.tsx                  # Admin layout: sidebar + header
│       │   │   ├── DealerLayout.tsx                 # Dealer layout: sidebar + header
│       │   │   ├── UserLayout.tsx                   # User layout: sidebar + header
│       │   │   └── ProfessionalLayout.tsx           # Professional layout
│       │   │
│       │   ├── ui/
│       │   │   ├── index.tsx                        # Barrel export for design system
│       │   │   ├── Button.tsx                        [NEW] Button variants: primary, secondary, ghost, danger
│       │   │   ├── Input.tsx                         [NEW] Text input with label + error state
│       │   │   ├── Select.tsx                        [NEW] Styled select dropdown
│       │   │   ├── Textarea.tsx                      [NEW] Multiline text input
│       │   │   ├── Modal.tsx                         [NEW] Modal dialog with portal
│       │   │   ├── Alert.tsx                         [NEW] Info/warning/error/success alerts
│       │   │   ├── Badge.tsx                         [NEW] Status and category badges
│       │   │   ├── Card.tsx                          [NEW] Card container
│       │   │   ├── Table.tsx                         [NEW] Sortable data table
│       │   │   ├── Tabs.tsx                          [NEW] Tabbed navigation
│       │   │   ├── Tooltip.tsx                       [NEW] Tooltip on hover
│       │   │   ├── Toast.tsx                         [NEW] Toast notifications
│       │   │   ├── Dropdown.tsx                      [NEW] Dropdown menu
│       │   │   ├── OTPInput.tsx                     # 6-digit OTP input
│       │   │   └── Avatar.tsx                        [NEW] User avatar with fallback
│       │   │
│       │   └── features/
│       │       ├── AIAssistantWidget.tsx             # Floating AI chatbot
│       │       ├── AISection.tsx                     # Homepage AI showcase
│       │       ├── InteractiveCategoryGrid.tsx       # Animated category grid
│       │       ├── RFQChat.tsx                       # Conversational RFQ builder
│       │       ├── SmartSlipScanner.tsx              # OCR receipt scanner
│       │       ├── ElectricWireDivider.tsx           # Wire animation divider
│       │       └── ElectricalCursor.tsx              # Custom electrical cursor
│       │
│       ├── pages/
│       │   ├── HomePage.tsx                         # Landing page
│       │   ├── AboutPage.tsx                        # About page
│       │   ├── ContactPage.tsx                      # Contact form
│       │   ├── ComparePage.tsx                      # Product comparison
│       │   ├── PrivacyPage.tsx                      # Privacy policy
│       │   ├── TermsPage.tsx                        # Terms of service
│       │   ├── MessagesPage.tsx                     # User messaging
│       │   ├── TrackInquiryPage.tsx                 # Track inquiry by phone
│       │   ├── AIAssistantPage.tsx                  # Full-page AI chat
│       │   ├── SmartSlipScanPage.tsx                # OCR scanner page
│       │   ├── JoinTeamPage.tsx                     # Careers page
│       │   ├── NotFoundPage.tsx                      [NEW] 404 page
│       │   │
│       │   ├── auth/
│       │   │   ├── UserAuthPage.tsx                 # User OTP + Google login
│       │   │   ├── DealerLoginPage.tsx              # Dealer credential login
│       │   │   ├── AdminLoginPage.tsx               # Admin login
│       │   │   ├── AuthCallback.tsx                 # OAuth callback handler
│       │   │   ├── ProfileCompletionPage.tsx        # Post-signup profile
│       │   │   ├── RoleSelectionPage.tsx            # Role picker
│       │   │   └── ForgotPasswordPage.tsx            [NEW] Password reset request
│       │   │
│       │   ├── admin/
│       │   │   ├── AdminDashboard.tsx               # Admin overview
│       │   │   ├── AdminDealersPage.tsx             # Dealer management
│       │   │   ├── AdminProductsPage.tsx            # Product catalog CRUD
│       │   │   ├── AdminInquiriesPage.tsx           # Inquiry management
│       │   │   ├── AdminInquiryPipelinePage.tsx     # Pipeline workflow
│       │   │   ├── AdminRFQsPage.tsx                # RFQ oversight
│       │   │   ├── AdminLeadsPage.tsx               # Lead management
│       │   │   ├── AdminCRMPage.tsx                 # Full CRM interface
│       │   │   ├── AdminChatsPage.tsx               # Chat sessions browser
│       │   │   ├── AdminAnalyticsPage.tsx           # Analytics dashboard
│       │   │   ├── AdminFraudPage.tsx               # Fraud flags
│       │   │   ├── AdminScraperPage.tsx             # Scraper control panel
│       │   │   ├── AdminBrandDealersPage.tsx        # External dealer management
│       │   │   ├── AdminProfessionalsPage.tsx       # Professional verification
│       │   │   ├── AdminSettingsPage.tsx            # Platform settings
│       │   │   ├── AdminEmailTemplatesPage.tsx       [NEW] Email template editor
│       │   │   ├── AdminAuditLogPage.tsx             [NEW] Audit log viewer
│       │   │   └── AdminNotificationsPage.tsx        [NEW] Send bulk notifications
│       │   │
│       │   ├── dealer/
│       │   │   ├── DealerDashboard.tsx              # Dealer home
│       │   │   ├── DealerOnboarding.tsx             # Multi-step registration
│       │   │   ├── DealerProfilePage.tsx            # Edit profile + storefront
│       │   │   ├── DealerRFQsPage.tsx               # Available RFQs
│       │   │   ├── DealerQuotesPage.tsx             # Submitted quotes
│       │   │   ├── DealerQuoteSubmitPage.tsx        # Quote creation
│       │   │   ├── DealerAvailableInquiriesPage.tsx # Available inquiries
│       │   │   ├── DealerRegistrationStatus.tsx     # Verification status
│       │   │   ├── DealerAnalyticsPage.tsx           [NEW] Dealer performance analytics
│       │   │   └── DealerStorefrontPage.tsx          [NEW] Public storefront preview
│       │   │
│       │   ├── user/
│       │   │   ├── UserDashboard.tsx                # User home
│       │   │   ├── UserProfilePage.tsx               [NEW] Edit user profile
│       │   │   ├── UserSavedProductsPage.tsx         [NEW] Saved/wishlist products
│       │   │   └── UserNotificationsPage.tsx         [NEW] Notification inbox
│       │   │
│       │   ├── professional/
│       │   │   ├── ProfessionalDashboard.tsx        # Professional home
│       │   │   ├── ProfessionalOnboarding.tsx       # Document upload flow
│       │   │   └── ProfessionalProfilePage.tsx      # Edit professional profile
│       │   │
│       │   ├── products/
│       │   │   ├── CategoriesPage.tsx               # Category grid
│       │   │   ├── CategoryDetailPage.tsx           # Category drill-down
│       │   │   ├── ProductTypePage.tsx              # Product type listing
│       │   │   ├── ProductDetailPage.tsx            # Product detail + RFQ add
│       │   │   └── BrandPage.tsx                     [NEW] Brand detail page
│       │   │
│       │   ├── rfq/
│       │   │   ├── CreateRFQPage.tsx                # RFQ from cart
│       │   │   ├── MyRFQsPage.tsx                   # User RFQ history
│       │   │   └── RFQDetailPage.tsx                # RFQ detail + quotes
│       │   │
│       │   ├── community/
│       │   │   ├── CommunityPage.tsx                # Forum listing
│       │   │   ├── PostDetailPage.tsx               # Post + comments
│       │   │   └── CreatePostPage.tsx                [NEW] Dedicated post creation
│       │   │
│       │   └── knowledge/
│       │       ├── KnowledgePage.tsx                 # Article listing
│       │       └── ArticleDetailPage.tsx             [NEW] Single article view
│       │
│       ├── hooks/
│       │   ├── useInView.ts                         # Intersection Observer
│       │   ├── useDebounce.ts                        [NEW] Debounced value hook
│       │   ├── useLocalStorage.ts                    [NEW] Typed localStorage hook
│       │   ├── useMediaQuery.ts                      [NEW] Responsive breakpoint hook
│       │   ├── usePagination.ts                      [NEW] Pagination state hook
│       │   └── useToast.ts                           [NEW] Toast notification hook
│       │
│       ├── lib/
│       │   ├── api.ts                               # Axios instance + interceptors
│       │   ├── store.ts                             # Zustand stores
│       │   ├── analytics.ts                         # Event tracking
│       │   ├── constants.ts                          [NEW] App-wide constants
│       │   ├── formatters.ts                         [NEW] Date, currency, phone formatters
│       │   └── validators.ts                         [NEW] Client-side Zod schemas
│       │
│       ├── contexts/
│       │   ├── LanguageContext.tsx                   # i18n context
│       │   └── ThemeContext.tsx                       [NEW] Light/dark mode context
│       │
│       ├── i18n/
│       │   └── translations.ts                      # en + hi translations
│       │
│       └── __tests__/                                [NEW] Frontend test directory
│           ├── setup.ts                             # Vitest setup: jsdom, mocks
│           ├── components/
│           │   ├── ProtectedRoute.test.tsx           # Auth guard tests
│           │   ├── OTPInput.test.tsx                 # OTP input behavior tests
│           │   └── Layout.test.tsx                   # Layout rendering tests
│           ├── hooks/
│           │   └── useDebounce.test.ts               # Debounce hook tests
│           ├── lib/
│           │   ├── api.test.ts                       # API client tests (interceptor behavior)
│           │   └── store.test.ts                     # Zustand store tests
│           └── pages/
│               ├── HomePage.test.tsx                 # Homepage rendering
│               └── auth/
│                   └── UserAuthPage.test.tsx         # Auth flow tests
│
├── backend/
│   ├── .env                                         # Local environment variables
│   ├── .env.example                                 # Template
│   ├── .env.test                                     [NEW] Test environment (test DB)
│   ├── Dockerfile                                   # Multi-stage build
│   ├── package.json                                 # Dependencies
│   ├── tsconfig.json                                # TypeScript config
│   ├── jest.config.ts                                [NEW] Jest test config
│   ├── .eslintrc.cjs                                 [NEW] ESLint rules
│   ├── eng.traineddata                              # Tesseract OCR data
│   │
│   ├── prisma/
│   │   ├── schema.prisma                            # 49 models, 19 enums
│   │   ├── seed.ts                                   [NEW] Database seed: categories, brands, admin user
│   │   └── migrations/                              # Migration history
│   │
│   └── src/
│       ├── index.ts                                 # Express server entry
│       │
│       ├── config/
│       │   ├── database.ts                          # Prisma client singleton
│       │   ├── env.ts                               # Zod-validated env vars
│       │   ├── passport.ts                          # Google OAuth strategy
│       │   ├── s3.ts                                 [NEW] AWS S3 client config
│       │   ├── redis.ts                              [NEW] Redis client for sessions/cache (future)
│       │   └── logger.ts                             [NEW] Winston/Pino structured logger
│       │
│       ├── middleware/
│       │   ├── auth.ts                              # All auth middleware
│       │   ├── rateLimiter.ts                       # Rate limit definitions
│       │   ├── security.ts                          # Security middleware chain
│       │   ├── validation.ts                        # Zod validation middleware
│       │   ├── errorHandler.ts                       [NEW] Centralized error handler
│       │   └── requestLogger.ts                      [NEW] Structured request logging
│       │
│       ├── routes/
│       │   ├── auth.routes.ts                       # Auth endpoints
│       │   ├── products.routes.ts                   # Product catalog endpoints
│       │   ├── rfq.routes.ts                        # RFQ endpoints
│       │   ├── quote.routes.ts                      # Quote endpoints
│       │   ├── dealer.routes.ts                     # Dealer endpoints
│       │   ├── admin.routes.ts                      # Admin endpoints
│       │   ├── community.routes.ts                  # Community endpoints
│       │   ├── knowledge.routes.ts                  # Knowledge endpoints
│       │   ├── contact.routes.ts                    # Contact form endpoints
│       │   ├── chat.routes.ts                       # AI chat endpoints
│       │   ├── crm.routes.ts                        # CRM endpoints
│       │   ├── scraper.routes.ts                    # Scraper endpoints
│       │   ├── inquiry.routes.ts                    # Inquiry endpoints
│       │   ├── inquiry-pipeline.routes.ts           # Pipeline endpoints
│       │   ├── brand-dealer.routes.ts               # Brand dealer endpoints
│       │   ├── database.routes.ts                   # Database admin endpoints
│       │   ├── dealer-inquiry.routes.ts             # Dealer inquiry endpoints
│       │   ├── slip-scanner.routes.ts               # OCR endpoints
│       │   ├── notification.routes.ts               # Notification endpoints
│       │   └── professional.routes.ts               # Professional endpoints
│       │
│       ├── services/
│       │   ├── activity.service.ts                  # UserActivity logging
│       │   ├── ai.service.ts                        # Claude API for chat
│       │   ├── ai-parser.service.ts                 # AI product identification
│       │   ├── dealer-matching.service.ts           # Inquiry → dealer matching
│       │   ├── email.service.ts                     # Email sending via Resend
│       │   ├── inquiry-pipeline.service.ts          # Pipeline workflow automation
│       │   ├── notification.service.ts              # Expo push notifications
│       │   ├── ocr.service.ts                       # Tesseract OCR
│       │   ├── sms.service.ts                       # MSG91/Twilio SMS
│       │   ├── token.service.ts                     # Refresh token management
│       │   ├── fraud.service.ts                      [NEW] Fraud detection rule engine
│       │   ├── search.service.ts                     [NEW] Full-text search service
│       │   ├── export.service.ts                     [NEW] CSV/Excel export for admin
│       │   ├── cache.service.ts                      [NEW] Redis caching layer
│       │   ├── file-upload.service.ts                [NEW] S3 pre-signed URL generation
│       │   └── scraper/
│       │       ├── scraper.service.ts               # Web scraping engine
│       │       └── brands.config.ts                 # Brand scraping configs
│       │
│       ├── validators/                               [NEW] Zod schemas for each domain
│       │   ├── auth.validator.ts                    # Login, signup, OTP schemas
│       │   ├── inquiry.validator.ts                 # Inquiry submission schema
│       │   ├── rfq.validator.ts                     # RFQ creation schema
│       │   ├── quote.validator.ts                   # Quote submission schema
│       │   ├── dealer.validator.ts                  # Dealer registration schema
│       │   ├── product.validator.ts                 # Product CRUD schemas
│       │   ├── community.validator.ts               # Post/comment schemas
│       │   └── crm.validator.ts                     # CRM entity schemas
│       │
│       ├── utils/                                    [NEW] Utility functions
│       │   ├── pagination.ts                        # Prisma pagination helper
│       │   ├── slug.ts                              # Slug generation
│       │   ├── phone.ts                             # Indian phone normalization
│       │   ├── gst.ts                               # GST number validation
│       │   ├── inquiry-number.ts                    # Inquiry number generator
│       │   └── crypto.ts                            # Encryption helpers (AES-256-GCM)
│       │
│       ├── types/                                    [NEW] Backend-specific types
│       │   ├── express.d.ts                         # Express request augmentation
│       │   └── environment.d.ts                     # Env var type declarations
│       │
│       ├── jobs/                                     [NEW] Background job definitions
│       │   ├── token-cleanup.job.ts                 # Clean expired refresh tokens
│       │   ├── otp-cleanup.job.ts                   # Clean expired OTPs
│       │   ├── scrape-scheduler.job.ts              # Trigger scheduled scrape jobs
│       │   ├── analytics-aggregation.job.ts         # Pre-aggregate dashboard metrics
│       │   └── notification-digest.job.ts           # Daily digest email for dealers
│       │
│       └── __tests__/                                [NEW] Backend test directory
│           ├── setup.ts                             # Test setup: test DB, seed, cleanup
│           ├── helpers/
│           │   ├── auth.helper.ts                   # Generate test tokens
│           │   ├── factory.ts                       # Test data factories (users, dealers, products)
│           │   └── db.helper.ts                     # Database cleanup between tests
│           ├── unit/
│           │   ├── services/
│           │   │   ├── token.service.test.ts        # Token CRUD + rotation tests
│           │   │   ├── dealer-matching.service.test.ts # Matching algorithm tests
│           │   │   ├── fraud.service.test.ts        # Fraud detection rule tests
│           │   │   └── ai-parser.service.test.ts    # AI parsing mock tests
│           │   ├── middleware/
│           │   │   ├── auth.test.ts                 # Auth middleware tests
│           │   │   ├── rateLimiter.test.ts          # Rate limiter behavior tests
│           │   │   └── security.test.ts             # Attack detection tests
│           │   └── validators/
│           │       ├── auth.validator.test.ts       # Schema validation tests
│           │       └── inquiry.validator.test.ts    # Inquiry schema tests
│           ├── integration/
│           │   ├── auth.test.ts                     # Full auth flow: signup → OTP → login → refresh
│           │   ├── inquiry.test.ts                  # Inquiry submission → pipeline → quote
│           │   ├── rfq.test.ts                      # RFQ create → publish → quote → select
│           │   ├── dealer.test.ts                   # Dealer registration → verification
│           │   └── admin.test.ts                    # Admin CRUD operations
│           └── e2e/                                  [NEW] End-to-end (future: Playwright)
│               └── .gitkeep
│
├── mobile/                                          # React Native + Expo
│   ├── App.tsx                                      # Root component
│   ├── app.json                                     # Expo config
│   ├── eas.json                                     # EAS Build config
│   ├── index.ts                                     # Entry point
│   ├── package.json                                 # Dependencies
│   ├── tsconfig.json                                # TS config
│   └── src/                                         # (see current structure above)
│
├── nginx/
│   ├── nginx.conf                                   # Reverse proxy configuration
│   └── proxy_params                                 # Proxy headers
│
├── scripts/
│   ├── check-env.sh                                 # Env validation
│   ├── db-backup.sh                                 # Database backup
│   ├── health-check.sh                              # Health check
│   ├── rotate-secrets.sh                            # Secret rotation
│   ├── security-audit.sh                            # Security scan
│   ├── deploy-backend.sh                             [NEW] EC2 deployment script (SCP + rebuild + PM2 restart)
│   ├── deploy-frontend.sh                            [NEW] Amplify deployment trigger
│   ├── generate-types.sh                             [NEW] Generate shared types from Prisma schema
│   ├── database/
│   │   ├── seed.sh                                   [NEW] Run prisma seed
│   │   ├── migrate.sh                                [NEW] Run prisma migrate with safety checks
│   │   └── reset-test-db.sh                          [NEW] Reset test database
│   ├── generators/
│   └── scrapers/
│
├── docs/
│   ├── CONTRIBUTING.md                              # Contribution guidelines
│   ├── DEPLOYMENT.md                                # Deployment runbook
│   ├── PRODUCT_REQUIREMENTS_DOCUMENT.md             # Legacy PRD (superseded by prd/)
│   ├── SECURITY.md                                  # Security overview
│   ├── api/
│   │   ├── openapi.yaml                              [NEW] OpenAPI 3.0 spec
│   │   └── postman-collection.json                   [NEW] Postman collection
│   ├── architecture/
│   │   ├── C4-context.md                             [NEW] C4 context diagram
│   │   ├── C4-container.md                           [NEW] C4 container diagram
│   │   └── data-flow.md                              [NEW] Key data flow diagrams
│   ├── assets/
│   ├── prd/
│   │   ├── 01-OVERVIEW-AND-VISION.md                 # PRD Part 1
│   │   ├── 02-DATABASE-SECURITY-FILE-STRUCTURE.md    # This document
│   │   ├── 03-API-SPECIFICATION.md                   [NEW] Complete API spec
│   │   ├── 04-FRONTEND-SPECIFICATION.md              [NEW] Frontend component spec
│   │   ├── 05-MOBILE-SPECIFICATION.md                [NEW] Mobile app spec
│   │   └── 06-DEPLOYMENT-AND-OPS.md                  [NEW] DevOps and deployment
│   └── runbooks/                                     [NEW] Operational runbooks
│       ├── incident-response.md                     # Security incident response plan
│       ├── database-recovery.md                     # DB recovery procedures
│       ├── scaling-playbook.md                      # When and how to scale
│       └── on-call-guide.md                         # On-call rotation guide
│
├── docker-compose.yml                               # Local dev stack
├── docker-compose.test.yml                           [NEW] Test environment stack
├── render.yaml                                      # Render deployment config
├── amplify.yml                                      # AWS Amplify build spec
├── turbo.json                                        [NEW] Turborepo config (monorepo build)
├── package.json                                     # Root workspace config
├── package-lock.json                                # Root lockfile
├── .gitignore                                       # Git ignore rules
├── .nvmrc                                            [NEW] Node.js version pin (20.x)
├── .editorconfig                                     [NEW] Editor settings
└── LICENSE                                          # Project license
```

---

**End of PRD 02 — Database Architecture, Security Architecture & File Structure**

*This document is the authoritative reference for Hub4Estate's data model, security posture, and codebase organization. All implementation decisions should align with the specifications herein. Updates to this document require CTO approval.*
