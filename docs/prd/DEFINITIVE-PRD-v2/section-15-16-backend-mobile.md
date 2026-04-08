# Hub4Estate Definitive PRD v2 -- Sections 15 & 16

> **Document**: section-15-16-backend-mobile  
> **Version**: 2.0.0  
> **Date**: 2026-04-08  
> **Author**: CTO Office, Hub4Estate  
> **Status**: Authoritative Reference  
> **Classification**: Internal -- Engineering  
> **Prerequisite Reading**: section-01 through section-14

---

# SECTION 15 -- BACKEND ARCHITECTURE

The backend is a modular monolith running on Node.js + Express + TypeScript. See section-03-04 Section 4.2 for the architectural philosophy and domain boundary definitions. This section covers the physical implementation: server configuration, middleware pipeline, route organization, service layer patterns, database access patterns, job processing, and error handling.

---

## 15.1 Server Configuration

### 15.1.1 Entry Point

```typescript
// packages/api/src/server.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error-handler.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { rateLimiter } from './middleware/rate-limiter.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { registerRoutes } from './routes';
import { initializeSocketIO } from './socket';
import { initializeJobQueues } from './jobs';
import { initializeCronJobs } from './cron';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

async function bootstrap() {
  const app = express();
  const httpServer = createServer(app);

  // Socket.io
  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Global middleware (order matters)
  app.use(requestIdMiddleware);
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
  app.use(helmet({
    contentSecurityPolicy: false, // CSP handled by frontend
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key', 'X-API-Version'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
    maxAge: 86400,
  }));
  app.use(compression({ threshold: 1024 }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(rateLimiter.global);

  // Health check (before auth)
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: env.APP_VERSION,
      environment: env.NODE_ENV,
    });
  });

  // Routes
  registerRoutes(app);

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Socket.io
  initializeSocketIO(io);

  // Background jobs
  await initializeJobQueues();
  initializeCronJobs();

  // Start server
  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Hub4Estate API server started');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');
    httpServer.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      logger.info('Server shut down gracefully');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
```

### 15.1.2 Environment Configuration

```typescript
// packages/api/src/config/env.ts

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  APP_VERSION: z.string().default('0.1.0'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('24h'),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // External Services
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  MSG91_AUTH_KEY: z.string(),
  MSG91_TEMPLATE_ID: z.string(),
  RESEND_API_KEY: z.string(),
  GUPSHUP_API_KEY: z.string().optional(),
  GUPSHUP_APP_NAME: z.string().optional(),
  ANTHROPIC_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  ELASTICSEARCH_URL: z.string().url().optional(),

  // Storage
  S3_BUCKET: z.string().default('hub4estate-uploads'),
  S3_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  CDN_URL: z.string().url().optional(),

  // Feature Flags
  ENABLE_PAYMENTS: z.coerce.boolean().default(false),
  ENABLE_WHATSAPP: z.coerce.boolean().default(false),
  ENABLE_AI_ASSISTANT: z.coerce.boolean().default(true),
  ENABLE_ELASTICSEARCH: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

### 15.1.3 Logger Configuration

```typescript
// packages/api/src/config/logger.ts

import pino from 'pino';
import { env } from './env';

const PII_PATTERNS = [
  /\b[6-9]\d{9}\b/g,                    // Indian phone numbers
  /\b\d{4}\s?\d{4}\s?\d{4}\b/g,         // Aadhaar patterns
  /\b[A-Z]{5}\d{4}[A-Z]\b/g,            // PAN numbers
  /\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d][A-Z]\b/g, // GSTIN
  /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g,       // Email addresses
];

function scrubPII(obj: unknown): unknown {
  if (typeof obj === 'string') {
    let scrubbed = obj;
    for (const pattern of PII_PATTERNS) {
      scrubbed = scrubbed.replace(pattern, '[REDACTED]');
    }
    return scrubbed;
  }
  if (Array.isArray(obj)) return obj.map(scrubPII);
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (['password', 'token', 'secret', 'otp', 'pan', 'aadhaar', 'gstin'].includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = scrubPII(value);
      }
    }
    return result;
  }
  return obj;
}

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label }),
    log: (obj) => scrubPII(obj) as Record<string, unknown>,
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.headers['x-request-id'],
      userAgent: req.headers['user-agent'],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[REDACTED]',
  },
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l' } }
    : undefined,
});
```

---

## 15.2 Middleware Pipeline

Request processing order (left to right):

```
Request → requestId → pinoHttp → helmet → cors → compression → bodyParser → rateLimiter → [route-specific: auth → rbac → validate] → controller → response
                                                                                                                                           ↓ (on error)
                                                                                                                                     errorHandler
```

### 15.2.1 Request ID Middleware

```typescript
// packages/api/src/middleware/request-id.middleware.ts

