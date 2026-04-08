# Hub4Estate - Complete Feature Catalog

**Document ID:** PRD-03
**Version:** 1.0
**Last Updated:** 2026-04-02
**Author:** CTO Office, Hub4Estate
**Status:** Living Document

---

## Document Purpose

This document is the single source of truth for every feature planned across the Hub4Estate platform. Each feature is cataloged with a unique ID, user story, acceptance criteria, priority, complexity, and dependency mapping. This catalog drives sprint planning, engineering estimation, QA test plans, and product roadmap conversations.

## Priority Definitions

| Priority | Meaning | Timeline |
|----------|---------|----------|
| **P0** | Launch-critical. Platform cannot go live without this. | Pre-launch |
| **P1** | Must ship within Month 1 post-launch. | Month 1 |
| **P2** | Must ship within Quarter 1 post-launch. | Quarter 1 |
| **P3** | Ship within Year 1. Strategic importance. | Year 1 |
| **P4** | Future roadmap. Nice-to-have or exploratory. | Year 1+ |

## Complexity Definitions

| Size | Meaning | Estimated Effort |
|------|---------|------------------|
| **S** | Small. Single component, minimal logic. | 1-2 days |
| **M** | Medium. Multiple components, moderate logic. | 3-5 days |
| **L** | Large. Cross-cutting, multiple services/APIs. | 1-2 weeks |
| **XL** | Extra Large. Major subsystem, multi-sprint. | 2-4 weeks |

---

# SECTION 1: BUYER FEATURES

## 1.1 Onboarding & Authentication

---

### BUY-001: Google OAuth Sign-In

**Description:** Buyers can sign in using their Google account with a single click. The system creates a new user record on first login and retrieves the existing record on subsequent logins. This is the primary and fastest authentication path.

**User Story:** As a buyer, I want to sign in with my Google account, so that I can access the platform instantly without creating a new password.

**Acceptance Criteria:**
- Google OAuth 2.0 button is displayed prominently on the login page.
- Clicking the button initiates the OAuth flow and opens the Google consent screen.
- On first login, a new user record is created with Google profile data (name, email, avatar).
- On subsequent logins, the existing user record is retrieved and the session is established.
- JWT access token (15-minute expiry) and refresh token (7-day expiry) are issued.
- If the Google OAuth flow fails or is cancelled, the user sees a clear error message and can retry.
- The user is redirected to their dashboard (or role selection if first login) after successful authentication.
- Works correctly on mobile browsers and desktop.

**Priority:** P0
**Complexity:** M
**Dependencies:** None

---

### BUY-002: Phone OTP Login

**Description:** Buyers can sign in or sign up using their mobile phone number. A 6-digit OTP is sent via SMS, and upon verification, a session is created. This is critical for Indian users who may not have Google accounts or prefer phone-based auth.

**User Story:** As a buyer, I want to log in with my phone number and OTP, so that I can access the platform without needing a Google account.

**Acceptance Criteria:**
- Phone number input field with Indian country code (+91) pre-selected and international code picker available.
- Input validates that the phone number is exactly 10 digits (Indian format).
- Clicking "Send OTP" triggers an API call that sends a 6-digit OTP via SMS gateway.
- OTP expires after 5 minutes.
- User can request a new OTP after 30-second cooldown (resend timer visible).
- Maximum 5 OTP attempts per phone number per hour (rate limiting).
- On valid OTP entry, a new user is created (if first time) or existing user is retrieved.
- JWT tokens are issued identical to the Google OAuth flow.
- If OTP is invalid, the user sees "Invalid OTP. Please try again." with remaining attempts shown.

**Priority:** P0
**Complexity:** M
**Dependencies:** PLT-007

---

### BUY-003: Role Selection

**Description:** After first-time authentication, the buyer selects their role from a predefined list (homeowner, contractor, architect, electrician, interior designer, builder, procurement manager, other). This determines the UI experience and feature access level.

**User Story:** As a new user, I want to select my role, so that the platform can personalize my experience and show me relevant features.

**Acceptance Criteria:**
- Role selection screen appears immediately after first-time login, before dashboard access.
- Roles displayed as visually distinct cards with icons: Homeowner, Contractor, Architect, Electrician, Interior Designer, Builder, Procurement Manager, Other.
- User must select exactly one role to proceed.
- "Other" role includes a free-text field for custom role description.
- Role is stored in the user profile and can be changed later from settings.
- Role selection triggers appropriate onboarding flow (professionals get PRO onboarding, others go to profile completion).
- The UI adapts based on selected role (e.g., professionals see project management features).
- If the user navigates away and returns, they are brought back to role selection until completed.

**Priority:** P0
**Complexity:** S
**Dependencies:** BUY-001, BUY-002

---

### BUY-004: Profile Completion

**Description:** After role selection, buyers complete their profile with essential information including name, city, and purchase purpose. This data powers geographic matching with dealers and personalizes the inquiry flow.

**User Story:** As a new user, I want to complete my profile quickly, so that I can start submitting inquiries and receive relevant quotes from nearby dealers.

**Acceptance Criteria:**
- Profile form includes: full name (required), city (required, autocomplete from city database), pincode (optional), purchase purpose (dropdown: personal use, project, resale, other).
- City autocomplete searches across 500+ Indian cities and shows matching results after 2 characters.
- If geolocation permission is granted, city is auto-detected and pre-filled (user can override).
- Form validation prevents submission with empty required fields.
- Profile data is saved to the user record via API.
- Progress indicator shows completion percentage.
- User can skip optional fields and complete later from profile settings.
- After completion, user is redirected to the buyer dashboard.

**Priority:** P0
**Complexity:** S
**Dependencies:** BUY-003

---

### BUY-005: Professional Verification for Architects/Contractors

**Description:** Users who select professional roles (architect, contractor, electrician, procurement manager) are prompted to verify their credentials by uploading relevant documents. Verified professionals receive badges and priority access to features.

**User Story:** As a professional (architect/contractor), I want to verify my credentials, so that I receive priority access, trust badges, and enhanced platform features.

**Acceptance Criteria:**
- After role selection as a professional, user is shown the verification prompt (skippable but persistent).
- Document upload accepts: Council of Architecture certificate, trade license, GST certificate, business registration, portfolio samples.
- File formats supported: PDF, JPG, PNG. Max file size: 10MB per document.
- Upload progress bar is shown for each file.
- After submission, status shows "Verification Pending" with estimated review time (24-48 hours).
- Admin receives notification in verification queue (ADM-001).
- On approval, user receives "Verified Professional" badge visible on their profile and in community posts.
- On rejection, user receives notification with reason and option to re-upload corrected documents.

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-003, ADM-001

---

## 1.2 Inquiry Submission

---

### BUY-010: Manual Inquiry Form

**Description:** The core inquiry submission form where buyers enter their product requirement manually. This is the primary path for submitting a request to the dealer network. The form collects product name, model number (optional), quantity, city, and contact details.

**User Story:** As a buyer, I want to submit an inquiry by filling out a simple form, so that verified dealers can send me competitive quotes for the products I need.

**Acceptance Criteria:**
- Form fields: product name/description (required, text area), brand (optional, autocomplete from brand database), model number (optional), quantity (required, numeric, minimum 1), unit (dropdown: pieces, meters, rolls, boxes, sets), delivery city (required, autocomplete), delivery pincode (optional), urgency (dropdown: standard 3-5 days, urgent 1-2 days, flexible), additional notes (optional text area).
- If user is logged in, name and phone are pre-filled from profile.
- If user is not logged in, name (required) and phone (required, validated 10-digit Indian format) fields are shown.
- Form validates all required fields before submission.
- On submission, an inquiry number is generated (INQ-YYYYMMDD-XXXX format).
- User receives confirmation screen with inquiry number and estimated quote timeline.
- Confirmation is also sent via email and/or WhatsApp (if phone provided).
- Inquiry appears in admin pipeline (ADM-010) within 5 seconds of submission.
- The form retains entered data if submission fails, so the user does not re-enter everything.

**Priority:** P0
**Complexity:** M
**Dependencies:** AUT-005, AUT-001

---

### BUY-011: Product Photo Upload with Drag & Drop

**Description:** Buyers can upload photos of the product they want to inquire about, either by dragging files into the form or clicking to browse. Photos help dealers identify the exact product variant and condition.

**User Story:** As a buyer, I want to upload photos of the product I need, so that dealers can see exactly what I am looking for and provide accurate quotes.

**Acceptance Criteria:**
- Drag-and-drop zone is visible within the inquiry form, with instructive placeholder text ("Drag photos here or click to browse").
- Clicking the zone opens the device file picker.
- Accepts JPG, PNG, WEBP, and HEIC formats.
- Maximum 5 photos per inquiry, each up to 5MB.
- Photos are compressed client-side to max 1920px width before upload (to reduce bandwidth).
- Upload progress indicator shown per file.
- Uploaded photos display as thumbnails with a remove button.
- Photos are stored in S3 with signed URLs (not publicly accessible).
- On mobile, the upload button offers "Choose from gallery" and "Take photo" options.
- If upload fails, the user sees an error with retry option.

**Priority:** P0
**Complexity:** M
**Dependencies:** BUY-010

---

### BUY-012: AI Slip Scanner

**Description:** Buyers can upload a purchase order, quotation, or handwritten list, and AI extracts all product items (name, quantity, brand, model) automatically. This transforms a multi-item manual entry task into a single-upload action, dramatically reducing friction for bulk buyers.

**User Story:** As a buyer with a purchase order, I want to upload it and have AI extract all items, so that I can submit a multi-item inquiry in seconds instead of typing each item manually.

**Acceptance Criteria:**
- Upload zone accepts PDF, JPG, PNG, HEIC files up to 10MB.
- After upload, a loading state shows "Analyzing your document..." with a progress animation.
- AI (OCR + LLM) extracts: product names, quantities, units, brand names, model numbers, and any specifications.
- Extracted items are displayed in an editable table for user review before submission.
- Each row is editable: user can correct, add, or remove items.
- Confidence score is shown per extracted field (high/medium/low) with low-confidence fields highlighted for review.
- User confirms the extracted data and submits as a multi-item inquiry.
- If AI cannot extract anything meaningful, user sees a clear message: "We couldn't read this document. Please try a clearer image or enter items manually."
- Processing time is under 15 seconds for a single-page document.
- Supports both printed and handwritten text (Hindi and English).

**Priority:** P1
**Complexity:** XL
**Dependencies:** BUY-010, BUY-016

---

### BUY-013: Voice Input for Inquiry

**Description:** Buyers can speak their requirement in Hindi or English, and AI converts the speech to structured inquiry data. This is critical for users who are not comfortable typing, particularly contractors and electricians in the field.

**User Story:** As a buyer, I want to speak my requirement in Hindi or English, so that I can submit an inquiry without typing.

**Acceptance Criteria:**
- Microphone button is visible on the inquiry form.
- Clicking the button requests microphone permission (with clear explanation dialog).
- Real-time speech-to-text transcription is displayed as the user speaks.
- AI processes the transcribed text and extracts: product name, brand, quantity, model number, delivery city.
- Extracted fields are auto-filled in the inquiry form.
- User can review and edit the auto-filled fields before submission.
- Supports Hindi, English, and Hindi-English code-switching (Hinglish).
- If the AI cannot understand, the user sees "Sorry, I didn't catch that. Please try again or type your requirement."
- Works on mobile (Chrome, Safari) and desktop browsers.
- Audio is not stored after processing (privacy compliance).

**Priority:** P2
**Complexity:** L
**Dependencies:** BUY-010

---

### BUY-014: Camera Capture for Inquiry

**Description:** Buyers can take a photo of a product, label, or nameplate directly from the inquiry form using their device camera. The captured image is attached to the inquiry. Optionally, AI attempts to identify the product from the image.

**User Story:** As a buyer on-site, I want to take a photo of the product I need using my phone camera, so that I can submit an inquiry without knowing the exact product name or model.

**Acceptance Criteria:**
- Camera button is visible on the inquiry form (shown only on devices with cameras).
- Clicking opens the device camera directly (not file picker).
- Captured photo is previewed with options to retake or accept.
- Accepted photo is compressed and uploaded to S3.
- If AI product identification is enabled (P2+), the system attempts to identify the product brand, model, and category from the image.
- AI-identified product data is auto-filled in the form (user can edit).
- If no AI identification, the photo is simply attached as a reference for dealers.
- Flash control is available on supported devices.
- Works on iOS Safari and Android Chrome.

**Priority:** P1
**Complexity:** M
**Dependencies:** BUY-011

---

### BUY-015: Geolocation Auto-Detect City

**Description:** The platform requests browser geolocation permission and auto-detects the buyer's city to pre-fill the delivery city field in the inquiry form and profile. This reduces form friction and ensures accurate dealer matching.

**User Story:** As a buyer, I want the platform to detect my city automatically, so that I don't have to type it manually and my inquiry reaches nearby dealers.

**Acceptance Criteria:**
- On first visit or inquiry submission, the platform requests geolocation permission.
- If permission is granted, latitude/longitude are reverse-geocoded to city name and pincode.
- City and pincode fields in the inquiry form and profile are pre-filled.
- User can override the auto-detected city at any time.
- If permission is denied, the user is prompted to enter city manually (no degraded experience).
- Reverse geocoding uses Google Maps Geocoding API or equivalent.
- Detected city is cached in local storage for subsequent visits (expires after 7 days).
- Geolocation request includes a clear explanation: "We use your location to connect you with nearby dealers."

**Priority:** P1
**Complexity:** S
**Dependencies:** BUY-010

---

### BUY-016: Multi-Item Inquiry

**Description:** Buyers can submit a single inquiry containing multiple product items, each with its own quantity, brand, and specifications. This is essential for bulk buyers and project-based procurement where orders span multiple product categories.

**User Story:** As a buyer with a project shopping list, I want to submit multiple items in one inquiry, so that I can get quotes for my entire order without submitting separate inquiries for each product.

**Acceptance Criteria:**
- "Add another item" button allows adding up to 50 items in a single inquiry.
- Each item row includes: product name, brand, model number, quantity, unit, and a remove button.
- Items can be reordered via drag-and-drop.
- Each item validates independently (required fields per item).
- The inquiry number covers all items (INQ-YYYYMMDD-XXXX with sub-item numbering).
- Dealers receive the full list and can quote on individual items or the entire order.
- Quote comparison view groups quotes by item.
- Bulk total is calculated and displayed (sum of best quotes per item).
- User can submit even if some items have less information (flexible matching).

**Priority:** P1
**Complexity:** L
**Dependencies:** BUY-010

---

### BUY-017: Recurring Inquiry

**Description:** Buyers can set an inquiry to auto-resubmit on a defined schedule (weekly, monthly, quarterly). This serves regular procurement needs where the same product is ordered repeatedly, such as ongoing construction projects or maintenance operations.

**User Story:** As a buyer with recurring procurement needs, I want to set an inquiry to auto-resubmit monthly, so that I always get fresh competitive quotes without manual re-entry.

**Acceptance Criteria:**
- After submitting an inquiry, user sees option "Make this recurring."
- Frequency options: weekly, bi-weekly, monthly, quarterly.
- User can set a start date and end date (or "until I cancel").
- Recurring inquiries are auto-submitted on the scheduled date with the same product details.
- Each recurrence generates a new inquiry number linked to the parent recurring inquiry.
- User receives notification before each auto-submission (24 hours prior) with option to modify or cancel.
- User can pause, resume, or cancel the recurring schedule from their dashboard.
- Recurring inquiry history shows all generated inquiries in a timeline view.

**Priority:** P3
**Complexity:** L
**Dependencies:** BUY-010, AUT-005

---

### BUY-018: Inquiry from Product Catalog

**Description:** Buyers browsing the product catalog can select a product and submit an inquiry directly from the product detail page. The product details (name, brand, model, category) are auto-filled in the inquiry form, reducing entry effort.

**User Story:** As a buyer browsing the catalog, I want to click "Get Quotes" on a product page, so that I can submit an inquiry with all product details pre-filled.

**Acceptance Criteria:**
- Every product detail page has a prominent "Get Quotes" CTA button.
- Clicking the button opens the inquiry form pre-filled with: product name, brand, model number, category.
- User only needs to add: quantity, delivery city, and any additional notes.
- If user is not logged in, the inquiry form also collects name and phone.
- The inquiry is linked to the specific product record in the database (for analytics).
- Breadcrumb trail shows the path from catalog to inquiry submission.
- After submission, user is shown "You submitted an inquiry for [product name]" with inquiry number.
- Works for both simple products and product variants.

**Priority:** P1
**Complexity:** S
**Dependencies:** BUY-010, BUY-044

---

### BUY-019: Smart Suggestions (AI-Powered Related Products)

**Description:** When a buyer is filling out or has submitted an inquiry, the AI suggests related or complementary products they may also need. For example, if buying LED panel lights, it may suggest compatible drivers, mounting hardware, or the same product in a different wattage.

**User Story:** As a buyer, I want to see suggestions for related products I might also need, so that I can complete my order without forgetting essential items.

**Acceptance Criteria:**
- After the buyer enters a product name or submits an inquiry, a "You might also need" section appears.
- Suggestions are based on: product category relationships, frequently co-purchased items, and specification compatibility.
- Each suggestion shows: product name, image (if available), and a one-line reason ("Often bought together", "Compatible driver for this panel").
- Clicking a suggestion adds it to the inquiry (multi-item mode) or creates a new inquiry.
- Maximum 5 suggestions displayed at a time.
- Suggestions load within 2 seconds.
- If no relevant suggestions exist, the section is hidden (not shown empty).
- Suggestion accuracy is tracked via click-through rate and fed back to improve the model.

**Priority:** P2
**Complexity:** L
**Dependencies:** BUY-010, BUY-016, ADM-030

---

## 1.3 Quote Management

---

### BUY-020: Quote Comparison Table

**Description:** Buyers view all received quotes for an inquiry in a structured comparison table. The table displays key data points side by side: price, shipping cost, delivery timeline, dealer rating, and terms. This is the core decision-making interface.

**User Story:** As a buyer, I want to see all dealer quotes in a comparison table, so that I can easily identify the best deal based on price, delivery time, and dealer reputation.

**Acceptance Criteria:**
- Quotes are displayed in a responsive table with columns: dealer name (anonymized, e.g., "Dealer A"), unit price, total price, shipping cost, estimated delivery date, payment terms, dealer rating, and "Select" action button.
- Default sort is by total price (lowest first).
- The lowest price is highlighted with a green badge ("Best Price").
- The fastest delivery is highlighted with a blue badge ("Fastest Delivery").
- If fewer than 2 quotes are received, a message states "Waiting for more quotes. You currently have [X] quote(s)."
- Table is scrollable horizontally on mobile.
- Each row expands to show additional details: dealer notes, warranty terms, and item-level breakdown (for multi-item inquiries).
- Buyer cannot see dealer identity (name, phone, address) until they select a quote.

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-013

---

### BUY-021: Sort/Filter Quotes

**Description:** Buyers can sort and filter the quote comparison table by price, delivery time, dealer rating, and other parameters. This helps buyers with specific priorities (e.g., cheapest vs. fastest) find the best option quickly.

**User Story:** As a buyer, I want to sort and filter quotes, so that I can prioritize what matters most to me (price, speed, or dealer quality).

**Acceptance Criteria:**
- Sort options: price (low to high / high to low), delivery time (soonest first), dealer rating (highest first), shipping cost.
- Filter options: price range (min/max slider), maximum delivery days, minimum dealer rating, payment terms (advance, COD, credit).
- Active filters are shown as removable chips above the table.
- Filter state persists during the session.
- When no quotes match the applied filters, a message says "No quotes match your filters. Try adjusting your criteria."
- Sort and filter controls are accessible on both desktop and mobile.
- Filtering updates the table instantly (client-side for small datasets, server-side for large).

**Priority:** P0
**Complexity:** S
**Dependencies:** BUY-020

---

### BUY-022: View Dealer Profile (Anonymized)

**Description:** Buyers can view limited dealer information before selecting a quote. The profile is anonymized (no name, phone, or address) but shows: verification status, business age, rating, number of completed orders, response time, and brand authorizations.

**User Story:** As a buyer, I want to see a dealer's reputation and credentials before selecting their quote, so that I can make an informed decision beyond just price.

**Acceptance Criteria:**
- Clicking dealer name in the quote table opens a modal or side panel with the anonymized profile.
- Profile shows: verification badges (GST verified, brand authorized), years in business, average rating (out of 5), total orders completed on Hub4Estate, average response time, and brand authorizations relevant to the inquiry.
- Profile does NOT show: business name, phone number, email, physical address, or any identifying information.
- Ratings are aggregated from buyer reviews (BUY-034).
- If the dealer is newly registered with no history, the profile shows "New Dealer" badge with a note "This dealer recently joined Hub4Estate."
- Profile layout is clean and scannable on mobile.

**Priority:** P0
**Complexity:** S
**Dependencies:** BUY-020, DLR-030

---

### BUY-023: Select Winning Quote

**Description:** The buyer selects their preferred quote from the comparison table. Upon selection, the dealer's full contact information (name, phone, email, address) is revealed to the buyer, and the dealer is notified that they won the inquiry.

**User Story:** As a buyer, I want to select the best quote and see the dealer's contact information, so that I can proceed with the purchase directly.

**Acceptance Criteria:**
- Each quote row has a "Select This Quote" button.
- Clicking the button shows a confirmation dialog: "You are selecting Dealer X's quote for [amount]. You will be able to see their contact details. Confirm?"
- On confirmation, the dealer's full business profile is revealed: business name, phone, email, shop address, Google Maps link.
- The selected dealer receives an instant notification (push, email, WhatsApp) with the buyer's name and phone number.
- Other dealers receive a "This inquiry has been closed" notification (with the winning price, anonymized).
- The inquiry status changes to "Closed - Quote Selected."
- The buyer can only select one quote per inquiry (unless the transaction falls through; see re-open flow).
- Selection action is logged for analytics and audit.

**Priority:** P0
**Complexity:** M
**Dependencies:** BUY-020, DLR-017, DLR-018

---

### BUY-024: Reject Quote with Reason

**Description:** Buyers can reject individual quotes with a predefined or custom reason. This feedback is sent to the dealer to help them improve future quotes and is used by the platform for analytics.

**User Story:** As a buyer, I want to reject a quote and provide a reason, so that the dealer understands why they lost and can improve.

**Acceptance Criteria:**
- Each quote row has a "Reject" action (secondary button or dropdown option).
- Clicking opens a modal with predefined reasons: "Price too high", "Delivery too slow", "Unfavorable terms", "Brand mismatch", "Other."
- "Other" allows free-text input (max 500 characters).
- User can select multiple reasons.
- Rejected quotes are visually dimmed but remain visible in the comparison table (with a "Rejected" tag).
- The rejection reason is sent to the dealer via their dashboard (not push notification, to avoid spam).
- Rejection is reversible: user can un-reject a quote before selecting another one.
- Rejection analytics are tracked per dealer and per category for admin insights.

**Priority:** P1
**Complexity:** S
**Dependencies:** BUY-020

---

### BUY-025: Request Revised Quote

**Description:** Buyers can request a specific dealer to revise their quote with optional notes explaining what needs to change (e.g., "Can you match X price?" or "Need faster delivery"). The dealer receives the revision request and can submit an updated quote.

