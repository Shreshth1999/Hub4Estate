# Hub4Estate Definitive PRD v2 -- Sections 5 & 6

> **Document**: section-05-06-techstack-database  
> **Version**: 2.0.0  
> **Date**: 2026-04-08  
> **Author**: CTO Office, Hub4Estate  
> **Status**: Authoritative Reference  
> **Classification**: Internal -- Engineering  
> **Prerequisite Reading**: section-01-executive-foundation.md, section-02-audit-gap-analysis.md

---

# SECTION 5 -- TECHNOLOGY STACK

Every technology listed below is in production or ships immediately. No phases. No "future consideration." If it is in this section, it is deployed.

---

## 5.1 Frontend Stack

### 5.1.1 React 18.3 + Vite 5.4 + TypeScript 5.5

| Parameter | Value |
|-----------|-------|
| React | `18.3.1` |
| React DOM | `18.3.1` |
| Vite | `5.4.14` |
| TypeScript | `5.5.4` |
| Node.js (dev) | `20.18.0 LTS` |
| Package manager | `pnpm 9.15.0` |

**Why React 18.3 over Next.js 14:**
- Hub4Estate is an SPA with an existing Express API backend. Server-side rendering adds deployment complexity and latency for a dashboard-heavy application where SEO matters only on public pages (landing, catalog).
- The backend already runs on EC2 with PM2. Adding a Next.js server means two Node processes, two deployments, two memory footprints.
- Vite's module graph + React Fast Refresh gives sub-100ms HMR. Next.js dev server averages 300-800ms.
- SPA + Vite on CloudFront CDN = global <50ms TTFB for static assets. Next.js SSR TTFB from ap-south-1 to US users = 200-400ms.
- Migration cost: zero. We are already on React + Vite.

**Why Vite 5.4 over Webpack 5:**
- Native ESM dev server: no bundling during development. HMR in <50ms vs Webpack's 2-8s.
- Rollup-based production builds: smaller output, native tree-shaking, built-in code splitting.
- Config: 40 lines vs Webpack's 200+ lines with loaders and plugins.
- Vite 5.4 specific: `Environment API` (preview) for SSR-ready migration path if needed later.

**Why TypeScript 5.5 over 5.2 (current):**
- Inferred type predicates: cleaner type guards without explicit annotations.
- `isolatedDeclarations`: faster DTS emit for monorepo shared types.
- Regex syntax checking: catches invalid regex at compile time.

**tsconfig.json (frontend -- target state):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "isolatedDeclarations": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Audit delta from current state:**
- `strict`: already `true` in frontend (good)
- `noUnusedLocals`: `false` -> `true` (will surface dead code)
- `noUnusedParameters`: `false` -> `true` (will surface dead parameters)
- `noUncheckedIndexedAccess`: not set -> `true` (forces null checks on array/record access)
- `isolatedDeclarations`: not set -> `true` (enables parallel DTS emit)

### 5.1.2 Tailwind CSS 3.4

| Parameter | Value |
|-----------|-------|
| Version | `3.4.17` |
| PostCSS | `8.4.49` |
| Autoprefixer | `10.4.20` |

**Design tokens (already in tailwind.config.js -- no changes needed):**

```typescript
// These are the CANONICAL values. Any hardcoded hex in a component is a bug.
const colors = {
  primary: {
    50:  '#faf9f7',  // Page backgrounds, cards
    100: '#f5f3ef',  // Hover states, secondary backgrounds
    200: '#e8e4db',  // Borders, dividers
    300: '#d4cdc0',  // Disabled states
    400: '#b8ad9a',  // Placeholder text
    500: '#9c8e78',  // Main beige/tan -- body text accent
    600: '#8a7a62',  // Secondary text
    700: '#726452',  // Primary text
    800: '#5e5345',  // Headings
    900: '#4d4439',  // Emphasis text
  },
  accent: {
    50:  '#fdf8f5',
    100: '#faeee8',
    200: '#f5dcd0',
    300: '#edc4b0',
    400: '#e3a688',
    500: '#d3815e',  // Terracotta -- primary CTA, links, active states
    600: '#c4724f',  // CTA hover
    700: '#a85f42',  // CTA active/pressed
    800: '#8c4e37',
    900: '#74412f',
  },
  // success, warning, error, neutral scales already defined -- see tailwind.config.js
};

const fontFamily = {
  sans:    ['Inter', 'system-ui', 'sans-serif'],        // Body text, UI
  display: ['Playfair Display', 'Georgia', 'serif'],    // Headings, hero
  mono:    ['JetBrains Mono', 'monospace'],              // Code, prices, IDs
};

const boxShadow = {
  'brutal':       '4px 4px 0px 0px rgba(0, 0, 0, 1)',
  'brutal-sm':    '2px 2px 0px 0px rgba(0, 0, 0, 1)',
  'brutal-lg':    '6px 6px 0px 0px rgba(0, 0, 0, 1)',
  'brutal-xl':    '8px 8px 0px 0px rgba(0, 0, 0, 1)',
  'inner-brutal': 'inset 2px 2px 0px 0px rgba(0, 0, 0, 0.1)',
  'soft':         '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
  'soft-lg':      '0 10px 40px -5px rgba(0, 0, 0, 0.15)',
  'soft-xl':      '0 20px 60px -10px rgba(0, 0, 0, 0.2)',
  'glow':         '0 0 40px rgba(211, 129, 94, 0.3)',
  'glow-lg':      '0 0 60px rgba(211, 129, 94, 0.4)',
};
```

**Responsive breakpoints (mobile-first):**

| Token | px | Device |
|-------|-----|--------|
| (default) | 0-359 | Minimum viable (old Android) |
| `sm` | 360 | Standard mobile (iPhone SE, Galaxy S-series) |
| `md` | 768 | Tablet portrait |
| `lg` | 1024 | Tablet landscape / small laptop |
| `xl` | 1280 | Desktop |
| `2xl` | 1440 | Large desktop |

**No dark mode.** Shreshth's constitutional design law #1: "I HATE dark UI." White or warm neutral backgrounds only. This is not a preference -- it is a product decision. No `dark:` prefixes, no `prefers-color-scheme` media query, no dark palette definition.

### 5.1.3 React Router v6 with Lazy Loading

| Parameter | Value |
|-----------|-------|
| Version | `6.28.0` |
| Strategy | `createBrowserRouter` with `lazy()` on every route |

Every route beyond the shell is code-split:

```typescript
// src/router.tsx
import { createBrowserRouter, Outlet } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, lazy: () => import('./pages/HomePage') },
      { path: 'catalog', lazy: () => import('./pages/CatalogPage') },
      { path: 'catalog/:slug', lazy: () => import('./pages/ProductDetailPage') },
      { path: 'compare', lazy: () => import('./pages/ComparePage') },
      { path: 'community', lazy: () => import('./pages/CommunityPage') },
      { path: 'community/:postId', lazy: () => import('./pages/PostDetailPage') },
      { path: 'knowledge', lazy: () => import('./pages/KnowledgePage') },
      { path: 'knowledge/:slug', lazy: () => import('./pages/ArticlePage') },
      {
        path: 'auth',
        children: [
          { path: 'login', lazy: () => import('./pages/auth/LoginPage') },
          { path: 'register', lazy: () => import('./pages/auth/RegisterPage') },
          { path: 'verify', lazy: () => import('./pages/auth/VerifyPage') },
          { path: 'reset-password', lazy: () => import('./pages/auth/ResetPasswordPage') },
        ],
      },
      {
        path: 'dashboard',
        element: <AuthGuard />,
        children: [
          { index: true, lazy: () => import('./pages/dashboard/DashboardPage') },
          { path: 'rfq', lazy: () => import('./pages/dashboard/RFQListPage') },
          { path: 'rfq/new', lazy: () => import('./pages/dashboard/CreateRFQPage') },
          { path: 'rfq/:id', lazy: () => import('./pages/dashboard/RFQDetailPage') },
          { path: 'inquiries', lazy: () => import('./pages/dashboard/InquiriesPage') },
          { path: 'messages', lazy: () => import('./pages/dashboard/MessagesPage') },
          { path: 'messages/:conversationId', lazy: () => import('./pages/dashboard/ConversationPage') },
          { path: 'saved', lazy: () => import('./pages/dashboard/SavedProductsPage') },
          { path: 'profile', lazy: () => import('./pages/dashboard/ProfilePage') },
          { path: 'settings', lazy: () => import('./pages/dashboard/SettingsPage') },
        ],
      },
      {
        path: 'dealer',
        element: <DealerGuard />,
        children: [
          { index: true, lazy: () => import('./pages/dealer/DealerDashboardPage') },
          { path: 'onboarding', lazy: () => import('./pages/dealer/OnboardingPage') },
          { path: 'inquiries', lazy: () => import('./pages/dealer/InquiryFeedPage') },
          { path: 'inquiries/:id', lazy: () => import('./pages/dealer/InquiryDetailPage') },
          { path: 'quotes', lazy: () => import('./pages/dealer/QuotesPage') },
          { path: 'inventory', lazy: () => import('./pages/dealer/InventoryPage') },
          { path: 'analytics', lazy: () => import('./pages/dealer/AnalyticsPage') },
          { path: 'profile', lazy: () => import('./pages/dealer/ProfilePage') },
          { path: 'subscription', lazy: () => import('./pages/dealer/SubscriptionPage') },
          { path: 'messages', lazy: () => import('./pages/dealer/MessagesPage') },
        ],
      },
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          { index: true, lazy: () => import('./pages/admin/AdminDashboardPage') },
          { path: 'dealers', lazy: () => import('./pages/admin/DealersPage') },
          { path: 'dealers/:id', lazy: () => import('./pages/admin/DealerDetailPage') },
          { path: 'users', lazy: () => import('./pages/admin/UsersPage') },
          { path: 'inquiries', lazy: () => import('./pages/admin/InquiriesPage') },
          { path: 'inquiries/:id', lazy: () => import('./pages/admin/InquiryPipelinePage') },
          { path: 'catalog', lazy: () => import('./pages/admin/CatalogPage') },
          { path: 'rfqs', lazy: () => import('./pages/admin/RFQsPage') },
          { path: 'community', lazy: () => import('./pages/admin/CommunityModerationPage') },
          { path: 'crm', lazy: () => import('./pages/admin/CRMPage') },
          { path: 'scraper', lazy: () => import('./pages/admin/ScraperPage') },
          { path: 'analytics', lazy: () => import('./pages/admin/AnalyticsPage') },
          { path: 'payments', lazy: () => import('./pages/admin/PaymentsPage') },
          { path: 'settings', lazy: () => import('./pages/admin/SettingsPage') },
          { path: 'database', lazy: () => import('./pages/admin/DatabaseBrowserPage') },
        ],
      },
    ],
  },
]);
```

### 5.1.4 React Query v5 (TanStack Query)

| Parameter | Value |
|-----------|-------|
| Version | `5.66.0` |
| DevTools | `5.66.0` |
| Status | INSTALLED but UNUSED (0 hooks) -- CRIT-10 from audit |

**This is the #1 frontend architecture fix.** Every `useEffect` + `useState` + `axios.get` pattern in the codebase must be replaced with React Query hooks.

**Default QueryClient configuration:**

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes -- data is fresh for 5 min
      gcTime: 30 * 60 * 1000,           // 30 minutes -- garbage collect after 30 min
      retry: 1,                          // 1 retry on failure
      retryDelay: (attemptIndex) =>      // Exponential backoff: 1s, 2s
        Math.min(1000 * 2 ** attemptIndex, 4000),
      refetchOnWindowFocus: false,       // No refetch on tab switch
      refetchOnReconnect: true,          // Refetch when network reconnects
      networkMode: 'offlineFirst',       // Return cache while offline
    },
    mutations: {
      retry: 0,                          // No retry on mutations
      networkMode: 'online',             // Mutations require network
    },
  },
});
```

**Mandatory custom hooks (every server-state access goes through one of these):**

```typescript
// src/hooks/queries/useProducts.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.catalog.getProducts(filters),
    staleTime: 10 * 60 * 1000, // Products change rarely -- 10 min
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: () => api.catalog.getProduct(slug),
    enabled: !!slug,
  });
}

// src/hooks/queries/useCategories.ts
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.catalog.getCategories(),
    staleTime: 30 * 60 * 1000, // Categories almost never change -- 30 min
  });
}

// src/hooks/queries/useInquiries.ts
export function useMyInquiries() {
  return useQuery({
    queryKey: ['inquiries', 'mine'],
    queryFn: () => api.inquiries.getMyInquiries(),
  });
}

// src/hooks/queries/useRFQs.ts
export function useMyRFQs(status?: RFQStatus) {
  return useQuery({
    queryKey: ['rfqs', 'mine', { status }],
    queryFn: () => api.rfqs.getMyRFQs({ status }),
  });
}

// src/hooks/queries/useDealer.ts
export function useDealerDashboard() {
  return useQuery({
    queryKey: ['dealer', 'dashboard'],
    queryFn: () => api.dealer.getDashboard(),
    staleTime: 2 * 60 * 1000, // Dealer dashboard -- 2 min
  });
}

// src/hooks/queries/useConversations.ts
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.messages.getConversations(),
    refetchInterval: 30 * 1000, // Poll every 30s (until WebSocket is live)
  });
}

// src/hooks/mutations/useSubmitInquiry.ts
export function useSubmitInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInquiryInput) => api.inquiries.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}

// src/hooks/mutations/useSubmitQuote.ts
export function useSubmitQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitQuoteInput) => api.quotes.submit(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dealer', 'quotes'] });
      queryClient.invalidateQueries({ queryKey: ['inquiries', variables.inquiryId] });
    },
  });
}
```

### 5.1.5 Zustand 4 -- Client-Only State

| Parameter | Value |
|-----------|-------|
| Version | `4.5.5` |
| Middleware | `persist` (localStorage), `devtools` |

**Three stores. No more, no less.**

```typescript
// src/stores/authStore.ts -- PERSISTED
interface AuthState {
  // NOTE: Token is NOT stored here. It is in an HttpOnly cookie.
  // This store only tracks session metadata for UI rendering.
  user: AuthUser | null;
  dealer: AuthDealer | null;
  admin: AuthAdmin | null;
  activeRole: 'user' | 'dealer' | 'admin' | null;
  isAuthenticated: boolean;

  setUser: (user: AuthUser) => void;
  setDealer: (dealer: AuthDealer) => void;
  setAdmin: (admin: AuthAdmin) => void;
  logout: () => void;
}

// src/stores/rfqStore.ts -- PERSISTED (draft RFQ survives page reload)
interface RFQState {
  items: RFQCartItem[];
  deliveryCity: string;
  deliveryPincode: string;
  notes: string;

  addItem: (item: RFQCartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDeliveryInfo: (city: string, pincode: string) => void;
  setNotes: (notes: string) => void;
  clear: () => void;
}

// src/stores/uiStore.ts -- NOT PERSISTED
interface UIState {
  sidebarOpen: boolean;
  chatOpen: boolean;
  compareDrawerOpen: boolean;
  compareProducts: string[];  // max 4 product IDs
  activeModal: string | null;
  toasts: Toast[];

