# HUB4ESTATE — Investor Product Requirement Document
### The AI-Powered Procurement Platform for India's $45B Electrical Market

---

## Document Info
| Field | Value |
|-------|-------|
| **Company** | HUB4ESTATE LLP (LLPIN: ACW-4269) |
| **Founder & CEO** | Shreshth Agarwal |
| **Incorporated** | 17 March 2026 |
| **Stage** | Pre-seed / Bootstrapped |
| **Document Date** | April 2026 |
| **Version** | 1.0 |

---

## 1. Executive Summary

Hub4Estate is building India's first **AI-powered blind procurement marketplace** for electrical products. We connect anyone who buys electrical products — homeowners, contractors, architects, builders, small businesses — with a verified network of dealers, using a proprietary blind matching engine that ensures fair pricing through competitive, anonymous bidding.

### The Core Insight

> The same Sony Tower Speaker + 2 Mics was priced at **₹1,05,000 at Croma** and **₹68,000 through Hub4Estate**. The buyer saved ₹37,000 — not because we negotiated harder, but because we gave them access to 8 dealers competing blind.

**This is not a communication problem. It is an access problem.** Buyers can't access dealer networks. Dealers can't reach quality buyers. The ₹37,000 gap exists because of information asymmetry — and it exists on virtually every electrical purchase in India.

### What We've Built

A live platform with:
- **AI-powered inquiry system**: manual entry, OCR slip scanning, voice input (Hindi + English)
- **Blind matching engine**: buyer identities hidden until dealer is selected
- **Verified dealer network**: GST/PAN verified, brand-authorized
- **Full admin pipeline**: inquiry tracking, CRM, dealer management, fraud detection, analytics
- **10 real clients served** with validated savings of ₹8,800 to ₹37,000 per order

### Business Model

| Revenue Stream | Description | Unit Economics |
|---------------|-------------|----------------|
| **Dealer Subscriptions** | Monthly/annual plans for inquiry access | ₹2,000-₹10,000/month |
| **Pay-Per-Lead** | Dealers pay per qualified inquiry | ₹50-₹500/inquiry |
| **Premium Placement** | Priority visibility for dealer quotes | 2x base subscription |

**Buyers never pay.** Free access drives demand-side growth, creating a network effect that pulls dealers onto the platform.

---

## 2. The Problem — $2.3B Lost to Price Opacity Annually

### Market Reality

India's electrical products market is a **₹3.7 lakh crore ($45B)** industry, distributed across **500,000+ dealers** in every city, town, and village. Yet:

1. **Price opacity is the norm**: The same 200m of FRLS 2.5mm² wire was quoted between ₹83/m and ₹127/m by 6 different dealers in the same city. That's a **53% price spread** on a commodity product.

2. **Discovery is broken**: Buyers rely on the 1-2 dealers near them. No mechanism exists to compare prices across 5-10 dealers without physically visiting each one or making dozens of phone calls.

3. **Documentation is absent**: 60%+ of electrical purchases happen in cash without GST bills. When a ₹15,000 MCB panel fails under warranty, the buyer has no recourse.

4. **Trust is unverifiable**: How does a homeowner in Jaipur know if a dealer's Havells authorization is genuine? They can't — so they default to the nearest known shop and pay whatever is asked.

### Who Suffers

| Segment | Pain Point | Annual Lost Value (est.) |
|---------|-----------|-------------------------|
| Homeowners (renovations) | Pay 20-40% premium to nearest dealer | ₹8,000-₹25,000/project |
| Contractors (commercial) | Waste 8-12 hours/week sourcing per project | ₹50,000-₹2L/project |
| Architects | Can't find exact-spec products without calling 10+ vendors | ₹20,000/project in time cost |
| Builders (large-scale) | Procurement manager adds 5-15% commission | ₹5L-₹50L/project |
| Small businesses | Pay retail prices for office fitouts | ₹15,000-₹1L/fitout |

**Total estimated annual value lost to price opacity in India's electrical market: ~₹15,000 crore ($2.3B).**

---

