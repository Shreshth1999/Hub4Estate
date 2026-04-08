# Hub4Estate -- Product Requirements Document

## Part 1: Executive Summary, Vision, Market Analysis & Platform Architecture

**Version:** 2.0
**Date:** 2 April 2026
**Author:** Shreshth Agarwal, Founder & CEO
**Technical Lead:** CTO Office, Hub4Estate LLP
**LLPIN:** ACW-4269 | **Incorporated:** 17 March 2026
**Classification:** Internal -- Confidential
**Status:** Living Document (updated with every sprint)

---

## Document Map

| Section | Title | Page |
|---------|-------|------|
| 1 | Executive Summary | S-1 |
| 2 | Vision & Mission | S-2 |
| 3 | Market Analysis | S-3 |
| 4 | Platform Architecture Overview | S-4 |
| 5 | Technology Stack Decisions | S-5 |
| A | Appendix: Glossary | End |

---

# Section 1 -- Executive Summary

## 1.1 What Hub4Estate Is

Hub4Estate is India's first AI-powered blind-matching procurement platform for electrical products, built to eliminate the opacity, middlemen, and price manipulation that define how India's construction supply chain operates today.

The platform works on a simple, powerful loop:

```
Buyer submits inquiry
      |
      v
AI parses specs (brand, model, quantity, delivery location)
      |
      v
Inquiry sent BLIND to verified dealers
(dealers see product specs + city, NOT buyer identity)
      |
      v
Dealers submit competitive quotes
      |
      v
Buyer compares quotes side by side
      |
      v
Buyer selects best deal --> contact revealed
      |
      v
Transaction happens directly (Hub4Estate is NOT in the payment flow)
```

**Who it is for:** Anyone who buys electrical products -- homeowners rewiring a house, families installing new lighting, individuals buying a single speaker system, architects specifying fixtures for a project. Hub4Estate is not a contractor tool. It is a consumer-access tool. The starting vertical is electrical products; the platform expands to all construction materials over time.

**Revenue model:** Hub4Estate is permanently free for buyers. Revenue comes from dealers through subscription plans and lead purchase credits. Dealers pay because the platform delivers high-intent, spec-qualified buyers directly to them -- something no amount of Google Ads or foot traffic can replicate.

## 1.2 The Problem

India's electrical equipment market is worth approximately INR 5.8 lakh crore (~$70B) annually, fragmented across an estimated 500,000+ dealers, distributors, wholesalers, and retailers. Yet the buying experience has not changed in decades:

| Problem | Impact | Example |
|---------|--------|---------|
| **Price opacity** | Buyers pay 20-50% more than they should | Sony Tower Speaker: Croma quotes INR 1,05,000. Actual dealer price: INR 68,000. |
| **No access to dealer networks** | Buyers cannot reach distributors or wholesalers | A homeowner buying 200 LED panels has no way to find Philips distributors in their city |
| **Information asymmetry** | Sellers know the buyer is uninformed | Same FRLS 2.5mm cable: 6 dealers quote INR 83 to INR 127 per metre for the identical product |
| **Middlemen extraction** | Brokers, consultants, and "fixers" add 10-30% | Even for bulk purchases, buyers rely on word-of-mouth referrals that come with hidden commissions |
| **Spam and trust deficit** | Existing platforms (IndiaMART, JustDial) sell buyer data | One inquiry = 50 dealer calls within hours, most irrelevant |
| **No comparison infrastructure** | Buyers cannot compare quotes objectively | Without standardized specs and blind quoting, there is no way to evaluate price vs. value |

**The core insight:** This is a trust network problem disguised as an information problem. Price opacity exists not because prices are secret, but because buyers cannot access the networks where competitive pricing exists. Hub4Estate is B2B information infrastructure that gives ordinary buyers wholesale-grade access.

## 1.3 The Solution

Hub4Estate solves this through five interlocking mechanisms:

### 1.3.1 Blind Matching Engine

Neither buyer nor dealer knows the other's identity during the quoting phase. This eliminates:
- Dealers inflating prices based on buyer profile ("looks like a rich homeowner")
- Buyers being spammed by dealers they did not choose
- Relationship bias overriding price competitiveness

The identity reveal happens only after the buyer selects a quote. This single design decision makes Hub4Estate fundamentally different from every existing platform.

### 1.3.2 AI-Powered Inquiry Parsing

When a buyer submits an inquiry -- even as a photo of a product, a vague description, or a model number -- the AI layer:
- Identifies the brand, product category, and exact specifications
- Normalizes the inquiry into a structured format
- Matches it to the correct dealer segments (by brand authorization, category specialization, service area)
- Generates a WhatsApp-ready message template for dealer outreach

### 1.3.3 Verified Dealer Network

Every dealer on Hub4Estate undergoes verification:
- GST document validation
- PAN verification
- Shop license check
- Brand authorization proof (where applicable)
- Physical shop photo verification

This creates a curated supply side that buyers can trust implicitly.

### 1.3.4 Zero-Spam Architecture

Buyers are never exposed to unsolicited contact. The flow is strictly unidirectional:
1. Buyer initiates inquiry
2. Dealers respond to inquiry
3. Buyer reviews responses
4. Buyer initiates contact with selected dealer

At no point can a dealer contact a buyer who has not selected them.

### 1.3.5 Transparent Quote Comparison

Quotes are presented in a standardized format:
- Unit price
- Shipping/delivery cost
- Estimated delivery timeline
- Warranty information
- Dealer performance metrics (response time, conversion rate)

This makes comparison genuinely apples-to-apples.

## 1.4 Validated Results

Hub4Estate is not a concept. The platform has served 10 active clients with real transactions. Below are verified deal outcomes:

| Product | Retail/Showroom Price | Hub4Estate Price | Savings | Savings % |
|---------|----------------------|-----------------|---------|-----------|
| Sony Tower Speaker + 2 Microphones | INR 1,05,000 (Croma) | INR 68,000 | INR 37,000 | 35.2% |
| Philips 15W LED Panels x200 | INR 585/piece (local dealer) | INR 465/piece (with shipping) | INR 24,000 total | 20.5% |
| FRLS 2.5mm sq cable x200m | INR 127/metre (highest quote) | INR 83/metre (lowest via H4E) | INR 8,800 | 34.6% |
| Sony LED Panels x2 | INR 280 for both (nearest dealer) | INR 76/each with delivery | INR 128 | 45.7% |

**Average savings across all validated deals: 25-45%.**

These are not projections. These are completed transactions where real buyers received real products at these prices through Hub4Estate's dealer matching.

## 1.5 Key Platform Metrics (Current State)

| Metric | Current Value | Target (12 months) |
|--------|---------------|---------------------|
| Active clients served | 10 | 5,000 |
| Verified dealers on platform | Manual pipeline | 500 |
| Average savings per order | 25-45% | 20-40% (at scale, margins compress slightly) |
| Inquiry-to-quote conversion | ~80% (manual) | 70% (automated) |
| Quote-to-selection conversion | ~60% (manual) | 40% (at scale) |
| Average response time (dealer) | 4-6 hours (manual) | < 30 minutes (automated) |
| Platform uptime | 99.2% | 99.9% |
| Categories covered | Electrical (single vertical) | Electrical + Plumbing + Hardware |

## 1.6 Revenue Model

Hub4Estate generates revenue exclusively from the supply side (dealers). Buyers never pay.

### Revenue Stream 1: Dealer Subscription Plans

| Plan | Monthly Fee | Features |
|------|-------------|----------|
| **Starter** | INR 999/mo | 20 leads/month, basic analytics, standard visibility |
| **Growth** | INR 2,499/mo | 75 leads/month, priority matching, advanced analytics, badge |
| **Premium** | INR 4,999/mo | Unlimited leads, featured placement, dedicated account manager, API access |
| **Enterprise** | Custom | Multi-location support, bulk pricing, white-label options |

### Revenue Stream 2: Lead Purchase Credits

For dealers who do not want subscriptions, individual lead credits:
- INR 50-200 per qualified lead (varies by category and order size)
- Credit bundles with volume discounts
- Pay-per-quote model for high-value inquiries

### Revenue Stream 3 (Future): Transaction Fee

- Optional escrow/payment processing at 1-2% for buyers who want payment protection
- Not active in Phase 1 -- Hub4Estate stays out of the payment flow initially

### Unit Economics Target

| Metric | Target |
|--------|--------|
| Customer Acquisition Cost (Buyer) | INR 50-150 (organic + referral) |
| Customer Acquisition Cost (Dealer) | INR 500-2,000 (sales team + onboarding) |
| Lifetime Value (Dealer, annual) | INR 30,000-60,000 |
| LTV/CAC Ratio (Dealer) | 15-30x |
| Gross Margin | 75-85% (software margins) |
| Contribution Margin per Lead | INR 80-150 |

## 1.7 Three-Year Vision

```
YEAR 1 (2026-2027): ELECTRICAL MARKETPLACE
--------------------------------------------
- Automate the blind matching engine end-to-end
- 500+ verified dealers across 10 cities
- 5,000 monthly active buyers
- AI parsing handles 90% of inquiries without human intervention
- Mobile app (React Native / Expo) launched
- Revenue: INR 50L-1Cr ARR

YEAR 2 (2027-2028): MULTI-VERTICAL PROCUREMENT
------------------------------------------------
- Expand to plumbing, hardware, sanitary, tiles
- 5,000+ verified dealers across 50 cities
- 50,000 monthly active buyers
- Launch RFQ system for bulk/project procurement
- Dealer analytics dashboard with demand forecasting
- B2B API for architects/interior designers to integrate
- Revenue: INR 5-10Cr ARR

YEAR 3 (2028-2029): CONSTRUCTION PROCUREMENT AI PLATFORM
---------------------------------------------------------
- Full construction material procurement (cement, steel, wood, paint)
- AI-generated BOQ (Bill of Quantities) from floor plans
- Predictive pricing engine (market rate trends, seasonal patterns)
- Logistics integration (last-mile delivery partnerships)
- Financial services (dealer credit, buyer EMI)
- 50,000+ dealers, 500,000+ buyers
- Revenue: INR 50-100Cr ARR
```

## 1.8 Current Platform Status

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend (React SPA)** | Live | Deployed on AWS Amplify, 20+ pages/views |
| **Backend (Node.js API)** | Live | Deployed on EC2 (3.110.172.191), PM2 managed |
| **Database (PostgreSQL)** | Live | AWS RDS, 40+ tables, full schema operational |
| **Authentication** | Live | Google OAuth 2.0 + JWT + OTP (phone) |
| **SSL/HTTPS** | Live | Full HSTS enforcement |
| **AI Chat Assistant** | Live | Claude API integration for buyer assistance |
| **Product Inquiry System** | Live | With AI parsing and dealer pipeline |
| **CRM System** | Live | Company, contact, outreach, meeting tracking |
| **Community Forum** | Live | Posts, comments, upvotes |
| **Knowledge Base** | Live | Articles with SEO support |
| **Dealer Onboarding** | Live | Multi-step verification flow |
| **Admin Dashboard** | Live | Full CRUD operations, audit logs |
| **Scraping System** | Built | Brand website product scraping pipeline |
| **RFQ System** | Built | Multi-item request for quotation flow |
| **Mobile App** | Planned | React Native / Expo target |

---

# Section 2 -- Vision & Mission

## 2.1 Mission Statement

> **"Democratize access to fair pricing in India's construction supply chain."**

Every person in India -- whether buying a single ceiling fan or wiring an entire building -- deserves the same pricing access that only large contractors and insiders currently have. Hub4Estate exists to make that access universal, instant, and free.

## 2.2 Vision Statement

> **"Every construction purchase in India goes through a transparent, AI-powered comparison engine."**

In 10 years, the idea of buying electrical products (or any construction material) without checking Hub4Estate should feel as absurd as booking a flight without checking prices online. We are building the infrastructure layer that makes fair pricing the default, not the exception.

## 2.3 Core Values

### Transparency

Every price is visible. Every quote is comparable. Every dealer is verified. There are no hidden fees, no secret commissions, no undisclosed relationships. The platform's architecture enforces transparency -- it is not a policy that can be bent, it is a system constraint that cannot be bypassed.

