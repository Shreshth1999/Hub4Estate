import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../config/redis';

interface AuthRequest extends Request {
  user?: { id: string; [key: string]: any };
}

const makeJson = (message: string) => ({
  error: message,
  retryAfter: 'See Retry-After header',
});

/**
 * Create a Redis-backed store if Redis is available, otherwise fall back to in-memory.
 * Redis store ensures rate limits work correctly across multiple server instances (PM2 cluster / ECS).
 */
function getStore(prefix: string): RedisStore | undefined {
  const redis = getRedis();
  if (!redis) return undefined;
  return new RedisStore({
    sendCommand: (...args: string[]) => (redis as any).call(args[0], ...args.slice(1)),
    prefix: `rl:${prefix}:`,
  });
}

// ============================================
// PER-USER IN-MEMORY AI RATE LIMITER
// ============================================
// Uses authenticated userId as key (not IP), so one user can't block another.
// Falls back to IP if user is somehow missing (shouldn't happen behind auth).

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const userRateLimitStores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Creates a per-user rate limiter middleware (in-memory, no Redis needed).
 * MUST be placed AFTER authentication middleware so req.user.id exists.
 *
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @param label - Human-readable label for error messages (e.g. "slip scan", "chat message")
 */
export function perUserRateLimit(maxRequests: number, windowMs: number, label: string) {
  // Each call creates a separate store so different endpoints have independent limits
  const storeKey = `${label}-${maxRequests}-${windowMs}`;
  if (!userRateLimitStores.has(storeKey)) {
    userRateLimitStores.set(storeKey, new Map<string, RateLimitEntry>());
  }
  const store = userRateLimitStores.get(storeKey)!;

  // Periodic cleanup: remove expired entries every 5 minutes to prevent memory leak
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  // Don't block process exit
  if (cleanupInterval.unref) cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id || req.ip || 'unknown';
    const now = Date.now();

    let entry = store.get(userId);

    // If no entry or window expired, reset
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      store.set(userId, entry);
    }

    entry.count++;

    // Set standard rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      res.status(429).json({
        error: `Too many ${label} requests. Limit: ${maxRequests} per ${Math.round(windowMs / 60000)} minutes. Please try again later.`,
        retryAfter: `${resetSeconds}s`,
      });
      return;
    }

    next();
  };
}

// Pre-built per-user AI rate limiters
export const slipScanRateLimit = perUserRateLimit(10, 60 * 60 * 1000, 'slip scan');
export const chatMessageRateLimit = perUserRateLimit(20, 60 * 60 * 1000, 'chat message');
export const adminAiInsightsRateLimit = perUserRateLimit(5, 60 * 60 * 1000, 'AI insight');
export const parseQuoteRateLimit = perUserRateLimit(15, 60 * 60 * 1000, 'quote parse');
export const brandSuggestionRateLimit = perUserRateLimit(20, 60 * 60 * 1000, 'brand suggestion');

// OTP sending — 5 per 15 min per IP (prevent SMS/email bomb)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: getStore('otp'),
  message: makeJson('Too many OTP requests. Please wait 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// User login (OTP verify) — 10 per 15 min per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: getStore('login'),
  message: makeJson('Too many login attempts. Please wait 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Dealer / Admin login — 10 per 15 min per IP (stricter: known credential attacks)
export const credentialLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: getStore('credlogin'),
  message: makeJson('Too many login attempts. Account will be temporarily locked. Please wait 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Password reset requests — 3 per hour per IP
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  store: getStore('pwreset'),
  message: makeJson('Too many password reset requests. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// File / document uploads — 20 per 15 min per IP
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  store: getStore('upload'),
  message: makeJson('Too many file uploads. Please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Product inquiry submission — 10 per hour per IP (prevent lead spam)
export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  store: getStore('inquiry'),
  message: makeJson('Too many inquiries submitted. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form — 5 per hour per IP
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  store: getStore('contact'),
  message: makeJson('Too many contact form submissions. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// RFQ creation — 20 per hour per IP
export const rfqLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  store: getStore('rfq'),
  message: makeJson('Too many RFQs created. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Quote submission by dealer — 50 per hour
export const quoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  store: getStore('quote'),
  message: makeJson('Too many quotes submitted. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin routes — 300 per 15 min
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  store: getStore('admin'),
  message: makeJson('Too many admin requests.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Scraper trigger — 5 per hour (expensive operation)
export const scraperLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  store: getStore('scraper'),
  message: makeJson('Too many scraper jobs triggered. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// AI / chat endpoints — 30 per 15 min per IP
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  store: getStore('ai'),
  message: makeJson('Too many AI requests. Please slow down.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Refresh token rotation — 20 per hour per IP
export const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  store: getStore('refresh'),
  message: makeJson('Too many token refresh attempts.'),
  standardHeaders: true,
  legacyHeaders: false,
});