**User Story:** As a buyer, I want to request a dealer to revise their quote, so that I can negotiate a better deal without leaving the platform.

**Acceptance Criteria:**
- Each quote row has a "Request Revision" action.
- Clicking opens a form with a text field for revision notes (e.g., "Can you offer a lower price for quantity 500+?").
- The dealer receives the revision request with the buyer's notes in their dashboard.
- Revised quote appears as a new entry in the comparison table, linked to the original quote, with "Revised" badge.
- Both original and revised quotes are visible for comparison.
- Maximum 3 revision requests per dealer per inquiry.
- The revision request includes a deadline (48 hours to respond).
- If the dealer does not respond, the revision request is marked as expired.

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-020, DLR-016

---

### BUY-026: Quote Expiry Countdown Timer

**Description:** Each quote has a validity period set by the dealer (default 48 hours). A countdown timer is displayed on each quote showing how much time remains. Expired quotes are visually marked and cannot be selected.

**User Story:** As a buyer, I want to see how long each quote is valid, so that I can make my decision before the best quotes expire.

**Acceptance Criteria:**
- Each quote row shows a countdown timer (e.g., "Valid for 23h 14m" or "Expires in 2 days").
- Timer updates in real-time (ticks down every minute).
- When less than 6 hours remain, the timer turns amber/orange as a warning.
- When less than 1 hour remains, the timer turns red.
- Expired quotes are greyed out with an "Expired" badge and the "Select" button is disabled.
- If all quotes expire, the buyer is notified: "All quotes have expired. Would you like to resubmit this inquiry?"
- Dealers set the validity period when submitting quotes (default 48h, options: 24h, 48h, 72h, 1 week).
- Countdown timer is timezone-aware.

**Priority:** P1
**Complexity:** S
**Dependencies:** BUY-020, DLR-013

---

### BUY-027: Save/Bookmark Quotes

**Description:** Buyers can bookmark individual quotes for later review. Saved quotes are accessible from a dedicated "Saved Quotes" section in the dashboard, persisting across sessions.

**User Story:** As a buyer comparing many quotes across multiple inquiries, I want to bookmark quotes I am considering, so that I can easily find and compare them later.

**Acceptance Criteria:**
- Each quote row has a bookmark icon (toggle).
- Clicking the bookmark saves the quote to the user's "Saved Quotes" list.
- Bookmarked quotes show a filled bookmark icon.
- "Saved Quotes" page in the dashboard lists all bookmarked quotes, grouped by inquiry.
- Each saved quote shows: product name, dealer (anonymized), price, delivery time, and expiry status.
- User can remove a bookmark from the saved list or from the comparison table.
- If a bookmarked quote expires, it is flagged in the saved list but not auto-removed.
- Saved quotes persist across browser sessions (stored server-side for logged-in users).

**Priority:** P2
**Complexity:** S
**Dependencies:** BUY-020

---

### BUY-028: Share Quote Comparison (PDF Export)

**Description:** Buyers can export the quote comparison table as a branded PDF document to share with decision-makers (e.g., a contractor sharing options with a homeowner). The PDF includes all visible quotes with pricing, delivery, and dealer ratings.

**User Story:** As a buyer, I want to export the quote comparison as a PDF, so that I can share it with others involved in the purchase decision.

**Acceptance Criteria:**
- "Export PDF" button is visible above the quote comparison table.
- Generated PDF includes: Hub4Estate branding, inquiry details (product, quantity, city), quote comparison table, date generated, and a disclaimer ("Quotes valid until [expiry date]").
- Dealer names remain anonymized in the PDF (consistent with the platform view).
- PDF formatting is clean and printable on A4 paper.
- PDF generation completes within 5 seconds.
- File is downloaded to the user's device with filename: "Hub4Estate-Quotes-[InquiryNumber].pdf"
- Option to share via WhatsApp or email directly from the platform.
- PDF includes QR code linking back to the live comparison page (for logged-in users).

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-020

---

## 1.4 Tracking & History

---

### BUY-030: Track Inquiry by Phone Number (No Login)

**Description:** Buyers can check the status of their inquiry by entering the phone number they used during submission, without needing to log in. This is critical for users who submitted inquiries as guests and may not have created an account.

**User Story:** As a buyer who submitted a guest inquiry, I want to track my inquiry status using just my phone number, so that I can see updates without creating an account.

**Acceptance Criteria:**
- Dedicated "Track Inquiry" page accessible from the homepage.
- Input field accepts phone number (10-digit Indian format).
- After entering a valid phone number, an OTP is sent for verification (security measure).
- On OTP verification, all inquiries linked to that phone number are displayed.
- Each inquiry shows: inquiry number, product name, submission date, current status, and number of quotes received.
- Status stages displayed: Submitted, Being Reviewed, Sent to Dealers, Quotes Received, Closed.
- Clicking an inquiry opens the detail view (with quote comparison if quotes are available).
- If no inquiries are found, the user sees "No inquiries found for this number."
- Rate limit: 3 tracking attempts per phone number per hour.

**Priority:** P0
**Complexity:** M
**Dependencies:** PLT-007

---

### BUY-031: Real-Time Status Updates (Push Notifications)

**Description:** Buyers receive real-time push notifications at every stage of the inquiry lifecycle: inquiry received, under review, sent to dealers, first quote received, new quotes, quote expiring, inquiry closed. Notifications are sent via web push and optionally WhatsApp/SMS.

**User Story:** As a buyer, I want to receive instant notifications when my inquiry status changes or new quotes arrive, so that I never miss an opportunity to act on a good deal.

**Acceptance Criteria:**
- Push notification permission is requested after the first inquiry submission.
- Notification triggers: inquiry confirmed, inquiry sent to dealers, first quote received, each subsequent quote received, quote expiring soon (6h), all quotes expired, inquiry closed.
- Push notifications include: title, short description, and deep link to the relevant inquiry.
- Users can configure notification preferences: web push on/off, email on/off, WhatsApp on/off, SMS on/off.
- Notification settings page accessible from profile.
- Notifications are delivered within 30 seconds of the triggering event.
- If push permissions are denied, the system falls back to email notifications.
- Notification history is viewable in a notification center (bell icon in header).

**Priority:** P1
**Complexity:** M
**Dependencies:** PLT-004, PLT-005

---

### BUY-032: Inquiry History Dashboard

**Description:** Logged-in buyers have a dashboard showing all their past and current inquiries in a timeline/list view. Each inquiry displays its status, number of quotes, product details, and key dates.

**User Story:** As a buyer, I want to see all my inquiries in one place, so that I can manage my procurement activities and reference past transactions.

**Acceptance Criteria:**
- Dashboard is the landing page for logged-in buyers.
- Inquiries are displayed in a list or card view, sorted by most recent first.
- Each inquiry card shows: inquiry number, product name (truncated), quantity, submission date, current status badge (color-coded), number of quotes received.
- Tabs or filters for: All, Active (awaiting quotes), Quoted (quotes received), Closed, Expired.
- Clicking an inquiry navigates to the full detail view.
- Search field allows searching by inquiry number or product name.
- Pagination: 20 inquiries per page with "Load more" button.
- Empty state for new users: "No inquiries yet. Submit your first inquiry to get started!" with CTA button.

**Priority:** P0
**Complexity:** M
**Dependencies:** BUY-010

---

### BUY-033: Re-Order from Previous Inquiry

**Description:** Buyers can quickly re-submit a previous inquiry with the same product details. The system pre-fills the inquiry form with all details from the selected past inquiry, and the buyer can modify any fields before submitting.

**User Story:** As a buyer who previously ordered a product, I want to quickly re-order the same product, so that I save time on repeat purchases.

**Acceptance Criteria:**
- Each closed inquiry in the history dashboard has a "Re-Order" button.
- Clicking opens the inquiry form pre-filled with: product name, brand, model, quantity, delivery city, and notes from the original inquiry.
- User can modify any field before submission.
- The new inquiry is linked to the original (for analytics: "repeat order").
- Re-order also works for multi-item inquiries (all items are pre-filled).
- If the product is no longer in the catalog, the user is notified but can still submit.
- Re-order count is tracked per product for demand insights.

**Priority:** P2
**Complexity:** S
**Dependencies:** BUY-032

---

### BUY-034: Rate & Review Dealer After Purchase

**Description:** After selecting a quote and completing a purchase, the buyer is prompted to rate and review the dealer. Reviews contribute to the dealer's public rating and help future buyers make informed decisions.

**User Story:** As a buyer who completed a purchase, I want to rate the dealer on quality and service, so that future buyers benefit from my experience.

**Acceptance Criteria:**
- Review prompt appears 3 days after quote selection (configurable, triggered via scheduled job).
- Rating scale: 1-5 stars for overall satisfaction.
- Sub-ratings (optional): product quality, delivery speed, communication, pricing accuracy.
- Text review (optional, 10-1000 characters).
- Photo upload option (e.g., product received photo).
- Review is visible on the dealer's public profile (DLR-030) after moderation.
- Buyer can edit their review within 7 days of posting.
- Reviews older than 7 days are locked (can be flagged for removal but not edited).
- Offensive content is auto-flagged for admin review.
- Average rating is recalculated after each new review.

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-023, DLR-031

---

### BUY-035: Order Documentation (GST Bill & Warranty Tracking)

**Description:** Buyers can upload and store order-related documents such as GST invoices, warranty cards, delivery challans, and payment receipts. These are linked to the inquiry/order and accessible from the inquiry history.

**User Story:** As a buyer, I want to store my GST bills and warranty cards digitally linked to my order, so that I can access them easily for tax filing, returns, or warranty claims.

**Acceptance Criteria:**
- Each closed inquiry has an "Add Documents" section.
- Document types: GST Invoice, Warranty Card, Delivery Challan, Payment Receipt, Other.
- Upload accepts: PDF, JPG, PNG. Max 10MB per file.
- Multiple documents can be uploaded per inquiry.
- Documents are stored securely in S3 with user-level access control.
- Uploaded documents are listed with: type, filename, upload date, and download button.
- Warranty card uploads trigger an optional warranty expiry reminder (notification X days before expiry).
- Documents are searchable by type across all inquiries.

**Priority:** P3
**Complexity:** M
**Dependencies:** BUY-032

---

## 1.5 Browse & Discover

---

### BUY-040: Browse Categories

**Description:** Buyers can browse the full category taxonomy of electrical products. The platform supports 14 primary categories (wires & cables, switches & sockets, lighting, fans, MCBs & distribution boards, etc.) with subcategories and product types under each.

**User Story:** As a buyer, I want to browse categories of electrical products, so that I can discover products I need and learn about available options.

**Acceptance Criteria:**
- Category listing page shows all 14 primary categories as cards with icons and product count.
- Clicking a category shows subcategories with brief descriptions.
- Clicking a subcategory shows product types and products within.
- Breadcrumb navigation shows the current path (e.g., Home > Lighting > LED Panel Lights).
- Each category page shows: description, knowledge content (what is it, where used, common mistakes), featured brands, and a "Get Quotes" CTA.
- Categories are SEO-optimized with unique title, meta description, and structured data.
- Category images are high-quality, consistently styled.
- Mobile view displays categories in a 2-column grid.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-030

---

### BUY-041: Search Products by Name, Model, Brand

**Description:** A global search bar allows buyers to search across all products, categories, and brands. Search supports partial matching, typo tolerance, and synonym handling (e.g., "MCB" matches "miniature circuit breaker").

**User Story:** As a buyer, I want to search for a product by name, model number, or brand, so that I can quickly find what I need without browsing through categories.

**Acceptance Criteria:**
- Search bar is prominently placed in the header, visible on all pages.
- Search returns results as the user types (autocomplete with debounce of 300ms).
- Results are grouped by: Products, Categories, Brands.
- Each result shows: product name, brand, category, and a thumbnail image (if available).
- Search handles: partial matches, typo tolerance (Levenshtein distance), synonyms (configured by admin), and model number matching.
- Pressing Enter opens a full search results page with pagination (20 results per page).
- If no results are found: "No results for '[query]'. Try a different search term or browse categories."
- Search query is logged for analytics (popular searches dashboard).
- Search results page has filter options (brand, category, price range).

**Priority:** P0
**Complexity:** L
**Dependencies:** ADM-030, ADM-032

---

### BUY-042: Filter by Brand, Price Segment, Specifications

**Description:** On category and search result pages, buyers can filter products using faceted filters including brand, price segment (budget/mid/premium), specifications (wattage, voltage, IP rating, etc.), and availability.

**User Story:** As a buyer, I want to filter products by brand and specifications, so that I can narrow down options that meet my exact requirements.

**Acceptance Criteria:**
- Filter sidebar (desktop) or filter drawer (mobile) appears on category and search pages.
- Brand filter: multi-select checkboxes with search within the brand list.
- Price segment filter: Budget, Mid-Range, Premium (tags assigned by admin).
- Specification filters are dynamic per category (e.g., Wattage for lighting, Wire gauge for cables).
- Active filters are shown as removable chips above the product grid.
- Product count updates live as filters are applied.
- "Clear All Filters" resets to default view.
- URL reflects applied filters (shareable filtered URLs).
- Filter state persists during the browsing session.

**Priority:** P1
**Complexity:** M
**Dependencies:** BUY-040, BUY-041

---

### BUY-043: Product Comparison (Side by Side)

**Description:** Buyers can select 2-4 products to compare side by side. The comparison view shows all specifications in a tabular format with differences highlighted, making it easy to identify the best option.

**User Story:** As a buyer, I want to compare multiple products side by side, so that I can understand the differences and pick the best one for my needs.

**Acceptance Criteria:**
- "Compare" checkbox appears on each product card in category/search views.
- A sticky comparison bar at the bottom shows selected products (2-4 max) with a "Compare Now" button.
- Comparison page shows products as columns with specification rows aligned.
- Differences between products are highlighted in a distinct color.
- Identical specs across all products are visually de-emphasized.
- Each product column has a "Get Quotes" and "Remove" button.
- Comparison can be shared via link or exported as PDF.
- If products are from different categories, only shared specification fields are shown.
- Mobile view allows horizontal scrolling between product columns.

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-044

---

### BUY-044: Product Detail Page

**Description:** Each product has a dedicated detail page showing complete information: specifications, images, datasheet PDF, installation manuals, compatible products, brand information, and a prominent "Get Quotes" CTA.

**User Story:** As a buyer, I want to see detailed product specifications and documentation, so that I can verify the product meets my requirements before requesting quotes.

**Acceptance Criteria:**
- Product name, brand, model number, and category breadcrumb are displayed at the top.
- Image gallery with zoom-on-hover (desktop) and swipe (mobile), supporting multiple product images.
- Specifications table with all relevant fields (varies by category).
- Downloadable datasheet PDF link (if available).
- "Get Quotes" CTA button (prominent, above the fold).
- "Similar Products" section below the main content.
- Brand logo and link to brand directory page.
- SEO-optimized: unique title, meta description, structured data (Product schema).
- Page loads within 2 seconds on 3G connection.
- If product has no images, a category-appropriate placeholder is shown.

**Priority:** P1
**Complexity:** M
**Dependencies:** ADM-032

---

### BUY-045: Save/Wishlist Products

**Description:** Buyers can save products to a personal wishlist for later reference. The wishlist is accessible from the user's profile and persists across sessions.

**User Story:** As a buyer, I want to save products I am interested in, so that I can find them easily later when I am ready to purchase.

**Acceptance Criteria:**
- Heart/bookmark icon on every product card and product detail page.
- Clicking toggles the saved state (filled = saved, outline = not saved).
- "My Wishlist" page accessible from the user dropdown menu.
- Wishlist shows saved products with: name, brand, image, category, and date saved.
- Each wishlist item has: "Get Quotes" and "Remove" actions.
- Wishlist is sorted by most recently saved.
- If a wishlisted product is removed from the catalog, it is flagged as "No longer available."
- Wishlist requires login (guest users see a login prompt on click).

**Priority:** P2
**Complexity:** S
**Dependencies:** BUY-044

---

### BUY-046: Brand Directory

**Description:** A directory page listing all brands available on the platform with logos, descriptions, product count, and links to brand-specific product listings. This builds trust and helps buyers discover brands.

**User Story:** As a buyer, I want to browse all available brands, so that I can find products from brands I trust.

**Acceptance Criteria:**
- Brand directory page shows all brands in an alphabetical grid with logos.
- Each brand card shows: logo, brand name, number of products, and categories served.
- Clicking a brand opens the brand detail page with: description, full product listing, authorized dealers count.
- Filter by category (e.g., show only brands in "Wires & Cables").
- Search within brand directory by name.
- Brand logos are high-quality and consistently sized.
- SEO-optimized with individual brand pages indexed by search engines.
- Page loads within 3 seconds with lazy-loaded brand logos.

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-031

---

### BUY-047: Buying Guides (Knowledge Articles)

**Description:** Category-specific buying guides that educate buyers on what to look for when purchasing electrical products. Articles cover topics like "How to choose the right wire gauge," "LED vs CFL comparison," and "Understanding IP ratings."

**User Story:** As a buyer unfamiliar with electrical products, I want to read buying guides, so that I can make informed purchasing decisions.

**Acceptance Criteria:**
- Buying guides are linked from relevant category pages.
- Each guide includes: title, table of contents, structured content with headings, images/diagrams, product recommendations, and a CTA ("Ready to buy? Get Quotes").
- Guides are written in simple language (reading level: Grade 8).
- Hindi versions available for top guides (PLT-001 dependency).
- Guides are SEO-optimized (targeting long-tail keywords like "best wire for home wiring India").
- Admin can create and edit guides via CMS (ADM-034).
- Guides show related products and categories in sidebar.
- Comments/questions section at the bottom for user interaction.

**Priority:** P3
**Complexity:** M
**Dependencies:** ADM-034, PLT-001

---

### BUY-048: Price Alerts

**Description:** Buyers can set price alerts for specific products. When a quote or market price drops below the buyer's target price, they receive a notification. This encourages buyers to stay engaged and converts them when conditions are right.

**User Story:** As a buyer, I want to be notified when a product's price drops below my target, so that I can buy at the right time.

**Acceptance Criteria:**
- "Set Price Alert" button on product detail pages and wishlist items.
- Alert form: target price (required), notification channel (push, email, WhatsApp).
- Alert is triggered when any dealer quotes below the target price for that product in any inquiry.
- Buyer receives notification with: product name, quoted price, and CTA to submit an inquiry.
- Maximum 20 active price alerts per user.
- Alerts can be paused, edited, or deleted from the "Price Alerts" dashboard section.
- Alerts expire after 90 days unless renewed.
- If no price data is available, the alert is checked against each new matching quote.

**Priority:** P3
**Complexity:** M
**Dependencies:** BUY-044, PLT-004

---

## 1.6 RFQ System

---

### BUY-050: Create Detailed RFQ

**Description:** Buyers can create a formal Request for Quotation (RFQ) with multiple line items, detailed specifications, and procurement terms. This is designed for larger buyers, contractors, and procurement managers who need structured quotes.

**User Story:** As a procurement manager, I want to create a detailed RFQ with multiple items and specific terms, so that I receive structured, comparable quotes from dealers.

**Acceptance Criteria:**
- RFQ form includes: title, description, line items (product name, specs, quantity, unit), delivery requirements, payment terms preference, validity period, and supporting documents.
- Each line item has fields for: product name (required), brand preference (optional), model (optional), quantity (required), unit, specifications (key-value pairs).
- Minimum 1, maximum 100 line items.
- Supporting document upload (BOQ spreadsheets, drawings): PDF, XLSX, max 20MB.
- RFQ number generated on creation (RFQ-YYYYMMDD-XXXX).
- RFQ saved as draft until explicitly published.
- RFQ preview before publishing.
- On publish, RFQ is distributed to matching dealers.

**Priority:** P2
**Complexity:** L
**Dependencies:** BUY-016, AUT-001

---

### BUY-051: Specify Delivery Requirements

**Description:** Within an RFQ or inquiry, buyers can specify detailed delivery requirements including city, pincode, exact address, preferred delivery date, urgency level, and site access constraints.

**User Story:** As a buyer, I want to specify exactly where and when I need the products delivered, so that dealers can provide accurate delivery timelines and costs.

**Acceptance Criteria:**
- Delivery section in RFQ/inquiry form includes: delivery city (required), pincode (required for RFQ), full address (optional, revealed only to selected dealer), preferred delivery date (date picker), urgency level (standard/urgent/flexible), site access notes (e.g., "Freight elevator available, max 2 tonnes").
- Date picker prevents selection of past dates.
- Urgent delivery is flagged to dealers with a visual indicator.
- Address is encrypted and only revealed to the winning dealer.
- Delivery requirements are factored into dealer matching (geographic proximity).
- Multiple delivery locations supported for split shipments.

**Priority:** P1
**Complexity:** S
**Dependencies:** BUY-010

---

### BUY-052: Publish RFQ to Dealer Network

**Description:** When a buyer publishes an RFQ, it is distributed to all matching verified dealers based on brand coverage, category expertise, and service area. Dealers receive notifications and can view the RFQ details to decide whether to quote.

**User Story:** As a buyer, I want my RFQ sent to relevant dealers automatically, so that I receive competitive quotes from qualified suppliers.

**Acceptance Criteria:**
- On publish, the system identifies matching dealers based on: brand mappings, category mappings, and service area pincodes.
- Minimum 3 matching dealers required; if fewer, admin is alerted for manual intervention.
- Matched dealers receive notification (push, email) with RFQ summary.
- RFQ detail page (dealer view) shows all line items, quantities, delivery requirements, and timeline.
- Buyer identity is hidden (blind RFQ).
- Dealers have a configurable window to respond (default 72 hours for RFQs).
- Real-time counter shows buyer how many dealers have viewed and are preparing quotes.
- If no dealer responds within the window, buyer is notified with options to extend or modify.

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-050, AUT-001

---

### BUY-053: View and Compare RFQ Quotes

**Description:** Buyers view all RFQ responses in a structured comparison interface. Unlike simple inquiry quotes, RFQ comparison shows line-item-level pricing, enabling apples-to-apples comparison across dealers.

**User Story:** As a buyer, I want to compare RFQ responses at the line-item level, so that I can identify the best overall value or cherry-pick items from different dealers.

**Acceptance Criteria:**
- RFQ comparison table shows: one column per dealer (anonymized), one row per line item.
- Each cell shows: unit price, total price, delivery date, and any notes from the dealer.
- Grand total row at the bottom per dealer.
- Color-coded cells: green for lowest price per item, red for highest.
- Sort by: total price, delivery speed, number of items quoted.
- Filter: show only fully-quoted RFQs (dealers who quoted all items) vs. partial.
- Exportable as PDF or Excel.
- Mobile-responsive with horizontal scroll.

**Priority:** P2
**Complexity:** L
**Dependencies:** BUY-050, BUY-020

---

### BUY-054: Select Dealer for RFQ

**Description:** The buyer selects a winning dealer (or multiple dealers for split orders) for the RFQ. Selection reveals contact information for both parties and triggers order confirmation workflow.

**User Story:** As a buyer, I want to select the winning dealer for my RFQ, so that I can proceed with procurement.

