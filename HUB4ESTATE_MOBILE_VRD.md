# Hub4Estate Mobile Platform - Vision and Requirements Document (VRD)

**Version:** 1.0
**Date:** March 2026
**Document Type:** Vision and Requirements Document
**Platform:** Mobile (iOS & Android)
**Architecture:** Two Separate Native Applications

---

## Executive Summary

Hub4Estate is revolutionizing the construction materials procurement industry by creating a comprehensive mobile ecosystem that connects buyers (home builders, contractors, architects) with verified dealers and service providers. The platform leverages cutting-edge AI technology to solve the critical pain point of manual contractor slip processing, while providing a seamless, WhatsApp-like experience for procurement and project management.

### The Two-App Architecture

**App 1: Hub4Estate User App** (Buyer/Customer App)
- Target Users: Homeowners, Contractors, Architects, Project Managers
- Core Value: AI-powered instant quotes, price comparison, real-time tracking
- Key Features: Smart Slip Scanner (flagship feature), location-based dealer discovery, inquiry management

**App 2: Hub4Estate Business App** (Dealer/Service Provider App)
- Target Users: Material Dealers, Key Architects, Interior Designers, Contractors, Service Providers
- Core Value: Business growth, professional networking, efficient quote management
- Key Features: Business profile management, inquiry notifications, quote submission, portfolio showcase

### Mission Statement

**"Transform construction procurement from a 3-day manual process to a 3-minute AI-powered experience."**

### Vision

By 2027, Hub4Estate will be the #1 construction materials marketplace in India, processing 10,000+ daily inquiries, connecting 50,000+ verified businesses, and saving customers ₹500+ crores through transparent pricing and efficient procurement.

---

## Table of Contents