  toggleSidebar: () => void;
  toggleChat: () => void;
  addCompareProduct: (id: string) => void;
  removeCompareProduct: (id: string) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}
```

### 5.1.6 Supporting Libraries

| Library | Version | Purpose | Alternatives Rejected |
|---------|---------|---------|----------------------|
| `lucide-react` | `0.469.0` | Icons (tree-shakeable, 1500+ icons) | Heroicons (fewer icons), FontAwesome (not tree-shakeable) |
| `react-hook-form` | `7.54.2` | Form state management | Formik (heavier, slower re-renders) |
| `@hookform/resolvers` | `3.9.1` | Zod integration for RHF | Manual validation (error-prone) |
| `zod` | `3.24.1` | Schema validation (shared with backend) | Yup (worse TS inference), Joi (Node-only) |
| `axios` | `1.7.9` | HTTP client | fetch (no interceptors, no cancellation, no progress) |
| `date-fns` | `3.6.0` | Date formatting (tree-shakeable) | Moment.js (66KB, deprecated), dayjs (smaller but less coverage) |
| `clsx` | `2.1.1` | Conditional class merging | classnames (older, larger) |
| `tailwind-merge` | `2.6.0` | Tailwind class deduplication | None -- essential for component props |
| `recharts` | `2.15.0` | Charts (React-native, responsive) | Chart.js (imperative), D3 (overkill) |
| `posthog-js` | `1.210.0` | Product analytics | Mixpanel ($$$), Amplitude ($$$) |
| `react-markdown` | `9.0.3` | Safe markdown rendering | `dangerouslySetInnerHTML` (XSS -- CRIT-02) |
| `rehype-sanitize` | `6.0.0` | HTML sanitization for markdown | DOMPurify (manual integration) |
| `dompurify` | `3.2.3` | HTML sanitization (legacy fallback) | No alternative needed |
| `socket.io-client` | `4.8.1` | Real-time WebSocket | Raw WebSocket (no reconnection, no rooms) |

### 5.1.7 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['lucide-react', 'recharts', 'react-hook-form'],
          'vendor-utils': ['axios', 'date-fns', 'zod', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // KB
  },
  preview: {
    port: 3000,
  },
});
```

---

## 5.2 Backend Stack

### 5.2.1 Node.js 20 LTS + Express.js 4.18 + TypeScript 5.5

| Parameter | Value |
|-----------|-------|
| Node.js | `20.18.0 LTS` (maintenance until April 2026, EOL April 2027) |
| Express.js | `4.21.2` |
| TypeScript | `5.5.4` |
| Runtime (dev) | `tsx 4.19.2` (watch mode: `tsx watch src/index.ts`) |
| Runtime (prod) | `node dist/index.js` via PM2 |
| Process Manager | PM2 `5.4.3` (cluster mode, 2 instances on EC2) |

**Why Express over Fastify:**
- Ecosystem maturity: every middleware (passport, multer, helmet, cors, express-rate-limit, express-session) is battle-tested on Express.
- Team familiarity: the entire existing codebase is Express. Rewriting to Fastify adds risk with zero functional benefit at current scale.
- Performance delta is irrelevant at <10,000 RPM. Express handles 15,000+ requests/sec on a t3.medium.
- When we need Fastify's throughput (>50K RPM), we will be on a microservices architecture where individual services can adopt it independently.

**tsconfig.json (backend -- target state):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "scripts"]
}
```

**Audit delta from current state:**
- `strict`: `false` -> `true` (HIGH-29 fix -- this is the single most important backend change)
- `noUnusedLocals`: `false` -> `true`
- `noUnusedParameters`: `false` -> `true`
- `noUncheckedIndexedAccess`: not set -> `true`

### 5.2.2 Prisma 5.19 ORM

| Parameter | Value |
|-----------|-------|
| `@prisma/client` | `5.19.1` |
| `prisma` (CLI) | `5.19.1` |
| Adapter | PostgreSQL native |
| Connection | PgBouncer pooled URL (application), direct URL (migrations) |

**prisma schema configuration:**

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")         // PgBouncer pooled: ?pgbouncer=true&connection_limit=50
  directUrl  = env("DIRECT_DATABASE_URL")  // Direct for migrations
  extensions = [uuidOssp(map: "uuid-ossp"), pgTrgm(map: "pg_trgm"), pgVector(map: "vector")]
}
```

**Extensions enabled:**
- `uuid-ossp`: UUID v4 generation at database level
- `pg_trgm`: Trigram similarity for fuzzy text search (product names, brand matching)
- `pgvector`: Vector similarity search (semantic product search via embeddings)

### 5.2.3 Request Validation with Zod

| Parameter | Value |
|-----------|-------|
| Version | `3.24.1` |
| Integration | Middleware on EVERY route |

**Shared validation middleware:**

```typescript
// src/middleware/validation.middleware.ts
import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ location: string; issues: z.ZodIssue[] }> = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push({ location: 'body', issues: result.error.issues });
      } else {
        req.body = result.data; // Replace with parsed+stripped data
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push({ location: 'query', issues: result.error.issues });
      } else {
        req.query = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push({ location: 'params', issues: result.error.issues });
      } else {
        req.params = result.data;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}
```

**This middleware is REQUIRED on every route. No `req.body` is ever trusted raw. CRIT-06 (mass assignment on 5 CRM endpoints) is eliminated by this single change.**

### 5.2.4 Authentication Stack

| Library | Version | Purpose |
|---------|---------|---------|
| `passport` | `0.7.0` | Strategy-based auth framework |
| `passport-google-oauth20` | `2.0.0` | Google OAuth 2.0 strategy |
| `jsonwebtoken` | `9.0.2` | JWT signing/verification |
| `bcrypt` | `5.1.1` | Password hashing (cost factor: 12) |

**Token architecture (fixing CRIT-03, CRIT-04, CRIT-05):**

```typescript
// Access token: short-lived, in HttpOnly cookie
interface AccessTokenPayload {
  sub: string;              // User/Dealer/Admin UUID
  type: 'user' | 'dealer' | 'admin';
  role: UserRole | 'dealer' | 'admin';
  iat: number;
  exp: number;              // 15 minutes
}

// Refresh token: long-lived, in HttpOnly cookie, rotated on each use
interface RefreshTokenPayload {
  sub: string;
  type: 'user' | 'dealer' | 'admin';
  jti: string;              // Token ID for revocation
  iat: number;
  exp: number;              // 7 days (user/dealer), 1 day (admin)
}

// Cookie settings
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,           // Not accessible via JavaScript (fixes CRIT-03)
  secure: true,             // HTTPS only
  sameSite: 'strict',       // CSRF protection
  path: '/',
  domain: '.hub4estate.com',
};

const ACCESS_COOKIE = { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 };        // 15 min
const REFRESH_COOKIE = { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 }; // 7 days
```

### 5.2.5 Supporting Backend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `helmet` | `7.2.0` | Security headers (CSP, HSTS, X-Frame-Options) |
| `cors` | `2.8.5` | CORS with strict origin whitelist |
| `express-rate-limit` | `7.4.1` | Rate limiting per endpoint |
| `multer` | `1.4.5-lts.1` | File upload handling |
| `sharp` | `0.34.5` | Image processing (resize, compress, WebP conversion) |
| `winston` | `3.17.0` | Structured JSON logging |
| `@sentry/node` | `8.45.0` | Error tracking and performance monitoring |
| `@anthropic-ai/sdk` | `0.32.1` | Claude API client |
| `openai` | `6.27.0` | OpenAI embeddings API client |
| `resend` | `6.8.0` | Transactional email (DKIM-signed, hub4estate.com) |
| `nodemailer` | `7.0.12` | Email (fallback + SMTP integration) |
| `socket.io` | `4.8.1` | Real-time WebSocket server |
| `bullmq` | `5.30.0` | Job queue (email, notifications, scraping, AI processing) |
| `ioredis` | `5.4.2` | Redis client for BullMQ + caching |
| `uuid` | `9.0.1` | UUID generation |
| `p-limit` | `3.1.0` | Concurrency limiter for API calls |
| `cheerio` | `1.1.2` | HTML parsing for web scraping |
| `puppeteer` | `24.39.0` | Browser automation for scraping |
| `tesseract.js` | `7.0.0` | OCR for slip scanner |
| `pdf-parse` | `2.4.5` | PDF text extraction |

### 5.2.6 Express Middleware Chain (exact order)

```typescript
// src/index.ts -- middleware registration order matters
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requestLogger } from './middleware/requestLogger.middleware';
import { securityHeaders } from './middleware/security.middleware';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

const app = express();

// 1. Security headers (first -- applies to all responses including errors)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Tailwind needs inline styles
      imgSrc: ["'self'", 'data:', 'https://*.amazonaws.com', 'https://*.cloudfront.net'],
      connectSrc: ["'self'", 'https://api.hub4estate.com', 'wss://api.hub4estate.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// 2. CORS (strict origin whitelist -- fixes CRIT-17)
app.use(cors({
  origin: [
    'https://hub4estate.com',
    'https://www.hub4estate.com',
    'https://app.hub4estate.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key', 'X-Request-ID'],
  maxAge: 86400, // Preflight cache: 24h
}));

// 3. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// 4. Request logging (structured JSON)
app.use(requestLogger);

// 5. Global rate limit (100 requests per minute per IP)
app.use(globalRateLimit);

// 6. Routes (each route applies its own auth + validation + specific rate limits)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dealers', dealerRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/rfqs', rfqRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// 7. 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 8. Global error handler (MUST be last)
app.use(errorHandler);
```

---

## 5.3 Database Stack

### 5.3.1 PostgreSQL 15.4 on AWS RDS

| Parameter | Value |
|-----------|-------|
| Engine | PostgreSQL 15.4 |
| Region | ap-south-1 (Mumbai) |
| Primary Instance | db.r6g.large (2 vCPU, 16 GB RAM) |
| Read Replica | db.r6g.large (analytics queries) |
| Multi-AZ | Yes -- standby in ap-south-1b |
| Storage | gp3 SSD, 100 GB, auto-scaling up to 500 GB |
| IOPS | 3,000 baseline (gp3 default), burst to 16,000 |
| Encryption | AES-256 at rest via AWS KMS (key alias: `alias/hub4estate-rds`) |
| Backup | Automated daily at 02:00 IST, 35-day retention |
| Snapshot | Manual before every migration |
| Maintenance Window | Sunday 04:00-04:30 IST |

**Parameter Group (`hub4estate-pg15`):**

| Parameter | Value | Reason |
|-----------|-------|--------|
| `max_connections` | 400 | PgBouncer handles pooling; RDS needs headroom |
| `shared_buffers` | 4 GB | 25% of 16 GB RAM |
| `effective_cache_size` | 12 GB | 75% of RAM -- tells planner how much OS cache to expect |
| `work_mem` | 64 MB | Per-sort operation -- handles complex RFQ/quote joins |
| `maintenance_work_mem` | 512 MB | VACUUM and index creation |
| `random_page_cost` | 1.1 | SSD storage -- favors index scans |
| `effective_io_concurrency` | 200 | SSD concurrent I/O |
| `wal_buffers` | 64 MB | WAL write buffering |
| `checkpoint_completion_target` | 0.9 | Spread checkpoint writes |
| `log_min_duration_statement` | 200 | Log queries slower than 200ms |
| `pg_stat_statements.track` | all | Track all statement statistics |
| `idle_in_transaction_session_timeout` | 30000 | Kill idle-in-transaction after 30s |

**Extensions:**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";           -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";             -- Trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "vector";              -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- Query performance stats
```

**Connection Pooling -- PgBouncer on EC2 sidecar:**

| Parameter | Value |
|-----------|-------|
| Pool Mode | transaction |
| Default Pool Size | 50 |
| Max Client Connections | 400 |
| Reserve Pool Size | 5 |
| Reserve Pool Timeout | 3s |
| Server Idle Timeout | 300s |
| Query Timeout | 30s |
| Stats Period | 60s |

**Scaling Path:**

| Users | Primary | Read Replica | PgBouncer Pool | Action |
|-------|---------|-------------|----------------|--------|
| <1,000 | db.r6g.large | None (optional) | 50 | Current |
| 1,000-10,000 | db.r6g.xlarge | 1x db.r6g.large | 100 | Add read replica for analytics |
| 10,000-50,000 | db.r6g.2xlarge | 2x db.r6g.xlarge | 200 | Partition bids/orders by date |
| 50,000-100,000 | db.r6g.4xlarge | 3x db.r6g.2xlarge | 400 | Consider Aurora Serverless v2 |

### 5.3.2 Read Replica Strategy

One read replica (db.r6g.large) runs in ap-south-1b. Routed via a separate `READONLY_DATABASE_URL` connection string.

**Read replica is used for:**
- Admin analytics dashboard queries
- CRM reports
- Product catalog browsing (heavy read load)
- Community post feeds
- Scraper result processing

**Read replica is NOT used for:**
- RFQ/Quote operations (consistency required)
- Authentication
- Payment processing
- Messaging (real-time consistency)

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Primary: all writes + consistency-critical reads
export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

// Read replica: analytics, catalog browsing, community
export const prismaReadOnly = new PrismaClient({
  datasourceUrl: process.env.READONLY_DATABASE_URL ?? process.env.DATABASE_URL,
  log: ['warn', 'error'],
});
```

---

## 5.4 Caching Stack

### 5.4.1 Redis 7 on Amazon ElastiCache

| Parameter | Value |
|-----------|-------|
| Engine | Redis 7.2 |
| Instance | cache.r6g.large (2 vCPU, 13.07 GB) |
| Region | ap-south-1a |
| Cluster Mode | Disabled (single node for now) |
| Encryption at Rest | Yes (AWS KMS) |
| Encryption in Transit | Yes (TLS 1.3) |
| Snapshot | Daily at 03:00 IST |
| Maintenance Window | Monday 05:00-06:00 IST |

**Database allocation (5 logical databases):**

| DB | Purpose | Eviction Policy | Max Memory |
|----|---------|----------------|------------|
| 0 | Sessions (auth tokens, refresh token blacklist) | noeviction | 2 GB |
| 1 | Application cache (products, categories, dealer profiles) | allkeys-lru | 4 GB |
| 2 | Rate limiting (sliding window counters) | allkeys-lru | 512 MB |
| 3 | Job queues (BullMQ) | noeviction | 3 GB |
| 4 | AI cache (LLM response cache, embeddings) | allkeys-lru | 3 GB |

**Cache key conventions:**

```typescript
const CACHE_KEYS = {
  // Sessions (db:0)
  session: (tokenId: string) => `session:${tokenId}`,
  revokedToken: (jti: string) => `revoked:${jti}`,
  userSessions: (userId: string) => `user_sessions:${userId}`,

  // Application cache (db:1)
  product: (id: string) => `product:${id}`,
  productSlug: (slug: string) => `product_slug:${slug}`,
  categories: () => 'categories:all',
  category: (slug: string) => `category:${slug}`,
  dealerProfile: (id: string) => `dealer:${id}`,
  dealerDashboard: (id: string) => `dealer_dashboard:${id}`,
  searchResults: (hash: string) => `search:${hash}`,

  // Rate limiting (db:2)
  rateLimit: (key: string) => `rl:${key}`,
  otpAttempts: (phone: string) => `otp_attempts:${phone}`,

  // AI cache (db:4)
  aiResponse: (hash: string) => `ai:${hash}`,
  embedding: (text: string) => `emb:${text}`,
  priceEstimate: (productId: string, city: string) => `price_est:${productId}:${city}`,
} as const;

const CACHE_TTL = {
  session: 15 * 60,              // 15 minutes (access token lifetime)
  revokedToken: 7 * 24 * 60 * 60, // 7 days (refresh token max lifetime)
  product: 10 * 60,              // 10 minutes
  categories: 30 * 60,           // 30 minutes
  dealerProfile: 5 * 60,         // 5 minutes
  searchResults: 3 * 60,         // 3 minutes
  aiResponse: 24 * 60 * 60,     // 24 hours
  embedding: 7 * 24 * 60 * 60,  // 7 days
  priceEstimate: 60 * 60,       // 1 hour
} as const;
```

**Redis client setup:**

```typescript
// src/lib/redis.ts
import Redis from 'ioredis';

function createRedisClient(db: number): Redis {
  return new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD,
    db,
    tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    lazyConnect: true,
  });
}

export const sessionRedis = createRedisClient(0);
export const cacheRedis = createRedisClient(1);
export const rateLimitRedis = createRedisClient(2);
export const queueRedis = createRedisClient(3);
export const aiCacheRedis = createRedisClient(4);
```

**Scaling Path:**

| Users | Instance | Memory | Action |
|-------|----------|--------|--------|
| <1,000 | cache.r6g.large | 13 GB | Current |
| 1,000-10,000 | cache.r6g.xlarge | 26 GB | Increase memory |
| 10,000-50,000 | Redis Cluster (3 shards) | 78 GB | Enable cluster mode |
| 50,000+ | Redis Cluster (6 shards) | 156 GB | Horizontal scale |

---

## 5.5 Search Stack

### 5.5.1 Elasticsearch 8.11 on Elastic Cloud

| Parameter | Value |
|-----------|-------|
| Version | 8.11.4 |
| Deployment | Elastic Cloud (ap-south-1) |
| Nodes | 2 (1 hot, 1 warm) |
| Hot Node | 4 GB RAM, 2 vCPU |
| Warm Node | 2 GB RAM, 1 vCPU |
| Storage | 50 GB SSD |

**Index: `products`**

```json
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "product_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "product_synonyms", "snowball"]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "autocomplete_tokenizer",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "autocomplete_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 20,
          "token_chars": ["letter", "digit"]
        }
      },
      "filter": {
        "product_synonyms": {
          "type": "synonym",
          "synonyms": [
            "mcb, miniature circuit breaker",
            "rccb, residual current circuit breaker",
            "elcb, earth leakage circuit breaker",
            "led, light emitting diode",
            "ac, air conditioner",
            "db, distribution board",
            "wire, cable",
            "switch, modular switch",
            "frls, fire retardant low smoke"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id":            { "type": "keyword" },
      "name":          { "type": "text", "analyzer": "product_analyzer",
                         "fields": { "autocomplete": { "type": "text", "analyzer": "autocomplete_analyzer" },
                                     "keyword": { "type": "keyword" } } },
      "brand":         { "type": "keyword" },
      "brandName":     { "type": "text", "analyzer": "product_analyzer" },
      "category":      { "type": "keyword" },
      "subCategory":   { "type": "keyword" },
      "productType":   { "type": "keyword" },
      "modelNumber":   { "type": "keyword" },
      "sku":           { "type": "keyword" },
      "description":   { "type": "text", "analyzer": "product_analyzer" },
      "specifications": { "type": "object", "enabled": true },
      "certifications": { "type": "keyword" },
      "priceRange":    { "type": "float_range" },
      "images":        { "type": "keyword", "index": false },
      "isActive":      { "type": "boolean" },
      "embedding":     { "type": "dense_vector", "dims": 1536, "index": true,
                         "similarity": "cosine" },
      "createdAt":     { "type": "date" },
      "updatedAt":     { "type": "date" }
    }
  }
}
```

