# §4 — UI/UX Design System

> Complete design system specification derived from `frontend/tailwind.config.js`, component library, and deployed pages. Every value is production-real.

---

## 4.1 Design Philosophy

Hub4Estate's visual identity fuses **neobrutalist structure** (bold borders, hard shadows, prominent geometry) with a **warm, premium palette** (beige, terracotta, cream). The result feels like a high-end architect's blueprint rendered in a modern web interface.

Six governing principles:

| # | Principle | Implementation |
|---|-----------|---------------|
| 1 | **Bright, Positive, Modern** | No dark backgrounds, no black-heavy palettes. Every surface skews warm-white to beige. Founder mandate: "never dark/negative." |
| 2 | **Mobile-First** | Breakpoints: 375px (design reference) -> 640px (sm) -> 768px (md) -> 1024px (lg) -> 1280px (xl) -> 1536px (2xl). Touch targets >= 44px. |
| 3 | **Information Density by Context** | Admin dashboards: dense data tables, compact spacing. Buyer catalog: generous whitespace, large product cards. Dealer dashboard: metric-first, action-oriented. |
| 4 | **Motion with Purpose** | Animations reinforce hierarchy and state transitions. No decorative animation. All durations < 600ms. Respects `prefers-reduced-motion`. |
| 5 | **Progressive Disclosure** | Show essentials first (price, brand, availability), details on demand (specs, certifications, comparison). Accordions and modals for deep content. |
| 6 | **Trust Through Transparency** | Always show: savings percentage, dealer rating, price comparisons, inquiry status. Never hide costs or conditions. |

---

## 4.2 Color System

### Primary Palette (Warm Beige/Tan)
Sourced from `tailwind.config.js` -> `theme.extend.colors.primary`:

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#faf9f7` | Page backgrounds, card fills |
| `primary-100` | `#f5f3ef` | Section backgrounds, hover states |
| `primary-200` | `#e8e4db` | Borders, dividers, muted backgrounds |
| `primary-300` | `#d4cdc0` | Disabled states, placeholder text |
| `primary-400` | `#b8ad9a` | Secondary text, icons |
| `primary-500` | `#9c8e78` | **Main brand color** — headings, badges, brand elements |
| `primary-600` | `#8a7a62` | Hover on brand elements |
| `primary-700` | `#726452` | Active/pressed states |
| `primary-800` | `#5e5345` | High-emphasis text on light backgrounds |
| `primary-900` | `#4d4439` | Headings, maximum contrast on light |

### Accent Palette (Terracotta/Orange)
Sourced from `tailwind.config.js` -> `theme.extend.colors.accent`:

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-50` | `#fdf8f5` | Accent surface background |
| `accent-100` | `#faeee8` | Light accent fills |
| `accent-200` | `#f5dcd0` | Borders on accent elements |
| `accent-300` | `#edc4b0` | Decorative accents |
| `accent-400` | `#e3a688` | Secondary CTAs, icons |
| `accent-500` | `#d3815e` | **Primary CTA color** — buttons, links, highlights |
| `accent-600` | `#c4724f` | CTA hover state |
| `accent-700` | `#a85f42` | CTA active/pressed |
| `accent-800` | `#8c4e37` | Dark accent text |
| `accent-900` | `#74412f` | Maximum contrast accent |

### Neutral Palette
Sourced from `tailwind.config.js` -> `theme.extend.colors.neutral`:

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#fafafa` | Pure white alternative |
| `neutral-100` | `#f5f5f5` | Subtle backgrounds |
| `neutral-200` | `#e5e5e5` | Borders, dividers |
| `neutral-300` | `#d4d4d4` | Disabled borders |
| `neutral-400` | `#a3a3a3` | Placeholder text |
| `neutral-500` | `#737373` | Secondary body text |
| `neutral-600` | `#525252` | Body text |
| `neutral-700` | `#404040` | Emphasis text |
| `neutral-800` | `#262626` | Headings |
| `neutral-900` | `#171717` | Maximum contrast |
| `neutral-950` | `#0a0a0a` | Brutalist borders, code blocks |

### Semantic Colors

| Category | Token | Hex | Usage |
|----------|-------|-----|-------|
| **Success** | `success-50` | `#f0fdf4` | Success background |
| | `success-500` | `#22c55e` | Success text/icons |
| | `success-600` | `#16a34a` | Success buttons |
| **Warning** | `warning-50` | `#fffbeb` | Warning background |
| | `warning-500` | `#f59e0b` | Warning icons |
| | `warning-600` | `#d97706` | **Amber CTA variant** |
| **Error** | `error-50` | `#fef2f2` | Error background |
| | `error-500` | `#ef4444` | Error text/icons |
| | `error-600` | `#dc2626` | Destructive buttons |

### Special Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#0B1628` | Hero sections, dark contrast panels, code blocks, cursor element |

---

## 4.3 Typography

### Font Families
Sourced from `tailwind.config.js` -> `theme.extend.fontFamily`:

```
font-sans:    'Inter', system-ui, sans-serif        — Body text, UI elements, forms
font-display: 'Playfair Display', Georgia, serif     — Hero headings, page titles, marketing
font-mono:    'JetBrains Mono', monospace            — Code, inquiry numbers, technical specs
```

### Display Scale
Sourced from `tailwind.config.js` -> `theme.extend.fontSize`:

| Token | Size | Line Height | Letter Spacing | Weight | Usage |
|-------|------|-------------|----------------|--------|-------|
| `display-2xl` | 4.5rem (72px) | 1.0 | -0.02em | 700 | Hero headline (landing page) |
| `display-xl` | 3.75rem (60px) | 1.0 | -0.02em | 700 | Section heroes |
| `display-lg` | 3rem (48px) | 1.1 | -0.02em | 700 | Page titles |
| `display-md` | 2.25rem (36px) | 1.2 | -0.01em | 700 | Section headings |
| `display-sm` | 1.875rem (30px) | 1.3 | -0.01em | 600 | Subsection headings |

### Body Scale (Tailwind defaults + custom)

| Size | Value | Usage |
|------|-------|-------|
| `text-xs` | 0.75rem (12px) | Captions, timestamps, badges |
| `text-sm` | 0.875rem (14px) | Secondary text, table cells, form labels |
| `text-base` | 1rem (16px) | Body text, form inputs |
| `text-lg` | 1.125rem (18px) | Lead paragraphs, card titles |
| `text-xl` | 1.25rem (20px) | Subsection headers |
| `text-2xl` | 1.5rem (24px) | Card headers, modal titles |

---

## 4.4 Spacing & Layout

### Grid System
- **Base unit**: 4px
- **Column grid**: 12 columns, `max-w-7xl` (1280px) container
- **Gutter**: 16px (mobile), 24px (tablet), 32px (desktop)
- **Section padding**: `py-16` (64px) mobile, `py-24` (96px) desktop

### Breakpoints

| Name | Min Width | Target Device |
|------|-----------|---------------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large displays |

---

## 4.5 Shadows & Borders

### Box Shadows
Sourced from `tailwind.config.js` -> `theme.extend.boxShadow`:

| Token | Value | Usage |
|-------|-------|-------|
| `brutal-sm` | `2px 2px 0px 0px rgba(0,0,0,1)` | Small buttons, tags |
| `brutal` | `4px 4px 0px 0px rgba(0,0,0,1)` | Cards, panels (default brutalist) |
| `brutal-lg` | `6px 6px 0px 0px rgba(0,0,0,1)` | Featured cards, hover state |
| `brutal-xl` | `8px 8px 0px 0px rgba(0,0,0,1)` | Hero elements, CTAs |
| `inner-brutal` | `inset 2px 2px 0 rgba(0,0,0,0.1)` | Input fields, sunken panels |
| `soft` | `0 4px 20px -2px rgba(0,0,0,0.1)` | Dropdown menus, tooltips |
| `soft-lg` | `0 10px 40px -5px rgba(0,0,0,0.15)` | Modals, floating panels |
| `soft-xl` | `0 20px 60px -10px rgba(0,0,0,0.2)` | Hero images, featured content |
| `glow` | `0 0 40px rgba(211,129,94,0.3)` | Accent glow on hover |
| `glow-lg` | `0 0 60px rgba(211,129,94,0.4)` | Hero accent glow |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Default cards, inputs |
| `rounded-xl` | 12px | Feature cards, modals |
| `rounded-2xl` | 16px | Hero elements, large panels |
| `rounded-4xl` | 32px | Custom: pill shapes, badges |
| `rounded-5xl` | 40px | Custom: oversized decorative |

### Border Pattern
Neobrutalist standard: `border-2 border-neutral-950` (2px solid black) on cards and interactive elements. Softer contexts use `border border-neutral-200`.

---

## 4.6 Animation System

### Keyframe Animations
Sourced from `tailwind.config.js` -> `theme.extend.animation` and `keyframes`:

| Token | Duration | Easing | Effect |
|-------|----------|--------|--------|
| `slide-up` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `translateY(30px)` -> 0, fade in |
| `slide-down` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `translateY(-30px)` -> 0, fade in |
| `slide-left` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `translateX(30px)` -> 0, fade in |
| `slide-right` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `translateX(-30px)` -> 0, fade in |
| `fade-in` | 500ms | `ease-out` | Opacity 0 -> 1 |
| `scale-in` | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `scale(0.95)` -> 1, fade in |
| `bounce-in` | 600ms | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | `scale(0.3)` -> overshoot -> settle |
| `pulse-slow` | 3000ms | `ease-in-out` | Infinite pulse (loading states) |
| `marquee` | 25s | `linear` | Infinite horizontal scroll (brand logos) |
| `spin-slow` | 8s | `linear` | Slow rotation (decorative) |
| `counter` | 2s | `ease-out` | CSS counter animation (metrics) |

