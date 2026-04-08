# Hub4Estate Definitive PRD v2 -- Sections 13 & 14

> **Document**: section-13-14-api-frontend
> **Version**: 2.0.0
> **Date**: 2026-04-08
> **Author**: CTO Office, Hub4Estate
> **Status**: Authoritative Reference
> **Classification**: Internal -- Engineering
> **Prerequisite Reading**: section-05-06-techstack-database.md, section-07-08-security-ai.md, section-09-10-agents-design.md

---

# SECTION 13 -- COMPLETE API SPECIFICATION

> *Every endpoint in this section is production-ready. No stubs. No "coming soon." Every request body, response shape, error code, validation rule, and rate limit is defined here. An engineer reads this section and writes the route handler without asking a single question.*

---

## 13.1 API Standards

### 13.1.1 Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://api.hub4estate.com/api/v1` |
| Staging | `https://staging-api.hub4estate.com/api/v1` |
| Local | `http://localhost:3001/api/v1` |

All paths in this document are relative to the base URL. Example: `POST /auth/register` means `POST https://api.hub4estate.com/api/v1/auth/register`.

### 13.1.2 Authentication

All authenticated endpoints require:

```
Authorization: Bearer <access_token>
```

The access token is a 15-minute RS256 JWT issued by the auth service (see section-07-08 SS7.1). Refresh tokens are sent as `httpOnly`, `secure`, `sameSite=strict` cookies -- never in the response body, never in localStorage.

**Token payload shape** (decoded JWT):

```typescript
interface TokenPayload {
  sub: string;            // User ID, Dealer ID, or Admin ID
  type: 'user' | 'dealer' | 'admin';
  role: string;           // UserRole enum value, 'dealer', or 'admin'
  strategy: 'google_oauth' | 'phone_otp' | 'email_password';
  iat: number;
  exp: number;
  jti: string;            // Unique token ID for revocation
}
```

### 13.1.3 Content-Type

All request and response bodies use `application/json` unless explicitly noted (e.g., file uploads use `multipart/form-data`).

### 13.1.4 Pagination Standard

Every list endpoint returns paginated data. Default page size: 20. Maximum page size: 100.

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  meta: {
    requestId: string;
    timestamp: string;     // ISO 8601
  };
}
```

**Query parameters** for all paginated endpoints:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | -- | Page number (1-indexed) |
| `pageSize` | integer | 20 | 100 | Items per page |
| `sortBy` | string | `createdAt` | -- | Field to sort by (endpoint-specific) |
| `sortOrder` | string | `desc` | -- | `asc` or `desc` |

### 13.1.5 Error Response Standard

Every error response follows this shape. No exceptions.

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;          // Machine-readable: VALIDATION_ERROR, NOT_FOUND, etc.
    message: string;       // Human-readable summary
    details?: Array<{
      field?: string;      // Which field failed validation
      message: string;     // What went wrong
      code?: string;       // Specific sub-error code
    }>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}
```

**Standard error codes:**

| HTTP Status | Error Code | When |
|-------------|------------|------|
| 400 | `VALIDATION_ERROR` | Request body/query/params failed Zod validation |
| 400 | `BAD_REQUEST` | Semantically invalid request (e.g., cancelling a completed RFQ) |
| 401 | `UNAUTHORIZED` | Missing or invalid access token |
| 401 | `TOKEN_EXPIRED` | Access token expired -- client should refresh |
| 403 | `FORBIDDEN` | Valid token but insufficient role/permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource (e.g., dealer already submitted quote for this RFQ) |
| 422 | `UNPROCESSABLE_ENTITY` | Business rule violation (e.g., RFQ not in PUBLISHED state) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests -- retry after `Retry-After` header |
| 500 | `INTERNAL_ERROR` | Server error -- logged to Sentry, never exposes internals |

### 13.1.6 Success Response Standard

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
}
```

### 13.1.7 Rate Limiting Tiers

Rate limits are enforced per-IP for unauthenticated requests and per-user for authenticated requests.

| Tier | Requests | Window | Applied To |
|------|----------|--------|------------|
| `STRICT` | 5 | 1 minute | Auth endpoints (register, login, OTP) |
| `MODERATE` | 30 | 1 minute | Write endpoints (create RFQ, submit quote, send message) |
| `STANDARD` | 60 | 1 minute | Read endpoints (list, detail, dashboard) |
| `RELAXED` | 120 | 1 minute | Search, autocomplete, catalog browsing |
| `WEBHOOK` | 100 | 1 minute | External webhooks (Razorpay, logistics) |

Rate limit headers returned on every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1712563200
Retry-After: 18          (only on 429)
```

### 13.1.8 Idempotency

All write endpoints (POST, PUT, DELETE) accept an optional `Idempotency-Key` header:

```
Idempotency-Key: <client-generated UUID v4>
```

Server stores the key in Redis with a 24h TTL. If the same key is received within 24h, the server returns the cached response without re-executing the operation. This prevents duplicate RFQ creation, double payment, or duplicate quote submission on network retries.

### 13.1.9 Request ID Tracing

Every request generates a UUID v4 `requestId` (or uses the `X-Request-ID` header if provided). This ID appears in:
- Response `meta.requestId`
- All log lines for the request
- Sentry error reports
- Response header `X-Request-ID`

---

## 13.2 Auth APIs

### 13.2.1 POST /auth/register

Register a new user account with email and password.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | STRICT (5/min) |
| Idempotent | Yes (on email) |

**Request Body:**

```typescript
{
  name: string;          // min: 2, max: 100, trim
  email: string;         // valid email format, lowercase, trim
  password: string;      // min: 8, max: 128, must contain: uppercase, lowercase, digit
  phone?: string;        // optional, Indian format: 10 digits, regex: /^[6-9]\d{9}$/
  role?: UserRole;       // optional, defaults to INDIVIDUAL_HOME_BUILDER
}
```

**Zod Schema:**

```typescript
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/\d/, 'Password must contain a digit'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  role: z.nativeEnum(UserRole).optional().default('INDIVIDUAL_HOME_BUILDER'),
});
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": null,
      "role": "INDIVIDUAL_HOME_BUILDER",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "status": "ACTIVE",
      "createdAt": "2026-04-08T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  },
  "meta": {
    "requestId": "req_7f8e9a0b1c2d",
    "timestamp": "2026-04-08T10:30:00.000Z"
  }
}
```

Refresh token is set as `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`.

**Response 400 (validation):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "password", "message": "Password must contain an uppercase letter" },
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 409 (duplicate):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "An account with this email already exists"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.2.2 POST /auth/login

Authenticate with email and password.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | STRICT (5/min) |

**Request Body:**

```typescript
{
  email: string;         // valid email, lowercase, trim
  password: string;      // min: 1
}
```

**Zod Schema:**

```typescript
const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "role": "INDIVIDUAL_HOME_BUILDER",
      "profileImage": "https://cdn.hub4estate.com/avatars/usr_a1b2c3d4e5f6.jpg",
      "isEmailVerified": true,
      "isPhoneVerified": true,
      "status": "ACTIVE",
      "createdAt": "2026-04-08T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 401 (invalid credentials):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 403 (suspended):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Your account has been suspended. Contact support@hub4estate.com."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.2.3 POST /auth/google

Handle Google OAuth 2.0 callback. The frontend redirects the user to Google's consent screen, receives the authorization code, and sends it to this endpoint.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | STRICT (5/min) |

**Request Body:**

```typescript
{
  code: string;          // Google authorization code
  redirectUri: string;   // Must match registered redirect URI
}
```

**Zod Schema:**

```typescript
const googleAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z.string().url('Invalid redirect URI'),
});
```

**Response 200 (existing user):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "name": "Rahul Sharma",
      "email": "rahul@gmail.com",
      "profileImage": "https://lh3.googleusercontent.com/...",
      "role": "INDIVIDUAL_HOME_BUILDER",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "status": "ACTIVE",
      "createdAt": "2026-03-15T08:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "isNewUser": false
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 200 (new user -- `isNewUser: true`):** Same shape, `isNewUser: true`. Frontend redirects to onboarding flow.

**Response 400 (invalid code):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid or expired authorization code"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.2.4 POST /auth/send-otp

Send a 6-digit OTP to the specified phone number via SMS (MSG91 primary, Twilio fallback).

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | STRICT (5/min per phone+IP) |

**Request Body:**

```typescript
{
  phone: string;          // 10 digits, Indian format: /^[6-9]\d{9}$/
  purpose: 'login' | 'register' | 'verify';
}
```

**Zod Schema:**

```typescript
const sendOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  purpose: z.enum(['login', 'register', 'verify']),
});
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expiresInSeconds": 300,
    "retryAfterSeconds": 30
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 429 (too many OTPs):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many OTP requests. Try again in 1 hour."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

OTP is hashed with bcrypt cost 10 before storage in Redis. TTL: 300 seconds. Max verification attempts: 5 per OTP. In `NODE_ENV=development`, OTP is always `123456` but is NEVER returned in the HTTP response.

---

### 13.2.5 POST /auth/verify-otp

Verify the OTP and issue access + refresh tokens. Can be used for login (existing user) or registration completion (new user).

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | STRICT (5/min) |

**Request Body:**

```typescript
{
  phone: string;         // 10 digits, Indian format
  otp: string;           // exactly 6 digits
  purpose: 'login' | 'register' | 'verify';
  name?: string;         // required only when purpose = 'register', min: 2, max: 100
}
```

**Zod Schema:**

```typescript
const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  purpose: z.enum(['login', 'register', 'verify']),
  name: z.string().trim().min(2).max(100).optional(),
}).refine(
  (data) => data.purpose !== 'register' || !!data.name,
  { message: 'Name is required for registration', path: ['name'] }
);
```

**Response 200 (login/register):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "name": "Rahul Sharma",
      "email": null,
      "phone": "9876543210",
      "role": "INDIVIDUAL_HOME_BUILDER",
      "isPhoneVerified": true,
      "status": "ACTIVE",
      "createdAt": "2026-04-08T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "isNewUser": true
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 200 (verify -- phone verification for existing user):**

