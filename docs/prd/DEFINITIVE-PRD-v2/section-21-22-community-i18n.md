# Hub4Estate Definitive PRD v2 -- Sections 21 & 22

> **Document**: section-21-22-community-i18n  
> **Version**: 2.0.0  
> **Date**: 2026-04-08  
> **Author**: CTO Office, Hub4Estate  
> **Status**: Authoritative Reference  
> **Classification**: Internal -- Engineering  
> **Prerequisite Reading**: section-01 through section-20

---

# SECTION 21 -- ANALYTICS & BUSINESS INTELLIGENCE

Every metric, dashboard, report, and data pipeline defined here. No vanity metrics. Every number on every dashboard answers a specific business question.

---

## 21.1 Analytics Architecture

### 21.1.1 Data Flow

```
User Actions → PostHog (product analytics)
             → PostgreSQL `analytics_events` table (custom business events)
             → Sentry (errors + performance)
             → Firebase Analytics (mobile-specific)

Daily ETL (03:00 IST):
  PostgreSQL raw events → Materialized Views → Dashboard queries

Weekly:
  PostgreSQL → CSV export → Google Sheets (for Shreshth's manual analysis)
```

### 21.1.2 Event Schema

```typescript
// All analytics events follow this structure

interface AnalyticsEvent {
  id: string;                          // UUID v7
  eventName: string;                   // e.g., "inquiry_created", "quote_submitted"
  userId: string | null;               // null for anonymous events
  sessionId: string;                   // Browser/app session
  timestamp: Date;
  properties: Record<string, unknown>; // Event-specific data
  context: {
    platform: 'web' | 'mobile' | 'api';
    userAgent: string;
    ip: string;                        // Hashed, not raw
    city: string | null;
    referrer: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  };
}
```

### 21.1.3 PostHog Configuration

```typescript
// Frontend PostHog initialization

import posthog from 'posthog-js';

posthog.init('phc_xxxxxxxxxxxx', {
  api_host: 'https://app.posthog.com',
  autocapture: true,                    // Auto-capture clicks, pageviews
  capture_pageview: true,
  capture_pageleave: true,
  persistence: 'localStorage',
  person_profiles: 'identified_only',   // Only track identified users
  disable_session_recording: false,     // Record sessions for debugging
  session_recording: {
    maskAllInputs: true,                // Never record input values
    maskTextSelector: '.sensitive',      // Mask elements with .sensitive class
  },
});

// Identify user on login
posthog.identify(user.id, {
  name: user.name,
  role: user.role,
  city: user.city,
  createdAt: user.createdAt,
});
```

---

## 21.2 Business Metrics Definitions

### 21.2.1 North Star Metric

**GMV (Gross Merchandise Value)**: Total value of all completed orders on the platform.

```sql
-- GMV calculation
SELECT
  DATE_TRUNC('month', o.completed_at) AS month,
  SUM(o.total_amount) / 100.0 AS gmv_inr,     -- Convert paise to INR
  COUNT(DISTINCT o.id) AS order_count,
  COUNT(DISTINCT o.buyer_id) AS unique_buyers,
  COUNT(DISTINCT o.dealer_id) AS unique_dealers
FROM orders o
WHERE o.status = 'completed'
  AND o.completed_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', o.completed_at)
ORDER BY month DESC;
```

### 21.2.2 Key Metrics Dashboard

