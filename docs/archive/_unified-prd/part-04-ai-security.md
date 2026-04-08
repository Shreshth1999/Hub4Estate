# §8 — AI & Agentic Architecture

> Every AI system documented below is deployed and processing production traffic. All implementations are derived from the actual codebase: `ai.service.ts`, `ai-parser.service.ts`, `chat.routes.ts`, and supporting services.

---

## 8.1 AI Infrastructure Overview

### Model Selection Matrix

| System | Model | Max Tokens | Latency Target | File |
|--------|-------|-----------|----------------|------|
| Volt AI Chat (Streaming) | `claude-sonnet-4-20250514` | 4096 | < 3s first token | `ai.service.ts` |
| Volt AI Chat (Non-streaming) | `claude-sonnet-4-20250514` | 4096 | < 5s full response | `ai.service.ts` |
| RFQ AI Suggestions | `claude-haiku-4-5-20251001` | 512 | < 2s | `ai.service.ts` |
| Product Explanation | `claude-haiku-4-5-20251001` | 400 | < 2s | `ai.service.ts` |
| Dealer Performance Analysis | `claude-haiku-4-5-20251001` | 400 | < 2s | `ai.service.ts` |
| Admin Platform Insights | `claude-haiku-4-5-20251001` | 600 | < 3s | `ai.service.ts` |
| Dealer Quote Parsing (NLP) | `claude-haiku-4-5-20251001` | 512 | < 2s | `ai.service.ts` |
| Slip Scanner (Vision) | `claude-sonnet-4-20250514` | 2048 | < 5s | `ai-parser.service.ts` |
| Slip Scanner (Text) | `claude-sonnet-4-20250514` | 2048 | < 3s | `ai-parser.service.ts` |
| Brand Suggestions (AI fallback) | `claude-sonnet-4-20250514` | 800 | < 3s | `ai-parser.service.ts` |
| Google Cloud Vision (OCR) | Google Vision API | N/A | < 3s | `ai-parser.service.ts` |

### SDK Configuration

```typescript
// ai.service.ts
import Anthropic from '@anthropic-ai/sdk';
const anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// ai-parser.service.ts
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
```

### Graceful Degradation
Every AI function checks `if (!anthropicClient)` and returns a sensible fallback:
- Chat: returns "I'm currently unavailable" message with founder contact info
- Slip Scanner: falls back to simple regex-based text parser
- Brand Suggestions: returns hardcoded top-5 list per product category
- Admin Insights: returns single "AI unavailable" insight
- RFQ Suggestions: returns `{ insights: ['AI suggestions unavailable'] }`

---

## 8.2 Volt AI Chat Agent — Primary AI Interface

### System Prompt (Complete Production Text)

The complete system prompt is defined in `ai.service.ts` as `HUB4ESTATE_SYSTEM_PROMPT` (121 lines). Key sections:

1. **Identity**: "You are Volt — the official AI agent for Hub4Estate"
2. **Language Lock**: Detect first message language (Hindi/English/Hinglish), lock for entire conversation. Non-negotiable rule that overrides all other behavior.
3. **Platform Context**: Who Hub4Estate is for (ANYONE wanting best price, NOT just contractors), how it works (inquiry -> dealer matching -> quotes -> best price)
4. **Company Facts**: LLPIN, founder details, registered address, real validated deals
5. **Product Categories**: 13 electrical categories with brand lists
6. **Top Brands**: 23 brands listed
7. **Indian Wiring Standards**: BIS-compliant wire sizing for every circuit type
8. **Capabilities**: 7 enumerated capabilities mapped to tools
9. **Inquiry Rules**: Required fields, collection protocol, post-submission behavior
10. **Dealer Quote Rules**: Detection triggers for dealer context
11. **Behavior Guidelines**: Direct/warm/smart tone, no fabricated prices, proactive inquiry offers

### Dynamic System Prompt Augmentation

```typescript
function buildSystemPrompt(userContext?, dealerContext?): string
```

The base prompt is augmented at runtime with:
- **User context** (if logged in): name, phone, email, city — pre-fills inquiry fields
- **Dealer context** (if dealer): businessName, city — switches to dealer-assist mode with quote composition help

### Tool Definitions (5 Production Tools)