```json
{
  "success": true,
  "data": {
    "message": "Phone verified successfully",
    "isPhoneVerified": true
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 400 (invalid/expired OTP):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid or expired OTP"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 400 (max attempts exceeded):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Maximum verification attempts exceeded. Request a new OTP."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.2.6 POST /auth/refresh

Exchange a valid refresh token (sent as httpOnly cookie) for a new access token + refresh token pair. Implements refresh token rotation -- old refresh token is invalidated.

| Property | Value |
|----------|-------|
| Auth | Cookie (refresh token) |
| Rate Limit | MODERATE (30/min) |

**Request Body:** None. Refresh token read from `Cookie: refreshToken=...`.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

New refresh token set via `Set-Cookie` header. Old refresh token invalidated in Redis.

**Response 401 (invalid/expired refresh token):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired refresh token. Please log in again."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.2.7 POST /auth/logout

Invalidate the current session. Clears the refresh token cookie and revokes the token in Redis.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:** None.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Clears cookie via `Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=0`.

---

### 13.2.8 POST /auth/forgot-password

Send a password reset link to the user's email.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | STRICT (5/min) |

**Request Body:**

```typescript
{
  email: string;        // valid email, lowercase, trim
}
```

**Response 200 (always -- to prevent email enumeration):**

```json
{
  "success": true,
  "data": {
    "message": "If an account with that email exists, we have sent a password reset link."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

The reset token is a random 64-byte hex string, hashed with SHA-256 before storage. TTL: 1 hour. Only one active reset token per email (new request invalidates previous).

---

### 13.2.9 POST /auth/reset-password

Reset password using the token from the email link.

| Property | Value |
|----------|-------|
| Auth | Public (token-based) |
| Rate Limit | STRICT (5/min) |

**Request Body:**

```typescript
{
  token: string;         // 128-char hex from email link
  password: string;      // min: 8, max: 128, uppercase + lowercase + digit
}
```

**Zod Schema:**

```typescript
const resetPasswordSchema = z.object({
  token: z.string().length(128, 'Invalid reset token'),
  password: z.string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/\d/, 'Must contain digit'),
});
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully. Please log in with your new password."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

All existing sessions for this user are invalidated on successful reset.

**Response 400 (invalid/expired token):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid or expired reset token. Please request a new one."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.2.10 GET /auth/me

Return the current authenticated user's profile.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "usr_a1b2c3d4e5f6",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "INDIVIDUAL_HOME_BUILDER",
    "profileImage": "https://cdn.hub4estate.com/avatars/usr_a1b2c3d4e5f6.jpg",
    "isEmailVerified": true,
    "isPhoneVerified": true,
    "status": "ACTIVE",
    "city": "Sri Ganganagar",
    "state": "Rajasthan",
    "pincode": "335001",
    "professionalInfo": {
      "companyName": null,
      "gstNumber": null,
      "verificationStatus": "NOT_APPLIED"
    },
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": true,
      "whatsappNotifications": true,
      "pushNotifications": true,
      "weeklyDigest": true
    },
    "stats": {
      "totalInquiries": 3,
      "totalRfqs": 1,
      "totalSaved": 12,
      "totalOrders": 0
    },
    "createdAt": "2026-03-15T08:00:00.000Z",
    "updatedAt": "2026-04-05T14:30:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.3 User APIs

### 13.3.1 GET /users/profile

Get the authenticated user's full profile.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:** Same as `GET /auth/me` but includes additional fields:

```json
{
  "success": true,
  "data": {
    "id": "usr_a1b2c3d4e5f6",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "INDIVIDUAL_HOME_BUILDER",
    "profileImage": "https://cdn.hub4estate.com/avatars/usr_a1b2c3d4e5f6.jpg",
    "bio": "Building my dream home in Sri Ganganagar",
    "city": "Sri Ganganagar",
    "state": "Rajasthan",
    "pincode": "335001",
    "companyName": null,
    "gstNumber": null,
    "isEmailVerified": true,
    "isPhoneVerified": true,
    "professionalVerification": "NOT_APPLIED",
    "addresses": [
      {
        "id": "addr_abc123",
        "label": "Home",
        "line1": "8-D-12, Jawahar Nagar",
        "line2": null,
        "city": "Sri Ganganagar",
        "state": "Rajasthan",
        "pincode": "335001",
        "isDefault": true
      }
    ],
    "savedProductCount": 12,
    "rfqCount": 1,
    "inquiryCount": 3,
    "createdAt": "2026-03-15T08:00:00.000Z",
    "updatedAt": "2026-04-05T14:30:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.3.2 PUT /users/profile

Update profile fields. Only provided fields are updated (partial update).

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  name?: string;         // min: 2, max: 100, trim
  bio?: string;          // max: 500, trim
  city?: string;         // max: 100
  state?: string;        // must be valid Indian state
  pincode?: string;      // exactly 6 digits, regex: /^\d{6}$/
  companyName?: string;  // max: 200
  role?: UserRole;       // only allowed before first RFQ/inquiry
  phone?: string;        // 10 digits, triggers OTP verification
}
```

**Zod Schema:**

```typescript
const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.enum(INDIAN_STATES).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional(),
  companyName: z.string().max(200).optional(),
  role: z.nativeEnum(UserRole).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "usr_a1b2c3d4e5f6",
    "name": "Rahul Sharma",
    "bio": "Building my dream home",
    "city": "Jaipur",
    "state": "Rajasthan",
    "pincode": "302001",
    "updatedAt": "2026-04-08T11:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.3.3 PUT /users/avatar

Upload or update profile avatar.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |
| Content-Type | `multipart/form-data` |

**Request Body (multipart):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `avatar` | File | Yes | Max 5MB, formats: JPEG, PNG, WebP |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "profileImage": "https://cdn.hub4estate.com/avatars/usr_a1b2c3d4e5f6_1712563200.jpg"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Server flow: validate file type + size --> resize to 256x256 and 64x64 (thumbnail) --> upload both to S3 `avatars/` prefix --> update user record --> return CDN URL.

**Response 400 (invalid file):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file",
    "details": [
      { "field": "avatar", "message": "File must be JPEG, PNG, or WebP and under 5MB" }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.3.4 GET /users/addresses

List all saved addresses for the authenticated user.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "addr_abc123",
      "label": "Home",
      "line1": "8-D-12, Jawahar Nagar",
      "line2": null,
      "city": "Sri Ganganagar",
      "state": "Rajasthan",
      "pincode": "335001",
      "phone": "9876543210",
      "isDefault": true,
      "createdAt": "2026-03-15T08:00:00.000Z"
    },
    {
      "id": "addr_def456",
      "label": "Office",
      "line1": "45, MG Road",
      "line2": "2nd Floor",
      "city": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302001",
      "phone": "9876543210",
      "isDefault": false,
      "createdAt": "2026-04-01T10:00:00.000Z"
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.3.5 POST /users/addresses

Add a new address. Maximum 10 addresses per user.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  label: string;         // min: 1, max: 50, e.g. "Home", "Office", "Site 1"
  line1: string;         // min: 5, max: 200
  line2?: string;        // max: 200
  city: string;          // min: 2, max: 100
  state: string;         // must be valid Indian state
  pincode: string;       // exactly 6 digits
  phone?: string;        // 10 digits, defaults to user's phone
  isDefault?: boolean;   // defaults to false; if true, unsets previous default
}
```

**Zod Schema:**

```typescript
const createAddressSchema = z.object({
  label: z.string().trim().min(1).max(50),
  line1: z.string().trim().min(5, 'Address too short').max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.enum(INDIAN_STATES),
  pincode: z.string().regex(/^\d{6}$/),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  isDefault: z.boolean().optional().default(false),
});
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "addr_ghi789",
    "label": "Site 1",
    "line1": "Plot 42, Industrial Area",
    "line2": null,
    "city": "Jodhpur",
    "state": "Rajasthan",
    "pincode": "342001",
    "phone": "9876543210",
    "isDefault": false,
    "createdAt": "2026-04-08T12:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 422 (limit reached):**

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Maximum 10 addresses allowed. Delete an existing address first."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.3.6 PUT /users/addresses/:id

Update an existing address.

| Property | Value |
|----------|-------|
| Auth | Authenticated (owner only) |
| Rate Limit | MODERATE (30/min) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Address ID |

**Request Body:** Same shape as `POST /users/addresses`, all fields optional. At least one field required.

**Response 200:** Updated address object.

**Response 404:** Address not found or does not belong to user.

---

### 13.3.7 DELETE /users/addresses/:id

Delete an address. Cannot delete the default address if it is the only address.

| Property | Value |
|----------|-------|
| Auth | Authenticated (owner only) |
| Rate Limit | MODERATE (30/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Address deleted successfully"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 422 (cannot delete last default):**

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Cannot delete the default address when it is your only address."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.3.8 GET /users/preferences

Get notification and display preferences.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "notifications": {
      "email": true,
      "sms": true,
      "whatsapp": true,
      "push": true,
      "weeklyDigest": true
    },
    "display": {
      "language": "en",
      "currency": "INR",
      "timezone": "Asia/Kolkata"
    },
    "privacy": {
      "showProfileInCommunity": true,
      "showActivityInFeed": true
    }
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.3.9 PUT /users/preferences

Update preferences. Partial update -- only provided fields are changed.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  notifications?: {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
    push?: boolean;
    weeklyDigest?: boolean;
  };
  display?: {
    language?: 'en' | 'hi';
    currency?: 'INR';
    timezone?: string;
  };
  privacy?: {
    showProfileInCommunity?: boolean;
    showActivityInFeed?: boolean;
  };
}
```

**Response 200:** Updated preferences object.

---

### 13.3.10 GET /users/activity

Get the user's activity feed (recent actions).

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page (max 50) |
| `type` | string | -- | Filter by ActivityType enum (comma-separated) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "act_123",
      "type": "RFQ_PUBLISHED",
      "description": "Published RFQ: 500x Havells MCBs",
      "metadata": { "rfqId": "rfq_abc", "title": "500x Havells MCBs" },
      "createdAt": "2026-04-08T10:00:00.000Z"
    },
    {
      "id": "act_122",
      "type": "PRODUCT_SAVED",
      "description": "Saved Polycab FRLS 2.5mm wire",
      "metadata": { "productId": "prod_xyz", "productName": "Polycab FRLS 2.5mm" },
      "createdAt": "2026-04-07T15:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.4 Catalog APIs

### 13.4.1 GET /catalog/categories

List all product categories as a hierarchical tree. Public -- no auth required.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |
| Cache | CDN 30 min, Redis 60 min |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `flat` | boolean | false | If true, return flat list instead of tree |
| `withProductCount` | boolean | false | Include product count per category |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_electrical",
      "name": "Electrical",
      "slug": "electrical",
      "description": "Wires, switches, MCBs, panels, lighting, and more",
      "image": "https://cdn.hub4estate.com/categories/electrical.jpg",
      "productCount": 1240,
      "children": [
        {
          "id": "cat_wires",
          "name": "Wires & Cables",
          "slug": "wires-cables",
          "description": "FRLS, HRFR, armoured cables, multi-core",
          "image": "https://cdn.hub4estate.com/categories/wires.jpg",
          "productCount": 340,
          "children": [
            {
              "id": "cat_frls",
              "name": "FRLS Wires",
              "slug": "frls-wires",
              "productCount": 85,
              "children": []
            },
            {
              "id": "cat_hrfr",
              "name": "HRFR Wires",
              "slug": "hrfr-wires",
              "productCount": 62,
              "children": []
            }
          ]
        },
        {
          "id": "cat_switchgear",
          "name": "Switchgear & Protection",
          "slug": "switchgear-protection",
          "productCount": 280,
          "children": [
            {
              "id": "cat_mcb",
              "name": "MCBs",
              "slug": "mcbs",
              "productCount": 120,
              "children": []
            },
            {
              "id": "cat_rccb",
              "name": "RCCBs",
              "slug": "rccbs",
              "productCount": 45,
              "children": []
            }
          ]
        },
        {
          "id": "cat_lighting",
          "name": "Lighting & Luminaires",
          "slug": "lighting-luminaires",
          "productCount": 410,
          "children": []
        },
        {
          "id": "cat_fans",
          "name": "Fans & Ventilation",
          "slug": "fans-ventilation",
          "productCount": 95,
          "children": []
        },
        {
          "id": "cat_switches",
          "name": "Modular Switches & Sockets",
          "slug": "modular-switches-sockets",
          "productCount": 115,
          "children": []
        }
      ]
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.2 GET /catalog/categories/:slug

Get a single category by slug, with its immediate products and filters.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Category slug (e.g., `mcbs`) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Product pagination |
| `pageSize` | integer | 20 | Products per page (max 50) |
| `brand` | string | -- | Filter by brand slug(s), comma-separated |
| `minPrice` | number | -- | Minimum MRP in INR |
| `maxPrice` | number | -- | Maximum MRP in INR |
| `sortBy` | string | `popularity` | `popularity`, `price_asc`, `price_desc`, `newest`, `name_asc` |
| `inStock` | boolean | -- | Filter only in-stock products |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat_mcb",
      "name": "MCBs",
      "slug": "mcbs",
      "description": "Miniature Circuit Breakers from top brands",
      "image": "https://cdn.hub4estate.com/categories/mcbs.jpg",
      "breadcrumb": [
        { "name": "Electrical", "slug": "electrical" },
        { "name": "Switchgear & Protection", "slug": "switchgear-protection" },
        { "name": "MCBs", "slug": "mcbs" }
      ],
      "parentId": "cat_switchgear"
    },
    "products": [
      {
        "id": "prod_havells_mcb_32a",
        "name": "Havells MCB 32A Single Pole",
        "slug": "havells-mcb-32a-single-pole",
        "brand": { "id": "brand_havells", "name": "Havells", "slug": "havells", "logo": "..." },
        "mrp": 285,
        "estimatedDealerPrice": { "min": 165, "max": 210 },
        "thumbnail": "https://cdn.hub4estate.com/products/havells-mcb-32a-thumb.jpg",
        "rating": 4.5,
        "reviewCount": 23,
        "inStock": true,
        "specifications": {
          "Current Rating": "32A",
          "Poles": "Single Pole",
          "Breaking Capacity": "10kA",
          "Standard": "IS/IEC 60898"
        }
      }
    ],
    "filters": {
      "brands": [
        { "slug": "havells", "name": "Havells", "count": 34 },
        { "slug": "schneider", "name": "Schneider Electric", "count": 28 },
        { "slug": "legrand", "name": "Legrand", "count": 22 },
        { "slug": "lnt", "name": "L&T", "count": 18 },
        { "slug": "abb", "name": "ABB", "count": 12 },
        { "slug": "siemens", "name": "Siemens", "count": 6 }
      ],
      "priceRange": { "min": 85, "max": 2800 },
      "specifications": {
        "Current Rating": ["6A", "10A", "16A", "20A", "25A", "32A", "40A", "63A"],
        "Poles": ["Single Pole", "Double Pole", "Triple Pole", "Four Pole"],
        "Breaking Capacity": ["6kA", "10kA", "16kA"]
      }
    }
  },
  "pagination": {
    "total": 120,
    "page": 1,
    "pageSize": 20,
    "totalPages": 6,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.3 GET /catalog/brands

List all brands, optionally filtered by category.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |
| Cache | CDN 30 min |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | -- | Filter by category slug |
| `page` | integer | 1 | Pagination |
| `pageSize` | integer | 50 | Items per page |
| `search` | string | -- | Search brand name (prefix match) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "brand_havells",
      "name": "Havells",
      "slug": "havells",
      "logo": "https://cdn.hub4estate.com/brands/havells.png",
      "description": "India's leading FMEG company",
      "website": "https://www.havells.com",
      "productCount": 340,
      "categories": ["Wires & Cables", "Switchgear", "Lighting", "Fans", "Modular Switches"]
    }
  ],
  "pagination": { "total": 45, "page": 1, "pageSize": 50, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.4 GET /catalog/brands/:slug

Get brand detail with product breakdown by category.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "brand_havells",
    "name": "Havells",
    "slug": "havells",
    "logo": "https://cdn.hub4estate.com/brands/havells.png",
    "description": "India's leading FMEG company with a turnover of Rs 18,000+ Crore",
    "website": "https://www.havells.com",
    "established": 1958,
    "headquarters": "Noida, Uttar Pradesh",
    "totalProducts": 340,
    "categoryBreakdown": [
      { "category": "Wires & Cables", "slug": "wires-cables", "count": 85 },
      { "category": "Switchgear & Protection", "slug": "switchgear-protection", "count": 72 },
      { "category": "Lighting & Luminaires", "slug": "lighting-luminaires", "count": 110 },
      { "category": "Fans & Ventilation", "slug": "fans-ventilation", "count": 35 },
      { "category": "Modular Switches & Sockets", "slug": "modular-switches-sockets", "count": 38 }
    ],
    "certifications": ["BIS", "ISI", "ISO 9001:2015"],
    "popularProducts": [
      {
        "id": "prod_havells_mcb_32a",
        "name": "Havells MCB 32A Single Pole",
        "slug": "havells-mcb-32a-single-pole",
        "mrp": 285,
        "thumbnail": "https://cdn.hub4estate.com/products/havells-mcb-32a-thumb.jpg"
      }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.5 GET /catalog/products

Search and filter products across all categories. Powers the main catalog browsing experience.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |
| Cache | CDN 5 min for common queries |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page (max 50) |
| `category` | string | -- | Category slug filter |
| `brand` | string | -- | Brand slug(s), comma-separated |
| `q` | string | -- | Search query (full-text via Elasticsearch) |
| `minPrice` | number | -- | Min MRP in INR |
| `maxPrice` | number | -- | Max MRP in INR |
| `sortBy` | string | `relevance` | `relevance`, `popularity`, `price_asc`, `price_desc`, `newest`, `name_asc`, `rating` |
| `inStock` | boolean | -- | Filter in-stock only |
| `specifications` | string | -- | JSON-encoded spec filters: `{"Current Rating":"32A","Poles":"Single Pole"}` |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_havells_mcb_32a",
      "name": "Havells MCB 32A Single Pole",
      "slug": "havells-mcb-32a-single-pole",
      "brand": { "id": "brand_havells", "name": "Havells", "slug": "havells", "logo": "..." },
      "category": { "id": "cat_mcb", "name": "MCBs", "slug": "mcbs" },
      "mrp": 285,
      "estimatedDealerPrice": { "min": 165, "max": 210 },
      "savingsPercent": { "min": 26, "max": 42 },
      "thumbnail": "https://cdn.hub4estate.com/products/havells-mcb-32a-thumb.jpg",
      "rating": 4.5,
      "reviewCount": 23,
      "inStock": true,
      "keySpecs": {
        "Current Rating": "32A",
        "Poles": "Single Pole",
        "Breaking Capacity": "10kA"
      }
    }
  ],
  "pagination": { "total": 1240, "page": 1, "pageSize": 20, "totalPages": 62, "hasNextPage": true, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.6 GET /catalog/products/:id

Get full product detail.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Product ID or slug |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "prod_havells_mcb_32a",
    "name": "Havells MCB 32A Single Pole",
    "slug": "havells-mcb-32a-single-pole",
    "description": "Havells 32A Single Pole MCB with 10kA breaking capacity. Suitable for residential and light commercial applications. Compliant with IS/IEC 60898.",
    "brand": {
      "id": "brand_havells",
      "name": "Havells",
      "slug": "havells",
      "logo": "https://cdn.hub4estate.com/brands/havells.png"
    },
    "category": {
      "id": "cat_mcb",
      "name": "MCBs",
      "slug": "mcbs",
      "breadcrumb": [
        { "name": "Electrical", "slug": "electrical" },
        { "name": "Switchgear & Protection", "slug": "switchgear-protection" },
        { "name": "MCBs", "slug": "mcbs" }
      ]
    },
    "modelNumber": "!"DHN1C032",
    "mrp": 285,
    "estimatedDealerPrice": { "min": 165, "max": 210 },
    "savingsPercent": { "min": 26, "max": 42 },
    "images": [
      {
        "id": "img_001",
        "url": "https://cdn.hub4estate.com/products/havells-mcb-32a-1.jpg",
        "alt": "Havells MCB 32A front view",
        "isPrimary": true,
        "width": 800,
        "height": 800
      },
      {
        "id": "img_002",
        "url": "https://cdn.hub4estate.com/products/havells-mcb-32a-2.jpg",
        "alt": "Havells MCB 32A side view",
        "isPrimary": false,
        "width": 800,
        "height": 800
      }
    ],
    "specifications": {
      "General": {
        "Brand": "Havells",
        "Model Number": "DHN1C032",
        "Country of Origin": "India"
      },
      "Technical": {
        "Current Rating": "32A",
        "Poles": "Single Pole",
        "Breaking Capacity": "10kA",
        "Curve Type": "C",
        "Rated Voltage": "240V AC",
        "Frequency": "50Hz",
        "Width": "17.5mm (1 Module)"
      },
      "Compliance": {
        "Standard": "IS/IEC 60898",
        "Certification": "BIS",
        "ISI Mark": "Yes"
      }
    },
    "features": [
      "10kA high breaking capacity",
      "C-curve for general purpose protection",
      "DIN rail mounting (35mm)",
      "LED trip indication",
      "Finger-safe terminal design"
    ],
    "inStock": true,
    "dealerCount": 8,
    "rating": 4.5,
    "reviewCount": 23,
    "isSaved": false,
    "relatedProducts": [
      {
        "id": "prod_havells_mcb_16a",
        "name": "Havells MCB 16A Single Pole",
        "slug": "havells-mcb-16a-single-pole",
        "mrp": 245,
        "thumbnail": "..."
      }
    ],
    "frequentlyBoughtTogether": [
      {
        "id": "prod_havells_rccb_25a",
        "name": "Havells RCCB 25A Double Pole 30mA",
        "slug": "havells-rccb-25a-double-pole",
        "mrp": 1850,
        "thumbnail": "..."
      }
    ],
    "sourceUrl": "https://www.havells.com/products/mcb-32a.html",
    "lastScrapedAt": "2026-04-07T03:00:00.000Z",
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-04-07T03:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

The `isSaved` field is `false` for unauthenticated requests. For authenticated users, it reflects whether the product is in their saved list.

---

### 13.4.7 GET /catalog/products/:id/prices

Get price history and dealer price intelligence for a product.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `6m` | `1m`, `3m`, `6m`, `1y` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "productId": "prod_havells_mcb_32a",
    "currentMrp": 285,
    "estimatedDealerPrice": { "min": 165, "max": 210 },
    "averageDealerPrice": 185,
    "lowestRecordedPrice": 155,
    "priceHistory": [
      { "date": "2026-04-01", "mrp": 285, "avgDealerPrice": 185 },
      { "date": "2026-03-01", "mrp": 280, "avgDealerPrice": 180 },
      { "date": "2026-02-01", "mrp": 280, "avgDealerPrice": 178 },
      { "date": "2026-01-01", "mrp": 275, "avgDealerPrice": 175 },
      { "date": "2025-12-01", "mrp": 275, "avgDealerPrice": 172 },
      { "date": "2025-11-01", "mrp": 270, "avgDealerPrice": 168 }
    ],
    "priceTrend": "rising",
    "priceTrendPercent": 5.6,
    "prediction": {
      "nextMonth": { "low": 182, "mid": 190, "high": 198 },
      "confidence": 0.72,
      "recommendation": "Prices have been trending up. Consider procuring soon."
    },
    "dealerCount": 8,
    "citiesAvailable": ["Sri Ganganagar", "Jaipur", "Jodhpur"]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.8 GET /catalog/products/:id/reviews

Get reviews for a product (paginated).

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 10 | Reviews per page (max 50) |
| `sortBy` | string | `newest` | `newest`, `highest`, `lowest`, `helpful` |
| `rating` | integer | -- | Filter by star rating (1-5) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 23,
      "distribution": {
        "5": 12,
        "4": 7,
        "3": 2,
        "2": 1,
        "1": 1
      }
    },
    "reviews": [
      {
        "id": "rev_abc123",
        "userId": "usr_xyz789",
        "userName": "Rajesh K.",
        "userAvatar": null,
        "rating": 5,
        "title": "Excellent quality MCB",
        "body": "Using this for a 3BHK project. Very reliable and easy to install.",
        "images": [],
        "isVerifiedPurchase": true,
        "helpfulCount": 4,
        "createdAt": "2026-04-02T10:00:00.000Z",
        "response": null
      }
    ]
  },
  "pagination": { "total": 23, "page": 1, "pageSize": 10, "totalPages": 3, "hasNextPage": true, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.9 GET /catalog/products/:id/alternatives

Get alternative products (same category, different brand, similar specs).

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 8 | Max alternatives to return (max 20) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_schneider_mcb_32a",
      "name": "Schneider Electric Acti9 iC60 32A SP",
      "slug": "schneider-acti9-ic60-32a-sp",
      "brand": { "id": "brand_schneider", "name": "Schneider Electric", "slug": "schneider", "logo": "..." },
      "mrp": 310,
      "estimatedDealerPrice": { "min": 180, "max": 225 },
      "thumbnail": "...",
      "rating": 4.6,
      "reviewCount": 18,
      "matchScore": 95,
      "keyDifferences": ["Higher MRP (+9%)", "16kA breaking capacity vs 10kA"]
    },
    {
      "id": "prod_legrand_mcb_32a",
      "name": "Legrand RX3 32A SP MCB",
      "slug": "legrand-rx3-32a-sp-mcb",
      "brand": { "id": "brand_legrand", "name": "Legrand", "slug": "legrand", "logo": "..." },
      "mrp": 260,
      "estimatedDealerPrice": { "min": 150, "max": 195 },
      "thumbnail": "...",
      "rating": 4.3,
      "reviewCount": 11,
      "matchScore": 90,
      "keyDifferences": ["Lower MRP (-9%)", "6kA breaking capacity vs 10kA"]
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.10 GET /catalog/products/compare

Compare up to 4 products side by side.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | string | Yes | Comma-separated product IDs (2-4) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_havells_mcb_32a",
        "name": "Havells MCB 32A SP",
        "brand": "Havells",
        "mrp": 285,
        "estimatedDealerPrice": { "min": 165, "max": 210 },
        "rating": 4.5,
        "reviewCount": 23,
        "thumbnail": "..."
      },
      {
        "id": "prod_schneider_mcb_32a",
        "name": "Schneider Acti9 32A SP",
        "brand": "Schneider Electric",
        "mrp": 310,
        "estimatedDealerPrice": { "min": 180, "max": 225 },
        "rating": 4.6,
        "reviewCount": 18,
        "thumbnail": "..."
      }
    ],
    "specifications": [
      {
        "group": "Technical",
        "specs": [
          { "name": "Current Rating", "values": ["32A", "32A"] },
          { "name": "Poles", "values": ["Single Pole", "Single Pole"] },
          { "name": "Breaking Capacity", "values": ["10kA", "16kA"], "highlight": true },
          { "name": "Curve Type", "values": ["C", "C"] },
          { "name": "Rated Voltage", "values": ["240V AC", "240V AC"] },
          { "name": "Width", "values": ["17.5mm", "17.5mm"] }
        ]
      },
      {
        "group": "Compliance",
        "specs": [
          { "name": "Standard", "values": ["IS/IEC 60898", "IEC 60898-1"] },
          { "name": "BIS Certified", "values": ["Yes", "Yes"] }
        ]
      }
    ],
    "verdict": "Schneider offers higher breaking capacity (16kA vs 10kA) at a 9% premium. For residential use, Havells at 10kA is sufficient. For commercial, pick Schneider."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

The `highlight: true` flag indicates specs that differ between products.

**Response 400 (invalid ids):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Provide 2-4 product IDs for comparison",
    "details": [
      { "field": "ids", "message": "Must contain 2-4 comma-separated product IDs" }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.11 GET /catalog/search

Full-text search across products using Elasticsearch. Returns products with relevance scoring, facets, and autocomplete suggestions.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |
| Backend | Elasticsearch 8.11 |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Search query (min: 2 chars) |
| `category` | string | -- | Filter by category slug |
| `brand` | string | -- | Filter by brand slug(s), comma-separated |
| `minPrice` | number | -- | Min MRP |
| `maxPrice` | number | -- | Max MRP |
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Results per page (max 50) |
| `sortBy` | string | `relevance` | `relevance`, `price_asc`, `price_desc`, `popularity`, `newest` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "query": "havells mcb 32a",
    "results": [
      {
        "id": "prod_havells_mcb_32a",
        "name": "Havells MCB 32A Single Pole",
        "slug": "havells-mcb-32a-single-pole",
        "brand": { "name": "Havells", "slug": "havells" },
        "category": { "name": "MCBs", "slug": "mcbs" },
        "mrp": 285,
        "estimatedDealerPrice": { "min": 165, "max": 210 },
        "thumbnail": "...",
        "rating": 4.5,
        "reviewCount": 23,
        "relevanceScore": 0.98,
        "highlight": {
          "name": ["<em>Havells</em> <em>MCB</em> <em>32A</em> Single Pole"]
        }
      }
    ],
    "facets": {
      "categories": [
        { "slug": "mcbs", "name": "MCBs", "count": 8 },
        { "slug": "distribution-boards", "name": "Distribution Boards", "count": 2 }
      ],
      "brands": [
        { "slug": "havells", "name": "Havells", "count": 6 },
        { "slug": "schneider", "name": "Schneider", "count": 2 }
      ],
      "priceRanges": [
        { "label": "Under Rs 200", "min": 0, "max": 200, "count": 2 },
        { "label": "Rs 200-500", "min": 200, "max": 500, "count": 5 },
        { "label": "Above Rs 500", "min": 500, "max": null, "count": 3 }
      ]
    },
    "suggestions": ["havells mcb 32a double pole", "havells mcb 32a tp"],
    "totalResults": 10,
    "searchTimeMs": 12
  },
  "pagination": { "total": 10, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.12 GET /catalog/search/autocomplete

Return autocomplete suggestions as the user types. Must respond in under 100ms.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |
| Latency Target | < 100ms |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Partial query (min: 1 char) |
| `limit` | integer | 8 | Max suggestions (max 15) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    { "type": "product", "text": "Havells MCB 32A Single Pole", "id": "prod_havells_mcb_32a", "category": "MCBs" },
    { "type": "product", "text": "Havells MCB 32A Double Pole", "id": "prod_havells_mcb_32a_dp", "category": "MCBs" },
    { "type": "category", "text": "MCBs", "slug": "mcbs" },
    { "type": "brand", "text": "Havells", "slug": "havells" },
    { "type": "query", "text": "havells mcb price list" }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.13 GET /catalog/trending

Get trending products based on inquiry volume, saves, and searches in the last 7 days.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |
| Cache | CDN 15 min |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | -- | Filter by category |
| `limit` | integer | 12 | Max products (max 30) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_polycab_frls_25",
      "name": "Polycab FRLS 2.5mm Wire (90m coil)",
      "slug": "polycab-frls-25mm-wire-90m",
      "brand": { "name": "Polycab", "slug": "polycab" },
      "mrp": 3200,
      "estimatedDealerPrice": { "min": 2100, "max": 2500 },
      "thumbnail": "...",
      "trendReason": "25 inquiries this week",
      "trendScore": 92
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.4.14 GET /catalog/price-index

Get the Hub4Estate Price Index -- average dealer prices by category, updated daily.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |
| Cache | CDN 1 hour |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `1m` | `1w`, `1m`, `3m`, `6m`, `1y` |
| `category` | string | -- | Filter by category slug |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "lastUpdated": "2026-04-08T00:00:00.000Z",
    "categories": [
      {
        "category": "Wires & Cables",
        "slug": "wires-cables",
        "indexValue": 104.2,
        "changePercent": 2.1,
        "changeDirection": "up",
        "dataPoints": [
          { "date": "2026-04-08", "value": 104.2 },
          { "date": "2026-04-07", "value": 104.0 },
          { "date": "2026-04-06", "value": 103.8 }
        ]
      },
      {
        "category": "Switchgear & Protection",
        "slug": "switchgear-protection",
        "indexValue": 101.5,
        "changePercent": 0.3,
        "changeDirection": "stable",
        "dataPoints": []
      }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

The index value is normalized to 100 at the start of the measurement period. A value of 104.2 means prices are 4.2% higher than baseline.

---

## 13.5 Inquiry APIs

> **CRITICAL: Blind Matching Enforcement**
>
> The inquiry system enforces Hub4Estate's core blind matching model. When a buyer creates an inquiry, matched dealers can see product requirements but NOT the buyer's identity. When a dealer submits a quote, the buyer can see price, delivery terms, and dealer metrics but NOT the dealer's name or business details. Identity is revealed ONLY when the buyer selects a winning quote.
>
> Every endpoint in this section enforces this at the service layer. The API never returns identity-revealing fields to the wrong party.

### 13.5.1 POST /inquiries

Create a new product inquiry. Buyer only.

| Property | Value |
|----------|-------|
| Auth | Authenticated (role: any user) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  // Product identification (at least one required)
  productId?: string;                  // Known product from catalog
  productName?: string;                // Free-text product name (min: 3, max: 200)
  modelNumber?: string;                // Specific model number
  productPhoto?: string;               // S3 key from presigned upload

  // Requirements
  quantity: number;                    // min: 1, max: 100000
  deliveryCity: string;                // min: 2, max: 100
  deliveryPincode?: string;            // 6 digits
  notes?: string;                      // max: 2000, free text

  // Optional enrichment
  categoryId?: string;                 // Category UUID
  brandPreference?: string;            // Brand name or "any"
  urgency?: 'normal' | 'urgent';       // Default: normal
  budgetMax?: number;                  // Max budget in INR (optional, not shown to dealers)
}
```

**Zod Schema:**

```typescript
const createInquirySchema = z.object({
  productId: z.string().uuid().optional(),
  productName: z.string().trim().min(3).max(200).optional(),
  modelNumber: z.string().trim().max(100).optional(),
  productPhoto: z.string().max(500).optional(),
  quantity: z.number().int().min(1).max(100000),
  deliveryCity: z.string().trim().min(2).max(100),
  deliveryPincode: z.string().regex(/^\d{6}$/).optional(),
  notes: z.string().trim().max(2000).optional(),
  categoryId: z.string().uuid().optional(),
  brandPreference: z.string().max(100).optional(),
  urgency: z.enum(['normal', 'urgent']).optional().default('normal'),
  budgetMax: z.number().positive().optional(),
}).refine(
  (data) => data.productId || data.productName || data.modelNumber || data.productPhoto,
  { message: 'Provide at least one of: productId, productName, modelNumber, or productPhoto' }
);
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "inq_abc123def456",
    "inquiryNumber": "HUB-INQ-2026-0042",
    "status": "new",
    "productName": "Havells MCB 32A Single Pole",
    "modelNumber": "DHN1C032",
    "quantity": 500,
    "deliveryCity": "Sri Ganganagar",
    "urgency": "normal",
    "dealerResponseCount": 0,
    "createdAt": "2026-04-08T12:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Server-side behavior:**
1. Validate input via Zod
2. If `productId` provided, resolve product name, brand, category from catalog
3. Create `ProductInquiry` record
4. Fire `InquiryCreated` event on BullMQ:
   - AI pipeline: brand identification, product matching, category tagging
   - Dealer matching: find verified dealers in `deliveryCity` that carry the brand/category
   - Create `InquiryDealerResponse` records for matched dealers (status: `pending`)
   - Send notifications to matched dealers (in-app + WhatsApp if enabled)
5. Log `PRODUCT_INQUIRY_SUBMITTED` activity

---

### 13.5.2 GET /inquiries

List inquiries. Response varies by role.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Items per page |
| `status` | string | -- | Filter by status: `new`, `contacted`, `quoted`, `closed` |
| `sortBy` | string | `createdAt` | `createdAt`, `status`, `quantity` |
| `sortOrder` | string | `desc` | `asc`, `desc` |

**Response 200 (Buyer view -- sees own inquiries):**

```json
{
  "success": true,
  "data": [
    {
      "id": "inq_abc123",
      "inquiryNumber": "HUB-INQ-2026-0042",
      "productName": "Havells MCB 32A Single Pole",
      "modelNumber": "DHN1C032",
      "quantity": 500,
      "deliveryCity": "Sri Ganganagar",
      "status": "quoted",
      "urgency": "normal",
      "dealerResponseCount": 4,
      "lowestQuote": 165,
      "highestQuote": 210,
      "createdAt": "2026-04-08T12:00:00.000Z"
    }
  ],
  "pagination": { "total": 3, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 200 (Dealer view -- sees matched inquiries where dealer has a pending/quoted response):**

```json
{
  "success": true,
  "data": [
    {
      "id": "inq_abc123",
      "inquiryNumber": "HUB-INQ-2026-0042",
      "productName": "Havells MCB 32A Single Pole",
      "modelNumber": "DHN1C032",
      "quantity": 500,
      "deliveryCity": "Sri Ganganagar",
      "urgency": "normal",
      "myResponseStatus": "pending",
      "totalResponses": null,
      "createdAt": "2026-04-08T12:00:00.000Z"
    }
  ],
  "pagination": { "total": 12, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Blind matching enforcement (Dealer view):**
- `name`, `phone`, `email` of the buyer: NEVER included
- `totalResponses`: `null` (dealer cannot see how many other dealers responded)
- `notes`: included only if non-identifying (server strips phone numbers, emails, names via regex)

---

### 13.5.3 GET /inquiries/:id

Get inquiry detail. Response shape depends on role.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer: own inquiry; dealer: matched inquiry) |
| Rate Limit | STANDARD (60/min) |

**Response 200 (Buyer view -- FULL detail):**

```json
{
  "success": true,
  "data": {
    "id": "inq_abc123",
    "inquiryNumber": "HUB-INQ-2026-0042",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com",
    "productName": "Havells MCB 32A Single Pole",
    "productPhoto": "https://cdn.hub4estate.com/inquiries/inq_abc123/photo.jpg",
    "modelNumber": "DHN1C032",
    "quantity": 500,
    "deliveryCity": "Sri Ganganagar",
    "notes": "Need ISI marked. Delivery within 10 days.",
    "status": "quoted",
    "urgency": "normal",
    "budgetMax": 200,
    "category": { "id": "cat_mcb", "name": "MCBs" },
    "identifiedBrand": { "id": "brand_havells", "name": "Havells" },
    "pipeline": {
      "status": "QUOTES_RECEIVED",
      "aiAnalysis": {
        "brandConfidence": 0.99,
        "identifiedProduct": "Havells MCB 32A SP C-Curve 10kA DHN1C032",
        "mrp": 285,
        "estimatedDealerPrice": { "min": 165, "max": 210 }
      }
    },
    "quotedPrice": null,
    "dealerResponses": [
      {
        "id": "resp_001",
        "dealerAlias": "Dealer A",
        "status": "quoted",
        "quotedPrice": 172,
        "shippingCost": 200,
        "totalPrice": 86200,
        "estimatedDelivery": "3-5 business days",
        "notes": "In stock. Can deliver immediately.",
        "dealerMetrics": {
          "rating": 4.7,
          "totalOrders": 120,
          "onTimeDelivery": 95,
          "avgResponseTime": "2 hours"
        },
        "respondedAt": "2026-04-08T14:00:00.000Z"
      },
      {
        "id": "resp_002",
        "dealerAlias": "Dealer B",
        "status": "quoted",
        "quotedPrice": 185,
        "shippingCost": 0,
        "totalPrice": 92500,
        "estimatedDelivery": "1-2 business days",
        "notes": "Pickup available from Jodhpur warehouse.",
        "dealerMetrics": {
          "rating": 4.3,
          "totalOrders": 45,
          "onTimeDelivery": 88,
          "avgResponseTime": "4 hours"
        },
        "respondedAt": "2026-04-08T15:30:00.000Z"
      }
    ],
    "createdAt": "2026-04-08T12:00:00.000Z",
    "updatedAt": "2026-04-08T15:30:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**CRITICAL -- Buyer-side blind matching:**
- Dealer responses use `dealerAlias` ("Dealer A", "Dealer B", etc.) -- NOT real names
- `dealerMetrics` are shown (rating, order count, delivery reliability) because they are non-identifying aggregate stats
- Dealer `phone`, `email`, `businessName`, `gstNumber`, `address`: NEVER included
- `dealerId`: NEVER included in the response body

**Response 200 (Dealer view -- REDACTED):**

```json
{
  "success": true,
  "data": {
    "id": "inq_abc123",
    "inquiryNumber": "HUB-INQ-2026-0042",
    "productName": "Havells MCB 32A Single Pole",
    "modelNumber": "DHN1C032",
    "quantity": 500,
    "deliveryCity": "Sri Ganganagar",
    "urgency": "normal",
    "notes": "Need ISI marked. Delivery within 10 days.",
    "category": { "id": "cat_mcb", "name": "MCBs" },
    "identifiedBrand": { "id": "brand_havells", "name": "Havells" },
    "myResponse": {
      "id": "resp_001",
      "status": "pending",
      "quotedPrice": null,
      "shippingCost": null,
      "totalPrice": null,
      "estimatedDelivery": null,
      "notes": null,
      "respondedAt": null
    },
    "createdAt": "2026-04-08T12:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**CRITICAL -- Dealer-side blind matching:**
- Buyer `name`, `phone`, `email`: NEVER included
- `budgetMax`: NEVER shown to dealer
- `dealerResponses` (other dealers' quotes): NEVER included -- dealer sees ONLY `myResponse`
- `pipeline.aiAnalysis`: NOT included (internal intelligence)

**Response 403 (wrong role / not matched):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this inquiry"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.5.4 PUT /inquiries/:id

Update an inquiry. Buyer only. Only allowed when status is `new` (no dealer responses yet).

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer, owner only) |
| Rate Limit | MODERATE (30/min) |

**Request Body:** Same fields as `POST /inquiries`, all optional. At least one field required.

**Response 200:** Updated inquiry object (buyer view).

**Response 422 (inquiry has quotes):**

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Cannot edit an inquiry that already has dealer responses. Create a new inquiry instead."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.5.5 DELETE /inquiries/:id

Cancel an inquiry. Buyer only. Allowed only if no quotes have been submitted. If quotes exist, use the close flow instead.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer, owner only) |
| Rate Limit | MODERATE (30/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Inquiry cancelled successfully",
    "id": "inq_abc123",
    "status": "closed"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Server behavior: sets status to `closed`, notifies matched dealers that the inquiry was withdrawn, logs `PRODUCT_INQUIRY_CANCELLED` activity.

**Response 422 (has quotes):**

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Cannot cancel an inquiry with existing quotes. Contact support if you need to resolve this."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.5.6 GET /inquiries/:id/quotes

List all quotes for an inquiry. Buyer sees anonymized dealer quotes. Dealer sees only their own quote.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer: own inquiry; dealer: own quote) |
| Rate Limit | STANDARD (60/min) |

**Response 200 (Buyer):**

```json
{
  "success": true,
  "data": [
    {
      "id": "resp_001",
      "dealerAlias": "Dealer A",
      "status": "quoted",
      "quotedPrice": 172,
      "shippingCost": 200,
      "totalPrice": 86200,
      "estimatedDelivery": "3-5 business days",
      "notes": "In stock. Can deliver immediately.",
      "dealerMetrics": {
        "rating": 4.7,
        "totalOrders": 120,
        "onTimeDelivery": 95,
        "avgResponseTime": "2 hours",
        "memberSince": "2026-01-15"
      },
      "respondedAt": "2026-04-08T14:00:00.000Z",
      "rank": 1,
      "savingsVsMrp": 39.6
    },
    {
      "id": "resp_002",
      "dealerAlias": "Dealer B",
      "status": "quoted",
      "quotedPrice": 185,
      "shippingCost": 0,
      "totalPrice": 92500,
      "estimatedDelivery": "1-2 business days",
      "notes": "Pickup available.",
      "dealerMetrics": {
        "rating": 4.3,
        "totalOrders": 45,
        "onTimeDelivery": 88,
        "avgResponseTime": "4 hours",
        "memberSince": "2026-02-20"
      },
      "respondedAt": "2026-04-08T15:30:00.000Z",
      "rank": 2,
      "savingsVsMrp": 35.1
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Buyer view enforcements:**
- `dealerAlias` replaces real dealer name/business name
- No `dealerId`, `dealerPhone`, `dealerEmail`, `dealerGst`, `dealerAddress`
- `dealerMetrics` are non-identifying aggregate stats
- `rank` is computed by the evaluation algorithm (see SS13.5.10)
- `savingsVsMrp` is percentage savings compared to product MRP

**Response 200 (Dealer -- own quote only):**

```json
{
  "success": true,
  "data": [
    {
      "id": "resp_001",
      "status": "quoted",
      "quotedPrice": 172,
      "shippingCost": 200,
      "totalPrice": 86200,
      "estimatedDelivery": "3-5 business days",
      "notes": "In stock. Can deliver immediately.",
      "respondedAt": "2026-04-08T14:00:00.000Z"
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Dealer sees only their own quote. No other dealer quotes. No rank information.

---

### 13.5.7 POST /inquiries/:id/quotes

Submit a quote for an inquiry. Dealer only. One quote per dealer per inquiry.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer, must be matched to inquiry) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  quotedPrice: number;           // per-unit price in INR, min: 0.01
  shippingCost: number;          // total shipping in INR, min: 0
  estimatedDelivery: string;     // min: 1, max: 100, e.g. "3-5 business days"
  notes?: string;                // max: 1000, optional notes
  validUntilDays?: number;       // quote validity in days, default: 7, min: 1, max: 30
}
```

**Zod Schema:**

```typescript
const submitQuoteSchema = z.object({
  quotedPrice: z.number().positive('Price must be positive').max(10000000, 'Price exceeds maximum'),
  shippingCost: z.number().min(0, 'Shipping cost cannot be negative').max(1000000),
  estimatedDelivery: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(1000).optional(),
  validUntilDays: z.number().int().min(1).max(30).optional().default(7),
});
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "resp_003",
    "inquiryId": "inq_abc123",
    "status": "quoted",
    "quotedPrice": 168,
    "shippingCost": 150,
    "totalPrice": 84150,
    "estimatedDelivery": "2-4 business days",
    "notes": "Genuine Havells stock. Can provide GST invoice.",
    "validUntil": "2026-04-15T12:00:00.000Z",
    "respondedAt": "2026-04-08T16:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Server-side behavior:**
1. Validate that dealer is matched to this inquiry (has an `InquiryDealerResponse` record)
2. Validate that no quote exists yet for this dealer+inquiry combo
3. Compute `totalPrice = quotedPrice * quantity + shippingCost`
4. Update `InquiryDealerResponse` status from `pending` to `quoted`
5. If inquiry status is `new` or `contacted`, update to `quoted`
6. Notify buyer (in-app + email/WhatsApp): "You received a new quote for your inquiry"
7. Log `QUOTE_SUBMITTED` activity

**Response 409 (already quoted):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "You have already submitted a quote for this inquiry. Use PUT to update."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 403 (not matched):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not matched to this inquiry"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.5.8 PUT /inquiries/:id/quotes/:quoteId

Update a previously submitted quote. Dealer only. Allowed only before inquiry is closed or a quote is selected.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer, quote owner) |
| Rate Limit | MODERATE (30/min) |

**Request Body:** Same as `POST /inquiries/:id/quotes`, all fields optional. At least one field required.

**Response 200:** Updated quote object.

**Response 422 (inquiry closed/quote selected):**

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Cannot update quote. A quote has already been selected for this inquiry."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.5.9 POST /inquiries/:id/select/:quoteId

**THE IDENTITY REVEAL MOMENT.** Buyer selects a winning quote. This transitions the inquiry to the next phase and reveals identities to both buyer and dealer.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer, inquiry owner) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  message?: string;       // optional message to the winning dealer (max: 500)
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "inquiryId": "inq_abc123",
    "status": "closed",
    "selectedQuote": {
      "id": "resp_001",
      "quotedPrice": 172,
      "shippingCost": 200,
      "totalPrice": 86200,
      "estimatedDelivery": "3-5 business days"
    },
    "dealer": {
      "id": "dlr_xyz789",
      "businessName": "Sharma Electrical Supplies",
      "ownerName": "Vikram Sharma",
      "phone": "9876543210",
      "email": "vikram@sharmaelectrical.com",
      "gstNumber": "08AADCS1234E1ZP",
      "address": "45, Main Market, Sri Ganganagar",
      "rating": 4.7,
      "verificationStatus": "VERIFIED"
    },
    "buyer": {
      "id": "usr_a1b2c3d4e5f6",
      "name": "Rahul Sharma",
      "phone": "9876543210",
      "email": "rahul@example.com"
    },
    "conversationId": "conv_new123",
    "message": "Your contact details have been shared with the dealer. You can now communicate directly via the Messages tab."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Server-side behavior:**
1. Validate inquiry belongs to buyer
2. Validate quote exists and belongs to this inquiry
3. Update inquiry status to `closed`
4. Update selected quote status to `SELECTED`
5. Update all other quotes status to `REJECTED`
6. **REVEAL IDENTITIES:**
   - Create a `Conversation` between buyer and dealer (contextType: `inquiry`, contextId: inquiry ID)
   - Create `ConversationParticipant` records for both
   - Send system message: "Quote selected! You can now discuss delivery details."
7. Notify dealer (in-app + WhatsApp + SMS): "Your quote was selected! Buyer details revealed."
8. Notify losing dealers: "Another dealer was selected for this inquiry."
9. Log `QUOTE_SELECTED` activity
10. If applicable, create corresponding `RFQ` and `Quote` records for the order tracking pipeline

**Response 422 (inquiry not in quotable state):**

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "No quotes available for selection. Inquiry must have at least one dealer quote."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.5.10 GET /inquiries/:id/evaluation

Get AI-powered evaluation and ranking of quotes for an inquiry. Buyer only.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer, inquiry owner) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "inquiryId": "inq_abc123",
    "evaluatedAt": "2026-04-08T16:05:00.000Z",
    "ranking": [
      {
        "quoteId": "resp_001",
        "dealerAlias": "Dealer A",
        "rank": 1,
        "overallScore": 92,
        "breakdown": {
          "priceScore": 95,
          "deliveryScore": 85,
          "dealerReliabilityScore": 94,
          "valueScore": 90
        },
        "strengths": ["Lowest per-unit price", "Excellent dealer rating (4.7)", "95% on-time delivery"],
        "weaknesses": ["Rs 200 shipping cost"],
        "recommendation": "Best overall value. Strong price and highly reliable dealer."
      },
      {
        "quoteId": "resp_002",
        "dealerAlias": "Dealer B",
        "rank": 2,
        "overallScore": 78,
        "breakdown": {
          "priceScore": 72,
          "deliveryScore": 95,
          "dealerReliabilityScore": 76,
          "valueScore": 80
        },
        "strengths": ["Free shipping", "Fastest delivery (1-2 days)"],
        "weaknesses": ["Higher per-unit price (+7.6%)", "Lower dealer rating (4.3)"],
        "recommendation": "Choose if delivery speed is the top priority."
      }
    ],
    "savingsSummary": {
      "mrpTotal": 142500,
      "bestQuoteTotal": 86200,
      "savingsAmount": 56300,
      "savingsPercent": 39.5,
      "averageMarketPrice": 95000
    },
    "aiInsight": "Based on current market data, the best quote (Rs 172/unit) is 7% below the average dealer price for Havells MCB 32A in Rajasthan. This is a strong deal. The price has been trending upward over the past 3 months, so acting soon is advisable."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Scoring algorithm (weights defined in config, adjustable by admin):**

| Factor | Weight | Source |
|--------|--------|--------|
| Price (lower is better) | 40% | `quotedPrice * quantity + shippingCost` normalized against all quotes |
| Delivery speed (faster is better) | 25% | Parsed from `estimatedDelivery` string |
| Dealer reliability (higher is better) | 20% | Composite of `rating`, `onTimeDelivery`, `totalOrders` |
| Value (price vs. market price) | 15% | `quotedPrice` vs. `estimatedDealerPrice` from product data |

---

### 13.5.11 POST /inquiries/from-boq

Create multiple inquiries from a Bill of Quantities. Buyer only.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  boqId: string;                // BOQ ID from AI generation
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    include: boolean;           // user can deselect items
  }>;
  deliveryCity: string;
  deliveryPincode?: string;
  urgency?: 'normal' | 'urgent';
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "createdInquiries": [
      { "id": "inq_001", "inquiryNumber": "HUB-INQ-2026-0043", "productName": "Havells MCB 32A SP", "quantity": 20 },
      { "id": "inq_002", "inquiryNumber": "HUB-INQ-2026-0044", "productName": "Polycab FRLS 2.5mm 90m", "quantity": 10 },
      { "id": "inq_003", "inquiryNumber": "HUB-INQ-2026-0045", "productName": "Legrand Mylinc 6A Socket", "quantity": 40 }
    ],
    "totalItems": 3,
    "skippedItems": 1
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.6 RFQ APIs

RFQs are multi-item procurement requests with structured quoting. Unlike single-product inquiries, an RFQ bundles multiple products and requires per-item pricing from dealers.

### 13.6.1 POST /rfqs

Create a new RFQ (Request for Quotation).

| Property | Value |
|----------|-------|
| Auth | Authenticated (user) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  title: string;                // min: 5, max: 200
  description?: string;         // max: 2000
  items: Array<{
    productId: string;          // Product UUID from catalog
    quantity: number;           // min: 1, max: 100000
    notes?: string;             // max: 500, per-item notes
  }>;
  deliveryCity: string;         // min: 2, max: 100
  deliveryPincode: string;      // 6 digits
  deliveryAddress?: string;     // max: 500
  deliveryPreference: 'delivery' | 'pickup' | 'both';
  estimatedDate?: string;       // ISO date, must be future
  urgency?: 'normal' | 'urgent';
}
```

**Zod Schema:**

```typescript
const createRfqSchema = z.object({
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().max(2000).optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100000),
    notes: z.string().trim().max(500).optional(),
  })).min(1, 'At least one item required').max(50, 'Maximum 50 items per RFQ'),
  deliveryCity: z.string().trim().min(2).max(100),
  deliveryPincode: z.string().regex(/^\d{6}$/),
  deliveryAddress: z.string().trim().max(500).optional(),
  deliveryPreference: z.enum(['delivery', 'pickup', 'both']),
  estimatedDate: z.string().datetime().optional().refine(
    (date) => !date || new Date(date) > new Date(),
    { message: 'Estimated date must be in the future' }
  ),
  urgency: z.enum(['normal', 'urgent']).optional().default('normal'),
});
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "rfq_abc123",
    "title": "Electrical supplies for 3BHK flat",
    "status": "DRAFT",
    "itemCount": 5,
    "deliveryCity": "Jaipur",
    "deliveryPreference": "delivery",
    "createdAt": "2026-04-08T12:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

RFQ is created in `DRAFT` status. User must explicitly publish it (see 13.6.3).

---

### 13.6.2 GET /rfqs

List RFQs. User sees own RFQs. Dealer sees published RFQs matched to their inventory/zone.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Items per page |
| `status` | string | -- | Filter by RFQStatus: `DRAFT`, `PUBLISHED`, `QUOTES_RECEIVED`, `DEALER_SELECTED`, `COMPLETED`, `CANCELLED` |
| `sortBy` | string | `createdAt` | `createdAt`, `updatedAt`, `status` |
| `sortOrder` | string | `desc` | `asc`, `desc` |

**Response 200 (User view):**

```json
{
  "success": true,
  "data": [
    {
      "id": "rfq_abc123",
      "title": "Electrical supplies for 3BHK flat",
      "status": "PUBLISHED",
      "itemCount": 5,
      "deliveryCity": "Jaipur",
      "quoteCount": 3,
      "lowestQuoteTotal": 45200,
      "publishedAt": "2026-04-08T13:00:00.000Z",
      "createdAt": "2026-04-08T12:00:00.000Z"
    }
  ],
  "pagination": { "total": 1, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 200 (Dealer view -- only PUBLISHED RFQs in their service zone):**

```json
{
  "success": true,
  "data": [
    {
      "id": "rfq_abc123",
      "title": "Electrical supplies for 3BHK flat",
      "status": "PUBLISHED",
      "itemCount": 5,
      "deliveryCity": "Jaipur",
      "deliveryPreference": "delivery",
      "urgency": "normal",
      "estimatedDate": "2026-04-20T00:00:00.000Z",
      "hasMyQuote": false,
      "publishedAt": "2026-04-08T13:00:00.000Z",
      "items": [
        { "productName": "Havells MCB 32A SP", "quantity": 20 },
        { "productName": "Polycab FRLS 2.5mm 90m coil", "quantity": 10 }
      ]
    }
  ],
  "pagination": { "total": 8, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Blind matching enforcement (Dealer view):** Buyer name, phone, email, exact address: NEVER included.

---

### 13.6.3 POST /rfqs/:id/publish

Publish a draft RFQ, making it visible to matched dealers.

| Property | Value |
|----------|-------|
| Auth | Authenticated (user, RFQ owner) |
| Rate Limit | MODERATE (30/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "rfq_abc123",
    "status": "PUBLISHED",
    "publishedAt": "2026-04-08T13:00:00.000Z",
    "matchedDealerCount": 12,
    "message": "Your RFQ is now live. Matched dealers will be notified."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 422 (empty items / invalid status):**

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "RFQ must have at least one item and be in DRAFT status to publish."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.6.4 GET /rfqs/:id

Get RFQ detail. User sees full detail with all quotes. Dealer sees RFQ items and own quote only.

| Property | Value |
|----------|-------|
| Auth | Authenticated (user: owner; dealer: if RFQ is PUBLISHED and in their zone) |
| Rate Limit | STANDARD (60/min) |

Response follows the same blind matching pattern as inquiry detail (see SS13.5.3).

---

### 13.6.5 POST /rfqs/:id/quotes

Submit a quote for an RFQ. Dealer only.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  items: Array<{
    rfqItemId: string;           // RFQItem UUID
    unitPrice: number;           // per-unit price in INR, min: 0.01
    quantity: number;            // must match or be <= RFQItem quantity
    available: boolean;          // false if dealer cannot supply this item
  }>;
  shippingCost: number;          // total shipping, min: 0
  deliveryDate?: string;         // ISO date, estimated delivery
  pickupDate?: string;           // ISO date, if pickup available
  notes?: string;                // max: 1000
  validUntil: string;            // ISO date, quote validity (max 30 days)
}
```

**Zod Schema:**

```typescript
const submitRfqQuoteSchema = z.object({
  items: z.array(z.object({
    rfqItemId: z.string().uuid(),
    unitPrice: z.number().positive().max(10000000),
    quantity: z.number().int().min(1).max(100000),
    available: z.boolean(),
  })).min(1, 'At least one item required'),
  shippingCost: z.number().min(0).max(1000000),
  deliveryDate: z.string().datetime().optional(),
  pickupDate: z.string().datetime().optional(),
  notes: z.string().trim().max(1000).optional(),
  validUntil: z.string().datetime().refine(
    (date) => new Date(date) > new Date() && new Date(date) <= new Date(Date.now() + 30 * 86400000),
    { message: 'Valid until must be between now and 30 days from now' }
  ),
});
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "quote_xyz789",
    "rfqId": "rfq_abc123",
    "totalAmount": 45200,
    "shippingCost": 500,
    "status": "SUBMITTED",
    "itemCount": 5,
    "availableItemCount": 4,
    "validUntil": "2026-04-18T12:00:00.000Z",
    "submittedAt": "2026-04-08T16:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.6.6 POST /rfqs/:id/select/:quoteId

Select a winning quote. Identity reveal moment (same pattern as SS13.5.9).

| Property | Value |
|----------|-------|
| Auth | Authenticated (user, RFQ owner) |
| Rate Limit | MODERATE (30/min) |

Response and behavior identical to `POST /inquiries/:id/select/:quoteId` -- reveals identities, creates conversation, notifies all parties.

---

### 13.6.7 DELETE /rfqs/:id

Cancel an RFQ. Only allowed for DRAFT or PUBLISHED status.

| Property | Value |
|----------|-------|
| Auth | Authenticated (user, RFQ owner) |
| Rate Limit | MODERATE (30/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "rfq_abc123",
    "status": "CANCELLED",
    "message": "RFQ cancelled successfully"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.7 Order APIs

Orders are created after a buyer selects a quote (either from inquiry or RFQ). The order tracks fulfillment, delivery, and dispute resolution.

### 13.7.1 GET /orders

List orders for the authenticated user or dealer.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Items per page |
| `status` | string | -- | `pending`, `confirmed`, `shipped`, `delivered`, `completed`, `disputed`, `cancelled` |
| `sortBy` | string | `createdAt` | `createdAt`, `status`, `totalAmount` |
| `sortOrder` | string | `desc` | `asc`, `desc` |

**Response 200 (Buyer):**

```json
{
  "success": true,
  "data": [
    {
      "id": "ord_abc123",
      "orderNumber": "HUB-ORD-2026-0001",
      "status": "shipped",
      "dealer": {
        "id": "dlr_xyz789",
        "businessName": "Sharma Electrical Supplies",
        "phone": "9876543210"
      },
      "itemCount": 5,
      "totalAmount": 86200,
      "paymentStatus": "completed",
      "estimatedDelivery": "2026-04-12",
      "sourceType": "inquiry",
      "sourceId": "inq_abc123",
      "createdAt": "2026-04-08T17:00:00.000Z"
    }
  ],
  "pagination": { "total": 1, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Note: After quote selection, identities are revealed -- order responses include full dealer/buyer details.

---

### 13.7.2 GET /orders/:id

Full order detail with tracking, items, payment status, and conversation link.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer or dealer for this order) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "ord_abc123",
    "orderNumber": "HUB-ORD-2026-0001",
    "status": "shipped",
    "buyer": {
      "id": "usr_a1b2c3d4e5f6",
      "name": "Rahul Sharma",
      "phone": "9876543210",
      "email": "rahul@example.com"
    },
    "dealer": {
      "id": "dlr_xyz789",
      "businessName": "Sharma Electrical Supplies",
      "ownerName": "Vikram Sharma",
      "phone": "9876543210",
      "gstNumber": "08AADCS1234E1ZP"
    },
    "items": [
      {
        "productId": "prod_havells_mcb_32a",
        "productName": "Havells MCB 32A Single Pole",
        "quantity": 500,
        "unitPrice": 172,
        "totalPrice": 86000
      }
    ],
    "shippingCost": 200,
    "subtotal": 86000,
    "totalAmount": 86200,
    "payment": {
      "status": "COMPLETED",
      "method": "upi",
      "paidAt": "2026-04-08T17:05:00.000Z",
      "razorpayPaymentId": "pay_abc123"
    },
    "delivery": {
      "address": "8-D-12, Jawahar Nagar, Sri Ganganagar, 335001",
      "estimatedDate": "2026-04-12",
      "trackingNumber": "DL123456789",
      "trackingUrl": "https://www.delhivery.com/track/DL123456789",
      "status": "in_transit",
      "statusHistory": [
        { "status": "order_placed", "timestamp": "2026-04-08T17:00:00.000Z" },
        { "status": "confirmed", "timestamp": "2026-04-08T18:00:00.000Z" },
        { "status": "shipped", "timestamp": "2026-04-09T10:00:00.000Z", "note": "Dispatched from Jodhpur warehouse" },
        { "status": "in_transit", "timestamp": "2026-04-10T08:00:00.000Z" }
      ]
    },
    "conversationId": "conv_new123",
    "sourceType": "inquiry",
    "sourceId": "inq_abc123",
    "invoiceUrl": "https://cdn.hub4estate.com/invoices/HUB-ORD-2026-0001.pdf",
    "createdAt": "2026-04-08T17:00:00.000Z",
    "updatedAt": "2026-04-10T08:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.7.3 PUT /orders/:id/status

Update order status. Dealer can update to `confirmed`, `shipped`, `delivered`. Buyer can confirm delivery.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer for order) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  status: 'confirmed' | 'shipped' | 'delivered';
  note?: string;                 // max: 500
  trackingNumber?: string;       // required when status = 'shipped'
  trackingUrl?: string;          // optional tracking URL
}
```

**Zod Schema:**

```typescript
const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'shipped', 'delivered']),
  note: z.string().trim().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
  trackingUrl: z.string().url().optional(),
}).refine(
  (data) => data.status !== 'shipped' || !!data.trackingNumber,
  { message: 'Tracking number is required when marking as shipped', path: ['trackingNumber'] }
);
```

**Response 200:** Updated order object.

---

### 13.7.4 POST /orders/:id/confirm-delivery

Buyer confirms that delivery was received. Triggers escrow release if payment was escrowed.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer, order owner) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  rating?: number;               // 1-5 star rating for the overall experience
  condition: 'good' | 'damaged' | 'partial';
  notes?: string;                // max: 1000
  photos?: string[];             // S3 keys, max 5 photos (for damage evidence)
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "orderId": "ord_abc123",
    "status": "completed",
    "deliveryConfirmedAt": "2026-04-12T10:00:00.000Z",
    "escrowStatus": "released",
    "message": "Delivery confirmed. Payment has been released to the dealer."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

If `condition` is `damaged` or `partial`, the order transitions to dispute flow instead of completion.

---

### 13.7.5 POST /orders/:id/dispute

Raise a dispute on an order.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer or dealer for this order) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  reason: 'damaged' | 'wrong_product' | 'missing_items' | 'quality_issue' | 'delivery_delay' | 'pricing_dispute' | 'other';
  description: string;           // min: 20, max: 2000
  photos?: string[];             // S3 keys, max 10 photos
  expectedResolution: 'full_refund' | 'partial_refund' | 'replacement' | 'credit';
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "disputeId": "dsp_abc123",
    "orderId": "ord_abc123",
    "status": "open",
    "reason": "damaged",
    "expectedResolution": "replacement",
    "assignedTo": null,
    "createdAt": "2026-04-12T10:30:00.000Z",
    "message": "Dispute raised. Our team will review within 24 hours."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Server: freezes escrow, notifies admin, creates audit log entry.

---

### 13.7.6 GET /orders/:id/invoice

Download the GST-compliant invoice PDF for an order.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer or dealer for this order) |
| Rate Limit | STANDARD (60/min) |
| Content-Type | `application/pdf` |

**Response 200:** Binary PDF file with `Content-Disposition: attachment; filename="HUB-ORD-2026-0001.pdf"`.

**Response 404:** Invoice not yet generated (order must be in `confirmed` or later status).

---

### 13.7.7 POST /orders/:id/review

Submit a review for a completed order.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer, order owner) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  rating: number;               // 1-5, integer
  title?: string;               // max: 100
  body?: string;                // max: 2000
  photos?: string[];            // S3 keys, max 5
  dealerRating: number;         // 1-5, separate from product rating
  deliveryRating: number;       // 1-5
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "reviewId": "rev_abc123",
    "orderId": "ord_abc123",
    "rating": 5,
    "dealerRating": 5,
    "deliveryRating": 4,
    "createdAt": "2026-04-13T10:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.8 Payment APIs

### 13.8.1 POST /payments/create-order

Create a Razorpay order for payment (subscription, lead pack, or escrow).

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  amountPaisa: number;           // Amount in paisa, min: 100 (Rs 1)
  paymentFor: 'subscription' | 'lead_pack' | 'transaction_fee' | 'escrow';
  referenceId: string;           // Subscription ID, RFQ ID, Order ID
  referenceType: string;         // Matching type
  description: string;           // max: 200, shown on Razorpay checkout
  currency?: string;             // default: INR
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "paymentId": "pay_internal_abc123",
    "razorpayOrderId": "order_abc123def456",
    "amountPaisa": 99900,
    "currency": "INR",
    "description": "Hub4Estate Dealer Starter Plan - Monthly",
    "razorpayKeyId": "rzp_live_abc123",
    "prefill": {
      "name": "Vikram Sharma",
      "email": "vikram@sharmaelectrical.com",
      "contact": "9876543210"
    }
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

The frontend uses `razorpayOrderId` and `razorpayKeyId` to open the Razorpay checkout modal.

---

### 13.8.2 POST /payments/verify

Verify Razorpay payment signature after successful checkout.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "paymentId": "pay_internal_abc123",
    "status": "COMPLETED",
    "amountPaisa": 99900,
    "method": "upi",
    "paidAt": "2026-04-08T17:05:00.000Z",
    "invoiceNumber": "H4E-INV-2026-0001",
    "invoiceUrl": "https://cdn.hub4estate.com/invoices/H4E-INV-2026-0001.pdf"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Server verifies signature using `HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, razorpayKeySecret)`. On match: update payment status, generate invoice, activate subscription/credits, log activity.

**Response 400 (invalid signature):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Payment verification failed. Signature mismatch."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.8.3 POST /payments/webhook

Handle Razorpay webhook events. Server-to-server only.

| Property | Value |
|----------|-------|
| Auth | Razorpay webhook signature verification |
| Rate Limit | WEBHOOK (100/min) |

**Headers Required:**

| Header | Value |
|--------|-------|
| `X-Razorpay-Signature` | HMAC-SHA256 signature |

**Request Body:** Raw Razorpay event payload.

**Handled Events:**

| Event | Action |
|-------|--------|
| `payment.captured` | Update payment to COMPLETED, activate services |
| `payment.failed` | Update payment to FAILED, notify user |
| `refund.processed` | Update payment to REFUNDED, log refund |
| `subscription.activated` | Activate dealer subscription |
| `subscription.cancelled` | Cancel dealer subscription |
| `subscription.charged` | Record recurring payment |

**Response 200 (always -- to acknowledge receipt):**

```json
{ "status": "ok" }
```

---

### 13.8.4 GET /payments/escrow/:orderId

Get escrow status for an order.

| Property | Value |
|----------|-------|
| Auth | Authenticated (buyer or dealer for order) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "orderId": "ord_abc123",
    "escrowStatus": "held",
    "amountPaisa": 8620000,
    "heldAt": "2026-04-08T17:05:00.000Z",
    "releaseCondition": "Buyer confirms delivery",
    "autoReleaseAt": "2026-04-22T17:05:00.000Z",
    "message": "Funds are held securely. They will be released when the buyer confirms delivery, or automatically after 14 days."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.8.5 POST /payments/escrow/:orderId/release

Manually release escrow. Admin only.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  reason: string;               // min: 10, max: 500
  releaseAmount?: number;       // partial release in paisa, default: full amount
}
```

**Response 200:** Escrow release confirmation.

---

### 13.8.6 POST /payments/refund

Initiate a refund.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  paymentId: string;             // Internal payment ID
  amountPaisa: number;           // Refund amount, must be <= original amount
  reason: string;                // min: 10, max: 500
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "refundId": "rfnd_abc123",
    "paymentId": "pay_internal_abc123",
    "amountPaisa": 8620000,
    "status": "processing",
    "estimatedCompletionDays": 5,
    "message": "Refund initiated. Expected to complete within 5-7 business days."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.8.7 GET /payments/history

Get payment history for authenticated user/dealer.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:** Standard pagination + `status` filter, `paymentFor` filter, `dateFrom`, `dateTo`.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pay_internal_abc123",
      "amountPaisa": 99900,
      "currency": "INR",
      "description": "Dealer Starter Plan - Monthly",
      "paymentFor": "subscription",
      "status": "COMPLETED",
      "method": "upi",
      "paidAt": "2026-04-08T17:05:00.000Z",
      "invoiceNumber": "H4E-INV-2026-0001",
      "invoiceUrl": "https://cdn.hub4estate.com/invoices/H4E-INV-2026-0001.pdf"
    }
  ],
  "pagination": { "total": 5, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.9 Dealer APIs

### 13.9.1 POST /dealers/register

Register as a dealer. Creates a dealer account and starts the KYC process.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | STRICT (5/min) |

**Request Body:**

```typescript
{
  ownerName: string;             // min: 2, max: 100
  businessName: string;          // min: 2, max: 200
  email: string;                 // valid email
  phone: string;                 // 10 digits, Indian format
  password: string;              // min: 8, uppercase + lowercase + digit
  dealerType: DealerType;        // RETAILER, DISTRIBUTOR, etc.
  city: string;                  // min: 2, max: 100
  state: string;                 // valid Indian state
  pincode: string;               // 6 digits
  gstNumber?: string;            // regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "dealer": {
      "id": "dlr_xyz789",
      "ownerName": "Vikram Sharma",
      "businessName": "Sharma Electrical Supplies",
      "status": "PENDING_VERIFICATION",
      "kycStatus": "DOCUMENTS_PENDING"
    },
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "nextStep": "Upload KYC documents at /dealer/onboarding"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.9.2 POST /dealers/kyc

Submit KYC documents for verification.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | MODERATE (30/min) |
| Content-Type | `multipart/form-data` |

**Request Body (multipart):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `gstCertificate` | File | Yes | PDF/JPEG/PNG, max 10MB |
| `panCard` | File | Yes | PDF/JPEG/PNG, max 5MB |
| `tradeLicense` | File | No | PDF/JPEG/PNG, max 10MB |
| `shopPhoto` | File | No | JPEG/PNG, max 10MB |
| `addressProof` | File | No | PDF/JPEG/PNG, max 10MB |
| `gstNumber` | string | Yes | Valid GST format |
| `panNumber` | string | Yes | Valid PAN format: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "kycStatus": "UNDER_REVIEW",
    "documentsUploaded": ["gstCertificate", "panCard", "shopPhoto"],
    "estimatedVerificationDays": 2,
    "message": "Documents submitted for verification. You will be notified within 48 hours."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.9.3 GET /dealers/kyc/status

Get current KYC verification status.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "status": "UNDER_REVIEW",
    "documents": [
      { "type": "gstCertificate", "status": "uploaded", "uploadedAt": "2026-04-08T12:00:00.000Z" },
      { "type": "panCard", "status": "verified", "verifiedAt": "2026-04-09T10:00:00.000Z" },
      { "type": "tradeLicense", "status": "not_uploaded" }
    ],
    "rejectionReason": null,
    "submittedAt": "2026-04-08T12:00:00.000Z",
    "estimatedCompletionAt": "2026-04-10T12:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.9.4 GET /dealers/dashboard

Get dealer dashboard summary data.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "profile": {
      "businessName": "Sharma Electrical Supplies",
      "status": "VERIFIED",
      "tier": "silver",
      "rating": 4.7,
      "memberSince": "2026-01-15"
    },
    "stats": {
      "activeInquiries": 5,
      "pendingQuotes": 3,
      "activeOrders": 2,
      "completedOrders": 45,
      "totalRevenue": 1250000,
      "monthlyRevenue": 180000,
      "quoteWinRate": 38,
      "avgResponseTime": "2.5 hours"
    },
    "recentActivity": [
      { "type": "inquiry_matched", "message": "New inquiry: 200x Philips 15W LED Panels", "time": "2 hours ago" },
      { "type": "quote_selected", "message": "Your quote was selected for RFQ #42", "time": "1 day ago" }
    ],
    "subscription": {
      "plan": "starter",
      "status": "ACTIVE",
      "expiresAt": "2026-05-08T00:00:00.000Z",
      "quotesRemaining": 15,
      "quotesLimit": 25
    },
    "alerts": [
      { "type": "warning", "message": "3 inquiries pending your response" },
      { "type": "info", "message": "Upgrade to Growth plan for unlimited quotes" }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.9.5 GET /dealers/inventory

List dealer's inventory.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Items per page |
| `brand` | string | -- | Filter by brand |
| `category` | string | -- | Filter by category |
| `inStock` | boolean | -- | Filter in-stock items only |
| `search` | string | -- | Search product name |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "inv_abc123",
      "product": {
        "id": "prod_havells_mcb_32a",
        "name": "Havells MCB 32A SP",
        "brand": "Havells",
        "category": "MCBs"
      },
      "quantity": 200,
      "dealerPrice": 172,
      "mrp": 285,
      "margin": 39.6,
      "inStock": true,
      "lastUpdated": "2026-04-07T10:00:00.000Z"
    }
  ],
  "pagination": { "total": 85, "page": 1, "pageSize": 20, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.9.6 POST /dealers/inventory

Add inventory item.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  productId: string;             // Product UUID from catalog
  quantity: number;              // min: 0
  dealerPrice: number;           // min: 0.01
}
```

**Response 201:** Created inventory item.

---

### 13.9.7 PUT /dealers/inventory/:id

Update inventory quantity or price.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer, owner) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  quantity?: number;             // min: 0
  dealerPrice?: number;          // min: 0.01
}
```

**Response 200:** Updated inventory item.

---

### 13.9.8 DELETE /dealers/inventory/:id

Remove an inventory item.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer, owner) |
| Rate Limit | MODERATE (30/min) |

**Response 200:** Confirmation message.

---

### 13.9.9 GET /dealers/analytics

Detailed dealer analytics.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `30d` | `7d`, `30d`, `90d`, `6m`, `1y` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "period": "30d",
    "revenue": {
      "total": 180000,
      "change": 12.5,
      "chart": [
        { "date": "2026-04-01", "value": 25000 },
        { "date": "2026-04-02", "value": 18000 }
      ]
    },
    "quotes": {
      "submitted": 25,
      "won": 10,
      "lost": 12,
      "pending": 3,
      "winRate": 40
    },
    "orders": {
      "total": 10,
      "completed": 8,
      "inProgress": 2,
      "disputed": 0
    },
    "performance": {
      "avgResponseTimeMinutes": 150,
      "onTimeDeliveryPercent": 95,
      "customerSatisfaction": 4.7,
      "repeatCustomerRate": 22
    },
    "topProducts": [
      { "name": "Havells MCB 32A SP", "orders": 5, "revenue": 86000 },
      { "name": "Polycab FRLS 2.5mm", "orders": 3, "revenue": 47000 }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.9.10 GET /dealers/subscription

Get current subscription details.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "plan": "starter",
    "status": "ACTIVE",
    "billingCycle": "monthly",
    "amountPaisa": 99900,
    "startedAt": "2026-04-08T00:00:00.000Z",
    "expiresAt": "2026-05-08T00:00:00.000Z",
    "autoRenew": true,
    "features": {
      "monthlyQuoteLimit": 25,
      "quotesUsed": 10,
      "prioritySupport": false,
      "analyticsAccess": "basic",
      "aiAssistantAccess": true,
      "featuredListing": false
    },
    "availablePlans": [
      {
        "plan": "growth",
        "amountPaisa": 249900,
        "billingCycle": "monthly",
        "features": {
          "monthlyQuoteLimit": 100,
          "prioritySupport": true,
          "analyticsAccess": "advanced",
          "aiAssistantAccess": true,
          "featuredListing": true
        }
      },
      {
        "plan": "premium",
        "amountPaisa": 499900,
        "billingCycle": "monthly",
        "features": {
          "monthlyQuoteLimit": -1,
          "prioritySupport": true,
          "analyticsAccess": "full",
          "aiAssistantAccess": true,
          "featuredListing": true,
          "whiteGloveOnboarding": true
        }
      }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.9.11 POST /dealers/subscription/upgrade

Upgrade dealer subscription plan. Triggers Razorpay payment flow.

| Property | Value |
|----------|-------|
| Auth | Authenticated (dealer) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  plan: 'starter' | 'growth' | 'premium';
  billingCycle: 'monthly' | 'yearly';
}
```

**Response 200:** Returns Razorpay order details (same shape as SS13.8.1).

---

### 13.9.12 GET /dealers/:id/public

Get a dealer's public profile. Only accessible after quote selection (identity revealed).

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "dlr_xyz789",
    "businessName": "Sharma Electrical Supplies",
    "ownerName": "Vikram Sharma",
    "dealerType": "DISTRIBUTOR",
    "city": "Sri Ganganagar",
    "state": "Rajasthan",
    "rating": 4.7,
    "reviewCount": 45,
    "completedOrders": 120,
    "onTimeDelivery": 95,
    "memberSince": "2026-01-15",
    "brands": ["Havells", "Polycab", "Schneider", "Legrand"],
    "categories": ["Switchgear", "Wires & Cables", "Lighting"],
    "verificationBadge": "VERIFIED",
    "tier": "silver"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

**Response 403 (no active transaction relationship):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Dealer profile is only visible after a quote is selected."
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.10 Messaging APIs

### 13.10.1 GET /messages/conversations

List conversations for the authenticated user.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Items per page |
| `archived` | boolean | false | Include archived conversations |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "conv_new123",
      "title": "Inquiry #HUB-INQ-2026-0042 Discussion",
      "contextType": "inquiry",
      "contextId": "inq_abc123",
      "participants": [
        { "name": "Rahul Sharma", "role": "buyer", "avatar": null },
        { "name": "Sharma Electrical", "role": "dealer", "avatar": null }
      ],
      "lastMessage": {
        "content": "When can you deliver?",
        "senderName": "Rahul Sharma",
        "sentAt": "2026-04-08T18:00:00.000Z"
      },
      "unreadCount": 2,
      "isArchived": false,
      "createdAt": "2026-04-08T17:00:00.000Z"
    }
  ],
  "pagination": { "total": 3, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.10.2 GET /messages/conversations/:id

Get messages in a conversation (paginated, newest first).

| Property | Value |
|----------|-------|
| Auth | Authenticated (participant only) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page (1 = newest messages) |
| `pageSize` | integer | 50 | Messages per page (max 100) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_new123",
      "title": "Inquiry #HUB-INQ-2026-0042 Discussion",
      "contextType": "inquiry",
      "contextId": "inq_abc123",
      "participants": [
        { "id": "usr_a1b2c3d4e5f6", "name": "Rahul Sharma", "role": "buyer", "avatar": null },
        { "id": "dlr_xyz789", "name": "Sharma Electrical", "role": "dealer", "avatar": null }
      ]
    },
    "messages": [
      {
        "id": "msg_003",
        "senderId": "usr_a1b2c3d4e5f6",
        "senderName": "Rahul Sharma",
        "content": "When can you deliver?",
        "type": "TEXT",
        "readBy": ["usr_a1b2c3d4e5f6"],
        "createdAt": "2026-04-08T18:00:00.000Z"
      },
      {
        "id": "msg_002",
        "senderId": "dlr_xyz789",
        "senderName": "Sharma Electrical",
        "content": "Thank you for selecting our quote! We have the full quantity in stock.",
        "type": "TEXT",
        "readBy": ["usr_a1b2c3d4e5f6", "dlr_xyz789"],
        "createdAt": "2026-04-08T17:30:00.000Z"
      },
      {
        "id": "msg_001",
        "senderId": null,
        "senderName": "System",
        "content": "Quote selected! You can now discuss delivery details directly.",
        "type": "SYSTEM",
        "readBy": ["usr_a1b2c3d4e5f6", "dlr_xyz789"],
        "createdAt": "2026-04-08T17:00:00.000Z"
      }
    ]
  },
  "pagination": { "total": 3, "page": 1, "pageSize": 50, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.10.3 POST /messages/conversations/:id/send

Send a message in a conversation.

| Property | Value |
|----------|-------|
| Auth | Authenticated (participant only) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  content: string;              // min: 1, max: 5000
  type?: 'TEXT' | 'IMAGE';      // default: TEXT
  imageUrl?: string;            // S3 key, required when type = IMAGE
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "msg_004",
    "conversationId": "conv_new123",
    "senderId": "dlr_xyz789",
    "senderName": "Sharma Electrical",
    "content": "We can deliver within 3 days. Shall I proceed?",
    "type": "TEXT",
    "createdAt": "2026-04-08T18:15:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Server: saves message, broadcasts via Socket.io to all participants in the conversation room, sends push/email notification to offline participants.

---

### 13.10.4 PUT /messages/conversations/:id/read

Mark all messages in a conversation as read.

| Property | Value |
|----------|-------|
| Auth | Authenticated (participant only) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": { "markedAsRead": 3 },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.10.5 GET /messages/unread-count

Get total unread message count across all conversations.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": { "unreadCount": 5 },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.11 Notification APIs

### 13.11.1 GET /notifications

List notifications for the authenticated user.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Items per page |
| `unreadOnly` | boolean | false | Filter to unread only |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "notif_abc123",
      "type": "quote_received",
      "title": "New quote received",
      "body": "You received a quote for Havells MCB 32A at Rs 172/unit",
      "icon": "message-circle",
      "actionUrl": "/dashboard/inquiries/inq_abc123",
      "isRead": false,
      "createdAt": "2026-04-08T14:00:00.000Z"
    },
    {
      "id": "notif_def456",
      "type": "inquiry_matched",
      "title": "New inquiry matched",
      "body": "A buyer needs 500x Havells MCBs in Sri Ganganagar",
      "icon": "shopping-bag",
      "actionUrl": "/dealer/inquiries/inq_abc123",
      "isRead": true,
      "createdAt": "2026-04-08T12:05:00.000Z"
    }
  ],
  "pagination": { "total": 15, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.11.2 PUT /notifications/:id/read

Mark a single notification as read.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": { "id": "notif_abc123", "isRead": true },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.11.3 PUT /notifications/read-all

Mark all notifications as read.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Response 200:**

```json
{
  "success": true,
  "data": { "markedAsRead": 8 },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.11.4 GET /notifications/unread-count

Get unread notification count (used for badge display).

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | RELAXED (120/min) |

**Response 200:**

```json
{
  "success": true,
  "data": { "unreadCount": 3 },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.12 AI APIs

### 13.12.1 POST /ai/chat

Send a message to Volt, Hub4Estate's AI procurement assistant.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  message: string;              // min: 1, max: 5000
  sessionId?: string;           // Resume existing session (UUID)
  context?: {
    currentProductId?: string;   // If user is on a product page
    currentCategoryId?: string;  // If user is browsing a category
    currentRfqId?: string;       // If user is building an RFQ
  };
}
```

**Response 200 (streaming via SSE):**

```
Content-Type: text/event-stream

data: {"type":"start","sessionId":"sess_abc123"}

data: {"type":"text","content":"Based on your 3BHK project, "}
data: {"type":"text","content":"you'll need approximately:"}
data: {"type":"tool_call","tool":"search_catalog","input":{"query":"MCB 32A","category":"switchgear"}}
data: {"type":"tool_result","tool":"search_catalog","result":{"products":[...]}}
data: {"type":"text","content":"\n\n1. **MCBs**: 12x Havells 32A SP (Rs 172-210 each)\n2. **RCCB**: 2x Havells 25A DP 30mA (Rs 1,600-1,850 each)"}
data: {"type":"suggestion","suggestions":["Generate full BOQ","Get quotes for these items","Compare MCB brands"]}
data: {"type":"done","tokenUsage":{"input":1200,"output":350},"sessionId":"sess_abc123"}
```

Non-streaming fallback (if `Accept: application/json`):

```json
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123",
    "response": "Based on your 3BHK project, you'll need approximately:\n\n1. **MCBs**: 12x Havells 32A SP...",
    "toolCalls": [
      { "tool": "search_catalog", "input": { "query": "MCB 32A" }, "output": { "products": [] } }
    ],
    "suggestions": ["Generate full BOQ", "Get quotes for these items"],
    "tokenUsage": { "input": 1200, "output": 350 }
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.12.2 POST /ai/slip-scan

Upload a dealer price slip (photo of handwritten or printed quote) for AI parsing.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |
| Content-Type | `multipart/form-data` |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `slip` | File | Yes | JPEG/PNG/PDF, max 10MB |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "extractedItems": [
      {
        "productName": "Havells MCB 32A SP",
        "quantity": 10,
        "unitPrice": 185,
        "totalPrice": 1850,
        "matchedProductId": "prod_havells_mcb_32a",
        "confidence": 0.92
      },
      {
        "productName": "Polycab FRLS 2.5mm 90m",
        "quantity": 5,
        "unitPrice": 2800,
        "totalPrice": 14000,
        "matchedProductId": "prod_polycab_frls_25",
        "confidence": 0.87
      }
    ],
    "totalAmount": 15850,
    "dealerName": "Sharma Electrical (detected)",
    "slipDate": "2026-04-05 (detected)",
    "rawText": "...",
    "actions": ["Create inquiry from these items", "Compare with catalog prices", "Save to procurement history"]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.12.3 POST /ai/boq/generate

Generate a Bill of Quantities from project description.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  projectType: 'residential_1bhk' | 'residential_2bhk' | 'residential_3bhk' | 'residential_4bhk' | 'commercial_office' | 'commercial_retail' | 'custom';
  description?: string;         // max: 2000, free text
  area?: number;                // sq ft
  rooms?: Array<{
    type: string;               // "bedroom", "kitchen", "bathroom", etc.
    count: number;
  }>;
  budgetRange?: 'economy' | 'standard' | 'premium';
  brandPreferences?: string[];   // brand names
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "boqId": "boq_abc123",
    "projectType": "residential_3bhk",
    "categories": [
      {
        "category": "Switchgear & Protection",
        "items": [
          {
            "productName": "MCB 32A Single Pole C-Curve",
            "matchedProductId": "prod_havells_mcb_32a",
            "brand": "Havells",
            "quantity": 12,
            "unitMrp": 285,
            "estimatedDealerPrice": 185,
            "totalEstimate": 2220,
            "rationale": "1 per circuit: 3 bedrooms (AC+lights) + kitchen + 2 bathrooms + living + dining + UPS + spare"
          },
          {
            "productName": "RCCB 25A Double Pole 30mA",
            "matchedProductId": "prod_havells_rccb_25a",
            "brand": "Havells",
            "quantity": 2,
            "unitMrp": 1850,
            "estimatedDealerPrice": 1350,
            "totalEstimate": 2700,
            "rationale": "1 for power circuits, 1 for lighting circuits"
          }
        ]
      },
      {
        "category": "Wires & Cables",
        "items": [
          {
            "productName": "FRLS Wire 2.5mm 90m coil",
            "matchedProductId": "prod_polycab_frls_25",
            "brand": "Polycab",
            "quantity": 8,
            "unitMrp": 3200,
            "estimatedDealerPrice": 2400,
            "totalEstimate": 19200,
            "rationale": "~700m total wiring for 3BHK (power + lighting + earthing loops)"
          }
        ]
      }
    ],
    "summary": {
      "totalItems": 28,
      "totalMrp": 125000,
      "estimatedDealerTotal": 82000,
      "estimatedSavings": 43000,
      "savingsPercent": 34.4
    },
    "actions": ["Create inquiries from BOQ", "Modify quantities", "Change brand preferences"]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.12.4 GET /ai/price-prediction/:productId

Get AI price prediction for a product.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "productId": "prod_havells_mcb_32a",
    "currentAvgDealerPrice": 185,
    "predictions": {
      "7days": { "low": 183, "mid": 186, "high": 190, "confidence": 0.85 },
      "30days": { "low": 180, "mid": 190, "high": 198, "confidence": 0.72 },
      "90days": { "low": 175, "mid": 195, "high": 215, "confidence": 0.55 }
    },
    "trend": "rising",
    "factors": [
      "Copper prices up 3% this month (affects wire and switchgear costs)",
      "Seasonal demand increase: pre-monsoon construction rush",
      "Havells announced 2-4% price revision effective May 2026"
    ],
    "recommendation": "Prices are trending up. Procure within the next 2 weeks for best pricing.",
    "lastUpdated": "2026-04-08T00:00:00.000Z"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.12.5 GET /ai/recommendations

Get personalized product recommendations.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 10 | Max recommendations |
| `context` | string | -- | `home_page`, `product_page`, `cart`, `post_purchase` |
| `productId` | string | -- | Current product (for product_page context) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "productId": "prod_havells_rccb_25a",
      "name": "Havells RCCB 25A DP 30mA",
      "reason": "Frequently bought with MCBs you recently viewed",
      "confidence": 0.88,
      "thumbnail": "...",
      "mrp": 1850,
      "estimatedDealerPrice": 1350
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.12.6 GET /ai/conversations

Get AI conversation history for the current user.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:** Standard pagination.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "sessionId": "sess_abc123",
      "title": "3BHK electrical planning",
      "messageCount": 12,
      "lastMessageAt": "2026-04-08T16:00:00.000Z",
      "createdAt": "2026-04-08T14:00:00.000Z"
    }
  ],
  "pagination": { "total": 5, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.13 Admin APIs

### 13.13.1 GET /admin/dashboard

Admin dashboard summary.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "users": { "total": 2500, "newThisWeek": 120, "activeThisMonth": 850 },
    "dealers": { "total": 200, "verified": 150, "pendingVerification": 12 },
    "inquiries": { "total": 3500, "activeThisWeek": 85, "avgQuotesPerInquiry": 3.2 },
    "rfqs": { "total": 450, "activeThisWeek": 25 },
    "orders": { "total": 280, "completedThisMonth": 42, "disputeRate": 2.1 },
    "revenue": {
      "totalGmv": 12500000,
      "monthlyGmv": 1800000,
      "subscriptionRevenue": 350000,
      "transactionRevenue": 54000,
      "mrr": 404000
    },
    "platform": {
      "avgSavingsPercent": 28,
      "avgResponseTimeMinutes": 180,
      "nps": 72,
      "uptime99d": 99.95
    }
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.13.2 GET /admin/users

List all users with filters.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:** Standard pagination + `status`, `role`, `city`, `search` (name/email/phone), `dateFrom`, `dateTo`.

**Response 200:** Paginated list of users with full profile data.

---

### 13.13.3 PUT /admin/users/:id/status

Update user status (activate, suspend, delete).

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  reason: string;               // min: 10, max: 500
}
```

**Response 200:** Updated user object. Creates audit log entry.

---

### 13.13.4 GET /admin/dealers/verification

Get the KYC verification queue.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:** Standard pagination + `status` filter (`PENDING_VERIFICATION`, `DOCUMENTS_PENDING`, `UNDER_REVIEW`).

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "dealerId": "dlr_abc123",
      "businessName": "Sharma Electrical Supplies",
      "ownerName": "Vikram Sharma",
      "city": "Sri Ganganagar",
      "state": "Rajasthan",
      "dealerType": "DISTRIBUTOR",
      "gstNumber": "08AADCS1234E1ZP",
      "kycStatus": "UNDER_REVIEW",
      "documents": [
        { "type": "gstCertificate", "url": "https://cdn.hub4estate.com/kyc/dlr_abc123/gst.pdf", "uploadedAt": "..." },
        { "type": "panCard", "url": "https://cdn.hub4estate.com/kyc/dlr_abc123/pan.jpg", "uploadedAt": "..." }
      ],
      "submittedAt": "2026-04-08T12:00:00.000Z",
      "assignedTo": null
    }
  ],
  "pagination": { "total": 12, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.13.5 PUT /admin/dealers/:id/verify

Approve or reject dealer KYC.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  action: 'approve' | 'reject';
  notes?: string;                // max: 1000
  rejectionReason?: string;      // required when action = 'reject', max: 500
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "dealerId": "dlr_abc123",
    "status": "VERIFIED",
    "verifiedAt": "2026-04-09T10:00:00.000Z",
    "verifiedBy": "admin_001"
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Server: updates dealer status, sends notification (WhatsApp + email), creates audit log, assigns free trial subscription if approved.

---

### 13.13.6 GET /admin/disputes

List open disputes.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:** Standard pagination + `status` (`open`, `investigating`, `resolved`), `priority`.

**Response 200:** Paginated list of disputes with order details, buyer, dealer, and evidence.

---

### 13.13.7 PUT /admin/disputes/:id

Resolve a dispute.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  resolution: 'buyer_favor' | 'dealer_favor' | 'split' | 'dismissed';
  action: 'full_refund' | 'partial_refund' | 'replacement' | 'credit' | 'no_action';
  refundAmountPaisa?: number;    // required for partial_refund
  notes: string;                 // min: 20, max: 2000
}
```