| Metric | Definition | SQL/Calculation | Target |
|--------|-----------|-----------------|--------|
| GMV | Sum of completed order amounts | `SUM(orders.total_amount WHERE status = completed)` | ₹50Cr Year 1 |
| Take Rate | Platform revenue / GMV | `SUM(platform_fees) / SUM(order_amounts) * 100` | 2-5% |
| DAU | Users with >= 1 session per day | `COUNT(DISTINCT user_id) WHERE date = today` | 500 by M6 |
| MAU | Users with >= 1 session per month | `COUNT(DISTINCT user_id) WHERE month = current` | 5,000 by M6 |
| Buyer Activation Rate | % of registered buyers who create first inquiry within 7 days | `buyers_with_inquiry_7d / total_new_buyers * 100` | > 30% |
| Inquiry-to-Match Rate | % of inquiries that result in a match | `matched_inquiries / total_inquiries * 100` | > 60% |
| Quote Response Rate | % of dealer notifications that result in a quote | `quotes_submitted / dealer_notifications * 100` | > 40% |
| Average Quotes per Inquiry | Mean quotes received per inquiry | `AVG(quote_count) per inquiry` | > 5 |
| Average Savings % | Mean savings vs MRP across completed orders | `AVG((mrp_total - actual_total) / mrp_total * 100)` | > 20% |
| Dealer NPS | Net Promoter Score from quarterly dealer surveys | Survey-based | > 40 |
| Buyer NPS | Net Promoter Score from post-purchase surveys | Survey-based | > 50 |
| Churn Rate (Dealer) | % of active dealers who stop quoting for 30+ days | `churned_dealers / total_active_dealers * 100` | < 10% monthly |
| Churn Rate (Buyer) | % of active buyers with no activity for 60+ days | `churned_buyers / total_active_buyers * 100` | < 15% monthly |
| Average Response Time | Time from inquiry creation to first quote | `AVG(first_quote_time - inquiry_created_time)` | < 6 hours |
| Resolution Time (Disputes) | Time from dispute open to resolution | `AVG(resolved_at - opened_at)` | < 72 hours |
| Dealer Win Rate | % of quotes that result in a match per dealer | `won_quotes / total_quotes * 100` per dealer | > 20% avg |
| ARPD | Average Revenue Per Dealer per month | `total_revenue / active_dealers` | ₹2,500 |
| LTV/CAC | Lifetime value / customer acquisition cost | `(ARPD * avg_months_active * margin) / acquisition_cost` | > 10:1 |

### 21.2.3 Cohort Analysis

```sql
-- Monthly buyer cohort retention
WITH cohorts AS (
  SELECT
    u.id AS user_id,
    DATE_TRUNC('month', u.created_at) AS cohort_month
  FROM users u
  WHERE u.role = 'buyer'
),
activity AS (
  SELECT
    ae.user_id,
    DATE_TRUNC('month', ae.timestamp) AS activity_month
  FROM analytics_events ae
  WHERE ae.event_name IN ('inquiry_created', 'quote_viewed', 'order_placed')
)
SELECT
  c.cohort_month,
  EXTRACT(MONTH FROM a.activity_month - c.cohort_month) AS months_since_signup,
  COUNT(DISTINCT a.user_id) AS active_users,
  COUNT(DISTINCT c.user_id) AS cohort_size,
  ROUND(COUNT(DISTINCT a.user_id)::decimal / COUNT(DISTINCT c.user_id) * 100, 1) AS retention_pct
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_month, months_since_signup
ORDER BY c.cohort_month, months_since_signup;
```

### 21.2.4 Funnel Definitions

**Buyer Acquisition Funnel:**

```
Landing Page Visit → Registration Start → OTP Sent → OTP Verified → Onboarding Complete → First Inquiry Created → First Quote Received → First Match Selected → First Order Paid → First Review Left
```

**Conversion Targets:**

| Step | Conversion Rate Target |
|------|----------------------|
| Visit → Registration Start | > 15% |
| Registration Start → OTP Verified | > 80% |
| OTP Verified → Onboarding Complete | > 70% |
| Onboarding → First Inquiry | > 30% (within 7 days) |
| First Inquiry → First Match | > 60% |
| First Match → First Order | > 80% |
| First Order → First Review | > 30% |

---

## 21.3 Materialized Views

### 21.3.1 Daily Platform Summary

```sql
CREATE MATERIALIZED VIEW mv_daily_platform_summary AS
SELECT
  DATE_TRUNC('day', e.timestamp) AS date,
  COUNT(DISTINCT CASE WHEN e.event_name = 'session_start' THEN e.user_id END) AS dau,
  COUNT(CASE WHEN e.event_name = 'inquiry_created' THEN 1 END) AS inquiries_created,
  COUNT(CASE WHEN e.event_name = 'quote_submitted' THEN 1 END) AS quotes_submitted,
  COUNT(CASE WHEN e.event_name = 'match_selected' THEN 1 END) AS matches,
  COALESCE(SUM(CASE WHEN e.event_name = 'order_completed' THEN (e.properties->>'amount')::bigint END), 0) AS gmv_paise,
  COUNT(DISTINCT CASE WHEN e.event_name = 'user_registered' THEN e.user_id END) AS new_registrations
FROM analytics_events e
GROUP BY DATE_TRUNC('day', e.timestamp);

-- Refresh daily at 03:30 IST
-- CREATE INDEX idx_mv_daily_summary_date ON mv_daily_platform_summary (date DESC);
```

