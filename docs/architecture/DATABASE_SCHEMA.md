# Database Schema Documentation

## Overview

Hub4Estate uses PostgreSQL as its primary database with Prisma ORM for type-safe database access. The schema is organized into logical domains covering user management, dealer operations, product catalog, RFQ/quote systems, community features, CRM, and inquiry pipeline management.

## Entity Relationship Overview

```
┌────────────┐          ┌──────────────┐          ┌─────────────┐
│    User    │─────────<│     RFQ      │>─────────│   Dealer    │
└────────────┘          └──────────────┘          └─────────────┘
      │                        │                         │
      │                        │                         │
      │                   ┌────┴────┐              ┌────┴────┐
      │                   │ RFQItem │              │  Quote  │
      │                   └─────────┘              └─────────┘
      │                        │                         │
      └───────────────────┐    │    ┌───────────────────┘
                          │    │    │
                     ┌────▼────▼────▼───┐
                     │     Product      │
                     └──────────────────┘
```

## Models by Domain

### User Management

#### User

Core user table for platform users (homeowners, contractors, architects, etc.).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| email | String (unique) | User email address |
| googleId | String (unique) | Google OAuth ID |
| phone | String (unique) | Phone number |
| name | String | Full name |
| role | UserRole (enum) | User type/role |
| city | String | User's city |
| purpose | String | new build / renovation |
| status | UserStatus (enum) | ACTIVE, SUSPENDED, DELETED |
| profileImage | String | Profile photo URL |
| isPhoneVerified | Boolean | Phone verification status |
| isEmailVerified | Boolean | Email verification status |

**Enums:**
- `UserRole`: INDIVIDUAL_HOME_BUILDER, RENOVATION_HOMEOWNER, ARCHITECT, INTERIOR_DESIGNER, CONTRACTOR, ELECTRICIAN, SMALL_BUILDER, DEVELOPER
- `UserStatus`: ACTIVE, SUSPENDED, DELETED

**Relations:**
- `rfqs`: One-to-many with RFQ
- `communityPosts`: One-to-many with CommunityPost
- `communityComments`: One-to-many with CommunityComment
- `savedProducts`: One-to-many with SavedProduct

**Indexes:**
- email, phone, googleId, city

#### OTP

One-time passwords for phone/email verification.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| identifier | String | Phone number or email |
| code | String | 6-digit OTP |
| type | String | login, signup |
| expiresAt | DateTime | Expiration time |
| verified | Boolean | Verification status |
| attempts | Int | Failed attempts count |

**Indexes:**
- identifier, expiresAt

---

### Dealer Management

#### Dealer

Registered dealers who provide quotes and products.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| email | String (unique) | Dealer email |
| password | String | Hashed password |
| businessName | String | Company/shop name |
| ownerName | String | Owner's full name |
| phone | String | Contact phone |
| gstNumber | String (unique) | GST registration number |
| panNumber | String | PAN card number |
| shopAddress | String | Physical address |
| city | String | City |
| state | String | State |
| pincode | String | Postal code |
| dealerType | DealerType (enum) | Dealer classification |
| yearsInOperation | Int | Years in business |
| status | DealerStatus (enum) | Verification status |
| onboardingStep | Int | Onboarding progress (0-100) |
| profileComplete | Boolean | Profile completion status |
| verificationNotes | String | Admin notes on verification |
| verifiedAt | DateTime | Verification timestamp |
| verifiedBy | String | Admin ID who verified |
| rejectionReason | String | Reason for rejection |
| totalRFQsReceived | Int | Performance metric |
| totalQuotesSubmitted | Int | Performance metric |
| totalConversions | Int | Performance metric |
| conversionRate | Float | Performance metric |
| avgResponseTime | Int | Average response time (minutes) |

**Enums:**
- `DealerStatus`: PENDING_VERIFICATION, DOCUMENTS_PENDING, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED, DELETED
- `DealerType`: RETAILER, DISTRIBUTOR, SYSTEM_INTEGRATOR, CONTRACTOR, OEM_PARTNER, WHOLESALER

**Document Fields:**
- gstDocument, panDocument, shopLicense, cancelledCheque, shopPhoto, brandAuthProofs (array)

**Relations:**
- `brandMappings`: One-to-many with DealerBrandMapping
- `categoryMappings`: One-to-many with DealerCategoryMapping
- `serviceAreas`: One-to-many with DealerServiceArea
- `quotes`: One-to-many with Quote
- `reviews`: One-to-many with DealerReview