**Response 200:** Resolved dispute object. Server: processes refund if applicable, releases or returns escrow, notifies both parties, creates audit log.

---

### 13.13.8 GET /admin/analytics

Platform-wide analytics.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `30d` | `7d`, `30d`, `90d`, `6m`, `1y`, `all` |
| `metric` | string | -- | Specific metric to drill into |

**Response 200:** Comprehensive analytics object with GMV, user growth, conversion funnels, category performance, city breakdown, unit economics.

---

### 13.13.9 GET /admin/feature-flags

List all feature flags.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | STANDARD (60/min) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ff_auto_negotiation",
      "name": "auto_negotiation",
      "description": "Enable AI auto-negotiation agent",
      "enabled": true,
      "rolloutPercent": 25,
      "conditions": { "dealerTier": ["silver", "gold", "platinum"] },
      "updatedAt": "2026-04-05T10:00:00.000Z",
      "updatedBy": "admin_001"
    },
    {
      "id": "ff_boq_generator",
      "name": "boq_generator",
      "description": "Enable BOQ generation from project description",
      "enabled": true,
      "rolloutPercent": 100,
      "conditions": null,
      "updatedAt": "2026-04-01T10:00:00.000Z",
      "updatedBy": "admin_001"
    }
  ],
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.13.10 PUT /admin/feature-flags/:id