**Search strategy: Hybrid (lexical + semantic)**

```typescript
// src/services/search.service.ts
interface SearchQuery {
  q: string;
  brands?: string[];
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  certifications?: string[];
  page?: number;
  pageSize?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

async function hybridSearch(query: SearchQuery): Promise<SearchResults> {
  // 1. Get embedding for semantic search
  const embedding = await getEmbedding(query.q);

  // 2. Build Elasticsearch query
  const esQuery = {
    size: query.pageSize ?? 20,
    from: ((query.page ?? 1) - 1) * (query.pageSize ?? 20),
    query: {
      bool: {
        must: [
          {
            // Hybrid: combine BM25 text match + vector similarity
            script_score: {
              query: {
                multi_match: {
                  query: query.q,
                  fields: ['name^3', 'brandName^2', 'description', 'modelNumber^4'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                },
              },
              script: {
                source: "_score * 0.6 + cosineSimilarity(params.queryVector, 'embedding') * 0.4 + 1.0",
                params: { queryVector: embedding },
              },
            },
          },
        ],
        filter: [
          { term: { isActive: true } },
          ...(query.brands?.length ? [{ terms: { brand: query.brands } }] : []),
          ...(query.categories?.length ? [{ terms: { category: query.categories } }] : []),
          ...(query.certifications?.length ? [{ terms: { certifications: query.certifications } }] : []),
          ...(query.priceMin || query.priceMax ? [{
            range: {
              priceRange: {
                ...(query.priceMin ? { gte: query.priceMin } : {}),
                ...(query.priceMax ? { lte: query.priceMax } : {}),
              },
            },
          }] : []),
        ],
      },
    },
    aggs: {
      brands:         { terms: { field: 'brand', size: 50 } },
      categories:     { terms: { field: 'category', size: 20 } },
      subCategories:  { terms: { field: 'subCategory', size: 50 } },
      certifications: { terms: { field: 'certifications', size: 20 } },
      priceRanges: {
        range: {
          field: 'priceRange',
          ranges: [
            { to: 100 },
            { from: 100, to: 500 },
            { from: 500, to: 1000 },
            { from: 1000, to: 5000 },
            { from: 5000 },
          ],
        },
      },
    },
  };

  const results = await esClient.search({ index: 'products', body: esQuery });
  return transformResults(results);
}
```

**Autocomplete endpoint (edge_ngram):**

```typescript
async function autocomplete(prefix: string): Promise<AutocompleteResult[]> {
  const results = await esClient.search({
    index: 'products',
    body: {
      size: 8,
      _source: ['id', 'name', 'brand', 'category', 'images'],
      query: {
        bool: {
          must: [
            { match: { 'name.autocomplete': { query: prefix, operator: 'and' } } },
          ],
          filter: [{ term: { isActive: true } }],
        },
      },
    },
  });
  return results.hits.hits.map(transformAutocomplete);
}
```

---

## 5.6 File Storage

### 5.6.1 AWS S3

| Parameter | Value |
|-----------|-------|
| Region | ap-south-1 (Mumbai) |
| Versioning | Enabled on `uploads` and `assets` buckets |
| Encryption | SSE-S3 (AES-256) |
| Access | Private by default. Presigned URLs for user-facing access |

**8 buckets:**

| Bucket | Purpose | Lifecycle | Public |
|--------|---------|-----------|--------|
| `hub4estate-uploads` | User/dealer file uploads (KYC docs, product photos, slip scans) | Move to Glacier after 90 days | No |
| `hub4estate-assets` | Processed images (thumbnails, WebP conversions), brand logos | Permanent | Via CloudFront |
| `hub4estate-backups` | Database backups, application config snapshots | Delete after 180 days | No |
| `hub4estate-logs` | Application logs, access logs, audit logs | Delete after 365 days | No |
| `hub4estate-scraper` | Scraped product data, raw images | Delete after 30 days | No |
| `hub4estate-ml` | ML model artifacts, training data, embeddings | Permanent | No |
| `hub4estate-temp` | Temporary files (in-progress uploads, processing) | **Auto-delete after 24 hours** | No |
| `hub4estate-exports` | User-generated reports, CSV exports, invoices | Delete after 30 days | No |

**Upload flow (presigned URLs):**

```typescript
// src/services/storage.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface UploadUrlRequest {
  bucket: string;
  folder: string;
  fileName: string;
  contentType: string;
  maxSizeBytes: number;
}

async function getUploadUrl(req: UploadUrlRequest): Promise<{ uploadUrl: string; key: string }> {
  const key = `${req.folder}/${uuid()}-${req.fileName}`;

  const command = new PutObjectCommand({
    Bucket: req.bucket,
    Key: key,
    ContentType: req.contentType,
    ContentLength: req.maxSizeBytes,
    ServerSideEncryption: 'AES256',
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min
  return { uploadUrl, key };
}

async function getDownloadUrl(bucket: string, key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
}
```

**Image processing pipeline (on upload):**

```typescript
// src/jobs/imageProcessing.job.ts
import sharp from 'sharp';

interface ImageVariant {
  suffix: string;
  width: number;
  height: number;
  quality: number;
  format: 'webp' | 'jpeg';
}

const VARIANTS: ImageVariant[] = [
  { suffix: 'thumb',  width: 150,  height: 150,  quality: 80, format: 'webp' },
  { suffix: 'sm',     width: 400,  height: 400,  quality: 85, format: 'webp' },
  { suffix: 'md',     width: 800,  height: 800,  quality: 85, format: 'webp' },
  { suffix: 'lg',     width: 1200, height: 1200, quality: 90, format: 'webp' },
  { suffix: 'orig',   width: 2000, height: 2000, quality: 90, format: 'jpeg' }, // Fallback
];

async function processImage(sourceKey: string): Promise<ProcessedImage> {
  const sourceBuffer = await downloadFromS3('hub4estate-uploads', sourceKey);

  const results = await Promise.all(
    VARIANTS.map(async (variant) => {
      const processed = await sharp(sourceBuffer)
        .resize(variant.width, variant.height, { fit: 'inside', withoutEnlargement: true })
        .toFormat(variant.format, { quality: variant.quality })
        .toBuffer();

      const destKey = sourceKey.replace(/\.[^.]+$/, `-${variant.suffix}.${variant.format}`);
      await uploadToS3('hub4estate-assets', destKey, processed, `image/${variant.format}`);
      return { variant: variant.suffix, key: destKey, size: processed.length };
    })
  );

  return { sourceKey, variants: results };
}
```

**CDN -- CloudFront distribution for `hub4estate-assets`:**

| Parameter | Value |
|-----------|-------|
| Distribution ID | (auto-generated) |
| Origin | `hub4estate-assets.s3.ap-south-1.amazonaws.com` |
| Viewer Protocol | HTTPS only |
| Cache Policy | `Managed-CachingOptimized` (TTL: 86400s default, max 31536000s) |
| Origin Request | `Managed-CORS-S3Origin` |
| Response Headers | `Managed-SecurityHeadersPolicy` |
| Price Class | PriceClass_200 (US, Europe, Asia, Middle East, Africa) |
| Custom Domain | `cdn.hub4estate.com` |
| SSL Certificate | ACM certificate (`*.hub4estate.com`) |

---

## 5.7 AI/ML Stack

| Service | Model/Version | Use Case | Cost |
|---------|--------------|----------|------|
| Anthropic Claude | `claude-sonnet-4-20250514` | Volt chatbot (complex reasoning, product recommendations, BOQ generation) | $3 / $15 per M input/output tokens |
| Anthropic Claude | `claude-haiku-4-5-20251001` | Product categorization, JSON extraction, inquiry parsing, slip scanner text analysis | $0.25 / $1.25 per M tokens |
| Google Cloud Vision | v1 | OCR for slip scanner (image to text before Claude parsing) | $1.50 / 1,000 images |
| OpenAI | `text-embedding-3-small` | Semantic search embeddings (1536 dimensions) | $0.02 / M tokens |
| XGBoost | 1.7.6 on SageMaker | Price prediction (regressor: historical prices + seasonality + demand signals) | $0.096/hr (ml.m5.large) -- batch only |
| Scikit-learn | Isolation Forest | Anomaly detection (shill bid detection, quote manipulation) | Runs on EC2, no incremental cost |
| pgvector | PostgreSQL extension | Vector storage and cosine similarity search | No incremental cost (runs in RDS) |

**Model tiering strategy:**

```typescript
// src/config/ai.config.ts
export const AI_CONFIG = {
  models: {
    // Tier 1: Complex reasoning -- user-facing chat, BOQ generation
    complex: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.3,
      budgetPerUserPerDay: 50_000,  // tokens
    },
    // Tier 2: Fast extraction -- categorization, parsing, JSON output
    fast: {
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 2048,
      temperature: 0.1,
      budgetPerUserPerDay: 200_000, // tokens
    },
    // Tier 3: Embeddings -- search, similarity
    embedding: {
      model: 'text-embedding-3-small',
      dimensions: 1536,
    },
  },
  rateLimits: {
    chatMessagesPerMinute: 10,
    chatMessagesPerDay: 100,
    slipScansPerDay: 20,
    boqGenerationsPerDay: 5,
  },
  cache: {
    responsesTTL: 24 * 60 * 60,    // 24 hours for identical queries
    embeddingsTTL: 7 * 24 * 60 * 60, // 7 days for embeddings
    minSimilarityForCacheHit: 0.95,  // Cosine similarity threshold
  },
} as const;
```

---

## 5.8 Infrastructure Stack

### 5.8.1 AWS ap-south-1 (Mumbai)

| Service | Resource | Configuration |
|---------|----------|---------------|
| **EC2** | `t3.medium` (2 vCPU, 4 GB) | Backend API + PM2 (2 instances). AMI: Amazon Linux 2023 |
| **RDS** | `db.r6g.large` (2 vCPU, 16 GB) | PostgreSQL 15.4. Multi-AZ. 100 GB gp3 |
| **ElastiCache** | `cache.r6g.large` (2 vCPU, 13 GB) | Redis 7.2. Single-node |
| **S3** | 8 buckets | See Section 5.6 |
| **CloudFront** | 1 distribution | `cdn.hub4estate.com` -- serves assets bucket |
| **ALB** | Application Load Balancer | HTTPS termination, health checks every 30s |
| **ASG** | Auto Scaling Group | min: 2, desired: 2, max: 10. Scale on CPU > 70% |
| **Route 53** | Hosted zone: `hub4estate.com` | A records, CNAME for CDN, MX for email |
| **ACM** | SSL Certificate | `*.hub4estate.com` -- auto-renewed |
| **WAF** | Web ACL (10 rules) | Rate limiting, SQL injection, XSS, geo-blocking, bot detection |
| **SES** | Email sending | DKIM-verified `hub4estate.com`. Production sandbox removed |
| **KMS** | Customer-managed key | RDS encryption, S3 encryption, parameter store |
| **SSM Parameter Store** | Secrets storage | All environment variables. Encrypted with KMS. No `.env` files |
| **CloudWatch** | Logs + Metrics + Alarms | Application logs, RDS metrics, EC2 metrics |

**VPC Architecture:**

```
VPC: 10.0.0.0/16

Public Subnets:
  10.0.1.0/24 (ap-south-1a) -- ALB, NAT Gateway
  10.0.2.0/24 (ap-south-1b) -- ALB (redundancy)

Private Subnets:
  10.0.10.0/24 (ap-south-1a) -- EC2 instances (API servers)
  10.0.11.0/24 (ap-south-1b) -- EC2 instances (redundancy)

Isolated Subnets:
  10.0.20.0/24 (ap-south-1a) -- RDS primary
  10.0.21.0/24 (ap-south-1b) -- RDS standby/replica, ElastiCache

Security Groups:
  sg-alb:       Inbound 443 from 0.0.0.0/0
  sg-api:       Inbound 3001 from sg-alb only
  sg-rds:       Inbound 5432 from sg-api only
  sg-redis:     Inbound 6379 from sg-api only
  sg-pgbouncer: Inbound 6432 from sg-api only, Outbound 5432 to sg-rds
```

### 5.8.2 External Services

| Service | Provider | Purpose | Cost Tier |
|---------|----------|---------|-----------|
| Razorpay | razorpay.com | Payment gateway (UPI, cards, NEFT, wallets) | 2% per transaction |
| MSG91 | msg91.com | SMS OTP (India) | Rs 0.18/SMS |
| Expo Push | expo.dev | Mobile push notifications | Free tier (10K/month) |
| Resend | resend.com | Transactional email | $20/month (50K emails) |
| PostHog | posthog.com | Product analytics | Free tier (1M events/month) |
| Sentry | sentry.io | Error tracking | Free tier (5K errors/month) |
| Elastic Cloud | elastic.co | Elasticsearch hosting | $95/month (standard) |
| GitHub | github.com | Source control + CI/CD (Actions) | Free for public, $4/user private |

---

## 5.9 DevOps Stack

### 5.9.1 CI/CD -- GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI Pipeline
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [frontend, backend]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter ${{ matrix.package }} run lint
      - run: pnpm --filter ${{ matrix.package }} run typecheck

  test:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: hub4estate_test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter backend run test
      - run: pnpm --filter frontend run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter frontend run build
      - run: pnpm --filter backend run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter frontend run build
      - name: Deploy to AWS Amplify
        run: |
          aws amplify start-deployment \
            --app-id ${{ secrets.AMPLIFY_APP_ID }} \
            --branch-name main

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/hub4estate/backend
            git pull origin main
            pnpm install --frozen-lockfile
            pnpm run build
            pnpm run db:migrate -- --skip-seed
            pm2 restart hub4estate-backend --update-env

  smoke-test:
    needs: [deploy-frontend, deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Health check
        run: |
          for i in {1..10}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.hub4estate.com/api/v1/health)
            if [ "$STATUS" = "200" ]; then echo "Health check passed"; exit 0; fi
            sleep 10
          done
          echo "Health check failed"; exit 1
```

### 5.9.2 Docker (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15.4
    environment:
      POSTGRES_USER: hub4estate
      POSTGRES_PASSWORD: local_dev_password
      POSTGRES_DB: hub4estate
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.4
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  es_data:
```

### 5.9.3 Monitoring Stack

| Tool | Purpose | Alert Channels |
|------|---------|---------------|
| **Sentry** | Frontend + backend error tracking. PII scrubbing enabled. Release tracking. | Slack #errors, Email |
| **PostHog** | Product analytics. Feature flags. Session replay. | Dashboard |
| **CloudWatch** | Infrastructure metrics (CPU, memory, disk, network). RDS metrics. | SNS -> Slack #infra |
| **Winston** | Structured JSON logging to CloudWatch Logs. Correlation IDs. | CloudWatch Insights |
| **UptimeRobot** | External uptime monitoring (1-min checks) | Slack #alerts, SMS |

**CloudWatch Alarms:**

| Alarm | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| API High CPU | EC2 CPUUtilization | > 80% for 5 min | Scale out ASG |
| API Low CPU | EC2 CPUUtilization | < 20% for 30 min | Scale in ASG |
| RDS High CPU | RDS CPUUtilization | > 80% for 5 min | SNS alert |
| RDS Free Storage | RDS FreeStorageSpace | < 10 GB | SNS alert |
| RDS Connections | RDS DatabaseConnections | > 350 | SNS alert |
| Redis Memory | ElastiCache BytesUsedForCache | > 80% | SNS alert |
| 5xx Errors | ALB HTTPCode_Target_5XX_Count | > 10 in 5 min | SNS alert |
| API Response Time | ALB TargetResponseTime | p99 > 2s for 5 min | SNS alert |

---

## 5.10 Cost Analysis

All costs in INR. USD conversion at 1 USD = 84 INR.

### 5.10.1 MVP (~50 users, current state)

| Service | Monthly Cost (INR) |
|---------|--------------------|
| EC2 t3.medium (1 instance, on-demand) | 2,520 |
| RDS db.t3.medium (single-AZ, dev) | 2,940 |
| ElastiCache cache.t3.micro | 840 |
| S3 (10 GB) | 25 |
| CloudFront (10 GB transfer) | 85 |
| Route 53 (1 hosted zone) | 42 |
| Anthropic API (~100K tokens/day) | 840 |
| Resend (free tier) | 0 |
| MSG91 (500 SMS/month) | 90 |
| Sentry (free tier) | 0 |
| PostHog (free tier) | 0 |
| Elastic Cloud (trial/free) | 0 |
| Domain renewal (annual/12) | 100 |
| **Total** | **~7,480/mo** |