### 21.3.2 Dealer Performance Summary

```sql
CREATE MATERIALIZED VIEW mv_dealer_performance AS
SELECT
  d.id AS dealer_id,
  d.business_name,
  d.tier,
  COUNT(DISTINCT q.id) AS total_quotes,
  COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'won') AS won_quotes,
  ROUND(COUNT(q.id) FILTER (WHERE q.status = 'won')::decimal / NULLIF(COUNT(q.id), 0) * 100, 1) AS win_rate,
  AVG(EXTRACT(EPOCH FROM q.created_at - i.created_at) / 3600)::decimal(10,1) AS avg_response_hours,
  COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'completed'), 0) / 100.0 AS total_revenue_inr,
  AVG(r.overall_score)::decimal(2,1) AS avg_rating,
  COUNT(DISTINCT r.id) AS review_count,
  COUNT(DISTINCT disp.id) FILTER (WHERE disp.status = 'resolved_against_dealer') AS disputes_lost
FROM dealers d
LEFT JOIN quotes q ON d.id = q.dealer_id
LEFT JOIN inquiries i ON q.inquiry_id = i.id
LEFT JOIN orders o ON d.id = o.dealer_id
LEFT JOIN reviews r ON d.id = r.dealer_id
LEFT JOIN disputes disp ON d.id = disp.dealer_id
GROUP BY d.id, d.business_name, d.tier;

-- Refresh weekly on Sunday at 05:00 IST
```

---

## 21.4 Reports & Exports

### 21.4.1 Automated Reports

| Report | Frequency | Recipients | Format |
|--------|-----------|------------|--------|
| Daily Platform Summary | Daily 09:00 IST | Shreshth | Email (HTML summary + CSV attachment) |
| Weekly Business Review | Monday 09:00 IST | Shreshth, Core Team | Email + Google Sheets link |
| Monthly Dealer Performance | 1st of month | Admin Team | Dashboard + CSV export |
| Quarterly Market Intelligence | Every 3 months | Shreshth | PDF report |
| Revenue Reconciliation | Monthly | Finance | CSV (matched against Razorpay) |

### 21.4.2 Export API

```
GET /api/v1/admin/analytics/export?report=daily_summary&start=2026-04-01&end=2026-04-30&format=csv

Auth: Required (role: admin)
Response: CSV file download
```

Supported reports: `daily_summary`, `dealer_performance`, `buyer_activity`, `inquiry_funnel`, `revenue_detail`, `price_index_history`

---

## 21.5 A/B Testing & Feature Flags

### 21.5.1 Feature Flag System

Stored in PostgreSQL `feature_flags` table + cached in Redis (1 minute TTL).

```typescript
interface FeatureFlag {
  key: string;                         // "enable_ai_chat", "new_quote_card_design"
  enabled: boolean;                    // Global on/off
  rolloutPercentage: number;           // 0-100, for gradual rollout
  targetRules: TargetRule[];           // User-level targeting
  createdAt: Date;
  updatedAt: Date;
}

interface TargetRule {
  type: 'user_id' | 'role' | 'city' | 'registration_date';
  operator: 'equals' | 'in' | 'gt' | 'lt';
  value: string | string[];
}
```

**Frontend Usage:**

```typescript
// src/hooks/useFeatureFlag.ts

import { useQuery } from '@tanstack/react-query';

export function useFeatureFlag(key: string): boolean {
  const { data } = useQuery({
    queryKey: ['feature-flags', key],
    queryFn: () => fetch(`/api/v1/settings/features/${key}`).then(r => r.json()),
    staleTime: 60 * 1000,
  });
  return data?.data?.enabled ?? false;
}

// Usage
const showNewDesign = useFeatureFlag('new_quote_card_design');
```

