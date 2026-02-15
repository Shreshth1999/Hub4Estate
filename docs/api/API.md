# Hub4Estate API Documentation

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.yourdomain.com/api`

## Authentication

Hub4Estate uses multiple authentication methods:

### 1. Google OAuth 2.0

Primary authentication method for users.

**Flow:**
```
1. Redirect to: GET /api/auth/google
2. User authorizes on Google
3. Callback to: GET /api/auth/google/callback
4. Session created with JWT token
```

### 2. JWT Tokens

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

### 3. OTP Verification

Phone number verification using one-time passwords.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## HTTP Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request (resource created)
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

- **Limit**: 1000 requests per 15 minutes per IP address
- **Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## API Endpoints

### Health Check

#### GET /health

Check API health and database connectivity.

**Authentication**: None

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-19T10:30:00.000Z"
}
```

---

## Authentication Routes

### Google OAuth Login

#### GET /api/auth/google

Initiates Google OAuth flow.

**Authentication**: None

**Response**: Redirects to Google OAuth consent screen

---

#### GET /api/auth/google/callback

Google OAuth callback endpoint.

**Authentication**: None

**Query Parameters**:
- `code` - Authorization code from Google

**Response**: Redirects to frontend with session

---

### OTP Authentication

#### POST /api/auth/otp/send

Send OTP to phone number.

**Authentication**: None

**Request Body**:
```json
{
  "phone": "+919876543210",
  "type": "login"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

---

#### POST /api/auth/otp/verify

Verify OTP code.

**Authentication**: None

**Request Body**:
```json
{
  "phone": "+919876543210",
  "code": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "name": "John Doe"
  }
}
```

---

### Get Current User

#### GET /api/auth/me

Get currently authenticated user.

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "INDIVIDUAL_HOME_BUILDER",
    "city": "Mumbai"
  }
}
```

---

### Logout

#### POST /api/auth/logout

Logout current user.

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Product Routes

### Get All Products

#### GET /api/products

Get paginated list of products with filters.

**Authentication**: None

**Query Parameters**:
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `brandId` (string) - Filter by brand
- `categoryId` (string) - Filter by category
- `search` (string) - Search by name or model
- `isActive` (boolean) - Filter by active status

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Havells MCB 32A 2-Pole",
        "modelNumber": "DHMGCXXTN032",
        "sku": "HAV-MCB-32-2P",
        "brand": {
          "id": "uuid",
          "name": "Havells",
          "logo": "https://..."
        },
        "productType": {
          "id": "uuid",
          "name": "MCB 2-Pole"
        },
        "images": ["https://..."],
        "specifications": {
          "poles": 2,
          "rating": "32A",
          "voltage": "230V"
        },
        "warrantyYears": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### Get Product by ID

#### GET /api/products/:id

Get detailed product information.

**Authentication**: None

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Havells MCB 32A 2-Pole",
    "description": "Miniature Circuit Breaker...",
    "modelNumber": "DHMGCXXTN032",
    "sku": "HAV-MCB-32-2P",
    "brand": { ... },
    "productType": { ... },
    "images": ["https://..."],
    "datasheetUrl": "https://...",
    "manualUrl": "https://...",
    "specifications": { ... },
    "certifications": ["ISI", "IEC"],
    "warrantyYears": 5,
    "isActive": true
  }
}
```

---

### Search Products

#### POST /api/products/search

Advanced product search.

**Authentication**: None

**Request Body**:
```json
{
  "query": "MCB 32A",
  "filters": {
    "brandIds": ["uuid1", "uuid2"],
    "categoryId": "uuid",
    "priceSegment": "Mid-range"
  },
  "page": 1,
  "limit": 20
}
```

**Response**: Similar to GET /api/products

---

### Get Categories

#### GET /api/products/categories

Get all product categories with subcategories.

**Authentication**: None

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Protection Devices",
      "slug": "protection-devices",
      "icon": "shield",
      "subCategories": [
        {
          "id": "uuid",
          "name": "MCBs",
          "slug": "mcbs",
          "productTypes": [
            {
              "id": "uuid",
              "name": "MCB 2-Pole",
              "slug": "mcb-2-pole"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## RFQ Routes

### Create RFQ

#### POST /api/rfq

Create a new Request for Quotation.

**Authentication**: Required (User)

**Request Body**:
```json
{
  "title": "Electrical Materials for 3BHK",
  "description": "Need MCBs, switches, and wiring",
  "deliveryCity": "Mumbai",
  "deliveryPincode": "400001",
  "deliveryAddress": "123 Main Street",
  "estimatedDate": "2025-02-01",
  "deliveryPreference": "delivery",
  "urgency": "normal",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "notes": "32A rating required"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Electrical Materials for 3BHK",
    "status": "DRAFT",
    "items": [ ... ],
    "createdAt": "2025-01-19T10:30:00.000Z"
  }
}
```

---

### Publish RFQ

#### POST /api/rfq/:id/publish

Publish RFQ to dealers.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true,
  "message": "RFQ published successfully",
  "data": {
    "id": "uuid",
    "status": "PUBLISHED",
    "publishedAt": "2025-01-19T10:30:00.000Z",
    "matchedDealers": 5
  }
}
```