### 5.10.2 Growth (~1,000 users)

| Service | Monthly Cost (INR) |
|---------|--------------------|
| EC2 t3.medium x2 (ASG) | 5,040 |
| RDS db.r6g.large (Multi-AZ) | 16,800 |
| ElastiCache cache.r6g.large | 8,400 |
| S3 (100 GB) | 210 |
| CloudFront (100 GB transfer) | 840 |
| Route 53 | 42 |
| ALB | 1,680 |
| Anthropic API (~1M tokens/day) | 5,040 |
| OpenAI Embeddings | 420 |
| Resend ($20/mo) | 1,680 |
| MSG91 (5,000 SMS/month) | 900 |
| Sentry ($26/mo team) | 2,184 |
| PostHog (free tier) | 0 |
| Elastic Cloud ($95/mo) | 7,980 |
| WAF | 420 |
| **Total** | **~51,636/mo** |

### 5.10.3 Scale (~10,000 users)

| Service | Monthly Cost (INR) |
|---------|--------------------|
| EC2 t3.large x4 (ASG) | 20,160 |
| RDS db.r6g.xlarge + read replica | 42,000 |
| ElastiCache cache.r6g.xlarge | 16,800 |
| S3 (1 TB) | 2,100 |
| CloudFront (1 TB transfer) | 6,300 |
| ALB | 3,360 |
| Anthropic API (~10M tokens/day) | 25,200 |
| OpenAI Embeddings | 2,520 |
| SageMaker (batch, 10 hrs/month) | 810 |
| Resend ($80/mo) | 6,720 |
| MSG91 (50,000 SMS/month) | 9,000 |
| Sentry ($80/mo) | 6,720 |
| PostHog ($0 -- self-hosted or free) | 0 |
| Elastic Cloud ($250/mo) | 21,000 |
| WAF | 840 |
| Razorpay (2% on ~50L GMV) | 100,000 |
| **Total** | **~2,63,530/mo** |

*Note: Razorpay transaction fees are pass-through, not infrastructure cost.*

### 5.10.4 Enterprise (~100,000 users)

| Service | Monthly Cost (INR) |
|---------|--------------------|
| EC2 / ECS Fargate (auto-scaled) | 84,000 |
| RDS db.r6g.2xlarge + 2 read replicas | 126,000 |
| ElastiCache Redis Cluster (3 shards) | 50,400 |
| S3 (10 TB) | 21,000 |
| CloudFront (10 TB transfer) | 42,000 |
| ALB | 8,400 |
| Anthropic API (~100M tokens/day) | 168,000 |
| OpenAI Embeddings | 16,800 |
| SageMaker (dedicated endpoint) | 25,200 |
| Email + SMS | 42,000 |
| Sentry ($300/mo) | 25,200 |
| PostHog ($450/mo) | 37,800 |
| Elastic Cloud ($800/mo) | 67,200 |
| WAF + Shield Advanced | 8,400 |
| **Total** | **~7,22,400/mo** |

*At 100K users, expected revenue: 5,000 active dealers x avg Rs 2,500/mo = Rs 1.25 Cr/mo. Infrastructure cost = ~5.8% of revenue.*

---

# SECTION 6 -- COMPLETE DATABASE ARCHITECTURE

This section defines every enum, every model, every field, every index, and every relation in the Hub4Estate database. This is the single source of truth from which `prisma migrate dev` is run. The current schema has **49 models and 19 enums**. This target schema has **68 models and 22 enums**.

---

## 6.1 All Enums (22 total)

### 6.1.1 Existing Enums (19)

```prisma
// User & Authentication
enum UserRole {
  INDIVIDUAL_HOME_BUILDER
  RENOVATION_HOMEOWNER
  ARCHITECT
  INTERIOR_DESIGNER
  CONTRACTOR
  ELECTRICIAN
  SMALL_BUILDER
  DEVELOPER
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

enum ProfVerificationStatus {
  NOT_APPLIED
  PENDING_DOCUMENTS
  UNDER_REVIEW
  VERIFIED
  REJECTED
}

// Dealer
enum DealerStatus {
  PENDING_VERIFICATION
  DOCUMENTS_PENDING
  UNDER_REVIEW
  VERIFIED
  REJECTED
  SUSPENDED
  DELETED
}

enum DealerType {
  RETAILER
  DISTRIBUTOR
  SYSTEM_INTEGRATOR
  CONTRACTOR
  OEM_PARTNER
  WHOLESALER
}

// RFQ & Quotes
enum RFQStatus {
  DRAFT
  PUBLISHED
  QUOTES_RECEIVED
  DEALER_SELECTED
  COMPLETED
  CANCELLED
}

enum QuoteStatus {
  SUBMITTED
  SELECTED
  REJECTED
  EXPIRED
}

// Community
enum PostStatus {
  PUBLISHED
  HIDDEN
  DELETED
}

// Audit
enum AuditAction {
  DEALER_VERIFIED
  DEALER_REJECTED
  DEALER_SUSPENDED
  PRODUCT_CREATED
  PRODUCT_UPDATED
  CATEGORY_CREATED
  USER_SUSPENDED
  RFQ_FLAGGED
  QUOTE_FLAGGED
  // NEW additions
  PAYMENT_PROCESSED
  SUBSCRIPTION_CHANGED
  CONVERSATION_FLAGGED
  ADMIN_SETTING_CHANGED
  FEATURE_FLAG_TOGGLED
}

// CRM
enum CompanyType {
  MANUFACTURER
  DISTRIBUTOR
  DEALER
  BRAND
  OTHER
}

enum CompanySegment {
  PREMIUM
  MID_RANGE
  BUDGET
  ALL_SEGMENTS
}

enum OutreachType {
  EMAIL
  LINKEDIN
  PHONE_CALL
  MEETING
  WHATSAPP
  OTHER
}

enum OutreachStatus {
  SCHEDULED
  SENT
  DELIVERED
  OPENED
  REPLIED
  MEETING_SCHEDULED
  NOT_INTERESTED
  BOUNCED
  FAILED
}

// Inquiry Pipeline
enum PipelineStatus {
  BRAND_IDENTIFIED
  DEALERS_FOUND
  QUOTES_REQUESTED
  QUOTES_RECEIVED
  SENT_TO_CUSTOMER
  CLOSED
}

enum QuoteResponseStatus {
  PENDING
  CONTACTED
  QUOTED
  NO_RESPONSE
  DECLINED
}

enum ContactMethod {
  WHATSAPP
  CALL
  EMAIL
  SMS
}

enum BrandDealerSource {
  MANUAL
  SCRAPED
  BRAND_WEBSITE
  PLATFORM_DEALER
}

// Scraping
enum ScrapeStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  PARTIAL
}

// Activity
enum ActivityType {
  USER_SIGNUP
  USER_LOGIN
  USER_GOOGLE_SIGNIN
  USER_GOOGLE_SIGNUP
  USER_PROFILE_COMPLETED
  USER_OTP_REQUESTED
  USER_OTP_VERIFIED
  DEALER_REGISTERED
  DEALER_LOGIN
  DEALER_PROFILE_UPDATED
  DEALER_DOCUMENT_UPLOADED
  DEALER_DOCUMENT_DELETED
  DEALER_BRAND_ADDED
  DEALER_CATEGORY_ADDED
  DEALER_SERVICE_AREA_ADDED
  DEALER_SERVICE_AREA_REMOVED
  DEALER_VERIFIED
  DEALER_REJECTED
  PRODUCT_INQUIRY_SUBMITTED
  PRODUCT_IMAGE_UPLOADED
  MODEL_NUMBER_SUBMITTED
  PRODUCT_SAVED
  PRODUCT_SEARCHED
  RFQ_CREATED
  RFQ_PUBLISHED
  RFQ_CANCELLED
  QUOTE_SUBMITTED
  QUOTE_SELECTED
  POST_CREATED
  COMMENT_CREATED
  POST_UPVOTED
  CONTACT_FORM_SUBMITTED
  CHAT_SESSION_STARTED
  CHAT_MESSAGE_SENT
  ADMIN_LOGIN
  // NEW additions
  PAYMENT_INITIATED
  PAYMENT_COMPLETED
  PAYMENT_FAILED
  SUBSCRIPTION_CREATED
  SUBSCRIPTION_CANCELLED
  MESSAGE_SENT
  CONVERSATION_STARTED
}
```

### 6.1.2 New Enums (3)

```prisma
enum PaymentStatus {
  PENDING           // Payment initiated, awaiting processing
  PROCESSING        // Payment gateway is processing
  COMPLETED         // Payment successful
  FAILED            // Payment failed (declined, timeout, etc.)
  REFUNDED          // Full refund processed
  PARTIALLY_REFUNDED // Partial refund processed
}

enum SubscriptionStatus {
  ACTIVE            // Subscription is active and paid
  PAUSED            // Dealer paused subscription (grace: 7 days)
  CANCELLED         // Dealer cancelled, access until period end
  EXPIRED           // Period ended without renewal
  GRACE_PERIOD      // Payment failed, 3-day grace before suspension
}

enum MessageType {
  TEXT              // Plain text message
  IMAGE             // Image attachment
  SYSTEM            // System-generated message (quote received, status change)
  TOOL_RESULT       // AI tool result (price lookup, product suggestion)
}
```

---

## 6.2 All Models (68 total)

### Conventions Applied to All Models

1. **Primary key**: `id String @id @default(uuid())` -- UUID v4, generated by Prisma
2. **Timestamps**: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` on every model
3. **Soft delete**: `status` enum with `DELETED` value where applicable. No `deletedAt` column -- status-based filtering is simpler for Prisma queries
4. **Audit fields**: `createdBy` and `updatedBy` on admin-operated tables
5. **Text fields**: `@db.Text` for fields that may exceed 255 chars (descriptions, notes, JSON blobs)
6. **Index naming**: `@@index([field])` -- Prisma auto-names. Comments explain why.
7. **Cascade strategy**: `onDelete: Cascade` for owned relations, `onDelete: SetNull` for optional references

---

### Group 1: User & Authentication (8 models)

#### Model 1: User

```prisma
model User {
  id                     String                  @id @default(uuid())
  email                  String?                 @unique
  googleId               String?                 @unique
  phone                  String?                 @unique
  name                   String
  role                   UserRole?
  city                   String?
  purpose                String?                 // "new_build" | "renovation" | "maintenance" | "other"
  status                 UserStatus              @default(ACTIVE)
  profileImage           String?                 // S3 key, not URL
  isPhoneVerified        Boolean                 @default(false)
  isEmailVerified        Boolean                 @default(false)
  profVerificationStatus ProfVerificationStatus  @default(NOT_APPLIED)

  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt

  // Relations
  rfqs                   RFQ[]
  communityPosts         CommunityPost[]
  communityComments      CommunityComment[]
  communityVotes         CommunityVote[]
  savedProducts          SavedProduct[]
  professionalProfile    ProfessionalProfile?
  activities             UserActivity[]
  conversations          ConversationParticipant[]
  messages               Message[]
  notifications          Notification[]
  deviceTokens           DevicePushToken[]
  payments               Payment[]
  searchHistory          SearchHistory[]

  @@index([email])       // Login lookup by email
  @@index([phone])       // Login lookup by phone / OTP
  @@index([googleId])    // Google OAuth lookup
  @@index([city])        // City-based filtering (analytics, matching)
  @@index([profVerificationStatus]) // Admin: filter by verification status
  @@index([status])      // Filter active users
  @@index([createdAt])   // Sort by registration date
}
```

**TypeScript interface:**

```typescript
interface User {
  id: string;
  email: string | null;
  googleId: string | null;
  phone: string | null;
  name: string;
  role: UserRole | null;
  city: string | null;
  purpose: string | null;
  status: UserStatus;
  profileImage: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  profVerificationStatus: ProfVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 2: ProfessionalProfile

```prisma
model ProfessionalProfile {
  id              String    @id @default(uuid())
  userId          String    @unique

  // Business info
  businessName    String?
  registrationNo  String?   // COA number (Architect), trade license number, etc.
  websiteUrl      String?
  portfolioUrl    String?
  bio             String?   @db.Text

  // Location
  officeAddress   String?
  city            String?
  state           String?
  pincode         String?

  yearsExperience Int?

  // Verification
  verifiedAt      DateTime?
  verifiedBy      String?   // Admin ID
  rejectionReason String?   @db.Text
  adminNotes      String?   @db.Text

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  documents       ProfessionalDocument[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])  // FK lookup
}
```

```typescript
interface ProfessionalProfile {
  id: string;
  userId: string;
  businessName: string | null;
  registrationNo: string | null;
  websiteUrl: string | null;
  portfolioUrl: string | null;
  bio: string | null;
  officeAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  yearsExperience: number | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 3: ProfessionalDocument

```prisma
model ProfessionalDocument {
  id         String               @id @default(uuid())
  profileId  String

  docType    String               // "coa_certificate" | "trade_license" | "gst_certificate" | "id_proof" | "portfolio"
  fileUrl    String               // S3 key
  fileName   String?
  fileSize   Int?                 // bytes
  mimeType   String?

  isVerified Boolean              @default(false)
  verifiedAt DateTime?

  profile    ProfessionalProfile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

  createdAt  DateTime             @default(now())

  @@index([profileId])  // All documents for a profile
  @@index([docType])    // Filter by document type
}
```

```typescript
interface ProfessionalDocument {
  id: string;
  profileId: string;
  docType: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  isVerified: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
}
```

#### Model 4: OTP

```prisma
model OTP {
  id         String   @id @default(uuid())
  identifier String   // Phone number or email
  code       String   // 6-digit OTP -- MUST be hashed before storage (bcrypt, cost 10)
  type       String   // "login" | "signup" | "reset_password" | "verify_phone" | "verify_email"
  expiresAt  DateTime
  verified   Boolean  @default(false)
  attempts   Int      @default(0) // Max 5 attempts before invalidation

  createdAt  DateTime @default(now())

  @@index([identifier])          // Lookup by phone/email
  @@index([expiresAt])           // Cleanup expired OTPs
  @@index([identifier, type])    // Lookup by identifier + type combination
}
```

```typescript
interface OTP {
  id: string;
  identifier: string;
  code: string;          // Stored as bcrypt hash, not plaintext
  type: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}
```

#### Model 5: RefreshToken

```prisma
model RefreshToken {
  id        String    @id @default(uuid())
  token     String    @unique  // Opaque token (UUID v4), stored as SHA-256 hash
  userId    String
  userType  String             // "user" | "dealer" | "admin"
  revoked   Boolean   @default(false)
  revokedAt DateTime?
  expiresAt DateTime

  // Device info for session management
  deviceName String?           // "iPhone 15 Pro" | "Chrome on Windows"
  ipAddress  String?

  createdAt DateTime  @default(now())

  @@index([userId])            // All sessions for a user
  @@index([token])             // Token lookup
  @@index([expiresAt])         // Cleanup expired tokens
  @@index([revoked])           // Filter active tokens
  @@index([userId, userType])  // All sessions by type
}
```

```typescript
interface RefreshToken {
  id: string;
  token: string;         // SHA-256 hash of the actual token
  userId: string;
  userType: 'user' | 'dealer' | 'admin';
  revoked: boolean;
  revokedAt: Date | null;
  expiresAt: Date;
  deviceName: string | null;
  ipAddress: string | null;
  createdAt: Date;
}
```

#### Model 6: PasswordResetToken

```prisma
model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique  // SHA-256 hash of emailed token
  email     String
  userType  String            // "user" | "dealer"
  used      Boolean  @default(false)
  expiresAt DateTime          // 1 hour from creation

  createdAt DateTime @default(now())

  @@index([token])             // Token lookup
  @@index([email])             // Lookup by email
  @@index([expiresAt])         // Cleanup expired tokens
}
```

```typescript
interface PasswordResetToken {
  id: string;
  token: string;
  email: string;
  userType: 'user' | 'dealer';
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}
```

#### Model 7: Admin

```prisma
model Admin {
  id       String  @id @default(uuid())
  email    String  @unique
  password String  // bcrypt hash, cost factor 12
  name     String
  role     String  @default("admin") // "admin" | "super_admin"
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email]) // Login lookup
}
```

```typescript
interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 8: UserPreference