#### Tool 1: `submit_inquiry`
```json
{
  "name": "submit_inquiry",
  "description": "Submit a product inquiry on behalf of the user.",
  "input_schema": {
    "required": ["name", "phone", "modelNumber", "deliveryCity"],
    "properties": {
      "name": "string — Customer's full name",
      "phone": "string — 10-digit mobile number",
      "email": "string — optional",
      "modelNumber": "string — Product model/name/description",
      "quantity": "number — default 1",
      "deliveryCity": "string — City for delivery",
      "notes": "string — Additional requirements"
    }
  }
}
```
**Executor**: Creates `ProductInquiry` in database with auto-generated inquiry number (`HUB-{TAG}-{SEQ}`). Returns inquiry number and confirmation message.

#### Tool 2: `search_products`
```json
{
  "name": "search_products",
  "input_schema": {
    "required": ["query"],
    "properties": {
      "query": "string — Search query",
      "brand": "string — Filter by brand (optional)",
      "category": "string — Filter by category (optional)",
      "limit": "number — Max results (default 5)"
    }
  }
}
```
**Executor**: Prisma `findMany` with case-insensitive `contains` on name, modelNumber. Returns formatted product list with brand, model, category, specifications.

#### Tool 3: `compare_products`
```json
{
  "name": "compare_products",
  "input_schema": {
    "required": ["items"],
    "properties": {
      "items": "string[] — Product/brand names to compare",
      "aspect": "string — price|quality|specifications|use-case|all"
    }
  }
}
```
**Executor**: Returns the items and aspect back to the model with instruction to use its own knowledge for comparison (no database lookup — leverages Claude's training data).

#### Tool 4: `generate_dealer_quote`
```json
{
  "name": "generate_dealer_quote",
  "input_schema": {
    "required": ["raw_input"],
    "properties": {
      "raw_input": "string — Natural language offer",
      "product_name": "string",
      "price_per_unit": "number — INR",
      "unit_type": "string — piece/metre/set/box/kg",
      "delivery_days": "number",
      "warranty_info": "string",
      "shipping_info": "string",
      "minimum_order": "number",
      "validity_days": "number — default 3",
      "notes": "string"
    }
  }
}
```
**Executor**: Formats extracted fields into a professional quotation with GST note and validity period.

#### Tool 5: `track_inquiry`
```json
{
  "name": "track_inquiry",
  "input_schema": {
    "required": [],
    "properties": {
      "inquiry_number": "string — e.g., HUB-CABLE-0023",
      "phone": "string — Fallback lookup by phone"
    }
  }
}
```
**Executor**: Looks up inquiry by number (case-insensitive) or most recent for phone. Returns status with human-readable label.

### Agentic Loop Architecture

```
User Message
    |
    v
[Build System Prompt + Tools]
    |
    v
[Claude API Call (stream or batch)] <----- Loop (max 5 iterations)
    |                                         ^
    v                                         |
[stop_reason?]                                |
    |                                         |
    +-- end_turn --> Return text to user       |
    |                                         |
    +-- tool_use --> Execute tool(s)  --------+
                     Append tool results
                     Continue loop
```

**Max iterations**: 5 (prevents infinite loops). If exceeded, returns "Request too complex" error.

### Streaming Implementation (SSE)

```typescript
// chat.routes.ts — SSE endpoint
router.post('/session/:sessionId/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  for await (const event of streamChatResponse(messages, userContext, dealerContext)) {
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
  }

  res.write('event: done\ndata: {}\n\n');
  res.end();
});
```

**Stream event types**: `text`, `tool_start`, `tool_done`, `error`, `done`

### Session & Message Persistence

- **ChatSession**: `id`, `userId` (optional), `dealerId` (optional), `title`, `messageCount`, `createdAt`, `lastMessageAt`
- **ChatMessage**: `id`, `sessionId`, `role` (user/assistant/system), `content`, `toolCalls` (JSON), `toolResults` (JSON), `tokenCount`, `createdAt`

Admin can view all sessions via `GET /api/chat/admin/sessions`.

---

## 8.3 Smart Slip Scanner — Vision AI Pipeline

### Architecture

```
Image/PDF Upload
    |
    +-- PDF? --> pdf-parse (text extraction) --> parseProductsWithAI() --> Claude Text
    |
    +-- Image? --> analyzeImageWithClaudeVision() --> Claude Vision (base64)
    |
    v
[Parse Claude JSON Response]
    |
    v
[For items without brand: getBrandSuggestions()]
    |
    v
[Return structured items to frontend]
```

### Vision System Prompt (Complete)
Defined in `ai-parser.service.ts` as `PARSE_SYSTEM_PROMPT`. Key instructions:
- Expert at Indian electrical products, contractor slips, construction material lists
- Knows all major Indian electrical brands (21 brands enumerated)
- Critical: single product photo -> ONE entry; multi-item list -> multiple entries
- Never split brand + product + specs into separate items
- Default quantity = 1 piece if not specified
- Returns JSON only (no markdown wrapping)

### Output Schema
```typescript
interface ParsedSlip {
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    brand?: string;
    modelNumber?: string;
    notes?: string;
    confidence: number; // 0-1
  }>;
  totalItems: number;
  warnings: string[];
  needsConfirmation: boolean;
  detectedLocation?: string;
}
```

### Brand Suggestion Engine

Static lookup table for 7 categories (wire, cable, mcb, switch, fan, led bulb, conduit) with 5 brands each across 3 segments (premium, quality, budget). Falls back to Claude API for unknown categories, then to a generic top-5 electrical brand list.

### Fallback Chain
1. Claude Vision API (primary for images)
2. Google Cloud Vision OCR + Claude Text (enhanced mode)
3. Simple regex-based text parser (no API key needed)

---

## 8.4 RFQ AI Suggestions

### Implementation (`getAISuggestions()`)

**Input**: RFQ items with product details (resolved from database), delivery city, urgency level.

**Prompt Pattern**: Send product context as JSON, request structured analysis.

**Output Schema**:
```typescript
interface AISuggestion {
  missingItems?: string[];
  quantityWarnings?: Array<{ productId: string; message: string }>;
  complementaryProducts?: string[];
  estimatedBudget?: { min: number; max: number };
  insights?: string[];
}
```

**Model**: `claude-haiku-4-5-20251001`, 512 tokens. JSON extracted via regex match `\{[\s\S]*\}`.

---

## 8.5 Admin AI Insights

### Implementation (`generateAdminInsights()`)

**Input**: Real-time platform metrics:
- Total inquiries, active RFQs, total quotes
- Pending dealer verifications, open fraud flags
- Top demand cities (with counts)
- Top product categories (with counts)
- Recently inquired products

**Output**: Array of 4-5 insights with type, title, body, and priority.

```typescript
interface AdminAIInsight {
  type: 'hot_lead' | 'demand_trend' | 'dealer_tip' | 'city_activity' | 'action_needed';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
}
```

**Model**: `claude-haiku-4-5-20251001`, 600 tokens.

---

## 8.6 Dealer Performance Analysis

### Implementation (`analyzeDealerPerformance()`)

**Input**: Dealer's quote history (last 50 quotes), conversion rate, loss reasons, average rank position.

**Output**: 3-4 bullet points of actionable improvements (plain text).

**Model**: `claude-haiku-4-5-20251001`, 400 tokens.

---

## 8.7 Dealer Quote Parsing (NLP -> Structured)

### Implementation (`parseDealerQuoteFromText()`)

Uses **forced tool choice** (`tool_choice: { type: 'any' }`) to ensure Claude always calls `generate_dealer_quote` tool, extracting structured fields from natural language.

**Input Example**: "main 600 rupaye de sakta hoon per piece, 7 din mein delivery, 1 saal warranty, shipping free above 10k"

**Output**: Structured `ParsedDealerQuote` with `price_per_unit`, `unit_type`, `delivery_days`, `warranty_info`, `shipping_info`, `formatted_quote`.

---

## 8.8 Product Explanation Generator

### Implementation (`generateProductExplanation()`)

**Input**: Product with brand, category, specifications from database.

**Output**: 2-3 paragraphs in simple language covering what the product is, where it's used, why brand matters, what to check before buying.

**Model**: `claude-haiku-4-5-20251001`, 400 tokens.

---

## 8.9 AI Cost Estimation

| System | Calls/Day (Projected) | Cost/Call | Daily Cost |
|--------|----------------------|-----------|------------|
| Volt Chat | 200 | ~$0.01 | $2.00 |
| Slip Scanner | 50 | ~$0.05 | $2.50 |
| RFQ Suggestions | 20 | ~$0.003 | $0.06 |
| Admin Insights | 10 | ~$0.002 | $0.02 |
| Dealer Analysis | 10 | ~$0.002 | $0.02 |
| Quote Parsing | 30 | ~$0.002 | $0.06 |
| Brand Suggestions | 50 | ~$0.005 | $0.25 |
| Product Explanations | 20 | ~$0.002 | $0.04 |
| **Total** | **~390** | | **~$4.95/day (~$150/month)** |

---

# §9 — Security Architecture

> Security configuration derived from `middleware/security.ts`, `middleware/auth.ts`, `middleware/rateLimiter.ts`, `config/env.ts`, and `index.ts`. Every value is production-deployed.

---

## 9.1 Authentication Architecture

### Three Authentication Flows

| Flow | Method | JWT Expiry | Middleware | Token Type |
|------|--------|-----------|------------|------------|
| User | Phone OTP or Google OAuth | 7 days | `authenticateUser` | `{ id, phone, role: 'user' }` |
| Dealer | Email + Password (bcrypt) | 7 days | `authenticateDealer` | `{ id, email, role: 'dealer' }` |
| Admin | Email + Password (bcrypt) | 24 hours | `authenticateAdmin` | `{ id, email, role: 'admin' }` |

### JWT Structure

```typescript
// Signing
const token = jwt.sign(
  { id: user.id, phone: user.phone, role: 'user' },
  env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verification (in middleware)
const decoded = jwt.verify(token, env.JWT_SECRET);
```

### Refresh Token System

- **Storage**: `RefreshToken` model in PostgreSQL (not Redis)
- **Rotation**: Each refresh invalidates the old token and issues a new pair
- **Cleanup**: `tokenService.cleanupExpiredTokens()` runs every 6 hours via `setInterval`
- **Rate Limit**: 20 refresh attempts per hour per IP

### OTP Security

- 6-digit numeric OTP
- 10-minute expiry window
- Maximum 3 verification attempts per OTP
- OTP stored hashed with bcrypt (12 rounds)
- Rate limited: 5 OTP sends per 15 minutes per IP

### Password Security (Dealers & Admins)

- bcrypt with 12 rounds (configurable via `BCRYPT_ROUNDS` env var)
- Password reset via time-limited token sent to email
- Reset token rate limit: 3 per hour per IP

### Middleware Chain

Five authentication middleware functions in `middleware/auth.ts`:

```typescript
authenticateUser(req, res, next)    // Verifies JWT with role: 'user'
authenticateDealer(req, res, next)  // Verifies JWT with role: 'dealer'
authenticateAdmin(req, res, next)   // Verifies JWT with role: 'admin'
authenticateToken(req, res, next)   // Verifies any valid JWT (role-agnostic)
optionalAuth(req, res, next)        // Attaches user if token valid, continues regardless
```

---

## 9.2 Request Security Pipeline

The full security middleware chain applied to every request (order from `index.ts`):

```
1. requestId          — Attach UUID to every request (X-Request-ID header)
2. blockMaliciousAgents — Block known scanner/bot User-Agents
3. helmet              — Standard security headers (HSTS, X-Frame-Options, etc.)
4. securityHeaders     — Custom CSP, Permissions-Policy, Referrer-Policy
5. preventParamPollution — Deduplicate query parameters (keep last)
6. cors                — Origin validation against allowlist
7. express.json        — Body parsing (10MB limit)
8. express.urlencoded  — URL-encoded body parsing (10MB limit)
9. sanitizeInputs      — Strip < > and null bytes from all body values
10. detectAttacks      — Regex pattern matching for SQL injection, XSS, path traversal
11. session            — Express session (7-day cookie, httpOnly, secure in production)
12. passport           — Passport.js initialization (Google OAuth)
13. [Per-route rate limiter] — Applied at route registration
```

---

## 9.3 Input Sanitization

### Implementation (`sanitizeInputs()`)

Recursively sanitizes all string values in `req.body`:
- Strips `<` and `>` characters (XSS prevention)
- Strips null bytes (`\x00`) (null byte injection)
- Trims whitespace
- Preserves arrays and nested objects

Does NOT run on multipart/form-data (file uploads handled separately by Multer).

---

## 9.4 Attack Detection

### Implementation (`detectAttacks()`)

Checks `JSON.stringify({ url, body, query, params })` against 8 regex patterns:

| Pattern Category | Regex | What It Catches |
|-----------------|-------|-----------------|
| SQL Injection | `SELECT.*FROM`, `INSERT.*INTO`, `DROP.*TABLE`, `UNION.*SELECT`, `DELETE.*FROM` | Attempted SQL injection |
| XSS | `<script>...</script>`, `javascript:`, `on\w+=` | Script injection, event handler injection |
| Path Traversal | `\.\.[/\\]` | Directory traversal attempts |
| Null Byte | `\x00` | Null byte injection |
| LDAP Injection | `[()*\|!\\]` | LDAP injection characters |
| Template Injection | `\$\{.*\}`, `\{\{.*\}\}` | Server-side template injection |

**Exemptions**:
- `/api/auth/*` routes — OAuth callbacks contain legitimate `=` and `&`
- `/api/chat/*` routes — User messages contain natural language with `()`, `!`, `*`, `|`
- Multipart form-data requests — Checked separately by Multer

**Logging**: On detection, logs `[SECURITY]` warning with request ID, IP, method, URL, and matched pattern.

---

## 9.5 Security Headers

### Helmet Defaults (via `helmet()`)
- `X-DNS-Prefetch-Control: off`
- `X-Download-Options: noopen`
- `X-Permitted-Cross-Domain-Policies: none`
- `Strict-Transport-Security: max-age=15552000; includeSubDomains`
- `crossOriginResourcePolicy: cross-origin` (configured explicitly)
- `contentSecurityPolicy: false` (replaced by custom CSP below)

### Custom Security Headers (`securityHeaders()`)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://accounts.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.anthropic.com https://accounts.google.com https://exp.host;
  frame-src https://accounts.google.com;
  font-src 'self' data:;
  media-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self'
```

---

## 9.6 Rate Limiting

### 13 Rate Limiters (from `middleware/rateLimiter.ts`)

| Limiter | Window | Max Requests | Applied To |
|---------|--------|-------------|------------|
| `otpLimiter` | 15 min | 5 | OTP send endpoints |
| `loginLimiter` | 15 min | 10 | OTP verify, user login |
| `credentialLoginLimiter` | 15 min | 10 (skip successful) | Dealer/admin login |
| `passwordResetLimiter` | 60 min | 3 | Password reset request |
| `uploadLimiter` | 15 min | 20 | File uploads, slip scanner, professional |
| `inquiryLimiter` | 60 min | 10 | Product inquiry submission |
| `contactLimiter` | 60 min | 5 | Contact form |
| `rfqLimiter` | 60 min | 20 | RFQ creation |
| `quoteLimiter` | 60 min | 50 | Quote submission, dealer inquiries |
| `adminLimiter` | 15 min | 300 | All admin routes, CRM, database |
| `scraperLimiter` | 60 min | 5 | Scraper trigger |
| `aiLimiter` | 15 min | 30 | Chat, AI endpoints |
| `refreshLimiter` | 60 min | 20 | Token refresh |

All limiters:
- Keyed by IP address (default `express-rate-limit` behavior)
- Return `Retry-After` header (standard headers enabled)
- Return JSON error: `{ error: "...", retryAfter: "See Retry-After header" }`
- Legacy headers disabled

---

## 9.7 CORS Configuration

```typescript
const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

// Dynamic origin check
origin: (origin, callback) => {
  if (!origin) return callback(null, true); // Allow no-origin (mobile, curl)
  const isAllowed =
    allowedOrigins.some(allowed => origin.includes(allowed)) ||
    origin.includes('.replit.dev') ||
    origin.includes('.repl.co') ||
    origin.includes('.vercel.app') ||
    origin.includes('hub4estate.com') ||
    origin.includes('localhost');
  // ...
}
```

Credentials: `true` (cookies sent cross-origin for session management).

---

## 9.8 Bot & Scanner Blocking

### Blocked User-Agents (`blockMaliciousAgents()`)

```
sqlmap, nikto, nessus, openvas, masscan, zgrab,
python-requests/2., go-http-client/1.1, curl/7.
```

Returns `403 Forbidden` with `[SECURITY]` log entry including User-Agent and IP.

---

## 9.9 HTTP Parameter Pollution Prevention

`preventParamPollution()` deduplicates query parameters. If a parameter appears as an array (e.g., `?status=active&status=deleted`), only the last value is kept.

---

## 9.10 Body Size Enforcement

Two layers:
1. **express.json**: `{ limit: '10mb' }` — Global JSON body limit
2. **Multer**: Per-route file size limits:
   - Dealer documents: 10MB
   - Slip scanner: 20MB
   - Product/inquiry photos: 5MB (via `MAX_FILE_SIZE` env)

---

## 9.11 Session Security

```typescript
session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',  // HTTPS only in production
    httpOnly: true,                          // No JavaScript access
    maxAge: 7 * 24 * 60 * 60 * 1000,       // 7 days
  },
})
```

---

## 9.12 Environment Variable Security

### Validation (Zod Schema in `config/env.ts`)

All required environment variables are validated at startup. Missing or invalid values crash the process immediately (fail-fast):

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string(),           // Required
  JWT_SECRET: z.string(),             // Required
  SESSION_SECRET: z.string(),         // Required
  GOOGLE_CLIENT_ID: z.string(),       // Required
  GOOGLE_CLIENT_SECRET: z.string(),   // Required
  GOOGLE_CALLBACK_URL: z.string(),    // Required
  FRONTEND_URL: z.string(),           // Required
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ANTHROPIC_API_KEY: z.string().optional(),  // Optional (AI degrades gracefully)
  RESEND_API_KEY: z.string().optional(),     // Optional (email fails silently)
  MSG91_AUTH_KEY: z.string().optional(),     // Optional (SMS provider)
  TWILIO_ACCOUNT_SID: z.string().optional(), // Optional (alt SMS)
  BCRYPT_ROUNDS: z.string().default('12'),
  MAX_FILE_SIZE: z.string().default('5242880'),
});
```