### 21.5.2 A/B Test Framework

Built on PostHog's experimentation feature:

| Test | Hypothesis | Metric | Duration |
|------|-----------|--------|----------|
| CTA Text | "Get Quotes" vs "Find Best Prices" | Registration conversion | 2 weeks |
| Inquiry Form | Single page vs multi-step wizard | Inquiry completion rate | 3 weeks |
| Quote Display | Score-first vs price-first | Match selection time | 2 weeks |
| Onboarding | 3-step vs skip-able | 7-day inquiry creation rate | 4 weeks |

---

# SECTION 22 -- INTERNATIONALIZATION & LOCALIZATION

Hub4Estate launches in English + Hindi. Architecture supports future expansion to Marathi, Tamil, Kannada, Telugu, Bengali, Gujarati.

---

## 22.1 i18n Architecture

### 22.1.1 Framework

| Layer | Solution |
|-------|----------|
| Frontend | `react-i18next` with JSON translation files |
| Backend | Translation keys in API responses where needed |
| Database | Multi-language fields stored as JSONB columns |
| Content | Separate translation files per language |

### 22.1.2 Language Support Matrix

| Language | Code | Status | Coverage |
|----------|------|--------|----------|
| English | `en` | Launch | 100% |
| Hindi | `hi` | Launch | 100% UI, 80% catalog descriptions |
| Marathi | `mr` | Phase 2 | Planned |
| Tamil | `ta` | Phase 3 | Planned |
| Kannada | `kn` | Phase 3 | Planned |
| Telugu | `te` | Phase 3 | Planned |
| Bengali | `bn` | Phase 3 | Planned |
| Gujarati | `gu` | Phase 3 | Planned |

### 22.1.3 Frontend i18n Setup

```typescript
// src/lib/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'h4e_lang',
    },
  });

export default i18n;
```

### 22.1.4 Translation File Structure

```json
// src/locales/en.json
{
  "common": {
    "appName": "Hub4Estate",
    "tagline": "Best Prices on Electrical Products",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try Again",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "search": "Search",
    "noResults": "No results found",
    "viewAll": "View All"
  },
  "auth": {
    "login": "Log In",
    "register": "Create Account",
    "phone": "Phone Number",
    "phonePlaceholder": "Enter 10-digit mobile number",
    "sendOtp": "Send OTP",
    "verifyOtp": "Verify OTP",
    "otpSent": "OTP sent to {{phone}}",
    "otpExpiry": "Code expires in {{seconds}}s",
    "resendOtp": "Resend OTP",
    "alreadyHaveAccount": "Already have an account?",
    "dontHaveAccount": "Don't have an account?"
  },
  "catalog": {
    "searchPlaceholder": "Search for products, brands...",
    "filters": "Filters",
    "sortBy": "Sort by",
    "relevance": "Relevance",
    "priceLowToHigh": "Price: Low to High",
    "priceHighToLow": "Price: High to Low",
    "newest": "Newest",
    "popularity": "Most Popular",
    "mrp": "MRP",
    "avgPrice": "Avg. Price",
    "dealerCount": "{{count}} dealers",
    "compare": "Compare",
    "getQuotes": "Get Quotes",
    "priceHistory": "Price History",
    "specifications": "Specifications",
    "similarProducts": "Similar Products",
    "boughtTogether": "Frequently Bought Together"
  },
  "inquiry": {
    "createNew": "Create New Inquiry",
    "selectCategory": "Select Category",
    "addProducts": "Add Products",
    "deliveryDetails": "Delivery Details",
    "review": "Review & Submit",
    "submit": "Submit Inquiry",
    "deadline": "Quote Deadline",
    "urgency": "Urgency",
    "standard": "Standard (7+ days)",
    "express": "Express (3-7 days)",
    "urgent": "Urgent (1-3 days)",
    "budget": "Budget Range (optional)",
    "quoteCount": "{{count}} quotes received",
    "selectWinner": "Select This Quote",
    "status": {
      "draft": "Draft",
      "accepting_quotes": "Accepting Quotes",
      "under_review": "Under Review",
      "matched": "Matched",
      "completed": "Completed",
      "expired": "Expired",
      "cancelled": "Cancelled"
    }
  },
  "dashboard": {
    "welcome": "Welcome, {{name}}",
    "totalSavings": "Total Savings",
    "activeInquiries": "Active Inquiries",
    "completedOrders": "Completed Orders",
    "createInquiry": "Get Quotes",
    "browseCatalog": "Browse Catalog",
    "recentActivity": "Recent Activity",
    "noActivity": "No activity yet. Create your first inquiry to get started!"
  },
  "dealer": {
    "dashboard": "Dealer Dashboard",
    "revenue": "Revenue (MTD)",
    "activeQuotes": "Active Quotes",
    "winRate": "Win Rate",
    "avgResponseTime": "Avg Response Time",
    "newInquiries": "New Inquiries",
    "myOrders": "My Orders",
    "inventory": "Inventory",
    "submitQuote": "Submit Quote"
  },
  "notifications": {
    "title": "Notifications",
    "markAllRead": "Mark all as read",
    "noNotifications": "No notifications yet",
    "quoteReceived": "New quote received for your inquiry",
    "matchSelected": "Your quote was selected!",
    "orderShipped": "Your order has been shipped",
    "priceAlert": "Price alert: {{product}} dropped to {{price}}"
  }
}
```