```prisma
model UserPreference {
  id     String @id @default(uuid())
  userId String @unique

  // Notification preferences
  emailNotifications    Boolean @default(true)
  smsNotifications      Boolean @default(true)
  pushNotifications     Boolean @default(true)
  whatsappNotifications Boolean @default(true)

  // Digest preferences
  dailyDigest   Boolean @default(false)
  weeklyDigest  Boolean @default(true)

  // Display preferences
  language      String  @default("en")  // "en" | "hi"
  currency      String  @default("INR")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId]) // FK lookup
}
```

```typescript
interface UserPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  whatsappNotifications: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  language: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Group 2: Dealer (8 models)

#### Model 9: Dealer

```prisma
model Dealer {
  id                  String       @id @default(uuid())
  email               String       @unique
  password            String?      // bcrypt hash. Null if onboarding incomplete
  businessName        String
  ownerName           String
  phone               String
  gstNumber           String       @unique
  panNumber           String
  shopAddress         String
  city                String
  state               String
  pincode             String

  dealerType          DealerType   @default(RETAILER)
  yearsInOperation    Int?

  // Verification documents (S3 keys)
  gstDocument         String?
  panDocument         String?
  shopLicense         String?
  cancelledCheque     String?
  shopPhoto           String?
  shopImages          String[]     // Multiple shop/warehouse/product images
  brandAuthProofs     String[]     // Authorization document URLs

  // Storefront / public profile
  description         String?      @db.Text
  establishedYear     Int?
  certifications      String[]     // ["ISI Authorized", "Havells Certified Dealer"]
  website             String?

  // Onboarding progress
  onboardingStep      Int          @default(1)   // 1-7
  profileComplete     Boolean      @default(false)

  // Verification
  status              DealerStatus @default(PENDING_VERIFICATION)
  verificationNotes   String?      @db.Text
  verifiedAt          DateTime?
  verifiedBy          String?
  rejectionReason     String?      @db.Text

  // Performance metrics (denormalized for fast dashboard reads)
  totalRFQsReceived      Int       @default(0)
  totalQuotesSubmitted   Int       @default(0)
  totalConversions       Int       @default(0)
  conversionRate         Float     @default(0)   // 0.0 - 1.0
  avgResponseTime        Int?      // Minutes

  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  // Relations
  brandMappings       DealerBrandMapping[]
  categoryMappings    DealerCategoryMapping[]
  serviceAreas        DealerServiceArea[]
  quotes              Quote[]
  reviews             DealerReview[]
  inquiryResponses    InquiryDealerResponse[]
  conversations       ConversationParticipant[]
  messages            Message[]
  subscriptions       DealerSubscription[]
  payments            Payment[]
  dealerScore         DealerScore?

  @@index([email])               // Login lookup
  @@index([gstNumber])           // GST verification / dedup
  @@index([city])                // City-based matching
  @@index([status])              // Filter by verification status
  @@index([dealerType])          // Filter by type
  @@index([conversionRate])      // Sort by performance
  @@index([createdAt])           // Sort by registration date
}
```

```typescript
interface Dealer {
  id: string;
  email: string;
  password: string | null;
  businessName: string;
  ownerName: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  dealerType: DealerType;
  yearsInOperation: number | null;
  gstDocument: string | null;
  panDocument: string | null;
  shopLicense: string | null;
  cancelledCheque: string | null;
  shopPhoto: string | null;
  shopImages: string[];
  brandAuthProofs: string[];
  description: string | null;
  establishedYear: number | null;
  certifications: string[];
  website: string | null;
  onboardingStep: number;
  profileComplete: boolean;
  status: DealerStatus;
  verificationNotes: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  totalRFQsReceived: number;
  totalQuotesSubmitted: number;
  totalConversions: number;
  conversionRate: number;
  avgResponseTime: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 10: DealerBrandMapping

```prisma
model DealerBrandMapping {
  id           String  @id @default(uuid())
  dealerId     String
  brandId      String
  authProofUrl String? // S3 key to authorization document
  isVerified   Boolean @default(false)

  dealer       Dealer  @relation(fields: [dealerId], references: [id], onDelete: Cascade)
  brand        Brand   @relation(fields: [brandId], references: [id], onDelete: Cascade)

  createdAt    DateTime @default(now())

  @@unique([dealerId, brandId])    // One mapping per dealer-brand pair
  @@index([dealerId])              // All brands for a dealer
  @@index([brandId])               // All dealers for a brand
}
```

```typescript
interface DealerBrandMapping {
  id: string;
  dealerId: string;
  brandId: string;
  authProofUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
}
```

#### Model 11: DealerCategoryMapping

```prisma
model DealerCategoryMapping {
  id         String   @id @default(uuid())
  dealerId   String
  categoryId String

  dealer     Dealer   @relation(fields: [dealerId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now())

  @@unique([dealerId, categoryId])  // One mapping per dealer-category pair
  @@index([dealerId])               // All categories for a dealer
  @@index([categoryId])             // All dealers for a category
}
```

```typescript
interface DealerCategoryMapping {
  id: string;
  dealerId: string;
  categoryId: string;
  createdAt: Date;
}
```

#### Model 12: DealerServiceArea

```prisma
model DealerServiceArea {
  id       String   @id @default(uuid())
  dealerId String
  pincode  String

  dealer   Dealer   @relation(fields: [dealerId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([dealerId, pincode])  // One entry per dealer-pincode pair
  @@index([pincode])             // Find dealers serving a pincode
}
```

```typescript
interface DealerServiceArea {
  id: string;
  dealerId: string;
  pincode: string;
  createdAt: Date;
}
```

#### Model 13: DealerReview

```prisma
model DealerReview {
  id       String  @id @default(uuid())
  dealerId String
  userId   String
  rfqId    String  // Tied to a completed RFQ -- verified purchase only
  rating   Int     // 1-5 (enforced by Zod, not DB constraint)
  comment  String? @db.Text

  dealer   Dealer  @relation(fields: [dealerId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, rfqId])      // One review per user per RFQ
  @@index([dealerId])            // All reviews for a dealer
  @@index([rfqId])               // Review for a specific RFQ
  @@index([rating])              // Filter by rating
}
```

```typescript
interface DealerReview {
  id: string;
  dealerId: string;
  userId: string;
  rfqId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}
```

#### Model 14: DealerScore

```prisma
model DealerScore {
  id       String @id @default(uuid())
  dealerId String @unique

  // Composite score components (0.0 - 5.0 each)
  priceCompetitiveness  Float @default(0)  // How competitive are their quotes vs market
  responseSpeed         Float @default(0)  // Average response time score
  deliveryReliability   Float @default(0)  // On-time delivery rate
  communicationQuality  Float @default(0)  // Based on buyer ratings
  disputeResolution     Float @default(0)  // Dispute outcome score

  // Weights (sum = 1.0) -- tunable
  priceWeight           Float @default(0.30)
  responseWeight        Float @default(0.25)
  deliveryWeight        Float @default(0.20)
  communicationWeight   Float @default(0.15)
  disputeWeight         Float @default(0.10)

  // Computed composite
  compositeScore        Float @default(0)  // Weighted average of above

  // Tier derived from composite score
  tier                  String @default("BRONZE") // "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

  // Stats
  totalTransactions     Int    @default(0)
  totalReviews          Int    @default(0)
  lastCalculatedAt      DateTime?

  dealer   Dealer @relation(fields: [dealerId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([compositeScore])  // Sort dealers by score
  @@index([tier])            // Filter by tier
}
```

```typescript
interface DealerScore {
  id: string;
  dealerId: string;
  priceCompetitiveness: number;
  responseSpeed: number;
  deliveryReliability: number;
  communicationQuality: number;
  disputeResolution: number;
  priceWeight: number;
  responseWeight: number;
  deliveryWeight: number;
  communicationWeight: number;
  disputeWeight: number;
  compositeScore: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalTransactions: number;
  totalReviews: number;
  lastCalculatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 15: DealerSubscription

```prisma
model DealerSubscription {
  id                String             @id @default(uuid())
  dealerId          String
  planId            String

  status            SubscriptionStatus @default(ACTIVE)

  // Billing period
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime

  // Razorpay subscription
  razorpaySubscriptionId String?  @unique
  razorpayPlanId         String?

  // Usage tracking
  leadsUsedThisPeriod    Int       @default(0)
  leadsLimit             Int                        // From plan

  cancelledAt            DateTime?
  cancelReason           String?

  dealer                 Dealer    @relation(fields: [dealerId], references: [id], onDelete: Cascade)
  plan                   SubscriptionPlan @relation(fields: [planId], references: [id])

  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  @@index([dealerId])              // All subscriptions for a dealer
  @@index([status])                // Filter active subscriptions
  @@index([currentPeriodEnd])      // Find expiring subscriptions
  @@index([razorpaySubscriptionId]) // Razorpay webhook lookup
}
```

```typescript
interface DealerSubscription {
  id: string;
  dealerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  razorpaySubscriptionId: string | null;
  razorpayPlanId: string | null;
  leadsUsedThisPeriod: number;
  leadsLimit: number;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 16: SubscriptionPlan

```prisma
model SubscriptionPlan {
  id                String   @id @default(uuid())
  name              String   @unique  // "starter" | "growth" | "premium" | "enterprise"
  displayName       String            // "Starter" | "Growth" | "Premium" | "Enterprise"

  // Pricing (INR, paisa for Razorpay compatibility)
  monthlyPricePaisa Int               // 99900 = Rs 999
  annualPricePaisa  Int               // 999000 = Rs 9,990

  // Limits
  leadsPerMonth     Int               // 10, 30, 75, -1 for unlimited
  quotesPerMonth    Int               // 20, 60, 150, -1 for unlimited

  // Features (JSON array of feature keys)
  features          String[] // ["basic_profile", "manual_quoting", "city_visibility", ...]

  // Razorpay plan IDs
  razorpayMonthlyPlanId String?
  razorpayAnnualPlanId  String?

  isActive          Boolean  @default(true)
  sortOrder         Int      @default(0)

  subscriptions     DealerSubscription[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([isActive])    // Only show active plans
  @@index([sortOrder])   // Display order
}
```

```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  monthlyPricePaisa: number;
  annualPricePaisa: number;
  leadsPerMonth: number;
  quotesPerMonth: number;
  features: string[];
  razorpayMonthlyPlanId: string | null;
  razorpayAnnualPlanId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Group 3: Product Catalog (8 models)

#### Model 17: Category

```prisma
model Category {
  id               String        @id @default(uuid())
  name             String        @unique
  slug             String        @unique
  description      String?
  icon             String?       // Lucide icon name
  sortOrder        Int           @default(0)
  isActive         Boolean       @default(true)

  // SEO & Education
  seoTitle         String?
  seoDescription   String?
  whatIsIt         String?       @db.Text
  whereUsed        String?       @db.Text
  whyQualityMatters String?     @db.Text
  commonMistakes   String?       @db.Text

  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  // Relations
  subCategories    SubCategory[]
  dealerMappings   DealerCategoryMapping[]
  inquiries        ProductInquiry[]

  @@index([slug])        // URL-based lookup
  @@index([isActive])    // Filter active categories
  @@index([sortOrder])   // Display order
}
```

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  whatIsIt: string | null;
  whereUsed: string | null;
  whyQualityMatters: string | null;
  commonMistakes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 18: SubCategory

```prisma
model SubCategory {
  id          String       @id @default(uuid())
  categoryId  String
  name        String
  slug        String
  description String?
  sortOrder   Int          @default(0)
  isActive    Boolean      @default(true)

  category    Category     @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  productTypes ProductType[]

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([categoryId, slug])  // Slug unique within category
  @@index([slug])               // URL-based lookup
  @@index([categoryId])         // All subcategories for a category
}
```

```typescript
interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 19: ProductType

```prisma
model ProductType {
  id            String       @id @default(uuid())
  subCategoryId String
  name          String
  slug          String
  description   String?
  technicalInfo String?      @db.Text // JSON with technical details
  useCases      String?      @db.Text // JSON array
  sortOrder     Int          @default(0)
  isActive      Boolean      @default(true)

  subCategory   SubCategory  @relation(fields: [subCategoryId], references: [id], onDelete: Cascade)
  products      Product[]

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@unique([subCategoryId, slug])  // Slug unique within subcategory
  @@index([slug])                  // URL-based lookup
  @@index([subCategoryId])         // All types for a subcategory
}
```

```typescript
interface ProductType {
  id: string;
  subCategoryId: string;
  name: string;
  slug: string;
  description: string | null;
  technicalInfo: string | null;
  useCases: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 20: Brand

```prisma
model Brand {
  id            String   @id @default(uuid())
  name          String   @unique
  slug          String   @unique
  logo          String?  // S3 key (NOT "logoUrl" -- see Prisma schema notes in MEMORY.md)
  description   String?  @db.Text
  website       String?
  isActive      Boolean  @default(true)
  isPremium     Boolean  @default(false)

  priceSegment  String?  // "Budget" | "Mid-range" | "Premium"
  qualityRating Float?   // 1.0 - 5.0

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  products          Product[]
  dealerMappings    DealerBrandMapping[]
  brandDealers      BrandDealer[]
  identifiedInquiries ProductInquiry[]

  @@index([slug])          // URL-based lookup
  @@index([isActive])      // Filter active brands
  @@index([priceSegment])  // Filter by segment
}
```

```typescript
interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
  isPremium: boolean;
  priceSegment: string | null;
  qualityRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 21: Product

```prisma
model Product {
  id             String      @id @default(uuid())
  productTypeId  String
  brandId        String
  name           String
  modelNumber    String?
  sku            String?     @unique
  description    String?     @db.Text

  // Technical specifications (JSON -- typed by product type)
  specifications String?     @db.Text

  // Media (S3 keys)
  images         String[]
  datasheetUrl   String?
  manualUrl      String?

  // Compliance & Warranty
  certifications String[]    // ["ISI", "IEC 60898", "BIS"]
  warrantyYears  Int?

  // Pricing (not dealer-specific -- market reference)
  mrp            Float?      // Maximum Retail Price
  typicalDealerPrice Float?  // Typical dealer price (from price data points)

  // Search
  embedding      Float[]     // 1536-dim vector from text-embedding-3-small (stored via pgvector)

  isActive       Boolean     @default(true)

  productType    ProductType @relation(fields: [productTypeId], references: [id], onDelete: Cascade)
  brand          Brand       @relation(fields: [brandId], references: [id], onDelete: Cascade)

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  // Relations
  rfqItems       RFQItem[]
  savedProducts  SavedProduct[]
  priceDataPoints PriceDataPoint[]

  @@index([brandId])              // All products for a brand
  @@index([productTypeId])        // All products for a type
  @@index([sku])                  // SKU lookup
  @@index([modelNumber])          // Model number search
  @@index([isActive])             // Filter active products
  @@index([mrp])                  // Price range filtering
  @@index([createdAt])            // Newest products
}
```

```typescript
interface Product {
  id: string;
  productTypeId: string;
  brandId: string;
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
  mrp: number | null;
  typicalDealerPrice: number | null;
  embedding: number[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 22: PriceDataPoint

```prisma
model PriceDataPoint {
  id         String   @id @default(uuid())
  productId  String
  dealerId   String?  // Null for market/scraped prices

  price      Float    // INR per unit
  quantity   Int      @default(1) // Quantity this price applies to
  city       String
  source     String   // "rfq_quote" | "inquiry_response" | "scraped" | "manual"
  isVerified Boolean  @default(false)

  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  recordedAt DateTime @default(now()) // When this price was observed

  @@index([productId])                // All prices for a product
  @@index([productId, city])          // Prices by product and city
  @@index([productId, recordedAt])    // Price history over time
  @@index([city])                     // Prices by city (market analysis)
  @@index([recordedAt])               // Temporal queries
}
```

```typescript
interface PriceDataPoint {
  id: string;
  productId: string;
  dealerId: string | null;
  price: number;
  quantity: number;
  city: string;
  source: string;
  isVerified: boolean;
  recordedAt: Date;
}
```

#### Model 23: PriceTrend

```prisma
model PriceTrend {
  id          String @id @default(uuid())
  productId   String
  city        String

  // Aggregated metrics (computed daily by cron job)
  avgPrice    Float    // Average price across all data points
  minPrice    Float
  maxPrice    Float
  medianPrice Float
  dataPoints  Int      // Number of data points used

  // Trend direction
  trendDirection String // "up" | "down" | "stable"
  trendPercent   Float  // Percentage change from previous period

  periodStart DateTime
  periodEnd   DateTime
  periodType  String   // "daily" | "weekly" | "monthly"

  createdAt   DateTime @default(now())

  @@unique([productId, city, periodStart, periodType])  // One trend per product-city-period
  @@index([productId, city])                             // Trends for a product in a city
  @@index([periodStart])                                 // Temporal queries
  @@index([trendDirection])                              // Filter by trend
}
```

```typescript
interface PriceTrend {
  id: string;
  productId: string;
  city: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  dataPoints: number;
  trendDirection: 'up' | 'down' | 'stable';
  trendPercent: number;
  periodStart: Date;
  periodEnd: Date;
  periodType: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
}
```

#### Model 24: SavedProduct

```prisma
model SavedProduct {
  id        String  @id @default(uuid())
  userId    String
  productId String
  notes     String? @db.Text

  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, productId])  // One save per user-product
  @@index([userId])              // All saves for a user
}
```

```typescript
interface SavedProduct {
  id: string;
  userId: string;
  productId: string;
  notes: string | null;
  createdAt: Date;
}
```

---

### Group 4: Inquiry System (3 models)

#### Model 25: ProductInquiry

```prisma
model ProductInquiry {
  id                String    @id @default(uuid())
  inquiryNumber     String?   @unique // HUB-HAVELLS-MCB-0001 (auto-generated)
  name              String
  phone             String
  email             String?
  productPhoto      String?   // S3 key
  modelNumber       String?
  quantity          Int       @default(1)
  deliveryCity      String
  notes             String?   @db.Text

  // Status tracking
  status            String    @default("new") // "new" | "contacted" | "quoted" | "closed"
  assignedTo        String?   // Admin ID
  internalNotes     String?   @db.Text

  // Admin response (quote sent back to user)
  quotedPrice       Float?
  shippingCost      Float?
  totalPrice        Float?
  estimatedDelivery String?
  responseNotes     String?   @db.Text
  respondedAt       DateTime?
  respondedBy       String?

  // Category identification
  categoryId        String?
  identifiedBrandId String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  pipeline          InquiryPipeline?
  category          Category?  @relation(fields: [categoryId], references: [id])
  identifiedBrand   Brand?     @relation(fields: [identifiedBrandId], references: [id])
  dealerResponses   InquiryDealerResponse[]

  @@index([status])                // Filter by status
  @@index([phone])                 // Lookup by phone
  @@index([createdAt])             // Sort by date
  @@index([inquiryNumber])         // Lookup by inquiry number
  @@index([categoryId])            // Filter by category
  @@index([deliveryCity])          // Filter by city
}
```

```typescript
interface ProductInquiry {
  id: string;
  inquiryNumber: string | null;
  name: string;
  phone: string;
  email: string | null;
  productPhoto: string | null;
  modelNumber: string | null;
  quantity: number;
  deliveryCity: string;
  notes: string | null;
  status: string;
  assignedTo: string | null;
  internalNotes: string | null;
  quotedPrice: number | null;
  shippingCost: number | null;
  totalPrice: number | null;
  estimatedDelivery: string | null;
  responseNotes: string | null;
  respondedAt: Date | null;
  respondedBy: string | null;
  categoryId: string | null;
  identifiedBrandId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 26: InquiryPipeline

```prisma
model InquiryPipeline {
  id                  String          @id @default(uuid())
  inquiryId           String          @unique
  inquiry             ProductInquiry  @relation(fields: [inquiryId], references: [id], onDelete: Cascade)

  identifiedBrandId   String?
  identifiedBrand     String?
  identifiedProduct   String?
  identifiedCategory  String?

  status              PipelineStatus  @default(BRAND_IDENTIFIED)

  aiAnalysis          String?         @db.Text // JSON: brand confidence, product details, WhatsApp template

  sentToCustomerAt    DateTime?
  sentVia             String?
  customerMessage     String?         @db.Text

  createdBy           String?

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  dealerQuotes        InquiryDealerQuote[]

  @@index([status])                   // Filter by pipeline status
  @@index([identifiedBrandId])        // Filter by brand
  @@index([createdAt])                // Sort by date
}
```

```typescript
interface InquiryPipeline {
  id: string;
  inquiryId: string;
  identifiedBrandId: string | null;
  identifiedBrand: string | null;
  identifiedProduct: string | null;
  identifiedCategory: string | null;
  status: PipelineStatus;
  aiAnalysis: string | null;
  sentToCustomerAt: Date | null;
  sentVia: string | null;
  customerMessage: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 27: InquiryDealerResponse

```prisma
model InquiryDealerResponse {
  id                String    @id @default(uuid())
  inquiryId         String
  dealerId          String

  status            String    @default("pending") // "pending" | "viewed" | "quoted" | "declined"
  quotedPrice       Float?
  shippingCost      Float?    @default(0)
  totalPrice        Float?
  estimatedDelivery String?
  notes             String?   @db.Text

  viewedAt          DateTime?
  respondedAt       DateTime?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  inquiry           ProductInquiry @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
  dealer            Dealer         @relation(fields: [dealerId], references: [id], onDelete: Cascade)

  @@unique([inquiryId, dealerId])  // One response per dealer per inquiry
  @@index([inquiryId])             // All responses for an inquiry
  @@index([dealerId])              // All responses by a dealer
  @@index([status])                // Filter by response status
}
```

```typescript
interface InquiryDealerResponse {
  id: string;
  inquiryId: string;
  dealerId: string;
  status: string;
  quotedPrice: number | null;
  shippingCost: number | null;
  totalPrice: number | null;
  estimatedDelivery: string | null;
  notes: string | null;
  viewedAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Group 5: RFQ & Quotes (4 models)

#### Model 28: RFQ

```prisma
model RFQ {
  id                String    @id @default(uuid())
  userId            String
  title             String
  description       String?   @db.Text

  deliveryCity      String
  deliveryPincode   String
  deliveryAddress   String?   @db.Text
  estimatedDate     DateTime?

  deliveryPreference String   // "delivery" | "pickup" | "both"
  urgency           String?   // "normal" | "urgent"

  status            RFQStatus @default(DRAFT)
  publishedAt       DateTime?
  selectedDealerId  String?
  selectedQuoteId   String?
  completedAt       DateTime?

  aiSuggestions     String?   @db.Text // JSON with AI suggestions
  aiFlags           String?   @db.Text // JSON with warnings/flags

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  items             RFQItem[]
  quotes            Quote[]

  @@index([userId])            // All RFQs for a user
  @@index([status])            // Filter by status
  @@index([deliveryPincode])   // Location-based matching
  @@index([publishedAt])       // Sort by publish date
  @@index([deliveryCity])      // City-based filtering
  @@index([createdAt])         // Sort by creation date
}
```

```typescript
interface RFQ {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryAddress: string | null;
  estimatedDate: Date | null;
  deliveryPreference: string;
  urgency: string | null;
  status: RFQStatus;
  publishedAt: Date | null;
  selectedDealerId: string | null;
  selectedQuoteId: string | null;
  completedAt: Date | null;
  aiSuggestions: string | null;
  aiFlags: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 29: RFQItem

```prisma
model RFQItem {
  id        String  @id @default(uuid())
  rfqId     String
  productId String
  quantity  Int
  notes     String? @db.Text

  rfq       RFQ     @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([rfqId])       // All items for an RFQ
  @@index([productId])   // All RFQs containing a product
}
```

```typescript
interface RFQItem {
  id: string;
  rfqId: string;
  productId: string;
  quantity: number;
  notes: string | null;
  createdAt: Date;
}
```

#### Model 30: Quote

```prisma
model Quote {
  id             String      @id @default(uuid())
  rfqId          String
  dealerId       String

  totalAmount    Float
  shippingCost   Float       @default(0)
  notes          String?     @db.Text

  deliveryDate   DateTime?
  pickupDate     DateTime?
  validUntil     DateTime

  status         QuoteStatus @default(SUBMITTED)

  submittedAt    DateTime    @default(now())
  viewedAt       DateTime?
  selectedAt     DateTime?

  lossReason     String?     // "price" | "timing" | "distance" | "trust"
  rankPosition   Int?

  rfq            RFQ         @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  dealer         Dealer      @relation(fields: [dealerId], references: [id], onDelete: Cascade)

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  items          QuoteItem[]

  @@unique([rfqId, dealerId])  // One quote per dealer per RFQ
  @@index([rfqId])             // All quotes for an RFQ
  @@index([dealerId])          // All quotes by a dealer
  @@index([status])            // Filter by status
  @@index([totalAmount])       // Sort by price
}
```

```typescript
interface Quote {
  id: string;
  rfqId: string;
  dealerId: string;
  totalAmount: number;
  shippingCost: number;
  notes: string | null;
  deliveryDate: Date | null;
  pickupDate: Date | null;
  validUntil: Date;
  status: QuoteStatus;
  submittedAt: Date;
  viewedAt: Date | null;
  selectedAt: Date | null;
  lossReason: string | null;
  rankPosition: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 31: QuoteItem

```prisma
model QuoteItem {
  id         String @id @default(uuid())
  quoteId    String
  productId  String
  quantity   Int
  unitPrice  Float
  totalPrice Float

  quote      Quote  @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now())

  @@index([quoteId])  // All items for a quote
}
```

```typescript
interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}
```

---

### Group 6: Messaging (3 models -- NEW)

These models replace the 100% mock messaging system (CRIT-08).

#### Model 32: Conversation

```prisma
model Conversation {
  id           String    @id @default(uuid())

  // Context: what this conversation is about
  contextType  String?   // "rfq" | "inquiry" | "general" | "support"
  contextId    String?   // RFQ ID, Inquiry ID, etc.

  // Metadata
  title        String?   // Auto-generated: "RFQ #123 Discussion" or "General Inquiry"
  isArchived   Boolean   @default(false)
  lastMessageAt DateTime?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  participants ConversationParticipant[]
  messages     Message[]

  @@index([contextType, contextId])  // Find conversation for an RFQ/inquiry
  @@index([lastMessageAt])           // Sort by recent activity
  @@index([isArchived])              // Filter archived
}
```

```typescript
interface Conversation {
  id: string;
  contextType: string | null;
  contextId: string | null;
  title: string | null;
  isArchived: boolean;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 33: ConversationParticipant

```prisma
model ConversationParticipant {
  id              String   @id @default(uuid())
  conversationId  String
  userId          String?  // Null if dealer
  dealerId        String?  // Null if user

  // Read tracking
  lastReadAt      DateTime?
  unreadCount     Int      @default(0)

  // Mute
  isMuted         Boolean  @default(false)

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user            User?        @relation(fields: [userId], references: [id], onDelete: Cascade)
  dealer          Dealer?      @relation(fields: [dealerId], references: [id], onDelete: Cascade)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([conversationId, userId])    // One participation per user per conversation
  @@unique([conversationId, dealerId])  // One participation per dealer per conversation
  @@index([userId])                     // All conversations for a user
  @@index([dealerId])                   // All conversations for a dealer
  @@index([conversationId])             // All participants in a conversation
}
```

```typescript
interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string | null;
  dealerId: string | null;
  lastReadAt: Date | null;
  unreadCount: number;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 34: Message

```prisma
model Message {
  id              String      @id @default(uuid())
  conversationId  String

  // Sender (one of these is set, the other is null)
  senderUserId    String?
  senderDealerId  String?
  isSystem        Boolean     @default(false) // True for system messages

  type            MessageType @default(TEXT)
  content         String      @db.Text
  metadata        String?     @db.Text // JSON: image URL, tool result data, etc.

  // Edit tracking
  isEdited        Boolean     @default(false)
  editedAt        DateTime?

  // Deletion (soft delete for messages)
  isDeleted       Boolean     @default(false)
  deletedAt       DateTime?

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderUser      User?        @relation(fields: [senderUserId], references: [id], onDelete: SetNull)
  senderDealer    Dealer?      @relation(fields: [senderDealerId], references: [id], onDelete: SetNull)

  createdAt       DateTime    @default(now())

  @@index([conversationId])            // All messages in a conversation
  @@index([conversationId, createdAt]) // Messages in order (pagination)
  @@index([senderUserId])              // All messages by a user
  @@index([senderDealerId])            // All messages by a dealer
}
```

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderUserId: string | null;
  senderDealerId: string | null;
  isSystem: boolean;
  type: MessageType;
  content: string;
  metadata: string | null;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
}
```

---

### Group 7: Community (4 models)

#### Model 35: CommunityPost

```prisma
model CommunityPost {
  id       String     @id @default(uuid())
  userId   String
  title    String
  content  String     @db.Text
  city     String?
  category String?    // "discussion" | "question" | "showcase" | "tip"
  tags     String[]

  upvotes  Int        @default(0)
  status   PostStatus @default(PUBLISHED)

  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  comments CommunityComment[]
  votes    CommunityVote[]

  @@index([userId])     // All posts by a user
  @@index([city])       // Filter by city
  @@index([status])     // Filter published posts
  @@index([createdAt])  // Sort by date
  @@index([upvotes])    // Sort by popularity
  @@index([category])   // Filter by category
}
```

```typescript
interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  city: string | null;
  category: string | null;
  tags: string[];
  upvotes: number;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 36: CommunityComment

```prisma
model CommunityComment {
  id       String            @id @default(uuid())
  postId   String
  userId   String
  content  String            @db.Text
  parentId String?           // Self-referencing for nested comments

  upvotes  Int               @default(0)

  post     CommunityPost     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent   CommunityComment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies  CommunityComment[] @relation("CommentReplies")
  votes    CommunityVote[]

  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@index([postId])    // All comments for a post
  @@index([userId])    // All comments by a user
  @@index([parentId])  // All replies to a comment
}
```

```typescript
interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId: string | null;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 37: CommunityVote

```prisma
model CommunityVote {
  id        String   @id @default(uuid())
  userId    String
  postId    String?
  commentId String?

  value     Int      // +1 or -1

  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      CommunityPost?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment   CommunityComment? @relation(fields: [commentId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, postId])     // One vote per user per post (fixes HIGH-17)
  @@unique([userId, commentId])  // One vote per user per comment
  @@index([postId])              // All votes for a post
  @@index([commentId])           // All votes for a comment
}
```

```typescript
interface CommunityVote {
  id: string;
  userId: string;
  postId: string | null;
  commentId: string | null;
  value: number;
  createdAt: Date;
}
```

#### Model 38: KnowledgeArticle

```prisma
model KnowledgeArticle {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  content         String    @db.Text
  category        String
  tags            String[]

  metaTitle       String?
  metaDescription String?
  coverImage      String?   // S3 key

  views           Int       @default(0)
  isPublished     Boolean   @default(false)

  authorId        String    // Admin ID

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  publishedAt     DateTime?

  @@index([slug])           // URL-based lookup
  @@index([category])       // Filter by category
  @@index([isPublished])    // Filter published articles
  @@index([views])          // Sort by popularity
}
```

```typescript
interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  coverImage: string | null;
  views: number;
  isPublished: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}
```

---

### Group 8: Chat & AI (2 models)

#### Model 39: ChatSession

```prisma
model ChatSession {
  id           String    @id @default(uuid())
  userId       String?
  userEmail    String?
  userName     String?

  title        String?   // Auto-generated from first message
  status       String    @default("active") // "active" | "closed"

  // Token budget tracking
  totalInputTokens  Int  @default(0)
  totalOutputTokens Int  @default(0)

  messageCount  Int      @default(0)
  lastMessageAt DateTime?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  messages     ChatMessage[]

  @@index([userId])      // All sessions for a user
  @@index([userEmail])   // Sessions for anonymous users
  @@index([createdAt])   // Sort by date
  @@index([status])      // Filter active sessions
}
```

```typescript
interface ChatSession {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  title: string | null;
  status: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 40: ChatMessage

```prisma
model ChatMessage {
  id        String      @id @default(uuid())
  sessionId String

  role      String      // "user" | "assistant" | "system" | "tool"
  content   String      @db.Text

  // AI metadata
  model       String?   // "claude-sonnet-4-20250514" | "claude-haiku-4-5-20251001"
  inputTokens  Int?
  outputTokens Int?
  toolCalls   String?   @db.Text // JSON array of tool calls
  toolResults String?   @db.Text // JSON array of tool results

  session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  createdAt DateTime    @default(now())

  @@index([sessionId])           // All messages for a session
  @@index([sessionId, createdAt]) // Messages in order
  @@index([createdAt])           // Temporal queries
}
```

```typescript
interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  toolCalls: string | null;
  toolResults: string | null;
  createdAt: Date;
}
```

---

### Group 9: CRM (6 models)

#### Model 41: CRMCompany

```prisma
model CRMCompany {
  id                String         @id @default(uuid())
  name              String
  slug              String         @unique
  type              CompanyType    @default(MANUFACTURER)
  segment           CompanySegment @default(ALL_SEGMENTS)

  website           String?
  email             String?
  phone             String?
  linkedIn          String?

  address           String?
  city              String?
  state             String?
  country           String         @default("India")

  description       String?        @db.Text
  productCategories String[]
  yearEstablished   Int?
  employeeCount     String?
  annualRevenue     String?

  hasApi            Boolean        @default(false)
  digitalMaturity   String?
  dealerNetworkSize String?

  status            String         @default("prospect")
  priority          String         @default("medium")
  tags              String[]

  notes             String?        @db.Text

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  contacts          CRMContact[]
  outreaches        CRMOutreach[]

  @@index([status])     // Filter by pipeline status
  @@index([type])       // Filter by company type
  @@index([segment])    // Filter by segment
  @@index([city])       // Filter by city
  @@index([priority])   // Sort by priority
}
```

```typescript
interface CRMCompany {
  id: string;
  name: string;
  slug: string;
  type: CompanyType;
  segment: CompanySegment;
  website: string | null;
  email: string | null;
  phone: string | null;
  linkedIn: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  description: string | null;
  productCategories: string[];
  yearEstablished: number | null;
  employeeCount: string | null;
  annualRevenue: string | null;
  hasApi: boolean;
  digitalMaturity: string | null;
  dealerNetworkSize: string | null;
  status: string;
  priority: string;
  tags: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 42: CRMContact

```prisma
model CRMContact {
  id            String     @id @default(uuid())
  companyId     String
  company       CRMCompany @relation(fields: [companyId], references: [id], onDelete: Cascade)

  name          String
  email         String?
  phone         String?
  linkedIn      String?

  designation   String?
  department    String?
  decisionMaker Boolean    @default(false)
  isPrimary     Boolean    @default(false)

  status        String     @default("active") // "active" | "left_company" | "do_not_contact"
  notes         String?    @db.Text

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  outreaches    CRMOutreach[]

  @@index([companyId])     // All contacts for a company
  @@index([email])         // Lookup by email
  @@index([designation])   // Filter by role
}
```

```typescript
interface CRMContact {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  phone: string | null;
  linkedIn: string | null;
  designation: string | null;
  department: string | null;
  decisionMaker: boolean;
  isPrimary: boolean;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 43: CRMOutreach

```prisma
model CRMOutreach {
  id                String         @id @default(uuid())
  companyId         String
  contactId         String?
  company           CRMCompany     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  contact           CRMContact?    @relation(fields: [contactId], references: [id], onDelete: SetNull)

  type              OutreachType   @default(EMAIL)
  subject           String?
  content           String         @db.Text
  templateUsed      String?

  scheduledAt       DateTime?
  sentAt            DateTime?

  status            OutreachStatus @default(SCHEDULED)
  openedAt          DateTime?
  repliedAt         DateTime?

  responseContent   String?        @db.Text
  responseSentiment String?

  followUpDate      DateTime?
  followUpNumber    Int            @default(1)

  notes             String?        @db.Text

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@index([companyId])    // All outreaches for a company
  @@index([contactId])    // All outreaches to a contact
  @@index([status])       // Filter by status
  @@index([scheduledAt])  // Upcoming outreaches
  @@index([type])         // Filter by type
}
```

```typescript
interface CRMOutreach {
  id: string;
  companyId: string;
  contactId: string | null;
  type: OutreachType;
  subject: string | null;
  content: string;
  templateUsed: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  status: OutreachStatus;
  openedAt: Date | null;
  repliedAt: Date | null;
  responseContent: string | null;
  responseSentiment: string | null;
  followUpDate: Date | null;
  followUpNumber: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 44: CRMMeeting

```prisma
model CRMMeeting {
  id           String   @id @default(uuid())
  companyId    String
  title        String
  description  String?  @db.Text

  scheduledAt  DateTime
  duration     Int      @default(30) // minutes
  meetingLink  String?
  location     String?

  attendees    String?  @db.Text // JSON array of {name, email, role}

  status       String   @default("scheduled") // "scheduled" | "completed" | "cancelled" | "rescheduled"

  agenda       String?  @db.Text
  notes        String?  @db.Text
  outcome      String?  // "positive" | "follow_up_needed" | "not_interested"
  nextSteps    String?  @db.Text

  reminders    String?  // JSON array of reminder times

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([companyId])    // All meetings for a company
  @@index([scheduledAt])  // Upcoming meetings
  @@index([status])       // Filter by status
}
```

```typescript
interface CRMMeeting {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  duration: number;
  meetingLink: string | null;
  location: string | null;
  attendees: string | null;
  status: string;
  agenda: string | null;
  notes: string | null;
  outcome: string | null;
  nextSteps: string | null;
  reminders: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 45: CRMPipelineStage

```prisma
model CRMPipelineStage {
  id          String  @id @default(uuid())
  name        String  @unique
  displayName String
  color       String  // Hex color
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([sortOrder])  // Display order
}
```

```typescript
interface CRMPipelineStage {
  id: string;
  name: string;
  displayName: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 46: EmailTemplate

```prisma
model EmailTemplate {
  id           String   @id @default(uuid())
  name         String   @unique
  subject      String
  body         String   @db.Text
  category     String   // "outreach" | "follow_up" | "partnership" | "notification" | "transactional"
  placeholders String[]
  isActive     Boolean  @default(true)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([category])   // Filter by category
}
```

```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  placeholders: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Group 10: Payment & Invoicing (2 models -- NEW)

These models implement the revenue system (CRIT-07, CRIT-22).

#### Model 47: Payment

```prisma
model Payment {
  id                 String        @id @default(uuid())

  // Payer
  userId             String?       // Null if dealer payment
  dealerId           String?       // Null if user payment

  // Amount
  amountPaisa        Int           // Amount in paisa (Rs 999 = 99900)
  currency           String        @default("INR")
  description        String

  // Context
  paymentFor         String        // "subscription" | "lead_pack" | "transaction_fee"
  referenceId        String?       // Subscription ID, RFQ ID, etc.
  referenceType      String?       // "dealer_subscription" | "rfq" | "lead_pack"

  // Razorpay
  razorpayOrderId    String?       @unique
  razorpayPaymentId  String?       @unique
  razorpaySignature  String?

  // Status
  status             PaymentStatus @default(PENDING)
  failureReason      String?

  // Metadata
  method             String?       // "upi" | "card" | "netbanking" | "wallet"
  bank               String?       // Bank name if netbanking
  vpa                String?       // UPI VPA if UPI

  // Timestamps
  paidAt             DateTime?
  refundedAt         DateTime?
  refundAmountPaisa  Int?

  user               User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  dealer             Dealer?       @relation(fields: [dealerId], references: [id], onDelete: SetNull)
  invoice            Invoice?

  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  @@index([userId])                // All payments by a user
  @@index([dealerId])              // All payments by a dealer
  @@index([razorpayOrderId])       // Razorpay webhook lookup
  @@index([razorpayPaymentId])     // Razorpay lookup
  @@index([status])                // Filter by status
  @@index([paymentFor])            // Filter by type
  @@index([createdAt])             // Sort by date
}
```

```typescript
interface Payment {
  id: string;
  userId: string | null;
  dealerId: string | null;
  amountPaisa: number;
  currency: string;
  description: string;
  paymentFor: string;
  referenceId: string | null;
  referenceType: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  status: PaymentStatus;
  failureReason: string | null;
  method: string | null;
  bank: string | null;
  vpa: string | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  refundAmountPaisa: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 48: Invoice

```prisma
model Invoice {
  id             String   @id @default(uuid())
  paymentId      String   @unique
  invoiceNumber  String   @unique // H4E-INV-2026-0001

  // GST details
  supplierGst    String   // Hub4Estate GST
  buyerGst       String?  // Dealer GST (if B2B)
  buyerName      String
  buyerAddress   String?  @db.Text
  buyerState     String
  buyerPincode   String?

  // Line items (JSON array)
  lineItems      String   @db.Text // JSON: [{description, qty, unitPrice, taxRate, taxAmount, total}]

  // Totals
  subtotalPaisa  Int
  cgstPaisa      Int      @default(0)
  sgstPaisa      Int      @default(0)
  igstPaisa      Int      @default(0)
  totalPaisa     Int

  // PDF
  pdfUrl         String?  // S3 key to generated PDF

  // Status
  status         String   @default("generated") // "generated" | "sent" | "void"

  payment        Payment  @relation(fields: [paymentId], references: [id])

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([invoiceNumber])  // Lookup by invoice number
  @@index([buyerGst])       // All invoices for a GST number
  @@index([createdAt])      // Sort by date
}
```

```typescript
interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  supplierGst: string;
  buyerGst: string | null;
  buyerName: string;
  buyerAddress: string | null;
  buyerState: string;
  buyerPincode: string | null;
  lineItems: string;
  subtotalPaisa: number;
  cgstPaisa: number;
  sgstPaisa: number;
  igstPaisa: number;
  totalPaisa: number;
  pdfUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Group 11: Scraping (5 models)

#### Model 49: ScrapeBrand

```prisma
model ScrapeBrand {
  id              String        @id @default(uuid())
  name            String        @unique
  slug            String        @unique
  website         String
  logoUrl         String?

  isActive        Boolean       @default(true)
  scrapeFrequency String        @default("weekly")
  lastScrapedAt   DateTime?
  nextScrapeAt    DateTime?

  catalogUrls     String?       @db.Text
  selectors       String?       @db.Text

  totalProducts   Int           @default(0)
  lastScrapeCount Int           @default(0)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  scrapeJobs      ScrapeJob[]
  scrapedProducts ScrapedProduct[]

  @@index([slug])       // URL-based lookup
  @@index([isActive])   // Filter active brands
}
```

```typescript
interface ScrapeBrand {
  id: string;
  name: string;
  slug: string;
  website: string;
  logoUrl: string | null;
  isActive: boolean;
  scrapeFrequency: string;
  lastScrapedAt: Date | null;
  nextScrapeAt: Date | null;
  catalogUrls: string | null;
  selectors: string | null;
  totalProducts: number;
  lastScrapeCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 50: ScrapeJob

```prisma
model ScrapeJob {
  id              String       @id @default(uuid())
  brandId         String
  brand           ScrapeBrand  @relation(fields: [brandId], references: [id], onDelete: Cascade)

  status          ScrapeStatus @default(PENDING)
  startedAt       DateTime?
  completedAt     DateTime?

  productsFound   Int          @default(0)
  productsCreated Int          @default(0)
  productsUpdated Int          @default(0)
  errors          Int          @default(0)

  logs            String?      @db.Text
  errorDetails    String?      @db.Text
  configSnapshot  String?      @db.Text

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([brandId])     // All jobs for a brand
  @@index([status])      // Filter by status
  @@index([createdAt])   // Sort by date
}
```

```typescript
interface ScrapeJob {
  id: string;
  brandId: string;
  status: ScrapeStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  errors: number;
  logs: string | null;
  errorDetails: string | null;
  configSnapshot: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 51: ScrapedProduct

```prisma
model ScrapedProduct {
  id                String       @id @default(uuid())
  brandId           String
  brand             ScrapeBrand  @relation(fields: [brandId], references: [id], onDelete: Cascade)

  sourceUrl         String       @db.Text
  scrapedAt         DateTime     @default(now())

  rawName           String
  rawCategory       String?
  rawSubCategory    String?
  rawModelNumber    String?
  rawSku            String?
  rawDescription    String?      @db.Text
  rawSpecifications String?      @db.Text
  rawImages         String[]
  rawDatasheetUrl   String?
  rawManualUrl      String?
  rawPrice          String?
  rawCertifications String[]
  rawWarranty       String?

  isProcessed       Boolean      @default(false)
  processedAt       DateTime?
  productId         String?

  isValid           Boolean      @default(true)
  validationErrors  String?      @db.Text

  contentHash       String?

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([brandId])          // All scraped products for a brand
  @@index([isProcessed])      // Filter unprocessed
  @@index([contentHash])      // Deduplication
  @@index([rawModelNumber])   // Model number matching
  @@index([sourceUrl])        // Source URL lookup
}
```

```typescript
interface ScrapedProduct {
  id: string;
  brandId: string;
  sourceUrl: string;
  scrapedAt: Date;
  rawName: string;
  rawCategory: string | null;
  rawSubCategory: string | null;
  rawModelNumber: string | null;
  rawSku: string | null;
  rawDescription: string | null;
  rawSpecifications: string | null;
  rawImages: string[];
  rawDatasheetUrl: string | null;
  rawManualUrl: string | null;
  rawPrice: string | null;
  rawCertifications: string[];
  rawWarranty: string | null;
  isProcessed: boolean;
  processedAt: Date | null;
  productId: string | null;
  isValid: boolean;
  validationErrors: string | null;
  contentHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 52: ScrapeMapping

```prisma
model ScrapeMapping {
  id                  String  @id @default(uuid())

  brandPattern        String?
  categoryPattern     String?
  namePattern         String?

  targetCategoryId    String?
  targetSubCategoryId String?
  targetProductTypeId String?

  priority            Int     @default(0)
  isActive            Boolean @default(true)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([priority])   // Higher priority checked first
  @@index([isActive])   // Filter active mappings
}
```

```typescript
interface ScrapeMapping {
  id: string;
  brandPattern: string | null;
  categoryPattern: string | null;
  namePattern: string | null;
  targetCategoryId: string | null;
  targetSubCategoryId: string | null;
  targetProductTypeId: string | null;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 53: ScrapeTemplate

```prisma
model ScrapeTemplate {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?

  selectors   String   @db.Text // JSON with CSS selectors
  brandIds    String[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

```typescript
interface ScrapeTemplate {
  id: string;
  name: string;
  description: string | null;
  selectors: string;
  brandIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Group 12: System (8 models)

#### Model 54: AuditLog

```prisma
model AuditLog {
  id          String      @id @default(uuid())
  action      AuditAction
  entityType  String      // "dealer" | "product" | "rfq" | "quote" | "payment" | "subscription" | "user" | "setting"
  entityId    String
  performedBy String      // Admin ID or system
  details     String?     @db.Text // JSON with change details

  createdAt   DateTime    @default(now())

  @@index([entityType, entityId])  // All logs for an entity
  @@index([performedBy])           // All logs by an admin
  @@index([createdAt])             // Sort by date
  @@index([action])                // Filter by action type
}
```

```typescript
interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  performedBy: string;
  details: string | null;
  createdAt: Date;
}
```

#### Model 55: FraudFlag

```prisma
model FraudFlag {
  id          String   @id @default(uuid())
  entityType  String   // "user" | "dealer" | "rfq" | "quote" | "inquiry"
  entityId    String
  flagType    String   // "duplicate_gst" | "fake_quote" | "spam_rfq" | "price_manipulation" | "shill_bid"
  severity    String   // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" (uppercase -- fixes HIGH-28)
  description String   @db.Text

  status      String   @default("OPEN") // "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE" (uppercase)

  flaggedBy   String?  // "system" or admin ID
  resolvedBy  String?
  resolvedAt  DateTime?
  resolution  String?  @db.Text // What was done

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([entityType, entityId])  // All flags for an entity
  @@index([status])                // Filter by status
  @@index([severity])              // Filter by severity
  @@index([createdAt])             // Sort by date
}
```

```typescript
interface FraudFlag {
  id: string;
  entityType: string;
  entityId: string;
  flagType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  flaggedBy: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 56: PlatformSetting

```prisma
model PlatformSetting {
  id       String @id @default(uuid())
  key      String @unique // "commission_rate" | "max_rfq_items" | "otp_expiry_minutes" | etc.
  value    String @db.Text // JSON-encoded value
  dataType String // "string" | "number" | "boolean" | "json"
  label    String // Human-readable label
  group    String // "general" | "payment" | "notification" | "ai" | "security"

  updatedBy String? // Admin ID

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([group]) // Filter by group
}
```

```typescript
interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  label: string;
  group: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 57: FeatureFlag

```prisma
model FeatureFlag {
  id          String  @id @default(uuid())
  key         String  @unique // "enable_ai_chat" | "enable_payments" | "enable_search_v2"
  enabled     Boolean @default(false)
  description String?

  // Targeting (JSON) -- null means all users
  targetRoles String[] // ["ARCHITECT", "CONTRACTOR"] -- only these roles see the feature
  targetCities String[] // ["Sri Ganganagar", "Jaipur"] -- only these cities
  rolloutPercentage Int @default(100) // 0-100, for gradual rollout

  updatedBy   String? // Admin ID

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([key])      // Lookup by key
  @@index([enabled])  // Filter enabled flags
}
```

```typescript
interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  targetRoles: string[];
  targetCities: string[];
  rolloutPercentage: number;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 58: ContactSubmission

```prisma
model ContactSubmission {
  id         String    @id @default(uuid())
  name       String
  email      String
  phone      String?
  role       String    // "homeowner" | "contractor" | "dealer" | "brand" | "other"
  message    String    @db.Text
  source     String    @default("contact_form")

  status     String    @default("new") // "new" | "contacted" | "qualified" | "converted" | "closed"
  assignedTo String?
  notes      String?   @db.Text

  emailSent   Boolean  @default(false)
  emailSentAt DateTime?

  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([email])      // Lookup by email
  @@index([status])     // Filter by status
  @@index([createdAt])  // Sort by date
}
```

```typescript
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  message: string;
  source: string;
  status: string;
  assignedTo: string | null;
  notes: string | null;
  emailSent: boolean;
  emailSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 59: Notification

```prisma
model Notification {
  id       String    @id @default(uuid())
  userId   String
  userType String    // "user" | "dealer"
  title    String
  body     String    @db.Text
  data     String?   @db.Text // JSON payload for deep linking

  // Channel tracking
  channel  String    @default("in_app") // "in_app" | "push" | "email" | "sms" | "whatsapp"

  read     Boolean   @default(false)
  readAt   DateTime?

  user     User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId, userType])  // All notifications for a user
  @@index([read])              // Filter unread
  @@index([createdAt])         // Sort by date
  @@index([channel])           // Filter by channel
}
```

```typescript
interface Notification {
  id: string;
  userId: string;
  userType: string;
  title: string;
  body: string;
  data: string | null;
  channel: string;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}
```

#### Model 60: DevicePushToken

```prisma
model DevicePushToken {
  id       String  @id @default(uuid())
  token    String  @unique  // Expo push token
  userId   String
  userType String  // "user" | "dealer"
  platform String  // "ios" | "android"
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])     // All tokens for a user
  @@index([userType])   // Filter by user type
  @@index([isActive])   // Filter active tokens
}
```

```typescript
interface DevicePushToken {
  id: string;
  token: string;
  userId: string;
  userType: string;
  platform: 'ios' | 'android';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 61: UserActivity

```prisma
model UserActivity {
  id           String       @id @default(uuid())

  actorType    String       // "user" | "dealer" | "admin" | "anonymous"
  actorId      String?
  actorEmail   String?
  actorName    String?

  activityType ActivityType
  description  String

  metadata     String?      @db.Text // JSON: contextual data

  entityType   String?      // "user" | "dealer" | "product" | "rfq" | "quote" | "inquiry" | "payment" | "message"
  entityId     String?

  ipAddress    String?
  userAgent    String?

  user         User?        @relation(fields: [actorId], references: [id], onDelete: SetNull)

  createdAt    DateTime     @default(now())

  @@index([actorType, actorId])    // All activities by an actor
  @@index([activityType])          // Filter by type
  @@index([entityType, entityId])  // All activities for an entity
  @@index([createdAt])             // Sort by date
  @@index([actorEmail])            // Lookup by email
}
```

```typescript
interface UserActivity {
  id: string;
  actorType: string;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  activityType: ActivityType;
  description: string;
  metadata: string | null;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
```

---

### Group 13: Brand-Dealer Network (2 models)

#### Model 62: BrandDealer

```prisma
model BrandDealer {
  id              String            @id @default(uuid())
  brandId         String
  brand           Brand             @relation(fields: [brandId], references: [id], onDelete: Cascade)

  name            String
  shopName        String?
  phone           String
  whatsappNumber  String?
  email           String?

  city            String
  state           String?
  pincode         String?
  address         String?

  source          BrandDealerSource @default(MANUAL)
  sourceUrl       String?
  isVerified      Boolean           @default(false)
  isActive        Boolean           @default(true)
  notes           String?           @db.Text

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  inquiryQuotes   InquiryDealerQuote[]

  @@unique([brandId, phone])  // One entry per brand-phone combination
  @@index([brandId])          // All dealers for a brand
  @@index([city])             // Filter by city
  @@index([isActive])         // Filter active dealers
}
```

```typescript
interface BrandDealer {
  id: string;
  brandId: string;
  name: string;
  shopName: string | null;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  city: string;
  state: string | null;
  pincode: string | null;
  address: string | null;
  source: BrandDealerSource;
  sourceUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 63: InquiryDealerQuote

```prisma
model InquiryDealerQuote {
  id              String              @id @default(uuid())
  pipelineId      String
  pipeline        InquiryPipeline     @relation(fields: [pipelineId], references: [id], onDelete: Cascade)

  brandDealerId   String?
  brandDealer     BrandDealer?        @relation(fields: [brandDealerId], references: [id], onDelete: SetNull)
  dealerId        String?

  // Denormalized dealer info
  dealerName      String
  dealerPhone     String
  dealerShopName  String?
  dealerCity      String?

  contactMethod   ContactMethod       @default(WHATSAPP)
  contactedAt     DateTime?
  whatsappMessage String?             @db.Text

  quotedPrice      Float?
  shippingCost     Float?
  totalQuotedPrice Float?
  deliveryDays     Int?
  warrantyInfo     String?
  quoteNotes       String?            @db.Text

  responseStatus  QuoteResponseStatus @default(PENDING)

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@index([pipelineId])        // All quotes for a pipeline
  @@index([brandDealerId])     // All quotes from a brand dealer
  @@index([responseStatus])    // Filter by status
}
```

```typescript
interface InquiryDealerQuote {
  id: string;
  pipelineId: string;
  brandDealerId: string | null;
  dealerId: string | null;
  dealerName: string;
  dealerPhone: string;
  dealerShopName: string | null;
  dealerCity: string | null;
  contactMethod: ContactMethod;
  contactedAt: Date | null;
  whatsappMessage: string | null;
  quotedPrice: number | null;
  shippingCost: number | null;
  totalQuotedPrice: number | null;
  deliveryDays: number | null;
  warrantyInfo: string | null;
  quoteNotes: string | null;
  responseStatus: QuoteResponseStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Group 14: Search & Intelligence (2 models -- NEW)

#### Model 64: SearchHistory

```prisma
model SearchHistory {
  id       String   @id @default(uuid())
  userId   String?  // Null for anonymous searches

  query    String
  filters  String?  @db.Text // JSON: {brands, categories, priceRange, etc.}
  resultsCount Int  @default(0)

  // Click-through tracking
  clickedProductId String?
  clickedPosition  Int?     // Which result position was clicked

  user     User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())

