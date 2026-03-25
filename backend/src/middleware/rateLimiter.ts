import rateLimit from 'express-rate-limit';

const makeJson = (message: string) => ({
  error: message,
  retryAfter: 'See Retry-After header',
});

// OTP sending — 5 per 15 min per IP (prevent SMS/email bomb)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: makeJson('Too many OTP requests. Please wait 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// User login (OTP verify) — 10 per 15 min per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: makeJson('Too many login attempts. Please wait 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Dealer / Admin login — 10 per 15 min per IP (stricter: known credential attacks)
export const credentialLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: makeJson('Too many login attempts. Account will be temporarily locked. Please wait 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Password reset requests — 3 per hour per IP
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: makeJson('Too many password reset requests. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// File / document uploads — 20 per 15 min per IP
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: makeJson('Too many file uploads. Please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Product inquiry submission — 10 per hour per IP (prevent lead spam)
export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: makeJson('Too many inquiries submitted. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form — 5 per hour per IP
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: makeJson('Too many contact form submissions. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// RFQ creation — 20 per hour per IP
export const rfqLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: makeJson('Too many RFQs created. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Quote submission by dealer — 50 per hour
export const quoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: makeJson('Too many quotes submitted. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin routes — 300 per 15 min
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: makeJson('Too many admin requests.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Scraper trigger — 5 per hour (expensive operation)
export const scraperLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: makeJson('Too many scraper jobs triggered. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// AI / chat endpoints — 30 per 15 min per IP
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: makeJson('Too many AI requests. Please slow down.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Refresh token rotation — 20 per hour per IP
export const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: makeJson('Too many token refresh attempts.'),
  standardHeaders: true,
  legacyHeaders: false,
});