## 3. The Solution — Blind Competitive Procurement

### How Hub4Estate Works

```
Buyer                    Hub4Estate                    Dealers
  │                         │                            │
  │  1. Submit Inquiry      │                            │
  │  (manual/AI scan/voice) │                            │
  │─────────────────────────▶                            │
  │                         │  2. AI Parses + Matches    │
  │                         │─────────────────────────────▶
  │                         │  3. Blind Inquiry Sent     │
  │                         │  (no buyer name/contact)   │
  │                         │                            │
  │                         │  4. Dealers Submit Quotes  │
  │                         ◀─────────────────────────────│
  │  5. Compare Quotes      │                            │
  │  (side by side)         │                            │
  ◀─────────────────────────│                            │
  │                         │                            │
  │  6. Select Best Deal    │                            │
  │─────────────────────────▶                            │
  │                         │  7. Contact Revealed       │
  │                         │─────────────────────────────▶
  │                         │                            │
  │  8. Direct Purchase     │                            │
  │◀ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▶│
```

### Key Differentiators

| Feature | Hub4Estate | IndiaMART | Amazon Business | Moglix |
|---------|-----------|-----------|-----------------|--------|
| Blind bidding (prevents bias) | ✅ | ❌ | ❌ | ❌ |
| AI slip scanning (photo → inquiry) | ✅ | ❌ | ❌ | ❌ |
| Voice input (Hindi/English) | ✅ | ❌ | ❌ | ❌ |
| Always free for buyers | ✅ | ❌ (premium listings) | ❌ (markup) | ❌ (B2B only) |
| Verified dealer network | ✅ | Partial | ❌ (any seller) | ✅ |
| Real price comparison | ✅ (3-5 quotes) | ❌ | ❌ | Limited |
| Zero spam calls | ✅ | ❌ (10+ calls/inquiry) | N/A | ❌ |
| Market data for losing dealers | ✅ | ❌ | ❌ | ❌ |

### The Blind Matching Engine — Our Core IP

Unlike every other B2B marketplace in India, Hub4Estate uses **blind matching**: dealer identities are hidden from buyers and buyer identities are hidden from dealers until a selection is made. This creates:

1. **Pure price competition**: dealers compete on price, quality, and service — not relationships
2. **Zero spam**: buyers never receive unsolicited calls from unselected dealers
3. **Market intelligence**: losing dealers receive the winning price (anonymized), creating a self-correcting pricing mechanism
4. **Trust by design**: the system itself ensures fairness, not individual trust relationships

---

## 4. Technology & AI Moat

### Current Platform (Live)

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React 18 + TypeScript + Tailwind + Vite | ✅ Live |
| Backend | Node.js + Express + Prisma ORM | ✅ Live |
| Database | PostgreSQL (AWS RDS) | ✅ Live (49 models) |
| AI: Slip Scanner | Claude API + Cloud Vision OCR | ✅ Live |
| AI: Voice Input | Web Speech API + NLP | ✅ Live |
| AI: Chatbot | Claude API (Volt AI) | ✅ Live |
| Auth | Google OAuth + Phone OTP + JWT | ✅ Live |
| Hosting | AWS EC2 + Amplify + S3 | ✅ Live |
| Admin | Full pipeline + CRM + scraper + analytics | ✅ Live |

### AI Roadmap (3-Year Vision)

#### Year 1: AI-Assisted Procurement
- **Price Intelligence Engine**: predict fair prices for any product in any city
- **Dealer Scoring ML**: rank dealers by reliability, pricing, response time
- **Smart Matching**: auto-route inquiries to best-fit dealers with 90%+ accuracy
- **Fraud Detection v2**: ML-based anomaly detection for suspicious patterns

#### Year 2: AI-Powered Procurement
- **Autonomous Procurement Agent**: "I'm building a 3BHK in Jaipur, budget ₹5L for electricals" → AI generates complete materials list, creates optimized procurement plans, submits inquiries, collects quotes, presents unified comparison
- **Dynamic Pricing Signals**: "Lower your price by ₹200 and your win probability increases 35%"
- **Supply Chain Prediction**: delivery time prediction, stock-out early warning
- **Computer Vision**: photograph any product → identify brand, model, specs

