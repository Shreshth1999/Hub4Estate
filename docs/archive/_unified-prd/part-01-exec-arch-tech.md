# Hub4Estate — The Definitive Technical Product Requirements Document

> **Version 3.0** | April 2026 | Hub4Estate LLP (LLPIN: ACW-4269) | **CONFIDENTIAL**
>
> Authored by: CTO, Hub4Estate | Founder: Shreshth Agarwal
>
> This document is the single source of truth for the Hub4Estate platform. It specifies every system, service, model, endpoint, component, algorithm, and infrastructure parameter required to build, deploy, and operate the platform at scale. An engineering team with zero prior context can rebuild the entire system from this document alone.

---

## Document Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-15 | CTO | Initial 6-part PRD (366 pages) |
| 2.0 | 2026-04-05 | CTO | Unified HTML interactive PRD |
| 3.0 | 2026-04-08 | CTO | **Definitive PRD** — all features ship now, no phases, complete engineering specification |

---

## Table of Contents

- **§1** Executive Summary & Platform Vision
- **§2** System Architecture
- **§3** Technology Stack & Engineering Decisions
- **§4** UI/UX Design System
- **§5** Complete Feature Catalog (175+ Features)
- **§6** Complete Database Schema (49+ Models, 19+ Enums)
- **§7** Complete API Specification (131+ Endpoints)
- **§8** AI & Agentic Architecture (15+ Systems)
- **§9** Security Architecture
- **§10** Infrastructure & DevOps
- **§11** Complete File Structure
- **§12** Testing Strategy
- **§13** User Journeys (14 Flows)
- **§14** Error Handling & Edge Cases
- **§15** Compliance & Legal
- **§16** Performance Benchmarks
- **§17** Monetization & Business Logic
- **§18** CRM System
- **§19** Web Scraping Engine
- **§20** Community & Content Platform
- **§21** Mobile Application (React Native)
- **§22** Appendices

---

# §1 — Executive Summary & Platform Vision

## 1.1 What Hub4Estate Is

Hub4Estate is India's first AI-powered blind-matching procurement platform for construction materials, starting with the electrical segment. It is the intersection of three proven models compressed into one vertical-specific platform:

- **Amazon's marketplace model** — structured product catalog, verified sellers, competitive pricing, reviews
- **LinkedIn's professional network** — verified professional profiles, endorsements, activity feeds, trust badges
- **Urban Company's service layer** — vetted service providers, standardized booking, post-service reviews

The platform creates a digital layer over India's ₹8–10 lakh crore unorganized construction material market, where pricing is opaque, catalogs are non-existent, dealer monopolies dominate Tier 2/3 cities, and buyers routinely pay 20–40% above fair market value because they lack alternatives.

## 1.2 The Problem

The Indian construction material supply chain is broken across five dimensions:

| Dimension | Current State | Impact |
|-----------|--------------|--------|
| **Pricing Opacity** | Same product quoted at ₹66K to ₹1.05L by different dealers | Buyers overpay 25–40% on every purchase |
| **Spam Leads** | Platforms like IndiaMART send 50+ irrelevant calls per listing | Dealers waste time, buyers get harassed |
| **Relationship Dependency** | Pricing depends on who-knows-who, not market dynamics | New buyers, small contractors, and homeowners get worst prices |
| **Zero Digital Infrastructure** | No standardized catalogs, no price comparison, no quality verification | Every purchase requires manual research across multiple dealers |
| **Information Asymmetry** | Dealers know market prices; buyers don't | Dealers exploit information advantage for higher margins |

## 1.3 The Solution: Five Mechanisms

Hub4Estate solves this with five interlocking mechanisms:

### 1.3.1 Blind Matching Engine (Core Philosophical Principle)

Neither buyer nor dealer should have information that allows them to exploit the other party. When a buyer submits a procurement requirement, it is delivered to matching dealers with the buyer's identity hidden. Dealers submit sealed quotes without seeing each other's bids. The buyer sees quotes ranked by price, delivery time, and dealer rating — but dealer identity remains hidden until the buyer selects a winner. This creates genuine competition where the only way to win is to offer the best value.

**This is not a feature. It is the constitutional principle of the platform. Every other feature must be consistent with it.**

### 1.3.2 AI-Powered Inquiry Parsing

Buyers submit requirements in any format — typed text, photographed handwritten slips, voice messages in Hindi/English/Hinglish, scanned PDFs, or conversational chat with the Volt AI assistant. The AI layer (Claude Vision + NLP) extracts structured data: brand, product category, specifications, quantity, and delivery requirements. Confidence scoring routes low-confidence parses to human review.

### 1.3.3 Verified Dealer Network