**Indexes:**
- email, gstNumber, city, status

#### DealerServiceArea

Pincodes serviced by dealers.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| dealerId | String | Foreign key to Dealer |
| pincode | String | Service pincode |

**Unique Constraint:** (dealerId, pincode)

#### DealerReview

Customer reviews for dealers.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| dealerId | String | Foreign key to Dealer |
| userId | String | Reviewer user ID |
| rfqId | String | Related RFQ |
| rating | Int | 1-5 star rating |
| comment | String | Review text |

---

### Product Catalog

#### Category

Top-level product categories (e.g., Wiring, Lighting, Protection).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String (unique) | Category name |
| slug | String (unique) | URL-friendly slug |
| description | String | Category description |
| icon | String | Icon URL/name |
| sortOrder | Int | Display order |
| isActive | Boolean | Visibility status |
| seoTitle | String | SEO title |
| seoDescription | String | SEO description |
| whatIsIt | String | Educational content |
| whereUsed | String | Usage locations |
| whyQualityMatters | String | Quality explanation |
| commonMistakes | String | Common pitfalls |

**Relations:**
- `subCategories`: One-to-many with SubCategory
- `dealerMappings`: One-to-many with DealerCategoryMapping

#### SubCategory

Mid-level categorization (e.g., MCBs, DBs, Switches).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| categoryId | String | Foreign key to Category |
| name | String | Subcategory name |
| slug | String | URL-friendly slug |
| description | String | Description |
| sortOrder | Int | Display order |
| isActive | Boolean | Visibility status |

**Relations:**
- `category`: Many-to-one with Category
- `productTypes`: One-to-many with ProductType

**Unique Constraint:** (categoryId, slug)

#### ProductType

Specific product types (e.g., 2-pole MCB, 4-pole MCB).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| subCategoryId | String | Foreign key to SubCategory |
| name | String | Product type name |
| slug | String | URL-friendly slug |
| description | String | Description |
| technicalInfo | String (JSON) | Technical specifications |
| useCases | String (JSON) | Usage scenarios |
| sortOrder | Int | Display order |
| isActive | Boolean | Visibility status |

**Relations:**
- `subCategory`: Many-to-one with SubCategory
- `products`: One-to-many with Product

#### Brand

Product brands (e.g., Havells, Schneider, Legrand).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String (unique) | Brand name |
| slug | String (unique) | URL-friendly slug |
| logo | String | Logo URL |
| description | String | Brand description |
| website | String | Official website |
| isActive | Boolean | Visibility status |
| isPremium | Boolean | Premium brand flag |
| priceSegment | String | Budget/Mid-range/Premium |
| qualityRating | Float | 1-5 rating |

**Relations:**
- `products`: One-to-many with Product
- `dealerMappings`: One-to-many with DealerBrandMapping
- `brandDealers`: One-to-many with BrandDealer

#### Product

Individual products with specifications.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| productTypeId | String | Foreign key to ProductType |
| brandId | String | Foreign key to Brand |
| name | String | Product name |
| modelNumber | String | Model identifier |
| sku | String (unique) | Stock keeping unit |
| description | String | Product description |
| specifications | String (JSON) | Technical specs |
| images | String[] | Image URLs array |
| datasheetUrl | String | Datasheet PDF URL |
| manualUrl | String | Manual PDF URL |
| certifications | String[] | ISI, IEC, etc. |
| warrantyYears | Int | Warranty period |
| isActive | Boolean | Visibility status |

**Relations:**
- `productType`: Many-to-one with ProductType
- `brand`: Many-to-one with Brand
- `rfqItems`: One-to-many with RFQItem
- `savedProducts`: One-to-many with SavedProduct

**Indexes:**
- brandId, productTypeId, sku

#### DealerBrandMapping

Authorized brands for each dealer.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| dealerId | String | Foreign key to Dealer |
| brandId | String | Foreign key to Brand |
| authProofUrl | String | Authorization document |
| isVerified | Boolean | Verification status |

**Unique Constraint:** (dealerId, brandId)

#### DealerCategoryMapping

Product categories serviced by dealers.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| dealerId | String | Foreign key to Dealer |
| categoryId | String | Foreign key to Category |

**Unique Constraint:** (dealerId, categoryId)

