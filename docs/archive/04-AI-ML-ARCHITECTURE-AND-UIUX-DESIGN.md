# PRD-04: AI/ML Architecture & UI/UX Design System

**Document Version:** 3.0
**Last Updated:** 2026-04-07
**Author:** CTO Office, Hub4Estate
**Status:** APPROVED FOR ENGINEERING
**Audience:** Engineering Team, Product Design, ML Engineers, QA
**Classification:** Internal -- Confidential

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [AI/ML Architecture -- The 3-Year Vision](#2-aiml-architecture----the-3-year-vision)
   - 2.1 [Phase 1: Foundation AI (Months 0-6) -- "AI-Assisted"](#21-phase-1-foundation-ai-months-0-6----ai-assisted)
   - 2.2 [Phase 2: Intelligence Layer (Months 6-18) -- "AI-Driven"](#22-phase-2-intelligence-layer-months-6-18----ai-driven)
   - 2.3 [Phase 3: Autonomous Procurement (Months 18-36) -- "AI-First"](#23-phase-3-autonomous-procurement-months-18-36----ai-first)
   - 2.4 [AI Infrastructure & MLOps](#24-ai-infrastructure--mlops)
3. [UI/UX Design System](#3-uiux-design-system)
   - 3.1 [Design Principles](#31-design-principles)
   - 3.2 [Design Tokens](#32-design-tokens)
   - 3.3 [Component Library](#33-component-library)
   - 3.4 [Animation System](#34-animation-system)
   - 3.5 [Mobile-First Responsive Design](#35-mobile-first-responsive-design)
   - 3.6 [Accessibility (WCAG 2.1 AA)](#36-accessibility-wcag-21-aa)
4. [Data Architecture for AI](#4-data-architecture-for-ai)
5. [Performance Budgets](#5-performance-budgets)
6. [Risk Matrix & Mitigations](#6-risk-matrix--mitigations)
7. [Appendix](#7-appendix)

---

## 1. Executive Summary

Hub4Estate is building an AI-first electrical supplies marketplace that transforms how India procures electrical products. A buyer who needs 200 meters of FRLS cable currently calls 6-10 dealers, negotiates individually, and hopes for a fair price. Hub4Estate eliminates this friction entirely through AI at every touchpoint.

**Current AI capabilities (production):**
- Smart Slip Scanner: OCR + Claude Vision extraction from photos/PDFs of purchase orders
- Voice Input: Hindi/English/Hinglish speech-to-form via Web Speech API
- Volt AI Chatbot: Claude-powered conversational agent with tool calling (inquiry submission, product search, comparison, inquiry tracking, dealer quote generation)
- Smart Inquiry Matching: Brand + category + service area matching for dealer routing
- AI-Assisted Admin Insights: Platform analytics interpretation via Claude Haiku
- Auto Brand Suggestions: Static + AI-powered brand recommendations by product category

**The 3-year trajectory:**

| Phase | Timeline | AI Posture | Human Role |
|-------|----------|-----------|------------|
| Phase 1 | Months 0-6 | AI-Assisted | Humans decide, AI accelerates |
| Phase 2 | Months 6-18 | AI-Driven | AI recommends, humans oversee |
| Phase 3 | Months 18-36 | AI-First | AI executes, humans handle exceptions |

This document provides implementation-level technical detail for every AI/ML system and every UI/UX component, including code examples, configuration objects, database schemas, and architecture diagrams.

---

## 2. AI/ML Architecture -- The 3-Year Vision

### 2.1 Phase 1: Foundation AI (Months 0-6) -- "AI-Assisted"

Every Phase 1 feature has a human confirmation step. AI reduces friction; humans make decisions.

---

#### 2.1.1 Slip Scanner: Image Preprocessing + OCR + NLP Extraction

**Files:**
- Backend: `backend/src/services/ai-parser.service.ts`
- Frontend: `frontend/src/components/SmartSlipScanner.tsx`
- Route: `POST /api/slip-scanner/parse`

**Processing Pipeline:**

```
Step 1: Image Preprocessing (Sharp.js)
  Input:  Raw image (JPG/PNG/WebP) or PDF
  Process:
    - Grayscale conversion        sharp.grayscale()
    - Contrast normalization      sharp.normalize()
    - Edge sharpening             sharp.sharpen()
    - Min height upscale 2000px   sharp.resize({ height: 2000, fit: 'inside' })
    - PDF page 1 extraction       pdf-to-img library
  Output: Preprocessed image buffer
  Latency: 200-500ms

Step 2: OCR Extraction (Dual Pipeline)
  PRIMARY: Claude Vision API (claude-sonnet-4-20250514)
    - Base64-encode image, send as image content block
    - Model analyzes visual layout + text simultaneously
    - Accuracy: ~90% printed, ~75% handwritten
    - Cost: $0.015-0.04 per image
    - Latency: 2-5 seconds

  FALLBACK: Tesseract.js OCR
    - Used when ANTHROPIC_API_KEY unavailable
    - Languages: eng, hin (to add)
    - Accuracy: ~60-70% printed, ~30-40% handwritten
    - Cost: Free (local execution)
    - Latency: 3-8 seconds

  PLANNED: Google Cloud Vision API
    - Code exists commented in ai-parser.service.ts
    - TEXT_DETECTION + LABEL_DETECTION + WEB_DETECTION
    - Superior Hindi/Devanagari recognition
    - Cost: $1.50 per 1000 images
    - Function: analyzeImageWithGoogle()

Step 3: NLP Entity Extraction (Claude API)
  Input:  Raw OCR text OR direct image (Claude Vision)
  System prompt: Specialized for Indian electrical products
    - 20+ Indian electrical brands recognized
    - Product categories: wires, MCBs, switches, fans, LEDs, conduits, etc.
    - Indian units: meters, pieces, kg, rolls, coils, boxes
    - Mixed Hindi-English text handling
  Output: Structured JSON:
```

```typescript
interface SlipScanResult {
  items: Array<{
    productName: string;       // "FRLS 2.5mm Copper Wire"
    quantity: number;          // 200
    unit: string;              // "meters"
    brand: string | null;      // "Polycab"
    modelNumber: string | null; // "FRLSH45200M"
    notes: string | null;      // "Fire retardant, ISI marked"
    confidence: number;        // 0.0 - 1.0
  }>;
  totalItems: number;
  warnings: string[];
  needsConfirmation: boolean;
  detectedLocation: string | null;
}
```

```
Step 4: Brand Suggestion Engine
  Trigger: Item has no brand identified
  Logic:
    a. Static brand database (zero-latency, 7 categories):
       Wires:    Polycab > Havells > Finolex > KEI > RR Kabel
       MCBs:     Legrand > Schneider > Havells > Siemens > Anchor
       Switches: Legrand > Havells > Schneider > GM Modular > Anchor
       Fans:     Atomberg > Havells > Crompton > Orient > Usha
       LED:      Philips > Havells > Wipro > Syska > Eveready
       Conduits: Polycab > Havells > Anchor > Astral > Supreme
       Cables:   Polycab > Havells > KEI > Finolex > RR Kabel
    b. No static match: Claude API generates 5 suggestions
    c. Each: { name, segment: "premium"|"quality"|"budget", reason }
  Output: Array<BrandSuggestion> (max 5)

Step 5: User Confirmation & Editing
  Frontend renders parsed items in editable form
  Each item displays:
    - Editable product name, quantity, unit, brand fields
    - Confidence bar: green > 80%, amber 60-80%, red < 60%
    - Brand suggestion chips (if brand not detected)
    - "Low Confidence" badge when confidence < 0.7
  User can: edit any field, remove items, add new items manually
```

**Edge Case Handling:**

| Edge Case | Detection | Response |
|-----------|-----------|----------|
| Handwritten slips | Claude Vision detects handwriting style | Lower confidence scores, add warnings |
| Blurry/dark photos | Sharp preprocessing attempt | "Image too unclear" error if OCR fails |
| Hindi text | Claude understands Devanagari natively | Tesseract fallback needs `hin` language pack |
| Mixed Hindi-English | Claude handles Hinglish naturally | Simple parser uses English-only patterns |
| Single product photo | AI detects packaging context | All text combined into ONE item entry |
| Incomplete slips | Missing quantities/brands | `needsConfirmation: true`, warnings list |
| PDF documents | MIME type detection | Convert to image, then standard pipeline |
| File > 20MB | Client-side validation | Reject before upload with error message |

**Accuracy Targets:**

| Metric | Current | 3-Month | 6-Month |
|--------|---------|---------|---------|
| Product name extraction | ~80% | 85% | 92% |
| Quantity extraction | ~75% | 82% | 90% |
| Brand identification | ~70% | 80% | 88% |
| Model number extraction | ~60% | 72% | 85% |
| Hindi text accuracy | ~55% | 70% | 82% |
| End-to-end (all fields correct) | ~50% | 65% | 78% |

**Fallback Chain:**
1. Claude Vision API (primary) -> if fails:
2. Google Cloud Vision + Claude text analysis -> if fails:
3. Tesseract.js OCR + Claude text analysis -> if fails:
4. Tesseract.js OCR + simple regex parser -> if fails:
5. Manual entry form (always available)

---

#### 2.1.2 Voice Input: Speech-to-Text + NLP

**Files:**
- Chatbot: `frontend/src/components/AIAssistantWidget.tsx` (lines 294-319)
- Homepage: `frontend/src/pages/HomePage.tsx` (voice input on inquiry form)
- API: Web Speech API (`window.SpeechRecognition || window.webkitSpeechRecognition`)

**Pipeline:**

```
Step 1: Audio Capture
  API: Web Speech API (browser-native, zero cost)
  Configuration:
    continuous: false        // single utterance mode
    interimResults: true     // show transcription in real-time
    maxAlternatives: 1
    lang: "hi-IN"            // captures Hindi, Hinglish, English
  Browser Support:
    Chrome 33+:  Full (SpeechRecognition)
    Safari 14.1+: Full (webkitSpeechRecognition)
    Firefox:     NOT supported (graceful fallback to text)
    Edge 79+:    Full

Step 2: Language Detection & Transcription
  Current: Browser handles via Google's servers (Chrome)
  Planned: Dynamic language switching from first words
  Languages to support:
    English ("en-IN")     -- Phase 1
    Hindi ("hi-IN")       -- Phase 1
    Hinglish (use "hi-IN") -- Phase 1
    Tamil ("ta-IN")       -- Phase 2
    Telugu ("te-IN")      -- Phase 2
    Bengali ("bn-IN")     -- Phase 2

Step 3: NLP Extraction
  For Chatbot (Volt AI):
    Transcript sent as chat message -> Claude handles via tool calling
    No additional NLP needed

  For Homepage Form (auto-fill):
    Regex extraction:
      Quantity: /(\d+)\s*(pieces?|pcs?|meters?|nos?)/i
      Hindi:    "do sau" -> 200, "pachaas" -> 50
      City:     match against known Indian city list
      Product:  remaining text after extraction
    Planned: Claude API for structured extraction

Step 4: Form Auto-Fill
  Extracted fields populate inquiry form
  Visual feedback: green flash on auto-filled fields
  User reviews and corrects before submission
```

**Hindi/Hinglish Electrical Terms Dictionary:**

```typescript
const hindiElectricalTerms: Record<string, string> = {
  // Products
  "taar":           "wire",
  "cable":          "cable",
  "switch":         "switch",
  "pankha":         "fan",
  "bulb":           "LED bulb",
  "MCB":            "MCB",
  "board":          "distribution box",
  "DB":             "distribution box",
  "pipe":           "conduit",
  "nali":           "conduit",
  "earthing":       "earthing",
  // Units
  "meter":          "meters",
  "piece":          "pieces",
  "nag":            "pieces",
  "roll":           "rolls",
  // Numbers
  "do sau":         "200",
  "teen sau":       "300",
  "paanch sau":     "500",
  "hazaar":         "1000",
  // Intent
  "Jaipur mein":    "city: Jaipur",
  "deliver karna":  "delivery required",
};
```

**Planned Upgrade (Month 3-6): Google Speech-to-Text API**
- Better Hindi accuracy, offline streaming, punctuation
- Cost: $0.006 per 15 seconds
- Package: `@google-cloud/speech`
- Features: automatic punctuation, speaker diarization, word-level timestamps

---

#### 2.1.3 AI Chatbot (Volt AI)

**Files:**
- Backend: `backend/src/services/ai.service.ts`
- Routes: `backend/src/routes/chat.routes.ts`
- Frontend: `frontend/src/components/AIAssistantWidget.tsx`
- Database: ChatSession + ChatMessage tables (Prisma)

**Architecture:**

```
+-------------------------------------------------------+
|                    FRONTEND                            |
|                                                       |
|  AIAssistantWidget.tsx                                |
|  +-- Session management (create, resume)              |
|  +-- Message rendering (markdown, tool results)       |
|  +-- Streaming text display (Server-Sent Events)      |
|  +-- Voice input (Web Speech API)                     |
|  +-- Quick suggestion chips                           |
|                                                       |
|  User types/speaks -> POST /api/chat/:sessionId/stream|
|  -> SSE stream -> text chunks + tool results          |
+-------------------------------------------------------+
                        |
+-------------------------------------------------------+
|                    BACKEND                             |
|                                                       |
|  chat.routes.ts -> ai.service.ts                      |
|                                                       |
|  streamChatResponse():                                |
|  1. Build system prompt (base + user context)         |
|  2. Format message history                            |
|  3. Call Claude API with streaming                    |
|  4. Yield text chunks as SSE events                   |
|  5. If tool_use: execute tool, yield result           |
|  6. Loop (up to 5 iterations for multi-tool chains)   |
|                                                       |
|  Tool Executors:                                      |
|  +-- submit_inquiry  -> prisma.productInquiry.create  |
|  +-- search_products -> prisma.product.findMany       |
|  +-- compare_products -> return to Claude for analysis|
|  +-- generate_dealer_quote -> structured formatting   |
|  +-- track_inquiry -> prisma.productInquiry.findFirst |
+-------------------------------------------------------+
                        |
+-------------------------------------------------------+
|              CLAUDE API (Anthropic)                    |
|                                                       |
|  Model: claude-sonnet-4-20250514 (chat)               |
|  Model: claude-haiku-4-5-20251001 (insights, suggestions)     |
|  Max tokens: 4096                                     |
|  Streaming: yes (messages.stream)                     |
|  Tools: 5 defined                                     |
|  Tool choice: auto                                    |
|  Max iterations: 5 (prevent infinite loops)           |
+-------------------------------------------------------+
```

**System Prompt Architecture (122 lines):**
1. Language Lock -- detect and match user's language for entire session
2. Platform Identity -- who Hub4Estate is, how it works, who it serves
3. Real Validated Deals -- 4 actual deals with exact prices for credibility
4. Founder Information -- Shreshth's story, contact details
5. Product Taxonomy -- 13 categories with top brands per category
6. Indian Wiring Standards -- BIS specifications for wire sizing, MCBs, earthing
7. Capability Declaration -- available tools, when to use them
8. Behavioral Rules -- tone, when to submit inquiries, when to suggest contact

**Context Injection:**

```typescript
function buildSystemPrompt(
  userContext?: { name: string; phone: string; email: string; city: string },
  dealerContext?: { businessName: string; city: string }
): string {
  let prompt = HUB4ESTATE_SYSTEM_PROMPT; // base 122-line prompt

  if (userContext) {
    // Claude auto-uses for inquiry submission (no re-asking)
    prompt += `\n\nLogged-in user: ${userContext.name}, ${userContext.phone}, ${userContext.city}`;
  }

  if (dealerContext) {
    // Claude switches to dealer-helper mode (quote generation, bid advice)
    prompt += `\n\nDealer context: ${dealerContext.businessName}, ${dealerContext.city}`;
  }

  return prompt;
}
```

**Session Management:**

```prisma
model ChatSession {
  id             String        @id @default(uuid())
  userId         String?
  title          String?       // auto-generated from first message
  messageCount   Int           @default(0)
  lastMessageAt  DateTime?
  createdAt      DateTime      @default(now())
  messages       ChatMessage[]
}

model ChatMessage {
  sessionId   String
  role        String           // "user" | "assistant"
  content     String
  tokenCount  Int?             // API usage tracking
  createdAt   DateTime         @default(now())
  session     ChatSession      @relation(fields: [sessionId])
}
```

**Phase 1 Enhancements:**

1. **RAG Integration (Retrieval Augmented Generation)**
   - Embed product catalog, FAQ, pricing guides into vector database
   - Before each Claude call, retrieve top-5 relevant documents
   - Technology: pgvector extension on existing PostgreSQL
   - Embedding model: OpenAI text-embedding-3-small ($0.02/1M tokens)
   - Benefit: Answers grounded in actual catalog data, not hallucinated

2. **Persistent Chat History**
   - Resume previous sessions, show history in user dashboard
   - Load last 20 messages on session resume

3. **Proactive Engagement**
   - After 30s on product page: "Need help choosing the right [category]?"
   - After failed search: "Couldn't find what you need? Tell me and I'll help."
   - After inquiry submission: "Your inquiry HUB-XXX is submitted! Want to track it?"

4. **Multi-Modal Input**
   - Accept image uploads in chat (send to slip scanner pipeline)
   - Accept voice messages (send to STT pipeline)

5. **Conversation Analytics**
   - Track: messages per session, tool usage, resolution rate
   - Track: most asked questions, product categories discussed
   - Track: conversion (chat -> inquiry submission)
   - Dashboard in admin panel: `AdminChatsPage.tsx`

---

#### 2.1.4 Smart Product Matching

**Current Implementation:**
- File: `backend/src/services/dealer-matching.service.ts`
- Function: `matchDealersForRFQ(rfq)`
- Current: Binary match on brand + category + service area pincode

**Current Query:**

```sql
SELECT dealers WHERE
  status = 'VERIFIED'
  AND brandMappings.brandId IN (rfq.brandIds)
  AND brandMappings.isVerified = true
  AND categoryMappings.categoryId IN (rfq.categoryIds)
  AND serviceAreas.pincode = rfq.deliveryPincode
```

**Phase 1 Upgrade: Weighted Multi-Factor Scoring**

```typescript
interface DealerMatchScore {
  dealerId: string;
  totalScore: number;         // 0.0 - 1.0
  breakdown: {
    brandMatch: number;       // weight: 0.30
    categoryMatch: number;    // weight: 0.20
    locationScore: number;    // weight: 0.25
    performanceScore: number; // weight: 0.15
    loadScore: number;        // weight: 0.10
  };
}

// Factor 1: Brand Match (0.30)
// Exact brand + verified: 1.0
// Exact brand, not verified: 0.7
// Same segment (premium/quality/budget): 0.3
// No match: 0.0
// Multi-item RFQs: average across items
// Bonus: +0.1 if brand authorization proof uploaded

// Factor 2: Category Match (0.20)
// Exact category: 1.0
// Parent category: 0.6
// Adjacent category: 0.3
// No match: 0.0
const categoryAdjacency: Record<string, string[]> = {
  "Wires": ["Cables"],
  "MCBs": ["Distribution"],
  "Switches": ["Sockets"],
  "Fans": ["Ventilation"],
  "Lighting": ["LED"],
};

// Factor 3: Location Proximity (0.25)
// Exact pincode: 1.0
// Same city (different pincode): 0.8
// Adjacent district (<50km): 0.5 (Haversine formula)
// Same state: 0.3
// Pan-India shipper: 0.2
// Different state, no shipping: 0.0

// Factor 4: Historical Performance (0.15)
// performanceScore = (conversionRate * 0.4) +
//                    (responseTimeScore * 0.3) +
//                    (normalizedConversions * 0.2) +
//                    (avgRating / 5.0 * 0.1)
// New dealers (<5 quotes): default 0.5

// Factor 5: Load Balancing (0.10)
// <5 pending inquiries (7 days): 1.0
// 5-15 pending: 0.7
// 15-30 pending: 0.4
// >30 pending: 0.1
```

**Routing Rules:**
- Top 5 dealers with score > 0.6: auto-send inquiry immediately
- Score 0.3-0.6: queue for admin review
- Score < 0.3: do not send
- Fewer than 3 above 0.6: expand search radius

**Performance:** Score 100 dealers in < 200ms. Redis cache for dealer feature vectors (hourly refresh).

---

#### 2.1.5 Price Intelligence (Foundation)

**Data Sources:**

| Source | Data Points | Frequency |
|--------|------------|-----------|
| Quote submissions | price, brand, product, city, dealer, quantity | Real-time |
| Closed deals | final negotiated price, selected dealer | Real-time |
| Scraped market data | MRP, online prices (Amazon, Flipkart, IndiaMart) | Daily |
| Brand price lists | authorized dealer pricing | Monthly |
| Government rate contracts | GeM prices for electrical items | Quarterly |

**Statistical Analysis Engine:**

```typescript
interface PriceIntelligence {
  productKey: string;          // "polycab-4mm-frls-wire"
  city: string;
  currentAvg: number;
  min: number;
  max: number;
  median: number;
  sampleSize: number;
  confidenceInterval: { low: number; high: number }; // 95% CI
  trend: "rising" | "stable" | "falling";
  changePercent30d: number;
  priceHistory: Array<{
    month: string;             // "2026-01"
    avg: number;
    min: number;
    max: number;
  }>;
}

// Confidence interval calculation:
// CI = mean +/- (z * stddev / sqrt(n))
// z = 1.96 for 95% confidence
// If sampleSize < 5: return { confidence: "low", message: "Insufficient data" }
// If sampleSize 5-20: return { confidence: "medium" }
// If sampleSize > 20: return { confidence: "high" }
```

**API Endpoint:**

```
GET /api/price-intelligence/:productKey?city=Jaipur&brand=Polycab
Response: {
  currentAvg: 425,
  min: 380,
  max: 520,
  median: 410,
  sampleSize: 47,
  trend: "stable",
  changePercent30d: -2.1,
  confidenceInterval: { low: 402, high: 448 },
  priceHistory: [ { month: "2026-01", avg: 430, min: 390, max: 510 }, ... ],
  cityComparison: [ { city: "Delhi", avg: 400 }, { city: "Mumbai", avg: 445 } ]
}

GET /api/price-intelligence/fairness-check
Body: { productName, brand, city, quotedPrice, quantity }
Response: {
  fairnessRating: "good" | "fair" | "high" | "suspicious",
  percentile: 35,
  marketAvg: 450,
  message: "This quote is 6% below the market average for Polycab 4mm wire in Jaipur"
}
```

---

#### 2.1.6 Fraud Detection v1 (Rules Engine)

**Files:**
- Prisma: `FraudFlag` model
- Admin: `frontend/src/pages/admin/AdminFraudPage.tsx`
- Status: Manual flagging by admins (Phase 0)

**Phase 1: Automated Rules Engine**

```typescript
interface FraudRule {
  id: string;
  name: string;
  check: (context: FraudContext) => Promise<FraudResult | null>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface FraudContext {
  entityType: 'inquiry' | 'dealer' | 'quote' | 'user';
  entityId: string;
  ipAddress: string;
  userAgent: string;
  phone?: string;
  timestamp: Date;
}
```

**Rule Set:**

| Rule | Trigger | Check | Severity | Action |
|------|---------|-------|----------|--------|
| Duplicate Inquiry | New inquiry | Same phone + similar product within 24h (Levenshtein < 0.3) | LOW-MEDIUM | Auto-merge, flag if >3 in 24h |
| Velocity Abuse | Any action | >10 inquiries/IP/hr, >5 signups/IP/hr, >20 chat msgs/10min | MEDIUM-HIGH | Rate limit + flag |
| Dealer Collusion | Registration + periodic | Same phone/IP/bank across accounts, quotes always within 1% | HIGH-CRITICAL | Suspend newer accounts |
| Quote Anomaly | New quote | Price <30% or >200% of historical avg, impossible delivery time | LOW-HIGH | Hold quote until admin review |
| Fake Inquiry | New inquiry | Invalid phone format, gibberish name (entropy check), spam database | LOW-MEDIUM | Flag for manual verification |

**Execution Flow:**

```
Incoming Action (inquiry, quote, signup)
  |
  v
FraudEngine.evaluate(context)
  |
  +-- Rule 1: duplicateCheck()      -> Redis sliding window
  +-- Rule 2: velocityCheck()       -> Redis sliding window
  +-- Rule 3: collusionCheck()      -> PostgreSQL cross-reference
  +-- Rule 4: quoteAnomalyCheck()   -> Statistical Z-score
  +-- Rule 5: fakeInquiryCheck()    -> Pattern matching
  |
  v
Results aggregated
  |
  +-- No flags:      proceed normally
  +-- LOW severity:  log, continue, show in admin dashboard
  +-- MEDIUM:        auto-hold for admin review, notify admin
  +-- HIGH:          block action, notify admin immediately
  +-- CRITICAL:      suspend entity, alert founder (Shreshth)
```

---

### 2.2 Phase 2: Intelligence Layer (Months 6-18) -- "AI-Driven"

AI begins making autonomous decisions with human oversight, not human initiation.

---

#### 2.2.1 Predictive Pricing

**Model 1: Price Prediction (XGBoost)**

```python
# Training pipeline (weekly retrain via AWS SageMaker)
features = {
    "product_category":       OneHotEncoder,    # 13 categories
    "brand_segment":          OrdinalEncoder,   # premium=3, quality=2, budget=1
    "quantity_log":           np.log1p(quantity),
    "city_tier":              int,              # 1, 2, or 3
    "month":                  int,              # seasonal effects
    "historical_30d_avg":     float,            # product+city
    "copper_price_index":     float,            # commodity price (for wires)
    "demand_index":           float,            # inquiry volume last 30d
}

target = "price_per_unit"

# Validation: MAPE (Mean Absolute Percentage Error) target < 12%
# Cold start: category + brand segment averages when < 10 data points

# Output
prediction = {
    "predicted_price": 425.0,
    "confidence_interval_low": 395.0,
    "confidence_interval_high": 460.0,
    "confidence": "high",      # based on sample size
    "model_version": "v2.3",
}
```

**Model 2: Price Anomaly Detection (Isolation Forest + Z-score)**

```python
# Hybrid approach
def detect_anomaly(quote):
    # Step 1: Z-score vs recent quotes for same product+city
    z_score = (quote.price - recent_mean) / recent_std
    if abs(z_score) > 2.5:
        flag_statistical = True

    # Step 2: Isolation Forest on multi-dimensional features
    features = [price, quantity, delivery_days, dealer_score, city_tier]
    anomaly_score = isolation_forest.predict(features)  # -1 = anomaly

    # Step 3: Combine
    return {
        "is_anomaly": flag_statistical or anomaly_score == -1,
        "anomaly_score": 0.0 - 1.0,
        "explanation": f"Quote is {pct_diff}% {'below' if z < 0 else 'above'} average"
    }
```

**Model 3: Price Trend Analysis (Prophet)**

```python
from prophet import Prophet

# Input: product_key, city, time_range
# Output: trend line + 3-month forecast
model = Prophet(
    yearly_seasonality=True,     # monsoon, Diwali effects
    weekly_seasonality=False,
    changepoint_prior_scale=0.05
)
model.fit(df[['ds', 'y']])      # ds=date, y=avg_price
forecast = model.predict(future_dates)
```

---

#### 2.2.2 Demand Forecasting

**Time Series Analysis by Category and Region:**

```typescript
interface DemandForecast {
  category: string;
  city: string;
  period: string;                // "2026-W15" or "2026-04"
  predictedInquiries: number;
  confidenceInterval: { low: number; high: number };
  seasonalFactors: {
    festival: string | null;     // "Diwali", "Navratri"
    weather: string | null;      // "monsoon", "summer"
    construction: string | null; // "peak_season", "offseason"
  };
  yoyGrowth: number;            // year-over-year %
}

// Seasonal patterns for electrical products in India:
// Fans:        Peak March-June (summer), low Nov-Feb
// Lighting:    Spike Oct-Nov (Diwali season)
// Wires/Cable: Steady with construction cycle (Feb-May peak)
// MCBs:        Tracks new construction (Jan-Jun slightly higher)
// Earthing:    Monsoon season (Jun-Sep) drives replacement
```

**Use Cases:**
- Alert dealers: "Fan demand in Jaipur expected to spike 40% next month"
- Platform ops: prioritize dealer onboarding in high-demand cities
- Inventory guidance: "Stock up on MCBs -- construction season starting"

---

#### 2.2.3 Dealer Scoring (ML-Driven)

**Feature Engineering (15 features):**

```typescript
interface DealerFeatures {
  // Responsiveness
  response_rate: number;          // quotes / inquiries_received
  avg_response_time_hours: number;
  // Competitiveness
  win_rate: number;               // Quote(SELECTED) / Quote(total)
  price_competitiveness: number;  // (market_avg - dealer_avg) / market_avg
  rank_position_avg: number;      // where they typically rank in comparisons
  // Trust
  avg_customer_rating: number;    // 1-5 stars
  review_count: number;
  verification_status: number;    // VERIFIED=1.0, else 0.0
  brand_auth_count: number;       // verified brand authorizations
  years_in_operation: number;
  document_status: number;        // all 5 docs uploaded = 1.0
  profile_completeness: number;   // 0-1
  // Activity
  service_area_count: number;
  quote_volume_30d: number;
  loss_reason_distribution: Record<string, number>; // why they lose
}
```

**Phase 2a (Month 6-9): Weighted Score**

```typescript
const weights = {
  response_rate:          0.15,
  avg_response_time:      0.10,
  win_rate:               0.20,
  price_competitiveness:  0.20,
  avg_customer_rating:    0.15,
  brand_auth_count:       0.10,
  years_in_operation:     0.05,
  profile_completeness:   0.05,
};
// DealerScore = SUM(weight_i * normalized_feature_i) * 100 -> 0-100
```

**Phase 2b (Month 12-18): Gradient Boosted Trees**

```python
import xgboost as xgb

# Target: dealer_selected (binary -- did buyer choose this dealer?)
# Features: all 15 above
# Training: weekly retrain
# Validation: AUC-ROC target > 0.75
# Output: probability of selection -> mapped to 0-100 score
```

**Score Usage:**
- Inquiry routing priority (higher score = earlier access)
- Search result ranking
- Trust badges: 80+ = "Top Dealer", 60-79 = "Reliable", <60 = no badge
- Dealer dashboard: "Your DealerScore this week: 74. Improve by responding faster."
- Recalculated daily for all active dealers via cron job

---

#### 2.2.4 Smart Routing (ML-Based Inquiry-to-Dealer Matching)

**Objective:** Maximize P(quote submitted) * P(buyer satisfied) for each inquiry-dealer pair.

```typescript
interface SmartRoutingModel {
  // For each (inquiry, dealer) pair, predict:
  quoteProb: number;         // probability dealer will respond with a quote
  winProb: number;           // probability buyer will select this dealer's quote
  satisfactionProb: number;  // probability of positive outcome (4+ star review)

  // Combined ranking score:
  // routingScore = (quoteProb * 0.4) + (winProb * 0.4) + (satisfactionProb * 0.2)
}

// Training data: historical (inquiry, dealer, outcome) triples
// Features: inquiry attributes + dealer features + interaction features
// Interaction features:
//   - Does dealer carry this exact brand? (boolean)
//   - How many times has dealer quoted this product type? (count)
//   - Dealer's avg price for this product vs inquiry budget (if known)
//   - Geographic distance (km)
//   - Time since dealer's last quote (recency)
```

---

#### 2.2.5 Anomaly Detection

**Isolation Forest + Autoencoders:**

```typescript
// Price anomaly: already covered in 2.2.1

// Behavioral anomaly detection:
interface BehaviorAnomaly {
  type: 'login_pattern' | 'inquiry_pattern' | 'quote_pattern' | 'navigation';
  entityId: string;
  anomalyScore: number;     // 0.0 (normal) to 1.0 (highly anomalous)
  features: {
    timeOfDay: number;
    dayOfWeek: number;
    actionCount: number;
    geoLocation: string;
    deviceFingerprint: string;
  };
  explanation: string;
}

// Use cases:
// - Detect bot registrations (rapid signups, no browsing behavior)
// - Detect quote manipulation (dealer systematically undercutting then raising prices)
// - Detect account takeover (login from unusual location/device)
// - Detect data scraping (rapid page views, no conversions)
```

---

#### 2.2.6 Conversation Intelligence

**Sentiment Analysis on Volt AI Chat:**

```typescript
interface ConversationIntelligence {
  sessionId: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  intent: 'browsing' | 'ready_to_buy' | 'comparing' | 'support' | 'complaint';
  topics: string[];                  // ["wires", "pricing", "delivery"]
  escalationNeeded: boolean;         // true if frustrated + unresolved
  buyerReadinessScore: number;       // 0-1, how close to conversion
}

// Implementation: Claude Haiku analyzes last 5 messages in session
// Trigger: every 5th message OR on negative sentiment detection
// Action on escalation: notify admin, offer human callback
// Track: auto-categorize all support tickets for knowledge base
```

---

### 2.3 Phase 3: Autonomous Procurement (Months 18-36) -- "AI-First"

The AI becomes the primary operator. Humans provide oversight and handle exceptions.

---

#### 2.3.1 Auto-Negotiation Agent

**Multi-Round, Constraint-Aware Negotiation:**

```
User Experience:

User: "I need 15 items for my 3BHK in Jaipur. Budget 5 lakhs."

Agent: "I'll handle procurement end-to-end. Here's my plan:
  1. Generate materials list (2 min)
  2. Get quotes from matched dealers (24-48 hrs)
  3. Negotiate best package (automated)
  4. Present final options for your approval

Starting now..."

[48 hours later]

Agent: "Negotiation complete.
  Dealer Package A (3 dealers): Rs 4,12,000 -- 7-day delivery
  Dealer Package B (2 dealers): Rs 4,35,000 -- 3-day delivery
  Mixed Optimal (5 dealers):    Rs 3,89,000 -- 5-10 days
  Savings vs MRP: Rs 1,84,000 (32%)
  Want me to finalize?"
```

**Architecture: Multi-Agent System**

```
+-------------------------------------------------------+
|              ORCHESTRATOR AGENT                        |
|  Role: Coordinate workflow, manage state, user comms   |
|  Model: Claude Sonnet (reasoning + planning)           |
|  State: FSM (Finite State Machine)                     |
|    REQUIREMENTS -> MATERIALS_PLANNING ->               |
|    INQUIRY_SUBMISSION -> QUOTE_COLLECTION ->            |
|    COMPARISON -> NEGOTIATION -> FINALIZATION            |
+------+--------+--------+--------+--------------------+
       |        |        |        |
  +----v---+ +--v-----+ +v------+ +v-----------+
  |MATERIAL| |PRICING | |LOGIST.| |NEGOTIATION |
  |PLANNER | |ENGINE  | |AGENT  | |AGENT       |
  |        | |        | |       | |            |
  |Generate| |Fairness| |Deliv. | |"Can you do |
  |BOQ from| |check + | |time + | |Rs X for   |
  |project | |market  | |route  | |the whole   |
  |specs   | |analysis| |optim. | |order?"     |
  +--------+ +--------+ +-------+ +------------+
```

**Negotiation Logic:**

```typescript
interface NegotiationStrategy {
  // Game theory: Nash bargaining solution
  buyerReservationPrice: number;     // max buyer will pay
  dealerReservationPrice: number;    // min dealer will accept (estimated)
  bestAlternative: number;           // next best offer from another dealer

  // Multi-round approach:
  round1: "Request initial quote";
  round2: "Share anonymized competing offers";
  round3: "Propose package deal (volume discount)";
  round4: "Final take-it-or-leave-it based on BATNA";

  // Constraints:
  maxRounds: 4;
  timeoutHours: 48;
  minDealerMargin: 0.08;            // never push below 8% estimated margin
  humanApprovalRequired: true;       // buyer approves final package
}
```

**Technology:**
- LangChain.js for agent framework
- Claude API for reasoning and natural language generation
- Custom FSM for workflow state management
- PostgreSQL for persistent agent state (resume interrupted workflows)
- Redis for real-time inter-agent communication

---

#### 2.3.2 Procurement Copilot

**End-to-End Procurement Assistant:**

```typescript
interface ProcurementCopilot {
  // Input: natural language project description
  projectDescription: string; // "3BHK in Jaipur, 1800 sqft, modern design"

  // Step 1: Requirements Gathering (conversational)
  requirements: {
    projectType: "1BHK" | "2BHK" | "3BHK" | "villa" | "office" | "shop";
    area: number;              // sq ft
    city: string;
    budget: number;
    preferences: {
      brandTier: "premium" | "quality" | "budget";
      smartHome: boolean;
      solar: boolean;
    };
  };

  // Step 2: Materials Planning (AI-generated BOQ)
  billOfQuantities: Array<{
    category: string;          // "Wires & Cables"
    items: Array<{
      product: string;
      brand: string;
      specification: string;
      quantity: number;
      unit: string;
      estimatedPrice: number;
    }>;
    categoryTotal: number;
  }>;

  // Step 3-7: Automated inquiry -> quote -> compare -> select -> track
}
```

**Materials Planner Knowledge Base:**
- BIS wiring standards (wire sizing by load)
- Standard electrical layouts per room type
- Regional preferences (North vs South India)
- Climate considerations (coastal: corrosion-resistant, hot: BLDC fans)

---

#### 2.3.3 Supply Chain Prediction

**Delivery Time Prediction (Random Forest):**

```python
features = {
    "dealer_avg_delivery_days":  float,
    "dealer_delivery_std":       float,
    "product_availability":      "in_stock" | "order_to_make",
    "geo_distance_km":           float,      # Haversine
    "season":                    "normal" | "monsoon" | "festival",
    "day_of_week":               int,
    "quantity":                  int,
}
# Output: { estimated_days: 4, confidence_range: [3, 6] }
```

**Stock-Out Prediction:**
- Track quote volumes per dealer per product
- Dealer stops quoting a product they usually carry: likely stock-out
- 3+ dealers in a city stop quoting same product: supply chain issue
- Alert: "Polycab 4mm wire may be in short supply in Jaipur"

**Alternative Product Suggestion:**
- Knowledge graph of equivalent products across brands
- Auto-suggest: "Polycab 4mm FRLS unavailable? Try Havells LifeGuard 4mm (same specs, +5%)"

---

#### 2.3.4 Knowledge Graph

**Graph Database of Products, Specs, Compatibility:**

```typescript
interface KnowledgeGraphNode {
  type: "product" | "brand" | "specification" | "category" | "standard";
  id: string;
  properties: Record<string, any>;
}

interface KnowledgeGraphEdge {
  type: "is_brand_of" | "has_specification" | "compatible_with"
      | "alternative_to" | "required_with" | "belongs_to_category"
      | "meets_standard";
  source: string;
  target: string;
  properties: { confidence: number; source: string };
}

// Example relationships:
// Polycab 4mm FRLS --[alternative_to]--> Havells LifeGuard 4mm
// MCB 32A --[required_with]--> RCCB 40A
// Polycab 4mm FRLS --[meets_standard]--> BIS IS 694:2020
// LED Panel 15W --[compatible_with]--> LED Driver 15W
```

**Auto-Expansion:**
- Parse product catalogs from ScrapedProduct data
- Extract specifications using Claude API
- Build relationships from co-purchase patterns
- Technology: Neo4j (if scale justifies) or PostgreSQL recursive CTEs

---

#### 2.3.5 Computer Vision

**Product Identification from Photos:**

```
Input: Photo of any electrical product
Output: { brand, model, specifications, category, marketplace_links }

Phase 1: Claude Vision API (already working)
Phase 2: Fine-tuned image classifier
  Dataset: ScrapedProduct.rawImages
  Model: EfficientNet, fine-tuned on electrical products
  Classes: top 500 products by frequency
  Deployment: TensorFlow.js for client-side (offline capable)
  Accuracy target: 85% top-5

Use Cases:
  "Snap & Buy": photograph product in any shop, get Hub4Estate price comparison
  Inventory verification: dealers photograph stock for catalog
  Quality check: identify counterfeit products from packaging differences
```

---

### 2.4 AI Infrastructure & MLOps

**Phase 1 (Months 0-6):**

```
AI Service Layer:
  +-- Claude API (Anthropic)
  |     Models: sonnet (chat), haiku (fast/cheap tasks)
  |     Budget: $500/month
  |     Rate limits: 4000 RPM
  |
  +-- Google Cloud Vision API (OCR fallback)
  |     Budget: $50/month
  |
  +-- Web Speech API (free, browser-native)
  |
  +-- Redis (ElastiCache cache.t3.micro)
        Caching AI responses, feature vectors
```

**Phase 2 (Months 6-18):**

```
New additions:
  +-- pgvector extension (on existing RDS)
  |     Columns: Product.embedding, SearchQuery.embedding
  |
  +-- MLflow (experiment tracking)
  |     Track: model versions, hyperparameters, metrics
  |
  +-- Feature Store (PostgreSQL materialized views)
  |     Tables: DealerFeatures, ProductFeatures, PriceFeatures
  |     Refresh: hourly via cron
  |
  +-- XGBoost models (AWS SageMaker ml.m5.large)
  |     Training: weekly, ~$100/month
  |     Serving: Export to JSON, inference in Node.js
  |
  +-- OpenAI Embeddings (text-embedding-3-small)
        Semantic search, ~$10/month
```

**Phase 3 (Months 18-36):**

```
New additions:
  +-- GPU Instance (g4dn.xlarge or Lambda A10)
  |     Custom model training, $0.526/hr spot
  |
  +-- LangChain.js Agent Framework
  |     Autonomous procurement agent
  |
  +-- Pinecone or Qdrant (vector search at >1M products)
  |     $70/month
  |
  +-- DVC (Data Version Control, S3 backend)
  |
  +-- GrowthBook (A/B testing, self-hosted)
```

**Model Monitoring:**

```typescript
interface ModelMonitoring {
  metrics: {
    accuracy: number;        // MAPE for regression, AUC for classification
    latency_p50: number;     // milliseconds
    latency_p95: number;
    latency_p99: number;
    daily_cost: number;      // USD
    error_rate: number;      // failed / total
    drift_score: number;     // KL divergence on input features
  };
  alerts: {
    accuracy_drop_5pct:   "Slack alert";
    latency_p95_gt_5s:    "PagerDuty alert";
    cost_exceeds_budget:  "Email alert";
    error_rate_gt_1pct:   "Immediate investigation";
  };
  dashboard: "Grafana panels for all AI metrics";
}
```

---

## 3. UI/UX Design System

### 3.1 Design Principles

Six non-negotiable principles governing every design decision:

**Principle 1: Bright, Positive, Modern**
Founder mandate: "Hates dark/negative UI -- always bright, positive, modern." White backgrounds dominate. Color used purposefully, not liberally. The platform should feel energetic and trustworthy.

**Principle 2: Mobile-First, Desktop-Optimized**
60%+ of Indian users access marketplaces on mobile. Every screen designed for 360px width first. Touch targets minimum 44x44px. Bottom-sticky CTAs on mobile for thumb reach.

**Principle 3: Information Density by Context**
- Buyer-facing: Clean, spacious, one action per screen
- Dealer dashboard: Moderate density, key metrics visible without scrolling
- Admin panel: Dense tables, filters, bulk actions, efficiency over aesthetics

**Principle 4: Motion with Purpose**
Every animation communicates state: fade-up = "loaded", slide-right = "new step", scale-in = "overlay appearing", pulse = "needs attention". If removing an animation reduces no clarity, remove it.

**Principle 5: Progressive Disclosure**
Show the minimum needed for a decision. Details on demand (expand, modal, detail page). Never overwhelm with all information at once.

**Principle 6: Trust Through Transparency**
Every price, every dealer, every score has an explanation. "Why this price?" always has an answer. No black boxes.

---

### 3.2 Design Tokens

#### 3.2.1 Colors

**Source of truth:** `frontend/tailwind.config.js`

**Primary Palette (Warm Beige/Tan -- trust, warmth):**

```
50:  #faf9f7    page backgrounds, subtle fills
100: #f5f3ef    card backgrounds, hover states
200: #e8e4db    borders, dividers
300: #d4cdc0    disabled states
400: #b8ad9a    placeholder text
500: #9c8e78    MAIN BRAND COLOR -- headers, muted primary buttons
600: #8a7a62    hover state for 500
700: #726452    active state
800: #5e5345    body text on light backgrounds
900: #4d4439    headings, high-emphasis text
```

**Accent Palette (Terracotta/Amber -- energy, action, CTA):**

```
50:  #fdf8f5    subtle accent backgrounds
100: #faeee8    notification backgrounds
200: #f5dcd0    progress bars (incomplete)
300: #edc4b0    borders on accent elements
400: #e3a688    secondary accent
500: #d3815e    PRIMARY ACCENT -- CTA buttons, links, active states
600: #c4724f    CTA hover
700: #a85f42    CTA active/pressed
800: #8c4e37    accent text on light backgrounds
900: #74412f    dark accent for emphasis
```

**NOTE:** The live site uses amber (#D97706, Tailwind `amber-600`) extensively for CTAs, the Volt AI bot accent, and interactive elements. The tailwind config defines terracotta (#d3815e) but implementation uses both. Engineering should standardize on amber for all new CTA elements.

**Neutral Palette (Gray -- content, structure):**

```
50:  #fafafa    page background
100: #f5f5f5    card backgrounds, table rows (alt)
200: #e5e5e5    borders, dividers, skeleton loaders
300: #d4d4d4    disabled borders
400: #a3a3a3    placeholder text, disabled text
500: #737373    secondary text, captions
600: #525252    body text
700: #404040    subheadings
800: #262626    headings, emphasis
900: #171717    primary text, high contrast
950: #0a0a0a    near-black, hero sections
```

**Semantic Colors:**

```
Success:
  500: #22c55e    success icons, badges
  100: #dcfce7    success alert backgrounds
  800: #166534    success text

Warning:
  500: #f59e0b    warning icons
  600: #d97706    AMBER CTA COLOR (widely used in codebase)
  100: #fef3c7    warning backgrounds
  800: #92400e    warning text

Error:
  500: #ef4444    error icons, destructive buttons
  100: #fee2e2    error backgrounds
  800: #991b1b    error text
```

**Special Colors:**

```
Deep Navy:    #0B1628   ElectricalCursor inner dot, hero backgrounds
Orange-500:   (Tailwind) Volt AI bot accent, avatar background
Gray-900:     #111827   Volt AI header, chatbot primary buttons
```

**Color Usage Matrix:**

| Context | Color | Example |
|---------|-------|---------|
| Primary CTA | `neutral-900` bg, white text | "Submit Inquiry", "Get Quotes" |
| Secondary CTA | white bg, `neutral-900` border | "Learn More", "View All" |
| Accent/Urgent CTA | `accent-600` bg, white text | "Quote Now", "Limited Time" |
| Links | `accent-500` or `amber-600` | In-text navigation |
| Headings | `neutral-900` | Page titles, section headers |
| Body text | `neutral-600` to `neutral-700` | Paragraphs |
| Captions | `neutral-500` | Timestamps, helper text |
| Backgrounds | white, `neutral-50`, `neutral-100` | Layered depth |
| Borders | `neutral-200` to `neutral-300` | Cards, inputs |
| Error states | `error-500` border, `error-50` bg | Form validation |
| Success states | `success-500` text, `success-100` bg | Verified badges |

---

#### 3.2.2 Typography

**Source of truth:** `frontend/tailwind.config.js`

**Font Families:**

```css
font-sans:    'Inter', system-ui, sans-serif
font-display: 'Playfair Display', Georgia, serif
font-mono:    'JetBrains Mono', monospace
```

- **Inter** -- All interface text. Weights: 300-900. Google Fonts `display=swap`.
- **Playfair Display** -- Hero headlines on pitch/marketing pages ONLY. Never in app UI.
- **JetBrains Mono** -- Inquiry numbers (HUB-WIRE-0001), prices, model numbers, code blocks.

**Type Scale:**

```
Display 2XL:  4.5rem / 72px   Hero headlines (pitch pages only)
Display XL:   3.75rem / 60px  Section hero text
Display LG:   3rem / 48px     Page titles (marketing)
Display MD:   2.25rem / 36px  Section titles
Display SM:   1.875rem / 30px Sub-section titles

5xl: 3rem / 48px              Dashboard stat numbers
4xl: 2.25rem / 36px           Page headers (app)
3xl: 1.875rem / 30px          Section headers (app)
2xl: 1.5rem / 24px            Card titles
xl:  1.25rem / 20px           Subsection headers
lg:  1.125rem / 18px          Lead paragraph text
base: 1rem / 16px             Body text
sm:  0.875rem / 14px          Secondary text, captions, table cells
xs:  0.75rem / 12px           Fine print, badges, timestamps
```

**Standard Text Styles:**

```
Page Title:     text-2xl font-bold uppercase tracking-wide text-neutral-900
Section Header: text-xl font-bold uppercase tracking-wide text-neutral-900
Card Title:     text-lg font-semibold text-neutral-900
Body:           text-base text-neutral-600
Secondary:      text-sm text-neutral-500
Caption:        text-xs text-neutral-400
Label:          text-sm font-bold uppercase tracking-wide text-neutral-900
Badge:          text-xs font-bold uppercase tracking-wider
Monospace:      font-mono text-sm text-neutral-700
```

---

#### 3.2.3 Spacing

**Base unit: 4px**

```
0:   0px
1:   4px       Tight inline spacing
2:   8px       Between related elements
3:   12px      Compact padding
4:   16px      Standard padding (px-4, py-4)
5:   20px      Medium gaps
6:   24px      Section padding (p-6)
8:   32px      Large gaps between sections
10:  40px      Section margins
12:  48px      Major section breaks
16:  64px      Page-level spacing
20:  80px      Hero section padding
24:  96px      Maximum vertical spacing
```

---

#### 3.2.4 Shadows

**Source of truth:** `frontend/tailwind.config.js` boxShadow extensions

```
shadow-brutal:       4px 4px 0px 0px rgba(0,0,0,1)      Standard neobrutalist depth
shadow-brutal-sm:    2px 2px 0px 0px rgba(0,0,0,1)      Subtle depth
shadow-brutal-lg:    6px 6px 0px 0px rgba(0,0,0,1)      Prominent depth
shadow-brutal-xl:    8px 8px 0px 0px rgba(0,0,0,1)      Hero/modal depth
shadow-inner-brutal: inset 2px 2px 0px rgba(0,0,0,0.1)  Pressed state
shadow-soft:         0 4px 20px -2px rgba(0,0,0,0.1)    Modern soft shadow
shadow-soft-lg:      0 10px 40px -5px rgba(0,0,0,0.15)  Card hover
shadow-soft-xl:      0 20px 60px -10px rgba(0,0,0,0.2)  Modal overlay
shadow-glow:         0 0 40px rgba(211,129,94,0.3)       Accent glow
shadow-glow-lg:      0 0 60px rgba(211,129,94,0.4)       CTA glow
```

**Usage pattern:** Rest = no shadow. Hover = shadow-brutal (lift). Active = shadow-brutal-sm + translate (press down).

---

#### 3.2.5 Border Radius

```
sm:   0.25rem / 4px    Badges, small elements
md:   0.375rem / 6px   Buttons, inputs (default)
lg:   0.5rem / 8px     Cards, containers
xl:   0.75rem / 12px   Modals, large cards
2xl:  1rem / 16px      Pills, rounded sections
4xl:  2rem / 32px      Extended (custom in config)
5xl:  2.5rem / 40px    Extended (custom in config)
full: 9999px           Circles, pills
```

---

#### 3.2.6 Breakpoints

```
sm:   640px    Large phones (landscape), small tablets
md:   768px    Tablets (portrait)
lg:   1024px   Tablets (landscape), small laptops
xl:   1280px   Standard laptops
2xl:  1536px   Large desktops
```

---

### 3.3 Component Library

**Source of truth:** `frontend/src/components/ui/index.tsx` + `frontend/src/components/ui/OTPInput.tsx`

---

#### 3.3.1 Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'urgent';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
```

| Variant | Background | Border | Text | Hover | Use Case |
|---------|-----------|--------|------|-------|----------|
| primary | neutral-900 | neutral-900 | white | bg-white, text-neutral-900, shadow-brutal | Submit, Save, Confirm |
| secondary | white | neutral-900 | neutral-900 | bg-neutral-900, text-white, shadow-brutal | Cancel, Back, View |
| accent | accent-600 | accent-600 | white | bg-accent-700, shadow-brutal | Quote Now, Get Started |
| ghost | transparent | transparent | neutral-700 | bg-neutral-100 | Filters, toggles |
| urgent | neutral-950 | neutral-950 | white | bg-accent-600, scale-105, shadow-brutal-lg | Limited Offer |

**Sizes:**
- sm: `px-4 py-2 text-sm`
- md: `px-6 py-3 text-base`
- lg: `px-8 py-4 text-lg`

**States:**
- Loading: `Loader2` icon with `animate-spin`, button disabled
- Disabled: `opacity-50 cursor-not-allowed`
- Active: `translate-x-[2px] translate-y-[2px]` (neobrutalist press)

---

#### 3.3.2 Input Fields

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}
```

**Styles:**
- Border: `2px solid neutral-300` (default), `neutral-900` (focus), `error-500` (error)
- Padding: `px-4 py-4` (generous touch targets)
- Error: red border + error message below in `text-sm text-error-500`
- Helper: `text-sm text-neutral-500` below input
- Disabled: `bg-neutral-100 cursor-not-allowed`
- Label: `text-sm font-bold uppercase tracking-wide text-neutral-900`
- Transition: `transition-all duration-200`

**Textarea:** Same styles, `min-h-[120px]`, `resize-y`

**Select:** Native `<select>` with custom styling (plan: migrate to Radix Select)

**Checkbox/Radio:** Custom styled with `accent-color: neutral-900`

**Toggle:** Styled switch with `transition-all duration-200`, green when on

**Date Picker:** Native `<input type="date">` (plan: custom date picker in Phase 2)

---

#### 3.3.3 Cards

**Product Card:**
```
+----------------------------------+
| [Product Image]                  |
| Brand Badge                      |
|                                  |
| Product Name                     |
| Model Number (mono)              |
| Price Range: Rs 380 - Rs 520    |
| [Get Quotes] button              |
+----------------------------------+
Border: 2px solid neutral-200
Hover: shadow-soft-lg, -translate-y-1
```

**Dealer Card:**
```
+----------------------------------+
| [Avatar] Dealer Name             |
| City | Verified Badge            |
| DealerScore: 74/100 (progress)  |
| Brands: [chip] [chip] [chip]    |
| Response Time: < 2h             |
| [View Profile] [Contact]        |
+----------------------------------+
```

**Inquiry Card:**
```
+----------------------------------+
| HUB-WIRE-0042 (mono)            |
| Status Badge (StatusBadge)       |
| Product: Polycab 4mm FRLS       |
| Qty: 200 meters | City: Jaipur  |
| Quotes Received: 3/5            |
| Created: 2h ago                  |
| [View Details] ->                |
+----------------------------------+
```

**Quote Card:**
```
+----------------------------------+
| Dealer Name | DealerScore Badge  |
| Price: Rs 425/m (mono, large)   |
| Total: Rs 85,000                |
| Delivery: 3-5 days              |
| Fairness: "Good Deal" (green)   |
| [Select This Quote]             |
+----------------------------------+
```

**Stat Card:**
```
+----------------------------------+
| Icon (Lucide)                    |
| 1,247 (5xl, mono)               |
| Total Inquiries (sm, neutral-500)|
| +12% vs last month (success-500)|
+----------------------------------+
```

---

#### 3.3.4 Modals and Sheets

**Modal (Dialog):**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';  // max-w-sm/md/lg/xl
}
```

- Backdrop: `neutral-900/80` + `backdrop-blur-sm`
- Container: white bg, `border-2 border-neutral-900`, `shadow-brutal-lg`
- Header: `p-6`, `border-b-2`, title `uppercase tracking-wide`, X close button
- Body: `p-6`
- Animation: `animate-scale-in` (scaleIn keyframe)
- Close: clicking backdrop OR X button

**Bottom Sheet (mobile):**
- Full width, slides up from bottom
- `border-t-2 border-neutral-900`
- Drag handle indicator at top (8px wide, neutral-300)
- Max height: 80vh, scrollable content
- Used on mobile for actions that are modals on desktop

**Drawer (side panel):**
- Slides from right, `w-96` on desktop
- Used for: inquiry detail view, dealer profile preview
- `border-l-2 border-neutral-900`

**Toast (notification):**
- Plan: `react-hot-toast` integration
- Positioned top-right on desktop, top-center on mobile
- Auto-dismiss: 4s for success, 6s for error
- Variants: success, error, info, warning

---

#### 3.3.5 Navigation

**Header (buyer-facing):**
- Logo left, nav links center, auth/avatar right
- Sticky on scroll with `backdrop-blur-sm`
- Mobile: hamburger menu (top-left), avatar (top-right)

**Sidebar (admin/dealer):**
- Desktop: `w-64`, full sidebar with icon + label
- Tablet: `w-16`, icon-only collapsed sidebar
- Mobile: drawer overlay (hamburger toggle)
- Active item: `bg-neutral-900 text-white`
- Items: icon (Lucide) + label, `uppercase tracking-wide text-sm`

**Breadcrumb:**

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;    // undefined = current page (bold, non-clickable)
}
// Home always first, "/" separators
// All items: uppercase tracking-wide
```

**Tabs:**

```typescript
interface Tab {
  id: string;
  label: string;
  count?: number;
}
// Bottom border indicator: 2px solid neutral-900
// Active tab: font-bold, neutral-900
// Inactive: neutral-500
// Count badge: neutral-900 bg (active), neutral-200 bg (inactive)
// Transition: 200ms
```

**Pagination:**
- `[< Prev]  1  2  [3]  4  5  [Next >]`
- Active page: `bg-neutral-900 text-white`
- Disabled prev/next: `opacity-50 cursor-not-allowed`

**Stepper (multi-step forms):**

```typescript
interface Step { label: string; description?: string; }
// Step circles: 48x48px, numbered
// Completed: neutral-900 bg, Check icon (white)
// Active: accent-500 bg, shadow-brutal-sm
// Future: white bg, neutral-300 border
// Connecting lines: neutral-900 (completed), neutral-200 (future)
// Used in: Dealer Onboarding, RFQ creation
```

---

#### 3.3.6 Data Display

**Table:**
- Header: `bg-neutral-50`, `text-sm font-bold uppercase tracking-wide`
- Rows: alternate `bg-white` / `bg-neutral-50`
- Hover: `bg-neutral-100`
- Sortable columns: click header to sort, arrow indicator
- Mobile: horizontal scroll or card-list transformation
- Pagination below table

**List:**
- Vertical stack of items with `border-b border-neutral-200`
- Each item: content left, actions right
- Hover: `bg-neutral-50`

**Badge (StatusBadge):**

```typescript
type BadgeVariant = 'success' | 'warning' | 'error' | 'info'
                  | 'pending' | 'default' | 'urgent';
type BadgeSize = 'sm' | 'md';
// Uppercase, bold, tracking-wider
// Urgent: animate-pulse-slow
// Each variant maps to semantic color bg + text
```

**Avatar:**
- Circle with initials or image
- Sizes: `w-8 h-8` (sm), `w-10 h-10` (md), `w-12 h-12` (lg)
- Fallback: neutral-200 bg, initials in neutral-600

**Tooltip:**
- Plan: Radix Tooltip integration
- Dark bg (neutral-900), white text, `text-xs`
- Arrow pointing to trigger element
- Delay: 300ms show, 100ms hide

**Progress:**
- Bar: `h-2 bg-neutral-200` container, `bg-neutral-900` fill
- Animated width transition: `transition-all duration-500`
- Label above or beside: percentage or fraction

**Skeleton:**

```typescript
// Skeleton: generic animated placeholder
//   bg-neutral-200 + animate-pulse
// CardSkeleton: full card placeholder
//   image area + title line + description lines + button area
// ListSkeleton: multiple row placeholders
//   count prop for number of rows
// Rule: Use Skeleton for content, LoadingSpinner for actions
```

---

#### 3.3.7 Feedback

**LoadingSpinner:**
- Lucide `Loader2` icon with `animate-spin`
- Sizes: sm (16px), md (24px), lg (32px)

**PageLoader:**
- Centered spinner + message
- Full viewport height with flex centering

**EmptyState:**

```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;   // Optional CTA button
}
// Centered layout, border-2 border-dashed border-neutral-300
// Icon in 80x80 neutral-900 square
// Title: uppercase tracking-wide
```

**ErrorState:**
- Red-tinted version of EmptyState
- Icon: `AlertTriangle`
- "Try Again" button

**SuccessState:**
- Green-tinted, Check icon
- Used after form submissions, confirmations

**Countdown:**
- Hours / Minutes / Seconds boxes
- Used for time-limited offers
- Each unit in its own bordered box

---

#### 3.3.8 Charts (Recharts)

**Bar Chart:**
- Admin analytics: category distribution, city breakdown
- Colors: neutral-900 (primary bars), accent-500 (comparison bars)
- Tooltip on hover with exact values
- Responsive: `<ResponsiveContainer width="100%" height={300}>`

**Line Chart:**
- Price trends, inquiry volume over time
- Stroke: neutral-900 (primary), neutral-400 (secondary)
- Dots on data points, tooltip on hover
- Area fill: `neutral-100` for primary series

**Pie/Donut Chart:**
- Category distribution, status breakdown
- Colors: cycle through neutral-900, accent-500, neutral-400, success-500, warning-500
- Labels with percentage

**Area Chart:**
- Revenue trends, growth metrics
- Gradient fill from accent-500/20 to transparent

**Sparkline:**
- Inline mini chart in stat cards
- No axes, no labels, just the trend line
- Width: 80px, Height: 24px

**Chart Configuration Pattern:**

```typescript
const chartConfig = {
  colors: {
    primary:   '#171717',   // neutral-900
    secondary: '#d3815e',   // accent-500
    tertiary:  '#a3a3a3',   // neutral-400
    success:   '#22c55e',
    warning:   '#d97706',
    error:     '#ef4444',
  },
  tooltip: {
    bg: '#171717',
    text: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
  },
  grid: {
    stroke: '#e5e5e5',      // neutral-200
    strokeDasharray: '3 3',
  },
  font: {
    family: 'Inter, sans-serif',
    size: 12,
    color: '#737373',       // neutral-500
  },
};
```

---

### 3.4 Animation System

#### 3.4.1 Micro-Interactions

```
Button press:     active:translate-x-[2px] active:translate-y-[2px]
                  (neobrutalist "stamp" effect)

Button hover:     hover:shadow-brutal (shadow appears, "lifts")
                  hover:bg-white hover:text-neutral-900 (color inversion)

Input focus:      focus:border-neutral-900 (from neutral-300)
                  transition-all duration-200

Card hover:       hover:shadow-soft-lg hover:-translate-y-1
                  transition-all duration-300

Tab switch:       200ms opacity fade between content panels

Modal open:       animate-scale-in (0.95 to 1.0 scale)
                  backdrop: transition-opacity

Skeleton pulse:   animate-pulse (Tailwind built-in)

Loading spinner:  animate-spin on Loader2

Volt AI ping:     Orange ping animation on bot button
                  Spinning Zap + Sparkles icons (custom keyframes)
                  Bounce notification dot (first-time users)
```

---

#### 3.4.2 Page Transitions

```
Fade:   opacity 0 -> 1, duration 300ms
        Use: default page transition

Slide:  translateX(30px) + opacity 0 -> translateX(0) + opacity 1
        Use: navigating forward in a flow

Scale:  scale(0.95) + opacity 0 -> scale(1) + opacity 1
        Use: modals, overlays, detail panels
```

**Implementation plan:** Framer Motion `AnimatePresence` wrapping React Router.

```typescript
// Planned migration:
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit:     { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// In App.tsx:
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/" element={
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <HomePage />
      </motion.div>
    } />
  </Routes>
</AnimatePresence>
```

---

#### 3.4.3 Scroll Animations

**Current: Custom `useInView` hook + `revealStyle` utility**

```typescript
// Actual codebase pattern:
const { ref, inView } = useInView(0.06);  // 6% intersection threshold

<div ref={ref} style={revealStyle(inView, index)}>
  {/* Content fades up when scrolled into view */}
</div>

// revealStyle generates:
const revealStyle = (inView: boolean, index: number): React.CSSProperties => ({
  opacity: inView ? 1 : 0,
  transform: inView ? 'translateY(0)' : 'translateY(20px)',
  transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
});
// Stagger: each child delays 100ms (index * 0.1s)
```

**Planned migration to Framer Motion:**

```typescript
// Replace useInView + revealStyle with:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.06 }}
  transition={{ duration: 0.6, delay: index * 0.1 }}
>
  {children}
</motion.div>
```

---

#### 3.4.4 Loading Animations

**Skeleton Screens:**
- `bg-neutral-200 animate-pulse rounded`
- Match the layout of content being loaded
- Card skeleton: image rect + 3 text lines + button rect

**Shimmer Effect (planned):**

```css
.shimmer {
  background: linear-gradient(
    90deg,
    #e5e5e5 25%,
    #f5f5f5 50%,
    #e5e5e5 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Progressive Loading:**
- Low-quality image placeholder -> full image (blur-up technique)
- Skeleton -> partial content -> full content
- Chart: axes first -> data points animate in

---

#### 3.4.5 Data Animations

**Count-Up Numbers:**

```typescript
// For dashboard stat cards:
// Counter animation in tailwind.config.js:
// animation: 'counter': 'counter 2s ease-out forwards'
// keyframes: counter: { '0%': { '--num': '0' }, '100%': { '--num': 'var(--target)' } }

// Implementation with Framer Motion (planned):
import { useMotionValue, useTransform, animate } from 'framer-motion';

function CountUp({ target, duration = 2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, target, { duration });
    return animation.stop;
  }, [target]);

  return <motion.span>{rounded}</motion.span>;
}
```

**Chart Animations:**
- Bars grow from 0 to final height: `barGrow` keyframe
- Lines draw from left to right: `strokeDasharray` + `strokeDashoffset` animation
- Pie slices rotate in: `transform: rotate` transition

**Bar Growth (current AISection):**

```css
@keyframes barGrow { from { width: 0%; } }
.barGrow { animation: barGrow 1s ease-out forwards; }
```

---

#### 3.4.6 Tailwind Animation Presets

**Complete animation configuration from `tailwind.config.js`:**

```javascript
animation: {
  'slide-up':    'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-down':  'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-left':  'slideLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-right': 'slideRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  'fade-in':     'fadeIn 0.5s ease-out',
  'scale-in':    'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  'bounce-in':   'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'marquee':     'marquee 25s linear infinite',
  'spin-slow':   'spin 8s linear infinite',
  'counter':     'counter 2s ease-out forwards',
},

keyframes: {
  slideUp:    { '0%': { transform: 'translateY(30px)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' } },
  slideDown:  { '0%': { transform: 'translateY(-30px)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' } },
  slideLeft:  { '0%': { transform: 'translateX(30px)', opacity: '0' },
                '100%': { transform: 'translateX(0)', opacity: '1' } },
  slideRight: { '0%': { transform: 'translateX(-30px)', opacity: '0' },
                '100%': { transform: 'translateX(0)', opacity: '1' } },
  fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
  scaleIn:    { '0%': { transform: 'scale(0.95)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' } },
  bounceIn:   { '0%': { transform: 'scale(0.3)', opacity: '0' },
                '50%': { transform: 'scale(1.05)' },
                '70%': { transform: 'scale(0.9)' },
                '100%': { transform: 'scale(1)', opacity: '1' } },
  marquee:    { '0%': { transform: 'translateX(0%)' },
                '100%': { transform: 'translateX(-100%)' } },
  counter:    { '0%': { '--num': '0' },
                '100%': { '--num': 'var(--target)' } },
},

transitionTimingFunction: {
  'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'smooth':    'cubic-bezier(0.16, 1, 0.3, 1)',
},
```

**AI Section Custom Keyframes (AISection.tsx):**

```css
@keyframes aiSlideUp    { from { opacity: 0; transform: translateY(10px); }
                          to   { opacity: 1; transform: translateY(0); } }
@keyframes aiSlideRight { from { opacity: 0; transform: translateX(-10px); }
                          to   { opacity: 1; transform: translateX(0); } }
@keyframes aiFadeIn     { from { opacity: 0; } to { opacity: 1; } }
@keyframes barGrow      { from { width: 0%; } }
```

---

#### 3.4.7 Custom Cursor (ElectricalCursor.tsx)

Canvas-based custom cursor (desktop only):
- **Inner dot:** 2.5px radius, Deep Navy (#0B1628) fill
- **Outer ring:** 15px radius, amber-600 stroke (`rgba(217, 119, 6, 0.38)`)
- **Trail:** 8-point fading trail, amber-700 (`rgba(180, 83, 9, alpha)`)
- **Easing:** Ring follows mouse with 0.14 lerp factor (elegant lag)
- **CSS override:** `* { cursor: none !important; }`
- **Canvas:** full viewport, `pointerEvents: none`, z-index 9999
- **Note:** Disable on mobile/touch-primary devices

---

#### 3.4.8 Animation Tools

**Framer Motion (Priority: HIGH)**
- Package: `framer-motion` (~40KB gzip)
- Replace `useInView`/`revealStyle` with declarative `<motion.div>`
- Add `AnimatePresence` for route transitions
- Shared layout animations for card-to-detail transitions
- Drag-and-drop for slip scanner result reordering

**@formkit/auto-animate (Priority: HIGH -- Quick Win)**
- Package: `@formkit/auto-animate` (~2KB gzip)
- Automatic list add/remove animations
- Single `ref` on parent element -- zero config

**GSAP ScrollTrigger (Priority: MEDIUM)**
- Hero parallax effects on marketing pages
- Complex timeline animations
- Pin-scroll sections

**Lottie (Priority: LOW -- Phase 2)**
- Branded loading animations
- Celebration animations (confetti after inquiry submission)
- Empty state illustrations
- Requires designer to create JSON files

---

### 3.5 Mobile-First Responsive Design

#### 3.5.1 Layout Patterns

**Mobile (< 640px):**
- Navigation: hamburger (top-left), avatar (top-right)
- Content: single column, full-width cards
- CTAs: bottom-sticky bar with primary action
- Tables: card-list view (each row becomes a card)
- Modals: full screen (not centered overlay)
- Typography: display sizes reduced ~30%
- Inquiry form: stacked fields, full-width buttons
- Quote comparison: vertical card stack

**Tablet (640px - 1024px):**
- Navigation: side nav visible on lg+, hamburger on md
- Content: 2-column grids
- Tables: horizontal scroll for many columns
- Modals: centered overlay (max-w-lg)
- Admin sidebar: collapsed to icons
- Dashboard: 2-column stat grid

**Desktop (> 1024px):**
- Navigation: full sidebar (admin/dealer), top nav + dropdown (buyer)
- Content: 3-4 column grids
- Tables: full with sorting, filtering, pagination
- Dashboard: 4-column stat grid, side panels
- Quote comparison: side-by-side table view
- Full hover interactivity (cursor effects, tooltips)

---

#### 3.5.2 Touch Targets

```
Minimum touch target:          44px x 44px (Apple HIG)
Button min-height:             44px (py-3 on md, py-4 on lg)
List item min-height:          48px
Spacing between tappable items: 8px minimum
```

---

#### 3.5.3 Swipe Gestures (Planned)

```
Left swipe on inquiry card:   Quick actions (archive, share)
Right swipe on notification:  Dismiss
Pull down:                    Refresh (inquiry list, dashboard)
Swipe between tabs:           Tab navigation (inquiry tabs)
```

---

#### 3.5.4 Responsive Grid Configuration

```typescript
// Standard grid patterns:
const gridPatterns = {
  productGrid:  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  dealerGrid:   "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  statGrid:     "grid grid-cols-2 lg:grid-cols-4 gap-4",
  formGrid:     "grid grid-cols-1 md:grid-cols-2 gap-4",
  quoteCompare: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6",
};
```

---

#### 3.5.5 Mobile-Specific UI Patterns

**Bottom Navigation (mobile app -- planned):**
- 5 tabs: Home, Search, Inquiries, Chat (Volt), Profile
- Active: amber-600 icon, bold label
- Badge: red dot for unread notifications
- Height: 56px + safe area inset

**Floating Action Button (FAB):**
- Bottom-right, `w-14 h-14`, `bg-neutral-900`, `shadow-brutal`
- Icon: `Plus` or `MessageCircle` (Volt AI)
- Press: `animate-scale-in`
- Expands to speed dial on long press

**Pull to Refresh:**
- Spinner appears above list on pull-down
- Release triggers API refresh
- Implementation: custom hook or `react-pull-to-refresh`

---

### 3.6 Accessibility (WCAG 2.1 AA)

#### 3.6.1 Color Contrast

| Combination | Ratio | Status |
|-------------|-------|--------|
| neutral-900 on white | 18.4:1 | PASS (AAA) |
| neutral-600 on white | 7.0:1 | PASS (AA) |
| neutral-500 on white | 4.6:1 | PASS (AA) |
| accent-500 on white | 3.8:1 | FAIL (AA) |
| success-500 on white | 3.4:1 | FAIL (AA) |
| error-500 on white | 4.5:1 | BORDERLINE |

**Action items:**
- Use `accent-700` (#a85f42, ratio 5.9:1) for text instead of accent-500
- Use `success-700` (#15803d, ratio 5.1:1) for text instead of success-500
- Accent-500 is acceptable for large text (>18pt) and icons only

---

#### 3.6.2 Focus Management

```css
/* Global focus ring */
*:focus-visible {
  outline: 2px solid #171717;       /* neutral-900 */
  outline-offset: 2px;
  border-radius: 2px;
}

/* Focus within modals: trap focus inside */
/* Implementation: Radix Dialog handles this automatically */

/* Skip to content link (hidden until focused) */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  padding: 1rem 2rem;
  background: #171717;
  color: white;
}
.skip-link:focus {
  top: 0;
}
```

---

#### 3.6.3 Keyboard Navigation

| Element | Keys | Behavior |
|---------|------|----------|
| Buttons | Enter, Space | Activate |
| Links | Enter | Navigate |
| Modals | Escape | Close |
| Tabs | Arrow Left/Right | Switch tab |
| Dropdowns | Arrow Up/Down | Navigate options |
| Forms | Tab | Move to next field |
| Tables | Arrow keys | Navigate cells (planned) |

---

#### 3.6.4 Screen Reader Support

```html
<!-- Icon-only buttons MUST have aria-label -->
<button aria-label="Close dialog">
  <X className="w-5 h-5" />
</button>

<!-- Status badges need aria-label for context -->
<span role="status" aria-label="Inquiry status: Quotes Received">
  QUOTES RECEIVED
</span>

<!-- Loading states -->
<div role="status" aria-live="polite">
  <LoadingSpinner /> Loading inquiries...
</div>

<!-- Form errors -->
<input aria-describedby="email-error" aria-invalid="true" />
<span id="email-error" role="alert">Please enter a valid email</span>

<!-- Data tables -->
<table role="table" aria-label="Inquiry list">
  <thead><tr><th scope="col">Inquiry ID</th>...</tr></thead>
</table>
```

**Current audit status:**
- Volt AI buttons: HAVE aria-labels
- Modal close: HAVE aria-labels
- Form inputs: PARTIAL (some missing aria-describedby)
- Icon buttons elsewhere: NEED audit
- Tables: NEED scope attributes

---

#### 3.6.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Disable custom cursor */
  .electrical-cursor-canvas { display: none; }
  * { cursor: auto !important; }

  /* Disable marquee */
  .animate-marquee { animation: none; }
}
```

**Implementation:** Add to `frontend/src/index.css` (global styles).

---

#### 3.6.6 Form Validation

```typescript
// Accessible form validation pattern:
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
}

function FormField({ id, label, error, required, children }: FormFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold uppercase tracking-wide">
        {label}
        {required && <span aria-hidden="true" className="text-error-500"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required,
      })}
      {error && (
        <span id={errorId} role="alert" className="text-sm text-error-500 mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
```

---

#### 3.6.7 Semantic HTML

```html
<!-- Page structure -->
<header role="banner">...</header>
<nav role="navigation" aria-label="Main navigation">...</nav>
<main role="main" id="main-content">
  <section aria-labelledby="section-heading">
    <h2 id="section-heading">...</h2>
  </section>
</main>
<footer role="contentinfo">...</footer>

<!-- Landmark regions for screen readers -->
<aside role="complementary" aria-label="Sidebar navigation">...</aside>
<form role="form" aria-label="Submit inquiry">...</form>
```

---

## 4. Data Architecture for AI

### 4.1 Current Data Flow

```
User Actions -> UserActivity table (comprehensive logging)
                  |
Inquiries -> ProductInquiry -> InquiryPipeline -> InquiryDealerResponse
                                                        |
RFQs -> RFQ -> RFQItem -> Quote -> QuoteItem
                |                |
        AI Categorization   Dealer Matching -> DealerBrandMapping
                                              DealerCategoryMapping
                                              DealerServiceArea
                |
        Chat -> ChatSession -> ChatMessage (Volt AI)
                |
        Scraper -> ScrapeBrand -> ScrapeJob -> ScrapedProduct -> Product
```

### 4.2 Data Points Critical for ML

| Data Point | Source | ML Use Case |
|-----------|--------|-------------|
| Product + Brand + Price + City | Quote, QuoteItem | Price intelligence |
| Inquiry -> Quote -> Selected | ProductInquiry -> Quote | Dealer scoring |
| Dealer response time | Quote.submittedAt | Dealer scoring |
| User search queries | UserActivity (PRODUCT_SEARCHED) | Search intelligence |
| Quote win/loss + reason | Quote.status, .lossReason | Pricing optimization |
| Inquiry categories | ProductInquiry -> Category | Demand forecasting |
| City distribution | ProductInquiry.deliveryCity | Coverage gap analysis |
| Chat interactions | ChatMessage | User intent analysis |
| Scrape data | ScrapedProduct | Product catalog enrichment |
| Fraud flags | FraudFlag | Fraud model training |

### 4.3 New Schemas for Phase 2

```prisma
model PriceDataPoint {
  id          String   @id @default(uuid())
  productId   String?
  brandName   String
  productName String
  modelNumber String?
  category    String
  city        String
  state       String
  price       Float
  quantity    Int      @default(1)
  unit        String   @default("piece")
  priceType   String   // "quote" | "deal_closed" | "mrp" | "online" | "gem_rate"
  source      String   // "hub4estate" | "amazon" | "flipkart" | "indiamart" | "gem"
  sourceUrl   String?
  dealerId    String?
  timestamp   DateTime @default(now())

  @@index([brandName, productName, city])
  @@index([category, city, timestamp])
  @@index([modelNumber])
}

model PriceTrend {
  id            String   @id @default(uuid())
  productKey    String   // "polycab-4mm-frls-wire"
  city          String
  period        String   // "2026-W14", "2026-03", "2026-Q1"
  avgPrice      Float
  minPrice      Float
  maxPrice      Float
  medianPrice   Float
  sampleSize    Int
  trend         String   // "rising" | "stable" | "falling"
  changePercent Float

  @@unique([productKey, city, period])
  @@index([productKey, city])
}
```

### 4.4 Data Warehouse Strategy

```
Phase 1: All data in PostgreSQL (RDS)
Phase 2:
  Operational DB:  PostgreSQL (real-time transactions)
  Analytical DB:   PostgreSQL read replica (dashboards, ML queries)
  Feature Store:   Materialized views (hourly refresh)
  Vector Store:    pgvector on same instance
Phase 3:
  Consider: ClickHouse for analytics (if query volume justifies)
  Consider: Apache Kafka for event streaming (if real-time ML needed)
```

---

## 5. Performance Budgets

### 5.1 Frontend

| Metric | Target | Current (est.) |
|--------|--------|----------------|
| First Contentful Paint (FCP) | < 1.5s | ~2.0s |
| Largest Contentful Paint (LCP) | < 2.5s | ~3.0s |
| Cumulative Layout Shift (CLS) | < 0.1 | ~0.15 |
| First Input Delay (FID) | < 100ms | ~80ms |
| Total JS Bundle | < 250KB gzip | ~180KB |
| Initial load (3G) | < 5s | ~6s |

### 5.2 Backend

| Metric | Target |
|--------|--------|
| API response (p50) | < 100ms |
| API response (p95) | < 500ms |
| AI API response (p50) | < 3s |
| AI API response (p95) | < 8s |
| Database query (p95) | < 50ms |
| Concurrent users | 500 |

### 5.3 AI-Specific

| Operation | Latency Target | Cost Target |
|-----------|---------------|-------------|
| Slip scan (image -> items) | < 5s | < $0.05/scan |
| Chat message (text -> response) | < 3s first token | < $0.01/msg |
| Auto-categorization | < 1s | < $0.002/call |
| Dealer matching (scoring) | < 200ms | N/A (local) |
| Price intelligence query | < 300ms | N/A (DB query) |
| Voice transcription | Real-time | Free (Web Speech API) |

---

## 6. Risk Matrix & Mitigations

| Risk | Prob. | Impact | Mitigation |
|------|-------|--------|------------|
| Claude API downtime | Low | High | Fallback to cached responses + manual mode |
| Claude API cost overrun | Medium | Medium | Daily cost alerts, rate limiting, Haiku for simple tasks |
| OCR low accuracy (handwriting) | High | Medium | Claude Vision primary, manual entry fallback |
| Voice browser incompatibility | Medium | Low | Graceful fallback to text input |
| Dealer scoring bias | Medium | High | Regular fairness audits, explainable scoring |
| Insufficient price data for ML | High (early) | Medium | Rule-based first, ML at 10K+ points |
| User data privacy (AI) | Low | Critical | No PII in AI prompts, anonymization, DPDPA compliance |
| Model drift | Medium | Medium | Weekly retrain, drift detection alerts |
| Bundle size bloat | Medium | Medium | Lazy loading, tree shaking, bundle analysis |
| WhatsApp API approval delay | Medium | Low | Start with SMS, add WhatsApp when approved |

---

## 7. Appendix

### 7.1 File Reference Map

| Feature | Frontend | Backend |
|---------|----------|---------|
| Slip Scanner | `components/SmartSlipScanner.tsx` | `services/ai-parser.service.ts`, `services/ocr.service.ts` |
| Volt AI Chatbot | `components/AIAssistantWidget.tsx` | `services/ai.service.ts`, `routes/chat.routes.ts` |
| Dealer Matching | N/A | `services/dealer-matching.service.ts` |
| Fraud Detection | `pages/admin/AdminFraudPage.tsx` | FraudFlag model (Prisma) |
| Component Library | `components/ui/index.tsx` | N/A |
| OTP Input | `components/ui/OTPInput.tsx` | N/A |
| Custom Cursor | `components/ElectricalCursor.tsx` | N/A |
| AI Section | `components/AISection.tsx` | N/A |
| Tailwind Config | `tailwind.config.js` | N/A |
| Prisma Schema | N/A | `prisma/schema.prisma` |

### 7.2 Monthly Cost Projection

| Service | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| Claude API | $300-500 | $800-1500 | $2000-4000 |
| Google Cloud Vision | $50 | $100 | $200 |
| OpenAI Embeddings | $0 | $10-20 | $30-50 |
| AWS SageMaker | $0 | $100 | $300 |
| Vector DB (Pinecone) | $0 | $0 | $70 |
| Razorpay fees | $0 | 2% GMV | 2% GMV |
| Email (SendGrid/SES) | $20 | $50 | $100 |
| SMS + WhatsApp (MSG91) | $50 | $200 | $500 |
| Sentry | $0 (free) | $26 | $26 |
| PostHog | $0 (free) | $0 (self-hosted) | $0 |
| **TOTAL** | **$420-620** | **$1,286-1,996** | **$3,226-5,246** |

### 7.3 Hiring Roadmap

| Role | Phase | Priority | Justification |
|------|-------|----------|---------------|
| Full-Stack Developer | 1 | Critical | Build features, integrate libraries |
| UI/UX Designer | 1 | High | Design system, user research, prototyping |
| ML Engineer | 2 | High | Price intelligence, dealer scoring models |
| Data Engineer | 2 | Medium | Data pipeline, feature store, ETL |
| DevOps Engineer | 2 | Medium | CI/CD, monitoring, infrastructure scaling |
| AI Product Manager | 3 | Medium | Autonomous agent product strategy |

### 7.4 Success Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Slip scan accuracy | 78% | 90% | 95% |
| Chat resolution rate | 40% | 65% | 85% |
| Dealer match relevance | 70% | 85% | 92% |
| Inquiry-to-quote conversion | 50% | 70% | 85% |
| Price prediction MAPE | N/A | < 15% | < 8% |
| Autonomous procurement adoption | N/A | N/A | 20% of orders |

### 7.5 Library Integration Priority

| Library | Bundle | Priority | Phase |
|---------|--------|----------|-------|
| Framer Motion | ~40KB | HIGH | 1 |
| @formkit/auto-animate | ~2KB | HIGH | 1 |
| Recharts | ~120KB | HIGH | 1 |
| Radix UI (primitives) | ~3-8KB each | HIGH | 1 |
| react-hot-toast | ~5KB | HIGH | 1 |
| Socket.io (client) | ~15KB | HIGH | 1 |
| cmdk (command palette) | ~8KB | MEDIUM | 1 |
| react-dropzone | ~8KB | MEDIUM | 1 |
| GSAP + ScrollTrigger | ~35KB | MEDIUM | 2 |
| Tremor (dashboards) | ~80KB | MEDIUM | 2 |
| D3.js | ~75KB | LOW | 2-3 |
| Lottie | ~35KB | LOW | 2 |
| TensorFlow.js | ~500KB | LOW | 3 |
| LangChain.js | modular | MEDIUM | 3 |

---

*End of PRD-04. This is a living document updated with every sprint.*
*Last comprehensive review: 7 April 2026*