Every dealer undergoes KYC verification: GST certificate, PAN, trade license, brand authorization proofs, and shop verification. Dealers are mapped to specific brands and categories they are authorized to sell, and specific service area pincodes they can deliver to. A composite dealer score (0–100) based on price competitiveness, response speed, reliability, and review scores ensures quality.

### 1.3.4 Competitive Quoting

Multiple dealers quote on the same inquiry. The buyer sees a comparison table with price, delivery time, shipping cost, warranty, and dealer score — all anonymized. This transforms a take-it-or-leave-it negotiation into a competitive marketplace where dealers compete on value.

### 1.3.5 Price Intelligence

The platform aggregates pricing data across dealers, cities, and time. A real-time price index tracks market rates by category. Anomaly detection (Isolation Forest + Z-score) flags suspicious pricing. Predictive models (XGBoost, retrained weekly) forecast optimal procurement timing. Every buyer sees whether a quote is above, at, or below market rate.

## 1.4 Validated Results

Hub4Estate has been operating with 10 active clients in Sri Ganganagar, Rajasthan, processing deals manually to validate the model before full platform automation. Documented results:

| Deal | Product | Best Retail | Hub4Estate Price | Savings |
|------|---------|------------|-----------------|---------|
| 1 | Sony LED Panels ×2 | ₹280 (nearest dealer, both) | ₹76/each with delivery | 46% below nearest dealer |
| 2 | Sony Tower Speaker + 2 Mics | ₹1,05,000 (Croma) | ₹68,000 (tracked 8 dealers) | 35% below Croma |
| 3 | Philips 15W LED Panels ×200 | ₹585/piece (local dealer) | ₹465/piece with shipping | ₹24,000 saved (20.5%) |
| 4 | FRLS 2.5mm² Cable 200m | ₹83–127/m (6 dealers) | Best quote from competitive bidding | ₹8,800 saved |

These results demonstrate 25–45% savings, validating the blind matching + competitive quoting model.

## 1.5 Market Analysis

### Total Addressable Market (TAM)

India's electrical equipment market: **~$70 billion (₹58 lakh crore)**. This includes wires & cables (₹12L Cr), switchgear (₹8L Cr), lighting (₹10L Cr), fans (₹6L Cr), panels & distribution (₹5L Cr), home automation (₹3L Cr), and solar (₹14L Cr).

### Serviceable Addressable Market (SAM)

B2B procurement through digital channels: **~$11.2 billion (₹9.3 lakh crore)**. This is the portion of the market where procurement happens through intermediaries (dealers, distributors) rather than direct manufacturer sales, and where digital platforms can capture transaction value.

### Serviceable Obtainable Market (SOM)

| Timeline | Target | Monthly GMV |
|----------|--------|-------------|
| Year 1 | Sri Ganganagar + Jaipur, 2,000 users, 200 dealers | ₹50L–1Cr |
| Year 2 | + Mumbai, Pune, Bangalore, 25K users, 1K dealers | ₹5–10Cr |
| Year 3 | 10 cities, 1L users, 5K dealers | ₹50Cr |
| Year 5 | Pan-India, 5L users, 15K dealers, 5+ verticals | ₹500Cr |

## 1.6 Revenue Model

Hub4Estate operates a single, clean revenue model: **dealer subscription + lead purchase plans**.

| Plan | Monthly Price | Included Leads | Extra Lead Cost | Features |
|------|-------------|---------------|----------------|----------|
| **Starter** | ₹999/mo | 10 leads/mo | ₹100/lead | Basic listing, quote submission |
| **Growth** | ₹2,499/mo | 30 leads/mo | ₹75/lead | Analytics, priority matching, templates |
| **Premium** | ₹4,999/mo | Unlimited | — | AI insights, competitor benchmarking, featured listing |
| **Enterprise** | Custom | Custom | Custom | API access, dedicated account manager, white-label |

Additional revenue streams (all ship now):
- **Transaction fee**: 1–3% on completed deals (tiered by dealer plan)
- **Featured listings**: Dealers pay for premium placement in quote comparisons
- **Brand advertising**: Brands pay for category sponsorship and product promotion
- **Market intelligence reports**: Anonymized pricing data sold to manufacturers (₹25K–1L/report)
- **API access**: Pricing API, Dealer API for ERP integration (₹50K–2L/mo)

## 1.7 Vision & Mission

**Vision**: Become the default procurement intelligence platform for India's building materials industry — where every purchase decision is informed by transparent pricing, verified quality, and AI-optimized procurement.

**Mission**: Democratize procurement through AI and transparency, ensuring that a first-time homeowner in Sri Ganganagar gets the same pricing and quality access as a major builder in Mumbai.

---

# §2 — System Architecture

## 2.1 Architectural Philosophy