---

### RFQ System

#### RFQ

Request for Quotation from users.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | Foreign key to User |
| title | String | RFQ title |
| description | String | Detailed description |
| deliveryCity | String | Delivery location |
| deliveryPincode | String | Delivery pincode |
| deliveryAddress | String | Full delivery address |
| estimatedDate | DateTime | Required delivery date |
| deliveryPreference | String | delivery/pickup/both |
| urgency | String | normal/urgent |
| status | RFQStatus (enum) | Current status |
| publishedAt | DateTime | Publication timestamp |
| selectedDealerId | String | Chosen dealer |
| selectedQuoteId | String | Chosen quote |
| completedAt | DateTime | Completion timestamp |
| aiSuggestions | String (JSON) | AI-generated suggestions |
| aiFlags | String (JSON) | AI warnings/flags |

**Enums:**
- `RFQStatus`: DRAFT, PUBLISHED, QUOTES_RECEIVED, DEALER_SELECTED, COMPLETED, CANCELLED

**Relations:**
- `user`: Many-to-one with User
- `items`: One-to-many with RFQItem
- `quotes`: One-to-many with Quote

**Indexes:**
- userId, status, deliveryPincode, publishedAt

#### RFQItem

Products requested in an RFQ.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| rfqId | String | Foreign key to RFQ |
| productId | String | Foreign key to Product |
| quantity | Int | Quantity requested |
| notes | String | Item-specific notes |

---

### Quote System

#### Quote

Dealer quotes for RFQs.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| rfqId | String | Foreign key to RFQ |
| dealerId | String | Foreign key to Dealer |
| totalAmount | Float | Total quote amount |
| shippingCost | Float | Shipping charges |
| notes | String | Quote notes |
| deliveryDate | DateTime | Estimated delivery |
| pickupDate | DateTime | Pickup availability |
| validUntil | DateTime | Quote expiration |
| status | QuoteStatus (enum) | Current status |
| submittedAt | DateTime | Submission time |
| viewedAt | DateTime | User viewed time |
| selectedAt | DateTime | Selection time |
| lossReason | String | Rejection reason |
| rankPosition | Int | Quote ranking |

**Enums:**
- `QuoteStatus`: SUBMITTED, SELECTED, REJECTED, EXPIRED

**Relations:**
- `rfq`: Many-to-one with RFQ
- `dealer`: Many-to-one with Dealer
- `items`: One-to-many with QuoteItem

**Unique Constraint:** (rfqId, dealerId)

#### QuoteItem

Line items in a quote.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| quoteId | String | Foreign key to Quote |
| productId | String | Product reference |
| quantity | Int | Quantity |
| unitPrice | Float | Price per unit |
| totalPrice | Float | Line total |

---

### Community & Knowledge

#### CommunityPost

Forum posts from users.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | Foreign key to User |
| title | String | Post title |
| content | String | Post content |
| city | String | Location tag |
| category | String | Discussion category |
| tags | String[] | Topic tags |
| upvotes | Int | Upvote count |
| status | PostStatus (enum) | Visibility status |

**Enums:**
- `PostStatus`: PUBLISHED, HIDDEN, DELETED

**Relations:**
- `user`: Many-to-one with User
- `comments`: One-to-many with CommunityComment

#### CommunityComment

Comments on community posts.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| postId | String | Foreign key to CommunityPost |
| userId | String | Foreign key to User |
| content | String | Comment content |
| parentId | String | Parent comment (for nested replies) |
| upvotes | Int | Upvote count |

**Relations:**
- Self-referential for nested comments

#### KnowledgeArticle

Educational content articles.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| title | String | Article title |
| slug | String (unique) | URL-friendly slug |
| content | String | Article content (Markdown/HTML) |
| category | String | Content category |
| tags | String[] | Topic tags |
| metaTitle | String | SEO title |
| metaDescription | String | SEO description |
| coverImage | String | Cover image URL |
| views | Int | View count |
| isPublished | Boolean | Publication status |
| authorId | String | Admin author ID |
| publishedAt | DateTime | Publication timestamp |

---

### Product Inquiries & Pipeline

#### ProductInquiry