#### Year 3: AI-First Platform
- **Industry Price Index**: the Bloomberg Terminal for Indian electrical products
- **AI Negotiation**: multi-party optimization across dealer quotes
- **Dealer Network Expansion AI**: identify coverage gaps, auto-recruit dealers
- **Cross-category expansion**: same AI infrastructure applied to plumbing, HVAC, building materials

### Data Moat

Every transaction on Hub4Estate generates proprietary data that makes our AI smarter:
- **Price data**: thousands of real dealer quotes across products, brands, cities
- **Dealer performance data**: response times, win rates, customer ratings
- **Demand data**: what buyers want, where, in what quantities
- **Market intelligence**: price spreads, brand preferences, seasonal patterns

This data compounds. The more transactions we process, the better our price predictions, the more accurate our dealer matching, and the harder it becomes for competitors to replicate.

---

## 5. Market Opportunity

### TAM-SAM-SOM

| Market | Size | Description |
|--------|------|-------------|
| **TAM** | ₹3.7L Cr ($45B) | India's entire electrical products market |
| **SAM** | ₹74,000 Cr ($9B) | Organized electrical retail in top 100 cities |
| **SOM (Year 3)** | ₹740 Cr ($90M) | 1% of SAM through digital procurement |

### Growth Drivers

1. **India's real estate boom**: $1.3T real estate market, 7% annual growth
2. **Smart City Mission**: 100 cities being upgraded, massive electrical infrastructure demand
3. **Premiumization**: shift from unbranded to branded electrical products (2x the procurement research need)
4. **Digital adoption**: UPI transactions grew 50% in 2025, B2B buyers are increasingly digital-native
5. **GST compliance pressure**: formal procurement is becoming mandatory, creating need for documented transactions

### Competitive Landscape

| Player | Model | Weakness | Hub4Estate Advantage |
|--------|-------|----------|---------------------|
| **IndiaMART** | Listings marketplace | Pay-to-rank, spam calls, no price comparison | Blind bidding, zero spam, real comparison |
| **Amazon Business** | E-commerce | Retail prices, no dealer negotiation | Wholesale dealer prices, bulk procurement |
| **Moglix** | Enterprise B2B | Only large enterprises, minimum orders | Anyone can use, no minimums |
| **TradeIndia** | Listings | No transaction facilitation | Full procurement workflow |
| **Local dealers** | Offline | Limited selection, no comparison | 5-10 dealer quotes in one click |

**Hub4Estate is the only platform doing blind competitive procurement with AI assistance for electrical products in India.** There is no direct competitor.

---

## 6. Traction & Validation

### Real Deals Closed

| Product | Before Hub4Estate | After Hub4Estate | Saved |
|---------|------------------|-----------------|-------|
| Sony Tower Speaker + 2 Mics | ₹1,05,000 (Croma) | ₹68,000 | **₹37,000 (35%)** |
| Philips 15W LED Panels ×200 | ₹585/pc (local dealer) | ₹465/pc (incl. shipping) | **₹24,000 (20%)** |
| FRLS 2.5mm² Wire ×200m | ₹127/m (highest quote) | ₹83/m (best dealer) | **₹8,800 (35%)** |
| Sony LED Panels ×2 | ₹280 (nearest dealer) | ₹76/each (with delivery) | **₹128 (54%)** |

### Platform Metrics
- **10 clients** served manually with real transactions
- **49 database models** built (production-ready schema)
- **Full admin panel** with CRM, pipeline, analytics, scraper, fraud detection
- **3 AI features** live: slip scanner, voice input, chatbot
- **2 languages** supported: English + Hindi
- **Platform fully deployed**: AWS (EC2 + RDS + Amplify + S3)

---

## 7. Business Model & Unit Economics

### Revenue Streams

#### Stream 1: Dealer Subscriptions (Primary)