Hub4Estate follows a **modular monolith** architecture that is designed to be decomposed into microservices as the team and traffic scale. The current architecture is a single Node.js/Express application with clearly separated domain modules (auth, products, inquiries, dealers, admin, AI, CRM, scraper) that communicate through direct function calls within the process. Each module has its own routes, controllers, services, and validation schemas.

**Why modular monolith over microservices from Day 1:**
- Team size is currently 1–3 engineers. Microservices require DevOps overhead that is not justified.
- A well-structured monolith with clear domain boundaries can be decomposed later without rewriting business logic.
- Single deployment unit means simpler CI/CD, easier debugging, no network latency between services.
- The Prisma ORM provides a single source of truth for the data layer; splitting into microservices would require careful data ownership boundaries.

**When to decompose**: When any single domain module exceeds 500ms p99 latency under load, when the team exceeds 8 engineers working on the same codebase, or when a specific module (e.g., AI inference, scraper) has fundamentally different scaling requirements.

## 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ React SPA    │  │ React Native │  │ WhatsApp     │  │ External   │ │
│  │ (Vite/TS)    │  │ Mobile App   │  │ Business API │  │ API Users  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
└─────────┼──────────────────┼──────────────────┼───────────────┼────────┘
          │                  │                  │               │
          ▼                  ▼                  ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EDGE LAYER                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CloudFront CDN (Static Assets, Image Optimization, Edge Cache)  │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│  ┌──────────────────────────────┴───────────────────────────────────┐  │
│  │ AWS WAF (DDoS Protection, Rate Limiting, SQL/XSS Filtering)     │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│  ┌──────────────────────────────┴───────────────────────────────────┐  │
│  │ Application Load Balancer (HTTPS Termination, Health Checks)    │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER (Private Subnet)                  │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │              Node.js + Express + TypeScript                        ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐ ││
│  │  │  Auth   │ │Products │ │Inquiries│ │ Dealers │ │   Admin    │ ││
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │  Module    │ ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────────┘ ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐ ││
│  │  │   AI    │ │   CRM   │ │ Scraper │ │Community│ │Notifications││
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │  Module    │ ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────────┘ ││
│  │                                                                    ││
│  │  ┌──────────────────────── MIDDLEWARE CHAIN ─────────────────────┐ ││
│  │  │ requestId → blockMalicious → helmet → securityHeaders →      │ ││
│  │  │ preventParamPollution → cors → bodyParser → sanitizeInputs → │ ││
│  │  │ detectAttacks → session → passport → rateLimiter →           │ ││
│  │  │ authenticate → validate → handler                            │ ││
│  │  └──────────────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────────┐  │
│  │  Socket.io Server │  │  BullMQ Workers   │  │  Cron Scheduler    │  │
│  │  (Real-time)      │  │  (Background Jobs)│  │  (Periodic Tasks)  │  │
│  └───────────────────┘  └───────────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER (Isolated Subnet)                     │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ PostgreSQL (RDS) │  │ Redis            │  │ Elasticsearch        │  │
│  │ db.r6g.large     │  │ (ElastiCache)    │  │ (Elastic Cloud)      │  │
│  │ Multi-AZ         │  │ cache.r6g.medium │  │ Product Search       │  │
│  │ 49+ tables       │  │ 6 cache layers   │  │ Semantic Search      │  │
│  │ Prisma ORM       │  │ Sessions/Cache/  │  │ Fuzzy Matching       │  │
│  │ Read Replica     │  │ PubSub/Queue     │  │                      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ S3 Buckets       │  │ pgvector         │  │ Neo4j (Knowledge     │  │
│  │ (File Storage)   │  │ (Vector Store)   │  │  Graph)              │  │
│  │ 8 lifecycle-     │  │ Embeddings for   │  │ Product compat-      │  │
│  │ managed buckets  │  │ semantic search  │  │ ibility, alts,       │  │
│  │                  │  │ RAG retrieval    │  │ required-with edges  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                   │
│                                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐│
│  │ Anthropic│ │ OpenAI   │ │ Razorpay │ │ Resend   │ │ MSG91        ││
│  │ Claude   │ │ Embed-   │ │ Payment  │ │ Email    │ │ SMS (India)  ││
│  │ API      │ │ dings    │ │ Gateway  │ │ Service  │ │ DLT Compliant││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐│
│  │ Google   │ │ WhatsApp │ │ Sentry   │ │ PostHog  │ │ GrowthBook   ││
│  │ OAuth +  │ │ Business │ │ Error    │ │Analytics │ │ A/B Testing  ││
│  │ Vision   │ │ API      │ │ Tracking │ │          │ │ Feature Flags││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                              │
│  │ SageMaker│ │ Expo     │ │ Firebase │                              │
│  │ ML Model │ │ Push     │ │ Cloud    │                              │
│  │ Serving  │ │ Notif.   │ │ Messaging│                              │
│  └──────────┘ └──────────┘ └──────────┘                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2.3 Request Flow: Inquiry Submission