### Timing Functions
| Token | Value | Usage |
|-------|-------|-------|
| `bounce-in` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful bounce (notifications, badges) |
| `smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth deceleration (page transitions) |

### Background Patterns
| Token | Description |
|-------|-------------|
| `bg-gradient-radial` | `radial-gradient(var(--tw-gradient-stops))` |
| `bg-gradient-conic` | `conic-gradient(from 180deg ...)` |
| `bg-noise` | SVG noise texture overlay for depth |

---

## 4.7 Component Library

Base: Custom components built with React + Tailwind CSS. No external component library (no Shadcn/ui, no MUI).

### Core Components Inventory

| Component | File | Description |
|-----------|------|-------------|
| `Layout` | `components/Layout.tsx` | App shell with header, sidebar, footer |
| `AuthProvider` | `components/AuthProvider.tsx` | Auth context, token refresh, protected routes |
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Route guard by role |
| `ErrorBoundary` | `components/ErrorBoundary.tsx` | Error boundary with fallback UI |
| `ElectricalCursor` | `components/ElectricalCursor.tsx` | Custom animated cursor (landing page) |
| `ElectricWireDivider` | `components/ElectricWireDivider.tsx` | Animated section divider |
| `AISection` | `components/AISection.tsx` | Volt AI showcase section |
| `InteractiveCategoryGrid` | `components/InteractiveCategoryGrid.tsx` | Animated product category browser |
| `AIAssistantWidget` | `components/AIAssistantWidget.tsx` | Floating Volt AI chat widget |
| `RFQChat` | `components/RFQChat.tsx` | RFQ-specific chat interface |
| `SmartSlipScanner` | `components/SmartSlipScanner.tsx` | Image/PDF upload + AI parsing UI |

### UI Primitives (in `components/ui/`)
Custom-built buttons, inputs, cards, modals, toasts, tabs, accordions, dropdowns, badges, and data tables.

### Layout Components (in `components/layouts/`)
Dashboard layouts for admin, dealer, and user panels with responsive sidebars and breadcrumb navigation.

---

## 4.8 Page Architecture

### Public Pages (Unauthenticated)

| Page | Path | File |
|------|------|------|
| Home / Landing | `/` | `pages/HomePage.tsx` |
| About | `/about` | `pages/AboutPage.tsx` |
| Contact | `/contact` | `pages/ContactPage.tsx` |
| AI Assistant | `/ai-assistant` | `pages/AIAssistantPage.tsx` |
| Smart Slip Scan | `/slip-scan` | `pages/SmartSlipScanPage.tsx` |
| Track Inquiry | `/track` | `pages/TrackInquiryPage.tsx` |
| Product Compare | `/compare` | `pages/ComparePage.tsx` |
| Knowledge Base | `/knowledge` | `pages/knowledge/` |
| Terms | `/terms` | `pages/TermsPage.tsx` |
| Privacy | `/privacy` | `pages/PrivacyPage.tsx` |
| Join Team | `/join` | `pages/JoinTeamPage.tsx` |
| Messages | `/messages` | `pages/MessagesPage.tsx` |

### Auth Pages

| Page | Path | File |
|------|------|------|
| User Auth (Login/Register) | `/auth` | `pages/auth/UserAuthPage.tsx` |
| Dealer Login | `/dealer/login` | `pages/auth/DealerLoginPage.tsx` |
| Admin Login | `/admin/login` | `pages/auth/AdminLoginPage.tsx` |

### Product Catalog Pages

| Page | Path | File |
|------|------|------|
| All Categories | `/categories` | `pages/products/CategoriesPage.tsx` |
| Category Detail | `/categories/:slug` | `pages/products/CategoryDetailPage.tsx` |
| Product Type | `/products/:slug` | `pages/products/ProductTypePage.tsx` |
| Product Detail | `/products/:id/detail` | `pages/products/ProductDetailPage.tsx` |

### RFQ Pages (Authenticated: User)

| Page | Path | File |
|------|------|------|
| Create RFQ | `/rfq/create` | `pages/rfq/CreateRFQPage.tsx` |
| My RFQs | `/rfq` | `pages/rfq/MyRFQsPage.tsx` |
| RFQ Detail | `/rfq/:id` | `pages/rfq/RFQDetailPage.tsx` |

### Dealer Pages (Authenticated: Dealer)

| Page | Path | File |
|------|------|------|
| Dealer Dashboard | `/dealer` | `pages/dealer/DealerDashboard.tsx` |
| Dealer Profile | `/dealer/profile` | `pages/dealer/DealerProfilePage.tsx` |
| Dealer Onboarding | `/dealer/onboarding` | `pages/dealer/DealerOnboarding.tsx` |
| Registration Status | `/dealer/status` | `pages/dealer/DealerRegistrationStatus.tsx` |
| Available Inquiries | `/dealer/inquiries` | `pages/dealer/DealerAvailableInquiriesPage.tsx` |
| Submit Quote | `/dealer/quote/:id` | `pages/dealer/DealerQuoteSubmitPage.tsx` |
| My Quotes | `/dealer/quotes` | `pages/dealer/DealerQuotesPage.tsx` |
| Dealer RFQs | `/dealer/rfqs` | `pages/dealer/DealerRFQsPage.tsx` |

### Admin Pages (Authenticated: Admin)

| Page | Path | File |
|------|------|------|
| Admin Dashboard | `/admin` | `pages/admin/AdminDashboard.tsx` |
| Manage Dealers | `/admin/dealers` | `pages/admin/AdminDealersPage.tsx` |
| Manage Products | `/admin/products` | `pages/admin/AdminProductsPage.tsx` |
| Manage Inquiries | `/admin/inquiries` | `pages/admin/AdminInquiriesPage.tsx` |
| Inquiry Pipeline | `/admin/pipeline` | `pages/admin/AdminInquiryPipelinePage.tsx` |
| CRM | `/admin/crm` | `pages/admin/AdminCRMPage.tsx` |
| RFQ Management | `/admin/rfqs` | `pages/admin/AdminRFQsPage.tsx` |
| Brand-Dealer Mapping | `/admin/brand-dealers` | `pages/admin/AdminBrandDealersPage.tsx` |
| Fraud Flags | `/admin/fraud` | `pages/admin/AdminFraudPage.tsx` |
| Chat Sessions | `/admin/chats` | `pages/admin/AdminChatsPage.tsx` |
| Scraper Dashboard | `/admin/scraper` | `pages/admin/AdminScraperPage.tsx` |
| Analytics | `/admin/analytics` | `pages/admin/AdminAnalyticsPage.tsx` |
| Professionals | `/admin/professionals` | `pages/admin/AdminProfessionalsPage.tsx` |
| Leads | `/admin/leads` | `pages/admin/AdminLeadsPage.tsx` |
| Settings | `/admin/settings` | `pages/admin/AdminSettingsPage.tsx` |

### Professional Pages

| Page | Path | File |
|------|------|------|
| Professional Profile | `/professional` | `pages/professional/` |

### Community Pages

| Page | Path | File |
|------|------|------|
| Community Feed | `/community` | `pages/community/` |

---

# §5 — Complete Feature Catalog

> Every feature that ships in production. No future phases. No roadmaps. Everything below is live.

---

## 5.1 Feature Index

| # | Feature | Category | Primary Users |
|---|---------|----------|---------------|
| F-01 | User Authentication (OTP + Google OAuth) | Auth | All |
| F-02 | Dealer Authentication (Email/Password) | Auth | Dealers |
| F-03 | Admin Authentication (Email/Password) | Auth | Admin |
| F-04 | Refresh Token Rotation | Auth | All |
| F-05 | Product Catalog (4-Level Taxonomy) | Catalog | All |
| F-06 | Product Search & Filtering | Catalog | All |
| F-07 | Product Save/Unsave (Wishlist) | Catalog | Users |
| F-08 | Product Inquiry Submission | Procurement | Anyone |
| F-09 | Inquiry Tracking (Public) | Procurement | Anyone |
| F-10 | RFQ Creation with AI Suggestions | Procurement | Users |
| F-11 | RFQ Publishing & Dealer Matching | Procurement | Users |
| F-12 | Quote Submission by Dealers | Procurement | Dealers |
| F-13 | Quote Evaluation & Selection | Procurement | Users |
| F-14 | Dealer Onboarding & KYC | Dealer Mgmt | Dealers |
| F-15 | Dealer Profile Management | Dealer Mgmt | Dealers |
| F-16 | Dealer Document Upload | Dealer Mgmt | Dealers |
| F-17 | Dealer Brand/Category/Area Mappings | Dealer Mgmt | Dealers |
| F-18 | Dealer Available Inquiries Feed | Dealer Mgmt | Dealers |
| F-19 | Dealer Quote Analytics | Dealer Mgmt | Dealers |
| F-20 | Volt AI Chat (Streaming) | AI | All |
| F-21 | Volt AI Tool Calling (5 Tools) | AI | All |
| F-22 | Smart Slip Scanner (Vision AI) | AI | Anyone |
| F-23 | AI-Powered Admin Insights | AI | Admin |
| F-24 | AI Dealer Performance Analysis | AI | Admin |
| F-25 | AI RFQ Suggestions | AI | Users |
| F-26 | Dealer Quote Parsing (NLP) | AI | Dealers |
| F-27 | Community Posts & Comments | Community | Users |
| F-28 | Post Upvoting | Community | Users |
| F-29 | Knowledge Base Articles | Content | All |
| F-30 | Contact Form with Auto-Reply | Contact | Anyone |
| F-31 | CRM Companies Management | CRM | Admin |
| F-32 | CRM Contacts Management | CRM | Admin |
| F-33 | CRM Outreach Tracking | CRM | Admin |
| F-34 | CRM Meeting Management | CRM | Admin |
| F-35 | CRM Email Templates | CRM | Admin |
| F-36 | CRM Pipeline Overview | CRM | Admin |
| F-37 | Inquiry Pipeline (Admin) | Admin Ops | Admin |
| F-38 | Admin Dealer Verification Workflow | Admin Ops | Admin |
| F-39 | Admin Catalog Management | Admin Ops | Admin |
| F-40 | Admin Dashboard & Stats | Admin Ops | Admin |
| F-41 | Admin Fraud Flag Management | Admin Ops | Admin |
| F-42 | Admin Professional Verification | Admin Ops | Admin |
| F-43 | Brand-Dealer Relationship Mapping | Admin Ops | Admin |
| F-44 | Product Scraping Engine | Data | Admin |
| F-45 | Scraped Product Processing | Data | Admin |
| F-46 | Push Notifications (Mobile) | Notifications | All |
| F-47 | Professional Profile & Onboarding | Professional | Professionals |
| F-48 | Database Diagnostics Dashboard | Admin Ops | Admin |
| F-49 | Email Notification System | Notifications | All |

---

## 5.2 Detailed Feature Specifications

### F-01: User Authentication (OTP + Google OAuth)

**Description**: Users authenticate via phone OTP (primary) or Google OAuth. No passwords for users.

**User Stories**:
- As a homeowner, I want to sign in with my phone number so I can get personalized quotes without creating a password.
- As a user, I want to sign in with Google so I can authenticate instantly.

**Acceptance Criteria**:
- Given a valid 10-digit Indian phone number, when OTP is requested, then a 6-digit OTP is sent via SMS and stored with 10-minute expiry
- Given a valid OTP, when verified within 10 minutes and under 3 attempts, then a JWT (7-day expiry) and refresh token are issued
- Given an expired OTP, when verification is attempted, then a 400 error with "OTP expired" is returned
- Given Google OAuth callback, when profile is incomplete (no phone/city/role), then user is redirected to profile completion

**API Endpoints**:
- `POST /api/auth/otp/send` — Send OTP to phone
- `POST /api/auth/otp/verify` — Verify OTP, issue tokens
- `POST /api/auth/signup` — Complete registration (name, phone, city, role)
- `GET /api/auth/google` — Initiate Google OAuth
- `GET /api/auth/google/callback` — Handle OAuth callback
- `POST /api/auth/complete-profile` — Complete profile after OAuth

**Rate Limiting**: `otpLimiter` (5 requests / 15 min), `loginLimiter` (10 / 15 min)

**Security**: OTP stored hashed with bcrypt. Max 3 verification attempts per OTP. Phone number validated as 10-digit numeric string.

---

### F-02: Dealer Authentication (Email/Password)

**Description**: Dealers register and authenticate with email/password. Separate authentication flow from users.

**Acceptance Criteria**:
- Given valid email/password, when dealer registers, then password is hashed with bcrypt (12 rounds) and a verification-pending dealer record is created
- Given valid credentials, when dealer logs in, then JWT (7-day expiry) is issued with dealer claims
- Given invalid password, when login fails 10 times within 15 minutes, then IP is rate-limited

**API Endpoints**:
- `POST /api/auth/dealer/register` — Register new dealer
- `POST /api/auth/dealer/login` — Dealer login
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password with token

**Rate Limiting**: `credentialLoginLimiter` (10 / 15 min, skips successful), `passwordResetLimiter` (3 / hour)

---

### F-03: Admin Authentication (Email/Password)

**Description**: Admin login with email/password. No self-registration — admin accounts are pre-created.

**API Endpoints**:
- `POST /api/auth/admin/login` — Admin login (24-hour JWT expiry)

**Rate Limiting**: `credentialLoginLimiter` (10 / 15 min)

---

### F-04: Refresh Token Rotation

**Description**: Long-lived refresh tokens enable persistent sessions (especially mobile). Each refresh rotates the token pair, invalidating the old refresh token.

**Acceptance Criteria**:
- Given a valid refresh token, when `/api/auth/refresh` is called, then a new JWT + new refresh token are returned and old refresh token is invalidated
- Given a revoked/expired refresh token, when refresh is attempted, then 401 is returned
- Expired tokens are automatically cleaned up every 6 hours via `setInterval` in `index.ts`

**API Endpoints**:
- `POST /api/auth/refresh` — Rotate tokens
- `POST /api/auth/logout` — Invalidate refresh token

**Rate Limiting**: `refreshLimiter` (20 / hour)

---

### F-05: Product Catalog (4-Level Taxonomy)

**Description**: Structured product catalog with 4-level hierarchy: Category -> SubCategory -> ProductType -> Product.

**Taxonomy Example**:
```
Wires & Cables (Category)
  -> House Wiring (SubCategory)
       -> FRLS 1.5 sq mm (ProductType)
            -> Havells Lifeline Plus FRLS 1.5 sq mm 90m (Product)