```json
// src/locales/hi.json
{
  "common": {
    "appName": "Hub4Estate",
    "tagline": "इलेक्ट्रिकल प्रोडक्ट्स पर बेस्ट प्राइस",
    "loading": "लोड हो रहा है...",
    "error": "कुछ गलत हो गया",
    "retry": "फिर से कोशिश करें",
    "save": "सेव करें",
    "cancel": "रद्द करें",
    "delete": "हटाएं",
    "search": "खोजें",
    "noResults": "कोई रिजल्ट नहीं मिला",
    "viewAll": "सभी देखें"
  },
  "auth": {
    "login": "लॉग इन करें",
    "register": "अकाउंट बनाएं",
    "phone": "फ़ोन नंबर",
    "phonePlaceholder": "10 अंकों का मोबाइल नंबर डालें",
    "sendOtp": "OTP भेजें",
    "verifyOtp": "OTP वेरिफाई करें",
    "otpSent": "{{phone}} पर OTP भेजा गया",
    "otpExpiry": "कोड {{seconds}} सेकंड में एक्सपायर होगा",
    "resendOtp": "OTP दोबारा भेजें",
    "alreadyHaveAccount": "पहले से अकाउंट है?",
    "dontHaveAccount": "अकाउंट नहीं है?"
  },
  "catalog": {
    "searchPlaceholder": "प्रोडक्ट, ब्रांड खोजें...",
    "filters": "फ़िल्टर",
    "sortBy": "सॉर्ट करें",
    "relevance": "प्रासंगिकता",
    "priceLowToHigh": "कीमत: कम से ज़्यादा",
    "priceHighToLow": "कीमत: ज़्यादा से कम",
    "newest": "सबसे नया",
    "popularity": "सबसे लोकप्रिय",
    "mrp": "MRP",
    "avgPrice": "औसत कीमत",
    "dealerCount": "{{count}} डीलर",
    "compare": "तुलना करें",
    "getQuotes": "कोटेशन पाएं",
    "priceHistory": "कीमत का इतिहास",
    "specifications": "विशेषताएं",
    "similarProducts": "समान प्रोडक्ट",
    "boughtTogether": "अक्सर साथ में खरीदे गए"
  },
  "inquiry": {
    "createNew": "नई पूछताछ बनाएं",
    "selectCategory": "कैटेगरी चुनें",
    "addProducts": "प्रोडक्ट जोड़ें",
    "deliveryDetails": "डिलीवरी विवरण",
    "review": "समीक्षा करें और सबमिट करें",
    "submit": "पूछताछ सबमिट करें",
    "deadline": "कोटेशन की डेडलाइन",
    "urgency": "अर्जेंसी",
    "standard": "सामान्य (7+ दिन)",
    "express": "एक्सप्रेस (3-7 दिन)",
    "urgent": "अर्जेंट (1-3 दिन)",
    "budget": "बजट रेंज (वैकल्पिक)",
    "quoteCount": "{{count}} कोटेशन मिले",
    "selectWinner": "यह कोटेशन चुनें",
    "status": {
      "draft": "ड्राफ्ट",
      "accepting_quotes": "कोटेशन स्वीकार हो रहे हैं",
      "under_review": "समीक्षा में",
      "matched": "मैच हो गया",
      "completed": "पूरा हो गया",
      "expired": "समाप्त",
      "cancelled": "रद्द"
    }
  },
  "dashboard": {
    "welcome": "नमस्ते, {{name}}",
    "totalSavings": "कुल बचत",
    "activeInquiries": "सक्रिय पूछताछ",
    "completedOrders": "पूरे किए गए ऑर्डर",
    "createInquiry": "कोटेशन पाएं",
    "browseCatalog": "कैटलॉग ब्राउज़ करें",
    "recentActivity": "हाल की गतिविधि",
    "noActivity": "अभी कोई गतिविधि नहीं। शुरू करने के लिए अपनी पहली पूछताछ बनाएं!"
  },
  "dealer": {
    "dashboard": "डीलर डैशबोर्ड",
    "revenue": "रेवेन्यू (इस महीने)",
    "activeQuotes": "सक्रिय कोटेशन",
    "winRate": "जीत दर",
    "avgResponseTime": "औसत रिस्पॉन्स टाइम",
    "newInquiries": "नई पूछताछ",
    "myOrders": "मेरे ऑर्डर",
    "inventory": "इन्वेंटरी",
    "submitQuote": "कोटेशन दें"
  },
  "notifications": {
    "title": "नोटिफिकेशन",
    "markAllRead": "सभी को पढ़ा हुआ करें",
    "noNotifications": "अभी कोई नोटिफिकेशन नहीं",
    "quoteReceived": "आपकी पूछताछ के लिए नया कोटेशन आया",
    "matchSelected": "आपका कोटेशन चुना गया!",
    "orderShipped": "आपका ऑर्डर शिप हो गया",
    "priceAlert": "कीमत अलर्ट: {{product}} की कीमत {{price}} हो गई"
  }
}
```