1. [Market Analysis & Problem Statement](#1-market-analysis--problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [User Personas & User Journeys](#3-user-personas--user-journeys)
4. [App 1: User/Buyer Application](#4-app-1-userbuyer-application)
5. [App 2: Business/Dealer Application](#5-app-2-businessdealer-application)
6. [Technology Stack & Architecture](#6-technology-stack--architecture)
7. [Google Services Integration](#7-google-services-integration)
8. [Communication & Notification System](#8-communication--notification-system)
9. [AI & Machine Learning Features](#9-ai--machine-learning-features)
10. [Security & Data Protection](#10-security--data-protection)
11. [UI/UX Design System](#11-uiux-design-system)
12. [API Architecture & Endpoints](#12-api-architecture--endpoints)
13. [Performance & Scalability](#13-performance--scalability)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment & DevOps](#15-deployment--devops)
16. [Analytics & Monitoring](#16-analytics--monitoring)
17. [Monetization Strategy](#17-monetization-strategy)
18. [Roadmap & Milestones](#18-roadmap--milestones)

---

## 1. Market Analysis & Problem Statement

### 1.1 Industry Overview

The construction materials industry in India is a **₹8+ lakh crore market** (2026) with massive inefficiencies:

- **Fragmented Supply Chain**: 200,000+ dealers, 80% unorganized
- **Manual Processes**: 90% of transactions still use paper slips, phone calls, and WhatsApp messages
- **Price Opacity**: Prices vary 15-30% within same locality
- **Trust Issues**: No standardized verification, quality concerns
- **Time Wastage**: Average procurement cycle: 3-7 days

### 1.2 The Core Problems We're Solving

#### Problem 1: The Contractor Slip Nightmare 🎯 **(Flagship Problem)**

**Current Process (Broken):**
```
Day 1, 9:00 AM  → Contractor gives handwritten slip
Day 1, 10:00 AM → Customer manually types items into WhatsApp
Day 1, 11:00 AM → Sends to 5-10 dealers individually
Day 1-2         → Wait for responses (50% don't respond)
Day 2-3         → Compare prices manually on Excel
Day 3           → Negotiate, finalize
Day 4-7         → Order, delivery, quality issues
```

**Pain Points:**
- ✍️ Manual typing: 30-60 minutes per slip
- 📱 Individual WhatsApp messages to each dealer
- ⏰ 48-72 hour response time
- 📊 Manual Excel comparison
- ❌ 50% dealers don't respond
- 💸 No price transparency
- 🤷 No quality assurance

**Hub4Estate Solution (Revolutionary):**
```
Day 1, 9:00 AM  → Customer takes photo of slip
Day 1, 9:01 AM  → AI extracts all items (15 seconds)
Day 1, 9:02 AM  → One-tap broadcast to 50+ verified dealers
Day 1, 9:15 AM  → Quotes start arriving
Day 1, 10:00 AM → Compare 10+ quotes with AI recommendations
Day 1, 11:00 AM → Place order with best dealer
Day 1-2         → Delivery with tracking
```

**Value Delivered:**
- ⚡ 3 days → 3 minutes
- 🎯 100% accuracy (AI + human verification)
- 💰 15-30% cost savings through competition
- ✅ Verified dealers only
- 📍 Location-based, instant availability
- 🔔 Real-time notifications

#### Problem 2: Discovery & Trust Gap

**Customer Pain:**
- Don't know reliable dealers
- No way to verify quality
- No reviews/ratings
- No portfolio to judge expertise

**Dealer Pain:**
- Hard to reach new customers
- Rely on word-of-mouth
- No online presence
- Miss inquiries due to manual processes

**Hub4Estate Solution:**
- Google Maps integration for nearby dealers
- Verified business profiles with portfolios
- Rating & review system
- Professional service provider listings (architects, designers)

#### Problem 3: Communication Chaos

**Current State:**
- Multiple WhatsApp chats
- Lost messages
- No inquiry tracking
- No quote history
- No order status

**Hub4Estate Solution:**
- Centralized inquiry inbox
- Real-time notifications (push + SMS + WhatsApp)
- Complete conversation history
- Order tracking dashboard
- Payment integration

#### Problem 4: Business Growth Barriers for Dealers

**Current Challenges:**
- Limited to local customers
- Miss inquiries when offline
- No marketing tools
- No business analytics
- Manual quote preparation

**Hub4Estate Solution:**
- Reach customers across city
- Never miss an inquiry (push notifications)
- Professional business profile
- Analytics dashboard (quotes won/lost, revenue trends)
- Quick quote templates

### 1.3 Target Market Size

#### Primary Markets (2026-2027)

**Tier 1 Cities:**
- Mumbai, Delhi NCR, Bangalore, Hyderabad, Chennai, Pune, Kolkata
- **Potential Users**: 5M+ homeowners, 200K+ contractors
- **Potential Businesses**: 50K+ dealers, 20K+ service providers

**Tier 2 Cities (2027-2028):**
- Ahmedabad, Jaipur, Lucknow, Chandigarh, Bhopal, Indore
- **Potential Users**: 8M+ homeowners, 300K+ contractors
- **Potential Businesses**: 80K+ dealers, 30K+ service providers

### 1.4 Competitive Analysis

#### Direct Competitors

**1. IndiaMART / TradeIndia**
- Strengths: Large database, established brand
- Weaknesses: No AI slip scanning, cluttered UI, slow response times
- Our Advantage: AI-first, mobile-native, instant quotes

**2. BuildSupply / Construction Marketplaces**
- Strengths: Focus on construction
- Weaknesses: No slip scanner, limited dealer network
- Our Advantage: Revolutionary AI scanner, WhatsApp-like UX

**3. WhatsApp Groups (Current Solution)**
- Strengths: Familiar, free
- Weaknesses: Chaotic, no tracking, manual
- Our Advantage: Professional, trackable, automated

#### Our Unique Value Propositions

1. **AI Slip Scanner** - World's first construction slip OCR + AI parser
2. **Two-App Ecosystem** - Optimized UX for buyers AND sellers
3. **Real-Time Everything** - Push + SMS + WhatsApp notifications
4. **Google Lens Integration** - Visual product search and identification
5. **Professional Network** - Not just dealers, but architects + designers
6. **Regional Language Support** - Hindi, Tamil, Telugu, Marathi, Gujarati, Bengali

### 1.5 Success Metrics (KPIs)

#### User App KPIs
- Slip scan accuracy: >95%
- Scan-to-quote time: <15 minutes
- Quotes per inquiry: >5 average
- Order conversion rate: >30%
- User retention (30-day): >60%

#### Business App KPIs
- Response rate: >80%
- Quote-to-order conversion: >20%
- Profile completion rate: >90%
- Average response time: <10 minutes
- Business retention (90-day): >70%

#### Platform KPIs
- Daily active inquiries: 10,000+ (by 2027)
- Verified businesses: 50,000+ (by 2027)
- GMV (Gross Merchandise Value): ₹1,000 crore+ (by 2027)
- Customer satisfaction: >4.5/5 stars
- Platform uptime: >99.9%

---

## 2. Solution Overview

### 2.1 The Hub4Estate Mobile Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUD BACKEND                            │
│  Node.js + PostgreSQL + Redis + Google AI + AWS             │
│  REST APIs + Real-time notifications + File storage         │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
        ┌─────────▼─────────┐       ┌─────────▼─────────┐
        │   USER APP        │       │  BUSINESS APP     │
        │   (Buyers)        │       │  (Dealers)        │
        ├───────────────────┤       ├───────────────────┤
        │ • Slip Scanner    │       │ • Inbox           │
        │ • Price Compare   │       │ • Quick Quotes    │
        │ • Track Orders    │       │ • Profile Mgmt    │
        │ • Find Dealers    │       │ • Analytics       │
        │ • Reviews         │       │ • Portfolio       │
        └───────────────────┘       └───────────────────┘
```

### 2.2 Why Two Separate Apps?

#### Strategic Reasons

**1. User Experience Optimization**
- Buyers need: Speed, simplicity, AI tools
- Dealers need: Efficiency, inbox management, business tools
- One app forces compromises; two apps = perfect UX for each

**2. App Store Visibility**
- Two apps = 2x search visibility
- Separate keywords, categories, rankings
- User searches "material dealer app" → finds Business App
- Customer searches "construction materials" → finds User App

**3. Feature Velocity**
- Teams can iterate independently
- User app can get AI features without affecting dealer workflow
- Business app can get new tools without confusing buyers

**4. Brand Positioning**
- User App: "For smart homeowners & contractors"
- Business App: "For professional dealers & service providers"
- Clear value proposition for each audience

**5. Push Notification Relevance**
- User App: "3 quotes received for your inquiry!"
- Business App: "New inquiry near you: 5000 sq.ft tiles"
- No mixing signals, better engagement

**6. Performance & Size**
- Each app loads only what it needs
- Smaller bundle sizes (User: ~25MB, Business: ~20MB)
- Faster startup, better reviews

**7. Monetization Flexibility**
- User App: Always free (build user base)
- Business App: Premium features for dealers (revenue)
- Clear upgrade path for businesses

#### Technical Benefits

```typescript
// ONE APP APPROACH (Rejected)
if (user.role === 'buyer') {
  return <BuyerStack />; // Loads dealer code anyway
} else {
  return <DealerStack />; // Loads buyer code anyway
}
// Result: 40MB app, slow startup, confused users

// TWO APP APPROACH (Selected)
// User App: Only buyer code (25MB)
export default function UserApp() {
  return <BuyerStack />;
}

// Business App: Only dealer code (20MB)
export default function BusinessApp() {
  return <DealerStack />;
}
// Result: Lean, fast, focused
```

### 2.3 Core Features Matrix

| Feature | User App | Business App | Backend |
|---------|----------|--------------|---------|
| **AI Slip Scanner** | ✅ Primary | ❌ | ✅ Google Vision + Claude |
| **Google Lens Search** | ✅ | ✅ | ✅ Lens API |
| **Inquiry Creation** | ✅ | ❌ | ✅ |
| **Inquiry Inbox** | ✅ (sent) | ✅ (received) | ✅ |
| **Quote Submission** | ❌ | ✅ | ✅ |
| **Quote Comparison** | ✅ | ❌ | ✅ AI recommendations |
| **Business Profile** | ❌ | ✅ Full editor | ✅ |
| **Find Dealers (Maps)** | ✅ | ❌ | ✅ Google Maps |
| **Reviews & Ratings** | ✅ Can review | ✅ Can view | ✅ |
| **Order Tracking** | ✅ | ✅ | ✅ |
| **Analytics Dashboard** | ❌ | ✅ | ✅ |
| **Push Notifications** | ✅ | ✅ | ✅ Firebase |
| **SMS Notifications** | ✅ | ✅ | ✅ Twilio |
| **WhatsApp Integration** | ✅ | ✅ | ✅ WhatsApp Business |
| **Google OAuth Login** | ✅ | ✅ | ✅ |
| **Location Services** | ✅ | ✅ | ✅ Google Maps |
| **Multi-language** | ✅ | ✅ | ✅ i18n |

### 2.4 User Flow Comparison

#### User App - Primary Flow (Slip Scanning)

```
1. Open App → Home Screen
   ├─ Big "Scan Slip" Button (center, prominent)
   ├─ Recent inquiries (quick access)
   └─ Nearby dealers (Google Maps preview)

2. Tap "Scan Slip" → Camera opens
   ├─ AI guides: "Ensure slip is flat, well-lit"
   ├─ Tap capture / Select from gallery
   └─ Loading: "AI is reading your slip..." (15s)

3. Review Extracted Items
   ├─ List of items with quantities
   ├─ ✅ Correct / ✏️ Edit / ➕ Add item
   ├─ AI confidence indicators
   └─ Tap "Get Quotes"

4. Inquiry Broadcast
   ├─ Select location (auto-detected)
   ├─ Add delivery date preference
   ├─ Optional: Add photos/notes
   └─ Broadcast to 50+ verified dealers

5. Quotes Arrive (Real-time)
   ├─ Push notification: "New quote from ABC Traders"
   ├─ SMS: "3 quotes received, view now"
   ├─ In-app: Quote cards with prices
   └─ AI recommendation: "Best value: ABC Traders ↓15%"

6. Compare & Select
   ├─ Side-by-side comparison
   ├─ Dealer ratings & reviews
   ├─ Estimated delivery time
   └─ Tap "Accept Quote" → Place Order

7. Track Order
   ├─ Real-time status updates
   ├─ WhatsApp notifications
   ├─ Delivery tracking (Google Maps)
   └─ Complete → Rate dealer
```

#### Business App - Primary Flow (Quote Management)

```
1. Open App → Inquiry Inbox
   ├─ "3 new inquiries near you"
   ├─ Sorted by: Newest, Distance, Value
   └─ Filters: Material type, Location, Date

2. Tap Inquiry → View Details
   ├─ Customer location (Google Maps)
   ├─ Full item list with quantities
   ├─ Photos/attachments
   ├─ Delivery requirements
   └─ Customer rating (for filtering spam)

3. Quick Quote
   ├─ Pre-filled templates (frequent items)
   ├─ Tap item → Enter price
   ├─ Auto-calculate totals
   ├─ Add delivery charges
   ├─ Optional: Add note/offer
   └─ Tap "Send Quote" (60 seconds total)

4. Notification Sent
   ├─ Customer receives quote instantly
   ├─ You see: "Quote sent, awaiting response"
   └─ Analytics: "You're 20% faster than competitors"

5. Order Accepted
   ├─ Push notification: "Order confirmed! ₹45,000"
   ├─ WhatsApp message with details
   ├─ SMS confirmation
   └─ Update inventory (optional integration)

6. Fulfill Order
   ├─ Update status: Preparing → Dispatched → Delivered
   ├─ Customer tracks in real-time
   ├─ WhatsApp updates at each stage
   └─ Complete → Request review

7. Dashboard Analytics
   ├─ Quotes sent vs won (conversion rate)
   ├─ Revenue trends (daily/weekly/monthly)
   ├─ Customer ratings
   └─ Popular items, peak times
```

### 2.5 Technological Innovation

#### Innovation 1: Hybrid AI Slip Scanner

**Problem**: Contractor slips are messy, handwritten, have corrections, multiple columns

**Solution**: Multi-stage AI pipeline
```
Stage 1: Google Vision OCR
├─ Extracts all text from image
├─ Handles Hindi + English mixed text
├─ Detects tables, columns
└─ Output: Raw text blocks

Stage 2: Claude AI Parser
├─ Input: OCR text + image
├─ Understands construction context
├─ Identifies: Item name, Quantity, Unit, Brand
├─ Handles: Abbreviations, corrections, messy handwriting
└─ Output: Structured JSON

Stage 3: Human Verification (Optional)
├─ User reviews extracted items
├─ Quick edit interface
├─ Feedback improves AI
└─ Output: Confirmed inquiry

Stage 4: Intelligent Matching
├─ Maps to product database
├─ Suggests similar items
├─ Detects potential errors
└─ Output: Ready-to-broadcast inquiry
```

**Accuracy**: 95%+ without human verification, 99%+ with quick review

#### Innovation 2: Real-time Everything

```typescript
// Notification Cascade
const notifyDealers = async (inquiry) => {
  await Promise.all([
    // 1. Instant push notification (1-2 seconds)
    sendPushNotification({
      title: "New Inquiry Near You 📍",
      body: "5000 sq.ft tiles, Budget: ₹5L",
      data: { inquiryId, location }
    }),

    // 2. SMS backup (3-5 seconds)
    sendSMS({
      message: "New inquiry: 5000 sq.ft tiles. View: hub4.estate/i/xyz",
      phone: dealer.phone
    }),

    // 3. WhatsApp message (5-10 seconds)
    sendWhatsApp({
      template: "new_inquiry",
      params: [itemCount, estimatedValue, location]
    }),

    // 4. Email (for offline viewing)
    sendEmail({
      subject: "New Inquiry - Action Required",
      html: renderInquiryEmail(inquiry)
    })
  ]);
};
```

**Result**: Dealers respond in <10 minutes avg (vs 24-48 hours in traditional)

#### Innovation 3: Google Lens for Visual Search

**Use Cases:**

**User App:**
```
Scenario 1: "I saw this tile design at my friend's house"
→ Open Lens from app
→ Take photo of tile
→ AI identifies: "Italian Marble Effect Porcelain, 600x600mm"
→ Find matching products
→ Create inquiry with exact specifications

Scenario 2: "What's this material called?"
→ Photo of building material
→ Lens identifies: "Mangalore Clay Roof Tiles"
→ Shows similar products, prices
→ One-tap inquiry to local dealers
```

**Business App:**
```
Scenario: Dealer receives inquiry for "white marble look tiles"
→ Open Lens
→ Search visual references
→ Send customer: "Did you mean this style?"
→ Reduces misunderstandings, returns
```

#### Innovation 4: Smart Location Intelligence

```typescript
// Multi-layer location system
const getRelevantDealers = async (inquiry) => {
  // Layer 1: GPS location
  const userLocation = await getCurrentPosition();

  // Layer 2: Delivery radius (configurable by dealer)
  const nearbyDealers = await findDealersInRadius(
    userLocation,
    maxRadius: 25km
  );

  // Layer 3: Material availability
  const dealersWithStock = await filterByMaterials(
    nearbyDealers,
    inquiry.items
  );

  // Layer 4: Rating & reliability
  const rankedDealers = await rankByPerformance(
    dealersWithStock,
    factors: ['rating', 'responseTime', 'completionRate']
  );

  // Layer 5: User preferences (learned over time)
  const personalizedList = await applyUserPreferences(
    rankedDealers,
    user.pastOrders
  );

  return personalizedList.slice(0, 50); // Top 50 matches
};
```

**Benefits:**
- Customers find dealers within delivery range
- Dealers only see relevant inquiries
- Better conversion rates for both sides

### 2.6 Differentiation Summary

| Traditional Process | Hub4Estate Solution | Impact |
|---------------------|---------------------|--------|
| Manual typing (30-60 min) | AI scan (15 seconds) | **120x faster** |
| WhatsApp 5-10 dealers individually | Broadcast to 50+ instantly | **10x reach** |
| 48-72 hr response time | <15 min avg | **96x faster** |
| Manual Excel comparison | AI-powered comparison | **Instant** |
| No dealer verification | Verified profiles, ratings | **Trust built-in** |
| No inquiry tracking | Complete history, status | **Full visibility** |
| Lost messages, chaos | Organized inbox, search | **Professional** |
| Price opacity | Transparent competition | **15-30% savings** |

---

## 3. User Personas & User Journeys

### 3.1 User App Personas

#### Persona 1: "First-Time Homeowner Rajesh"

**Demographics:**
- Age: 32
- Occupation: IT Professional
- Location: Bangalore
- Income: ₹12 LPA
- Tech Savviness: High

**Background:**
- Just bought his first 2BHK apartment
- Needs to buy tiles, sanitary ware, paint, electrical
- No construction experience
- Contractor gave him a handwritten slip with 50+ items
- Confused by technical terms, overwhelmed

**Pain Points:**
- "I don't know if this is a good price"
- "The contractor's handwriting is terrible"
- "I'm getting different prices from different dealers"
- "I don't know which dealers are reliable"
- "I'm wasting my weekends visiting shops"

**Goals:**
- Get fair prices
- Buy from trusted dealers
- Save time
- Avoid getting cheated
- Stay within budget

**How Hub4Estate Helps:**
```
Saturday 10 AM:
├─ Contractor gives slip
├─ Rajesh opens Hub4Estate app
├─ Taps "Scan Slip"
├─ AI extracts all 50 items perfectly
├─ Reviews, taps "Get Quotes"
└─ Goes back to enjoying weekend

Saturday 11 AM:
├─ 8 quotes received
├─ AI highlights: "ABC Traders - Best value, 18% below average"
├─ Checks ABC rating: 4.7★ (250 reviews)
├─ Reads review: "Delivered on time, good quality"
├─ Taps "Accept Quote"
└─ Order placed, delivery Monday

Monday:
├─ Tiles delivered
├─ Quality verified
├─ Rates dealer 5★
└─ Total time spent: 15 minutes vs 2 weekends

Savings: ₹25,000 + 2 weekends
```

**Key Features Used:**
- AI Slip Scanner ⭐
- Quote Comparison
- Dealer Ratings & Reviews
- One-tap ordering
- Order tracking

---

#### Persona 2: "Experienced Contractor Suresh"

**Demographics:**
- Age: 45
- Occupation: Contractor (20 years experience)
- Location: Pune
- Income: ₹8 LPA
- Tech Savviness: Medium
- Language: Primarily Marathi, some English

**Background:**
- Handles 5-10 projects simultaneously
- Buys materials worth ₹50L+ annually
- Has relationships with 20+ dealers
- Currently uses WhatsApp + Excel + phone calls
- Spends 4-5 hours daily on procurement

**Pain Points:**
- "I'm managing 50+ slips across 8 projects"
- "Dealers take 2-3 days to quote"
- "I forget which dealer quoted what price"
- "I waste time calling dealers who don't have stock"
- "No record of past orders when dispute happens"

**Goals:**
- Get quotes faster
- Better price negotiation leverage
- Organized procurement tracking
- Find new reliable dealers
- Reduce time on procurement

**How Hub4Estate Helps:**
```
Monday Morning (3 projects, 3 slips):
├─ Project A: Scans slip, broadcasts to dealers
├─ Project B: Scans slip, broadcasts to dealers
├─ Project C: Scans slip, broadcasts to dealers
└─ Time taken: 5 minutes (vs 2 hours WhatsApp)

Monday 11 AM:
├─ 24 quotes across 3 projects
├─ Dashboard view: All projects, all quotes
├─ Sorts by: Project, Price, Delivery time
├─ Sees: "XYZ Dealers quoted 12% less for Project A"
└─ Accepts best quotes, back to site work

Benefits:
├─ Saves 15+ hours per week
├─ Better prices (competition among dealers)
├─ Complete quote history for client billing
├─ Finds new dealers with better prices
└─ Professional image with clients

Monthly impact:
├─ Time saved: 60 hours = ₹15,000 (his hourly rate)
├─ Cost saved: ₹50,000 (better prices)
├─ Total value: ₹65,000/month
```

**Key Features Used:**
- AI Slip Scanner (bulk scanning)
- Multi-inquiry dashboard
- Quote comparison across projects
- Dealer discovery (Google Maps)
- Complete history & records
- Marathi language support ⭐

---

#### Persona 3: "Interior Designer Priya"

**Demographics:**
- Age: 29
- Occupation: Interior Designer
- Location: Mumbai
- Income: ₹15 LPA
- Tech Savviness: High
- Language: English + Hindi

**Background:**
- Runs boutique interior design firm
- Works with high-end clients
- Sources unique materials, imported tiles
- Needs quick samples, exact specifications
- Brand conscious, quality focused

**Pain Points:**
- "I need exact tile design my client saw on Pinterest"
- "Dealers don't understand aesthetic descriptions"
- "Getting samples takes 1 week"
- "Imported materials hard to source"
- "Clients want instant quotes"

**Goals:**
- Visual product search
- Find exact designs
- Quick sample delivery
- Premium dealer network
- Professional quotations

**How Hub4Estate Helps:**
```
Client Meeting Tuesday:
├─ Client shows Pinterest image of Italian tiles
├─ Priya opens Hub4Estate
├─ Uses Google Lens: "Search similar products"
├─ Finds 5 matching options in India
├─ Creates inquiry: "Need 800 sq.ft + samples"
└─ Meeting continues

Tuesday Evening:
├─ 6 quotes from premium dealers
├─ 3 offer sample delivery tomorrow
├─ Priya selects best quote
├─ Shares quote PDF with client
└─ Client approves

Wednesday:
├─ Samples delivered to client's home
├─ Client loves them
├─ Priya places full order via app
└─ Delivery scheduled for project timeline

Value:
├─ Client impressed by quick response
├─ Professional quote PDFs
├─ Exact design match
└─ Project stays on schedule
```

**Key Features Used:**
- Google Lens visual search ⭐
- Quick inquiry creation
- Professional quote PDFs
- Premium dealer filter
- Sample request feature
- Portfolio sharing with clients

---

### 3.2 Business App Personas

#### Persona 4: "Local Dealer Ramesh (Small Business)"

**Demographics:**
- Age: 50
- Business: Tiles & Sanitary Ware Shop
- Location: Ahmedabad
- Annual Revenue: ₹2 crore
- Tech Savviness: Low
- Language: Gujarati + Hindi

**Background:**
- Family business for 25 years
- 800 sq.ft shop in commercial area
- 3 employees
- Relies on walk-in customers + word of mouth
- Wants to grow but doesn't know how
- Tried online listings, got spam calls

**Pain Points:**
- "Young people don't visit shops anymore"
- "My competitors are getting more customers"
- "I miss calls when I'm at warehouse"
- "I don't know how to market online"
- "I'm losing business to big retailers"

**Goals:**
- Get more customers
- Don't miss any inquiry
- Simple system (not complicated)
- Affordable
- Compete with big players

**How Hub4Estate Business App Helps:**
```
Setup (One-time, 20 minutes):
├─ Downloads Hub4Estate Business app
├─ Creates account via Google (simple)
├─ Uploads 5 shop photos
├─ Adds: Tiles, Sanitary, Bath Fittings
├─ Sets delivery radius: 15 km
└─ Profile verified ✅

Day 1 - First Inquiry:
├─ Push notification: "New inquiry 2 km away"
├─ Opens app: Customer needs 2000 sq.ft tiles
├─ Reviews items, checks stock
├─ Uses Quick Quote template (saved his common prices)
├─ Enters prices, taps "Send Quote"
└─ Time: 3 minutes

2 Hours Later:
├─ Notification: "Your quote was accepted!"
├─ Order value: ₹1.5 lakh
├─ Customer details, delivery address
├─ Prepares order
└─ First online sale!

First Month Results:
├─ 45 inquiries received
├─ 12 quotes accepted (27% conversion)
├─ Revenue: ₹8.5 lakh new business
├─ Avg response time: 8 minutes
├─ Rating: 4.6★ (12 reviews)
└─ Business growing!

What Changed:
├─ Customers find him via Google Maps in app
├─ Never misses inquiry (push notifications)
├─ Competes with big dealers on price
├─ Professional business profile
├─ Growing digital presence
```

**Key Features Used:**
- Simple onboarding ⭐
- Push notifications (never miss inquiry)
- Quick Quote templates
- Gujarati language support
- Easy inventory (simple yes/no for stock)
- WhatsApp order confirmations

**Success Metrics:**
- Month 1: ₹8.5L new revenue
- Month 3: ₹25L new revenue
- Month 6: 35% of total business from app
- ROI: 10x (app subscription vs revenue)

---

#### Persona 5: "Key Architect Aditya (Premium Service Provider)"

**Demographics:**
- Age: 38
- Business: Architecture & Design Studio
- Location: Delhi NCR
- Annual Revenue: ₹1.5 crore (design fees)
- Tech Savviness: High
- Language: English

**Background:**
- Registered architect with 12 years experience
- Handles luxury residential + commercial projects
- Collaborates with contractors, interior designers
- Previously only offered design, not material sourcing
- Wants to offer end-to-end services
- Trusted advisor to high-net-worth clients

**Pain Points:**
- "Clients ask me to help with material sourcing"
- "I recommend dealers but can't track if they deliver"
- "I want to monetize my material knowledge"
- "No platform to showcase my projects"
- "Clients trust my aesthetic judgment"

**Goals:**
- Offer material consulting services
- Earn commission on material sales
- Showcase portfolio to attract clients
- Network with premium dealers
- Become one-stop solution

**How Hub4Estate Business App Helps:**
```
Profile Setup:
├─ Business Type: "Key Architect & Design Consultant"
├─ Uploads 20 project photos (portfolio)
├─ Adds: Services offered, Awards, Certifications
├─ Links: Website, Instagram, LinkedIn
├─ Verification: Professional license uploaded
└─ Premium profile badge

Service Model:
├─ Clients find him on Hub4Estate Business directory
├─ Offers free consultation
├─ Uses Google Lens to identify exact materials from references
├─ Creates curated material inquiries for clients
├─ Dealers bid for the project
├─ Aditya recommends best options (quality + price)
└─ Earns 2-3% commission from dealers

Sample Project:
├─ Client: Luxury 5BHK Villa (Gurgaon)
├─ Material Budget: ₹80 lakh
├─ Aditya creates detailed inquiry:
│   ├─ Italian marble (living room)
│   ├─ Premium sanitaryware (5 bathrooms)
│   ├─ Designer tiles (bedrooms)
│   └─ Lighting fixtures
├─ 8 premium dealers submit quotes
├─ Aditya reviews, recommends top 3
├─ Client selects based on his recommendation
├─ Aditya earns: ₹2.4 lakh commission
├─ Client happy (trusted guidance)
├─ Dealer happy (₹80L order)
└─ Triple win

Monthly Impact:
├─ 3-4 projects per month
├─ Avg commission: ₹1.5 lakh per project
├─ New revenue stream: ₹5-6 lakh/month
├─ Portfolio views: 5000+/month
├─ New client inquiries: 20+/month
└─ Business expanded beyond design
```

**Key Features Used:**
- Premium Business Profile ⭐
- Project Portfolio Showcase
- Google Lens for product sourcing
- Commission tracking dashboard
- Professional network (connects with dealers)
- Client testimonials & ratings
- Lead generation from profile

**Business Value:**
- New revenue: ₹60-70 lakh/year (commission)
- Client satisfaction: Higher (end-to-end service)
- Brand value: Positioned as premium consultant
- Network: Connected with 100+ premium dealers

---

#### Persona 6: "Large Dealer Chain Owner Vikram"

**Demographics:**
- Age: 42
- Business: 5 showrooms across Hyderabad
- Annual Revenue: ₹25 crore
- Employees: 45
- Tech Savviness: High
- Language: Telugu + English

**Background:**
- Second generation business
- Stocks 5000+ SKUs across tiles, sanitary, hardware
- Currently uses: Website, IndiaMART, Facebook ads
- Has delivery fleet, warehouse management
- Wants to dominate local market

**Pain Points:**
- "I get leads but 60% are spam or tire-kickers"
- "My sales team wastes time on unqualified leads"
- "I can't track which location is performing better"
- "My competitors are everywhere online"
- "I want data-driven decisions"

**Goals:**
- Qualified leads only
- Territory management (5 showrooms)
- Analytics and insights
- Brand visibility
- Efficient team management

**How Hub4Estate Business App Helps:**
```
Enterprise Setup:
├─ Creates master account
├─ Adds 5 showroom locations (Google Maps pins)
├─ Each showroom has sub-account
├─ 10 sales staff get access (role-based)
├─ Inventory synced across locations
└─ Custom branding on profile

Smart Lead Distribution:
┌─ Inquiry arrives (Customer in Madhapur area)
│  ├─ App checks: Which showroom is closest?
│  ├─ Routes to: Madhapur showroom account
│  ├─ Showroom manager Ravi gets notification
│  ├─ Ravi checks stock, sends quote
│  └─ If stock unavailable: Escalates to warehouse
│
└─ Result: Fastest response, local touch

Analytics Dashboard:
├─ Overall metrics:
│   ├─ 450 inquiries this month
│   ├─ 125 orders (28% conversion)
│   ├─ ₹1.2 crore GMV
│   └─ Avg response time: 5 minutes
│
├─ Per showroom breakdown:
│   ├─ Madhapur: 35% conversion (best)
│   ├─ Kukatpally: 22% conversion
│   ├─ Secunderabad: 18% conversion (needs training)
│   └─ Identifies improvement areas
│
└─ Popular items:
    ├─ 600x600mm vitrified tiles (40% of orders)
    ├─ Peak inquiry time: 10 AM - 12 PM
    └─ Plans inventory accordingly

Team Management:
├─ Leaderboard: Top performers
├─ Ravi (Madhapur): 35 orders, 4.8★ rating
├─ Incentives based on ratings
└─ Training for low performers

Marketing Integration:
├─ Google My Business synced
├─ Hub4Estate shows all 5 locations on map
├─ Customers see nearest showroom
├─ 40% increase in foot traffic
└─ Online-to-offline attribution

Monthly Results:
├─ Hub4Estate orders: ₹1.2 crore (5% of total)
├─ Growth rate: 15% month-on-month
├─ Customer acquisition cost: ₹200 per order
├─ 4x better than Facebook ads (₹800 CAC)
├─ Planning to add 2 more showrooms
```

**Key Features Used:**
- Multi-location management ⭐
- Team accounts with role-based access
- Advanced analytics dashboard
- Inventory sync across locations
- Google Maps integration (5 pins)
- Bulk quote templates
- CRM integration (future)

**ROI:**
- New customers: 1500+ annually
- Revenue from app: ₹15 crore/year
- Cost: ₹2 lakh/year (subscription)
- ROI: 75x

---

### 3.3 Detailed User Journeys

#### Journey 1: First-Time User (Rajesh) - Complete Experience

**Day 0: Discovery**
```
Context: Rajesh's friend Amit recommended Hub4Estate

10:00 AM - App Store Discovery
├─ Searches: "construction material app"
├─ Finds: Hub4Estate User App
├─ Sees: 4.6★ rating, 50K+ downloads
├─ Reviews: "This saved me ₹40K!" | "So easy to use!"
├─ Downloads app (25 MB, installs in 15 seconds)
└─ Opens app

10:02 AM - Onboarding
├─ Welcome screen: "Get instant quotes from 50+ verified dealers"
├─ Swipes through 3 screens:
│   1. "Scan any contractor slip with AI"
│   2. "Compare quotes in minutes"
│   3. "Order with one tap, track delivery"
├─ Taps "Get Started"
└─ Login options appear

10:03 AM - Quick Signup
├─ Options shown:
│   • Continue with Google ← Selects this
│   • Continue with Phone Number
│   • Continue with Email
├─ Taps "Continue with Google"
├─ Google OAuth: Selects account
├─ Permissions: Location (for finding nearby dealers)
├─ Grants location access
└─ Logged in! Name: "Hi Rajesh 👋"

10:04 AM - Home Screen
├─ Big orange button: "📸 Scan Slip"
├─ Below: "New here? Tap to scan your first contractor slip!"
├─ Bottom tabs: Home | Inquiries | Dealers | Profile
└─ Exits app (will use tomorrow)
```

**Day 1: First Slip Scan**
```
9:00 AM - Contractor Visit
├─ Contractor gives handwritten slip
├─ 15 items: Tiles, cement, sand, sanitary
├─ Messy handwriting, some items in Hindi
├─ Rajesh thinks: "Let me try that app Amit mentioned"
└─ Opens Hub4Estate

9:01 AM - Scanning Process
├─ Taps big "Scan Slip" button
├─ Camera permission requested → Grants
├─ Camera opens with overlay guide:
│   • "Place slip flat on table"
│   • "Ensure good lighting"
│   • Rectangle overlay shows where to align
├─ Rajesh positions slip, taps capture button
├─ Flash! Photo taken
├─ Loading screen appears:
│   • Animation: AI brain processing
│   • Text: "AI is reading your slip..."
│   • Progress: "Extracting text..." (5s)
│   • Progress: "Identifying items..." (10s)
└─ Ding! "15 items found"

9:02 AM - Review Screen
├─ Beautifully formatted list:
│   1. ✅ White Vitrified Tiles 600x600mm - 2000 sq.ft (HIGH confidence)
│   2. ✅ Asian Paints Royale - 40 liters (HIGH confidence)
│   3. ⚠️ "Grany" - 20 bags (MEDIUM - Did you mean "Granite"?)
│   4. ✅ Jaquar Bathroom Fittings - 2 sets (HIGH confidence)
│   ... 11 more items
├─ Rajesh amazed: "It understood everything!"
├─ Taps warning on item #3
├─ Popup: "Did you mean: Granite?"
├─ Taps "Yes, correct to Granite"
├─ Item updated: ✅ Granite - 20 bags
├─ Adds one more item manually:
│   • Taps "➕ Add Item"
│   • Types: "LED lights"
│   • Quantity: 10
│   • Unit: pieces
│   • Saves
└─ Now has 16 items total

9:04 AM - Create Inquiry
├─ Taps "Continue to Get Quotes"
├─ Delivery details screen:
│   • Location: "Whitefield, Bangalore" (auto-detected ✓)
│   • Delivery by: Date picker (selects: 20th March)
│   • Add photos: Taps to add room photos (3 photos)
│   • Special notes: "Need delivery in single trip"
├─ Taps "Get Quotes"
├─ Confirmation:
│   • "Broadcasting to 50+ verified dealers near you"
│   • "You'll get notifications as quotes arrive"
│   • "Avg response time: 15 minutes"
└─ Returns to home screen

9:05 AM - Inquiry Sent!
├─ Home screen now shows:
│   • "Inquiry #1234: 16 items, Whitefield"
│   • Status: "Waiting for quotes..."
│   • Expected quotes: "5-10 dealers"
├─ Rajesh closes app, goes to work
```

**Day 1: Quotes Arrive**
```
9:20 AM - First Quote
├─ Push notification on phone:
│   • "🎉 First quote received!"
│   • "ABC Traders quoted ₹45,000"
├─ Rajesh busy in meeting, ignores for now

9:45 AM - More Quotes
├─ SMS notification:
│   • "5 quotes received for your inquiry #1234"
│   • "View and compare: hub4estate.com/i/1234"

11:00 AM - Break Time
├─ Rajesh opens app
├─ Red badge on "Inquiries" tab: "8"
├─ Taps Inquiries tab
├─ Sees his inquiry:
│   • "Inquiry #1234"
│   • "8 quotes received"
│   • AI badge: "💡 Best value found!"
├─ Taps to view quotes

11:01 AM - Quote Comparison Screen
├─ Header: "8 dealers responded in 56 minutes"
├─ AI Recommendation card (top):
│   • "🏆 Recommended: Sri Ganesh Traders"
│   • "₹42,300 (18% below average)"
│   • "4.7★ rating (230 reviews)"
│   • "Delivers in 2 days"
│   • Reason: "Best combination of price, rating, and delivery"
│
├─ All quotes listed:
│   1. Sri Ganesh Traders - ₹42,300 ⭐ RECOMMENDED
│   2. ABC Traders - ₹45,000
│   3. Modern Tiles - ₹44,500
│   4. XYZ Suppliers - ₹48,200
│   5. BuildMart - ₹43,800
│   6. HomeDeco - ₹46,500
│   7. Elite Materials - ₹50,100
│   8. QuickBuild - ₹44,200
│
├─ Rajesh taps on Sri Ganesh Traders quote
└─ Detailed view opens

11:03 AM - Quote Details
├─ Dealer profile:
│   • Photo of shop
│   • "Sri Ganesh Traders"
│   • 4.7★ (230 reviews)
│   • "Verified Dealer ✓"
│   • "2.3 km away"
│   • "Delivery: 2 days"
│
├─ Itemized pricing:
│   • White Vitrified Tiles: ₹35,000
│   • Asian Paints Royale: ₹4,200
│   • Granite: ₹1,500
│   • ... (all items listed)
│   • Subtotal: ₹40,800
│   • Delivery: ₹1,500
│   • Total: ₹42,300
│
├─ Recent reviews:
│   • Amit S. (5★): "Great quality, delivered on time"
│   • Priya K. (4★): "Good prices, helpful staff"
│   • ... 5 more reviews
│
├─ Contact options:
│   • 📞 Call dealer
│   • 💬 Chat in app
│   • 📍 View on map
│
├─ Big button: "Accept Quote & Place Order"
└─ Rajesh reads reviews (all positive!)

11:06 AM - Decision Time
├─ Rajesh compares with other quotes:
│   • Price: ₹42,300 (lowest except one)
│   • Rating: 4.7★ (highest among top 3)
│   • Reviews mention quality & timeliness
│   • Only 2.3 km away (can visit if issues)
│   • AI recommends it
├─ Decides to trust AI + reviews
├─ Taps "Accept Quote & Place Order"
└─ Order confirmation screen appears

11:07 AM - Place Order
├─ Order summary:
│   • Items: 16
│   • Total: ₹42,300
│   • Delivery: 22nd March (2 days)
│   • Address: Auto-filled from profile
│   • Payment: Cash on Delivery / Online
├─ Selects: "Cash on Delivery"
├─ Adds note: "Please call before delivery"
├─ Taps "Confirm Order"
├─ Success animation! 🎉
├─ "Order placed successfully!"
├─ Order ID: #ORD-5678
├─ Notifications:
│   • "You'll receive SMS updates"
│   • "WhatsApp notifications enabled"
│   • "Track order in 'Orders' tab"
└─ Closes app, feels accomplished

11:10 AM - Confirmations
├─ SMS to Rajesh:
│   • "Order #ORD-5678 confirmed with Sri Ganesh Traders"
│   • "Delivery: 22nd March"
│   • "Track: hub4estate.com/o/5678"
│
├─ WhatsApp to Rajesh:
│   • "🎉 Order confirmed!"
│   • "Sri Ganesh Traders is preparing your order"
│   • [Order details as card]
│
├─ Push notification:
│   • "Order confirmed! Expected delivery: 22nd March"
└─ Email confirmation sent
```

**Day 2: Order Tracking**
```
3:00 PM - Progress Update
├─ WhatsApp message:
│   • "Your order is being prepared 📦"
│   • "Estimated ready time: Tomorrow 10 AM"
│
├─ Rajesh opens app
├─ Taps "Orders" tab (new!)
├─ Sees: Order #ORD-5678
├─ Status: "Preparing" (progress bar: 50%)
├─ Timeline:
│   • ✅ Order placed (11:07 AM, 21st)
│   • ✅ Confirmed by dealer (11:15 AM, 21st)
│   • 🔄 Preparing (3:00 PM, 21st) ← Current
│   • ⏳ Out for delivery (Pending)
│   • ⏳ Delivered (Pending)
└─ Closes app
```

**Day 3: Delivery Day**
```
9:30 AM - Dispatch Notification
├─ Push notification:
│   • "Your order is out for delivery!"
│   • "Expected by 2 PM today"
│
├─ WhatsApp message:
│   • "🚚 Out for delivery!"
│   • "Driver: Kumar (9876543210)"
│   • "Live tracking available"
│
├─ Rajesh opens app
├─ Order status: "Out for Delivery"
├─ Live tracking enabled:
│   • Google Maps view
│   • Blue dot: Delivery vehicle location
│   • Updated every 2 minutes
│   • ETA: 1:45 PM
└─ Rajesh knows exact arrival time

1:30 PM - Arrival Notification
├─ Push + WhatsApp:
│   • "Driver is 10 minutes away!"
│   • "Please be available"
│
├─ Rajesh at home, ready

1:45 PM - Delivery
├─ Materials delivered
├─ Rajesh checks quality (all good!)
├─ Pays ₹42,300 cash
├─ Driver confirms in app: "Delivered"
│
├─ Rajesh's app automatically updates:
│   • Status: "Delivered ✓"
│   • Popup: "Rate your experience"
└─ Rating screen appears

1:50 PM - Review & Rating
├─ Overall rating: Rajesh selects 5★
├─ Quick tags:
│   • ✓ On-time delivery
│   • ✓ Good quality
│   • ✓ Fair pricing
│   • ✓ Professional behavior
├─ Written review (optional):
│   • "Excellent service! Materials arrived exactly as described."
│   • "AI scan feature is amazing, saved so much time."
│   • "Will definitely use again!"
├─ Taps "Submit Review"
├─ Thank you message:
│   • "Thanks for your feedback!"
│   • "You earned 100 Hub4Estate points!"
│   • "Redeem on your next order"
└─ Journey complete! 🎉

Total time spent: 20 minutes
Money saved: ₹8,000+ (compared to retail)
Satisfaction: Very High
Likelihood to recommend: 10/10
```

**Ongoing: Rajesh Becomes Power User**
```
Week 2:
├─ Needs electrical items
├─ Creates text inquiry (no slip this time)
├─ Uses saved favorites (familiar dealers)
├─ Orders in 5 minutes

Month 2:
├─ Refers 3 friends (referral bonuses)
├─ Earned 500 points = ₹500 discount
├─ Becomes "Gold" member (faster quotes)

Month 6:
├─ Planning bathroom renovation
├─ Uses Google Lens: Takes photo of Pinterest inspiration
├─ App finds matching tiles
├─ Creates inquiry, gets quotes
├─ Can't imagine going back to old way

Lifetime Value:
├─ Total orders: 12
├─ Total GMV: ₹6.5 lakh
├─ Referrals: 8 users
├─ Platform revenue from Rajesh: ₹32,000
├─ Rajesh's savings: ₹98,000
└─ True win-win!
```

---

## 4. App 1: User/Buyer Application

### 4.1 Core Features Deep Dive

#### Feature 1: AI Slip Scanner (Flagship)

**Technical Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                  MOBILE APP (React Native)               │
│                                                          │
│  Camera Component                                        │
│  ├─ expo-camera (native camera access)                 │
│  ├─ expo-image-manipulator (compression)                │
│  └─ Image preview & retake option                       │
│                                                          │
│  Upload Process                                          │
│  ├─ Compress image: 4MB → 800KB (5x faster upload)     │
│  ├─ Show progress bar                                    │
│  ├─ Retry logic (network failures)                      │
│  └─ Cancel option                                        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS POST /api/slip-scanner/parse
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)             │
│                                                          │
│  Stage 1: Google Vision OCR                              │
│  ├─ Sends image to Google Cloud Vision API             │
│  ├─ Receives: Text blocks, bounding boxes, confidence  │
│  ├─ Extracts: All text including Hindi/English mix     │
│  ├─ Detects: Table structures, columns                  │
│  └─ Output: Raw OCR JSON                                │
│                                                          │
│  Stage 2: Claude AI Parsing                              │
│  ├─ Input: OCR text + original image (for context)     │
│  ├─ Prompt engineering:                                  │
│  │   • "Extract construction materials from this slip" │
│  │   • "Handle abbreviations: cmt=cement, mtrs=meters" │
│  │   • "Output: JSON array of items"                   │
│  ├─ Claude analyzes context, understands domain        │
│  ├─ Handles: Corrections, crossed out items, notes     │
│  └─ Output: Structured JSON                             │
│      {                                                   │
│        "items": [                                        │
│          {                                               │
│            "name": "White Vitrified Tiles 600x600mm",  │
│            "quantity": 2000,                            │
│            "unit": "sq.ft",                             │
│            "brand": "Kajaria",                          │
│            "confidence": "high",                        │
│            "rawText": "Wht vit tiles 600x600 2k sqft"  │
│          }                                               │
│        ],                                                │
│        "warnings": ["Item 3 has low confidence"],       │
│        "needsReview": false                             │
│      }                                                   │
│                                                          │
│  Stage 3: Product Matching (Optional Enhancement)       │
│  ├─ Match items to product database                    │
│  ├─ Suggest exact SKUs from verified dealers           │
│  ├─ Detect potential errors (e.g., unrealistic qty)    │
│  └─ Enrich with market price estimates                 │
└──────────────────────┬──────────────────────────────────┘
                       │ Returns JSON
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  MOBILE APP (Review Screen)              │
│                                                          │
│  Display extracted items                                 │
│  ├─ High confidence: Green checkmark ✅                │
│  ├─ Medium confidence: Warning icon ⚠️                 │
│  ├─ Low confidence: Red flag 🚩 "Please review"        │
│  └─ Edit/Add/Remove options                             │
│                                                          │
│  User actions                                            │
│  ├─ Confirm item ✓                                      │
│  ├─ Edit details (name, quantity, unit)                 │
│  ├─ Delete item ✗                                       │
│  ├─ Add new item manually ➕                            │
│  └─ Proceed to create inquiry                           │
└──────────────────────────────────────────────────────────┘
```

**User Interface Design:**

```
Screen 1: Scan Initiation
┌─────────────────────────────────┐
│ ←  Scan Contractor Slip     [?] │ ← Help icon
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    📸 CAMERA VIEW       │   │
│   │                         │   │
│   │   ╔═══════════════╗     │   │
│   │   ║  Align slip   ║     │   │
│   │   ║  within this  ║     │   │
│   │   ║   rectangle   ║     │   │
│   │   ╚═══════════════╝     │   │
│   │                         │   │
│   │                         │   │
│   │  Ensure good lighting   │   │
│   │  Keep slip flat         │   │
│   └─────────────────────────┘   │
│                                 │
│  [📷 Gallery] [⚡ Flash OFF]    │
│                                 │
│     ┌─────────────────┐         │
│     │   CAPTURE (🔴)  │         │ ← Big, prominent button
│     └─────────────────┘         │
│                                 │
│  Tips: Place slip on flat      │
│  surface for best results       │
└─────────────────────────────────┘

Screen 2: Processing (Loading)
┌─────────────────────────────────┐
│  AI Slip Scanner                │
├─────────────────────────────────┤
│                                 │
│                                 │
│        🧠                        │
│      ━━━●━━━                    │ ← Animated
│   Processing Image               │
│                                 │
│   ✓ Image uploaded              │
│   ⏳ Extracting text... 60%     │ ← Real-time progress
│   ⏳ Identifying items...        │
│                                 │
│   This usually takes 10-15 sec  │
│                                 │
│                                 │
│     [Cancel]                    │
└─────────────────────────────────┘

Screen 3: Review Extracted Items
┌─────────────────────────────────┐
│ ←  Review Items          [✓]    │ ← Tap ✓ when done
├─────────────────────────────────┤
│ 📋 15 items extracted            │
│ AI Confidence: High ✅           │
│ Review and edit if needed:      │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✅ White Vitrified Tiles    │ │ ← High confidence
│ │    600x600mm                 │ │
│ │    2000 sq.ft               │ │
│ │    Raw: "Wht vit 600x600"   │ │ ← Shows original
│ │    [Edit] [Delete]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚠️ Grany - 20 bags          │ │ ← Medium confidence
│ │    Did you mean "Granite"?  │ │
│ │    [Yes, correct] [No, edit]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✅ Asian Paints Royale      │ │
│ │    40 liters                 │ │
│ │    [Edit] [Delete]          │ │
│ └─────────────────────────────┘ │
│                                 │
│  ... (12 more items, scrollable)│
│                                 │
│  ┌───────────────────────────┐  │
│  │  ➕ Add Item Manually     │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Continue (15 items) →    │  │ ← Big CTA button
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Screen 4: Add/Edit Item Modal
┌─────────────────────────────────┐
│  Edit Item               [✕]    │
├─────────────────────────────────┤
│                                 │
│  Item Name *                    │
│  ┌─────────────────────────────┐│
│  │ White Vitrified Tiles       ││
│  └─────────────────────────────┘│
│                                 │
│  Specifications                 │
│  ┌─────────────────────────────┐│
│  │ 600x600mm                   ││
│  └─────────────────────────────┘│
│                                 │
│  Quantity *                     │
│  ┌──────────┐  ┌──────────────┐ │
│  │ 2000     │  │ sq.ft     ▼ │ │
│  └──────────┘  └──────────────┘ │
│                 Units: sq.ft,   │
│                 pieces, bags,   │
│                 liters, meters  │
│                                 │
│  Brand (optional)               │
│  ┌─────────────────────────────┐│
│  │ Kajaria                     ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────┐ ┌─────────────┐│
│  │   Cancel    │ │   Save ✓   ││
│  └─────────────┘ └─────────────┘│
└─────────────────────────────────┘
```

**Error Handling:**

```typescript
// Comprehensive error scenarios

// 1. Camera permission denied
if (!cameraPermission.granted) {
  showAlert({
    title: "Camera Access Needed",
    message: "Hub4Estate needs camera access to scan slips. Please enable in Settings.",
    buttons: [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() }
    ]
  });
}

// 2. Poor image quality
if (imageQualityScore < 0.6) {
  showAlert({
    title: "Image Quality Low",
    message: "The photo is too dark or blurry. Please retake in better lighting.",
    buttons: [
      { text: "Retake", onPress: () => openCamera() },
      { text: "Continue Anyway", style: "destructive" }
    ]
  });
}

// 3. No items detected
if (extractedItems.length === 0) {
  showAlert({
    title: "No Items Found",
    message: "AI couldn't detect any items. This might be because:\n• Image is unclear\n• Slip is blank\n• Handwriting is difficult to read\n\nWould you like to try again or create inquiry manually?",
    buttons: [
      { text: "Retake Photo", onPress: () => openCamera() },
      { text: "Enter Manually", onPress: () => navigate('ManualEntry') }
    ]
  });
}

// 4. Network error during upload
if (error.code === 'ERR_NETWORK') {
  showAlert({
    title: "Connection Issue",
    message: "Couldn't upload image. Please check your internet connection and try again.",
    buttons: [
      { text: "Cancel" },
      { text: "Retry", onPress: () => retryUpload() }
    ]
  });
}

// 5. Backend processing timeout
if (error.code === 'ECONNABORTED') {
  showAlert({
    title: "Processing Timeout",
    message: "The slip is taking longer than usual to process. This might be due to:\n• Complex handwriting\n• Poor image quality\n• High server load\n\nWould you like to wait or retry?",
    buttons: [
      { text: "Wait", onPress: () => extendTimeout() },
      { text: "Retry", onPress: () => retryScan() }
    ]
  });
}

// 6. Low confidence warning (not an error, but needs attention)
if (lowConfidenceItems.length > 0) {
  showToast({
    type: "warning",
    message: `${lowConfidenceItems.length} items need your review`,
    duration: 3000
  });
  // Highlight those items in UI
}
```

**Performance Optimizations:**

```typescript
// 1. Image compression before upload
const compressImage = async (uri: string): Promise<string> => {
  const compressedImage = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: 1920 } }, // Max width, maintains aspect ratio
    ],
    {
      compress: 0.7, // 70% quality
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  // Result: 4-8MB → 800KB-1.5MB (5-10x smaller)
  // Upload time: 30s → 5s on 4G
  return compressedImage.uri;
};

// 2. Progressive loading UX
const scanSlip = async (imageUri: string) => {
  try {
    // Step 1: Compress (1-2s)
    setProgress({ stage: 'Compressing image...', percent: 10 });
    const compressed = await compressImage(imageUri);

    // Step 2: Upload (3-5s)
    setProgress({ stage: 'Uploading...', percent: 30 });
    const formData = new FormData();
    formData.append('image', { uri: compressed, type: 'image/jpeg', name: 'slip.jpg' });

    // Step 3: OCR (5-8s)
    setProgress({ stage: 'Reading text...', percent: 60 });
    // Backend processes

    // Step 4: AI parsing (3-5s)
    setProgress({ stage: 'Identifying items...', percent: 85 });
    // Backend processes

    // Step 5: Complete
    setProgress({ stage: 'Done!', percent: 100 });

  } catch (error) {
    handleError(error);
  }
};

// 3. Offline support (future enhancement)
const saveSlipOffline = async (imageUri: string) => {
  // Save image locally
  await FileSystem.copyAsync({
    from: imageUri,
    to: `${FileSystem.documentDirectory}/pending_slips/${Date.now()}.jpg`
  });

  // Queue for upload when online
  await AsyncStorage.setItem('pending_scans', JSON.stringify([
    ...pendingScans,
    { uri: imageUri, timestamp: Date.now() }
  ]));

  showToast({
    message: "Slip saved! Will upload when internet is available.",
    type: "info"
  });
};

// 4. Caching frequently used items
const getCachedProducts = async () => {
  // Cache common construction items for autocomplete
  const cached = await AsyncStorage.getItem('common_products');
  if (cached && isFresh(cached, 7 * 24 * 60 * 60 * 1000)) { // 7 days
    return JSON.parse(cached);
  }

  // Fetch fresh data
  const products = await api.get('/products/common');
  await AsyncStorage.setItem('common_products', JSON.stringify({
    data: products,
    timestamp: Date.now()
  }));
  return products;
};
```

**Accuracy Improvements:**

```typescript
// Backend: AI prompt engineering for better accuracy

const constructPrompt = (ocrText: string) => `
You are an expert in Indian construction materials procurement.

A customer has submitted a contractor's handwritten material slip. The OCR text is provided below.

Your task:
1. Extract ALL construction material items mentioned
2. For each item, identify:
   - Item name (in clear English)
   - Quantity (number)
   - Unit (sq.ft, bags, pieces, liters, etc.)
   - Brand (if mentioned)
   - Specifications (size, grade, etc.)
3. Handle common abbreviations:
   - "cmt" = Cement
   - "mtrs" / "mtr" = Meters
   - "sqft" / "sq ft" = Square feet
   - "pcs" = Pieces
   - "ltr" / "L" = Liters
   - "bags" / "bg" = Bags
   - "vit" = Vitrified
   - "grany" / "grani" = Granite
4. Ignore:
   - Price information (we'll get fresh quotes)
   - Dealer names
   - Dates
5. If handwriting is unclear, provide your best guess with "medium" or "low" confidence
6. If an item is crossed out, ignore it
7. Output ONLY valid JSON, no additional text

OCR Text:
${ocrText}

Required JSON format:
{
  "items": [
    {
      "name": "White Vitrified Tiles",
      "quantity": 2000,
      "unit": "sq.ft",
      "specifications": "600x600mm",
      "brand": "Kajaria",
      "confidence": "high",
      "rawText": "Wht vit tiles 600x600 2k sqft kajaria"
    }
  ],
  "warnings": ["Item 3: Unclear quantity, please verify"],
  "needsReview": false
}
`;

// Confidence scoring algorithm
const calculateConfidence = (item: ParsedItem): 'high' | 'medium' | 'low' => {
  let score = 100;

  // Deduct for missing information
  if (!item.brand) score -= 10;
  if (!item.specifications) score -= 10;

  // Deduct for OCR quality
  if (item.rawText.match(/[^a-zA-Z0-9\s.,]/g)) score -= 20; // Special chars (messy)
  if (item.rawText.length < 5) score -= 15; // Too short

  // Deduct for unusual values
  if (item.quantity > 100000) score -= 25; // Suspiciously high qty
  if (!item.unit || item.unit === 'unknown') score -= 20;

  // Boost for known products
  if (isKnownProduct(item.name)) score += 15;

  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};
```

---

#### Feature 2: Quote Comparison & AI Recommendations

**UI Design:**

```
Quote Comparison Screen
┌─────────────────────────────────┐
│ ←  8 Quotes Received        [≡] │
├─────────────────────────────────┤
│ Inquiry #1234 • 16 items        │
│ Average response: 56 minutes    │
├─────────────────────────────────┤
│                                 │
│ 🏆 AI RECOMMENDED               │
│ ┌─────────────────────────────┐ │
│ │ Sri Ganesh Traders   4.7⭐  │ │
│ │ ✅ Verified Dealer          │ │
│ │                             │ │
│ │ ₹42,300                     │ │ ← Big, bold price
│ │ 18% below average           │ │ ← Savings badge
│ │                             │ │
│ │ 📍 2.3 km away              │ │
│ │ 🚚 Delivers in 2 days       │ │
│ │ 💬 230 reviews              │ │
│ │                             │ │
│ │ Why recommended?            │ │
│ │ • Best price/quality ratio  │ │
│ │ • Excellent reviews         │ │
│ │ • Fast delivery             │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │  View Full Quote →     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ OTHER QUOTES                    │
│                                 │
│ ┌───────────────┬─────────────┐ │
│ │ABC Traders ⭐4.5│   ₹45,000  │ │
│ │2.8 km • 3 days  │ View →     │ │
│ └───────────────┴─────────────┘ │
│                                 │
│ ┌───────────────┬─────────────┐ │
│ │Modern Tiles ⭐4.6│ ₹44,500   │ │
│ │5.1 km • 2 days  │ View →     │ │
│ └───────────────┴─────────────┘ │
│                                 │
│ ┌───────────────┬─────────────┐ │
│ │BuildMart    ⭐4.3│ ₹43,800   │ │
│ │1.5 km • 4 days  │ View →     │ │
│ └───────────────┴─────────────┘ │
│                                 │
│ ... 5 more quotes (scrollable)  │
│                                 │
│ ┌───────────────────────────┐   │
│ │  📊 Compare All (Table)   │   │ ← Alternative view
│ └───────────────────────────┘   │
└─────────────────────────────────┘

Detailed Quote View
┌─────────────────────────────────┐
│ ←  Sri Ganesh Traders      [♥] │ ← Save favorite
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  [Showroom Photo]           │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Sri Ganesh Traders              │
│ ⭐⭐⭐⭐⭐ 4.7 (230 reviews)      │
│ ✅ Verified Since 2022          │
│                                 │
│ 📍 2.3 km • HSR Layout          │
│ 🚚 Delivers in 2 days           │
│ ⏰ Typical response: 8 minutes  │
│ 📞 +91 98765 43210              │
│                                 │
│ ┌──────┬──────┬──────┬──────┐  │
│ │ Call │ Chat │ Map  │Share│  │ ← Quick actions
│ └──────┴──────┴──────┴──────┘  │
├─────────────────────────────────┤
│ PRICING DETAILS                 │
│                                 │
│ White Vitrified Tiles          │
│ 600x600mm • 2000 sq.ft         │
│ ₹35,000                         │
│ ₹17.50 per sq.ft               │ ← Unit price
│                                 │
│ Asian Paints Royale            │
│ 40 liters                      │
│ ₹4,200                          │
│                                 │
│ Granite - 20 bags              │
│ ₹1,500                          │
│                                 │
│ ... (13 more items)            │
│ ───────────────────────────────│
│ Subtotal         ₹40,800       │
│ Delivery         ₹1,500        │
│ ═══════════════════════════════│
│ TOTAL            ₹42,300       │
│                                 │
│ 💰 You save ₹9,200             │ ← vs average
│    (compared to avg quote)     │
├─────────────────────────────────┤
│ DEALER NOTES                    │
│ "Premium Kajaria tiles in stock│
│ Can deliver by 22nd March.     │
│ Free installation guide."      │
├─────────────────────────────────┤
│ RECENT REVIEWS                  │
│                                 │
│ ⭐⭐⭐⭐⭐ Amit S. • 2 weeks ago │
│ "Great quality, delivered on   │
│ time. Helpful staff."          │
│ 👍 Helpful (12)                 │
│                                 │
│ ⭐⭐⭐⭐ Priya K. • 1 month ago  │
│ "Good prices. One item was     │
│ different shade, but they      │
│ replaced immediately."         │
│ 👍 Helpful (8)                  │
│                                 │
│ [View all 230 reviews →]       │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │   ACCEPT QUOTE & ORDER    │   │ ← Big CTA
│ └───────────────────────────┘   │
│                                 │
│ ┌───────────────────────────┐   │
│ │   Ask Question            │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘

Comparison Table View (Alternative)
┌─────────────────────────────────┐
│ ←  Compare All Quotes       [✓] │
├─────────────────────────────────┤
│ Scroll horizontally →          │
├─────────────────────────────────┤
│                                 │
│       │Sri Ganesh│ABC   │Modern│
│       │Traders   │Traders│Tiles │
│───────┼──────────┼───────┼──────│
│Total  │₹42,300 ✓│₹45,000│₹44,500│
│       │          │       │      │
│Rating │4.7⭐     │4.5⭐  │4.6⭐ │
│       │          │       │      │
│Delivery│2 days ✓│3 days │2 days│
│       │          │       │      │
│Distance│2.3 km ✓│2.8 km │5.1 km│
│───────┼──────────┼───────┼──────│
│Tiles  │₹35,000  │₹38,000│₹36,500│
│600x600│          │       │      │
│       │          │       │      │
│Paint  │₹4,200 ✓ │₹4,500 │₹4,600│
│40L    │          │       │      │
│       │          │       │      │
│...    │...       │...    │...   │
│───────┼──────────┼───────┼──────│
│       │[SELECT]  │[SELECT]│[SELECT]│
│                                 │
│  [+ Add more to compare]        │
└─────────────────────────────────┘
```

**AI Recommendation Algorithm:**

```typescript
interface QuoteScore {
  quote: Quote;
  scores: {
    price: number;        // 0-100
    rating: number;       // 0-100
    delivery: number;     // 0-100
    distance: number;     // 0-100
    reliability: number;  // 0-100
  };
  totalScore: number;     // Weighted average
  recommendation: 'best' | 'good' | 'acceptable';
  reasons: string[];
}

const rankQuotes = (quotes: Quote[], userLocation: Location): QuoteScore[] => {
  // Step 1: Calculate average metrics for comparison
  const avgPrice = quotes.reduce((sum, q) => sum + q.total, 0) / quotes.length;
  const avgRating = quotes.reduce((sum, q) => sum + q.dealer.rating, 0) / quotes.length;
  const avgDeliveryDays = quotes.reduce((sum, q) => sum + q.deliveryDays, 0) / quotes.length;

  // Step 2: Score each quote on multiple dimensions
  const scoredQuotes = quotes.map(quote => {
    const scores = {
      // Price score: Lower is better (inverse scoring)
      price: Math.max(0, 100 - ((quote.total - avgPrice) / avgPrice * 100)),

      // Rating score: Higher is better
      rating: (quote.dealer.rating / 5) * 100,

      // Delivery score: Faster is better (inverse)
      delivery: Math.max(0, 100 - ((quote.deliveryDays / avgDeliveryDays) * 50)),

      // Distance score: Closer is better (inverse)
      distance: Math.max(0, 100 - (quote.dealer.distance / 50) * 100), // 50km = 0 score

      // Reliability score: Based on historical data
      reliability: calculateReliabilityScore(quote.dealer)
    };

    // Step 3: Weighted total score
    const weights = {
      price: 0.35,       // Price matters most (35%)
      rating: 0.25,      // Reviews important (25%)
      delivery: 0.15,    // Delivery speed (15%)
      distance: 0.10,    // Proximity (10%)
      reliability: 0.15  // Past performance (15%)
    };

    const totalScore =
      scores.price * weights.price +
      scores.rating * weights.rating +
      scores.delivery * weights.delivery +
      scores.distance * weights.distance +
      scores.reliability * weights.reliability;

    // Step 4: Determine recommendation category
    let recommendation: 'best' | 'good' | 'acceptable';
    if (totalScore >= 80) recommendation = 'best';
    else if (totalScore >= 65) recommendation = 'good';
    else recommendation = 'acceptable';

    // Step 5: Generate human-readable reasons
    const reasons: string[] = [];

    if (scores.price > 70) {
      const savings = ((avgPrice - quote.total) / avgPrice * 100).toFixed(0);
      reasons.push(`${savings}% below average price`);
    }

    if (scores.rating > 80) {
      reasons.push(`Excellent customer reviews (${quote.dealer.rating}⭐)`);
    }

    if (scores.delivery > 70) {
      reasons.push(`Fast delivery (${quote.deliveryDays} days)`);
    }

    if (scores.distance > 80) {
      reasons.push(`Located nearby (${quote.dealer.distance.toFixed(1)} km)`);
    }

    if (scores.reliability > 80) {
      reasons.push(`Proven track record (${quote.dealer.completedOrders}+ orders)`);
    }

    // Add warnings for low scores
    if (scores.price < 40) {
      reasons.push(`⚠️ Higher than average price`);
    }
    if (scores.rating < 50) {
      reasons.push(`⚠️ Limited or mixed reviews`);
    }

    return {
      quote,
      scores,
      totalScore,
      recommendation,
      reasons
    };
  });

  // Step 6: Sort by total score (highest first)
  return scoredQuotes.sort((a, b) => b.totalScore - a.totalScore);
};

const calculateReliabilityScore = (dealer: Dealer): number => {
  let score = 50; // Start at neutral

  // Completed orders boost
  if (dealer.completedOrders > 100) score += 20;
  else if (dealer.completedOrders > 50) score += 15;
  else if (dealer.completedOrders > 10) score += 10;

  // Cancellation rate penalty
  if (dealer.cancellationRate > 0.1) score -= 30; // >10% cancellations
  else if (dealer.cancellationRate > 0.05) score -= 15;

  // Response time boost
  if (dealer.avgResponseMinutes < 10) score += 15;
  else if (dealer.avgResponseMinutes < 30) score += 10;
  else if (dealer.avgResponseMinutes > 120) score -= 10;

  // On-time delivery boost
  if (dealer.onTimeDeliveryRate > 0.9) score += 20; // >90%
  else if (dealer.onTimeDeliveryRate > 0.7) score += 10;
  else if (dealer.onTimeDeliveryRate < 0.5) score -= 20;

  // Verified dealer boost
  if (dealer.verified) score += 10;

  // Years in business
  if (dealer.yearsInBusiness > 5) score += 10;

  return Math.max(0, Math.min(100, score));
};

// Usage in component
const QuoteComparison = ({ quotes, userLocation }) => {
  const rankedQuotes = rankQuotes(quotes, userLocation);
  const bestQuote = rankedQuotes[0];

  return (
    <View>
      {/* AI Recommended Card */}
      <RecommendedQuoteCard quote={bestQuote} />

      {/* Other Quotes */}
      {rankedQuotes.slice(1).map(scored => (
        <QuoteCard key={scored.quote.id} scoredQuote={scored} />
      ))}
    </View>
  );
};
```

**Smart Filters:**

```
Filters & Sort Screen
┌─────────────────────────────────┐
│ ←  Filter Quotes            [✓] │
├─────────────────────────────────┤
│ SORT BY                         │
│                                 │
│ ○ Recommended (AI)      ← Default│
│ ○ Lowest Price                  │
│ ○ Highest Rating                │
│ ○ Fastest Delivery              │
│ ○ Nearest Location              │
│                                 │
├─────────────────────────────────┤
│ FILTERS                         │
│                                 │
│ Price Range                     │
│ ┌──────●──────────────────────┐ │
│ │ ₹30K          ₹50K          │ │
│ └──────────────────────────────┘ │
│ Current: ₹30,000 - ₹50,000     │
│                                 │
│ Dealer Rating                   │
│ ☑ 4.5★ and above (3 quotes)    │
│ ☑ 4.0★ and above (8 quotes)    │
│ ☐ 3.5★ and above (8 quotes)    │
│ ☐ Any rating (8 quotes)         │
│                                 │
│ Delivery Time                   │
│ ☑ Within 2 days (5 quotes)     │
│ ☐ Within 5 days (8 quotes)      │
│ ☐ Any time (8 quotes)           │
│                                 │
│ Distance                        │
│ ☑ Within 5 km (4 quotes)       │
│ ☑ Within 10 km (7 quotes)      │
│ ☐ Within 25 km (8 quotes)       │
│ ☐ Any distance (8 quotes)       │
│                                 │
│ Dealer Type                     │
│ ☑ Verified only (8 quotes)     │
│ ☐ All dealers (8 quotes)        │
│                                 │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │Clear Filters│ │Apply (5)→  │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────┘
```

---

#### Feature 3: Google Lens Visual Product Search

**Integration Architecture:**

```typescript
// Google Lens integration for visual product search

import { GoogleVisionApi } from '@google-cloud/vision';
import { GoogleLensApi } from './google-lens-api'; // Custom wrapper

interface LensSearchResult {
  visualMatches: VisualMatch[];
  similarProducts: Product[];
  textDetected: string[];
  labels: string[];
  confidence: number;
}

interface VisualMatch {
  productName: string;
  imageUrl: string;
  description: string;
  matchScore: number; // 0-1
  sourceUrl?: string;
}

// Frontend: Lens Search Component
export const useLensSearch = () => {
  const searchWithLens = async (imageUri: string): Promise<LensSearchResult> => {
    try {
      // Step 1: Compress image
      const compressed = await compressImage(imageUri);

      // Step 2: Upload to backend
      const formData = new FormData();
      formData.append('image', {
        uri: compressed,
        type: 'image/jpeg',
        name: 'search.jpg'
      });

      // Step 3: Backend processes with Google Lens API
      const result = await api.post<LensSearchResult>(
        '/products/visual-search',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      return result.data;
    } catch (error) {
      throw new Error('Visual search failed. Please try again.');
    }
  };

  return { searchWithLens };
};

// Backend: Google Lens API integration
export const visualSearchService = {
  async searchByImage(imagePath: string): Promise<LensSearchResult> {
    try {
      // Step 1: Google Vision API for labels and text
      const visionClient = new GoogleVisionApi();
      const [visionResult] = await visionClient.annotateImage({
        image: { source: { filename: imagePath } },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'TEXT_DETECTION' },
          { type: 'WEB_DETECTION' }
        ]
      });

      // Step 2: Extract insights
      const labels = visionResult.labelAnnotations?.map(l => l.description) || [];
      const textDetected = visionResult.textAnnotations?.[0]?.description || '';
      const webEntities = visionResult.webDetection?.webEntities || [];

      // Step 3: Search our product database
      const similarProducts = await searchProductsByLabels(labels);

      // Step 4: Web search for visual matches
      const visualMatches = webEntities
        .filter(entity => entity.score > 0.5)
        .map(entity => ({
          productName: entity.description,
          matchScore: entity.score,
          imageUrl: '', // From web detection
          description: entity.description
        }))
        .slice(0, 10);

      // Step 5: Calculate overall confidence
      const confidence = calculateConfidence(labels, visualMatches.length);

      return {
        visualMatches,
        similarProducts,
        textDetected: textDetected.split('\n'),
        labels,
        confidence
      };

    } catch (error) {
      console.error('Visual search error:', error);
      throw error;
    }
  }
};

const searchProductsByLabels = async (labels: string[]): Promise<Product[]> => {
  // Search database for products matching detected labels
  const query = `
    SELECT * FROM products
    WHERE
      name ILIKE ANY($1) OR
      category ILIKE ANY($1) OR
      tags && $2
    ORDER BY popularity DESC
    LIMIT 20
  `;

  const likePatterns = labels.map(l => `%${l}%`);
  const result = await db.query(query, [likePatterns, labels]);
  return result.rows;
};
```

**UI Flow:**

```
Lens Search Screen
┌─────────────────────────────────┐
│ ←  Visual Product Search    [?] │
├─────────────────────────────────┤
│                                 │
│  Find products by taking a      │
│  photo of any material you like │
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │   📸  TAKE PHOTO            ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │   🖼️  CHOOSE FROM GALLERY   ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  Examples:                      │
│  • Tile design you liked        │
│  • Paint color from a photo     │
│  • Fixture from Pinterest       │
│  • Material from friend's home  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 💡 TIP:                   │  │
│  │ Clear, well-lit photos    │  │
│  │ work best!                │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Search Results Screen
┌─────────────────────────────────┐
│ ←  Visual Search Results        │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  [Your search photo]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ AI Identified:                  │
│ "Wooden texture vitrified tiles"│
│ Confidence: High ✅             │
│                                 │
├─────────────────────────────────┤
│ EXACT MATCHES (3)               │
│                                 │
│ ┌──────┬────────────────────┐   │
│ │[img] │ Wood Look Porcelain│   │
│ │      │ 600x1200mm         │   │
│ │      │ 95% match          │   │
│ │      │ ₹65/sq.ft         │   │
│ │      │ [Create Inquiry→] │   │
│ └──────┴────────────────────┘   │
│                                 │
│ ┌──────┬────────────────────┐   │
│ │[img] │ Italian Wood Tiles │   │
│ │      │ 600x600mm          │   │
│ │      │ 92% match          │   │
│ │      │ ₹58/sq.ft         │   │
│ │      │ [Create Inquiry→] │   │
│ └──────┴────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│ SIMILAR PRODUCTS (15+)          │
│                                 │
│ [Grid of similar product images]│
│ [with match percentages]        │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Can't find exact match?  │   │
│ │  [Get Custom Quote →]     │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘

Create Inquiry from Lens
┌─────────────────────────────────┐
│ ←  Create Inquiry               │
├─────────────────────────────────┤
│ ┌──────────────────────────────┐│
│ │ [Reference image]             ││
│ └──────────────────────────────┘│
│                                 │
│ AI Detected:                    │
│ "Wood Look Porcelain Tiles"     │
│                                 │
│ Quantity *                      │
│ ┌──────────┐  ┌──────────────┐ │
│ │ 1500     │  │ sq.ft     ▼ │ │
│ └──────────┘  └──────────────┘ │
│                                 │
│ Size (optional)                 │
│ ┌─────────────────────────────┐ │
│ │ 600x1200mm                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Additional Requirements         │
│ ┌─────────────────────────────┐ │
│ │ Looking for exact match     │ │
│ │ or similar wood texture     │ │
│ └─────────────────────────────┘ │
│                                 │
│ Attach reference images (3/5)   │
│ [img] [img] [img] [+] [+]      │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Get Quotes from Dealers  │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

**Use Cases:**

```typescript
// Use Case 1: Customer saw tiles at friend's place
const friendHouseTileSearch = async () => {
  /*
  1. Customer visits friend's renovated home
  2. Loves the living room tile design
  3. Opens Hub4Estate → Visual Search
  4. Takes photo of friend's tiles
  5. AI identifies: "Italian Marble Effect Porcelain, 800x800mm"
  6. Shows 5 exact matches from verified dealers
  7. Shows 15 similar products
  8. Customer selects closest match
  9. Creates inquiry with reference photo
  10. Gets quotes from 8 dealers within 20 minutes
  11. Places order

  Result: Found exact product without knowing technical name!
  */
};

// Use Case 2: Interior designer showing client options
const designerClientPresentation = async () => {
  /*
  1. Designer finds inspiration on Pinterest/Instagram
  2. Client loves a particular backsplash tile
  3. Designer opens Hub4Estate Business app
  4. Uses Lens search on saved Pinterest image
  5. Finds similar products available in India
  6. Shares product links with client via app
  7. Client selects preferred option
  8. Designer creates inquiry on client's behalf
  9. Reviews quotes, recommends best dealer
  10. Client approves, order placed

  Result: Turned inspiration into reality in 30 minutes!
  */
};

// Use Case 3: Dealer helping confused customer
const dealerAssistingCustomer = async () => {
  /*
  1. Customer walks into dealer's shop
  2. Says: "I want tiles like the ones in this magazine"
  3. Shows magazine photo
  4. Dealer opens Hub4Estate Business app
  5. Uses Lens to identify exact tile
  6. Checks if he has it in stock
  7. If yes: Shows customer immediately
  8. If no: Finds similar items in his inventory
  9. OR: Creates inquiry to find from other dealers
  10. Customer happy with options

  Result: Professional service, higher conversion!
  */
};
```

---

#### Feature 4: Location-Based Dealer Discovery (Google Maps)

**Map View UI:**

```
Dealer Discovery Screen
┌─────────────────────────────────┐
│ ←  Find Dealers Near You   [☰]  │
├─────────────────────────────────┤
│ Search: Tiles, Sanitary, Paint  │
│ ┌─────────────────────────────┐ │
│ │ 🔍 What are you looking for?│ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│                                 │
│   ╔═════════════════════════╗   │
│   ║  GOOGLE MAP VIEW        ║   │
│   ║                         ║   │
│   ║   📍 (Your location)    ║   │
│   ║                         ║   │
│   ║  📌 Dealer 1 (2.3 km)   ║   │ ← Clickable markers
│   ║  📌 Dealer 2 (4.1 km)   ║   │
│   ║  📌 Dealer 3 (5.8 km)   ║   │
│   ║                         ║   │
│   ║  [Cluster: 5 dealers]   ║   │ ← Marker clustering
│   ║                         ║   │
│   ╚═════════════════════════╝   │
│                                 │
│  [🗺️ Map] [📋 List] ← View toggle│
│                                 │
├─────────────────────────────────┤
│ FILTERS                         │
│ ┌──●───────────────┐ 0-25 km   │ ← Distance slider
│                                 │
│ [All] [Tiles] [Sanitary] [Paint]│ ← Category chips
│                                 │
│ ⭐ 4.0+ (32 dealers)            │
│ ✅ Verified only (45 dealers)   │
│ 🚚 Delivers (38 dealers)        │
└─────────────────────────────────┘

Dealer Marker Popup (on tap)
┌─────────────────────────────────┐
│ Sri Ganesh Traders          [✕] │
├─────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ 4.7 (230 reviews)      │
│ ✅ Verified Dealer              │
│                                 │
│ 📍 2.3 km • HSR Layout          │
│ 🏪 Tiles, Sanitary, Hardware    │
│ 🚚 Delivers within 15 km        │
│                                 │
│ ┌──────────┬──────────┬────────┐│
│ │  View    │ Directions│ Call   ││
│ │  Profile │           │        ││
│ └──────────┴──────────┴────────┘│
└─────────────────────────────────┘

List View (Alternative)
┌─────────────────────────────────┐
│ ←  Dealers Near You         [≡] │
├─────────────────────────────────┤
│ 45 dealers within 10 km         │
│ Sorted by: Distance ▼           │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Sri Ganesh Traders   4.7⭐  │ │
│ │ ✅ Verified                  │ │
│ │ 📍 2.3 km • HSR Layout      │ │
│ │ Tiles, Sanitary             │ │
│ │ [View] [Directions] [Call]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Modern Tiles & Marbles 4.5⭐│ │
│ │ ✅ Verified                  │ │
│ │ 📍 4.1 km • Koramangala     │ │
│ │ Tiles, Marble               │ │
│ │ [View] [Directions] [Call]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (43 more dealers)           │
└─────────────────────────────────┘

Dealer Profile (from map/list)
┌─────────────────────────────────┐
│ ←  Sri Ganesh Traders       [♥] │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  [Showroom carousel]        │ │
│ │  ← → (5 photos)             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Sri Ganesh Traders              │
│ ⭐⭐⭐⭐⭐ 4.7 (230 reviews)      │
│ ✅ Verified Since 2022          │
│                                 │
│ 📍 Shop 15, HSR Layout          │
│    Bangalore - 560102           │
│    2.3 km from you              │
│                                 │
│ 🏪 Specialties                  │
│ • Vitrified Tiles               │
│ • Ceramic Tiles                 │
│ • Sanitary Ware                 │
│ • Bathroom Fittings             │
│                                 │
│ 🚚 Delivery: Within 15 km       │
│ ⏰ Hours: 9 AM - 8 PM (Open now)│
│ 📞 +91 98765 43210              │
│                                 │
│ ┌──────┬──────┬──────┬──────┐  │
│ │ Call │Direct│ Chat │Share│  │
│ └──────┴──────┴──────┴──────┘  │
│                                 │
│ ABOUT                           │
│ "25 years in business, serving │
│ Bangalore with quality tiles..." │
│ [Read more]                     │
│                                 │
│ BRANDS WE STOCK                 │
│ [Kajaria] [Somany] [Jaquar]    │
│ [Asian Paints] +15 more         │
│                                 │
│ RECENT REVIEWS (4.7⭐ • 230)   │
│ [Reviews section...]            │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Create Inquiry           │   │ ← CTA
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

**Google Maps Integration:**

```typescript
import MapView, { Marker, Callout, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface DealerLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  distance: number; // km from user
  verified: boolean;
  categories: string[];
}

export const DealerMapScreen = () => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [dealers, setDealers] = useState<DealerLocation[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<DealerLocation | null>(null);
  const [radius, setRadius] = useState(10); // km

  // Get user location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: "Location Access Needed",
          message: "We need your location to find nearby dealers",
        });
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setUserLocation(location);

      // Fetch nearby dealers
      fetchNearbyDealers(location.coords.latitude, location.coords.longitude, radius);
    })();
  }, []);

  const fetchNearbyDealers = async (lat: number, lng: number, radiusKm: number) => {
    try {
      const response = await api.get('/dealers/nearby', {
        params: {
          lat,
          lng,
          radius: radiusKm * 1000, // Convert to meters
          verified: true
        }
      });
      setDealers(response.data);
    } catch (error) {
      console.error('Error fetching dealers:', error);
    }
  };

  // Calculate region to fit all markers
  const getMapRegion = () => {
    if (!userLocation) return undefined;

    return {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: radius / 111, // Rough conversion: 1 degree ≈ 111 km
      longitudeDelta: radius / 111,
    };
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={getMapRegion()}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {/* User location circle */}
        {userLocation && (
          <Circle
            center={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude
            }}
            radius={radius * 1000} // meters
            strokeColor="rgba(249, 115, 22, 0.5)"
            fillColor="rgba(249, 115, 22, 0.1)"
          />
        )}

        {/* Dealer markers */}
        {dealers.map(dealer => (
          <Marker
            key={dealer.id}
            coordinate={{ latitude: dealer.lat, longitude: dealer.lng }}
            pinColor={dealer.verified ? '#F97316' : '#94A3B8'}
            onPress={() => setSelectedDealer(dealer)}
          >
            <Callout onPress={() => navigateToDealerProfile(dealer.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{dealer.name}</Text>
                <Text>⭐ {dealer.rating.toFixed(1)} • {dealer.distance.toFixed(1)} km</Text>
                <Text style={styles.calloutCategories}>
                  {dealer.categories.join(', ')}
                </Text>
                <TouchableOpacity style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>View Profile →</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Distance radius slider */}
      <View style={styles.radiusControl}>
        <Text>Search radius: {radius} km</Text>
        <Slider
          value={radius}
          onValueChange={setRadius}
          minimumValue={1}
          maximumValue={50}
          step={1}
          onSlidingComplete={(value) => {
            if (userLocation) {
              fetchNearbyDealers(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                value
              );
            }
          }}
        />
      </View>

      {/* Map/List toggle */}
      <View style={styles.viewToggle}>
        <Button title="🗺️ Map" onPress={() => setView('map')} />
        <Button title="📋 List" onPress={() => setView('list')} />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="All" selected={true} />
          <Chip label="Tiles" selected={false} />
          <Chip label="Sanitary" selected={false} />
          <Chip label="Paint" selected={false} />
          <Chip label="⭐ 4.0+" selected={false} />
          <Chip label="✅ Verified" selected={true} />
        </ScrollView>
      </View>
    </View>
  );
};

// Get directions using Google Maps
const openGoogleMapsDirections = (dealer: DealerLocation, userLocation: Location.LocationObject) => {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.coords.latitude},${userLocation.coords.longitude}&destination=${dealer.lat},${dealer.lng}&travelmode=driving`;

  Linking.openURL(url).catch(err => {
    console.error("Couldn't open Google Maps", err);
    // Fallback to Apple Maps on iOS
    if (Platform.OS === 'ios') {
      const appleMapsUrl = `http://maps.apple.com/?saddr=${userLocation.coords.latitude},${userLocation.coords.longitude}&daddr=${dealer.lat},${dealer.lng}`;
      Linking.openURL(appleMapsUrl);
    }
  });
};
```

**Location Intelligence Features:**

```typescript
// Advanced location-based features

// 1. Delivery radius visualization
const showDealerDeliveryZone = (dealer: Dealer) => {
  // Show circle around dealer's location indicating delivery radius
  return (
    <Circle
      center={{ latitude: dealer.lat, longitude: dealer.lng }}
      radius={dealer.deliveryRadiusKm * 1000}
      strokeColor="rgba(34, 197, 94, 0.5)"
      fillColor="rgba(34, 197, 94, 0.1)"
    />
  );

  // If user is outside radius, show warning
  if (dealer.distance > dealer.deliveryRadiusKm) {
    showWarning(`${dealer.name} doesn't deliver to your location`);
  }
};

// 2. Cluster nearby dealers
const clusterDealers = (dealers: DealerLocation[], zoomLevel: number): ClusterMarker[] => {
  // When zoomed out, group nearby dealers into clusters
  // Show cluster with count: "5 dealers"
  // On tap, zoom in to show individual dealers

  if (zoomLevel > 12) {
    // Zoomed in enough, show individual markers
    return dealers.map(d => ({ type: 'single', dealer: d }));
  }

  // Group dealers within 500m of each other
  const clusters: ClusterMarker[] = [];
  const processed = new Set<string>();

  dealers.forEach(dealer => {
    if (processed.has(dealer.id)) return;

    const nearby = dealers.filter(d =>
      !processed.has(d.id) &&
      calculateDistance(dealer.lat, dealer.lng, d.lat, d.lng) < 0.5 // 500m
    );

    if (nearby.length > 1) {
      // Create cluster
      clusters.push({
        type: 'cluster',
        count: nearby.length,
        lat: mean(nearby.map(d => d.lat)),
        lng: mean(nearby.map(d => d.lng)),
        dealers: nearby
      });
      nearby.forEach(d => processed.add(d.id));
    } else {
      // Single dealer
      clusters.push({ type: 'single', dealer });
      processed.add(dealer.id);
    }
  });

  return clusters;
};

// 3. Predict delivery time based on distance and traffic
const estimateDeliveryTime = async (
  dealerLocation: {lat: number, lng: number},
  userLocation: {lat: number, lng: number}
): Promise<string> => {
  try {
    // Use Google Maps Distance Matrix API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${dealerLocation.lat},${dealerLocation.lng}&` +
      `destinations=${userLocation.lat},${userLocation.lng}&` +
      `mode=driving&` +
      `departure_time=now&` + // Considers current traffic
      `key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    const duration = data.rows[0].elements[0].duration_in_traffic;

    // Convert seconds to human-readable
    const hours = Math.floor(duration.value / 3600);
    const minutes = Math.ceil((duration.value % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;

  } catch (error) {
    console.error('Error estimating delivery time:', error);
    // Fallback: rough estimate based on distance
    const distance = calculateDistance(
      dealerLocation.lat, dealerLocation.lng,
      userLocation.lat, userLocation.lng
    );
    const estimatedMinutes = Math.ceil(distance / 30 * 60); // Assume 30 km/h avg
    return `~${estimatedMinutes} minutes`;
  }
};

// 4. Suggest best dealers based on user route
const suggestDealersOnRoute = async (
  userLocation: Location.LocationObject,
  destination: string
): Promise<DealerLocation[]> => {
  // If user is going somewhere (e.g., to work, to site)
  // Suggest dealers along the route

  // Get route from Google Directions API
  const route = await getRoute(userLocation, destination);

  // Find dealers within 1km of route
  const dealersOnRoute = await api.post('/dealers/along-route', {
    routePolyline: route.polyline,
    maxDistanceFromRoute: 1000 // meters
  });

  return dealersOnRoute.data;
};
```


---

#### Feature 5: Order Management & Tracking

**Order Flow Architecture:**

```
Order Lifecycle
┌──────────────────────────────────────────────────────────┐
│ 1. QUOTE ACCEPTED                                        │
│    ├─ Customer accepts dealer quote                     │
│    ├─ Order created with status: "PENDING_CONFIRMATION"  │
│    └─ Notification sent to dealer                        │
├──────────────────────────────────────────────────────────┤
│ 2. DEALER CONFIRMATION                                   │
│    ├─ Dealer confirms order (within 2 hours)            │
│    ├─ Status: "CONFIRMED"                                │
│    ├─ Customer notified via push + SMS + WhatsApp       │
│    └─ If not confirmed in 2h → Auto-cancel + re-broadcast│
├──────────────────────────────────────────────────────────┤
│ 3. PREPARATION                                           │
│    ├─ Dealer marks "PREPARING"                           │
│    ├─ Updates: Packing materials, loading truck          │
│    ├─ Customer sees real-time status                     │
│    └─ Optional: Add photos of packed materials           │
├──────────────────────────────────────────────────────────┤
│ 4. OUT FOR DELIVERY                                      │
│    ├─ Dealer marks "OUT_FOR_DELIVERY"                   │
│    ├─ Live GPS tracking enabled                          │
│    ├─ Customer receives:                                 │
│    │   • Driver name, phone                              │
│    │   • Vehicle number                                  │
│    │   • Live location on map                            │
│    │   • ETA countdown                                   │
│    └─ SMS: "Driver Kumar is on the way, ETA 45 mins"    │
├──────────────────────────────────────────────────────────┤
│ 5. ARRIVING SOON                                         │
│    ├─ When driver is <2 km away                         │
│    ├─ Push notification: "Driver arriving in 10 mins"   │
│    ├─ Prepare customer for delivery                      │
│    └─ Optional: Call driver directly from app            │
├──────────────────────────────────────────────────────────┤
│ 6. DELIVERED                                             │
│    ├─ Driver marks "DELIVERED" (with signature/photo)    │
│    ├─ Customer confirms receipt                          │
│    ├─ Payment processed (if online)                      │
│    ├─ Status: "COMPLETED"                                │
│    └─ Request review                                     │
├──────────────────────────────────────────────────────────┤
│ 7. POST-DELIVERY                                         │
│    ├─ Customer can:                                      │
│    │   • Rate order (quality, delivery, service)         │
│    │   • Upload photos of materials                      │
│    │   • Report issues (within 24 hours)                 │
│    │   • Re-order (one-tap)                              │
│    └─ Dealer can: Request review, follow up              │
└──────────────────────────────────────────────────────────┘

Exception Flows
┌──────────────────────────────────────────────────────────┐
│ DELAYED DELIVERY                                         │
│ ├─ Auto-detect if order delayed >24 hrs                  │
│ ├─ Notify customer with reason                           │
│ ├─ Option to cancel with full refund                     │
│ └─ Flag dealer (impacts rating)                          │
├──────────────────────────────────────────────────────────┤
│ PARTIAL DELIVERY                                         │
│ ├─ Dealer marks items as "Out of stock"                  │
│ ├─ Customer approves partial or cancels                  │
│ ├─ Adjusted invoice sent                                 │
│ └─ Remaining items auto-broadcast to other dealers       │
├──────────────────────────────────────────────────────────┤
│ QUALITY ISSUE                                            │
│ ├─ Customer reports issue within 24 hours                │
│ ├─ Upload photos of defective items                      │
│ ├─ Dealer reviews and responds                           │
│ ├─ Options: Replace, Partial refund, Full refund         │
│ └─ Hub4Estate mediates if dispute                        │
├──────────────────────────────────────────────────────────┤
│ CANCELLATION                                             │
│ ├─ Before confirmation: Free cancellation                │
│ ├─ After confirmation: Dealer approval needed            │
│ ├─ After dispatch: Cancellation fee may apply            │
│ └─ Refund processed automatically                        │
└──────────────────────────────────────────────────────────┘
```

**Order Tracking UI:**

```
Order Details Screen
┌─────────────────────────────────┐
│ ←  Order #ORD-5678         [≡]  │
├─────────────────────────────────┤
│ 🚚 OUT FOR DELIVERY              │
│ Expected by: Today, 2:00 PM     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │  LIVE TRACKING MAP          │ │
│ │                             │ │
│ │  📍 Your location           │ │
│ │     ↑                        │ │
│ │     | 2.5 km                │ │
│ │     ↓                        │ │
│ │  🚛 Delivery truck           │ │
│ │                             │ │
│ │  ETA: 18 minutes            │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ DRIVER DETAILS                  │
│ ┌──────┬────────────────────┐   │
│ │ 👤   │ Kumar S.           │   │
│ │      │ ⭐ 4.8 (150 trips) │   │
│ │      │ 📞 +91 98765 43210 │   │
│ │      │ 🚛 KA01AB1234      │   │
│ └──────┴────────────────────┘   │
│  [📞 Call Driver]                │
│                                 │
│ ORDER TIMELINE                  │
│ ┌─────────────────────────────┐ │
│ │ ✅ Ordered                  │ │
│ │    21 Mar, 11:07 AM         │ │
│ │    │                        │ │
│ │ ✅ Confirmed                │ │
│ │    21 Mar, 11:15 AM         │ │
│ │    │                        │ │
│ │ ✅ Preparing                │ │
│ │    21 Mar, 3:00 PM          │ │
│ │    │                        │ │
│ │ 🔄 Out for Delivery         │ │ ← Current
│ │    22 Mar, 12:30 PM         │ │
│ │    │                        │ │
│ │ ⏳ Delivered                │ │
│ │    Expected: 2:00 PM        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ORDER DETAILS                   │
│ Dealer: Sri Ganesh Traders      │
│ Items: 16                       │
│ Total: ₹42,300                  │
│ Payment: Cash on Delivery       │
│                                 │
│ ┌───────────────────────────┐   │
│ │  View Full Invoice →      │   │
│ └───────────────────────────┘   │
│                                 │
│ NEED HELP?                      │
│ [Contact Dealer] [Report Issue] │
└─────────────────────────────────┘

Delivered - Rate Order
┌─────────────────────────────────┐
│   Order Delivered! 🎉            │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ✓ Order #ORD-5678           │ │
│ │ ✓ Delivered at 2:15 PM      │ │
│ │ ✓ All 16 items received     │ │
│ └─────────────────────────────┘ │
│                                 │
│ How was your experience?        │
│                                 │
│ MATERIAL QUALITY                │
│ ⭐ ⭐ ⭐ ⭐ ⭐ (Tap to rate)      │
│                                 │
│ DELIVERY EXPERIENCE             │
│ ⭐ ⭐ ⭐ ⭐ ⭐                     │
│                                 │
│ DEALER SERVICE                  │
│ ⭐ ⭐ ⭐ ⭐ ⭐                     │
│                                 │
│ Quick Tags:                     │
│ ☑ On-time delivery              │
│ ☑ Good quality                  │
│ ☑ Professional behavior         │
│ ☐ Poor packaging                │
│ ☐ Items damaged                 │
│                                 │
│ Write a review (optional)       │
│ ┌─────────────────────────────┐ │
│ │ Great service! Materials    │ │
│ │ arrived exactly as ordered  │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Add Photos (optional)           │
│ [+] [+] [+]                     │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Submit Review            │   │
│ └───────────────────────────┘   │
│                                 │
│ [Skip for now]                  │
└─────────────────────────────────┘
```

**Real-time Tracking Implementation:**

```typescript
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';

// Real-time delivery tracking
export const useDeliveryTracking = (orderId: string) => {
  const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
  const [eta, setEta] = useState<number | null>(null); // minutes
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const socketInstance = io(API_BASE_URL, {
      auth: { token: await SecureStore.getItemAsync('authToken') }
    });

    // Join order room
    socketInstance.emit('track-order', { orderId });

    // Listen for location updates
    socketInstance.on('driver-location-update', (data: {
      latitude: number;
      longitude: number;
      timestamp: number;
      eta: number;
    }) => {
      setDriverLocation({
        coords: {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 10,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0
        },
        timestamp: data.timestamp
      });
      setEta(data.eta);
    });

    // Listen for status changes
    socketInstance.on('order-status-update', (data: {
      status: OrderStatus;
      message: string;
      timestamp: number;
    }) => {
      // Update local order status
      // Show notification
      showNotification({
        title: `Order Update: ${data.status}`,
        body: data.message
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [orderId]);

  return { driverLocation, eta };
};

// Backend: Driver location broadcaster (runs on driver's device)
export const startLocationBroadcast = (orderId: string) => {
  const locationSubscription = Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 10000, // Update every 10 seconds
      distanceInterval: 50, // Or every 50 meters
    },
    async (location) => {
      try {
        // Send to backend
        await api.post(`/orders/${orderId}/location`, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp
        });

        // Backend broadcasts to customer via WebSocket
      } catch (error) {
        console.error('Failed to broadcast location:', error);
      }
    }
  );

  return () => {
    locationSubscription.remove();
  };
};

// ETA calculation using Google Maps Distance Matrix
const calculateETA = async (
  driverLocation: { lat: number; lng: number },
  deliveryLocation: { lat: number; lng: number }
): Promise<number> => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `origins=${driverLocation.lat},${driverLocation.lng}&` +
    `destinations=${deliveryLocation.lat},${deliveryLocation.lng}&` +
    `mode=driving&` +
    `departure_time=now&` +
    `traffic_model=best_guess&` +
    `key=${GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();
  const durationInTraffic = data.rows[0].elements[0].duration_in_traffic.value;

  return Math.ceil(durationInTraffic / 60); // Convert to minutes
};
```

**Order Management Features:**

```typescript
// Bulk order management for contractors
export const OrderManagementDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  // Contractor managing multiple project orders
  const groupedOrders = useMemo(() => {
    return groupBy(orders, 'projectName'); // Group by project
  }, [orders]);

  return (
    <View>
      {/* Filters */}
      <ScrollView horizontal>
        <Chip label="All" count={orders.length} selected={filterStatus === 'all'} />
        <Chip label="Pending" count={countByStatus('PENDING')} />
        <Chip label="In Transit" count={countByStatus('OUT_FOR_DELIVERY')} />
        <Chip label="Delivered" count={countByStatus('COMPLETED')} />
      </ScrollView>

      {/* Group by project */}
      {Object.entries(groupedOrders).map(([projectName, projectOrders]) => (
        <View key={projectName}>
          <Text style={styles.projectHeader}>{projectName}</Text>
          <Text style={styles.projectStats}>
            {projectOrders.length} orders • ₹{sum(projectOrders, 'total')}
          </Text>

          {projectOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      ))}

      {/* Quick actions */}
      <FAB
        icon="plus"
        label="New Order"
        onPress={() => navigate('CreateInquiry')}
      />
    </View>
  );
};

// Re-order feature (one-tap)
const reorder = async (previousOrder: Order) => {
  try {
    // Create new inquiry with same items
    const inquiry = await api.post('/inquiries', {
      items: previousOrder.items,
      deliveryLocation: previousOrder.deliveryLocation,
      notes: `Re-order of #${previousOrder.id}`
    });

    // Auto-send to same dealer if available
    if (previousOrder.dealerId) {
      await api.post(`/inquiries/${inquiry.id}/send-to-dealer`, {
        dealerId: previousOrder.dealerId
      });

      showToast({
        message: `Sent to ${previousOrder.dealerName} for quick quote`,
        type: 'success'
      });
    }

    navigate('InquiryDetail', { inquiryId: inquiry.id });
  } catch (error) {
    showError('Failed to create re-order');
  }
};

// Order export for record-keeping
const exportOrders = async (orders: Order[], format: 'pdf' | 'excel') => {
  try {
    const response = await api.post('/orders/export', {
      orderIds: orders.map(o => o.id),
      format
    });

    // Download file
    const fileUri = `${FileSystem.documentDirectory}orders_${Date.now()}.${format}`;
    await FileSystem.downloadAsync(response.data.url, fileUri);

    // Share
    await Sharing.shareAsync(fileUri, {
      mimeType: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel',
      dialogTitle: 'Export Orders'
    });

    showToast({
      message: `Exported ${orders.length} orders`,
      type: 'success'
    });
  } catch (error) {
    showError('Failed to export orders');
  }
};
```

---

#### Feature 6: Reviews & Ratings System

**Rating System Architecture:**

```
Review Types
┌──────────────────────────────────────────────────────────┐
│ 1. ORDER REVIEW (Post-delivery)                          │
│    ├─ Multi-dimensional ratings:                         │
│    │   • Material Quality (1-5 stars)                    │
│    │   • Delivery Experience (1-5 stars)                 │
│    │   • Dealer Service (1-5 stars)                      │
│    ├─ Quick tags: On-time, Professional, Good quality    │
│    ├─ Written review (optional, max 500 chars)           │
│    ├─ Photos (optional, up to 5)                         │
│    └─ Verified purchase badge ✓                          │
├──────────────────────────────────────────────────────────┤
│ 2. DEALER PROFILE REVIEW (Can be left anytime)           │
│    ├─ Overall rating (1-5 stars)                         │
│    ├─ Categories:                                        │
│    │   • Product Range                                   │
│    │   • Pricing                                         │
│    │   • Customer Service                                │
│    ├─ Would recommend? (Yes/No)                          │
│    └─ Verified customer badge (if ordered before)        │
├──────────────────────────────────────────────────────────┤
│ 3. RESPONSE FROM DEALER (Optional)                       │
│    ├─ Dealer can respond to reviews                      │
│    ├─ Thank customers for positive reviews               │
│    ├─ Address concerns in negative reviews               │
│    ├─ Shows: "Response from Sri Ganesh Traders"          │
│    └─ Helps build trust and transparency                 │
└──────────────────────────────────────────────────────────┘
```

**Review UI:**

```
Dealer Reviews Screen
┌─────────────────────────────────┐
│ ←  Reviews                  [≡]  │
├─────────────────────────────────┤
│ ⭐ 4.7 out of 5                  │
│ Based on 230 reviews            │
│                                 │
│ ┌──────────────────────────┐    │
│ │ 5⭐ ████████████████ 180  │    │ ← Distribution bars
│ │ 4⭐ ████████░░░░░░░░  30  │    │
│ │ 3⭐ ███░░░░░░░░░░░░░  15  │    │
│ │ 2⭐ ██░░░░░░░░░░░░░░   3  │    │
│ │ 1⭐ █░░░░░░░░░░░░░░░   2  │    │
│ └──────────────────────────┘    │
│                                 │
│ HIGHLIGHTS                      │
│ 🏆 97% would recommend          │
│ ⚡ Fast delivery (avg 2.1 days) │
│ 💰 Competitive pricing          │
│                                 │
│ FILTER & SORT                   │
│ [All ▼] [Most Recent ▼] [🔍]   │
│                                 │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ⭐⭐⭐⭐⭐ Amit S.           │ │
│ │ ✓ Verified Purchase         │ │
│ │ 2 weeks ago                 │ │
│ │                             │ │
│ │ "Excellent service! Tiles   │ │
│ │ were delivered on time and  │ │
│ │ quality is top-notch. The   │ │
│ │ staff was very helpful."    │ │
│ │                             │ │
│ │ 📊 Quality: 5★ | Delivery: 5★│ │
│ │                             │ │
│ │ [Helpful? 👍 12 | 👎 0]     │ │
│ │                             │ │
│ │ 💬 Response from dealer:    │ │
│ │ "Thank you Amit! We        │ │
│ │ appreciate your business."  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⭐⭐⭐⭐ Priya K.            │ │
│ │ ✓ Verified Purchase         │ │
│ │ 1 month ago                 │ │
│ │                             │ │
│ │ "Good prices overall. One   │ │
│ │ tile box had a different    │ │
│ │ shade but they replaced     │ │
│ │ it immediately."            │ │
│ │                             │ │
│ │ [📷📷] (2 photos)            │ │
│ │                             │ │
│ │ 📊 Quality: 4★ | Delivery: 5★│ │
│ │                             │ │
│ │ [Helpful? 👍 8 | 👎 1]      │ │
│ │                             │ │
│ │ 💬 Response from dealer:    │ │
│ │ "Sorry for the inconvenience│ │
│ │ We've improved our QC."     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (228 more reviews)          │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Write a Review           │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘

Write Review Screen
┌─────────────────────────────────┐
│ ←  Write Review             [✓] │
├─────────────────────────────────┤
│ Reviewing: Sri Ganesh Traders   │
│ Order #ORD-5678                 │
│                                 │
│ OVERALL RATING *                │
│ ⭐ ⭐ ⭐ ⭐ ⭐ (Tap to rate)      │
│                                 │
│ DETAILED RATINGS                │
│                                 │
│ Material Quality                │
│ ⭐ ⭐ ⭐ ⭐ ⭐                     │
│                                 │
│ Delivery Experience             │
│ ⭐ ⭐ ⭐ ⭐ ⭐                     │
│                                 │
│ Dealer Service                  │
│ ⭐ ⭐ ⭐ ⭐ ⭐                     │
│                                 │
│ QUICK TAGS                      │
│ ☑ On-time delivery              │
│ ☑ Good quality                  │
│ ☑ Professional behavior         │
│ ☐ Helpful staff                 │
│ ☐ Competitive prices            │
│ ☐ Well-packaged                 │
│                                 │
│ Would you recommend?            │
│ ◉ Yes  ○ No                     │
│                                 │
│ YOUR REVIEW (Optional)          │
│ ┌─────────────────────────────┐ │
│ │ Tell others about your      │ │
│ │ experience...               │ │
│ │                             │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│ 450/500 characters              │
│                                 │
│ ADD PHOTOS (Optional)           │
│ [+] [+] [+] [+] [+]             │
│ Up to 5 photos                  │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Submit Review            │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

**Review Moderation & Quality:**

```typescript
// Review submission with validation
export const submitReview = async (reviewData: ReviewSubmission) => {
  try {
    // Step 1: Validate review
    const validation = validateReview(reviewData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Step 2: Check for spam/profanity
    const contentCheck = await moderateContent(reviewData.text);
    if (contentCheck.flagged) {
      showAlert({
        title: "Review Flagged",
        message: "Your review contains inappropriate content. Please revise and resubmit.",
      });
      return;
    }

    // Step 3: Submit to backend
    const response = await api.post(`/dealers/${reviewData.dealerId}/reviews`, {
      orderId: reviewData.orderId,
      overallRating: reviewData.overallRating,
      ratings: {
        quality: reviewData.qualityRating,
        delivery: reviewData.deliveryRating,
        service: reviewData.serviceRating
      },
      tags: reviewData.selectedTags,
      text: reviewData.text,
      photos: reviewData.photos,
      wouldRecommend: reviewData.wouldRecommend
    });

    // Step 4: Award points to user
    await awardReviewPoints(reviewData.userId);

    // Step 5: Notify dealer
    await notifyDealer(reviewData.dealerId, 'new_review');

    showToast({
      message: "Review submitted! You earned 50 points.",
      type: "success"
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Content moderation
const moderateContent = async (text: string): Promise<{ flagged: boolean; reason?: string }> => {
  // Use Google Perspective API or similar
  const response = await fetch('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      comment: { text },
      languages: ['en', 'hi'],
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        PROFANITY: {},
        SPAM: {}
      }
    })
  });

  const data = await response.json();

  // Check toxicity scores
  if (data.attributeScores.TOXICITY.summaryScore.value > 0.8) {
    return { flagged: true, reason: 'toxic_content' };
  }
  if (data.attributeScores.PROFANITY.summaryScore.value > 0.8) {
    return { flagged: true, reason: 'profanity' };
  }
  if (data.attributeScores.SPAM.summaryScore.value > 0.9) {
    return { flagged: true, reason: 'spam' };
  }

  return { flagged: false };
};

// Review helpfulness voting
const voteReviewHelpful = async (reviewId: string, helpful: boolean) => {
  try {
    await api.post(`/reviews/${reviewId}/vote`, {
      helpful
    });

    // Update local state
    // Helpful votes influence review sorting
  } catch (error) {
    console.error('Vote failed:', error);
  }
};

// Dealer response to review
const respondToReview = async (reviewId: string, response: string) => {
  try {
    const moderation = await moderateContent(response);
    if (moderation.flagged) {
      throw new Error('Response contains inappropriate content');
    }

    await api.post(`/reviews/${reviewId}/respond`, {
      response
    });

    // Notify customer that dealer responded
    showToast({
      message: "Response posted",
      type: "success"
    });
  } catch (error) {
    showError('Failed to post response');
  }
};

// Review analytics for dealers
interface ReviewAnalytics {
  overall: {
    averageRating: number;
    totalReviews: number;
    distribution: { [key: number]: number }; // 1-5 stars
    trend: 'improving' | 'stable' | 'declining';
  };
  categories: {
    quality: number;
    delivery: number;
    service: number;
  };
  sentiment: {
    positive: number; // %
    neutral: number;
    negative: number;
  };
  commonTags: Array<{ tag: string; count: number }>;
  recommendationRate: number; // %
  responseRate: number; // % of reviews responded to
  responseTime: number; // avg hours to respond
}

const getReviewAnalytics = async (dealerId: string): Promise<ReviewAnalytics> => {
  const response = await api.get(`/dealers/${dealerId}/review-analytics`);
  return response.data;
};

// Incentivize reviews
const awardReviewPoints = async (userId: string) => {
  await api.post(`/users/${userId}/points`, {
    points: 50,
    reason: 'review_submitted',
    expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
  });
};

// Review reminders
const scheduleReviewReminder = (orderId: string, userId: string) => {
  // Send reminder 24 hours after delivery
  // "How was your order? Share your experience and earn 50 points!"

  // Send second reminder after 3 days if not reviewed
  // "We'd love to hear about your recent order!"

  // Stop reminding after 7 days
};
```

---

#### Feature 7: In-App Communication

**Chat System:**

```
Chat Interface
┌─────────────────────────────────┐
│ ←  Sri Ganesh Traders      [⋮]  │
│    Last seen: 5 mins ago        │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────┐      │
│  │ Hi! I have a question │      │ ← Customer message
│  │ about the tiles       │      │
│  └───────────────────────┘      │
│    11:30 AM ✓✓                  │
│                                 │
│      ┌───────────────────────┐  │
│      │ Sure! How can I help?│  │ ← Dealer message
│      └───────────────────────┘  │
│                  11:31 AM ✓✓    │
│                                 │
│  ┌───────────────────────┐      │
│  │ Do you have Kajaria   │      │
│  │ 600x600mm in stock?   │      │
│  └───────────────────────┘      │
│    11:32 AM ✓✓                  │
│                                 │
│      ┌───────────────────────┐  │
│      │ Yes! We have white   │  │
│      │ and beige. Would you │  │
│      │ like to see samples? │  │
│      └───────────────────────┘  │
│                  11:32 AM ✓✓    │
│                                 │
│  ┌───────────────────────┐      │
│  │ [Photo attached]      │      │ ← Image message
│  │ 📷 Reference tile     │      │
│  └───────────────────────┘      │
│    11:33 AM ✓✓                  │
│                                 │
│      ┌───────────────────────┐  │
│      │ Perfect! That's      │  │
│      │ Kajaria Etna White.  │  │
│      │ ₹55/sq.ft           │  │
│      │ [Quick Quote: ₹55K]  │  │ ← Quick action
│      └───────────────────────┘  │
│                  11:35 AM ✓✓    │
│                                 │
├─────────────────────────────────┤
│ [📎] [📷] Type a message...  [▶]│ ← Input bar
└─────────────────────────────────┘

Quick Actions in Chat
┌─────────────────────────────────┐
│ Tap [+] to send:                │
│ ┌──────┬──────┬──────┬──────┐   │
│ │ 📷   │ 🗂️   │ 📍   │ 💰   │   │
│ │Photo │ Doc  │ Loc  │Quote│   │
│ └──────┴──────┴──────┴──────┘   │
│ ┌──────┬──────┬──────┬──────┐   │
│ │ 🔔   │ 📅   │ ⭐   │ 📦   │   │
│ │Alert │ Date │Review│Order│   │
│ └──────┴──────┴──────┴──────┘   │
└─────────────────────────────────┘
```

**Chat Features:**

```typescript
import { StreamChat } from 'stream-chat-expo'; // Or custom WebSocket
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

// Chat implementation
export const ChatScreen = ({ dealerId, inquiryId }: ChatProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initialize chat client
    const client = StreamChat.getInstance(STREAM_API_KEY);

    // Connect user
    await client.connectUser(
      {
        id: currentUser.id,
        name: currentUser.name,
        image: currentUser.avatar
      },
      await SecureStore.getItemAsync('streamChatToken')
    );

    // Get or create channel
    const channel = client.channel('messaging', `inquiry-${inquiryId}`, {
      members: [currentUser.id, dealerId],
      name: `Inquiry #${inquiryId}`,
      inquiry_id: inquiryId
    });

    await channel.watch();

    // Load messages
    const history = await channel.query({
      messages: { limit: 50 }
    });

    setMessages(formatMessages(history.messages));

    // Listen for new messages
    channel.on('message.new', (event) => {
      setMessages(prev => GiftedChat.append(prev, [formatMessage(event.message)]));
    });

    // Listen for typing indicators
    channel.on('typing.start', () => setIsTyping(true));
    channel.on('typing.stop', () => setIsTyping(false));

    return () => {
      channel.stopWatching();
      client.disconnectUser();
    };
  }, []);

  const onSend = async (newMessages: IMessage[]) => {
    try {
      const message = newMessages[0];

      // Send via Stream Chat
      await channel.sendMessage({
        text: message.text,
        attachments: message.image ? [{
          type: 'image',
          image_url: message.image,
          fallback: 'Image'
        }] : []
      });

      // Also send push notification if dealer is offline
      if (!dealerOnline) {
        await sendPushNotification(dealerId, {
          title: `New message from ${currentUser.name}`,
          body: message.text,
          data: { inquiryId, type: 'chat_message' }
        });
      }
    } catch (error) {
      showError('Failed to send message');
    }
  };

  const sendTypingIndicator = () => {
    channel.keystroke();
  };

  const sendQuickQuote = async (items: InquiryItem[], total: number) => {
    // Send structured quote message
    await channel.sendMessage({
      text: `Quick Quote: ₹${total.toLocaleString()}`,
      attachments: [{
        type: 'quote',
        quote_id: 'temp-' + Date.now(),
        items: items,
        total: total,
        actions: [
          { text: 'Accept Quote', value: 'accept' },
          { text: 'View Details', value: 'view' }
        ]
      }]
    });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{ _id: currentUser.id }}
      renderActions={() => <ChatActions onQuickQuote={sendQuickQuote} />}
      renderMessageImage={(props) => <OptimizedImage {...props} />}
      isTyping={isTyping}
      onInputTextChanged={sendTypingIndicator}
    />
  );
};

// Smart chat features
const ChatFeatures = {
  // Auto-translate messages (for regional language support)
  translateMessage: async (text: string, targetLang: string) => {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: 'text'
        })
      }
    );

    const data = await response.json();
    return data.data.translations[0].translatedText;
  },

  // Quick replies for common questions
  suggestQuickReplies: (lastMessage: string): string[] => {
    const replies: Record<string, string[]> = {
      'stock': ['Yes, in stock', 'Out of stock', 'Check and get back'],
      'price': ['₹55/sq.ft', '₹60/sq.ft', 'Let me calculate'],
      'delivery': ['2 days', '3-4 days', 'Available today'],
      'default': ['Yes', 'No', 'Let me check']
    };

    const keyword = detectKeyword(lastMessage);
    return replies[keyword] || replies['default'];
  },

  // Link inquiry context in chat
  showInquiryContext: (inquiryId: string) => {
    return (
      <TouchableOpacity onPress={() => navigate('InquiryDetail', { inquiryId })}>
        <View style={styles.contextCard}>
          <Text>📋 Inquiry #{inquiryId}</Text>
          <Text>16 items • ₹42K budget</Text>
          <Text style={styles.link}>View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  },

  // Attachments with preview
  sendAttachment: async (type: 'image' | 'document' | 'location') => {
    switch (type) {
      case 'image':
        const imageResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7
        });
        if (!imageResult.canceled) {
          return { type: 'image', uri: imageResult.assets[0].uri };
        }
        break;

      case 'document':
        const docResult = await DocumentPicker.getDocumentAsync();
        if (docResult.type === 'success') {
          return { type: 'document', uri: docResult.uri, name: docResult.name };
        }
        break;

      case 'location':
        const location = await Location.getCurrentPositionAsync();
        return {
          type: 'location',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
    }
    return null;
  },

  // Mark messages as read
  markAsRead: async (channelId: string) => {
    await channel.markRead();

    // Update unread count in backend
    await api.post(`/chats/${channelId}/read`);
  }
};

// Chat notifications
const sendChatNotification = async (recipientId: string, message: IMessage) => {
  // Only send if recipient is offline or app is in background
  const recipientOnline = await checkUserOnline(recipientId);

  if (!recipientOnline) {
    await sendPushNotification(recipientId, {
      title: message.user.name,
      body: message.text || '[Image]',
      data: {
        type: 'chat_message',
        channelId: message.channelId,
        messageId: message._id
      }
    });

    // Also send SMS for important messages
    if (message.text.includes('urgent') || message.text.includes('important')) {
      await sendSMS(recipientId, {
        message: `New urgent message from ${message.user.name}. Open Hub4Estate to view.`
      });
    }
  }
};
```

---

## 5. App 2: Business/Dealer Application

### 5.1 Business Profile Management

**Profile Types:**

```
Business Profile Categories
┌──────────────────────────────────────────────────────────┐
│ 1. MATERIAL DEALER                                        │
│    ├─ Primary business: Sell construction materials      │
│    ├─ Profile sections:                                  │
│    │   • Business details (name, address, GST)           │
│    │   • Product categories (tiles, sanitary, etc.)      │
│    │   • Showroom photos (5-10 images)                   │
│    │   • Brands carried                                  │
│    │   • Delivery radius                                 │
│    │   • Operating hours                                 │
│    │   • Contact details                                 │
│    └─  • Bank account (for payments)                     │
├──────────────────────────────────────────────────────────┤
│ 2. KEY ARCHITECT                                         │
│    ├─ Primary business: Architectural design services    │
│    ├─ Profile sections:                                  │
│    │   • Professional credentials (license, awards)      │
│    │   • Services offered                                │
│    │   • Project portfolio (20+ photos with details)     │
│    │   • Specializations (residential, commercial, etc.) │
│    │   • Team size                                       │
│    │   • Consultation fees                               │
│    │   • Social media links                              │
│    └─  • Client testimonials                             │
├──────────────────────────────────────────────────────────┤
│ 3. INTERIOR DESIGNER                                     │
│    ├─ Primary business: Interior design services         │
│    ├─ Profile sections:                                  │
│    │   • Design philosophy                               │
│    │   • Style specializations (modern, traditional...)  │
│    │   • Portfolio gallery (before/after photos)         │
│    │   • Services (design, execution, consultation)      │
│    │   • Price range indicators                          │
│    │   • Preferred vendors (material dealers)            │
│    └─  • Instagram/Pinterest integration                 │
├──────────────────────────────────────────────────────────┤
│ 4. CONTRACTOR / SERVICE PROVIDER                         │
│    ├─ Primary business: Construction execution           │
│    ├─ Profile sections:                                  │
│    │   • Services (plumbing, electrical, masonry, etc.)  │
│    │   • Experience (years in business)                  │
│    │   • Completed projects                              │
│    │   • Certifications                                  │
│    │   • Equipment owned                                 │
│    │   • Team size & skills                              │
│    │   • Service area                                    │
│    └─  • Insurance details                               │
└──────────────────────────────────────────────────────────┘
```

**Business Profile UI:**

```
Create/Edit Business Profile
┌─────────────────────────────────┐
│ ←  Business Profile         [✓] │
├─────────────────────────────────┤
│ PROFILE COMPLETION: 75% ████▓   │
│                                 │
│ BUSINESS TYPE *                 │
│ ┌─────────────────────────────┐ │
│ │ Material Dealer          ▼  │ │
│ └─────────────────────────────┘ │
│                                 │
│ BASIC INFORMATION               │
│                                 │
│ Business Name *                 │
│ ┌─────────────────────────────┐ │
│ │ Sri Ganesh Traders          │ │
│ └─────────────────────────────┘ │
│                                 │
│ GST Number                      │
│ ┌─────────────────────────────┐ │
│ │ 29XXXXX1234X1ZX             │ │
│ └─────────────────────────────┘ │
│ ✓ Verified                      │
│                                 │
│ Year Established                │
│ ┌─────────────────────────────┐ │
│ │ 1998                        │ │
│ └─────────────────────────────┘ │
│                                 │
│ LOCATION *                      │
│ ┌─────────────────────────────┐ │
│ │ Shop 15, HSR Layout         │ │
│ │ Bangalore - 560102          │ │
│ │ [📍 Set on map]             │ │
│ └─────────────────────────────┘ │
│                                 │
│ SHOWROOM PHOTOS *               │
│ (Helps build trust!)            │
│ ┌───┬───┬───┬───┬───┐          │
│ │[📷]│[📷]│[📷]│[+]│[+]│          │
│ └───┴───┴───┴───┴───┘          │
│ 3/10 uploaded                   │
│                                 │
│ PRODUCTS & SERVICES             │
│                                 │
│ Categories offered: *           │
│ ☑ Tiles (Vitrified, Ceramic)   │
│ ☑ Sanitary Ware                 │
│ ☑ Bathroom Fittings             │
│ ☐ Paints                        │
│ ☐ Hardware                      │
│ ☐ Marble & Granite              │
│ ☐ Plywood & Laminates           │
│ [+ Add custom category]         │
│                                 │
│ ... (scroll for more)           │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Save & Continue          │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘

Profile - Page 2
┌─────────────────────────────────┐
│ ←  Business Profile         [✓] │
├─────────────────────────────────┤
│ PROFILE COMPLETION: 75% ████▓   │
│                                 │
│ BRANDS WE CARRY                 │
│ (Auto-suggestions as you type)  │
│ ┌─────────────────────────────┐ │
│ │ Start typing brand name...  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Selected brands (12):           │
│ [Kajaria ✕] [Somany ✕]         │
│ [Jaquar ✕] [Cera ✕]            │
│ [Asian Paints ✕] [Neolith ✕]   │
│ ... +6 more                     │
│                                 │
│ DELIVERY INFORMATION            │
│                                 │
│ Do you offer delivery?          │
│ ◉ Yes  ○ No                     │
│                                 │
│ Delivery Radius                 │
│ ┌──────●────────────────────┐   │
│ │ 15 km                      │   │
│ └────────────────────────────┘   │
│                                 │
│ Minimum Order for Free Delivery │
│ ┌─────────────────────────────┐ │
│ │ ₹5,000                      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Delivery Charges                │
│ ┌─────────────────────────────┐ │
│ │ ₹500 (within 10 km)         │ │
│ │ ₹800 (10-15 km)             │ │
│ └─────────────────────────────┘ │
│                                 │
│ OPERATING HOURS                 │
│                                 │
│ Monday - Saturday               │
│ ┌──────────┬──────────────────┐ │
│ │ 9:00 AM  │  8:00 PM      ▼ │ │
│ └──────────┴──────────────────┘ │
│                                 │
│ Sunday                          │
│ ☑ Closed                        │
│                                 │
│ CONTACT DETAILS                 │
│                                 │
│ Phone (Primary) *               │
│ ┌─────────────────────────────┐ │
│ │ +91 98765 43210             │ │
│ └─────────────────────────────┘ │
│ ✓ Verified via OTP              │
│                                 │
│ WhatsApp Business Number        │
│ ┌─────────────────────────────┐ │
│ │ Same as primary  ☑          │ │
│ └─────────────────────────────┘ │
│                                 │
│ Email                           │
│ ┌─────────────────────────────┐ │
│ │ contact@sgtraders.com       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Website (Optional)              │
│ ┌─────────────────────────────┐ │
│ │ www.sgtraders.com           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Save & Continue          │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘

Architect/Designer Portfolio
┌─────────────────────────────────┐
│ ←  Portfolio                [+] │
├─────────────────────────────────┤
│ PROFILE COMPLETION: 85% █████▓  │
│                                 │
│ PROFESSIONAL CREDENTIALS        │
│                                 │
│ Registration Number             │
│ ┌─────────────────────────────┐ │
│ │ COA/1234/2010               │ │
│ └─────────────────────────────┘ │
│ ✓ Verified by Council of        │
│   Architecture                  │
│                                 │
│ Upload License (PDF)            │
│ ┌─────────────────────────────┐ │
│ │ 📄 COA_License.pdf          │ │
│ │ Uploaded 2 months ago       │ │
│ └─────────────────────────────┘ │
│                                 │
│ AWARDS & RECOGNITION            │
│ ┌─────────────────────────────┐ │
│ │ + Add Award                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ • Best Residential Design 2024  │
│   Indian Architecture Awards    │
│   [Edit] [Delete]               │
│                                 │
│ SERVICES OFFERED                │
│ ☑ Architectural Design          │
│ ☑ Interior Design               │
│ ☑ Project Management            │
│ ☑ 3D Visualization              │
│ ☑ Vastu Consultation            │
│ ☑ Structural Design             │
│                                 │
│ SPECIALIZATIONS                 │
│ ☑ Residential (Villas, Apartments)│
│ ☑ Commercial (Offices, Retail)   │
│ ☐ Hospitality                    │
│ ☐ Industrial                     │
│ ☑ Sustainable Architecture       │
│                                 │
│ CONSULTATION FEES               │
│ ┌─────────────────────────────┐ │
│ │ ₹2,000 per consultation     │ │
│ │ (First consultation free)   │ │
│ └─────────────────────────────┘ │
│                                 │
│ PROJECT PORTFOLIO               │
│ (20 projects uploaded)          │
│                                 │
│ ┌───────────────────────────┐   │
│ │  + Add New Project        │   │
│ └───────────────────────────┘   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Project Thumbnail]         │ │
│ │                             │ │
│ │ Modern Villa, Whitefield    │ │
│ │ 2023 • Residential          │ │
│ │ 5000 sq.ft                  │ │
│ │ [12 photos] [Edit]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Project Thumbnail]         │ │
│ │                             │ │
│ │ Tech Office, Koramangala    │ │
│ │ 2024 • Commercial           │ │
│ │ 15000 sq.ft                 │ │
│ │ [8 photos] [Edit]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (18 more projects)          │
│                                 │
│ SOCIAL MEDIA                    │
│ Link your profiles:             │
│ Instagram: @architect_aditya ✓  │
│ LinkedIn: /in/aditya-sharma ✓   │
│ Website: www.aditya.design ✓    │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Save Profile             │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘

Add Project to Portfolio
┌─────────────────────────────────┐
│ ←  Add Project              [✓] │
├─────────────────────────────────┤
│ PROJECT PHOTOS *                │
│ ┌───┬───┬───┬───┬───┐          │
│ │[📷]│[📷]│[📷]│[+]│[+]│          │
│ └───┴───┴───┴───┴───┘          │
│ ┌───┬───┬───┬───┬───┐          │
│ │[+]│[+]│[+]│[+]│[+]│          │
│ └───┴───┴───┴───┴───┘          │
│ 3/20 photos uploaded            │
│                                 │
│ PROJECT NAME *                  │
│ ┌─────────────────────────────┐ │
│ │ Modern Villa, Whitefield    │ │
│ └─────────────────────────────┘ │
│                                 │
│ PROJECT TYPE *                  │
│ ┌─────────────────────────────┐ │
│ │ Residential              ▼  │ │
│ └─────────────────────────────┘ │
│                                 │
│ YEAR COMPLETED *                │
│ ┌─────────────────────────────┐ │
│ │ 2023                        │ │
│ └─────────────────────────────┘ │
│                                 │
│ AREA (sq.ft)                    │
│ ┌─────────────────────────────┐ │
│ │ 5000                        │ │
│ └─────────────────────────────┘ │
│                                 │
│ LOCATION                        │
│ ┌─────────────────────────────┐ │
│ │ Whitefield, Bangalore       │ │
│ └─────────────────────────────┘ │
│                                 │
│ PROJECT DESCRIPTION             │
│ ┌─────────────────────────────┐ │
│ │ Contemporary villa with     │ │
│ │ emphasis on natural light   │ │
│ │ and indoor-outdoor living.  │ │
│ │                             │ │
│ │ Features: Double-height     │ │
│ │ living, infinity pool,      │ │
│ │ sustainable materials...    │ │
│ └─────────────────────────────┘ │
│ 120/500 characters              │
│                                 │
│ KEY FEATURES (Tags)             │
│ [Modern ✕] [Sustainable ✕]     │
│ [Luxury ✕] [+ Add tag]          │
│                                 │
│ CLIENT TESTIMONIAL (Optional)   │
│ ┌─────────────────────────────┐ │
│ │ "Aditya understood our     │ │
│ │ vision perfectly..."        │ │
│ │ - Mr. & Mrs. Sharma         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Add to Portfolio         │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

**Profile Verification Process:**

```typescript
// Business verification workflow
interface VerificationStatus {
  overall: 'pending' | 'partial' | 'verified' | 'rejected';
  checks: {
    phone: VerificationCheck;
    email: VerificationCheck;
    gst?: VerificationCheck;
    professionalLicense?: VerificationCheck;
    address?: VerificationCheck;
  };
}

interface VerificationCheck {
  status: 'pending' | 'verified' | 'failed';
  verifiedAt?: number;
  rejectionReason?: string;
}

// Step 1: Phone verification (mandatory)
const verifyPhone = async (phoneNumber: string) => {
  try {
    // Send OTP via Twilio/Firebase
    await api.post('/verification/phone/send-otp', { phone: phoneNumber });

    // Show OTP input screen
    const otp = await showOTPInput();

    // Verify OTP
    const response = await api.post('/verification/phone/verify-otp', {
      phone: phoneNumber,
      otp
    });

    if (response.data.verified) {
      showToast({ message: 'Phone verified!', type: 'success' });
      updateVerificationStatus('phone', 'verified');
    }
  } catch (error) {
    showError('Phone verification failed');
  }
};

// Step 2: GST verification (for dealers)
const verifyGST = async (gstNumber: string) => {
  try {
    // Call GST verification API
    const response = await api.post('/verification/gst', { gstNumber });

    if (response.data.valid) {
      // Auto-fill business details from GST records
      const gstData = response.data.gstData;
      setBusinessDetails({
        name: gstData.legalName,
        address: gstData.address,
        registeredSince: gstData.registrationDate
      });

      updateVerificationStatus('gst', 'verified');
      showToast({ message: 'GST verified!', type: 'success' });
    }
  } catch (error) {
    showAlert({
      title: "GST Verification Failed",
      message: "Please check your GST number and try again.",
    });
  }
};

// Step 3: Professional license verification (for architects)
const verifyProfessionalLicense = async (licenseNumber: string, document: File) => {
  try {
    // Upload license document
    const formData = new FormData();
    formData.append('licenseNumber', licenseNumber);
    formData.append('document', {
      uri: document.uri,
      type: 'application/pdf',
      name: 'license.pdf'
    });

    const response = await api.post('/verification/professional-license', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Manual verification by admin (1-2 business days)
    showAlert({
      title: "Verification Submitted",
      message: "Your license will be verified within 2 business days. You'll receive a notification once approved.",
    });

    updateVerificationStatus('professionalLicense', 'pending');
  } catch (error) {
    showError('Failed to submit license for verification');
  }
};

// Step 4: Address verification (optional but recommended)
const verifyAddress = async () => {
  try {
    // Option 1: Video KYC
    const videoKYC = await startVideoKYC();

    // Option 2: Upload utility bill/shop photo
    const document = await selectDocument();
    await uploadAddressProof(document);

    // Option 3: Physical verification (for premium dealers)
    await requestPhysicalVerification();

  } catch (error) {
    console.error('Address verification error:', error);
  }
};

// Verification badges
const VerificationBadges = ({ businessType, status }: Props) => {
  return (
    <View style={styles.badges}>
      {status.checks.phone.status === 'verified' && (
        <Badge icon="phone-check" label="Phone Verified" color="green" />
      )}

      {status.checks.gst?.status === 'verified' && (
        <Badge icon="shield-check" label="GST Verified" color="blue" />
      )}

      {status.checks.professionalLicense?.status === 'verified' && (
        <Badge icon="certificate" label="Licensed Professional" color="gold" />
      )}

      {status.checks.address?.status === 'verified' && (
        <Badge icon="map-marker-check" label="Address Verified" color="green" />
      )}

      {status.overall === 'verified' && (
        <Badge icon="star" label="Verified Business ✓" color="orange" featured />
      )}
    </View>
  );
};

// Benefits of verification
const VerificationBenefits = {
  phone: [
    'Receive inquiry notifications',
    'Build customer trust'
  ],
  gst: [
    'Higher ranking in search',
    'Eligible for B2B features',
    'Builds credibility'
  ],
  professional_license: [
    'Premium profile badge',
    'Featured in "Top Professionals" section',
    '3x more profile views'
  ],
  address: [
    'Google Maps integration',
    'Direction links for customers',
    'Local search boost'
  ],
  full_verification: [
    'Priority in search results',
    'Featured dealer status',
    'Higher inquiry volume (+40%)',
    'Trusted by customers',
    'Access to premium features'
  ]
};
```

---

### 5.2 Inquiry Inbox & Management

**Inbox UI:**

```
Inquiry Inbox - Home Screen
┌─────────────────────────────────┐
│ Hub4Estate Business         [≡]  │
├─────────────────────────────────┤
│ 📥 INQUIRIES                    │
│                                 │
│ ┌───────────────────────────┐   │
│ │ 🔥 3 NEW INQUIRIES        │   │ ← Alert card
│ │ Respond fast to win!      │   │
│ └───────────────────────────┘   │
│                                 │
│ FILTERS                         │
│ [All 45] [New 3] [Quoted 28]   │
│ [Won 12] [Lost 2]               │
│                                 │
│ SORT BY: Newest First ▼         │
│                                 │
├─────────────────────────────────┤
│ NEW (3)                         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🆕 Inquiry #1234            │ │
│ │                             │ │
│ │ 16 items • Budget: ~₹45K    │ │
│ │ Tiles, Paint, Sanitary      │ │
│ │                             │ │
│ │ 📍 2.3 km • Whitefield      │ │
│ │ 🕐 15 minutes ago           │ │
│ │                             │ │
│ │ ⏱️ RESPOND FAST! 5 dealers  │ │
│ │   already viewing           │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │  QUICK QUOTE (1 min) →  │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🆕 Inquiry #1235            │ │
│ │                             │ │
│ │ 8 items • Budget: ~₹22K     │ │
│ │ Bathroom Fittings           │ │
│ │                             │ │
│ │ 📍 5.8 km • HSR Layout      │ │
│ │ 🕐 32 minutes ago           │ │
│ │                             │ │
│ │ [View Details] [Quick Quote]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (1 more new)                │
│                                 │
├─────────────────────────────────┤
│ QUOTED (28)                     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✅ Inquiry #1230 - QUOTED   │ │
│ │                             │ │
│ │ Your quote: ₹42,300         │ │
│ │ Status: Customer reviewing  │ │
│ │ 🕐 2 hours ago              │ │
│ │                             │ │
│ │ [View Quote] [Edit] [Chat]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (27 more quoted)            │
│                                 │
├─────────────────────────────────┤
│ WON (12) 🎉                     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏆 Order #ORD-5678 - WON!   │ │
│ │                             │ │
│ │ Amount: ₹42,300             │ │
│ │ Customer: Rajesh Kumar      │ │
│ │ Status: Preparing           │ │
│ │                             │ │
│ │ [View Order] [Update Status]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (11 more won)               │
└─────────────────────────────────┘

Inquiry Detail View
┌─────────────────────────────────┐
│ ←  Inquiry #1234           [⋮]  │
├─────────────────────────────────┤
│ 🆕 NEW INQUIRY                   │
│ Received: 15 minutes ago        │
│                                 │
│ ⏱️ 9 dealers viewing this       │
│ Respond fast to win!            │
│                                 │
│ CUSTOMER DETAILS                │
│ ┌─────────────────────────────┐ │
│ │ Rajesh Kumar               │ │
│ │ ⭐ 4.8 (12 past orders)     │ │
│ │ 📍 2.3 km away              │ │
│ │ ✓ Payment: Always on-time  │ │
│ │                             │ │
│ │ [📞 Call] [💬 Chat]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ DELIVERY REQUIREMENTS           │
│ Location: Whitefield, Bangalore │
│ Needed by: 25th March (5 days)  │
│ Notes: "Prefer Kajaria brand"   │
│                                 │
│ ITEM LIST (16 items)            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ White Vitrified Tiles       │ │
│ │ 600x600mm                   │ │
│ │ Quantity: 2000 sq.ft        │ │
│ │ Brand pref: Kajaria         │ │
│ │                             │ │
│ │ Your price: [₹_____]/sq.ft │ │ ← Quick input
│ │ Suggested: ₹55-65           │ │
│ │                             │ │
│ │ ☑ In stock                  │ │
│ │ ☐ Out of stock              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Asian Paints Royale         │ │
│ │ 40 liters                   │ │
│ │                             │ │
│ │ Your price: [₹_____]/liter │ │
│ │ Suggested: ₹95-110          │ │
│ │                             │ │
│ │ ☑ In stock                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ... (14 more items)             │
│                                 │
│ TOTAL ESTIMATE                  │
│ ┌─────────────────────────────┐ │
│ │ Subtotal:      ₹40,800      │ │
│ │ Delivery (+):  ₹1,500       │ │
│ │ Discount (-):  [₹_____]     │ │
│ │ ═══════════════════════════ │ │
│ │ TOTAL:         ₹42,300      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ADD NOTE TO CUSTOMER (Optional) │
│ ┌─────────────────────────────┐ │
│ │ "Premium Kajaria tiles in   │ │
│ │ stock. Can deliver in 2 days│ │
│ │ Free installation guide."   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌───────────────────────────┐   │
│ │  SUBMIT QUOTE             │   │ ← Big CTA
│ └───────────────────────────┘   │
│                                 │
│ [Save as Draft] [Decline Inquiry]│
└─────────────────────────────────┘

Quick Quote Templates
┌─────────────────────────────────┐
│ Quick Quote                 [✕] │
├─────────────────────────────────┤
│ Save time with templates!       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📋 STANDARD TILES            │ │
│ │ White Vitrified 600x600      │ │
│ │ ₹55/sq.ft                   │ │
│ │ [Use Template]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📋 BATHROOM PACKAGE          │ │
│ │ Sanitary + Fittings bundle   │ │
│ │ Starting ₹15,000            │ │
│ │ [Use Template]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📋 PAINT COMBO               │ │
│ │ Interior + Exterior          │ │
│ │ ₹95/liter                   │ │
│ │ [Use Template]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Create New Template]         │
└─────────────────────────────────┘
```

**Smart Inquiry Features:**

```typescript
// Inquiry matching algorithm
interface InquiryMatchScore {
  inquiry: Inquiry;
  score: number; // 0-100
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
}

const rankInquiriesForDealer = (
  inquiries: Inquiry[],
  dealer: Dealer
): InquiryMatchScore[] => {
  return inquiries.map(inquiry => {
    let score = 50; // Base score
    const reasons: string[] = [];

    // Factor 1: Product match
    const productMatch = calculateProductMatch(inquiry.items, dealer.products);
    score += productMatch * 30; // Up to +30
    if (productMatch > 0.8) {
      reasons.push('Perfect product match');
    }

    // Factor 2: Distance
    const distance = calculateDistance(dealer.location, inquiry.location);
    if (distance < 5) {
      score += 20;
      reasons.push('Very close to customer');
    } else if (distance < 10) {
      score += 10;
      reasons.push('Within delivery range');
    } else if (distance > dealer.deliveryRadiusKm) {
      score -= 30;
      reasons.push('⚠️ Outside delivery radius');
    }

    // Factor 3: Order value vs dealer's average
    const orderValue = estimateOrderValue(inquiry.items);
    if (orderValue > dealer.averageOrderValue * 1.5) {
      score += 15;
      reasons.push('High-value order');
    }

    // Factor 4: Customer rating & reliability
    if (inquiry.customer.rating > 4.5) {
      score += 10;
      reasons.push('Highly-rated customer');
    }
    if (inquiry.customer.ordersCompleted > 10) {
      score += 5;
      reasons.push('Repeat customer');
    }

    // Factor 5: Urgency
    const daysUntilNeeded = (inquiry.requiredByDate - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilNeeded < 3) {
      score += 10;
      reasons.push('Urgent requirement');
    }

    // Factor 6: Competition
    if (inquiry.dealersViewing > 10) {
      score += 15;
      reasons.push('⏱️ High competition - respond fast!');
    }

    // Determine priority
    let priority: 'high' | 'medium' | 'low';
    if (score >= 80) priority = 'high';
    else if (score >= 60) priority = 'medium';
    else priority = 'low';

    return {
      inquiry,
      score: Math.min(100, Math.max(0, score)),
      reasons,
      priority
    };
  }).sort((a, b) => b.score - a.score);
};

// Auto-suggestions for pricing
const suggestPrice = (item: InquiryItem, dealer: Dealer): PriceSuggestion => {
  // Historical pricing
  const historical = dealer.pastQuotes.filter(q =>
    q.itemName.includes(item.name) || item.name.includes(q.itemName)
  );

  const avgHistoricalPrice = historical.length > 0
    ? mean(historical.map(h => h.price))
    : null;

  // Market prices
  const marketData = getMarketPrice(item.name, item.brand);

  // Competitive prices (from other dealers)
  const competitiveData = getCompetitivePrices(item, dealer.location);

  return {
    suggested: avgHistoricalPrice || marketData.average,
    range: {
      min: marketData.min,
      max: marketData.max
    },
    competitive: competitiveData.average,
    yourHistorical: avgHistoricalPrice,
    recommendation: generatePricingRecommendation({
      historical: avgHistoricalPrice,
      market: marketData.average,
      competitive: competitiveData.average,
      dealerMargin: dealer.targetMargin
    })
  };
};

// Bulk quote actions
const bulkQuoteActions = {
  // Accept multiple inquiries at once
  acceptMultiple: async (inquiryIds: string[]) => {
    showLoading('Creating quotes...');

    const results = await Promise.allSettled(
      inquiryIds.map(id => api.post(`/inquiries/${id}/accept`))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;

    showToast({
      message: `Accepted ${successful} of ${inquiryIds.length} inquiries`,
      type: successful === inquiryIds.length ? 'success' : 'warning'
    });
  },

  // Decline with reason
  declineWithReason: async (inquiryId: string, reason: string) => {
    await api.post(`/inquiries/${inquiryId}/decline`, {
      reason
    });

    // Helps platform understand why dealers decline
    // Improves future matching
  },

  // Snooze inquiry (remind me later)
  snooze: async (inquiryId: string, hours: number) => {
    await api.post(`/inquiries/${inquiryId}/snooze`, {
      snoozeUntil: Date.now() + (hours * 60 * 60 * 1000)
    });

    showToast({
      message: `Snoozed for ${hours} hours`,
      type: 'info'
    });
  }
};

// Inquiry notifications
const inquiryNotifications = {
  // Push notification on new inquiry
  onNewInquiry: async (inquiry: Inquiry, dealer: Dealer) => {
    const match = rankInquiriesForDealer([inquiry], dealer)[0];

    await sendPushNotification(dealer.id, {
      title: match.priority === 'high'
        ? '🔥 High-Priority Inquiry!'
        : '📥 New Inquiry',
      body: `${inquiry.items.length} items • ${inquiry.location} • ${inquiry.estimatedValue}`,
      data: {
        inquiryId: inquiry.id,
        priority: match.priority,
        type: 'new_inquiry'
      },
      priority: match.priority === 'high' ? 'high' : 'normal'
    });

    // If high-priority and dealer hasn't opened app in 15 mins, send SMS
    if (match.priority === 'high') {
      setTimeout(async () => {
        const viewed = await checkIfViewed(inquiry.id, dealer.id);
        if (!viewed) {
          await sendSMS(dealer.phone, {
            message: `High-value inquiry (₹${inquiry.estimatedValue}K) waiting! Open Hub4Estate to respond: hub4.estate/i/${inquiry.id}`
          });
        }
      }, 15 * 60 * 1000);
    }
  },

  // Reminder if not responded
  sendReminder: async (inquiry: Inquiry, dealer: Dealer) => {
    // After 30 mins if not quoted
    setTimeout(async () => {
      const quoted = await checkIfQuoted(inquiry.id, dealer.id);
      if (!quoted) {
        await sendPushNotification(dealer.id, {
          title: '⏰ Reminder: Pending Inquiry',
          body: `${inquiry.dealersQuoted} dealers have quoted. Don't miss out!`,
          data: { inquiryId: inquiry.id, type: 'reminder' }
        });
      }
    }, 30 * 60 * 1000);
  },

  // Notify when customer views quote
  onQuoteViewed: async (quote: Quote, dealer: Dealer) => {
    await sendPushNotification(dealer.id, {
      title: '👀 Customer Viewed Your Quote',
      body: `Inquiry #${quote.inquiryId} • ₹${quote.total}`,
      data: { quoteId: quote.id, type: 'quote_viewed' }
    });
  },

  // Notify when won/lost
  onQuoteResult: async (quote: Quote, dealer: Dealer, won: boolean) => {
    if (won) {
      await sendPushNotification(dealer.id, {
        title: '🎉 Congratulations! You Won!',
        body: `Order #${quote.orderId} • ₹${quote.total}`,
        data: { orderId: quote.orderId, type: 'quote_won' }
      });

      // Also send WhatsApp message
      await sendWhatsApp(dealer.phone, {
        template: 'quote_won',
        params: [quote.id, quote.total, quote.customer.name]
      });
    } else {
      await sendPushNotification(dealer.id, {
        title: 'Quote Not Selected',
        body: `Inquiry #${quote.inquiryId} • View winning quote to improve`,
        data: { quoteId: quote.id, type: 'quote_lost' }
      });
    }
  }
};
```


---

### 5.3 Business Analytics Dashboard

**Analytics UI:**

```
Analytics Dashboard
┌─────────────────────────────────┐
│ ←  Analytics                [📅]│
├─────────────────────────────────┤
│ PERFORMANCE OVERVIEW            │
│ Last 30 Days                    │
│                                 │
│ ┌──────────┬──────────┬────────┐│
│ │ INQUIRIES│  QUOTES  │ ORDERS ││
│ │    45    │    32    │   12   ││
│ │   +15%   │   +8%    │  +25%  ││
│ └──────────┴──────────┴────────┘│
│                                 │
│ ┌──────────┬──────────┬────────┐│
│ │ REVENUE  │ AVG ORDER│ RATING ││
│ │ ₹5.2L    │  ₹43.3K  │  4.7⭐ ││
│ │  +32%    │   +12%   │   +0.2 ││
│ └──────────┴──────────┴────────┘│
│                                 │
│ CONVERSION FUNNEL               │
│ ┌─────────────────────────────┐ │
│ │ Inquiries:   45 ████████100%│ │
│ │ Viewed:      42 ███████░ 93%│ │
│ │ Quoted:      32 █████░░░ 71%│ │
│ │ Won:         12 ██░░░░░░ 27%│ │
│ └─────────────────────────────┘ │
│                                 │
│ 💡 Your win rate is 15% above   │
│    platform average!            │
│                                 │
│ REVENUE TREND                   │
│ ┌─────────────────────────────┐ │
│ │     ╱╲                      │ │
│ │    ╱  ╲    ╱               │ │
│ │   ╱    ╲  ╱                │ │
│ │  ╱      ╲╱                 │ │
│ │ ╱                           │ │
│ │ Jan Feb Mar Apr May Jun     │ │
│ └─────────────────────────────┘ │
│ Peak: May (₹8.2L)               │
│ Growth: +120% YoY               │
│                                 │
│ TOP PERFORMING CATEGORIES       │
│ ┌─────────────────────────────┐ │
│ │ 1. Tiles          ₹2.8L  54%│ │
│ │ 2. Sanitary       ₹1.5L  29%│ │
│ │ 3. Paint          ₹0.9L  17%│ │
│ └─────────────────────────────┘ │
│                                 │
│ RESPONSE TIME                   │
│ ┌─────────────────────────────┐ │
│ │ Avg: 8 minutes              │ │
│ │ ████████████████░░░░ 80%    │ │
│ │                             │ │
│ │ 🏆 Faster than 85% of       │ │
│ │    dealers in your area!    │ │
│ └─────────────────────────────┘ │
│                                 │
│ CUSTOMER INSIGHTS               │
│ ┌─────────────────────────────┐ │
│ │ Repeat customers:   40%     │ │
│ │ Avg customer rating: 4.7⭐  │ │
│ │ Review response rate: 95%   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Download Report] [Share]       │
└─────────────────────────────────┘