**How this manifests in product decisions:**
- Quotes are shown with full breakdowns (unit price + shipping + tax)
- Dealer performance metrics are public (response time, conversion rate)
- No sponsored/promoted listings that are disguised as organic results
- Buyer inquiry data is never sold or shared beyond the matching scope

### Trust

Trust is earned through verification, not claimed through marketing. Every dealer goes through a multi-document verification process. Every buyer interaction is protected by the blind matching engine. Trust is the infrastructure, not the brand promise.

**How this manifests in product decisions:**
- Dealer verification requires GST, PAN, shop license, brand authorization proofs
- Blind matching prevents identity-based price manipulation
- Fraud detection system flags suspicious quotes, duplicate GST numbers, spam RFQs
- Audit logs track every admin action for accountability

### Technology

Technology should reduce friction, not create it. Every AI feature exists to make the process faster, simpler, or more accurate -- never to show off. If a buyer can submit a photo of a product and get competitive quotes within minutes, that is technology serving its purpose. If it requires filling out 15 form fields, that is technology failing.

**How this manifests in product decisions:**
- Photo-based inquiry submission (upload a product image, AI identifies it)
- Smart Slip Scanner (OCR for reading product labels and bills)
- AI-parsed inquiries that auto-fill brand, model, category
- One-tap Google OAuth login (no username/password friction)

### Accessibility

The platform must work for a first-time homeowner in a tier-3 city as well as it works for an architect in Mumbai. This means: vernacular language support (future), mobile-first design, low-bandwidth optimization, and a UX that requires zero domain expertise.

**How this manifests in product decisions:**
- Mobile-responsive design as baseline (not afterthought)
- Progressive Web App capability (installable, offline-capable)
- Image-first product browsing (less text dependency)
- WhatsApp integration for dealer communication (where users already are)
- Planned: Hindi, Tamil, Telugu, Kannada, Bengali language support

## 2.4 The Blind Matching Engine Philosophy

The Blind Matching Engine is not just a feature -- it is the philosophical core of Hub4Estate. Every design decision traces back to this principle:

> **Neither buyer nor dealer should have information that allows them to exploit the other party.**

#### Why Blind Matching Works

| Without Blind Matching | With Blind Matching |
|----------------------|---------------------|
| Dealer sees buyer is a "homeowner in South Delhi" and quotes higher | Dealer sees "200 units, Philips 15W LED Panel, delivery to 110017" and quotes competitively |
| Buyer gets 50 spam calls from dealers who bought their data | Buyer gets 0 calls until they choose to reveal contact |
| Dealers compete on relationships and persistence | Dealers compete on price, quality, and delivery speed |
| Platform becomes a lead-selling business (IndiaMART model) | Platform becomes a procurement infrastructure (fundamentally different) |
| Trust erodes over time as bad actors exploit the system | Trust compounds over time as the system prevents exploitation |

#### How Blind Matching Is Implemented

```
INQUIRY CREATION PHASE:
  - Buyer submits: product specs, quantity, delivery city/pincode
  - System stores: buyer ID, contact details, full address
  - Dealers receive: product specs, quantity, delivery pincode (NOT buyer name, phone, email, address)

QUOTING PHASE:
  - Dealer submits: unit price, shipping cost, delivery timeline, notes
  - Buyer sees: all quotes ranked by price, with dealer performance scores
  - Buyer does NOT see: dealer name, phone, shop address (sees dealer ID + metrics only)

SELECTION PHASE:
  - Buyer selects a quote
  - System reveals: dealer contact to buyer, buyer contact to dealer
  - Both parties can now communicate directly
  - Transaction happens off-platform (Phase 1) or through escrow (Phase 2+)

POST-TRANSACTION:
  - Buyer can rate the dealer (1-5 stars + comment)
  - Dealer performance metrics update (conversion rate, response time)
  - AI learns from selection patterns to improve future matching
```

#### Design Constraints Enforced by Blind Matching

1. **No dealer profiles visible to buyers during quoting** -- buyers cannot research dealers before quotes arrive
2. **No buyer profiles visible to dealers ever** -- dealers see inquiry specs only
3. **No direct messaging before selection** -- communication channel opens only after selection
4. **No dealer advertising/promotion in quote listings** -- quotes are ranked by objective criteria only
5. **Dealer performance metrics are computed, not self-reported** -- response time, conversion rate are system-measured

---

# Section 3 -- Market Analysis

## 3.1 Total Addressable Market (TAM)

### India's Electrical Equipment Market

| Metric | Value | Source |
|--------|-------|--------|
| Market size (2025) | ~USD 45 billion (~INR 3.7 lakh crore) | IEEMA, Mordor Intelligence |
| Projected market size (2030) | ~USD 72 billion (~INR 6.0 lakh crore) | Grand View Research |
| CAGR (2025-2030) | 9.8% | Industry reports composite |
| Number of dealers/distributors | 500,000+ | IEEMA estimates |
| Number of manufacturers | 10,000+ | Industry census |
| B2C share (retail + individual buyers) | ~55% | Market analysis |
| B2B share (projects + contractors) | ~45% | Market analysis |

### Product Category Breakdown

| Category | Market Share | Annual Value (INR Cr) | Key Brands |
|----------|-------------|----------------------|------------|
| Wires & Cables | 28% | ~1,03,600 | Havells, Polycab, KEI, Finolex, RR Kabel |
| Switchgear & MCBs | 18% | ~66,600 | Schneider, Legrand, Havells, ABB, Siemens |
| Lighting & LEDs | 16% | ~59,200 | Philips, Syska, Wipro, Crompton, Bajaj |
| Fans & Ventilation | 12% | ~44,400 | Crompton, Havells, Orient, Usha, Bajaj |
| Industrial Equipment | 11% | ~40,700 | ABB, Siemens, Schneider, L&T |
| Home Automation | 6% | ~22,200 | Schneider, Legrand, Anchor (Panasonic) |
| Power Backup (UPS/Inverters) | 5% | ~18,500 | Luminous, Microtek, APC, V-Guard |
| Others (conduits, panels, tools) | 4% | ~14,800 | Various |

### Broader Construction Materials Market (Future TAM)

| Vertical | Market Size (INR Cr) | Expansion Timeline |
|----------|---------------------|--------------------|
| Plumbing & Sanitary | ~1,20,000 | Year 2 |
| Hardware & Fittings | ~85,000 | Year 2 |
| Tiles & Flooring | ~60,000 | Year 2-3 |
| Paints & Coatings | ~70,000 | Year 2-3 |
| Cement & Steel | ~4,50,000 | Year 3 |
| Wood & Laminates | ~55,000 | Year 3 |
| **Total Construction Materials** | **~13,00,000** | -- |

The long-term TAM for Hub4Estate (all construction materials) exceeds INR 13 lakh crore (~$155 billion).

## 3.2 Serviceable Addressable Market (SAM)

**Definition:** Organized electrical retail in the top 50 cities of India where digital procurement is feasible and dealer density supports competitive quoting.

| Filter | Reduction | Remaining Market |
|--------|-----------|-----------------|
| Total electrical market | -- | INR 3,70,000 Cr |
| Exclude industrial/heavy equipment (requires direct OEM relationships) | -30% | INR 2,59,000 Cr |
| Focus on top 50 cities (urban + peri-urban) | -45% | INR 1,42,450 Cr |
| Organized retail segment only (exclude unorganized kirana-type shops) | -35% | INR 92,593 Cr |
| **SAM** | -- | **~INR 93,000 Cr (~$11.2B)** |

### Top 50 City Segmentation

| Tier | Cities | Share of SAM | Dealer Density |
|------|--------|-------------|----------------|
| Tier 1 (Metro) | Delhi NCR, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad | 45% | Very High (200+ dealers/city) |
| Tier 1.5 (Major) | Jaipur, Lucknow, Chandigarh, Indore, Bhopal, Nagpur, Surat, Vadodara, Kochi, Coimbatore | 25% | High (100-200 dealers/city) |
| Tier 2 (Growth) | Jodhpur, Udaipur, Sri Ganganagar, Bikaner, Dehradun, Ranchi, Bhubaneswar, Vijayawada, etc. | 20% | Moderate (50-100 dealers/city) |
| Tier 3 (Emerging) | Remaining top 50 cities | 10% | Lower (20-50 dealers/city) |

## 3.3 Serviceable Obtainable Market (SOM)

**Definition:** Electrical procurement that can realistically flow through digital channels in tier 1-2 cities within 3 years, given Hub4Estate's go-to-market capacity.

| Year | Target Cities | Target Dealers | Target Buyers (Monthly) | Revenue Capture Rate | SOM (INR Cr/yr) |
|------|--------------|---------------|------------------------|---------------------|-----------------|
| Year 1 | 5-10 | 500 | 5,000 | 0.005% | 4.6 |
| Year 2 | 20-30 | 5,000 | 50,000 | 0.05% | 46.5 |
| Year 3 | 50 | 20,000 | 200,000 | 0.2% | 186.0 |

**Conservative SOM at Year 3: INR 186 Cr of facilitated GMV, yielding INR 50-100 Cr in platform revenue at 3-5% effective take rate (via subscriptions + lead fees).**

## 3.4 Competitive Landscape

### Direct Competitors

| Platform | Model | Strengths | Weaknesses | Why Hub4Estate Wins |
|----------|-------|-----------|------------|-------------------|
| **IndiaMART** | Listing + lead selling | Massive catalog (100M+ products), brand recognition, 7M+ suppliers | Sells buyer data (spam), no blind matching, no quote comparison, no verification depth | Hub4Estate: zero spam, blind matching, verified dealers, side-by-side comparison |
| **Amazon Business** | Retail e-commerce | Trusted brand, fast delivery, easy UX | Fixed pricing (no competitive bidding), limited electrical depth, no bulk negotiation | Hub4Estate: competitive quotes, dealer pricing (not retail), bulk-friendly |
| **Moglix** | Enterprise procurement | Strong B2B infrastructure, integrated supply chain, backed by Tiger Global | Enterprise-only (not for individual buyers), minimum order sizes, complex onboarding | Hub4Estate: works for anyone (1 unit or 10,000), zero minimum, instant onboarding |
| **TradeIndia** | B2B directory | Large supplier base, trade show integration | Outdated UX, lead quality issues, no AI matching, minimal verification | Hub4Estate: modern UX, AI parsing, rigorous verification, quote comparison |
| **JustDial** | Local search + lead gen | High traffic, local SEO dominance, broad categories | Sells leads indiscriminately, no quoting system, no verification, no procurement focus | Hub4Estate: purpose-built for procurement, not generic local search |

### Indirect Competitors

| Approach | Examples | Limitations |
|----------|----------|-------------|
| **WhatsApp groups** | Dealer networks, contractor groups | No structure, no comparison, no verification, trust-dependent |
| **Google Search** | "Havells dealer near me" | Returns ads + outdated listings, no pricing, no quoting |
| **Word of mouth** | Contractor referrals, family recommendations | Limited network, hidden commissions, no competition |
| **Brand websites** | Havells dealer locator, Schneider partner finder | Lists authorized dealers but no pricing, no quoting, no comparison |
| **Physical visits** | Walking into Bhagirath Palace (Delhi), Lohar Chawl (Mumbai) | Time-consuming, no price standardization, intimidating for non-professionals |

### Competitive Positioning Matrix

```
                        BUYER PROTECTION (Blind Matching / Zero Spam)
                                        ^
                                        |
                        Hub4Estate      |
                             *          |
                                        |
                                        |
   LISTING ONLY  <---------------------------------------> FULL PROCUREMENT
                                        |
            TradeIndia    IndiaMART     |        Amazon Business
                 *            *         |              *
                                        |
                    JustDial            |         Moglix
                       *                |            *
                                        |
                                        v
                        NO BUYER PROTECTION (Lead Selling / Spam)
```

**Hub4Estate occupies a unique position:** full procurement capability with maximum buyer protection. No existing platform combines blind matching + AI parsing + verified dealers + quote comparison.

## 3.5 Market Gaps Hub4Estate Fills

### Gap 1: No Blind Competitive Bidding for Electrical Products

No platform in India allows a buyer to submit product specs and receive blind, competitive quotes from multiple verified dealers. This mechanism exists for high-value enterprise procurement (SAP Ariba, Coupa) but has never been built for the INR 5,000 to INR 5,00,000 transaction range that defines most electrical purchases.