No secrets are hardcoded anywhere in the codebase. All sensitive values come from environment variables.

---

## 9.13 Error Handling Security

### Production Error Masking

```typescript
// index.ts error handler
return res.status(err.status || 500).json({
  error: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
});
```

In production, error details are never exposed to the client. Full error is logged server-side only.

### Structured Error Responses

All error responses follow a consistent format:
```json
{ "error": "Human-readable error message" }
```

Validation errors include details:
```json
{ "error": "Invalid request data", "details": { /* Zod error */ } }
```

---

## 9.14 File Upload Security

### Multer Configuration
- **Destination**: `uploads/` directory with subdirectories per purpose (dealer-documents, inquiry-photos, slip-scans, etc.)
- **Filename**: `{purpose}_{timestamp}_{random}.{ext}` — prevents path-based attacks
- **File filter**: MIME type validation (images: `image/*`, PDFs: `application/pdf`)
- **Size limits**: Enforced per endpoint via Multer `limits` option
- **Cleanup**: Slip scanner files are deleted after processing in `finally` block

### Static File Serving
```typescript
app.use('/uploads', express.static('uploads'));
```

Uploaded files are served as static assets. In production, these should be moved to S3 with CloudFront.

---

## 9.15 Database Security

### Prisma ORM
- All queries are parameterized by default (SQL injection prevention built into Prisma)
- No raw SQL except health check: `prisma.$queryRaw\`SELECT 1\``
- Database connection string in environment variable only