import { v7 as uuidv7 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string || `req_${uuidv7()}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
```

### 15.2.2 Auth Middleware

```typescript
// packages/api/src/middleware/auth.middleware.ts

import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

export interface AuthPayload {
  sub: string;
  email: string;
  role: 'buyer' | 'dealer' | 'admin';
  dealerId: string | null;
  iat: number;
  exp: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Missing or invalid authorization header', 401);
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'hub4estate',
      audience: 'hub4estate-api',
    }) as AuthPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      dealerId: payload.dealerId,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('TOKEN_EXPIRED', 'Access token has expired', 401);
    }
    throw new AppError('UNAUTHORIZED', 'Invalid access token', 401);
  }
}

// Optional auth: attach user if token present, continue if not
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }
  return authMiddleware(req, res, next);
}
```

### 15.2.3 RBAC Middleware

```typescript
// packages/api/src/middleware/rbac.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

type Role = 'buyer' | 'dealer' | 'admin';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role as Role)) {
      throw new AppError('FORBIDDEN', `This action requires one of: ${roles.join(', ')}`, 403);
    }
    next();
  };
}

// Shorthand for common role checks
export const requireBuyer = requireRole('buyer', 'admin');
export const requireDealer = requireRole('dealer', 'admin');
export const requireAdmin = requireRole('admin');
```

### 15.2.4 Validation Middleware

```typescript
// packages/api/src/middleware/validate.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../lib/errors';

interface ValidationSchemas {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...formatZodErrors(result.error, 'body'));
      } else {
        req.body = result.data; // Use parsed (transformed) data
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...formatZodErrors(result.error, 'query'));
      } else {
        req.query = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...formatZodErrors(result.error, 'params'));
      } else {
        req.params = result.data;
      }
    }

    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Request validation failed', 400, errors);
    }

    next();
  };
}

function formatZodErrors(error: ZodError, source: string) {
  return error.issues.map((issue) => ({
    field: `${source}.${issue.path.join('.')}`,
    message: issue.message,
    code: issue.code,
  }));
}
```

### 15.2.5 Error Handler

```typescript
// packages/api/src/middleware/error-handler.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../lib/errors';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || undefined,
      },
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'A record with this value already exists',
        },
        meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
        meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
      });
    }
  }

  // Unknown errors
  logger.error({ err, requestId: req.requestId, url: req.url, method: req.method }, 'Unhandled error');

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An internal error occurred'
        : err.message,
    },
    meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
  });
}
```

### 15.2.6 Idempotency Middleware

```typescript
// packages/api/src/middleware/idempotency.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import { logger } from '../config/logger';

const IDEMPOTENCY_TTL = 86400; // 24 hours

export function idempotency(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['idempotency-key'] as string;
  if (!key) return next();

  const cacheKey = `idempotency:${req.user?.id || 'anon'}:${key}`;

  // Check if we have a cached response
  redis.get(cacheKey).then((cached) => {
    if (cached) {
      const response = JSON.parse(cached);
      logger.info({ cacheKey, requestId: req.requestId }, 'Idempotent request served from cache');
      return res.status(response.statusCode).json(response.body);
    }

    // Intercept the response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      redis.setex(cacheKey, IDEMPOTENCY_TTL, JSON.stringify({
        statusCode: res.statusCode,
        body,
      })).catch((err) => logger.error({ err }, 'Failed to cache idempotent response'));
      return originalJson(body);
    };

    next();
  }).catch(next);
}
```

---

## 15.3 Route Organization

### 15.3.1 Route Registration

```typescript
// packages/api/src/routes/index.ts

import type { Express } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { catalogRoutes } from './catalog.routes';
import { inquiryRoutes } from './inquiry.routes';
import { quoteRoutes } from './quote.routes';
import { orderRoutes } from './order.routes';
import { paymentRoutes } from './payment.routes';
import { dealerRoutes } from './dealer.routes';
import { messagingRoutes } from './messaging.routes';
import { notificationRoutes } from './notification.routes';
import { pricingRoutes } from './pricing.routes';
import { projectRoutes } from './project.routes';
import { reviewRoutes } from './review.routes';
import { disputeRoutes } from './dispute.routes';
import { aiRoutes } from './ai.routes';
import { adminRoutes } from './admin.routes';

export function registerRoutes(app: Express) {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/catalog', catalogRoutes);
  app.use('/api/v1/inquiries', inquiryRoutes);
  app.use('/api/v1/quotes', quoteRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/dealer', dealerRoutes);
  app.use('/api/v1/conversations', messagingRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/pricing', pricingRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/disputes', disputeRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/admin', adminRoutes);
}
```

### 15.3.2 Route File Pattern

Every route file follows this exact pattern:

```typescript
// packages/api/src/routes/inquiry.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireBuyer } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { idempotency } from '../middleware/idempotency.middleware';
import { rateLimiter } from '../middleware/rate-limiter.middleware';
import { InquiryController } from '../controllers/inquiry.controller';
import {
  createInquirySchema,
  updateInquirySchema,
  listInquiriesQuerySchema,
  inquiryParamsSchema,
} from '../validations/inquiry.validation';

const router = Router();
const controller = new InquiryController();

router.post('/',
  authMiddleware,
  requireBuyer,
  rateLimiter.inquiryCreation,
  idempotency,
  validate({ body: createInquirySchema }),
  controller.create
);

router.get('/',
  authMiddleware,
  requireBuyer,
  validate({ query: listInquiriesQuerySchema }),
  controller.list
);

router.get('/:id',
  authMiddleware,
  requireBuyer,
  validate({ params: inquiryParamsSchema }),
  controller.getById
);

router.patch('/:id',
  authMiddleware,
  requireBuyer,
  validate({ params: inquiryParamsSchema, body: updateInquirySchema }),
  controller.update
);

router.delete('/:id',
  authMiddleware,
  requireBuyer,
  validate({ params: inquiryParamsSchema }),
  controller.cancel
);

router.post('/:id/close',
  authMiddleware,
  requireBuyer,
  validate({ params: inquiryParamsSchema }),
  controller.closeToReview
);

router.post('/:inquiryId/select/:quoteId',
  authMiddleware,
  requireBuyer,
  validate({ params: inquiryParamsSchema }),
  controller.selectWinner
);

export { router as inquiryRoutes };
```

---

## 15.4 Controller Layer

### 15.4.1 Controller Pattern

Controllers are thin. They extract input, call services, and format responses. No business logic in controllers.

```typescript
// packages/api/src/controllers/inquiry.controller.ts

import type { Request, Response, NextFunction } from 'express';
import { InquiryService } from '../services/inquiry.service';
import { BlindMatchService } from '../services/blind-match.service';
import { NotificationService } from '../services/notification.service';
import { successResponse, createdResponse, paginatedResponse } from '../lib/response';

export class InquiryController {
  private inquiryService = new InquiryService();
  private matchService = new BlindMatchService();
  private notificationService = new NotificationService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inquiry = await this.inquiryService.create({
        ...req.body,
        buyerId: req.user!.id,
      });

      // Find matching dealers and notify them
      const matchedDealers = await this.matchService.findMatchingDealers(inquiry);
      await this.notificationService.notifyDealersOfNewInquiry(inquiry, matchedDealers);

      return createdResponse(res, {
        ...inquiry,
        matchedDealerCount: matchedDealers.length,
      });
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.inquiryService.listByBuyer(req.user!.id, req.query);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inquiry = await this.inquiryService.getByIdForBuyer(req.params.id, req.user!.id);
      return successResponse(res, inquiry);
    } catch (err) {
      next(err);
    }
  };

  selectWinner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.matchService.selectWinner(
        req.params.inquiryId,
        req.params.quoteId,
        req.user!.id
      );
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  };

  // ... other methods follow same pattern
}
```

---

## 15.5 Service Layer

### 15.5.1 Service Pattern

Services contain all business logic. They use Prisma for database access and call other services when needed. Every service method that modifies data uses database transactions.

```typescript
// packages/api/src/services/inquiry.service.ts

import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { logger } from '../config/logger';
import type { CreateInquiryInput, InquiryFilters, PaginatedResult } from '../types';

export class InquiryService {
  async create(input: CreateInquiryInput & { buyerId: string }) {
    return prisma.$transaction(async (tx) => {
      // Create inquiry
      const inquiry = await tx.inquiry.create({
        data: {
          buyerId: input.buyerId,
          title: input.title,
          categoryId: input.categoryId,
          deliveryCity: input.deliveryCity,
          deliveryDeadline: input.deliveryDeadline,
          urgency: input.urgency,
          budgetMin: input.budgetMin,
          budgetMax: input.budgetMax,
          specialInstructions: input.specialInstructions,
          quoteDeadline: input.quoteDeadline,
          status: 'accepting_quotes',
        },
      });

      // Create inquiry items
      const items = await Promise.all(
        input.items.map((item, index) =>
          tx.inquiryItem.create({
            data: {
              inquiryId: inquiry.id,
              productId: item.productId,
              productName: item.productName,
              brandPreference: item.brandPreference,
              quantity: item.quantity,
              unit: item.unit,
              specifications: item.specifications || {},
              notes: item.notes,
              position: index,
            },
          })
        )
      );

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: input.buyerId,
          action: 'INQUIRY_CREATED',
          entityType: 'inquiry',
          entityId: inquiry.id,
          metadata: { itemCount: items.length, category: input.categoryId },
        },
      });

      logger.info({ inquiryId: inquiry.id, buyerId: input.buyerId, itemCount: items.length }, 'Inquiry created');

      return { ...inquiry, items };
    });
  }

  async listByBuyer(buyerId: string, filters: InquiryFilters): Promise<PaginatedResult> {
    const where = {
      buyerId,
      ...(filters.status && { status: { in: filters.status.split(',') } }),
    };

    const [data, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          _count: { select: { quotes: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        ...(filters.cursor && {
          skip: 1,
          cursor: { id: filters.cursor },
        }),
      }),
      prisma.inquiry.count({ where }),
    ]);

    const lastItem = data[data.length - 1];

    return {
      data: data.map((inq) => ({
        ...inq,
        quoteCount: inq._count.quotes,
      })),
      pagination: {
        cursor: lastItem?.id || null,
        hasMore: data.length === (filters.limit || 20),
        totalCount,
      },
    };
  }

  async getByIdForBuyer(id: string, buyerId: string) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        items: { orderBy: { position: 'asc' } },
        quotes: {
          where: {
            status: { not: 'retracted' },
          },
          include: {
            items: true,
            dealer: {
              select: {
                // ANONYMIZED: No name, no phone, no email until MATCHED
                id: true,
                tier: true,
                rating: true,
                conversionRate: true,
                avgResponseTimeHours: true,
                completionRate: true,
                disputeRate: true,
              },
            },
          },
          orderBy: { totalScore: 'desc' },
        },
      },
    });

    if (!inquiry) {
      throw new AppError('NOT_FOUND', 'Inquiry not found', 404);
    }

    if (inquiry.buyerId !== buyerId) {
      throw new AppError('FORBIDDEN', 'You do not have access to this inquiry', 403);
    }

    // Only show quotes if inquiry is in UNDER_REVIEW or later status
    if (['draft', 'accepting_quotes'].includes(inquiry.status)) {
      return {
        ...inquiry,
        quotes: [],
        quoteCount: inquiry.quotes.length,
      };
    }

    return inquiry;
  }
}
```

### 15.5.2 Blind Match Service

```typescript
// packages/api/src/services/blind-match.service.ts

import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { NotificationService } from './notification.service';
import { OrderService } from './order.service';
import { logger } from '../config/logger';

export class BlindMatchService {
  private notificationService = new NotificationService();
  private orderService = new OrderService();

  async findMatchingDealers(inquiry: { id: string; categoryId: string; deliveryCity: string }) {
    // Find dealers who:
    // 1. Are KYC-approved
    // 2. Have products in the inquiry's category
    // 3. Serve the inquiry's delivery city
    // 4. Are not suspended
    const dealers = await prisma.dealer.findMany({
      where: {
        kycStatus: 'approved',
        isActive: true,
        categoryMappings: {
          some: { categoryId: inquiry.categoryId },
        },
        serviceZones: {
          some: { city: inquiry.deliveryCity },
        },
      },
      select: {
        id: true,
        userId: true,
        // DO NOT select: businessName, phone, email
      },
    });

    return dealers;
  }

  async selectWinner(inquiryId: string, quoteId: string, buyerId: string) {
    return prisma.$transaction(async (tx) => {
      // Verify inquiry belongs to buyer and is in correct state
      const inquiry = await tx.inquiry.findUnique({
        where: { id: inquiryId },
        include: { quotes: true },
      });

      if (!inquiry) throw new AppError('NOT_FOUND', 'Inquiry not found', 404);
      if (inquiry.buyerId !== buyerId) throw new AppError('FORBIDDEN', 'Not your inquiry', 403);
      if (inquiry.status !== 'under_review') {
        throw new AppError('INVALID_STATE_TRANSITION', `Cannot select winner when inquiry status is ${inquiry.status}`, 400);
      }

      // Verify quote belongs to this inquiry
      const winningQuote = inquiry.quotes.find(q => q.id === quoteId);
      if (!winningQuote) throw new AppError('NOT_FOUND', 'Quote not found for this inquiry', 404);

      // Update inquiry status
      await tx.inquiry.update({
        where: { id: inquiryId },
        data: { status: 'matched', matchedAt: new Date() },
      });

      // Mark winning quote
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'won' },
      });

      // Mark losing quotes
      await tx.quote.updateMany({
        where: { inquiryId, id: { not: quoteId } },
        data: { status: 'lost' },
      });

      // IDENTITY REVEAL: Get full dealer and buyer details
      const dealer = await tx.dealer.findUnique({
        where: { id: winningQuote.dealerId },
        include: { user: { select: { name: true, phone: true, email: true } } },
      });

      const buyer = await tx.user.findUnique({
        where: { id: buyerId },
        select: { name: true, phone: true, email: true },
      });

      // Create order draft
      const order = await this.orderService.createFromMatch(tx, inquiry, winningQuote, buyer!, dealer!);

      // Create conversation thread
      const conversation = await tx.conversation.create({
        data: {
          type: 'inquiry_thread',
          inquiryId,
          participants: {
            createMany: {
              data: [
                { userId: buyerId },
                { userId: dealer!.userId },
              ],
            },
          },
        },
      });

      // System message in conversation
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: null, // system message
          type: 'system',
          content: `Match confirmed! ${buyer!.name} and ${dealer!.user.name} can now discuss order details.`,
        },
      });

      logger.info({
        inquiryId,
        quoteId,
        dealerId: winningQuote.dealerId,
        buyerId,
        amount: winningQuote.totalAmount,
      }, 'Blind match winner selected');

      // Notify winner (async, don't block response)
      this.notificationService.notifyMatchWinner(dealer!, buyer!, inquiry, winningQuote).catch(
        (err) => logger.error({ err }, 'Failed to notify match winner')
      );

      // Notify losers with anonymized winning price (async)
      const losingQuotes = inquiry.quotes.filter(q => q.id !== quoteId);
      this.notificationService.notifyMatchLosers(losingQuotes, winningQuote.totalAmount).catch(
        (err) => logger.error({ err }, 'Failed to notify match losers')
      );

      return {
        inquiry: { id: inquiryId, status: 'matched' },
        winningQuote: {
          id: quoteId,
          totalAmount: winningQuote.totalAmount,
          dealerContact: {
            dealerId: dealer!.id,
            businessName: dealer!.businessName,
            contactPerson: dealer!.user.name,
            phone: dealer!.user.phone,
            email: dealer!.user.email,
            address: dealer!.address,
          },
        },
        order: { id: order.id, status: order.status },
        conversation: { id: conversation.id, type: 'inquiry_thread' },
      };
    });
  }
}
```

---

## 15.6 Database Access Layer

### 15.6.1 Prisma Client

```typescript
// packages/api/src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../config/logger';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

// Log slow queries in development
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 100) {
      logger.warn({ query: e.query, duration: e.duration }, 'Slow query detected');
    }
  });
}

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 15.6.2 Redis Client

```typescript
// packages/api/src/lib/redis.ts

import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000),
  lazyConnect: true,
  enableOfflineQueue: true,
  keyPrefix: 'h4e:',
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));
redis.on('close', () => logger.warn('Redis connection closed'));