```
Buyer (Web/Mobile/WhatsApp)
    │
    ▼
[1] POST /api/inquiry/submit
    │ multipart/form-data: { name, phone, email, productPhoto, modelNumber, quantity, deliveryCity, notes }
    │
    ▼
[2] Middleware Chain
    │ requestId → sanitize → detectAttacks → rateLimiter(10/hr) → validate(Zod) → optionalAuth
    │
    ▼
[3] InquiryController.submit()
    │ ├── Generate inquiry number: INQ-YYYYMMDD-XXXX
    │ ├── Upload productPhoto to S3 (if present)
    │ ├── Create ProductInquiry record (status: "new")
    │ ├── Log UserActivity (PRODUCT_INQUIRY_SUBMITTED)
    │ └── Trigger async pipeline:
    │
    ├──▶ [4a] AI Parsing (async)
    │    │ ├── Claude Vision: Analyze product photo → extract brand, model, specs
    │    │ ├── Claude NLP: Parse text fields → identify category, brand
    │    │ ├── Confidence scoring (0.0–1.0)
    │    │ ├── If confidence ≥ 0.7: auto-assign category + brand
    │    │ └── If confidence < 0.7: route to admin queue for human review
    │    │
    │    ▼
    │    [4b] Create InquiryPipeline record (status: BRAND_IDENTIFIED)
    │
    ├──▶ [5] Dealer Matching (async)
    │    │ ├── Find dealers with matching brand (DealerBrandMapping)
    │    │ ├── Filter by category (DealerCategoryMapping)
    │    │ ├── Filter by delivery pincode (DealerServiceArea)
    │    │ ├── Rank by: conversionRate (0.3) × responseTime (0.25) × status (0.25) × reviews (0.2)
    │    │ └── Select top N dealers (N = 5 for Starter, 10 for Growth, unlimited for Premium)
    │    │
    │    ▼
    │    [5b] Notify matched dealers (blind — no buyer identity)
    │         ├── In-app notification
    │         ├── Push notification (Expo)
    │         ├── WhatsApp message (via Gupshup API)
    │         └── Email (via Resend)
    │
    ├──▶ [6] Buyer Confirmation (immediate)
    │    │ ├── Email: "Your inquiry INQ-20260408-0042 has been received"
    │    │ ├── SMS: "Hub4Estate: Inquiry received. Track at hub4estate.com/track"
    │    │ └── In-app notification (if authenticated)
    │    │
    │    ▼
    │    [7] Dealer Quoting (async, 24-48hr window)
    │         │ Each dealer sees: product details, quantity, delivery city — NOT buyer identity
    │         │ Dealer submits: quotedPrice, shippingCost, estimatedDelivery, notes
    │         │ InquiryDealerResponse created (status: "quoted")
    │         │
    │         ▼
    │    [8] Quote Compilation (triggered when ≥ 2 quotes received OR 48hr deadline)
    │         │ ├── Rank quotes by totalPrice ascending
    │         │ ├── Admin reviews for anomalies (optional)
    │         │ ├── Compile top 3 quotes with anonymized dealer info
    │         │ └── Send to buyer: email + WhatsApp + in-app notification
    │         │
    │         ▼
    │    [9] Buyer Selection
    │         │ Buyer views comparison table → selects winning quote
    │         │ Buyer identity revealed to winning dealer ONLY
    │         │ Losing dealers notified with winning price (not identity)
    │         │
    │         ▼
    │    [10] Deal Closure
    │          ├── InquiryPipeline.status → CLOSED
    │          ├── Dealer metrics updated (totalConversions, conversionRate)
    │          ├── Price data point logged for intelligence engine
    │          └── Review request sent to buyer after delivery window
```

## 2.4 Request Flow: RFQ (Request for Quotation)

