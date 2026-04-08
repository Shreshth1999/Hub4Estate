# Hub4Estate Definitive PRD v2 -- Sections 11 & 12

> **Document**: section-11-12-features-journeys.md
> **Version**: 2.1.0
> **Date**: 2026-04-08
> **Author**: CTO Office, Hub4Estate
> **Status**: Authoritative Reference
> **Classification**: Internal -- Engineering
> **Prerequisite Reading**: Sections 01 through 10

---

# SECTION 11 -- COMPLETE FEATURE SPECIFICATIONS

Every feature below is production-scoped. Each entry includes: Feature ID, name, user stories, acceptance criteria, UI flow, business rules, edge cases, and performance targets. Feature IDs follow a domain-series convention: Buyer (F-100s), Dealer (F-200s), Admin (F-300s), Communication (F-400s), AI (F-500s), Payment (F-600s), Community (F-700s).

**Blind Matching is a cross-cutting concern** that touches F-104, F-106, F-203, F-204. The four non-negotiable rules:

1. Dealers receive product requirements ONLY -- zero buyer identity data.
2. Buyers see price, delivery, dealer metrics -- zero dealer identity data.
3. Identity is revealed ONLY after buyer selects the winning quote.
4. Losing dealers receive anonymized market data (percentile rank, winning price range).

---

## 11.1 BUYER DOMAIN (F-100 Series)

---

### F-101: Buyer Registration & Onboarding

**One-liner**: Google OAuth + Phone OTP sign-up with progressive profile completion that unlocks features incrementally.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-101-1 | First-time visitor | Sign up with my Google account in one tap | I avoid filling a registration form |
| US-101-2 | Returning visitor | Sign up with my phone number via OTP | I can register even without a Google account |
| US-101-3 | New user | Complete my profile progressively over multiple sessions | I am not blocked from exploring the catalog immediately |
| US-101-4 | New user | See a guided onboarding tour on first login | I understand what Hub4Estate offers and how to use it |
| US-101-5 | Registered user | Add my delivery address(es) later | I only provide details when I actually need to place an order |
| US-101-6 | Business buyer | Add my GST number for tax invoicing | I receive GST-compliant invoices on my orders |

#### Acceptance Criteria

```
GIVEN a visitor on the registration page
WHEN they tap "Continue with Google"
THEN Google OAuth consent screen opens
AND on success, a user record is created with email, name, avatar from Google
AND they are redirected to the onboarding flow (Step 1: phone verification)
AND a JWT access token (15 min) + refresh token (30 days) are issued

GIVEN a visitor choosing phone registration
WHEN they enter a valid Indian mobile number (+91 XXXXXXXXXX)
THEN an OTP is sent via MSG91 (6-digit, expires in 5 minutes)
AND they have 3 attempts before a 15-minute cooldown
AND on correct OTP entry, a user record is created
AND they proceed to name/email collection (Step 2)

GIVEN a newly registered user
WHEN they land on the dashboard for the first time
THEN they see a profile completion bar showing 30% (auth complete)
AND a non-blocking onboarding tour highlights: Search, Create Inquiry, My Dashboard
AND the tour can be skipped and replayed from Settings

GIVEN a user with 30% profile
WHEN they attempt to create an inquiry
THEN they are prompted to complete Step 3 (delivery address) inline
AND after adding address, profile jumps to 60%
AND inquiry creation proceeds without page reload

GIVEN a user with <100% profile
WHEN they visit Settings > Profile
THEN they see remaining steps: GST (optional), business type, preferences
AND completing all reaches 100% with a "Profile Complete" badge
```

#### UI Flow

| Step | Screen | URL | Key Components | Data |
|------|--------|-----|----------------|------|
| 1 | Landing/Auth Modal | `/` or `/auth` | `AuthModal` with Google button + phone input + OTP field | None (unauthenticated) |
| 2 | Phone Verification | `/onboarding/verify` | `OTPInput` (6-digit), resend timer (30s), attempt counter | `user.phone`, `otp_sessions` |
| 3 | Name & Email | `/onboarding/profile` | `TextInput` for name, email (pre-filled if Google), avatar upload | `user_profiles` |
| 4 | Delivery Address | `/onboarding/address` | `AddressForm` with Google Places autocomplete, pin code lookup | `addresses` |
| 5 | Preferences | `/onboarding/preferences` | Multi-select chips: categories of interest, buyer type (homeowner/contractor/business) | `user_preferences` |
| 6 | Dashboard | `/dashboard` | `ProfileCompletionBar`, `OnboardingTour` overlay, `QuickActions` | All user data |

#### Business Rules

- Profile completion is progressive: 30% (auth), 45% (name+email), 60% (address), 80% (preferences), 100% (GST or explicit skip).
- Users CAN browse catalog and search at 30%. Users MUST have 60% to create an inquiry. Users MUST have 80% to submit an order.
- Google OAuth extracts: `email`, `name`, `picture`. Phone auth starts with phone only.
- Duplicate detection: if a Google email matches an existing phone-registered account, merge accounts (prompt user to confirm).
- Referral code can be entered during onboarding (optional field on Step 3). Tracked in `referrals` table.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Google OAuth popup blocked | Show inline message: "Popup blocked. Please allow popups for this site." with fallback link. |
| OTP not received after 60s | Show "Resend OTP" button. After 3 resends, switch to voice call OTP. |
| User closes browser mid-onboarding | On next visit, resume at last incomplete step. Partial profile persisted. |
| Duplicate email (Google) + phone (OTP) | Prompt: "An account with this email already exists. Link accounts?" Merge on confirm. |
| Invalid/expired OTP | "Incorrect OTP. X attempts remaining." After 3 failures: 15-min cooldown with countdown. |
| Phone number already registered | "This number is already registered. Log in instead?" with login link. |

#### Performance

- OTP delivery: < 5 seconds (MSG91 SLA).
- Google OAuth round-trip: < 3 seconds.
- Profile save: < 500ms per step.
- Onboarding tour render: < 200ms.

---

### F-102: Product Discovery & Search

**One-liner**: Elasticsearch-powered product search with autocomplete, category filters, brand filters, price range, and instant results -- Amazon-grade search for construction materials.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-102-1 | Buyer | Type a product name and see instant suggestions | I find products without knowing exact catalog names |
| US-102-2 | Buyer | Filter search results by brand, price range, category | I narrow down to exactly what I need |
| US-102-3 | Buyer | See "trending searches" and "recently searched" | I discover popular products and resume past searches |
| US-102-4 | Buyer | Search by part number or model number | I find the exact SKU when I know the technical identifier |
| US-102-5 | Mobile user | Use voice search to find products | I can search hands-free on site |
| US-102-6 | Buyer | See search results with price range, brand, thumbnail | I can scan and decide quickly without opening each product |

#### Acceptance Criteria

```
GIVEN a user on any page with the search bar
WHEN they type 2+ characters
THEN autocomplete shows up to 8 suggestions within 200ms
AND suggestions include: product names, brand names, category names
AND each suggestion shows type icon (product/brand/category) and match highlight

GIVEN a user submitting a search query
WHEN results load
THEN products are displayed in a grid (desktop: 4 columns, tablet: 3, mobile: 2)
AND each card shows: thumbnail, product name, brand, price range (min-max from dealers), rating
AND results are paginated (24 per page, infinite scroll on mobile)
AND total result count is shown: "Showing 1-24 of 342 results for 'MCB 32A'"

GIVEN search results are displayed
WHEN the user opens the filter panel
THEN they see: Category tree (collapsible), Brand checkboxes, Price range slider, Rating filter, Availability toggle
AND applying any filter updates results without page reload (URL params update)
AND active filters show as removable chips above results

GIVEN a query with zero results
WHEN the results page renders
THEN show: "No products found for 'xyz'" with:
  - Spelling suggestions ("Did you mean: 'MCB'?")
  - Related categories
  - "Create an inquiry for this item" CTA (for unlisted products)

GIVEN a user on mobile
WHEN they tap the microphone icon in the search bar
THEN the browser's Web Speech API activates
AND recognized text populates the search bar
AND search fires automatically after 1.5s of silence
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Search Bar (global) | Any page | `SearchBar` with autocomplete dropdown, voice icon, recent searches |
| 2 | Search Results | `/search?q={query}&category={id}&brand={ids}&price_min={x}&price_max={y}` | `SearchResults` grid, `FilterPanel` sidebar/bottom-sheet, `SortDropdown`, `ActiveFilters` chips |
| 3 | No Results | `/search?q={query}` | `EmptySearchState` with suggestions, related categories, inquiry CTA |

#### Business Rules

- Search index syncs from PostgreSQL to Elasticsearch via a BullMQ job every 60 seconds (near real-time).
- Fuzzy matching tolerance: edit distance 2 for queries > 4 characters.
- Search ranking: relevance score (60%) + popularity (20%) + dealer availability (20%).
- Anonymous users CAN search and view results. Price ranges shown are indicative (MRP-based). Logged-in users see dealer price ranges.
- Search queries are logged to `search_history` for the user and `search_analytics` for the platform.
- Autocomplete index is a separate lightweight Elasticsearch index with product names, brands, categories, and synonyms.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Elasticsearch down | Fallback to PostgreSQL `ILIKE` search with degraded performance. Show banner: "Search may be slower than usual." |
| Query injection attempt | Elasticsearch query is parameterized. Special characters are escaped. No raw query interpolation. |
| Very broad query ("wire") | Show category disambiguation: "Did you mean: Electrical Wires, Binding Wire, Barbed Wire?" |
| Extremely long query (>200 chars) | Truncate to 200 chars. Log as potential abuse. |
| Voice search unsupported browser | Hide microphone icon. No error. |

#### Performance

- Autocomplete: < 150ms (p99).
- Search results (first page): < 300ms (p99).
- Filter application: < 200ms (client-side filtering if < 500 results, server round-trip otherwise).
- Index sync lag: < 60 seconds.

---

### F-103: Product Detail Page

**One-liner**: Comprehensive product page with specifications, price intelligence (MRP vs. market range), dealer availability, alternatives, and one-click "Add to Inquiry."

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-103-1 | Buyer | See full technical specifications for a product | I confirm it meets my project requirements |
| US-103-2 | Buyer | See the MRP vs. typical dealer price range | I understand the savings potential |
| US-103-3 | Buyer | See alternative/equivalent products from other brands | I can compare options before committing |
| US-103-4 | Buyer | Add this product directly to a new or existing inquiry | I start the procurement process instantly |
| US-103-5 | Buyer | See price history chart for this product | I know if now is a good time to buy |
| US-103-6 | Buyer | Read reviews from verified buyers | I trust the product quality before ordering |

#### Acceptance Criteria

```
GIVEN a user navigates to a product page
WHEN the page loads
THEN it displays:
  - Product images (carousel, zoom on hover/pinch)
  - Product name, brand, model number, category breadcrumb
  - Price section: MRP (struck through), Hub4Estate range (green, "₹X - ₹Y from N dealers")
  - Savings badge: "Save up to X%" (calculated from MRP vs. lowest dealer price)
  - Specifications table (key-value pairs from product_specifications)
  - "Add to Inquiry" button (primary CTA)
  - "Set Price Alert" button (secondary)
  - Reviews section (latest 5, "View All" link)
  - "Similar Products" carousel (same subcategory, different brands)
  - "Frequently Bought Together" section (association rules from order data)

GIVEN a user clicks "Add to Inquiry"
WHEN they have no active draft inquiry
THEN a new draft inquiry is created with this product (quantity: 1)
AND a bottom sheet slides up: "Added to inquiry. Set quantity? [1] [Continue Shopping] [Go to Inquiry]"

GIVEN a user clicks "Add to Inquiry"
WHEN they have an existing draft inquiry
THEN a modal shows: "Add to existing inquiry 'Draft #12' or create new?"
AND selecting existing adds the item; selecting new creates a fresh draft

GIVEN a user clicks "Price History"
WHEN the chart renders
THEN it shows a 90-day line chart of: MRP (flat line), average dealer price, lowest dealer price
AND the x-axis is date, y-axis is price in INR
AND hovering shows exact values per date
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Product Detail | `/products/{slug}` | `ProductImageCarousel`, `ProductInfo`, `PriceSection`, `SpecsTable`, `AddToInquiry`, `PriceHistoryChart`, `ReviewList`, `SimilarProducts`, `FrequentlyBoughtTogether` |
| 2 | Add to Inquiry Sheet | Bottom sheet overlay | `InquirySelector` (existing drafts), `QuantityInput`, action buttons |
| 3 | Price Alert Modal | Modal overlay | `PriceAlertForm`: target price input, notification channel preference |

#### Business Rules

- Price range is calculated from active dealer inventory prices. If no dealers stock it, show MRP only with "Request Quote" CTA instead of price range.
- Savings percentage: `((MRP - lowest_dealer_price) / MRP * 100)`. Only shown if > 5%.
- "Similar Products" algorithm: same `subcategory_id`, different `brand_id`, sorted by popularity. Max 8 items.
- "Frequently Bought Together": mined from `order_items` co-occurrence. Minimum 5 co-occurrences to surface. Max 4 items.
- Reviews are from verified purchases only (user must have a completed order containing this product).
- Price history data is aggregated daily from `product_price_history` table.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Product has no images | Show branded category placeholder image with brand logo overlay. |
| Product has no dealers | Show MRP, "Currently unavailable from dealers. Create an inquiry and we'll find it for you." with inquiry CTA. |
| Product discontinued | Banner: "This product has been discontinued. See alternatives:" followed by similar products. |
| Price history < 7 days | Show text "Price tracking started recently" instead of chart. |
| User not logged in, clicks Add to Inquiry | Auth modal opens. After auth, item is auto-added to a new draft. |

#### Performance

- Product page load (SSR): < 800ms.
- Image carousel first paint: < 500ms (lazy-load non-visible images).
- Price history chart render: < 400ms.
- Similar products fetch: < 300ms.

---

### F-104: Inquiry Creation

**One-liner**: Multi-item inquiry builder with draft auto-save, CSV bulk upload, templates for common project types, and smart suggestions -- this is where blind matching begins.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-104-1 | Buyer | Create an inquiry with multiple items in one go | I get quotes for my entire requirement, not product by product |
| US-104-2 | Buyer | Save a draft inquiry and come back later | I can build my requirement list over multiple sessions |
| US-104-3 | Buyer | Upload a CSV file with product names and quantities | I can convert my existing Excel BOQ into an inquiry instantly |
| US-104-4 | Buyer | Use a template for common projects (e.g., "3BHK Electrical") | I don't need to know every item -- the template guides me |
| US-104-5 | Buyer | Set delivery location, preferred timeline, and budget range | Dealers can factor logistics and urgency into their quotes |
| US-104-6 | Buyer | Add custom/unlisted items with text descriptions | I can request products not yet in the catalog |
| US-104-7 | Buyer | See a real-time cost estimate as I build the inquiry | I stay within budget before submitting |

#### Acceptance Criteria

```
GIVEN a buyer on the inquiry creation page
WHEN they start adding items
THEN each item row has: Product search (autocomplete), Quantity (number input), Unit (dropdown: pieces/meters/kg/box), Notes (optional text)
AND the product search matches against the catalog with instant suggestions
AND selecting a product auto-fills: brand, model, category, MRP, expected price range
AND a running total shows at the bottom: "Estimated cost: ₹X - ₹Y (based on market prices)"

GIVEN a buyer adds an unlisted item
WHEN they type a product name not in the catalog
THEN they see: "Not found in catalog. Add as custom item?"
AND clicking "Add as custom" opens fields: Item description, Approximate quantity, Category (dropdown), Reference image upload (optional)

GIVEN a buyer chooses CSV upload
WHEN they upload a valid CSV
THEN the system parses columns: product_name, quantity, unit, notes
AND for each row, attempts to match product_name to catalog (fuzzy matching)
AND shows a review screen: "12 items matched, 3 need review" with match confidence
AND "needs review" items show top 3 catalog suggestions for user to pick or mark as custom

GIVEN a buyer uses a template
WHEN they select "3BHK Electrical Wiring"
THEN the inquiry is pre-populated with standard items:
  - MCBs (various amperages), Distribution Board, Wire (various gauges), Switches, Sockets, LED lights, Fans, etc.
AND quantities are set to standard estimates (editable)
AND a note says: "Template quantities are estimates for a standard 3BHK. Adjust to your needs."

GIVEN a buyer completes the inquiry form
WHEN they click "Submit Inquiry"
THEN validation runs:
  - Minimum 1 item required
  - Each item must have quantity > 0
  - Delivery address must be set (or selected from saved addresses)
  - Timeline must be set (immediate / 1 week / 2 weeks / 1 month / flexible)
AND on success, inquiry status changes from DRAFT to PUBLISHED
AND the blind matching engine triggers (see F-106 for dealer side)
AND buyer sees confirmation: "Inquiry #INQ-XXXXX published. Dealers are being notified."

GIVEN a buyer is building an inquiry
WHEN they navigate away or close the browser
THEN the current state is auto-saved as DRAFT every 10 seconds
AND on return, they see: "You have a draft inquiry with X items. Continue?"
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Inquiry Builder | `/inquiries/new` or `/inquiries/{id}/edit` (for drafts) | `InquiryForm`, `ItemList`, `ItemRow` (product search + qty + unit + notes), `AddItemButton`, `CSVUpload`, `TemplateSelector` |
| 2 | CSV Review | Modal overlay | `CSVReviewTable` with match status, suggestion dropdowns, bulk approve/reject |
| 3 | Template Picker | Modal overlay | `TemplateCard` grid (3BHK Electrical, Shop Wiring, Factory Setup, etc.) with item count and description |
| 4 | Delivery & Timeline | Section below items | `AddressSelector` (saved addresses + new), `TimelineDropdown`, `BudgetRange` (optional min-max), `NotesTextarea` |
| 5 | Review & Submit | `/inquiries/{id}/review` | `InquiryReview` (all items summarized), estimated cost, delivery info, "Edit" links per section, "Submit" button |
| 6 | Confirmation | `/inquiries/{id}` | `InquiryConfirmation` with status badge, expected quote timeline, "Share via WhatsApp" option |

#### Business Rules

- Inquiry ID format: `INQ-{YYYYMM}-{5-digit-sequence}` (e.g., INQ-202604-00042).
- Inquiry lifecycle: `DRAFT` -> `PUBLISHED` -> `QUOTING` (dealers are quoting) -> `QUOTED` (deadline passed or max quotes received) -> `AWARDED` (buyer selected winner) -> `ORDERED` -> `COMPLETED` -> `CANCELLED` / `EXPIRED`.
- Auto-save interval: 10 seconds for drafts. Debounced -- only saves if changes detected.
- CSV format: `.csv` or `.xlsx`. Max 500 rows. Max file size 5MB.
- Templates are admin-managed (`inquiry_templates` table). Each template has a list of `template_items` with default products and quantities.
- Budget range is OPTIONAL and NOT shown to dealers. It is used internally for AI recommendations and smart matching.
- Custom items (not in catalog) are flagged for admin review. Dealers see them as free-text descriptions.
- Maximum items per inquiry: 100.
- A buyer can have at most 5 active (PUBLISHED/QUOTING) inquiries simultaneously (to prevent spam).
- Inquiry expiry: if no quotes received within 7 days, status changes to EXPIRED. Buyer is notified and can re-publish.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| CSV has duplicate product rows | Merge quantities with a confirmation prompt: "Wire 2.5mm appears twice. Combine to total of 500m?" |
| CSV has unrecognizable columns | Show column mapping UI: "Map your columns to: Product Name, Quantity, Unit, Notes" |
| Buyer submits inquiry in a city with 0 dealers | Show warning: "We have limited dealer coverage in {city}. Your inquiry will be shared with nearest available dealers. Expected response time may be longer." |
| Buyer deletes all items from a published inquiry | Prompt: "Remove all items? This will cancel the inquiry." On confirm, status -> CANCELLED, dealers notified. |
| Draft auto-save fails (network) | Silent retry 3 times. After 3 failures, show toast: "Changes not saved. Check your connection." Keep local state in memory. |
| Buyer modifies a PUBLISHED inquiry | Not allowed. They must cancel and create a new one. Show: "This inquiry is live. Cancel and create a new version?" |

#### Performance

- Item autocomplete in inquiry builder: < 150ms.
- CSV parsing (500 rows): < 3 seconds.
- Draft auto-save: < 200ms (debounced PATCH).
- Submit inquiry (validation + publish + dealer notification trigger): < 1 second.

---

### F-105: Inquiry Dashboard

**One-liner**: Central hub for all buyer inquiries with tab-based filtering, real-time quote count updates, and quick actions per inquiry.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-105-1 | Buyer | See all my inquiries in one place, organized by status | I track everything without searching |
| US-105-2 | Buyer | See how many quotes each inquiry has received in real-time | I know when to review and decide |
| US-105-3 | Buyer | Filter inquiries by status, date range, category | I find specific inquiries quickly |
| US-105-4 | Buyer | Duplicate a past inquiry | I reorder similar requirements without rebuilding from scratch |
| US-105-5 | Buyer | See a timeline of each inquiry's lifecycle | I understand where each inquiry stands |

#### Acceptance Criteria

```
GIVEN a buyer navigates to the inquiry dashboard
WHEN the page loads
THEN they see tabs: All | Active (Published+Quoting) | Quoted | Awarded | Completed | Expired/Cancelled
AND the Active tab is selected by default
AND each tab shows a count badge (e.g., "Active (3)")