### Graceful Shutdown
```typescript
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

---

## 9.16 Audit Trail

### AuditLog Model
Every sensitive admin action is logged:
- `DEALER_VERIFIED`, `DEALER_REJECTED`, `DEALER_SUSPENDED`
- `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `CATEGORY_CREATED`
- `USER_SUSPENDED`, `RFQ_FLAGGED`, `QUOTE_FLAGGED`

Each log entry includes: `adminId`, `action`, `targetType`, `targetId`, `details` (JSON), `ipAddress`, `createdAt`.

### Activity Tracking
`UserActivity` model tracks 31 activity types across the platform (see ActivityType enum in §6). Records: `userId`, `activityType`, `entityType`, `entityId`, `metadata` (JSON), `ipAddress`, `userAgent`, `createdAt`.

---

## 9.17 Fraud Detection

### FraudFlag Model
Automated or manual fraud flags on users and dealers:
- `flaggedEntityType`: `USER` or `DEALER`
- `flaggedEntityId`: ID of the flagged entity
- `reason`: Free text description
- `severity`: `low`, `medium`, `high`
- `status`: `open`, `investigating`, `resolved`, `dismissed`
- `resolvedBy`: Admin who resolved it
- `resolutionNotes`: How it was resolved

Admin endpoints:
- `GET /api/admin/fraud-flags` — List all flags
- `PATCH /api/admin/fraud-flags/:id` — Update status/resolution

---

*End of sections 8 (AI & Agentic Architecture) and 9 (Security Architecture). Every system described above is deployed, instrumented, and processing production traffic. There are no placeholders. There is no roadmap. The infrastructure is live.*