```
Buyer (Authenticated)
    │
    ▼
[1] POST /api/rfq (Create RFQ)
    │ { title, description, deliveryCity, deliveryPincode, deliveryAddress,
    │   estimatedDate, deliveryPreference, urgency, items: [{ productId, quantity, notes }] }
    │
    ▼
[2] RFQ created with status: DRAFT
    │ AI suggestions generated via Claude (alternative products, estimated pricing)
    │
    ▼
[3] POST /api/rfq/:id/publish
    │ Status: DRAFT → PUBLISHED
    │ Dealer matching triggered (same algorithm as inquiry, using RFQ item brands/categories)
    │ Matched dealers notified — see RFQ details, NOT buyer identity
    │
    ▼
[4] Dealers submit quotes via POST /api/quotes/submit
    │ { rfqId, items: [{ productId, quantity, unitPrice, totalPrice }],
    │   totalAmount, shippingCost, deliveryDate, validUntil, notes }
    │ Quote created with status: SUBMITTED
    │ RFQ status: PUBLISHED → QUOTES_RECEIVED (on first quote)
    │ @@unique([rfqId, dealerId]) ensures one quote per dealer per RFQ
    │
    ▼
[5] Buyer views quotes comparison: GET /api/rfq/:id
    │ Quotes returned anonymized — dealer identity hidden
    │ Sorted by totalAmount ascending by default
    │ Buyer can compare: price per item, total, shipping, delivery date, dealer score
    │
    ▼
[6] POST /api/rfq/:id/select-quote
    │ { quoteId }
    │ Selected quote: SUBMITTED → SELECTED
    │ All other quotes: SUBMITTED → REJECTED
    │ RFQ status: QUOTES_RECEIVED → DEALER_SELECTED
    │ Selected dealer identity revealed to buyer
    │ Losing dealers notified with winning total (not identity)
    │ Buyer prompted to review dealer post-delivery
```

## 2.5 Caching Architecture (6 Layers)

```
┌─────────────────────────────────────────────────────────┐
│ L1: React Query (Client-Side)                           │
│ Location: Browser memory                                │
│ TTL: 5 minutes (staleTime), retry: 1                    │
│ Invalidation: On mutation (automatic via React Query)   │
│ Purpose: Prevent redundant API calls during navigation  │
│ Key pattern: Query keys per API endpoint                │
└─────────────────────────────────────────────────────────┘
          │ MISS
          ▼
┌─────────────────────────────────────────────────────────┐
│ L2: CDN Cache (CloudFront)                              │
│ Location: Edge nodes (ap-south-1 + global POPs)         │
│ TTL: 24hr for static assets, 15min for API responses    │
│ Invalidation: Deploy-time cache bust (content hash)     │
│ Purpose: Serve static assets and public API responses   │
│ Headers: Cache-Control: public, max-age=86400           │
└─────────────────────────────────────────────────────────┘
          │ MISS
          ▼
┌─────────────────────────────────────────────────────────┐
│ L3: Redis API Response Cache                            │
│ Location: ElastiCache cache.r6g.medium, ap-south-1      │
│ DB: 1                                                   │
│ TTL: 15min (invalidated on mutation events)             │
│ Key: h4e:api:{method}:{path}:{queryHash}                │
│ Purpose: Cache expensive DB queries (product listings,  │
│          category trees, search results)                │
│ Estimated hit rate: 60-80% for catalog endpoints        │
└─────────────────────────────────────────────────────────┘
          │ MISS
          ▼
┌─────────────────────────────────────────────────────────┐
│ L4: Redis Session Store                                 │
│ DB: 0                                                   │
│ TTL: 7 days                                             │
│ Key: h4e:session:{sessionId}                            │
│ Explicit revocation on logout                           │
│ Purpose: Express session storage, token validation cache│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ L5: Redis Rate Limiting + Real-Time                     │
│ DB: 2 (rate limiting), DB: 3 (real-time features)       │
│ Rate limiting: Sliding window 1min/15min, auto-expire   │
│ Real-time: Online presence (5min heartbeat TTL),        │
│            typing indicators, live bid updates           │
│ Key: h4e:rate:{ip}:{endpoint}, h4e:rt:{userId}:online  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ L6: Redis AI Response Cache                             │
│ DB: 4                                                   │
│ TTL: 24hr for identical prompt hashes                   │
│ Key: h4e:ai:{promptHash}                                │
│ Purpose: Cache Claude API responses for identical        │
│          queries — estimated 30% cost reduction          │
│ Content-addressed: SHA256(systemPrompt + userMessage)   │
└─────────────────────────────────────────────────────────┘
          │ MISS
          ▼
┌─────────────────────────────────────────────────────────┐
│ L7: PostgreSQL Materialized Views                       │
│ Location: RDS primary                                   │
│ Refresh: Every 15min via pg_cron                        │
│ Views: category_product_counts, dealer_performance_agg, │
│        inquiry_funnel_metrics, price_intelligence_agg   │
│ Purpose: Pre-computed aggregations for dashboards       │
└─────────────────────────────────────────────────────────┘
```

Redis connection configuration (ioredis):
```typescript
// backend/src/config/redis.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: true,
  db: 0, // Default to sessions
});

// Named connections for each cache layer
export const sessionRedis = redis;
export const cacheRedis = redis.duplicate({ db: 1 });
export const rateLimitRedis = redis.duplicate({ db: 2 });
export const realtimeRedis = redis.duplicate({ db: 3 });
export const aiCacheRedis = redis.duplicate({ db: 4 });

export default redis;
```