---

### Get User RFQs

#### GET /api/rfq/user/:userId

Get all RFQs for a user.

**Authentication**: Required (User - own RFQs only)

**Query Parameters**:
- `status` (string) - Filter by status
- `page` (number)
- `limit` (number)

**Response**:
```json
{
  "success": true,
  "data": {
    "rfqs": [
      {
        "id": "uuid",
        "title": "Electrical Materials for 3BHK",
        "status": "QUOTES_RECEIVED",
        "publishedAt": "2025-01-19T10:30:00.000Z",
        "quotesCount": 3,
        "items": [ ... ]
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Get RFQ with Quotes

#### GET /api/rfq/:id/quotes

Get RFQ with all received quotes.

**Authentication**: Required (User - owner only)

**Response**:
```json
{
  "success": true,
  "data": {
    "rfq": { ... },
    "quotes": [
      {
        "id": "uuid",
        "dealer": {
          "businessName": "ABC Electricals",
          "city": "Mumbai",
          "rating": 4.5
        },
        "totalAmount": 15000,
        "shippingCost": 500,
        "deliveryDate": "2025-01-25",
        "items": [ ... ],
        "status": "SUBMITTED",
        "submittedAt": "2025-01-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

## Quote Routes

### Submit Quote

#### POST /api/quotes

Dealer submits quote for an RFQ.

**Authentication**: Required (Dealer)

**Request Body**:
```json
{
  "rfqId": "uuid",
  "totalAmount": 15000,
  "shippingCost": 500,
  "notes": "All items in stock",
  "deliveryDate": "2025-01-25",
  "validUntil": "2025-01-30",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "unitPrice": 150,
      "totalPrice": 1500
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rfqId": "uuid",
    "totalAmount": 15000,
    "status": "SUBMITTED",
    "submittedAt": "2025-01-20T10:00:00.000Z"
  }
}
```

---

### Get Dealer Quotes

#### GET /api/quotes/dealer/:dealerId

Get all quotes submitted by a dealer.

**Authentication**: Required (Dealer - own quotes only)

**Query Parameters**:
- `status` (string)
- `page` (number)
- `limit` (number)

**Response**:
```json
{
  "success": true,
  "data": {
    "quotes": [ ... ],
    "pagination": { ... }
  }
}
```

---

## Dealer Routes

### Register Dealer

#### POST /api/dealer/register

Register new dealer account.

**Authentication**: None

**Request Body**:
```json
{
  "email": "dealer@example.com",
  "password": "securepassword",
  "businessName": "ABC Electricals",
  "ownerName": "John Doe",
  "phone": "+919876543210",
  "gstNumber": "27AAPFU0939F1ZV",
  "panNumber": "AAPFU0939F",
  "shopAddress": "123 Shop Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "dealer@example.com",
    "businessName": "ABC Electricals",
    "status": "PENDING_VERIFICATION",
    "onboardingStep": 1
  }
}
```

---

### Upload Dealer Documents

#### POST /api/dealer/:id/documents

Upload verification documents.

**Authentication**: Required (Dealer - own account only)

**Request**: Multipart form data

**Fields**:
- `gstDocument` (file) - GST certificate
- `panDocument` (file) - PAN card
- `shopLicense` (file) - Shop license
- `cancelledCheque` (file) - Bank proof
- `shopPhoto` (file) - Shop image

**Response**:
```json
{
  "success": true,
  "data": {
    "gstDocument": "uploads/dealer-documents/gst-uuid.pdf",
    "panDocument": "uploads/dealer-documents/pan-uuid.pdf",
    "status": "UNDER_REVIEW"
  }
}
```

---

### Update Dealer Profile

#### PUT /api/dealer/:id

Update dealer profile information.

**Authentication**: Required (Dealer - own account only)

**Request Body**:
```json
{
  "dealerType": "DISTRIBUTOR",
  "yearsInOperation": 10,
  "serviceAreas": ["400001", "400002", "400003"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "dealerType": "DISTRIBUTOR",
    "profileComplete": true,
    "onboardingStep": 5
  }
}
```

---

### Get Dealer Profile

#### GET /api/dealer/:id

Get dealer profile details.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessName": "ABC Electricals",
    "city": "Mumbai",
    "dealerType": "RETAILER",
    "status": "VERIFIED",
    "brands": [ ... ],
    "categories": [ ... ],
    "serviceAreas": ["400001", "400002"],
    "performanceMetrics": {
      "totalRFQsReceived": 50,
      "totalQuotesSubmitted": 45,
      "conversionRate": 0.25
    }
  }
}
```

---

## Admin Routes

### Verify Dealer

#### PUT /api/admin/dealers/:id/verify

Approve or reject dealer verification.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "action": "approve",
  "notes": "All documents verified"
}
```

**Or**:
```json
{
  "action": "reject",
  "reason": "Invalid GST certificate"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "VERIFIED",
    "verifiedAt": "2025-01-19T10:30:00.000Z",
    "verifiedBy": "admin_uuid"
  }
}
```

---

### Get Dashboard Analytics

#### GET /api/admin/dashboard

Get admin dashboard statistics.

**Authentication**: Required (Admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "newThisMonth": 85
    },
    "dealers": {
      "total": 150,
      "verified": 120,
      "pending": 30
    },
    "rfqs": {
      "total": 500,
      "active": 75,
      "completed": 400
    },
    "quotes": {
      "total": 1500,
      "avgResponseTime": 240
    }
  }
}
```

---

## Inquiry Routes

### Submit Product Inquiry

#### POST /api/inquiry

Submit quick product inquiry.

**Authentication**: None

**Request**: Multipart form data

**Fields**:
- `name` (string) - Customer name
- `phone` (string) - Contact phone
- `email` (string) - Contact email (optional)
- `productPhoto` (file) - Product image
- `modelNumber` (string) - Product model (optional)
- `quantity` (number) - Quantity needed
- `deliveryCity` (string) - Delivery location
- `notes` (string) - Additional notes (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "inquiryNumber": "HUB-HAVELLS-MCB-0001",
    "status": "new",
    "trackingUrl": "/track/HUB-HAVELLS-MCB-0001"
  }
}
```

