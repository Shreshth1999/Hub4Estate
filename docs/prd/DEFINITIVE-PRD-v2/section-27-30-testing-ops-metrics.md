# Hub4Estate Definitive PRD v2 -- Sections 27-30

> **Document**: section-27-30-testing-ops-metrics  
> **Version**: 2.1.0  
> **Date**: 2026-04-08  
> **Author**: CTO Office, Hub4Estate  
> **Status**: Authoritative Reference  
> **Classification**: Internal -- Engineering  
> **Prerequisite Reading**: section-01 through section-26

---

# SECTION 27 -- TESTING STRATEGY

Every test type, framework, target, and critical path test case. If a feature has no tests, it does not exist. If a test is flaky, it is a P1 bug.

---

## 27.1 Philosophy & Pyramid

### 27.1.1 Core Principles

Hub4Estate handles financial transactions, blind matching confidentiality, and sensitive business data. A defect that leaks a dealer's quote to a competitor or miscalculates GST destroys trust permanently. Testing is not overhead -- it is infrastructure.

1. **Test the contract, not the implementation** -- Tests validate behavior, not internal wiring. Refactoring must never break tests.
2. **Production parity** -- Integration tests run against real PostgreSQL and Redis in Docker. No SQLite substitutes, no in-memory fakes for data stores.
3. **Blind matching is sacrosanct** -- Every code path that touches dealer identity, quote amounts, or matching logic has dedicated isolation tests proving zero leakage.
4. **Shift left** -- Catch defects as early as possible. Type safety (TypeScript strict), schema validation (Zod), and linting prevent entire categories of bugs before tests even run.
5. **Tests are documentation** -- A new engineer reads the test suite to understand how blind matching works, how GST is calculated, how disputes resolve.
6. **No flaky tests** -- A test that fails intermittently is a P1 bug. Quarantine, fix, or delete within 48 hours.

### 27.1.2 Test Pyramid

```
                    /\
                   /  \        E2E (Playwright)
                  / 15 \       10-15 critical user journeys
                 /______\
                /        \     Integration (Supertest + Docker)
               /   25%    \    Every API endpoint, happy + error paths
              /____________\
             /              \  Unit (Vitest)
            /     60%        \ Services, utils, schemas, stores, hooks, components
           /__________________\
          /                    \
         /     Static (TS+Lint) \ TypeScript strict, ESLint, Prettier
        /________________________\
```

| Layer | Framework | Target Coverage | Run Frequency | Avg Duration |
|-------|-----------|----------------|---------------|-------------|
| Static Analysis | TypeScript 5.4 strict + ESLint + Prettier | 100% of files | Every save (IDE) + every commit (pre-commit hook) | <5s |
| Unit Tests | Vitest 1.6+ | 80% overall, 90% services/utils | Every commit (pre-push hook) + CI | <30s |
| Integration Tests | Supertest + Vitest + Docker (PG + Redis) | Every API endpoint (happy + 2 error cases minimum) | CI on every PR | <3min |
| E2E Tests | Playwright 1.44+ | 15 critical flows | CI on merge to `develop` + nightly on `main` | <8min |
| Performance Tests | k6 0.50+ | Key endpoints under load | Weekly + pre-release | 5-15min |
| Security Tests | OWASP ZAP + custom scripts | OWASP Top 10 + blind matching probes | Weekly automated + quarterly manual | 20-60min |
| Accessibility Tests | axe-core + Lighthouse | All public-facing pages | CI on every PR (axe-core), weekly (Lighthouse) | <2min |

### 27.1.3 Coverage Targets

| Domain | Line Coverage | Branch Coverage | Function Coverage | Rationale |
|--------|-------------|----------------|-------------------|-----------|
| `services/` | 90% | 85% | 95% | Core business logic -- blind matching, pricing, GST, scoring |
| `utils/` | 95% | 90% | 95% | Pure functions, must be bulletproof |
| `controllers/` | 75% | 65% | 80% | Thin layer, integration tests cover most paths |
| `middleware/` | 90% | 85% | 95% | Auth, RBAC, rate limiting are security-critical |
| `validations/` (Zod schemas) | 90% | 85% | 90% | Every schema validates correct input + rejects invalid |
| React components | 70% | 55% | 75% | Snapshot + interaction tests for stateful components |
| Zustand stores | 85% | 80% | 90% | State transitions are business logic |
| Custom hooks | 80% | 70% | 85% | Data fetching, side effects |
| **Overall backend** | **80%** | **70%** | **85%** | |
| **Overall frontend** | **70%** | **60%** | **75%** | |

### 27.1.4 Test File Conventions

```
backend/
  src/
    services/
      blind-match.service.ts
      blind-match.service.test.ts          # Co-located unit tests
    controllers/
      inquiry.controller.ts
      inquiry.controller.test.ts
  tests/
    integration/
      api/
        auth.api.test.ts                   # Integration tests in separate dir
        inquiry.api.test.ts
        blind-match.api.test.ts
        payment-webhook.api.test.ts
      setup/
        docker-compose.test.yml            # Test infrastructure
        global-setup.ts
        global-teardown.ts
    security/
      blind-match-penetration.test.ts
    fixtures/
      users.fixture.ts                     # Shared test data factories
      dealers.fixture.ts
      products.fixture.ts
      inquiries.fixture.ts

frontend/
  src/
    components/
      InquiryCard/
        InquiryCard.tsx
        InquiryCard.test.tsx               # Co-located
    stores/
      useCartStore.ts
      useCartStore.test.ts
    hooks/
      useBlindMatch.ts
      useBlindMatch.test.ts
  tests/
    e2e/
      buyer-journey.spec.ts
      dealer-journey.spec.ts
      payment.spec.ts
      ai-chat.spec.ts
```

**Naming conventions:**
- Unit tests: `*.test.ts` or `*.test.tsx` (co-located with source)
- Integration tests: `*.api.test.ts` (in `tests/integration/`)
- E2E tests: `*.spec.ts` (in `tests/e2e/`)
- Fixtures: `*.fixture.ts`
- Mocks: `*.mock.ts`

---

## 27.2 Unit Tests (Vitest)

### 27.2.1 Vitest Configuration -- Backend

```typescript
// packages/api/vitest.config.ts

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['tests/integration/**', 'tests/e2e/**'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 85,
        statements: 80,
        // Per-directory overrides
        'src/services/': {
          lines: 90,
          branches: 85,
        },
        'src/utils/': {
          lines: 95,
          branches: 90,
        },
        'src/middleware/': {
          lines: 90,
          branches: 85,
        },
      },
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.mock.ts',
        'src/types/**',
        'src/config/**',
        'src/server.ts',
      ],
    },
    testTimeout: 10_000,
    hookTimeout: 10_000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'tests'),
    },
  },
});
```

### 27.2.2 Vitest Configuration -- Frontend

```typescript
// packages/web/vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/frontend-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 75,
        statements: 70,
        'src/stores/': {
          lines: 85,
          branches: 80,
        },
        'src/hooks/': {
          lines: 80,
          branches: 70,
        },
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.tsx',
        'src/types/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
    css: false,
    testTimeout: 10_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

### 27.2.3 Test Setup Files

```typescript
// packages/api/tests/setup.ts

import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-256-bits-minimum-length-here';
process.env.JWT_EXPIRY = '1h';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.RAZORPAY_KEY_ID = 'rzp_test_xxxxxxxxxxxx';
process.env.RAZORPAY_KEY_SECRET = 'test_secret_xxxxxxxxxxxx';
process.env.CLAUDE_API_KEY = 'sk-ant-test-xxxxxxxxxxxx';
process.env.AWS_S3_BUCKET = 'hub4estate-test';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-aes';

// Global mock for logger (prevent console noise in test output)
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));

// Global mock for metrics (prevent StatsD connections in tests)
vi.mock('@/utils/metrics', () => ({
  metrics: {
    increment: vi.fn(),
    histogram: vi.fn(),
    gauge: vi.fn(),
    timing: vi.fn(),
  },
}));
```

```typescript
// packages/web/tests/frontend-setup.ts

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Suppress console.error for expected React test warnings
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Not implemented: HTMLFormElement.prototype.submit')
  ) {
    return;
  }
  originalError.call(console, ...args);
};
```

### 27.2.4 Mocking Strategy

#### Prisma Mock

```typescript
// tests/mocks/prisma.mock.ts

import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { vi, beforeEach } from 'vitest';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>();

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper: mock a Prisma transaction
export function mockTransaction(callback: (tx: MockPrismaClient) => void) {
  prismaMock.$transaction.mockImplementation(async (fn: any) => {
    callback(prismaMock);
    return fn(prismaMock);
  });
}
```

#### Redis Mock

```typescript
// tests/mocks/redis.mock.ts

import { vi } from 'vitest';

const store = new Map<string, string>();

export const redisMock = {
  get: vi.fn(async (key: string) => store.get(key) ?? null),
  set: vi.fn(async (key: string, value: string, _mode?: string, _ttl?: number) => {
    store.set(key, value);
    return 'OK';
  }),
  setex: vi.fn(async (key: string, _ttl: number, value: string) => {
    store.set(key, value);
    return 'OK';
  }),
  del: vi.fn(async (...keys: string[]) => {
    let count = 0;
    for (const key of keys) {
      if (store.delete(key)) count++;
    }
    return count;
  }),
  exists: vi.fn(async (key: string) => (store.has(key) ? 1 : 0)),
  expire: vi.fn(async () => 1),
  ttl: vi.fn(async () => 3600),
  incr: vi.fn(async (key: string) => {
    const val = parseInt(store.get(key) || '0', 10) + 1;
    store.set(key, String(val));
    return val;
  }),
  hset: vi.fn(async () => 1),
  hget: vi.fn(async () => null),
  hgetall: vi.fn(async () => ({})),
  hdel: vi.fn(async () => 1),
  publish: vi.fn(async () => 1),
  subscribe: vi.fn(),
  on: vi.fn(),
  pipeline: vi.fn().mockReturnThis(),
  exec: vi.fn(async () => []),
  quit: vi.fn(),
  _store: store,
  _clear: () => store.clear(),
};

vi.mock('@/lib/redis', () => ({
  redis: redisMock,
  getRedis: () => redisMock,
}));
```

#### External API Mocks

```typescript
// tests/mocks/razorpay.mock.ts

import { vi } from 'vitest';

export const razorpayMock = {
  orders: {
    create: vi.fn(async (params: any) => ({
      id: 'order_test_' + Date.now(),
      entity: 'order',
      amount: params.amount,
      currency: params.currency || 'INR',
      status: 'created',
      receipt: params.receipt,
      created_at: Math.floor(Date.now() / 1000),
    })),
    fetch: vi.fn(async (orderId: string) => ({
      id: orderId,
      status: 'paid',
      amount_paid: 100000,
      amount_due: 0,
    })),
  },
  payments: {
    fetch: vi.fn(async (paymentId: string) => ({
      id: paymentId,
      entity: 'payment',
      amount: 100000,
      currency: 'INR',
      status: 'captured',
      method: 'upi',
    })),
    capture: vi.fn(async (paymentId: string, amount: number) => ({
      id: paymentId,
      status: 'captured',
      amount,
    })),
  },
  refunds: {
    create: vi.fn(async (paymentId: string, params: any) => ({
      id: 'rfnd_test_' + Date.now(),
      payment_id: paymentId,
      amount: params.amount,
      status: 'processed',
    })),
  },
};

vi.mock('@/integrations/razorpay', () => ({
  razorpay: razorpayMock,
  getRazorpayInstance: () => razorpayMock,
}));
```

```typescript
// tests/mocks/claude.mock.ts

import { vi } from 'vitest';

export const claudeMock = {
  messages: {
    create: vi.fn(async (params: any) => ({
      id: 'msg_test_' + Date.now(),
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'Based on your requirements for a 3BHK flat, you will need approximately 500m of 2.5mm FRLS wire, 20 MCBs (16A and 32A), and 40 modular switches.',
        },
      ],
      model: params.model || 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: { input_tokens: 150, output_tokens: 80 },
    })),
  },
};

vi.mock('@/integrations/claude', () => ({
  claude: claudeMock,
  getClaudeClient: () => claudeMock,
}));
```

```typescript
// tests/mocks/s3.mock.ts

import { vi } from 'vitest';

export const s3Mock = {
  upload: vi.fn(async (params: any) => ({
    Location: `https://hub4estate-test.s3.ap-south-1.amazonaws.com/${params.Key}`,
    Bucket: params.Bucket,
    Key: params.Key,
    ETag: '"mock-etag"',
  })),
  getSignedUrl: vi.fn(() => 'https://hub4estate-test.s3.ap-south-1.amazonaws.com/signed-url'),
  deleteObject: vi.fn(async () => ({})),
  headObject: vi.fn(async () => ({
    ContentLength: 1024,
    ContentType: 'image/jpeg',
    LastModified: new Date(),
  })),
};

vi.mock('@/integrations/s3', () => ({
  s3: s3Mock,
  getS3Client: () => s3Mock,
}));
```

### 27.2.5 Test Data Factories

```typescript
// tests/fixtures/users.fixture.ts

import { UserRole, UserStatus } from '@prisma/client';

let counter = 0;