---

# §3 — Technology Stack & Engineering Decisions

## 3.1 Language & Runtime: TypeScript Everywhere

**Decision**: TypeScript strict mode for all code — frontend, backend, scripts, infrastructure.

**Why TypeScript over alternatives**:
- **vs JavaScript**: TypeScript catches 40% of bugs at compile time (per Airbnb's study). With a procurement platform handling financial data (quotes, prices, GST numbers), runtime type errors are unacceptable. Strict mode (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`) eliminates entire categories of bugs.
- **vs Go/Rust for backend**: The team is 1–3 engineers. TypeScript allows full-stack development with shared types between frontend and backend. Go would be faster at runtime but slower to develop with when the same engineer writes React and API code. Rust is not justified — our bottleneck is Claude API latency (2–5s), not CPU processing.
- **vs Python for AI/ML**: LangChain.js is mature enough for our agentic workflows. XGBoost model inference is done via JSON export from SageMaker, loaded in Node.js — no Python runtime needed in production. Training happens in SageMaker (Python), inference in Node.js (TypeScript).

**Configuration**:
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## 3.2 Frontend: React 18 + Vite + Tailwind CSS

**Decision**: React 18 with Vite bundler, Tailwind CSS for styling, Zustand for client state, React Query for server state.

| Technology | Choice | Alternative Considered | Why This Choice |
|------------|--------|----------------------|-----------------|
| **Framework** | React 18 (SPA) | Next.js 14 (SSR) | Hub4Estate is a dashboard-heavy platform. The buyer dashboard, dealer portal, and admin panel are all authenticated SPA experiences. SSR benefits (SEO) only apply to the landing page and product catalog, which we handle with prerendering. Next.js adds server complexity and hosting cost (Vercel) that isn't justified when 80% of the app is behind authentication. React SPA on Vite deploys to any CDN for ~$0. |
| **Bundler** | Vite 5 | Webpack 5 | Vite is 10–100x faster for dev server startup and HMR. Our codebase has 53 pages and 20+ components — Webpack would add 15–30s cold start. Vite: <500ms. |
| **Styling** | Tailwind CSS 3 | CSS Modules, Styled Components | Utility-first CSS eliminates the need for naming conventions, reduces CSS bundle size (only used utilities are shipped), and enables rapid UI iteration. The design system is encoded in `tailwind.config.js` as design tokens. |
| **Client State** | Zustand | Redux Toolkit, Jotai | Two stores: `useAuthStore` (persisted) and `useRFQStore` (persisted). Zustand is 1.1KB gzipped vs Redux Toolkit's 10KB+. For our state shape (user object + cart items), Zustand is simpler with zero boilerplate. |
| **Server State** | React Query v5 | SWR, Apollo | React Query provides mutation invalidation, optimistic updates, and infinite scroll pagination out of the box. Configuration: `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`. |
| **Routing** | React Router v6 | TanStack Router | React Router v6 is the ecosystem standard. We use nested layouts (`<Layout />`, `<UserLayout />`, `<DealerLayout />`, `<AdminLayout />`, `<ProfessionalLayout />`), lazy loading via `React.lazy()`, and `<ProtectedRoute>` guards with role-based access. |
| **Icons** | Lucide React | Heroicons, FontAwesome | Lucide is tree-shakeable (only imported icons are bundled), has consistent 24px grid, and covers all our needs. ~50 icons used across the app = ~15KB vs FontAwesome's 200KB+. |
| **Charts** | Recharts | Tremor, Chart.js, D3 | Recharts is React-native (no DOM manipulation), composable, and handles our dashboard needs (bar, line, pie, area, sparkline). D3 is overkill for our chart complexity. |

**Build configuration**:
```typescript
// frontend/vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'zustand', '@tanstack/react-query'],
        },
      },
    },
  },
});
```

**Bundle size targets**:
- `vendor-react`: ~45KB gzipped
- `vendor-ui`: ~25KB gzipped
- Main application chunk: <150KB gzipped
- Total initial load: <250KB gzipped
- Lazy-loaded page chunks: 5–30KB each

## 3.3 Backend: Node.js + Express + Prisma

| Technology | Choice | Why |
|------------|--------|-----|
| **Runtime** | Node.js 20 LTS | Non-blocking I/O is ideal for our workload: mostly I/O-bound (database queries, Claude API calls, S3 uploads). CPU-intensive work (AI inference) is offloaded to SageMaker. |
| **Framework** | Express.js 4 | Battle-tested, massive middleware ecosystem. Fastify is faster but Express's middleware compatibility (passport, multer, helmet, cors) is critical. We run 13 middleware layers — Express handles this cleanly. |
| **ORM** | Prisma 5 | Type-safe database access with auto-generated TypeScript types from schema. Migration system with versioned SQL. Query performance is within 5% of raw SQL for our access patterns. |
| **Validation** | Zod | Runtime type validation that mirrors TypeScript types. Used in both frontend (form validation) and backend (request body validation). Single source of truth for input shapes. |
| **Auth** | JWT + Passport.js | Access tokens (7-day expiry for user/dealer, 24-hour for admin), refresh token rotation (30-day), Google OAuth 2.0 via Passport.js. Tokens carry `{ id, type, email, name }` payload. |
| **File Upload** | Multer + S3 | Multer handles multipart parsing with file type validation (images: jpg/png/gif/webp, docs: pdf, max 5MB). Files uploaded to S3 with content-type headers and UUID filenames. |
| **Email** | Resend | Modern email API, React-compatible email templates, 3K free emails/month. Used for OTP, inquiry confirmations, quote compilations, CRM outreach. |
| **SMS** | MSG91 | Indian SMS gateway with DLT (Distributed Ledger Technology) compliance required by TRAI. Template-based messaging. Twilio as international fallback. |
| **AI** | Anthropic Claude API | claude-sonnet-4-20250514 for complex tasks (chat, inquiry parsing, admin insights). claude-haiku-4-5-20251001 for fast tasks (categorization, suggestions). SSE streaming for chat. |

**Express middleware chain** (exact execution order):
```typescript
// backend/src/index.ts — middleware registration order
app.use(requestId);                          // 1. Attach UUID to every request
app.use(blockMaliciousAgents);               // 2. Block scanner user agents (sqlmap, nikto, nessus)
app.use(helmet());                           // 3. Security headers (X-Content-Type-Options, etc.)
app.use(securityHeaders);                    // 4. CSP, X-Frame-Options: DENY, Permissions-Policy
app.use(preventParamPollution);              // 5. Deduplicate array query params
app.use(cors(corsOptions));                  // 6. CORS with dynamic origin checking
app.use(express.json({ limit: '10mb' }));    // 7. JSON body parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // 8. URL-encoded body
app.use(sanitizeInputs);                     // 9. Strip <>, null bytes from all input
app.use(detectAttacks);                      // 10. Pattern match for SQLi, XSS, path traversal
app.use(session(sessionConfig));             // 11. Express session (7-day cookie)
app.use(passport.initialize());              // 12. Passport OAuth initialization
app.use(passport.session());                 // 13. Passport session deserialization
// Per-route: rateLimiter → authenticate → validate → handler
```

## 3.4 Database: PostgreSQL + Prisma ORM

**Decision**: PostgreSQL 15 on Amazon RDS (db.r6g.large, Multi-AZ) as the single source of truth, accessed exclusively through Prisma ORM.

**Why PostgreSQL over alternatives**:
- **vs MySQL**: PostgreSQL has native JSON/JSONB support (used for `specifications`, `metadata`, `aiAnalysis` fields), array types (used for `tags[]`, `images[]`, `certifications[]`), and the `pgvector` extension for semantic search embeddings. MySQL has none of these natively.
- **vs MongoDB**: Our data model is deeply relational (49 models with foreign keys, cascade deletes, unique constraints). A procurement platform requires ACID transactions for financial operations (quote selection, payment processing). MongoDB's eventual consistency is not acceptable for deal closure flows.
- **vs Supabase**: We evaluated Supabase for its real-time features and Row-Level Security. Decided against because: (1) RLS policies add complexity for a team of 1-3, (2) Supabase lock-in for auth/storage, (3) custom Express middleware chain gives us more security control. We use raw PostgreSQL on RDS instead.

**Database sizing**:
- **Current**: db.t3.micro (2 vCPU, 1GB RAM) — pilot phase
- **Target**: db.r6g.large (2 vCPU, 16GB RAM, Multi-AZ) — production
- **Read replica**: db.r6g.medium for analytics queries, admin dashboards, AI training data extraction
- **Storage**: 100GB gp3 SSD, auto-scaling to 500GB
- **Connections**: max_connections = 200, PgBouncer connection pooling (50 connections per app instance)

**Extensions installed**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "pgvector";       -- Vector embeddings for semantic search
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_cron";        -- Scheduled jobs (materialized view refresh)
```

## 3.5 Search Architecture

**Dual search strategy**:

1. **PostgreSQL full-text search** (current, ships Day 1): `pg_trgm` trigram index on `Product.name`, `Product.modelNumber`, `Brand.name`. Handles 90% of search queries with <50ms latency at current scale. Uses `similarity()` and `word_similarity()` for fuzzy matching (handles typos like "Havels" → "Havells").

2. **Elasticsearch** (ships Day 1 for product catalog): Elastic Cloud on AWS (1 node, 4GB RAM). Indexes: `products` (full catalog with brand, category, specs, pricing), `knowledge_articles` (content search). Provides faceted navigation (filter by brand, price range, category, rating), autocomplete (prefix matching on product names), and relevance scoring. Synced from PostgreSQL via change data capture (Prisma middleware triggers reindex on product CRUD).

3. **pgvector semantic search** (ships Day 1 for AI features): OpenAI `text-embedding-3-small` (1536 dimensions) stored in PostgreSQL. Used for: Volt AI chatbot RAG retrieval, "similar products" recommendations, knowledge base question answering. Embedding pipeline: product descriptions + specifications → embedding → store in `product_embeddings` table with HNSW index.

## 3.6 Real-Time Architecture

**Socket.io** with Redis Pub/Sub adapter for multi-instance support.

```typescript
// backend/src/config/socket.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  transports: ['websocket', 'polling'],
});