---

### Track Inquiry

#### GET /api/inquiry/track/:trackingCode

Track inquiry status.

**Authentication**: None

**Response**:
```json
{
  "success": true,
  "data": {
    "inquiryNumber": "HUB-HAVELLS-MCB-0001",
    "status": "quoted",
    "submittedAt": "2025-01-19T10:00:00.000Z",
    "respondedAt": "2025-01-19T14:30:00.000Z",
    "quote": {
      "quotedPrice": 150,
      "shippingCost": 50,
      "totalPrice": 200,
      "estimatedDelivery": "3-5 business days"
    }
  }
}
```

---

## Inquiry Pipeline Routes (Admin)

### Get Pipeline Inquiries

#### GET /api/inquiry-pipeline

Get all inquiries with pipeline status.

**Authentication**: Required (Admin)

**Query Parameters**:
- `status` (string) - Filter by pipeline status
- `page` (number)
- `limit` (number)

**Response**:
```json
{
  "success": true,
  "data": {
    "pipelines": [
      {
        "id": "uuid",
        "inquiry": { ... },
        "identifiedBrand": "Havells",
        "identifiedProduct": "MCB",
        "status": "DEALERS_FOUND",
        "dealerQuotes": [
          {
            "dealerName": "XYZ Electricals",
            "dealerPhone": "+919876543210",
            "responseStatus": "PENDING"
          }
        ]
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Update Dealer Quote Status

#### PUT /api/inquiry-pipeline/:pipelineId/quote/:quoteId

Update dealer quote response.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "responseStatus": "QUOTED",
  "quotedPrice": 150,
  "shippingCost": 50,
  "deliveryDays": 5,
  "warrantyInfo": "5 years manufacturer warranty",
  "quoteNotes": "All items in stock"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "responseStatus": "QUOTED",
    "quotedPrice": 150,
    "totalQuotedPrice": 200
  }
}
```