**Acceptance Criteria:**
- "Award" button per dealer in the comparison view.
- Option to award entire RFQ to one dealer or split across multiple dealers (item-by-item).
- Confirmation dialog showing: selected items, dealer(s), total value, and terms.
- On award, dealer(s) receive winning notification with buyer contact details.
- Losing dealers receive notification with summary (winning prices anonymized).
- RFQ status changes to "Awarded."
- Award is logged for analytics and audit trail.
- Buyer can add notes to the award (e.g., "Please confirm delivery by [date]").

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-053, BUY-023

---

### BUY-055: RFQ Chat with Dealers (Post-Selection)

**Description:** After a dealer is selected for an RFQ, a chat channel opens between the buyer and dealer within the platform. This allows coordination on delivery logistics, payment terms, document exchange, and issue resolution.

**User Story:** As a buyer, I want to chat with the selected dealer within the platform, so that I can coordinate purchase details without switching to external messaging apps.

**Acceptance Criteria:**
- Chat opens automatically after RFQ award between buyer and selected dealer(s).
- Real-time messaging with text, file attachments (PDF, images up to 10MB), and read receipts.
- Chat history is persistent and accessible from the RFQ detail page.
- Push notification on new messages.
- Typing indicator shows when the other party is typing.
- Chat is disabled for non-selected dealers (they cannot contact the buyer).
- Messages are encrypted in transit and at rest.
- Chat can be archived after order completion.

**Priority:** P3
**Complexity:** L
**Dependencies:** BUY-054

---

## 1.7 Community

---

### BUY-060: Community Forum

**Description:** A discussion forum where buyers, professionals, and enthusiasts can ask questions, share experiences, post reviews, and discuss electrical products and installation topics. The forum builds engagement and positions Hub4Estate as a knowledge hub.

**User Story:** As a buyer, I want to ask questions and read discussions about electrical products, so that I can learn from the experiences of others.

**Acceptance Criteria:**
- Forum accessible from the main navigation.
- Post creation form: title (required), body (rich text, required), category tag (required), city tag (optional), media upload (optional).
- Post listing shows: title, author name, category tag, city tag, timestamp, upvote count, comment count.
- Posts sorted by: Trending (upvotes + recency), Newest, Most Discussed.
- Each post has a detail page with full content and comments.
- Users must be logged in to create posts or comments (guests can read).
- Posts support markdown formatting.
- Auto-moderation flags posts with offensive language.

**Priority:** P3
**Complexity:** L
**Dependencies:** BUY-001

---

### BUY-061: Post with City/Category Tags

**Description:** Forum posts can be tagged with city and electrical product category. Tags enable filtering so users can find discussions relevant to their location and interest area.

**User Story:** As a buyer, I want to filter forum posts by my city and product category, so that I see discussions most relevant to me.

**Acceptance Criteria:**
- Category tags drawn from the platform's category taxonomy (14 primary categories + subcategories).
- City tags drawn from the city database (autocomplete).
- Posts must have at least one category tag.
- City tag is optional but encouraged (prompt: "Adding your city helps others nearby find your post").
- Tag filters available as sidebar facets on the forum listing page.
- Multiple category tags allowed per post (max 3).
- Tag clouds or popular tags shown on the forum homepage.
- Filtering by tag updates the URL (shareable filtered views).

**Priority:** P3
**Complexity:** S
**Dependencies:** BUY-060

---

### BUY-062: Upvote Posts and Comments

**Description:** Users can upvote posts and comments to surface the most helpful content. Upvote count is displayed on each post and comment, and feeds into the trending sort algorithm.

**User Story:** As a buyer, I want to upvote helpful posts and comments, so that the best content rises to the top.

**Acceptance Criteria:**
- Upvote button (arrow icon) on every post and comment.
- Each user can upvote each post/comment exactly once (toggle: upvote/remove upvote).
- No downvote functionality (positive-only, by design).
- Upvote count is displayed next to the button.
- Upvoting requires login (prompt login modal for guests).
- Trending sort algorithm: (upvotes * decay_factor) + recency_score.
- Upvote action is instant (optimistic UI update, synced to server).
- Bulk upvote abuse detection: max 50 upvotes per user per hour.

**Priority:** P3
**Complexity:** S
**Dependencies:** BUY-060

---

### BUY-063: Nested Comment Threads

**Description:** Comments on forum posts support nesting (replies to replies) up to 3 levels deep, enabling threaded discussions. This allows users to have focused sub-conversations within a post.

**User Story:** As a buyer, I want to reply directly to another comment, so that the discussion stays organized and I can have focused conversations.

**Acceptance Criteria:**
- Each comment has a "Reply" button that opens an inline reply form.
- Replies are indented visually to show nesting (max 3 levels; deeper replies are appended to level 3).
- Each comment shows: author name, timestamp, content, upvote count, reply count, and "Reply" action.
- Comments support markdown formatting.
- Collapse/expand for comment threads with many replies.
- Newest replies appear at the bottom of each thread.
- Edit own comment within 15 minutes of posting.
- Delete own comment (soft delete; shows "[deleted]" if it has replies, hard delete if no replies).

**Priority:** P3
**Complexity:** M
**Dependencies:** BUY-060

---

### BUY-064: Expert Answers from Verified Professionals

**Description:** Verified professionals (architects, electricians, contractors) who answer forum questions receive an "Expert" badge on their responses. Expert answers are pinned or highlighted to help buyers identify authoritative advice.

**User Story:** As a buyer, I want to identify expert answers from verified professionals, so that I can trust the advice I follow.

**Acceptance Criteria:**
- Comments from verified professionals (BUY-005) display an "Expert" badge next to the author name.
- Badge shows the professional's role (e.g., "Verified Architect").
- Expert answers can be pinned to the top of the comment thread by the post author or admin.
- A "Verified Experts" filter in the forum shows only posts/comments by verified professionals.
- Professionals are incentivized with a "Community Expert" leaderboard (based on upvotes received).
- Expert status is automatically applied based on verification records; no manual intervention needed.
- Non-verified users cannot claim expert status.

**Priority:** P4
**Complexity:** M
**Dependencies:** BUY-005, BUY-060

---

## 1.8 AI Assistant (Volt AI)

---

### BUY-070: Volt AI Chatbot (Floating Widget)

**Description:** A floating AI chat widget (named "Volt") appears on all pages. Volt can answer product questions, help navigate the platform, assist with inquiry submission, and provide personalized recommendations. It is the AI-powered concierge for the entire buyer experience.

**User Story:** As a buyer, I want to chat with an AI assistant, so that I can get instant help with product questions, platform navigation, and inquiry submission.

**Acceptance Criteria:**
- Floating chat icon fixed at the bottom-right of all pages.
- Clicking opens a chat panel (300px wide on desktop, full-screen on mobile).
- Welcome message: "Hi! I'm Volt, your electrical products assistant. How can I help you today?"
- Quick action buttons below welcome: "Submit an Inquiry", "Track My Order", "Find a Product", "Get Recommendations."
- Chat supports text input with send button and Enter key.
- Responses are streamed (token by token) for a real-time feel.
- Chat history persists within the session (cleared on logout).
- Volt is powered by an LLM with Hub4Estate product knowledge context.
- Fallback: if Volt cannot answer, it offers "Would you like to speak with our support team?"
- Chat widget does not interfere with page content or CTAs.

**Priority:** P2
**Complexity:** XL
**Dependencies:** None

---

### BUY-071: Product Recommendations via Chat

**Description:** Volt AI can recommend products based on the buyer's described needs. For example, "I need LED lights for a 12x14 bedroom" returns specific product suggestions with specifications and "Get Quotes" links.

**User Story:** As a buyer, I want to describe my needs to Volt and receive product recommendations, so that I can find the right products without being an expert.

**Acceptance Criteria:**
- Volt understands natural language descriptions of requirements (room size, use case, budget, brand preference).
- Recommendations include: product name, brand, model, key specs, and a "Get Quotes" action link.
- Maximum 5 recommendations per query.
- Recommendations are drawn from the platform's product catalog.
- Volt explains why each product is recommended ("This 15W panel light is ideal for your bedroom size").
- If no matching products exist in the catalog, Volt suggests the closest alternatives or directs to the inquiry form.
- Recommendations factor in the buyer's city (for dealer availability).
- Response time under 5 seconds.

**Priority:** P2
**Complexity:** L
**Dependencies:** BUY-070, ADM-032

---

### BUY-072: Price Estimation via Chat

**Description:** Volt AI provides approximate price ranges for products based on historical quote data. This gives buyers a benchmark before submitting an inquiry and helps set realistic expectations.

**User Story:** As a buyer, I want to ask Volt "How much does X cost?" and get a price range, so that I have a realistic expectation before requesting quotes.

**Acceptance Criteria:**
- Volt responds to price queries with: estimated range (e.g., "Havells 15W LED panels typically go for Rs. 450-600 per piece on Hub4Estate").
- Price ranges are derived from historical quote data aggregated across dealers.
- If insufficient data exists, Volt responds with MRP from the catalog with a note: "MRP is Rs. X. Hub4Estate dealers typically offer 20-40% below MRP."
- Prices are context-aware: adjust based on quantity ("For 200+ pieces, you can expect Rs. 420-500 per piece").
- Disclaimer shown: "These are estimated ranges based on past quotes. Actual prices may vary."
- Price data is refreshed daily from completed inquiries.
- Volt offers to submit an inquiry for the exact price: "Want me to get you real quotes from dealers?"

**Priority:** P3
**Complexity:** L
**Dependencies:** BUY-070, ADM-050

---

### BUY-073: Submit Inquiry via Chat

**Description:** Buyers can submit an inquiry entirely through the Volt chat interface without navigating to the inquiry form. Volt guides them through the required fields conversationally.

**User Story:** As a buyer, I want to submit an inquiry by chatting with Volt, so that I can do it quickly without navigating to a form.

**Acceptance Criteria:**
- User can say "I want to buy X" or "Get me quotes for X" to trigger the inquiry flow.
- Volt asks for missing fields conversationally: "How many do you need?", "Which city should it be delivered to?"
- Volt confirms all details before submitting: "Let me confirm: 200 pieces of Havells 15W LED panels, delivered to Jaipur. Shall I submit?"
- On confirmation, Volt creates the inquiry via the same API as the manual form.
- User receives the inquiry number in the chat: "Done! Your inquiry INQ-20260402-0045 has been submitted. You'll receive quotes within 24 hours."
- If user is not logged in, Volt collects name and phone number within the chat.
- Conversational flow supports corrections: "Actually, make it 300 pieces."
- Inquiry created via chat is identical in structure and routing to form-submitted inquiries.

**Priority:** P2
**Complexity:** L
**Dependencies:** BUY-070, BUY-010

---

### BUY-074: Track Inquiry via Chat

**Description:** Buyers can ask Volt for the status of their inquiry. Volt retrieves real-time status and displays it inline in the chat, eliminating the need to navigate to the tracking page.

**User Story:** As a buyer, I want to ask Volt "What's the status of my inquiry?" and get an instant answer, so that I don't have to navigate through menus.

**Acceptance Criteria:**
- User can ask: "Track my inquiry", "Status of INQ-20260402-0045", or "Do I have any quotes?"
- If logged in, Volt retrieves the user's most recent active inquiry by default.
- If multiple active inquiries, Volt asks: "Which inquiry? [lists inquiry numbers with product names]."
- Volt displays: inquiry number, product, status, number of quotes received, and next expected action.
- If quotes are available, Volt shows a summary: "You have 3 quotes. The lowest is Rs. 465/piece. Want to see the comparison?"
- Link to the full comparison page is included.
- If not logged in, Volt asks for the phone number and verifies via OTP before showing status.
- Response time under 3 seconds.

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-070, BUY-030

---

### BUY-075: Voice Chat Mode

**Description:** Volt AI supports voice input and output. Buyers can speak their questions and hear responses, creating a hands-free experience ideal for users on construction sites or those less comfortable with typing.

**User Story:** As a buyer working on a construction site, I want to speak to Volt and hear responses, so that I can interact hands-free.

**Acceptance Criteria:**
- Microphone icon in the Volt chat panel toggles voice input mode.
- Voice input is transcribed in real-time and sent as a chat message.
- Volt's text responses are also read aloud via text-to-speech (toggleable).
- Supports Hindi and English speech input.
- Visual feedback during listening (pulsing animation) and speaking (audio wave animation).
- Voice mode can be toggled on/off without losing chat history.
- Works on mobile browsers (Chrome, Safari) with microphone permission.
- Audio output uses Web Speech API or similar (no external dependency for basic TTS).

**Priority:** P4
**Complexity:** L
**Dependencies:** BUY-070, BUY-013

---

# SECTION 2: DEALER FEATURES

## 2.1 Onboarding

---

### DLR-001: Multi-Step Dealer Registration

**Description:** Dealers register through a guided multi-step form covering business information, document uploads, brand selection, and service area configuration. The flow is designed to be completable in under 10 minutes while collecting all data needed for verification.

**User Story:** As a dealer, I want to register my business on Hub4Estate through a clear step-by-step process, so that I can get verified and start receiving inquiries.

**Acceptance Criteria:**
- Step 1 - Business Info: Business name (required), owner/contact name (required), phone (required, OTP verified), email (required), business type (wholesaler/distributor/retailer), established year, GST number, PAN number.
- Step 2 - Documents: Upload GST certificate, PAN card, shop license/trade license, cancelled cheque, shop photos (minimum 2).
- Step 3 - Brand Selection: Multi-select from the brand database; for each selected brand, option to upload authorization proof.
- Step 4 - Service Areas: Select cities/pincodes where the dealer can deliver; map-based selection or pincode list input.
- Step 5 - Review & Submit: Summary of all entered data with edit buttons for each section.
- Progress bar shows current step (1/5, 2/5, etc.).
- Data is saved per step (user can return later to complete).
- On submission, dealer status is "Pending Verification" and admin is notified.
- Form works on mobile browsers (many dealers register from phones).

**Priority:** P0
**Complexity:** L
**Dependencies:** DLR-002

---

### DLR-002: GST Number Validation

**Description:** When a dealer enters their GST number during registration, the system validates it in real-time via a government GST API. This verifies the business exists, is active, and extracts the registered business name and address for cross-verification.

**User Story:** As a dealer, I want my GST number validated instantly during registration, so that I know my information is correct and the verification process is faster.

**Acceptance Criteria:**
- GST input field validates format (15 characters: 2-digit state code + 10 PAN + 1 entity code + 1 check digit).
- On valid format entry, an API call is made to the GST verification service.
- Successful verification auto-fills: legal business name, registered address, state, and GST status (active/cancelled/suspended).
- If GST is inactive or cancelled, the dealer sees an error: "This GST number is not active. Please check and re-enter."
- If API is unavailable, the field accepts manual entry with a note "GST will be manually verified by our team."
- Verified GST information is stored and displayed in the admin verification queue.
- API response time under 5 seconds; loading spinner shown during verification.
- GST number is unique per dealer (duplicate check).

**Priority:** P0
**Complexity:** M
**Dependencies:** None

---

### DLR-003: Document Upload

**Description:** Dealers upload required business documents during registration. Documents are stored securely and presented to the admin team for verification. Required documents include GST certificate, PAN card, shop license, cancelled cheque, and shop photographs.

**User Story:** As a dealer, I want to upload my business documents, so that Hub4Estate can verify my business and approve my account.

**Acceptance Criteria:**
- Document types with labels: GST Certificate (required), PAN Card (required), Shop License/Trade License (required), Cancelled Cheque (required), Shop Photos (minimum 2, required).
- Accepted file formats: PDF, JPG, PNG, HEIC. Max size: 10MB per file.
- Upload progress bar per file.
- Uploaded documents show as thumbnails (images) or file icons (PDFs) with filename and size.
- Each document has a remove/replace button.
- Documents are uploaded to S3 with presigned URLs (not publicly accessible).
- Documents are tagged with document type for admin review.
- If required documents are missing, the form cannot proceed to the next step.
- Accessibility: document upload works on mobile with camera capture option.

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-001

---

### DLR-004: Brand Authorization Proof Upload

**Description:** For each brand a dealer claims to be authorized for, they can upload proof of authorization (distributor agreement, brand letter, etc.). Brand authorization boosts dealer credibility and improves matching priority.

**User Story:** As a dealer, I want to upload proof that I am an authorized distributor/dealer for specific brands, so that I receive more inquiries and higher trust scores.

**Acceptance Criteria:**
- During Step 3 (Brand Selection) of registration, each selected brand has an "Upload Authorization" button.
- Upload accepts: PDF, JPG, PNG. Max 10MB.
- Authorization proof is optional (dealer can proceed without it, but verification badge is not granted for that brand).
- Uploaded proof is linked to the specific brand-dealer mapping.
- Admin sees authorization proofs in the verification queue alongside other documents.
- On approval, a "Brand Authorized" badge appears for that brand on the dealer's profile.
- Dealer can add or update brand authorizations after registration from their profile settings.
- If authorization document is expired, admin can request re-upload.

**Priority:** P1
**Complexity:** S
**Dependencies:** DLR-001, ADM-031

---

### DLR-005: Service Area Pincode Selection

**Description:** Dealers define their service areas by selecting cities and/or pincodes where they can deliver products. This data is critical for the inquiry routing engine to match inquiries with geographically relevant dealers.

**User Story:** As a dealer, I want to specify the cities and pincodes I serve, so that I only receive inquiries I can fulfill geographically.

**Acceptance Criteria:**
- Service area selection offers two modes: city-based (select cities from a list) and pincode-based (enter individual pincodes or pincode ranges).
- City selection: multi-select with search/autocomplete; selecting a city auto-includes all pincodes within it.
- Pincode input: comma-separated or range (e.g., "302001-302030").
- Map visualization shows selected areas highlighted (optional, P2+ enhancement).
- Minimum 1 service area required.
- Service areas are stored as pincode sets linked to the dealer record.
- Dealer can update service areas anytime from profile settings.
- Inquiry routing engine (AUT-001) uses these pincodes for matching.

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-001

---

### DLR-006: Business Profile Page Setup

**Description:** Dealers create their public-facing business profile with a description, certifications, year established, specialties, and gallery. This profile is shown (anonymized during quoting, fully visible after selection) to build buyer confidence.

**User Story:** As a dealer, I want to create a compelling business profile, so that buyers trust my business when they see my quotes and after selecting me.

**Acceptance Criteria:**
- Profile fields: business description (rich text, max 2000 characters), specialties (multi-select from categories), certifications (text list), established year, number of employees (range), annual turnover (range, optional), warehouse (yes/no).
- Gallery: up to 10 photos of shop, warehouse, products, certifications. Image upload with crop/resize.
- Preview mode: dealer can see how their profile appears to buyers.
- Profile completion percentage shown (incentivize 100% completion).
- Profile is automatically populated from registration data (GST name, address).
- Dealer can update any profile field at any time.
- Profile changes are reflected immediately (no re-verification needed for non-document changes).

**Priority:** P1
**Complexity:** M
**Dependencies:** DLR-001

---

## 2.2 Inquiry Management

---

### DLR-010: View Available Inquiries (Blind)

**Description:** Verified dealers see a feed of available inquiries matching their brand, category, and service area. Inquiries are displayed blind: product details, quantity, and delivery city are visible, but buyer identity (name, phone, email) is hidden.

**User Story:** As a dealer, I want to see relevant inquiries from buyers in my service area, so that I can decide which ones to quote on.

**Acceptance Criteria:**
- Inquiry feed shows inquiries matching the dealer's: brand mappings, category mappings, and service area pincodes.
- Each inquiry card shows: inquiry number, product name/description, quantity, unit, delivery city, submission date, urgency level, number of quotes already submitted, and time remaining to quote.
- Buyer name, phone, email, and exact address are NOT visible.
- Inquiries are sorted by most recent first (default) with options to sort by urgency, closing time, or quantity.
- Auto-refresh every 60 seconds (or real-time via WebSocket).
- "New Inquiry" badge for inquiries submitted in the last 2 hours.
- Inquiry feed is paginated (20 per page).
- If no matching inquiries exist, the dealer sees: "No new inquiries. We'll notify you when one arrives!"

**Priority:** P0
**Complexity:** M
**Dependencies:** AUT-001, DLR-001

---

### DLR-011: Filter Inquiries by Category, City, Brand

**Description:** Dealers can filter the inquiry feed by product category, delivery city, brand, urgency level, and quantity range. Filters help dealers focus on the most relevant and profitable inquiries.

**User Story:** As a dealer, I want to filter inquiries by category and city, so that I can focus on opportunities that match my strengths.

**Acceptance Criteria:**
- Filter panel (sidebar on desktop, drawer on mobile) with: category (multi-select), delivery city (multi-select), brand (multi-select), urgency (standard/urgent/flexible), quantity range (min/max), date range.
- Active filters shown as removable chips.
- Inquiry count updates live as filters are applied.
- "Save Filter" option to save a filter preset for one-click access later.
- Maximum 5 saved filter presets.
- "Clear All" resets to default (all matching inquiries).
- Filters persist during the session.
- Filtered URL is not shareable (security: inquiry data is dealer-specific).

**Priority:** P1
**Complexity:** S
**Dependencies:** DLR-010

---

### DLR-012: View Inquiry Details

**Description:** Dealers can click on an inquiry to view full details before deciding to quote. The detail view shows all product information, specifications, photos, delivery requirements, and buyer notes.

**User Story:** As a dealer, I want to see complete inquiry details, so that I can prepare an accurate quote.

**Acceptance Criteria:**
- Detail page shows: inquiry number, product name/description, brand (if specified), model number (if specified), quantity, unit, delivery city, pincode (if provided), urgency level, preferred delivery date (if specified), buyer notes, and attached photos.
- Photos are displayed in a lightbox/gallery view.
- "Submit Quote" CTA is prominently placed.
- Detail page shows: how many other dealers are quoting (e.g., "4 dealers are quoting"), time remaining to quote.
- If the inquiry is closed or expired, the page shows the status with no quote submission option.
- Back button returns to the inquiry feed with filters preserved.
- On mobile, the detail view is optimized as a full-screen page.

**Priority:** P0
**Complexity:** S
**Dependencies:** DLR-010

---

### DLR-013: Submit Quote

**Description:** Dealers submit a quote for an inquiry with pricing, shipping cost, delivery timeline, payment terms, and notes. The quote is sent to the buyer for comparison. This is the core revenue-generating action for the platform.

**User Story:** As a dealer, I want to submit a competitive quote for an inquiry, so that I can win the buyer's business.

**Acceptance Criteria:**
- Quote form fields: unit price (required, numeric), quantity confirmed (auto-filled from inquiry, editable), total price (auto-calculated), shipping cost (required, can be 0 for free shipping), estimated delivery date (date picker, required), payment terms (dropdown: advance, COD, 15-day credit, 30-day credit), quote validity (dropdown: 24h, 48h, 72h, 1 week), notes to buyer (optional text, max 500 characters).
- For multi-item inquiries, the dealer quotes per item with an overall total.
- Form validates: unit price > 0, delivery date is in the future, all required fields filled.
- On submission, the quote is immediately visible to the buyer in the comparison table.
- Dealer receives confirmation: "Quote submitted for INQ-20260402-0045."
- Dealer can edit their quote within 1 hour of submission (after that, only revision via BUY-025).
- Quote submission is logged for analytics (response time, pricing patterns).
- Dealer cannot submit more than one quote per inquiry (revision flow only).

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-012, BUY-020