export function createTestUser(overrides: Partial<any> = {}) {
  counter++;
  return {
    id: overrides.id ?? `user_test_${counter}`,
    email: overrides.email ?? `testuser${counter}@example.com`,
    phone: overrides.phone ?? `+91900000${String(counter).padStart(4, '0')}`,
    name: overrides.name ?? `Test User ${counter}`,
    role: overrides.role ?? 'buyer',
    status: overrides.status ?? 'active',
    emailVerified: overrides.emailVerified ?? true,
    phoneVerified: overrides.phoneVerified ?? true,
    avatarUrl: overrides.avatarUrl ?? null,
    cityId: overrides.cityId ?? 'city_sriganganagar',
    createdAt: overrides.createdAt ?? new Date('2026-01-15'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-15'),
    deletedAt: null,
    ...overrides,
  };
}

export function createTestBuyer(overrides: Partial<any> = {}) {
  return createTestUser({ role: 'buyer', ...overrides });
}

export function createTestDealer(overrides: Partial<any> = {}) {
  return createTestUser({ role: 'dealer', ...overrides });
}

export function createTestAdmin(overrides: Partial<any> = {}) {
  return createTestUser({ role: 'admin', ...overrides });
}
```

```typescript
// tests/fixtures/inquiries.fixture.ts

let counter = 0;

export function createTestInquiry(overrides: Partial<any> = {}) {
  counter++;
  return {
    id: overrides.id ?? `inq_test_${counter}`,
    buyerId: overrides.buyerId ?? `user_test_buyer_${counter}`,
    title: overrides.title ?? `Test Inquiry ${counter}`,
    description: overrides.description ?? 'Need 200 units of Havells MCB 32A for residential project',
    categoryId: overrides.categoryId ?? 'cat_mcb',
    items: overrides.items ?? [
      {
        productName: 'Havells MCB 32A',
        brandPreference: 'havells',
        quantity: 200,
        unit: 'pieces',
      },
    ],
    deliveryCity: overrides.deliveryCity ?? 'Sri Ganganagar',
    deliveryCityId: overrides.deliveryCityId ?? 'city_sriganganagar',
    deliveryPincode: overrides.deliveryPincode ?? '335001',
    deliveryDeadline: overrides.deliveryDeadline ?? new Date('2026-05-01'),
    urgency: overrides.urgency ?? 'standard',
    status: overrides.status ?? 'accepting_quotes',
    quoteDeadline: overrides.quoteDeadline ?? new Date('2026-04-25'),
    createdAt: overrides.createdAt ?? new Date('2026-04-08'),
    updatedAt: overrides.updatedAt ?? new Date('2026-04-08'),
    ...overrides,
  };
}

export function createTestQuote(overrides: Partial<any> = {}) {
  counter++;
  return {
    id: overrides.id ?? `quote_test_${counter}`,
    inquiryId: overrides.inquiryId ?? `inq_test_${counter}`,
    dealerId: overrides.dealerId ?? `dealer_test_${counter}`,
    totalAmount: overrides.totalAmount ?? 49000,
    deliveryDays: overrides.deliveryDays ?? 5,
    deliveryCharge: overrides.deliveryCharge ?? 500,
    quotedItems: overrides.quotedItems ?? 1,
    requestedItems: overrides.requestedItems ?? 1,
    totalQuantityOffered: overrides.totalQuantityOffered ?? 200,
    totalQuantityRequested: overrides.totalQuantityRequested ?? 200,
    paymentTerms: overrides.paymentTerms ?? 'advance',
    validUntil: overrides.validUntil ?? new Date('2026-04-20'),
    notes: overrides.notes ?? 'Genuine Havells stock, GST invoice provided',
    status: overrides.status ?? 'submitted',
    createdAt: overrides.createdAt ?? new Date('2026-04-09'),
    ...overrides,
  };
}
```

### 27.2.6 Service Tests -- Blind Match Evaluation

```typescript
// src/services/blind-match.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlindMatchService } from './blind-match.service';
import { prisma } from '../../lib/prisma';

// Mock Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    inquiry: { findUnique: vi.fn(), update: vi.fn() },
    quote: { update: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() },
    dealer: { findUnique: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn() },
    conversation: { create: vi.fn() },
    message: { create: vi.fn() },
    $transaction: vi.fn((fn) => fn(prisma)),
  },
}));

describe('BlindMatchService', () => {
  let service: BlindMatchService;

  beforeEach(() => {
    service = new BlindMatchService();
    vi.clearAllMocks();
  });

  describe('selectWinner', () => {
    it('should throw NOT_FOUND if inquiry does not exist', async () => {
      vi.mocked(prisma.inquiry.findUnique).mockResolvedValue(null);

      await expect(service.selectWinner('inq_1', 'qt_1', 'usr_1'))
        .rejects.toThrow('Inquiry not found');
    });

    it('should throw FORBIDDEN if buyer does not own inquiry', async () => {
      vi.mocked(prisma.inquiry.findUnique).mockResolvedValue({
        id: 'inq_1',
        buyerId: 'usr_other',
        status: 'under_review',
        quotes: [],
      } as any);

      await expect(service.selectWinner('inq_1', 'qt_1', 'usr_1'))
        .rejects.toThrow('Not your inquiry');
    });

    it('should throw INVALID_STATE_TRANSITION if inquiry is not under_review', async () => {
      vi.mocked(prisma.inquiry.findUnique).mockResolvedValue({
        id: 'inq_1',
        buyerId: 'usr_1',
        status: 'accepting_quotes',
        quotes: [],
      } as any);

      await expect(service.selectWinner('inq_1', 'qt_1', 'usr_1'))
        .rejects.toThrow('Cannot select winner');
    });

    it('should throw NOT_FOUND if quote does not belong to inquiry', async () => {
      vi.mocked(prisma.inquiry.findUnique).mockResolvedValue({
        id: 'inq_1',
        buyerId: 'usr_1',
        status: 'under_review',
        quotes: [{ id: 'qt_2', dealerId: 'dlr_1', totalAmount: 100000, status: 'submitted' }],
      } as any);

      await expect(service.selectWinner('inq_1', 'qt_nonexistent', 'usr_1'))
        .rejects.toThrow('Quote not found');
    });

    it('should successfully select winner, mark losing quotes, and reveal identities', async () => {
      const mockQuote = { id: 'qt_1', dealerId: 'dlr_1', totalAmount: 248000, status: 'submitted' };
      const mockLosingQuote = { id: 'qt_2', dealerId: 'dlr_2', totalAmount: 300000, status: 'submitted' };

      vi.mocked(prisma.inquiry.findUnique).mockResolvedValue({
        id: 'inq_1',
        buyerId: 'usr_1',
        status: 'under_review',
        quotes: [mockQuote, mockLosingQuote],
      } as any);

      vi.mocked(prisma.inquiry.update).mockResolvedValue({ id: 'inq_1', status: 'matched' } as any);
      vi.mocked(prisma.quote.update).mockResolvedValue({ id: 'qt_1', status: 'won' } as any);
      vi.mocked(prisma.quote.updateMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.dealer.findUnique).mockResolvedValue({
        id: 'dlr_1',
        userId: 'usr_dlr_1',
        businessName: 'Test Dealer',
        address: '123 Test St',
        user: { name: 'Dealer User', phone: '+919876543210', email: 'dealer@test.com' },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'usr_1',
        name: 'Buyer User',
        phone: '+919024779018',
        email: 'buyer@test.com',
      } as any);
      vi.mocked(prisma.conversation.create).mockResolvedValue({ id: 'conv_1' } as any);
      vi.mocked(prisma.message.create).mockResolvedValue({ id: 'msg_1' } as any);

      const result = await service.selectWinner('inq_1', 'qt_1', 'usr_1');

      expect(result.inquiry.status).toBe('matched');
      expect(result.winningQuote.dealerContact.businessName).toBe('Test Dealer');
      expect(result.winningQuote.dealerContact.phone).toBe('+919876543210');
      expect(result.conversation.id).toBe('conv_1');

      // Verify winning quote marked as won
      expect(prisma.quote.update).toHaveBeenCalledWith({
        where: { id: 'qt_1' },
        data: { status: 'won' },
      });

      // Verify losing quotes marked as lost
      expect(prisma.quote.updateMany).toHaveBeenCalledWith({
        where: { inquiryId: 'inq_1', id: { not: 'qt_1' } },
        data: { status: 'lost' },
      });
    });

    it('should NOT expose dealer identity in buyer-facing view before selection', async () => {
      const inquiry = { id: 'inq_blind', buyerId: 'usr_1', status: 'under_review' };
      const quotes = [
        { id: 'q_blind', dealerId: 'dealer_secret', totalAmount: 50000, status: 'submitted' },
      ];

      vi.mocked(prisma.inquiry.findUnique).mockResolvedValue({
        ...inquiry,
        quotes,
      } as any);
      vi.mocked(prisma.quote.findMany).mockResolvedValue(quotes as any);

      const buyerView = await service.getQuotesForBuyer('inq_blind', 'usr_1');

      // Buyer view must NOT contain dealerId, dealer name, or any identifying info
      const serialized = JSON.stringify(buyerView);
      expect(serialized).not.toContain('dealer_secret');
      expect(serialized).not.toContain('dealerId');
      expect(serialized).not.toContain('companyName');

      // Buyer view uses anonymized labels
      expect(buyerView[0]).toHaveProperty('label');
      expect(buyerView[0].label).toMatch(/^Dealer [A-Z]$/);
    });

    it('should handle zero quotes gracefully', async () => {
      vi.mocked(prisma.inquiry.findUnique).mockResolvedValue({
        id: 'inq_empty',
        buyerId: 'usr_1',
        status: 'accepting_quotes',
        quotes: [],
      } as any);

      const result = await service.getQuotesForBuyer('inq_empty', 'usr_1');
      expect(result).toHaveLength(0);
    });

    it('should handle tied scores by preferring earlier submission', async () => {
      vi.mocked(prisma.quote.findMany).mockResolvedValue([
        { id: 'q_late', dealerId: 'dlr_b', totalAmount: 50000, deliveryDays: 5, createdAt: new Date('2026-04-08T14:00:00Z') },
        { id: 'q_early', dealerId: 'dlr_a', totalAmount: 50000, deliveryDays: 5, createdAt: new Date('2026-04-08T10:00:00Z') },
      ] as any);

      const rankings = await service.rankQuotes('inq_tie');

      // Earlier submission wins on tie
      expect(rankings[0].quoteId).toBe('q_early');
    });
  });

  describe('findMatchingDealers', () => {
    it('should find verified dealers matching category and city', async () => {
      vi.mocked(prisma.dealer.findMany).mockResolvedValue([
        { id: 'dlr_1', userId: 'usr_1' },
        { id: 'dlr_2', userId: 'usr_2' },
      ] as any);

      const dealers = await service.findMatchingDealers({
        id: 'inq_1',
        categoryId: 'cat_electrical',
        deliveryCity: 'Jaipur',
      });

      expect(dealers).toHaveLength(2);
      expect(prisma.dealer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            kycStatus: 'approved',
            isActive: true,
          }),
        })
      );
    });
  });
});
```

### 27.2.7 Service Tests -- Price Calculation with GST

```typescript
// src/services/pricing.service.test.ts

import { describe, it, expect } from 'vitest';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const service = new PricingService();

  describe('calculateGST', () => {
    it('should calculate 18% GST for electrical products (MCBs, wires, switches)', () => {
      const result = service.calculateGST({
        basePrice: 10000,
        category: 'ELECTRICAL',
        subcategory: 'MCB',
        sellerState: 'RJ',
        buyerState: 'RJ',
      });

      expect(result.cgst).toBe(900);   // 9% CGST
      expect(result.sgst).toBe(900);   // 9% SGST
      expect(result.igst).toBe(0);     // Same state = no IGST
      expect(result.totalGst).toBe(1800);
      expect(result.totalWithGst).toBe(11800);
      expect(result.gstRate).toBe(18);
    });

    it('should apply IGST for inter-state transactions', () => {
      const result = service.calculateGST({
        basePrice: 10000,
        category: 'ELECTRICAL',
        subcategory: 'MCB',
        sellerState: 'RJ',   // Rajasthan
        buyerState: 'MH',    // Maharashtra
      });

      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.igst).toBe(1800);  // 18% IGST
      expect(result.totalGst).toBe(1800);
      expect(result.totalWithGst).toBe(11800);
    });

    it('should apply 12% GST for solar panels', () => {
      const result = service.calculateGST({
        basePrice: 50000,
        category: 'ELECTRICAL',
        subcategory: 'SOLAR_PANEL',
        sellerState: 'RJ',
        buyerState: 'RJ',
      });

      expect(result.gstRate).toBe(12);
      expect(result.totalGst).toBe(6000);
      expect(result.totalWithGst).toBe(56000);
    });

    it('should apply 28% GST for luxury lighting and chandeliers', () => {
      const result = service.calculateGST({
        basePrice: 25000,
        category: 'LIGHTING',
        subcategory: 'CHANDELIER',
        sellerState: 'MH',
        buyerState: 'MH',
      });

      expect(result.gstRate).toBe(28);
      expect(result.totalGst).toBe(7000);
    });

    it('should handle zero base price', () => {
      const result = service.calculateGST({
        basePrice: 0,
        category: 'ELECTRICAL',
        subcategory: 'MCB',
        sellerState: 'RJ',
        buyerState: 'RJ',
      });

      expect(result.totalGst).toBe(0);
      expect(result.totalWithGst).toBe(0);
    });

    it('should throw for negative base price', () => {
      expect(() =>
        service.calculateGST({
          basePrice: -100,
          category: 'ELECTRICAL',
          subcategory: 'MCB',
          sellerState: 'RJ',
          buyerState: 'RJ',
        })
      ).toThrow('Base price cannot be negative');
    });

    it('should round GST to 2 decimal places', () => {
      const result = service.calculateGST({
        basePrice: 999,
        category: 'ELECTRICAL',
        subcategory: 'MCB',
        sellerState: 'RJ',
        buyerState: 'RJ',
      });

      // 999 * 0.18 = 179.82
      expect(result.totalGst).toBe(179.82);
      expect(result.cgst).toBe(89.91);
      expect(result.sgst).toBe(89.91);
      expect(result.totalWithGst).toBe(1178.82);
    });
  });

  describe('calculateSavings', () => {
    it('should compute savings vs MRP and vs nearest dealer', () => {
      const result = service.calculateSavings({
        mrp: 585,
        nearestDealerPrice: 520,
        hub4estatePrice: 465,
        quantity: 200,
      });

      expect(result.savingsVsMrp).toBe(24000);            // (585 - 465) * 200
      expect(result.savingsVsDealer).toBe(11000);          // (520 - 465) * 200
      expect(result.savingsPercentVsMrp).toBeCloseTo(20.51, 1);
      expect(result.savingsPercentVsDealer).toBeCloseTo(10.58, 1);
    });

    it('should return zero savings when Hub4Estate price equals MRP', () => {
      const result = service.calculateSavings({
        mrp: 500,
        nearestDealerPrice: 500,
        hub4estatePrice: 500,
        quantity: 100,
      });

      expect(result.savingsVsMrp).toBe(0);
      expect(result.savingsPercentVsMrp).toBe(0);
    });

    it('should handle negative savings (Hub4Estate price higher than MRP)', () => {
      const result = service.calculateSavings({
        mrp: 400,
        nearestDealerPrice: 380,
        hub4estatePrice: 420,
        quantity: 50,
      });

      expect(result.savingsVsMrp).toBe(-1000);
      expect(result.savingsPercentVsMrp).toBeLessThan(0);
    });
  });

  describe('validateQuotePrice', () => {
    it('should reject quote price exceeding 2x MRP (suspicious pricing)', () => {
      const result = service.validateQuotePrice({ quoteUnitPrice: 1200, productMrp: 500 });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('exceeds 2x MRP');
    });

    it('should reject quote price below 20% of MRP (dump pricing / fraud)', () => {
      const result = service.validateQuotePrice({ quoteUnitPrice: 80, productMrp: 500 });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('below minimum threshold');
    });

    it('should accept quote price within valid range', () => {
      const result = service.validateQuotePrice({ quoteUnitPrice: 350, productMrp: 500 });
      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });
  });
});
```

### 27.2.8 Quote Scoring Algorithm Tests

```typescript
// src/services/scoring.service.test.ts

import { describe, it, expect } from 'vitest';
import { calculateQuoteScore } from './blind-match/scoring.service';