### 22.1.5 Component Usage

```tsx
// Example: Using translations in components

import { useTranslation } from 'react-i18next';

export function InquiryStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const statusColors = {
    accepting_quotes: 'bg-green-100 text-green-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    matched: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {t(`inquiry.status.${status}`)}
    </span>
  );
}
```

### 22.1.6 Language Switcher

```tsx
// src/components/ui/LanguageSwitcher.tsx

import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => {
        i18n.changeLanguage(e.target.value);
        localStorage.setItem('h4e_lang', e.target.value);
      }}
      className="border-2 border-black rounded px-2 py-1 text-sm bg-white"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}
```

---

## 22.2 Content Localization

### 22.2.1 Product Names

Product names are stored in both English and Hindi in the database:

```sql
-- Product name localization
ALTER TABLE products ADD COLUMN name_hi VARCHAR(500);
ALTER TABLE products ADD COLUMN description_hi TEXT;
ALTER TABLE products ADD COLUMN highlights_hi TEXT[];
```

The API returns the appropriate language based on `Accept-Language` header or user's language preference.

### 22.2.2 Category Names

```sql
-- Category localization stored as JSONB
ALTER TABLE categories ADD COLUMN name_localized JSONB DEFAULT '{}';

-- Example data:
-- { "en": "Switchgear & Protection", "hi": "स्विचगियर और सुरक्षा" }
```

### 22.2.3 Email & Notification Templates

All notification templates have language variants:

| Template | English | Hindi |
|----------|---------|-------|
| OTP SMS | "Your Hub4Estate OTP is {otp}. Valid for 5 minutes." | "आपका Hub4Estate OTP है {otp}। 5 मिनट तक वैध।" |
| New Quote WhatsApp | "New quote for your {category} inquiry. {count} total quotes." | "आपकी {category} पूछताछ के लिए नया कोटेशन। कुल {count} कोटेशन।" |
| Match Confirmation | "Congratulations! Your quote was selected." | "बधाई हो! आपका कोटेशन चुना गया।" |

