# 05 - User Journeys, API Contracts, and Architecture Guide

**Document Version:** 1.0
**Last Updated:** 2026-04-02
**Author:** CTO Office, Hub4Estate LLP
**Status:** Definitive Reference

---

## Table of Contents

1. [Complete User Journeys](#1-complete-user-journeys)
2. [Complete API Contracts](#2-complete-api-contracts)
3. [Frontend Architecture Guide](#3-frontend-architecture-guide)
4. [Backend Architecture Guide](#4-backend-architecture-guide)

---

## 1. COMPLETE USER JOURNEYS

### Journey 1: First-Time Buyer -- Manual Inquiry

**Description:** A person who wants the cheapest price on an electrical product submits an inquiry through the homepage form. No account required.

**Actor:** Any person (homeowner, renovator, office manager, anyone)
**Trigger:** User needs an electrical product and lands on hub4estate.com
**Pre-conditions:** None. No login, no account, no app install.

**Step-by-Step Flow:**

1. User lands on homepage at `/` -- sees hero headline "We Will Get You The Cheapest Price..."
2. Scrolls down or clicks "Get Quotes" CTA -- inquiry form scrolls into view
3. Fills required fields:
   - Full name (min 2 chars)
   - Phone number (min 10 digits)
   - Product description or model number (free text)
   - Quantity (integer, min 1, default 1)
   - Delivery city (min 2 chars)
4. Optional fields: email, notes/special instructions
5. **Decision Point A -- Product identification method:**
   - **Option A:** Types product name/model manually in the text field
   - **Option B:** Clicks "Upload Photo" -- selects image from device -- multer accepts JPG/PNG/WebP up to 5MB -- image stored at `/uploads/inquiry-photos/`
   - **Option C:** Navigates to `/smart-scan` -- uploads slip/invoice photo or PDF -- Claude Vision AI extracts line items -- user confirms/edits extracted items -- bulk inquiry creation
6. Clicks "Submit" -- client-side Zod validation fires
7. **Validation pass:** POST `/api/inquiry/submit` with multipart form data
8. Backend generates inquiry number: `HUB-{PRODUCT_TAG}-{SEQ}` (e.g., `HUB-HAVELLS-MCB-0042`)
9. Success screen displays: inquiry number, "We will get back to you within 2-24 hours"
10. Activity logged: `PRODUCT_INQUIRY_SUBMITTED` (or `PRODUCT_IMAGE_UPLOADED` / `MODEL_NUMBER_SUBMITTED`)
11. Admin receives notification in admin dashboard -- inquiry appears in `/admin/inquiries`
12. Admin creates pipeline: AI identifies brand, category, suggests matching dealers
13. Admin contacts 3-5 dealers via WhatsApp/call/email -- collects quotes
14. Admin compiles best quotes and sends to customer via email (quote compilation email)
15. User receives email with side-by-side quote comparison
16. User selects best deal -- contacts dealer directly
17. **Post-purchase:** User may receive follow-up asking for experience rating

**Decision Points and Branches:**

```
                    [User lands on homepage]
                            |
                    [Sees inquiry form]
                            |
                +-----------+-----------+
                |           |           |
          [Type manual] [Upload photo] [Smart Scan]
                |           |           |
                +-----+-----+     [AI extracts items]
                      |                 |
               [Fill form fields]  [Confirm items]
                      |                 |
                      +--------+--------+
                               |
                        [Submit form]
                               |
                    +----------+----------+
                    |                     |
             [Validation OK]      [Validation fail]
                    |                     |
             [POST /api/inquiry]   [Show field errors]
                    |                     |
             [Success screen]      [User corrects]
                    |
        [Admin processes inquiry]
                    |
        [Quotes sent to user]
                    |
            +-------+-------+
            |               |
     [Selects quote]  [No action]
            |               |
     [Contacts dealer] [Follow-up SMS]
```

**Error States and Recovery:**
- Validation failure: inline field errors, form retains all entered data
- File too large (>5MB): toast "File too large. Maximum 5MB allowed."
- Invalid file type: toast "Only JPG, PNG, and WebP are allowed."
- Network failure on submit: toast "Failed to submit inquiry. Please try again."
- Duplicate phone+product combo: allowed (user may need multiple quotes over time)

**Post-conditions:**
- ProductInquiry record created with status `new`
- Inquiry number generated and returned to user
- UserActivity record created
- Admin dashboard shows new inquiry count incremented

**Metrics to Track:**
- Inquiry submission rate (visitors to homepage / inquiries submitted)
- Photo upload rate (% of inquiries with product photo)
- Time from inquiry submission to first admin action
- Time from inquiry to quote delivery to customer
- Quote-to-purchase conversion rate

---

### Journey 2: Returning Buyer -- Logged In Experience

**Description:** A user who previously signed up returns, logs in, and submits a new inquiry or tracks existing ones from their dashboard.

**Actor:** Registered user (any role)
**Trigger:** User returns to platform needing another product or wants to check inquiry status
**Pre-conditions:** User has an existing account (Google OAuth or phone OTP)

**Step-by-Step Flow:**

1. User navigates to `/login`
2. **Decision Point -- Auth method:**
   - **Google OAuth:** Clicks "Continue with Google" -- redirected to Google consent screen -- callback to `/auth/callback?token={jwt}` -- token stored in Zustand auth store
   - **Phone OTP:** Enters phone number -- POST `/api/auth/send-otp` -- receives 6-digit OTP via SMS -- enters OTP -- POST `/api/auth/verify-otp` -- JWT returned
3. Auth store hydrated, user redirected to `/dashboard`
4. Dashboard shows: recent inquiries, saved products, RFQ status cards
5. **To submit new inquiry:** User scrolls to inquiry form on homepage or navigates to `/rfq/create` for formal RFQ
6. **To track existing inquiry:** Navigates to `/track` -- enters phone number -- GET `/api/inquiry/track?phone={phone}` -- sees list of all inquiries with statuses
7. For each inquiry, user sees: status badge (new/contacted/quoted/closed), quoted price, shipping cost, estimated delivery
8. If quotes are available: user compares prices side-by-side
9. User may also browse product catalog: `/categories` -- drill into subcategories -- view products -- save products (POST `/api/products/:id/save`)
10. User can participate in community: `/community` -- read posts, create posts, comment

**Decision Points:**
```
         [Return to platform]
                |
         [Navigate to /login]
                |
        +-------+-------+
        |               |
   [Google OAuth]  [Phone OTP]
        |               |
   [Consent screen] [Enter phone]
        |               |
   [Callback token] [Verify OTP]
        |               |
        +-------+-------+
                |
         [Dashboard /dashboard]
                |
    +-----------+-----------+
    |           |           |
 [New inquiry] [Track]  [Browse catalog]
    |           |           |
 [Submit form] [View quotes] [Save products]
```

**Error States:**
- Google OAuth failure: redirect to `/auth/callback?error=auth_failed` -- error toast displayed
- OTP expired (10 min): "OTP has expired. Please request a new one."
- OTP max attempts (3): "Too many attempts. Please request a new OTP."
- No account found for phone (login type): "No account found. Please sign up first."
- Token expired during session: silent refresh via POST `/api/auth/refresh-token` -- if refresh fails, redirect to login

**Metrics:**
- Return visit rate
- Session duration for logged-in users
- Inquiries per user (lifetime)
- Product save rate

---

### Journey 3: Professional User -- Architect Placing Bulk Order

**Description:** An architect or interior designer completes professional verification, then creates project-based RFQs with multiple product line items.

**Actor:** Architect, Interior Designer, Contractor, Electrician
**Trigger:** Professional needs to procure electrical products for a client project
**Pre-conditions:** User account exists

**Step-by-Step Flow:**

1. User logs in and navigates to `/pro/onboarding`
2. Fills professional profile:
   - Role (ARCHITECT, INTERIOR_DESIGNER, CONTRACTOR, ELECTRICIAN, etc.)
   - Business name, registration number (COA for architects)
   - City, state, years of experience
   - Website URL, bio
3. Uploads verification documents via multipart form:
   - Primary document (COA certificate, trade license, etc.) -- PDF/JPG/PNG, max 10MB
   - Additional document (optional)
4. POST `/api/professional/onboarding` -- profile created, user status set to `UNDER_REVIEW`
5. Admin receives notification in `/admin/professionals` -- reviews documents
6. **Decision Point -- Verification:**
   - **Approved:** User status updated to `VERIFIED` -- user notified -- badge appears on profile
   - **Rejected:** Rejection reason provided -- user can resubmit with corrections
7. Verified professional accesses `/pro` dashboard
8. Creates RFQ: navigates to `/rfq/create`
   - Title: "Project: 3BHK Apartment Lighting"
   - Delivery city, pincode, address
   - Delivery preference (delivery/pickup/both)
   - Urgency (normal/urgent)
   - Adds line items: selects products from catalog, specifies quantities
9. POST `/api/rfq` -- RFQ created in DRAFT status
10. Reviews items, then publishes: POST `/api/rfq/:id/publish`
11. System matches dealers by: brand mappings, category mappings, service area pincodes
12. Matched dealers see RFQ in their available feed (blind -- no buyer identity)
13. Dealers submit quotes with per-item pricing
14. Professional compares quotes on `/rfq/:id` -- sorted by total amount ascending
15. Selects winning quote: POST `/api/rfq/:id/select-quote`
16. Transaction: winning quote status -> SELECTED, losing quotes -> REJECTED with loss reasons
17. Dealer contact revealed to professional, purchase completed offline
18. Professional rates dealer via review system

**Flow Diagram:**
```
[Professional Onboarding]
         |
  [Upload Documents]
         |
  [Admin Review]
         |
   +-----+-----+
   |           |
[Approved] [Rejected]
   |           |
[Dashboard] [Resubmit]
   |
[Create RFQ]
   |
[Add Products + Quantities]
   |
[Publish RFQ]
   |
[Dealers Matched by Brand/Category/Pincode]
   |
[Dealers Submit Quotes (Blind)]
   |
[Compare Quotes Side-by-Side]
   |
[Select Winner]
   |
[Dealer Contact Revealed]
   |
[Purchase + Rate Dealer]
```

**Metrics:**
- Professional verification approval rate
- Average time from submission to verification
- RFQs per professional per month
- Average items per RFQ
- Quote comparison engagement rate

---

### Journey 4: Dealer Onboarding (Multi-Step)

**Description:** An electrical products dealer registers on the platform, uploads verification documents, configures their brand/category/service area profile, and gets verified by admin.

**Actor:** Electrical products dealer (retailer, distributor, wholesaler, etc.)
**Trigger:** Dealer discovers Hub4Estate and wants to receive buyer leads
**Pre-conditions:** Dealer has a valid GST number and business registration

**Step-by-Step Flow:**

1. Dealer navigates to `/dealer/onboarding` -- sees multi-step registration form
2. **Step 1 -- Business Information:**
   - Email (unique, validated)
   - Password (min 8 chars, hashed with bcrypt)
   - Business name (min 2 chars)
   - Owner name (min 2 chars)
   - Phone (min 10 digits)
   - GST number (exactly 15 chars, unique)
   - PAN number (exactly 10 chars, optional)
   - Shop address (min 5 chars)
   - City, State, Pincode (6 digits)
   - Dealer type: RETAILER | DISTRIBUTOR | SYSTEM_INTEGRATOR | CONTRACTOR | OEM_PARTNER | WHOLESALER
   - Years in operation (optional)
3. POST `/api/auth/dealer/register` -- Zod validation -- check email uniqueness -- check GST uniqueness
4. Success: JWT token returned, dealer record created with status `PENDING_VERIFICATION`, onboardingStep=1
5. Redirected to `/dealer/registration-success` -- "Complete your profile to get verified faster"
6. **Step 2 -- Document Upload:**
   - GST Certificate (PDF/JPG/PNG, max 5MB)
   - PAN Card
   - Shop License
   - Cancelled Cheque
   - Shop Photos (up to 6 images)
   - POST `/api/dealer/documents` per document (multipart, field: `document`, body: `documentType`)
7. **Step 3 -- Brand Selection:**
   - Fetches brand list: GET `/api/products/brands/list`
   - Selects brands they deal in
   - POST `/api/dealer/brands` per brand (with optional authProofUrl)
   - Brand authorization proofs uploaded
8. **Step 4 -- Category Selection:**
   - Fetches categories: GET `/api/products/categories`
   - Selects electrical categories they cover
   - POST `/api/dealer/categories` per category
9. **Step 5 -- Service Areas:**
   - Adds pincodes they deliver to
   - POST `/api/dealer/service-areas` per pincode (exactly 6 digits)
10. **Step 6 -- Review and Submit:**
    - Dealer reviews all entered information
    - Profile marked as ready for review
    - Status: `PENDING_VERIFICATION` or `UNDER_REVIEW` (if GST+PAN uploaded)
11. Admin receives notification in `/admin/dealers`
12. Admin reviews: business details, documents, brand proofs
13. **Decision Point:**
    - **Approved (verify):** POST `/api/admin/dealers/:id/verify` with action=verify -- status -> VERIFIED -- AuditLog created -- dealer notified
    - **Rejected:** POST `/api/admin/dealers/:id/verify` with action=reject -- status -> REJECTED -- rejection reason stored -- dealer can log in and see reason
14. Verified dealer can now: see available inquiries, submit quotes, receive leads

**Flow Diagram:**
```
[Visit /dealer/onboarding]
         |
[Step 1: Business Info + GST + PAN]
         |
[POST /api/auth/dealer/register]
         |
   +-----+-----+
   |           |
[Email exists] [GST exists]
   |           |
 [Error]     [Error]
   |           
[Token issued, redirect to success]
         |
[Step 2: Upload Documents]
   |-- GST Certificate
   |-- PAN Card
   |-- Shop License
   |-- Cancelled Cheque
   |-- Shop Photos (x6)
         |
[Step 3: Select Brands + Auth Proofs]
         |
[Step 4: Select Categories]
         |
[Step 5: Add Service Area Pincodes]
         |
[Step 6: Review + Submit]
         |
[Admin Review Queue]
         |
   +-----+-----+
   |           |
[VERIFIED]  [REJECTED]
   |           |
[Dashboard] [Show reason, allow correction]
```

**Error States:**
- Duplicate email: "Dealer already exists with this email" (400)
- Duplicate GST: "GST number already registered" (400)
- Prisma P2002 unique constraint: "This {field} is already registered" (400)
- Invalid file type on upload: "Invalid file type. Only PDF, JPG, and PNG are allowed."
- File exceeds 5MB: multer rejects with size error
- Duplicate brand mapping: "Brand already added" (400)
- Duplicate category mapping: "Category already added" (400)
- Duplicate service area: "Service area already added" (400)

**Metrics:**
- Dealer registration completion rate (started vs. completed all steps)
- Average time to complete onboarding
- Document upload rate per step
- Admin verification turnaround time
- Rejection rate and top rejection reasons

---

### Journey 5: Dealer Quoting Flow

**Description:** A verified dealer logs in, browses available inquiries matched to their brands/categories, and submits competitive quotes.

**Actor:** Verified dealer
**Trigger:** New buyer inquiries matched to dealer's profile
**Pre-conditions:** Dealer status is VERIFIED, has brand/category mappings configured

**Step-by-Step Flow:**

1. Dealer logs in at `/dealer/login` -- POST `/api/auth/dealer/login` -- JWT returned
2. **Login blocked if:** REJECTED (shows reason), SUSPENDED (shows support message), DELETED (account not found)
3. **Login allowed for:** PENDING_VERIFICATION, DOCUMENTS_PENDING, UNDER_REVIEW, VERIFIED
4. Redirected to `/dealer` dashboard -- shows stats: total RFQs received, quotes submitted, conversion rate
5. Navigates to `/dealer/inquiries/available` -- GET `/api/dealer-inquiry/available`
6. System filters inquiries by dealer's brand mappings and category mappings
7. **Inquiry card shows (blind):** product description, model number, quantity, delivery city, category, brand (if identified) -- NO buyer name, NO phone, NO email
8. Dealer clicks inquiry -- GET `/api/dealer-inquiry/:id` -- views full details
9. System creates InquiryDealerResponse with status `viewed` and `viewedAt` timestamp
10. Dealer fills quote form:
    - Unit price (required, min 0)
    - Shipping cost (optional, default 0)
    - Estimated delivery (required, e.g., "3-5 business days")
    - Notes (optional)
11. POST `/api/dealer-inquiry/:id/quote` -- system calculates totalPrice = (unitPrice * quantity) + shippingCost
12. InquiryDealerResponse created/updated with status `quoted`
13. Inquiry status updated from `new` to `contacted` (if first dealer quote)
14. **For RFQ-based quoting:** Dealer views `/dealer/rfqs` -- GET `/api/quotes/available-rfqs`
15. RFQs matched by: verified brand mappings + category mappings + service area pincodes + not already quoted
16. Dealer submits formal quote: POST `/api/quotes/submit` with per-item pricing
17. **Win path:** Buyer selects this quote -- dealer notified -- buyer contact revealed -- dealer completes sale
18. **Lose path:** Another dealer's quote selected -- this quote status -> REJECTED -- loss reason recorded (price/timing/other) -- dealer sees anonymized winning price for market learning

**Flow Diagram:**
```
[Dealer Login]
      |
[Dashboard -- Stats Overview]
      |
[Available Inquiries / Available RFQs]
      |
[View Inquiry Detail (Blind)]
      |
[Submit Quote: Price + Shipping + Delivery]
      |
[Wait for Buyer Decision]
      |
  +---+---+
  |       |
[WIN]   [LOSE]
  |       |
[Contact revealed] [See anonymized winning price]
  |       |
[Complete sale] [Learn market rate]
```

**Metrics:**
- Quote submission rate (inquiries viewed / quotes submitted)
- Average response time (inquiry posted to quote submitted)
- Win rate (quotes selected / quotes submitted)
- Loss reason distribution (price vs. timing vs. other)
- Average quote amount trend

---

### Journey 6: Admin -- Processing an Inquiry

**Description:** An admin receives a new buyer inquiry, uses AI to identify the brand/category, finds matching dealers, collects quotes, and sends the best options to the customer.

**Actor:** Platform admin
**Trigger:** New ProductInquiry submitted by a buyer
**Pre-conditions:** Admin is logged in at `/admin`

**Step-by-Step Flow:**

1. Admin logs in at `/admin/login` -- POST `/api/auth/admin/login` -- JWT with 24h expiry
2. Dashboard at `/admin` -- GET `/api/admin/dashboard/stats` -- sees totalInquiries, pendingDealers, openFraudFlags
3. Navigates to `/admin/inquiries` -- GET `/api/inquiry/admin/list?status=new`
4. Clicks new inquiry -- GET `/api/inquiry/admin/:id` -- sees full details + any dealer responses
5. **Creates pipeline:** POST `/api/inquiry-pipeline/:inquiryId/create`
   - AI analyzes inquiry: identifies brand, product type, category
   - Generates WhatsApp message template for dealer outreach
   - Pipeline created with status `BRAND_IDENTIFIED`
6. **Auto-match dealers:** POST `/api/inquiry-pipeline/:pipelineId/auto-match`
   - System searches BrandDealer directory by identified brand + delivery city
   - Returns list of matching external dealers (from scraping/manual entry)
7. **Add dealers to pipeline:** POST `/api/inquiry-pipeline/:pipelineId/add-dealer`
   - For each dealer: name, phone, shop name, city, contact method (WHATSAPP/CALL/EMAIL/SMS)
   - Optional: auto-generate WhatsApp message, save dealer to directory
8. Admin contacts dealers via WhatsApp/phone -- collects quotes
9. **Update dealer quotes:** PATCH `/api/inquiry-pipeline/:pipelineId/quotes/:quoteId`
   - Enter: quotedPrice, shippingCost, deliveryDays, warrantyInfo, notes
   - Update responseStatus: PENDING -> CONTACTED -> QUOTED / NO_RESPONSE / DECLINED
10. **Compile and send to customer:** POST `/api/inquiry-pipeline/:pipelineId/send-to-customer`
    - System compiles top quotes sorted by total price
    - Generates quote compilation email with side-by-side comparison
    - Sends via email (and/or SMS)
    - Pipeline status -> `SENT_TO_CUSTOMER`
    - Inquiry status -> `quoted`, quotedPrice/shippingCost set from best quote
11. Admin can also respond directly: PATCH `/api/inquiry/admin/:id/respond` with quotedPrice, shippingCost, estimatedDelivery
12. Inquiry lifecycle: `new` -> `contacted` -> `quoted` -> `closed`

**Flow Diagram:**
```
[New Inquiry Arrives]
         |
[Admin Views in /admin/inquiries]
         |
[Create Pipeline -- AI Analysis]
         |
[Auto-Match Dealers by Brand + City]
         |
[Add Dealers to Pipeline]
         |
[Contact Dealers via WhatsApp/Call]
         |
[Collect Quotes -- Update Prices]
         |
[Compile Best Quotes]
         |
[Send to Customer via Email]
         |
[Customer Selects -- Inquiry Closed]
```

**Metrics:**
- Average time from inquiry to pipeline creation
- Average time from pipeline to customer delivery
- Number of dealers contacted per inquiry
- Quote collection success rate
- Customer response rate to compiled quotes

---

### Journey 7: AI Chatbot Interaction (Volt AI)

**Description:** Any visitor interacts with the Volt AI assistant to ask questions, get product recommendations, or submit inquiries via natural language.

**Actor:** Any visitor (anonymous or logged in)
**Trigger:** User clicks chat widget or navigates to `/ai-assistant`
**Pre-conditions:** None

**Step-by-Step Flow:**

1. User opens chat interface at `/ai-assistant`
2. POST `/api/chat/sessions` -- creates ChatSession (optionally with userId, email, name)
3. User types or speaks a question: "What's the best MCB for a 3BHK apartment?"
4. POST `/api/chat/message` or POST `/api/chat/message/stream` (SSE)
5. **Non-streaming path:**
   - Builds message history from last 20 messages (reversed to chronological)
   - Calls Claude AI with platform context + user context (if authenticated)
   - Returns: AI response text, token count, tool results (inquiry creation, product search)
6. **Streaming path (SSE):**
   - Sets headers: Content-Type: text/event-stream
   - Streams tokens as `data: {"type":"text","text":"..."}\n\n`
   - On completion: `data: {"type":"done","messageId":"..."}\n\n`
7. AI can trigger tools: submit inquiry on behalf of user, search products, track status
8. Session metadata updated: messageCount incremented, lastMessageAt set, title auto-generated from first message
9. User can continue conversation with full context retention
10. **Dealer quote parsing:** POST `/api/chat/parse-quote` -- AI parses natural language quote text into structured price/delivery/terms

**Error States:**
- Session not found: "Session not found" (404)
- Message too long (>2000 chars): validation error
- AI service failure: "Server error. Please try again."

**Metrics:**
- Chat sessions per day
- Average messages per session
- Tool invocation rate (how often AI triggers inquiry creation)
- User satisfaction (session duration, return rate)

---

### Journey 8: Community Participation

**Description:** Users browse, create, and interact with community posts about electrical products, home building, and procurement advice.

**Actor:** Registered user
**Trigger:** User wants to ask a question or share knowledge
**Pre-conditions:** User is logged in

**Step-by-Step Flow:**

1. User navigates to `/community` or `/user/community`
2. GET `/api/community/posts?page=1&limit=20` -- posts sorted by upvotes desc, then createdAt desc
3. Optional filters: city, category
4. Each post shows: title, author (name, role, city), upvote count, comment count
5. **Read post:** Click post -- GET `/api/community/posts/:id` -- full content + threaded comments
6. **Create post:** Click "New Post" -- fill title (5-200 chars), content (min 10 chars), optional city/category/tags
7. POST `/api/community/posts` -- post created with status PUBLISHED
8. **Comment:** On any post, type comment (min 2 chars), optionally reply to existing comment (parentId)
9. POST `/api/community/comments` -- comment created with threaded structure
10. **Upvote:** Click upvote on post -- POST `/api/community/posts/:id/upvote` -- increments upvote counter

**Metrics:**
- Posts per day
- Comments per post
- Upvote distribution
- User engagement frequency

---

### Journey 9: Slip Scanner Full Flow

**Description:** User uploads a photo of an electrical product list, quotation slip, or invoice. AI extracts all line items and creates bulk inquiries.

**Actor:** Any user (authenticated preferred for bulk creation)
**Trigger:** User has a physical document listing electrical products needed
**Pre-conditions:** Image or PDF of product list

**Step-by-Step Flow:**

1. User navigates to `/smart-scan`
2. Uploads file: image (JPG/PNG/WebP up to 20MB) or PDF (up to 20MB)
3. POST `/api/slip-scanner/parse` -- multipart upload, field: `image`
4. **Processing:**
   - PDF: pdf-parse extracts text -> Claude AI parses structured data
   - Image: Claude Vision AI directly analyzes image -> extracts line items
5. Response: array of items, each with: productName, quantity, unit, brand (if identifiable), notes
6. For items without brand: GET `/api/slip-scanner/brand-suggestions?productName=xxx` -- top 5 brand suggestions
7. User reviews extracted items in UI -- can edit names, quantities, brands
8. User confirms and submits: POST `/api/slip-scanner/create-inquiries`
   - Requires auth
   - Body: items array + customerName + customerPhone + deliveryCity
   - Creates one ProductInquiry per line item
9. Success: returns count of inquiries created with their inquiry numbers
10. Uploaded file is deleted from server after processing (cleanup in `finally` block)

**Error States:**
- No file uploaded: "No file uploaded" (400)
- Invalid file type: "Only image files and PDFs are allowed"
- PDF with no extractable text (scanned): "Could not extract text from PDF"
- PDF parsing failure: "Failed to read PDF. Try uploading as an image instead."
- AI parsing failure: "Failed to parse file"

**Metrics:**
- Scan uploads per day
- Average items extracted per scan
- Edit rate (how often users modify AI-extracted data)
- Bulk inquiry conversion (scans that lead to submitted inquiries)

---

### Journey 10: Dealer Subscription Purchase

**Description:** Dealer exhausts free tier limits and upgrades to a paid subscription for enhanced features and more leads.

**Actor:** Verified dealer
**Trigger:** Free tier quote limit reached, or dealer wants priority access
**Pre-conditions:** Dealer is VERIFIED

**Step-by-Step Flow:**

1. Dealer submits quotes and reaches free tier limit
2. System displays upsell prompt: "Upgrade to receive more inquiries"
3. Dealer navigates to subscription page
4. Views plan comparison: Basic (free) vs. Pro vs. Enterprise
5. Selects plan and billing cycle (monthly/annual)
6. Redirected to Razorpay payment gateway
7. Completes payment -- webhook confirms
8. Subscription activated -- enhanced features unlocked:
   - More available inquiries per month
   - Priority matching (shown first to buyers)
   - Analytics dashboard access
   - Brand verification fast-track
9. Subscription status visible on dealer dashboard
10. Auto-renewal with reminder notifications before billing date

**Note:** Subscription infrastructure is planned. The current revenue model is dealer subscription + lead purchase plans. Payment integration with Razorpay is the target gateway.

---

## 2. COMPLETE API CONTRACTS

### Common Types

```typescript
// Standard pagination parameters (query string)
interface PaginationParams {
  page?: string;   // Default "1"
  limit?: string;  // Default varies by endpoint (10-50)
}

// Standard pagination response
interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;  // Math.ceil(total / limit)
}

// Standard error response
interface ErrorResponse {
  error: string;
  details?: Record<string, string[]>;  // Zod field errors
}

// JWT payload structure
interface JWTPayload {
  id: string;
  email: string | null;
  name: string;
  type: 'user' | 'dealer' | 'admin';
  role?: string;
  city?: string;
  profileComplete?: boolean;
  iat: number;
  exp: number;
}
```

---

### Auth APIs

#### POST /api/auth/send-otp
Send OTP to phone or email for login/signup.

**Auth:** None
**Rate Limit:** `otpLimiter`

```typescript
// Request
interface SendOTPRequest {
  phone?: string;          // Phone number
  email?: string;          // Email address
  type: 'login' | 'signup';
}
// Constraint: phone OR email required (not both, not neither)

// Response 200
interface SendOTPResponse {
  message: string;         // "OTP sent to your email" | "OTP sent to your phone"
  debug_otp?: string;      // Only in NODE_ENV=development
}

// Errors
// 400: "Phone or email is required"
// 404: "No account found. Please sign up first." (login type, user not found)
// 500: "Failed to send OTP"
```

#### POST /api/auth/verify-otp
Verify OTP and return JWT token (for existing users) or profile completion flag (for new signups).

**Auth:** None
**Rate Limit:** `loginLimiter`

```typescript
// Request
interface VerifyOTPRequest {
  phone?: string;
  email?: string;
  otp: string;             // Exactly 6 digits
  type: 'login' | 'signup';
}

// Response 200 (existing user)
interface VerifyOTPLoginResponse {
  token: string;           // JWT, 7d expiry
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string;
    role: string | null;
    city: string;
    type: 'user';
  };
}

// Response 200 (new signup, needs profile)
interface VerifyOTPSignupResponse {
  requiresProfile: true;
  identifier: string;
  identifierType: 'phone' | 'email';
}

// Errors
// 400: "No OTP found. Please request a new one."
// 400: "OTP has expired. Please request a new one."
// 400: "Too many attempts. Please request a new OTP." (3 max)
// 400: "Invalid OTP. Please try again."
// 404: "User not found"
```

#### POST /api/auth/user/signup
Complete user signup after OTP verification.

**Auth:** None

```typescript
// Request
interface UserSignupRequest {
  name: string;            // Min 2 chars
  phone?: string;
  email?: string;
  city?: string;
}

// Response 200
interface UserSignupResponse {
  token: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string;
    role: string | null;
    city: string;
    type: 'user';
  };
}

// Errors
// 400: "Account already exists with this phone/email"
```

#### GET /api/auth/me
Get current authenticated user profile.

**Auth:** Bearer token (user, dealer, or admin)

```typescript
// Response 200 (user)
interface MeUserResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string;
    role: string | null;
    city: string | null;
    profileImage: string | null;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    type: 'user';
    profileComplete: boolean;
  };
}

// Response 200 (dealer)
interface MeDealerResponse {
  user: {
    id: string;
    email: string;
    name: string;         // businessName
    phone: string;
    city: string;
    type: 'dealer';
    status: string;       // DealerStatus enum
    profileComplete: boolean;
  };
}

// Response 200 (admin)
interface MeAdminResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    type: 'admin';
    profileComplete: true;
  };
}
```

#### POST /api/auth/complete-profile
Complete user profile after Google OAuth signup.

**Auth:** Bearer token (user)

```typescript
// Request
interface CompleteProfileRequest {
  role?: 'INDIVIDUAL_HOME_BUILDER' | 'RENOVATION_HOMEOWNER' | 'ARCHITECT'
       | 'INTERIOR_DESIGNER' | 'CONTRACTOR' | 'ELECTRICIAN'
       | 'SMALL_BUILDER' | 'DEVELOPER';
  city?: string;           // Min 2 chars
  purpose?: string;
  phone?: string;
}

// Response 200
interface CompleteProfileResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string;
    role: string | null;
    city: string | null;
    purpose: string | null;
    profileImage: string | null;
    type: 'user';
  };
  token: string;           // New JWT with updated claims
}
```

#### GET /api/auth/google
Initiate Google OAuth flow.

**Auth:** None
**Response:** 302 redirect to Google consent screen

#### GET /api/auth/google/callback
Google OAuth callback. Not called directly by frontend.

**Response:** 302 redirect to `{FRONTEND_URL}/auth/callback?token={jwt}` or `?error={msg}`

#### POST /api/auth/dealer/register
Register a new dealer account.

**Auth:** None

```typescript
// Request
interface DealerRegisterRequest {
  email: string;
  password: string;        // Min 8 chars
  businessName: string;    // Min 2 chars
  ownerName: string;       // Min 2 chars
  phone: string;           // Min 10 digits
  dealerType?: 'RETAILER' | 'DISTRIBUTOR' | 'SYSTEM_INTEGRATOR'
             | 'CONTRACTOR' | 'OEM_PARTNER' | 'WHOLESALER';
  yearsInOperation?: number;
  gstNumber: string;       // Exactly 15 chars
  panNumber?: string;      // Exactly 10 chars
  shopAddress: string;     // Min 5 chars
  city: string;            // Min 2 chars
  state: string;           // Min 2 chars
  pincode: string;         // Exactly 6 digits
}

// Response 201
interface DealerRegisterResponse {
  message: string;
  token: string;
  dealer: {
    id: string;
    email: string;
    businessName: string;
    status: 'PENDING_VERIFICATION';
    onboardingStep: 1;
  };
}

// Errors
// 400: "Dealer already exists with this email"
// 400: "GST number already registered"
// 400: "This {field} is already registered" (P2002)
```

#### POST /api/auth/dealer/login
Dealer email/password login.

**Auth:** None
**Rate Limit:** `credentialLoginLimiter`

```typescript
// Request
interface DealerLoginRequest {
  email: string;
  password: string;
}

// Response 200
interface DealerLoginResponse {
  token: string;
  dealer: {
    id: string;
    email: string;
    businessName: string;
    ownerName: string;
    phone: string;
    city: string;
    state: string;
    status: string;
    onboardingStep: number;
    profileComplete: boolean;
    brandCount: number;
    verifiedBrandCount: number;
    categoryCount: number;
  };
}

// Errors
// 401: "Invalid email or password"
// 403: "Account rejected" + reason
// 403: "Account suspended. Please contact support."
// 403: "Account not found" (DELETED)
```

#### POST /api/auth/admin/login
Admin email/password login.

**Auth:** None
**Rate Limit:** `credentialLoginLimiter`

```typescript
// Request
interface AdminLoginRequest {
  email: string;
  password: string;
}

// Response 200
interface AdminLoginResponse {
  token: string;           // 24h expiry
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;          // "admin" | "super_admin"
  };
}
```

#### POST /api/auth/refresh-token
Rotate refresh token and get new access token.

**Auth:** None
**Rate Limit:** `refreshLimiter`

```typescript
// Request
interface RefreshTokenRequest {
  refreshToken: string;
}

// Response 200
interface RefreshTokenResponse {
  token: string;           // New access token
  refreshToken: string;    // New refresh token (old one revoked)
  user: object;            // User/dealer object
}
```

#### POST /api/auth/logout
Revoke refresh token.

**Auth:** None (best-effort)

```typescript
// Request
interface LogoutRequest {
  refreshToken?: string;
}

// Response 200
interface LogoutResponse {
  message: 'Logged out successfully' | 'Logged out';
}
```

#### POST /api/auth/forgot-password
Request password reset email (dealers only currently).

**Auth:** None
**Rate Limit:** `passwordResetLimiter`

```typescript
// Request
interface ForgotPasswordRequest {
  email: string;
}

// Response 200 (always, to prevent email enumeration)
interface ForgotPasswordResponse {
  message: 'If that email is registered, you will receive a reset link.';
}
```

#### POST /api/auth/reset-password
Reset password using token from email.

**Auth:** None

```typescript
// Request
interface ResetPasswordRequest {
  token: string;           // Min 32 chars
  password: string;        // Min 8 chars
}

// Response 200
interface ResetPasswordResponse {
  message: 'Password reset successfully. Please log in.';
}

// Errors
// 400: "Invalid or expired reset token"
// 400: "Reset token already used"
// 400: "Reset token has expired"
```

---

### Product APIs

#### GET /api/products/categories
List all active categories with subcategories.

**Auth:** None

```typescript
// Response 200
interface CategoriesResponse {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sortOrder: number;
    isActive: true;
    seoTitle: string | null;
    seoDescription: string | null;
    whatIsIt: string | null;
    whereUsed: string | null;
    whyQualityMatters: string | null;
    commonMistakes: string | null;
    createdAt: string;
    updatedAt: string;
    subCategories: Array<{
      id: string;
      categoryId: string;
      name: string;
      slug: string;
      description: string | null;
      sortOrder: number;
      isActive: true;
    }>;
  }>;
}
```

#### GET /api/products/categories/:slug
Get category detail with subcategories and product types.

**Auth:** None

```typescript
// Response 200
interface CategoryDetailResponse {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sortOrder: number;
    // ... all category fields
    subCategories: Array<{
      id: string;
      name: string;
      slug: string;
      productTypes: Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        sortOrder: number;
      }>;
    }>;
  };
}

// Errors
// 404: "Category not found"
```

#### GET /api/products/subcategories/:slug
Get subcategory with parent category and product types.

**Auth:** None

```typescript
// Response 200
interface SubCategoryResponse {
  subCategory: {
    id: string;
    name: string;
    slug: string;
    category: { /* Category object */ };
    productTypes: Array<{ /* ProductType objects */ }>;
  };
}
```

#### GET /api/products/product-types/:slug
Get product type with paginated products and available brands.

**Auth:** None
**Query:** `brandId`, `page`, `limit`

```typescript
// Response 200
interface ProductTypeResponse {
  productType: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    technicalInfo: string | null;
    useCases: string | null;
    subCategory: {
      id: string;
      name: string;
      category: { id: string; name: string; slug: string; };
    };
  };
  products: Array<{
    id: string;
    name: string;
    modelNumber: string | null;
    sku: string | null;
    description: string | null;
    specifications: string | null;
    images: string[];
    certifications: string[];
    warrantyYears: number | null;
    brand: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      priceSegment: string | null;
    };
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    priceSegment: string | null;
  }>;
  pagination: PaginationResponse;
}
```

#### GET /api/products/:id
Get single product detail with similar products.

**Auth:** None

```typescript
// Response 200
interface ProductDetailResponse {
  product: {
    id: string;
    name: string;
    modelNumber: string | null;
    sku: string | null;
    description: string | null;
    specifications: string | null;
    images: string[];
    datasheetUrl: string | null;
    manualUrl: string | null;
    certifications: string[];
    warrantyYears: number | null;
    brand: { id: string; name: string; slug: string; logo: string | null; };
    productType: {
      id: string;
      name: string;
      subCategory: {
        id: string;
        name: string;
        category: { id: string; name: string; slug: string; };
      };
    };
  };
  similarProducts: Array<{
    id: string;
    name: string;
    modelNumber: string | null;
    images: string[];
    brand: { id: string; name: string; slug: string; logo: string | null; };
  }>; // Max 6
}
```

#### GET /api/products/search/query
Search products by name, description, or model number.

**Auth:** None
**Query:** `q` (min 2 chars, required), `category`, `brand`, `page`, `limit`

```typescript
// Response 200
interface ProductSearchResponse {
  products: Array<{
    id: string;
    name: string;
    modelNumber: string | null;
    description: string | null;
    images: string[];
    brand: { /* Brand */ };
    productType: { subCategory: { category: { /* Category */ }; }; };
  }>;
  pagination: PaginationResponse;
}

// Errors
// 400: "Search query too short"
```

#### POST /api/products/:id/save
Save a product to user's list.

**Auth:** Bearer token (user)

```typescript
// Request
interface SaveProductRequest {
  notes?: string;
}

// Response 200
interface SaveProductResponse {
  saved: {
    id: string;
    userId: string;
    productId: string;
    notes: string | null;
    createdAt: string;
  };
}
```

#### GET /api/products/saved/list
Get user's saved products.

**Auth:** Bearer token (user)

```typescript
// Response 200
interface SavedProductsResponse {
  savedProducts: Array<{
    id: string;
    notes: string | null;
    createdAt: string;
    product: { /* Full product with brand and type */ };
  }>;
}
```

#### GET /api/products/brands/list
List all active brands.

**Auth:** None

```typescript
// Response 200
interface BrandsListResponse {
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    website: string | null;
    isPremium: boolean;
    priceSegment: string | null;
    qualityRating: number | null;
  }>;
}
```

---

### Inquiry APIs

#### POST /api/inquiry/submit
Submit a product inquiry (no auth required).

**Auth:** None
**Content-Type:** multipart/form-data

```typescript
// Request (form fields)
interface InquirySubmitRequest {
  name: string;            // Min 2 chars
  phone: string;           // Min 10 digits
  email?: string;          // Optional, valid email
  modelNumber?: string;    // Product description or model number
  quantity?: number;       // Default 1, integer, min 1
  deliveryCity: string;    // Min 2 chars
  notes?: string;
  productPhoto?: File;     // JPG/PNG/WebP, max 5MB
}

// Response 201
interface InquirySubmitResponse {
  message: 'Inquiry submitted successfully! We will get back to you shortly.';
  inquiryId: string;
  inquiryNumber: string;   // e.g., "HUB-HAVELLS-MCB-0042"
}
```

#### GET /api/inquiry/track
Track inquiries by phone number, ID, or inquiry number (no auth required).

**Auth:** None
**Query:** `phone` | `id` | `number`

```typescript
// Response 200
interface InquiryTrackResponse {
  inquiries: Array<{
    id: string;
    inquiryNumber: string | null;
    name: string;
    phone: string;
    modelNumber: string | null;
    quantity: number;
    deliveryCity: string;
    productPhoto: string | null;
    status: 'new' | 'contacted' | 'quoted' | 'closed';
    notes: string | null;
    quotedPrice: number | null;
    shippingCost: number | null;
    totalPrice: number | null;
    estimatedDelivery: string | null;
    responseNotes: string | null;
    respondedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Errors
// 400: "Please provide a phone number or inquiry number"
// 404: "No inquiries found"
```

---

### Dealer APIs

#### GET /api/dealer/profile
Get dealer's full profile with brand/category mappings and stats.

**Auth:** Bearer token (dealer)

```typescript
// Response 200
interface DealerProfileResponse {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  dealerType: string;
  yearsInOperation: number | null;
  description: string | null;
  establishedYear: number | null;
  certifications: string[];
  website: string | null;
  // Documents
  gstDocument: string | null;
  panDocument: string | null;
  shopLicense: string | null;
  cancelledCheque: string | null;
  shopPhoto: string | null;
  shopImages: string[];
  // Status
  status: string;
  onboardingStep: number;
  profileComplete: boolean;
  // Metrics
  totalRFQs: number;
  quotesSubmitted: number;
  quotesWon: number;
  conversionRate: number;
  // Relations
  brandMappings: Array<{
    id: string;
    brandId: string;
    authProofUrl: string | null;
    isVerified: boolean;
    brand: { id: string; name: string; slug: string; logo: string | null; };
  }>;
  categoryMappings: Array<{
    id: string;
    categoryId: string;
    category: { id: string; name: string; slug: string; };
  }>;
  serviceAreas: Array<{
    id: string;
    pincode: string;
  }>;
}
```

#### PATCH /api/dealer/profile
Update dealer profile fields.

**Auth:** Bearer token (dealer)

```typescript
// Request
interface UpdateDealerProfileRequest {
  businessName?: string;
  ownerName?: string;
  phone?: string;
  shopAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  description?: string;     // Max 1000 chars
  establishedYear?: number;  // 1900-2026
  certifications?: string[];
  website?: string;
}

// Response 200
interface UpdateDealerProfileResponse {
  dealer: {
    id: string;
    email: string;
    businessName: string;
    ownerName: string;
    phone: string;
    shopAddress: string;
    city: string;
    state: string;
    pincode: string;
  };
}
```

#### POST /api/dealer/documents
Upload a verification document.

**Auth:** Bearer token (dealer)
**Content-Type:** multipart/form-data

```typescript
// Request
// Field: document (file, PDF/JPG/PNG, max 5MB)
// Field: documentType ('gstDocument' | 'panDocument' | 'shopLicense' | 'cancelledCheque' | 'shopPhoto')

// Response 200
interface UploadDocumentResponse {
  message: 'Document uploaded successfully';
  documentType: string;
  url: string;
  dealer: {
    id: string;
    gstDocument: string | null;
    panDocument: string | null;
    shopLicense: string | null;
    cancelledCheque: string | null;
    shopPhoto: string | null;
    status: string;
  };
}
```

#### POST /api/dealer/brands
Add brand mapping.

**Auth:** Bearer token (dealer)

```typescript
// Request
interface AddBrandRequest {
  brandId: string;          // UUID
  authProofUrl?: string;    // URL to authorization document
}

// Response 201
interface AddBrandResponse {
  mapping: {
    id: string;
    dealerId: string;
    brandId: string;
    authProofUrl: string | null;
    isVerified: false;
    brand: { id: string; name: string; slug: string; };
  };
}

// Errors
// 404: "Brand not found"
// 400: "Brand already added" (P2002)
```

#### POST /api/dealer/categories
Add category mapping.

**Auth:** Bearer token (dealer)

```typescript
// Request
interface AddCategoryRequest {
  categoryId: string;       // UUID
}

// Response 201
interface AddCategoryResponse {
  mapping: {
    id: string;
    dealerId: string;
    categoryId: string;
    category: { id: string; name: string; slug: string; };
  };
}
```

#### POST /api/dealer/service-areas
Add service area pincode.

**Auth:** Bearer token (dealer)

```typescript
// Request
interface AddServiceAreaRequest {
  pincode: string;          // Exactly 6 digits
}

// Response 201
interface AddServiceAreaResponse {
  serviceArea: {
    id: string;
    dealerId: string;
    pincode: string;
    createdAt: string;
  };
}
```

#### DELETE /api/dealer/service-areas/:id
Remove service area.

**Auth:** Bearer token (dealer)

```typescript
// Response 200
{ message: 'Service area removed' }
```

---

### Dealer Inquiry APIs (dealer-inquiry routes)

#### GET /api/dealer-inquiry/available
Get inquiries matched to this dealer's brands and categories.

**Auth:** Bearer token (dealer)
**Query:** `page`, `limit`, `status`

```typescript
// Response 200
interface AvailableInquiriesResponse {
  data: Array<{
    id: string;
    inquiryNumber: string | null;
    name: string;           // Buyer name (visible to dealer)
    phone: string;          // Buyer phone (visible to dealer)
    modelNumber: string | null;
    quantity: number;
    deliveryCity: string;
    productPhoto: string | null;
    status: string;
    createdAt: string;
    category: { id: string; name: string; } | null;
    identifiedBrand: { id: string; name: string; } | null;
    dealerResponse: {
      inquiryId: string;
      status: string;
      quotedPrice: number | null;
    } | null;
  }>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

#### POST /api/dealer-inquiry/:id/quote
Submit quote for an inquiry.

**Auth:** Bearer token (dealer)

```typescript
// Request
interface SubmitInquiryQuoteRequest {
  quotedPrice: number;       // Min 0
  shippingCost?: number;     // Default 0
  estimatedDelivery: string; // Required, e.g. "3-5 business days"
  notes?: string;
}

// Response 201
interface SubmitInquiryQuoteResponse {
  message: 'Quote submitted successfully';
  response: {
    id: string;
    inquiryId: string;
    dealerId: string;
    quotedPrice: number;
    shippingCost: number;
    totalPrice: number;
    estimatedDelivery: string;
    notes: string | null;
    status: 'quoted';
    respondedAt: string;
  };
}
```

---

### RFQ APIs

#### POST /api/rfq
Create a new RFQ (draft).

**Auth:** Bearer token (user)

```typescript
// Request
interface CreateRFQRequest {
  title: string;               // Min 5 chars
  description?: string;
  deliveryCity: string;        // Min 2 chars
  deliveryPincode: string;     // Exactly 6 chars
  deliveryAddress?: string;
  estimatedDate?: string;      // ISO datetime
  deliveryPreference: 'delivery' | 'pickup' | 'both';
  urgency?: 'normal' | 'urgent';
  items: Array<{
    productId: string;         // UUID
    quantity: number;          // Positive integer
    notes?: string;
  }>;  // Min 1 item
}

// Response 201
interface CreateRFQResponse {
  rfq: {
    id: string;
    userId: string;
    title: string;
    status: 'DRAFT';
    aiSuggestions: string | null;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      product: { /* with brand and productType */ };
    }>;
    // ... all RFQ fields
  };
}
```

#### POST /api/rfq/:id/publish
Publish RFQ to make it visible to matched dealers.

**Auth:** Bearer token (user, owner)

```typescript
// Response 200
interface PublishRFQResponse {
  rfq: { /* Updated RFQ with status PUBLISHED */ };
  matchedDealersCount: number;
}

// Errors
// 404: "RFQ not found"
// 400: "RFQ already published"
```

#### GET /api/rfq
List user's RFQs.

**Auth:** Bearer token (user)
**Query:** `status`, `page`, `limit`

```typescript
// Response 200
interface ListRFQsResponse {
  rfqs: Array<{
    id: string;
    title: string;
    status: string;
    deliveryCity: string;
    items: Array<{ product: { name: string; brand: { name: string; }; }; }>;
    quotes: Array<{ id: string; status: string; }>;
    createdAt: string;
  }>;
  pagination: PaginationResponse;
}
```

#### GET /api/rfq/:id
Get single RFQ with quotes (ranked by price).

**Auth:** Bearer token (user, owner)

```typescript
// Response 200
interface RFQDetailResponse {
  id: string;
  title: string;
  // ... all RFQ fields
  items: Array<{
    product: { /* full product with brand, type, category */ };
    quantity: number;
  }>;
  quotes: Array<{
    id: string;
    totalAmount: number;
    shippingCost: number;
    deliveryDate: string | null;
    validUntil: string;
    status: string;
    notes: string | null;
    ranking: number;          // 1-based, sorted by totalAmount asc
    dealer: {
      id: string;
      businessName: string;
      city: string;
      conversionRate: number;
    };
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
}
```

#### POST /api/rfq/:id/select-quote
Select a winning quote.

**Auth:** Bearer token (user, owner)

```typescript
// Request
interface SelectQuoteRequest {
  quoteId: string;
}

// Response 200
{ message: 'Quote selected successfully' }

// Side effects (transaction):
// - RFQ status -> DEALER_SELECTED
// - Selected quote status -> SELECTED
// - Losing quotes status -> REJECTED with lossReason
// - Dealer conversion metrics updated
```

#### POST /api/rfq/:id/cancel
Cancel an RFQ.

**Auth:** Bearer token (user, owner)

```typescript
// Response 200
{ message: 'RFQ cancelled successfully' }

// Errors
// 400: "Cannot cancel completed RFQ"
```

---

### Quote APIs (dealer-side RFQ quoting)

#### GET /api/quotes/available-rfqs
Get published RFQs matching dealer's verified brands, categories, and service areas.

**Auth:** Bearer token (dealer)

```typescript
// Response 200
interface AvailableRFQsResponse {
  rfqs: Array<{
    id: string;
    title: string;
    deliveryPincode: string;
    deliveryCity: string;
    urgency: string | null;
    publishedAt: string;
    items: Array<{
      product: { /* with brand, productType, subCategory, category */ };
      quantity: number;
    }>;
    user: {
      city: string | null;
      role: string | null;
      profVerificationStatus: string;
    };
  }>;
}
```

#### POST /api/quotes/submit
Submit a quote for an RFQ.

**Auth:** Bearer token (dealer)

```typescript
// Request
interface SubmitRFQQuoteRequest {
  rfqId: string;
  totalAmount: number;       // Positive
  shippingCost?: number;     // Default 0
  deliveryDate?: string;     // ISO datetime
  pickupDate?: string;       // ISO datetime
  validUntil: string;        // ISO datetime
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;         // Positive integer
    unitPrice: number;        // Positive
    totalPrice: number;       // Positive
  }>;  // Min 1 item
}

// Response 201
interface SubmitRFQQuoteResponse {
  quote: {
    id: string;
    rfqId: string;
    dealerId: string;
    totalAmount: number;
    status: 'SUBMITTED';
    items: Array<{ /* QuoteItem */ }>;
  };
}

// Errors
// 404: "RFQ not found"
// 400: "RFQ not accepting quotes"
// 400: "Quote already submitted for this RFQ"
// 400: "Quote items do not match RFQ items"
```

#### GET /api/quotes/my-quotes
Get dealer's submitted quotes with RFQ details.

**Auth:** Bearer token (dealer)
**Query:** `status`, `page`, `limit`

#### GET /api/quotes/analytics
Get dealer's quote performance analytics.

**Auth:** Bearer token (dealer)

```typescript
// Response 200
interface QuoteAnalyticsResponse {
  metrics: {
    totalRFQsReceived: number;
    totalQuotesSubmitted: number;
    totalConversions: number;
    conversionRate: number;
    avgResponseTime: number | null;
  };
  insights: {
    totalQuotes: number;
    lossReasons: Record<string, number>;
    avgQuoteAmount: number;
    statusBreakdown: {
      submitted: number;
      selected: number;
      rejected: number;
      expired: number;
    };
  };
}
```

---

### Community APIs

#### GET /api/community/posts
List community posts.

**Auth:** Optional
**Query:** `city`, `category`, `page`, `limit`

```typescript
// Response 200
interface CommunityPostsResponse {
  posts: Array<{
    id: string;
    title: string;
    content: string;
    city: string | null;
    category: string | null;
    tags: string[];
    upvotes: number;
    commentCount: number;
    user: {
      name: string;
      role: string | null;
      city: string | null;
      profileImage: string | null;
    };
    createdAt: string;
  }>;
  pagination: PaginationResponse;
}
```

#### POST /api/community/posts
Create a post. **Auth:** Bearer token (user)

```typescript
// Request
interface CreatePostRequest {
  title: string;      // 5-200 chars
  content: string;    // Min 10 chars
  city?: string;
  category?: string;
  tags?: string[];    // Default []
}
```

#### POST /api/community/comments
Create a comment. **Auth:** Bearer token (user)

```typescript
// Request
interface CreateCommentRequest {
  postId: string;     // UUID
  content: string;    // Min 2 chars
  parentId?: string;  // UUID, for nested replies
}
```

#### POST /api/community/posts/:id/upvote
Upvote a post. **Auth:** Bearer token (user)

```typescript
// Response 200
{ upvotes: number }
```

---

### Chat APIs

#### POST /api/chat/sessions
Create a new chat session.

**Auth:** Optional

```typescript
// Request
interface CreateChatSessionRequest {
  email?: string;
  name?: string;
}

// Response 201
{ sessionId: string }
```

#### POST /api/chat/message
Send a message and get AI response (non-streaming).

**Auth:** Optional

```typescript
// Request
interface SendChatMessageRequest {
  sessionId: string;    // UUID
  message: string;      // 1-2000 chars
}

// Response 200
interface ChatMessageResponse {
  message: {
    id: string;
    sessionId: string;
    role: 'assistant';
    content: string;
    tokenCount: number | null;
    createdAt: string;
  };
  toolResults: Array<object>;
}
```

#### POST /api/chat/message/stream
Send a message and get streaming AI response (SSE).

**Auth:** Optional
**Response:** Server-Sent Events stream

```typescript
// SSE events:
// data: {"type":"text","text":"..."}\n\n
// data: {"type":"tool_use","tool":"...","input":{...}}\n\n
// data: {"type":"tool_result","result":{...}}\n\n
// data: {"type":"done","messageId":"..."}\n\n
// data: {"type":"error","error":"..."}\n\n
```

#### GET /api/chat/sessions/:sessionId/messages
Get all messages in a session.

**Auth:** Optional

```typescript
// Response 200
interface ChatMessagesResponse {
  messages: Array<{
    id: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    tokenCount: number | null;
    createdAt: string;
  }>;
}
```

---

### Slip Scanner APIs

#### POST /api/slip-scanner/parse
Upload and parse an image or PDF of a product list.

**Auth:** None
**Content-Type:** multipart/form-data
**Field:** `image` (JPG/PNG/WebP/PDF, max 20MB)

```typescript
// Response 200
interface SlipParseResponse {
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    brand?: string;
    notes?: string;
    brandSuggestions?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
}
```

#### POST /api/slip-scanner/create-inquiries
Create product inquiries from parsed slip data.

**Auth:** Bearer token (user)

```typescript
// Request
interface CreateSlipInquiriesRequest {
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    brand?: string;
    notes?: string;
  }>;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
}

// Response 200
interface CreateSlipInquiriesResponse {
  message: 'Inquiries created successfully';
  count: number;
  inquiries: Array<{
    id: string;
    inquiryNumber: string | null;
  }>;
}
```

---

### Contact Form APIs

#### POST /api/contact/submit
Submit public contact form.

**Auth:** None

```typescript
// Request
interface ContactSubmitRequest {
  name: string;       // Min 2 chars
  email: string;      // Valid email
  phone?: string;
  role: 'homeowner' | 'contractor' | 'dealer' | 'brand' | 'other';
  message: string;    // Min 10 chars
}

// Response 201
{ success: true; message: string; }
```

---

### Notification APIs

#### POST /api/notifications/register-token
Register push notification token.

**Auth:** Bearer token (user or dealer)

```typescript
// Request
interface RegisterTokenRequest {
  token: string;       // Min 10 chars
  platform: 'ios' | 'android';
}

// Response 200
{ message: 'Push token registered' }
```

#### GET /api/notifications
Get in-app notifications.

**Auth:** Bearer token

```typescript
// Query: page, limit (max 50)
// Response 200
interface NotificationsResponse {
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    data: string | null;
    read: boolean;
    readAt: string | null;
    createdAt: string;
  }>;
  unreadCount: number;
  page: number;
  limit: number;
}
```

#### POST /api/notifications/mark-read
Mark notifications as read.

**Auth:** Bearer token

```typescript
// Request
interface MarkReadRequest {
  ids?: string[];    // Specific IDs, or omit to mark all
}
```

---

### Admin APIs

All admin endpoints require `authenticateAdmin` middleware (admin JWT).

#### GET /api/admin/dealers
List all dealers with filtering and pagination.

**Query:** `status`, `page`, `limit`, `search`

```typescript
// Response 200
interface AdminDealersResponse {
  dealers: Array<{ /* Full Dealer objects (password excluded by default) */ }>;
  counts: {
    pending: number;
    verified: number;
    suspended: number;
    rejected: number;
  };
  pagination: PaginationResponse;
}
```

#### POST /api/admin/dealers/:id/verify
Verify or reject a dealer.

```typescript
// Request
interface VerifyDealerRequest {
  action: 'verify' | 'reject';
  notes?: string;
}

// Response 200
{ dealer: { /* Updated dealer */ } }
// Creates AuditLog entry
```

#### POST /api/admin/dealers/:id/suspend
Suspend a dealer.

```typescript
// Request
{ reason?: string }
// Creates AuditLog entry
```

#### GET /api/admin/dashboard/stats
Platform overview statistics.

```typescript
// Response 200
interface DashboardStatsResponse {
  stats: {
    totalUsers: number;
    totalDealers: number;
    pendingDealers: number;
    totalRFQs: number;
    activeRFQs: number;
    totalProducts: number;
    totalInquiries: number;
    openFraudFlags: number;
    totalQuotes: number;
  };
  recentRFQs: Array<{ id: string; title: string; status: string; createdAt: string; deliveryCity: string; }>;
  recentDealers: Array<{ id: string; businessName: string; ownerName: string; city: string; status: string; }>;
}
```

#### GET /api/inquiry/admin/list
List all product inquiries with filtering.

**Query:** `page`, `limit`, `status`, `search`

```typescript
// Response 200
interface AdminInquiriesResponse {
  data: Array<{
    /* ProductInquiry fields */
    pipeline: { id: string; status: string; identifiedBrand: string | null; } | null;
  }>;
  total: number;
  page: number;
  limit: number;
  pages: number;
  statusCounts: Record<string, number>;
}
```

#### PATCH /api/inquiry/admin/:id/respond
Admin sends quote/response to an inquiry.

```typescript
// Request
interface AdminRespondRequest {
  quotedPrice?: number;
  shippingCost?: number;
  totalPrice?: number;
  estimatedDelivery?: string;
  responseNotes?: string;
  status?: 'new' | 'contacted' | 'quoted' | 'closed';
  internalNotes?: string;
}
```

#### Inquiry Pipeline APIs (admin)

- POST `/api/inquiry-pipeline/:inquiryId/create` -- Create pipeline with AI analysis
- GET `/api/inquiry-pipeline/:inquiryId` -- Get pipeline with dealer quotes
- POST `/api/inquiry-pipeline/:pipelineId/auto-match` -- Find matching dealers
- POST `/api/inquiry-pipeline/:pipelineId/add-dealer` -- Add dealer to pipeline
- PATCH `/api/inquiry-pipeline/:pipelineId/quotes/:quoteId` -- Update dealer quote
- DELETE `/api/inquiry-pipeline/:pipelineId/quotes/:quoteId` -- Remove dealer
- POST `/api/inquiry-pipeline/:pipelineId/send-to-customer` -- Compile and send quotes

#### CRM APIs (admin)

- GET/POST `/api/crm/companies` -- List/create companies
- GET/PUT/DELETE `/api/crm/companies/:id` -- Company CRUD
- POST `/api/crm/companies/bulk-import` -- Bulk import companies
- GET `/api/crm/companies/:companyId/contacts` -- List contacts
- POST/PUT/DELETE `/api/crm/contacts` -- Contact CRUD
- GET/POST `/api/crm/outreaches` -- List/create outreaches
- PUT `/api/crm/outreaches/:id` -- Update outreach
- POST `/api/crm/outreaches/:id/sent` -- Mark as sent
- POST `/api/crm/outreaches/:id/response` -- Record response
- GET/POST `/api/crm/meetings` -- List/create meetings
- PUT `/api/crm/meetings/:id` -- Update meeting
- POST `/api/crm/meetings/:id/complete` -- Complete with notes
- GET `/api/crm/email-templates` -- List templates
- POST/PUT `/api/crm/email-templates` -- Template CRUD
- GET `/api/crm/pipeline` -- Pipeline overview with counts

#### Scraper APIs (admin)

- GET `/api/scraper/brands` -- List configured brands
- GET `/api/scraper/stats` -- Scraping statistics
- GET `/api/scraper/jobs` -- Recent scrape jobs
- GET `/api/scraper/jobs/:id` -- Job detail with logs
- POST `/api/scraper/scrape/:brandSlug` -- Start scrape for brand
- POST `/api/scraper/scrape-all` -- Start scraping all brands
- GET `/api/scraper/products` -- List scraped products
- GET `/api/scraper/products/:id` -- Scraped product detail
- POST `/api/scraper/products/:id/process` -- Process scraped product into catalog
- DELETE `/api/scraper/products/:id` -- Delete scraped product

#### Fraud APIs (admin)

- GET `/api/admin/fraud-flags` -- List open fraud flags (sorted by severity)
- POST `/api/admin/fraud-flags/:id/resolve` -- Resolve flag

```typescript
// Request
interface ResolveFraudFlagRequest {
  status: 'resolved' | 'false_positive';
  notes?: string;
}
```

#### Admin Product Management

- POST `/api/admin/categories` -- Create category
- POST `/api/admin/brands` -- Create brand
- POST `/api/admin/products` -- Create product
- GET `/api/admin/products` -- List products with search/filter

#### Admin AI Insights

- GET `/api/admin/ai-insights` -- AI-generated platform insights based on real-time data

---

## 3. FRONTEND ARCHITECTURE GUIDE

### Component Architecture Patterns

The frontend follows a **container/presenter** pattern augmented with React hooks:

- **Page components** (containers): Located in `src/pages/`. Handle routing, data fetching via React Query, and orchestrate child components. Examples: `HomePage`, `DealerDashboard`, `AdminInquiriesPage`.
- **UI components** (presenters): Located in `src/components/`. Pure rendering components that receive data via props. Examples: `InquiryCard`, `QuoteComparisonTable`, `StatCard`.
- **Layout components**: `Layout` (public), `UserLayout`, `DealerLayout`, `AdminLayout`, `ProfessionalLayout` -- each wraps their respective route group with appropriate navigation, sidebar, and footer.
- **Hooks**: Custom hooks in `src/hooks/` encapsulate reusable logic (auth state, API calls, form management).

### State Management Strategy

| Layer | Tool | Purpose |
|-------|------|---------|
| Global auth | **Zustand** | User/dealer/admin session, JWT token, login/logout actions |
| Server state | **React Query** | All API data: products, inquiries, RFQs, dealers. Automatic caching, background refetching, optimistic updates |
| Local UI state | **useState** | Form inputs, modal open/close, tab selection, temporary UI state |
| URL state | **React Router** | Route params (slug, id), query params (page, search, status filters) |

**Zustand store structure:**
```typescript
interface AuthStore {
  user: User | Dealer | Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  userType: 'user' | 'dealer' | 'admin' | null;
  login: (token: string, user: object) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}
```

### Routing Structure

```
/                                 HomePage (public)
/get-started                      RoleSelectionPage (no layout)
/login, /signup                   UserAuthPage (no layout)
/dealer/login                     DealerLoginPage (no layout)
/admin/login                      AdminLoginPage (no layout)
/auth/callback                    AuthCallback (no layout, processes OAuth)
/complete-profile                 ProfileCompletionPage (no layout)
/dealer/onboarding                DealerOnboarding (no layout)
/pro/onboarding                   ProfessionalOnboarding (no layout)
/dealer/registration-success      DealerRegistrationSuccess (no layout)
/dealer/registration-status       DealerRegistrationStatus (no layout)
/ai-assistant                     AIAssistantPage (standalone, no layout)

-- Public (Layout wrapper) --
/categories                       CategoriesPage
/categories/:slug                 CategoryDetailPage
/product-types/:slug              ProductTypePage
/products/:id                     ProductDetailPage
/community                        CommunityPage
/community/:id                    PostDetailPage
/knowledge                        KnowledgePage
/privacy                          PrivacyPage
/terms                            TermsPage
/join-team                        JoinTeamPage
/about                            AboutPage
/contact                          ContactPage
/track                            TrackInquiryPage
/smart-scan                       SmartSlipScanPage

-- User Dashboard (UserLayout, requires user auth) --
/dashboard                        UserDashboard
/rfq/create                       CreateRFQPage
/rfq/my-rfqs                      MyRFQsPage
/rfq/:id                          RFQDetailPage
/user/categories                  CategoriesPage (within user layout)
/user/products/:id                ProductDetailPage (within user layout)
/compare                          ComparePage
/messages                         MessagesPage

-- Professional Portal (ProfessionalLayout, requires user auth) --
/pro                              ProfessionalDashboard
/pro/profile                      ProfessionalProfilePage
/pro/documents                    ProfessionalOnboarding
/pro/projects                     ProfessionalProfilePage

-- Dealer Portal (DealerLayout, requires dealer auth) --
/dealer                           DealerDashboard
/dealer/inquiries/available       DealerAvailableInquiriesPage
/dealer/rfqs                      DealerRFQsPage
/dealer/rfqs/:rfqId/quote         DealerQuoteSubmitPage
/dealer/quotes                    DealerQuotesPage
/dealer/profile                   DealerProfilePage
/dealer/messages                  MessagesPage

-- Admin Panel (AdminLayout, requires admin auth) --
/admin                            AdminDashboard
/admin/dealers                    AdminDealersPage
/admin/leads                      AdminLeadsPage
/admin/chats                      AdminChatsPage
/admin/crm                        AdminCRMPage
/admin/scraper                    AdminScraperPage
/admin/inquiries                  AdminInquiriesPage
/admin/inquiries/:inquiryId/pipeline  AdminInquiryPipelinePage
/admin/brand-dealers              AdminBrandDealersPage
/admin/products                   AdminProductsPage
/admin/rfqs                       AdminRFQsPage
/admin/fraud                      AdminFraudPage
/admin/analytics                  AdminAnalyticsPage
/admin/settings                   AdminSettingsPage
/admin/professionals              AdminProfessionalsPage
```

### Data Fetching Patterns

All API calls use React Query with the following patterns:

```typescript
// Query pattern (reads)
const { data, isLoading, error } = useQuery({
  queryKey: ['inquiries', { status, page }],
  queryFn: () => api.get('/inquiry/admin/list', { params: { status, page } }),
  staleTime: 30_000,         // 30s before refetch
  refetchOnWindowFocus: true,
});

// Mutation pattern (writes)
const mutation = useMutation({
  mutationFn: (data: CreateRFQRequest) => api.post('/rfq', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    toast.success('RFQ created');
  },
  onError: (err) => {
    toast.error(err.response?.data?.error || 'Something went wrong');
  },
});
```

### Form Handling

- **Controlled components** with useState for simple forms
- **Zod schemas** for client-side validation (matching backend schemas)
- **Form pattern:** onChange handlers update state -> onSubmit validates with Zod -> if valid, call mutation -> handle success/error

### Error Handling

- **ErrorBoundary**: Wraps route groups, catches rendering errors, shows fallback UI
- **API errors**: Caught by React Query's `onError`, displayed via toast notifications
- **Network errors**: Axios interceptor detects 401 -> triggers logout -> redirect to login
- **Validation errors**: Zod `.safeParse()` returns field-level errors displayed inline

### Code Splitting Strategy

- **Eager loaded** (in main bundle): Layout, HomePage, Auth pages, Product catalog pages -- these are entry points and core browsing flows
- **Lazy loaded** (separate chunks): User dashboard, Dealer portal, Admin panel, Community, Knowledge, Static pages -- loaded on demand via `React.lazy()` with `Suspense` fallback

---

## 4. BACKEND ARCHITECTURE GUIDE

### Express App Structure

```
backend/
  src/
    config/
      database.ts          # Prisma client singleton
      env.ts               # Environment variable validation
      passport.ts          # Google OAuth strategy
    middleware/
      auth.ts              # authenticateToken, authenticateUser, authenticateDealer, authenticateAdmin, optionalAuth
      rateLimiter.ts       # Rate limiters: otpLimiter, loginLimiter, credentialLoginLimiter, etc.
      validation.ts        # validateBody(zodSchema) middleware factory
    routes/
      auth.routes.ts       # Auth (OTP, Google, dealer, admin)
      products.routes.ts   # Product catalog
      inquiry.routes.ts    # Product inquiries
      dealer.routes.ts     # Dealer profile/documents
      dealer-inquiry.routes.ts  # Dealer inquiry quoting
      quote.routes.ts      # RFQ-based quoting
      rfq.routes.ts        # RFQ CRUD
      community.routes.ts  # Community posts/comments
      chat.routes.ts       # AI chat (Volt)
      contact.routes.ts    # Contact form
      notification.routes.ts # Push/in-app notifications
      professional.routes.ts # Professional onboarding
      crm.routes.ts        # CRM system
      scraper.routes.ts    # Product scraping
      inquiry-pipeline.routes.ts # Inquiry dealer pipeline
      admin.routes.ts      # Admin dashboard/management
      brand-dealer.routes.ts # Brand dealer directory
      knowledge.routes.ts  # Knowledge articles
      database.routes.ts   # Database health checks
    services/
      email.service.ts     # Email sending (SES/SendGrid)
      sms.service.ts       # SMS sending (OTP delivery)
      ai.service.ts        # Claude AI integration
      ai-parser.service.ts # Claude Vision + text parsing
      activity.service.ts  # Activity logging
      token.service.ts     # Refresh token management
      notification.service.ts # Push notification service
      dealer-matching.service.ts # RFQ-to-dealer matching
      inquiry-pipeline.service.ts # Pipeline orchestration
      scraper/             # Web scraping engine
    index.ts               # Express app setup + server start
  prisma/
    schema.prisma          # Database schema (40+ models)
```

### Middleware Chain Order

```
1. cors()                  -- Cross-origin resource sharing
2. helmet()                -- Security headers (CSP, HSTS, etc.)
3. express.json()          -- Parse JSON request bodies
4. express.urlencoded()    -- Parse URL-encoded bodies
5. express.static()        -- Serve uploaded files from /uploads
6. Rate limiters           -- Per-route rate limiting
7. Route-level auth        -- authenticateToken / authenticateDealer / authenticateAdmin
8. Validation middleware   -- validateBody(zodSchema)
9. Route handler           -- Business logic
10. Error handler          -- Centralized error middleware (catches unhandled errors)
```

### Route -> Controller -> Service Pattern

The codebase uses a **flat route handler** pattern (logic directly in route files) rather than separate controller/service layers. This is appropriate for the current scale:

```
Route file (auth.routes.ts)
  |-- Defines Zod schema
  |-- Applies middleware (auth, validation, rate limiting)
  |-- Route handler function:
       |-- Validates input (Zod)
       |-- Calls Prisma directly for simple CRUD
       |-- Calls service functions for complex logic (AI, matching, email)
       |-- Logs activity via logActivity()
       |-- Returns JSON response
```

For complex operations, dedicated services exist:
- `ai.service.ts`: Claude API calls for chat, suggestions, insights, quote parsing
- `ai-parser.service.ts`: Claude Vision for image analysis, text parsing for PDF
- `dealer-matching.service.ts`: Algorithm to match RFQs to dealers by brand/category/pincode
- `inquiry-pipeline.service.ts`: Pipeline creation, dealer matching, quote compilation
- `email.service.ts`: Template rendering + email delivery
- `token.service.ts`: Refresh token creation, validation, rotation, revocation

### Error Handling

```typescript
// Custom error pattern used in services
throw new Error('Pipeline not found for this inquiry');

// Route handlers catch and respond
try {
  // ... business logic
} catch (error: any) {
  console.error('Operation error:', error);
  return res.status(500).json({ error: error.message || 'Operation failed' });
}

// Prisma-specific error handling
if (error.code === 'P2002') {
  const field = error.meta?.target?.[0] || 'field';
  return res.status(400).json({ error: `This ${field} is already registered` });
}
```

### Validation

Every endpoint that accepts a request body uses Zod:

```typescript
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  quantity: z.coerce.number().int().min(1),
});