```

**API Endpoints**:
- `GET /api/products/categories` — List all categories with subcategories
- `GET /api/products/categories/:slug/subcategories` — Subcategories for a category
- `GET /api/products/subcategories/:slug/product-types` — Product types in subcategory
- `GET /api/products/product-types/:slug` — Products of a type (with brand, specs)
- `GET /api/products/:id` — Single product detail
- `GET /api/products/brands` — All brands with product counts

---

### F-06: Product Search & Filtering

**Description**: Full-text search across product name, model number, brand name. Supports filtering by brand and category.

**API Endpoints**:
- `GET /api/products/search?q=havells+mcb&brand=Havells&category=electrical` — Search with filters

**Implementation**: Prisma `contains` with `mode: 'insensitive'` on `name`, `modelNumber`, and `description` fields.

---

### F-07: Product Save/Unsave (Wishlist)

**Description**: Authenticated users can save products to their wishlist.

**API Endpoints**:
- `POST /api/products/:id/save` — Save product (toggle: saves if unsaved, unsaves if saved)
- `GET /api/products/saved` — List saved products

---

### F-08: Product Inquiry Submission

**Description**: Anyone (authenticated or not) can submit a product inquiry. Supports photo upload. Auto-generates inquiry number (format: `HUB-{TAG}-{SEQ}`).

**Inquiry Number Example**: `HUB-HAVELLS-MCB-0042`

**API Endpoints**:
- `POST /api/inquiry` — Submit inquiry (multipart: name, phone, email, modelNumber, quantity, deliveryCity, notes, photo)
- `GET /api/inquiry/track?phone=9876543210&inquiryNumber=HUB-MCB-0001` — Public tracking

**Rate Limiting**: `inquiryLimiter` (10 / hour)

---

### F-09: Inquiry Tracking (Public)

**Description**: Anyone can track inquiry status using their phone number or inquiry number. No authentication required.

**Status Flow**: `new` -> `contacted` -> `quoted` -> `closed`

---

### F-10: RFQ Creation with AI Suggestions

**Description**: Authenticated users create Request for Quotations. On creation, Claude AI (Haiku) analyzes the items and generates suggestions for missing items, quantity warnings, complementary products, and budget estimates.

**API Endpoints**:
- `POST /api/rfq` — Create RFQ (title, description, items[], deliveryCity, deliveryPincode, deliveryPreference, urgency)

**AI Integration**: `getAISuggestions()` in `ai.service.ts` calls `claude-haiku-4-5-20251001` with product context to generate JSON suggestions stored in `rfq.aiSuggestions`.

**Zod Validation**:
```typescript
{
  title: z.string().min(5),
  deliveryCity: z.string().min(2),
  deliveryPincode: z.string().length(6),
  deliveryPreference: z.enum(['delivery', 'pickup', 'both']),
  urgency: z.enum(['normal', 'urgent']).optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
  })).min(1),
}
```

---

### F-11: RFQ Publishing & Dealer Matching

**Description**: When an RFQ is published, the system automatically matches it with qualified dealers based on their brand mappings, category mappings, and service areas (pincode overlap).

**Matching Algorithm** (in `dealer-matching.service.ts`):
1. Find dealers whose `serviceAreas` include the RFQ's delivery pincode
2. Filter to dealers whose `brandMappings` include brands in the RFQ items
3. Filter to dealers whose `categoryMappings` include categories of the RFQ items
4. Each matched dealer's `totalRFQsReceived` counter is incremented

**API Endpoints**:
- `POST /api/rfq/:id/publish` — Publish RFQ, trigger matching

---

### F-12: Quote Submission by Dealers

**Description**: Dealers submit sealed quotes for RFQs they have been matched with. One quote per RFQ per dealer (enforced by unique constraint check).

**API Endpoints**:
- `GET /api/quotes/available-rfqs` — RFQs matched to this dealer (not yet quoted)
- `POST /api/quotes/submit` — Submit quote with line items

**Business Rules**:
- Dealer can only see RFQs matching their brands + categories + service areas
- Dealer cannot see other dealers' quotes (blind bidding)
- Quote items must match RFQ items (product IDs validated)
- RFQ status transitions to `QUOTES_RECEIVED` on first quote

---

### F-13: Quote Evaluation & Selection

**Description**: Buyer reviews quotes ranked by total amount. Selecting a quote triggers a database transaction that updates the RFQ status, marks the winning quote, rejects all others with loss analysis, and updates dealer conversion metrics.

**Loss Analysis Logic**:
- If rejected quote `totalAmount > selectedQuote.totalAmount` -> `lossReason: 'price'`
- If rejected quote `deliveryDate > selectedQuote.deliveryDate` -> `lossReason: 'timing'`
- Otherwise -> `lossReason: 'other'`
- Each rejected quote gets a `rankPosition` (2, 3, 4...) based on price sort

**API Endpoints**:
- `POST /api/rfq/:id/select-quote` — Select winning quote (body: `{ quoteId }`)
- `POST /api/rfq/:id/cancel` — Cancel RFQ

---

### F-14 to F-19: Dealer Management Suite

**F-14: Dealer Onboarding & KYC**
- Multi-step onboarding: business info -> document upload (GST, PAN, trade license) -> area/brand mapping
- Status progression: `PENDING_VERIFICATION` -> `DOCUMENTS_PENDING` -> `UNDER_REVIEW` -> `VERIFIED`
- Auto-transition to `UNDER_REVIEW` when both GST and PAN documents are uploaded

**F-15: Dealer Profile Management**
- `GET /api/dealer/profile` — Get dealer profile with brand/category mappings, service areas, documents
- `PUT /api/dealer/profile` — Update business info (businessName, phone, city, pincode, address, gstNumber, description)

**F-16: Dealer Document Upload**
- `POST /api/dealer/documents` — Upload document (Multer: 10MB limit, images + PDF)
- `DELETE /api/dealer/documents/:id` — Delete uploaded document

**F-17: Dealer Brand/Category/Area Mappings**
- `POST /api/dealer/brands` — Add brand mapping (array of brandIds)
- `POST /api/dealer/categories` — Add category mapping (array of categoryIds)
- `POST /api/dealer/service-areas` — Add service areas (array of pincodes)

**F-18: Dealer Available Inquiries Feed**
- `GET /api/dealer-inquiry/available` — Inquiries matching dealer's brands/categories/areas, not yet viewed/quoted
- `GET /api/dealer-inquiry/:id` — View inquiry detail (auto-marks as viewed)
- `POST /api/dealer-inquiry/:id/quote` — Submit quote for inquiry

**F-19: Dealer Quote Analytics**
- `GET /api/quotes/analytics` — Conversion rate, loss reasons, status breakdown, average quote amount
- `GET /api/dealer/ai-insights` — AI-powered performance analysis

---

### F-20 & F-21: Volt AI Chat System

**F-20: Volt AI Chat (Streaming)**
- Real-time streaming chat powered by Claude Sonnet via Server-Sent Events (SSE)
- Session-based conversation with persistent history (ChatSession + ChatMessage models)
- Context-aware: user info injected into system prompt for logged-in users
- Dealer mode: detects dealer context, helps compose professional quotes
- Language lock: detects first message language (Hindi/English/Hinglish) and maintains it throughout

**SSE Event Types**:
```
event: text          data: {"text": "partial response..."}
event: tool_start    data: {"tool": "search_products", "label": "Searching products..."}
event: tool_done     data: {"tool": "search_products", "result": {...}}
event: done          data: {}
event: error         data: {"error": "Connection interrupted"}
```

**API Endpoints**:
- `POST /api/chat/session` — Create new chat session
- `POST /api/chat/session/:sessionId/message` — Send message (non-streaming fallback)
- `POST /api/chat/session/:sessionId/stream` — Send message (SSE streaming)
- `GET /api/chat/session/:sessionId/messages` — Get message history
- `GET /api/chat/sessions` — List user's chat sessions

**F-21: Volt AI Tool Calling (5 Tools)**

| Tool | Description | Required Params |
|------|-------------|-----------------|
| `submit_inquiry` | Create product inquiry on user's behalf | name, phone, modelNumber, deliveryCity |
| `search_products` | Search product catalog | query |
| `compare_products` | Compare products/brands | items[] |
| `generate_dealer_quote` | Structure dealer's natural language into formal quote | raw_input |
| `track_inquiry` | Look up inquiry status | inquiry_number or phone |

**Implementation**: Agentic loop with max 5 iterations. If `stop_reason === 'tool_use'`, execute tool, append result, re-prompt until `stop_reason === 'end_turn'`.

---

### F-22: Smart Slip Scanner (Vision AI)

**Description**: Upload a photo of a contractor slip, product packaging, or material list. Claude Vision AI extracts product names, quantities, brands, and model numbers.

**Flow**:
1. User uploads image or PDF via `POST /api/slip-scanner/parse`
2. If PDF: extract text with `pdf-parse`, then parse with Claude
3. If image: send base64 to Claude Vision API with specialized system prompt
4. AI returns structured JSON with items, confidence scores, and warnings
5. For items without brand, `getBrandSuggestions()` provides top 5 recommendations
6. User reviews/edits extracted items, then bulk-creates inquiries

**API Endpoints**:
- `POST /api/slip-scanner/parse` — Upload and parse (Multer: 20MB, images + PDF)
- `GET /api/slip-scanner/brand-suggestions?productName=xxx` — Get brand suggestions
- `POST /api/slip-scanner/create-inquiries` — Bulk create inquiries from parsed data

---

### F-23: AI-Powered Admin Insights

**Description**: Admin dashboard receives AI-generated actionable insights based on real-time platform data.

**Insight Types**: `hot_lead`, `demand_trend`, `dealer_tip`, `city_activity`, `action_needed`

**Implementation**: `generateAdminInsights()` sends platform metrics to `claude-haiku-4-5-20251001`, receives JSON array of 4-5 prioritized insights.

---

### F-24: AI Dealer Performance Analysis

**Description**: AI analyzes a dealer's quote history, conversion rate, loss reasons, and rank positions to generate actionable improvement tips.

**API Endpoint**: `GET /api/dealer/ai-insights` (via `analyzeDealerPerformance()`)

---

### F-25: AI RFQ Suggestions

**Description**: When a user creates an RFQ, AI suggests missing items, quantity warnings, complementary products, and estimated budget ranges.

**Model**: `claude-haiku-4-5-20251001`, max 512 tokens.

---

### F-26: Dealer Quote Parsing (NLP)

**Description**: Dealers can describe their offer in natural language (Hindi or English), and the system extracts structured quote fields using Claude's tool-calling capability with forced tool choice.

**API Endpoint**: `POST /api/chat/parse-quote` — Parse natural language into structured quote

---

### F-27 to F-29: Community & Knowledge

**F-27: Community Posts**
- Create/list/view posts with title, content, optional images
- Threaded comments (parent-child with `parentId`)
- Post status: `PUBLISHED`, `HIDDEN`, `DELETED`

**F-28: Post Upvoting**
- Toggle upvote on posts (add if not upvoted, remove if already upvoted)
- `upvoteCount` maintained on post model

**F-29: Knowledge Base**
- Articles organized by categories
- Auto-increment view count on article detail view
- Published/draft status management

**API Endpoints**:
- `GET /api/community/posts` — List posts (paginated)
- `GET /api/community/posts/:id` — Post detail with comments
- `POST /api/community/posts` — Create post
- `POST /api/community/posts/:id/comments` — Add comment
- `POST /api/community/posts/:id/upvote` — Toggle upvote
- `GET /api/knowledge/articles` — List articles
- `GET /api/knowledge/articles/:id` — Article detail
- `GET /api/knowledge/categories` — Article categories

---

### F-30: Contact Form with Auto-Reply

**Description**: Public contact form that creates a submission record and sends an automated email response via Resend.

**API Endpoints**:
- `POST /api/contact` — Submit contact form (auto-reply email triggered)
- `GET /api/contact/admin/submissions` — Admin: list submissions
- `GET /api/contact/admin/submissions/:id` — Admin: view submission
- `PUT /api/contact/admin/submissions/:id` — Admin: update status/notes
- `DELETE /api/contact/admin/submissions/:id` — Admin: delete
- `GET /api/contact/admin/stats` — Admin: submission statistics

---

### F-31 to F-36: CRM System

Full B2B CRM for tracking manufacturers, distributors, and dealers as potential partners.

**F-31: CRM Companies** — CRUD + bulk CSV import. Fields: name, type (Manufacturer/Distributor/Dealer/Brand/Other), segment (Premium/Mid-Range/Budget/All), website, city, contactEmail, contactPhone, notes, isActive.

**F-32: CRM Contacts** — CRUD linked to companies. Fields: name, email, phone, role, linkedinUrl, notes.

**F-33: CRM Outreach** — Track emails, calls, meetings, WhatsApp messages. Status flow: Scheduled -> Sent -> Delivered -> Opened -> Replied -> Meeting_Scheduled / Not_Interested / Bounced / Failed.

**F-34: CRM Meetings** — Schedule and track meetings with completion status, notes, follow-up dates.

**F-35: CRM Email Templates** — Pre-built email templates for outreach. Fields: name, subject, body, category.

**F-36: CRM Pipeline Overview** — Aggregated stats: companies by segment, outreach by status, meetings scheduled, conversion pipeline.

**API Base**: `/api/crm/*` (24 endpoints, all admin-authenticated)

---

### F-37: Inquiry Pipeline (Admin)

**Description**: Admin workflow for sourcing dealer quotes for customer inquiries. Create pipeline -> auto-match dealers -> add manual dealers -> track quotes -> send best quote to customer.

**Status Flow**: `BRAND_IDENTIFIED` -> `DEALERS_CONTACTED` -> `QUOTES_RECEIVED` -> `BEST_PRICE_FOUND` -> `SENT_TO_CUSTOMER` -> `DEAL_CLOSED` / `DEAL_LOST`

**API Endpoints**:
- `POST /api/inquiry-pipeline` — Create pipeline for inquiry
- `GET /api/inquiry-pipeline/:inquiryId` — Get pipeline with dealers/quotes
- `POST /api/inquiry-pipeline/:id/auto-match` — Auto-match dealers
- `POST /api/inquiry-pipeline/:id/dealers` — Add dealer manually
- `PUT /api/inquiry-pipeline/:id/dealers/:dealerId/quote` — Update dealer's quote
- `DELETE /api/inquiry-pipeline/:id/dealers/:dealerId` — Remove dealer
- `POST /api/inquiry-pipeline/:id/send-to-customer` — Send best quote

---

### F-38 to F-43: Admin Operations

**F-38: Admin Dealer Verification**
- `GET /api/admin/dealers` — List dealers with filters (status, search)
- `GET /api/admin/dealers/:id` — Dealer detail with documents, mappings
- `PATCH /api/admin/dealers/:id/status` — Verify/reject/suspend dealer (creates AuditLog)

**F-39: Admin Catalog Management**
- `POST /api/admin/categories` — Create category
- `POST /api/admin/brands` — Create brand (with logo upload)
- `POST /api/admin/products` — Create product

**F-40: Admin Dashboard & Stats**
- `GET /api/admin/stats` — Platform-wide metrics (user count, dealer count, inquiry count, RFQ count, etc.)
- `GET /api/admin/ai-insights` — AI-generated insights from platform data

**F-41: Admin Fraud Flags**
- `GET /api/admin/fraud-flags` — List fraud flags with details
- `PATCH /api/admin/fraud-flags/:id` — Resolve fraud flag

**F-42: Admin Professional Verification**
- `GET /api/admin/professionals` — List professionals with verification status
- `PATCH /api/admin/professionals/:id/verify` — Verify/reject professional

**F-43: Brand-Dealer Relationship Mapping**
- `GET /api/brand-dealers` — List brand-dealer mappings
- `GET /api/brand-dealers/brands-summary` — Brands with dealer counts
- `POST /api/brand-dealers` — Create mapping
- `PUT /api/brand-dealers/:id` — Update mapping
- `DELETE /api/brand-dealers/:id` — Soft-delete mapping

---

### F-44 & F-45: Product Scraping Engine

**F-44: Scraping System**
- Configurable per-brand scrapers defined in `brands.config.ts`
- Async job execution: start scrape -> run in background -> log results
- Job lifecycle: create ScrapeJob -> status IN_PROGRESS -> COMPLETED/FAILED
- Stores raw product data (name, model, price, specs, images, datasheets)

**F-45: Scraped Product Processing**
- Review raw scraped products
- Normalize and map to catalog taxonomy (category -> subcategory -> productType -> product)
- `POST /api/scraper/products/:id/process` — Create real product from scraped data

**API Endpoints**:
- `GET /api/scraper/brands` — Configured brands with scrape stats
- `GET /api/scraper/stats` — Overall scraping statistics
- `GET /api/scraper/jobs` — Recent scrape jobs (paginated)
- `GET /api/scraper/jobs/:id` — Job detail with logs
- `POST /api/scraper/scrape/:brandSlug` — Start scrape for brand (async)
- `POST /api/scraper/scrape-all` — Start scrape for all brands (async)
- `GET /api/scraper/products` — List scraped products (paginated, filterable)
- `GET /api/scraper/products/:id` — Scraped product detail
- `POST /api/scraper/products/:id/process` — Process into catalog
- `DELETE /api/scraper/products/:id` — Delete scraped product

---

### F-46: Push Notifications (Mobile)

**Description**: Expo Push Token registration for React Native mobile app. Notifications stored in database and sent via Expo Push API.

**API Endpoints**:
- `POST /api/notifications/push-token` — Register push token
- `DELETE /api/notifications/push-token` — Deregister
- `GET /api/notifications` — List notifications (paginated)
- `PATCH /api/notifications/:id/read` — Mark as read

---

### F-47: Professional Profile & Onboarding

**Description**: Electricians, contractors, architects, and interior designers can create verified professional profiles with portfolio, certifications, and documents.

**API Endpoints**:
- `GET /api/professional/profile` — Get professional profile
- `POST /api/professional/onboard` — Submit onboarding (multipart: specialization, experience, certifications, portfolio images)
- `POST /api/professional/portfolio` — Upload portfolio images
- `DELETE /api/professional/documents/:id` — Delete document
- `PUT /api/professional/profile` — Update profile fields

---

### F-48: Database Diagnostics Dashboard

**Description**: Admin-only diagnostic endpoints showing table-level data counts and samples for debugging.

**API Endpoints** (12 total under `/api/database/`):
- `GET /api/database/overview` — All table counts
- `GET /api/database/users` — User records sample
- `GET /api/database/dealers` — Dealer records sample
- `GET /api/database/products` — Product records sample
- `GET /api/database/inquiries` — Inquiry records sample
- `GET /api/database/rfqs` — RFQ records sample
- `GET /api/database/quotes` — Quote records sample
- `GET /api/database/activities` — Activity records sample
- `GET /api/database/contacts` — Contact records sample
- `GET /api/database/chat-sessions` — Chat session records sample
- `GET /api/database/categories` — Category records sample
- `GET /api/database/brands` — Brand records sample

---

### F-49: Email Notification System

**Description**: Transactional email sending via Resend API. Used for: contact form auto-replies, inquiry confirmations, dealer verification status updates, password reset links.

**Implementation**: `email.service.ts` wraps Resend SDK. Sends from `shreshth.agarwal@hub4estate.com` (configurable via `NOTIFICATION_EMAIL` env var).