// Convenience methods
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
};

export const cacheDelete = async (key: string): Promise<void> => {
  await redis.del(key);
};

export const cacheClearPattern = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(`h4e:${pattern}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
```

---

## 15.7 Background Job Architecture

### 15.7.1 Queue Setup

```typescript
// packages/api/src/jobs/index.ts

import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis } from '../lib/redis';
import { logger } from '../config/logger';

// Queue definitions (see section-03-04 Section 4.6 for complete list)
export const queues = {
  quoteEvaluation: new Queue('quote-evaluation', { connection: redis }),
  notification: new Queue('notification', { connection: redis }),
  email: new Queue('email', { connection: redis }),
  sms: new Queue('sms', { connection: redis }),
  whatsapp: new Queue('whatsapp', { connection: redis }),
  priceIndex: new Queue('price-index-update', { connection: redis }),
  dealerKyc: new Queue('dealer-kyc-verification', { connection: redis }),
  imageProcessing: new Queue('image-processing', { connection: redis }),
  aiTask: new Queue('ai-task', { connection: redis }),
  searchIndex: new Queue('search-index-sync', { connection: redis }),
  analytics: new Queue('analytics-aggregation', { connection: redis }),
  cleanup: new Queue('cleanup', { connection: redis }),
};

export async function initializeJobQueues() {
  // Quote evaluation worker
  new Worker('quote-evaluation', async (job) => {
    const { QuoteEvaluationProcessor } = await import('./processors/quote-evaluation.processor');
    return new QuoteEvaluationProcessor().process(job);
  }, {
    connection: redis,
    concurrency: 5,
    limiter: { max: 20, duration: 60000 },
  });

  // Notification worker
  new Worker('notification', async (job) => {
    const { NotificationProcessor } = await import('./processors/notification.processor');
    return new NotificationProcessor().process(job);
  }, {
    connection: redis,
    concurrency: 10,
  });

  // Email worker
  new Worker('email', async (job) => {
    const { EmailProcessor } = await import('./processors/email.processor');
    return new EmailProcessor().process(job);
  }, {
    connection: redis,
    concurrency: 5,
    limiter: { max: 100, duration: 60000 }, // Resend rate limit
  });

  // Search index sync worker
  new Worker('search-index-sync', async (job) => {
    const { SearchIndexProcessor } = await import('./processors/search-index.processor');
    return new SearchIndexProcessor().process(job);
  }, {
    connection: redis,
    concurrency: 3,
  });

  logger.info('Job queues initialized');
}
```

### 15.7.2 Cron Jobs

```typescript
// packages/api/src/cron/index.ts

import cron from 'node-cron';
import { queues } from '../jobs';
import { logger } from '../config/logger';

export function initializeCronJobs() {
  // Price index update: daily at 02:00 IST
  cron.schedule('0 2 * * *', () => {
    queues.priceIndex.add('daily-update', {}, { priority: 5 });
    logger.info('Scheduled daily price index update');
  }, { timezone: 'Asia/Kolkata' });

  // Inquiry deadline checker: every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    queues.quoteEvaluation.add('check-deadlines', { type: 'deadline_check' });
  });

  // Analytics aggregation: daily at 03:00 IST
  cron.schedule('0 3 * * *', () => {
    queues.analytics.add('daily-aggregation', { type: 'daily' });
  }, { timezone: 'Asia/Kolkata' });

  // Cleanup expired sessions and tokens: daily at 04:00 IST
  cron.schedule('0 4 * * *', () => {
    queues.cleanup.add('expired-tokens', { type: 'tokens' });
    queues.cleanup.add('expired-otps', { type: 'otps' });
  }, { timezone: 'Asia/Kolkata' });

  // Dealer rating recalculation: weekly on Sunday at 05:00 IST
  cron.schedule('0 5 * * 0', () => {
    queues.analytics.add('dealer-rating-recalc', { type: 'dealer_ratings' });
  }, { timezone: 'Asia/Kolkata' });

  logger.info('Cron jobs initialized');
}
```

---

## 15.8 File Upload Service

### 15.8.1 S3 Upload

```typescript
// packages/api/src/services/upload.service.ts

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v7 as uuidv7 } from 'uuid';
import sharp from 'sharp';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

const s3 = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;    // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export class UploadService {
  async uploadProductImage(file: Express.Multer.File, productId: string): Promise<{
    url: string;
    width: number;
    height: number;
  }> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new AppError('VALIDATION_ERROR', 'Only JPEG, PNG, and WebP images are allowed', 400);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new AppError('VALIDATION_ERROR', 'Image must be under 5MB', 400);
    }

    // Process with sharp: resize, convert to WebP, strip metadata
    const processed = await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const metadata = await sharp(processed).metadata();
    const key = `products/${productId}/${uuidv7()}.webp`;

    await s3.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: processed,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    const url = env.CDN_URL
      ? `${env.CDN_URL}/${key}`
      : `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;

    return {
      url,
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  async uploadKYCDocument(file: Express.Multer.File, dealerId: string, docType: string): Promise<string> {
    const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    if (!allowed.includes(file.mimetype)) {
      throw new AppError('VALIDATION_ERROR', 'Only JPEG, PNG, WebP, and PDF files are allowed', 400);
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      throw new AppError('VALIDATION_ERROR', 'Document must be under 10MB', 400);
    }

    const ext = file.mimetype === 'application/pdf' ? 'pdf' : 'webp';
    const key = `kyc/${dealerId}/${docType}_${uuidv7()}.${ext}`;

    let body = file.buffer;
    if (file.mimetype.startsWith('image/')) {
      body = await sharp(file.buffer).webp({ quality: 90 }).toBuffer();
    }

    await s3.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: ext === 'pdf' ? 'application/pdf' : 'image/webp',
      ServerSideEncryption: 'AES256', // KYC docs always encrypted at rest
    }));

    return `s3://${env.S3_BUCKET}/${key}`; // Internal URL, not public
  }

  async deleteFile(key: string): Promise<void> {
    await s3.send(new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }));
  }
}
```

---

## 15.9 External Service Integrations

### 15.9.1 SMS (MSG91)

```typescript
// packages/api/src/integrations/sms/msg91.service.ts