router.post('/endpoint', validateBody(schema), async (req, res) => {
  // req.body is now typed and validated
});
```

The `validateBody` middleware:
1. Calls `schema.safeParse(req.body)`
2. If invalid: returns 400 with `{ error, details: fieldErrors }`
3. If valid: calls `next()` with parsed data on `req.body`

### File Upload Handling

```
Client uploads file (multipart/form-data)
  |
multer middleware:
  |-- diskStorage: saves to /uploads/{category}/
  |-- fileFilter: validates MIME types
  |-- limits: enforces max file size (5MB default, 20MB for slip scanner)
  |
Route handler:
  |-- req.file contains file metadata
  |-- Stores relative path in database (e.g., /uploads/dealer-documents/abc.pdf)
  |-- File served statically via express.static()
```

### Email Service

```
Template rendering (getContactNotificationEmail, getQuoteCompilationEmail, etc.)
  |
sendEmail({ to, subject, html, replyTo })
  |
AWS SES or SendGrid (configurable via env)
```

### Background Jobs

Currently handled via fire-and-forget async patterns:

```typescript
// Scraper: starts async, responds immediately
scraperService.scrapeBrand(brandSlug)
  .then(result => console.log('Complete:', result))
  .catch(error => console.error('Failed:', error));

res.json({ message: 'Scrape job started' });
```

Future: BullMQ with Redis for proper job queuing, retry logic, and status tracking.

### Logging

```typescript
// Activity logging (structured, persisted to DB)
logActivity({
  actorType: 'user' | 'dealer' | 'admin' | 'anonymous',
  actorId: string,
  actorEmail: string,
  actorName: string,
  activityType: ActivityType,  // Enum with 30+ types
  description: string,         // Human-readable
  metadata: object,            // JSON context
  entityType: string,
  entityId: string,
  req: Request,                // Extracts IP + User-Agent
});