### 22.2.4 Number & Currency Formatting

```typescript
// src/lib/format.ts

export function formatCurrency(paise: number, locale = 'en-IN'): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

// formatCurrency(2480000) → "₹24,800"
// formatCurrency(2480000, 'hi-IN') → "₹24,800"

export function formatNumber(num: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(date: Date | string, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string, locale = 'en-IN'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffMs = new Date(date).getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
  return formatDate(date, locale);
}
```

---

## 22.3 RTL Support (Future)

Not needed for current languages (English, Hindi are LTR). Architecture is prepared:

- All CSS uses logical properties (`margin-inline-start` instead of `margin-left`)
- Tailwind configured with `dir` attribute support
- Components use `flex` with `direction` awareness
- Icons that indicate direction (arrows, chevrons) use CSS logical transforms

When Arabic or Urdu support is added, the only changes needed are:
1. Add `dir="rtl"` to `<html>` tag
2. Enable Tailwind RTL plugin
3. Review custom animations for direction

---

## 22.4 Accessibility (a11y)

### 22.4.1 Standards

- WCAG 2.1 AA compliance (minimum)
- Target: WCAG 2.1 AAA for core user flows (registration, inquiry creation, catalog search)

### 22.4.2 Implementation Checklist

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Keyboard navigation | All interactive elements focusable, logical tab order, visible focus indicators | Required |
| Screen reader support | Semantic HTML, ARIA labels, live regions for dynamic content | Required |
| Color contrast | All text meets 4.5:1 ratio (AA), large text meets 3:1 | Required |
| Focus management | Focus trapped in modals, moved to new content on navigation | Required |
| Error identification | Form errors announced, linked to fields, red + icon (not color alone) | Required |
| Resize support | Content readable at 200% zoom, no horizontal scroll at 320px | Required |
| Motion reduction | `prefers-reduced-motion` respected, animations disabled | Required |
| Touch targets | Minimum 44x44px for all interactive elements on mobile | Required |
| Image alt text | All images have descriptive alt text, decorative images have `alt=""` | Required |
| Heading hierarchy | Single `h1` per page, sequential heading levels, no skips | Required |
| Link purpose | All links have descriptive text (no "click here") | Required |
| Form labels | Every input has a visible `<label>` | Required |
| Table headers | All data tables have `<th>` with `scope` attribute | Required |
| Language attribute | `<html lang="en">` or `<html lang="hi">` based on selection | Required |
| Skip navigation | "Skip to main content" link as first focusable element | Required |

### 22.4.3 Testing

| Tool | Purpose | Frequency |
|------|---------|-----------|
| axe DevTools | Automated accessibility audit | Every PR (CI check) |
| NVDA + Chrome | Screen reader testing (Windows) | Monthly manual |
| VoiceOver + Safari | Screen reader testing (macOS/iOS) | Monthly manual |
| Lighthouse Accessibility | Automated score | Every deploy |
| Manual keyboard testing | Tab order, focus management | Every new feature |

### 22.4.4 ARIA Patterns

```tsx
// Live region for real-time quote count updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {quoteCount} quotes received for your inquiry
</div>

// Modal with focus trap
<Dialog
  open={isOpen}
  onClose={close}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <Dialog.Title id="dialog-title">Select Winning Quote</Dialog.Title>
  <Dialog.Description id="dialog-description">
    Choose the best quote for your inquiry. This action cannot be undone.
  </Dialog.Description>
  {/* content */}
</Dialog>

// Loading state announcement
<div role="status" aria-busy={isLoading}>
  {isLoading ? <span className="sr-only">Loading products...</span> : null}
  {/* content */}
</div>
```

---

*End of Sections 21 & 22. Analytics covers every business metric, cohort analysis, materialized view, report pipeline, and A/B testing framework. i18n covers English + Hindi with full translation files, localization patterns, number/date formatting, and WCAG 2.1 AA accessibility compliance.*

*[CONTINUES IN NEXT SECTION -- Resume at section-23-24 Search & File Structure]*