import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AppError } from '../../lib/errors';

export class MSG91Service {
  private baseUrl = 'https://control.msg91.com/api/v5';

  async sendOTP(phone: string): Promise<{ requestId: string }> {
    const response = await fetch(`${this.baseUrl}/otp?template_id=${env.MSG91_TEMPLATE_ID}&mobile=91${phone}`, {
      method: 'POST',
      headers: {
        'authkey': env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.type !== 'success') {
      logger.error({ phone: '[REDACTED]', response: data }, 'MSG91 OTP send failed');
      throw new AppError('SERVICE_UNAVAILABLE', 'Failed to send OTP. Please try again.', 503);
    }

    return { requestId: data.request_id };
  }

  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/otp/verify?mobile=91${phone}&otp=${otp}`, {
      method: 'POST',
      headers: { 'authkey': env.MSG91_AUTH_KEY },
    });

    const data = await response.json();
    return data.type === 'success';
  }
}
```

### 15.9.2 Payment (Razorpay)

```typescript
// packages/api/src/integrations/payment/razorpay.service.ts

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export class RazorpayService {
  async createOrder(amount: number, orderId: string): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
  }> {
    const order = await razorpay.orders.create({
      amount, // in paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        platform: 'hub4estate',
        orderId,
      },
    });

    return {
      razorpayOrderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
    };
  }

  verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  }

  async capturePayment(paymentId: string, amount: number) {
    return razorpay.payments.capture(paymentId, amount, 'INR');
  }

  async refund(paymentId: string, amount: number, reason: string) {
    return razorpay.payments.refund(paymentId, {
      amount,
      notes: { reason },
    });
  }
}
```

### 15.9.3 Email (Resend)

```typescript
// packages/api/src/integrations/email/resend.service.ts

import { Resend } from 'resend';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  private from = 'Hub4Estate <noreply@hub4estate.com>';

  async sendTransactional(to: string, subject: string, html: string) {
    try {
      const result = await resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      return result;
    } catch (err) {
      logger.error({ err, to: '[REDACTED]' }, 'Failed to send email');
      // Don't throw -- email failure should not block user flow
    }
  }

  async sendOTPEmail(to: string, otp: string) {
    return this.sendTransactional(to, 'Your Hub4Estate Verification Code', `
      <div style="font-family: Inter, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px;">
        <h2 style="color: #4d4439;">Your verification code</h2>
        <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #d3815e; background: #faf9f7; padding: 20px; border: 2px solid #000; text-align: center;">${otp}</p>
        <p style="color: #726452;">This code expires in 5 minutes. Do not share it with anyone.</p>
        <p style="color: #b8ad9a; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `);
  }

  async sendMatchNotification(to: string, params: {
    buyerName: string;
    dealerName: string;
    inquiryTitle: string;
    amount: number;
  }) {
    return this.sendTransactional(to, `Match Confirmed - ${params.inquiryTitle}`, `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
        <h2 style="color: #4d4439;">Match Confirmed!</h2>
        <p>Your quote for <strong>${params.inquiryTitle}</strong> has been selected.</p>
        <div style="background: #faf9f7; border: 2px solid #000; padding: 20px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₹${(params.amount / 100).toLocaleString('en-IN')}</p>
          <p><strong>Buyer:</strong> ${params.buyerName}</p>
        </div>
        <a href="https://hub4estate.com/dealer/orders" style="display: inline-block; background: #d3815e; color: white; padding: 12px 24px; text-decoration: none; border: 2px solid #000; font-weight: bold;">View Order Details</a>
      </div>
    `);
  }
}
```

---

## 15.10 Response Helpers

```typescript
// packages/api/src/lib/response.ts

import type { Response } from 'express';

export function successResponse(res: Response, data: unknown, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId: res.req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

export function createdResponse(res: Response, data: unknown) {
  return successResponse(res, data, 201);
}

export function paginatedResponse(res: Response, data: unknown[], pagination: {
  cursor: string | null;
  hasMore: boolean;
  totalCount: number;
}) {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    meta: {
      requestId: res.req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

export function noContentResponse(res: Response) {
  return res.status(204).end();
}
```

---

## 15.11 Error Classes

```typescript
// packages/api/src/lib/errors.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Array<{ field: string; message: string; code: string }>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = 'Resource not found') {
    return new AppError('NOT_FOUND', message, 404);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'You do not have permission for this action') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static badRequest(message: string, details?: Array<{ field: string; message: string; code: string }>) {
    return new AppError('VALIDATION_ERROR', message, 400, details);
  }

  static conflict(message = 'Resource already exists') {
    return new AppError('CONFLICT', message, 409);
  }

  static businessRule(message: string) {
    return new AppError('BUSINESS_RULE_VIOLATION', message, 422);
  }
}
```

---

# SECTION 16 -- MOBILE STRATEGY

Hub4Estate is a mobile-first web application. A native mobile app is planned for Phase 2 (Month 4-6). This section defines the mobile strategy.

---

## 16.1 Phase 1: Progressive Web App (PWA)

### 16.1.1 PWA Configuration

The current React SPA is enhanced as a PWA for Phase 1. This provides:
- Add to Home Screen (A2HS) on Android and iOS
- Offline fallback page
- Push notifications via Firebase Cloud Messaging
- Smooth, app-like navigation

```typescript
// vite.config.ts (PWA plugin)

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'og-image.jpg'],
      manifest: {
        name: 'Hub4Estate - Best Prices on Electrical Products',
        short_name: 'Hub4Estate',
        description: 'Get the best prices on electrical products from verified dealers',
        theme_color: '#d3815e',
        background_color: '#faf9f7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.hub4estate\.com\/api\/v1\/catalog/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'catalog-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/storage\.hub4estate\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
```

### 16.1.2 Mobile-Specific UI Patterns

| Pattern | Implementation |
|---------|---------------|
| Bottom navigation | Sticky bottom bar on mobile (< 768px) with 5 tabs: Home, Catalog, Create Inquiry, Orders, Profile |
| Pull-to-refresh | On dashboard and list pages. Uses native-like pull gesture. |
| Swipe actions | On list items (e.g., swipe quote card to compare) |
| Bottom sheets | For filters, quick actions (instead of dropdowns on mobile) |
| Touch targets | Minimum 44x44px for all interactive elements |
| Safe area insets | `env(safe-area-inset-top/bottom)` for notched devices |
| Scroll optimization | `overscroll-behavior: contain` to prevent pull-to-refresh on scrollable areas |

### 16.1.3 PWA Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse PWA Score | > 90 |
| Install prompt | Within first 2 visits |
| Service worker registration | < 3s after first load |
| Offline fallback | Shows branded offline page within 1s |
| A2HS banner | Shown after 2+ visits within 7 days |

---

## 16.2 Phase 2: React Native App (Month 4-6)

### 16.2.1 Framework Decision

| Option | Verdict | Reasoning |
|--------|---------|-----------|
| React Native (Expo) | **Selected** | Maximum code sharing with web (shared types, validations, API client). Expo's managed workflow eliminates native build complexity. OTA updates via EAS Update. |
| Flutter | Rejected | Different language (Dart), no code sharing with existing TypeScript codebase. Beautiful UI but forces rewrite of all business logic. |
| Native (Swift + Kotlin) | Rejected | 2x development effort, 2x maintenance. Not justified at current scale (< 10K users). |

### 16.2.2 Architecture

```
hub4estate/
├── packages/
│   ├── web/                    # React web app (existing)
│   ├── mobile/                 # React Native (Expo)
│   │   ├── app/                # Expo Router file-based routing
│   │   │   ├── (auth)/
│   │   │   ├── (tabs)/         # Bottom tab navigator
│   │   │   │   ├── index.tsx   # Dashboard
│   │   │   │   ├── catalog.tsx
│   │   │   │   ├── inquiries.tsx
│   │   │   │   ├── orders.tsx
│   │   │   │   └── profile.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/         # Mobile-specific components
│   │   ├── hooks/              # Mobile-specific hooks
│   │   └── package.json
│   ├── api/                    # Backend (existing)
│   └── shared/                 # Shared types, validations, constants
│       ├── types/              # TypeScript types (used by web, mobile, api)
│       ├── validations/        # Zod schemas (used by web, mobile, api)
│       ├── constants/          # App constants
│       └── utils/              # Pure utility functions
```

### 16.2.3 Code Sharing Strategy

| Layer | Shared? | How |
|-------|---------|-----|
| TypeScript types | 100% shared | `@hub4estate/shared/types` |
| Zod validations | 100% shared | `@hub4estate/shared/validations` |
| API client functions | 90% shared | Same API module, different HTTP client (axios web, fetch mobile) |
| React Query hooks | 80% shared | Same query keys and functions, platform-specific options |
| Zustand stores | 70% shared | Same store shape, different persistence layer |
| UI components | 0% shared | React Native uses native components, not DOM |
| Navigation | 0% shared | Expo Router vs React Router |

### 16.2.4 Mobile-Specific Features

| Feature | Implementation |
|---------|---------------|
| Camera (KYC document scan) | `expo-camera` for live capture + OCR (optional) |
| Barcode scanner | `expo-barcode-scanner` for product identification |
| Push notifications | `expo-notifications` + Firebase Cloud Messaging |
| Biometric auth | `expo-local-authentication` (fingerprint / Face ID for returning users) |
| Offline support | MMKV for local storage, React Query persistence adapter |
| Deep linking | Expo Router universal links (`hub4estate.com/inquiries/:id` opens in app) |
| Share | `expo-sharing` for sharing product links, inquiry results |
| Haptics | `expo-haptics` for button feedback, success/error states |

### 16.2.5 Release Strategy

| Channel | Purpose | Update Method |
|---------|---------|---------------|
| Development | Internal testing | Expo Go (no build required) |
| Staging | QA + beta testers | EAS Build (internal distribution) |
| Production (Android) | Google Play Store | EAS Submit |
| Production (iOS) | Apple App Store | EAS Submit |
| OTA Updates | Bug fixes, minor changes | EAS Update (no app store review) |

### 16.2.6 App Store Requirements

**Android (Google Play):**
- Target SDK: 34 (Android 14)
- Min SDK: 24 (Android 7.0, covers 97%+ of Indian Android users)
- App Bundle (.aab) format
- Content rating: Everyone
- Privacy Policy URL required

**iOS (App Store):**
- Target: iOS 16+
- Min: iOS 15 (covers 95%+ active iPhones)
- App Tracking Transparency (ATT) prompt if any tracking
- Privacy Nutrition Labels required

---

## 16.3 Mobile Analytics

### 16.3.1 Events to Track

| Event | Platform | Payload |
|-------|----------|---------|
| `app_open` | Mobile | `{ source: 'icon' \| 'notification' \| 'deeplink' }` |
| `screen_view` | Both | `{ screen: string, referrer: string }` |
| `search_performed` | Both | `{ query: string, resultCount: number }` |
| `inquiry_created` | Both | `{ categoryId: string, itemCount: number }` |
| `quote_viewed` | Both | `{ inquiryId: string, quoteId: string }` |
| `match_selected` | Both | `{ inquiryId: string, quoteId: string, amount: number }` |
| `payment_completed` | Both | `{ orderId: string, amount: number, method: string }` |
| `notification_opened` | Mobile | `{ notificationType: string, notificationId: string }` |
| `app_install` | Mobile | `{ source: 'organic' \| 'campaign' \| 'referral' }` |
| `pwa_installed` | Web | `{ prompt: 'a2hs' \| 'manual' }` |

### 16.3.2 Analytics Providers

| Provider | Purpose |
|----------|---------|
| PostHog | Product analytics (funnels, retention, feature flags) |
| Sentry | Error tracking + performance monitoring |
| Firebase Analytics | Mobile-specific events (app installs, deep links) |
| Custom (PostgreSQL) | Business metrics (GMV, savings, conversion rates) |

---

*End of Sections 15 & 16. The backend architecture defines every middleware, service pattern, database access layer, background job, and external integration. The mobile strategy covers PWA (Phase 1) and React Native (Phase 2) with code sharing, mobile-specific features, and release strategy.*

*[CONTINUES IN NEXT SECTION -- Resume at section-17-18 Realtime Systems & Payment]*
