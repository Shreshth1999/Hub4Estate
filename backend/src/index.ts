import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import passportConfig from './config/passport';
import prisma from './config/database';
import {
  requestId,
  sanitizeInputs,
  detectAttacks,
  securityHeaders,
  preventParamPollution,
  blockMaliciousAgents,
} from './middleware/security';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import {
  inquiryLimiter,
  contactLimiter,
  rfqLimiter,
  quoteLimiter,
  adminLimiter,
  scraperLimiter,
  aiLimiter,
  uploadLimiter,
} from './middleware/rateLimiter';
import { tokenService } from './services/token.service';

// Routes
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import rfqRoutes from './routes/rfq.routes';
import quoteRoutes from './routes/quote.routes';
import dealerRoutes from './routes/dealer.routes';
import adminRoutes from './routes/admin.routes';
import communityRoutes from './routes/community.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import contactRoutes from './routes/contact.routes';
import chatRoutes from './routes/chat.routes';
import crmRoutes from './routes/crm.routes';
import scraperRoutes from './routes/scraper.routes';
import inquiryRoutes from './routes/inquiry.routes';
import inquiryPipelineRoutes from './routes/inquiry-pipeline.routes';
import brandDealerRoutes from './routes/brand-dealer.routes';
import databaseRoutes from './routes/database.routes';
import dealerInquiryRoutes from './routes/dealer-inquiry.routes';
import slipScannerRoutes from './routes/slip-scanner.routes';
import notificationRoutes from './routes/notification.routes';
import professionalRoutes from './routes/professional.routes';
import paymentRoutes from './routes/payment.routes';
import subscriptionRoutes from './routes/subscription.routes';
import priceRoutes from './routes/price.routes';

const app = express();

// ── Middleware Chain (PRD §7 order) ──────────────────────────────────────────

// Layer 1: Request ID (correlation)
app.use(requestId);

// Layer 2: Block malicious user agents
app.use(blockMaliciousAgents);

// Layer 3: Helmet security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Custom CSP in securityHeaders
}));

// Layer 4: Custom security headers (CSP with nonce, HSTS, etc.)
app.use(securityHeaders);

// Layer 5: Prevent parameter pollution
app.use(preventParamPollution);

// Layer 6: CORS — strict origin allowlist (CRIT-17 fix: no wildcard *.vercel.app)
const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Mobile apps, health checks
    if (allowedOrigins.includes(origin) || origin.includes('hub4estate.com') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Layer 7: Body parsing + cookie parser
app.use(express.json({ limit: '1mb' })); // Default 1MB, upload endpoints override
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Layer 8: Request logger (structured JSON)
app.use(requestLogger);

// Layer 9: Input sanitization
app.use(sanitizeInputs);

// Layer 10: Attack detection (ALL routes — CRIT-20 fix)
app.use(detectAttacks);

// Layer 11: Passport initialization
app.use(passportConfig.initialize());

// CRIT-21 FIX: No express.static for uploads — use presigned S3 URLs instead

// ── Health & Readiness Probes ────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'not_ready', db: 'disconnected' });
  }
});

app.get('/api/v1/version', (_req, res) => {
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    env: env.NODE_ENV,
  });
});

// ── API Routes (Layer 12: per-route rate limiter + auth + validation) ────────

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/rfq', rfqLimiter, rfqRoutes);
app.use('/api/quotes', quoteLimiter, quoteRoutes);
app.use('/api/dealer', dealerRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/crm', adminLimiter, crmRoutes);
app.use('/api/scraper', scraperLimiter, scraperRoutes);
app.use('/api/inquiry', inquiryLimiter, inquiryRoutes);
app.use('/api/inquiry-pipeline', inquiryPipelineRoutes);
app.use('/api/brand-dealers', brandDealerRoutes);
app.use('/api/database', adminLimiter, databaseRoutes);
app.use('/api/dealer-inquiry', quoteLimiter, dealerInquiryRoutes);
app.use('/api/slip-scanner', uploadLimiter, slipScannerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/professional', uploadLimiter, professionalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/prices', priceRoutes);

// ── Layer 13: 404 + Global Error Handler (MUST be last) ─────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────

const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  const log = { level: 'info', event: 'server_start', port: PORT, env: env.NODE_ENV };
  process.stdout.write(JSON.stringify(log) + '\n');
});

// ── Background Jobs ──────────────────────────────────────────────────────────

// Cleanup expired tokens every 6 hours
setInterval(async () => {
  try {
    const cleaned = await tokenService.cleanupExpiredTokens();
    if (cleaned > 0) {
      const log = { level: 'info', event: 'token_cleanup', removed: cleaned };
      process.stdout.write(JSON.stringify(log) + '\n');
    }
  } catch (err) {
    const log = { level: 'error', event: 'token_cleanup_failed', error: (err as Error).message };
    process.stdout.write(JSON.stringify(log) + '\n');
  }
}, 6 * 60 * 60 * 1000);

// ── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  const log = { level: 'info', event: 'shutdown', signal };
  process.stdout.write(JSON.stringify(log) + '\n');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