Toggle or update a feature flag.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  enabled?: boolean;
  rolloutPercent?: number;       // 0-100
  conditions?: Record<string, unknown> | null;
}
```

**Response 200:** Updated feature flag. Creates audit log.

---

### 13.13.11 GET /admin/audit-log

Query the audit trail.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 50 | Items per page |
| `action` | string | -- | Filter by AuditAction enum |
| `performedBy` | string | -- | Filter by admin ID |
| `entityType` | string | -- | `dealer`, `user`, `product`, `rfq`, etc. |
| `entityId` | string | -- | Specific entity ID |
| `dateFrom` | string | -- | ISO date |
| `dateTo` | string | -- | ISO date |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "audit_abc123",
      "action": "DEALER_VERIFIED",
      "performedBy": { "id": "admin_001", "name": "Shreshth Agarwal" },
      "entityType": "dealer",
      "entityId": "dlr_xyz789",
      "details": { "previousStatus": "UNDER_REVIEW", "newStatus": "VERIFIED" },
      "ipAddress": "103.xx.xx.xx",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-04-09T10:00:00.000Z"
    }
  ],
  "pagination": { "total": 250, "page": 1, "pageSize": 50, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.13.12 POST /admin/announcements

Create a system-wide announcement.

| Property | Value |
|----------|-------|
| Auth | Authenticated (admin) |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  title: string;                // min: 5, max: 200
  body: string;                 // min: 10, max: 5000, markdown supported
  targetAudience: 'all' | 'buyers' | 'dealers' | 'admins';
  priority: 'info' | 'warning' | 'critical';
  expiresAt?: string;           // ISO datetime
  channels: ('in_app' | 'email' | 'sms' | 'whatsapp')[];
}
```