### Gap 2: No AI-Powered Inquiry Parsing

A buyer who photographs a product label should be able to get quotes within minutes. Currently, even on the most advanced platforms, buyers must manually search catalogs, select exact SKUs, and fill out detailed forms. Hub4Estate's AI layer handles:
- Image recognition (product photos, slip scanning)
- Natural language parsing ("I need 200 Philips 15W LED panels delivered to Jaipur")
- Model number identification and spec extraction
- Automatic category and brand classification

### Gap 3: No Trust Infrastructure for Electrical Dealers

IndiaMART has 7 million suppliers, but verification is minimal (pay for a "TrustSeal" badge). There is no platform where a buyer can be confident that every dealer they receive quotes from is:
- GST-registered and verified
- PAN-verified
- Physically inspected (shop photos)
- Brand-authorized (where applicable)
- Performance-tracked (response time, conversion rate, ratings)

### Gap 4: No Buyer-Centric Procurement Tool

Every existing platform is seller-centric (optimized for supplier visibility and lead generation). Hub4Estate is buyer-centric: the entire UX is designed around the buyer's journey from "I need this product" to "I got the best deal."

## 3.6 Growth Drivers

### Macro Drivers

| Driver | Impact | Timeline |
|--------|--------|----------|
| **India's real estate boom** | 70M+ new urban housing units needed by 2030 (NITI Aayog). Every unit needs electrical work. | Ongoing |
| **Smart City Mission** | 100 cities, INR 2.05 lakh crore investment. Massive smart electrical/automation procurement. | 2024-2030 |
| **PM Awas Yojana 2.0** | 1 crore new urban + 2 crore rural houses. Each requires INR 50K-2L in electrical materials. | 2024-2029 |
| **Infrastructure spending** | NIP (National Infrastructure Pipeline): INR 111 lakh crore. Electrical is 5-8% of every project. | 2020-2030 |
| **Digital India adoption** | 900M+ internet users, UPI transactions at 12B+/month. Digital procurement readiness is high. | Accelerating |
| **GST formalization** | Unorganized dealers formalizing (GST registration). Larger verified dealer pool for platforms. | Ongoing |

### Micro Drivers (Platform-Specific)

| Driver | Mechanism |
|--------|-----------|
| **Network effects** | More dealers = better prices = more buyers = more dealers (classic marketplace flywheel) |
| **Data moat** | Every inquiry, quote, and selection generates pricing intelligence that competitors cannot replicate |
| **AI improvement loop** | More inquiries = better AI parsing = less human intervention = lower cost per transaction |
| **Trust compounding** | As dealer verification database grows, barrier to entry for competitors increases |
| **Referral dynamics** | Buyers who save INR 37K on a speaker system tell friends. Organic growth is built into the value proposition |

---

# Section 4 -- Platform Architecture Overview

## 4.1 High-Level Architecture Diagram

```
+===========================================================================+
|                          CLIENT LAYER                                      |
|                                                                           |
|  +-------------------+  +-------------------+  +-------------------+      |
|  |   React SPA       |  |   Mobile PWA      |  |   Dealer Portal   |      |
|  |   (Buyer Web)     |  |   (Buyer Mobile)  |  |   (Dealer Web)    |      |
|  |                   |  |                   |  |                   |      |
|  |  React 18 + Vite  |  |  Same React SPA   |  |  Same React SPA   |      |
|  |  TypeScript        |  |  + Service Worker |  |  + Dealer Routes  |      |
|  |  Tailwind CSS      |  |  + Manifest       |  |  + Dashboard      |      |
|  |  Zustand           |  |  + Offline Cache  |  |  + Quote Mgmt     |      |
|  |  React Query       |  |                   |  |                   |      |
|  +--------+----------+  +--------+----------+  +--------+----------+      |
|           |                      |                       |                |
+===========|======================|=======================|================+
            |                      |                       |
            v                      v                       v
+===========================================================================+
|                        CDN / STATIC ASSETS                                |
|                                                                           |
|  +-------------------------------------------------------------------+   |
|  |                    AWS CloudFront                                   |   |
|  |  - React build artifacts (JS, CSS, HTML)                           |   |
|  |  - Product images (proxied from S3)                                |   |
|  |  - Brand logos, category icons                                     |   |
|  |  - Knowledge base article images                                   |   |
|  |  - Cache policy: 24h for assets, 1h for API responses              |   |
|  +-------------------------------------------------------------------+   |
+===================================|=======================================+
                                    |
                                    v
+===========================================================================+
|                     API GATEWAY / LOAD BALANCER                           |
|                                                                           |
|  +-------------------------------------------------------------------+   |
|  |                    AWS Application Load Balancer                    |   |
|  |                                                                     |   |
|  |  - SSL termination (HTTPS enforcement, HSTS)                       |   |
|  |  - Health check endpoint: /api/health                              |   |
|  |  - Rate limiting (IP-based, 100 req/min general, 10 req/min auth)  |   |
|  |  - Request routing: /api/* -> EC2 backend                          |   |
|  |  - WebSocket upgrade: /ws/* -> EC2 backend (future)                |   |
|  |  - Geographic routing (future: multi-region)                       |   |
|  +-------------------------------------------------------------------+   |
+===================================|=======================================+
                                    |
                                    v
+===========================================================================+
|                       APPLICATION LAYER                                   |
|                                                                           |
|  +-------------------------------------------------------------------+   |
|  |           Node.js + Express Server (EC2: 3.110.172.191)            |   |
|  |           Managed by PM2 (process: hub4estate-backend)             |   |
|  |                                                                     |   |
|  |  +-----------------------+  +-----------------------+               |   |
|  |  |    MIDDLEWARE STACK   |  |    ROUTE HANDLERS     |               |   |
|  |  |                       |  |                       |               |   |
|  |  |  - CORS               |  |  auth.routes          |               |   |
|  |  |  - Helmet (security)  |  |  inquiry.routes       |               |   |
|  |  |  - Rate Limiter       |  |  dealer.routes        |               |   |
|  |  |  - JWT Auth           |  |  quote.routes         |               |   |
|  |  |  - Request Validation |  |  rfq.routes           |               |   |
|  |  |  - Activity Logging   |  |  products.routes      |               |   |
|  |  |  - Error Handler      |  |  admin.routes         |               |   |
|  |  +-----------------------+  |  chat.routes          |               |   |
|  |                              |  community.routes     |               |   |
|  |  +-----------------------+  |  crm.routes           |               |   |
|  |  |   SERVICE LAYER       |  |  notification.routes  |               |   |
|  |  |                       |  |  knowledge.routes     |               |   |
|  |  |  - AI Parser Service  |  |  scraper.routes       |               |   |
|  |  |  - Email Service      |  |  slip-scanner.routes  |               |   |
|  |  |  - SMS Service        |  |  contact.routes       |               |   |
|  |  |  - OCR Service        |  |  professional.routes  |               |   |
|  |  |  - Notification Svc   |  |  brand-dealer.routes  |               |   |
|  |  |  - Token Service      |  |  inquiry-pipeline     |               |   |
|  |  |  - Dealer Matching    |  |  database.routes      |               |   |
|  |  |  - Activity Service   |  +-----------------------+               |   |
|  |  |  - Inquiry Pipeline   |                                          |   |
|  |  |  - Scraper Service    |                                          |   |
|  |  +-----------------------+                                          |   |
|  +-------------------------------------------------------------------+   |
+===================================|=======================================+
                                    |
                    +---------------+----------------+
                    |               |                |
                    v               v                v
+==================+  +============+  +=============+
|   AI/ML LAYER    |  | DATA LAYER |  | EXTERNAL    |
|                  |  |            |  | INTEGRATIONS |
|  +-----------+   |  | +--------+|  |             |
|  | Claude API|   |  | |PostgreSQL| |  +---------+|
|  | (Anthropic)|  |  | |(AWS RDS)||  | |Google   ||
|  |           |   |  | |         ||  | |OAuth 2.0||
|  | - Inquiry |   |  | |40+ tbls||  | +---------+|
|  |   parsing |   |  | |Prisma   ||  |             |
|  | - Chat    |   |  | |ORM      ||  | +---------+|
|  |   assist  |   |  | +--------+|  | |Nodemailer||
|  | - Product |   |  |            |  | |(Email)   ||
|  |   ID      |   |  | +--------+|  | +---------+|
|  | - NLP     |   |  | |Redis   ||  |             |
|  +-----------+   |  | |(future)||  | +---------+|
|                  |  | |Sessions||  | |SMS GW    ||
|  +-----------+   |  | |Cache   ||  | |(future)  ||
|  |TensorFlow |   |  | |Queues  ||  | +---------+|
|  |.js (future)|  |  | +--------+|  |             |
|  |           |   |  |            |  | +---------+|
|  | - Client  |   |  | +--------+|  | |AWS S3    ||
|  |   image   |   |  | |AWS S3  ||  | |Images    ||
|  |   recog.  |   |  | |Images  ||  | |Documents ||
|  | - Offline |   |  | |Docs    ||  | +---------+|
|  |   predict |   |  | |Slips   ||  |             |
|  +-----------+   |  | +--------+|  | +---------+|
+==================+  +============+  | |Razorpay ||
                                      | |(future) ||
                                      | +---------+|
                                      +=============+
```

## 4.2 Request Flow (Detailed)

### 4.2.1 Buyer Submits Product Inquiry

```
STEP 1: Client Request
  Browser -> POST /api/inquiries
  Headers: { Authorization: Bearer <jwt>, Content-Type: multipart/form-data }
  Body: { name, phone, email?, productPhoto?, modelNumber?, quantity, deliveryCity, notes? }

STEP 2: Middleware Pipeline
  CORS check -> Helmet headers -> Rate limit check (10/min for create) ->
  JWT verification -> Request validation (Zod schema) -> Activity logging

STEP 3: Route Handler (inquiry.routes.ts)
  - Validates required fields
  - Uploads productPhoto to S3 (if provided)
  - Creates ProductInquiry record in PostgreSQL
  - Generates inquiry number (HUB-{BRAND}-{CATEGORY}-{SEQ})

STEP 4: AI Pipeline Trigger (inquiry-pipeline.service.ts)
  - Sends product description + photo to Claude API
  - Claude returns: { brand, category, product, confidence, specs }
  - Creates InquiryPipeline record with AI analysis
  - Identifies matching dealers:
      a. Platform dealers (Dealer model) by brand + category + service area
      b. External dealers (BrandDealer model) by brand + city

STEP 5: Dealer Matching (dealer-matching.service.ts)
  - Query: SELECT dealers WHERE
      brand_mapping includes identified_brand
      AND category_mapping includes identified_category
      AND service_area includes delivery_pincode
      AND status = 'VERIFIED'
      AND profileComplete = true
    ORDER BY conversion_rate DESC, avg_response_time ASC
    LIMIT 10

STEP 6: Notification Dispatch
  - For platform dealers: in-app notification + email
  - For external dealers: WhatsApp template message (via pipeline)
  - For buyer: confirmation email + SMS

STEP 7: Response
  -> 201 Created { inquiryId, inquiryNumber, status: "new", pipelineStatus: "BRAND_IDENTIFIED" }

STEP 8: Activity Log
  - UserActivity record: PRODUCT_INQUIRY_SUBMITTED
  - Metadata: { brandIdentified, categoryIdentified, aiConfidence, dealersMatched }
```

### 4.2.2 Dealer Submits Quote

```
STEP 1: Client Request
  Dealer Portal -> POST /api/inquiries/:inquiryId/dealer-responses
  Headers: { Authorization: Bearer <dealer-jwt> }
  Body: { quotedPrice, shippingCost, estimatedDelivery, notes? }

STEP 2: Middleware Pipeline
  CORS -> Helmet -> Rate limit (20/min for dealers) ->
  JWT verify (dealer type) -> Validation -> Activity log

STEP 3: Authorization Check
  - Verify dealer.status === 'VERIFIED'
  - Verify dealer has brand/category mapping for this inquiry
  - Verify dealer service area covers delivery pincode
  - Verify dealer has not already quoted on this inquiry

STEP 4: Quote Creation
  - Create InquiryDealerResponse record
  - totalPrice = quotedPrice * quantity + shippingCost
  - Update dealer metrics: totalQuotesSubmitted++
  - Update inquiry status: "quoted" (if first quote)

STEP 5: Buyer Notification
  - Push notification (future): "New quote received for your inquiry"
  - Email: "You have a new quote for {productName}"
  - IMPORTANT: notification contains quote details but NOT dealer identity

STEP 6: Response
  -> 201 Created { responseId, status: "quoted" }
```