Detailed Analytics
┌─────────────────────────────────┐
│ ←  Detailed Analytics       [?] │
├─────────────────────────────────┤
│ 📅 Jun 1 - Jun 30, 2026         │
│                                 │
│ QUOTE ANALYSIS                  │
│                                 │
│ Win/Loss Breakdown              │
│ ┌─────────────────────────────┐ │
│ │ Won:   12 orders  (27%)     │ │
│ │ Lost:  18 quotes  (40%)     │ │
│ │ Pending: 14      (31%)      │ │
│ │ Expired: 1        (2%)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Why Did You Lose?               │
│ ┌─────────────────────────────┐ │
│ │ • Price too high:  10 (56%) │ │
│ │ • Slow response:    5 (28%) │ │
│ │ • Out of stock:     2 (11%) │ │
│ │ • Other:            1 (5%)  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💡 Insight: Reduce prices by    │
│    5% to improve win rate       │
│                                 │
│ PRICING INTELLIGENCE            │
│                                 │
│ Your Avg vs Competitors         │
│ ┌─────────────────────────────┐ │
│ │ Tiles (600x600mm)           │ │
│ │ You: ₹55/sq.ft              │ │
│ │ Market avg: ₹52/sq.ft       │ │
│ │ Difference: +6%             │ │
│ │                             │ │
│ │ 💡 Consider matching market │ │
│ │    price for more wins      │ │
│ └─────────────────────────────┘ │
│                                 │
│ CUSTOMER BEHAVIOR               │
│                                 │
│ Peak Inquiry Times              │
│ ┌─────────────────────────────┐ │
│ │ 10 AM - 12 PM: ████████ 40% │ │
│ │  2 PM -  4 PM: ██████░░ 30% │ │
│ │  6 PM -  8 PM: ████░░░░ 20% │ │
│ │ Other times:   ██░░░░░░ 10% │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💡 Be online 10 AM - 12 PM      │
│    for maximum inquiries        │
│                                 │
│ Geographic Distribution         │
│ ┌─────────────────────────────┐ │
│ │ [Map visualization]         │ │
│ │                             │ │
│ │ Top areas:                  │ │
│ │ • Whitefield:    35%        │ │
│ │ • HSR Layout:    25%        │ │
│ │ • Koramangala:   20%        │ │
│ │ • Others:        20%        │ │
│ └─────────────────────────────┘ │
│                                 │
│ GROWTH OPPORTUNITIES            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Add "Paint" category     │ │
│ │ 25 inquiries missed last    │ │
│ │ month. Potential: ₹3.5L     │ │
│ │                             │ │
│ │ [Expand Categories]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Improve response time    │ │
│ │ Reducing from 8min to 5min  │ │
│ │ could increase wins by 12%  │ │
│ │                             │ │
│ │ [Enable Auto-Notifications] │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Analytics Implementation:**