GIVEN the Active tab is selected
WHEN inquiries are displayed
THEN each inquiry card shows:
  - Inquiry ID and title (auto-generated from first 2 items)
  - Item count ("5 items")
  - Created date and time remaining before expiry
  - Quote count with live update (Socket.io): "3 quotes received"
  - Status badge (color-coded)
  - Quick actions: "View Quotes" (if quoted), "Edit" (if draft), "Duplicate", "Cancel"

GIVEN a new quote arrives for an active inquiry
WHEN the buyer is on the dashboard
THEN the quote count increments in real-time without page refresh
AND a subtle pulse animation plays on the card
AND a toast notification appears: "New quote received for INQ-XXXXX"

GIVEN a buyer clicks "Duplicate" on a completed inquiry
WHEN the action triggers
THEN a new DRAFT inquiry is created with the same items (quantities reset to original)
AND the buyer is redirected to the inquiry editor to adjust before submitting
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Inquiry Dashboard | `/dashboard/inquiries` | `InquiryTabs`, `InquiryCard` list, `FilterBar` (date range, category), `SortDropdown` (newest, oldest, most quotes) |
| 2 | Inquiry Detail | `/inquiries/{id}` | `InquiryDetail`, `ItemList`, `QuoteList` (if any), `StatusTimeline`, `ActionButtons` |

#### Business Rules

- Real-time quote count updates via Socket.io room: `inquiry:{inquiry_id}`.
- Completed inquiries are archived after 90 days (moved to cold storage, still viewable but loaded from archive).
- Maximum 100 inquiries per page. Cursor-based pagination.
- Cancelled inquiries can be duplicated but not re-opened.
- Expired inquiries show a "Re-publish" button that creates a fresh inquiry with the same items.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Buyer has 0 inquiries | Empty state with illustration: "No inquiries yet. Start your first inquiry to get the best prices." CTA: "Create Inquiry". |
| Socket.io connection drops | Fallback to polling every 30 seconds. Reconnect with exponential backoff. |
| Inquiry expires while buyer is viewing it | Status updates in real-time. Action buttons change from "View Quotes" to "Re-publish". |

---

### F-106: Quote Comparison (Blind Phase)

**One-liner**: The heart of blind matching -- buyer sees anonymized quote cards ranked by Hub4Estate's algorithm, with side-by-side comparison, AI recommendations, and a savings calculator.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-106-1 | Buyer | See all quotes for my inquiry ranked by value | I quickly identify the best option |
| US-106-2 | Buyer | Compare 2-3 quotes side by side | I evaluate trade-offs between price, delivery, and reliability |
| US-106-3 | Buyer | See the AI's recommendation and reasoning | I have a data-backed suggestion to guide my decision |
| US-106-4 | Buyer | See how much I save vs. MRP and vs. average market price | I quantify the value Hub4Estate is providing |
| US-106-5 | Buyer | Select a winning quote and proceed to order | I finalize my procurement decision |
| US-106-6 | Buyer | NOT see any dealer identity information | I make decisions purely on merit (blind matching) |

#### Acceptance Criteria

```
GIVEN a buyer views quotes for an inquiry
WHEN quotes are available
THEN each quote is shown as an anonymous card:
  - Anonymous label: "Dealer A", "Dealer B", "Dealer C" (randomized, NOT alphabetical by dealer name)
  - Total price (bold, large)
  - Per-item price breakdown (expandable)
  - Delivery timeline: "X business days"
  - Dealer metrics: Rating (stars), Total orders fulfilled, On-time delivery %, Response time
  - Partial fulfillment flag (if dealer cannot supply all items)
AND quotes are sorted by Hub4Estate Score (composite: price 40%, delivery 25%, dealer rating 20%, fulfillment completeness 15%)
AND the top quote has a "Best Value" badge

GIVEN a buyer selects 2-3 quotes for comparison
WHEN they click "Compare Selected"
THEN a comparison table opens:
  | | Dealer A | Dealer B | Dealer C |
  |---|---------|---------|---------|
  | Total Price | ₹X | ₹Y | ₹Z |
  | Item 1: MCB 32A x50 | ₹P1 | ₹P2 | ₹P3 |
  | Delivery Days | D1 | D2 | D3 |
  | Dealer Rating | 4.5/5 | 4.2/5 | 4.8/5 |
  | On-time % | 95% | 88% | 97% |
  | Fulfillment | Full | Partial (8/10 items) | Full |
AND cells are color-coded: green (best), yellow (mid), red (worst) per row

GIVEN the AI recommendation is available
WHEN the buyer views the quotes
THEN a card at the top says:
  "Volt AI recommends Dealer B. Why: Best balance of price (5% above lowest) and reliability (97% on-time). 
   Dealer A is cheapest but has lower on-time delivery. Dealer C is most expensive with no significant quality advantage."
AND the recommendation is generated by Claude API with structured input (quote data + dealer history)

GIVEN a buyer clicks "Select This Quote" on a dealer card
WHEN the selection is confirmed
THEN:
  1. Inquiry status changes to AWARDED
  2. Winning dealer identity is revealed to the buyer (name, contact, GST number, address)
  3. Buyer identity is revealed to the winning dealer
  4. Losing dealers receive: "Your quote was not selected. You were ranked #X of Y. Winning price range: ₹A-₹B."
  5. An order is auto-created in PENDING_PAYMENT status
  6. Buyer is redirected to the checkout/payment page

GIVEN the savings calculator
WHEN buyer views it
THEN it shows:
  - "Your selected price: ₹X"
  - "MRP total: ₹Y" (sum of MRPs for all items at selected quantities)
  - "Average market price: ₹Z" (from price index data)
  - "You save: ₹(Y-X) (A% below MRP)" in green
  - "vs. market average: ₹(Z-X) (B% savings)" in green
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Quote List | `/inquiries/{id}/quotes` | `AIRecommendation` card, `QuoteCard` list (anonymous), `SavingsCalculator` sidebar, `CompareButton` |
| 2 | Comparison View | `/inquiries/{id}/compare?quotes={id1},{id2},{id3}` | `ComparisonTable`, color-coded cells, `SelectQuoteButton` per column |
| 3 | Selection Confirmation | Modal overlay | "You are selecting Dealer B's quote for ₹X. Dealer identity will be revealed. Proceed?" with confirm/cancel |
| 4 | Identity Reveal | `/inquiries/{id}/awarded` | `DealerRevealCard` (name, rating, contact, GST), `OrderSummary`, "Proceed to Payment" CTA |

#### Business Rules

- **BLIND MATCHING NON-NEGOTIABLE**: Zero dealer identity leakage before selection. Anonymous labels are randomly assigned per session (not deterministic).
- Hub4Estate Score formula: `(0.40 * price_score) + (0.25 * delivery_score) + (0.20 * rating_score) + (0.15 * fulfillment_score)`.
  - `price_score`: `1 - ((quote_price - min_price) / (max_price - min_price))`. Lowest price = 1.0.
  - `delivery_score`: `1 - ((delivery_days - min_days) / (max_days - min_days))`. Fastest = 1.0.
  - `rating_score`: `dealer_rating / 5.0`.
  - `fulfillment_score`: `items_quoted / total_items`.
- AI recommendation is generated async when 3+ quotes are received. Uses Claude API with structured tool calling.
- A buyer MUST select within 48 hours of the quoting deadline or the inquiry auto-expires.
- Once a quote is selected, the action is IRREVERSIBLE (to prevent gaming). Buyer can cancel the resulting order (with cancellation policy).
- Losing dealer notification includes anonymized rank and winning price RANGE (not exact price) -- ±5% fuzzy.
- Minimum quotes to show AI recommendation: 3. Below 3, show: "More quotes needed for AI analysis."

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Only 1 quote received | Show the quote with note: "Only 1 dealer quoted. You can wait for more or select this quote." No AI recommendation. |
| All quotes are partial fulfillment | Show warning: "No dealer can supply all items. Consider splitting your inquiry." Show fulfillment gap analysis. |
| Two quotes have identical prices | Rank by delivery time as tiebreaker. If still tied, rank by dealer rating. |
| Buyer selects, then wants to change | Not allowed after confirmation. Show: "Selection is final. If there's an issue, you can raise a dispute after ordering." |
| AI recommendation differs from cheapest | This is expected and by design. Show: "Cheapest isn't always best. Volt AI considers reliability and delivery." |
| Dealer withdraws quote before selection | Remove from list. Update rankings. Notify buyer: "A quote was withdrawn. Updated rankings available." |

#### Performance

- Quote list load: < 500ms.
- Comparison table render: < 300ms.
- AI recommendation generation: < 10 seconds (async, shown when ready).
- Identity reveal + order creation: < 2 seconds.

---

### F-107: Order Tracking

**One-liner**: Real-time order lifecycle tracking from placement through delivery with timeline visualization, delivery confirmation, and rating prompt.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-107-1 | Buyer | See the current status of my order on a visual timeline | I know exactly where my order stands |
| US-107-2 | Buyer | Receive notifications when order status changes | I stay informed without checking manually |
| US-107-3 | Buyer | Confirm delivery and rate the experience | I close the loop and help future buyers |
| US-107-4 | Buyer | Report issues with delivery (damage, wrong item, short quantity) | I initiate dispute resolution if needed |
| US-107-5 | Buyer | See estimated delivery date updated in real-time | I plan my project timeline accordingly |

#### Acceptance Criteria

```
GIVEN a buyer has a placed order
WHEN they view the order detail page
THEN a vertical timeline shows statuses:
  1. Order Placed (timestamp) -- green check
  2. Payment Confirmed (timestamp) -- green check (or pending if awaiting payment)
  3. Dealer Confirmed (timestamp or "Awaiting dealer confirmation")
  4. Dispatched (timestamp, tracking number if available)
  5. In Transit (estimated delivery date)
  6. Delivered (timestamp or estimated date)
  7. Completed (after buyer confirms)
AND the current step is highlighted with a pulsing indicator
AND each completed step shows its timestamp

GIVEN order status changes to DISPATCHED
WHEN the buyer views the order
THEN they see:
  - Tracking number (if logistics partner provides one)
  - "Track Shipment" link (opens logistics partner tracking page)
  - Estimated delivery date
  - Dealer contact information (already revealed post-selection)

GIVEN the order is marked DELIVERED
WHEN the buyer opens the order
THEN they see:
  - "Confirm Delivery" button (primary)
  - "Report Issue" button (secondary, red outline)
AND confirming delivery triggers:
  - Status -> COMPLETED
  - Escrow funds released to dealer (see F-602)
  - Rating prompt appears (1-5 stars + optional text review)
AND if buyer does not confirm within 72 hours, auto-confirmation triggers

GIVEN the buyer clicks "Report Issue"
WHEN the form opens
THEN they select issue type: Damaged, Wrong Item, Short Quantity, Not Delivered, Other
AND attach photos (up to 5, max 5MB each)
AND add description text
AND submitting creates a dispute (see F-306 for admin resolution)
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Order List | `/dashboard/orders` | `OrderCard` list with status badge, amount, date, quick actions |
| 2 | Order Detail | `/orders/{id}` | `OrderTimeline`, `OrderItems` list, `DealerInfo`, `TrackingInfo`, `ActionButtons` |
| 3 | Delivery Confirmation | Modal overlay | "Confirm you received all items?" with confirm/report issue buttons |
| 4 | Rating | Modal overlay post-confirmation | `StarRating` (1-5), `ReviewTextarea`, "Submit" |
| 5 | Issue Report | `/orders/{id}/dispute` | `IssueTypeSelector`, `PhotoUploader`, `DescriptionTextarea`, "Submit Report" |

#### Business Rules

- Order statuses: `PENDING_PAYMENT` -> `PAID` -> `DEALER_CONFIRMED` -> `DISPATCHED` -> `IN_TRANSIT` -> `DELIVERED` -> `COMPLETED`.
- Branch statuses: `CANCELLED` (by buyer before dispatch), `DISPUTED` (issue reported), `REFUNDED`.
- Auto-confirmation after 72 hours of DELIVERED status (unless dispute raised).
- Dealer must confirm order within 24 hours of payment. If not, escalate to admin.
- Real-time status updates via Socket.io room: `order:{order_id}`.
- Rating is mandatory for order completion (can be done up to 7 days after delivery; after that, auto-rates 5 stars).

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Dealer does not confirm within 24h | Auto-escalate to admin. Buyer notified: "Dealer has not confirmed. Our team is looking into it." |
| Tracking number not available (local delivery) | Show "Dealer will deliver directly. Contact dealer for updates." with dealer phone. |
| Buyer confirms but raises issue later | Allow dispute within 48 hours of confirmation. After that, disputes go through general support. |
| Partial delivery | Buyer marks items received. Remaining items stay in DISPATCHED. Escrow splits proportionally. |

---

### F-108: Project Management

**One-liner**: Track construction/renovation projects from planning to completion with BOQ generation, budget tracking, multiple inquiries per project, and team collaboration.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-108-1 | Buyer | Create a project (e.g., "3BHK Flat, Jayanagar") and attach all related inquiries | I see all procurement for one project in one place |
| US-108-2 | Buyer | Generate a BOQ for my project using AI | I know what materials I need before creating inquiries |
| US-108-3 | Buyer | Track budget vs. actual spending per project | I catch overruns before they become problems |
| US-108-4 | Buyer | Invite team members (contractor, architect) to collaborate on a project | We all see the same procurement status |
| US-108-5 | Buyer | See a Gantt-style timeline of material deliveries | I coordinate procurement with my construction schedule |

#### Acceptance Criteria

```
GIVEN a buyer creates a new project
WHEN they fill the project form
THEN they provide: Project name, Type (residential/commercial/renovation), Location, Estimated budget, Start date, Expected completion
AND the project is created with status PLANNING
AND they land on the project dashboard

GIVEN a project exists
WHEN the buyer views the project dashboard
THEN they see:
  - Budget overview: Total budget, Committed (in-progress orders), Spent (completed orders), Remaining
  - Inquiry list: all inquiries linked to this project with statuses
  - Delivery timeline: Gantt-style horizontal bars showing expected delivery dates for each order
  - Team members: avatars and roles
  - BOQ section: generated or uploaded BOQ with item-level status (ordered, pending, not started)

GIVEN a buyer clicks "Generate BOQ"
WHEN they provide project details (type, size in sq ft, rooms, special requirements)
THEN the AI (Volt) generates a Bill of Quantities with:
  - Material categories (wiring, switches, lighting, distribution)
  - Specific products (matched to catalog where possible)
  - Estimated quantities (based on project size and type)
  - Estimated costs (based on current market prices)
AND the buyer can edit, add, remove items
AND can convert any BOQ section into an inquiry with one click

GIVEN a buyer invites a team member
WHEN they enter the member's email or phone
THEN an invitation is sent (email/WhatsApp)
AND the invitee creates/logs into Hub4Estate and sees the shared project
AND team roles: Owner (full access), Manager (create inquiries, view all), Viewer (read-only)
```

#### Business Rules

- Projects are containers for inquiries. An inquiry can belong to only one project (or be standalone).
- BOQ generation uses Claude API with construction material knowledge base. See F-503 for detailed AI spec.
- Budget tracking is real-time: committed = sum of awarded but not yet paid orders; spent = sum of completed order payments.
- Maximum 10 team members per project (Free tier). 25 for Pro.
- Project statuses: `PLANNING` -> `PROCUREMENT` -> `IN_PROGRESS` -> `COMPLETED` -> `ARCHIVED`.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Project budget exceeded | Yellow warning at 80%, red alert at 100%. "Budget exceeded by ₹X. Review uncommitted inquiries?" |
| Team member removed while they have active inquiries | Inquiries remain but are transferred to project owner. Removed member loses access. |
| BOQ generates items not in catalog | Mark as "custom items" in the BOQ. These become custom inquiry items when converted. |

---

### F-109: Price Alerts

**One-liner**: Set target prices for products and get notified when a dealer offers at or below that price.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-109-1 | Buyer | Set a target price for a specific product | I'm notified when the price drops to my budget |
| US-109-2 | Buyer | See all my active price alerts in one place | I manage my watchlist easily |
| US-109-3 | Buyer | Get notified via push, email, and WhatsApp | I never miss a price drop |

#### Acceptance Criteria

```
GIVEN a buyer is on a product detail page
WHEN they click "Set Price Alert"
THEN a modal asks: Target price (INR), Notification channels (push, email, WhatsApp checkboxes)
AND the alert is saved to `price_alerts` table
AND a background job checks every 6 hours if any dealer price for this product <= target

GIVEN a dealer updates their price to <= the alert target
WHEN the price check job runs
THEN the buyer receives notifications on selected channels:
  "Price Alert: {Product Name} is now available at ₹{price} (your target: ₹{target}). View now."
AND the alert can be auto-deactivated (one-time) or kept active (persistent)
```

#### Business Rules