Quick inquiry form submissions.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| inquiryNumber | String (unique) | HUB-BRAND-PRODUCT-0001 |
| name | String | Customer name |
| phone | String | Contact phone |
| email | String | Contact email |
| productPhoto | String | Uploaded image |
| modelNumber | String | Product model |
| quantity | Int | Quantity needed |
| deliveryCity | String | Delivery location |
| notes | String | Additional notes |
| status | String | new/contacted/quoted/closed |
| assignedTo | String | Admin ID |
| internalNotes | String | Admin notes |
| quotedPrice | Float | Unit price |
| shippingCost | Float | Shipping cost |
| totalPrice | Float | Total price |
| estimatedDelivery | String | Delivery estimate |
| responseNotes | String | Quote notes |
| respondedAt | DateTime | Response timestamp |
| respondedBy | String | Admin responder ID |

**Relations:**
- `pipeline`: One-to-one with InquiryPipeline

**Indexes:**
- status, phone, inquiryNumber, createdAt

#### InquiryPipeline

Automated dealer quote workflow.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| inquiryId | String (unique) | Foreign key to ProductInquiry |
| identifiedBrandId | String | AI-identified brand |
| identifiedBrand | String | Brand name |
| identifiedProduct | String | Product name |
| identifiedCategory | String | Category |
| status | PipelineStatus (enum) | Workflow status |
| aiAnalysis | String (JSON) | AI analysis results |
| sentToCustomerAt | DateTime | Customer notification time |
| sentVia | String | email/sms/both |
| customerMessage | String | Message sent |
| createdBy | String | Admin ID |

**Enums:**
- `PipelineStatus`: BRAND_IDENTIFIED, DEALERS_FOUND, QUOTES_REQUESTED, QUOTES_RECEIVED, SENT_TO_CUSTOMER, CLOSED

**Relations:**
- `inquiry`: One-to-one with ProductInquiry
- `dealerQuotes`: One-to-many with InquiryDealerQuote

#### BrandDealer

External dealer contacts (not registered on platform).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| brandId | String | Foreign key to Brand |
| name | String | Dealer contact name |
| shopName | String | Shop name |
| phone | String | Contact phone |
| whatsappNumber | String | WhatsApp number |
| email | String | Email address |
| city | String | City |
| state | String | State |
| pincode | String | Pincode |
| address | String | Full address |
| source | BrandDealerSource (enum) | Data source |
| sourceUrl | String | Source URL |
| isVerified | Boolean | Verification status |
| isActive | Boolean | Active status |
| notes | String | Notes |

**Enums:**
- `BrandDealerSource`: MANUAL, SCRAPED, BRAND_WEBSITE, PLATFORM_DEALER
- `ContactMethod`: WHATSAPP, CALL, EMAIL, SMS
- `QuoteResponseStatus`: PENDING, CONTACTED, QUOTED, NO_RESPONSE, DECLINED

**Unique Constraint:** (brandId, phone)

#### InquiryDealerQuote

Quotes from dealers for pipeline inquiries.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| pipelineId | String | Foreign key to InquiryPipeline |
| brandDealerId | String | Foreign key to BrandDealer |
| dealerId | String | Platform dealer ID (optional) |
| dealerName | String | Denormalized dealer name |
| dealerPhone | String | Denormalized phone |
| dealerShopName | String | Shop name |
| dealerCity | String | City |
| contactMethod | ContactMethod (enum) | Contact method used |
| contactedAt | DateTime | Contact timestamp |
| whatsappMessage | String | WhatsApp message |
| quotedPrice | Float | Quoted price |
| shippingCost | Float | Shipping cost |
| totalQuotedPrice | Float | Total price |
| deliveryDays | Int | Delivery timeframe |
| warrantyInfo | String | Warranty details |
| quoteNotes | String | Additional notes |
| responseStatus | QuoteResponseStatus (enum) | Response status |

---

### CRM System

#### CRMCompany

Companies for B2B outreach (manufacturers, distributors, brands).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Company name |
| slug | String (unique) | URL-friendly slug |
| type | CompanyType (enum) | Company classification |
| segment | CompanySegment (enum) | Market segment |
| website | String | Website URL |
| email | String | General email |
| phone | String | Contact phone |
| linkedIn | String | LinkedIn URL |
| city | String | City |
| state | String | State |
| country | String | Country (default: India) |
| description | String | Company description |
| productCategories | String[] | Product lines |
| yearEstablished | Int | Establishment year |
| employeeCount | String | Employee range |
| annualRevenue | String | Revenue range |
| hasApi | Boolean | API availability |
| digitalMaturity | String | low/medium/high |
| dealerNetworkSize | String | Network size |
| status | String | prospect/contacted/interested/partner/inactive |
| priority | String | low/medium/high |
| tags | String[] | Custom tags |
| notes | String | Internal notes |