```typescript
// Analytics data structure
interface DealerAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  
  overview: {
    inquiriesReceived: number;
    inquiriesViewed: number;
    quotesSubmitted: number;
    quotesWon: number;
    quotesLost: number;
    revenue: number;
    averageOrderValue: number;
    rating: number;
  };
  
  trends: {
    inquiries: TimeSeriesData;
    revenue: TimeSeriesData;
    orders: TimeSeriesData;
  };
  
  conversion: {
    viewRate: number; // % of inquiries viewed
    quoteRate: number; // % of viewed that got quoted
    winRate: number; // % of quotes that won
  };
  
  performance: {
    averageResponseTime: number; // minutes
    responseTimePercentile: number; // vs other dealers
    onTimeDeliveryRate: number;
    customerSatisfaction: number;
  };
  
  categories: Array<{
    name: string;
    revenue: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  
  lossReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  
  customerInsights: {
    repeatCustomerRate: number;
    averageCustomerRating: number;
    reviewResponseRate: number;
    topCustomerLocations: Array<{
      area: string;
      percentage: number;
    }>;
  };
  
  recommendations: Array<{
    type: 'pricing' | 'inventory' | 'service' | 'expansion';
    title: string;
    description: string;
    potentialImpact: string;
    action: string;
  }>;
}

// Fetch analytics
const getDealerAnalytics = async (
  dealerId: string,
  startDate: Date,
  endDate: Date
): Promise<DealerAnalytics> => {
  const response = await api.get(`/dealers/${dealerId}/analytics`, {
    params: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  });
  
  return response.data;
};

// Real-time analytics updates
const useRealtimeAnalytics = (dealerId: string) => {
  const [analytics, setAnalytics] = useState<DealerAnalytics | null>(null);
  
  useEffect(() => {
    // Initial load
    getDealerAnalytics(dealerId, thirtyDaysAgo(), new Date())
      .then(setAnalytics);
    
    // Subscribe to real-time updates via WebSocket
    const socket = io(API_BASE_URL);
    socket.emit('subscribe-analytics', { dealerId });
    
    socket.on('analytics-update', (update: Partial<DealerAnalytics>) => {
      setAnalytics(prev => prev ? { ...prev, ...update } : null);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [dealerId]);
  
  return analytics;
};

// Competitive benchmarking
interface CompetitiveBenchmark {
  metric: string;
  yourValue: number;
  marketAverage: number;
  topPerformers: number;
  yourPercentile: number; // 0-100
}

const getCompetitiveBenchmarks = async (dealerId: string): Promise<CompetitiveBenchmark[]> => {
  const response = await api.get(`/dealers/${dealerId}/benchmarks`);
  return response.data;
};

// Export analytics reports
const exportAnalyticsReport = async (
  dealerId: string,
  period: { start: Date; end: Date },
  format: 'pdf' | 'excel' | 'csv'
) => {
  try {
    const response = await api.post(`/dealers/${dealerId}/analytics/export`, {
      period,
      format
    });
    
    // Download file
    const fileUri = `${FileSystem.documentDirectory}analytics_${Date.now()}.${format}`;
    await FileSystem.downloadAsync(response.data.url, fileUri);
    
    // Share
    await Sharing.shareAsync(fileUri);
    
    showToast({ message: 'Report exported', type: 'success' });
  } catch (error) {
    showError('Failed to export report');
  }
};

// AI-powered recommendations
const generateRecommendations = (analytics: DealerAnalytics): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Recommendation 1: Pricing optimization
  if (analytics.lossReasons.find(r => r.reason === 'price_too_high')?.percentage > 30) {
    recommendations.push({
      type: 'pricing',
      title: 'Optimize Pricing Strategy',
      description: `You're losing ${analytics.lossReasons.find(r => r.reason === 'price_too_high')?.percentage}% of quotes due to high prices.`,
      potentialImpact: `Reducing prices by 5-8% could increase your win rate by 15%, adding ~₹${(analytics.overview.revenue * 0.15).toLocaleString()} monthly revenue.`,
      action: 'Review Pricing',
      actionHandler: () => navigate('PricingSettings')
    });
  }
  
  // Recommendation 2: Response time
  if (analytics.performance.averageResponseTime > 15) {
    recommendations.push({
      type: 'service',
      title: 'Improve Response Time',
      description: `Your average response time (${analytics.performance.averageResponseTime} min) is slower than 60% of dealers.`,
      potentialImpact: 'Responding within 10 minutes could increase your win rate by 12%.',
      action: 'Enable Instant Notifications',
      actionHandler: () => navigate('NotificationSettings')
    });
  }
  
  // Recommendation 3: Expand categories
  const missedOpportunities = getMissedInquiriesByCategory(analytics);
  if (missedOpportunities.length > 0) {
    const topMissed = missedOpportunities[0];
    recommendations.push({
      type: 'expansion',
      title: `Add "${topMissed.category}" Products`,
      description: `You missed ${topMissed.count} inquiries last month because you don't offer ${topMissed.category}.`,
      potentialImpact: `Potential revenue: ₹${topMissed.estimatedRevenue.toLocaleString()}/month`,
      action: 'Expand Categories',
      actionHandler: () => navigate('CategorySettings')
    });
  }
  
  // Recommendation 4: Geographic expansion
  const potentialAreas = getUntappedAreas(analytics);
  if (potentialAreas.length > 0) {
    recommendations.push({
      type: 'expansion',
      title: 'Expand Delivery Radius',
      description: `High demand in ${potentialAreas[0].name} (${potentialAreas[0].distance} km away).`,
      potentialImpact: `Extending delivery could add ₹${potentialAreas[0].potential}/month`,
      action: 'Update Delivery Settings',
      actionHandler: () => navigate('DeliverySettings')
    });
  }
  
  return recommendations;
};
```

---

## 6. Technology Stack & Architecture

### 6.1 Mobile Applications (React Native + Expo)

**Technology Choices:**

```
Mobile Stack
┌──────────────────────────────────────────────────────────┐
│ FRAMEWORK: React Native + Expo SDK 51+                   │
│                                                          │
│ Why React Native?                                        │
│ ✓ Single codebase for iOS + Android (70% code reuse)    │
│ ✓ Native performance for critical features              │
│ ✓ Fast iteration with hot reload                        │
│ ✓ Large ecosystem of libraries                          │
│ ✓ Easier to find developers (React knowledge transfers) │
│                                                          │
│ Why Expo?                                                │
│ ✓ Faster development (no native code setup needed)      │
│ ✓ Over-the-air updates (fix bugs without app store)     │
│ ✓ Built-in services: Push notifications, Auth, Storage  │
│ ✓ Easy deployment to App Store + Play Store             │
│ ✓ Can eject to bare workflow if needed                  │
├──────────────────────────────────────────────────────────┤
│ LANGUAGE: TypeScript (100% typed)                       │
│                                                          │
│ Benefits:                                                │
│ ✓ Catch errors at compile time, not runtime             │
│ ✓ Better IDE autocomplete and documentation             │
│ ✓ Easier refactoring and maintenance                    │
│ ✓ Self-documenting code with type definitions           │
│ ✓ Industry standard for large applications              │
└──────────────────────────────────────────────────────────┘
```

**Key Dependencies:**

```json
{
  "dependencies": {
    // Core
    "react": "18.2.0",
    "react-native": "0.73.0",
    "expo": "^51.0.0",
    "typescript": "^5.3.0",
    
    // Navigation
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native-stack": "^6.9.17",
    "react-native-screens": "^3.29.0",
    "react-native-safe-area-context": "^4.8.2",
    
    // State Management
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "redux-persist": "^6.0.0",
    
    // API & Data Fetching
    "axios": "^1.6.2",
    "react-query": "^3.39.3",
    "socket.io-client": "^4.5.4",
    
    // Authentication & Security
    "expo-secure-store": "^13.0.2",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-auth-session": "^5.4.0",
    "expo-crypto": "^13.0.2",
    
    // Camera & Media
    "expo-camera": "^15.0.0",
    "expo-image-picker": "^15.0.0",
    "expo-image-manipulator": "^12.0.7",
    "react-native-fast-image": "^8.6.3",
    
    // Location & Maps
    "expo-location": "^17.0.0",
    "react-native-maps": "^1.10.0",
    "react-native-maps-directions": "^1.9.0",
    
    // Google Services
    "@react-native-google-signin/google-signin": "^11.0.0",
    "expo-google-sign-in": "^13.0.0",
    
    // Notifications
    "expo-notifications": "^0.27.0",
    "expo-device": "^6.0.0",
    
    // UI Components
    "react-native-paper": "^5.12.1",
    "react-native-elements": "^3.4.3",
    "react-native-vector-icons": "^10.0.3",
    "@expo/vector-icons": "^14.0.0",
    "react-native-gesture-handler": "^2.14.1",
    "react-native-reanimated": "^3.6.1",
    
    // Forms & Validation
    "react-hook-form": "^7.49.2",
    "yup": "^1.3.3",
    
    // Internationalization
    "i18next": "^23.7.11",
    "react-i18next": "^14.0.0",
    "expo-localization": "^15.0.0",
    
    // Chat
    "stream-chat-expo": "^5.22.0",
    "react-native-gifted-chat": "^2.4.0",
    
    // Analytics
    "expo-analytics-segment": "^13.0.0",
    "@react-native-firebase/analytics": "^19.0.0",
    
    // Error Tracking
    "@sentry/react-native": "^5.15.0",
    
    // Utilities
    "date-fns": "^3.0.6",
    "lodash": "^4.17.21",
    "react-native-dotenv": "^3.4.9"
  },
  
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-native": "^0.72.8",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.2"
  }
}
```

**Architecture Patterns:**

```typescript
// Feature-based folder structure
src/
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SocialLoginButtons.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useGoogleSignIn.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── slip-scanner/
│   │   ├── screens/
│   │   │   ├── ScanSlipScreen.tsx
│   │   │   └── ReviewItemsScreen.tsx
│   │   ├── components/
│   │   │   ├── CameraView.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   └── ConfidenceIndicator.tsx
│   │   ├── hooks/
│   │   │   └── useSlipScanner.ts
│   │   ├── services/
│   │   │   └── aiScan.service.ts
│   │   └── types/
│   │       └── scan.types.ts
│   │
│   ├── inquiries/
│   │   ├── screens/
│   │   │   ├── InquiriesListScreen.tsx
│   │   │   ├── InquiryDetailScreen.tsx
│   │   │   └── CreateInquiryScreen.tsx
│   │   ├── components/
│   │   │   ├── InquiryCard.tsx
│   │   │   └── ItemsList.tsx
│   │   ├── hooks/
│   │   │   └── useInquiries.ts
│   │   ├── services/
│   │   │   └── inquiry.service.ts
│   │   └── store/
│   │       └── inquirySlice.ts
│   │
│   ├── quotes/
│   │   ├── screens/
│   │   │   ├── QuotesListScreen.tsx
│   │   │   └── QuoteComparisonScreen.tsx
│   │   ├── components/
│   │   │   ├── QuoteCard.tsx
│   │   │   ├── AIRecommendation.tsx
│   │   │   └── ComparisonTable.tsx
│   │   ├── hooks/
│   │   │   └── useQuotes.ts
│   │   └── services/
│   │       └── quote.service.ts
│   │
│   ├── dealers/
│   │   ├── screens/
│   │   │   ├── DealerListScreen.tsx
│   │   │   ├── DealerProfileScreen.tsx
│   │   │   └── DealerMapScreen.tsx
│   │   ├── components/
│   │   │   ├── DealerCard.tsx
│   │   │   └── DealerMap.tsx
│   │   └── services/
│   │       └── dealer.service.ts
│   │
│   ├── orders/
│   │   ├── screens/
│   │   │   ├── OrdersListScreen.tsx
│   │   │   ├── OrderDetailScreen.tsx
│   │   │   └── TrackOrderScreen.tsx
│   │   ├── components/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── TrackingMap.tsx
│   │   │   └── OrderTimeline.tsx
│   │   └── services/
│   │       └── order.service.ts
│   │
│   ├── chat/
│   │   ├── screens/
│   │   │   ├── ChatListScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   ├── components/
│   │   │   └── MessageBubble.tsx
│   │   └── services/
│   │       └── chat.service.ts
│   │
│   └── profile/
│       ├── screens/
│       │   ├── ProfileScreen.tsx
│       │   └── EditProfileScreen.tsx
│       └── components/
│           └── ProfileForm.tsx
│
├── navigation/
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── UserNavigator.tsx
│   └── BusinessNavigator.tsx
│
├── components/ (shared components)
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Loading.tsx
│   ├── layouts/
│   │   ├── Screen.tsx
│   │   └── KeyboardAvoidingLayout.tsx
│   └── feedback/
│       ├── Toast.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/ (shared hooks)
│   ├── useTheme.ts
│   ├── useKeyboard.ts
│   └── usePushNotifications.ts
│
├── services/ (shared services)
│   ├── api.ts
│   ├── storage.ts
│   └── analytics.ts
│
├── store/
│   ├── index.ts
│   ├── rootReducer.ts
│   └── middleware.ts
│
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
├── types/
│   ├── navigation.types.ts
│   └── global.types.ts
│
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   └── helpers.ts
│
├── config/
│   ├── env.ts
│   └── constants.ts
│
└── App.tsx
```

**State Management Architecture:**

```typescript
// Redux Toolkit setup
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Slices
import authReducer from '../features/auth/store/authSlice';
import inquiryReducer from '../features/inquiries/store/inquirySlice';
import quoteReducer from '../features/quotes/store/quoteSlice';
import orderReducer from '../features/orders/store/orderSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  inquiries: inquiryReducer,
  quotes: quoteReducer,
  orders: orderReducer,
});

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: ['inquiries', 'quotes'], // Don't persist these (fetch fresh)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Example slice: Auth
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