## 4.3 Architecture Evolution Strategy

### Current State: Modular Monolith

The current architecture is a single Node.js Express application with clear module boundaries. This is deliberate, not accidental.

```
backend/
  src/
    routes/          <-- HTTP layer (thin controllers)
      auth.routes.ts
      inquiry.routes.ts
      dealer.routes.ts
      ...
    services/        <-- Business logic (thick services)
      ai-parser.service.ts
      dealer-matching.service.ts
      email.service.ts
      ...
    middleware/       <-- Cross-cutting concerns
      auth.ts
      rateLimiter.ts
      security.ts
      validation.ts
    config/          <-- Environment & app configuration
```

**Why monolith now:**
- Team size: 1 developer (founder). Microservices add operational complexity without proportional benefit.
- Transaction volume: ~100-500 requests/day. A single EC2 instance handles this easily.
- Development speed: One repo, one deploy, one debugging context. Ship faster.
- Shared database: All modules need access to the same PostgreSQL instance. No cross-service data consistency issues.

### Target State: Modular Monolith with Event Bus (Month 6-12)

```
backend/
  src/
    modules/
      inquiry/
        inquiry.controller.ts
        inquiry.service.ts
        inquiry.repository.ts
        inquiry.events.ts        <-- Domain events
        inquiry.types.ts
      dealer/
        dealer.controller.ts
        dealer.service.ts
        dealer.repository.ts
        dealer.events.ts
        dealer.types.ts
      quote/
        ...
      notification/
        ...
      ai/
        ...
    shared/
      event-bus.ts               <-- In-process event emitter
      database.ts                <-- Prisma client singleton
      middleware/
      utils/
```

**Key change:** Introduction of an in-process event bus (Node.js EventEmitter or a library like `eventemitter3`). This decouples modules without introducing network hops:

```typescript
// inquiry.service.ts
async createInquiry(data: CreateInquiryDTO) {
  const inquiry = await this.repo.create(data);
  eventBus.emit('inquiry.created', { inquiryId: inquiry.id, ...data });
  return inquiry;
}

// notification.service.ts (listens)
eventBus.on('inquiry.created', async (event) => {
  await this.sendBuyerConfirmation(event);
  await this.notifyMatchingDealers(event);
});

// ai.service.ts (listens)
eventBus.on('inquiry.created', async (event) => {
  await this.parseAndClassify(event);
});

// activity.service.ts (listens)
eventBus.on('inquiry.created', async (event) => {
  await this.logActivity(event);
});
```

### Future State: Microservices (Month 18-24, only if needed)

Microservices are warranted only when:
1. Team grows to 5+ backend developers
2. Individual modules need independent scaling (e.g., AI service needs GPU instances)
3. Different modules need different deployment cadences
4. Monthly transaction volume exceeds 100K

```
                     +-------------------+
                     |   API Gateway     |
                     |   (Kong / AWS     |
                     |    API Gateway)   |
                     +--------+----------+
                              |
          +-------------------+-------------------+
          |                   |                   |
+---------v------+  +---------v------+  +---------v------+
| Inquiry        |  | Dealer         |  | AI/ML          |
| Service        |  | Service        |  | Service        |
| (Node.js)      |  | (Node.js)      |  | (Python/Node)  |
+-------+--------+  +-------+--------+  +-------+--------+
        |                    |                   |
        v                    v                   v
+-------+--------+  +-------+--------+  +-------+--------+
| Inquiry DB     |  | Dealer DB      |  | ML Models      |
| (PostgreSQL)   |  | (PostgreSQL)   |  | (S3 + SageMaker)|
+----------------+  +----------------+  +----------------+
        |                    |                   |
        +--------------------+-------------------+
                             |
                    +--------v----------+
                    | Message Broker    |
                    | (Redis Streams /  |
                    |  AWS SQS)         |
                    +-------------------+
```

**Migration criteria (all must be true before starting):**
- [ ] Team > 5 backend developers
- [ ] Single module causing >50% of all scaling issues
- [ ] Module deployment conflicts blocking release velocity
- [ ] Revenue justifies infrastructure cost increase (3-5x)

## 4.4 Event-Driven Architecture

### Current Event Patterns

Even in the monolith, the application follows event-driven patterns through service composition:

| Event | Trigger | Listeners |
|-------|---------|-----------|
| `inquiry.created` | Buyer submits inquiry | AI parser, dealer matcher, notification, activity log |
| `inquiry.quoted` | Dealer submits quote | Buyer notification, inquiry status update, dealer metrics |
| `inquiry.selected` | Buyer selects a quote | Contact reveal, dealer notification, conversion tracking |
| `dealer.registered` | Dealer signs up | Admin notification, verification queue, welcome email |
| `dealer.verified` | Admin verifies dealer | Dealer notification, profile activation, matching pool update |
| `rfq.published` | Buyer publishes RFQ | Dealer matching, notification broadcast |
| `user.signup` | New user registers | Welcome email, onboarding sequence, activity log |
| `chat.message` | User sends chat message | AI response, session update, token counting |

### Target Event Architecture (with Event Bus)

```
+------------------+     +-----------------+     +------------------+
|  Inquiry Module  |---->|   Event Bus     |---->| Notification Mod |
|                  |     |   (EventEmitter |     |                  |
|  emit:           |     |    or Redis     |     |  listen:         |
|  inquiry.created |     |    Pub/Sub)     |     |  inquiry.created |
|  inquiry.quoted  |     |                 |     |  inquiry.quoted  |
|  inquiry.selected|     |                 |     |  dealer.verified |
+------------------+     |                 |     +------------------+
                         |                 |
+------------------+     |                 |     +------------------+
|  Dealer Module   |---->|                 |---->|  AI Module       |
|                  |     |                 |     |                  |
|  emit:           |     |                 |     |  listen:         |
|  dealer.registered     |                 |     |  inquiry.created |
|  dealer.verified |     |                 |     |  chat.message    |
|  dealer.quoted   |     +-----------------+     +------------------+
+------------------+            |
                                |               +------------------+
                                +-------------->|  Activity Module |
                                                |                  |
                                                |  listen:         |
                                                |  * (all events)  |
                                                +------------------+
```

### Event Schema Standard

Every event follows this schema:

```typescript
interface DomainEvent<T = unknown> {
  id: string;                    // UUID v4
  type: string;                  // e.g., "inquiry.created"
  timestamp: string;             // ISO 8601
  version: number;               // Schema version (for evolution)
  source: string;                // Module that emitted (e.g., "inquiry-service")
  correlationId: string;         // Request ID for tracing
  actor: {
    type: 'user' | 'dealer' | 'admin' | 'system';
    id: string | null;
  };
  data: T;                       // Event-specific payload
  metadata?: Record<string, unknown>;
}

// Example:
{
  id: "evt_abc123",
  type: "inquiry.created",
  timestamp: "2026-04-02T10:30:00Z",
  version: 1,
  source: "inquiry-service",
  correlationId: "req_xyz789",
  actor: { type: "user", id: "usr_456" },
  data: {
    inquiryId: "inq_001",
    productDescription: "Philips 15W LED Panel",
    quantity: 200,
    deliveryCity: "Jaipur",
    deliveryPincode: "302001"
  }
}
```

## 4.5 Caching Strategy

### Current State (No Dedicated Cache)

Currently, the application does not use Redis or any dedicated cache. This is acceptable at current scale (10 active clients) but must change before scaling to 1,000+ daily active users.

### Target Caching Architecture

```
+------------------+     +------------------+     +------------------+
|   Client Layer   |---->|   Redis Cache    |---->|   PostgreSQL     |
|                  |     |   (ElastiCache)  |     |   (RDS)          |
|   React Query    |     |                  |     |                  |
|   (client cache) |     |   Layers:        |     |   Source of      |
|   - 5min stale   |     |   1. Sessions    |     |   truth for all  |
|   - background   |     |   2. API cache   |     |   persistent     |
|     refetch      |     |   3. Rate limits |     |   data           |
+------------------+     |   4. Job queues  |     +------------------+
                         +------------------+
```

### Cache Layers (in order of implementation priority)

| Layer | Technology | What is Cached | TTL | Invalidation Strategy | Priority |
|-------|-----------|---------------|-----|----------------------|----------|
| **L1: Client** | React Query | API responses, user data | 5 minutes (stale), 30 min (garbage collect) | Background refetch, manual invalidation on mutation | Already implemented |
| **L2: CDN** | CloudFront | Static assets (JS, CSS, images) | 24 hours (assets), 1 hour (images) | Deploy invalidation, versioned filenames | Partially implemented |
| **L3: API Response** | Redis | Product catalog, brand list, category tree | 15 minutes | Event-based invalidation (product.updated -> clear cache) | Month 3 |
| **L4: Session** | Redis | JWT blacklist, refresh tokens, active sessions | Session lifetime (7 days) | Explicit revocation on logout | Month 3 |
| **L5: Rate Limiting** | Redis | Request counts per IP/user | Sliding window (1 minute) | Auto-expire | Month 3 |
| **L6: Computed** | Redis | Dealer matching scores, price analytics | 1 hour | Recalculate on new quote/inquiry | Month 6 |

### Cache Key Naming Convention

```
hub4estate:{service}:{entity}:{identifier}:{variant}

Examples:
  hub4estate:catalog:brands:all:active          -- All active brands
  hub4estate:catalog:categories:all:with-subs   -- Categories with subcategories
  hub4estate:dealer:matching:pincode:302001     -- Dealers serving pincode 302001
  hub4estate:inquiry:quotes:inq_001:ranked      -- Ranked quotes for inquiry
  hub4estate:session:user:usr_456:refresh       -- Refresh token for user
  hub4estate:ratelimit:ip:203.0.113.42:minute   -- Rate limit counter
```

## 4.6 CDN Strategy

### Current State

Frontend is deployed on AWS Amplify, which includes a built-in CDN (CloudFront). Static assets are served globally with reasonable cache headers. Product images are served from the EC2 backend (via Express static file serving or S3 signed URLs).

### Target CDN Architecture

```
+---------------------------------------------------+
|               AWS CloudFront Distribution          |
|                                                    |
|  Origin 1: Amplify (Frontend)                      |
|    Path: /*                                        |
|    Cache: 24h for /assets/*, no-cache for HTML     |
|    Behavior: SPA routing (all paths -> index.html) |
|                                                    |
|  Origin 2: S3 Bucket (Media)                       |
|    Path: /media/*                                  |
|    Cache: 7 days for images, 1 day for documents   |
|    Behavior: Direct S3 access via OAI              |
|                                                    |
|  Origin 3: EC2 Backend (API)                       |
|    Path: /api/*                                    |
|    Cache: No cache (pass-through)                  |
|    Behavior: Forward all headers, cookies          |
+---------------------------------------------------+
```

### Image Optimization Pipeline (Target)

```
Upload (original) --> S3 (originals bucket)
                        |
                        v
                  Lambda@Edge / Sharp
                        |
            +-----------+-----------+
            |           |           |
            v           v           v
        Thumbnail    Medium      Full
        (150x150)   (600x400)  (1200x800)
        WebP + JPEG  WebP + JPEG WebP + JPEG
            |           |           |
            v           v           v
         S3 (processed bucket) --> CloudFront
```

## 4.7 Database Architecture

### Current Schema Statistics