**Enums:**
- `CompanyType`: MANUFACTURER, DISTRIBUTOR, DEALER, BRAND, OTHER
- `CompanySegment`: PREMIUM, MID_RANGE, BUDGET, ALL_SEGMENTS

**Relations:**
- `contacts`: One-to-many with CRMContact
- `outreaches`: One-to-many with CRMOutreach

#### CRMContact

Individual contacts at companies.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| companyId | String | Foreign key to CRMCompany |
| name | String | Contact name |
| email | String | Email address |
| phone | String | Phone number |
| linkedIn | String | LinkedIn profile |
| designation | String | Job title |
| department | String | Department |
| decisionMaker | Boolean | Decision-making authority |
| isPrimary | Boolean | Primary contact flag |
| status | String | active/left_company/do_not_contact |
| notes | String | Contact notes |

**Relations:**
- `company`: Many-to-one with CRMCompany
- `outreaches`: One-to-many with CRMOutreach

#### CRMOutreach

Outreach attempts tracking.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| companyId | String | Foreign key to CRMCompany |
| contactId | String | Foreign key to CRMContact |
| type | OutreachType (enum) | Outreach method |
| subject | String | Email subject |
| content | String | Message content |
| templateUsed | String | Template name |
| scheduledAt | DateTime | Scheduled time |
| sentAt | DateTime | Sent time |
| status | OutreachStatus (enum) | Current status |
| openedAt | DateTime | Email opened time |
| repliedAt | DateTime | Reply received time |
| responseContent | String | Reply content |
| responseSentiment | String | positive/neutral/negative |
| followUpDate | DateTime | Next follow-up |
| followUpNumber | Int | Follow-up sequence number |
| notes | String | Notes |

**Enums:**
- `OutreachType`: EMAIL, LINKEDIN, PHONE_CALL, MEETING, WHATSAPP, OTHER
- `OutreachStatus`: SCHEDULED, SENT, DELIVERED, OPENED, REPLIED, MEETING_SCHEDULED, NOT_INTERESTED, BOUNCED, FAILED

---

### Admin & Security

#### Admin

Admin users with platform access.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| email | String (unique) | Admin email |
| password | String | Hashed password |
| name | String | Admin name |
| role | String | admin/super_admin |
| isActive | Boolean | Active status |

#### AuditLog

Audit trail for admin actions.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| action | AuditAction (enum) | Action performed |
| entityType | String | Entity type |
| entityId | String | Entity ID |
| performedBy | String | Admin ID |
| details | String (JSON) | Action details |

**Enums:**
- `AuditAction`: DEALER_VERIFIED, DEALER_REJECTED, DEALER_SUSPENDED, PRODUCT_CREATED, PRODUCT_UPDATED, CATEGORY_CREATED, USER_SUSPENDED, RFQ_FLAGGED, QUOTE_FLAGGED

#### FraudFlag

Fraud detection flags.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| entityType | String | user/dealer/rfq/quote |
| entityId | String | Entity ID |
| flagType | String | duplicate_gst/fake_quote/spam_rfq |
| severity | String | low/medium/high/critical |
| description | String | Flag description |
| status | String | open/investigating/resolved/false_positive |
| flaggedBy | String | System or admin ID |
| resolvedBy | String | Admin ID |
| resolvedAt | DateTime | Resolution time |

---

### Activity Tracking

#### UserActivity

Comprehensive activity log.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| actorType | String | user/dealer/admin/anonymous |
| actorId | String | Actor ID |
| actorEmail | String | Actor email |
| actorName | String | Actor name |
| activityType | ActivityType (enum) | Activity type |
| description | String | Human-readable description |
| metadata | String (JSON) | Activity context data |
| entityType | String | Related entity type |
| entityId | String | Related entity ID |
| ipAddress | String | Request IP |
| userAgent | String | Request user agent |

**ActivityType Enum** (50+ event types covering):
- Authentication events
- Dealer events
- Product events
- RFQ/Quote events
- Community events
- Admin events

**Indexes:**
- (actorType, actorId), activityType, (entityType, entityId), createdAt, actorEmail