---

### DLR-014: Quote Templates

**Description:** Dealers can save frequently used pricing as templates (e.g., "Standard Havells MCB pricing" or "LED Panel bulk rate"). Templates auto-fill quote fields, reducing repetitive data entry for dealers who quote similar products frequently.

**User Story:** As a dealer who quotes the same products regularly, I want to save quote templates, so that I can submit quotes faster.

**Acceptance Criteria:**
- "Save as Template" option on the quote submission form.
- Template includes: product/category name, default unit price, default shipping cost, default delivery timeline, default payment terms, default notes.
- Dealer can manage templates from a "My Templates" section in their dashboard.
- When submitting a quote, dealer can select "Use Template" to auto-fill fields.
- Auto-filled fields are editable before submission.
- Maximum 50 templates per dealer.
- Templates can be edited, duplicated, and deleted.
- Templates are searchable by product name or category.

**Priority:** P2
**Complexity:** M
**Dependencies:** DLR-013

---

### DLR-015: Bulk Quote Submission

**Description:** For multi-item RFQs or when multiple inquiries are open for similar products, dealers can submit quotes in bulk using a spreadsheet-like interface or by uploading a CSV file.

**User Story:** As a dealer with many open inquiries, I want to submit quotes in bulk, so that I save time and respond to more opportunities.

**Acceptance Criteria:**
- Bulk quote mode accessible from the dealer dashboard.
- Two methods: (a) in-app spreadsheet view with one row per inquiry, editable columns for price, shipping, delivery; (b) CSV upload with defined template (downloadable).
- CSV template includes columns: inquiry number, unit price, shipping cost, delivery date, payment terms, notes.
- Validation runs on all rows before submission (invalid rows are highlighted with error messages).
- Dealer reviews and confirms all quotes before bulk submission.
- Successfully submitted quotes are marked green; failed rows show errors.
- Maximum 50 quotes per bulk submission.
- Bulk submission is logged as individual quotes in the system (each buyer sees only their quote).

**Priority:** P3
**Complexity:** L
**Dependencies:** DLR-013

---

### DLR-016: Quote Revision

**Description:** When a buyer requests a revised quote (BUY-025), the dealer receives the revision request with buyer's notes and can submit an updated quote. The original and revised quotes coexist for the buyer's comparison.

**User Story:** As a dealer, I want to revise my quote when a buyer requests it, so that I can negotiate and improve my chances of winning.

**Acceptance Criteria:**
- Revision request appears as a notification in the dealer dashboard with the buyer's notes.
- Clicking opens the original quote pre-filled in an editable form.
- Dealer modifies fields and submits the revised quote.
- Revised quote is tagged "Revised" and linked to the original.
- Both original and revised quotes are visible to the buyer.
- Dealer can add a note explaining the revision (e.g., "Reduced price for your quantity").
- Maximum 3 revisions per inquiry (matching BUY-025 limit).
- Revision must be submitted within the deadline set in the revision request.

**Priority:** P2
**Complexity:** S
**Dependencies:** DLR-013, BUY-025

---

### DLR-017: Win Notification with Buyer Contact

**Description:** When a buyer selects a dealer's quote, the dealer receives an instant notification with the buyer's full contact details (name, phone, email, address). This is the "reveal" moment that drives the platform's value for dealers.

**User Story:** As a dealer, I want to be instantly notified when I win a quote and receive the buyer's contact details, so that I can follow up and close the sale.

**Acceptance Criteria:**
- Notification delivered via: push notification, email, WhatsApp, and in-app notification.
- Notification includes: inquiry number, product name, quantity, buyer's name, buyer's phone number, buyer's email, delivery address (if provided).
- Notification is sent within 60 seconds of the buyer's selection.
- In-app notification links to the inquiry detail page, now showing the buyer's full details.
- "Call Buyer" and "WhatsApp Buyer" action buttons on the inquiry detail page.
- Win is logged in the dealer's analytics (DLR-020).
- Dealer dashboard shows a persistent "Won Inquiries" section.

**Priority:** P0
**Complexity:** M
**Dependencies:** BUY-023

---

### DLR-018: Loss Notification with Winning Price

**Description:** When an inquiry is closed and a dealer's quote was not selected, the dealer receives a notification informing them they lost, along with the winning price (anonymized, no buyer or winning dealer identity). This provides market intelligence for improving future quotes.

**User Story:** As a dealer, I want to know the winning price when I lose a quote, so that I can adjust my pricing strategy for future inquiries.

**Acceptance Criteria:**
- Notification delivered via: in-app notification and email (not push/WhatsApp, to avoid spam).
- Notification includes: inquiry number, product name, "Your quote: Rs. X", "Winning quote: Rs. Y", price difference percentage.
- No buyer or winning dealer identity is revealed.
- Loss is logged in the dealer's analytics for pricing trend analysis.
- Dealer dashboard shows loss analytics: average price gap, categories where they're competitive/not.
- Notification is sent within 5 minutes of inquiry closure.
- Dealer can opt out of loss notifications from notification settings.
- Aggregate data feeds into competitor price benchmarking (DLR-024).

**Priority:** P1
**Complexity:** S
**Dependencies:** BUY-023

---

## 2.3 Dashboard & Analytics

---

### DLR-020: Dealer Dashboard Overview

**Description:** The dealer's home screen showing key metrics at a glance: total inquiries received, quotes submitted, win rate, revenue generated, and recent activity. This provides instant visibility into the dealer's Hub4Estate performance.

**User Story:** As a dealer, I want to see my key performance metrics on one screen, so that I can monitor my business health on Hub4Estate.

**Acceptance Criteria:**
- Dashboard shows cards for: inquiries received (this month/total), quotes submitted (this month/total), win rate (percentage), revenue through Hub4Estate, average response time.
- Sparkline trends on each metric card (last 30 days).
- "Recent Activity" feed showing last 10 events (inquiry received, quote submitted, win/loss, review received).
- Quick actions: "View Open Inquiries", "Submit Quote", "Update Profile."
- Dashboard data refreshes on page load and auto-refreshes every 5 minutes.
- Date range selector to view metrics for custom periods.
- Mobile-optimized layout with stacked cards.
- If the dealer is newly registered with no data, helpful onboarding tips are shown instead of empty charts.

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-010, DLR-013

---

### DLR-021: Quote Performance Analytics

**Description:** Detailed analytics on the dealer's quoting performance: win rate by category, average quote value, price competitiveness vs. market, response time trends, and quote-to-win funnel.

**User Story:** As a dealer, I want detailed analytics on my quoting performance, so that I can identify areas for improvement and win more business.

**Acceptance Criteria:**
- Charts: win rate trend (line chart, monthly), win rate by category (bar chart), average quote value (trend), response time (trend), quote-to-win funnel (funnel chart).
- Data table: list of all quotes with columns: inquiry number, product, quote amount, status (won/lost/pending/expired), response time, winning price (if lost).
- Filterable by: date range, category, brand, status.
- Exportable as CSV.
- Comparison: "Your average price vs. market average" per category (using anonymized data).
- Insights section: AI-generated tips (e.g., "Your response time is 2x slower than top dealers. Try responding within 4 hours.").
- Data retention: analytics available for last 12 months.

**Priority:** P2
**Complexity:** L
**Dependencies:** DLR-020

---

### DLR-022: Revenue Tracking

**Description:** Dealers can track their Hub4Estate-sourced revenue including total value of won quotes, month-over-month growth, and breakdown by category, brand, and city.

**User Story:** As a dealer, I want to track how much revenue Hub4Estate generates for me, so that I can justify my subscription cost.

**Acceptance Criteria:**
- Revenue dashboard shows: total revenue (all time), this month's revenue, month-over-month growth percentage, average deal size.
- Breakdown charts: revenue by category (pie chart), revenue by brand (bar chart), revenue by city (geographic heat map or bar chart).
- Revenue trend line chart (last 12 months).
- Each data point links to the underlying won inquiries.
- Revenue is based on won quote values (total price including shipping).
- Exportable as CSV or PDF (for accounting).
- Revenue projections based on current month's pace (optional P3 feature).

**Priority:** P2
**Complexity:** M
**Dependencies:** DLR-020

---

### DLR-023: Response Time Metrics

**Description:** Dealers can see their average response time (time from inquiry receipt to quote submission) with breakdowns by time of day, category, and urgency level. Faster response times correlate with higher win rates.

**User Story:** As a dealer, I want to see my response time metrics, so that I can improve my speed and win more quotes.

**Acceptance Criteria:**
- Metrics shown: average response time (overall), median response time, fastest response, slowest response.
- Trend chart: response time over last 30 days.
- Breakdown: response time by time of day (morning/afternoon/evening), by category, by urgency level.
- Benchmark: "Your average: 6 hours. Top dealers: 2 hours."
- Alert if response time trend is worsening.
- Data is updated in real-time as new quotes are submitted.
- Available for the last 12 months.

**Priority:** P2
**Complexity:** S
**Dependencies:** DLR-020

---

### DLR-024: Competitor Price Benchmarking (Anonymized)

**Description:** Dealers can see how their pricing compares to other dealers in the same categories and brands. Data is fully anonymized (no dealer names) and presented as percentile ranges, averages, and distributions.

**User Story:** As a dealer, I want to see how my pricing compares to the market, so that I can price competitively.

**Acceptance Criteria:**
- Benchmarking page shows: "Your average price" vs. "Market average" per product category.
- Visualization: bell curve distribution showing where the dealer's prices fall (percentile).
- Breakdown by brand: "For Havells MCBs, your average quote is Rs. 145. Market average: Rs. 138."
- Data is anonymized: no individual dealer names, phone numbers, or identifying information.
- Minimum 5 data points required per category/brand before benchmarking is shown (to prevent identification).
- Data refreshed weekly.
- Insights: "You are 5% above market average in Wires & Cables. Consider adjusting pricing to win more."
- Available only to Standard and Premium subscription tiers.

**Priority:** P3
**Complexity:** L
**Dependencies:** DLR-020, ADM-050

---

### DLR-025: Monthly Performance Reports

**Description:** Automated monthly reports delivered to dealers via email (and downloadable from dashboard) summarizing their performance: inquiries received, quotes submitted, wins, revenue, response time, and competitive positioning.

**User Story:** As a dealer, I want a monthly performance report, so that I can review my Hub4Estate performance and share it with my team.

**Acceptance Criteria:**
- Report generated automatically on the 1st of each month for the previous month.
- Report includes: executive summary, inquiry metrics, quote metrics, win/loss analysis, revenue summary, response time analysis, top-performing categories, recommendations.
- Delivered via email as PDF attachment.
- Also accessible from the dealer dashboard ("Monthly Reports" section).
- Report is branded with Hub4Estate logo and the dealer's business name.
- Historical reports available for the last 12 months.
- Report generation is automated via scheduled job (AUT-013).

**Priority:** P3
**Complexity:** M
**Dependencies:** DLR-020, DLR-021, DLR-022

---

## 2.4 Profile & Reputation

---

### DLR-030: Public Dealer Profile Page

**Description:** Each dealer has a public profile page visible to buyers (post-quote selection) and to the broader market. The profile showcases the dealer's business, certifications, ratings, and gallery.

**User Story:** As a dealer, I want a professional public profile, so that buyers can trust me and I attract more business.

**Acceptance Criteria:**
- Profile URL: hub4estate.com/dealer/[slug].
- Profile displays: business name, logo, description, established year, certifications, brand authorizations, service areas, rating (average stars), review count, photo gallery.
- Verification badges: GST Verified, Brand Authorized (per brand), Hub4Estate Certified.
- Contact information is visible only to buyers who have selected the dealer's quote.
- Profile is SEO-indexed (helps dealers attract organic traffic).
- Profile completion percentage is shown to the dealer (incentive to complete all fields).
- Responsive design: works well on mobile.
- If the dealer account is suspended, the profile shows "This business is not currently active."

**Priority:** P1
**Complexity:** M
**Dependencies:** DLR-006

---

### DLR-031: Customer Reviews and Ratings

**Description:** Buyer reviews and ratings are displayed on the dealer's profile. The aggregate rating (average stars) is shown in the quote comparison table, helping buyers assess dealer reliability.

**User Story:** As a dealer, I want buyer reviews displayed on my profile, so that positive reviews build my reputation and attract more business.

**Acceptance Criteria:**
- Reviews section on the dealer profile shows: average rating (stars), total review count, rating distribution (5-star, 4-star, etc. bar chart), and individual reviews.
- Each review shows: buyer name (first name + last initial), star rating, review text, date, and optional photos.
- Reviews are sorted by most recent (default), with options for "Most Helpful" and "Highest Rated."
- Dealer can respond to reviews (one response per review, visible publicly).
- Offensive reviews are flagged and hidden pending admin review.
- Minimum 3 reviews required before the average rating is shown publicly (to prevent outlier bias).
- Reviews feed into the anonymized dealer rating shown during quote comparison (BUY-022).

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-034

---

### DLR-032: Verification Badges

**Description:** Dealers earn verification badges displayed on their profile and in quote listings. Badges include GST Verified, Brand Authorized (per brand), Hub4Estate Certified (after 10 successful transactions), and Response Champion (top 10% response time).

**User Story:** As a dealer, I want to earn verification badges, so that I stand out from competitors and build buyer trust.

**Acceptance Criteria:**
- Badges are auto-awarded based on system criteria (not manually assigned).
- GST Verified: awarded after admin verifies GST document.
- Brand Authorized: awarded per brand after admin verifies authorization document.
- Hub4Estate Certified: awarded after 10 completed transactions with average rating >= 4.0.
- Response Champion: awarded monthly to dealers in the top 10% for response time.
- Badges display on: dealer profile, quote comparison table (anonymized view), and win notifications.
- Badges are revoked if criteria are no longer met (e.g., rating drops below 4.0).
- Badge history is maintained (show "earned on [date]" in dealer dashboard).

**Priority:** P2
**Complexity:** M
**Dependencies:** DLR-030, ADM-001

---

### DLR-033: Portfolio/Shop Gallery

**Description:** Dealers can upload and manage a photo gallery showcasing their shop, warehouse, product displays, and completed installations. The gallery is displayed on the public dealer profile.

**User Story:** As a dealer, I want to showcase my shop and product range through photos, so that buyers can see my business is legitimate and well-stocked.

**Acceptance Criteria:**
- Gallery supports up to 20 photos.
- Accepted formats: JPG, PNG, WEBP. Max 5MB per photo.
- Drag-and-drop reordering of photos.
- Each photo has an optional caption (max 200 characters).
- Photos are displayed in a responsive grid layout on the profile.
- Lightbox view on click (zoom, swipe, arrow navigation).
- Thumbnail generation for grid view (lazy loaded for performance).
- Admin can remove inappropriate photos during verification.

**Priority:** P2
**Complexity:** S
**Dependencies:** DLR-030

---

### DLR-034: Business Hours and Contact Info