| Metric | Count |
|--------|-------|
| Total models (tables) | 42 |
| User-facing models | 8 (User, ProfessionalProfile, ProfessionalDocument, OTP, SavedProduct, CommunityPost, CommunityComment, ChatSession) |
| Dealer-facing models | 7 (Dealer, DealerServiceArea, DealerReview, DealerBrandMapping, DealerCategoryMapping, Quote, QuoteItem) |
| Product/Catalog models | 5 (Category, SubCategory, ProductType, Brand, Product) |
| Inquiry/RFQ models | 8 (ProductInquiry, InquiryDealerResponse, InquiryPipeline, InquiryDealerQuote, RFQ, RFQItem, BrandDealer, Quote) |
| CRM models | 5 (CRMCompany, CRMContact, CRMOutreach, CRMMeeting, CRMPipelineStage) |
| Admin/System models | 6 (Admin, AuditLog, FraudFlag, EmailTemplate, UserActivity, Notification) |
| Scraping models | 5 (ScrapeBrand, ScrapeJob, ScrapedProduct, ScrapeMapping, ScrapeTemplate) |
| Auth models | 3 (RefreshToken, PasswordResetToken, DevicePushToken) |

### Entity Relationship Overview

```
                            +----------+
                            |   User   |
                            +----+-----+
                                 |
                 +---------------+---------------+
                 |               |               |
                 v               v               v
            +----+----+    +----+----+    +------+------+
            |   RFQ   |    |Community|    |Professional |
            +---------+    |  Post   |    |  Profile    |
            |  Items  |    +---------+    +------+------+
            |  Quotes |    |Comments |           |
            +---------+    +---------+    +------+------+
                                          |  Documents  |
                                          +-------------+

            +----------+
            |  Dealer  |
            +----+-----+
                 |
     +-----------+-----------+-----------+
     |           |           |           |
     v           v           v           v
+----+----+ +---+----+ +----+---+ +-----+------+
|Brand    | |Category| |Service | |  Inquiry   |
|Mappings | |Mappings| |Areas   | |  Dealer    |
+---------+ +--------+ +--------+ |  Response  |
                                  +-----+------+
                                        |
                                  +-----v------+
                                  |  Product   |
                                  |  Inquiry   |
                                  +-----+------+
                                        |
                                  +-----v------+
                                  |  Inquiry   |
                                  |  Pipeline  |
                                  +-----+------+
                                        |
                                  +-----v------+
                                  |  Dealer    |
                                  |  Quotes    |
                                  +------------+

            +----------+
            |  Brand   |
            +----+-----+
                 |
     +-----------+-----------+
     |           |           |
     v           v           v
+----+----+ +---+----+ +----+---+
|Products | |Dealer  | |Brand   |
|         | |Brand   | |Dealers |
|         | |Mapping | |(ext.)  |
+---------+ +--------+ +--------+

            +-----------+
            | Category  |
            +-----+-----+
                  |
                  v
            +-----+-----+
            |SubCategory|
            +-----+-----+
                  |
                  v
            +-----+-----+
            |ProductType|
            +-----+-----+
                  |
                  v
            +-----+-----+
            |  Product  |
            +-----------+
```

### Index Strategy

The schema uses targeted indexes for the most common query patterns:

| Query Pattern | Indexes Used | Frequency |
|--------------|-------------|-----------|
| Find user by email/phone/googleId | `User.email`, `User.phone`, `User.googleId` (all unique) | Every auth request |
| Find dealers by city + status | `Dealer.city`, `Dealer.status` | Every inquiry matching |
| Find dealers by brand + category + area | `DealerBrandMapping.brandId`, `DealerCategoryMapping.categoryId`, `DealerServiceArea.pincode` | Every inquiry matching |
| Find quotes for an RFQ | `Quote.rfqId`, `Quote.dealerId` | Every quote listing |
| Find inquiries by status + date | `ProductInquiry.status`, `ProductInquiry.createdAt` | Admin dashboard |
| Activity log queries | `UserActivity.actorType+actorId`, `UserActivity.activityType`, `UserActivity.createdAt` | Analytics |
| Community posts by city + date | `CommunityPost.city`, `CommunityPost.createdAt` | Feed rendering |

### Database Scaling Path

| Stage | Transaction Volume | Strategy |
|-------|-------------------|----------|
| Current | <1,000/day | Single RDS instance (db.t3.medium) |
| Month 6 | 1,000-10,000/day | Read replicas for analytics queries, connection pooling (PgBouncer) |
| Month 12 | 10,000-100,000/day | Vertical scaling (db.r6g.xlarge), table partitioning for UserActivity |
| Month 24 | 100,000-1M/day | Horizontal partitioning (by city/region), dedicated analytics DB (read replica cluster) |
| Month 36 | >1M/day | Evaluate: Citus (distributed PostgreSQL), or selective migration to purpose-built stores |

---

# Section 5 -- Technology Stack Decisions

## 5.1 Decision Framework

Every technology choice in Hub4Estate follows this evaluation framework:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Team Familiarity** | 30% | Can the current team (1 developer) ship with this today? |
| **Ecosystem Maturity** | 20% | Documentation quality, community size, library availability |
| **Scaling Path** | 20% | Can this technology serve 100x current load without rewrite? |
| **Cost** | 15% | Infrastructure cost at current and projected scale |
| **Hiring** | 15% | Can we hire developers for this technology in India? |

## 5.2 Language: TypeScript Everywhere

### Decision

TypeScript is used across the entire stack: frontend (React), backend (Node.js/Express), and shared type definitions.

### Alternatives Considered

| Language | Pros | Cons | Verdict |
|----------|------|------|---------|
| **JavaScript (no types)** | Zero setup, faster initial development | Runtime type errors, harder refactoring, worse IDE support | Rejected: Type safety is non-negotiable for a platform handling financial data (quotes, prices) |
| **Python (backend)** | Better ML ecosystem, Django/FastAPI maturity | Two-language stack, no shared types, different team skills needed | Rejected: Adding a second language increases cognitive overhead for a solo developer |
| **Go (backend)** | Performance, concurrency, compilation | Steeper learning curve, smaller web framework ecosystem, no type sharing with frontend | Rejected: Premature optimization. Node.js handles our I/O patterns well |
| **TypeScript** | Type safety, shared types, IDE autocomplete, refactoring confidence, huge ecosystem | Compilation step, type gymnastics for complex patterns | **Selected** |

### Why TypeScript Specifically

1. **Shared types between frontend and backend:** When the Prisma schema defines a `ProductInquiry`, the generated TypeScript types are usable in both the API response handler and the React component that renders it. Zero drift.

2. **Refactoring confidence:** When we change a field name in the database schema (e.g., `conversionRate` was initially called `rating`), TypeScript catches every reference across the codebase at compile time.

3. **IDE support:** VS Code + TypeScript provides autocomplete for every API response, every database query, every component prop. This is a 2-3x productivity multiplier for a solo developer.

4. **Prisma integration:** Prisma generates TypeScript types from the database schema. This means the database, API, and frontend all share the same type definitions, eliminating an entire class of bugs.

### Migration/Scaling Notes

- TypeScript is not a scaling bottleneck. The compilation step adds ~5 seconds to builds.
- If we ever need a high-performance service (e.g., real-time matching engine), we can write that specific service in Go or Rust and communicate via API/gRPC. The rest stays TypeScript.
- Target: `strict: true` in `tsconfig.json` across all packages. No `any` types in production code.

## 5.3 Frontend: React 18 + Vite

### Decision

React 18 with Vite as the build tool, deployed as a Single Page Application (SPA).

### Alternatives Considered

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Next.js** | SSR/SSG, file-based routing, API routes, Vercel ecosystem | Heavier runtime, server required for SSR, unnecessary complexity for marketplace SPA | Rejected for now. Hub4Estate does not need SSR -- our pages are behind auth or are interactive SPAs. SEO for marketing pages handled separately. |
| **Remix** | Nested routing, data loading patterns, progressive enhancement | Newer ecosystem, smaller community, learning curve | Rejected: Ecosystem maturity concern |
| **Vue 3 + Nuxt** | Simpler mental model, good docs | Smaller ecosystem than React, fewer component libraries, harder to hire | Rejected: React dominates Indian hiring market |
| **Angular** | Enterprise-grade, opinionated structure, RxJS | Verbose, steep learning curve, heavier bundle | Rejected: Too heavyweight for our needs |
| **React 18 + Vite** | Fastest dev server (ESM), simple config, huge ecosystem, concurrent rendering | No SSR by default (not needed), no file-based routing (we use react-router) | **Selected** |

### Why Not Next.js (Detailed Reasoning)

This is the most common question, so here is the detailed reasoning:

1. **SPA is sufficient:** Hub4Estate is a logged-in application. The homepage/marketing pages are static HTML files (e.g., `hub4estate-investor.html`). The platform itself (inquiry submission, dealer dashboard, admin panel, quote comparison) is entirely behind authentication. SSR provides no benefit for authenticated content.

2. **Simpler deployment:** An SPA is a folder of static files. Deploy to Amplify/CloudFront/S3 and it is globally available. Next.js requires a Node.js server (or serverless functions) for SSR, adding infrastructure complexity.

3. **Vite is faster:** Vite's dev server starts in <1 second (ESM-based hot module replacement). Next.js dev server takes 3-5 seconds with the same codebase. For a solo developer making 100+ daily code changes, this adds up.

4. **Future migration path:** If SEO becomes critical (e.g., public product pages, dealer profiles), we can either: (a) add `vite-plugin-ssr` for selective SSR, or (b) migrate to Next.js. The React component code is 95% portable.

### Frontend Sub-Decisions

| Technology | Role | Why Chosen | Alternative |
|-----------|------|-----------|-------------|
| **Tailwind CSS** | Styling | Utility-first = rapid iteration, no CSS file management, consistent design tokens, purged CSS = tiny bundles | Styled Components (runtime overhead), CSS Modules (more files, slower iteration), MUI (opinionated design, large bundle) |
| **Zustand** | Client State | Simple API (3 lines for a store), no boilerplate, no providers, TypeScript-native | Redux Toolkit (too much boilerplate for our scale), Jotai (atomic model is overkill), Context API (re-render issues at scale) |
| **React Query (TanStack Query)** | Server State | Automatic caching, background refetching, stale-while-revalidate, optimistic updates, request deduplication | SWR (less features), custom fetch hooks (reinventing the wheel), Redux Toolkit Query (tied to Redux) |
| **React Router v6** | Routing | Standard React routing, nested routes, loader patterns | Next.js file routing (would require framework change), TanStack Router (newer, less mature) |
| **Lucide React** | Icons | Tree-shakeable, consistent design, lightweight, MIT licensed | Heroicons (fewer icons), Font Awesome (heavier, licensing), Material Icons (tied to Material Design) |
| **Zod** | Validation | TypeScript-first schema validation, shared between frontend and API | Yup (less TypeScript-native), Joi (Node.js focused), class-validator (decorator-based, heavier) |
| **date-fns** | Date Handling | Tree-shakeable, immutable, comprehensive | Moment.js (deprecated, massive bundle), Day.js (missing some features), Luxon (heavier) |

### Frontend Architecture

```
frontend/src/
  |
  +-- pages/               # Route-level components (1 per route)
  |   +-- HomePage.tsx
  |   +-- ContactPage.tsx
  |   +-- admin/           # Admin dashboard pages
  |   +-- dealer/          # Dealer portal pages
  |   +-- auth/            # Authentication pages
  |   +-- products/        # Product browsing pages
  |   +-- rfq/             # RFQ flow pages
  |   +-- community/       # Community pages
  |   +-- knowledge/       # Knowledge base pages
  |   +-- professional/    # Professional profile pages
  |   +-- user/            # User account pages
  |
  +-- components/          # Reusable UI components
  |   +-- common/          # Buttons, inputs, modals, etc.
  |   +-- layouts/         # Page layouts, navigation
  |   +-- ui/              # Design system primitives
  |   +-- Layout.tsx       # Main app layout (sidebar, header)
  |   +-- ProtectedRoute.tsx
  |   +-- AuthProvider.tsx
  |
  +-- hooks/               # Custom React hooks
  +-- contexts/            # React contexts (auth, theme)
  +-- lib/                 # Utility functions, API client
  +-- i18n/                # Internationalization (future)
  +-- index.css            # Tailwind imports + global styles
  +-- main.tsx             # App entry point
  +-- App.tsx              # Router configuration
```

### Bundle Size Targets