io.adapter(createAdapter(pubClient, subClient));

// Namespaces
const buyerNs = io.of('/buyer');    // Inquiry updates, quote notifications
const dealerNs = io.of('/dealer');  // New inquiry alerts, bid results
const adminNs = io.of('/admin');    // Platform events, verification queue
const chatNs = io.of('/chat');      // Volt AI chat, RFQ chat

// Events emitted
// buyer:inquiry-update, buyer:new-quote, buyer:quote-compiled
// dealer:new-inquiry, dealer:bid-result, dealer:subscription-alert
// admin:new-dealer, admin:new-inquiry, admin:fraud-flag
// chat:message, chat:typing, chat:tool-result
```

## 3.7 Message Queue Architecture

**BullMQ** with Redis for background job processing.

| Queue | Purpose | Concurrency | Retry | Delay |
|-------|---------|-------------|-------|-------|
| `email` | Transactional emails via Resend | 5 | 3× (exp backoff) | — |
| `sms` | OTP and notification SMS via MSG91 | 3 | 2× | — |
| `notification` | Push notifications via Expo/FCM | 10 | 2× | — |
| `ai-processing` | Claude API calls (parsing, insights) | 3 | 2× (rate limit aware) | — |
| `scraping` | Brand website scraping jobs | 1 | 1× | 5s between jobs |
| `analytics` | Nightly aggregation, report generation | 1 | 1× | — |
| `whatsapp` | WhatsApp Business API messages | 5 | 3× | — |

## 3.8 Cost Analysis

### Current (Pilot Phase)
| Service | Monthly Cost (INR) |
|---------|-------------------|
| EC2 t3.small | ₹800 |
| RDS db.t3.micro | ₹1,200 |
| S3 (10GB) | ₹50 |
| CloudFront | ₹200 |
| Route 53 | ₹100 |
| Amplify (frontend) | ₹0 (free tier) |
| Claude API | ₹3,000 ($35) |
| Resend | ₹0 (free tier) |
| **Total** | **₹5,350/mo** |

### Production (Target Architecture)
| Service | Monthly Cost (INR) |
|---------|-------------------|
| EC2 ASG (2-10 t3.medium) | ₹8,000 |
| RDS db.r6g.large Multi-AZ | ₹25,000 |
| RDS Read Replica | ₹12,000 |
| ElastiCache Redis | ₹8,000 |
| Elasticsearch (Elastic Cloud) | ₹6,000 |
| S3 (500GB + lifecycle) | ₹1,500 |
| CloudFront (100GB transfer) | ₹3,000 |
| ALB | ₹2,000 |
| WAF | ₹4,000 |
| SQS + SNS | ₹500 |
| Lambda (10 functions) | ₹1,000 |
| Claude API (scaled) | ₹25,000 ($300) |
| OpenAI Embeddings | ₹3,000 ($35) |
| Resend (10K emails) | ₹1,500 |
| MSG91 (5K SMS) | ₹2,500 |
| Sentry | ₹2,000 |
| PostHog | ₹0 (self-hosted) |
| GrowthBook | ₹0 (self-hosted) |
| Razorpay | Transaction-based |
| SageMaker (ML training) | ₹5,000 |
| Neo4j (knowledge graph) | ₹4,000 |
| **Total** | **~₹1,14,000/mo (~$1,350)** |

### At Scale (1M users)
| Service | Monthly Cost (INR) |
|---------|-------------------|
| Compute (ECS/EKS) | ₹80,000 |
| Database (RDS + replicas) | ₹1,50,000 |
| Cache (ElastiCache cluster) | ₹40,000 |
| Search (Elasticsearch 3-node) | ₹30,000 |
| AI APIs | ₹2,00,000 |
| Storage + CDN | ₹25,000 |
| Monitoring + Security | ₹30,000 |
| **Total** | **~₹5,55,000/mo (~$6,600)** |