---

## Brand Dealer Routes (Admin)

### Add Brand Dealer

#### POST /api/brand-dealers

Add external dealer contact for a brand.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "brandId": "uuid",
  "name": "Rajesh Kumar",
  "shopName": "Kumar Electricals",
  "phone": "+919876543210",
  "whatsappNumber": "+919876543210",
  "email": "kumar@example.com",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "address": "Shop 5, Market Road",
  "source": "BRAND_WEBSITE",
  "sourceUrl": "https://havells.com/dealers"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rajesh Kumar",
    "shopName": "Kumar Electricals",
    "phone": "+919876543210",
    "city": "Mumbai",
    "isActive": true
  }
}
```

---

## Community Routes

### Create Post

#### POST /api/community/posts

Create a new community post.

**Authentication**: Required (User)

**Request Body**:
```json
{
  "title": "Best MCB brands for home?",
  "content": "I'm renovating my 2BHK. Which MCB brand would you recommend?",
  "city": "Mumbai",
  "category": "Product Discussion",
  "tags": ["MCB", "renovation"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Best MCB brands for home?",
    "status": "PUBLISHED",
    "upvotes": 0,
    "createdAt": "2025-01-19T10:30:00.000Z"
  }
}
```

---

### Get Posts

#### GET /api/community/posts

Get community posts with pagination.

**Authentication**: None

**Query Parameters**:
- `category` (string)
- `city` (string)
- `tag` (string)
- `page` (number)
- `limit` (number)

**Response**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "Best MCB brands for home?",
        "content": "...",
        "author": {
          "name": "John Doe",
          "city": "Mumbai"
        },
        "upvotes": 15,
        "commentsCount": 5,
        "createdAt": "2025-01-19T10:30:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## Contact Routes

### Submit Contact Form

#### POST /api/contact

Submit contact form inquiry.

**Authentication**: None

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "role": "homeowner",
  "message": "I'm interested in partnering with Hub4Estate..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for contacting us. We'll get back to you soon.",
  "data": {
    "id": "uuid",
    "status": "new"
  }
}
```

---

## Scraper Routes (Admin)

### Trigger Brand Scrape

#### POST /api/scraper/brands/:brandId/scrape

Trigger product scraping for a brand.

**Authentication**: Required (Admin)

**Response**:
```json
{
  "success": true,
  "message": "Scrape job initiated",
  "data": {
    "jobId": "uuid",
    "status": "PENDING"
  }
}
```

---

### Get Scrape Job Status

#### GET /api/scraper/jobs/:jobId

Get scrape job progress.

**Authentication**: Required (Admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "brandName": "Havells",
    "status": "IN_PROGRESS",
    "productsFound": 150,
    "productsCreated": 120,
    "productsUpdated": 20,
    "errors": 10,
    "startedAt": "2025-01-19T10:00:00.000Z"
  }
}
```

---

## Database Utility Routes (Admin)

### Database Statistics

#### GET /api/database/stats

Get database statistics.

**Authentication**: Required (Admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "users": 1250,
    "dealers": 150,
    "products": 5000,
    "rfqs": 500,
    "quotes": 1500,
    "inquiries": 350
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid or expired JWT token |
| `AUTH_002` | Insufficient permissions |
| `AUTH_003` | OTP expired or invalid |
| `VAL_001` | Missing required field |
| `VAL_002` | Invalid field format |
| `VAL_003` | Field value out of range |
| `RES_001` | Resource not found |
| `RES_002` | Resource already exists |
| `RES_003` | Resource conflict |
| `SYS_001` | Database error |
| `SYS_002` | External service error |

---

## Webhooks (Future)

Planned webhook support for:
- RFQ published
- Quote received
- Dealer verified
- Payment completed

---

## Changelog

### Version 1.0 (2025-01-19)
- Initial API release
- Authentication endpoints
- Product catalog
- RFQ/Quote system
- Dealer management
- Community features
- Inquiry pipeline
- Admin operations

---

For more information, see:
- [Architecture Documentation](../architecture/ARCHITECTURE.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [Deployment Guide](../DEPLOYMENT.md)