| Metric | Current | Target | Strategy |
|--------|---------|--------|----------|
| Initial JS bundle | ~350KB gzipped | <200KB gzipped | Code splitting by route, lazy loading |
| Largest chunk | ~150KB | <100KB | Dynamic imports for admin/dealer dashboards |
| First Contentful Paint | ~1.8s | <1.2s | Preload critical CSS, defer non-essential JS |
| Time to Interactive | ~3.5s | <2.5s | Service worker caching, skeleton screens |
| Lighthouse Performance | ~75 | >90 | Image optimization, font subsetting, tree shaking |

## 5.4 Backend: Node.js + Express

### Decision

Node.js 18+ runtime with Express.js as the HTTP framework, TypeScript compiled.

### Alternatives Considered

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Fastify** | Faster than Express (2-3x), schema-based validation, built-in serialization | Smaller ecosystem, different middleware model, less community support | Considered for future migration if performance becomes bottleneck |
| **NestJS** | Opinionated structure, dependency injection, decorators, Angular-like architecture | Heavy abstraction, steep learning curve, verbose for simple APIs | Rejected: Too much ceremony for a solo developer. The abstraction overhead slows down iteration. |
| **Hono** | Ultra-lightweight, edge-ready, multi-runtime (Bun, Deno, Node, Cloudflare Workers) | Very new, smaller ecosystem, fewer middleware options | Watch list for future edge deployment |
| **Django (Python)** | Batteries-included, admin panel, ORM, auth | Different language, no type sharing with frontend | Rejected: Two-language penalty |
| **Express.js** | Massive ecosystem (60K+ npm packages), universal knowledge, minimal opinions, battle-tested | Callback patterns (mitigated by async/await), no built-in validation | **Selected** |

### Why Express Specifically

1. **Ecosystem:** For every need (rate limiting, CORS, file upload, JWT, validation), there is a mature Express middleware. We do not reinvent wheels.

2. **Team familiarity:** Express is the default Node.js framework. Any JavaScript developer hired in India knows Express. Zero onboarding friction.

3. **Async I/O:** Hub4Estate is an API-heavy application (calls to Claude API, email services, SMS gateways, database). Node.js's event loop handles concurrent I/O efficiently without thread management.

4. **Middleware composition:** The request pipeline (CORS -> Security -> Rate Limit -> Auth -> Validation -> Handler -> Error) maps naturally to Express middleware. Each concern is a separate, testable module.

### Backend Middleware Stack (Execution Order)

```
REQUEST
  |
  v
[1] CORS (cors) ................ Allow frontend origins, handle preflight
  |
  v
[2] Helmet (helmet) ............ Security headers (CSP, HSTS, X-Frame, etc.)
  |
  v
[3] Body Parser (express.json).. Parse JSON request bodies (limit: 10MB)
  |
  v
[4] Rate Limiter (custom) ..... IP-based rate limiting per endpoint
  |                             - General: 100 req/min
  |                             - Auth: 10 req/min
  |                             - Inquiry create: 5 req/min
  |
  v
[5] Auth (custom JWT) ......... Verify JWT token, attach user/dealer to req
  |                             - Supports: Bearer token, cookie
  |                             - User types: user, dealer, admin
  |
  v
[6] Validation (Zod) .......... Validate request body/params/query
  |                             - Schema-based, TypeScript-inferred
  |
  v
[7] Route Handler ............. Business logic execution
  |
  v
[8] Activity Logger ........... Log user activity (async, non-blocking)
  |
  v
[9] Error Handler ............. Catch errors, format response, log to Sentry
  |
  v
RESPONSE
```

### Service Layer Architecture

| Service | Responsibility | External Dependencies |
|---------|---------------|----------------------|
| `ai-parser.service.ts` | Parse inquiry text/images using Claude API, extract brand/model/specs | Anthropic Claude API |
| `ai.service.ts` | General AI operations (chat assistant, product recommendations) | Anthropic Claude API |
| `dealer-matching.service.ts` | Find dealers matching inquiry criteria (brand, category, service area) | PostgreSQL |
| `email.service.ts` | Send transactional emails (confirmation, notifications, outreach) | Nodemailer (SMTP) |
| `sms.service.ts` | Send OTP and notification SMS | SMS gateway API |
| `ocr.service.ts` | Optical character recognition for product slips and labels | Tesseract.js / Claude Vision |
| `notification.service.ts` | Manage in-app and push notifications | PostgreSQL, Expo Push |
| `token.service.ts` | JWT generation, refresh token management, blacklisting | PostgreSQL |
| `activity.service.ts` | Log all user/dealer/admin activities for analytics | PostgreSQL |
| `inquiry-pipeline.service.ts` | Orchestrate the inquiry lifecycle (parse -> match -> quote -> select) | Multiple services |
| `scraper/` | Scrape brand websites for product catalog data | Puppeteer/Cheerio |

## 5.5 Database: PostgreSQL

### Decision

PostgreSQL 15+ on AWS RDS, accessed through Prisma ORM.

### Alternatives Considered

| Database | Pros | Cons | Verdict |
|----------|------|------|---------|
| **MongoDB** | Flexible schema, JSON-native, easy horizontal scaling | No ACID transactions (by default), no JOINs (manual population), data duplication, eventual consistency | Rejected: Hub4Estate has strong relational data (users -> inquiries -> quotes -> dealers). MongoDB would require data duplication and sacrifice consistency. |
| **MySQL** | Widely used, good performance, AWS Aurora compatible | Weaker JSON support, fewer advanced features (no JSONB, limited full-text), licensing concerns | Rejected: PostgreSQL is strictly superior for our use case |
| **CockroachDB** | Distributed PostgreSQL, auto-scaling, geo-partitioning | Expensive at small scale, Prisma compatibility gaps, operational complexity | Watch list for Year 3 multi-region deployment |
| **Supabase** | PostgreSQL + auth + storage + real-time, generous free tier | Vendor lock-in for auth/storage, performance ceiling, less control | Considered but rejected: Need full control over schema, auth, and deployment |
| **PostgreSQL** | ACID compliance, JSONB for flexible data, full-text search, PostGIS for geo, mature ecosystem, Prisma native support | Requires more operational knowledge than managed NoSQL | **Selected** |

### Why PostgreSQL Specifically

1. **Relational integrity:** The core data model is deeply relational. A Quote belongs to an RFQ and a Dealer. An RFQ belongs to a User and contains Items linked to Products. Products belong to Brands and ProductTypes. Foreign keys and cascading deletes prevent orphaned data.

2. **ACID transactions:** When a buyer selects a quote, the system must atomically: (a) update quote status, (b) update inquiry status, (c) reveal contact information, (d) notify both parties, (e) update dealer metrics. PostgreSQL transactions guarantee all-or-nothing.

3. **JSONB for flexibility:** Fields like `specifications` (Product), `aiSuggestions` (RFQ), `aiAnalysis` (InquiryPipeline), and `metadata` (UserActivity) store semi-structured JSON data. PostgreSQL's JSONB type allows querying into these JSON fields with indexes.

4. **Full-text search:** Product search, knowledge base search, and community post search use PostgreSQL's built-in `tsvector`/`tsquery` full-text search. This eliminates the need for a separate search engine at current scale.

5. **PostGIS (future):** When we add geographic features (find nearest dealer, delivery radius, service area mapping), PostGIS provides spatial indexing and distance calculations natively. No additional infrastructure.

6. **Prisma compatibility:** Prisma has first-class PostgreSQL support with the most complete feature set (enums, arrays, JSON fields, composite types, raw queries).

### Prisma ORM Decision

| ORM | Pros | Cons | Verdict |
|-----|------|------|---------|
| **Knex.js** | Query builder (not full ORM), flexible, raw SQL when needed | No type generation, manual migrations, no relation management | Rejected: Prisma's type safety is worth the abstraction |
| **TypeORM** | Decorator-based, supports Active Record and Data Mapper, mature | Decorator approach feels heavy, migration issues reported, performance concerns | Rejected: Prisma is simpler and more TypeScript-native |
| **Drizzle ORM** | Lightweight, SQL-like syntax, great TypeScript support, no code generation | Newer, smaller ecosystem, fewer learning resources | Watch list. Drizzle is a strong contender if Prisma limitations become blockers |
| **Raw SQL (pg driver)** | Maximum control, no abstraction overhead | No type safety, no migration management, more code for basic operations | Rejected: Development speed penalty is too high |
| **Prisma** | Generated TypeScript types from schema, declarative migrations, intuitive API, excellent docs | N+1 query risk (mitigated with `include`), some raw SQL needed for complex queries, build step | **Selected** |

### Prisma-Specific Benefits in Our Codebase

```typescript
// Type-safe query with relations -- generated from schema.prisma
const inquiry = await prisma.productInquiry.findUnique({
  where: { id: inquiryId },
  include: {
    pipeline: {
      include: {
        dealerQuotes: {
          include: { brandDealer: true }
        }
      }
    },
    dealerResponses: {
      include: { dealer: true },
      where: { status: 'quoted' },
      orderBy: { totalPrice: 'asc' }
    },
    category: true,
    identifiedBrand: true
  }
});
// TypeScript knows the exact shape of `inquiry` including all nested relations
```

## 5.6 Authentication: Multi-Strategy Auth

### Decision

Three authentication strategies, unified through JWT:

| Strategy | Use Case | Implementation |
|----------|----------|---------------|
| **Google OAuth 2.0** | Primary login for buyers | Passport.js + Google strategy -> JWT |
| **Email + Password** | Dealer registration and login | bcrypt hashing -> JWT |
| **OTP (Phone)** | Phone verification, future: primary login | 6-digit OTP via SMS -> JWT |

### Auth Flow Architecture

```
+-------------------+     +-------------------+     +-------------------+
|   Google OAuth    |     |  Email/Password   |     |   Phone OTP       |
|                   |     |                   |     |                   |
| 1. Redirect to   |     | 1. POST /login    |     | 1. POST /otp/send |
|    Google         |     |    {email, pass}  |     |    {phone}        |
| 2. Google returns |     | 2. Verify bcrypt  |     | 2. Generate 6-dig |
|    auth code      |     | 3. Generate JWT   |     | 3. SMS to phone   |
| 3. Exchange for   |     |                   |     | 4. POST /otp/     |
|    profile        |     |                   |     |    verify          |
| 4. Find/create    |     |                   |     |    {phone, code}  |
|    user           |     |                   |     | 5. Generate JWT   |
| 5. Generate JWT   |     |                   |     |                   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                          |
         v                         v                          v
+--------+-------------------------+---------------------------+---------+
|                          JWT Token Pair                                  |
|                                                                         |
|  Access Token:                    Refresh Token:                        |
|  - Short-lived (15 min)          - Long-lived (7 days)                  |
|  - Contains: userId, userType,   - Stored in DB (RefreshToken model)    |
|    email, role                   - Rotated on each use                  |
|  - Stored: memory (frontend)     - Stored: httpOnly cookie              |
|  - Verified: every API request   - Used: when access token expires      |
+-------------------------------------------------------------------------+
```

### Token Security Measures

| Measure | Implementation | Purpose |
|---------|---------------|---------|
| Short access token TTL | 15 minutes | Limits exposure if token is stolen |
| Refresh token rotation | New refresh token issued on each refresh | Detects token theft (old token used = compromise) |
| Refresh token in httpOnly cookie | Cannot be accessed by JavaScript | Prevents XSS-based token theft |
| JWT blacklist (Redis, future) | Revoked tokens checked on each request | Immediate logout capability |
| Rate limiting on auth endpoints | 10 requests/minute per IP | Brute force prevention |
| OTP attempt limiting | Max 3 attempts, then regenerate | OTP brute force prevention |
| OTP expiry | 10 minutes | Time-boxed validity |

## 5.7 Storage: AWS S3

### Decision

AWS S3 for all file storage (product images, dealer documents, slip scans, brand logos).

### S3 Bucket Structure

```
hub4estate-media/
  |
  +-- dealer-documents/
  |   +-- {dealerId}/
  |       +-- gst-certificate.pdf
  |       +-- pan-card.pdf
  |       +-- shop-license.pdf
  |       +-- cancelled-cheque.pdf
  |       +-- shop-photos/
  |           +-- photo-1.jpg
  |           +-- photo-2.jpg
  |
  +-- product-images/
  |   +-- {productId}/
  |       +-- main.jpg
  |       +-- thumbnail.jpg
  |       +-- gallery-1.jpg
  |
  +-- inquiry-uploads/
  |   +-- {inquiryId}/
  |       +-- product-photo.jpg
  |       +-- slip-scan.jpg
  |
  +-- brand-logos/
  |   +-- {brandSlug}.png
  |
  +-- knowledge-articles/
  |   +-- {articleSlug}/
  |       +-- cover.jpg
  |       +-- inline-images/
  |
  +-- professional-documents/
      +-- {profileId}/
          +-- coa-certificate.pdf
          +-- portfolio.pdf
```