- Maximum 50 active price alerts per user.
- Price check frequency: every 6 hours (BullMQ recurring job).
- Alert deduplication: don't send the same alert more than once per 24 hours for the same product.
- Alerts expire after 90 days if not triggered. User is notified before expiry.

---

### F-110: Saved Items & Wishlists

**One-liner**: Save products and organize them into wishlists for future reference or inquiry creation.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-110-1 | Buyer | Save a product with one click (heart icon) | I bookmark it for later |
| US-110-2 | Buyer | Organize saved items into wishlists (e.g., "Kitchen Renovation", "Office Wiring") | I group items by project or purpose |
| US-110-3 | Buyer | Convert an entire wishlist into an inquiry | I go from planning to procurement in one click |

#### Acceptance Criteria

```
GIVEN a buyer clicks the heart icon on a product card or detail page
WHEN the product is saved
THEN the heart fills solid (red) and the item is added to "All Saved" list
AND a toast: "Saved. Add to a wishlist?" with quick-pick dropdown

GIVEN a buyer views their wishlists
WHEN they select a wishlist
THEN they see all products in that list with current prices, availability, and "Remove" option
AND a "Create Inquiry from Wishlist" button generates a draft inquiry with all items
```

#### Business Rules

- Default wishlist: "All Saved" (cannot be deleted).
- Custom wishlists: unlimited, user-named.
- Wishlists are private (not shareable in v1).
- Saved items show price change indicators since save date (up/down arrows).

---

### F-111: Buyer Analytics Dashboard

**One-liner**: Personal procurement analytics showing spending patterns, savings achieved, and procurement efficiency.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-111-1 | Buyer | See total amount saved through Hub4Estate | I quantify the platform's value to me |
| US-111-2 | Buyer | See spending breakdown by category and time period | I understand my procurement patterns |
| US-111-3 | Buyer | See inquiry-to-order conversion rate | I optimize my procurement process |

#### Acceptance Criteria

```
GIVEN a buyer opens their analytics dashboard
WHEN the page loads
THEN they see:
  - Total Spent (all time): ₹X
  - Total Saved vs. MRP: ₹Y (Z%)
  - Active Inquiries: N
  - Average quotes per inquiry: M
  - Spending chart: bar chart by month (last 12 months)
  - Category breakdown: donut chart (wires, switches, MCBs, etc.)
  - Top dealers: list of dealers they've ordered from most (post-reveal only)
  - Inquiry funnel: Created -> Quoted -> Awarded -> Completed with drop-off rates
```

#### Business Rules

- Analytics data refreshed every hour (cached in Redis).
- "Total Saved" = sum of (MRP * quantity - actual price paid) across all completed orders.
- Data available from user's first completed order. Before that, show placeholder with "Complete your first order to see analytics."

---

## 11.2 DEALER DOMAIN (F-200 Series)

---

### F-201: Dealer Registration & KYC

**One-liner**: Dealer onboarding with GST auto-verification, document upload, and tiered approval workflow.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-201-1 | Prospective dealer | Register with my business details and GST number | I join the platform and start receiving inquiries |
| US-201-2 | Prospective dealer | Have my GST details auto-verified | My verification is fast and I don't need to upload redundant documents |
| US-201-3 | Prospective dealer | Upload trade license and business photos | I build trust and get verified faster |
| US-201-4 | Admin | Auto-verify dealers via GST API and flag discrepancies | I only manually review edge cases |

#### Acceptance Criteria

```
GIVEN a dealer visits the registration page
WHEN they start the onboarding
THEN the flow is:
  Step 1: Phone number + OTP verification
  Step 2: Business Details - GST Number (15 chars), Business Name (auto-filled from GST API), Owner Name, Email
  Step 3: GST Auto-Verification - System calls GST API, displays: Legal Name, Trade Name, Registration Date, Status, Address, HSN codes
         Dealer confirms: "Is this your business?" Yes -> proceed. No -> manual entry + flag for admin.
  Step 4: Document Upload - Trade license (optional), Business photos (storefront, warehouse, min 2), PAN card
  Step 5: Categories & Brands - Multi-select: which product categories they deal in, which brands they are authorized for
  Step 6: Service Area - Pin codes or city/district selection for delivery coverage
  Step 7: Bank Details - For payment settlement (verified via penny drop test)
  Step 8: Subscription Selection - Plan picker (see F-209)

GIVEN Step 3 GST verification succeeds
WHEN the GST status is "Active"
THEN the dealer's KYC status is set to AUTO_VERIFIED
AND they can proceed immediately (skip manual admin approval)
AND their tier starts at BRONZE

GIVEN Step 3 GST verification fails (inactive, cancelled, or API error)
WHEN the dealer completes remaining steps
THEN KYC status is set to PENDING_REVIEW
AND admin is notified for manual verification (see F-303)
AND dealer sees: "Your verification is in progress. Expected: 24-48 hours."
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Phone Verify | `/dealer/register` | `PhoneInput`, `OTPInput` |
| 2 | Business Details | `/dealer/register/business` | `GSTInput` (15-char mask), `BusinessNameInput` (auto-fill), `OwnerNameInput`, `EmailInput` |
| 3 | GST Verification | `/dealer/register/verify` | `GSTDetailCard` (auto-fetched), confirm/reject buttons |
| 4 | Documents | `/dealer/register/documents` | `FileUploader` (drag-drop, camera capture on mobile), `PhotoGrid` preview |
| 5 | Categories & Brands | `/dealer/register/catalog` | `CategoryTree` (multi-select), `BrandSearch` (multi-select with autocomplete) |
| 6 | Service Area | `/dealer/register/coverage` | `PinCodeInput` (multi, comma-separated), `MapView` showing coverage radius |
| 7 | Bank Details | `/dealer/register/bank` | `BankAccountForm` (IFSC, account number, name), `PennyDropStatus` indicator |
| 8 | Subscription | `/dealer/register/plan` | `PlanCard` grid (Free, Pro ₹999/mo, Enterprise ₹4,999/mo) |
| 9 | Pending/Complete | `/dealer/register/status` | Verification status + countdown + "Go to Dashboard" (if auto-verified) |

#### Business Rules

- GST API integration: government GST search API or third-party provider (ClearTax API / MasterGST).
- Auto-verification criteria: GST status = Active AND registration date > 1 year AND no significant discrepancies.
- Penny drop test: send ₹1 to provided bank account to verify account holder name matches business/owner name.
- Dealer tiers: `BRONZE` (new, < 10 orders) -> `SILVER` (10-50 orders, rating >= 3.5) -> `GOLD` (50-200, rating >= 4.0) -> `PLATINUM` (200+, rating >= 4.5).
- KYC documents are stored encrypted in Supabase Storage (AES-256). Access restricted to dealer (own docs) + admin.
- Re-verification triggers: GST status changes, annual review, 3+ disputes in 30 days.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| GST number belongs to a different business category (non-electrical) | Allow registration but flag: "Your GST indicates {category}. Confirm you deal in electrical/construction materials?" |
| Duplicate GST registration attempt | "A dealer with this GST is already registered. Contact support if this is an error." Block registration. |
| GST API is down | Allow manual entry of all fields. Set KYC to PENDING_REVIEW. Retry API verification via background job every hour. |
| Penny drop fails | 3 attempts. After 3: "Bank verification failed. Upload a cancelled cheque or bank statement instead." Manual admin review. |
| Dealer tries to register as buyer too | Allowed. Single user can have both roles. Role switcher in header. |

---

### F-202: Dealer Dashboard

**One-liner**: Command center for dealers showing key metrics, pending actions, and quick access to all dealer features.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-202-1 | Dealer | See my key business metrics at a glance | I know how my business is performing |
| US-202-2 | Dealer | See pending actions that need my attention | I don't miss opportunities or deadlines |
| US-202-3 | Dealer | Quick-navigate to incoming inquiries, orders, and inventory | I access my most-used features fast |

#### Acceptance Criteria

```
GIVEN a dealer logs into their dashboard
WHEN the page loads
THEN they see:

TOP METRICS ROW:
  - Revenue (this month): ₹X
  - Active Quotes: N
  - Orders in Progress: M
  - Bid Win Rate: P%
  - Rating: Q/5 stars

PENDING ACTIONS (priority-sorted):
  - "3 new inquiries match your catalog" (link to inquiry feed)
  - "2 quotes expiring in < 6 hours" (link to quotes)
  - "1 order awaiting dispatch confirmation" (link to orders)
  - "Inventory alert: 5 items below threshold" (link to inventory)

QUICK ACCESS CARDS:
  - Browse Inquiries, My Quotes, Orders, Inventory, Analytics, Subscription