| Plan | Price | Inquiries/month | Features |
|------|-------|-----------------|----------|
| Free | ₹0 | 5 | Basic access, manual matching |
| Standard | ₹2,999/mo | 50 | Auto-matching, basic analytics |
| Premium | ₹7,999/mo | Unlimited | Priority matching, advanced analytics, API access |
| Enterprise | Custom | Unlimited | Multi-location, bulk tools, dedicated support |

#### Stream 2: Pay-Per-Lead
- ₹50-₹500 per qualified inquiry (based on order value)
- Alternative to subscription for occasional dealers

#### Stream 3: Premium Services (Year 2+)
- Promoted dealer profiles
- Featured placement in quote comparisons
- Market intelligence reports
- Procurement consulting for large projects

### Unit Economics (Target at Scale)

| Metric | Value |
|--------|-------|
| **CAC (Buyer)** | ₹50-₹200 (organic/referral-heavy) |
| **CAC (Dealer)** | ₹500-₹2,000 (sales + onboarding) |
| **LTV (Dealer — Standard Plan)** | ₹72,000 (₹3K/mo × 24mo avg tenure) |
| **LTV:CAC Ratio** | 36:1 (dealer) |
| **Gross Margin** | 85%+ (platform business) |
| **Contribution Margin per Transaction** | ₹200-₹1,000 |

### Path to ₹100 Cr ARR

| Year | Dealers | Avg Revenue/Dealer/Mo | Monthly Revenue | ARR |
|------|---------|----------------------|-----------------|-----|
| Y1 | 200 | ₹3,000 | ₹6L | ₹72L |
| Y2 | 1,000 | ₹4,500 | ₹45L | ₹5.4Cr |
| Y3 | 5,000 | ₹6,000 | ₹3Cr | ₹36Cr |
| Y4 | 15,000 | ₹7,500 | ₹11.25Cr | ₹135Cr |

---

## 8. Go-to-Market Strategy

### Phase 1: Beachhead (Months 1-6)
- **Focus**: Sri Ganganagar, Jaipur, and 3-5 tier 2 cities in Rajasthan
- **Buyer acquisition**: WhatsApp referral chains, contractor associations, local events
- **Dealer acquisition**: personal outreach, demonstrate value with real orders
- **Target**: 50 dealers, 200 monthly inquiries

### Phase 2: Regional Expansion (Months 6-12)
- **Focus**: Top 15 cities in North India (Delhi NCR, Chandigarh, Lucknow, etc.)
- **Buyer acquisition**: Google Ads (high-intent keywords), SEO, content marketing
- **Dealer acquisition**: Inside sales team (3-5 people), referral incentives
- **Target**: 500 dealers, 2,000 monthly inquiries

### Phase 3: National Scale (Months 12-24)
- **Focus**: Top 50 cities across India
- **Buyer acquisition**: Brand campaigns, partnerships with builders/architects
- **Dealer acquisition**: Self-serve onboarding + sales team (10-15 people)
- **Target**: 5,000 dealers, 20,000 monthly inquiries

### Phase 4: Category Expansion (Months 24-36)
- **Expand beyond electrical**: plumbing, HVAC, building materials, hardware
- **Same platform, same model**: blind matching + AI + verified network
- **Target**: 10,000+ dealers, 50,000+ monthly inquiries, multiple categories

---

## 9. Team & Founder

### Shreshth Agarwal — Founder & CEO

- **Age**: 18 | **Education**: Mesa School of Business (2025-2029) + NMIMS BBA Marketing
- **Started ideating**: April 2024 (age 16) after watching father deal with real estate broker spam
- **Pivot journey**: Broker filtering → listings → real estate ecosystem → construction procurement → electrical-first
- **Key insight at 17**: Same product quoted ₹1,05,000 at retail → sourced at ₹66,000 through network. "It's not a communication problem, it's an access problem."
- **Prior experience**: ₹87L in stock market trading, ran a jewelry brand (Treva Iconic Jewels) for 1 year, digital marketing for Bangalore agency, bought own devices from dropshipping profits in Class 9
- **Network**: TechSparks Bengaluru 2024 (met Nithin Kamath, Ronnie Screwvala), met Ritesh Agarwal (OYO) at SMC Summit, 1:1 with Shradha Sharma (YourStory)
- **Rotary International**: active since Class 10, organized blood donation and medical camps