---

### Web Scraping System

#### ScrapeBrand

Brands to scrape for product data.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String (unique) | Brand name |
| slug | String (unique) | URL slug |
| website | String | Brand website |
| logoUrl | String | Logo URL |
| isActive | Boolean | Scraping enabled |
| scrapeFrequency | String | daily/weekly/monthly |
| lastScrapedAt | DateTime | Last scrape time |
| nextScrapeAt | DateTime | Next scheduled scrape |
| catalogUrls | String (JSON) | URLs to scrape |
| selectors | String (JSON) | CSS selectors config |
| totalProducts | Int | Total products scraped |
| lastScrapeCount | Int | Last scrape count |

**Relations:**
- `scrapeJobs`: One-to-many with ScrapeJob
- `scrapedProducts`: One-to-many with ScrapedProduct

#### ScrapeJob

Individual scrape job executions.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| brandId | String | Foreign key to ScrapeBrand |
| status | ScrapeStatus (enum) | Job status |
| startedAt | DateTime | Start time |
| completedAt | DateTime | Completion time |
| productsFound | Int | Products found |
| productsCreated | Int | Products created |
| productsUpdated | Int | Products updated |
| errors | Int | Error count |
| logs | String (JSON) | Job logs |
| errorDetails | String (JSON) | Error details |
| configSnapshot | String (JSON) | Config used |

**Enums:**
- `ScrapeStatus`: PENDING, IN_PROGRESS, COMPLETED, FAILED, PARTIAL

#### ScrapedProduct

Raw scraped product data before normalization.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| brandId | String | Foreign key to ScrapeBrand |
| sourceUrl | String | Source page URL |
| scrapedAt | DateTime | Scrape timestamp |
| rawName | String | Raw product name |
| rawCategory | String | Raw category |
| rawSubCategory | String | Raw subcategory |
| rawModelNumber | String | Raw model number |
| rawSku | String | Raw SKU |
| rawDescription | String | Raw description |
| rawSpecifications | String (JSON) | Raw specs |
| rawImages | String[] | Image URLs |
| rawDatasheetUrl | String | Datasheet URL |
| rawManualUrl | String | Manual URL |
| rawPrice | String | MRP |
| rawCertifications | String[] | Certifications |
| rawWarranty | String | Warranty info |
| isProcessed | Boolean | Processing status |
| processedAt | DateTime | Processing time |
| productId | String | Normalized product ID |
| isValid | Boolean | Validation status |
| validationErrors | String (JSON) | Validation issues |
| contentHash | String | Deduplication hash |

---

### Additional Tables

#### ChatSession & ChatMessage

AI chat functionality (Anthropic Claude integration).

#### EmailTemplate

B2B email templates for outreach.

#### ContactSubmission

Contact form submissions and lead management.

#### SavedProduct

User-saved products for later reference.

#### CRMMeeting

Scheduled meetings with companies.

#### CRMPipelineStage

Pipeline stages for CRM workflow.

#### ScrapeMapping & ScrapeTemplate

Scraping configuration and mapping rules.

---

## Migration Strategy

### Running Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name description_of_change

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Test migrations locally** before deploying
3. **Backup database** before running migrations in production
4. **Use descriptive migration names**
5. **Review generated SQL** before applying

---

## Performance Optimization

### Indexes

All critical query paths have indexes:
- Foreign keys
- Unique constraints
- Frequently filtered fields (status, city, email, phone)
- Date fields used in queries (createdAt, publishedAt)

### Query Optimization

- Use `select` to fetch only needed fields
- Use `include` judiciously to avoid N+1 queries
- Implement pagination for large datasets
- Use database indexes for filtering and sorting

### Connection Pooling

Prisma connection pooling is configured automatically. For production:
- Set appropriate connection pool size
- Use connection limits based on database tier
- Monitor active connections

---

## Data Integrity

### Cascading Deletes

Relationships use `onDelete: Cascade` where appropriate:
- Deleting a User cascades to their RFQs and Community Posts
- Deleting an RFQ cascades to its Items and Quotes
- Deleting a Dealer cascades to their Quotes and Mappings

### Unique Constraints

- Email addresses (User, Dealer, Admin)
- GST numbers (Dealer)
- SKUs (Product)
- Composite uniques for relationship tables

---

Last Updated: 2025-01-19
Schema Version: 1.0