**Performance Optimizations:**

```typescript
// 1. Image optimization
import FastImage from 'react-native-fast-image';

const OptimizedImage = ({ uri, style }: Props) => (
  <FastImage
    source={{
      uri,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    }}
    style={style}
    resizeMode={FastImage.resizeMode.cover}
  />
);

// 2. List virtualization
import { FlashList } from '@shopify/flash-list';

const InquiriesList = ({ inquiries }: Props) => (
  <FlashList
    data={inquiries}
    renderItem={({ item }) => <InquiryCard inquiry={item} />}
    estimatedItemSize={120}
    keyExtractor={(item) => item.id}
  />
);

// 3. Memoization
import { memo, useMemo, useCallback } from 'react';

const InquiryCard = memo(({ inquiry }: Props) => {
  // Expensive calculation memoized
  const itemsSummary = useMemo(() => {
    return inquiry.items.reduce((acc, item) => ({
      ...acc,
      [item.category]: (acc[item.category] || 0) + 1
    }), {} as Record<string, number>);
  }, [inquiry.items]);

  // Callback memoized
  const handlePress = useCallback(() => {
    navigate('InquiryDetail', { inquiryId: inquiry.id });
  }, [inquiry.id]);

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* ... */}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for shouldComponentUpdate
  return prevProps.inquiry.id === nextProps.inquiry.id &&
         prevProps.inquiry.updatedAt === nextProps.inquiry.updatedAt;
});

// 4. Lazy loading & code splitting
import { lazy, Suspense } from 'react';

const QuoteComparisonScreen = lazy(() => import('./screens/QuoteComparisonScreen'));

const QuotesNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="QuotesList" 
      component={QuotesListScreen} 
    />
    <Stack.Screen 
      name="QuoteComparison"
      component={() => (
        <Suspense fallback={<Loading />}>
          <QuoteComparisonScreen />
        </Suspense>
      )}
    />
  </Stack.Navigator>
);

// 5. Bundle size optimization
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true,
            "flipper": false
          },
          "android": {
            "newArchEnabled": true,
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ]
    ]
  }
}

// 6. Network optimization
import { useQuery, useMutation, useQueryClient } from 'react-query';

// Prefetch data for better UX
const useInquiries = () => {
  const queryClient = useQueryClient();

  const { data: inquiries } = useQuery('inquiries', fetchInquiries, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onSuccess: (data) => {
      // Prefetch detail pages
      data.forEach(inquiry => {
        queryClient.prefetchQuery(
          ['inquiry', inquiry.id],
          () => fetchInquiryDetail(inquiry.id)
        );
      });
    }
  });

  return { inquiries };
};
```