### Key Hires Needed

| Role | Priority | Timing |
|------|----------|--------|
| CTO / Technical Co-founder | P0 | Immediate |
| Full-stack Developer (Senior) | P0 | Month 1 |
| Sales Lead (Dealer Acquisition) | P1 | Month 2 |
| UI/UX Designer | P1 | Month 3 |
| ML Engineer | P2 | Month 6 |

---

## 10. Financial Projections

### Revenue Forecast

| | Y1 | Y2 | Y3 |
|---|---|---|---|
| **Active Dealers** | 200 | 1,000 | 5,000 |
| **Subscription Revenue** | ₹48L | ₹4.2Cr | ₹30Cr |
| **Pay-Per-Lead Revenue** | ₹12L | ₹1.2Cr | ₹6Cr |
| **Premium Services** | — | ₹60L | ₹4Cr |
| **Total Revenue** | ₹60L | ₹6Cr | ₹40Cr |
| **Gross Margin** | 85% | 87% | 90% |
| **Operating Expenses** | ₹1.2Cr | ₹4.5Cr | ₹20Cr |
| **EBITDA** | -₹69L | ₹75L | ₹16Cr |

### Use of Funds (Seed Round — Target: ₹2-3 Cr)

| Category | Allocation | Purpose |
|----------|-----------|---------|
| Engineering | 40% | CTO hire, 2 senior devs, AI/ML engineer |
| Sales & BD | 25% | Dealer acquisition team, city launches |
| Marketing | 15% | Digital acquisition, content, brand |
| Infrastructure | 10% | AWS scaling, tools, third-party APIs |
| Operations | 10% | Legal, compliance, office, travel |

---

## 11. Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Dealers resist platform adoption | Medium | High | Demonstrate ROI with free tier, show winning price data as market intelligence value |
| Large marketplace enters space | Low | Medium | Data moat compounds, blind matching is hard to copy, local dealer relationships matter |
| AI accuracy insufficient | Medium | Medium | Human fallback for all AI features, continuous training, feedback loops |
| Buyer trust in unknown dealers | Medium | High | Verification badges, customer reviews, money-back guarantee on first order |
| Cash flow before revenue | High | High | Lean operations, founder-led sales, phased hiring |
| LLP structure limits VC investment | Medium | Medium | Convert to Pvt Ltd before equity raise (planned) |

---

## 12. Why Now

1. **India's construction market is at an inflection point**: ₹5.8L Cr spend in 2025, growing 10%+ annually
2. **Digital procurement is nascent**: <2% of electrical purchases happen through digital channels — massive whitespace
3. **AI is mature enough**: LLM APIs can now parse purchase orders, understand voice commands in Hindi, and power intelligent matching — at costs that make sense for India
4. **UPI/digital payments are universal**: even small dealers in tier 3 cities accept digital payments, enabling platform commerce
5. **GST compliance is tightening**: informal cash-based procurement is becoming harder, creating a pull toward platforms that facilitate documented transactions
6. **The founder is already in the network**: 10 clients served, real transactions closed, validated savings — this isn't a hypothesis, it's a proven model seeking scale

---

## 13. The Ask

Hub4Estate is not raising capital in this document. We are sharing our vision.

We are looking for:
- **Technical co-founder** who sees the system and wants to build it
- **Strategic advisors** in construction procurement, B2B marketplaces, or AI
- **Early believers** who want to be part of building India's procurement infrastructure

> "I am no longer trying to prove I have a big idea. I am trying to prove I can build something that actually works."
> — Shreshth Agarwal, Founder

---

*For the complete technical PRD with database schemas, API contracts, file structures, and implementation details, see the Developer PRD.*

*Hub4Estate LLP | LLPIN: ACW-4269 | shreshth.agarwal@hub4estate.com | +91 7690001999*