```

#### Business Rules

- Dashboard data is fetched via a single aggregation API call (`GET /api/v1/dealer/dashboard`), cached for 5 minutes in Redis.
- Pending actions sorted by urgency: expiring quotes > new inquiries > dispatch reminders > inventory alerts.
- Revenue metric includes only completed (paid + delivered) orders.
- Win rate = awarded quotes / total submitted quotes * 100.

---

### F-203: Incoming Inquiry Feed (Blind)

**One-liner**: Dealers see a feed of incoming inquiries matched to their catalog -- with product requirements ONLY, zero buyer identity.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-203-1 | Dealer | See inquiries relevant to products I stock | I focus on opportunities I can fulfill |
| US-203-2 | Dealer | See product requirements, quantities, delivery location, and timeline | I can calculate my quote accurately |
| US-203-3 | Dealer | NOT see any buyer identity information | I quote on merit without bias |
| US-203-4 | Dealer | Filter inquiries by category, urgency, and delivery zone | I prioritize the best opportunities |

#### Acceptance Criteria

```
GIVEN a dealer opens the inquiry feed
WHEN inquiries are available
THEN each inquiry card shows:
  - Inquiry ID: INQ-XXXXX
  - Product requirements: list of items with names, specs, quantities, units
  - Delivery location: City and pin code ONLY (no street address, no buyer name)
  - Timeline: "Needed by {date}" or "Flexible"
  - Urgency badge: "Urgent" (< 3 days), "Standard" (3-14 days), "Flexible" (14+ days)
  - Quote deadline: "X hours remaining to quote"
  - Fulfillment match: "You stock 8 of 10 items" (based on dealer's inventory)
AND the feed is filtered to show only inquiries matching the dealer's categories and service area
AND NO buyer name, phone, email, address, or any identifying information is shown

GIVEN a dealer taps on an inquiry card
WHEN the detail opens
THEN they see the full item list with specifications
AND a "Submit Quote" CTA
AND "Quote deadline: {datetime}" prominently displayed
AND items they stock are highlighted green, items they don't stock are highlighted yellow ("Not in your inventory")
```

#### Business Rules

- Smart matching algorithm selects which dealers see which inquiries:
  - Dealer's categories overlap with inquiry categories (minimum 50% item overlap).
  - Delivery location is within dealer's service area.
  - Dealer's subscription tier determines priority in the feed (Platinum first, Bronze last) and number of free quote slots per month.
  - Maximum 15 dealers are matched per inquiry.
- Quote deadline: 48 hours from inquiry publication for Standard, 24 hours for Urgent, 7 days for Flexible.
- Dealers see at most 20 new inquiries per day (to prevent information overload). Sorted by match score.
- Feed updates in real-time via Socket.io when new matching inquiries are published.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| No matching inquiries | Show: "No new inquiries match your catalog right now. Expand your categories or service area to see more." |
| Inquiry has items not in dealer's inventory | Show partial match: "You stock 6 of 10 items. You can submit a partial quote." |
| Quote deadline passes while dealer is writing quote | Block submission. Show: "Quote deadline has passed for this inquiry." |
| Dealer's subscription has 0 remaining quote credits | Show inquiries but block "Submit Quote": "Upgrade your plan to submit more quotes this month." |

---

### F-204: Quote Submission

**One-liner**: Dealers price each item, set delivery terms, and submit a sealed quote -- with margin calculator and AI-assisted pricing suggestions.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-204-1 | Dealer | Enter my price for each item in the inquiry | I provide a detailed, item-level quote |
| US-204-2 | Dealer | See suggested pricing based on market data | I price competitively without guessing |
| US-204-3 | Dealer | Calculate my margin per item and overall | I ensure profitability before submitting |
| US-204-4 | Dealer | Set delivery timeline and terms | The buyer has complete information for comparison |
| US-204-5 | Dealer | Submit a partial quote (only items I stock) | I don't lose the entire opportunity because of 1-2 missing items |

#### Acceptance Criteria

```
GIVEN a dealer clicks "Submit Quote" on an inquiry
WHEN the quote form opens
THEN for each item:
  - Product name and specifications (read-only, from inquiry)
  - Quantity required (read-only)
  - "Your Price (per unit)" input field
  - "Market Range" indicator: "₹X - ₹Y" (from price index, shown as reference)
  - "Your Margin" calculated in real-time: ((your_price - your_cost) / your_price * 100)%
    (your_cost is from dealer's inventory if available, else manually entered)
  - "Cannot Supply" checkbox (for items not in stock -- these are excluded from the quote)

AND below the item list:
  - Total quote amount (auto-calculated sum)
  - Delivery timeline: dropdown (1-3 days, 3-7 days, 7-14 days, 14+ days)
  - Delivery charge: ₹ input (or "Free Delivery" toggle)
  - Payment terms: dropdown (Advance, COD, 7-day credit, 30-day credit)
  - Notes to buyer: textarea (e.g., "Can deliver in 2 batches if needed")
  - Overall margin indicator: "Your overall margin: X%"

AND an AI suggestion card shows:
  "Volt AI Pricing Tip: For this delivery zone, competitive pricing for MCB 32A is ₹280-320/unit. 
   Your current price of ₹350 is above market. Consider ₹310 for better win probability."

GIVEN the dealer submits the quote
WHEN validation passes
THEN the quote is sealed (cannot be edited after submission)
AND status is set to SUBMITTED
AND the buyer receives a real-time notification: "New quote received for INQ-XXXXX"
AND the dealer sees confirmation: "Quote submitted. You'll be notified if selected."

GIVEN a dealer marks items as "Cannot Supply"
WHEN more than 50% of items are marked
THEN a warning: "You can only supply {N} of {M} items. Partial quotes have lower Hub4Estate Scores."
AND they can still submit if they choose
```

#### UI Flow

| Step | Screen | URL | Key Components |
|------|--------|-----|----------------|
| 1 | Quote Builder | `/dealer/inquiries/{id}/quote` | `QuoteItemList` (per-item pricing), `MarginCalculator` sidebar, `AIPricingSuggestion` card, `DeliveryTerms` section |
| 2 | Quote Review | `/dealer/inquiries/{id}/quote/review` | `QuoteSummary` (total, margin, delivery), `ConfirmSubmitButton` |
| 3 | Quote Confirmation | Modal | "Quote submitted for INQ-XXXXX. Total: ₹X. Margin: Y%." |

#### Business Rules

- Quotes are SEALED after submission. No edits. Dealer can withdraw within 1 hour of submission (after that, locked).
- AI pricing suggestions are based on `product_price_history` and `quote_analytics` data. Generated via Claude API.
- Margin calculator uses dealer's cost data from `dealer_inventory.cost_price`. If not available, dealer manually enters cost.
- Delivery charges are included in the total shown to buyer. Hub4Estate Score factors in total cost (items + delivery).
- Quote validity: same as inquiry deadline. Quote auto-expires when inquiry expires.
- Maximum 1 quote per dealer per inquiry (no revisions).
- Credit-based: Free tier gets 10 quotes/month, Pro gets 50, Enterprise gets unlimited.

#### Edge Cases

| Scenario | Handling |
|----------|----------|
| Dealer enters price below cost (negative margin) | Warning: "Your price for {item} is below your cost. Proceed?" Allow if confirmed (could be a strategic loss-leader). |
| Dealer enters price significantly above market | AI warning: "This price is {X}% above market average. Win probability is low." |
| Network failure during submission | Retry 3 times. If all fail, save as local draft, show: "Quote saved offline. Will submit when connection restores." |
| Inquiry item specifications are unclear | "Contact Hub4Estate Support" button (not the buyer -- blind matching). Admin relays clarification to buyer without revealing identities. |

---

### F-205: Inventory Management

**One-liner**: Dealers manage their product catalog with bulk CSV upload, stock levels, automated low-stock alerts, and price management.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-205-1 | Dealer | Upload my entire inventory via CSV | I onboard my catalog quickly |
| US-205-2 | Dealer | Set stock quantities and get alerts when low | I never miss an order due to stockout |
| US-205-3 | Dealer | Update prices individually or in bulk | My pricing stays current |
| US-205-4 | Dealer | See which of my products have the most inquiry demand | I stock what sells |

#### Acceptance Criteria

```
GIVEN a dealer navigates to Inventory Management
WHEN the page loads
THEN they see a table of their inventory:
  - Product name, Brand, Model, Category
  - Stock quantity (editable inline)
  - Cost price (editable, dealer-private, never shown to buyers)
  - Selling price (editable, this is what appears in quotes)
  - Last updated timestamp
  - Demand indicator: "High/Medium/Low" (based on recent inquiry matches)
  - Status: In Stock / Low Stock (< threshold) / Out of Stock (0)

GIVEN a dealer uploads a CSV
WHEN the file is processed
THEN the system:
  1. Parses columns (product_name, brand, model_number, quantity, cost_price, selling_price)
  2. Matches each row to the Hub4Estate catalog (fuzzy matching by name + brand + model)
  3. Shows review screen: "120 products matched, 8 need review, 2 not found"
  4. "Needs review" items show top 3 catalog matches for selection
  5. "Not found" items can be flagged for catalog addition (admin notified)
  6. On confirm, inventory records are created/updated

GIVEN a product stock falls below the threshold
WHEN the background check runs (every 2 hours)
THEN the dealer receives a notification: "Low stock alert: {Product} - {N} remaining (threshold: {T})"
AND the item is highlighted yellow in the inventory table
```

#### Business Rules

- Stock thresholds are set per product by the dealer (default: 10 units).
- Price history is tracked: every price change creates a record in `product_price_history`.
- CSV format: standard template downloadable from the platform. Max 5,000 rows per upload.
- Inventory syncs to the search index for availability filtering.
- Demand indicator: High = matched to 5+ inquiries in last 30 days, Medium = 2-4, Low = 0-1.

---

### F-206: Order Fulfillment (Dealer Side)

**One-liner**: Dealers manage won orders from confirmation through dispatch and delivery, with status updates pushed to buyers.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-206-1 | Dealer | Confirm an order within 24 hours | The buyer knows I'm processing it |
| US-206-2 | Dealer | Mark order as dispatched with tracking info | The buyer can track delivery |
| US-206-3 | Dealer | See all active orders in one dashboard | I manage fulfillment efficiently |

#### Acceptance Criteria

```
GIVEN a dealer's quote is selected by a buyer
WHEN payment is confirmed
THEN the dealer receives a notification: "New order ORD-XXXXX. Confirm within 24 hours."
AND the order appears in "Pending Confirmation" tab with full details:
  - Buyer name, phone, delivery address (NOW REVEALED -- post-selection)
  - Item list with quantities and agreed prices
  - Payment status: "Paid - Escrow"
  - Expected delivery date (from their quote commitment)

GIVEN the dealer confirms the order
WHEN they click "Confirm Order"
THEN status updates to CONFIRMED
AND buyer is notified
AND the "Update Dispatch" button becomes active

GIVEN the dealer dispatches
WHEN they click "Mark Dispatched"
THEN they enter: Tracking number (optional), Delivery partner name (optional), Expected delivery date
AND status updates to DISPATCHED
AND buyer sees live tracking
```

#### Business Rules

- If dealer does not confirm within 24 hours, order is auto-escalated. After 48 hours with no confirmation, order is cancelled and buyer is refunded.
- Dealer's rating is affected by: confirmation speed, dispatch speed, on-time delivery, buyer review.
- Dealer sees buyer identity ONLY after their quote is selected and payment is confirmed.
- Inventory auto-decrements when order is confirmed (reserved stock).

---

### F-207: Dealer Analytics

**One-liner**: Revenue analytics, win rates, customer insights, and competitive positioning data for dealers.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-207-1 | Dealer | See my monthly revenue and order trends | I track business growth |
| US-207-2 | Dealer | See my bid win rate and understand why I lose | I improve my quoting strategy |
| US-207-3 | Dealer | See which products generate the most revenue | I optimize my inventory |
| US-207-4 | Dealer | See my rating breakdown | I know what to improve |

#### Acceptance Criteria

```
GIVEN a dealer opens their analytics page
WHEN data loads
THEN they see:
  
  REVENUE:
  - Monthly revenue chart (last 12 months, bar chart)
  - Revenue by category (donut chart)
  - Average order value trend (line chart)
  
  QUOTING PERFORMANCE:
  - Total quotes submitted: N
  - Win rate: X%
  - Average margin on won quotes: Y%
  - Loss reasons (anonymized): "Price too high" (60%), "Delivery too slow" (25%), "Partial fulfillment" (15%)
  - Win rate trend over time (line chart)
  
  INVENTORY INSIGHTS:
  - Top 10 products by revenue
  - Top 10 products by inquiry demand (from matched inquiries)
  - Stockout opportunity cost: "Estimated ₹X lost from stockouts this month"
  
  RATING BREAKDOWN:
  - Overall: 4.3/5
  - Delivery speed: 4.5/5
  - Pricing accuracy: 4.1/5
  - Product quality: 4.4/5
  - Communication: 4.2/5
```

#### Business Rules

- Loss reasons are generated from the anonymized scoring data. Dealer never sees who beat them.
- "Opportunity cost" = estimated revenue from inquiries matched but unable to quote due to stockout.
- Analytics data refreshed hourly, cached per dealer in Redis.
- Export to CSV/PDF available for Pro and Enterprise tiers.

---

### F-208: Dealer CRM

**One-liner**: Lightweight CRM for dealers to manage buyer relationships post-reveal, track repeat customers, and send follow-ups.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-208-1 | Dealer | See a list of all buyers I've transacted with | I manage my customer base |
| US-208-2 | Dealer | See order history per buyer | I understand their needs and offer better service |
| US-208-3 | Dealer | Tag and categorize buyers | I segment and prioritize my follow-ups |

#### Acceptance Criteria

```
GIVEN a dealer opens the CRM section
WHEN data loads
THEN they see a table of buyers:
  - Buyer name, location, total orders, total revenue, last order date, tags
AND clicking a buyer opens their profile:
  - Contact info (phone, email -- only from completed transactions)
  - Order history with amounts and items
  - Notes (dealer's private notes about this buyer)
  - Tags (e.g., "repeat buyer", "large orders", "slow payment")
```

#### Business Rules

- Dealer sees buyer info ONLY for completed transactions (post-identity-reveal).
- Buyer data cannot be exported in bulk (anti-scraping, buyer privacy protection).
- Maximum 500 buyer records displayed. Pagination + search for larger dealer accounts.

---

### F-209: Subscription Management

**One-liner**: Dealers manage their subscription plan, view usage, and upgrade/downgrade.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-209-1 | Dealer | See my current plan and usage | I know if I need to upgrade |
| US-209-2 | Dealer | Upgrade or downgrade my plan | I adjust my spend based on business needs |
| US-209-3 | Dealer | See what features each plan includes | I make an informed choice |

#### Acceptance Criteria

```
GIVEN a dealer opens Subscription settings
WHEN the page loads
THEN they see:

CURRENT PLAN:
  - Plan name: Pro (₹999/month)
  - Billing cycle: Monthly / Annual (toggle to save 20%)
  - Next billing date: {date}
  - Payment method: UPI / Card ending in XXXX

USAGE THIS MONTH:
  - Quotes submitted: 32 / 50
  - Inquiries viewed: 89 / unlimited
  - Analytics exports: 2 / 10
  - AI pricing suggestions: 15 / 30

PLAN COMPARISON TABLE:
  | Feature | Free | Pro ₹999/mo | Enterprise ₹4,999/mo |
  |---------|------|-------------|----------------------|
  | Quotes/month | 10 | 50 | Unlimited |
  | Inquiry feed priority | Standard | High | Highest |
  | AI pricing | 5/month | 30/month | Unlimited |
  | Analytics | Basic | Advanced | Advanced + Export |
  | CRM | No | Yes | Yes + API access |
  | Badge | None | Pro badge | Verified Enterprise badge |
  | Support | Community | Priority email | Dedicated account manager |
```

#### Business Rules

- Upgrades take effect immediately. Prorated billing for the remaining period.
- Downgrades take effect at the end of the current billing period.
- If a dealer exceeds quote limit, they are prompted to upgrade (see F-203 edge case).
- Annual billing: 20% discount. Shown as "₹799/mo billed annually" for Pro.
- Enterprise requires a sales call. "Contact Sales" button triggers a lead to the sales team.
- Payment processing via Razorpay Subscriptions API.

---

## 11.3 ADMIN DOMAIN (F-300 Series)

---

### F-301: Admin Dashboard

**One-liner**: Real-time platform health dashboard showing GMV, user growth, revenue, and operational metrics.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-301-1 | Admin/Founder | See platform GMV, revenue, and growth at a glance | I track business health daily |
| US-301-2 | Admin | See active inquiries, orders, and disputes | I monitor operational load |
| US-301-3 | Admin | See user and dealer growth trends | I measure acquisition efforts |

#### Acceptance Criteria

```
GIVEN an admin accesses the admin dashboard
WHEN the page loads
THEN they see:

TOP ROW METRICS (with sparkline trends):
  - GMV (Gross Merchandise Value) this month: ₹X
  - Platform Revenue (commissions + subscriptions): ₹Y
  - Active Users (DAU/MAU): Z / W
  - Active Dealers: D
  - NPS Score: S

OPERATIONAL METRICS:
  - Active Inquiries: N (Published + Quoting)
  - Quotes in Progress: M
  - Orders in Fulfillment: P
  - Open Disputes: Q
  - Pending KYC Reviews: R

GROWTH CHARTS:
  - User sign-ups (daily, last 30 days) -- line chart
  - Dealer sign-ups (daily, last 30 days) -- line chart
  - GMV (weekly, last 12 weeks) -- bar chart
  - Inquiry volume (daily, last 30 days) -- line chart
  - Category distribution of inquiries -- donut chart

ALERTS:
  - "5 KYC verifications pending > 24 hours"
  - "2 disputes unresolved > 48 hours"
  - "Elasticsearch sync delay: 5 minutes"
```

#### Business Rules

- Admin dashboard is accessible only to users with role `ADMIN` or `SUPER_ADMIN`.
- Data is real-time for counters (WebSocket), hourly refresh for charts.
- All data can be filtered by date range and city/region.
- Export to CSV/PDF for reporting.

---

### F-302: User Management

**One-liner**: Admin CRUD for all user accounts with search, filters, and moderation actions.

#### Acceptance Criteria

```
GIVEN admin navigates to User Management
WHEN the page loads
THEN they see a searchable, sortable table:
  - Name, Email, Phone, Role, Status (Active/Suspended/Banned), Registration Date, Last Active
AND actions per user: View Profile, Suspend, Ban, Reset Password, Impersonate (login as user for debugging)
AND bulk actions: Suspend selected, Export selected

GIVEN admin clicks "Suspend" on a user
WHEN they confirm with a reason
THEN the user's status changes to SUSPENDED
AND the user is logged out of all sessions
AND they receive an email: "Your account has been suspended. Reason: {reason}. Contact support to appeal."
AND an audit log entry is created: { admin_id, action: "SUSPEND", target_user_id, reason, timestamp }
```

---

### F-303: Dealer Verification Workflow

**One-liner**: Admin reviews dealer KYC submissions, with a queue-based workflow for pending verifications.

#### Acceptance Criteria

```
GIVEN admin opens the Dealer Verification queue
WHEN pending verifications exist
THEN they see a queue sorted by submission date (oldest first):
  - Dealer name, GST number, Submission date, Auto-verification status, Priority flag
AND clicking a dealer opens the full verification panel:
  - Business details (auto-filled from GST API)
  - Uploaded documents (trade license, photos, PAN)
  - GST API response (raw data)
  - Discrepancy flags (e.g., "GST address does not match entered address")
AND admin actions: Approve, Reject (with reason), Request More Info (sends message to dealer)
AND approved dealers are immediately activated and notified

GIVEN admin rejects a dealer
WHEN they provide a rejection reason
THEN the dealer receives: "Verification unsuccessful. Reason: {reason}. You can re-apply with corrected information."
AND the rejection is logged in audit trail
AND the dealer can re-submit from their profile
```

---

### F-304: Content Moderation

**One-liner**: Review and moderate user-generated content: reviews, profile descriptions, product images.

#### Acceptance Criteria

```
GIVEN content is flagged (by AI auto-moderation or user report)
WHEN admin opens the moderation queue
THEN they see:
  - Content type (review, profile text, image)
  - The content itself (with AI assessment: "Flagged for: spam / inappropriate language / fake review")
  - User who created it
  - Actions: Approve, Remove (with reason), Warn User, Ban User
```

#### Business Rules

- AI auto-moderation runs on all user-generated text (Claude API moderation endpoint).
- Images are scanned for inappropriate content via a moderation model.
- Three strikes policy: 3 removed items in 30 days -> automatic 7-day suspension.

---

### F-305: Catalog Management

**One-liner**: Admin CRUD for the product catalog -- categories, products, specifications, images, and pricing data.

#### Acceptance Criteria

```
GIVEN admin opens Catalog Management
WHEN the page loads
THEN they see:
  - Category tree (expandable, drag-to-reorder)
  - Product table (searchable, filterable by category/brand)
  - "Add Product" and "Bulk Import" buttons

GIVEN admin adds a new product
WHEN they fill the form
THEN required fields: Name, Brand (select), Category (select), Model Number, MRP
AND optional fields: Specifications (key-value pairs, dynamic), Images (up to 10), Description, Certifications
AND saving creates the product and syncs to Elasticsearch within 60 seconds

GIVEN admin bulk imports products
WHEN they upload a CSV/XLSX
THEN the system parses, validates, and shows a preview with any errors highlighted
AND admin confirms to import all valid rows
AND invalid rows are exported as a CSV for correction
```

---

### F-306: Dispute Resolution

**One-liner**: Admin handles buyer-dealer disputes with evidence review, communication tools, and escrow actions.

#### Acceptance Criteria

```
GIVEN a dispute is raised (by buyer or dealer)
WHEN admin opens the dispute detail
THEN they see:
  - Dispute ID, Order ID, Inquiry ID
  - Parties: Buyer (name, contact), Dealer (name, contact)
  - Issue type: Damaged, Wrong Item, Short Quantity, Not Delivered, Pricing Discrepancy, Other
  - Evidence from buyer: photos, description
  - Evidence from dealer: photos, description, delivery proof
  - Order details: items, amounts, dates
  - Communication thread between buyer, dealer, and admin

AND admin can:
  - Send messages to either party (within the dispute thread)
  - Request additional evidence from either party
  - Make a resolution decision:
    a. Full refund to buyer (escrow returned)
    b. Partial refund (specify amount)
    c. Replacement order (new order created at dealer's cost)
    d. Dismiss dispute (in favor of dealer, escrow released)
    e. Escalate to senior admin / legal

AND the resolution is final (with appeal window of 7 days)
AND both parties are notified of the decision with reasoning
AND the dealer's rating is adjusted based on resolution (dispute found valid -> -0.2 to overall rating)
```

#### Business Rules

- Dispute SLA: First response within 4 hours (business hours). Resolution within 72 hours.
- Auto-escalation: if unresolved after 72 hours, escalates to senior admin with notification.
- Escrow is FROZEN during dispute. No auto-release triggers while dispute is open.
- Resolution history affects dealer tier: 3+ valid disputes in 90 days -> tier downgrade review.

---

### F-307: Financial Dashboard

**One-liner**: Platform revenue tracking, escrow balances, subscription revenue, and settlement reports.

#### Acceptance Criteria

```
GIVEN admin opens the Financial Dashboard
WHEN data loads
THEN they see:

REVENUE BREAKDOWN:
  - Subscription revenue (this month): ₹X (by tier: Free N dealers, Pro M dealers, Enterprise P dealers)
  - Lead credit revenue: ₹Y
  - Transaction fees (future): ₹Z
  - Total revenue: ₹(X+Y+Z)

ESCROW STATUS:
  - Total in escrow: ₹A
  - Pending release: ₹B (delivered, awaiting confirmation)
  - Disputed: ₹C (frozen)

SETTLEMENT REPORT:
  - Dealers paid this month: ₹D
  - Average settlement time: E days
  - Pending settlements: ₹F

All metrics filterable by date range, city, and dealer tier.
Export to CSV/PDF for accounting.
```

---

### F-308: System Configuration & Feature Flags

**One-liner**: Admin controls for platform settings, feature flags, and A/B tests.

#### Acceptance Criteria

```
GIVEN admin opens System Configuration
WHEN the page loads
THEN they see:

FEATURE FLAGS:
  - Key-value list: feature_name (string), enabled (boolean), rollout_percentage (0-100), target_users (all/beta/specific_ids)
  - Toggle to enable/disable features instantly
  - Rollout slider for gradual feature rollout

SYSTEM SETTINGS:
  - Quote deadline duration (default: 48 hours)
  - Maximum inquiries per buyer (default: 5 active)
  - Maximum dealers matched per inquiry (default: 15)
  - Auto-confirmation timeout (default: 72 hours)
  - Inquiry expiry period (default: 7 days)
  - Commission rates per tier

All changes create audit log entries with before/after values.
```

---

## 11.4 COMMUNICATION DOMAIN (F-400 Series)

---

### F-401: In-App Messaging

**One-liner**: Real-time messaging between buyers and dealers (post-identity-reveal only), with typing indicators, read receipts, and file sharing.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-401-1 | Buyer | Message the awarded dealer about order details | I clarify delivery specifics without leaving the platform |
| US-401-2 | Dealer | Respond to buyer messages quickly | I maintain good response time ratings |
| US-401-3 | Either user | Share images and documents in chat | I share invoices, photos, specifications inline |
| US-401-4 | Either user | See typing indicators and read receipts | I know the other person is engaged |

#### Acceptance Criteria

```
GIVEN a buyer and dealer have a completed transaction (identity revealed)
WHEN either opens the messaging interface
THEN they see a conversation thread specific to that order/inquiry
AND can send: text messages, images (up to 5MB), documents (PDF, up to 10MB)
AND typing indicator shows when the other party is composing
AND read receipts (blue double-check) appear when the message is read
AND messages are delivered in real-time via Socket.io
AND offline messages are queued and delivered on reconnect

GIVEN a user is not on the chat page
WHEN a new message arrives
THEN they receive:
  - In-app notification (bell icon badge)
  - Push notification (if enabled)
  - WhatsApp notification after 5 minutes if message is unread (if WhatsApp enabled)
```

#### Business Rules

- Messaging is ONLY available post-identity-reveal (after quote selection). NO messaging during blind phase.
- During blind phase, if a dealer needs clarification, they contact Hub4Estate support, who relays the question anonymously.
- Message history is retained for 2 years, then archived.
- File uploads scanned for malware (ClamAV or similar).
- Messages are NOT end-to-end encrypted (platform can moderate). But are encrypted in transit (TLS) and at rest.
- Rate limit: 60 messages per minute per user (anti-spam).

---

### F-402: WhatsApp Integration

**One-liner**: Critical notifications and inquiry updates delivered via WhatsApp Business API for users who prefer it.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-402-1 | Buyer | Receive quote notifications on WhatsApp | I never miss a quote even when not on the platform |
| US-402-2 | Dealer | Receive new inquiry alerts on WhatsApp | I respond quickly to opportunities |
| US-402-3 | User | Opt in/out of WhatsApp notifications | I control my notification preferences |

#### Acceptance Criteria

```
GIVEN a user has opted into WhatsApp notifications
WHEN a critical event occurs (new quote, order update, inquiry match)
THEN a WhatsApp message is sent via Gupshup/official WhatsApp Business API
AND the message includes:
  - Event summary (e.g., "You received a new quote for INQ-XXXXX. 3 quotes total. Review now.")
  - Deep link to the relevant page in the web app
  - Quick reply buttons where applicable ("View Quotes", "Dismiss")

GIVEN a user has NOT opted in
WHEN a critical event occurs
THEN NO WhatsApp message is sent (only in-app + email based on their preferences)
```

#### Business Rules

- WhatsApp messages use pre-approved template messages (required by WhatsApp Business API policy).
- Template categories: transactional (order updates), marketing (none in v1), utility (OTP, alerts).
- Maximum 3 WhatsApp messages per user per day (excluding OTP). Batch into digest if more events.
- Provider: Gupshup or WhatsApp Cloud API directly. Fallback: SMS via MSG91 if WhatsApp delivery fails.
- Cost: approximately ₹0.50-1.00 per message. Tracked in `notification_costs` for unit economics.

---

### F-403: Email System

**One-liner**: Transactional emails for critical events + weekly digest for engagement.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-403-1 | User | Receive email confirmations for orders, payments, quotes | I have a paper trail |
| US-403-2 | User | Receive a weekly digest of activity | I stay engaged without being overwhelmed |
| US-403-3 | User | Unsubscribe from non-critical emails | I control my inbox |

#### Acceptance Criteria

```
GIVEN a transactional event occurs (order placed, payment confirmed, quote received)
WHEN the notification job runs
THEN an email is sent via Resend (or SendGrid) with:
  - Hub4Estate branded template (white background, warm accent colors, clean typography)
  - Event-specific content (order details, amount, next steps)
  - CTA button linking to the relevant page
  - Unsubscribe link for digest emails (transactional emails cannot be unsubscribed per regulation)

GIVEN it is Monday 9:00 AM IST
WHEN the weekly digest job runs
THEN all active users receive a personalized digest:
  - For buyers: "You have X active inquiries, Y new quotes this week, ₹Z saved so far"
  - For dealers: "You received X inquiries, submitted Y quotes, won Z orders worth ₹W"
AND users who have unsubscribed from digest do not receive it
```

#### Business Rules

- Transactional emails: immediate, cannot be unsubscribed.
- Digest emails: weekly (Monday 9 AM IST), can be unsubscribed.
- Email provider: Resend (primary) with SendGrid as fallback.
- Bounce handling: soft bounce -> retry 3x. Hard bounce -> mark email invalid, notify user to update.
- All emails include: company address (legal requirement), unsubscribe link, Hub4Estate logo.

---

### F-404: Push Notifications

**One-liner**: Browser push notifications for real-time alerts when the user is not on the platform.

#### Acceptance Criteria

```
GIVEN a user has granted push notification permission
WHEN a qualifying event occurs (new quote, order update, inquiry match)
THEN a push notification is sent via Firebase Cloud Messaging (FCM)
AND the notification includes: title, body text, icon (Hub4Estate logo), click URL
AND clicking the notification opens the relevant page

GIVEN a user has NOT granted permission
WHEN they first visit the dashboard
THEN a non-intrusive prompt appears (NOT the browser default -- custom UI):
  "Get instant alerts for quotes and orders? [Enable Notifications] [Not now]"
AND "Not now" hides the prompt for 7 days
AND "Enable Notifications" triggers the browser permission request
```

#### Business Rules

- Push notification permission requested only after user has completed at least one action (search, save, or inquiry).
- Never show the browser permission prompt cold (poor UX, high denial rate).
- Notification grouping: if 5+ notifications within 1 minute, batch into "You have 5 new updates."
- FCM for web push. Service worker registered at `/sw.js`.

---

## 11.5 AI DOMAIN (F-500 Series)

---

### F-501: Volt AI Chat

**One-liner**: AI-powered procurement assistant (Claude API) that helps buyers find products, understand specifications, get price estimates, and create inquiries through natural conversation.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-501-1 | Buyer | Ask "What MCBs do I need for a 3BHK flat?" and get a structured answer | I learn what to buy without being an expert |
| US-501-2 | Buyer | Ask "How much would wiring a 2BHK cost?" and get a price estimate | I budget my project before committing |
| US-501-3 | Buyer | Say "Create an inquiry for these items" and have it auto-generated | I go from conversation to procurement seamlessly |
| US-501-4 | Buyer | Upload a photo of an electrical panel and ask "What parts are these?" | I identify products I need to reorder |

#### Acceptance Criteria

```
GIVEN a buyer opens the Volt AI chat
WHEN the chat interface appears
THEN they see:
  - Chat window (right panel on desktop, full screen on mobile)
  - Greeting: "Hi! I'm Volt, your procurement assistant. I can help you find products, estimate costs, or create an inquiry. What are you working on?"
  - Suggested prompts: "3BHK electrical list", "Compare brands for MCBs", "Price estimate for shop wiring"

GIVEN the user asks a product question
WHEN Volt processes it
THEN Volt uses Claude API with tool calling:
  - Tool: `search_catalog(query, filters)` -> returns matching products
  - Tool: `get_price_range(product_id)` -> returns current dealer price range
  - Tool: `get_specifications(product_id)` -> returns tech specs
  - Tool: `create_draft_inquiry(items[])` -> creates a draft inquiry
AND Volt responds with structured, formatted content:
  - Product recommendations with prices
  - Explanations of specifications in plain language
  - Comparison tables when comparing options
  - "Add to Inquiry" buttons inline with each recommendation

GIVEN the user says "Create an inquiry for these items"
WHEN Volt processes it
THEN Volt calls `create_draft_inquiry` with the discussed items
AND responds: "I've created a draft inquiry with {N} items. Total estimated cost: ₹X-₹Y. [Review Inquiry] [Edit Items]"
AND clicking "Review Inquiry" navigates to the inquiry editor (F-104) with items pre-filled

GIVEN the user uploads a product image
WHEN Volt processes it (Claude vision)
THEN Volt identifies the products in the image (brand, model if visible)
AND suggests catalog matches: "I see a Havells MCB 32A and a Polycab distribution board. Would you like to add these to an inquiry?"
```

#### Business Rules

- Volt is powered by Claude API (claude-sonnet-4-20250514 or claude-opus-4-20250514 based on complexity).
- System prompt includes: Hub4Estate catalog knowledge, pricing data, construction norms (Indian standard), safety guidelines.
- Tool calling: Volt can search the catalog, fetch prices, check availability, create drafts. It CANNOT place orders or make payments.
- Conversation history: stored in `ai_conversations` table, retained for 90 days. User can delete their history.
- Rate limit: 50 messages per user per day (Free), 200 (Pro), unlimited (Enterprise).
- Safety rails: Volt never recommends products that could be dangerous without proper certification. Always adds safety disclaimers for electrical items.
- Fallback: if Volt cannot answer, it says "I'm not sure about that. Would you like me to connect you with our support team?"
- Latency target: first token in < 2 seconds, full response in < 8 seconds.

---

### F-502: Slip Scanner (OCR)

**One-liner**: Scan a handwritten material list, printed invoice, or dealer quotation slip, and extract items + quantities into a structured format for inquiry creation.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-502-1 | Buyer | Photograph a handwritten material list from my contractor | I digitize it without retyping everything |
| US-502-2 | Buyer | Upload a dealer's PDF quotation and extract items | I can compare their quote against Hub4Estate prices |

#### Acceptance Criteria

```
GIVEN a buyer opens the Slip Scanner
WHEN they capture/upload an image or PDF
THEN the system:
  1. Processes via Claude Vision API (for handwritten) or OCR service (for printed)
  2. Extracts: item names, quantities, units, prices (if present)
  3. Shows extracted data in an editable table
  4. Matches each item to the catalog (fuzzy match, show confidence %)
  5. User reviews, corrects any mismatches
  6. "Create Inquiry" button generates a draft from the extracted data

GIVEN the image quality is poor
WHEN extraction confidence is < 70% for an item
THEN the item row is highlighted yellow: "Low confidence. Please verify."
AND the original image section is shown alongside for reference
```

#### Business Rules

- Supported formats: JPEG, PNG, PDF (up to 10 pages, 20MB).
- Processing time target: < 10 seconds for a single page.
- Claude Vision API for handwritten; standard OCR (Tesseract or Google Vision) for printed text.
- Extracted data is never stored permanently -- only as draft inquiry if user chooses to proceed.
- This feature is available to all users (not gated by subscription -- it drives inquiry creation).

---

### F-503: BOQ Generator

**One-liner**: AI generates a complete Bill of Quantities for a construction/renovation project based on project type, size, and requirements.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-503-1 | Buyer | Describe my project and get a complete material list | I don't need to be an expert to know what I need |
| US-503-2 | Buyer | Edit the generated BOQ before creating inquiries | I customize to my specific requirements |

#### Acceptance Criteria

```
GIVEN a buyer opens the BOQ Generator
WHEN they provide project details:
  - Project type: Residential (1BHK/2BHK/3BHK/4BHK/Villa), Commercial (Shop/Office/Warehouse), Renovation
  - Area: square feet
  - Rooms: count and types (bedroom, kitchen, bathroom, living, balcony)
  - Special requirements: text (e.g., "smart home automation", "industrial-grade wiring")
THEN Volt AI generates a BOQ with:

  WIRING:
  | Item | Specification | Quantity | Unit | Est. Price/Unit | Est. Total |
  |------|--------------|----------|------|-----------------|------------|
  | FRLS Wire 1.5mm | Polycab/Havells, 90m roll | 4 | rolls | ₹1,800 | ₹7,200 |
  | FRLS Wire 2.5mm | Polycab/Havells, 90m roll | 3 | rolls | ₹2,800 | ₹8,400 |
  | ... | ... | ... | ... | ... | ... |

  SWITCHES & SOCKETS:
  | ... | ... | ... | ... | ... | ... |

  DISTRIBUTION:
  | ... | ... | ... | ... | ... | ... |

  LIGHTING:
  | ... | ... | ... | ... | ... | ... |

  TOTAL ESTIMATED COST: ₹X - ₹Y

AND each item is editable (quantity, brand preference, remove)
AND "Create Inquiry from BOQ" button converts the entire BOQ into a draft inquiry
AND the BOQ can be saved to the project (F-108) and exported as PDF
```

#### Business Rules

- BOQ generation uses Claude API with a specialized system prompt containing Indian construction standards (IS 732 for electrical wiring, NEC guidelines adapted for India).
- Quantities are calculated using standard formulas: wire length = perimeter * 3 * number of points / standard roll length (simplified).
- Price estimates are from the platform's price index (current average dealer prices).
- BOQ is a STARTING POINT -- always shows disclaimer: "These are estimates based on standard construction. Actual requirements may vary. Consult a licensed electrician."
- Generation time: < 15 seconds.

---

### F-504: Price Intelligence Dashboard

**One-liner**: Real-time and historical price data for construction materials -- a "stock ticker" for building materials.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-504-1 | Buyer | See price trends for products I'm interested in | I time my purchases for the best prices |
| US-504-2 | Buyer | See city-wise price comparisons | I understand regional pricing differences |
| US-504-3 | Dealer | See market pricing benchmarks | I stay competitive |

#### Acceptance Criteria

```
GIVEN a user opens the Price Intelligence Dashboard
WHEN data loads
THEN they see:

PRICE INDEX (top-level):
  - "Hub4Estate Electrical Index": composite price index number (base 100, updated daily)
  - Trend: up/down arrow with percentage change (this week vs. last week)

CATEGORY DRILL-DOWN:
  - Select category (e.g., MCBs, Wires, Switches)
  - See: average price, min price, max price, price change over 30/90/365 days
  - Line chart showing price history

PRODUCT-LEVEL:
  - Select specific product
  - Price history chart (90 days default, expandable to 1 year)
  - Price by city (bar chart: SGR, Jaipur, Mumbai, Bangalore, Pune)
  - Dealer price distribution (histogram: how many dealers at what price point)

ALERTS INTEGRATION:
  - "Set Alert" button on any product price card -> links to F-109
```

#### Business Rules

- Price index is computed daily from `product_price_history` and `quote_items` data.
- Base index (100) set at platform launch date. Calculated as weighted average of top 50 products by transaction volume.
- City-wise data requires minimum 3 dealer data points per city to display (otherwise: "Insufficient data").
- Price data is delayed by 24 hours for non-logged-in users (to incentivize registration).
- Dealers see the same data as buyers (transparent market).

---

## 11.6 PAYMENT DOMAIN (F-600 Series)

---

### F-601: Checkout & Payment

**One-liner**: Razorpay-powered checkout with escrow, supporting UPI, cards, net banking, and credit terms for verified businesses.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-601-1 | Buyer | Pay for my order securely via UPI or card | My payment is protected until delivery |
| US-601-2 | Buyer | See a clear order summary before paying | I confirm the amount and items |
| US-601-3 | Buyer | Get an instant payment confirmation | I know my order is being processed |

#### Acceptance Criteria

```
GIVEN a buyer clicks "Proceed to Payment" on an awarded inquiry
WHEN the checkout page loads
THEN they see:
  - Order Summary: items, quantities, per-item prices, subtotal
  - Delivery charges (if any)
  - GST breakdown (if applicable to the product category)
  - Total payable amount
  - Escrow notice: "Your payment is held securely until you confirm delivery"
  - Payment methods: UPI (default), Debit/Credit Card, Net Banking
  - "Pay ₹X" button

GIVEN the buyer clicks "Pay ₹X"
WHEN the Razorpay checkout overlay opens
THEN they complete payment via their chosen method
AND on success:
  - Payment status: CAPTURED
  - Funds held in escrow (Razorpay Route / manual escrow account)
  - Order status: PAID
  - Confirmation page: "Payment successful! ₹X held in escrow. Your order is now being processed."
  - Email + WhatsApp confirmation sent
  - Dealer notified: "New order ORD-XXXXX. Payment confirmed. Please confirm within 24 hours."

GIVEN payment fails
WHEN Razorpay returns a failure
THEN the buyer sees: "Payment failed. Reason: {reason}. Try again?"
AND the order remains in PENDING_PAYMENT status
AND a "Retry Payment" button is shown
AND after 3 failed attempts: "Having trouble? Try a different payment method or contact support."
AND order auto-cancels after 24 hours of PENDING_PAYMENT status
```

#### Business Rules

- Payment gateway: Razorpay (Razorpay Route for escrow-like fund splitting).
- Escrow implementation: Razorpay Route holds funds and releases to dealer's linked account on platform instruction.
- GST: Hub4Estate acts as a marketplace facilitator. GST is charged by the dealer (included in their quote price). Hub4Estate generates a GST-compliant invoice on behalf of the dealer.
- Payment confirmation webhook: Razorpay sends webhook to `/api/v1/payments/webhook`. Verified via webhook signature (SHA256 HMAC).
- Idempotency: Payment creation uses `order_id` as idempotency key to prevent double charges.
- Minimum order value: ₹500 (below this, suggest the buyer combine with other items).
- Maximum single payment: ₹5,00,000 (for larger orders, split into milestone payments).

---

### F-602: Escrow Management

**One-liner**: Automated escrow fund management -- hold on payment, release on delivery confirmation, freeze on dispute.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-602-1 | Buyer | Know my money is safe until I receive goods | I trust the platform with large purchases |
| US-602-2 | Dealer | Know I'll get paid once delivery is confirmed | I fulfill orders with confidence |
| US-602-3 | Admin | See escrow balances and manage exceptions | I handle edge cases (disputes, timeouts) |

#### Acceptance Criteria

```
GIVEN a payment is captured
WHEN funds are held in escrow
THEN the escrow record is created:
  { order_id, amount, status: HELD, held_at: timestamp, expected_release: delivery_date + 72h }

GIVEN the buyer confirms delivery (or auto-confirmation after 72h)
WHEN release is triggered
THEN:
  - Escrow status: RELEASED
  - Razorpay Route transfers funds to dealer's bank account
  - Platform commission (future: 1-2%) is deducted before transfer
  - Settlement typically completes in T+2 business days
  - Both parties notified: "Payment of ₹X released to dealer." / "₹X settled to your bank account."

GIVEN a dispute is raised
WHEN the escrow freeze triggers
THEN:
  - Escrow status: FROZEN
  - No auto-release can occur
  - Admin must manually release or refund based on dispute resolution (F-306)
  - Both parties notified: "Payment is on hold pending dispute resolution."

GIVEN a dispute is resolved in buyer's favor
WHEN admin triggers refund
THEN:
  - Escrow status: REFUNDED
  - Razorpay processes refund to buyer's original payment method
  - Refund SLA: 5-7 business days
  - Dealer is notified: "Dispute resolved. ₹X refunded to buyer."
```

#### Business Rules

- Escrow auto-release: 72 hours after DELIVERED status, IF no dispute is raised.
- Maximum hold duration: 30 days. After 30 days, admin must intervene (either release or refund).
- Partial releases allowed for partial deliveries (proportional to delivered items).
- Escrow balance is shown in the admin financial dashboard (F-307).

---

### F-603: Subscription Billing

**One-liner**: Recurring billing for dealer subscriptions via Razorpay Subscriptions.

#### Acceptance Criteria

```
GIVEN a dealer selects a subscription plan
WHEN they click "Subscribe"
THEN Razorpay Subscription is created with:
  - Plan: Pro (₹999/mo) or Enterprise (₹4,999/mo) or annual equivalents
  - Payment method: auto-debit via UPI/card
  - First charge: immediate (prorated if mid-cycle)
  - Subsequent charges: monthly on the same date

GIVEN a subscription payment fails
WHEN Razorpay retries (3 attempts over 5 days)
THEN:
  - After attempt 1 failure: email warning "Payment failed. Please update payment method."
  - After attempt 2 failure: WhatsApp warning + in-app banner
  - After attempt 3 failure: subscription downgraded to Free tier
  - Quote credits reset to Free tier limits
  - "Reactivate" CTA shown prominently

GIVEN a dealer cancels their subscription
WHEN they confirm cancellation
THEN:
  - Subscription remains active until end of current billing period
  - After expiry, downgrade to Free tier
  - All data retained (nothing deleted)
  - "Resubscribe" option available at any time
```

---

## 11.7 COMMUNITY DOMAIN (F-700 Series)

---

### F-701: Professional Feed

**One-liner**: LinkedIn-style activity feed where users share project updates, material recommendations, and industry news.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-701-1 | User | Post project updates with photos | I showcase my work and build reputation |
| US-701-2 | User | See a feed of posts from people I follow | I stay updated on industry activity |
| US-701-3 | User | Like, comment, and share posts | I engage with the community |

#### Acceptance Criteria

```
GIVEN a user opens the Community Feed
WHEN the page loads
THEN they see a chronological feed of posts from followed users and trending posts
AND each post shows: author name, avatar, role badge, timestamp, content (text + images), like/comment counts
AND users can: Like (heart icon), Comment (text), Share (copy link, WhatsApp share)

GIVEN a user creates a post
WHEN they submit
THEN the post is published to their followers' feeds
AND AI moderation scans the content (flag if inappropriate)
AND posts can include: text (up to 2000 chars), images (up to 4), product tags (@product_name links to product page)
```

#### Business Rules

- Feed algorithm: 70% chronological from followed users, 30% trending/recommended.
- Posts are public by default. No private posts in v1.
- Reporting: any user can report a post. 3+ reports -> auto-hidden + admin review.
- Maximum 10 posts per user per day (anti-spam).

---

### F-702: Professional Directory

**One-liner**: Searchable directory of professionals (electricians, contractors, architects) with profiles, ratings, and contact.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-702-1 | Homeowner | Find a verified electrician near me | I hire someone trustworthy for my project |
| US-702-2 | Professional | Create a profile showcasing my work | I get discovered by potential clients |

#### Acceptance Criteria

```
GIVEN a user searches the professional directory
WHEN they enter a service type and location
THEN results show profiles sorted by rating and proximity:
  - Name, photo, service type, rating, reviews count, location, years of experience
  - "View Profile" opens full profile with: portfolio (project photos), certifications, reviews, contact info
  - "Request Quote" sends a service inquiry to the professional
```

#### Business Rules

- Professionals self-register and are verified via document upload (ID proof + certification if applicable).
- Verification badges: "ID Verified", "Licensed Electrician" (requires valid license upload), "Hub4Estate Vetted" (after 10+ successful platform interactions).
- This is a discovery feature (v1). Full service marketplace (booking, payments) is Phase 2.

---
---

# SECTION 12 -- COMPLETE USER JOURNEY MAPS

Every critical journey is mapped step-by-step below. Each step includes: screen name, URL, key components rendered, data fetched/sent, user actions available, transitions to next screen, and error states.

---

## 12.1 BUYER: First Purchase Journey

This is the golden path -- a new user arrives, registers, finds a product, creates an inquiry, receives quotes, selects a winner, pays, receives goods, and rates the experience.

### Step 1: Landing Page

| Attribute | Value |
|-----------|-------|
| Screen | Landing Page |
| URL | `/` |
| Components | `Hero` (value proposition + search bar), `TrustBar` (10 clients, ₹24K saved, 4 real deals), `HowItWorks` (3-step visual), `CategoryGrid` (top electrical categories), `TestimonialCarousel`, `CTABanner` ("Get the best price -- post your first inquiry") |
| Data Fetched | Categories (cached), testimonials (static), trust metrics (cached) |
| User Actions | Search bar query, click category card, click "Get Started" CTA, click "Sign In" |
| Next Screen | Search query -> Step 6 (Search Results). CTA/Sign In -> Step 2 (Registration). Category card -> Step 7 (Category Page). |
| Error States | None (static page). If API fails for categories, show cached/hardcoded fallback. |

### Step 2: Registration (Auth Modal)

| Attribute | Value |
|-----------|-------|
| Screen | Auth Modal (overlay on current page) |
| URL | `/auth` (or modal on any page) |
| Components | `AuthModal`: Two tabs -- "Continue with Google" (OAuth button) and "Phone Number" (input + OTP). Terms checkbox. |
| Data Sent | Google OAuth: redirect to Google consent. Phone: `POST /api/v1/auth/otp/send { phone: "+91XXXXXXXXXX" }` |
| User Actions | Click Google button, enter phone number, submit OTP |
| Next Screen | Google success / OTP verified -> Step 3 (Phone Verification if Google, or Step 4 if phone). |
| Error States | OAuth popup blocked -> inline message. Invalid phone -> "Enter a valid 10-digit Indian number." OTP expired -> "OTP expired. Resend?" |

### Step 3: Phone Verification (Google OAuth users)

| Attribute | Value |
|-----------|-------|
| Screen | Onboarding Step 1 |
| URL | `/onboarding/verify` |
| Components | `PhoneInput` (pre-filled if available from Google), `OTPInput` (6-digit), "Verify" button, "Resend OTP" link (30s cooldown) |
| Data Sent | `POST /api/v1/auth/otp/send`, `POST /api/v1/auth/otp/verify { phone, otp }` |
| User Actions | Enter phone, submit OTP |
| Next Screen | Verified -> Step 4. |
| Error States | Wrong OTP -> "Incorrect OTP. 2 attempts remaining." 3 failures -> 15-min cooldown. |

### Step 4: Profile Setup

| Attribute | Value |
|-----------|-------|
| Screen | Onboarding Step 2 |
| URL | `/onboarding/profile` |
| Components | `NameInput` (pre-filled from Google), `EmailInput` (pre-filled from Google), `AvatarUpload` (optional), `BuyerTypeSelector` (homeowner, contractor, business, other) |
| Data Sent | `PATCH /api/v1/users/me { name, email, avatar_url, buyer_type }` |
| User Actions | Fill fields, upload avatar, select buyer type, "Continue" |
| Next Screen | Step 5 (Address -- can be skipped). |
| Error States | Duplicate email -> "This email is already registered. Link accounts?" |

### Step 5: Delivery Address (Optional / Skippable)

| Attribute | Value |
|-----------|-------|
| Screen | Onboarding Step 3 |
| URL | `/onboarding/address` |
| Components | `AddressForm` (line 1, line 2, city, state, pin code, landmark), Google Places autocomplete, "Skip for now" link |
| Data Sent | `POST /api/v1/addresses { ...address_fields, is_default: true }` |
| User Actions | Enter address manually or via autocomplete, "Save & Continue" or "Skip" |
| Next Screen | Continue -> Step 6 (Dashboard with onboarding tour). Skip -> Same but with 45% profile instead of 60%. |
| Error States | Invalid pin code -> "Please enter a valid 6-digit pin code." |

### Step 6: Dashboard (First Visit)

| Attribute | Value |
|-----------|-------|
| Screen | Buyer Dashboard |
| URL | `/dashboard` |
| Components | `ProfileCompletionBar` (45-60%), `OnboardingTour` (highlight overlay: Search, Create Inquiry, My Inquiries, Volt AI), `QuickActions` (Browse Catalog, Create Inquiry, Talk to Volt), `RecentActivity` (empty for new user) |
| Data Fetched | `GET /api/v1/users/me/dashboard` |
| User Actions | Follow tour, click quick action, dismiss tour |
| Next Screen | Any quick action or navigation click -> corresponding feature page. |
| Error States | Tour overlay blocks interaction -> "Skip Tour" button always visible. |

### Step 7: Browse & Search

| Attribute | Value |
|-----------|-------|
| Screen | Search / Category Browse |
| URL | `/search?q={query}` or `/categories/{slug}` |
| Components | `SearchBar`, `SearchResults` grid (or `CategoryPage` with subcategories), `FilterPanel`, `SortDropdown` |
| Data Fetched | `GET /api/v1/search?q={query}&category={id}&brand={ids}&price_min=&price_max=&page=1&limit=24` |
| User Actions | Type search, apply filters, click product card, add to wishlist |
| Next Screen | Click product -> Step 8. |
| Error States | Zero results -> suggestions, "Did you mean?", inquiry CTA. Search timeout -> "Search is slow. Retrying..." |

### Step 8: Product Detail

| Attribute | Value |
|-----------|-------|
| Screen | Product Detail Page |
| URL | `/products/{slug}` |
| Components | `ProductImageCarousel`, `ProductInfo` (name, brand, model), `PriceSection` (MRP vs. dealer range), `SpecsTable`, `AddToInquiryButton`, `PriceHistoryChart`, `SimilarProducts`, `ReviewList` |
| Data Fetched | `GET /api/v1/products/{slug}`, `GET /api/v1/products/{id}/price-history`, `GET /api/v1/products/{id}/similar`, `GET /api/v1/products/{id}/reviews?limit=5` |
| User Actions | View images, read specs, check price, "Add to Inquiry", "Set Price Alert", browse similar |
| Next Screen | "Add to Inquiry" -> Step 9 (bottom sheet -> inquiry builder). |
| Error States | Product not found -> 404 page with "Search for similar products." |

### Step 9: Add to Inquiry (Inline)

| Attribute | Value |
|-----------|-------|
| Screen | Bottom Sheet (over product detail) |
| URL | Same as Step 8 (sheet overlay) |
| Components | `InquirySelector` (existing drafts or "New Inquiry"), `QuantityInput`, "Add & Continue Shopping" button, "Go to Inquiry" button |
| Data Sent | `POST /api/v1/inquiries/{id}/items { product_id, quantity, unit }` or `POST /api/v1/inquiries { items: [...] }` for new |
| User Actions | Select inquiry, set quantity, add |
| Next Screen | "Continue Shopping" -> close sheet, stay on product. "Go to Inquiry" -> Step 10. |
| Error States | Profile < 60% -> "Add a delivery address to create inquiries." Inline address form. |

### Step 10: Inquiry Builder

| Attribute | Value |
|-----------|-------|
| Screen | Inquiry Creation / Edit |
| URL | `/inquiries/{id}/edit` |
| Components | `InquiryItemList` (product rows with qty/unit/notes), `AddItemSearch`, `CSVUpload`, `TemplateSelector`, `DeliverySection` (address, timeline, budget), `CostEstimate` sidebar, `SubmitButton` |
| Data Fetched | `GET /api/v1/inquiries/{id}` (if editing draft) |
| Data Sent | `PATCH /api/v1/inquiries/{id}` (auto-save every 10s), `POST /api/v1/inquiries/{id}/publish` (on submit) |
| User Actions | Add/remove items, set quantities, choose delivery address and timeline, review, submit |
| Next Screen | Submit -> Step 11 (Confirmation). |
| Error States | Validation: "Minimum 1 item required.", "Please add a delivery address.", "Please select a timeline." |

### Step 11: Inquiry Confirmation

| Attribute | Value |
|-----------|-------|
| Screen | Inquiry Published Confirmation |
| URL | `/inquiries/{id}` |
| Components | `ConfirmationBanner` ("Inquiry INQ-XXXXX published!"), `InquirySummary` (items, address, timeline), `ExpectedTimeline` ("Dealers are being notified. Expect quotes within 24-48 hours."), `WhatsAppShareButton`, `BackToDashboardLink` |
| Data | Status: PUBLISHED, notification jobs triggered |
| User Actions | Share via WhatsApp, go to dashboard, browse more products |
| Next Screen | Dashboard -> Step 12 (wait for quotes). |
| Error States | None (confirmation is post-success). |

### Step 12: Waiting for Quotes

| Attribute | Value |
|-----------|-------|
| Screen | Inquiry Detail (during quoting phase) |
| URL | `/inquiries/{id}` |
| Components | `InquiryStatusBanner` ("3 quotes received. Deadline in 18 hours."), `QuoteCountIndicator` (real-time via Socket.io), `ItemList`, `DeliveryInfo`, `StatusTimeline` (Published -> Quoting -> ...) |
| Data Fetched | `GET /api/v1/inquiries/{id}`, WebSocket subscription `inquiry:{id}` |
| User Actions | Wait, check back, click "View Quotes" when available |
| Next Screen | "View Quotes" -> Step 13. |
| Error States | 0 quotes after 48 hours -> "No quotes received. This may be due to limited dealer coverage. Re-publish with broader criteria?" |

### Step 13: Quote Comparison (Blind Phase)

| Attribute | Value |
|-----------|-------|
| Screen | Quote Comparison Page |
| URL | `/inquiries/{id}/quotes` |
| Components | `AIRecommendation` card (if 3+ quotes), `QuoteCardList` (anonymous: Dealer A, B, C...), `CompareButton`, `SavingsCalculator` sidebar |
| Data Fetched | `GET /api/v1/inquiries/{id}/quotes` (returns anonymized quote data) |
| User Actions | Review quotes, compare side-by-side, read AI recommendation, select winner |
| Next Screen | "Select This Quote" -> Step 14. |
| Error States | Only 1 quote -> "Only 1 quote received. Wait for more or select this one." No AI recommendation below 3 quotes. |

### Step 14: Quote Selection & Identity Reveal

| Attribute | Value |
|-----------|-------|
| Screen | Selection Confirmation Modal -> Identity Reveal Page |
| URL | Modal on `/inquiries/{id}/quotes` -> `/inquiries/{id}/awarded` |
| Components | `ConfirmationModal` ("You are selecting Dealer B's quote for ₹X. This action is final. Proceed?"), `DealerRevealCard` (actual dealer name, rating, contact, GST, address), `OrderSummary`, "Proceed to Payment" button |
| Data Sent | `POST /api/v1/inquiries/{id}/select { quote_id }` |
| Data Fetched | `GET /api/v1/quotes/{id}/dealer` (reveals dealer identity) |
| User Actions | Confirm selection, view dealer info, proceed to payment |
| Next Screen | "Proceed to Payment" -> Step 15. |
| Error States | Quote withdrawn before selection -> "This quote is no longer available. Please select another." Reload quotes. |

### Step 15: Checkout & Payment

| Attribute | Value |
|-----------|-------|
| Screen | Checkout Page |
| URL | `/orders/{id}/checkout` |
| Components | `OrderSummary` (items, quantities, prices, delivery, total), `EscrowNotice`, `PaymentMethodSelector` (UPI, Card, Net Banking), `PayButton` ("Pay ₹X"), `RazorpayOverlay` (on click) |
| Data Sent | `POST /api/v1/payments/create { order_id, amount }` -> Razorpay order. Then Razorpay handles payment. Webhook: `POST /api/v1/payments/webhook` |
| User Actions | Review order, select payment method, pay |
| Next Screen | Payment success -> Step 16. Payment failure -> retry on same page. |
| Error States | Payment failed -> "Payment failed: {reason}. Try again?" Auto-cancel after 24 hours if not paid. |

### Step 16: Payment Confirmation

| Attribute | Value |
|-----------|-------|
| Screen | Payment Success Page |
| URL | `/orders/{id}/confirmed` |
| Components | `SuccessBanner` (green checkmark, "Payment successful!"), `OrderSummary`, `EscrowStatus` ("₹X held securely until delivery"), `ExpectedDelivery`, `DealerContact`, "Track Order" button, "Continue Shopping" button |
| Data | Order status: PAID. Escrow status: HELD. Dealer notified. |
| User Actions | Track order, go to dashboard, continue shopping |
| Next Screen | "Track Order" -> Step 17. |

### Step 17: Order Tracking

| Attribute | Value |
|-----------|-------|
| Screen | Order Detail & Tracking |
| URL | `/orders/{id}` |
| Components | `OrderTimeline` (vertical: Order Placed -> Paid -> Dealer Confirmed -> Dispatched -> In Transit -> Delivered), `OrderItems`, `DealerInfo`, `TrackingInfo` (tracking number, delivery partner link), `ActionButtons` (Contact Dealer, Report Issue) |
| Data Fetched | `GET /api/v1/orders/{id}`, WebSocket subscription `order:{id}` |
| User Actions | Track, contact dealer, report issue |
| Next Screen | Status becomes DELIVERED -> Step 18. |
| Error States | Dealer not confirmed after 24h -> "Dealer confirmation pending. Our team is looking into it." |

### Step 18: Delivery Confirmation & Rating

| Attribute | Value |
|-----------|-------|
| Screen | Delivery Confirmation Modal -> Rating Modal |
| URL | `/orders/{id}` with modal overlay |
| Components | `DeliveryConfirmModal` ("Confirm you received all items?" Yes / Report Issue), `RatingModal` (1-5 stars for: overall, delivery speed, product quality, communication + text review) |
| Data Sent | `POST /api/v1/orders/{id}/confirm`, `POST /api/v1/orders/{id}/review { rating, text }` |
| User Actions | Confirm delivery, rate experience, submit review |
| Next Screen | Submit -> Step 19 (Order Complete). |
| Error States | "Report Issue" -> Dispute flow (see 12.5). |

### Step 19: Order Complete

| Attribute | Value |
|-----------|-------|
| Screen | Order Complete Page |
| URL | `/orders/{id}` (status: COMPLETED) |
| Components | `CompleteBanner` ("Order complete! You saved ₹X (Y% below MRP)"), `SavingsBreakdown`, `ReviewPosted` (their review shown), `ReorderButton` ("Need this again?"), `ReferralPrompt` ("Know someone who needs this? Share Hub4Estate.") |
| Data | Order COMPLETED. Escrow RELEASED (auto after 72h or on confirm). |
| User Actions | Reorder (creates duplicate inquiry), share referral, go to dashboard |
| Next Screen | Reorder -> Step 10 (Inquiry Builder with pre-filled items). Dashboard -> Step 6. |

---

## 12.2 DEALER: First Sale Journey

### Step 1: Dealer Landing

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Landing Page |
| URL | `/dealer` or `/for-dealers` |
| Components | `DealerHero` ("Reach more buyers. Grow your business."), `BenefitCards` (more inquiries, transparent platform, easy tools), `PricingTable` (subscription plans), `SuccessStories`, `RegisterCTA` |
| User Actions | Click "Register as Dealer" |
| Next Screen | Step 2 (Registration). |

### Step 2: Phone Verification

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Registration Step 1 |
| URL | `/dealer/register` |
| Components | `PhoneInput`, `OTPInput`, progress bar (Step 1 of 8) |
| Data Sent | `POST /api/v1/auth/otp/send`, `POST /api/v1/auth/otp/verify` |
| Next Screen | Verified -> Step 3. |

### Step 3: Business Details & GST

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Registration Step 2-3 |
| URL | `/dealer/register/business` |
| Components | `GSTInput` (15-character input with format validation: XX-AAAAA-XXXX-A-X-Z-X), `BusinessNameInput` (auto-fills on GST entry), `OwnerNameInput`, `EmailInput`, `GSTVerificationCard` (shows fetched GST details) |
| Data Sent | `POST /api/v1/dealers/verify-gst { gst_number }` -> returns GST details from government API |
| User Actions | Enter GST, review auto-fetched details, confirm ("This is my business") or reject (manual entry) |
| Next Screen | Confirmed -> Step 4. Rejected -> manual entry flagged for admin review, then Step 4. |
| Error States | Invalid GST format -> inline validation. GST not found -> "GST not found in government records. Please check the number." API down -> "Verification service temporarily unavailable. Please enter details manually." |

### Step 4: Document Upload

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Registration Step 4 |
| URL | `/dealer/register/documents` |
| Components | `FileUploader` for: Trade License (optional), PAN Card (required), Business Photos (min 2: storefront + warehouse/stock), Owner Photo (optional). Progress bar, drag-drop + camera capture on mobile. |
| Data Sent | `POST /api/v1/upload` (multipart/form-data, returns URL). `PATCH /api/v1/dealers/me/kyc { documents: [...urls] }` |
| Next Screen | Step 5. |
| Error States | File too large (>10MB) -> "File exceeds 10MB limit. Please compress." Unsupported format -> "Please upload JPEG, PNG, or PDF." |

### Step 5: Categories & Brands

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Registration Step 5 |
| URL | `/dealer/register/catalog` |
| Components | `CategoryTree` (checkbox tree: Electrical > Wiring > Copper/Aluminium, Electrical > Switches > Modular/Regular, etc.), `BrandAutocomplete` (multi-select: Havells, Polycab, Anchor, Legrand, etc.) |
| Data Sent | `PATCH /api/v1/dealers/me { category_ids: [...], brand_ids: [...] }` |
| Next Screen | Step 6. |

### Step 6: Service Area

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Registration Step 6 |
| URL | `/dealer/register/coverage` |
| Components | `PinCodeInput` (multi-entry, comma-separated), `CityAutocomplete` (alternative: select cities), `MapPreview` (shows coverage area on map), `DeliveryRadiusSlider` (5km, 10km, 25km, 50km, state-wide) |
| Data Sent | `PATCH /api/v1/dealers/me { service_pincodes: [...], delivery_radius_km: X }` |
| Next Screen | Step 7. |
| Error States | No area selected -> "Please add at least one service area." |

### Step 7: Bank Details

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Registration Step 7 |
| URL | `/dealer/register/bank` |
| Components | `IFSCInput` (auto-fetches bank name + branch), `AccountNumberInput` (double entry for verification), `AccountHolderName`, `PennyDropStatus` (verifying... verified / failed) |
| Data Sent | `POST /api/v1/dealers/me/bank-account { ifsc, account_number, holder_name }` -> triggers penny drop |
| Next Screen | Penny drop success -> Step 8. Failure -> retry or manual verification option. |
| Error States | IFSC not found -> "Invalid IFSC code." Account number mismatch (double entry) -> "Account numbers don't match." Penny drop fails -> "Bank verification failed after 3 attempts. Please upload a cancelled cheque for manual verification." |

### Step 8: Subscription Selection

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Registration Step 8 |
| URL | `/dealer/register/plan` |
| Components | `PlanCards` (Free / Pro ₹999/mo / Enterprise ₹4,999/mo), feature comparison table, `MonthlyAnnualToggle`, `SubscribeButton`, `PaymentForm` (Razorpay for paid plans) |
| Data Sent | Free: `PATCH /api/v1/dealers/me { subscription_tier: "FREE" }`. Paid: `POST /api/v1/subscriptions/create { plan_id, payment_method }` |
| Next Screen | Step 9 (Verification Status). |

### Step 9: Verification Status

| Attribute | Value |
|-----------|-------|
| Screen | Registration Complete / Pending Verification |
| URL | `/dealer/register/status` |
| Components | If auto-verified (GST active): `SuccessBanner` ("You're verified! Go to dashboard.") + `GoToDashboardButton`. If pending review: `PendingBanner` ("Verification in progress. Expected: 24-48 hours.") + `ProgressTimeline` (submitted -> under review -> approved/rejected). |
| Next Screen | Auto-verified -> Step 10 (Dashboard). Pending -> wait for email/WhatsApp notification -> Step 10 on approval. |

### Step 10: Dealer Dashboard (First Visit)

| Attribute | Value |
|-----------|-------|
| Screen | Dealer Dashboard |
| URL | `/dealer/dashboard` |
| Components | `WelcomeBanner` ("Welcome! Complete these steps to start receiving inquiries."), `SetupChecklist` (upload inventory, verify bank, set pricing), `DashboardMetrics` (all zeros for new dealer), `InquiryFeedPreview` |
| Next Screen | Complete setup checklist -> Step 11 (Inventory Upload). |

### Step 11: Inventory Upload

| Attribute | Value |
|-----------|-------|
| Screen | Inventory Management |
| URL | `/dealer/inventory` |
| Components | `InventoryTable` (empty for new dealer), `CSVUploadButton` + `DownloadTemplateButton`, `AddProductButton` (manual), `CSVReviewScreen` |
| Data Sent | `POST /api/v1/dealers/me/inventory/bulk { csv_file }` or `POST /api/v1/dealers/me/inventory { product_id, quantity, cost_price, selling_price }` |
| Next Screen | Inventory uploaded -> Dashboard. Inquiries start matching. -> Step 12. |

### Step 12: First Inquiry Match

| Attribute | Value |
|-----------|-------|
| Screen | Inquiry Feed |
| URL | `/dealer/inquiries` |
| Components | `InquiryCard` list (blind: product requirements, delivery location, timeline, fulfillment match %), `FilterBar` (category, urgency, match %), `SortDropdown` |
| Data Fetched | `GET /api/v1/dealer/inquiries/matched` |
| User Actions | Read inquiry details, click "Submit Quote" |
| Next Screen | "Submit Quote" -> Step 13. |

### Step 13: Quote Submission

| Attribute | Value |
|-----------|-------|
| Screen | Quote Builder |
| URL | `/dealer/inquiries/{id}/quote` |
| Components | `QuoteItemList` (per-item: product name, qty, your price input, market range indicator, margin calc), `DeliveryTerms` (timeline dropdown, delivery charge), `PaymentTerms`, `NotesTextarea`, `AIPricingSuggestion`, `TotalSummary`, `SubmitButton` |
| Data Sent | `POST /api/v1/dealer/quotes { inquiry_id, items: [{product_id, unit_price, ...}], delivery_days, delivery_charge, payment_terms, notes }` |
| Next Screen | Submit -> Step 14 (Confirmation). |
| Error States | Quote credits exhausted -> "Upgrade your plan to submit more quotes." Price below 0 -> validation. |

### Step 14: Quote Submitted / Waiting

| Attribute | Value |
|-----------|-------|
| Screen | Quote Confirmation + Waiting |
| URL | `/dealer/quotes/{id}` |
| Components | `ConfirmationBanner` ("Quote submitted for INQ-XXXXX"), `QuoteSummary`, `StatusIndicator` ("Waiting for buyer's decision"), `TimelineEstimate` |
| Data | WebSocket subscription for `quote:{quote_id}` status updates |
| Next Screen | Quote selected (won) -> Step 15. Quote not selected (lost) -> anonymized feedback card. |

### Step 15: Quote Won -- Identity Reveal

| Attribute | Value |
|-----------|-------|
| Screen | Won Notification + Buyer Reveal |
| URL | `/dealer/orders/{id}` |
| Components | `WonBanner` ("Congratulations! Your quote was selected for INQ-XXXXX."), `BuyerRevealCard` (buyer name, phone, email, delivery address -- NOW REVEALED), `OrderDetails` (items, quantities, agreed prices), `ConfirmOrderButton` ("Confirm order within 24 hours"), `RejectOrderButton` (with penalty warning) |
| Data Fetched | `GET /api/v1/dealer/orders/{id}` (includes buyer identity) |
| Data Sent | `POST /api/v1/dealer/orders/{id}/confirm` |
| Next Screen | Confirm -> Step 16. |
| Error States | If not confirmed in 24h -> escalation warning. If rejected -> penalty to dealer rating + buyer notified. |

### Step 16: Order Fulfillment

| Attribute | Value |
|-----------|-------|
| Screen | Order Fulfillment Dashboard |
| URL | `/dealer/orders/{id}` |
| Components | `OrderStatusTimeline`, `BuyerInfo`, `ItemCheckList` (check off items as packed), `DispatchForm` (tracking number, delivery partner, expected date), `MarkDispatchedButton` |
| Data Sent | `POST /api/v1/dealer/orders/{id}/dispatch { tracking_number, delivery_partner, expected_delivery_date }` |
| Next Screen | Dispatched -> Step 17 (wait for delivery). |

### Step 17: Delivery & Settlement

| Attribute | Value |
|-----------|-------|
| Screen | Order Tracking (Dealer View) |
| URL | `/dealer/orders/{id}` |
| Components | `OrderTimeline` (Dispatched -> In Transit -> Delivered -> Completed), `SettlementInfo` ("₹X will be settled to your bank account T+2 after buyer confirmation"), `SettlementStatusIndicator` |
| Data | WebSocket subscription for order status and settlement status |
| Next Screen | Buyer confirms delivery -> Escrow released -> Settlement initiated -> Step 18. |

### Step 18: Payment Received & Review

| Attribute | Value |
|-----------|-------|
| Screen | Order Complete (Dealer View) |
| URL | `/dealer/orders/{id}` |
| Components | `CompleteBanner` ("Order complete! ₹X settled to your bank account."), `SettlementDetails` (amount, deductions, net, transaction ID), `BuyerReview` (the review buyer left), `PerformanceImpact` ("Your rating: 4.5/5. Win rate: 45%.") |
| User Actions | View review, go to dashboard, browse more inquiries |

---

## 12.3 INQUIRY LIFECYCLE (System-Level)

This documents the complete lifecycle of an inquiry from the system's perspective, including all background processes.

### Phase 1: Creation

```
1. Buyer creates inquiry (F-104)
   -> POST /api/v1/inquiries { items, address, timeline, budget_range? }
   -> Status: DRAFT
   -> Auto-save every 10s via PATCH

2. Buyer publishes inquiry
   -> POST /api/v1/inquiries/{id}/publish
   -> Validation: min 1 item, address set, timeline set, buyer profile >= 60%
   -> Status: DRAFT -> PUBLISHED
   -> Inquiry ID assigned: INQ-{YYYYMM}-{seq}
   -> Timestamp: published_at
```

### Phase 2: Smart Matching

```
3. BullMQ job: InquiryMatchingJob triggered
   -> Input: inquiry items, categories, delivery pincode, timeline
   -> Algorithm:
     a. Find all dealers where:
        - dealer.status = ACTIVE
        - dealer.category_ids INTERSECT inquiry.category_ids (>= 50% overlap)
        - dealer.service_pincodes CONTAINS inquiry.delivery_pincode (or within radius)
        - dealer.subscription.quota_remaining > 0
     b. Score each dealer:
        - Category overlap: 40%
        - Service area proximity: 30%
        - Historical performance (win rate, rating): 20%
        - Subscription tier priority: 10%
     c. Select top 15 dealers (or fewer if less available)
     d. Create `inquiry_dealer_matches` records
   -> Status: PUBLISHED -> QUOTING
   -> Timestamp: matching_completed_at
```

### Phase 3: Dealer Notification

```
4. For each matched dealer:
   -> Create notification record
   -> Send in-app notification (Socket.io push to dealer:{dealer_id})
   -> Send WhatsApp (if opted in): "New inquiry matches your catalog. {N} items, delivery to {city}. Quote deadline: {deadline}. View now: {link}"
   -> Send email: same content
   -> Set quote_deadline: NOW + duration_by_urgency (Urgent: 24h, Standard: 48h, Flexible: 7d)
```

### Phase 4: Quoting Period

```
5. Dealers view inquiry (F-203) -- blind, no buyer identity
6. Dealers submit quotes (F-204)
   -> POST /api/v1/dealer/quotes { inquiry_id, items, delivery_days, ... }
   -> Quote status: SUBMITTED
   -> Buyer notified in real-time: "New quote received for INQ-XXXXX"
   -> Quote count incremented in buyer's dashboard

7. Background monitoring:
   -> If all 15 matched dealers have submitted (or max_quotes reached): early close
   -> If deadline reached: auto-close quoting
   -> Status: QUOTING -> QUOTED
   -> Timestamp: quoting_closed_at
```

### Phase 5: AI Evaluation

```
8. BullMQ job: QuoteEvaluationJob triggered
   -> For each quote, calculate Hub4Estate Score:
     price_score = 1 - ((price - min_price) / (max_price - min_price))
     delivery_score = 1 - ((days - min_days) / (max_days - min_days))
     rating_score = dealer.rating / 5.0
     fulfillment_score = items_quoted / total_items
     h4e_score = (0.40 * price_score) + (0.25 * delivery_score) + (0.20 * rating_score) + (0.15 * fulfillment_score)
   -> Rank quotes by h4e_score DESC
   -> Store in quote_evaluations table

9. If quotes >= 3: AI recommendation generated
   -> Claude API call with structured data:
     System: "You are Hub4Estate's procurement advisor..."
     Input: { quotes: [...anonymized], inquiry_details, dealer_histories }
     Output: { recommended_quote_id, reasoning, risk_factors }
   -> Store in ai_recommendations table
   -> Buyer notified: "AI recommendation ready for INQ-XXXXX"
```

### Phase 6: Buyer Selection

```
10. Buyer reviews quotes (F-106) -- blind phase
    -> GET /api/v1/inquiries/{id}/quotes -> anonymized data
    -> Compare side-by-side
    -> Read AI recommendation

11. Buyer selects winning quote
    -> POST /api/v1/inquiries/{id}/select { quote_id }
    -> Status: QUOTED -> AWARDED
    -> Timestamp: awarded_at

12. Identity reveal:
    -> Buyer sees dealer identity: name, contact, GST, address
    -> Winning dealer sees buyer identity: name, contact, delivery address
    -> Losing dealers receive anonymized feedback:
      "Your quote was not selected. Rank: #X of Y. Winning price range: ₹A-₹B (±5%)."
    
13. Order auto-created:
    -> POST /api/v1/orders (internal)
    -> { inquiry_id, quote_id, buyer_id, dealer_id, items, total, status: PENDING_PAYMENT }
```

### Phase 7: Payment & Escrow

```
14. Buyer proceeds to checkout (F-601)
    -> POST /api/v1/payments/create { order_id, amount }
    -> Razorpay order created
    -> Buyer completes payment via Razorpay checkout

15. Payment webhook received
    -> POST /api/v1/payments/webhook (Razorpay signature verified)
    -> Payment status: CAPTURED
    -> Order status: PENDING_PAYMENT -> PAID
    -> Escrow created: { order_id, amount, status: HELD }
    -> Dealer notified: "New order. Payment confirmed. Confirm within 24h."
```

### Phase 8: Fulfillment

```
16. Dealer confirms order
    -> POST /api/v1/dealer/orders/{id}/confirm
    -> Order status: PAID -> DEALER_CONFIRMED
    -> Buyer notified: "Dealer confirmed your order. Preparing for dispatch."
    -> If not confirmed in 24h: auto-escalate to admin

17. Dealer dispatches
    -> POST /api/v1/dealer/orders/{id}/dispatch { tracking_number?, expected_delivery }
    -> Order status: DEALER_CONFIRMED -> DISPATCHED
    -> Buyer notified: "Order dispatched! Expected delivery: {date}."

18. Delivery status updates
    -> If tracking number: poll logistics API every 4 hours
    -> Or dealer manually updates: IN_TRANSIT -> DELIVERED
    -> Buyer notified at each status change
```

### Phase 9: Completion

```
19. Buyer confirms delivery (or auto-confirm after 72h)
    -> POST /api/v1/orders/{id}/confirm
    -> Order status: DELIVERED -> COMPLETED
    -> Escrow status: HELD -> RELEASED
    -> Razorpay Route transfer initiated to dealer's bank account (minus commission)
    -> Settlement SLA: T+2 business days

20. Rating & review
    -> POST /api/v1/orders/{id}/review { rating, text }
    -> Dealer rating recalculated (weighted moving average)
    -> Review stored and displayed on dealer profile

21. Price index update
    -> BullMQ job: PriceIndexUpdateJob
    -> Quote prices from this inquiry feed into product_price_history
    -> City-level and national price indices recalculated
    -> Stored in price_index table

22. Analytics update
    -> Buyer's savings metrics updated
    -> Dealer's win rate, revenue, performance metrics updated
    -> Platform GMV, inquiry volume, etc. updated
```

### Phase: Expiry / Cancellation

```
EXPIRY:
  -> If PUBLISHED for 7 days with 0 quotes: Status -> EXPIRED
  -> Buyer notified: "Your inquiry expired with no quotes. Re-publish with broader criteria?"
  -> Re-publish creates a new inquiry with same items

CANCELLATION:
  -> Buyer can cancel if status is DRAFT, PUBLISHED, or QUOTING
  -> POST /api/v1/inquiries/{id}/cancel
  -> Status -> CANCELLED
  -> All matched dealers notified: "Inquiry INQ-XXXXX has been cancelled."
  -> Cannot cancel after AWARDED (must go through order cancellation flow)
```

---

## 12.4 PAYMENT JOURNEY (Detailed)

### Happy Path

```
Step 1: Order Created (post-quote-selection)
  -> order.status = PENDING_PAYMENT
  -> payment_deadline = NOW + 24 hours

Step 2: Buyer clicks "Proceed to Payment"
  -> Frontend calls: POST /api/v1/payments/create { order_id }
  -> Backend creates Razorpay order: razorpay.orders.create({ amount_in_paise, currency: "INR", receipt: order_id })
  -> Returns: { razorpay_order_id, amount, key_id }

Step 3: Razorpay Checkout Opens
  -> Frontend initializes Razorpay checkout with order_id
  -> Buyer selects payment method (UPI / Card / Net Banking)
  -> Completes payment within Razorpay's UI

Step 4: Payment Success Callback
  -> Razorpay returns: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
  -> Frontend sends to: POST /api/v1/payments/verify { payment_id, order_id, signature }
  -> Backend verifies signature: SHA256_HMAC(razorpay_order_id + "|" + razorpay_payment_id, razorpay_key_secret)
  -> If valid:
    payment.status = CAPTURED
    order.status = PAID
    escrow = { order_id, amount, status: HELD, held_at: NOW }

Step 5: Escrow Hold
  -> Funds are held via Razorpay Route (linked account model) or manual escrow account
  -> Dashboard shows: "₹X held in escrow until delivery confirmation"

Step 6: Delivery Confirmed (by buyer or auto after 72h)
  -> Escrow release triggered:
    POST /api/v1/escrow/{id}/release (internal)
    -> Razorpay Route transfer: razorpay.transfers.create({ amount: order_amount - commission, account: dealer_bank_account_id })
    -> commission = order_amount * commission_rate (currently 0%, future 1-2%)
    -> escrow.status = RELEASED
    -> settlement.status = INITIATED
    -> Typical settlement: T+2 business days

Step 7: Settlement Complete
  -> Razorpay webhook: transfer.settled
  -> settlement.status = COMPLETED
  -> Dealer notified: "₹X settled to your bank account."
```

### Failure Scenarios

```
PAYMENT FAILURE:
  -> Razorpay returns error (insufficient funds, card declined, UPI timeout)
  -> order.status remains PENDING_PAYMENT
  -> Buyer sees: "Payment failed: {reason}. Try again with same or different method."
  -> Retry limit: 5 attempts
  -> After 24 hours: order auto-cancelled, escrow not created, dealer notified

PAYMENT PENDING (UPI):
  -> Some UPI payments take time (pending state)
  -> Status: PAYMENT_PENDING
  -> Poll Razorpay every 30s for up to 10 minutes
  -> If captured: proceed as normal
  -> If failed after 10 min: show failure UI

DOUBLE PAYMENT:
  -> Idempotency key: order_id used as receipt in Razorpay
  -> Razorpay rejects duplicate orders
  -> If duplicate payment somehow captured: auto-refund the second payment, log incident

REFUND (dispute resolved in buyer's favor):
  -> POST /api/v1/payments/{id}/refund { amount, reason }
  -> Razorpay refund: razorpay.payments.refund(payment_id, { amount })
  -> Refund SLA: 5-7 business days to buyer's original payment method
  -> escrow.status = REFUNDED
  -> Buyer notified: "Refund of ₹X initiated. Expected in 5-7 business days."
  -> Dealer notified: "Dispute resolved. ₹X refunded to buyer."

PARTIAL REFUND (partial delivery dispute):
  -> Same as full refund but with partial amount
  -> Remaining amount released to dealer
  -> escrow.status = PARTIALLY_REFUNDED
```

---

## 12.5 DISPUTE RESOLUTION JOURNEY

### Buyer Raises Dispute

```
Step 1: Buyer clicks "Report Issue" on order page
  -> URL: /orders/{id}/dispute
  -> Components: IssueTypeSelector, EvidenceUploader, DescriptionTextarea
  -> Issue types:
    - DAMAGED: "Items arrived damaged"
    - WRONG_ITEM: "Received wrong product"
    - SHORT_QUANTITY: "Received fewer items than ordered"
    - NOT_DELIVERED: "Order shows delivered but I didn't receive it"
    - QUALITY: "Product quality doesn't match listing"
    - OTHER: free text

Step 2: Buyer submits evidence
  -> POST /api/v1/disputes { order_id, issue_type, description, evidence_urls[] }
  -> Evidence: up to 5 photos + 1 video (max 50MB total)
  -> dispute.status = OPENED
  -> order.status = DISPUTED
  -> escrow.status = FROZEN (blocks auto-release)
  -> Buyer confirmation: "Dispute #DSP-XXXXX raised. Our team will review within 4 hours."

Step 3: Dealer notified
  -> "Dispute raised on order ORD-XXXXX. Issue: {type}. Please provide your evidence."
  -> Dealer uploads counter-evidence via /dealer/orders/{id}/dispute
  -> POST /api/v1/disputes/{id}/response { dealer_evidence_urls[], dealer_description }
  -> dispute.status = OPENED -> DEALER_RESPONDED

Step 4: Admin reviews
  -> Admin dashboard: dispute queue sorted by age (oldest first)
  -> Admin sees: all evidence from both sides, order history, communication log
  -> Admin can: message either party for clarification, request more evidence

Step 5: Resolution
  -> Admin selects resolution:
    a. FULL_REFUND: escrow returned to buyer. Dealer gets nothing.
       -> POST /api/v1/disputes/{id}/resolve { resolution: "FULL_REFUND" }
       -> dispute.status = RESOLVED_BUYER_FAVOR
       -> Triggers refund flow (see 12.4)
    
    b. PARTIAL_REFUND: specify amount. Rest goes to dealer.
       -> resolution: "PARTIAL_REFUND", refund_amount: X
       -> dispute.status = RESOLVED_PARTIAL

    c. REPLACEMENT: dealer sends replacement at own cost.
       -> resolution: "REPLACEMENT"
       -> New shipment tracked
       -> Escrow held until replacement delivered
       -> dispute.status = RESOLVED_REPLACEMENT

    d. DISMISSED: dispute invalid. Escrow released to dealer.
       -> resolution: "DISMISSED"
       -> dispute.status = RESOLVED_DEALER_FAVOR
       -> Escrow unfrozen and released

    e. ESCALATE: complex case, senior review.
       -> dispute.status = ESCALATED

Step 6: Post-resolution
  -> Both parties notified with decision and reasoning
  -> Appeal window: 7 days. Buyer or dealer can appeal once.
  -> If valid dispute (a, b, or c): dealer rating -0.2 per incident
  -> 3+ valid disputes in 90 days: dealer flagged for tier review
  -> Resolution logged in audit_logs
```

---

## 12.6 DEALER ONBOARDING (Detailed Form Fields)

### Step 1: Phone Verification

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Phone Number | tel | Indian format: +91 followed by 10 digits, starts with 6-9 | Yes |
| OTP | number | 6 digits, expires in 5 minutes | Yes |

### Step 2: Business Details

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| GST Number | text | Regex: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` | Yes |
| Business Name | text | Auto-filled from GST API. Min 3 chars, max 200. | Yes |
| Owner Full Name | text | Min 2 chars, max 100. | Yes |
| Email | email | Standard email validation. | Yes |
| Business Phone | tel | Can differ from registration phone. Indian format. | No |
| Business Address | textarea | Auto-filled from GST API. Editable. | Yes |
| City | text | Auto-filled from GST. | Yes |
| State | text | Auto-filled from GST. | Yes |
| Pin Code | text | 6 digits. | Yes |

### Step 3: GST Verification Display

| Field (read-only, from API) | Shown |
|-----------------------------|-------|
| Legal Name | Yes |
| Trade Name | Yes |
| GST Status | Yes (Active / Inactive / Cancelled) |
| Registration Date | Yes |
| Business Type | Yes (Regular, Composition, etc.) |
| Principal Place of Business | Yes |
| HSN/SAC Codes | Yes |

Dealer action: "Is this your business?" [Yes, Confirm] [No, Enter Manually]

### Step 4: Documents

| Document | Format | Max Size | Required |
|----------|--------|---------|----------|
| PAN Card | JPEG, PNG, PDF | 5MB | Yes |
| Trade License | JPEG, PNG, PDF | 5MB | No (recommended) |
| Business Photo 1 (storefront) | JPEG, PNG | 10MB | Yes |
| Business Photo 2 (stock/warehouse) | JPEG, PNG | 10MB | Yes |
| Additional Photos | JPEG, PNG | 10MB each, max 5 | No |
| Cancelled Cheque (if penny drop fails) | JPEG, PNG, PDF | 5MB | Conditional |

### Step 5: Categories & Brands

| Field | Type | Options |
|-------|------|---------|
| Product Categories | Multi-select tree | Wires & Cables, Switches & Sockets, MCBs & Distribution, Lighting, Fans & Ventilation, Conduits & Accessories, Earthing & Safety, Industrial Electricals |
| Brands | Multi-select autocomplete | Havells, Polycab, Anchor/Panasonic, Legrand, Schneider, Siemens, ABB, Finolex, RR Kabel, KEI, Syska, Philips, Crompton, Orient, Bajaj, and 50+ more |
| Authorized Dealer | Per brand: checkbox "I am an authorized dealer for this brand" | Boolean per brand |

### Step 6: Service Area

| Field | Type | Validation |
|-------|------|-----------|
| Service Pin Codes | Multi-input | Valid 6-digit Indian pin codes. Min 1. |
| OR City Selection | Multi-select | Dropdown of supported cities. |
| Delivery Radius | Slider | 5 / 10 / 25 / 50 / 100 / State-wide km |
| Delivery Capabilities | Multi-select | "Self Delivery", "Courier Partner", "Buyer Pickup Available" |
| Minimum Order Value for Free Delivery | Currency | ₹ amount, optional |

### Step 7: Bank Details

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| IFSC Code | text | 11 chars: `^[A-Z]{4}0[A-Z0-9]{6}$` | Yes |
| Bank Name | text | Auto-filled from IFSC. Read-only. | Yes (auto) |
| Branch Name | text | Auto-filled from IFSC. Read-only. | Yes (auto) |
| Account Number | number | 9-18 digits | Yes |
| Confirm Account Number | number | Must match Account Number | Yes |
| Account Holder Name | text | Should match business name or owner name | Yes |
| Account Type | select | Current / Savings | Yes |

### Step 8: Subscription

| Plan | Monthly | Annual (20% off) | Features Summary |
|------|---------|-------------------|-----------------|
| Free | ₹0 | ₹0 | 10 quotes/mo, basic analytics, standard feed priority |
| Pro | ₹999 | ₹9,590 (₹799/mo) | 50 quotes/mo, advanced analytics, high feed priority, AI pricing, CRM, Pro badge |
| Enterprise | ₹4,999 | ₹47,990 (₹3,999/mo) | Unlimited quotes, premium analytics + export, highest priority, dedicated support, API access, Enterprise badge |

---

## 12.7 AI ASSISTANT JOURNEY (Volt AI)

### Happy Path: User Needs Help with 3BHK Wiring

```
Step 1: User opens Volt AI chat
  -> Click chat icon (bottom-right FAB) or "Talk to Volt" from dashboard
  -> Chat interface slides in (right panel desktop, full screen mobile)
  -> URL: /chat or panel overlay

Step 2: Greeting
  -> Volt: "Hi! I'm Volt, your procurement assistant at Hub4Estate. I can help you:
     - Find the right products for your project
     - Estimate costs
     - Compare options
     - Create an inquiry instantly
     What are you working on?"
  -> Suggested quick prompts shown as chips: "3BHK wiring list", "Compare MCB brands", "Estimate shop electrical cost"

Step 3: User asks
  -> User: "I'm doing electrical work for a 3BHK flat, about 1200 sq ft. What all do I need?"

Step 4: Volt processes
  -> Claude API call:
     System prompt: "You are Volt, Hub4Estate's procurement expert..."
     User message: above
     Available tools: search_catalog, get_price_range, create_draft_inquiry
  -> Volt uses internal knowledge of Indian construction standards (IS 732)

Step 5: Volt responds with BOQ
  -> Volt: "Great! For a standard 3BHK flat (1200 sq ft), here's what you'll need for electrical work:

     **WIRING**
     | Item | Spec | Qty | Est. Price |
     |------|------|-----|-----------|
     | FRLS Wire 1.5mm² | Havells/Polycab, 90m roll | 4 rolls | ₹1,800/roll |
     | FRLS Wire 2.5mm² | Havells/Polycab, 90m roll | 3 rolls | ₹2,800/roll |
     | FRLS Wire 4mm² | Havells/Polycab, 90m roll | 2 rolls | ₹4,200/roll |
     
     **SWITCHES & SOCKETS**
     | 6A Switch | Anchor Roma / Legrand | 25 pcs | ₹45/pc |
     | 16A Socket | Anchor Roma / Legrand | 15 pcs | ₹85/pc |
     | Combo Plate (6A switch + socket) | Same brand | 10 pcs | ₹120/pc |
     
     **DISTRIBUTION**
     | SP MCB 10A | Havells/Schneider | 4 pcs | ₹180/pc |
     | SP MCB 16A | Havells/Schneider | 6 pcs | ₹185/pc |
     | SP MCB 32A | Havells/Schneider | 2 pcs | ₹210/pc |
     | DP MCB 40A (main) | Havells/Schneider | 1 pc | ₹450/pc |
     | 8-Way DB | Havells | 1 pc | ₹850/pc |
     | 12-Way DB | Havells | 1 pc | ₹1,100/pc |
     
     **LIGHTING** (basic)
     | LED Panel 15W | Philips/Syska | 10 pcs | ₹350/pc |
     | LED Bulb 9W | Philips/Syska | 6 pcs | ₹90/pc |
     | Ceiling Fan | Crompton/Havells | 4 pcs | ₹1,800/pc |
     
     **CONDUITS & ACCESSORIES**
     | PVC Conduit 25mm | Any ISI marked | 30 pcs (3m each) | ₹35/pc |
     | Junction Box | Any ISI marked | 20 pcs | ₹15/pc |
     
     **Estimated Total: ₹45,000 - ₹65,000** (depending on brand choices)
     
     This is a standard estimate. Want me to adjust for any specific requirements?
     
     [Create Inquiry from This List] [Customize Items] [Ask a Question]"

Step 6: User interacts
  -> User: "Make it Havells throughout. Also, I want smart switches for the living room."

Step 7: Volt refines
  -> Volt updates the BOQ:
     - All items switched to Havells brand (prices updated from catalog)
     - Living room section: replaces regular switches with Havells Pearlz Smart Wi-Fi switches
     - Updated estimate shown
     -> "Updated! All products are now Havells. I've added 8 Havells Pearlz Smart switches for the living room.
        New estimate: ₹58,000 - ₹78,000.
        [Create Inquiry from This List] [Customize More]"

Step 8: User creates inquiry
  -> User clicks "Create Inquiry from This List"
  -> Volt calls tool: create_draft_inquiry({ items: [...] })
  -> Volt: "Done! I've created a draft inquiry with 22 items. 
     Review and submit it here: [Review Inquiry →]
     Anything else I can help with?"
  -> User clicks link -> redirected to /inquiries/{id}/edit with all items pre-filled
```

### Error Handling in Volt

```
User asks something unrelated:
  -> User: "What's the weather in Delhi?"
  -> Volt: "I'm specialized in construction materials and procurement. I can't help with weather, 
     but I can help you find the best prices on electrical products! 
     What are you looking to buy?"

User asks for something dangerous:
  -> User: "How do I wire my house myself?"
  -> Volt: "I'd strongly recommend hiring a licensed electrician for wiring work -- 
     it's required by law and critical for safety. I can help you find verified electricians 
     in your area through our Professional Directory, and I can help you procure all the 
     materials at the best price. What would you like to do?"

Volt doesn't know the answer:
  -> Volt: "I'm not entirely sure about that specification. Let me connect you with our 
     support team who can help. [Contact Support]
     In the meantime, would you like me to help with anything else?"

API/tool failure:
  -> Volt: "I'm having trouble fetching the latest prices right now. Let me try again in a moment.
     [Retry] [Contact Support]"
  -> Retry with exponential backoff (1s, 2s, 4s). After 3 failures, suggest support.
```

---

## 12.8 MOBILE-SPECIFIC JOURNEYS

Hub4Estate is mobile-first (360px minimum). These journeys document mobile-specific UX patterns.

### Bottom Sheet Patterns

```
PRODUCT QUICK VIEW:
  -> Long-press on product card in search results
  -> Bottom sheet slides up (60% screen height) with:
     - Product image, name, brand, price range
     - "View Full Detail", "Add to Inquiry", "Save" buttons
  -> Swipe down to dismiss

FILTER PANEL:
  -> Tap "Filters" on search results page
  -> Full-screen bottom sheet slides up with:
     - Category tree (collapsible), Brand checkboxes, Price slider, Rating filter
     - "Apply Filters" sticky button at bottom
     - "Clear All" link at top-right
  -> Applies on tap, closes sheet

INQUIRY ITEM ACTIONS:
  -> Swipe left on an inquiry item row
  -> Reveals: "Edit Quantity" (blue) and "Remove" (red) action buttons
  -> Tap to execute, auto-animates row removal

QUOTE DETAIL:
  -> Tap a quote card in the comparison view
  -> Bottom sheet shows full quote detail:
     - Per-item prices, delivery info, dealer metrics
     - "Select This Quote" CTA
     - Swipe left/right to navigate between quotes
```

### Swipe Gestures

```
INQUIRY FEED (Dealer):
  -> Swipe right on an inquiry card = "Quick Quote" (opens quote builder)
  -> Swipe left on an inquiry card = "Skip" (hides from feed, can undo)
  -> Swipe actions use haptic feedback

ORDER LIST:
  -> Pull-to-refresh on any list view
  -> Triggers data refetch with subtle loading indicator

ONBOARDING:
  -> Horizontal swipe between onboarding steps (progress dots at top)
  -> Each step auto-saves on swipe away
```

### Camera Integration

```
SLIP SCANNER (F-502):
  -> Tap camera icon
  -> Camera opens with document detection frame
  -> Auto-detects document edges (rectangle detection)
  -> "Capture" button (or auto-capture on stable frame)
  -> Crop/adjust screen
  -> Processing overlay ("Scanning your list...")
  -> Results table with extracted items

DOCUMENT UPLOAD (Dealer KYC):
  -> "Take Photo" option alongside "Upload File"
  -> Camera opens with document mode
  -> Auto-crop and enhance (contrast, sharpness)
  -> Preview with "Retake" / "Use Photo" options

PRODUCT IMAGE SEARCH (Future):
  -> Camera icon in search bar
  -> Point at a product (MCB, switch, wire)
  -> AI identifies product and shows catalog matches
```

### WhatsApp Share Flows

```
INQUIRY SHARE:
  -> After publishing inquiry, "Share via WhatsApp" button
  -> Opens WhatsApp with pre-filled message:
    "I just posted a procurement request on Hub4Estate for {N} electrical items.
     Check out Hub4Estate for the best prices on construction materials: {link}"

PRODUCT SHARE:
  -> Share icon on product detail page
  -> WhatsApp pre-fill:
    "Check out {Product Name} on Hub4Estate - prices starting at ₹{price}: {link}"

ORDER SHARE:
  -> "Share Savings" button on completed order
  -> WhatsApp pre-fill:
    "I saved ₹{amount} ({percent}%) on my electrical order through Hub4Estate!
     Get the best prices for your project: {link}"

REFERRAL SHARE:
  -> "Refer a Friend" from profile
  -> WhatsApp pre-fill:
    "Hey! I've been using Hub4Estate for buying electrical materials at great prices.
     Sign up with my referral link and we both benefit: {referral_link}"
```

### Push Notification Deep Links

```
Each push notification includes a deep link that opens the relevant screen:

| Notification Type | Deep Link | Screen |
|-------------------|-----------|--------|
| New quote received | /inquiries/{id}/quotes | Quote comparison |
| Order dispatched | /orders/{id} | Order tracking |
| Inquiry match (dealer) | /dealer/inquiries/{id} | Inquiry detail |
| Payment confirmed | /orders/{id}/confirmed | Payment confirmation |
| Price alert triggered | /products/{slug} | Product detail |
| Dispute update | /orders/{id}/dispute | Dispute detail |
| Volt AI suggestion | /chat?context={inquiry_id} | Volt chat with context |

Deep link handling:
  -> If user is logged in: navigate directly to screen
  -> If user is NOT logged in: show auth modal, then redirect to deep link after auth
  -> If screen requires data (e.g., specific inquiry): fetch on mount with loading state
```

### Offline Handling

```
CACHED DATA (available offline):
  -> Last viewed product list (IndexedDB cache, max 100 products)
  -> User profile data
  -> Active inquiry list (summary only)
  -> Saved items / wishlists

OFFLINE ACTIONS (queued for sync):
  -> Draft inquiry edits (saved to IndexedDB, synced on reconnect)
  -> Product saves (heart icon works offline, syncs later)
  -> Volt AI: "You're offline. Your message will be sent when you reconnect."

OFFLINE INDICATOR:
  -> Banner at top: "You're offline. Some features may be limited." (yellow)
  -> When reconnected: "Back online! Syncing your changes..." (green, auto-dismiss after 3s)
  -> Actions that REQUIRE network (payment, quote submission): disabled with "Requires internet connection" tooltip
```

---

## 12.9 JOURNEY STATE MACHINE REFERENCE

### Inquiry State Machine

```
DRAFT
  -> PUBLISHED       (buyer publishes)
  -> CANCELLED        (buyer deletes draft)

PUBLISHED
  -> QUOTING          (matching engine assigns dealers)
  -> CANCELLED        (buyer cancels)
  -> EXPIRED          (7 days, no dealer matches)

QUOTING
  -> QUOTED           (deadline reached OR all dealers responded)
  -> CANCELLED        (buyer cancels)

QUOTED
  -> AWARDED          (buyer selects a quote)
  -> EXPIRED          (48 hours, buyer doesn't select)

AWARDED
  -> ORDERED          (order created and payment initiated)
  -> CANCELLED        (only via admin escalation)

ORDERED
  -> COMPLETED        (order completed)
  -> CANCELLED        (payment not received in 24h)
  -> DISPUTED         (order disputed)

COMPLETED
  (terminal state)

EXPIRED
  (terminal state -- buyer can "re-publish" which creates a new inquiry)

CANCELLED
  (terminal state)
```

### Order State Machine

```
PENDING_PAYMENT
  -> PAID                 (payment captured)
  -> CANCELLED            (payment timeout 24h)

PAID
  -> DEALER_CONFIRMED     (dealer confirms)
  -> CANCELLED            (dealer timeout 48h -- admin escalation)

DEALER_CONFIRMED
  -> DISPATCHED           (dealer marks dispatched)

DISPATCHED
  -> IN_TRANSIT           (tracking update or dealer update)
  -> DELIVERED            (delivery confirmed by logistics/dealer)

IN_TRANSIT
  -> DELIVERED            (delivery confirmed)

DELIVERED
  -> COMPLETED            (buyer confirms or auto 72h)
  -> DISPUTED             (buyer raises issue)

COMPLETED
  (terminal state)

DISPUTED
  -> COMPLETED            (dispute resolved, order stands)
  -> REFUNDED             (dispute resolved, full refund)
  -> PARTIALLY_REFUNDED   (dispute resolved, partial refund)

CANCELLED
  (terminal state)

REFUNDED
  (terminal state)

PARTIALLY_REFUNDED
  (terminal state)
```

### Escrow State Machine

```
HELD
  -> RELEASED             (delivery confirmed, no dispute)
  -> FROZEN               (dispute raised)

FROZEN
  -> RELEASED             (dispute resolved in dealer's favor)
  -> REFUNDED             (dispute resolved in buyer's favor)
  -> PARTIALLY_REFUNDED   (partial refund + partial release)

RELEASED
  (terminal state -- funds transferred to dealer)

REFUNDED
  (terminal state -- funds returned to buyer)

PARTIALLY_REFUNDED
  (terminal state)
```

### Dispute State Machine

```
OPENED
  -> DEALER_RESPONDED     (dealer provides evidence)
  -> ESCALATED            (admin escalates immediately)

DEALER_RESPONDED
  -> UNDER_REVIEW         (admin picks up)

UNDER_REVIEW
  -> RESOLVED_BUYER_FAVOR     (full refund)
  -> RESOLVED_PARTIAL          (partial refund)
  -> RESOLVED_REPLACEMENT      (replacement ordered)
  -> RESOLVED_DEALER_FAVOR     (dismissed)
  -> ESCALATED                 (needs senior review)

ESCALATED
  -> RESOLVED_*            (any resolution above)

RESOLVED_* (any)
  -> APPEALED              (within 7 days)
  -> (terminal)            (after 7 days)

APPEALED
  -> RESOLVED_*            (final resolution, no further appeal)
```

---

*End of Sections 11 & 12. Proceed to Section 13-14 (API Specification & Frontend Architecture) for implementation details of every feature and journey described above.*