---

### 6.2 Backend Architecture (Node.js + PostgreSQL)

**Technology Stack:**

```
Backend Stack
┌──────────────────────────────────────────────────────────┐
│ RUNTIME: Node.js 20 LTS                                  │
│ FRAMEWORK: Express.js 4.x                                │
│ LANGUAGE: TypeScript 5.x                                 │
│                                                          │
│ DATABASE:                                                │
│ • Primary: PostgreSQL 16 (relational data)               │
│ • Cache: Redis 7.x (sessions, real-time data)            │
│ • Search: PostgreSQL Full-Text Search + pg_trgm          │
│                                                          │
│ ORM: Prisma 5.x                                          │
│ • Type-safe database access                              │
│ • Auto-generated types from schema                       │
│ • Migration management                                   │
│ • Built-in connection pooling                            │
│                                                          │
│ REAL-TIME: Socket.IO 4.x                                 │
│ • Live order tracking                                    │
│ • Chat messaging                                         │
│ • Inquiry notifications                                  │
│                                                          │
│ FILE STORAGE: AWS S3 / Google Cloud Storage              │
│ • Slip images                                            │
│ • Product photos                                         │
│ • User avatars                                           │
│ • Portfolio images                                       │
│                                                          │
│ AUTHENTICATION:                                          │
│ • JWT (JSON Web Tokens)                                  │
│ • Google OAuth 2.0                                       │
│ • Bcrypt for password hashing                            │
│                                                          │
│ APIs & INTEGRATIONS:                                     │
│ • Google Cloud Vision (OCR)                              │
│ • Anthropic Claude API (AI parsing)                      │
│ • Google Maps APIs (geocoding, directions, distance)     │
│ • Twilio (SMS)                                           │
│ • WhatsApp Business API                                  │
│ • Firebase Cloud Messaging (push notifications)          │
│ • Razorpay / Stripe (payments)                           │
│                                                          │
│ MONITORING & LOGGING:                                    │
│ • Sentry (error tracking)                                │
│ • Winston (logging)                                      │
│ • Prometheus + Grafana (metrics)                         │
│                                                          │
│ DEPLOYMENT:                                              │
│ • Docker containers                                      │
│ • AWS ECS / Google Cloud Run                             │
│ • NGINX reverse proxy                                    │
│ • Let's Encrypt SSL                                      │
└──────────────────────────────────────────────────────────┘
```

**Database Schema (Prisma):**

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Users (both buyers and dealers)
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String    @unique
  passwordHash  String?   // Null for OAuth users
  name          String
  role          UserRole
  avatar        String?
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  inquiries     Inquiry[]
  quotes        Quote[]
  orders        Order[]
  reviews       Review[]
  chatMessages  ChatMessage[]
  dealer        Dealer?   // One-to-one for dealers
  
  @@index([email])
  @@index([phone])
}

enum UserRole {
  BUYER
  DEALER
  ARCHITECT
  INTERIOR_DESIGNER
  CONTRACTOR
  ADMIN
}