**Response 201:** Created announcement. Server sends via specified channels to target audience.

---

## 13.14 Search APIs

### 13.14.1 GET /search

Universal search across products, dealers (post-selection only), and community posts.

| Property | Value |
|----------|-------|
| Auth | Public (dealers restricted to authenticated users with transaction) |
| Rate Limit | RELAXED (120/min) |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Search query, min: 2 |
| `type` | string | -- | `products`, `posts`, `all` (default: `all`) |
| `limit` | integer | 10 | Max results per type |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "products": {
      "results": [
        { "id": "prod_abc", "name": "Havells MCB 32A SP", "type": "product", "thumbnail": "...", "mrp": 285 }
      ],
      "total": 12
    },
    "posts": {
      "results": [
        { "id": "post_abc", "title": "Best MCBs for residential use", "type": "post", "authorName": "Rahul K." }
      ],
      "total": 3
    },
    "searchTimeMs": 18
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 13.15 Community APIs

### 13.15.1 GET /community/feed

Get community feed (paginated posts, sorted by newest or trending).

| Property | Value |
|----------|-------|
| Auth | Public (like/comment requires auth) |
| Rate Limit | RELAXED (120/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page |
| `pageSize` | integer | 20 | Posts per page |
| `sortBy` | string | `newest` | `newest`, `trending`, `most_liked` |
| `tag` | string | -- | Filter by tag |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "post_abc123",
      "title": "Which MCB brand is best for 3BHK flats?",
      "content": "I'm building a 3BHK and confused between Havells and Schneider...",
      "contentPreview": "I'm building a 3BHK and confused between Havells and...",
      "author": {
        "id": "usr_xyz",
        "name": "Rahul K.",
        "role": "INDIVIDUAL_HOME_BUILDER",
        "avatar": null,
        "isVerified": false
      },
      "tags": ["mcb", "havells", "schneider", "residential"],
      "likeCount": 12,
      "commentCount": 8,
      "isLiked": false,
      "status": "PUBLISHED",
      "createdAt": "2026-04-07T10:00:00.000Z"
    }
  ],
  "pagination": { "total": 45, "page": 1, "pageSize": 20, "totalPages": 3, "hasNextPage": true, "hasPrevPage": false },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.15.2 POST /community/posts