### Access Patterns

| Pattern | Method | Use Case |
|---------|--------|----------|
| **Public read** | CloudFront + S3 OAI | Product images, brand logos, article images |
| **Authenticated read** | Pre-signed URL (1h expiry) | Dealer documents, inquiry uploads, slip scans |
| **Upload** | Pre-signed PUT URL (15min expiry) | All file uploads from frontend |
| **Admin access** | IAM role | Full CRUD on all buckets |

## 5.8 Hosting: AWS

### Decision

Full AWS hosting stack, chosen for reliability, Indian region availability (Mumbai: ap-south-1), and ecosystem integration.

### Current Infrastructure

| Component | AWS Service | Instance/Tier | Monthly Cost (Est.) |
|-----------|------------|---------------|-------------------|
| **Frontend** | Amplify | Build + CDN | ~$0 (free tier) |
| **Backend** | EC2 | t3.small (2 vCPU, 2GB RAM) | ~$15/month |
| **Database** | RDS PostgreSQL | db.t3.micro (1 vCPU, 1GB RAM) | ~$15/month |
| **Storage** | S3 | Standard | ~$2/month |
| **DNS** | Route 53 | Hosted zone | ~$0.50/month |
| **SSL** | ACM | Free certificate | $0 |
| **Total** | -- | -- | **~$33/month** |

### Target Infrastructure (Month 12)

| Component | AWS Service | Instance/Tier | Monthly Cost (Est.) |
|-----------|------------|---------------|-------------------|
| **Frontend** | Amplify + CloudFront | Build + Global CDN | ~$20/month |
| **Backend** | EC2 (x2) + ALB | t3.medium (2 vCPU, 4GB) x2 | ~$80/month |
| **Database** | RDS PostgreSQL | db.t3.medium + read replica | ~$60/month |
| **Cache** | ElastiCache Redis | cache.t3.micro | ~$15/month |
| **Storage** | S3 + CloudFront | Standard + CDN | ~$10/month |
| **Queue** | SQS | Standard queue | ~$1/month |
| **Monitoring** | CloudWatch + Sentry | Enhanced monitoring | ~$20/month |
| **DNS + SSL** | Route 53 + ACM | -- | ~$1/month |
| **Total** | -- | -- | **~$207/month** |

### Deployment Pipeline

#### Frontend (Current)

```
Developer pushes to GitHub (main branch)
        |
        v
AWS Amplify detects push (webhook)
        |
        v
Amplify runs build:
  preBuild: npm install --ignore-scripts (root)
  build: cd frontend && npm run build
  artifacts: frontend/dist/**/*
        |
        v
Amplify deploys to CloudFront CDN
        |
        v
Live at hub4estate.com (< 3 minutes total)
```

#### Backend (Current -- Manual)

```
Developer builds locally:
  cd backend && npm run build
        |
        v
SCP to EC2:
  scp -r dist/ ec2-user@3.110.172.191:/var/www/hub4estate/backend/
        |
        v
SSH into EC2:
  cd /var/www/hub4estate/backend
  npm run build
  pm2 restart hub4estate-backend --update-env
        |
        v
Live at api.hub4estate.com (< 5 minutes total)
```

#### Backend (Target -- Automated via GitHub Actions)

```
Developer pushes to GitHub (main branch)
        |
        v
GitHub Actions workflow triggered:
  1. Run TypeScript compilation (type check)
  2. Run tests (unit + integration)
  3. Build Docker image (or bare build)
  4. SCP to EC2 (or ECR + ECS)
  5. SSH: pm2 reload hub4estate-backend
  6. Health check: curl https://api.hub4estate.com/api/health
  7. Notify Slack/Discord on success/failure
        |
        v
Live at api.hub4estate.com (< 5 minutes total)
```

## 5.9 AI/ML: Claude API + Future Custom Models

### Decision

Anthropic's Claude API as the primary AI engine, with a path toward custom models for specialized tasks.

### Current AI Capabilities

| Capability | Model | Use Case | Input | Output |
|-----------|-------|----------|-------|--------|
| **Inquiry Parsing** | Claude 3.5 Sonnet | Extract brand, model, specs from text/image | "I need 200 Philips 15W LED panels" | `{ brand: "Philips", product: "LED Panel", wattage: "15W", quantity: 200, confidence: 0.95 }` |
| **Chat Assistant** | Claude 3.5 Sonnet | Answer buyer questions about products, process | "What's the difference between FRLS and PVC wire?" | Detailed, context-aware explanation |
| **Product Identification** | Claude 3.5 Sonnet (Vision) | Identify product from photo | Product image upload | `{ brand, model, category, specs }` |
| **Slip/Label OCR** | Claude 3.5 Sonnet (Vision) | Read text from product labels, bills | Slip/label image | Structured text extraction |
| **WhatsApp Template** | Claude 3.5 Sonnet | Generate dealer outreach messages | Inquiry details + dealer context | Professional WhatsApp message |

### AI Integration Architecture

```
+-------------------+
| Client Request    |
| (inquiry/chat/OCR)|
+--------+----------+
         |
         v
+--------+----------+
| AI Service Layer  |
| (ai.service.ts /  |
| ai-parser.service)|
|                   |
| - Prompt template |
|   selection       |
| - Context assembly|
| - Token counting  |
| - Response parsing|
| - Error handling  |
| - Retry logic     |
+--------+----------+
         |
         v
+--------+----------+
| Anthropic Claude  |
| API               |
|                   |
| Model: claude-3-5-|
|   sonnet          |
| Max tokens: 4096  |
| Temperature: 0.3  |
|   (parsing) /     |
|   0.7 (chat)      |
+--------+----------+
         |
         v
+--------+----------+
| Response Pipeline |
|                   |
| - JSON extraction |
| - Confidence score|
|   validation      |
| - Fallback to     |
|   human review if |
|   confidence < 0.7|
| - Cache result    |
| - Log token usage |
+-------------------+
```

### AI Cost Management

| Metric | Current | Target (at scale) |
|--------|---------|------------------|
| Avg tokens per inquiry parse | ~800 input + 200 output | Reduce to 500+150 with prompt optimization |
| Avg tokens per chat message | ~1,200 input + 400 output | Cap context window at 8K tokens |
| Monthly API cost (current) | ~$5 (10 clients) | Budget: $500/month at 5K inquiries/month |
| Cost per inquiry parse | ~$0.005 | Target: $0.003 with caching + prompt optimization |
| Cost per chat session | ~$0.02 (5 messages avg) | Target: $0.015 |

### Future AI Roadmap

| Phase | Capability | Technology | Timeline |
|-------|-----------|-----------|----------|
| Phase 1 (current) | Inquiry parsing, chat, OCR | Claude API | Now |
| Phase 2 | Product image recognition (client-side) | TensorFlow.js + custom model | Month 6 |
| Phase 3 | Price prediction (fair market value estimation) | Custom ML model (Python) | Month 9 |
| Phase 4 | Demand forecasting for dealers | Time-series model (Prophet/custom) | Month 12 |
| Phase 5 | BOQ generation from floor plans | Claude Vision + custom pipeline | Month 18 |
| Phase 6 | Automated dealer quality scoring | Custom model from platform data | Month 12 |

## 5.10 Real-Time: Socket.io (Future)

### Decision

Socket.io for real-time features, backed by Redis Pub/Sub for multi-instance support.

### Current State

No real-time features are implemented. All interactions are request-response (HTTP).

### Target Real-Time Features

| Feature | Priority | Description | Socket Event |
|---------|----------|-------------|-------------|
| **Quote notifications** | P0 | Buyer sees new quote instantly (no page refresh) | `quote:new` |
| **Inquiry status updates** | P0 | Dealer sees inquiry pipeline status changes live | `inquiry:status` |
| **Chat (buyer-dealer)** | P1 | Real-time messaging after quote selection | `chat:message` |
| **Admin dashboard live feed** | P1 | New inquiries, dealer registrations appear live | `admin:feed` |
| **Typing indicators** | P2 | "Dealer is typing..." in chat | `chat:typing` |
| **Online status** | P2 | Show which dealers are currently online | `presence:update` |

### Socket.io Architecture (Target)

```
+------------------+     +------------------+     +------------------+
|   Client 1       |     |   Client 2       |     |   Client N       |
|   (Buyer)        |     |   (Dealer)       |     |   (Admin)        |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                         |
         |   WebSocket (wss://)   |                         |
         v                        v                         v
+--------+------------------------+-------------------------+---------+
|                    Socket.io Server (Node.js)                       |
|                                                                     |
|  Namespaces:                                                        |
|    /buyer     - Buyer-specific events (quotes, status)              |
|    /dealer    - Dealer-specific events (inquiries, pipeline)        |
|    /admin     - Admin-specific events (dashboard feed)              |
|    /chat      - Chat messages (buyer <-> dealer)                    |
|                                                                     |
|  Auth: JWT token verified on connection handshake                   |
|  Rooms: Per-inquiry rooms, per-user rooms, per-city rooms           |
+---------------------+-------------------------------------------+--+
                       |                                           |
                       v                                           v
              +--------+--------+                        +---------+-------+
              |   Redis Pub/Sub |                        |   PostgreSQL    |
              |   (ElastiCache) |                        |   (persist)     |
              |                 |                        |                 |
              | - Cross-instance|                        | - Chat messages |
              |   event routing |                        | - Notifications |
              | - Presence data |                        | - Activity logs |
              +-----------------+                        +-----------------+
```

## 5.11 Search: PostgreSQL Full-Text -> Elasticsearch

### Decision

PostgreSQL full-text search for now; Elasticsearch when query volume or complexity requires it.

### Current Search Capabilities

| Search Type | Implementation | Use Case |
|-------------|---------------|----------|
| **Product search** | `ILIKE '%term%'` + Prisma filters | Search by product name, model number, brand |
| **Dealer search** | `WHERE city ILIKE` + status filters | Admin searching for dealers |
| **Knowledge search** | `ILIKE` on title + content | Knowledge base article search |
| **Community search** | `ILIKE` on title + content + tags | Community post search |

### Target: PostgreSQL Full-Text Search (Month 3)

```sql
-- Add tsvector columns
ALTER TABLE "Product" ADD COLUMN search_vector tsvector;

-- Create GIN index
CREATE INDEX product_search_idx ON "Product" USING GIN(search_vector);

-- Update trigger
CREATE TRIGGER product_search_update
  BEFORE INSERT OR UPDATE ON "Product"
  FOR EACH ROW EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description);

-- Query
SELECT * FROM "Product"
WHERE search_vector @@ plainto_tsquery('english', 'philips 15w led panel')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'philips 15w led panel')) DESC;
```

### Target: Elasticsearch (Month 12-18, only if needed)

Migration criteria:
- Search queries exceed 10,000/day
- Users need faceted search (filter by brand + category + price range + specs simultaneously)
- Fuzzy matching and autocomplete become critical (typo tolerance: "havels" -> "Havells")
- Need search analytics (what are people searching for, zero-result queries)

## 5.12 Monitoring: Multi-Layer Observability

### Current State

| Layer | Tool | Status |
|-------|------|--------|
| Process management | PM2 | Active -- monitors Node.js process, auto-restart on crash |
| Infrastructure | AWS CloudWatch | Basic -- CPU, memory, disk, network metrics |
| Error tracking | Console logs | Manual -- checking logs via SSH |
| Uptime monitoring | Custom health check script (`check-hub4estate.sh`) | Semi-automated |

### Target Monitoring Stack