// Dealer/Business profiles
model Dealer {
  id                  String    @id @default(uuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  
  businessName        String
  businessType        BusinessType
  gstNumber           String?   @unique
  yearEstablished     Int?
  description         String?
  
  // Location
  address             String
  city                String
  state               String
  pincode             String
  latitude            Float
  longitude           Float
  
  // Products & Services
  categories          String[]  // ["tiles", "sanitary", "paint"]
  brands              String[]  // ["Kajaria", "Somany"]
  
  // Delivery
  deliversProducts    Boolean   @default(false)
  deliveryRadiusKm    Int?
  minOrderForFreeDelivery  Float?
  
  // Operating hours
  operatingHours      Json      // { "mon": { "open": "09:00", "close": "20:00" } }
  
  // Media
  photos              String[]  // URLs
  logo                String?
  
  // Verification
  verified            Boolean   @default(false)
  verifiedAt          DateTime?
  gstVerified         Boolean   @default(false)
  addressVerified     Boolean   @default(false)
  
  // Stats (denormalized for performance)
  rating              Float     @default(0)
  totalReviews        Int       @default(0)
  totalOrders         Int       @default(0)
  responseTimeMinutes Int       @default(0)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relations
  quotes              Quote[]
  orders              Order[]
  reviews             Review[]
  
  @@index([latitude, longitude])
  @@index([city])
  @@index([verified])
}

enum BusinessType {
  MATERIAL_DEALER
  ARCHITECT
  INTERIOR_DESIGNER
  CONTRACTOR
  SERVICE_PROVIDER
}

// Inquiries (customer's material requests)
model Inquiry {
  id                  String    @id @default(uuid())
  userId              String
  user                User      @relation(fields: [userId], references: [id])
  
  // Items (stored as JSON for flexibility)
  items               Json      // Array of { name, quantity, unit, specifications }
  
  // Location
  deliveryAddress     String
  deliveryCity        String
  deliveryLatitude    Float
  deliveryLongitude   Float
  
  // Requirements
  requiredByDate      DateTime?
  notes               String?
  attachments         String[]  // Image URLs
  
  // Source
  source              InquirySource
  slipImageUrl        String?   // Original slip image
  aiConfidence        Float?    // 0-1 (for AI-scanned slips)
  
  // Stats
  viewCount           Int       @default(0)
  quoteCount          Int       @default(0)
  
  status              InquiryStatus  @default(OPEN)
  closedAt            DateTime?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relations
  quotes              Quote[]
  order               Order?
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum InquirySource {
  AI_SCAN
  MANUAL
  LENS_SEARCH
  VOICE
}

enum InquiryStatus {
  OPEN
  QUOTED
  CLOSED
  EXPIRED
}

// Quotes (dealer responses to inquiries)
model Quote {
  id                  String    @id @default(uuid())
  inquiryId           String
  inquiry             Inquiry   @relation(fields: [inquiryId], references: [id])
  dealerId            String
  dealer              Dealer    @relation(fields: [dealerId], references: [id])
  
  // Pricing
  items               Json      // Array with prices: { name, quantity, unit, unitPrice, total }
  subtotal            Float
  deliveryCharge      Float     @default(0)
  discount            Float     @default(0)
  total               Float
  
  // Details
  notes               String?
  validUntil          DateTime  // Quote expiry
  estimatedDeliveryDays Int
  
  // Status
  status              QuoteStatus  @default(PENDING)
  viewedAt            DateTime?
  acceptedAt          DateTime?
  rejectedAt          DateTime?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relations
  order               Order?
  
  @@index([inquiryId])
  @@index([dealerId])
  @@index([status])
  @@unique([inquiryId, dealerId]) // One quote per dealer per inquiry
}

enum QuoteStatus {
  PENDING
  VIEWED
  ACCEPTED
  REJECTED
  EXPIRED
}

// Orders (accepted quotes become orders)
model Order {
  id                  String    @id @default(cuid())
  userId              String
  user                User      @relation(fields: [userId], references: [id])
  dealerId            String
  dealer              Dealer    @relation(fields: [dealerId], references: [id])
  inquiryId           String    @unique
  inquiry             Inquiry   @relation(fields: [inquiryId], references: [id])
  quoteId             String    @unique
  quote               Quote     @relation(fields: [quoteId], references: [id])
  
  // Order details
  items               Json      // Final items with prices
  total               Float
  
  // Delivery
  deliveryAddress     String
  deliveryInstructions String?
  deliveryDate        DateTime?
  
  // Payment
  paymentMethod       PaymentMethod
  paymentStatus       PaymentStatus @default(PENDING)
  paidAt              DateTime?
  
  // Status
  status              OrderStatus @default(CONFIRMED)
  
  // Timeline
  confirmedAt         DateTime  @default(now())
  preparingStartedAt  DateTime?
  dispatchedAt        DateTime?
  deliveredAt         DateTime?
  cancelledAt         DateTime?
  cancellationReason  String?
  
  // Tracking
  driverName          String?
  driverPhone         String?
  vehicleNumber       String?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relations
  review              Review?
  
  @@index([userId])
  @@index([dealerId])
  @@index([status])
}

enum PaymentMethod {
  CASH_ON_DELIVERY
  ONLINE
  UPI
  CARD
  NET_BANKING
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum OrderStatus {
  CONFIRMED
  PREPARING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  DISPUTED
}

// Reviews & Ratings
model Review {
  id                  String    @id @default(uuid())
  orderId             String    @unique
  order               Order     @relation(fields: [orderId], references: [id])
  userId              String
  user                User      @relation(fields: [userId], references: [id])
  dealerId            String
  dealer              Dealer    @relation(fields: [dealerId], references: [id])
  
  // Ratings (1-5)
  overallRating       Int       // Overall
  qualityRating       Int       // Material quality
  deliveryRating      Int       // Delivery experience
  serviceRating       Int       // Dealer service
  
  // Content
  reviewText          String?
  photos              String[]  // Review photos
  tags                String[]  // ["on_time", "good_quality", "professional"]
  wouldRecommend      Boolean
  
  // Response
  dealerResponse      String?
  dealerRespondedAt   DateTime?
  
  // Moderation
  flagged             Boolean   @default(false)
  flagReason          String?
  
  // Helpfulness
  helpfulCount        Int       @default(0)
  notHelpfulCount     Int       @default(0)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([dealerId])
  @@index([overallRating])
}

// Chat messages
model ChatMessage {
  id                  String    @id @default(uuid())
  channelId           String    // inquiry-{inquiryId} or direct-{user1}-{user2}
  senderId            String
  sender              User      @relation(fields: [senderId], references: [id])
  
  content             String
  type                MessageType @default(TEXT)
  attachmentUrl       String?   // For images, documents
  metadata            Json?     // Extra data (quote details, location, etc.)
  
  readAt              DateTime?
  
  createdAt           DateTime  @default(now())
  
  @@index([channelId])
  @@index([senderId])
  @@index([createdAt])
}

enum MessageType {
  TEXT
  IMAGE
  DOCUMENT
  LOCATION
  QUOTE
  SYSTEM
}

// Notifications
model Notification {
  id                  String    @id @default(uuid())
  userId              String
  
  type                NotificationType
  title               String
  body                String
  data                Json?     // Extra context
  
  channels            String[]  // ["push", "sms", "whatsapp", "email"]
  
  readAt              DateTime?
  sentAt              DateTime  @default(now())
  
  @@index([userId])
  @@index([readAt])
}

enum NotificationType {
  NEW_INQUIRY
  QUOTE_RECEIVED
  QUOTE_ACCEPTED
  ORDER_CONFIRMED
  ORDER_UPDATE
  DELIVERY_ARRIVING
  ORDER_DELIVERED
  REVIEW_REQUEST
  NEW_MESSAGE
  SYSTEM
}
```

**API Structure:**

```typescript
// src/index.ts - Main server file
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
import { logger, requestLogger } from './utils/logger';
app.use(requestLogger);

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import dealerRoutes from './routes/dealer.routes';
import inquiryRoutes from './routes/inquiry.routes';
import quoteRoutes from './routes/quote.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import slipScannerRoutes from './routes/slip-scanner.routes';
import chatRoutes from './routes/chat.routes';
import analyticsRoutes from './routes/analytics.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/slip-scanner', slipScannerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

// WebSocket for real-time features
import { setupSocketIO } from './socket';
setupSocketIO(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

**Example API Routes:**

```typescript
// src/routes/inquiry.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createInquirySchema, updateInquirySchema } from '../schemas/inquiry.schema';
import * as inquiryController from '../controllers/inquiry.controller';

const router = Router();

// Create inquiry
router.post(
  '/',
  authenticate,
  validate(createInquirySchema),
  inquiryController.createInquiry
);

// Get user's inquiries
router.get(
  '/',
  authenticate,
  inquiryController.getUserInquiries
);

// Get single inquiry
router.get(
  '/:id',
  authenticate,
  inquiryController.getInquiryById
);

// Update inquiry
router.patch(
  '/:id',
  authenticate,
  validate(updateInquirySchema),
  inquiryController.updateInquiry
);

// Delete inquiry
router.delete(
  '/:id',
  authenticate,
  inquiryController.deleteInquiry
);

// Get quotes for inquiry
router.get(
  '/:id/quotes',
  authenticate,
  inquiryController.getInquiryQuotes
);

// Broadcasting to dealers (auto-match)
router.post(
  '/:id/broadcast',
  authenticate,
  inquiryController.broadcastToDE alers
);

export default router;

// src/controllers/inquiry.controller.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { matchDealers } from '../services/matching.service';
import { notifyDealers } from '../services/notification.service';

export const createInquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const inquiryData = req.body;

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        userId,
        items: inquiryData.items,
        deliveryAddress: inquiryData.deliveryAddress,
        deliveryCity: inquiryData.deliveryCity,
        deliveryLatitude: inquiryData.deliveryLatitude,
        deliveryLongitude: inquiryData.deliveryLongitude,
        requiredByDate: inquiryData.requiredByDate,
        notes: inquiryData.notes,
        attachments: inquiryData.attachments || [],
        source: inquiryData.source,
        slipImageUrl: inquiryData.slipImageUrl,
        aiConfidence: inquiryData.aiConfidence,
      },
      include: {
        user: true
      }
    });

    // Auto-match with relevant dealers
    const matchedDealers = await matchDealers(inquiry);

    // Send notifications
    await notifyDealers(matchedDealers, inquiry);

    res.status(201).json({
      success: true,
      data: inquiry,
      matchedDealers: matchedDealers.length
    });
  } catch (error) {
    next(error);
  }
};

export const getUserInquiries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        _count: {
          select: { quotes: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await prisma.inquiry.count({ where });

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const broadcastToDealers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const inquiry = await prisma.inquiry.findFirst({
      where: { id, userId }
    });

    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }

    // Match with dealers
    const matchedDealers = await matchDealers(inquiry);

    // Notify all matched dealers
    await notifyDealers(matchedDealers, inquiry);

    res.json({
      success: true,
      message: `Inquiry broadcast to ${matchedDealers.length} dealers`,
      dealers: matchedDealers.length
    });
  } catch (error) {
    next(error);
  }
};
```


---

## 7. Google Services Integration

### 7.1 Google Cloud Vision API (OCR)

**Purpose:** Extract text from contractor slips (handwritten + printed)

**Implementation:**

```typescript
// src/services/google-vision.service.ts
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_VISION_KEY_PATH
});

export const extractTextFromImage = async (imageBuffer: Buffer): Promise<OCRResult> => {
  try {
    // Call Google Vision API
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations || [];

    if (detections.length === 0) {
      throw new Error('No text detected in image');
    }

    // First annotation contains full text
    const fullText = detections[0].description || '';

    // Subsequent annotations are individual words/blocks
    const words = detections.slice(1).map(detection => ({
      text: detection.description || '',
      confidence: detection.confidence || 0,
      boundingBox: detection.boundingPoly?.vertices || [],
    }));

    // Detect language
    const languages = await detectLanguages(fullText);

    return {
      fullText,
      words,
      languages,
      confidence: calculateAverageConfidence(words),
    };
  } catch (error) {
    console.error('Google Vision error:', error);
    throw new Error('OCR failed');
  }
};

// Specialized features for construction slips
export const detectTableStructure = async (imageBuffer: Buffer): Promise<TableData[]> => {
  // Use DOCUMENT_TEXT_DETECTION for better table handling
  const [result] = await client.documentTextDetection(imageBuffer);
  const pages = result.fullTextAnnotation?.pages || [];

  const tables: TableData[] = [];

  pages.forEach(page => {
    page.blocks?.forEach(block => {
      // Check if block is likely a table
      if (isTableLike(block)) {
        const table = parseTableFromBlock(block);
        tables.push(table);
      }
    });
  });

  return tables;
};

const isTableLike = (block: any): boolean => {
  // Heuristics to detect tables:
  // - Multiple paragraphs in grid-like arrangement
  // - Consistent spacing between elements
  // - Aligned text blocks

  const paragraphs = block.paragraphs || [];
  if (paragraphs.length < 3) return false;

  // Check for vertical/horizontal alignment
  const xPositions = paragraphs.map((p: any) => p.boundingBox.vertices[0].x);
  const yPositions = paragraphs.map((p: any) => p.boundingBox.vertices[0].y);

  const xVariance = calculateVariance(xPositions);
  const yVariance = calculateVariance(yPositions);

  // Low variance in x or y indicates alignment
  return xVariance < 50 || yVariance < 50;
};

// Language detection (Hindi + English mix common in India)
const detectLanguages = async (text: string): Promise<Language[]> => {
  const [result] = await client.textDetection({
    image: { content: Buffer.from(text) },
    imageContext: {
      languageHints: ['en', 'hi', 'ta', 'te', 'mr', 'gu', 'bn'] // Indian languages
    }
  });

  const detectedLanguages = result.textAnnotations?.[0]?.detections || [];

  return detectedLanguages.map(d => ({
    code: d.language,
    confidence: d.confidence || 0
  }));
};

// Post-processing for Indian construction terms
const normalizeConstructionTerms = (text: string): string => {
  const replacements: Record<string, string> = {
    // Common abbreviations
    'cmt': 'cement',
    'sqft': 'square feet',
    'sq ft': 'square feet',
    'sq.ft': 'square feet',
    'mtrs': 'meters',
    'mtr': 'meters',
    'pcs': 'pieces',
    'ltr': 'liters',
    'L': 'liters',
    'bg': 'bags',
    'bgs': 'bags',
    
    // Common misspellings from handwriting
    'vit': 'vitrified',
    'cer': 'ceramic',
    'grany': 'granite',
    'grani': 'granite',
    'marbel': 'marble',
    'marbal': 'marble',
    
    // Brand shortcuts
    'kaj': 'kajaria',
    'som': 'somany',
    'jaq': 'jaquar',
    
    // Unit variations
    'sq m': 'square meters',
    'sqm': 'square meters',
    'sq.m': 'square meters',
  };

  let normalized = text.toLowerCase();

  Object.entries(replacements).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    normalized = normalized.replace(regex, replacement);
  });

  return normalized;
};

// Cost estimation (API calls cost money, optimize usage)
// Pricing: ~$1.50 per 1000 images
// Cost per slip scan: ~$0.0015

// Optimization strategies:
// 1. Compress images before sending (max 1920px width)
// 2. Use DOCUMENT_TEXT_DETECTION only when TEXT_DETECTION fails
// 3. Cache results for 24 hours (in case user retries)
// 4. Batch processing for multiple slips

const optimizeImageForOCR = async (imageBuffer: Buffer): Promise<Buffer> => {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  let processedImage = image;

  // Resize if too large (OCR doesn't need ultra-high res)
  if (metadata.width && metadata.width > 1920) {
    processedImage = processedImage.resize(1920, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Convert to grayscale (text recognition works better)
  processedImage = processedImage.grayscale();

  // Increase contrast (helps with faded/poor quality slips)
  processedImage = processedImage.normalize();

  // Sharpen (improves handwriting recognition)
  processedImage = processedImage.sharpen();

  return processedImage.toBuffer();
};
```

**API Usage & Costs:**

```
Google Cloud Vision Pricing (2026)
┌──────────────────────────────────────────────────────────┐
│ TEXT_DETECTION                                           │
│ • First 1,000 requests/month: Free                       │
│ • 1,001 - 5,000,000: $1.50 per 1,000                     │
│ • 5,000,001+: $0.60 per 1,000                            │
│                                                          │
│ DOCUMENT_TEXT_DETECTION (for tables)                     │
│ • First 1,000 requests/month: Free                       │
│ • 1,001+: $5.00 per 1,000                                │
│                                                          │
│ Expected Usage:                                          │
│ • 10,000 inquiries/month (target 2027)                   │
│ • 70% via AI scan = 7,000 scans/month                    │
│ • Cost: 7,000 × $1.50/1000 = $10.50/month                │
│                                                          │
│ With table detection (20% of scans):                     │
│ • 1,400 × $5.00/1000 = $7.00/month                       │
│ • Total OCR cost: ~$17.50/month                          │
│                                                          │
│ Cost per successful order:                               │
│ • If 30% convert: $17.50 / (7,000 × 0.3) = $0.008        │
│ • Less than 1 cent per order!                            │
└──────────────────────────────────────────────────────────┘
```

---

### 7.2 Google Lens API (Visual Product Search)

**Purpose:** Find products by image (Pinterest inspiration → real products)

**Implementation:**

```typescript
// src/services/google-lens.service.ts
import axios from 'axios';

// Google Lens doesn't have official public API yet
// Alternative approaches:

// Option 1: Use Google Cloud Vision Web Detection
export const visualProductSearch = async (imageBuffer: Buffer): Promise<VisualSearchResult> => {
  const [result] = await visionClient.webDetection(imageBuffer);
  const webDetection = result.webDetection;

  if (!webDetection) {
    throw new Error('No web detection results');
  }

  // Web entities = objects/concepts detected
  const entities = webDetection.webEntities?.map(entity => ({
    description: entity.description || '',
    score: entity.score || 0
  })) || [];

  // Visually similar images
  const similarImages = webDetection.visuallySimilarImages?.map(img => ({
    url: img.url || '',
    score: img.score || 0
  })) || [];

  // Pages containing matching images
  const matchingPages = webDetection.pagesWithMatchingImages?.map(page => ({
    url: page.url || '',
    title: page.pageTitle || '',
    score: page.score || 0
  })) || [];

  // Best guess label (e.g., "Italian Marble Tiles")
  const bestGuess = webDetection.bestGuessLabels?.[0]?.label || '';

  return {
    bestGuess,
    entities,
    similarImages,
    matchingPages,
    confidence: calculateVisualSearchConfidence(entities, bestGuess)
  };
};

// Option 2: Use Google Custom Search API with image search
export const googleImageSearch = async (query: string): Promise<ImageSearchResult[]> => {
  const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
    params: {
      key: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: query,
      searchType: 'image',
      num: 10
    }
  });

  return response.data.items?.map((item: any) => ({
    title: item.title,
    link: item.link,
    thumbnail: item.image.thumbnailLink,
    contextLink: item.image.contextLink,
    snippet: item.snippet
  })) || [];
};

// Match visual search results with our product database
export const matchVisualSearchToProducts = async (
  visualSearch: VisualSearchResult
): Promise<Product[]> => {
  // Extract keywords from best guess and entities
  const keywords = [
    visualSearch.bestGuess,
    ...visualSearch.entities.slice(0, 5).map(e => e.description)
  ];

  // Search our product database
  const products = await prisma.product.findMany({
    where: {
      OR: keywords.map(keyword => ({
        name: { contains: keyword, mode: 'insensitive' }
      }))
    },
    take: 20,
    orderBy: {
      popularity: 'desc'
    }
  });

  return products;
};

// Enhanced: Combine visual search + dealer inventory
export const findMatchingProductsFromDealers = async (
  imageBuffer: Buffer,
  userLocation: { lat: number; lng: number }
): Promise<DealerProductMatch[]> => {
  // Step 1: Visual search to identify product
  const visualSearch = await visualProductSearch(imageBuffer);

  // Step 2: Find nearby dealers
  const nearbyDealers = await findDealersWithinRadius(userLocation, 25); // 25 km

  // Step 3: Match with dealer inventories
  const matches: DealerProductMatch[] = [];

  for (const dealer of nearbyDealers) {
    const matchingProducts = dealer.products.filter(product =>
      visualSearch.entities.some(entity =>
        product.name.toLowerCase().includes(entity.description.toLowerCase())
      )
    );

    if (matchingProducts.length > 0) {
      matches.push({
        dealer,
        products: matchingProducts,
        matchScore: calculateMatchScore(matchingProducts, visualSearch.entities)
      });
    }
  }

  // Sort by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

// User flow: Pinterest image → Create inquiry
export const createInquiryFromImage = async (
  userId: string,
  imageBuffer: Buffer,
  additionalDetails: {
    quantity?: number;
    location: { lat: number; lng: number };
  }
): Promise<Inquiry> => {
  // Analyze image
  const visualSearch = await visualProductSearch(imageBuffer);

  // Upload reference image
  const imageUrl = await uploadToS3(imageBuffer, 'reference-images');

  // Create inquiry with detected product info
  const inquiry = await prisma.inquiry.create({
    data: {
      userId,
      source: 'LENS_SEARCH',
      items: [{
        name: visualSearch.bestGuess,
        quantity: additionalDetails.quantity || 1,
        unit: inferUnit(visualSearch.bestGuess), // "sq.ft", "pieces", etc.
        specifications: visualSearch.entities.slice(0, 3).map(e => e.description).join(', ')
      }],
      attachments: [imageUrl],
      deliveryLatitude: additionalDetails.location.lat,
      deliveryLongitude: additionalDetails.location.lng,
      notes: `Found via visual search: "${visualSearch.bestGuess}"`,
      aiConfidence: visualSearch.confidence
    }
  });

  return inquiry;
};
```

**Pricing:**

```
Google Cloud Vision Web Detection
┌──────────────────────────────────────────────────────────┐
│ WEB_DETECTION                                            │
│ • First 1,000/month: Free                                │
│ • 1,001 - 5,000,000: $3.50 per 1,000                     │
│                                                          │
│ Expected Usage:                                          │
│ • 500 lens searches/month (5% of users)                  │
│ • Cost: 500 × $3.50/1000 = $1.75/month                   │
│                                                          │
│ Google Custom Search API (alternative)                   │
│ • $5 per 1,000 queries                                   │
│ • 100 free queries/day                                   │
└──────────────────────────────────────────────────────────┘
```

---

### 7.3 Google Maps Platform APIs

**Purpose:** Location services, dealer discovery, delivery tracking, directions

**APIs Used:**

1. **Maps SDK for Mobile** - Map display in apps
2. **Places API** - Address autocomplete, place details
3. **Geocoding API** - Convert addresses to coordinates
4. **Distance Matrix API** - Calculate distances and travel times
5. **Directions API** - Get turn-by-turn directions
6. **Geolocation API** - Get device location from cell towers/WiFi

**Implementation:**

```typescript
// src/services/google-maps.service.ts
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 1. Geocoding: Address → Coordinates
export const geocodeAddress = async (address: string): Promise<GeocodedLocation> => {
  try {
    const response = await mapsClient.geocode({
      params: {
        address,
        key: API_KEY,
        region: 'in' // Bias to India
      }
    });

    const result = response.data.results[0];

    if (!result) {
      throw new Error('Address not found');
    }

    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      addressComponents: result.address_components
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
};

// 2. Reverse Geocoding: Coordinates → Address
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string> => {
  const response = await mapsClient.reverseGeocode({
    params: {
      latlng: { lat, lng },
      key: API_KEY
    }
  });

  return response.data.results[0]?.formatted_address || 'Unknown location';
};

// 3. Distance Matrix: Calculate distances between multiple points
export const calculateDistances = async (
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>
): Promise<DistanceMatrixResult> => {
  const response = await mapsClient.distancematrix({
    params: {
      origins: origins.map(o => `${o.lat},${o.lng}`),
      destinations: destinations.map(d => `${d.lat},${d.lng}`),
      mode: 'driving',
      units: 'metric',
      departure_time: 'now', // Consider current traffic
      traffic_model: 'best_guess',
      key: API_KEY
    }
  });

  return response.data;
};

// 4. Find nearby dealers using geometry
export const findDealersWithinRadius = async (
  center: { lat: number; lng: number },
  radiusKm: number
): Promise<Dealer[]> => {
  // Use PostGIS/PostgreSQL geography functions
  // or Haversine formula for distance calculation

  const dealers = await prisma.$queryRaw`
    SELECT 
      *,
      (
        6371 * acos(
          cos(radians(${center.lat}))
          * cos(radians(latitude))
          * cos(radians(longitude) - radians(${center.lng}))
          + sin(radians(${center.lat}))
          * sin(radians(latitude))
        )
      ) AS distance_km
    FROM dealers
    WHERE verified = true
    HAVING distance_km <= ${radiusKm}
    ORDER BY distance_km ASC
    LIMIT 100
  `;

  return dealers as Dealer[];
};

// 5. Get driving directions
export const getDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<DirectionsResult> => {
  const response = await mapsClient.directions({
    params: {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
      key: API_KEY
    }
  });

  const route = response.data.routes[0];

  return {
    distance: route.legs[0].distance,
    duration: route.legs[0].duration,
    durationInTraffic: route.legs[0].duration_in_traffic,
    polyline: route.overview_polyline.points,
    steps: route.legs[0].steps.map(step => ({
      instruction: step.html_instructions,
      distance: step.distance,
      duration: step.duration
    }))
  };
};

// 6. Address autocomplete for better UX
export const autocompleteAddress = async (
  input: string,
  sessionToken?: string
): Promise<AutocompletePrediction[]> => {
  const response = await mapsClient.placeAutocomplete({
    params: {
      input,
      key: API_KEY,
      components: ['country:in'], // Restrict to India
      sessiontoken: sessionToken, // For billing optimization
      types: 'address' // Only addresses
    }
  });

  return response.data.predictions.map(p => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting.main_text,
    secondaryText: p.structured_formatting.secondary_text
  }));
};

// 7. Get place details (after user selects autocomplete)
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  const response = await mapsClient.placeDetails({
    params: {
      place_id: placeId,
      key: API_KEY,
      fields: [
        'formatted_address',
        'geometry',
        'address_components',
        'name'
      ]
    }
  });

  const place = response.data.result;

  return {
    latitude: place.geometry?.location.lat || 0,
    longitude: place.geometry?.location.lng || 0,
    formattedAddress: place.formatted_address || '',
    name: place.name || '',
    addressComponents: place.address_components || []
  };
};

// 8. Snap to roads (for delivery tracking accuracy)
export const snapToRoads = async (
  path: Array<{ lat: number; lng: number }>
): Promise<Array<{ lat: number; lng: number }>> => {
  const pathString = path.map(p => `${p.lat},${p.lng}`).join('|');

  const response = await mapsClient.snapToRoads({
    params: {
      path: pathString,
      interpolate: true,
      key: API_KEY
    }
  });

  return response.data.snappedPoints.map(point => ({
    lat: point.location.latitude,
    lng: point.location.longitude
  }));
};

// 9. Optimize multi-stop delivery routes
export const optimizeDeliveryRoute = async (
  depot: { lat: number; lng: number },
  deliveries: Array<{ lat: number; lng: number; orderId: string }>
): Promise<OptimizedRoute> => {
  // Use Directions API with waypoints optimization
  const waypoints = deliveries.map(d => `${d.lat},${d.lng}`).join('|');

  const response = await mapsClient.directions({
    params: {
      origin: `${depot.lat},${depot.lng}`,
      destination: `${depot.lat},${depot.lng}`, // Return to depot
      waypoints: `optimize:true|${waypoints}`,
      mode: 'driving',
      key: API_KEY
    }
  });

  const route = response.data.routes[0];
  const waypointOrder = route.waypoint_order;

  return {
    optimizedOrder: waypointOrder.map(index => deliveries[index]),
    totalDistance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
    totalDuration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
    polyline: route.overview_polyline.points
  };
};
```

**Mobile Integration (React Native):**

```typescript
// React Native Maps integration
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export const DealerMapScreen = () => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Location permission denied');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setUserLocation(location);

      // Fetch nearby dealers
      const nearby = await api.get('/dealers/nearby', {
        params: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          radius: 10000 // 10 km in meters
        }
      });
      setDealers(nearby.data);

      // Fit map to show all dealers
      fitMapToBounds([location.coords, ...nearby.data]);
    })();
  }, []);

  const fitMapToBounds = (locations: Array<{ latitude: number; longitude: number }>) => {
    mapRef.current?.fitToCoordinates(locations, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true
    });
  };

  const openDirections = async (dealer: Dealer) => {
    if (!userLocation) return;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.coords.latitude},${userLocation.coords.longitude}&destination=${dealer.latitude},${dealer.longitude}&travelmode=driving`;

    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation?.coords.latitude || 12.9716,
          longitude: userLocation?.coords.longitude || 77.5946,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsTraffic={false}
      >
        {/* Search radius circle */}
        {userLocation && (
          <Circle
            center={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude
            }}
            radius={10000} // 10 km
            strokeColor="rgba(249, 115, 22, 0.5)"
            fillColor="rgba(249, 115, 22, 0.1)"
          />
        )}

        {/* Dealer markers */}
        {dealers.map(dealer => (
          <Marker
            key={dealer.id}
            coordinate={{ latitude: dealer.latitude, longitude: dealer.longitude }}
            pinColor={dealer.verified ? '#F97316' : '#94A3B8'}
            onPress={() => setSelectedDealer(dealer)}
          >
            <Callout onPress={() => navigateToDealerProfile(dealer.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{dealer.businessName}</Text>
                <Text>⭐ {dealer.rating.toFixed(1)} ({dealer.totalReviews} reviews)</Text>
                <Text>📍 {dealer.distance.toFixed(1)} km away</Text>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => openDirections(dealer)}
                >
                  <Text style={styles.directionsText}>Get Directions →</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Route polyline (if directions shown) */}
        {selectedDealer && routePolyline && (
          <Polyline
            coordinates={decodePolyline(routePolyline)}
            strokeColor="#F97316"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Map controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            mapRef.current?.animateToRegion({
              latitude: userLocation?.coords.latitude || 0,
              longitude: userLocation?.coords.longitude || 0,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            });
          }}
        >
          <Icon name="my-location" size={24} color="#F97316" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setViewType(viewType === 'map' ? 'list' : 'map')}
        >
          <Icon name={viewType === 'map' ? 'list' : 'map'} size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      {/* Dealer info card (when selected) */}
      {selectedDealer && (
        <Animated.View style={[styles.dealerCard, cardAnimation]}>
          <DealerCard dealer={selectedDealer} onClose={() => setSelectedDealer(null)} />
        </Animated.View>
      )}
    </View>
  );
};

// Decode Google polyline format
const decodePolyline = (encoded: string): Array<{ latitude: number; longitude: number }> => {
  // Implementation of polyline decoding algorithm
  // (Google Polyline Algorithm Format)
  // Returns array of coordinates
  const coordinates: Array<{ latitude: number; longitude: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }

  return coordinates;
};
```

**Google Maps Pricing:**

```
Google Maps Platform Pricing (2026)
┌──────────────────────────────────────────────────────────┐
│ FREE TIER: $200 credit/month (≈28,000 map loads)         │
│                                                          │
│ MAPS SDK FOR MOBILE                                      │
│ • Dynamic Maps: $7 per 1,000 loads                       │
│ • Free: First 28,000 loads/month (with $200 credit)      │
│                                                          │
│ PLACES API                                               │
│ • Autocomplete (per session): $2.83 per 1,000            │
│ • Place Details: $17 per 1,000                           │
│ • Free: First 70,000 autocomplete/month                  │
│                                                          │
│ GEOCODING API                                            │
│ • $5 per 1,000 requests                                  │
│ • Free: First 40,000 requests/month                      │
│                                                          │
│ DISTANCE MATRIX API                                      │
│ • $5 per 1,000 elements                                  │
│ • Free: First 40,000 elements/month                      │
│                                                          │
│ DIRECTIONS API                                           │
│ • $5 per 1,000 requests                                  │
│ • Free: First 40,000 requests/month                      │
│                                                          │
│ ESTIMATED MONTHLY USAGE & COST:                          │
│                                                          │
│ Maps SDK:                                                │
│ • 50,000 map loads/month                                 │
│ • First 28,000 free = 22,000 × $7/1000 = $154            │
│                                                          │
│ Places Autocomplete:                                     │
│ • 15,000 sessions/month                                  │
│ • All covered by free tier = $0                          │
│                                                          │
│ Geocoding:                                               │
│ • 10,000 requests/month (new dealers, inquiries)         │
│ • All covered by free tier = $0                          │
│                                                          │
│ Distance Matrix:                                         │
│ • 20,000 calculations/month (dealer matching)            │
│ • All covered by free tier = $0                          │
│                                                          │
│ Directions:                                              │
│ • 5,000 requests/month (delivery tracking)               │
│ • All covered by free tier = $0                          │
│                                                          │
│ TOTAL MONTHLY COST: ~$154                                │
│                                                          │
│ Cost per successful order (30% conversion):              │
│ • $154 / (10,000 inquiries × 0.3) = $0.05                │
│ • 5 cents per order                                      │
│                                                          │
│ Optimization Strategies:                                 │
│ • Use static maps where dynamic not needed               │
│ • Cache geocoding results                                │
│ • Batch distance matrix calculations                     │
│ • Use session tokens for autocomplete                    │
└──────────────────────────────────────────────────────────┘
```

---

### 7.4 Google OAuth 2.0 (Authentication)

**Purpose:** Secure, passwordless login with Google accounts

**Implementation:**

```typescript
// Mobile: Google Sign-In
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
  scopes: ['profile', 'email'],
});

// Expo Auth Session approach (recommended for Expo)
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_CLIENT_ID,
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication.accessToken);
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken: string) => {
    try {
      // Send access token to backend
      const result = await api.post('/auth/google', { accessToken });

      // Store JWT token
      await SecureStore.setItemAsync('authToken', result.data.token);

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(result.data.user));

      // Navigate to app
      navigate('Home');
    } catch (error) {
      showError('Google sign-in failed');
    }
  };

  return {
    signInWithGoogle: () => promptAsync(),
    loading: !request
  };
};

// Backend: Verify Google token & create/login user
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    // Verify Google access token
    const ticket = await googleClient.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token');
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const avatar = payload.picture;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email!,
          name: name!,
          avatar,
          verified: true, // Email verified by Google
          role: 'BUYER' // Default role, can be changed later
        }
      });

      // Send welcome notification
      await sendWelcomeNotification(user.id);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};
```

**Security Considerations:**

```typescript
// 1. Validate tokens on backend (never trust client)
// 2. Use HTTPS only
// 3. Set secure JWT expiration
// 4. Refresh tokens for long sessions
// 5. Revoke tokens on logout

// Middleware: Protect routes
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    next(error);
  }
};
```

---


## 8. Communication & Notification System

### 8.1 SMS Notifications (Twilio)

**Purpose:** Critical notifications when push fails, order updates, OTP verification

**Implementation:**

```typescript
// src/services/sms.service.ts
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export const sendSMS = async (
  to: string, // Must include country code: +91XXXXXXXXXX
  message: string
): Promise<void> => {
  try {
    // Validate Indian phone number
    if (!to.startsWith('+91') || to.length !== 13) {
      throw new Error('Invalid Indian phone number format');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to
    });

    console.log(`SMS sent: ${result.sid}`);

    // Log for analytics
    await prisma.notification.create({
      data: {
        userId: getUserIdFromPhone(to),
        type: 'SMS',
        content: message,
        status: 'SENT',
        externalId: result.sid
      }
    });
  } catch (error: any) {
    console.error('SMS send error:', error);

    // Log failure
    await prisma.notification.create({
      data: {
        userId: getUserIdFromPhone(to),
        type: 'SMS',
        content: message,
        status: 'FAILED',
        errorMessage: error.message
      }
    });

    throw error;
  }
};

// OTP verification
export const sendOTP = async (phone: string): Promise<string> => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store in Redis with 10-minute expiry
  await redisClient.setex(`otp:${phone}`, 600, otp);

  // Send SMS
  await sendSMS(
    phone,
    `Your Hub4Estate verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`
  );

  return otp;
};

export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  const storedOTP = await redisClient.get(`otp:${phone}`);

  if (!storedOTP) {
    throw new Error('OTP expired or not found');
  }

  if (storedOTP !== otp) {
    // Increment failed attempts
    const attempts = await redisClient.incr(`otp_attempts:${phone}`);
    await redisClient.expire(`otp_attempts:${phone}`, 600);

    if (attempts >= 5) {
      // Block for 1 hour after 5 failed attempts
      await redisClient.setex(`otp_blocked:${phone}`, 3600, '1');
      throw new Error('Too many failed attempts. Try again in 1 hour.');
    }

    throw new Error('Invalid OTP');
  }

  // Success - delete OTP
  await redisClient.del(`otp:${phone}`);
  await redisClient.del(`otp_attempts:${phone}`);

  return true;
};

// SMS Templates for different scenarios
const SMSTemplates = {
  newInquiry: (dealerName: string, itemCount: number, amount: string) =>
    `New inquiry on Hub4Estate! ${itemCount} items, Est: ₹${amount}. Respond fast to win. Open app now.`,

  quoteReceived: (dealerName: string, amount: string) =>
    `New quote from ${dealerName}: ₹${amount}. Compare quotes in Hub4Estate app.`,

  orderConfirmed: (orderId: string, deliveryDate: string) =>
    `Order #${orderId} confirmed! Delivery expected: ${deliveryDate}. Track in app: hub4.estate/o/${orderId}`,

  outForDelivery: (driverName: string, eta: string) =>
    `Your order is out for delivery! Driver: ${driverName}, ETA: ${eta}. Live tracking in app.`,

  delivered: (orderId: string) =>
    `Order #${orderId} delivered! Rate your experience in Hub4Estate app.`,

  paymentReminder: (orderId: string, amount: string) =>
    `Payment due for order #${orderId}: ₹${amount}. Pay now: hub4.estate/pay/${orderId}`,
};