Create a community post.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  title: string;                // min: 5, max: 200
  content: string;              // min: 20, max: 10000, markdown supported
  tags?: string[];              // max 5 tags, each max 30 chars
  images?: string[];            // S3 keys, max 5
}
```

**Response 201:** Created post object.

---

### 13.15.3 GET /community/posts/:id

Get a single post with full content.

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Response 200:** Full post object with author, tags, content, like count, and first page of comments.

---

### 13.15.4 POST /community/posts/:id/like

Toggle like on a post.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Response 200:**

```json
{
  "success": true,
  "data": { "liked": true, "likeCount": 13 },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.15.5 POST /community/posts/:id/comments

Add a comment to a post.

| Property | Value |
|----------|-------|
| Auth | Authenticated |
| Rate Limit | MODERATE (30/min) |

**Request Body:**

```typescript
{
  content: string;              // min: 1, max: 2000
  parentId?: string;            // for reply to existing comment
}
```

**Response 201:** Created comment object.

---

### 13.15.6 GET /community/posts/:id/comments

List comments for a post (paginated).

| Property | Value |
|----------|-------|
| Auth | Public |
| Rate Limit | RELAXED (120/min) |

**Response 200:** Paginated comments with author, content, reply count, threaded replies (1 level deep).

---

## 13.16 Analytics APIs

### 13.16.1 GET /analytics/buyer/dashboard

Buyer analytics dashboard.

| Property | Value |
|----------|-------|
| Auth | Authenticated (user) |
| Rate Limit | STANDARD (60/min) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `30d` | `7d`, `30d`, `90d`, `6m`, `1y` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "totalSpent": 186200,
    "totalSaved": 72800,
    "savingsPercent": 28.1,
    "inquiryCount": 8,
    "rfqCount": 2,
    "orderCount": 5,
    "avgDealerRating": 4.5,
    "topCategories": [
      { "name": "Switchgear", "spent": 95000, "orders": 3 },
      { "name": "Wires & Cables", "spent": 68000, "orders": 2 }
    ],
    "spendingChart": [
      { "month": "2026-01", "amount": 0 },
      { "month": "2026-02", "amount": 45000 },
      { "month": "2026-03", "amount": 55000 },
      { "month": "2026-04", "amount": 86200 }
    ]
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

### 13.16.2 POST /analytics/events

Track a client-side analytics event.

| Property | Value |
|----------|-------|
| Auth | Optional (anonymous events allowed) |
| Rate Limit | RELAXED (120/min) |

**Request Body:**

```typescript
{
  event: string;                // e.g., "page_view", "product_click", "search", "cta_click"
  properties: Record<string, unknown>;  // event-specific properties
  sessionId?: string;           // anonymous session ID
  timestamp?: string;           // ISO datetime, default: server time
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "recorded": true },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

Events are batched and forwarded to PostHog for processing. No PII in event properties -- user IDs only.

---

## 13.17 Webhook Endpoints

### 13.17.1 POST /webhooks/razorpay

Same as SS13.8.3. Razorpay payment/subscription webhooks.

### 13.17.2 POST /webhooks/logistics

Delivery partner status updates.

| Property | Value |
|----------|-------|
| Auth | IP whitelist + signature verification |
| Rate Limit | WEBHOOK (100/min) |

**Handled Events:**

| Event | Action |
|-------|--------|
| `shipment.in_transit` | Update order delivery status, notify buyer |
| `shipment.out_for_delivery` | Notify buyer: "Your order is out for delivery" |
| `shipment.delivered` | Update order status, prompt buyer for delivery confirmation |
| `shipment.rto` | Return to origin -- notify both parties, pause escrow |

**Response 200:** `{ "status": "ok" }`

---

## 13.18 Socket.io Events

Real-time events delivered via Socket.io. Connection requires authentication.

**Connection:**

```typescript
const socket = io('wss://api.hub4estate.com', {
  auth: { token: accessToken },
  transports: ['websocket'],
});
```

**Server-to-Client Events:**

| Event | Payload | When |
|-------|---------|------|
| `notification:new` | `{ id, type, title, body, actionUrl }` | New notification created |
| `message:new` | `{ conversationId, message }` | New message in a conversation |
| `inquiry:quote_received` | `{ inquiryId, quoteCount }` | New quote on buyer's inquiry |
| `inquiry:status_changed` | `{ inquiryId, newStatus }` | Inquiry status changed |
| `rfq:quote_received` | `{ rfqId, quoteCount }` | New quote on buyer's RFQ |
| `rfq:status_changed` | `{ rfqId, newStatus }` | RFQ status changed |
| `order:status_changed` | `{ orderId, newStatus, note }` | Order status updated |
| `dealer:inquiry_matched` | `{ inquiryId, productName, quantity, city }` | New inquiry matched to dealer |
| `payment:status_changed` | `{ paymentId, status }` | Payment status change |

**Client-to-Server Events:**

| Event | Payload | Effect |
|-------|---------|--------|
| `join:conversation` | `{ conversationId }` | Join conversation room for real-time messages |
| `leave:conversation` | `{ conversationId }` | Leave conversation room |
| `typing:start` | `{ conversationId }` | Broadcast typing indicator to other participants |
| `typing:stop` | `{ conversationId }` | Stop typing indicator |

**Room Architecture:**

| Room Name | Members | Events |
|-----------|---------|--------|
| `user:{userId}` | Single user | notifications, inquiry updates, order updates |
| `dealer:{dealerId}` | Single dealer | matched inquiries, order updates, subscription alerts |
| `conversation:{convId}` | Conversation participants | messages, typing indicators |
| `admin` | All admins | platform alerts, dispute notifications |

---

# SECTION 14 -- FRONTEND ARCHITECTURE

> *The frontend is a React 18 SPA built with Vite 5.4, TypeScript 5.5, Tailwind CSS 3.4, React Query v5, Zustand 4, and React Router v6. Every route is code-split. Every API call goes through React Query. Every form uses React Hook Form + Zod. No exceptions.*

---

## 14.1 Application Structure

### 14.1.1 Complete Route Tree

Every route in the application, with auth requirements, lazy loading, and layout assignment.

```typescript
// src/app/router.tsx

import { createBrowserRouter, Outlet } from 'react-router-dom';

// Layouts (not lazy -- always loaded)
import { RootLayout } from '@/app/layouts/RootLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DealerLayout } from '@/app/layouts/DealerLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';

// Guards (not lazy -- lightweight auth checks)
import { AuthGuard } from '@/app/guards/AuthGuard';
import { DealerGuard } from '@/app/guards/DealerGuard';
import { AdminGuard } from '@/app/guards/AdminGuard';
import { GuestGuard } from '@/app/guards/GuestGuard';

// Error boundaries
import { RootErrorBoundary } from '@/app/errors/RootErrorBoundary';
import { NotFoundPage } from '@/app/errors/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      // ============================================
      // PUBLIC ROUTES (no auth required)
      // ============================================
      { index: true, lazy: () => import('@/pages/HomePage') },
      { path: 'about', lazy: () => import('@/pages/AboutPage') },
      { path: 'contact', lazy: () => import('@/pages/ContactPage') },
      { path: 'pricing', lazy: () => import('@/pages/PricingPage') },
      { path: 'for-dealers', lazy: () => import('@/pages/ForDealersPage') },
      { path: 'terms', lazy: () => import('@/pages/legal/TermsPage') },
      { path: 'privacy', lazy: () => import('@/pages/legal/PrivacyPage') },

      // ============================================
      // CATALOG (public browsing, some features auth-gated)
      // ============================================
      { path: 'catalog', lazy: () => import('@/pages/catalog/CatalogPage') },
      { path: 'catalog/:categorySlug', lazy: () => import('@/pages/catalog/CategoryPage') },
      { path: 'product/:productIdOrSlug', lazy: () => import('@/pages/catalog/ProductDetailPage') },
      { path: 'compare', lazy: () => import('@/pages/catalog/ComparePage') },
      { path: 'brands', lazy: () => import('@/pages/catalog/BrandsPage') },
      { path: 'brands/:brandSlug', lazy: () => import('@/pages/catalog/BrandDetailPage') },
      { path: 'search', lazy: () => import('@/pages/catalog/SearchResultsPage') },
      { path: 'trending', lazy: () => import('@/pages/catalog/TrendingPage') },
      { path: 'price-index', lazy: () => import('@/pages/catalog/PriceIndexPage') },

      // ============================================
      // COMMUNITY (public reading, auth for posting)
      // ============================================
      { path: 'community', lazy: () => import('@/pages/community/CommunityFeedPage') },
      { path: 'community/:postId', lazy: () => import('@/pages/community/PostDetailPage') },

      // ============================================
      // KNOWLEDGE BASE (public)
      // ============================================
      { path: 'knowledge', lazy: () => import('@/pages/knowledge/KnowledgePage') },
      { path: 'knowledge/:slug', lazy: () => import('@/pages/knowledge/ArticlePage') },

      // ============================================
      // AUTH ROUTES (guest only -- redirect if logged in)
      // ============================================
      {
        path: 'auth',
        element: <GuestGuard><AuthLayout><Outlet /></AuthLayout></GuestGuard>,
        children: [
          { path: 'login', lazy: () => import('@/pages/auth/LoginPage') },
          { path: 'register', lazy: () => import('@/pages/auth/RegisterPage') },
          { path: 'register/dealer', lazy: () => import('@/pages/auth/DealerRegisterPage') },
          { path: 'verify', lazy: () => import('@/pages/auth/VerifyPage') },
          { path: 'verify-otp', lazy: () => import('@/pages/auth/VerifyOtpPage') },
          { path: 'forgot-password', lazy: () => import('@/pages/auth/ForgotPasswordPage') },
          { path: 'reset-password', lazy: () => import('@/pages/auth/ResetPasswordPage') },
        ],
      },

      // ============================================
      // BUYER DASHBOARD (authenticated users)
      // ============================================
      {
        path: 'dashboard',
        element: <AuthGuard><DashboardLayout><Outlet /></DashboardLayout></AuthGuard>,
        children: [
          { index: true, lazy: () => import('@/pages/dashboard/DashboardPage') },

          // Inquiries
          { path: 'inquiries', lazy: () => import('@/pages/dashboard/inquiries/InquiriesListPage') },
          { path: 'inquiries/new', lazy: () => import('@/pages/dashboard/inquiries/CreateInquiryPage') },
          { path: 'inquiries/:id', lazy: () => import('@/pages/dashboard/inquiries/InquiryDetailPage') },

          // RFQs
          { path: 'rfqs', lazy: () => import('@/pages/dashboard/rfqs/RfqListPage') },
          { path: 'rfqs/new', lazy: () => import('@/pages/dashboard/rfqs/CreateRfqPage') },
          { path: 'rfqs/:id', lazy: () => import('@/pages/dashboard/rfqs/RfqDetailPage') },

          // Orders
          { path: 'orders', lazy: () => import('@/pages/dashboard/orders/OrdersListPage') },
          { path: 'orders/:id', lazy: () => import('@/pages/dashboard/orders/OrderDetailPage') },

          // Messages
          { path: 'messages', lazy: () => import('@/pages/dashboard/messages/ConversationsPage') },
          { path: 'messages/:conversationId', lazy: () => import('@/pages/dashboard/messages/ConversationDetailPage') },

          // Saved
          { path: 'saved', lazy: () => import('@/pages/dashboard/SavedProductsPage') },

          // Analytics
          { path: 'analytics', lazy: () => import('@/pages/dashboard/BuyerAnalyticsPage') },

          // Profile & Settings
          { path: 'profile', lazy: () => import('@/pages/dashboard/ProfilePage') },
          { path: 'settings', lazy: () => import('@/pages/dashboard/SettingsPage') },
          { path: 'notifications', lazy: () => import('@/pages/dashboard/NotificationsPage') },
          { path: 'payments', lazy: () => import('@/pages/dashboard/PaymentHistoryPage') },
          { path: 'addresses', lazy: () => import('@/pages/dashboard/AddressesPage') },
        ],
      },

      // ============================================
      // DEALER DASHBOARD (authenticated dealers)
      // ============================================
      {
        path: 'dealer',
        element: <DealerGuard><DealerLayout><Outlet /></DealerLayout></DealerGuard>,
        children: [
          { index: true, lazy: () => import('@/pages/dealer/DealerDashboardPage') },

          // Onboarding (KYC)
          { path: 'onboarding', lazy: () => import('@/pages/dealer/OnboardingPage') },
          { path: 'onboarding/kyc', lazy: () => import('@/pages/dealer/KycUploadPage') },

          // Inquiries & Quotes
          { path: 'inquiries', lazy: () => import('@/pages/dealer/InquiryFeedPage') },
          { path: 'inquiries/:id', lazy: () => import('@/pages/dealer/InquiryDetailPage') },
          { path: 'quotes', lazy: () => import('@/pages/dealer/QuotesListPage') },

          // RFQs
          { path: 'rfqs', lazy: () => import('@/pages/dealer/RfqFeedPage') },
          { path: 'rfqs/:id', lazy: () => import('@/pages/dealer/RfqDetailPage') },

          // Orders
          { path: 'orders', lazy: () => import('@/pages/dealer/OrdersPage') },
          { path: 'orders/:id', lazy: () => import('@/pages/dealer/OrderDetailPage') },

          // Inventory
          { path: 'inventory', lazy: () => import('@/pages/dealer/InventoryPage') },
          { path: 'inventory/add', lazy: () => import('@/pages/dealer/AddInventoryPage') },

          // Messages
          { path: 'messages', lazy: () => import('@/pages/dealer/MessagesPage') },
          { path: 'messages/:conversationId', lazy: () => import('@/pages/dealer/ConversationPage') },

          // Analytics & Subscription
          { path: 'analytics', lazy: () => import('@/pages/dealer/AnalyticsPage') },
          { path: 'earnings', lazy: () => import('@/pages/dealer/EarningsPage') },
          { path: 'subscription', lazy: () => import('@/pages/dealer/SubscriptionPage') },

          // Profile
          { path: 'profile', lazy: () => import('@/pages/dealer/ProfilePage') },
          { path: 'settings', lazy: () => import('@/pages/dealer/SettingsPage') },
        ],
      },

      // ============================================
      // ADMIN DASHBOARD (admin only)
      // ============================================
      {
        path: 'admin',
        element: <AdminGuard><AdminLayout><Outlet /></AdminLayout></AdminGuard>,
        children: [
          { index: true, lazy: () => import('@/pages/admin/AdminDashboardPage') },

          // User Management
          { path: 'users', lazy: () => import('@/pages/admin/UsersPage') },
          { path: 'users/:id', lazy: () => import('@/pages/admin/UserDetailPage') },

          // Dealer Management
          { path: 'dealers', lazy: () => import('@/pages/admin/DealersPage') },
          { path: 'dealers/:id', lazy: () => import('@/pages/admin/DealerDetailPage') },
          { path: 'dealers/verification', lazy: () => import('@/pages/admin/DealerVerificationQueuePage') },

          // Inquiry Pipeline
          { path: 'inquiries', lazy: () => import('@/pages/admin/InquiriesPage') },
          { path: 'inquiries/:id', lazy: () => import('@/pages/admin/InquiryPipelinePage') },

          // RFQs
          { path: 'rfqs', lazy: () => import('@/pages/admin/RfqsPage') },
          { path: 'rfqs/:id', lazy: () => import('@/pages/admin/RfqDetailPage') },

          // Orders & Disputes
          { path: 'orders', lazy: () => import('@/pages/admin/OrdersPage') },
          { path: 'disputes', lazy: () => import('@/pages/admin/DisputesPage') },
          { path: 'disputes/:id', lazy: () => import('@/pages/admin/DisputeDetailPage') },

          // Catalog Management
          { path: 'catalog', lazy: () => import('@/pages/admin/CatalogManagementPage') },
          { path: 'catalog/products', lazy: () => import('@/pages/admin/ProductsPage') },
          { path: 'catalog/categories', lazy: () => import('@/pages/admin/CategoriesPage') },
          { path: 'catalog/brands', lazy: () => import('@/pages/admin/BrandsPage') },

          // Community Moderation
          { path: 'community', lazy: () => import('@/pages/admin/CommunityModerationPage') },

          // CRM
          { path: 'crm', lazy: () => import('@/pages/admin/CrmPage') },
          { path: 'crm/companies/:id', lazy: () => import('@/pages/admin/CompanyDetailPage') },

          // Scraper
          { path: 'scraper', lazy: () => import('@/pages/admin/ScraperPage') },
          { path: 'scraper/brands/:id', lazy: () => import('@/pages/admin/ScrapeBrandDetailPage') },

          // Analytics & Revenue
          { path: 'analytics', lazy: () => import('@/pages/admin/AnalyticsPage') },
          { path: 'revenue', lazy: () => import('@/pages/admin/RevenuePage') },

          // Payments
          { path: 'payments', lazy: () => import('@/pages/admin/PaymentsPage') },

          // System
          { path: 'settings', lazy: () => import('@/pages/admin/SettingsPage') },
          { path: 'feature-flags', lazy: () => import('@/pages/admin/FeatureFlagsPage') },
          { path: 'audit-log', lazy: () => import('@/pages/admin/AuditLogPage') },
          { path: 'announcements', lazy: () => import('@/pages/admin/AnnouncementsPage') },
          { path: 'database', lazy: () => import('@/pages/admin/DatabaseBrowserPage') },
        ],
      },

      // ============================================
      // CATCH-ALL
      // ============================================
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

**Total routes: 89** (23 public, 22 buyer dashboard, 20 dealer dashboard, 24 admin).

---

### 14.1.2 Complete Folder Structure

```
src/
├── app/                              # Application shell
│   ├── router.tsx                    # Route definitions (above)
│   ├── App.tsx                       # Root component: providers + router
│   ├── guards/                       # Route guard components
│   │   ├── AuthGuard.tsx             # Redirects to /auth/login if not authenticated
│   │   ├── DealerGuard.tsx           # Checks dealer auth + verification status
│   │   ├── AdminGuard.tsx            # Checks admin role
│   │   └── GuestGuard.tsx            # Redirects to /dashboard if already authenticated
│   ├── layouts/                      # Page layout wrappers
│   │   ├── RootLayout.tsx            # Navbar + Footer + Volt FAB + Toast container
│   │   ├── DashboardLayout.tsx       # Sidebar + topbar + main content area
│   │   ├── DealerLayout.tsx          # Dealer-specific sidebar + topbar
│   │   ├── AdminLayout.tsx           # Admin sidebar + topbar + system alerts
│   │   └── AuthLayout.tsx            # Centered card layout for auth pages
│   ├── providers/                    # Context providers
│   │   ├── QueryProvider.tsx         # React Query provider + devtools
│   │   ├── AuthProvider.tsx          # Auth state initialization from token
│   │   ├── SocketProvider.tsx        # Socket.io connection manager
│   │   └── ToastProvider.tsx         # Toast notification context
│   └── errors/                       # Error boundary components
│       ├── RootErrorBoundary.tsx     # Top-level error boundary
│       ├── PageErrorBoundary.tsx     # Page-level error boundary with retry
│       ├── SectionErrorBoundary.tsx  # Section-level error boundary
│       └── NotFoundPage.tsx          # 404 page
│
├── pages/                            # Page components (one per route)
│   ├── HomePage.tsx                  # Landing page: hero, value prop, how it works, CTA
│   ├── AboutPage.tsx                 # About Hub4Estate
│   ├── ContactPage.tsx               # Contact form
│   ├── PricingPage.tsx               # Dealer subscription pricing tiers
│   ├── ForDealersPage.tsx            # Dealer onboarding landing page
│   ├── legal/
│   │   ├── TermsPage.tsx
│   │   └── PrivacyPage.tsx
│   ├── catalog/
│   │   ├── CatalogPage.tsx           # Category grid, featured brands, trending
│   │   ├── CategoryPage.tsx          # Product grid with filters sidebar
│   │   ├── ProductDetailPage.tsx     # Full product page: images, specs, price, CTA
│   │   ├── ComparePage.tsx           # Side-by-side comparison (2-4 products)
│   │   ├── BrandsPage.tsx            # Brand directory
│   │   ├── BrandDetailPage.tsx       # Brand page with category breakdown
│   │   ├── SearchResultsPage.tsx     # Search results with facets
│   │   ├── TrendingPage.tsx          # Trending products
│   │   └── PriceIndexPage.tsx        # Price index charts by category
│   ├── community/
│   │   ├── CommunityFeedPage.tsx     # Post feed with sort/filter
│   │   └── PostDetailPage.tsx        # Single post with comments
│   ├── knowledge/
│   │   ├── KnowledgePage.tsx         # Knowledge base listing
│   │   └── ArticlePage.tsx           # Single article
│   ├── auth/
│   │   ├── LoginPage.tsx             # Email/password + Google + OTP tabs
│   │   ├── RegisterPage.tsx          # User registration
│   │   ├── DealerRegisterPage.tsx    # Dealer registration (separate flow)
│   │   ├── VerifyPage.tsx            # Email verification
│   │   ├── VerifyOtpPage.tsx         # OTP verification
│   │   ├── ForgotPasswordPage.tsx    # Forgot password form
│   │   └── ResetPasswordPage.tsx     # Reset password form
│   ├── dashboard/                    # Buyer dashboard pages
│   │   ├── DashboardPage.tsx         # Overview: stats, recent activity, quick actions
│   │   ├── inquiries/
│   │   │   ├── InquiriesListPage.tsx # List of buyer's inquiries with status filters
│   │   │   ├── CreateInquiryPage.tsx # Inquiry creation form (single product)
│   │   │   └── InquiryDetailPage.tsx # Inquiry detail with anonymous quotes, evaluation
│   │   ├── rfqs/
│   │   │   ├── RfqListPage.tsx       # List of buyer's RFQs
│   │   │   ├── CreateRfqPage.tsx     # Multi-item RFQ builder (cart-like)
│   │   │   └── RfqDetailPage.tsx     # RFQ detail with quotes, selection
│   │   ├── orders/
│   │   │   ├── OrdersListPage.tsx    # Order history
│   │   │   └── OrderDetailPage.tsx   # Order tracking, delivery, dispute
│   │   ├── messages/
│   │   │   ├── ConversationsPage.tsx # Conversation list
│   │   │   └── ConversationDetailPage.tsx # Chat view
│   │   ├── SavedProductsPage.tsx     # Saved/wishlist products
│   │   ├── BuyerAnalyticsPage.tsx    # Spend analytics, savings report
│   │   ├── ProfilePage.tsx           # Profile edit
│   │   ├── SettingsPage.tsx          # Notification preferences, privacy
│   │   ├── NotificationsPage.tsx     # All notifications
│   │   ├── PaymentHistoryPage.tsx    # Payment history
│   │   └── AddressesPage.tsx         # Manage addresses
│   ├── dealer/                       # Dealer dashboard pages
│   │   ├── DealerDashboardPage.tsx   # Overview: stats, pending actions, alerts
│   │   ├── OnboardingPage.tsx        # Multi-step onboarding wizard
│   │   ├── KycUploadPage.tsx         # Document upload form
│   │   ├── InquiryFeedPage.tsx       # Matched inquiries feed
│   │   ├── InquiryDetailPage.tsx     # Inquiry detail with quote form
│   │   ├── QuotesListPage.tsx        # Submitted quotes with status
│   │   ├── RfqFeedPage.tsx           # Available RFQs
│   │   ├── RfqDetailPage.tsx         # RFQ detail with quote form
│   │   ├── OrdersPage.tsx            # Dealer's orders
│   │   ├── OrderDetailPage.tsx       # Order fulfillment management
│   │   ├── InventoryPage.tsx         # Inventory management grid
│   │   ├── AddInventoryPage.tsx      # Add/search products to inventory
│   │   ├── MessagesPage.tsx          # Conversations
│   │   ├── ConversationPage.tsx      # Chat view
│   │   ├── AnalyticsPage.tsx         # Revenue, win rate, performance
│   │   ├── EarningsPage.tsx          # Earnings breakdown
│   │   ├── SubscriptionPage.tsx      # Plan management, upgrade
│   │   ├── ProfilePage.tsx           # Dealer profile edit
│   │   └── SettingsPage.tsx          # Preferences
│   └── admin/                        # Admin dashboard pages (20+ pages)
│       ├── AdminDashboardPage.tsx    # Platform overview
│       ├── UsersPage.tsx             # User management table
│       ├── UserDetailPage.tsx        # User detail with actions
│       ├── DealersPage.tsx           # Dealer management
│       ├── DealerDetailPage.tsx      # Dealer detail with KYC docs
│       ├── DealerVerificationQueuePage.tsx # KYC queue
│       ├── InquiriesPage.tsx         # All inquiries pipeline
│       ├── InquiryPipelinePage.tsx   # Single inquiry AI analysis
│       ├── RfqsPage.tsx              # All RFQs
│       ├── RfqDetailPage.tsx         # RFQ management
│       ├── OrdersPage.tsx            # All orders
│       ├── DisputesPage.tsx          # Dispute queue
│       ├── DisputeDetailPage.tsx     # Dispute resolution
│       ├── CatalogManagementPage.tsx # Catalog overview
│       ├── ProductsPage.tsx          # Product CRUD
│       ├── CategoriesPage.tsx        # Category tree management
│       ├── BrandsPage.tsx            # Brand management
│       ├── CommunityModerationPage.tsx # Flagged posts/comments
│       ├── CrmPage.tsx               # CRM dashboard
│       ├── CompanyDetailPage.tsx     # Company detail
│       ├── ScraperPage.tsx           # Scraper management
│       ├── ScrapeBrandDetailPage.tsx # Scrape brand config
│       ├── AnalyticsPage.tsx         # Platform analytics
│       ├── RevenuePage.tsx           # Revenue analytics
│       ├── PaymentsPage.tsx          # Payment management
│       ├── SettingsPage.tsx          # System settings
│       ├── FeatureFlagsPage.tsx      # Feature flag management
│       ├── AuditLogPage.tsx          # Audit trail viewer
│       ├── AnnouncementsPage.tsx     # System announcements
│       └── DatabaseBrowserPage.tsx   # Direct DB browser (dev/admin tool)
│
├── components/                       # Reusable components
│   ├── ui/                           # Design system primitives (see SS10)
│   │   ├── Button.tsx                # Button with variants: primary, secondary, ghost, danger
│   │   ├── Input.tsx                 # Text input with label, error, helper
│   │   ├── Textarea.tsx              # Multi-line input
│   │   ├── Select.tsx                # Dropdown select
│   │   ├── Checkbox.tsx              # Checkbox with label
│   │   ├── Radio.tsx                 # Radio button group
│   │   ├── Switch.tsx                # Toggle switch
│   │   ├── Badge.tsx                 # Status badge (success, warning, error, info)
│   │   ├── Card.tsx                  # Card container with variants
│   │   ├── Modal.tsx                 # Modal dialog
│   │   ├── Drawer.tsx                # Side drawer (mobile nav, filters)
│   │   ├── Dropdown.tsx              # Dropdown menu
│   │   ├── Tabs.tsx                  # Tab navigation
│   │   ├── Avatar.tsx                # User/dealer avatar with fallback
│   │   ├── Tooltip.tsx               # Tooltip
│   │   ├── Skeleton.tsx              # Loading skeleton
│   │   ├── Spinner.tsx               # Loading spinner
│   │   ├── EmptyState.tsx            # Empty state with illustration
│   │   ├── ErrorCard.tsx             # Error state with retry button
│   │   ├── Toast.tsx                 # Toast notification
│   │   ├── Breadcrumb.tsx            # Breadcrumb navigation
│   │   ├── Pagination.tsx            # Pagination controls
│   │   ├── DataTable.tsx             # Data table with sort, filter, pagination
│   │   ├── FileUpload.tsx            # File upload with drag-and-drop
│   │   ├── ImageGallery.tsx          # Product image gallery with zoom
│   │   ├── StarRating.tsx            # Star rating display and input
│   │   ├── PriceDisplay.tsx          # Price with MRP, dealer price, savings
│   │   ├── SearchBar.tsx             # Search input with autocomplete
│   │   ├── ProgressBar.tsx           # Progress indicator
│   │   ├── Stepper.tsx               # Multi-step form stepper
│   │   ├── Tag.tsx                   # Removable tag/chip
│   │   └── index.ts                  # Barrel export
│   │
│   ├── forms/                        # Domain-specific form components
│   │   ├── InquiryForm.tsx           # Single product inquiry form
│   │   ├── RfqBuilderForm.tsx        # Multi-item RFQ builder
│   │   ├── QuoteSubmissionForm.tsx   # Dealer quote form (per inquiry)
│   │   ├── RfqQuoteForm.tsx          # Dealer quote form (per RFQ, per-item pricing)
│   │   ├── DealerRegistrationForm.tsx # Dealer registration multi-step
│   │   ├── KycUploadForm.tsx         # KYC document upload form
│   │   ├── ProfileEditForm.tsx       # User profile edit
│   │   ├── AddressForm.tsx           # Address add/edit
│   │   ├── ReviewForm.tsx            # Post-order review form
│   │   ├── DisputeForm.tsx           # Dispute submission form
│   │   ├── PostForm.tsx              # Community post creation
│   │   ├── ProductFilterForm.tsx     # Catalog filter sidebar
│   │   └── ContactForm.tsx           # Contact page form
│   │
│   ├── features/                     # Feature-specific components
│   │   ├── catalog/
│   │   │   ├── ProductCard.tsx       # Product card (grid/list view)
│   │   │   ├── ProductGrid.tsx       # Grid of ProductCards with loading
│   │   │   ├── CategoryCard.tsx      # Category browsing card
│   │   │   ├── BrandCard.tsx         # Brand logo card
│   │   │   ├── FilterSidebar.tsx     # Category/brand/price/spec filters
│   │   │   ├── ComparisonTable.tsx   # Side-by-side product comparison
│   │   │   ├── PriceHistoryChart.tsx # Price history line chart
│   │   │   ├── PriceIndexChart.tsx   # Price index sparklines
│   │   │   ├── SpecificationTable.tsx # Product specifications table
│   │   │   ├── AlternativesList.tsx  # Alternative products row
│   │   │   └── TrendingBanner.tsx    # Trending products carousel
│   │   │
│   │   ├── inquiry/
│   │   │   ├── InquiryCard.tsx       # Inquiry summary card
│   │   │   ├── InquiryStatusBadge.tsx # Status badge with color
│   │   │   ├── QuoteCard.tsx         # Anonymous quote card (buyer view)
│   │   │   ├── QuoteRanking.tsx      # AI-ranked quotes with scores
│   │   │   ├── QuoteComparison.tsx   # Side-by-side quote comparison
│   │   │   ├── IdentityRevealModal.tsx # Confirmation modal before quote selection
│   │   │   └── SavingsCalculator.tsx # MRP vs quote savings display
│   │   │
│   │   ├── rfq/
│   │   │   ├── RfqCard.tsx           # RFQ summary card
│   │   │   ├── RfqItemsTable.tsx     # Items table within RFQ
│   │   │   ├── RfqStatusTimeline.tsx # Visual status timeline
│   │   │   ├── RfqQuoteCard.tsx      # Quote card for RFQ
│   │   │   └── RfqBuilder.tsx        # Cart-like RFQ item builder
│   │   │
│   │   ├── order/
│   │   │   ├── OrderCard.tsx         # Order summary card
│   │   │   ├── OrderTimeline.tsx     # Order status timeline
│   │   │   ├── DeliveryTracker.tsx   # Real-time delivery tracking
│   │   │   └── DisputeBanner.tsx     # Dispute status banner
│   │   │
│   │   ├── dealer/
│   │   │   ├── DealerCard.tsx        # Dealer profile card (post-selection)
│   │   │   ├── DealerMetrics.tsx     # Rating, orders, delivery stats
│   │   │   ├── InventoryTable.tsx    # Inventory management data table
│   │   │   ├── SubscriptionCard.tsx  # Current plan display
│   │   │   ├── KycStatusCard.tsx     # KYC verification status
│   │   │   └── DealerOnboardingStepper.tsx # Multi-step onboarding
│   │   │
│   │   ├── messaging/
│   │   │   ├── ConversationList.tsx  # Conversation sidebar list
│   │   │   ├── MessageBubble.tsx     # Single message bubble
│   │   │   ├── MessageInput.tsx      # Message composition (text + image)
│   │   │   ├── TypingIndicator.tsx   # "User is typing..." indicator
│   │   │   └── SystemMessage.tsx     # System message display
│   │   │
│   │   ├── ai/
│   │   │   ├── VoltChatWidget.tsx    # Floating chat widget (FAB)
│   │   │   ├── VoltChatPanel.tsx     # Expandable chat panel
│   │   │   ├── VoltMessage.tsx       # AI message with tool results
│   │   │   ├── BoqResultCard.tsx     # BOQ generation result display
│   │   │   ├── SlipScanResult.tsx    # Slip scan result display
│   │   │   └── PricePredictionCard.tsx # Price prediction display
│   │   │
│   │   ├── community/
│   │   │   ├── PostCard.tsx          # Community post card
│   │   │   ├── CommentThread.tsx     # Threaded comment display
│   │   │   ├── CommentInput.tsx      # Comment composition
│   │   │   ├── LikeButton.tsx        # Like/unlike with animation
│   │   │   └── TagFilter.tsx         # Tag-based filtering
│   │   │
│   │   ├── notification/
│   │   │   ├── NotificationBell.tsx  # Bell icon with unread badge
│   │   │   ├── NotificationDropdown.tsx # Dropdown notification list
│   │   │   └── NotificationItem.tsx  # Single notification row
│   │   │
│   │   ├── payment/
│   │   │   ├── RazorpayCheckout.tsx  # Razorpay checkout integration
│   │   │   ├── PaymentStatusCard.tsx # Payment status display
│   │   │   └── EscrowStatusCard.tsx  # Escrow status display
│   │   │
│   │   └── analytics/
│   │       ├── StatCard.tsx          # Metric card with icon, value, change
│   │       ├── RevenueChart.tsx      # Revenue line/bar chart
│   │       ├── ConversionFunnel.tsx  # Funnel visualization
│   │       └── CategoryPieChart.tsx  # Category breakdown pie chart
│   │
│   └── layouts/                      # Layout components
│       ├── Navbar.tsx                # Top navigation bar
│       ├── Footer.tsx                # Site footer
│       ├── Sidebar.tsx               # Dashboard sidebar navigation
│       ├── DealerSidebar.tsx         # Dealer-specific sidebar
│       ├── AdminSidebar.tsx          # Admin sidebar with all sections
│       ├── MobileNav.tsx             # Mobile bottom navigation
│       └── BreadcrumbNav.tsx         # Dynamic breadcrumb from route
│
├── hooks/                            # Custom React hooks
│   ├── api/                          # React Query hooks (server state)
│   │   ├── useAuth.ts               # Login, register, logout, refresh mutations
│   │   ├── useProducts.ts           # useProducts(filters), useProduct(id), useProductPrices(id)
│   │   ├── useCategories.ts         # useCategories(), useCategory(slug)
│   │   ├── useBrands.ts             # useBrands(), useBrand(slug)
│   │   ├── useSearch.ts             # useSearch(query), useAutocomplete(query)
│   │   ├── useInquiries.ts          # useMyInquiries(), useInquiry(id), useSubmitInquiry()
│   │   ├── useRfqs.ts               # useMyRfqs(), useRfq(id), useCreateRfq(), usePublishRfq()
│   │   ├── useQuotes.ts             # useSubmitQuote(), useUpdateQuote(), useSelectQuote()
│   │   ├── useOrders.ts             # useMyOrders(), useOrder(id), useConfirmDelivery()
│   │   ├── usePayments.ts           # useCreatePayment(), useVerifyPayment(), usePaymentHistory()
│   │   ├── useDealer.ts             # useDealerDashboard(), useDealerInventory(), useDealerAnalytics()
│   │   ├── useMessages.ts           # useConversations(), useMessages(convId), useSendMessage()
│   │   ├── useNotifications.ts      # useNotifications(), useUnreadCount(), useMarkRead()
│   │   ├── useCommunity.ts          # useFeed(), usePost(id), useCreatePost(), useLikePost()
│   │   ├── useAI.ts                 # useChatMutation(), useBoqGeneration(), useSlipScan()
│   │   ├── useAdmin.ts              # useAdminDashboard(), useAdminUsers(), useVerifyDealer()
│   │   └── useAnalytics.ts          # useBuyerAnalytics(), useDealerAnalytics()
│   │
│   ├── ui/                           # UI utility hooks
│   │   ├── useMediaQuery.ts         # Responsive breakpoint detection
│   │   ├── useDebounce.ts           # Debounce value changes (search input)
│   │   ├── useToast.ts              # Toast notification trigger
│   │   ├── useModal.ts              # Modal open/close state
│   │   ├── useClickOutside.ts       # Click outside detection
│   │   ├── useIntersection.ts       # Intersection observer (infinite scroll, lazy images)
│   │   ├── useLocalStorage.ts       # Type-safe localStorage hook
│   │   └── useCopyToClipboard.ts    # Copy to clipboard with feedback
│   │
│   └── auth/                         # Auth-specific hooks
│       ├── useAuth.ts               # Current user, isAuthenticated, role
│       ├── usePermissions.ts        # Role-based permission checks
│       └── useTokenRefresh.ts       # Silent token refresh on mount
│
├── stores/                           # Zustand stores (client-only state)
│   ├── authStore.ts                  # User/dealer/admin session state (PERSISTED)
│   ├── rfqStore.ts                   # RFQ builder cart state (PERSISTED)
│   ├── uiStore.ts                    # Sidebar, modals, theme, toasts (NOT PERSISTED)
│   └── chatStore.ts                  # Volt AI chat state (NOT PERSISTED)
│
├── lib/                              # Utilities and configuration
│   ├── api/
│   │   ├── client.ts                # Axios instance with interceptors
│   │   ├── auth.api.ts              # Auth API functions
│   │   ├── catalog.api.ts           # Catalog API functions
│   │   ├── inquiry.api.ts           # Inquiry API functions
│   │   ├── rfq.api.ts               # RFQ API functions
│   │   ├── order.api.ts             # Order API functions
│   │   ├── payment.api.ts           # Payment API functions
│   │   ├── dealer.api.ts            # Dealer API functions
│   │   ├── message.api.ts           # Messaging API functions
│   │   ├── notification.api.ts      # Notification API functions
│   │   ├── ai.api.ts                # AI API functions
│   │   ├── community.api.ts         # Community API functions
│   │   ├── admin.api.ts             # Admin API functions
│   │   ├── analytics.api.ts         # Analytics API functions
│   │   └── upload.api.ts            # File upload (presigned URL flow)
│   │
│   ├── socket/
│   │   ├── client.ts                # Socket.io client singleton
│   │   └── events.ts                # Event type constants
│   │
│   ├── utils/
│   │   ├── formatters.ts            # formatPrice(), formatDate(), formatRelativeTime()
│   │   ├── validators.ts            # Phone, email, GST, PAN regex validators
│   │   ├── cn.ts                    # clsx + tailwind-merge utility
│   │   ├── storage.ts               # localStorage/sessionStorage wrappers
│   │   └── seo.ts                   # Meta tag helpers
│   │
│   ├── constants/
│   │   ├── routes.ts                # Route path constants
│   │   ├── queryKeys.ts             # React Query key constants
│   │   ├── indianStates.ts          # Indian states/UTs list
│   │   └── config.ts                # Environment-aware config
│   │
│   └── validations/                  # Zod schemas (shared with API types)
│       ├── auth.schema.ts           # Login, register, OTP schemas
│       ├── inquiry.schema.ts        # Inquiry creation/update schemas
│       ├── rfq.schema.ts            # RFQ creation/quote schemas
│       ├── dealer.schema.ts         # Dealer registration, KYC schemas
│       ├── profile.schema.ts        # Profile update, address schemas
│       ├── order.schema.ts          # Order status, review schemas
│       └── community.schema.ts      # Post, comment schemas
│
├── types/                            # TypeScript type definitions
│   ├── api.types.ts                 # API response/request types
│   ├── auth.types.ts                # Auth types (User, Dealer, Admin, TokenPayload)
│   ├── catalog.types.ts             # Product, Category, Brand types
│   ├── inquiry.types.ts             # Inquiry, DealerResponse, Quote types
│   ├── rfq.types.ts                 # RFQ, RFQItem, Quote, QuoteItem types
│   ├── order.types.ts               # Order, OrderItem, Dispute types
│   ├── payment.types.ts             # Payment, Invoice, Escrow types
│   ├── dealer.types.ts              # Dealer, DealerProfile, Inventory types
│   ├── message.types.ts             # Conversation, Message types
│   ├── notification.types.ts        # Notification types
│   ├── community.types.ts           # Post, Comment types
│   ├── ai.types.ts                  # AI session, BOQ, prediction types
│   └── common.types.ts              # Pagination, Error, ApiResponse generics
│
├── styles/                           # Global styles
│   ├── index.css                    # Tailwind imports + global resets
│   ├── fonts.css                    # Font-face declarations
│   └── animations.css               # Custom keyframe animations
│
├── assets/                           # Static assets
│   ├── images/                      # Illustrations, backgrounds
│   ├── icons/                       # Custom SVG icons (non-Lucide)
│   └── lottie/                      # Lottie animations (loading, success, empty)
│
├── main.tsx                          # Application entry point
└── vite-env.d.ts                     # Vite type declarations
```

---

### 14.1.3 State Management Strategy

**Three layers. Zero overlap. Clear ownership.**

| Layer | Tool | What Lives Here | Persistence |
|-------|------|-----------------|-------------|
| Server State | React Query v5 | All API data (products, inquiries, orders, messages, notifications) | Query cache with configurable staleTime |
| Client State | Zustand 4 | UI state, auth session metadata, RFQ cart draft | authStore + rfqStore: localStorage; uiStore + chatStore: memory only |
| URL State | React Router v6 `useSearchParams` | Catalog filters, search queries, pagination, sort | URL (shareable, back-button friendly) |

**React Query Configuration:**

```typescript
// src/lib/api/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,         // 5 minutes default
      gcTime: 30 * 60 * 1000,            // 30 minutes garbage collection
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});
```

**Per-domain staleTime configuration:**

| Query | staleTime | Rationale |
|-------|-----------|-----------|
| `['categories']` | 30 min | Categories change very rarely |
| `['brands']` | 30 min | Brand list is near-static |
| `['products', filters]` | 10 min | Product catalog updates via daily scraping |
| `['product', id]` | 10 min | Individual product data |
| `['product', id, 'prices']` | 5 min | Price data updates daily |
| `['inquiries', 'mine']` | 30 sec | Active inquiries -- quotes arriving in real-time |
| `['inquiry', id]` | 15 sec | Individual inquiry -- quotes arriving |
| `['rfqs', 'mine']` | 1 min | RFQ list |
| `['rfq', id]` | 30 sec | Active RFQ detail |
| `['orders', 'mine']` | 2 min | Order list |
| `['order', id]` | 1 min | Active order tracking |
| `['conversations']` | 0 | Always refetch (real-time via socket supplements) |
| `['messages', convId]` | 0 | Always refetch |
| `['notifications']` | 0 | Always refetch |
| `['dealer', 'dashboard']` | 2 min | Dealer dashboard summary |
| `['admin', 'dashboard']` | 1 min | Admin metrics |
| `['search', query]` | 3 min | Search results |
| `['autocomplete', query]` | 1 min | Autocomplete suggestions |

**Query key constants (prevent typos, enable typed invalidation):**

```typescript
// src/lib/constants/queryKeys.ts

export const queryKeys = {
  // Catalog
  categories: ['categories'] as const,
  brands: ['brands'] as const,
  brand: (slug: string) => ['brands', slug] as const,
  products: (filters: ProductFilters) => ['products', filters] as const,
  product: (id: string) => ['product', id] as const,
  productPrices: (id: string) => ['product', id, 'prices'] as const,
  productReviews: (id: string) => ['product', id, 'reviews'] as const,
  productAlternatives: (id: string) => ['product', id, 'alternatives'] as const,
  compare: (ids: string[]) => ['compare', ...ids.sort()] as const,
  search: (q: string, filters?: SearchFilters) => ['search', q, filters] as const,
  autocomplete: (q: string) => ['autocomplete', q] as const,
  trending: (category?: string) => ['trending', category] as const,
  priceIndex: (period?: string) => ['priceIndex', period] as const,

  // Inquiries
  myInquiries: (filters?: InquiryFilters) => ['inquiries', 'mine', filters] as const,
  inquiry: (id: string) => ['inquiry', id] as const,
  inquiryQuotes: (id: string) => ['inquiry', id, 'quotes'] as const,
  inquiryEvaluation: (id: string) => ['inquiry', id, 'evaluation'] as const,

  // RFQs
  myRfqs: (filters?: RfqFilters) => ['rfqs', 'mine', filters] as const,
  rfq: (id: string) => ['rfq', id] as const,
  dealerRfqs: (filters?: RfqFilters) => ['rfqs', 'dealer', filters] as const,

  // Orders
  myOrders: (filters?: OrderFilters) => ['orders', 'mine', filters] as const,
  order: (id: string) => ['order', id] as const,

  // Messaging
  conversations: ['conversations'] as const,
  messages: (convId: string) => ['messages', convId] as const,
  unreadMessages: ['messages', 'unread'] as const,

  // Notifications
  notifications: (filters?: NotifFilters) => ['notifications', filters] as const,
  unreadNotifications: ['notifications', 'unread'] as const,

  // Dealer
  dealerDashboard: ['dealer', 'dashboard'] as const,
  dealerInventory: (filters?: InventoryFilters) => ['dealer', 'inventory', filters] as const,
  dealerAnalytics: (period?: string) => ['dealer', 'analytics', period] as const,
  dealerSubscription: ['dealer', 'subscription'] as const,
  dealerKycStatus: ['dealer', 'kyc'] as const,
  dealerInquiries: (filters?: InquiryFilters) => ['dealer', 'inquiries', filters] as const,

  // Community
  feed: (sortBy?: string) => ['community', 'feed', sortBy] as const,
  post: (id: string) => ['community', 'post', id] as const,
  postComments: (postId: string) => ['community', 'post', postId, 'comments'] as const,

  // AI
  aiConversations: ['ai', 'conversations'] as const,
  pricePrediction: (productId: string) => ['ai', 'prediction', productId] as const,
  recommendations: (context?: string) => ['ai', 'recommendations', context] as const,

  // Admin
  adminDashboard: ['admin', 'dashboard'] as const,
  adminUsers: (filters?: UserFilters) => ['admin', 'users', filters] as const,
  adminDealerQueue: ['admin', 'dealers', 'verification'] as const,
  adminDisputes: (filters?: DisputeFilters) => ['admin', 'disputes', filters] as const,
  adminAuditLog: (filters?: AuditFilters) => ['admin', 'audit', filters] as const,
  adminFeatureFlags: ['admin', 'featureFlags'] as const,

  // User
  currentUser: ['auth', 'me'] as const,
  userProfile: ['user', 'profile'] as const,
  userAddresses: ['user', 'addresses'] as const,
  userPreferences: ['user', 'preferences'] as const,
  userActivity: ['user', 'activity'] as const,
  paymentHistory: ['payments', 'history'] as const,

  // Analytics
  buyerAnalytics: (period?: string) => ['analytics', 'buyer', period] as const,
} as const;
```

---

### 14.1.4 API Client Architecture

```typescript
// src/lib/api/client.ts

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,     // send httpOnly refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach access token from Zustand store
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Attach request ID for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID();

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token is sent automatically via httpOnly cookie
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

The refresh queue pattern ensures that if multiple API calls fail simultaneously with 401, only one refresh request is sent. All queued requests retry with the new token.

---

## 14.2 Key Component Specifications

### 14.2.1 ProductDetailPage

```typescript
// src/pages/catalog/ProductDetailPage.tsx

interface RouteParams { productIdOrSlug: string }

// Data dependencies:
//   useProduct(id)             -- product data, specs, images
//   useProductPrices(id)       -- price history, prediction
//   useProductReviews(id)      -- reviews with pagination
//   useProductAlternatives(id) -- alternative products

// States:
//   Loading: full-page skeleton (image placeholder, spec rows, review placeholders)
//   Error:   PageErrorBoundary with retry button
//   Empty:   never (404 if product not found)
//   Success: full product page

// Layout:
//   Mobile (< 768px):
//     - Image gallery (swipeable carousel, full-width)
//     - Product name + brand
//     - Price section (MRP, dealer range, savings badge)
//     - Sticky bottom bar: "Get Quote" CTA button
//     - Specifications accordion
//     - Reviews section
//     - Alternatives carousel
//   Desktop (>= 768px):
//     - 2-column: images left (sticky), info right (scrollable)
//     - Tab navigation: Specifications | Price History | Reviews | Alternatives
//     - Sidebar CTA: "Get Quote" card (sticky)

// Accessibility:
//   - Image alt text from product.images[].alt
//   - Price announced with aria-label including savings
//   - Tab navigation keyboard accessible
//   - Review star rating with aria-valuenow

// Key interactions:
//   - "Get Quote" -> opens InquiryForm modal (or redirects to /dashboard/inquiries/new?product=<id>)
//   - "Add to Compare" -> adds to uiStore.compareProducts (max 4)
//   - "Save" -> toggles saved state via useSaveProduct mutation
//   - Share button -> copies URL to clipboard
//   - Image click -> fullscreen lightbox
```

### 14.2.2 InquiryDetailPage (Buyer View)

```typescript
// src/pages/dashboard/inquiries/InquiryDetailPage.tsx

interface RouteParams { id: string }

// Data dependencies:
//   useInquiry(id)             -- inquiry detail with anonymous quotes
//   useInquiryEvaluation(id)   -- AI ranking of quotes

// States:
//   Loading: skeleton with inquiry header + quote placeholders
//   Error:   PageErrorBoundary with retry
//   No Quotes: empty state illustration -- "Waiting for dealer responses. You'll be notified."
//   Quotes Received: quote cards ranked by AI score

// Layout:
//   Mobile:
//     - Inquiry summary card (product, quantity, city, status)
//     - Quote count badge
//     - Stacked quote cards (sorted by AI rank)
//     - Each card: price, delivery, dealer metrics, score bar, "Select" button
//     - AI insight banner at top
//   Desktop:
//     - 3-column: inquiry summary left | quotes center | AI evaluation right

// BLIND MATCHING UI:
//   - Quote cards show "Dealer A", "Dealer B" -- never real names
//   - Dealer metrics shown as abstract stats (rating, orders, delivery %)
//   - No dealer logo, no business name, no location
//   - "Select Quote" button triggers IdentityRevealModal confirmation

// Key interactions:
//   - "Select Quote" -> IdentityRevealModal -> POST /inquiries/:id/select/:quoteId
//   - After selection: page refreshes to show full dealer details + conversation link
//   - Real-time: new quote arrives via Socket.io -> invalidates inquiry query -> re-renders
```

### 14.2.3 DealerDashboardPage

```typescript
// src/pages/dealer/DealerDashboardPage.tsx

// Data dependencies:
//   useDealerDashboard()       -- stats, recent activity, alerts, subscription

// States:
//   Loading: skeleton grid of stat cards + activity list
//   KYC Pending: full-page banner directing to onboarding
//   Verified: full dashboard

// Layout:
//   - Stat cards row: Active Inquiries, Pending Quotes, Active Orders, Monthly Revenue
//   - Alerts banner (if any: "3 inquiries pending", "Upgrade plan")
//   - Recent activity list (last 10 events)
//   - Quick actions: "View Inquiries", "Manage Inventory", "Analytics"
//   - Subscription status card

// Key interactions:
//   - Stat card click -> navigates to corresponding page
//   - Alert CTA -> navigates to relevant action
//   - "Upgrade" CTA -> opens subscription upgrade flow
```

---

## 14.3 Form Architecture

### 14.3.1 React Hook Form + Zod Pattern

Every form in the application follows this exact pattern:

```typescript
// Example: InquiryForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInquirySchema, type CreateInquiryInput } from '@/lib/validations/inquiry.schema';
import { useSubmitInquiry } from '@/hooks/api/useInquiries';
import { useToast } from '@/hooks/ui/useToast';

export function InquiryForm({ productId, onSuccess }: InquiryFormProps) {
  const { toast } = useToast();
  const submitInquiry = useSubmitInquiry();

  const form = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: {
      productId: productId ?? undefined,
      quantity: 1,
      deliveryCity: '',
      urgency: 'normal',
    },
  });

  async function onSubmit(data: CreateInquiryInput) {
    try {
      await submitInquiry.mutateAsync(data);
      toast({ title: 'Inquiry submitted', description: 'Dealers will be notified.' });
      onSuccess?.();
    } catch (error) {
      toast({ title: 'Failed to submit', description: 'Please try again.', variant: 'error' });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields using form.register() and form.formState.errors */}
    </form>
  );
}
```

**Rules:**
1. Every form has a corresponding Zod schema in `src/lib/validations/`
2. Zod schema is the single source of truth for validation
3. `zodResolver` connects Zod to React Hook Form
4. Mutations use React Query's `useMutation`
5. Success/error feedback via toast notifications
6. Submit button disabled during `mutation.isPending`

### 14.3.2 Multi-Step Form Pattern (Stepper)

Used for: dealer registration, KYC upload, RFQ creation.

```typescript
// Pattern: multi-step form with shared state

function DealerOnboardingForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<DealerRegistrationInput>>({});

  const steps = [
    { title: 'Business Info', component: BusinessInfoStep },
    { title: 'Contact Details', component: ContactDetailsStep },
    { title: 'Documents', component: DocumentsStep },
    { title: 'Review', component: ReviewStep },
  ];

  function handleStepComplete(stepData: Partial<DealerRegistrationInput>) {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  const CurrentStep = steps[step].component;

  return (
    <div>
      <Stepper steps={steps.map((s) => s.title)} currentStep={step} />
      <CurrentStep
        data={formData}
        onComplete={handleStepComplete}
        onBack={handleBack}
        isLastStep={step === steps.length - 1}
      />
    </div>
  );
}
```

### 14.3.3 File Upload Pattern

All file uploads use presigned S3 URLs:

```typescript
// src/lib/api/upload.api.ts

async function uploadFile(file: File, purpose: string): Promise<string> {
  // 1. Get presigned URL from backend
  const { data } = await apiClient.post('/uploads/presigned-url', {
    filename: file.name,
    contentType: file.type,
    purpose, // 'avatar', 'kyc', 'inquiry-photo', 'community-post'
  });

  // 2. Upload directly to S3
  await axios.put(data.data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (event) => {
      // report progress to caller
    },
  });

  // 3. Return the S3 key (not the full URL -- server constructs CDN URL)
  return data.data.key;
}
```

---

## 14.4 Real-Time Integration

### 14.4.1 Socket.io Client Setup

```typescript
// src/lib/socket/client.ts

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): void {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken || socket?.connected) return;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001', {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
    // If auth error, trigger token refresh
    if (error.message.includes('unauthorized')) {
      useAuthStore.getState().refreshAccessToken();
    }
  });
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
```

### 14.4.2 Socket Provider

```typescript
// src/app/providers/SocketProvider.tsx