**Description:** Dealers can set their business hours and preferred contact methods, displayed on their profile and considered when routing inquiries (optional P3 feature: don't notify outside business hours).

**User Story:** As a dealer, I want to set my business hours, so that buyers know when I am available and I am not disturbed outside work hours.

**Acceptance Criteria:**
- Business hours set per day of the week (Mon-Sun) with open time and close time.
- Option to mark days as "Closed" (e.g., Sunday).
- Contact preferences: phone (preferred hours), email, WhatsApp.
- Business hours displayed on the public profile.
- Timezone auto-detected from city or manually selected.
- "Open Now" / "Closed Now" indicator on the profile.
- Optional: "Do Not Disturb" mode that silences notifications outside business hours.
- Default hours: 9 AM - 7 PM, Mon-Sat (common for Indian electrical dealers).

**Priority:** P2
**Complexity:** S
**Dependencies:** DLR-030

---

## 2.5 Subscription & Payments

---

### DLR-040: Free Tier

**Description:** All newly registered and verified dealers start on the Free tier, which provides limited access to the platform. Free tier includes a fixed number of inquiry views and quote submissions per month, with basic analytics.

**User Story:** As a new dealer, I want to try Hub4Estate for free, so that I can see the value before committing to a paid plan.

**Acceptance Criteria:**
- Free tier limits: 10 inquiry views per month, 5 quote submissions per month, basic dashboard (no advanced analytics).
- Usage counter displayed on the dashboard: "5 of 10 inquiry views used this month."
- When limits are reached, the dealer sees: "You've reached your free tier limit. Upgrade to continue."
- Free tier inquiries are the same quality as paid (no artificial degradation).
- Free tier does not include: competitor benchmarking, monthly reports, priority placement, or lead purchase.
- Upgrade CTA is visible but not obtrusive.
- Free tier resets on the 1st of each month.

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-001

---

### DLR-041: Standard Plan

**Description:** The Standard subscription plan provides more inquiry views, unlimited quotes, basic analytics, and access to loss notifications with winning prices. This is the entry-level paid plan for active dealers.

**User Story:** As an active dealer, I want to upgrade to the Standard plan, so that I can view more inquiries, submit unlimited quotes, and access performance analytics.

**Acceptance Criteria:**
- Standard plan includes: 50 inquiry views per month, unlimited quote submissions, full dashboard analytics, loss notifications with winning prices, monthly performance report.
- Pricing: configurable by admin (displayed on pricing page).
- Plan billing: monthly or annual (annual discount visible).
- Upgrade flow: select plan -> payment -> immediate activation.
- Usage counter reflects Standard limits.
- Downgrade to Free is possible at end of billing cycle.
- Standard plan features are clearly differentiated from Free and Premium on the pricing page.

**Priority:** P1
**Complexity:** M
**Dependencies:** DLR-040, DLR-045

---

### DLR-042: Premium Plan

**Description:** The Premium subscription provides unlimited access to all platform features including unlimited inquiries, advanced analytics, competitor benchmarking, priority placement in inquiry routing, and dedicated account support.

**User Story:** As a high-volume dealer, I want the Premium plan, so that I get unlimited inquiries, advanced insights, and priority access to the best leads.

**Acceptance Criteria:**
- Premium plan includes: unlimited inquiry views, unlimited quote submissions, full analytics + competitor benchmarking, monthly reports, priority placement in inquiry routing, dedicated account manager contact, early access to new features.
- Pricing: configurable by admin, clearly shown as the "best value" tier.
- Priority placement: Premium dealers' quotes are shown first in the comparison table (with transparency: "Promoted" tag visible to buyers).
- Premium badge on dealer profile.
- All Standard features included.
- Priority customer support (response within 4 hours).
- Annual billing with significant discount vs. monthly.

**Priority:** P1
**Complexity:** M
**Dependencies:** DLR-041, DLR-045

---

### DLR-043: Pay-Per-Lead Option

**Description:** Instead of (or in addition to) a subscription, dealers can purchase individual leads on a pay-per-lead basis. Each lead purchase reveals the buyer's contact details for a specific inquiry the dealer has won.

**User Story:** As a dealer who doesn't want a monthly subscription, I want to pay per lead, so that I only pay for actual business opportunities.

**Acceptance Criteria:**
- Pay-per-lead pricing is configurable by admin (per category or flat rate).
- Dealer can see the inquiry and submit a quote on the free tier, but buyer contact is revealed only on payment (if they win).
- Payment is charged at the moment of quote selection (buyer selects dealer's quote -> dealer pays lead fee -> contact revealed).
- If the dealer doesn't win, no charge.
- Lead purchase history visible in the dealer dashboard with invoices.
- Pay-per-lead and subscription can coexist (subscription includes X leads, additional leads at Y price).
- Refund policy: if buyer provides incorrect contact info, lead fee is refunded on request.

**Priority:** P2
**Complexity:** L
**Dependencies:** DLR-045

---

### DLR-044: Subscription Management

**Description:** Dealers can manage their subscription from the dashboard: view current plan, upgrade, downgrade, cancel, view billing history, and update payment methods.

**User Story:** As a dealer, I want to manage my subscription easily, so that I can upgrade when business grows or cancel if needed.

**Acceptance Criteria:**
- Subscription page shows: current plan name, price, billing cycle, next billing date, usage (inquiry views used/remaining).
- Upgrade: one-click upgrade to higher plan (prorated billing for mid-cycle upgrades).
- Downgrade: takes effect at end of current billing cycle.
- Cancel: dealer sees a retention offer before final cancellation; cancellation takes effect at end of cycle.
- Payment method: view and update saved card/UPI.
- Billing history: list of all invoices with download (PDF).
- Email notification 7 days before renewal.
- If payment fails, 3-day grace period before downgrade to Free.

**Priority:** P1
**Complexity:** M
**Dependencies:** DLR-040, DLR-045

---

### DLR-045: Payment Gateway Integration (Razorpay)

**Description:** Integration with Razorpay for processing dealer subscription payments and pay-per-lead purchases. Supports credit/debit cards, UPI, net banking, and wallets. Handles recurring billing for subscriptions.

**User Story:** As a dealer, I want to pay securely using my preferred payment method, so that I can manage my Hub4Estate subscription without friction.

**Acceptance Criteria:**
- Razorpay checkout integrated for one-time and recurring payments.
- Payment methods: credit card, debit card, UPI (Google Pay, PhonePe, Paytm), net banking, wallets.
- Subscription billing: Razorpay Subscriptions API for recurring monthly/annual charges.
- PCI DSS compliance: card details are never stored on Hub4Estate servers (tokenized via Razorpay).
- Payment success/failure handling: success -> activate plan; failure -> show error with retry.
- Webhook integration: Razorpay sends payment events (success, failure, refund) to backend.
- Idempotency keys to prevent duplicate charges.
- Test mode for development and staging environments.

**Priority:** P0
**Complexity:** L
**Dependencies:** None

---

### DLR-046: Invoice Generation and GST Compliance

**Description:** The platform generates GST-compliant invoices for all dealer payments (subscriptions and lead purchases). Invoices include Hub4Estate's GSTIN, dealer's GSTIN, taxable amount, GST (CGST + SGST or IGST), and total.

**User Story:** As a dealer, I want GST-compliant invoices for my Hub4Estate payments, so that I can claim input tax credit and maintain proper records.

**Acceptance Criteria:**
- Invoice generated automatically on successful payment.
- Invoice includes: invoice number (sequential), invoice date, Hub4Estate GSTIN and address, dealer GSTIN and address, service description, taxable amount, GST rate (18%), CGST/SGST (for same-state) or IGST (for inter-state), total amount, payment method, transaction ID.
- Invoice is downloadable as PDF from the dealer dashboard.
- Invoice is also emailed to the dealer.
- Invoice numbering follows a financial-year sequence (H4E/2627/0001).
- HSN/SAC code for platform services included.
- Invoices stored for 8 years (legal retention requirement).
- Credit notes generated for refunds.

**Priority:** P1
**Complexity:** M
**Dependencies:** DLR-045

---

# SECTION 3: ADMIN FEATURES

## 3.1 Dealer Management

---

### ADM-001: Dealer Verification Queue

**Description:** Admin dashboard showing all pending dealer registrations awaiting verification. The queue displays dealer information, uploaded documents, and verification status with a streamlined approve/reject workflow.

**User Story:** As an admin, I want a verification queue for new dealer registrations, so that I can review and approve/reject dealers efficiently.

**Acceptance Criteria:**
- Queue page shows all dealers with status "Pending Verification," sorted by submission date (oldest first).
- Each queue entry shows: dealer name, GST number, phone, submission date, document count, and quick-view thumbnails of uploaded documents.
- Clicking a dealer opens the full verification detail view.
- Queue supports filtering by: date range, state/city, document completeness.
- Queue count badge in the admin sidebar navigation.
- Auto-refresh every 2 minutes (or real-time via WebSocket).
- Bulk actions: select multiple dealers and approve/reject with a single action.
- Search by dealer name, GST number, or phone.

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-001

---

### ADM-002: Document Verification Workflow

**Description:** For each dealer in the verification queue, the admin reviews uploaded documents side by side with extracted/validated data. Documents can be individually marked as verified, rejected (with reason), or flagged for re-upload.

**User Story:** As an admin, I want to review each dealer's documents individually, so that I can verify their authenticity and completeness.

**Acceptance Criteria:**
- Document review interface shows: document type, uploaded file (image viewer with zoom for images, PDF viewer for PDFs), and extracted data (from GST API).
- Each document has action buttons: Verify, Reject (with reason dropdown + custom text), Request Re-upload.
- Rejection reasons: "Document unclear/blurry", "Information mismatch", "Document expired", "Fake/tampered document", "Other."
- Cross-verification panel: compare GST cert name with PAN name, compare GST address with shop photos.
- Document status is tracked: Pending, Verified, Rejected, Re-upload Requested.
- Admin notes field for internal annotations (not visible to dealer).
- Audit log records which admin verified which document and when.
- Batch verification: if all documents look good, one-click "Verify All."

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-001

---

### ADM-003: GST/PAN Validation

**Description:** Admin tools for cross-referencing dealer GST and PAN numbers against government databases. Automated validation results are displayed alongside manual verification options for edge cases.

**User Story:** As an admin, I want automated GST and PAN validation, so that I can verify dealers faster and reduce manual effort.

**Acceptance Criteria:**
- GST validation: auto-runs during dealer registration (DLR-002); results displayed in admin verification view.
- PAN validation: API call to verify PAN against NSDL database (name match, PAN status).
- Validation results show: status (valid/invalid/not found), registered name, address, entity type.
- Mismatch detection: if GST business name does not match PAN name, a warning flag is shown.
- If API is unavailable, admin can mark as "Manually Verified" with notes.
- Re-validation button to re-run API checks.
- Validation results are cached (re-check only on admin request or re-upload).
- Failed validations auto-flag the dealer for manual review.

**Priority:** P0
**Complexity:** M
**Dependencies:** DLR-002

---

### ADM-004: Approve/Reject Dealers with Notes

**Description:** Admin can approve or reject dealer registrations. Approval activates the dealer account and sends welcome notification. Rejection sends a notification with the reason and instructions for re-application.

**User Story:** As an admin, I want to approve or reject dealer registrations with notes, so that dealers receive clear communication about their application status.

**Acceptance Criteria:**
- "Approve" button on the verification detail page.
- On approval: dealer status changes to "Active", welcome email/WhatsApp sent with login instructions, dealer appears in the active dealer list, dealer can start receiving inquiries.
- "Reject" button opens a form: select reason (multi-select), add custom notes (visible to dealer), add internal notes (not visible to dealer).
- On rejection: dealer status changes to "Rejected", notification sent with reason and instructions ("Please re-submit with [corrected documents]"), dealer can re-apply after addressing issues.
- Approval/rejection is logged in the audit trail with admin ID, timestamp, and notes.
- Partial approval: admin can approve the dealer but request specific documents to be re-uploaded (conditional approval).
- Approval SLA tracking: time from submission to decision (target: under 48 hours).

**Priority:** P0
**Complexity:** S
**Dependencies:** ADM-002

---

### ADM-005: Suspend/Delete Dealers

**Description:** Admin can suspend a dealer account (temporary deactivation) or permanently delete it. Suspension removes the dealer from inquiry routing; deletion removes all data (with data retention for legal compliance).

**User Story:** As an admin, I want to suspend or delete dealer accounts, so that I can handle policy violations, fraud, and account management.

**Acceptance Criteria:**
- "Suspend" action available on active dealer profiles: sets status to "Suspended", removes dealer from inquiry routing, sends notification to dealer with reason.
- Suspension reasons: "Document issue", "Fraud detected", "Poor ratings", "Non-payment", "Policy violation", "Other."
- Suspended dealers can log in but cannot view inquiries or submit quotes; they see a banner: "Your account is suspended. Reason: [X]. Contact support."
- "Reactivate" action restores the dealer to Active status.
- "Delete" action requires confirmation ("Type dealer name to confirm deletion").
- Deletion is soft-delete: data is retained for 90 days (legal compliance) but inaccessible; hard delete after 90 days.
- Deletion triggers: cancel subscription, remove from all active inquiries, send farewell notification.
- All actions logged in audit trail.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-001

---

### ADM-006: Dealer Performance Monitoring

**Description:** Admin can view per-dealer performance metrics including response times, win rates, buyer ratings, complaint count, and activity patterns. This helps identify top-performing dealers for incentives and underperforming dealers for intervention.

**User Story:** As an admin, I want to monitor dealer performance, so that I can reward top performers and address issues with underperformers.

**Acceptance Criteria:**
- Dealer performance page accessible from the dealer management section.
- Metrics per dealer: total inquiries received, total quotes submitted, win rate, average response time, average rating, number of complaints/flags, subscription status, last active date.
- Performance grading: A (excellent), B (good), C (average), D (poor), F (failing). Auto-calculated based on configurable thresholds.
- Filterable list of all dealers with performance grades and key metrics.
- Drill-down to individual dealer analytics.
- Alert system: flag dealers with rating below 3.0, response time above 24h, or conversion rate below 5%.
- Export dealer performance data as CSV.
- Monthly trend charts per dealer.

**Priority:** P1
**Complexity:** L
**Dependencies:** ADM-001, DLR-020

---

## 3.2 Inquiry Pipeline

---

### ADM-010: Inquiry Dashboard

**Description:** A centralized admin view of all inquiries across the platform with status, assignment, quote count, and key metrics. This is the operational command center for managing the inquiry lifecycle.

**User Story:** As an admin, I want to see all inquiries in one dashboard, so that I can monitor the inquiry pipeline and intervene when needed.

**Acceptance Criteria:**
- Dashboard shows all inquiries in a table with columns: inquiry number, product, buyer name, city, status, date submitted, number of quotes, assigned dealers, and action menu.
- Status filter tabs: All, New, Identified, Sent to Dealers, Quoted, Closed, Expired.
- Search by inquiry number, product name, buyer name, or phone.
- Date range filter.
- Sort by: date, status, quote count.
- Clicking an inquiry opens the full detail view with buyer info, product details, assigned dealers, and all quotes.
- Real-time count badges per status tab.
- Auto-refresh every 2 minutes.

**Priority:** P0
**Complexity:** M
**Dependencies:** BUY-010

---

### ADM-011: Kanban Pipeline View

**Description:** An alternative view of the inquiry pipeline as a Kanban board with columns for each status stage. Admins can drag inquiries between columns to manually update status.

**User Story:** As an admin, I want a Kanban view of the inquiry pipeline, so that I can visually manage inquiry flow and identify bottlenecks.

**Acceptance Criteria:**
- Kanban columns: New, Product Identified, Sent to Dealers, Quotes Received, Closed, Expired.
- Each inquiry is a card showing: inquiry number, product (truncated), buyer name, date, urgency badge.
- Cards are draggable between columns (updates status on drop).
- Card count per column shown in the column header.
- Color-coded urgency: red for urgent, amber for standard, green for flexible.
- Filter by: date range, category, city.
- Click card to open detail view.
- Mobile: swipeable columns (horizontal scroll).
- WIP limits configurable per column (visual alert when exceeded).

**Priority:** P1
**Complexity:** M
**Dependencies:** ADM-010

---

### ADM-012: Manual Inquiry Assignment to Dealers

**Description:** Admin can manually assign inquiries to specific dealers, overriding or supplementing the auto-routing system. This is useful for edge cases where the AI routing doesn't capture the right dealer set.

**User Story:** As an admin, I want to manually assign inquiries to specific dealers, so that I can ensure the right dealers see the right inquiries.

**Acceptance Criteria:**
- "Assign Dealers" action on the inquiry detail view.
- Dealer search/select: search by dealer name, city, brand, category; multi-select dealers.
- Shows dealer match score (brands matched, category matched, service area matched).
- Already auto-assigned dealers are shown with a check mark.
- Admin can add dealers (beyond auto-assigned) or remove auto-assigned dealers.
- On assignment, selected dealers receive the inquiry notification.
- Assignment is logged: admin ID, dealer IDs, timestamp, reason (optional text).
- If no auto-routing matches exist, the system flags the inquiry for manual assignment.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-010, AUT-001

---

### ADM-013: Inquiry-to-Brand Identification (AI-Assisted)

**Description:** When an inquiry is submitted with a product description but no explicit brand/model, AI analyzes the text and photos to identify the likely brand, model, and category. Admin reviews the AI's suggestion before confirming.

**User Story:** As an admin, I want AI to help identify the brand and model from inquiry descriptions, so that inquiries are routed to the right dealers faster.

**Acceptance Criteria:**
- AI processes: inquiry text, product name, any photos, and notes.
- AI returns: suggested brand (confidence %), suggested model (confidence %), suggested category/subcategory.
- Admin sees the suggestion with a "Confirm" or "Override" action.
- On confirm, the inquiry is updated with the brand/model/category and routed to matching dealers.
- On override, admin selects the correct brand/model/category from dropdown.
- If AI confidence is above 90%, auto-confirm is available (configurable threshold by admin).
- AI model improves over time using admin confirmations/overrides as training data.
- Processing time under 10 seconds.

**Priority:** P1
**Complexity:** L
**Dependencies:** ADM-010, AUT-006

---

### ADM-014: Dealer Quote Tracking per Inquiry

**Description:** For each inquiry, admin can see which dealers received it, which have viewed it, which have submitted quotes, and the quote details. This enables tracking of dealer responsiveness and ensuring sufficient quote coverage.

**User Story:** As an admin, I want to see dealer quote activity per inquiry, so that I can follow up with dealers who haven't responded and ensure buyers get enough quotes.

**Acceptance Criteria:**
- Inquiry detail view includes a "Dealer Activity" section.
- Table shows: dealer name, received date, viewed (yes/no + timestamp), quoted (yes/no + timestamp), quote amount, quote status.
- Color coding: green (quoted), amber (viewed, not quoted), red (not viewed).
- "Send Reminder" action for dealers who haven't quoted (triggers AUT-003).
- Aggregate stats: X of Y dealers have quoted, average response time for this inquiry.
- If no dealers have quoted within 12 hours, auto-alert to admin.
- Admin can re-send the inquiry notification to specific dealers.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-010, DLR-013

---

### ADM-015: Send Compiled Quotes to Customer

**Description:** Admin can compile received quotes and send them to the buyer via WhatsApp or email as a formatted message or PDF. This is the manual fallback for the automated quote comparison flow.

**User Story:** As an admin, I want to send compiled quotes to the buyer directly, so that I can provide a personalized touch for high-value inquiries.

**Acceptance Criteria:**
- "Send Quotes" action on the inquiry detail view.
- Admin selects which quotes to include (checkbox per quote).
- Format options: WhatsApp message (formatted text), email (HTML template), PDF attachment.
- WhatsApp integration: opens WhatsApp Web/app with pre-formatted message (using buyer's phone).
- Email: sends via platform email with Hub4Estate branding.
- PDF: generates a comparison document similar to BUY-028 but with admin notes.
- Sent quotes are logged in the inquiry timeline.
- Buyer sees the compiled quotes and can respond to select their preferred option.
- Admin can add custom notes to the compiled message.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-014, PLT-006

---

### ADM-016: Inquiry Analytics and Funnel Metrics

**Description:** Analytics dashboard showing inquiry funnel metrics: total submitted, identified, sent to dealers, quoted, closed (won), expired. Includes conversion rates between stages and trends over time.

**User Story:** As an admin, I want to see inquiry funnel analytics, so that I can identify drop-off points and improve the conversion rate.

**Acceptance Criteria:**
- Funnel visualization: Submitted -> Identified -> Sent to Dealers -> Quoted -> Closed (with drop-off percentages at each stage).
- Time-series charts: inquiries by day/week/month, quotes by day/week/month, closures by day/week/month.
- Conversion metrics: inquiry-to-quote rate, quote-to-close rate, average quotes per inquiry, average time to first quote, average time to close.
- Filterable by: date range, category, city, brand.
- Exportable as CSV or PDF.
- Comparison: this month vs. last month, this quarter vs. last quarter.
- Anomaly detection: alert if daily inquiry volume drops 50% or conversion rate drops 20%.

**Priority:** P1
**Complexity:** L
**Dependencies:** ADM-010

---

## 3.3 CRM

---

### ADM-020: Company/Brand Database Management

**Description:** Admin can manage the database of companies and brands on the platform: add new brands, edit brand details (name, logo, description, website), deactivate brands, and manage brand-category associations.

**User Story:** As an admin, I want to manage the brand database, so that the platform's product catalog stays accurate and up-to-date.

**Acceptance Criteria:**
- Brand list page with search, filter (by category), and sort (by name, product count).
- "Add Brand" form: name (required), logo (image upload), description, website URL, categories (multi-select), status (active/inactive).
- "Edit Brand" form: same fields, pre-filled with current data.
- Logo upload: accepts PNG, JPG, SVG. Displayed at 200x200px consistently.
- Brand slug auto-generated from name (for SEO URLs).
- Deactivate brand: removes from dropdown lists and search but retains historical data.
- Bulk import: CSV upload for adding multiple brands at once.
- Brand-category mapping: which categories a brand operates in (used for dealer matching).

**Priority:** P0
**Complexity:** M
**Dependencies:** None

---

### ADM-021: Contact Management

**Description:** A CRM contact database for managing relationships with dealers, brand representatives, potential partners, and key industry contacts. Each contact has communication history and tags.

**User Story:** As an admin, I want to manage contacts with communication history, so that I can track outreach and nurture business relationships.

**Acceptance Criteria:**
- Contact record: name, company, role, phone, email, LinkedIn, city, tags (multi-select: dealer prospect, brand contact, partner, press, other), notes.
- Contact list with search, filter by tags/company, and sort.
- Communication log per contact: date, type (email/call/WhatsApp/LinkedIn/meeting), summary.
- "Add Communication" button to log interactions manually.
- Import contacts from CSV.
- Export contacts as CSV.
- Duplicate detection: warn if phone or email already exists.
- Contact count per company/brand.

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

### ADM-022: Outreach Tracking

**Description:** Track outreach efforts across channels (email, WhatsApp, calls, LinkedIn) with status tracking per communication. Integrated with the contact database and dealer pipeline.

**User Story:** As an admin, I want to track all outreach with timestamps and status, so that I know who was contacted, when, and what the outcome was.

**Acceptance Criteria:**
- Outreach log: timestamp, channel, contact name, company, subject/summary, status (sent, replied, no response, meeting scheduled, converted).
- Outreach list with filters: channel, status, date range, contact.
- "Log Outreach" form: select contact, channel, write summary, set status.
- Auto-log from email integration (if email sending is built-in).
- Dashboard widget: outreach this week, response rate, upcoming follow-ups.
- Follow-up reminders: set a follow-up date when logging outreach; reminder appears in admin dashboard.
- Outreach metrics: total sent, response rate by channel, conversion rate.

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-021

---

### ADM-023: Meeting Scheduler

**Description:** Admin can schedule meetings with contacts (dealers, brand reps, partners) and track meeting status. Integrates with the CRM contact database and outreach tracking.

**User Story:** As an admin, I want to schedule and track meetings, so that I can manage my calendar and follow up after each meeting.

**Acceptance Criteria:**
- Meeting form: contact (select from CRM), date/time, duration, location/link (in-person or virtual), agenda, type (demo, negotiation, onboarding, review).
- Calendar view showing upcoming meetings.
- Meeting reminders: 24h and 1h before via email/notification.
- Meeting status: Scheduled, Completed, Cancelled, No-show.
- Post-meeting notes field (capture key takeaways and action items).
- Meeting history per contact visible in the contact detail view.
- Export calendar as ICS (compatible with Google Calendar, Outlook).
- Today's meetings widget on admin dashboard.

**Priority:** P3
**Complexity:** M
**Dependencies:** ADM-021

---

### ADM-024: Pipeline Stages Management

**Description:** Admin can define and manage custom pipeline stages for the CRM and inquiry workflows. Stages are configurable (add, edit, reorder, remove) and drive the Kanban views and analytics.

**User Story:** As an admin, I want to customize pipeline stages, so that the workflow matches our actual business process.

**Acceptance Criteria:**
- Pipeline configuration page: list of stages with name, description, color, position.
- Drag-and-drop reordering of stages.
- Add new stage: name (required), description (optional), color (picker).
- Edit existing stage name, description, and color.
- Delete stage: only if no items are currently in that stage (prompt to move items first).
- Multiple pipelines: inquiry pipeline, dealer onboarding pipeline, brand partnership pipeline.
- Stage changes trigger automation rules (if configured via AUT features).
- Default stages pre-configured on platform setup.

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-011

---

### ADM-025: Follow-Up Reminders and Automation

**Description:** Admin can set follow-up reminders for contacts, dealers, and inquiries. Reminders can trigger automated actions (send email template) or simply notify the admin.

**User Story:** As an admin, I want automated follow-up reminders, so that no important follow-up falls through the cracks.

**Acceptance Criteria:**
- Set reminder from: contact page, inquiry detail, dealer detail.
- Reminder form: date/time, note, action type (notification only, send email template, send WhatsApp template).
- Reminder notification appears in admin dashboard and as a browser notification.
- Recurring reminders: daily, weekly, or custom interval.
- Auto-email follow-ups: select an email template and recipient; system sends automatically at the scheduled time.
- Completed reminders are archived with outcome notes.
- Overdue reminders highlighted in red in the dashboard.
- Maximum 100 active reminders per admin user.

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-021, ADM-070

---

## 3.4 Product Catalog

---

### ADM-030: Category/Subcategory/Product Type CRUD

**Description:** Admin can create, read, update, and delete the category taxonomy (categories, subcategories, product types). This taxonomy powers the entire platform's organization, search, and dealer matching.

**User Story:** As an admin, I want to manage the category hierarchy, so that products are properly organized and dealers are correctly matched.

**Acceptance Criteria:**
- Three-level hierarchy: Category > Subcategory > Product Type.
- CRUD operations for each level: create, view list, edit, delete (soft delete if products exist under it).
- Category fields: name, slug (auto-generated), icon, description, SEO title, SEO meta description, display order.
- Subcategory fields: name, slug, parent category, description, display order.
- Product Type fields: name, slug, parent subcategory, specification template (dynamic fields definition), display order.
- Drag-and-drop reordering within each level.
- Breadcrumb display showing the hierarchy path.
- Validation: unique names within the same level, slugs are unique globally.
- Changes reflect immediately on the buyer-facing catalog.

**Priority:** P0
**Complexity:** L
**Dependencies:** None

---

### ADM-031: Brand Management

**Description:** Admin can manage the brand database including creating new brands, editing details, uploading logos, managing brand-category associations, and tracking brand-related dealers.

**User Story:** As an admin, I want to manage brands comprehensively, so that the platform accurately represents the electrical products market.

**Acceptance Criteria:**
- Brand CRUD: create, view, edit, deactivate.
- Brand fields: name, slug, logo (image), description, website, status (active/inactive), categories (multi-select), country of origin, brand tier (budget/mid/premium).
- Brand list page with: search, filter by category/tier/status, sort by name/product count.
- Brand detail page showing: associated products, authorized dealers, and inquiry volume.
- Logo management: upload, replace, guidelines enforced (square format, min 200x200px).
- Bulk import via CSV (name, website, categories).
- Brand merge: if duplicate brands exist, merge tool combines records.
- Brand deactivation hides from dropdowns but retains historical data.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-030

---

### ADM-032: Product CRUD

**Description:** Admin can create, edit, and manage individual products within the catalog. Each product has a name, model number, brand, category, specifications (dynamic per category), images, datasheets, and metadata.

**User Story:** As an admin, I want to manage individual products with detailed specs, so that buyers and dealers have accurate product information.

**Acceptance Criteria:**
- Product CRUD: create, view, edit, deactivate.
- Product fields: name (required), brand (required, from brand database), model number, category/subcategory/product type (required, from taxonomy), MRP, description, status (active/draft/discontinued).
- Dynamic specifications: based on the product type's specification template (e.g., wattage, voltage, IP rating, material, color temperature).
- Image gallery: upload multiple images (primary + additional), drag-and-drop reorder.
- Datasheet upload: PDF file.
- SEO fields: page title, meta description.
- Product slug auto-generated from name + brand + model.
- Validation: unique model number per brand.
- Product revision history: track who changed what and when.

**Priority:** P0
**Complexity:** L
**Dependencies:** ADM-030, ADM-031

---

### ADM-033: SEO Fields for Categories

**Description:** Each category, subcategory, and product type page has configurable SEO fields including page title, meta description, H1 heading, and structured data markup. This drives organic search traffic.

**User Story:** As an admin, I want to set SEO fields for every category page, so that Hub4Estate ranks well on Google for electrical product searches.

**Acceptance Criteria:**
- SEO fields per category/subcategory/product type: page title (max 60 chars, with character counter), meta description (max 160 chars, with character counter), H1 heading, canonical URL, og:image.
- Preview: Google search result preview showing how the page will look in SERPs.
- Default templates: auto-generate SEO fields from category name if admin doesn't customize.
- Structured data: JSON-LD markup for Product, BreadcrumbList, and ItemList schemas.
- Sitemap: categories auto-included in sitemap.xml.
- SEO audit checklist: flag categories with missing or duplicate SEO fields.
- Bulk edit: update SEO fields for multiple categories at once.

**Priority:** P1
**Complexity:** M
**Dependencies:** ADM-030

---

### ADM-034: Knowledge Content for Categories

**Description:** Admin can create and manage educational content for each category: "What is it?", "Where is it used?", "How to choose?", "Common mistakes to avoid", and "Installation tips". This content appears on category pages and in buying guides.

**User Story:** As an admin, I want to add educational content to categories, so that buyers can learn about products and Hub4Estate becomes a knowledge hub.

**Acceptance Criteria:**
- Content sections per category: "What is it?" (description), "Where is it used?" (applications), "How to choose?" (buying guide), "Common mistakes" (FAQ-style), "Installation tips" (how-to).
- Rich text editor with: headings, bold/italic, lists, images, tables, embedded videos.
- Content draft/publish workflow: save draft, preview, publish.
- Content versioning: track changes and allow rollback.
- Content appears on the category page (frontend) in a structured layout.
- Content is indexed by search engines (contributes to SEO).
- Admin can assign content creation to team members (if multi-admin).
- Content status: draft, published, archived.

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-030

---

### ADM-035: Bulk Import/Export Products

**Description:** Admin can import products in bulk from a CSV/Excel file and export the existing product catalog. This is essential for initial catalog seeding and periodic updates.

**User Story:** As an admin, I want to import and export products in bulk, so that I can manage the catalog efficiently without entering each product manually.

**Acceptance Criteria:**
- Import: upload CSV or XLSX file. Downloadable template with required columns.
- Import columns: product name, brand, model number, category, subcategory, product type, MRP, description, specifications (JSON or key:value pairs), image URLs, datasheet URL.
- Import validation: check for missing required fields, duplicate model numbers, invalid brand/category references.
- Import preview: show valid rows (green) and error rows (red with error details) before final import.
- Import modes: "Create new only", "Update existing + create new", "Overwrite all."
- Export: download entire catalog or filtered subset as CSV.
- Import/export history log: who imported what and when.
- Maximum 5,000 rows per import.

**Priority:** P1
**Complexity:** L
**Dependencies:** ADM-032

---

## 3.5 Scraper System

---

### ADM-040: Brand Website Scraper Configuration

**Description:** Admin can configure web scrapers for brand websites to automatically extract product information (names, models, specs, images, datasheets). Each scraper is configured per brand with target URLs and extraction rules.

**User Story:** As an admin, I want to configure scrapers for brand websites, so that the product catalog is automatically populated with the latest product data.

**Acceptance Criteria:**
- Scraper configuration form: brand (select), target URL(s), scraper type (CSS selector, API, or AI-based).
- Support for multi-page scraping: pagination handling (next page URL pattern or load-more).
- Authentication support: for brand websites requiring login (cookie/header injection).
- Rate limiting configuration: max requests per second (default 1, to avoid blocking).
- Proxy configuration: rotate proxies for IP-limited sites.
- Test scraper: run on a single page and show extracted data before saving.
- Active/inactive toggle per scraper configuration.
- Error handling: retry logic (configurable retries on failure).

**Priority:** P2
**Complexity:** XL
**Dependencies:** ADM-032

---

### ADM-041: CSS Selector Configuration per Brand

**Description:** For each brand scraper, admin configures CSS selectors to extract specific data fields from product pages: product name, model, price, specifications, images, and datasheet links.

**User Story:** As an admin, I want to configure CSS selectors for scraping, so that the system extracts the right data from each brand's website.

**Acceptance Criteria:**
- Selector configuration per brand: product name selector, model number selector, MRP selector, image selector(s), specification table selector, datasheet link selector.
- Visual selector tool: load a sample page in an iframe and click elements to auto-generate selectors (P3 enhancement).
- Selector validation: test each selector against a sample URL and show extracted value.
- Fallback selectors: if primary selector fails, try secondary selector.
- Regex post-processing: apply regex to extracted text (e.g., extract price from "MRP: Rs. 450").
- Configuration is stored as JSON and version-controlled.
- Admin documentation: tooltips explaining each selector field.
- Import/export selector configurations (share between environments).

**Priority:** P2
**Complexity:** L
**Dependencies:** ADM-040

---

### ADM-042: Scrape Job Scheduling

**Description:** Admin can schedule scrape jobs to run automatically (daily, weekly, monthly) or trigger them manually. Each job runs the configured scraper for a specific brand and reports results.

**User Story:** As an admin, I want to schedule scrape jobs, so that the product catalog is automatically updated with new products from brand websites.

**Acceptance Criteria:**
- Schedule options: manual trigger, daily (select time), weekly (select day + time), monthly (select date + time).
- Job queue: scrape jobs are queued and run sequentially (to avoid overloading brand websites).
- Job priority: manual triggers run before scheduled jobs.
- Job parameters: brand, URLs, full crawl vs. incremental (only new products since last scrape).
- Calendar view showing scheduled jobs.
- Concurrent job limit: max 3 jobs running simultaneously.
- Job cancellation: admin can cancel a running job.
- Scheduled jobs run during off-peak hours by default (2 AM - 6 AM IST).

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-040

---

### ADM-043: Scrape Job Monitoring and Logs

**Description:** Admin can monitor running scrape jobs and view detailed logs of completed jobs including products found, pages scraped, errors encountered, and duration.

**User Story:** As an admin, I want to monitor scrape jobs and view logs, so that I can troubleshoot failures and ensure data quality.

**Acceptance Criteria:**
- Job monitoring page shows: running jobs (with progress), queued jobs, completed jobs (last 30 days).
- Running job detail: progress bar, pages scraped, products found so far, current URL, elapsed time.
- Completed job detail: total pages scraped, products found (new + updated), errors, duration, start/end time.
- Error log: per-page errors with URL, error message, and timestamp.
- Exportable logs as CSV.
- Notification on job completion or failure (email to admin).
- Job history retention: 90 days.
- Auto-alert if a scheduled job fails 3 times consecutively.

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-042

---

### ADM-044: Scraped Product Review and Mapping

**Description:** After a scrape job completes, the extracted products are placed in a review queue where admin can review, map to existing categories/brands, and approve them for the catalog. This prevents garbage data from entering the system.

**User Story:** As an admin, I want to review scraped products before they go live, so that the catalog remains accurate and well-organized.

**Acceptance Criteria:**
- Review queue shows scraped products with: extracted name, model, brand, specs, images, and source URL.
- Each product has actions: Approve (add to catalog), Reject (discard), Map (change category/brand), Edit (modify fields before approval).
- Auto-mapping: system suggests category and product type based on product name and specs.
- Duplicate detection: flag if a product with the same model number already exists in the catalog.
- If duplicate, option to: update existing product, skip, or create as new variant.
- Bulk approve: select multiple products and approve at once.
- Review queue metrics: pending count, approved today, rejected today.
- Approved products are immediately visible in the catalog.

**Priority:** P2
**Complexity:** L
**Dependencies:** ADM-040, ADM-032

---

### ADM-045: Auto-Categorization of Scraped Products

**Description:** AI automatically categorizes scraped products into the platform's taxonomy based on product name, specifications, and brand. This reduces manual categorization effort by 80%+.

**User Story:** As an admin, I want AI to auto-categorize scraped products, so that I spend less time on manual data organization.

**Acceptance Criteria:**
- AI analyzes: product name, extracted specifications, brand, and source URL structure.
- AI outputs: suggested category, subcategory, and product type with confidence score.
- High-confidence (>90%) suggestions are auto-applied (admin can review and override).
- Medium-confidence (60-90%) suggestions are pre-filled but require admin confirmation.
- Low-confidence (<60%) products are flagged for manual categorization.
- Categorization model improves over time using admin confirmations/overrides.
- Processing time under 2 seconds per product.
- Accuracy target: 85%+ for high-confidence suggestions.

**Priority:** P3
**Complexity:** L
**Dependencies:** ADM-044, ADM-030

---

## 3.6 Analytics & Reports

---

### ADM-050: Platform-Wide Analytics Dashboard

**Description:** A comprehensive analytics dashboard showing the health of the entire platform: user metrics, inquiry metrics, dealer metrics, revenue metrics, and system metrics. This is the admin's primary intelligence tool.

**User Story:** As an admin, I want a single analytics dashboard showing all platform metrics, so that I can make data-driven decisions.

**Acceptance Criteria:**
- Dashboard sections: Users (registrations, active users, retention), Inquiries (volume, conversion, time-to-close), Dealers (active count, verification pipeline, performance), Revenue (subscription, lead purchases), Platform (uptime, error rate, page load times).
- Each metric shows: current value, trend (up/down arrow + percentage), sparkline (last 30 days).
- Date range selector: today, last 7 days, last 30 days, last 90 days, custom range.
- Drill-down: click any metric to see detailed charts and data tables.
- Auto-refresh every 5 minutes.
- Export entire dashboard as PDF report.
- Data loaded from pre-aggregated tables (not real-time queries, for performance).
- Dashboard loads within 3 seconds.

**Priority:** P1
**Complexity:** XL
**Dependencies:** AUT-013

---

### ADM-051: User Acquisition Metrics

**Description:** Detailed analytics on user acquisition: registrations by source (Google OAuth, phone OTP), by city, by role, daily/weekly/monthly trends, and onboarding funnel completion rates.

**User Story:** As an admin, I want to understand how users are finding and joining the platform, so that I can optimize our acquisition strategy.

**Acceptance Criteria:**
- Metrics: total users, new users (by period), users by auth type (Google/phone), users by role, users by city.
- Onboarding funnel: auth -> role selection -> profile completion -> first inquiry (with drop-off at each step).
- Acquisition source tracking: direct, organic search, referral, social, WhatsApp, campaign (UTM parameters).
- Cohort analysis: retention by registration month.
- Geographic distribution: users per city on a map or table.
- Daily/weekly/monthly trend charts.
- Export as CSV.

**Priority:** P2
**Complexity:** L
**Dependencies:** ADM-050

---

### ADM-052: Inquiry Funnel Analysis

**Description:** Deep-dive analytics on the inquiry funnel: submission to quote to close rates, bottleneck identification, time spent in each stage, and segmentation by category, city, and user type.

**User Story:** As an admin, I want to analyze the inquiry funnel in detail, so that I can find and fix bottlenecks to improve conversion.

**Acceptance Criteria:**
- Funnel stages: Submitted, Identified, Sent to Dealers, First Quote Received, Multiple Quotes, Quote Selected, Closed.
- Conversion rates between each stage (percentage).
- Average time in each stage (hours/days).
- Segmentation: by category, by city, by user role, by urgency level.
- Drop-off analysis: which stage has the highest drop-off, and for which segments.
- Time-based trends: funnel performance over weeks/months.
- Comparison: this month vs. previous month.
- Anomaly alerts: significant deviation from average funnel metrics.

**Priority:** P2
**Complexity:** L
**Dependencies:** ADM-050

---

### ADM-053: Dealer Performance Leaderboard

**Description:** A ranked list of dealers based on a composite performance score (win rate, response time, rating, quote volume). The leaderboard incentivizes dealers and helps admin identify top and bottom performers.

**User Story:** As an admin, I want a dealer performance leaderboard, so that I can recognize top dealers and help underperformers improve.

**Acceptance Criteria:**
- Leaderboard table: rank, dealer name, composite score, win rate, avg response time, rating, quotes submitted, revenue generated.
- Composite score calculated from: win rate (30%), response time (25%), rating (25%), volume (20%) — weights configurable.
- Filterable by: category, city, subscription tier, time period.
- Top 10 highlighted with gold/silver/bronze badges.
- Bottom 10 flagged for intervention.
- Monthly reset option (or rolling 90-day window).
- Exportable as CSV.
- Optional: share leaderboard with dealers (togglable by admin).

**Priority:** P3
**Complexity:** M
**Dependencies:** ADM-006

---

### ADM-054: Revenue Reports

**Description:** Comprehensive revenue analytics including subscription revenue, lead purchase revenue, MRR (Monthly Recurring Revenue), churn rate, ARPU (Average Revenue Per User), and projections.

**User Story:** As an admin, I want detailed revenue reports, so that I can track financial performance and plan growth.

**Acceptance Criteria:**
- Metrics: MRR, ARR (Annual Recurring Revenue), total revenue (by period), revenue by plan tier, revenue by payment type (subscription vs. lead purchase).
- Churn analysis: churned dealers per month, churn rate, revenue lost to churn.
- ARPU: average revenue per active dealer, trend over time.
- LTV (Lifetime Value): average dealer lifetime * ARPU.
- Revenue growth: month-over-month and year-over-year.
- Payment method breakdown: card, UPI, net banking.
- Upcoming renewals: list of dealers with renewals in the next 30 days.
- Export as CSV, PDF, or Excel.

**Priority:** P2
**Complexity:** L
**Dependencies:** DLR-045, ADM-050

---

### ADM-055: Geographic Distribution

**Description:** Map-based and table-based views showing the geographic distribution of users, dealers, and inquiries across India. This helps identify underserved markets and guides expansion strategy.

**User Story:** As an admin, I want to see where our users, dealers, and inquiries are concentrated geographically, so that I can plan regional expansion.

**Acceptance Criteria:**
- Interactive India map with heat map overlay: color intensity based on density.
- Three map views: Users, Dealers, Inquiries (togglable).
- Click a state or city to drill down and see exact counts.
- Table view: ranked list of cities by user count, dealer count, inquiry count, and supply-demand ratio.
- Supply-demand ratio: (dealer count / inquiry count) per city. Low ratio = high demand, low supply (opportunity).
- Filterable by: date range, category.
- Export map data as CSV.
- City-level granularity (not just state-level).

**Priority:** P3
**Complexity:** L
**Dependencies:** ADM-050

---

### ADM-056: AI Usage Metrics

**Description:** Analytics on AI feature usage across the platform: Volt AI conversations, AI slip scanner usage, AI categorization accuracy, voice input usage, and smart suggestion click-through rates.

**User Story:** As an admin, I want to track how AI features are being used, so that I can measure ROI and improve AI performance.

**Acceptance Criteria:**
- Metrics: Volt AI conversations per day, messages per conversation, resolution rate (user got what they needed), fallback rate (redirected to support).
- AI slip scanner: uploads per day, extraction accuracy (based on user edits), processing time.
- AI categorization: auto-categorization volume, accuracy rate, override rate.
- Voice input: usage count, languages used, transcription accuracy.
- Smart suggestions: impressions, click-through rate, conversion to inquiry.
- All metrics: daily/weekly/monthly trends.
- Cost tracking: API costs for AI services (OpenAI, Google Cloud Speech, etc.).
- A/B test results for AI feature variants.

**Priority:** P3
**Complexity:** M
**Dependencies:** ADM-050, BUY-070

---

## 3.7 Fraud & Security

---

### ADM-060: Fraud Flag Dashboard

**Description:** A dashboard showing all flagged suspicious activities across the platform: duplicate inquiries, suspicious dealer patterns, fake reviews, contact harvesting attempts, and anomalous behavior.

**User Story:** As an admin, I want to see all fraud flags in one place, so that I can quickly investigate and take action on suspicious activity.

**Acceptance Criteria:**
- Flag list with columns: flag type, entity (user/dealer/inquiry), description, severity (low/medium/high/critical), date, status (new/investigating/resolved/false positive).
- Filter by: flag type, severity, status, date range.
- Sort by: severity (default), date.
- Clicking a flag opens the detail view with: full context, related entities, activity timeline.
- New critical flags trigger email notification to admin.
- Dashboard widget: flag count by severity, unresolved flags count.
- Resolution actions: dismiss as false positive, warn user, suspend user, escalate.
- Trend chart: flags per week/month.

**Priority:** P1
**Complexity:** M
**Dependencies:** AUT-008

---

### ADM-061: Automated Fraud Detection Rules

**Description:** Configurable rules engine that automatically flags suspicious patterns. Rules include: duplicate inquiries from same phone, dealer quoting unrealistically low prices, multiple accounts from same IP, rapid-fire actions, and review manipulation.

**User Story:** As an admin, I want automated fraud detection, so that suspicious activity is flagged without manual monitoring.

**Acceptance Criteria:**
- Rule types: duplicate inquiry detection (same product + phone within 24h), price anomaly (quote < 50% of average for same product), multiple accounts (same IP/device creating multiple accounts), review manipulation (same IP reviewing multiple dealers), rapid quoting (dealer submitting quotes faster than humanly possible).
- Each rule has: name, description, condition logic, severity level, action (flag only, auto-suspend, notify admin).
- Rules are configurable: enable/disable, adjust thresholds.
- Rule testing: simulate a rule against historical data to see how many flags it would generate.
- New rules can be added by admin (simple UI) or developer (code-level).
- Rule evaluation runs in real-time (on each relevant event) and in batch (nightly scan).
- False positive tracking: when admin dismisses a flag, the rule's false positive rate is tracked.

**Priority:** P2
**Complexity:** XL
**Dependencies:** ADM-060

---

### ADM-062: Manual Review and Resolution Workflow

**Description:** When a fraud flag is raised, the admin follows a structured review workflow: investigate (view evidence), decide (legitimate, warn, suspend, ban), act (execute decision), and document (add resolution notes).

**User Story:** As an admin, I want a structured fraud review workflow, so that I can investigate, decide, and act on fraud flags consistently.

**Acceptance Criteria:**
- Fraud detail page shows: flag description, evidence (activity logs, screenshots, data points), related entities (linked accounts, inquiries, reviews), and timeline of the entity's actions.
- Decision options: "False Positive" (dismiss flag), "Warning" (send warning message to user/dealer), "Suspension" (suspend account with reason), "Ban" (permanent ban).
- Each decision requires: a note explaining the reasoning.
- On suspension/ban, the affected entity is immediately restricted.
- Warning message templates available (configurable by admin).
- Resolution is logged in the audit trail.
- SLA tracking: time from flag creation to resolution (target: under 24 hours for critical, 48 hours for high).

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-060

---

### ADM-063: User/Dealer Activity Logs

**Description:** Detailed activity logs for every user and dealer on the platform. Logs capture: login events, profile changes, inquiry submissions, quote submissions, page views, and API calls. Used for fraud investigation and customer support.

**User Story:** As an admin, I want to view detailed activity logs per user/dealer, so that I can investigate issues and understand user behavior.

**Acceptance Criteria:**
- Activity log per user/dealer: timestamp, event type, description, IP address, user agent, page URL.
- Event types: login, logout, profile update, inquiry submitted, quote submitted, quote selected, payment made, document uploaded, password reset.
- Log retention: 12 months (configurable).
- Filterable by: event type, date range, IP address.
- Searchable by user name, email, or phone.
- Export as CSV.
- Access restricted to admin users with "security" role.
- Log entries are append-only (cannot be modified or deleted by admin).

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

### ADM-064: Audit Trail for All Admin Actions

**Description:** Every action taken by an admin user is logged in an immutable audit trail: dealer approvals/rejections, user suspensions, configuration changes, data modifications, and access events.

**User Story:** As a platform owner, I want an audit trail of all admin actions, so that I have accountability and can investigate issues.

**Acceptance Criteria:**
- Audit log captures: admin user ID, action type, entity affected, old value, new value, timestamp, IP address.
- Action types: dealer approved/rejected/suspended, user modified, product created/edited/deleted, configuration changed, report generated, data exported.
- Audit log is immutable: entries cannot be edited or deleted.
- Audit log viewer with: filter by admin user, action type, date range, entity.
- Export as CSV for compliance reporting.
- Audit log retention: minimum 3 years (regulatory compliance).
- Access to audit log restricted to super-admin role only.
- Automated alert if any single admin performs more than 100 actions in 1 hour (anomaly detection).

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

## 3.8 Settings & Configuration

---

### ADM-070: Email Template Management

**Description:** Admin can create and edit email templates used across the platform: welcome emails, inquiry confirmations, quote notifications, dealer approvals, payment receipts, etc. Templates support dynamic variables and HTML formatting.

**User Story:** As an admin, I want to manage email templates, so that all platform emails are professional, consistent, and easy to update.

**Acceptance Criteria:**
- Template list page showing all email templates with: name, trigger event, last edited, status (active/draft).
- Template editor: WYSIWYG HTML editor with drag-and-drop blocks.
- Dynamic variables: {{buyer_name}}, {{inquiry_number}}, {{product_name}}, {{dealer_name}}, {{amount}}, etc.
- Variable list shown in sidebar while editing.
- Preview mode: render template with sample data.
- Send test email: send to admin's email for review.
- Template versioning: save versions and rollback.
- Default templates pre-configured for all platform events.
- Templates support Hub4Estate branding: logo, colors, footer.

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

### ADM-071: Notification Settings

**Description:** Admin can configure global notification settings: which events trigger notifications, which channels are used (push, email, WhatsApp, SMS), and rate limiting to prevent notification fatigue.

**User Story:** As an admin, I want to configure notification rules, so that users receive timely, relevant notifications without being overwhelmed.

**Acceptance Criteria:**
- Notification configuration table: event type, buyer channels (push/email/WhatsApp/SMS), dealer channels, admin channels, enabled (yes/no).
- Each event has configurable channels and toggle.
- Rate limiting: max notifications per user per hour (configurable, default: 10).
- Quiet hours: global do-not-send window (e.g., 10 PM - 7 AM IST) with exceptions for critical events.
- Channel priority: if push fails, fall back to email; if email fails, fall back to SMS.
- Notification log: view sent notifications by event, channel, recipient, delivery status.
- A/B test notification content (P3 feature).

**Priority:** P1
**Complexity:** M
**Dependencies:** PLT-004, PLT-005, PLT-006

---

### ADM-072: Platform Settings

**Description:** Centralized configuration page for platform-wide settings including rate limits, feature flags, pricing configuration, maintenance mode, and operational parameters.

**User Story:** As an admin, I want to configure platform settings from a UI, so that I can adjust operational parameters without code changes.

**Acceptance Criteria:**
- Settings organized in sections: General (platform name, logo, contact email), Rate Limits (API rate limits per user type), Feature Flags (toggle features on/off), Pricing (subscription plan prices, lead prices), Inquiry Settings (auto-close timeout, min quotes before closing, max dealers per inquiry), Maintenance (maintenance mode toggle, scheduled downtime banner).
- Each setting has: label, description, current value, input type (text, number, toggle, dropdown).
- Changes require confirmation dialog.
- Change history: who changed what setting and when.
- Export/import settings (for environment sync: staging -> production).
- Settings cache: changes take effect within 60 seconds (cache refresh).
- Validation: prevent invalid values (e.g., negative prices, zero rate limits).

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

### ADM-073: Admin User Management

**Description:** Super-admin can manage admin user accounts: create new admin users, assign roles, reset passwords, suspend/delete admin accounts. Supports granular role-based access.

**User Story:** As a super-admin, I want to manage admin team accounts and permissions, so that team members have appropriate access levels.

**Acceptance Criteria:**
- Admin user CRUD: create (name, email, role, temporary password), edit, suspend, delete.
- Admin user list with: name, email, role, last login, status.
- Password management: force password reset on first login, admin-initiated password reset.
- Two-factor authentication (2FA) mandatory for all admin users.
- Session management: view active sessions per admin user, force logout.
- Login history: last 50 logins with IP, timestamp, device.
- Maximum admin users: configurable (default: 10).
- Admin invitation: invite via email with secure signup link.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-074

---

### ADM-074: Role-Based Access Control Configuration

**Description:** Define and manage admin roles with granular permissions. Each role specifies which admin features, data, and actions are accessible. Pre-configured roles include Super Admin, Operations Manager, Content Manager, and Support Agent.

**User Story:** As a super-admin, I want to define roles with specific permissions, so that team members only access what they need.

**Acceptance Criteria:**
- Pre-configured roles: Super Admin (all access), Operations Manager (dealer management, inquiry pipeline, analytics), Content Manager (product catalog, categories, knowledge content, SEO), Support Agent (inquiry tracking, user management, basic analytics).
- Custom role creation: name, description, permission checkboxes per feature area.
- Permission areas: Dealer Management, Inquiry Pipeline, Product Catalog, CRM, Scraper, Analytics, Fraud & Security, Settings, Admin Users.
- Permission levels per area: View, Edit, Delete, Admin (full control).
- Role assignment: assign one role per admin user.
- Permission changes take effect immediately (no need for re-login).
- Audit log records role changes.
- Cannot delete a role that is assigned to active users (must reassign first).

**Priority:** P0
**Complexity:** L
**Dependencies:** None

---

# SECTION 4: PROFESSIONAL FEATURES

---

### PRO-001: Professional Onboarding

**Description:** Specialized onboarding flow for users who select professional roles (architect, contractor, electrician, interior designer, procurement manager). The flow collects profession-specific information and guides professionals to relevant features.

**User Story:** As a professional, I want an onboarding flow tailored to my role, so that I set up my profile correctly and discover features relevant to my work.

**Acceptance Criteria:**
- After role selection (BUY-003), professionals enter the professional onboarding flow.
- Step 1: Professional details — business name, years of experience, specialization, typical project size, team size.
- Step 2: Document upload (PRO-002).
- Step 3: Feature tour — guided walkthrough of professional features (project management, client management, specification library).
- Onboarding can be skipped (professional features still accessible but profile incomplete).
- Progress saved per step (can return later to complete).
- Onboarding completion unlocks "Professional" badge on profile.
- Professional dashboard is shown instead of standard buyer dashboard after onboarding.

**Priority:** P2
**Complexity:** M
**Dependencies:** BUY-003

---

### PRO-002: Document Upload (Professional Credentials)

**Description:** Professionals upload credentials for verification: Council of Architecture certificate, trade license, electrician certification, MSME registration, ID proof, and portfolio samples.

**User Story:** As a professional, I want to upload my credentials, so that I get verified and unlock priority features.

**Acceptance Criteria:**
- Document types vary by role: Architect (COA certificate, portfolio), Contractor (trade license, MSME registration, portfolio), Electrician (certification, ID proof), Procurement Manager (company ID, designation letter).
- File formats: PDF, JPG, PNG, HEIC. Max 10MB per file.
- Upload progress and thumbnail preview.
- Each document tagged with type and stored securely in S3.
- Documents submitted to admin verification queue (linked to BUY-005).
- Status tracking: Pending, Verified, Rejected (with reason), Re-upload Requested.
- Multiple documents per type allowed (e.g., multiple portfolio samples).

**Priority:** P2
**Complexity:** M
**Dependencies:** PRO-001, BUY-005

---

### PRO-003: Professional Verification Workflow

**Description:** Admin verifies professional credentials and grants verification badges. The workflow mirrors dealer verification but with profession-specific checks (e.g., COA registration number verification for architects).

**User Story:** As an admin, I want to verify professional credentials, so that verified professionals are trustworthy and can access priority features.

**Acceptance Criteria:**
- Professional verification queue in admin dashboard (similar to dealer verification ADM-001).
- Review interface shows: professional details, uploaded documents, role-specific checks.
- Architect: verify COA registration number against COA database (manual or API if available).
- Contractor: verify trade license validity and MSME registration.
- Electrician: verify certification from recognized body.
- Approve/reject with notes (notification sent to professional).
- On approval: "Verified [Role]" badge on profile, priority access activated.
- Verification SLA: under 48 hours.

**Priority:** P2
**Complexity:** M
**Dependencies:** PRO-002, ADM-001

---

### PRO-004: Professional Dashboard

**Description:** A specialized dashboard for verified professionals showing: active projects, client inquiries, procurement pipeline, specification library, and professional analytics. This replaces the standard buyer dashboard.

**User Story:** As a verified professional, I want a dashboard tailored to my work, so that I can manage procurement, projects, and clients in one place.

**Acceptance Criteria:**
- Dashboard sections: Active Projects (PRO-006), Client List (PRO-007), Procurement Pipeline (inquiries grouped by project), Specification Library (PRO-008), Quick Actions.
- Quick actions: "New Project", "Submit Inquiry for Client", "Browse Catalog."
- Summary metrics: total projects, active inquiries, total savings (vs. MRP), client count.
- Recent activity feed: last 10 actions across projects and inquiries.
- Mobile-optimized layout.
- Falls back to standard buyer dashboard if professional verification is pending.

**Priority:** P3
**Complexity:** L
**Dependencies:** PRO-003

---

### PRO-005: Priority Access to Dealer Network

**Description:** Verified professionals receive priority in the inquiry routing system: their inquiries are shown to dealers first, marked with a "Professional Inquiry" badge, and may receive more dealer attention due to higher conversion likelihood.

**User Story:** As a verified professional, I want priority access to the dealer network, so that I receive faster and more competitive quotes.

**Acceptance Criteria:**
- Professional inquiries are flagged in the routing system with a priority multiplier.
- Dealers see a "Professional Inquiry" badge on these inquiries (indicates serious buyer).
- Professional inquiries are shown at the top of the dealer's inquiry feed (above non-professional inquiries of similar age).
- Priority does not bypass geographic or brand matching (only affects ordering).
- Analytics tracking: do professional inquiries receive more quotes and faster responses?
- Priority level is configurable by admin.
- Free for professionals during beta; may become a premium feature later.

**Priority:** P3
**Complexity:** S
**Dependencies:** PRO-003, AUT-001

---

### PRO-006: Project-Based Procurement

**Description:** Professionals can create projects (e.g., "Villa Construction - Mr. Sharma, Jaipur") and link all related inquiries to the project. This enables tracking procurement progress, costs, and savings per project.

**User Story:** As a contractor, I want to group all inquiries under a project, so that I can track procurement costs and savings for each client project.

**Acceptance Criteria:**
- "Create Project" form: project name, client name, city, project type (residential/commercial/industrial), start date, estimated end date, budget (optional), notes.
- Project dashboard shows: all linked inquiries with status, total quoted value, total savings (vs. MRP), project timeline.
- "Submit Inquiry for Project" action: auto-fills project context into the inquiry.
- Multiple inquiries linked to one project.
- Project status: Planning, Active, Completed, On Hold.
- Project cost summary: exportable as PDF or Excel (for client billing).
- Archived projects accessible for reference.
- Maximum 50 active projects per professional.

**Priority:** P3
**Complexity:** L
**Dependencies:** PRO-004

---

### PRO-007: Client Management

**Description:** Professionals can maintain a list of clients (homeowners, companies) and link projects and inquiries to specific clients. This builds a CRM layer for professionals on the platform.

**User Story:** As a professional, I want to manage my client list on Hub4Estate, so that I can track procurement for each client.

**Acceptance Criteria:**
- Client record: name, phone, email, city, address (optional), notes.
- Client list with search and filter.
- Link clients to projects (one client per project).
- Client detail view shows: all linked projects, total inquiries, total procurement value.
- Client count on the professional dashboard.
- Import clients from contacts (phone) or CSV.
- Privacy: client data is visible only to the professional who created it.
- Maximum 200 clients per professional.

**Priority:** P3
**Complexity:** M
**Dependencies:** PRO-004

---

### PRO-008: Specification Library

**Description:** Professionals can save and manage a personal library of product specifications, BOQs (Bill of Quantities), and material lists. These can be reused across projects and shared with clients.

**User Story:** As an architect, I want to save my go-to product specifications, so that I can reuse them across projects without re-researching.

**Acceptance Criteria:**
- "Save to Library" action from product detail pages and inquiry history.
- Library entries: product name, brand, model, specs (key-value), notes, and tags.
- Library is searchable by product name, brand, tag.
- "Create BOQ" tool: select multiple library items, set quantities, generate a BOQ document.
- BOQ exportable as PDF or Excel.
- BOQ can be directly submitted as a multi-item inquiry.
- Library is private to the professional.
- Maximum 500 items in the specification library.

**Priority:** P4
**Complexity:** L
**Dependencies:** PRO-004, BUY-044

---

### PRO-009: Professional Community Badge

**Description:** Verified professionals receive visible badges in all community interactions (forum posts, comments, reviews). Badges build credibility and incentivize professionals to contribute knowledge.

**User Story:** As a verified professional, I want my badge visible when I participate in the community, so that my expertise is recognized and my contributions are trusted.

**Acceptance Criteria:**
- Badge displays next to the user's name in: forum posts, comments, reviews, and any public profile reference.
- Badge format: "[Verified Architect]", "[Verified Electrician]", etc.
- Badge color matches the professional role (configurable).
- Badge links to the professional's profile (if public).
- Non-verified professionals do not receive badges (even if they selected a professional role).
- Badge is automatically applied based on verification status (no manual steps).
- If verification is revoked, badge is removed immediately.

**Priority:** P3
**Complexity:** S
**Dependencies:** PRO-003, BUY-060

---

# SECTION 5: PLATFORM-WIDE FEATURES

---

### PLT-001: Multi-Language Support (English + Hindi)

**Description:** The platform supports English (default) and Hindi language interfaces. Users can switch languages from a toggle in the header. All UI strings, error messages, and static content are translatable.

**User Story:** As a Hindi-speaking buyer, I want to use the platform in Hindi, so that I can navigate and submit inquiries comfortably in my language.

**Acceptance Criteria:**
- Language toggle (EN/HI) visible in the site header.
- All UI strings (buttons, labels, headings, error messages, placeholder text) are externalized to translation files.
- Hindi translations provided for all UI strings (professional translation, not machine-only).
- Language preference saved in user profile (persists across sessions).
- Language can be set via URL parameter (e.g., ?lang=hi) for SEO.
- Dynamic content (product names, descriptions) remains in the original language.
- RTL layout not required (Hindi is LTR).
- Date and number formatting adapts to locale (Indian format: DD/MM/YYYY, Rs. with commas).
- SEO: hreflang tags for English and Hindi versions.

**Priority:** P2
**Complexity:** L
**Dependencies:** None

---

### PLT-002: Responsive Design (Mobile-First)

**Description:** The entire platform is built mobile-first and responsive across all device sizes: mobile (320px-767px), tablet (768px-1023px), desktop (1024px+). Touch-friendly interactions for mobile users.

**User Story:** As a buyer on my phone, I want the platform to work perfectly on mobile, so that I can submit inquiries and view quotes from any device.

**Acceptance Criteria:**
- All pages render correctly at viewport widths: 320px, 375px, 414px, 768px, 1024px, 1440px.
- No horizontal scrolling on any page at any viewport.
- Touch targets minimum 44px (WCAG guideline).
- Navigation collapses to a hamburger menu on mobile.
- Images are responsive (srcset/picture element) and lazy-loaded.
- Forms are optimized for mobile (appropriate input types, autofill support).
- Lighthouse mobile performance score >= 80.
- Tested on: iPhone SE, iPhone 14, Samsung Galaxy S23, iPad, and Chrome DevTools emulation.

**Priority:** P0
**Complexity:** L
**Dependencies:** None

---

### PLT-003: PWA Support (Installable, Offline Capable)

**Description:** The platform is a Progressive Web App: installable on home screens, works offline (cached pages), and supports push notifications. This provides a near-native app experience without app store distribution.

**User Story:** As a buyer, I want to install Hub4Estate on my phone home screen, so that I can access it like a native app.

**Acceptance Criteria:**
- Service worker registered on all pages.
- Web app manifest with: name, short_name, icons (multiple sizes), theme_color, start_url, display: standalone.
- "Install App" prompt shown to eligible users (A2HS).
- Offline support: previously visited pages served from cache; inquiry form is cached for offline submission (queued and submitted when online).
- Cache strategy: network-first for API calls, cache-first for static assets.
- Background sync: offline-submitted inquiries are sent when connectivity returns.
- App updates: service worker updates automatically; user sees "New version available" toast.
- Lighthouse PWA audit passes all checks.

**Priority:** P2
**Complexity:** L
**Dependencies:** PLT-002

---

### PLT-004: Push Notifications (Web + Mobile)

**Description:** Web push notifications for real-time alerts on inquiry status changes, new quotes, and other important events. Works on desktop browsers and Android Chrome (iOS Safari support via PWA in iOS 16.4+).

**User Story:** As a buyer, I want to receive push notifications, so that I know immediately when new quotes arrive for my inquiry.

**Acceptance Criteria:**
- Push notification permission requested at an appropriate moment (after first inquiry, not on first visit).
- Permission request includes context: "Get notified when you receive quotes."
- Notifications sent for: new quote received, inquiry status change, quote expiring, promotional updates (opt-in).
- Each notification includes: title (max 50 chars), body (max 100 chars), icon (Hub4Estate logo), action URL (deep link to relevant page).
- Click notification opens the relevant page in the app.
- Supports Chrome, Firefox, Edge on desktop and Android. Safari iOS via PWA.
- Notification delivery tracked (sent, delivered, clicked).
- User can manage notification preferences from settings.

**Priority:** P1
**Complexity:** M
**Dependencies:** PLT-003

---

### PLT-005: Email Notifications

**Description:** Transactional and marketing emails sent to users for key events: inquiry confirmation, quote received, dealer approval, payment receipt, etc. Emails use branded templates and are delivered reliably via a professional email service.

**User Story:** As a user, I want to receive important updates via email, so that I have a reliable record of platform activities.

**Acceptance Criteria:**
- Email service: AWS SES or equivalent (high deliverability, SPF/DKIM/DMARC configured).
- Transactional emails: inquiry confirmation, quote notification, dealer approval/rejection, payment receipt, password reset.
- Marketing emails: platform updates, promotional offers (opt-in only, CAN-SPAM compliant).
- All emails use Hub4Estate branded HTML templates (ADM-070).
- Unsubscribe link in every email (one-click unsubscribe).
- Email delivery tracking: sent, delivered, opened, clicked, bounced.
- Email queue: emails are queued and sent asynchronously (no blocking on main flow).
- Bounce and complaint handling: automatic suppression of bounced addresses.

**Priority:** P0
**Complexity:** M
**Dependencies:** ADM-070

---

### PLT-006: WhatsApp Integration

**Description:** WhatsApp integration for notifications, inquiry submission, and dealer communication. Uses WhatsApp Business API for automated messages and interactive templates.

**User Story:** As a buyer, I want to receive updates and submit inquiries via WhatsApp, so that I can use the platform through my preferred messaging app.

**Acceptance Criteria:**
- WhatsApp Business API integration (via provider: Twilio, Gupshup, or similar).
- Notification templates: inquiry confirmation, quote received, dealer contact reveal.
- Templates approved by WhatsApp (pre-approved message templates).
- Inquiry submission via WhatsApp: user sends a message to the Hub4Estate WhatsApp number, bot guides them through the inquiry.
- Interactive buttons in WhatsApp messages (e.g., "View Quotes", "Submit Inquiry").
- Opt-in: users must consent to WhatsApp messages during registration.
- Message delivery tracking.
- Rate limiting: max 10 WhatsApp messages per user per day.

**Priority:** P1
**Complexity:** L
**Dependencies:** None

---

### PLT-007: SMS OTP Gateway

**Description:** SMS gateway for sending OTPs for phone-based authentication and verification. Integrates with an SMS service provider with high delivery rates across Indian carriers.

**User Story:** As a user, I want to receive OTPs via SMS quickly and reliably, so that I can verify my phone number and log in.

**Acceptance Criteria:**
- SMS provider integration: MSG91, Twilio, or similar with 95%+ delivery rate in India.
- OTP delivery within 10 seconds.
- DND (Do Not Disturb) handling: OTP messages are transactional (bypass DND).
- Sender ID: "HUB4EST" or similar branded sender ID.
- OTP format: 6-digit numeric code.
- Rate limiting: max 5 OTPs per phone number per hour.
- SMS delivery status tracking (sent, delivered, failed).
- Fallback: if primary provider fails, route through secondary provider.
- Cost optimization: use template-based SMS (lower cost per message).

**Priority:** P0
**Complexity:** M
**Dependencies:** None

---

### PLT-008: SEO Optimization

**Description:** Comprehensive SEO setup including meta tags, structured data (JSON-LD), sitemap.xml, robots.txt, canonical URLs, Open Graph tags, and Core Web Vitals optimization.

**User Story:** As the platform, I want to rank well on Google for electrical product queries, so that buyers discover Hub4Estate organically.

**Acceptance Criteria:**
- Every page has: unique title tag, meta description, canonical URL, Open Graph tags (og:title, og:description, og:image), Twitter card tags.
- Structured data: Product schema on product pages, BreadcrumbList on all pages, Organization schema on homepage, FAQPage on knowledge content pages.
- sitemap.xml dynamically generated including: categories, products, brands, knowledge articles.
- robots.txt configured: allow search engine crawling, block admin routes and API endpoints.
- Clean URL structure: /category/subcategory/product-slug.
- Internal linking: breadcrumbs, related products, related categories.
- Page load time < 3 seconds on mobile (LCP target).
- Image alt tags on all images.

**Priority:** P1
**Complexity:** L
**Dependencies:** PLT-002

---

### PLT-009: Analytics Tracking (Custom Events)

**Description:** Custom event tracking across the platform to capture user behavior: page views, button clicks, inquiry submissions, quote views, conversions, and feature usage. Data feeds into the admin analytics dashboard.

**User Story:** As an admin, I want detailed event tracking, so that I can understand user behavior and optimize the platform.

**Acceptance Criteria:**
- Tracking library: Google Analytics 4 and/or custom event system (PostHog, Mixpanel, or internal).
- Events tracked: page_view, inquiry_submitted, quote_viewed, quote_selected, dealer_registered, search_performed, product_viewed, category_browsed, volt_chat_started, subscription_purchased.
- Each event includes: user ID (hashed), timestamp, page URL, referrer, device type, custom properties.
- UTM parameter tracking for campaign attribution.
- Consent management: events only tracked after cookie/privacy consent (PLT-016).
- Real-time event stream visible in admin dashboard.
- Custom funnel creation from tracked events.
- Data retention: 24 months.

**Priority:** P1
**Complexity:** M
**Dependencies:** PLT-016

---

### PLT-010: Error Tracking and Monitoring

**Description:** Real-time error tracking using Sentry (or equivalent) to capture frontend and backend errors, exceptions, and performance issues. Errors are alerted, triaged, and linked to deployments.

**User Story:** As a developer, I want to be alerted to errors in real-time, so that I can fix issues before they impact users.

**Acceptance Criteria:**
- Sentry (or equivalent) integrated in: React frontend (error boundaries + global handler), Node.js backend (Express error middleware), background jobs.
- Each error captures: stack trace, user context (ID, role), request context (URL, body), environment (production/staging), release version.
- Alert rules: new error types trigger Slack/email notification; error spike (10x normal rate) triggers critical alert.
- Error grouping: similar errors are grouped (Sentry's fingerprinting).
- Performance monitoring: slow API endpoints, slow page loads.
- Release tracking: errors linked to git commits/deploys.
- Error dashboard: unresolved errors, error trend, top-5 errors by frequency.
- Source maps uploaded for readable frontend stack traces.

**Priority:** P0
**Complexity:** M
**Dependencies:** None

---

### PLT-011: Performance Monitoring (Core Web Vitals)

**Description:** Continuous monitoring of Core Web Vitals (LCP, FID/INP, CLS) and custom performance metrics. Alerts are triggered if performance degrades below thresholds.

**User Story:** As a developer, I want to monitor page performance, so that the platform stays fast and provides a good user experience.

**Acceptance Criteria:**
- Metrics tracked: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), CLS (Cumulative Layout Shift), TTFB (Time to First Byte), FCP (First Contentful Paint).
- Real User Monitoring (RUM): collect metrics from actual users (not just synthetic tests).
- Thresholds: LCP < 2.5s (good), INP < 200ms (good), CLS < 0.1 (good).
- Alert if any metric exceeds "poor" threshold for > 10% of users.
- Dashboard: metric trends by page, by device type, by network speed.
- Weekly performance report (automated).
- Integration with Lighthouse CI for build-time checks.
- Performance budget: alert if JS bundle size exceeds 200KB gzipped.

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

### PLT-012: A/B Testing Framework

**Description:** Built-in A/B testing framework that allows running experiments on UI variations, copy changes, feature rollouts, and pricing. Experiments are configured by admin and results are tracked automatically.

**User Story:** As an admin, I want to run A/B tests, so that I can make data-driven decisions about UI and feature changes.

**Acceptance Criteria:**
- Experiment creation: name, hypothesis, variants (control + 1-3 variants), traffic allocation (percentage per variant), target audience (all users, new users, specific role), duration.
- Variant implementation via feature flags (PLT-013): code checks experiment variant and renders accordingly.
- Metrics per variant: conversion rate, engagement, and custom goal metrics.
- Statistical significance calculation (95% confidence level).
- Auto-stop experiments when significance is reached.
- Experiment dashboard: active experiments, completed experiments, results.
- No flicker: variant assignment happens server-side or before first paint.
- Cookie/storage-based: same user always sees the same variant.

**Priority:** P3
**Complexity:** L
**Dependencies:** PLT-013, PLT-009

---

### PLT-013: Feature Flags

**Description:** Feature flag system that allows toggling features on/off without code deployment. Flags can target specific user segments (by role, city, subscription tier). Used for gradual rollouts, A/B tests, and kill switches.

**User Story:** As a developer, I want to use feature flags, so that I can deploy code safely and roll out features gradually.

**Acceptance Criteria:**
- Feature flag management UI in admin settings.
- Flag types: boolean (on/off), percentage rollout (0-100%), user segment targeting.
- Targeting rules: by user role, by city, by subscription tier, by user ID list, by registration date.
- Flag evaluation: client-side SDK checks flags on app load (with fallback to default values).
- Real-time flag updates: changes take effect within 60 seconds (no deployment needed).
- Flag audit log: who changed what flag and when.
- Default values defined per flag (used if flag service is unavailable).
- Maximum 100 active flags.

**Priority:** P2
**Complexity:** L
**Dependencies:** None

---

### PLT-014: Dark Mode

**Description:** System-level dark mode support that respects the user's OS preference and can be manually toggled. Dark mode applies to all pages with appropriate color adjustments.

**User Story:** As a user who prefers dark mode, I want the platform to support a dark theme, so that I can browse comfortably at night.

**Acceptance Criteria:**
- Dark mode toggle in the header (sun/moon icon).
- Default: follow OS preference (prefers-color-scheme media query).
- User can override OS preference (manual toggle persisted in local storage).
- All pages and components render correctly in dark mode.
- Color palette: dark backgrounds, light text, accent colors adjusted for dark backgrounds.
- Images and brand logos are not inverted (only UI colors change).
- Charts and graphs adapt colors for dark mode readability.
- Transition between modes is smooth (no flash of wrong theme on page load).

**Priority:** P3
**Complexity:** M
**Dependencies:** None

---

### PLT-015: Accessibility (WCAG 2.1 AA)

**Description:** The platform meets WCAG 2.1 AA accessibility guidelines, ensuring usability for people with disabilities: screen reader support, keyboard navigation, sufficient color contrast, focus indicators, and alt text.

**User Story:** As a user with a disability, I want the platform to be accessible, so that I can use it effectively with assistive technology.

**Acceptance Criteria:**
- Color contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text.
- All interactive elements are keyboard-navigable (tab order, Enter/Space activation).
- Focus indicators visible on all interactive elements.
- All images have descriptive alt text.
- Form inputs have associated labels (programmatically linked).
- Error messages are announced by screen readers (aria-live regions).
- Page landmarks: header, nav, main, footer (ARIA roles).
- Skip navigation link ("Skip to main content") present.
- Tested with screen readers: VoiceOver (macOS/iOS), NVDA (Windows).
- Lighthouse accessibility score >= 90.

**Priority:** P2
**Complexity:** M
**Dependencies:** None

---

### PLT-016: Cookie Consent

**Description:** Cookie consent banner that complies with Indian data protection regulations and GDPR (for global users). Users can accept all cookies, reject non-essential cookies, or manage preferences.

**User Story:** As a user, I want to control which cookies are used, so that my privacy preferences are respected.

**Acceptance Criteria:**
- Consent banner appears on first visit (not blocking full page; bottom banner or modal).
- Options: "Accept All", "Reject Non-Essential", "Manage Preferences."
- Cookie categories: Essential (always on), Analytics, Marketing, Functional.
- Preferences saved in a cookie (ironic but standard) and respected across sessions.
- Analytics and marketing scripts only loaded after consent.
- "Manage Preferences" accessible from the footer at any time (to update consent).
- Consent log: timestamp, user ID (if logged in), choices made (for compliance records).
- Banner does not reappear for users who have already made a choice (unless privacy policy changes).

**Priority:** P1
**Complexity:** S
**Dependencies:** None

---

### PLT-017: Legal Pages

**Description:** Static legal pages required for platform operation: Privacy Policy, Terms of Service, Refund Policy, About Us, Contact Us. Written in clear language and legally reviewed.

**User Story:** As a user, I want to read the platform's legal policies, so that I understand my rights and the platform's obligations.

**Acceptance Criteria:**
- Pages: Privacy Policy, Terms of Service, Refund Policy, About Us, Contact Us.
- Accessible from the site footer on all pages.
- Privacy Policy covers: data collected, how it's used, third-party sharing, retention, user rights.
- Terms of Service covers: platform usage rules, liability limitations, dispute resolution, user obligations.
- Contact Us includes: business address, email, phone, contact form.
- About Us includes: company story, mission, team (optional).
- Pages are SEO-indexed with appropriate meta tags.
- Last updated date displayed on each legal page.
- Legal pages are admin-editable via CMS (or direct code for launch).

**Priority:** P0
**Complexity:** S
**Dependencies:** None

---

### PLT-018: Custom 404/Error Pages

**Description:** Custom-designed error pages for 404 (Not Found), 500 (Server Error), and maintenance mode. Error pages are branded, helpful (suggest next steps), and include navigation back to key pages.

**User Story:** As a user who hits an error, I want a helpful error page, so that I can understand what happened and find my way back.

**Acceptance Criteria:**
- 404 page: Hub4Estate branding, "Page Not Found" message, search bar, links to: homepage, categories, contact support.
- 500 page: Hub4Estate branding, "Something went wrong" message, "Try again" button, contact support link.
- Maintenance page: Hub4Estate branding, estimated downtime, status page link (if available).
- Error pages match the site's design language (not default browser error pages).
- 404 page returns HTTP 404 status code (not 200).
- Error tracking: 404 URLs are logged for analysis (find broken links).
- Mobile-responsive.
- Humorous/friendly tone encouraged (on-brand).

**Priority:** P1
**Complexity:** S
**Dependencies:** None

---

### PLT-019: Custom Electrical Cursor Effect

**Description:** A subtle custom cursor effect on the website that ties into the electrical/energy theme. On desktop, the cursor has a small electrical spark or glow trail effect. The effect is lightweight and non-distracting.

**User Story:** As a user, I want a unique visual experience, so that Hub4Estate feels memorable and on-brand.

**Acceptance Criteria:**
- Custom cursor effect visible on desktop browsers only (not on mobile/touch devices).
- Effect: subtle electric spark or glow that follows the cursor with a slight delay.
- Performance: effect uses CSS transforms or canvas with requestAnimationFrame (no jank, < 2ms per frame).
- Effect does not interfere with click/hover interactions.
- Effect is disabled during form input (cursor shows normal text cursor in input fields).
- Toggle in settings to disable the effect (for accessibility or preference).
- Effect uses the platform's amber/gold color scheme.
- Total JS for the effect < 5KB gzipped.

**Priority:** P4
**Complexity:** S
**Dependencies:** None

---

### PLT-020: Smooth Scroll Animations

**Description:** Scroll-triggered animations across the platform: elements fade in, slide up, or scale as they enter the viewport. Animations are subtle, performant, and enhance the browsing experience without slowing the page.

**User Story:** As a user, I want smooth animations as I scroll, so that the platform feels polished and modern.

**Acceptance Criteria:**
- Animations trigger when elements enter the viewport (Intersection Observer API).
- Animation types: fade-in, slide-up, scale-in (configurable per element via CSS classes).
- Duration: 300-500ms with easing (ease-out or cubic-bezier).
- Animations fire only once per element (not re-triggered on scroll up).
- No animation on mobile if prefers-reduced-motion is set (accessibility).
- Performance: animations use CSS transforms and opacity only (GPU-accelerated, no layout thrashing).
- Animation library: lightweight (Framer Motion already in stack, or custom Intersection Observer).
- Total animation overhead < 3KB gzipped.

**Priority:** P2
**Complexity:** S
**Dependencies:** None

---

# SECTION 6: AUTOMATION FEATURES

---

### AUT-001: Auto-Route Inquiries to Matching Dealers

**Description:** When an inquiry is submitted, the system automatically identifies and notifies matching dealers based on the inquiry's brand, product category, and delivery location. This is the core automation that connects buyers with dealers.

**User Story:** As the platform, I want inquiries to be automatically routed to relevant dealers, so that buyers receive quotes quickly without manual admin intervention.

**Acceptance Criteria:**
- Routing logic: match inquiry brand against dealer brand mappings, match inquiry category against dealer category mappings, match delivery pincode against dealer service area pincodes.
- Matching score: dealers ranked by match strength (exact brand + category + pincode = 100%, partial matches scored lower).
- Minimum 3 dealers matched per inquiry. If fewer, alert admin for manual assignment.
- Maximum 20 dealers per inquiry (configurable).
- Matched dealers receive notification within 5 minutes of inquiry submission.
- If brand is not specified, match by category and location only.
- Routing considers dealer subscription tier: Premium dealers are included first, then Standard, then Free (up to their monthly limit).
- Routing respects dealer status: only Active dealers are matched (not Suspended/Pending).
- Routing is logged for debugging and optimization.

**Priority:** P0
**Complexity:** L
**Dependencies:** DLR-001, DLR-005, ADM-030

---

### AUT-002: Auto-Send Inquiry Receipt to Buyer

**Description:** Immediately after a buyer submits an inquiry, the system automatically sends a confirmation receipt via email and/or WhatsApp containing the inquiry number, product summary, and expected quote timeline.

**User Story:** As a buyer, I want an immediate confirmation after submitting an inquiry, so that I know it was received and what to expect next.

**Acceptance Criteria:**
- Confirmation sent within 60 seconds of inquiry submission.
- Channels: email (if email provided), WhatsApp (if phone provided and WhatsApp opt-in), SMS (fallback if WhatsApp not available).
- Content: "Your inquiry [INQ-YYYYMMDD-XXXX] for [product name] x[quantity] has been received. You can expect quotes within 24 hours."
- Includes link to track inquiry status.
- Uses branded email template (ADM-070).
- If all channels fail, error is logged for admin to manually follow up.
- Delivery status tracked per channel.

**Priority:** P0
**Complexity:** S
**Dependencies:** PLT-005, PLT-006

---

### AUT-003: Auto-Remind Dealers to Quote

**Description:** If a dealer has viewed an inquiry but not submitted a quote within 4 hours, the system sends an automated reminder notification. A second reminder is sent after 12 hours. No further reminders are sent to avoid spamming.

**User Story:** As the platform, I want to remind dealers to respond to inquiries, so that buyers receive enough quotes for meaningful comparison.

**Acceptance Criteria:**
- First reminder: 4 hours after dealer receives the inquiry (if viewed but not quoted).
- Second reminder: 12 hours after receipt (if still not quoted).
- No further reminders after the second.
- Reminder channels: push notification and email (not WhatsApp, to avoid spam).
- Reminder content: "You have an unquoted inquiry for [product] in [city]. Submit your quote before [deadline]."
- Reminders are not sent if: the inquiry is already closed, the dealer has already quoted, or the dealer is outside business hours (DLR-034).
- Dealer can opt out of reminder notifications from settings.
- Reminder effectiveness tracked: quote submission rate after reminder.

**Priority:** P1
**Complexity:** M
**Dependencies:** DLR-010, PLT-004

---

### AUT-004: Auto-Close Expired Inquiries

**Description:** Inquiries that have received no quotes after 48 hours are automatically closed with status "Expired." The buyer is notified and offered options to resubmit with modified details.

**User Story:** As the platform, I want to auto-close stale inquiries, so that the pipeline stays clean and buyers are prompted to take action.

**Acceptance Criteria:**
- Auto-close runs as a scheduled job every hour.
- Inquiries with 0 quotes after 48 hours are closed with status "Expired - No Quotes."
- Inquiries with quotes are NOT auto-closed (they remain open for the buyer to decide).
- Buyer receives notification: "Your inquiry [INQ-XXX] has expired with no quotes. This might mean the product is niche or the location is not yet covered. Would you like to resubmit with different details?"
- Expired inquiries remain visible in the buyer's history with "Expired" status.
- Admin can override auto-close (extend deadline for specific inquiries).
- Auto-close threshold (48 hours) is configurable via admin settings (ADM-072).
- Expired inquiry count tracked in admin analytics.

**Priority:** P1
**Complexity:** S
**Dependencies:** ADM-010

---

### AUT-005: Auto-Generate Inquiry Number

**Description:** Every inquiry receives a unique, human-readable number in the format INQ-YYYYMMDD-XXXX (e.g., INQ-20260402-0001). The number is sequential per day and used for tracking across all channels.

**User Story:** As a user, I want each inquiry to have a unique number, so that I can reference and track it easily.

**Acceptance Criteria:**
- Format: INQ-YYYYMMDD-XXXX where XXXX is a zero-padded sequential number resetting daily.
- Generated atomically (no duplicates under concurrent submissions).
- Used in: confirmation messages, tracking page, admin dashboard, dealer views, and all communications.
- Sequence counter uses database-level atomicity (e.g., PostgreSQL sequence or SELECT FOR UPDATE).
- If the counter exceeds 9999 in a single day, format extends to 5 digits (INQ-YYYYMMDD-XXXXX).
- Inquiry number is immutable once generated.
- Number is URL-safe and can be used in tracking URLs.

**Priority:** P0
**Complexity:** S
**Dependencies:** None

---

### AUT-006: Auto-Categorize Inquiries Using AI

**Description:** AI analyzes the inquiry text, product name, and any photos to automatically assign a category, subcategory, and product type. This speeds up routing and reduces manual admin work.

**User Story:** As the platform, I want AI to auto-categorize inquiries, so that they are routed to the right dealers without waiting for manual admin review.

**Acceptance Criteria:**
- AI processes: product name/description text, buyer notes, and uploaded photos.
- AI returns: category, subcategory, product type, and confidence score.
- High confidence (>85%): auto-applied, inquiry routed immediately.
- Medium confidence (60-85%): applied but flagged for admin review.
- Low confidence (<60%): inquiry queued for manual categorization by admin.
- Processing time under 5 seconds.
- Model trained on historical inquiry data and product catalog.
- Accuracy target: 90%+ for high-confidence categorizations.
- Categorization feeds into the routing engine (AUT-001).
- Fallback: if AI service is unavailable, inquiry is queued for manual categorization.

**Priority:** P1
**Complexity:** L
**Dependencies:** ADM-030

---

### AUT-007: Auto-Detect Duplicate Inquiries

**Description:** The system detects and flags potential duplicate inquiries from the same buyer (same phone or email, similar product, within 24 hours). Duplicates are flagged for admin review rather than auto-rejected, to avoid false positives.

**User Story:** As the platform, I want to detect duplicate inquiries, so that dealers are not spammed with redundant requests.

**Acceptance Criteria:**
- Duplicate detection runs on every new inquiry submission.
- Match criteria: same phone number + similar product name (fuzzy match, >80% similarity) + within 24 hours.
- Flagged duplicates appear in the admin fraud dashboard (ADM-060) with "Potential Duplicate" tag.
- Admin can: merge duplicates, dismiss the flag, or delete the duplicate.
- If an exact duplicate (same phone, same product name, same quantity) is detected within 1 hour, the system shows a warning to the buyer: "You recently submitted a similar inquiry. Would you like to track it instead?"
- Buyer can override the warning and submit anyway.
- Duplicate detection does not block legitimate re-orders or different quantities.
- Detection uses phone number normalization (+91 prefix handling).

**Priority:** P1
**Complexity:** M
**Dependencies:** AUT-005, ADM-060

---

### AUT-008: Auto-Flag Suspicious Patterns

**Description:** Automated rules that flag suspicious behavior patterns: multiple accounts from same device, dealers viewing inquiries without quoting (data harvesting), buyers submitting inquiries with no intention to buy, and other abuse patterns.

**User Story:** As the platform, I want to automatically flag suspicious behavior, so that fraud and abuse are caught early.

**Acceptance Criteria:**
- Pattern rules (initial set): multiple accounts from same device/IP (>3 in 24h), dealer viewing >50 inquiries without quoting any (data harvesting), buyer submitting >10 inquiries in 1 hour (spam), quote price that is less than 30% of MRP (unrealistic), review patterns (same text across multiple reviews).
- Each rule is independently configurable: enable/disable, threshold, severity, action.
- Flags are created in the fraud dashboard (ADM-060) with the rule name, severity, and evidence.
- Critical flags trigger immediate admin notification.
- Rules run in real-time (on each event) and batch (nightly scan for pattern analysis).
- False positive feedback loop: admin dismissals are tracked to tune rule thresholds.

**Priority:** P2
**Complexity:** L
**Dependencies:** ADM-060

---

### AUT-009: Auto-Send Winning Price to Losing Dealers

**Description:** When an inquiry is closed (buyer selects a quote), the losing dealers automatically receive a notification with the winning price (anonymized). This provides market intelligence and encourages competitive pricing.

**User Story:** As the platform, I want losing dealers to know the winning price, so that they can adjust their pricing strategy and become more competitive.

**Acceptance Criteria:**
- Triggered automatically when BUY-023 (Select Winning Quote) completes.
- Notification sent to all dealers who submitted a quote for the closed inquiry but were not selected.
- Notification content: "Inquiry [INQ-XXX] for [product] has been closed. Your quote: Rs. [X]. Winning quote: Rs. [Y]. Price difference: [Z]%."
- No buyer or winning dealer identity revealed.
- Notification channel: in-app notification and email.
- Dealer can opt out of these notifications from settings.
- Data feeds into DLR-024 (competitor benchmarking).
- Sent within 5 minutes of inquiry closure.

**Priority:** P1
**Complexity:** S
**Dependencies:** BUY-023, DLR-018

---

### AUT-010: Scheduled Scrape Jobs

**Description:** Automated scheduling system that runs web scraper jobs at configured intervals to keep the product catalog up to date. Integrates with the scraper configuration system (ADM-040).

**User Story:** As the platform, I want product data scraped automatically on a schedule, so that the catalog stays current without manual intervention.

**Acceptance Criteria:**
- Scheduler reads scrape job configurations (ADM-042) and executes them at configured times.
- Job execution engine handles: starting scraper processes, monitoring progress, capturing results, handling errors.
- Retry logic: failed jobs are retried up to 3 times with exponential backoff.
- Concurrent job limit: max 3 scrape jobs running simultaneously.
- Off-peak scheduling: default execution during 2 AM - 6 AM IST.
- Job completion triggers: product review queue update (ADM-044), admin notification (if errors > threshold).
- Scheduler is resilient: survives server restarts (uses persistent job queue like Bull/Redis).
- Job metrics: tracked for monitoring (AUT-013).

**Priority:** P2
**Complexity:** M
**Dependencies:** ADM-040, ADM-042

---

### AUT-011: Auto-Follow-Up Outreach Emails

**Description:** Automated follow-up emails sent to CRM contacts based on configured sequences. For example, after sending a partnership proposal, an automatic follow-up is sent after 3 days if no reply is received.

**User Story:** As an admin, I want automated follow-up emails, so that no outreach opportunity is lost due to forgotten follow-ups.

**Acceptance Criteria:**
- Email sequences: admin creates a sequence of emails with configurable delays (e.g., Day 0: initial email, Day 3: follow-up 1, Day 7: follow-up 2).
- Sequences are linked to CRM contacts and outreach campaigns.
- Auto-stop: if the recipient replies (detected via email reply tracking or manual log), the sequence stops.
- Templates: each email in the sequence uses a template (ADM-070) with dynamic variables.
- Scheduling: emails sent during business hours (9 AM - 6 PM IST).
- Tracking: open rate, click rate, reply rate per sequence.
- Unsubscribe handling: if recipient unsubscribes, all sequences are stopped.
- Maximum 5 emails per sequence.

**Priority:** P3
**Complexity:** L
**Dependencies:** ADM-022, ADM-070

---

### AUT-012: Auto-Archive Resolved Fraud Flags

**Description:** Fraud flags that have been resolved (marked as false positive, warning sent, or suspension applied) are automatically archived after 30 days. Archived flags remain accessible but are hidden from the active fraud dashboard.

**User Story:** As an admin, I want resolved fraud flags to be automatically archived, so that the fraud dashboard stays clean and focused on active issues.

**Acceptance Criteria:**
- Archival runs as a daily scheduled job.
- Flags with status "Resolved", "False Positive", or "Action Taken" that are older than 30 days are moved to archive.
- Archived flags are accessible via "View Archived" toggle on the fraud dashboard.
- Archive is searchable: by flag type, entity, date, resolution.
- Archived flags count toward historical statistics but do not appear in active counts.
- Admin can un-archive a flag (move back to active) if needed.
- Archive retention: 2 years (then permanent deletion with audit log entry).

**Priority:** P3
**Complexity:** S
**Dependencies:** ADM-060

---

### AUT-013: Nightly Analytics Aggregation Jobs

**Description:** Scheduled nightly jobs that aggregate raw event data into pre-computed analytics tables. This ensures the admin analytics dashboard loads quickly without running expensive queries on raw data.

**User Story:** As the platform, I want analytics data aggregated nightly, so that dashboards load fast and don't strain the production database.

**Acceptance Criteria:**
- Aggregation jobs run daily at 1 AM IST.
- Jobs compute: daily user counts, inquiry counts, quote counts, conversion rates, revenue, response times, geographic distributions, and other KPIs.
- Aggregated data stored in dedicated analytics tables (separate from transactional tables).
- Jobs are idempotent: re-running for the same date overwrites previous results (no duplicates).
- Job duration target: under 30 minutes for a full day's data.
- Failure handling: if a job fails, retry 3 times; if still failing, alert admin.
- Historical backfill: admin can trigger aggregation for a date range (for data corrections).
- Dashboard queries read from aggregated tables (sub-second response time).

**Priority:** P1
**Complexity:** L
**Dependencies:** PLT-009

---

### AUT-014: Database Maintenance (Vacuum, Reindex)

**Description:** Automated PostgreSQL maintenance tasks: VACUUM ANALYZE for table statistics, REINDEX for index health, and cleanup of stale temporary data. Runs during off-peak hours to minimize performance impact.

**User Story:** As the platform, I want automated database maintenance, so that query performance remains optimal and storage is reclaimed.

**Acceptance Criteria:**
- Scheduled job runs weekly at 3 AM IST (Sunday).
- Tasks: VACUUM ANALYZE on all tables, REINDEX on indices with bloat > 20%, cleanup of expired sessions (older than 30 days), cleanup of old notification records (older than 90 days), cleanup of audit logs based on retention policy.
- Job runs within a maintenance window: if execution exceeds 2 hours, abort and alert admin.
- Logging: record execution time per task, tables affected, space reclaimed.
- Non-blocking: uses PostgreSQL's concurrent operations where available.
- Alert if table bloat exceeds 30% (indicating VACUUM needs to run more frequently).
- Maintenance window respects RDS maintenance settings (if using AWS RDS).

**Priority:** P2
**Complexity:** M
**Dependencies:** None

---

### AUT-015: Automated Backups

**Description:** Automated daily backups of the database and critical file storage (S3 documents, images). Backups are stored in a separate region for disaster recovery with configurable retention.

**User Story:** As the platform, I want automated backups, so that data can be recovered in case of failure or corruption.

**Acceptance Criteria:**
- Database backup: daily automated snapshots via AWS RDS automated backups.
- Backup retention: 30 days for daily backups, 12 months for monthly backups (first of each month).
- S3 backup: cross-region replication enabled for the documents bucket.
- Point-in-time recovery: enabled (for RDS, continuous backup with 5-minute granularity).
- Backup verification: monthly restore test to a staging environment (manually triggered but documented).
- Backup monitoring: alert if backup job fails or backup size anomaly detected (>20% increase/decrease).
- Backup encryption: all backups encrypted at rest (AES-256).
- Recovery time objective (RTO): 4 hours. Recovery point objective (RPO): 1 hour.

**Priority:** P0
**Complexity:** M
**Dependencies:** None

---

# APPENDIX

## Feature Count Summary

| Section | Count |
|---------|-------|
| Buyer Features (BUY) | 52 |
| Dealer Features (DLR) | 34 |
| Admin Features (ADM) | 45 |
| Professional Features (PRO) | 9 |
| Platform-Wide Features (PLT) | 20 |
| Automation Features (AUT) | 15 |
| **Total** | **175** |

## Priority Distribution

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 38 | Launch-critical |
| **P1** | 46 | Month 1 post-launch |
| **P2** | 51 | Quarter 1 post-launch |
| **P3** | 29 | Year 1 |
| **P4** | 11 | Future roadmap |

## Dependency Map (Critical Path)

The following features form the critical launch path (P0 features in dependency order):

```
BUY-001 (Google OAuth) ─┬─> BUY-003 (Role Selection) ──> BUY-004 (Profile Completion)
BUY-002 (Phone OTP)  ───┘
                            │
PLT-007 (SMS Gateway)  ────┘
                            │
AUT-005 (Auto Inquiry #) ──┤
                            │
BUY-010 (Inquiry Form) ────┤──> AUT-001 (Auto-Route) ──> DLR-010 (View Inquiries)
BUY-011 (Photo Upload)  ───┤                             │
AUT-002 (Auto Receipt)  ───┘                             ├──> DLR-012 (Inquiry Details)
                                                         │
ADM-030 (Categories) ──> ADM-031 (Brands) ──> ADM-032 (Products)
                                                         │
DLR-001 (Registration) ─┬─> DLR-002 (GST) ──> DLR-003 (Docs) ──> ADM-001 (Verification)
DLR-005 (Service Area) ─┘                                         │
                                                                  ├──> ADM-002 (Doc Review)
                                                                  ├──> ADM-004 (Approve/Reject)
                                                                  └──> DLR-040 (Free Tier)
                            │
DLR-013 (Submit Quote) ────┤──> BUY-020 (Quote Table) ──> BUY-021 (Sort/Filter)
                            │                              │
                            │                              ├──> BUY-022 (Dealer Profile)
                            │                              │
                            │                              └──> BUY-023 (Select Quote)
                            │                                          │
                            │                                          ├──> DLR-017 (Win Notification)
                            │                                          └──> AUT-009 (Loss Price)
                            │
DLR-045 (Razorpay) ────────┘
```

## Versioning

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-02 | CTO Office | Initial complete feature catalog |

---

*This document is maintained by the Hub4Estate product and engineering team. All feature requests, modifications, and prioritization changes should be discussed in the weekly product review meeting and updated here.*