// Console logging for debugging
console.log(`[Module] Action: ${details}`);
console.error('[Module] Error:', error);
```

### Authentication Architecture

```
JWT-based stateless auth:
  |
  |-- Access token: 7d expiry (user/dealer), 24h (admin)
  |-- Refresh token: stored in RefreshToken table, rotated on each use
  |-- Google OAuth: Passport.js strategy -> JWT issued on callback
  |-- Phone OTP: 6-digit code, 10-min expiry, 3 max attempts
  |-- Dealer: email/password with bcrypt hashing
  |-- Admin: email/password with bcrypt hashing
  |
Middleware hierarchy:
  |-- authenticateToken: validates JWT, attaches req.user (any type)
  |-- authenticateUser: authenticateToken + checks type === 'user'
  |-- authenticateDealer: authenticateToken + checks type === 'dealer'
  |-- authenticateAdmin: authenticateToken + checks type === 'admin'
  |-- optionalAuth: attempts auth but does not reject if absent
```

### Database Architecture

PostgreSQL via Prisma ORM with 40+ models organized into domains:

| Domain | Models |
|--------|--------|
| User Management | User, ProfessionalProfile, ProfessionalDocument, OTP |
| Dealer Management | Dealer, DealerServiceArea, DealerReview, DealerBrandMapping, DealerCategoryMapping |
| Product Catalog | Category, SubCategory, ProductType, Brand, Product, SavedProduct |
| RFQ System | RFQ, RFQItem |
| Quote System | Quote, QuoteItem |
| Inquiry System | ProductInquiry, InquiryDealerResponse, InquiryPipeline, InquiryDealerQuote |
| Community | CommunityPost, CommunityComment, KnowledgeArticle |
| Chat | ChatSession, ChatMessage |
| CRM | CRMCompany, CRMContact, CRMOutreach, CRMMeeting, CRMPipelineStage |
| Scraping | ScrapeBrand, ScrapeJob, ScrapedProduct, ScrapeMapping, ScrapeTemplate |
| Auth/Security | Admin, RefreshToken, PasswordResetToken, AuditLog, FraudFlag |
| Notifications | DevicePushToken, Notification |
| Contact | ContactSubmission, EmailTemplate |
| Analytics | UserActivity (comprehensive activity log with 30+ event types) |

All models use UUID primary keys, `createdAt`/`updatedAt` timestamps, and strategic indexes for query performance.

---

*End of document. This PRD serves as the definitive reference for Hub4Estate's user journeys, API surface, and architectural decisions. All TypeScript interfaces reflect the actual Prisma schema and Express route handlers as implemented.*