import { createContext, useContext, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket/client';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/queryKeys';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
      socketRef.current = getSocket();

      // Global event listeners that invalidate React Query caches
      socketRef.current?.on('notification:new', () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socketRef.current?.on('message:new', ({ conversationId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadMessages });
      });

      socketRef.current?.on('inquiry:quote_received', ({ inquiryId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.inquiry(inquiryId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.inquiryQuotes(inquiryId) });
        queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      });

      socketRef.current?.on('rfq:quote_received', ({ rfqId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.rfq(rfqId) });
        queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      });

      socketRef.current?.on('order:status_changed', ({ orderId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      });

      socketRef.current?.on('dealer:inquiry_matched', () => {
        queryClient.invalidateQueries({ queryKey: ['dealer', 'inquiries'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.dealerDashboard });
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, queryClient]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
```

---

## 14.5 Performance Optimization

### 14.5.1 Code Splitting

Every route uses `React.lazy` via React Router's `lazy()` function (defined in SS14.1.1). This produces per-route chunks that are loaded on demand.

**Manual chunk splitting** (defined in `vite.config.ts`, see SS5.1.7):

| Chunk | Contents | Approximate Size |
|-------|----------|-----------------|
| `vendor-react` | React, ReactDOM, React Router | ~45KB gzipped |
| `vendor-query` | TanStack React Query | ~12KB gzipped |
| `vendor-ui` | Lucide icons, Recharts, React Hook Form | ~35KB gzipped |
| `vendor-utils` | Axios, date-fns, Zod, Zustand | ~18KB gzipped |
| (per-route) | Each page component | 5-30KB gzipped each |

**Target: Initial bundle (vendors + shell) < 150KB gzipped.** Each additional route adds 5-30KB loaded on demand.

### 14.5.2 Image Optimization

```typescript
// Pattern: responsive images with lazy loading and blur placeholder

function ProductImage({ src, alt, width, height }: ProductImageProps) {
  return (
    <img
      src={`${src}?w=${width}&q=80&f=webp`}
      srcSet={`
        ${src}?w=${Math.round(width * 0.5)}&q=80&f=webp ${Math.round(width * 0.5)}w,
        ${src}?w=${width}&q=80&f=webp ${width}w,
        ${src}?w=${width * 2}&q=80&f=webp ${width * 2}w
      `}
      sizes="(max-width: 768px) 100vw, 50vw"
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className="bg-primary-100"   // placeholder background while loading
    />
  );
}
```

Images served through CloudFront with automatic WebP conversion and resizing via Lambda@Edge or Cloudflare Image Resizing.

### 14.5.3 Virtual Scrolling

For long lists (dealer inventory, audit log, product search results with 500+ items):

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualProductList({ products }: { products: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,    // estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProductCard product={products[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 14.5.4 Memoization Guidelines

| Hook | When to Use | When NOT to Use |
|------|-------------|-----------------|
| `React.memo` | Component receives same props frequently but parent re-renders often (e.g., `ProductCard` in a list) | Components that always receive new props (e.g., form inputs that change on every keystroke) |
| `useMemo` | Expensive computation derived from props/state (e.g., sorting/filtering a large array, computing comparison data) | Simple derivations (string concatenation, boolean checks) |
| `useCallback` | Callback passed to a `React.memo` child or used as a `useEffect` dependency | Callbacks that are only used inline or in non-memoized children |

### 14.5.5 Prefetching

Hover-intent prefetching for catalog browsing:

```typescript
// On product card hover, prefetch product detail
function ProductCard({ product }: { product: ProductSummary }) {
  const queryClient = useQueryClient();

  function handleMouseEnter() {
    queryClient.prefetchQuery({
      queryKey: queryKeys.product(product.id),
      queryFn: () => api.catalog.getProduct(product.id),
      staleTime: 10 * 60 * 1000,
    });
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* card content */}
    </Link>
  );
}
```

---

## 14.6 Error Handling

### 14.6.1 Error Boundary Hierarchy

```
RootErrorBoundary (app/errors/RootErrorBoundary.tsx)
 └─ Shows full-page error with "Reload" button
 └─ Reports to Sentry with component stack

    PageErrorBoundary (app/errors/PageErrorBoundary.tsx)
     └─ Wraps each page route via layout
     └─ Shows page-level error card with "Retry" button
     └─ Preserves sidebar/navbar -- only content area shows error

        SectionErrorBoundary (app/errors/SectionErrorBoundary.tsx)
         └─ Wraps individual sections (e.g., reviews, alternatives)
         └─ Shows inline error card without disrupting the rest of the page
         └─ "Retry" re-mounts the section
```

### 14.6.2 API Error Handling

```typescript
// src/lib/api/errors.ts

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
  statusCode: number;
}

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    const apiError = error.response.data.error;
    return {
      code: apiError.code || 'UNKNOWN_ERROR',
      message: apiError.message || 'An unexpected error occurred',
      details: apiError.details,
      statusCode: error.response.status,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Check your internet connection.',
      statusCode: 0,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}
```

### 14.6.3 Offline Detection

```typescript
// src/hooks/ui/useOnlineStatus.ts

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

When offline: React Query returns cached data (via `networkMode: 'offlineFirst'`). Mutations are queued and replayed when online. A persistent banner shows "You're offline. Some features may be unavailable."

---

## 14.7 Testing Strategy

### 14.7.1 Unit Tests (Vitest + Testing Library)

```typescript
// Example: ProductCard.test.tsx

import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/features/catalog/ProductCard';
import { mockProduct } from '@/__mocks__/products';

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Havells MCB 32A Single Pole')).toBeInTheDocument();
    expect(screen.getByText('Rs 285')).toBeInTheDocument();
  });

  it('shows savings percentage', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/save up to 42%/i)).toBeInTheDocument();
  });

  it('does not show dealer names (blind matching)', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.queryByText('Sharma Electrical')).not.toBeInTheDocument();
  });
});
```

**Coverage targets:**
- Components: 80%+
- Hooks: 90%+
- Utils/validators: 95%+
- Stores: 85%+

### 14.7.2 Integration Tests (MSW)

```typescript
// Example: inquiry creation flow

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('/api/v1/inquiries', () => {
    return HttpResponse.json({
      success: true,
      data: { id: 'inq_test', inquiryNumber: 'HUB-INQ-TEST-0001', status: 'new' },
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

test('submitting inquiry shows success toast', async () => {
  render(<CreateInquiryPage />, { wrapper: TestProviders });

  // Fill form...
  await userEvent.type(screen.getByLabelText(/product name/i), 'Havells MCB 32A');
  await userEvent.type(screen.getByLabelText(/quantity/i), '500');
  await userEvent.type(screen.getByLabelText(/delivery city/i), 'Sri Ganganagar');

  // Submit
  await userEvent.click(screen.getByRole('button', { name: /submit inquiry/i }));

  // Verify success
  await waitFor(() => {
    expect(screen.getByText(/inquiry submitted/i)).toBeInTheDocument();
  });
});
```

### 14.7.3 E2E Tests (Playwright)

Critical paths to test end-to-end:

| Flow | Steps | Assertions |
|------|-------|------------|
| User Registration | Navigate to /auth/register -> fill form -> submit -> verify redirect to dashboard | User created, session active |
| Catalog Browsing | Navigate to /catalog -> click category -> filter by brand -> click product | Products load, filters work, product detail renders |
| Inquiry Creation | Login -> navigate to product -> click "Get Quote" -> fill inquiry -> submit | Inquiry created, redirects to inquiry detail |
| Quote Selection | Login -> go to inquiry with quotes -> review quotes -> select quote -> confirm | Identity revealed, conversation created, order created |
| Dealer Quote Submission | Login as dealer -> view matched inquiry -> submit quote -> verify success | Quote submitted, buyer notified |
| Payment Flow | Trigger subscription upgrade -> complete Razorpay test checkout -> verify activation | Payment recorded, subscription active |

### 14.7.4 Accessibility Testing

```typescript
// In Vitest/Testing Library tests:
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('ProductDetailPage has no accessibility violations', async () => {
  const { container } = render(<ProductDetailPage />, { wrapper: TestProviders });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

Accessibility requirements:
- All interactive elements keyboard-navigable
- All images have alt text
- Color contrast ratio >= 4.5:1 (WCAG AA)
- ARIA labels on icon-only buttons
- Focus management on modal open/close
- Screen reader announcements on dynamic content (toast, quote received)

---

## 14.8 Build & Bundle Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial bundle (gzipped) | < 150KB | Vite build output + `vite-bundle-visualizer` |
| Largest route chunk | < 50KB gzipped | Per-route code split analysis |
| Time to Interactive (4G) | < 3.5s | Lighthouse CI |
| First Contentful Paint | < 1.8s | Lighthouse CI |
| Largest Contentful Paint | < 2.5s | Lighthouse CI |
| Cumulative Layout Shift | < 0.1 | Lighthouse CI |
| Total JavaScript (parsed) | < 500KB | Chrome DevTools Coverage |
| Image budget per page | < 1MB total | Automated audit |

Build is monitored in CI via `vite-bundle-visualizer` and Lighthouse CI on every PR. If any metric regresses beyond threshold, the PR is blocked.

---

*End of Sections 13 & 14. For database schemas referenced in API endpoints, see section-05-06-techstack-database.md SS6.2. For security policies on authentication and authorization, see section-07-08-security-ai.md SS7. For AI agent details on Volt, negotiation, and BOQ generation, see section-09-10-agents-design.md SS9.*