  @@index([userId])      // Search history for a user
  @@index([query])       // Analyze popular queries
  @@index([createdAt])   // Temporal analysis
}
```

```typescript
interface SearchHistory {
  id: string;
  userId: string | null;
  query: string;
  filters: string | null;
  resultsCount: number;
  clickedProductId: string | null;
  clickedPosition: number | null;
  createdAt: Date;
}
```

#### Model 65: PredictedPrice

```prisma
model PredictedPrice {
  id          String   @id @default(uuid())
  productId   String
  city        String

  predictedPrice Float   // INR per unit
  confidenceLow  Float   // Lower bound (95% CI)
  confidenceHigh Float   // Upper bound (95% CI)
  confidence     Float   // 0.0 - 1.0

  // Model metadata
  modelVersion   String  // "xgboost-v1.2" | "heuristic-v1"
  featuresUsed   String? @db.Text // JSON: which features contributed to prediction
  dataPointsUsed Int     @default(0)

  validFrom      DateTime
  validUntil     DateTime

  createdAt      DateTime @default(now())

  @@unique([productId, city, validFrom])  // One prediction per product-city-period
  @@index([productId, city])              // Predictions for a product in a city
  @@index([validUntil])                   // Expire old predictions
  @@index([confidence])                   // Filter by confidence
}
```

```typescript
interface PredictedPrice {
  id: string;
  productId: string;
  city: string;
  predictedPrice: number;
  confidenceLow: number;
  confidenceHigh: number;
  confidence: number;
  modelVersion: string;
  featuresUsed: string | null;
  dataPointsUsed: number;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
}
```

---

### Remaining Models (3 additional models for completeness)

#### Model 66: SearchIndex (Elasticsearch Sync Tracking)

```prisma
model SearchIndex {
  id           String   @id @default(uuid())
  entityType   String   // "product" | "brand" | "category"
  entityId     String
  indexName    String   // "products"
  lastSyncedAt DateTime?
  syncStatus   String   @default("pending") // "pending" | "synced" | "failed"
  errorMessage String?  @db.Text
  version      Int      @default(1) // Increment on each sync to detect stale data

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([entityType, entityId, indexName])  // One entry per entity per index
  @@index([syncStatus])                        // Find pending syncs
  @@index([lastSyncedAt])                      // Find stale entries
}
```

```typescript
interface SearchIndex {
  id: string;
  entityType: string;
  entityId: string;
  indexName: string;
  lastSyncedAt: Date | null;
  syncStatus: 'pending' | 'synced' | 'failed';
  errorMessage: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 67: JobQueue (BullMQ Job Tracking)

```prisma
model JobQueue {
  id          String   @id @default(uuid())
  queueName   String   // "email" | "notification" | "scrape" | "ai" | "price-update" | "image-process"
  jobId       String   // BullMQ job ID
  jobType     String   // Specific job type within the queue
  payload     String   @db.Text // JSON
  status      String   @default("waiting") // "waiting" | "active" | "completed" | "failed" | "delayed"
  attempts    Int      @default(0)
  maxAttempts Int      @default(3)
  error       String?  @db.Text
  result      String?  @db.Text

  scheduledFor DateTime?
  startedAt    DateTime?
  completedAt  DateTime?
  failedAt     DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([queueName, status])    // Queue-specific status filtering
  @@index([status])               // Global status filtering
  @@index([scheduledFor])         // Delayed jobs
  @@index([createdAt])            // Sort by creation
}
```

```typescript
interface JobQueue {
  id: string;
  queueName: string;
  jobId: string;
  jobType: string;
  payload: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  attempts: number;
  maxAttempts: number;
  error: string | null;
  result: string | null;
  scheduledFor: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Model 68: ApiKey (Third-Party API Key Management)

```prisma
model ApiKey {
  id          String   @id @default(uuid())
  name        String   // "razorpay_production" | "anthropic_main" | "openai_embeddings"
  keyPrefix   String   // First 8 chars for identification (e.g., "rzp_live")
  keyHash     String   @unique // SHA-256 hash of the full key -- NEVER store raw keys
  service     String   // "razorpay" | "anthropic" | "openai" | "msg91" | "resend" | "google_vision"

  // Usage tracking
  lastUsedAt  DateTime?
  totalCalls  Int      @default(0)
  totalErrors Int      @default(0)

  // Budget
  monthlyBudgetPaisa Int? // Monthly budget cap (null = unlimited)
  monthlySpentPaisa  Int  @default(0)
  budgetResetDate    DateTime?

  isActive    Boolean  @default(true)
  expiresAt   DateTime?

  createdBy   String   // Admin ID
  notes       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([service])    // All keys for a service
  @@index([isActive])   // Filter active keys
  @@index([keyHash])    // Lookup by hash
}
```

```typescript
interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  service: string;
  lastUsedAt: Date | null;
  totalCalls: number;
  totalErrors: number;
  monthlyBudgetPaisa: number | null;
  monthlySpentPaisa: number;
  budgetResetDate: Date | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdBy: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 6.3 Database Operations

### 6.3.1 Critical SQL Operations

**Create indexes not possible via Prisma (raw SQL in migration):**

```sql
-- Trigram index for fuzzy product search (pg_trgm)
CREATE INDEX CONCURRENTLY idx_product_name_trgm ON "Product" USING gin (name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_product_model_trgm ON "Product" USING gin ("modelNumber" gin_trgm_ops);

-- Vector index for semantic search (pgvector)
CREATE INDEX CONCURRENTLY idx_product_embedding ON "Product" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Partial index: only active products (smaller index, faster queries)
CREATE INDEX CONCURRENTLY idx_product_active ON "Product" ("brandId", "productTypeId") WHERE "isActive" = true;

-- Partial index: only pending fraud flags
CREATE INDEX CONCURRENTLY idx_fraud_flag_open ON "FraudFlag" ("severity", "createdAt") WHERE status = 'OPEN';

-- Partial index: unread notifications
CREATE INDEX CONCURRENTLY idx_notification_unread ON "Notification" ("userId", "createdAt") WHERE read = false;

-- Composite index for price trend lookups
CREATE INDEX CONCURRENTLY idx_price_trend_lookup ON "PriceTrend" ("productId", "city", "periodType", "periodStart" DESC);

-- Composite index for conversation message pagination
CREATE INDEX CONCURRENTLY idx_message_conversation_time ON "Message" ("conversationId", "createdAt" DESC) WHERE "isDeleted" = false;
```

**Daily maintenance cron (runs at 03:30 IST):**

```sql
-- Vacuum analyze high-write tables
VACUUM ANALYZE "UserActivity";
VACUUM ANALYZE "ChatMessage";
VACUUM ANALYZE "Notification";
VACUUM ANALYZE "PriceDataPoint";
VACUUM ANALYZE "SearchHistory";
VACUUM ANALYZE "Message";

-- Refresh materialized views (if created)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dealer_leaderboard;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_price_summary;
```

**Cleanup expired data (runs daily at 04:00 IST):**

```sql
-- Delete expired OTPs (older than 24 hours)
DELETE FROM "OTP" WHERE "expiresAt" < NOW() - INTERVAL '24 hours';

-- Delete expired password reset tokens (older than 24 hours)
DELETE FROM "PasswordResetToken" WHERE "expiresAt" < NOW() - INTERVAL '24 hours';

-- Delete revoked refresh tokens (older than 7 days after revocation)
DELETE FROM "RefreshToken" WHERE "revoked" = true AND "revokedAt" < NOW() - INTERVAL '7 days';

-- Delete expired refresh tokens
DELETE FROM "RefreshToken" WHERE "expiresAt" < NOW();

-- Archive old search history (older than 90 days)
DELETE FROM "SearchHistory" WHERE "createdAt" < NOW() - INTERVAL '90 days';

-- Archive old user activity (older than 180 days -- move to S3 first)
-- This is handled by the archival job, not direct deletion
```

### 6.3.2 Data Retention Policy

| Table | Retention | Archive Strategy |
|-------|-----------|-----------------|
| User, Dealer, Admin | Permanent (soft delete via status) | N/A |
| RFQ, Quote | Permanent | N/A |
| Payment, Invoice | 7 years (GST compliance) | S3 Glacier after 2 years |
| AuditLog | 3 years | S3 Glacier after 1 year |
| UserActivity | 6 months active, then archive | Export to S3, delete from DB |
| ChatMessage, ChatSession | 1 year | Export to S3, delete from DB |
| Message (conversations) | 2 years | N/A |
| Notification | 90 days | Delete |
| SearchHistory | 90 days | Delete |
| OTP, RefreshToken, PasswordResetToken | Auto-expire (see cleanup SQL) | Delete |
| ScrapedProduct (raw) | 30 days after processing | Delete |
| PriceDataPoint | 2 years | Aggregate into PriceTrend, then archive |
| FraudFlag | 3 years | N/A |

### 6.3.3 Migration Strategy

```bash
# Development: auto-apply migrations
npx prisma migrate dev --name descriptive_name

# Staging: apply pending migrations
npx prisma migrate deploy

# Production: apply with manual approval
# 1. Generate migration SQL
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-migrations ./prisma/migrations --script > migration.sql
# 2. Review migration SQL
# 3. Take RDS snapshot
# 4. Apply via prisma migrate deploy
npx prisma migrate deploy
# 5. Verify with prisma db pull
npx prisma db pull --print
```

**Migration safety rules:**
1. Never drop a column in production without a 2-release deprecation cycle
2. Always add new columns as nullable (or with a default) first
3. Add indexes with `CONCURRENTLY` to avoid table locks
4. Test every migration against a production-size dataset in staging
5. Every migration must be reversible (maintain a `down.sql` in the migration directory)

---

## 6.4 Model Count Summary

| Group | Models | New |
|-------|--------|-----|
| 1. User & Authentication | 8 | 1 (UserPreference) |
| 2. Dealer | 8 | 2 (DealerScore, SubscriptionPlan) |
| 3. Product Catalog | 8 | 2 (PriceDataPoint, PriceTrend) |
| 4. Inquiry System | 3 | 0 |
| 5. RFQ & Quotes | 4 | 0 |
| 6. Messaging | 3 | 3 (Conversation, ConversationParticipant, Message) |
| 7. Community | 4 | 1 (CommunityVote) |
| 8. Chat & AI | 2 | 0 (modified: added token tracking) |
| 9. CRM | 6 | 0 |
| 10. Payment & Invoicing | 2 | 2 (Payment, Invoice) |
| 11. Scraping | 5 | 0 |
| 12. System | 8 | 1 (PlatformSetting -- was implied, now explicit) |
| 13. Brand-Dealer Network | 2 | 0 |
| 14. Search & Intelligence | 2 | 2 (SearchHistory, PredictedPrice) |
| 15. Infrastructure | 3 | 3 (SearchIndex, JobQueue, ApiKey) |
| **Total** | **68** | **17 new models** |

**Enum count: 22** (19 existing + 3 new: PaymentStatus, SubscriptionStatus, MessageType)

---

*This section is the single source of truth for the Hub4Estate database schema and technology stack. Every model, every field, every index, and every configuration parameter listed here is deployed. Prisma migrations are generated from this specification. TypeScript interfaces are enforced at compile time. No ambiguity remains.*

[CONTINUES IN NEXT SECTION -- Resume at Section 7: Security Architecture]