```
+-----------------------------------------------------------------+
|                    MONITORING ARCHITECTURE                        |
|                                                                  |
|  +------------------+  +------------------+  +----------------+  |
|  | APPLICATION      |  | INFRASTRUCTURE   |  | BUSINESS       |  |
|  | MONITORING       |  | MONITORING       |  | MONITORING     |  |
|  |                  |  |                  |  |                |  |
|  | Sentry           |  | CloudWatch       |  | Custom         |  |
|  | - Error tracking |  | - CPU/Memory     |  | Dashboard      |  |
|  | - Performance    |  | - Disk/Network   |  |                |  |
|  | - Session replay |  | - RDS metrics    |  | - Inquiries/day|  |
|  | - Release health |  | - ALB metrics    |  | - Quotes/day   |  |
|  |                  |  | - S3 metrics     |  | - Conversion   |  |
|  | PM2              |  |                  |  |   rate         |  |
|  | - Process health |  | Uptime Robot     |  | - Revenue      |  |
|  | - Memory usage   |  | - Endpoint ping  |  | - Dealer       |  |
|  | - Restart count  |  | - SSL expiry     |  |   activity     |  |
|  | - Log management |  | - Alert on down  |  | - AI accuracy  |  |
|  +------------------+  +------------------+  +----------------+  |
|                                                                  |
|  ALERTING:                                                       |
|  - Sentry: Slack notification on new/regressed errors            |
|  - CloudWatch: SMS/email on CPU > 80%, disk > 90%                |
|  - Uptime Robot: SMS on downtime                                 |
|  - Custom: Daily email summary of business metrics               |
+-----------------------------------------------------------------+
```

### Implementation Priority

| Tool | Priority | Monthly Cost | Timeline |
|------|----------|-------------|----------|
| **Sentry** (free tier) | P0 | $0 (5K errors/month) | Month 1 |
| **Uptime Robot** (free tier) | P0 | $0 (50 monitors) | Month 1 |
| **CloudWatch enhanced** | P1 | ~$10/month | Month 2 |
| **PM2 Plus** (monitoring dashboard) | P2 | $0 (free tier) | Month 3 |
| **Datadog** (full observability) | P3 | ~$100/month | Month 12 (when revenue justifies) |

## 5.13 CI/CD: GitHub-Centric Pipeline

### Current State

| Component | CI/CD | Process |
|-----------|-------|---------|
| Frontend | Automated | GitHub push -> Amplify auto-build + deploy |
| Backend | Manual | Local build -> SCP to EC2 -> PM2 restart |

### Target: GitHub Actions Pipeline

```yaml
# .github/workflows/backend-deploy.yml (target)
name: Backend Deploy

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd backend && npm ci
      - run: cd backend && npm run type-check   # tsc --noEmit
      - run: cd backend && npm test             # Jest unit tests

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd backend && npm ci && npm run build
      - name: Deploy to EC2
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "backend/dist/"
          target: "/var/www/hub4estate/"
      - name: Restart PM2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/hub4estate/backend
            npm ci --production
            pm2 reload hub4estate-backend --update-env
      - name: Health Check
        run: |
          sleep 10
          curl -f https://api.hub4estate.com/api/health || exit 1
```

### CI/CD Maturity Roadmap

| Level | Description | Timeline |
|-------|------------|----------|
| **L0 (Current)** | Manual backend deploy, auto frontend deploy | Now |
| **L1** | GitHub Actions for backend: test + deploy | Month 1 |
| **L2** | Add Sentry release tracking, deploy notifications | Month 2 |
| **L3** | Staging environment, PR preview deployments | Month 4 |
| **L4** | Docker containerization, blue-green deploys | Month 8 |
| **L5** | Full GitOps: Terraform for infrastructure, ArgoCD for deployment | Month 18 |

---

# Appendix A -- Glossary

| Term | Definition |
|------|-----------|
| **Blind Matching** | Hub4Estate's core mechanism where buyer and dealer identities are hidden from each other until the buyer selects a quote |
| **RFQ** | Request for Quotation -- a formal request from a buyer for quotes on specific products |
| **Inquiry** | A product inquiry submitted by a buyer (can be text, image, or model number) |
| **Pipeline** | The automated workflow that processes an inquiry from submission to quote delivery |
| **Dealer Matching** | The algorithm that selects which dealers receive a given inquiry based on brand, category, and service area |
| **Quote** | A price offer from a dealer in response to an inquiry or RFQ |
| **Lead** | A qualified buyer inquiry that has been delivered to a dealer |
| **Conversion** | When a buyer selects a dealer's quote and contact is revealed |
| **GMV** | Gross Merchandise Value -- total value of transactions facilitated through the platform |
| **Take Rate** | Percentage of GMV captured as platform revenue |
| **BME** | Blind Matching Engine -- the system that manages identity concealment during quoting |
| **FRLS** | Flame Retardant Low Smoke -- a type of electrical wire/cable |
| **MCB** | Miniature Circuit Breaker -- a common electrical protection device |
| **BOQ** | Bill of Quantities -- a detailed list of materials needed for a construction project |
| **OAI** | Origin Access Identity -- AWS mechanism for CloudFront to access S3 privately |
| **HSTS** | HTTP Strict Transport Security -- forces HTTPS connections |
| **PostGIS** | PostgreSQL extension for geographic/spatial data |
| **PgBouncer** | Connection pooler for PostgreSQL |
| **tsvector** | PostgreSQL data type for full-text search |

---

# Appendix B -- Technology Decision Log

Every significant technology decision is logged here for future reference.

| Date | Decision | Alternatives Rejected | Rationale | Revisit Date |
|------|----------|----------------------|-----------|-------------|
| 2024-06 | TypeScript for full stack | JavaScript, Python backend | Type safety, shared types, solo developer productivity | N/A (permanent) |
| 2024-06 | React 18 + Vite | Next.js, Vue, Angular | SPA sufficient, fastest dev server, simpler deployment | 2027-01 (if SEO needed) |
| 2024-06 | Tailwind CSS | Styled Components, MUI | Utility-first speed, no runtime cost, small bundles | N/A (permanent) |
| 2024-07 | PostgreSQL | MongoDB, MySQL | Relational data, ACID, JSONB, full-text search, PostGIS | N/A (permanent) |
| 2024-07 | Prisma ORM | TypeORM, Knex, Drizzle | Type generation, declarative schema, migration management | 2027-01 (evaluate Drizzle) |
| 2024-08 | Express.js | Fastify, NestJS, Hono | Ecosystem size, team familiarity, middleware model | 2027-06 (evaluate Fastify) |
| 2024-09 | Zustand | Redux Toolkit, Jotai, Context | Simplicity, zero boilerplate, TypeScript-native | N/A (permanent unless team grows significantly) |
| 2024-10 | AWS (EC2 + RDS + Amplify) | Vercel, Railway, DigitalOcean | Indian region, full ecosystem, scaling headroom | N/A (permanent cloud provider) |
| 2025-01 | Claude API (Anthropic) | OpenAI GPT-4, Google Gemini | Superior instruction following, vision capability, pricing | 2026-06 (re-evaluate models) |
| 2025-02 | Google OAuth 2.0 | Auth0, Clerk, Firebase Auth | Free, universal Google accounts in India, simple integration | 2027-01 (add more providers) |
| 2026-01 | Monolith architecture | Microservices, Serverless | Solo developer, low volume, development speed | 2027-06 (evaluate modular monolith) |
| 2026-03 | PM2 for process management | Docker + ECS, Kubernetes | Simplest production setup for single-instance backend | 2027-01 (evaluate Docker) |

---

# Appendix C -- Infrastructure Diagram (AWS)

```
+===========================================================================+
|                         AWS REGION: ap-south-1 (Mumbai)                    |
|                                                                           |
|  +-------------------------------------------------------------------+   |
|  |                          VPC (10.0.0.0/16)                         |   |
|  |                                                                     |   |
|  |  +-----------------------------+  +-----------------------------+   |   |
|  |  |    Public Subnet            |  |    Private Subnet           |   |   |
|  |  |    (10.0.1.0/24)            |  |    (10.0.2.0/24)            |   |   |
|  |  |                             |  |                             |   |   |
|  |  |  +-------------------+      |  |  +-------------------+      |   |   |
|  |  |  | EC2 Instance      |      |  |  | RDS PostgreSQL    |      |   |   |
|  |  |  | t3.small          |      |  |  | db.t3.micro       |      |   |   |
|  |  |  | 3.110.172.191     |      |  |  |                   |      |   |   |
|  |  |  |                   |      |  |  | Port 5432         |      |   |   |
|  |  |  | - Node.js backend |      |  |  | (EC2 SG only)     |      |   |   |
|  |  |  | - PM2 managed     |      |  |  +-------------------+      |   |   |
|  |  |  | - Port 3001       |      |  |                             |   |   |
|  |  |  | - Nginx (future)  |      |  |  +-------------------+      |   |   |
|  |  |  +-------------------+      |  |  | ElastiCache Redis |      |   |   |
|  |  |                             |  |  | (future)          |      |   |   |
|  |  +-----------------------------+  |  | cache.t3.micro    |      |   |   |
|  |                                    |  +-------------------+      |   |   |
|  |                                    +-----------------------------+   |   |
|  +-------------------------------------------------------------------+   |
|                                                                           |
|  +-------------------------------------------------------------------+   |
|  |                        S3 Buckets                                  |   |
|  |  +------------------+  +------------------+  +------------------+  |   |
|  |  | hub4estate-media |  | hub4estate-logs  |  | hub4estate-backups|  |   |
|  |  | (images, docs)   |  | (application logs)|  | (DB snapshots)   |  |   |
|  |  +------------------+  +------------------+  +------------------+  |   |
|  +-------------------------------------------------------------------+   |
|                                                                           |
|  +-------------------------------------------------------------------+   |
|  |                        Amplify                                     |   |
|  |  App ID: d1q97di2bq0r3o (us-east-1)                               |   |
|  |  Branch: main (auto-deploy)                                        |   |
|  |  Build: amplify.yml                                                |   |
|  |  CDN: CloudFront (automatic)                                       |   |
|  +-------------------------------------------------------------------+   |
|                                                                           |
|  +-------------------------------------------------------------------+   |
|  |  Route 53 (DNS)          |  ACM (SSL Certificates)                |   |
|  |  hub4estate.com          |  *.hub4estate.com                      |   |
|  |  api.hub4estate.com      |  auto-renewal enabled                  |   |
|  +-------------------------------------------------------------------+   |
+===========================================================================+
```

---

# Appendix D -- Security Architecture Summary

| Layer | Measure | Implementation |
|-------|---------|---------------|
| **Transport** | HTTPS everywhere, HSTS enforcement | ACM certificate + HSTS header (Helmet) |
| **Authentication** | Multi-strategy (OAuth, password, OTP) | Passport.js + bcrypt + JWT |
| **Authorization** | Role-based access control | Middleware checks: user, dealer, admin |
| **Input validation** | Schema-based validation on every endpoint | Zod schemas |
| **Rate limiting** | IP-based + endpoint-specific limits | Custom middleware (future: Redis-backed) |
| **SQL injection** | Parameterized queries | Prisma ORM (never raw string interpolation) |
| **XSS** | Content Security Policy, output encoding | Helmet CSP headers + React auto-escaping |
| **CSRF** | SameSite cookies, token verification | httpOnly + SameSite=Strict cookies |
| **File upload** | Type validation, size limits, virus scan (future) | Multer + custom validators |
| **Data privacy** | Blind matching (identity concealment) | Application-level access control |
| **Audit trail** | Every admin action logged | AuditLog model with full context |
| **Fraud detection** | Automated flags for suspicious activity | FraudFlag model + rule engine |
| **Secrets management** | Environment variables, not in code | `.env` files, AWS Parameter Store (target) |
| **Dependency security** | Regular audit | `npm audit`, Dependabot (target) |

---

**End of Part 1: Executive Summary, Vision, Market Analysis & Platform Architecture**

*Next document: `02-USER-PERSONAS-AND-JOURNEYS.md`*
*Full PRD series: 01 through 08, covering all platform modules in exhaustive detail.*

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 16 Feb 2025 | Shreshth Agarwal | Initial PRD |
| 2.0 | 02 Apr 2026 | CTO Office | Complete rewrite: architecture diagrams, technology decisions with reasoning, market analysis with TAM/SAM/SOM, event-driven architecture, caching strategy, security architecture, deployment pipeline, AI/ML roadmap |
