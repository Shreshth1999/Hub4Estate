# Hub4Estate Architecture

## Overview

Hub4Estate is a full-stack web application built as a monorepo using modern technologies. The system follows a three-tier architecture with a React frontend, Express.js backend, and PostgreSQL database.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                          │
│                    (React + Vite)                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Pages    │  │ Components │  │  State (Zustand) │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS/REST API
┌───────────────────────▼─────────────────────────────────┐
│                        Backend                           │
│                  (Express + TypeScript)                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Routes   │→ │  Services  │→ │  Prisma Client   │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
│  ┌────────────┐  ┌────────────┐                         │
│  │ Middleware │  │   Config   │                         │
│  └────────────┘  └────────────┘                         │
└───────────────────────┬─────────────────────────────────┘
                        │ SQL
┌───────────────────────▼─────────────────────────────────┐
│                      Database                            │
│                   (PostgreSQL)                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Users │ Products │ Dealers │ RFQs │ Inquiries ... │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **React Router v6**: Client-side routing
- **React Query**: Server state management
- **Axios**: HTTP client
- **Shadcn/UI**: Component library

### Backend

- **Node.js 20**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **Prisma ORM**: Database toolkit
- **Passport.js**: Authentication middleware
- **JWT**: Token-based authentication
- **Express Validator**: Input validation
- **Helmet**: Security headers
- **Express Rate Limit**: API rate limiting
- **Multer**: File upload handling

### Database

- **PostgreSQL 14+**: Relational database
- **Prisma Migrations**: Schema versioning

### External Services

- **Google OAuth**: Authentication provider
- **Anthropic Claude**: AI assistant
- **Resend**: Email service
- **MSG91 / Twilio**: SMS service
- **Cheerio**: Web scraping

### DevOps

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and static file serving
- **Git**: Version control

## System Components

### Frontend Architecture

#### Component Structure

```
src/
├── components/
│   ├── layouts/          # Layout wrappers
│   │   ├── AdminLayout.tsx
│   │   └── UserLayout.tsx
│   ├── ui/              # Base UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── [feature-specific]/
│       └── FeatureComponent.tsx
├── pages/               # Route-level components
│   ├── auth/
│   ├── dealer/
│   ├── admin/
│   └── products/
├── lib/                 # Utilities and configuration
│   ├── api.ts          # API client
│   └── store.ts        # Zustand store
└── App.tsx             # Root component
```

#### State Management

- **Zustand**: Global application state (user, cart, UI state)
- **React Query**: Server data caching and synchronization
- **Local State**: Component-specific state with useState

#### Routing

- **React Router**: Client-side routing with protected routes
- **Authentication Guard**: ProtectedRoute component checks auth status
- **Role-Based Routes**: Admin, Dealer, User specific routes

### Backend Architecture

#### Layered Architecture

```
src/
├── config/              # Configuration modules
│   ├── database.ts     # Prisma client
│   ├── env.ts          # Environment variables
│   └── passport.ts     # Authentication strategies
├── middleware/          # Express middleware
│   ├── auth.ts         # JWT verification
│   └── validation.ts   # Input validation
├── routes/              # API route handlers
│   ├── auth.routes.ts
│   ├── products.routes.ts
│   ├── dealer.routes.ts
│   └── ...
├── services/            # Business logic layer
│   ├── email.service.ts
│   ├── ai.service.ts
│   └── ...
└── index.ts             # Application entry point
```

#### Request Flow

```
Client Request
    ↓
Express Middleware Stack
    ↓ (helmet, cors, rate-limit, body-parser)
Authentication Middleware (if protected route)
    ↓
Input Validation Middleware
    ↓
Route Handler
    ↓
Service Layer (business logic)
    ↓
Prisma Client (database operations)
    ↓
Database (PostgreSQL)
    ↓
Response ← (JSON)
```

## Design Patterns

### Repository Pattern

Prisma serves as the data access layer, abstracting database operations:

```typescript
// Service uses Prisma client
async function createDealer(data: DealerInput) {
  return await prisma.dealer.create({
    data,
  });
}
```

### Service Layer Pattern

Business logic separated from route handlers:

```typescript
// Route handler
router.post('/dealers', async (req, res) => {
  const dealer = await dealerService.create(req.body);
  res.json(dealer);
});

// Service
class DealerService {
  async create(data: DealerInput) {
    // Business logic, validation, database operations
  }
}
```

### Middleware Pattern

Cross-cutting concerns handled via middleware:

```typescript
app.use(helmet()); // Security headers
app.use(cors()); // CORS configuration
app.use(authMiddleware); // Authentication
app.use(validationMiddleware); // Input validation
```

### HOC Pattern (Frontend)

Higher-Order Components for shared functionality:

```typescript
// ProtectedRoute wraps routes requiring authentication
<ProtectedRoute>
  <AdminDashboard />
</ProtectedRoute>
```

## Data Flow

### Authentication Flow

```
1. User clicks "Login with Google"
2. Frontend redirects to /api/auth/google
3. Backend redirects to Google OAuth
4. User authorizes on Google
5. Google redirects to /api/auth/google/callback
6. Backend creates JWT token and session
7. Frontend stores token in localStorage
8. Subsequent requests include token in Authorization header
```

### RFQ Submission Flow