// Smart SMS sending (avoid unnecessary costs)
export const sendSmartSMS = async (
  userId: string,
  type: keyof typeof SMSTemplates,
  params: any
): Promise<void> => {
  // Check user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, smsEnabled: true, lastSMSSentAt: true }
  });

  if (!user || !user.smsEnabled) {
    console.log('SMS disabled for user, skipping');
    return;
  }

  // Rate limiting: Max 10 SMS per day per user
  if (user.lastSMSSentAt) {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastSent = new Date(user.lastSMSSentAt).setHours(0, 0, 0, 0);

    if (today === lastSent) {
      const smsCountToday = await redisClient.incr(`sms_count:${userId}:${today}`);
      await redisClient.expire(`sms_count:${userId}:${today}`, 86400);

      if (smsCountToday > 10) {
        console.log('SMS daily limit reached for user');
        return;
      }
    }
  }

  // Get template
  const message = SMSTemplates[type](...Object.values(params));

  // Send
  await sendSMS(user.phone, message);

  // Update last sent timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { lastSMSSentAt: new Date() }
  });
};
```

**SMS Pricing (Twilio):**

```
Twilio SMS Pricing - India (2026)
┌──────────────────────────────────────────────────────────┐
│ OUTBOUND SMS (India)                                     │
│ • Cost: $0.0086 per SMS (₹0.72)                          │
│ • 160 characters per SMS                                 │
│ • Long messages: Split into multiple (charged per part)  │
│                                                          │
│ EXPECTED MONTHLY USAGE:                                  │
│                                                          │
│ OTP Verifications:                                       │
│ • 5,000 new users/month × 2 OTPs = 10,000 SMS           │
│ • Cost: 10,000 × $0.0086 = $86                          │
│                                                          │
│ Order Updates (Critical only):                          │
│ • 3,000 orders/month × 3 SMS = 9,000 SMS                │
│   (Confirmed, Out for delivery, Delivered)              │
│ • Cost: 9,000 × $0.0086 = $77.40                        │
│                                                          │
│ High-priority Inquiries:                                 │
│ • 1,000 SMS/month (urgent dealer notifications)          │
│ • Cost: 1,000 × $0.0086 = $8.60                         │
│                                                          │
│ TOTAL MONTHLY SMS COST: ~$172                            │
│                                                          │
│ Cost per order: $172 / 3,000 = $0.057 (~₹4.75)          │
│                                                          │
│ Optimization Strategies:                                 │
│ • Use SMS only for critical notifications                │
│ • Prefer push notifications when app is active           │
│ • Limit to 10 SMS per user per day                      │
│ • Use WhatsApp for non-urgent updates (cheaper)          │
└──────────────────────────────────────────────────────────┘
```

---

### 8.2 WhatsApp Business API

**Purpose:** Rich media notifications, order updates, customer support

**Why WhatsApp?**

```
WhatsApp in India (2026)
┌──────────────────────────────────────────────────────────┐
│ PENETRATION & USAGE                                      │
│ • 500M+ active users in India                            │
│ • 92% smartphone users have WhatsApp                     │
│ • Most trusted messaging platform                        │
│ • Used for business communication already                │
│                                                          │
│ ADVANTAGES OVER SMS                                      │
│ • Rich media: Images, PDFs, buttons                      │
│ • 2-way conversations                                    │
│ • Higher open rates (98% vs 20% for SMS)                 │
│ • Cheaper for business messages                          │
│ • User familiarity                                       │
│                                                          │
│ LIMITATIONS                                              │
│ • Requires WhatsApp Business API approval                │
│ • Template messages must be pre-approved                 │
│ • 24-hour conversation window for free-form messages     │
│ • Cannot send promotional messages                       │
└──────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// src/services/whatsapp.service.ts
import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// Send template message (pre-approved by Meta)
export const sendWhatsAppTemplate = async (
  to: string, // Format: 91XXXXXXXXXX (no +)
  templateName: string,
  parameters: string[]
): Promise<void> => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: parameters.map(param => ({
                type: 'text',
                text: param
              }))
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('WhatsApp message sent:', response.data);

    // Log for analytics
    await prisma.notification.create({
      data: {
        userId: getUserIdFromPhone(to),
        type: 'WHATSAPP',
        content: `Template: ${templateName}`,
        status: 'SENT',
        externalId: response.data.messages[0].id
      }
    });
  } catch (error: any) {
    console.error('WhatsApp send error:', error.response?.data || error);

    // Log failure
    await prisma.notification.create({
      data: {
        userId: getUserIdFromPhone(to),
        type: 'WHATSAPP',
        content: `Template: ${templateName}`,
        status: 'FAILED',
        errorMessage: error.message
      }
    });
  }
};

// Send interactive buttons message
export const sendWhatsAppButtons = async (
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<void> => {
  await axios.post(
    `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(btn => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

// Send media message (image, document, etc.)
export const sendWhatsAppMedia = async (
  to: string,
  mediaType: 'image' | 'document' | 'video',
  mediaUrl: string,
  caption?: string
): Promise<void> => {
  await axios.post(
    `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: mediaType,
      [mediaType]: {
        link: mediaUrl,
        caption
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

// Pre-approved message templates (examples)
const WhatsAppTemplates = {
  order_confirmed: {
    name: 'order_confirmed',
    // Template format (registered with Meta):
    // "Hello {{1}}, your order #{{2}} has been confirmed! 
    // Delivery expected: {{3}}. Track here: {{4}}"
    send: async (to: string, name: string, orderId: string, date: string, link: string) => {
      await sendWhatsAppTemplate(to, 'order_confirmed', [name, orderId, date, link]);
    }
  },

  out_for_delivery: {
    name: 'out_for_delivery',
    // "Your order #{{1}} is out for delivery! 
    // Driver: {{2}}, ETA: {{3}}. Live tracking: {{4}}"
    send: async (to: string, orderId: string, driver: string, eta: string, link: string) => {
      await sendWhatsAppTemplate(to, 'out_for_delivery', [orderId, driver, eta, link]);
    }
  },

  quote_received: {
    name: 'quote_received',
    // "New quote from {{1}}: ₹{{2}} 
    // View details: {{3}}"
    send: async (to: string, dealerName: string, amount: string, link: string) => {
      await sendWhatsAppTemplate(to, 'quote_received', [dealerName, amount, link]);
    }
  },

  review_request: {
    name: 'review_request',
    // "Hi {{1}}, thank you for your order! 
    // Please share your experience: {{2}}"
    send: async (to: string, name: string, link: string) => {
      await sendWhatsAppTemplate(to, 'review_request', [name, link]);
    }
  }
};

// Webhook to receive user responses
export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Verify webhook (security)
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(req.query['hub.challenge']);
      return;
    }

    // Process incoming messages
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // User's phone number
      const messageType = message.type; // text, button, image, etc.

      if (messageType === 'text') {
        const text = message.text.body;
        await handleUserMessage(from, text);
      } else if (messageType === 'button') {
        const buttonId = message.button.payload;
        await handleButtonClick(from, buttonId);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).send('ERROR');
  }
};

// Handle user responses
const handleUserMessage = async (from: string, text: string) => {
  // Example: User replies to quote notification
  if (text.toLowerCase().includes('accept')) {
    // Find pending quote for this user
    // Accept quote
    // Send confirmation
  } else if (text.toLowerCase().includes('track')) {
    // Send order tracking link
  } else {
    // Forward to customer support system
    await forwardToSupport(from, text);
  }
};

// Integration with order lifecycle
export const sendOrderUpdates = async (order: Order, status: OrderStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { phone: true, name: true }
  });

  if (!user?.phone) return;

  const phone = user.phone.replace('+', ''); // Remove + prefix

  switch (status) {
    case 'CONFIRMED':
      await WhatsAppTemplates.order_confirmed.send(
        phone,
        user.name,
        order.id,
        formatDate(order.deliveryDate),
        `https://hub4estate.com/orders/${order.id}`
      );
      break;

    case 'OUT_FOR_DELIVERY':
      await WhatsAppTemplates.out_for_delivery.send(
        phone,
        order.id,
        order.driverName || 'Driver',
        calculateETA(order),
        `https://hub4estate.com/track/${order.id}`
      );

      // Also send live tracking link with map
      const trackingImageUrl = await generateTrackingMapImage(order);
      await sendWhatsAppMedia(phone, 'image', trackingImageUrl, 'Live tracking available in app');
      break;

    case 'DELIVERED':
      // Send delivery confirmation with invoice
      const invoiceUrl = await generateInvoicePDF(order);
      await sendWhatsAppMedia(phone, 'document', invoiceUrl, `Invoice for order #${order.id}`);

      // Request review after 2 hours
      setTimeout(async () => {
        await WhatsAppTemplates.review_request.send(
          phone,
          user.name,
          `https://hub4estate.com/orders/${order.id}/review`
        );
      }, 2 * 60 * 60 * 1000); // 2 hours
      break;
  }
};
```

**WhatsApp Business API Pricing:**

```
WhatsApp Business API Pricing (India, 2026)
┌──────────────────────────────────────────────────────────┐
│ CONVERSATION-BASED PRICING                               │
│                                                          │
│ User-Initiated Conversations (24h window):               │
│ • First 1,000/month: FREE                                │
│ • Additional: ₹0.50 per conversation                     │
│                                                          │
│ Business-Initiated Conversations:                        │
│ • Marketing: ₹2.50 per conversation                      │
│ • Utility (order updates): ₹0.60 per conversation        │
│ • Authentication (OTP): ₹0.25 per conversation           │
│                                                          │
│ Note: A "conversation" = 24-hour window from first       │
│ message. Unlimited messages within that window!          │
│                                                          │
│ ESTIMATED MONTHLY COST:                                  │
│                                                          │
│ Order Updates (Utility):                                 │
│ • 3,000 orders/month                                     │
│ • 3,000 × ₹0.60 = ₹1,800 ($21.60)                       │
│                                                          │
│ New Inquiry Notifications (Utility):                     │
│ • 2,000 high-value inquiries/month                       │
│ • 2,000 × ₹0.60 = ₹1,200 ($14.40)                       │
│                                                          │
│ Review Requests (Utility):                               │
│ • 2,500 requests/month                                   │
│ • First 1,000 free = 1,500 × ₹0.60 = ₹900 ($10.80)      │
│                                                          │
│ TOTAL: ₹3,900/month (~$47)                               │
│                                                          │
│ COMPARISON WITH SMS:                                     │
│ • Same 3,000 order updates via SMS: $77 (Twilio)        │
│ • WhatsApp saves: $30/month (38% cheaper)                │
│ • Plus: Rich media, buttons, better engagement!          │
└──────────────────────────────────────────────────────────┘
```

---

### 8.3 Push Notifications (Firebase Cloud Messaging)

**Purpose:** Real-time in-app notifications, instant updates

**Implementation:**

```typescript
// Mobile: FCM Setup (Expo)
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permission & get token
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Get push token
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId
  })).data;

  console.log('Push token:', token);

  // Send token to backend
  await api.post('/users/push-token', { token });

  return token;
};

// Listen for notifications
export const usePushNotifications = () => {
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Listener: Notification received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener: User taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data.type === 'new_inquiry') {
        navigate('InquiryDetail', { inquiryId: data.inquiryId });
      } else if (data.type === 'quote_received') {
        navigate('QuoteComparison', { inquiryId: data.inquiryId });
      } else if (data.type === 'order_update') {
        navigate('OrderDetail', { orderId: data.orderId });
      } else if (data.type === 'chat_message') {
        navigate('Chat', { channelId: data.channelId });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return { notification };
};

// Backend: Send push notifications
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (
  userId: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    priority?: 'default' | 'normal' | 'high';
    sound?: string;
    badge?: number;
  }
): Promise<void> => {
  try {
    // Get user's push token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true, pushEnabled: true }
    });

    if (!user?.pushToken || !user.pushEnabled) {
      console.log('Push notifications disabled or no token for user');
      return;
    }

    // Verify token is valid Expo push token
    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.error('Invalid Expo push token:', user.pushToken);
      return;
    }

    // Create message
    const message: ExpoPushMessage = {
      to: user.pushToken,
      sound: notification.sound || 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      priority: notification.priority || 'high',
      badge: notification.badge
    };

    // Send
    const tickets = await expo.sendPushNotificationsAsync([message]);

    // Check for errors
    if (tickets[0].status === 'error') {
      console.error('Push notification error:', tickets[0]);

      // If token is invalid, remove it
      if (tickets[0].details?.error === 'DeviceNotRegistered') {
        await prisma.user.update({
          where: { id: userId },
          data: { pushToken: null }
        });
      }
    } else {
      console.log('Push notification sent:', tickets[0]);

      // Log for analytics
      await prisma.notification.create({
        data: {
          userId,
          type: 'PUSH',
          title: notification.title,
          body: notification.body,
          data: notification.data,
          status: 'SENT',
          externalId: tickets[0].id
        }
      });
    }
  } catch (error) {
    console.error('Push notification send error:', error);
  }
};

// Batch send (efficient for broadcasting)
export const sendPushNotificationBatch = async (
  recipients: Array<{ userId: string; pushToken: string }>,
  notification: Omit<ExpoPushMessage, 'to'>
): Promise<void> => {
  // Filter valid tokens
  const messages: ExpoPushMessage[] = recipients
    .filter(r => Expo.isExpoPushToken(r.pushToken))
    .map(r => ({
      ...notification,
      to: r.pushToken
    }));

  // Chunk messages (Expo recommends max 100 per batch)
  const chunks = expo.chunkPushNotifications(messages);

  // Send all chunks
  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      console.log(`Sent ${tickets.length} push notifications`);

      // Handle errors (in background job)
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          console.error(`Push error for ${chunk[index].to}:`, ticket);
        }
      });
    } catch (error) {
      console.error('Batch push error:', error);
    }
  }
};

// Notification preferences
export const updateNotificationPreferences = async (
  userId: string,
  preferences: {
    pushEnabled?: boolean;
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    emailEnabled?: boolean;
    quietHoursStart?: string; // "22:00"
    quietHoursEnd?: string; // "08:00"
  }
): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: preferences
  });
};

// Smart notification routing (multi-channel)
export const sendSmartNotification = async (
  userId: string,
  notification: {
    type: 'NEW_INQUIRY' | 'QUOTE_RECEIVED' | 'ORDER_UPDATE' | 'CHAT_MESSAGE';
    title: string;
    body: string;
    data?: Record<string, any>;
    priority: 'low' | 'normal' | 'high' | 'critical';
  }
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      pushToken: true,
      pushEnabled: true,
      phone: true,
      smsEnabled: true,
      whatsappEnabled: true,
      quietHoursStart: true,
      quietHoursEnd: true,
      lastSeenAt: true
    }
  });

  if (!user) return;

  // Check quiet hours
  const now = new Date();
  const currentHour = now.getHours();
  const quietStart = parseInt(user.quietHoursStart || '22');
  const quietEnd = parseInt(user.quietHoursEnd || '8');

  const isQuietHours = currentHour >= quietStart || currentHour < quietEnd;

  // Don't send low-priority notifications during quiet hours
  if (isQuietHours && notification.priority === 'low') {
    console.log('Skipping notification (quiet hours)');
    return;
  }

  // Channel selection strategy
  const channels: string[] = [];

  // 1. Always try push if enabled
  if (user.pushEnabled && user.pushToken) {
    channels.push('push');
    await sendPushNotification(userId, notification);
  }

  // 2. Send SMS for critical notifications or if user is offline
  const isOnline = user.lastSeenAt && (Date.now() - user.lastSeenAt.getTime() < 5 * 60 * 1000); // 5 min

  if (
    user.smsEnabled &&
    user.phone &&
    (notification.priority === 'critical' || !isOnline)
  ) {
    channels.push('sms');
    await sendSmartSMS(userId, notification.type, { body: notification.body });
  }

  // 3. Send WhatsApp for important updates
  if (
    user.whatsappEnabled &&
    user.phone &&
    ['QUOTE_RECEIVED', 'ORDER_UPDATE'].includes(notification.type)
  ) {
    channels.push('whatsapp');
    // Send via appropriate template
    await sendWhatsAppTemplate(user.phone.replace('+', ''), 'general_notification', [
      notification.title,
      notification.body
    ]);
  }

  // Log which channels were used
  console.log(`Notification sent via: ${channels.join(', ')}`);

  await prisma.notification.create({
    data: {
      userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      channels,
      priority: notification.priority,
      status: 'SENT'
    }
  });
};
```

**Push Notification Pricing:**

```
Firebase Cloud Messaging (FCM) - FREE!
┌──────────────────────────────────────────────────────────┐
│ PRICING                                                  │
│ • Unlimited push notifications: FREE                     │
│ • No cost per notification                               │
│ • No monthly fees                                        │
│                                                          │
│ LIMITS                                                   │
│ • No hard limits on volume                               │
│ • Message size: 4KB max                                  │
│ • Delivery SLA: Best effort (typically <1 second)        │
│                                                          │
│ DELIVERABILITY                                           │
│ • Android: 95%+ delivery rate                            │
│ • iOS: 90%+ delivery rate                                │
│ • Depends on device connectivity & app state             │
│                                                          │
│ RECOMMENDATION                                           │
│ • Use push as primary notification channel               │
│ • Fallback to SMS/WhatsApp for critical notifications    │
│ • Significant cost savings vs SMS                        │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Security & Data Protection

### 9.1 Authentication & Authorization

**Security Layers:**

```
Security Architecture
┌──────────────────────────────────────────────────────────┐
│ LAYER 1: TRANSPORT SECURITY                              │
│ • HTTPS only (TLS 1.3)                                   │
│ • Certificate pinning in mobile apps                     │
│ • No plaintext communication                             │
├──────────────────────────────────────────────────────────┤
│ LAYER 2: AUTHENTICATION                                  │
│ • JWT tokens (30-day expiry)                             │
│ • Refresh tokens (90-day expiry)                         │
│ • Google OAuth 2.0                                       │
│ • Phone OTP (2FA for critical actions)                   │
├──────────────────────────────────────────────────────────┤
│ LAYER 3: AUTHORIZATION (RBAC)                            │
│ • Role-based access control                              │
│ • Roles: BUYER, DEALER, ARCHITECT, ADMIN                 │
│ • Resource-level permissions                             │
│ • Middleware checks on every API request                 │
├──────────────────────────────────────────────────────────┤
│ LAYER 4: DATA ENCRYPTION                                 │
│ • At Rest: PostgreSQL encryption                         │
│ • In Transit: TLS 1.3                                    │
│ • Sensitive fields: AES-256 encryption                   │
│ • Mobile: expo-secure-store (Keychain/Keystore)          │
├──────────────────────────────────────────────────────────┤
│ LAYER 5: API SECURITY                                    │
│ • Rate limiting (100 req/min per IP)                     │
│ • DDoS protection (Cloudflare)                           │
│ • Input validation & sanitization                        │
│ • SQL injection prevention (Prisma ORM)                  │
│ • XSS protection (Content Security Policy)               │
├──────────────────────────────────────────────────────────┤
│ LAYER 6: AUDIT & MONITORING                              │
│ • All API calls logged                                   │
│ • Failed login attempts tracked                          │
│ • Suspicious activity alerts                             │
│ • GDPR compliance logs                                   │
└──────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// JWT implementation with refresh tokens
import jwt from 'jsonwebtoken';

export const generateTokens = (user: User) => {
  // Access token (short-lived)
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  // Refresh token (long-lived)
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '90d' }
  );

  return { accessToken, refreshToken };
};

// Role-based access control middleware
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Usage:
router.get('/admin/users', authenticate, requireRole('ADMIN'), getUsers);
router.post('/inquiries', authenticate, requireRole('BUYER', 'CONTRACTOR'), createInquiry);
router.get('/dealers/:id/quotes', authenticate, requireRole('DEALER'), getDealerQuotes);

// Rate limiting
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Stricter limits for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, please try again in 15 minutes'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Input validation with Joi
import Joi from 'joi';

const createInquirySchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required().max(200),
      quantity: Joi.number().positive().required(),
      unit: Joi.string().valid('sq.ft', 'pieces', 'bags', 'liters', 'meters').required(),
      specifications: Joi.string().max(500)
    })
  ).min(1).required(),
  deliveryAddress: Joi.string().required().max(500),
  deliveryLatitude: Joi.number().min(-90).max(90).required(),
  deliveryLongitude: Joi.number().min(-180).max(180).required(),
  notes: Joi.string().max(1000)
});

export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

// SQL injection prevention (Prisma handles this automatically)
// ✅ SAFE:
const user = await prisma.user.findUnique({
  where: { email: userInput }  // Prisma auto-escapes
});

// ❌ NEVER DO THIS:
// const users = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${userInput}'`);

// XSS prevention
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// Sanitize user input
import { sanitize } from './utils/sanitize';

export const sanitizeInput = (input: string): string => {
  // Remove HTML tags
  let clean = input.replace(/<[^>]*>/g, '');

  // Encode special characters
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return clean.trim();
};
```

---

## 10. Monetization Strategy

### 10.1 Revenue Streams

```
Revenue Model
┌──────────────────────────────────────────────────────────┐
│ 1. DEALER SUBSCRIPTIONS (Primary Revenue)                │
│                                                          │
│ FREE TIER                                                │
│ • 10 inquiries/month                                     │
│ • Basic profile                                          │
│ • Standard listing                                       │
│ • Limited analytics                                      │
│ Price: ₹0/month                                          │
│ Target: New dealers, trial users                        │
│                                                          │
│ PROFESSIONAL TIER                                        │
│ • Unlimited inquiries                                    │
│ • Enhanced profile with photos                           │
│ • Priority in search results                             │
│ • Advanced analytics                                     │
│ • Quick quote templates                                  │
│ • Badge: "Pro Dealer"                                    │
│ Price: ₹2,999/month (~$36)                               │
│ Target: Medium dealers                                   │
│                                                          │
│ ENTERPRISE TIER                                          │
│ • Everything in Professional                             │
│ • Multi-location support                                 │
│ • Team accounts                                          │
│ • API access                                             │
│ • Dedicated account manager                              │
│ • Custom integrations                                    │
│ • Featured dealer status                                 │
│ Price: ₹9,999/month (~$120)                              │
│ Target: Large dealer chains                              │
│                                                          │
│ PROJECTED SUBSCRIPTION REVENUE (2027):                   │
│ • 500 Professional: 500 × ₹2,999 = ₹14.99L/month        │
│ • 50 Enterprise: 50 × ₹9,999 = ₹4.99L/month              │
│ • Total: ₹19.98L/month (~₹2.4 crore/year)                │
├──────────────────────────────────────────────────────────┤
│ 2. COMMISSION ON ORDERS (Secondary Revenue)              │
│                                                          │
│ Model: 2-3% commission on GMV                            │
│ • Collected from dealers on successful orders            │
│ • Transparent pricing shown to dealers upfront           │
│ • Waived for subscription customers                      │
│                                                          │
│ PROJECTED COMMISSION REVENUE (2027):                     │
│ • 10,000 orders/month                                    │
│ • Avg order value: ₹45,000                               │
│ • GMV: ₹45 crore/month                                   │
│ • Commission (2%): ₹90L/month (~₹10.8 crore/year)        │
│                                                          │
│ Note: Most dealers will choose subscription to avoid     │
│ per-order commission, making subscriptions preferred     │
├──────────────────────────────────────────────────────────┤
│ 3. PREMIUM FEATURES FOR ARCHITECTS/DESIGNERS             │
│                                                          │
│ Professional Profile: ₹4,999/month                       │
│ • Portfolio showcase (unlimited projects)                │
│ • Featured in "Top Professionals" section                │
│ • Commission on material orders (2-3%)                   │
│ • Client testimonials                                    │
│ • Lead generation                                        │
│                                                          │
│ PROJECTED REVENUE (2027):                                │
│ • 100 architects: 100 × ₹4,999 = ₹4.99L/month            │
│ • Commission on ₹5 crore GMV: ₹10L/month                 │
│ • Total: ₹14.99L/month (~₹1.8 crore/year)                │
├──────────────────────────────────────────────────────────┤
│ 4. ADVERTISING & SPONSORED LISTINGS                      │
│                                                          │
│ Sponsored Search Results:                                │
│ • Appear at top of dealer search                         │
│ • Price: ₹50,000/month per category per city             │
│                                                          │
│ Featured Products:                                       │
│ • Highlight specific products                            │
│ • Price: ₹25,000/month                                   │
│                                                          │
│ Banner Ads (User App):                                   │
│ • Display ads for related services                       │
│ • Price: ₹1,00,000/month                                 │
│                                                          │
│ PROJECTED REVENUE (2027):                                │
│ • 20 sponsored listings: ₹10L/month                      │
│ • 10 featured products: ₹2.5L/month                      │
│ • 5 banner ads: ₹5L/month                                │
│ • Total: ₹17.5L/month (~₹2.1 crore/year)                 │
├──────────────────────────────────────────────────────────┤
│ 5. VALUE-ADDED SERVICES                                  │
│                                                          │
│ Professional Photography:                                │
│ • Showroom photos for dealer profiles                    │
│ • Price: ₹5,000 per session                              │
│ • Projected: 50/month = ₹2.5L/month                      │
│                                                          │
│ Business Verification:                                   │
│ • Fast-track verification (24 hours)                     │
│ • Price: ₹2,000 one-time                                 │
│ • Projected: 200/month = ₹4L/month                       │
│                                                          │
│ Analytics Reports:                                       │
│ • Detailed market insights, competitor analysis          │
│ • Price: ₹10,000/month                                   │
│ • Projected: 30/month = ₹3L/month                        │
│                                                          │
│ Total: ₹9.5L/month (~₹1.14 crore/year)                   │
└──────────────────────────────────────────────────────────┘

TOTAL ANNUAL REVENUE PROJECTION (2027):
┌──────────────────────────────────────────────────────────┐
│ Dealer Subscriptions:        ₹2.4 crore  (47%)           │
│ Commission on Orders:         ₹10.8 crore (53%)          │  
│ Architect/Designer Revenue:   ₹1.8 crore  (9%)           │
│ Advertising:                  ₹2.1 crore  (10%)          │
│ Value-Added Services:         ₹1.14 crore (5%)           │
│ ─────────────────────────────────────────────────────── │
│ TOTAL:                        ₹18.24 crore (~$2.2M)      │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Roadmap & Milestones

### Phase 1: MVP Launch (Months 1-3)

**Month 1: Foundation**
- [x] Backend API development complete
- [x] Database schema & migrations
- [x] Google Cloud Vision integration
- [x] Claude AI integration
- [ ] User App: Authentication, Home, Slip Scanner
- [ ] Business App: Authentication, Profile setup, Inbox

**Month 2: Core Features**
- [ ] User App: Quote comparison, Order tracking
- [ ] Business App: Quick Quote, Analytics
- [ ] Google Maps integration
- [ ] Push notifications setup
- [ ] SMS integration (Twilio)
- [ ] Beta testing with 50 users + 20 dealers

**Month 3: Polish & Launch**
- [ ] WhatsApp Business API integration
- [ ] Reviews & ratings system
- [ ] In-app chat
- [ ] Payment gateway integration
- [ ] Bug fixes from beta
- [ ] App Store & Play Store submission
- [ ] Public launch in Bangalore

**Success Metrics (Month 3):**
- 1,000+ registered users
- 100+ verified dealers
- 500+ inquiries processed
- 30%+ conversion rate (inquiries → orders)

---

### Phase 2: Growth (Months 4-6)

**Month 4-5: Expansion**
- [ ] Launch in 3 more cities (Mumbai, Delhi, Hyderabad)
- [ ] Google Lens integration
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Architect/Designer profiles
- [ ] Referral program

**Month 6: Scale Infrastructure**
- [ ] Performance optimization
- [ ] Caching layer (Redis)
- [ ] CDN for images
- [ ] Automated testing pipeline
- [ ] Advanced analytics dashboard

**Success Metrics (Month 6):**
- 10,000+ users
- 500+ dealers
- 3,000+ monthly inquiries
- ₹2 crore GMV/month

---

### Phase 3: Advanced Features (Months 7-12)

- [ ] AI price prediction
- [ ] Inventory management for dealers
- [ ] Voice-based inquiry creation
- [ ] Augmented Reality (AR) product visualization
- [ ] Supply chain financing
- [ ] B2B procurement for builders
- [ ] International expansion planning

**Success Metrics (Month 12):**
- 50,000+ users
- 2,000+ dealers
- 10,000+ monthly inquiries
- ₹10 crore GMV/month
- ₹1 crore monthly revenue

---

## 12. Conclusion

Hub4Estate is positioned to revolutionize construction materials procurement in India through a mobile-first, AI-powered platform. By solving the critical pain point of manual contractor slip processing and providing a transparent marketplace, we're creating value for all stakeholders:

**For Customers:**
- Save 70% time in procurement (3 days → 3 minutes)
- Save 15-30% on costs through competition
- Peace of mind with verified dealers

**For Dealers:**
- Access to qualified leads
- 40% more inquiries vs traditional methods
- Professional online presence
- Data-driven business insights

**For the Platform:**
- Large addressable market (₹8L+ crore industry)
- Multiple revenue streams
- Strong network effects
- Defensible through AI/ML moat

**Technology Excellence:**
- Production-ready mobile apps (React Native + Expo)
- Scalable backend (Node.js + PostgreSQL)
- Best-in-class integrations (Google Cloud, Claude AI)
- Enterprise-grade security

**Next Steps:**
1. Complete Phase 1 development (3 months)
2. Launch MVP in Bangalore
3. Achieve product-market fit
4. Raise Series A funding
5. Scale to top 10 Indian cities
6. Build the construction materials super-app

---

**Document Version:** 1.0  
**Last Updated:** March 16, 2026  
**Total Pages:** 100+  
**Prepared By:** Hub4Estate Product Team  
**Confidential:** Internal Use Only

---

### Appendices

**A. Technology Stack Summary**
**B. API Endpoint Reference**
**C. Database Schema Diagrams**
**D. User Flow Diagrams**
**E. Cost Breakdown & Projections**
**F. Competitive Landscape Analysis**
**G. Regulatory Compliance Checklist**
**H. Team & Hiring Plan**

---

*End of Vision and Requirements Document*