describe('calculateQuoteScore', () => {
  const defaultDealerMetrics = {
    conversionRate: 0.8,
    avgResponseTimeHours: 3,
    disputeRate: 0.02,
    completionRate: 0.95,
  };

  it('should give highest price score to lowest price quote', () => {
    const quotes = [
      { id: 'q1', totalAmount: 20000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' },
      { id: 'q2', totalAmount: 30000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' },
      { id: 'q3', totalAmount: 40000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' },
    ];

    const score1 = calculateQuoteScore(quotes[0] as any, quotes as any, defaultDealerMetrics);
    const score2 = calculateQuoteScore(quotes[1] as any, quotes as any, defaultDealerMetrics);
    const score3 = calculateQuoteScore(quotes[2] as any, quotes as any, defaultDealerMetrics);

    expect(score1.priceScore).toBe(40);  // Best price = max price score (40 weight)
    expect(score2.priceScore).toBe(20);
    expect(score3.priceScore).toBe(0);
  });

  it('should handle all identical prices gracefully (all get max)', () => {
    const quotes = [
      { id: 'q1', totalAmount: 25000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' },
      { id: 'q2', totalAmount: 25000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' },
    ];

    const score1 = calculateQuoteScore(quotes[0] as any, quotes as any, defaultDealerMetrics);
    const score2 = calculateQuoteScore(quotes[1] as any, quotes as any, defaultDealerMetrics);

    expect(score1.priceScore).toBe(40);
    expect(score2.priceScore).toBe(40);
  });

  it('should penalize partial quantity fulfillment', () => {
    const fullQuote = { id: 'q1', totalAmount: 25000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' };
    const partialQuote = { id: 'q2', totalAmount: 25000, deliveryDays: 5, quotedItems: 1, requestedItems: 2, totalQuantityOffered: 50, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' };

    const scoreFull = calculateQuoteScore(fullQuote as any, [fullQuote, partialQuote] as any, defaultDealerMetrics);
    const scorePartial = calculateQuoteScore(partialQuote as any, [fullQuote, partialQuote] as any, defaultDealerMetrics);

    expect(scoreFull.completenessScore).toBeGreaterThan(scorePartial.completenessScore);
  });

  it('should give higher reliability score to better-rated dealers', () => {
    const quote = { id: 'q1', totalAmount: 25000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' };

    const goodDealer = { conversionRate: 0.9, avgResponseTimeHours: 1, disputeRate: 0.01, completionRate: 0.98 };
    const badDealer = { conversionRate: 0.2, avgResponseTimeHours: 48, disputeRate: 0.25, completionRate: 0.6 };

    const goodScore = calculateQuoteScore(quote as any, [quote] as any, goodDealer);
    const badScore = calculateQuoteScore(quote as any, [quote] as any, badDealer);

    expect(goodScore.dealerReliability).toBeGreaterThan(badScore.dealerReliability);
    expect(goodScore.dealerReliability).toBeGreaterThanOrEqual(16);
    expect(badScore.dealerReliability).toBeLessThanOrEqual(4);
  });

  it('should compute total composite score between 0 and 100', () => {
    const quote = { id: 'q1', totalAmount: 25000, deliveryDays: 5, quotedItems: 2, requestedItems: 2, totalQuantityOffered: 100, totalQuantityRequested: 100, deliveryCharge: 500, paymentTerms: 'advance' };

    const score = calculateQuoteScore(quote as any, [quote] as any, defaultDealerMetrics);

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });
});
```

### 27.2.9 Middleware Tests

```typescript
// src/middleware/auth.middleware.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from './auth.middleware';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('authMiddleware', () => {
  const mockReq = (authHeader?: string) => ({
    headers: { authorization: authHeader },
    user: undefined,
  } as any);

  const mockRes = {} as any;
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw if no Authorization header', () => {
    expect(() => authMiddleware(mockReq(), mockRes, mockNext))
      .toThrow('Missing or invalid authorization header');
  });

  it('should throw if header does not start with Bearer', () => {
    expect(() => authMiddleware(mockReq('Basic abc123'), mockRes, mockNext))
      .toThrow('Missing or invalid authorization header');
  });

  it('should throw TOKEN_EXPIRED if JWT is expired', () => {
    const expiredToken = jwt.sign(
      { sub: 'usr_1', role: 'buyer', email: 'test@test.com', dealerId: null },
      env.JWT_SECRET,
      { expiresIn: '-1h', issuer: 'hub4estate', audience: 'hub4estate-api' }
    );

    expect(() => authMiddleware(mockReq(`Bearer ${expiredToken}`), mockRes, mockNext))
      .toThrow('Access token has expired');
  });

  it('should attach user to request if JWT is valid', () => {
    const validToken = jwt.sign(
      { sub: 'usr_1', role: 'buyer', email: 'test@test.com', dealerId: null },
      env.JWT_SECRET,
      { expiresIn: '24h', issuer: 'hub4estate', audience: 'hub4estate-api' }
    );

    const req = mockReq(`Bearer ${validToken}`);
    authMiddleware(req, mockRes, mockNext);

    expect(req.user).toEqual({
      id: 'usr_1',
      email: 'test@test.com',
      role: 'buyer',
      dealerId: null,
    });
    expect(mockNext).toHaveBeenCalledOnce();
  });

  it('should throw if JWT has invalid signature', () => {
    const tamperedToken = jwt.sign(
      { sub: 'usr_1', role: 'admin' },
      'wrong-secret',
      { expiresIn: '24h' }
    );

    expect(() => authMiddleware(mockReq(`Bearer ${tamperedToken}`), mockRes, mockNext))
      .toThrow();
  });
});
```

### 27.2.10 Zod Validation Schema Tests

```typescript
// src/validations/inquiry.validation.test.ts

import { describe, it, expect } from 'vitest';
import { CreateInquirySchema, SubmitQuoteSchema } from './inquiry.validation';

describe('CreateInquirySchema', () => {
  const validInput = {
    title: 'Need 200 Havells MCB 32A',
    categoryId: 'cat_electrical',
    items: [{ productName: 'Havells MCB 32A', brandPreference: 'havells', quantity: 10, unit: 'pieces' }],
    deliveryCity: 'Jaipur',
    deliveryDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    urgency: 'standard',
    quoteDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
  };

  it('should accept valid input', () => {
    const result = CreateInquirySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject title shorter than 5 characters', () => {
    const result = CreateInquirySchema.safeParse({ ...validInput, title: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('should reject title longer than 200 characters', () => {
    const result = CreateInquirySchema.safeParse({ ...validInput, title: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should reject empty items array', () => {
    const result = CreateInquirySchema.safeParse({ ...validInput, items: [] });
    expect(result.success).toBe(false);
  });

  it('should reject item with zero quantity', () => {
    const result = CreateInquirySchema.safeParse({
      ...validInput,
      items: [{ productName: 'Test', quantity: 0, unit: 'pieces' }],
    });
    expect(result.success).toBe(false);
  });

  it('should reject delivery deadline in the past', () => {
    const result = CreateInquirySchema.safeParse({
      ...validInput,
      deliveryDeadline: '2025-01-01T00:00:00Z',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid urgency value', () => {
    const result = CreateInquirySchema.safeParse({ ...validInput, urgency: 'ASAP' });
    expect(result.success).toBe(false);
  });

  it('should accept valid urgency values', () => {
    for (const urgency of ['standard', 'urgent', 'flexible']) {
      const result = CreateInquirySchema.safeParse({ ...validInput, urgency });
      expect(result.success).toBe(true);
    }
  });

  it('should strip unknown fields (no prototype pollution)', () => {
    const result = CreateInquirySchema.safeParse({
      ...validInput,
      __proto__: { admin: true },
      randomField: 'should be stripped',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).randomField).toBeUndefined();
    }
  });
});

describe('SubmitQuoteSchema', () => {
  const validQuote = {
    items: [{ inquiryItemId: 'item_1', unitPrice: 245.5, quantity: 200, unit: 'pieces' }],
    deliveryDays: 5,
    deliveryCharge: 500,
    paymentTerms: 'advance',
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    notes: 'Genuine Havells stock',
  };

  it('should accept valid quote', () => {
    const result = SubmitQuoteSchema.safeParse(validQuote);
    expect(result.success).toBe(true);
  });

  it('should reject unitPrice of zero', () => {
    const result = SubmitQuoteSchema.safeParse({
      ...validQuote,
      items: [{ ...validQuote.items[0], unitPrice: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('should reject deliveryDays greater than 90', () => {
    const result = SubmitQuoteSchema.safeParse({ ...validQuote, deliveryDays: 91 });
    expect(result.success).toBe(false);
  });

  it('should reject negative delivery charges', () => {
    const result = SubmitQuoteSchema.safeParse({ ...validQuote, deliveryCharge: -100 });
    expect(result.success).toBe(false);
  });
});
```

### 27.2.11 Zustand Store Tests (Frontend)

```typescript
// src/stores/useCartStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';
import { act, renderHook } from '@testing-library/react';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], total: 0 });
  });

  it('should add an item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: 'prod_mcb_32a',
        name: 'Havells MCB 32A',
        unitPrice: 245,
        quantity: 10,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('prod_mcb_32a');
    expect(result.current.total).toBe(2450);
  });

  it('should increment quantity if same product already in cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({ productId: 'prod_mcb_32a', name: 'Havells MCB 32A', unitPrice: 245, quantity: 10 });
      result.current.addItem({ productId: 'prod_mcb_32a', name: 'Havells MCB 32A', unitPrice: 245, quantity: 5 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(15);
    expect(result.current.total).toBe(3675);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({ productId: 'prod_1', name: 'Test', unitPrice: 100, quantity: 5 });
      result.current.removeItem('prod_1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({ productId: 'prod_1', name: 'Test 1', unitPrice: 100, quantity: 5 });
      result.current.addItem({ productId: 'prod_2', name: 'Test 2', unitPrice: 200, quantity: 3 });
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
```

### 27.2.12 React Component Tests

```typescript
// src/components/QuoteCard/QuoteCard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteCard } from './QuoteCard';

describe('QuoteCard', () => {
  const defaultProps = {
    label: 'Dealer A',
    totalAmount: 49000,
    deliveryDays: 5,
    score: 82.5,
    onSelect: vi.fn(),
    onViewDetails: vi.fn(),
  };

  it('should render quote details correctly', () => {
    render(<QuoteCard {...defaultProps} />);
    expect(screen.getByText('Dealer A')).toBeInTheDocument();
    expect(screen.getByText(/49,000/)).toBeInTheDocument();
    expect(screen.getByText(/5 days/)).toBeInTheDocument();
  });

  it('should display anonymized dealer label, not real name', () => {
    render(<QuoteCard {...defaultProps} label="Dealer B" />);
    expect(screen.getByText('Dealer B')).toBeInTheDocument();
    expect(screen.queryByText(/Sharma/)).not.toBeInTheDocument();
    expect(screen.queryByText(/dealer_/)).not.toBeInTheDocument();
  });

  it('should call onSelect when Select button is clicked', () => {
    render(<QuoteCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /select/i }));
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('should show Best Price badge for highest-scored quote', () => {
    render(<QuoteCard {...defaultProps} isBestPrice={true} />);
    expect(screen.getByText(/Best Price/i)).toBeInTheDocument();
  });

  it('should display savings percentage when provided', () => {
    render(<QuoteCard {...defaultProps} savingsPercent={20.5} />);
    expect(screen.getByText(/20.5% savings/i)).toBeInTheDocument();
  });
});
```

### 27.2.13 Custom Hook Tests

```typescript
// src/hooks/useBlindMatch.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBlindMatch } from './useBlindMatch';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

import { api } from '@/lib/api';

describe('useBlindMatch', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('should fetch blind match results and return anonymized rankings', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        rankings: [
          { label: 'Dealer A', score: 92, totalAmount: 46000, deliveryDays: 3 },
          { label: 'Dealer B', score: 85, totalAmount: 49000, deliveryDays: 5 },
        ],
        status: 'under_review',
        quotesCount: 2,
      },
    });

    const { result } = renderHook(() => useBlindMatch('inq_123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.rankings).toHaveLength(2);
    expect(result.current.data?.rankings[0].label).toBe('Dealer A');

    // Verify no dealer IDs leak
    const serialized = JSON.stringify(result.current.data);
    expect(serialized).not.toMatch(/dealer_[a-z0-9]+/);
    expect(serialized).not.toMatch(/dlr_[a-z0-9]+/);
  });

  it('should handle loading state', () => {
    (api.get as any).mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useBlindMatch('inq_123'), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBlindMatch('inq_123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should not fetch when inquiryId is null', () => {
    renderHook(() => useBlindMatch(null), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });
});
```

---

## 27.3 Integration Tests (Supertest)

### 27.3.1 Test Infrastructure

```yaml
# tests/integration/setup/docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hub4estate_test
      POSTGRES_PASSWORD: test_password_only
      POSTGRES_DB: hub4estate_test
    ports:
      - '5433:5432'
    tmpfs:
      - /var/lib/postgresql/data  # RAM-backed for speed
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U hub4estate_test']
      interval: 2s
      timeout: 5s
      retries: 10

  redis-test:
    image: redis:7-alpine
    ports:
      - '6380:6379'
    command: redis-server --maxmemory 50mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 2s
      timeout: 5s
      retries: 10
```

```typescript
// tests/integration/setup/global-setup.ts

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const TEST_DATABASE_URL = 'postgresql://hub4estate_test:test_password_only@localhost:5433/hub4estate_test';

export async function setup() {
  // Start Docker containers
  execSync('docker compose -f tests/integration/setup/docker-compose.test.yml up -d --wait', {
    stdio: 'pipe',
  });

  // Run Prisma migrations against test DB
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });

  // Seed minimal reference data
  const prisma = new PrismaClient({ datasourceUrl: TEST_DATABASE_URL });
  await seedTestData(prisma);
  await prisma.$disconnect();
}

export async function teardown() {
  execSync('docker compose -f tests/integration/setup/docker-compose.test.yml down -v', {
    stdio: 'pipe',
  });
}

async function seedTestData(prisma: PrismaClient) {
  await prisma.city.createMany({
    data: [
      { id: 'city_sriganganagar', name: 'Sri Ganganagar', state: 'RJ', pincodesServed: ['335001', '335002'] },
      { id: 'city_jaipur', name: 'Jaipur', state: 'RJ', pincodesServed: ['302001', '302002'] },
    ],
    skipDuplicates: true,
  });

  await prisma.category.createMany({
    data: [
      { id: 'cat_electrical', name: 'Electrical', slug: 'electrical' },
      { id: 'cat_mcb', name: 'MCB & Distribution', slug: 'mcb', parentId: 'cat_electrical' },
      { id: 'cat_wire', name: 'Wires & Cables', slug: 'wires', parentId: 'cat_electrical' },
    ],
    skipDuplicates: true,
  });

  await prisma.brand.createMany({
    data: [
      { id: 'brand_havells', name: 'Havells', slug: 'havells' },
      { id: 'brand_polycab', name: 'Polycab', slug: 'polycab' },
    ],
    skipDuplicates: true,
  });
}
```

### 27.3.2 Integration Test Helpers

```typescript
// tests/integration/helpers.ts

import request from 'supertest';
import { app } from '../../src/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const TEST_DATABASE_URL = 'postgresql://hub4estate_test:test_password_only@localhost:5433/hub4estate_test';
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-256-bits-minimum-length-here';

let prisma: PrismaClient;

export function getRequest() {
  return request(app);
}

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({ datasourceUrl: TEST_DATABASE_URL });
  }
  return prisma;
}

export function generateTestToken(user: { id: string; role: string; email?: string; dealerId?: string | null }) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email || `${user.id}@test.com`,
      dealerId: user.dealerId ?? null,
    },
    JWT_SECRET,
    { expiresIn: '1h', issuer: 'hub4estate', audience: 'hub4estate-api' }
  );
}

export async function cleanTables(prisma: PrismaClient, tables: string[]) {
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}
```

### 27.3.3 Auth API Integration Tests

```typescript
// tests/integration/api/auth.api.test.ts

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getRequest, getPrisma, cleanTables } from '../helpers';
import type { PrismaClient } from '@prisma/client';

describe('Auth API', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = getPrisma();
  });

  beforeEach(async () => {
    await cleanTables(prisma, ['users']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new buyer with valid data', async () => {
      const res = await getRequest()
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Buyer',
          email: 'buyer@test.com',
          phone: '+919000012345',
          password: 'SecureP@ss123',
          role: 'buyer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.role).toBe('buyer');

      const user = await prisma.user.findUnique({ where: { email: 'buyer@test.com' } });
      expect(user).not.toBeNull();
      expect(user!.name).toBe('Test Buyer');
    });

    it('should reject duplicate email', async () => {
      await getRequest().post('/api/v1/auth/register').send({
        name: 'First', email: 'dup@test.com', phone: '+919000011111', password: 'SecureP@ss123', role: 'buyer',
      });

      const res = await getRequest().post('/api/v1/auth/register').send({
        name: 'Second', email: 'dup@test.com', phone: '+919000022222', password: 'SecureP@ss456', role: 'buyer',
      });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject weak password', async () => {
      const res = await getRequest().post('/api/v1/auth/register').send({
        name: 'Weak', email: 'weak@test.com', phone: '+919000033333', password: '123', role: 'buyer',
      });

      expect(res.status).toBe(400);
    });

    it('should NOT allow registration with admin role', async () => {
      const res = await getRequest().post('/api/v1/auth/register').send({
        name: 'Sneaky', email: 'admin@test.com', phone: '+919000044444', password: 'SecureP@ss123', role: 'admin',
      });

      expect(res.status).toBe(400);
    });

    it('should hash password (never store plaintext)', async () => {
      await getRequest().post('/api/v1/auth/register').send({
        name: 'Hash', email: 'hash@test.com', phone: '+919000055555', password: 'SecureP@ss123', role: 'buyer',
      });

      const user = await prisma.user.findUnique({ where: { email: 'hash@test.com' } });
      expect(user!.passwordHash).not.toBe('SecureP@ss123');
      expect(user!.passwordHash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await getRequest().post('/api/v1/auth/register').send({
        name: 'Login Test', email: 'login@test.com', phone: '+919000099999', password: 'SecureP@ss123', role: 'buyer',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await getRequest().post('/api/v1/auth/login').send({
        email: 'login@test.com', password: 'SecureP@ss123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject wrong password', async () => {
      const res = await getRequest().post('/api/v1/auth/login').send({
        email: 'login@test.com', password: 'WrongPassword123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject non-existent email with same error as wrong password', async () => {
      const res = await getRequest().post('/api/v1/auth/login').send({
        email: 'ghost@test.com', password: 'SecureP@ss123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should rate limit after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await getRequest().post('/api/v1/auth/login').send({ email: 'login@test.com', password: 'wrong' });
      }

      const res = await getRequest().post('/api/v1/auth/login').send({
        email: 'login@test.com', password: 'SecureP@ss123',
      });

      expect(res.status).toBe(429);
    });
  });
});
```

### 27.3.4 Blind Matching API Integration Tests

```typescript
// tests/integration/api/blind-match.api.test.ts

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getRequest, getPrisma, generateTestToken, cleanTables } from '../helpers';
import type { PrismaClient } from '@prisma/client';

describe('Blind Matching API', () => {
  let prisma: PrismaClient;
  let buyerToken: string;
  let dealer1Token: string;
  let dealer2Token: string;

  beforeAll(async () => {
    prisma = getPrisma();
  });

  beforeEach(async () => {
    await cleanTables(prisma, ['quotes', 'inquiry_items', 'inquiries', 'dealers', 'users']);

    // Create buyer
    await prisma.user.create({
      data: { id: 'buyer_1', phone: '+919111111111', name: 'Test Buyer', role: 'buyer', email: 'buyer@test.com' },
    });
    buyerToken = generateTestToken({ id: 'buyer_1', role: 'buyer' });

    // Create dealers with profiles
    for (let i = 1; i <= 2; i++) {
      await prisma.user.create({
        data: { id: `usr_dealer_${i}`, phone: `+91922222222${i}`, name: `Dealer ${i}`, role: 'dealer', email: `dealer${i}@test.com` },
      });
      await prisma.dealer.create({
        data: {
          id: `dealer_${i}`,
          userId: `usr_dealer_${i}`,
          businessName: `Test Electricals ${i}`,
          gstNumber: `08AABCU${i}603R1Z${i}`,
          kycStatus: 'approved',
          isActive: true,
        },
      });
    }
    dealer1Token = generateTestToken({ id: 'usr_dealer_1', role: 'dealer', dealerId: 'dealer_1' });
    dealer2Token = generateTestToken({ id: 'usr_dealer_2', role: 'dealer', dealerId: 'dealer_2' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should complete full lifecycle: create inquiry -> submit quotes -> view blind results', async () => {
    // Step 1: Buyer creates inquiry
    const inquiryRes = await getRequest()
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Need 200 Havells MCB 32A',
        categoryId: 'cat_electrical',
        items: [{ productName: 'Havells MCB 32A', brandPreference: 'havells', quantity: 200, unit: 'pieces' }],
        deliveryCity: 'Sri Ganganagar',
        deliveryDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        urgency: 'standard',
        quoteDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

    expect(inquiryRes.status).toBe(201);
    const inquiryId = inquiryRes.body.data.id;

    // Step 2: Dealers submit quotes
    const q1 = await getRequest()
      .post(`/api/v1/inquiries/${inquiryId}/quotes`)
      .set('Authorization', `Bearer ${dealer1Token}`)
      .send({
        items: [{ inquiryItemId: inquiryRes.body.data.items[0].id, unitPrice: 260, quantity: 200, unit: 'pieces' }],
        deliveryDays: 7,
        deliveryCharge: 600,
        paymentTerms: 'advance',
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
      });
    expect(q1.status).toBe(201);

    const q2 = await getRequest()
      .post(`/api/v1/inquiries/${inquiryId}/quotes`)
      .set('Authorization', `Bearer ${dealer2Token}`)
      .send({
        items: [{ inquiryItemId: inquiryRes.body.data.items[0].id, unitPrice: 230, quantity: 200, unit: 'pieces' }],
        deliveryDays: 3,
        deliveryCharge: 400,
        paymentTerms: 'advance',
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
      });
    expect(q2.status).toBe(201);

    // Step 3: Buyer views quotes (blind)
    const quotesRes = await getRequest()
      .get(`/api/v1/inquiries/${inquiryId}/quotes`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(quotesRes.status).toBe(200);
    const rankings = quotesRes.body.data;

    expect(rankings).toHaveLength(2);

    // CRITICAL: Verify anonymization
    const serialized = JSON.stringify(rankings);
    expect(serialized).not.toContain('dealer_1');
    expect(serialized).not.toContain('dealer_2');
    expect(serialized).not.toContain('Test Electricals');
    expect(serialized).not.toContain('gstNumber');
    expect(serialized).not.toContain('businessName');

    for (const ranking of rankings) {
      expect(ranking.label).toMatch(/^Dealer [A-Z]$/);
      expect(ranking).toHaveProperty('score');
      expect(ranking).toHaveProperty('totalAmount');
      expect(ranking).toHaveProperty('deliveryDays');
      expect(ranking).not.toHaveProperty('dealerId');
    }

    // Rankings ordered by score descending
    expect(rankings[0].score).toBeGreaterThanOrEqual(rankings[1].score);
  });

  it('should prevent dealer from seeing other dealers quotes', async () => {
    const inqRes = await getRequest()
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Cross-visibility test',
        categoryId: 'cat_electrical',
        items: [{ productName: 'Wire', quantity: 100, unit: 'meters' }],
        deliveryCity: 'Jaipur',
        deliveryDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        urgency: 'standard',
        quoteDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
    const inquiryId = inqRes.body.data.id;
    const itemId = inqRes.body.data.items[0].id;

    await getRequest().post(`/api/v1/inquiries/${inquiryId}/quotes`).set('Authorization', `Bearer ${dealer1Token}`)
      .send({ items: [{ inquiryItemId: itemId, unitPrice: 260, quantity: 100, unit: 'meters' }], deliveryDays: 7, deliveryCharge: 600, paymentTerms: 'advance', validUntil: new Date(Date.now() + 14 * 86400000).toISOString() });

    await getRequest().post(`/api/v1/inquiries/${inquiryId}/quotes`).set('Authorization', `Bearer ${dealer2Token}`)
      .send({ items: [{ inquiryItemId: itemId, unitPrice: 230, quantity: 100, unit: 'meters' }], deliveryDays: 3, deliveryCharge: 400, paymentTerms: 'advance', validUntil: new Date(Date.now() + 14 * 86400000).toISOString() });

    // Dealer 1 fetches: should only see their own quote
    const d1Res = await getRequest()
      .get(`/api/v1/inquiries/${inquiryId}/quotes/mine`)
      .set('Authorization', `Bearer ${dealer1Token}`);

    expect(d1Res.status).toBe(200);
    expect(d1Res.body.data).toHaveLength(1);
    const serialized = JSON.stringify(d1Res.body.data);
    expect(serialized).not.toContain('dealer_2');
    expect(serialized).not.toContain('230'); // dealer_2's price
  });

  it('should prevent duplicate quote submission by same dealer', async () => {
    const inqRes = await getRequest()
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Duplicate test', categoryId: 'cat_electrical',
        items: [{ productName: 'MCB', quantity: 50, unit: 'pieces' }],
        deliveryCity: 'Jaipur',
        deliveryDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        urgency: 'standard',
        quoteDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
    const inquiryId = inqRes.body.data.id;
    const itemId = inqRes.body.data.items[0].id;

    const payload = { items: [{ inquiryItemId: itemId, unitPrice: 250, quantity: 50, unit: 'pieces' }], deliveryDays: 5, deliveryCharge: 500, paymentTerms: 'advance', validUntil: new Date(Date.now() + 14 * 86400000).toISOString() };

    const first = await getRequest().post(`/api/v1/inquiries/${inquiryId}/quotes`).set('Authorization', `Bearer ${dealer1Token}`).send(payload);
    expect(first.status).toBe(201);

    const second = await getRequest().post(`/api/v1/inquiries/${inquiryId}/quotes`).set('Authorization', `Bearer ${dealer1Token}`).send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('DUPLICATE_QUOTE');
  });

  it('should reject unauthenticated access to quotes', async () => {
    const res = await getRequest().get('/api/v1/inquiries/inq_any/quotes');
    expect(res.status).toBe(401);
  });
});
```

### 27.3.5 Payment Webhook Integration Tests

```typescript
// tests/integration/api/payment-webhook.api.test.ts

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getRequest, getPrisma, cleanTables } from '../helpers';
import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';

const RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret_razorpay';

describe('Payment Webhook API', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = RAZORPAY_WEBHOOK_SECRET;
    prisma = getPrisma();
  });

  beforeEach(async () => {
    await cleanTables(prisma, ['payments', 'orders', 'users']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  function signPayload(payload: object): string {
    return crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(JSON.stringify(payload)).digest('hex');
  }

  it('should process payment.captured and update order status', async () => {
    await prisma.user.create({ data: { id: 'buyer_pay', phone: '+919333333333', name: 'Buyer', role: 'buyer' } });
    await prisma.order.create({
      data: { id: 'order_1', buyerId: 'buyer_pay', status: 'payment_pending', totalAmount: 57820, razorpayOrderId: 'order_rzp_123' },
    });

    const payload = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_123', order_id: 'order_rzp_123', amount: 5782000, currency: 'INR', status: 'captured', method: 'upi' } } },
    };

    const res = await getRequest()
      .post('/api/v1/webhooks/razorpay')
      .set('X-Razorpay-Signature', signPayload(payload))
      .send(payload);

    expect(res.status).toBe(200);

    const order = await prisma.order.findUnique({ where: { id: 'order_1' } });
    expect(order!.status).toBe('payment_confirmed');
    expect(order!.razorpayPaymentId).toBe('pay_123');
  });

  it('should reject webhook with invalid signature', async () => {
    const res = await getRequest()
      .post('/api/v1/webhooks/razorpay')
      .set('X-Razorpay-Signature', 'invalid_sig')
      .send({ event: 'payment.captured', payload: {} });

    expect(res.status).toBe(401);
  });

  it('should be idempotent (same event processed twice safely)', async () => {
    await prisma.user.create({ data: { id: 'buyer_idem', phone: '+919444444444', name: 'Buyer', role: 'buyer' } });
    await prisma.order.create({
      data: { id: 'order_idem', buyerId: 'buyer_idem', status: 'payment_pending', totalAmount: 10000, razorpayOrderId: 'order_rzp_idem' },
    });

    const payload = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_idem', order_id: 'order_rzp_idem', amount: 1000000, currency: 'INR', status: 'captured', method: 'netbanking' } } },
    };
    const sig = signPayload(payload);

    await getRequest().post('/api/v1/webhooks/razorpay').set('X-Razorpay-Signature', sig).send(payload);
    await getRequest().post('/api/v1/webhooks/razorpay').set('X-Razorpay-Signature', sig).send(payload);

    const payments = await prisma.payment.findMany({ where: { razorpayPaymentId: 'pay_idem' } });
    expect(payments).toHaveLength(1);
  });

  it('should handle payment.failed event', async () => {
    await prisma.user.create({ data: { id: 'buyer_fail', phone: '+919555555555', name: 'Buyer', role: 'buyer' } });
    await prisma.order.create({
      data: { id: 'order_fail', buyerId: 'buyer_fail', status: 'payment_pending', totalAmount: 5000, razorpayOrderId: 'order_rzp_fail' },
    });

    const payload = {
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_fail', order_id: 'order_rzp_fail', amount: 500000, error_code: 'BAD_REQUEST_ERROR', error_description: 'Cancelled by user' } } },
    };

    const res = await getRequest().post('/api/v1/webhooks/razorpay').set('X-Razorpay-Signature', signPayload(payload)).send(payload);
    expect(res.status).toBe(200);

    const order = await prisma.order.findUnique({ where: { id: 'order_fail' } });
    expect(order!.status).toBe('payment_failed');
  });
});
```

---

## 27.4 E2E Tests (Playwright)

### 27.4.1 Playwright Configuration

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    timeout: 30_000,
    reuseExistingServer: true,
  },
});
```

### 27.4.2 Critical E2E Flows

| # | Test | Flows Covered | Priority |
|---|------|--------------|----------|
| 1 | Buyer Registration | Landing -> Register -> OTP -> Onboarding -> Dashboard | P0 |
| 2 | Dealer Onboarding | Register -> KYC -> Catalog -> Zones -> Profile -> Approval | P0 |
| 3 | Create Inquiry | Dashboard -> New Inquiry -> Category -> Products -> Delivery -> Submit | P0 |
| 4 | Quote Submission | Dealer Feed -> View Inquiry -> Fill Quote -> Submit | P0 |
| 5 | Select Winner | Inquiry Detail -> View Quotes (blind) -> Select -> Identity Reveal | P0 |
| 6 | Catalog Search | Search bar -> Results -> Filters -> Product Detail | P0 |
| 7 | Product Comparison | Select products -> Compare -> View side-by-side | P1 |
| 8 | Order and Payment | Match -> Confirm Order -> Razorpay -> Verify | P1 |
| 9 | Dispute Flow | Order -> Open Dispute -> Evidence -> Resolution | P2 |
| 10 | AI Chat | Open chat -> Ask question -> Get response -> Tool call | P2 |
| 11 | Slip Scanner | Upload receipt photo -> OCR -> Parsed products -> Add to inquiry | P2 |
| 12 | Dealer Inventory | Dealer dashboard -> Inventory -> Add/edit products -> CSV upload | P1 |
| 13 | Price Alerts | Product detail -> Set alert -> Receive notification (mocked) | P2 |
| 14 | Admin KYC Verification | Admin panel -> KYC queue -> Review -> Approve/Reject | P1 |
| 15 | Responsive Layout | All critical pages render without horizontal scroll on mobile | P1 |

### 27.4.3 E2E Test Data Management

| Strategy | When | How |
|----------|------|-----|
| API seeding | Before each test suite | `test.beforeAll` calls backend API to create test users/data |
| Database reset | Before each test suite | Truncate test-specific tables via API admin endpoint |
| Test isolation | Each test | Each test creates own data with unique timestamps in identifiers |
| Cleanup | After all tests | `test.afterAll` removes test data (or DB is ephemeral in CI) |
| Fixtures | Shared reference data | Products and categories seeded once in global setup; users created per-test |

---

## 27.5 Performance Tests (k6)

### 27.5.1 k6 Test Scenarios

```javascript
// load-tests/catalog-search.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_duration{endpoint:catalog_search}': ['p(50)<150', 'p(95)<400', 'p(99)<800'],
    'http_req_duration{endpoint:product_detail}': ['p(50)<100', 'p(95)<300', 'p(99)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const searchTerms = ['havells mcb', 'polycab wire', 'led panel', 'switch 16a', 'cable 2.5mm'];

export default function () {
  const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const searchRes = http.get(`${__ENV.API_URL}/api/v1/catalog/search?q=${encodeURIComponent(term)}&limit=20`, {
    tags: { endpoint: 'catalog_search' },
  });

  check(searchRes, {
    'search returns 200': (r) => r.status === 200,
    'search has results': (r) => JSON.parse(r.body).data.length > 0,
    'search under 400ms': (r) => r.timings.duration < 400,
  });

  if (searchRes.status === 200) {
    const products = JSON.parse(searchRes.body).data;
    if (products.length > 0) {
      const productRes = http.get(`${__ENV.API_URL}/api/v1/catalog/products/${products[0].id}`, {
        tags: { endpoint: 'product_detail' },
      });
      check(productRes, { 'product detail 200': (r) => r.status === 200 });
    }
  }

  sleep(Math.random() * 2 + 1);
}
```

### 27.5.2 Performance Targets by Endpoint

| Endpoint | Method | p50 | p95 | p99 | Target RPS | Notes |
|----------|--------|-----|-----|-----|-----------|-------|
| `/api/v1/auth/login` | POST | <150ms | <400ms | <800ms | 50 | bcrypt is CPU-bound |
| `/api/v1/auth/otp/send` | POST | <100ms | <300ms | <500ms | 50 | MSG91 API call |
| `/api/v1/catalog/search` | GET | <100ms | <300ms | <500ms | 200 | Elasticsearch-backed |
| `/api/v1/catalog/products/:id` | GET | <80ms | <200ms | <400ms | 300 | Redis-cached |
| `/api/v1/inquiries` | POST | <200ms | <500ms | <1000ms | 50 | DB write + queue |
| `/api/v1/inquiries/:id/quotes` | POST | <150ms | <400ms | <800ms | 100 | DB write + notification |
| `/api/v1/inquiries/:id/quotes` | GET | <100ms | <300ms | <500ms | 100 | Redis-cached blind view |
| `/api/v1/inquiries/:id/select-winner` | POST | <300ms | <600ms | <1200ms | 20 | Transaction + reveal |
| `/api/v1/orders` | POST | <300ms | <600ms | <1200ms | 30 | Transaction + payment init |
| `/api/v1/webhooks/razorpay` | POST | <100ms | <200ms | <500ms | 50 | Must not drop |
| `/api/v1/ai/chat` | POST | <2000ms | <5000ms | <8000ms | 20 | Claude API latency |
| `/api/v1/users/me` | GET | <50ms | <150ms | <300ms | 200 | JWT decode + cache |
| `/api/v1/dashboard/buyer` | GET | <200ms | <500ms | <1000ms | 100 | Aggregated data |
| File upload (images) | POST | <1000ms | <3000ms | <5000ms | 20 | S3 upload |

---

## 27.6 Security Tests

### 27.6.1 Automated Security Scanning (OWASP ZAP)

**Frequency**: Weekly automated scan (Sunday 02:00 IST) + on-demand before releases.

```yaml
# .github/workflows/security-scan.yml (relevant excerpt)
security-scan:
  runs-on: ubuntu-latest
  schedule:
    - cron: '30 20 * * 0'  # Sunday 02:00 IST
  steps:
    - name: OWASP ZAP Baseline Scan
      uses: zaproxy/action-baseline@v0.10.0
      with:
        target: ${{ secrets.STAGING_URL }}
        rules_file_name: 'zap-rules.conf'
        cmd_options: '-a -j -l WARN'

    - name: OWASP ZAP API Scan
      uses: zaproxy/action-api-scan@v0.6.0
      with:
        target: ${{ secrets.STAGING_URL }}/api/v1/openapi.json
        format: openapi
```

**Additional automated tools:**

| Tool | Frequency | Integration |
|------|-----------|-------------|
| `pnpm audit` | Every CI run | GitHub Actions |
| Trufflehog (secret scanning) | Every PR | GitHub Actions |
| OWASP ZAP (DAST) | Weekly (staging) | Scheduled Action |
| Snyk (dependency vulnerabilities) | Daily | GitHub integration |
| Manual security review | Before each major release | Engineering |

### 27.6.2 Blind Matching Penetration Tests

These tests specifically target the blind matching system to ensure dealer identities and quote details cannot be leaked.

**Timing attack resistance**: Hit blind-match endpoint 20 times, measure response time standard deviation. Must be <50ms (no data-dependent timing).

**Cache probing resistance**: Probe for potential dealer IDs via API. All probe responses should take similar time regardless of whether ID exists (no cache hit/miss distinction leaking existence).

**WebSocket enumeration resistance**: Verify dealer-specific events are not broadcast to buyer WebSocket connections.

**API response analysis**: Verify no `X-Powered-By` header, no ETag fingerprinting dealer data, no internal IDs in error messages, no stack traces or SQL in error responses.

**Parameter tampering**: Verify injecting `dealerId` in blind-match query params is ignored. Verify IDOR attempts on quote endpoints return 403/404.

### 27.6.3 Quarterly Manual Penetration Test

**Scope**: Full application including authentication bypass, privilege escalation (buyer to admin), blind match data exfiltration, payment flow manipulation, file upload vulnerabilities, API rate limit bypass, session fixation/hijacking.

**Vendor**: CERT-In empaneled auditor or Bug Bounty platform (HackerOne/Bugcrowd).

**Acceptance criteria**: No Critical or High severity findings unresolved for >14 days.

---

## 27.7 Accessibility Tests

### 27.7.1 Automated (axe-core in Playwright)

Run axe-core on every public-facing page in CI. Zero critical or serious violations allowed.

Pages tested: Home, Login, Register, Catalog, Product Detail, Inquiry Form, Dashboard, Dealer Profile.

WCAG levels enforced: 2a, 2aa, 21a, 21aa.

### 27.7.2 Lighthouse CI

Assertions:
- Accessibility: >=90 (error if below)
- Performance: >=80 (warn)
- Best Practices: >=90 (warn)
- SEO: >=85 (warn)

### 27.7.3 Manual Accessibility Review

**Frequency**: Quarterly.

**Scope**: Screen reader testing (VoiceOver macOS/iOS, TalkBack Android), keyboard navigation through all critical flows, color contrast in light/dark modes, form error announcement, zoom to 200% without horizontal scroll.

---

---

# SECTION 28 -- OPERATIONAL PROCEDURES

---

## 28.1 Deployment Checklist

### 28.1.1 Pre-Deployment Checklist

| # | Check | How | Who | Required |
|---|-------|-----|-----|----------|
| 1 | CI pipeline passes (lint, typecheck, unit, integration) | GitHub Actions green on PR | Automated | Yes |
| 2 | PR approved by at least 1 reviewer | GitHub review | Engineer | Yes |
| 3 | Database migrations tested on staging | Prisma migrate on staging, verify schema | Engineer | If migrations |
| 4 | Feature flags configured for new features | PostHog feature flags | Engineer | If new features |
| 5 | Environment variables set in production | AWS Parameter Store / Vercel env | Engineer | If new env vars |
| 6 | Monitoring baseline captured | Note current error rate, p99 latency, CPU/memory | On-call | Yes |
| 7 | Rollback plan documented | "How to revert" in PR description | Engineer | Yes |
| 8 | Changelog entry added | CHANGELOG.md updated with user-facing changes | Engineer | Yes |
| 9 | Load test passed (if significant change) | k6 against staging | Engineer | For perf-critical |
| 10 | Security scan clean (if dependency update) | `pnpm audit`, Snyk | Automated | If deps changed |
| 11 | No active incidents (P1/P2) | PagerDuty, Sentry | On-call | Yes |
| 12 | Deploy window is within allowed hours | Mon-Thu 10:00-16:00 IST (no Fri/weekend) | Engineer | Yes |

### 28.1.2 Deployment Process

```
1. Merge PR to `main` branch
2. GitHub Actions triggers production CI
3. CI runs: lint -> typecheck -> unit tests -> integration tests -> build
4. If migrations exist:
   a. Run `prisma migrate deploy` against production (via CI with prod DATABASE_URL)
   b. Wait 30s, verify no migration errors in logs
5. Deploy backend to AWS ECS:
   a. Build Docker image, push to ECR
   b. Update ECS task definition
   c. ECS rolling deployment (min 50% healthy during transition)
6. Deploy frontend:
   a. Build frontend, upload to S3 + CloudFront invalidation
   b. Or Vercel auto-deploys (atomic URL switch)
7. Run post-deployment checks (automated)
```

### 28.1.3 Post-Deployment Checklist

| # | Check | How | Timeout | On Failure |
|---|-------|-----|---------|-----------|
| 1 | Health check returns 200 | `GET /api/v1/health` | 2 min | Rollback |
| 2 | Smoke tests pass | Automated: login, search, create inquiry | 5 min | Rollback |
| 3 | Error rate normal | Sentry error count <2x baseline | 10 min | Investigate, rollback if >5x |
| 4 | p99 latency normal | Grafana: p99 <2x baseline | 10 min | Investigate |
| 5 | No 5xx spike | CloudWatch: 5xx rate <0.5% | 10 min | Rollback |
| 6 | Database connections stable | RDS: count <1.5x normal | 5 min | Investigate |
| 7 | Redis memory stable | ElastiCache: no abnormal climb | 5 min | Investigate |
| 8 | WebSocket connections active | Socket.io admin: clients >0 | 2 min | Investigate |
| 9 | Slack notification sent | #deployments channel | Immediate | Manual notify |
| 10 | Feature flags verified | New features togglable | 5 min | Fix config |

### 28.1.4 Rollback Procedure

```
Backend (ECS):
1. aws ecs update-service --cluster hub4estate-prod --service hub4estate-api \
     --task-definition hub4estate-api:<PREVIOUS_REVISION>
2. Wait for rolling update (2-5 min)
3. Verify health check passes

Frontend (S3/CloudFront or Vercel):
1. Vercel: Deployments -> previous deployment -> "Promote to Production"
   Or: vercel rollback --yes
2. S3: re-deploy previous build artifact from tagged release

Database (Prisma):
1. If migration additive-only: no DB rollback needed, old code compatible
2. If migration destructive: STOP -- manual intervention required
3. If rollback needed: prisma migrate resolve --rolled-back <migration_name>
   Then apply reverse migration SQL manually
```

---

## 28.2 Database Operations

### 28.2.1 Migration Procedures

**Standard Migration (additive, non-breaking):**
```bash
# 1. Create migration
npx prisma migrate dev --name add_delivery_tracking_fields

# 2. Review generated SQL
cat prisma/migrations/<timestamp>_add_delivery_tracking_fields/migration.sql

# 3. Test on staging
DATABASE_URL=$STAGING_DB npx prisma migrate deploy

# 4. Verify staging works
curl -f https://staging-api.hub4estate.com/api/v1/health

# 5. Deploy to production (via CI, never manually)
```

**Zero-Downtime Migration Patterns:**

| Operation | Pattern | Example |
|-----------|---------|---------|
| Add column | Add nullable -> backfill -> add constraint | `ALTER TABLE orders ADD COLUMN tracking_id TEXT;` |
| Rename column | Add new -> dual-write -> migrate reads -> drop old | Add `delivery_status`, dual-write, switch reads, drop old |
| Add index | `CREATE INDEX CONCURRENTLY` | Never blocks reads/writes |
| Drop column | Stop writing -> stop reading -> drop | Remove from code first, then DDL |
| Change type | Add new column -> migrate -> swap -> drop old | Never `ALTER COLUMN TYPE` on large tables in-place |

**Large Table Migration (>1M rows) -- run off-peak (Sunday 03:00 IST) in batches of 10,000:**

```sql
DO $$
DECLARE
  batch_size INT := 10000;
  affected INT;
BEGIN
  LOOP
    UPDATE orders
    SET tracking_id = 'TRK-' || id
    WHERE tracking_id IS NULL
    AND id IN (
      SELECT id FROM orders WHERE tracking_id IS NULL LIMIT batch_size
    );

    GET DIAGNOSTICS affected = ROW_COUNT;
    RAISE NOTICE 'Updated % rows', affected;

    IF affected = 0 THEN EXIT; END IF;
    PERFORM pg_sleep(0.5);
  END LOOP;
END $$;
```

### 28.2.2 Backup & Recovery

| Parameter | Value |
|-----------|-------|
| Backup Method | AWS RDS automated snapshots |
| Snapshot Frequency | Daily at 03:00 IST |
| Snapshot Retention | 30 days |
| Point-in-Time Recovery (PITR) | Enabled, 5-minute granularity |
| Cross-Region Backup | Weekly snapshot copied to ap-southeast-1 (Singapore) |
| **RPO (Recovery Point Objective)** | **5 minutes** |
| **RTO (Recovery Time Objective)** | **4 hours** |

**Weekly Backup Verification (automated, every Monday 04:00 IST):**

```
1. Restore latest snapshot to disposable instance (db.t3.micro)
2. Wait for availability (~15 min)
3. Run verification queries:
   - SELECT COUNT(*) FROM users;
   - SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '7 days';
   - SELECT MAX(created_at) FROM audit_logs;  (should be within last 24h)
4. Compare row counts against production (within 0.1%)
5. Delete verification instance
6. Report pass/fail to #ops Slack channel
```

**Disaster Recovery Runbook:**

```
IF: Production database corrupted or lost
THEN:
  1. Declare P1 incident (PagerDuty)
  2. Determine corruption timestamp from audit logs / Sentry
  3. PITR restore to 5 minutes before corruption:
     aws rds restore-db-instance-to-point-in-time \
       --source-db-instance-identifier hub4estate-prod \
       --target-db-instance-identifier hub4estate-prod-restored \
       --restore-time <ISO8601_TIMESTAMP>
  4. Verify restored data integrity
  5. Update backend env var to point to restored instance
  6. Deploy backend with new DB endpoint
  7. Verify application health
  8. Post-incident: root cause analysis within 48 hours
```

### 28.2.3 Database Scaling

| Trigger | Action | Implementation |
|---------|--------|---------------|
| Read latency p99 >200ms for 10min | Add read replica | `aws rds create-db-instance-read-replica` |
| Connections >80% max | Enable PgBouncer | Deploy PgBouncer on ECS, `pool_mode=transaction`, `default_pool_size=25` |
| Storage >80% allocated | Auto-scaling | RDS auto-scaling enabled (max 500GB, 10GB increments) |
| CPU >70% sustained 15min | Vertical scale | `db.t3.medium` -> `db.r6g.large` (multi-AZ, minimal downtime) |
| Quotes table >10M rows | Partition by month | Range partitioning on `created_at` |

---

## 28.3 Redis Operations

### 28.3.1 Memory Monitoring

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| `used_memory` | >70% maxmemory | >85% maxmemory | Increase maxmemory or scale |
| `evicted_keys` | >100/min | >1000/min | Review TTLs, increase memory |
| `connected_clients` | >500 | >800 | Check for connection leaks |
| `hit_rate` | <90% | <80% | Review cache strategy |
| `ops/sec` | >50,000 | >100,000 | Scale to cluster mode |

### 28.3.2 Key TTL Strategy

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `session:<userId>` | 24h | User session |
| `cache:product:<id>` | 1h | Product detail |
| `cache:search:<hash>` | 15min | Search results |
| `cache:blind-match:<inquiryId>` | 30min | Evaluated blind match |
| `ratelimit:<ip>:<endpoint>` | 1min | Rate limiting |
| `otp:<phone>` | 5min | OTP verification |
| `lock:inquiry:<id>` | 30s | Distributed lock |
| `dealer:online:<id>` | 5min | Online presence |

### 28.3.3 Eviction and Failover

**Eviction policy**: `allkeys-lru` with 512MB maxmemory.

**Failover**: Application gracefully degrades -- reads fall through to database, writes are queued. Circuit breaker pattern: after 5 consecutive Redis failures, bypass Redis for 30s, then half-open test.

```typescript
// Simplified circuit breaker
class RedisCircuitBreaker {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private openedAt = 0;
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RECOVERY_TIMEOUT = 30_000;

  async execute<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt > this.RECOVERY_TIMEOUT) {
        this.state = 'HALF_OPEN';
      } else {
        return fallback();
      }
    }
    try {
      const result = await fn();
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch {
      this.failures++;
      if (this.failures >= this.FAILURE_THRESHOLD) {
        this.state = 'OPEN';
        this.openedAt = Date.now();
      }
      return fallback();
    }
  }
}
```

---

## 28.4 Elasticsearch Operations

### 28.4.1 Index Lifecycle Management

| Index | Rollover Policy | Retention | Replicas |
|-------|----------------|-----------|----------|
| `products` | Manual (on catalog change) | Indefinite | 1 |
| `inquiries` | Monthly (`inquiries-2026.04`) | 24 months | 1 |
| `audit-logs` | Daily (`audit-2026.04.08`) | 90 days | 0 |
| `search-analytics` | Weekly | 12 months | 0 |

**Reindex Procedure (zero-downtime):**

```bash
# 1. Create new index with updated mapping
curl -X PUT "localhost:9200/products-v2" -H 'Content-Type: application/json' -d @products-mapping-v2.json

# 2. Reindex from old to new
curl -X POST "localhost:9200/_reindex" -d '{"source":{"index":"products-v1"},"dest":{"index":"products-v2"}}'

# 3. Atomic alias swap
curl -X POST "localhost:9200/_aliases" -d '{
  "actions": [
    {"remove":{"index":"products-v1","alias":"products"}},
    {"add":{"index":"products-v2","alias":"products"}}
  ]
}'

# 4. Verify search works, delete old index after 24h if clean
```

### 28.4.2 Snapshots

Daily snapshots at 03:00 IST to S3 backup repository. Retention: 30 days, minimum 7 snapshots.

---

## 28.5 On-Call Procedures

### 28.5.1 Rotation Schedule

Until team reaches 3+ engineers, Shreshth is permanent escalation contact. Outside 09:00-23:00 IST, only P1 incidents trigger alerts.

| Week | Primary On-Call | Secondary (Escalation) | Hours |
|------|----------------|------------------------|-------|
| W1 | Engineer A | Shreshth | 09:00-23:00 IST |
| W2 | Engineer B | Engineer A | 09:00-23:00 IST |
| Alternating | | | |

### 28.5.2 Severity Levels

| Severity | Definition | Response Time | Resolution Target | Notification |
|----------|-----------|---------------|-------------------|--------------|
| P1 (Critical) | Full outage, payment down, data breach | 15 min | 1 hour | PagerDuty + phone + SMS |
| P2 (High) | Major feature broken (blind matching, search), >10% users affected | 30 min | 4 hours | PagerDuty + Slack |
| P3 (Medium) | Minor feature broken, <10% affected, workaround exists | 4 hours | 24 hours | Slack |
| P4 (Low) | Cosmetic, minor UX, non-critical perf degradation | Next business day | 1 week | Slack / Linear |

### 28.5.3 Runbooks

**Runbook 1: API Server Unresponsive**

```
DETECTION: Health check failing >2 min OR 5xx rate >5%

0-5 min:
  1. Check ECS service status: aws ecs describe-services ...
  2. Check ECS task health: aws ecs list-tasks ...
  3. Check CloudWatch logs last 5 min

IF tasks crashing (exit code != 0):
  - Check recent deploy -> ROLLBACK if bad deploy
  - Check OOM, env vars

IF tasks running but not responding:
  - CPU >95%: scale out (increase desired count to 4)
  - Memory >90%: force new deployment (restart tasks)

IF load balancer 502/503:
  - Check target group health
  - Check security groups (port 3001)
  - Check ALB access logs

ESCALATE: Not resolved in 15 min -> call secondary
```

**Runbook 2: Database Slow Queries**

```
DETECTION: p99 query time >500ms for >5 min

0-5 min:
  1. RDS Performance Insights -> identify top slow queries
  2. Check active connections: SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
  3. Check locks: SELECT * FROM pg_locks WHERE NOT granted;

IF single slow query:
  - Check EXPLAIN plan
  - Missing index -> CREATE INDEX CONCURRENTLY
  - Long-running tx -> consider pg_terminate_backend(<pid>)

IF connection saturation (>80% max):
  - Check for leaks in app logs
  - Restart PgBouncer
  - Increase max_connections (requires param group update)

IF CPU >80%:
  - Review expensive queries
  - Consider read replica
  - Vertical scale if sustained

ESCALATE: Not resolved in 30 min
```

**Runbook 3: Payment Processing Failure**

```
DETECTION: Payment webhook errors >5 in 10 min

0-5 min:
  1. Check Razorpay dashboard + status.razorpay.com
  2. Check app logs: level=error AND service=payment
  3. Check webhook endpoint accessible

IF Razorpay outage:
  - Enable "Payment Processing Delayed" banner
  - Payments auto-retry when Razorpay recovers

IF webhook endpoint down:
  - Follow Runbook 1 (API Server)
  - Razorpay retries for 24h, no data loss

IF signature verification failing:
  - Check RAZORPAY_WEBHOOK_SECRET env var

IF orders stuck in payment_pending:
  - Run: node scripts/reconcile-payments.js --since '2 hours ago'

ESCALATE: >20 payments affected OR not resolved in 30 min
NOTIFY: Shreshth immediately for any payment issue
```

**Runbook 4: High Error Rate Spike**

```
DETECTION: Sentry error rate >5x baseline for 5 min

0-5 min:
  1. Sentry dashboard -> top errors last 15 min
  2. Correlate with recent deploy (last 2 hours?)

IF single error type:
  - Read stacktrace
  - Recent deploy caused it -> ROLLBACK
  - External service failure -> enable circuit breaker

IF multiple unrelated errors:
  - Check infrastructure (ECS, DB, Redis)
  - Check network/DNS
  - Possible DDoS -> check CloudFront/ALB patterns

ESCALATE: >10% requests failing OR not resolved in 15 min
```

**Runbook 5: Memory Leak Detection**

```
DETECTION: ECS task memory trending up continuously >1 hour

0-15 min:
  1. Memory graph: steady climb vs sudden spike?
  2. Recent deploy introduced it?
  3. Capture heap snapshot via ECS Exec if possible

IF gradual climb (classic leak):
  - Recent deploy -> ROLLBACK
  - Otherwise create P3, schedule investigation
  - Temp: auto-restart on memory >80%

IF sudden spike:
  - Large file upload or bulk operation?
  - BullMQ runaway worker?
  - Increase task memory temporarily

INVESTIGATION: clinic doctor + clinic heap-profiler locally
```

---

## 28.6 Maintenance Schedule

| Task | Frequency | Day/Time (IST) | Duration | Owner | Automated |
|------|-----------|----------------|----------|-------|-----------|
| Dependency security audit | Weekly | Mon 10:00 | 15 min | Dependabot | Yes |
| `pnpm audit fix` (non-breaking) | Weekly | Mon 10:00 | Auto | CI | Yes |
| PostgreSQL VACUUM ANALYZE | Daily | 03:00 | 10-30 min | RDS autovacuum | Yes |
| PostgreSQL REINDEX CONCURRENTLY | Monthly | 1st Sun 03:00 | 30-60 min | Cron | Yes |
| RDS snapshot verification | Weekly | Mon 04:00 | 20 min | CI | Yes |
| Redis memory check | Continuous | -- | -- | Grafana alert | Yes |
| Elasticsearch force-merge | Monthly | 1st Sun 04:00 | 15 min | Cron | Yes |
| Log rotation / archival | Daily | 02:00 | 5 min | CloudWatch | Yes |
| SSL certificate check | Weekly | Mon 09:00 | 1 min | CI | Yes |
| SSL certificate renewal | 30 days before expiry | Auto | Auto | ACM | Yes |
| OWASP ZAP security scan | Weekly | Sun 02:00 | 30 min | CI | Yes |
| Lighthouse performance audit | Weekly | Sun 03:00 | 10 min | CI | Yes |
| k6 performance review | Monthly | Last Fri 14:00 | 30 min | Engineer | Manual |
| Quarterly penetration test | Quarterly | Scheduled | 1-2 weeks | External vendor | Manual |
| Quarterly accessibility review | Quarterly | Scheduled | 1 day | Engineer | Manual |
| Major dependency upgrades | Quarterly | Planned sprint | 2-5 days | Engineer | Manual |
| Database schema review | Monthly | Last Thu 15:00 | 1 hour | Engineer | Manual |
| Disaster recovery drill | Semi-annually | Scheduled | 4 hours | Team | Manual |

---

---

# SECTION 29 -- SUCCESS METRICS & KPIs

---

## 29.1 North Star Metric

**Monthly Gross Merchandise Value (GMV)** -- the total value of all transactions completed through Hub4Estate in a calendar month.

**Why GMV and not revenue**: At this stage, proving transaction volume and buyer/dealer engagement matters more than margin. Revenue = GMV x take rate, and take rate can be optimized later. GMV proves product-market fit.

| Month | Target GMV | Implied Orders | Avg Order Value |
|-------|-----------|----------------|-----------------|
| Month 1 | Rs 5,00,000 | 25 | Rs 20,000 |
| Month 3 | Rs 15,00,000 | 60 | Rs 25,000 |
| Month 6 | Rs 50,00,000 | 150 | Rs 33,000 |
| Month 12 | Rs 2,00,00,000 | 500 | Rs 40,000 |
| Month 18 | Rs 5,00,00,000 | 1,000 | Rs 50,000 |
| Month 24 | Rs 15,00,00,000 | 2,500 | Rs 60,000 |

---

## 29.2 Primary Metrics (Tracked Daily)

| Metric | Definition | Month 1 | Month 6 | Month 12 | Source |
|--------|-----------|---------|---------|----------|--------|
| **GMV** | Sum of completed order values | Rs 5L | Rs 50L | Rs 2Cr | `orders` (status=completed) |
| **Active Buyers** | Unique buyers with >=1 inquiry in 30d | 15 | 100 | 400 | `inquiries` |
| **Active Dealers** | Unique dealers with >=1 quote in 30d | 8 | 40 | 150 | `quotes` |
| **Inquiries/Day** | New inquiries created per day | 2 | 10 | 30 | `inquiries` |
| **Quote Conversion** | % inquiries receiving >=1 quote | 60% | 75% | 85% | `inquiries` JOIN `quotes` |
| **Order Conversion** | % quoted inquiries converting to orders | 30% | 40% | 50% | `inquiries` JOIN `orders` |
| **Avg Savings vs MRP** | Avg % savings Hub4Estate vs MRP | 15% | 18% | 22% | `order_items` |
| **MRR** | Monthly recurring revenue | Rs 10K | Rs 1.5L | Rs 8L | `subscriptions` + `commissions` |
| **Quotes/Inquiry** | Avg quotes per inquiry | 1.5 | 3 | 5 | COUNT `quotes` / COUNT `inquiries` |
| **Time to First Quote** | Median time to first dealer quote | 24h | 8h | 4h | `quotes.created_at` - `inquiries.created_at` |

**Alert Thresholds:**

| Metric | Warning (Slack) | Critical (PagerDuty) |
|--------|-----------------|----------------------|
| GMV daily | <50% trailing 7-day avg | <25% trailing 7-day avg |
| Inquiries/day | <50% trailing 7-day avg | 0 inquiries in 24h |
| Order conversion | <20% | <10% |
| Time to first quote | >24h median | >48h median |

---

## 29.3 Secondary Metrics (Tracked Weekly)

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **NPS** | "How likely to recommend?" (0-10) | >50 | In-app survey after 3rd order |
| **Dealer Response Time** | Median dealer quote response time | <4 hours | quote.created_at - notification time |
| **Buyer Satisfaction** | Post-order rating (1-5) | >4.2/5 | `reviews` table |
| **Platform Uptime** | % time critical services available | >99.9% | UptimeRobot + health checks |
| **Support Resolution** | Median ticket time to resolution | <24 hours | Freshdesk/Intercom |
| **Referral Rate** | % new users from referrals | >10% | `referrals` table |
| **DAU/MAU Ratio** | Stickiness indicator | >0.30 | PostHog analytics |
| **Feature Adoption** | % active users using new feature in 30d | >25% | PostHog event tracking |
| **Search Success Rate** | % searches leading to product view or inquiry | >60% | search_events -> views/inquiries |
| **Mobile Usage** | % sessions from mobile | >50% | PostHog device data |
| **Dealer Inventory Freshness** | % dealer inventory updated in 7d | >70% | dealer_inventory.updated_at |
| **Dispute Rate** | % orders resulting in dispute | <3% | disputes / orders |
| **Repeat Purchase Rate** | % buyers with 2nd order in 90d | >30% | Cohort analysis |

---

## 29.4 Unit Economics

### 29.4.1 Revenue per Dealer (ARPD)

| Metric | Month 1 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| **ARPD** | Rs 1,250 | Rs 2,500 | Rs 5,000 |
| Subscription revenue/dealer | Rs 500 | Rs 1,000 | Rs 2,000 |
| Commission revenue/dealer | Rs 750 | Rs 1,500 | Rs 3,000 |

### 29.4.2 Customer Acquisition Cost

| Segment | Target CAC | Channels | Payback |
|---------|-----------|----------|---------|
| **Buyer** | <Rs 500 | WhatsApp referral, dealer network, local events | <3 months |
| **Dealer** | <Rs 2,000 | Direct sales, trade associations, Google Ads | <2 months |
| **Service Provider** | <Rs 1,000 | Dealer referrals, local listings | <3 months |

### 29.4.3 Lifetime Value

| Segment | LTV Target | Assumptions | LTV:CAC |
|---------|-----------|-------------|---------|
| **Buyer** | >Rs 5,000 | 10 orders/24mo, Rs 500 platform rev/order | >10:1 |
| **Dealer (Free)** | >Rs 15,000 | Commission on transactions over 18mo | >7:1 |
| **Dealer (Pro)** | >Rs 50,000 | Rs 2,000/mo sub + commissions over 24mo | >25:1 |
| **Dealer (Enterprise)** | >Rs 2,00,000 | Rs 5,000/mo + volume commissions over 36mo | >100:1 |

### 29.4.4 Gross Margin

| Component | Month 1 | Month 6 | Month 12 |
|-----------|---------|---------|----------|
| Revenue | Rs 10,000 | Rs 1,50,000 | Rs 8,00,000 |
| COGS (AWS, Supabase, Razorpay fees) | Rs 5,000 | Rs 30,000 | Rs 1,50,000 |
| **Gross Margin** | **50%** | **80%** | **81%** |
| Target | >40% | >70% | >75% |

### 29.4.5 Payback Period

| Segment | Target | Calculation |
|---------|--------|-------------|
| Buyer | <3 months | CAC / (monthly rev per buyer) |
| Dealer (Pro) | <2 months | CAC / (monthly sub + commission) |

---

## 29.5 Cohort Analysis

### 29.5.1 Retention Targets

| Cohort Period | W1 | W4 | W12 | W24 | W52 |
|---------------|-----|-----|------|------|------|
| **Target (Buyer)** | 70% | 45% | 30% | 22% | 15% |
| **Target (Dealer)** | 85% | 70% | 55% | 45% | 35% |
| **Good (Buyer)** | >75% | >50% | >35% | >25% | >18% |
| **Concerning (Buyer)** | <50% | <30% | <15% | <10% | <5% |

### 29.5.2 Segmentation Dimensions

| Dimension | Segments | Rationale |
|-----------|----------|-----------|
| User type | Buyer, Dealer, Service Provider | Different engagement patterns |
| City | Sri Ganganagar, Jaipur, Mumbai, Bangalore | Market maturity varies |
| Acquisition channel | Referral, Direct sales, Google, WhatsApp | Channel quality differs |
| First action | Search, Inquiry, Quote, Profile setup | Predicts retention |
| Order count | 0, 1, 2-5, 6-10, 10+ | Power users vs casual |
| Dealer tier | Free, Pro, Enterprise | Subscription impact |

### 29.5.3 Cohort Dashboard Query

```sql
WITH cohorts AS (
  SELECT
    id AS user_id,
    DATE_TRUNC('month', created_at) AS cohort_month
  FROM users
  WHERE role = 'buyer' AND status = 'active'
),
activity AS (
  SELECT DISTINCT
    user_id,
    DATE_TRUNC('month', created_at) AS activity_month
  FROM (
    SELECT buyer_id AS user_id, created_at FROM inquiries
    UNION ALL
    SELECT buyer_id AS user_id, created_at FROM orders
  ) combined
)
SELECT
  c.cohort_month,
  EXTRACT(MONTH FROM AGE(a.activity_month, c.cohort_month)) AS months_since,
  COUNT(DISTINCT a.user_id) AS active_users,
  COUNT(DISTINCT c.user_id) AS cohort_size,
  ROUND(100.0 * COUNT(DISTINCT a.user_id) / COUNT(DISTINCT c.user_id), 1) AS retention_pct
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id AND a.activity_month >= c.cohort_month
GROUP BY c.cohort_month, months_since
ORDER BY c.cohort_month, months_since;
```

---

## 29.6 Conversion Funnels

### 29.6.1 Buyer Funnel

| Stage | Month 1 Rate | Month 12 Rate | Measurement |
|-------|-------------|--------------|-------------|
| 1. Visit website/app | 100% | 100% | PostHog pageview |
| 2. Register | 15% | 25% | Registration event |
| 3. Complete profile | 70% | 85% | Profile >80% filled |
| 4. First search | 80% | 90% | Search within 24h |
| 5. View product detail | 60% | 75% | Product page view |
| 6. Create inquiry | 25% | 40% | Inquiry created |
| 7. Receive quote(s) | 60% | 85% | Quote received |
| 8. Select quote | 50% | 65% | Quote selected |
| 9. Complete payment | 80% | 90% | Payment captured |
| 10. Confirm delivery | 95% | 98% | Delivery confirmed |
| 11. Leave review | 30% | 50% | Review submitted |
| 12. Repeat purchase (<90d) | 20% | 40% | 2nd order |

**Overall (Visit -> Completed Order)**: Month 1 ~0.9% | Month 12 ~3.5%

**Key interventions at drop-off points:**

| Drop-off | Intervention |
|----------|-------------|
| Visit -> Register | Better landing page, savings calculator, social proof |
| Search -> Inquiry | AI assistant prompts, "Get quotes" CTA on results |
| Inquiry -> Quote | Expand dealer network, alert more dealers per inquiry |
| Quote -> Payment | Savings comparison, escrow guarantee, testimonials |
| Order -> Repeat | Follow-up, "You might also need" recommendations |

### 29.6.2 Dealer Funnel

| Stage | Month 1 Rate | Month 12 Rate | Measurement |
|-------|-------------|--------------|-------------|
| 1. Discover Hub4Estate | 100% | 100% | Landing / outreach |
| 2. Register | 40% | 60% | Registration |
| 3. Complete KYC | 60% | 80% | Documents uploaded |
| 4. KYC verified | 80% | 90% | Admin verification |
| 5. Add inventory (first) | 50% | 75% | >=10 products listed |
| 6. Receive first match | 70% | 90% | Inquiry notification |
| 7. Submit first quote | 60% | 80% | Quote created |
| 8. Win first order | 40% | 55% | Order awarded |
| 9. Complete first delivery | 90% | 95% | Delivery confirmed |
| 10. Positive review | 60% | 75% | Rating >=4 |
| 11. Upgrade to Pro | 15% | 30% | Subscription |
| 12. Active at 6 months | 40% | 60% | Quote in month 6 |

---

## 29.7 OKRs -- Q1 2026 (April-June)

### Objective 1: Validate Product-Market Fit in Sri Ganganagar

| KR | Description | Target | Current | Status |
|----|-------------|--------|---------|--------|
| 1.1 | Monthly GMV reaches Rs 15L by end of June | Rs 15,00,000 | Rs 0 | Not started |
| 1.2 | 50 unique buyers complete >=1 order | 50 | 10 (manual) | In progress |
| 1.3 | Buyer NPS exceeds 50 (surveyed after 3rd order) | >50 | N/A | Not started |
| 1.4 | Avg savings vs nearest dealer >12% | >12% | ~15% (manual) | On track |

### Objective 2: Build Reliable, Scalable Platform

| KR | Description | Target | Current | Status |
|----|-------------|--------|---------|--------|
| 2.1 | Platform uptime >99.5% | 99.5% | N/A | Not started |
| 2.2 | API p99 latency <500ms all critical endpoints | <500ms | N/A | Not started |
| 2.3 | Zero P1 incidents lasting >1 hour | 0 | N/A | Not started |
| 2.4 | Test coverage: 80% backend, 70% frontend | 80/70 | 0% | Not started |

### Objective 3: Prove Unit Economics Work

| KR | Description | Target | Current | Status |
|----|-------------|--------|---------|--------|
| 3.1 | Buyer CAC <Rs 500 (excl. Shreshth's time) | <Rs 500 | N/A | Not started |
| 3.2 | Dealer CAC <Rs 2,000 (incl. direct sales time) | <Rs 2,000 | ~Rs 1,500 | On track |
| 3.3 | Gross margin >50% on platform revenue | >50% | N/A | Not started |
| 3.4 | >=3 dealers on paid Pro subscription | 3 | 0 | Not started |

### OKR Review Cadence

| Cadence | What | Who | When |
|---------|------|-----|------|
| Weekly | Check-in all KRs, update progress, blockers | Shreshth + Engineering | Monday 10:00 |
| Monthly | Deep dive metrics, cohort analysis, funnel review | Shreshth + team | First Monday |
| Quarterly | OKR scoring (0.0-1.0), retro, next quarter plan | All | Last week of quarter |

**Scoring**: 0.0-0.3 failed | 0.4-0.6 progress but missed | 0.7-0.9 achieved/close | 1.0 exceeded (target was too easy). Target average: 0.7.

---

---

# SECTION 30 -- RISK REGISTER

---

## 30.1 Risk Matrix

### 30.1.1 Risk Scoring

**Probability:**

| Score | Label | Definition |
|-------|-------|-----------|
| 1 | Very Low | <10% in next 12 months |
| 2 | Low | 10-25% |
| 3 | Medium | 25-50% |
| 4 | High | 50-75% |
| 5 | Very High | >75% |

**Impact:**

| Score | Label | Definition |
|-------|-------|-----------|
| 1 | Negligible | Minor inconvenience, no revenue impact, <1 day resolution |
| 2 | Low | Minor feature degradation, <Rs 10K impact |
| 3 | Medium | Major feature down hours, Rs 10K-1L impact, some churn |
| 4 | High | Full outage or data breach, Rs 1L-10L impact, significant churn |
| 5 | Critical | Business-threatening, >Rs 10L impact, regulatory action, permanent reputation damage |

**Risk Score = Probability x Impact:**

| Score Range | Level | Action |
|-------------|-------|--------|
| 1-4 | LOW | Monitor quarterly |
| 5-9 | MEDIUM | Mitigation plan, review monthly |
| 10-15 | HIGH | Active mitigation, review weekly |
| 16-25 | CRITICAL | Immediate action, daily review |

### 30.1.2 Complete Risk Register

| ID | Risk | Category | Prob | Impact | Score | Level | Mitigation | Owner |
|----|------|----------|------|--------|-------|-------|-----------|-------|
| R01 | **Dealer adoption stalls** -- Not enough dealers, poor quote coverage | Market | 4 | 4 | 16 | CRITICAL | Direct sales in SGR, free Pro 3mo incentive, dealer referral program, ROI case studies | Shreshth |
| R02 | **Bid gaming / shill quotes** -- Dealers collude or fake accounts to manipulate blind matching | Integrity | 3 | 5 | 15 | HIGH | KYC (GST+PAN mandatory), anomaly detection (same IP/device), reputation scoring, manual review, retraction limits | Engineering |
| R03 | **Razorpay suspension** -- Payment processing halted due to compliance or high disputes | Financial | 2 | 5 | 10 | HIGH | <1% chargeback rate, proactive relationship, Cashfree backup ready, escrow reduces disputes | Shreshth+Eng |
| R04 | **Data breach** -- Unauthorized access to user data, payment info, dealer business data | Security | 2 | 5 | 10 | HIGH | Encryption rest+transit, RLS, quarterly pen tests, OWASP scan, incident response plan, cyber insurance | Engineering |
| R05 | **Key person risk** -- Shreshth incapacitated = operations halt | Operational | 2 | 5 | 10 | HIGH | Document all processes, emergency access for 2 people, automate operations, bus factor target: 3 | Shreshth |
| R06 | **AI hallucination** -- Claude gives wrong specs, prices, or safety info | Product | 4 | 3 | 12 | HIGH | RAG (ground in real catalog), confidence scoring, disclaimers, human review for BOQ, audit all AI conversations | Engineering |
| R07 | **Competitor copies model** -- IndiaMART/InfraMarket launches blind matching | Market | 3 | 3 | 9 | MEDIUM | Speed of execution, network effects, vertical depth, Tier 2/3 brand trust | Shreshth |
| R08 | **Regulatory change** -- New e-commerce rules, GST changes, DPDP enforcement | Compliance | 2 | 4 | 8 | MEDIUM | Legal counsel on retainer, flexible pricing engine, DPDP compliance from Day 1 | Shreshth |
| R09 | **Infrastructure costs exceed projections** | Financial | 3 | 3 | 9 | MEDIUM | Monthly cost review, 80% budget alerts, reserved instances, caching strategy, right-sizing | Engineering |
| R10 | **Supplier quality issues** -- Counterfeit/damaged products via Hub4Estate | Product | 3 | 4 | 12 | HIGH | Dealer KYC, delivery photo proof, buyer reporting, dealer penalty (suspend after 3 complaints), spot checks | Operations |
| R11 | **High chargeback rate** | Financial | 2 | 4 | 8 | MEDIUM | Escrow-based payment, clear refund policy, delivery proof, proactive delay communication | Engineering |
| R12 | **Team scaling failure** -- Cannot hire fast enough | Operational | 3 | 3 | 9 | MEDIUM | Start hiring Month 2, contractors for non-core, network referrals, equity for early hires | Shreshth |
| R13 | **Well-funded competitor enters Tier 2/3** | Market | 3 | 4 | 12 | HIGH | First-mover in SGR/Jaipur, deep dealer relationships, community moat, lean operations | Shreshth |
| R14 | **AWS regional outage (ap-south-1)** | Infrastructure | 1 | 5 | 5 | MEDIUM | Multi-AZ within region, daily backups to Singapore, DNS failover plan, frontend survives backend outage | Engineering |
| R15 | **Third-party API rate limits / outages** -- Claude, Razorpay, MSG91, ES Cloud | Infrastructure | 3 | 3 | 9 | MEDIUM | Circuit breakers, graceful degradation, queue retries, PostgreSQL full-text search fallback | Engineering |

---

## 30.2 Response Plans (HIGH and CRITICAL Risks)

### R01: Dealer Adoption Stalls (CRITICAL -- Score 16)

**Detection:**
- New dealer registrations <2/week for 3 consecutive weeks
- Quote coverage (% inquiries receiving quotes) drops below 40%
- Dealer churn (verified dealers going inactive) >20%/month

**Immediate Response (24 hours):**
1. Shreshth calls top 5 inactive dealers personally to understand pain points
2. Send "What's stopping you?" survey to all registered-but-inactive dealers
3. Activate emergency incentive: "Submit 5 quotes this week, get free Pro for 1 month"

**Medium-term (1 week):**
1. Analyze dealer drop-off funnel: registration -> KYC -> inventory upload -> first quote
2. Simplify the step with highest drop-off (likely inventory upload -- offer manual CSV assistance)
3. Run dealer workshop/webinar: "How to win orders on Hub4Estate"
4. Partner with local electrical dealer associations

**Long-term (1 month):**
1. Hire dedicated dealer success manager (even part-time)
2. Build dealer ROI dashboard: "You earned Rs X through Hub4Estate this month"
3. Dealer referral bonus: Rs 500 per verified dealer referred
4. White-glove onboarding: team visits dealer shop, sets up profile, uploads inventory

**Acceptance Criteria (risk reduced to MEDIUM):**
- 30+ active dealers in primary city
- Quote coverage >70% sustained 4 weeks
- Monthly dealer churn <10%

---

### R02: Bid Gaming / Shill Quotes (HIGH -- Score 15)

**Detection:**
- Multiple quotes from different "dealers" same IP/device fingerprint
- Quotes with suspiciously similar pricing (<0.5% difference repeatedly)
- New dealer accounts created in burst, immediately quoting same inquiries
- Anomaly detection: price distribution >3 std devs from historical norms

**Immediate Response (24 hours):**
1. Flag suspicious quotes for manual review (do NOT auto-reject -- false positives damage trust)
2. Temporarily hold evaluation for affected inquiries
3. Cross-reference flagged dealers' KYC (same address? same phone?)
4. If confirmed: suspend all involved accounts, notify affected buyers

**Medium-term (1 week):**
1. Device fingerprinting (FingerprintJS) to link accounts from same device
2. Phone OTP for every quote submission (prevents mass automation)
3. Progressive trust: new dealers' quotes carry lower weight in first 10 transactions
4. "Report suspicious quote" button for buyers

**Long-term (1 month):**
1. ML anomaly detection pipeline: timing patterns, price clustering, IP correlation, quote-to-win anomalies
2. Quote diversity requirements: flag if >80% quotes on inquiry from same postal code
3. Regular KYC document audit against government databases

**Acceptance Criteria:**
- Detection catches >80% of simulated shill patterns in testing
- <0.5% completed transactions later identified as shill-involved
- Zero confirmed incidents undetected >48 hours

---

### R03: Razorpay Account Suspension (HIGH -- Score 10)

**Detection:**
- Razorpay warning emails/dashboard about dispute rate
- Chargeback rate approaching 0.5% (suspension threshold ~1%)
- Account status changes in API responses

**Immediate Response (24 hours):**
1. Contact Razorpay account manager immediately
2. Provide documentation for all disputed transactions (delivery proofs, chat logs)
3. If suspended: activate Cashfree backup (pre-integrated, dormant)
4. Notify users: "Payment provider temporarily changing. No impact to orders."

**Medium-term (1 week):**
1. Review all disputes, identify root causes
2. Strengthen escrow: release only after explicit buyer delivery confirmation
3. Mandatory delivery photo proof before "delivered" status
4. Clearer refund policy communication (shown before payment)

**Long-term (1 month):**
1. Two active payment processors tested monthly (Razorpay + Cashfree)
2. Buyer fraud scoring (flag accounts with >2 chargebacks in 6 months)
3. Quarterly review with Razorpay account team
4. Explore direct UPI integration for lower-risk transactions

**Acceptance Criteria:**
- Chargeback rate consistently <0.3%
- Two payment processors tested monthly
- Razorpay relationship in "good standing"

---

### R04: Data Breach (HIGH -- Score 10)

**Detection:**
- Sentry: unexpected data access patterns
- AWS GuardDuty: unusual API calls from unknown IPs
- User reports: "I see someone else's data" or phishing referencing Hub4Estate account
- External: Have I Been Pwned notification

**Immediate Response (24 hours):**
1. **Contain**: Revoke compromised credentials, rotate JWT secrets, invalidate all sessions
2. **Assess**: Scope -- what data accessed, how many users, attack vector
3. **Isolate**: If ongoing, take affected service offline
4. **Preserve**: Capture logs, audit trail, network traffic for forensics
5. **Notify CERT-In**: Within 6 hours (mandatory under CERT-In direction 2022)
6. **Communicate**: Draft transparent user notification

**Medium-term (1 week):**
1. Engage security firm for forensic investigation
2. Patch identified vulnerability
3. Notify affected users with specific guidance
4. If payment data: notify Razorpay, assess PCI implications
5. File police report if criminal activity

**Long-term (1 month):**
1. External pen test focused on exploited vector
2. Additional security controls based on findings
3. Update security architecture
4. Team security training
5. Cyber liability insurance

**Acceptance Criteria (incident resolved):**
- Attack vector identified and patched
- All affected users notified
- No ongoing unauthorized access (72h monitoring)
- Post-incident report published internally
- Regulatory notifications completed

---

### R05: Key Person Risk (HIGH -- Score 10)

**Mitigation (ongoing, not incident-based):**

1. **Documentation**: Every process, credential, vendor relationship in Notion + 1Password
2. **Access sharing**: >=2 people have access to every critical system:
   - AWS root: Shreshth + trusted family member (sealed credentials)
   - Domain registrar: Shreshth + designated backup
   - Razorpay: Shreshth + designated backup
   - GitHub org owner: Shreshth + first senior hire
3. **Operational automation**: CI/CD, monitoring, backups all automated
4. **Financial runway**: >=6 months operating expenses in LLP bank account
5. **Legal**: LLP agreement specifies succession; designated partner can continue operations

**Acceptance Criteria (risk reduced to MEDIUM):**
- Bus factor = 3 (3 people can independently operate platform)
- All credentials in shared 1Password vault
- Operations continue 72h without founder (tested via "vacation drill")

---

### R06: AI Hallucination (HIGH -- Score 12)

**Detection:**
- User reports incorrect recommendation or pricing
- Automated validation catches non-existent product IDs or out-of-range prices
- Weekly 5% spot-check audit of AI conversations

**Immediate Response (24 hours):**
1. Flag specific conversation and products
2. If safety-critical (wrong wire gauge for load): immediately correct user via WhatsApp/email
3. Add guardrail rule for this specific hallucination type

**Medium-term (1 week):**
1. Output validation layer: every AI response checked against catalog before display
   - Product IDs must exist in database
   - Prices within 20% of actual range
   - Technical specs must match product data
2. Explicit confidence indicator on AI responses
3. "This information may be inaccurate. Verify with your electrician." disclaimer

**Long-term (1 month):**
1. RAG pipeline: embed catalog in vector DB, retrieve before generating
2. Human-in-the-loop for BOQ: AI drafts, expert reviews before sending
3. Track hallucination rate: target <2% of responses with factual errors

**Acceptance Criteria:**
- Validation layer catches 95% of hallucinated product references
- Hallucination rate (weekly audit) <2%
- All BOQ outputs human-reviewed before delivery

---

### R10: Supplier Quality Issues (HIGH -- Score 12)

**Detection:**
- Buyer reports defective/counterfeit product via dispute
- Same dealer 3+ quality complaints in 30 days
- Review sentiment analysis detects quality keyword spike

**Immediate Response (24 hours):**
1. Contact buyer, arrange return/replacement
2. Freeze dealer's active orders pending investigation
3. Request product photos from buyer
4. Contact dealer for explanation + proof of genuine sourcing

**Medium-term (1 week):**
1. If confirmed: warning (1st), suspension (2nd), permanent ban (3rd)
2. Full refund from escrow
3. "Verified quality" badge for dealers passing spot checks
4. Quality incident logged on dealer record (admin-visible)

**Long-term (1 month):**
1. Random spot-checks: order from 5% of active dealers monthly, inspect
2. Brand representative partnerships for authorized distributor verification
3. Product authentication (BIS marking verification via photo)
4. Dealers must upload distributor certificates for premium brands

**Acceptance Criteria:**
- Verified quality complaint rate <1% of orders
- All dealers have distributor certificates for listed brands
- Monthly spot-check program running

---

### R13: Well-Funded Competitor (HIGH -- Score 12)

**Detection:**
- Competitor announces funding or launches in target cities
- Dealers report being approached with aggressive incentives
- Search/traffic data shows competitor gaining visibility

**Immediate Response (24 hours):**
1. Document competitor offering: pricing, features, dealer terms
2. Call top 10 dealer partners, reinforce relationship
3. Do NOT panic-discount or match unsustainable incentives

**Medium-term (1 week):**
1. Identify competitor weakness (bureaucracy, generic approach, no local relationships)
2. Double down on strengths: blind matching, personal relationships, local knowledge
3. Accelerate switching-cost features (project management, procurement history, loyalty)
4. Publish real savings case studies

**Long-term (1 month):**
1. Community moat: dealer WhatsApp groups, buyer forums, local events
2. Accelerate geographic expansion to claim territory
3. Focus on unit economics -- survive longer on less capital
4. Consider strategic partnerships or market segmentation

**Acceptance Criteria (managed):**
- Retain >80% active dealers despite competitor
- Buyer CAC does not increase >2x
- GMV continues growing month-over-month

---

## 30.3 Business Continuity

### 30.3.1 Bus Factor

| Status | Current | Target (Month 6) | Target (Month 12) |
|--------|---------|-------------------|---------------------|
| **Bus factor** | 1 (Shreshth) | 2 (+ 1st engineer) | 3 (+ 2 engineers) |
| Critical systems access | 1 person | 2 people | 3 people |
| Deployment capability | 1 person | 2 people | 3 people |
| Customer relationships | 1 person | 2 (+ BD hire) | 3 people |
| Financial operations | 1 (+ family) | 2 people | 2 people |

### 30.3.2 Key Documentation

| Document | Location | Review Frequency |
|----------|----------|-----------------|
| System architecture | `docs/ARCHITECTURE.md` | Monthly |
| Deployment runbook | `docs/DEPLOYMENT.md` | Monthly |
| Incident response | `docs/INCIDENT_RESPONSE.md` | Quarterly |
| Vendor/credential inventory | 1Password shared vault | Monthly |
| Financial operations | Notion (restricted) | Monthly |
| Dealer relationship contacts | CRM (HubSpot/Notion) | Weekly |
| Legal docs (LLP, contracts) | Google Drive (restricted) | Quarterly |

### 30.3.3 Succession Plan

**Shreshth unavailable <1 week:**
- Automated systems continue (CI/CD, monitoring, alerts)
- Senior engineer handles technical incidents via runbooks
- Customer communication paused (non-urgent) or canned responses
- No deploys unless critical hotfix

**Shreshth unavailable 1-4 weeks:**
- Designated partner (father, per LLP agreement) has legal authority
- Senior engineer has all technical access, can deploy/scale/respond
- BD/operations hire handles dealer and buyer relationships
- Weekly sync continues, led by designated partner or senior engineer

**Shreshth unavailable >4 weeks:**
- Designated partner activates advisory board
- Consider interim CTO hire (network: Tej Agarwal, MESA mentors)
- Financial operations via designated partner
- Platform operates in maintenance mode until leadership stabilized

### 30.3.4 Financial Runway

| Metric | Target | Action if Below |
|--------|--------|----------------|
| Operating runway | >=6 months expenses | Reduce non-essential spend, accelerate revenue, bridge funding |
| Emergency fund | >=Rs 2L liquid cash | Maintain separate reserve |
| Revenue diversification | No single customer >20% of revenue | Accelerate acquisition |
| Vendor payment buffer | 30 days prepaid | Negotiate net-30/net-60 terms |

### 30.3.5 Annual Risk Review

Every January:
1. Re-score all existing risks
2. Identify new risks from business evolution
3. Close risks no longer relevant
4. Validate all response plans current
5. Tabletop exercise for top 3 risks (simulate incident, walk through response)
6. Update business continuity docs
7. Test backup recovery (full RDS snapshot restore)
8. Verify all emergency contacts current

---

*End of Sections 27-30. Testing covers unit, integration, E2E, performance, security, and accessibility. Operational procedures define deployment, database, Redis, Elasticsearch, and on-call runbooks. Success metrics set GMV as north star with granular daily/weekly KPIs, unit economics, cohort targets, and Q1 OKRs. Risk register identifies 15 risks with full response plans for all HIGH/CRITICAL items plus business continuity.*

*Next: Sections 31-34 (Team Structure, Compliance, Glossary, Appendix)*