```
1. User fills RFQ form
2. Frontend validates input
3. POST /api/rfq with form data
4. Backend validates with express-validator
5. Backend creates RFQ record in database
6. Backend sends email notifications to matched dealers
7. Backend returns RFQ object
8. Frontend shows success message
9. User redirected to RFQ tracking page
```

### Dealer Verification Flow

```
1. Dealer registers with documents
2. File upload via multer middleware
3. Files stored in /backend/uploads/
4. Dealer status: PENDING_VERIFICATION
5. Admin reviews in admin dashboard
6. Admin approves/rejects
7. PUT /api/admin/dealers/:id/verify
8. Dealer status updated to VERIFIED
9. Email sent to dealer
10. Dealer can now receive RFQs
```

### Inquiry Pipeline Flow

```
1. User submits product inquiry
2. Inquiry created with status: NEW
3. Activity logged via activity.service
4. Inquiry appears in dealer dashboard
5. Dealer responds to inquiry
6. Status updated: NEW → CONTACTED → QUOTED → WON/LOST
7. Each status change logged in activity
8. User can track via tracking code
```

## Security Architecture

### Authentication Layers

1. **Google OAuth 2.0**: Primary authentication method
2. **JWT Tokens**: Stateless authentication for API requests
3. **Session Cookies**: Stateful session management
4. **OTP Verification**: Phone number verification

### Authorization

- **Role-Based Access Control (RBAC)**:
  - USER: Browse products, submit RFQs
  - DEALER: Receive RFQs, submit quotes
  - ADMIN: Full system access

### Data Protection

- **Input Validation**: All inputs validated server-side
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: React's built-in escaping + Helmet
- **CSRF Protection**: SameSite cookies
- **Rate Limiting**: 1000 requests/15min per IP

### File Upload Security

- File type validation (MIME type checking)
- File size limits (5MB max)
- Sanitized file names
- Isolated storage directory
- No code execution

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema documentation.

### Key Entities

- **User**: Authentication and profile data
- **Dealer**: Dealer profiles and verification
- **Product**: Product catalog with categories
- **RFQ**: Request for quotation submissions
- **Quote**: Dealer quotes for RFQs
- **Inquiry**: Product inquiries with pipeline tracking
- **Community**: Forum posts and comments
- **Chat**: Real-time messaging

### Relationships

```
User ──< RFQ ──< Quote >── Dealer
User ──< Inquiry >── Product
User ──< CommunityPost ──< CommunityComment
User >──< ChatMessage <── User
Dealer ──< DealerProduct >── Product
```

## API Design

### RESTful Principles

- **Resources**: Nouns in URLs (`/api/products`, `/api/dealers`)
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (error)
- **Versioning**: API version in path (`/api/v1/...`) when needed

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Format

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

## Scalability Considerations

### Database Optimization

- **Indexes**: Applied on frequently queried fields
- **Connection Pooling**: Configured via Prisma
- **Query Optimization**: Use of `select` and `include` for efficient queries
- **Pagination**: Implemented for large datasets

### Caching Strategy

- **Frontend**: React Query caching with stale-while-revalidate
- **Backend**: Potential for Redis caching layer
- **CDN**: Static assets served via CDN

### Horizontal Scaling

- **Stateless Backend**: JWT tokens enable multi-instance deployment
- **Load Balancer**: Nginx or cloud load balancer
- **Session Store**: Redis for distributed sessions
- **File Storage**: S3/GCS for uploads in distributed environment

### Performance

- **Code Splitting**: React lazy loading for routes
- **Bundle Optimization**: Vite tree-shaking and minification
- **Database Queries**: Optimized with proper indexes
- **Image Optimization**: Lazy loading and responsive images

## Monitoring and Logging

### Application Logging

- **Backend**: Console logging (structured logging recommended)
- **Frontend**: Error boundary for React errors
- **Database**: Prisma query logging in development

### Error Tracking

- **Recommended**: Sentry or similar for production error tracking
- **Log Aggregation**: CloudWatch, Datadog, or ELK stack

### Metrics

- API response times
- Database query performance
- Error rates
- User activity metrics

## Development Workflow

### Local Development

```bash
# Install dependencies
npm run install:all

# Run database
docker-compose up postgres -d

# Run migrations
npm run db:migrate

# Start dev servers
npm run dev
```

### Code Quality

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Git Hooks**: Pre-commit checks (recommended: Husky)

### Testing Strategy

- **Unit Tests**: Jest (backend), Vitest (frontend)
- **Integration Tests**: Supertest for API testing
- **E2E Tests**: Playwright or Cypress (recommended)
- **Manual Testing**: QA process before deployment

## Deployment Architecture

### Production Stack

```
┌──────────────┐
│   Vercel     │  Frontend (React app)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Render    │  Backend (Express API)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │  Database (Render/AWS RDS)
└──────────────┘
```

### CI/CD Pipeline

```
Git Push → GitHub
    ↓
GitHub Actions (CI)
    ├─ Lint
    ├─ Type Check
    ├─ Tests
    └─ Build
    ↓
Auto-Deploy
    ├─ Vercel (Frontend)
    └─ Render (Backend)
```

## Future Enhancements

### Short-term

- WebSocket integration for real-time features
- Advanced search with Elasticsearch
- Image optimization service
- Comprehensive test coverage

### Long-term

- Microservices architecture for high scale
- GraphQL API option
- Mobile app (React Native)
- Advanced analytics dashboard
- Multi-region deployment

## References

- [API Documentation](../api/API.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

Last Updated: 2025-01-19
