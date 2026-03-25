import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Attach a unique request ID to every request for tracing + incident response
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
}

// Recursively strip dangerous HTML characters from string values
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/[<>]/g, '').replace(/\x00/g, '').trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      sanitized[key] = sanitizeValue((value as Record<string, unknown>)[key]);
    }
    return sanitized;
  }
  return value;
}

// Sanitize req.body in place — does NOT affect multipart/file uploads
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

// Patterns indicating an active attack attempt
const ATTACK_PATTERNS: RegExp[] = [
  // SQL Injection
  /(\bSELECT\b.*\bFROM\b|\bINSERT\b.*\bINTO\b|\bDROP\b.*\bTABLE\b|\bUNION\b.*\bSELECT\b|\bDELETE\b.*\bFROM\b)/i,
  // XSS
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
  /on\w+\s*=/i,
  // Path traversal
  /\.\.[/\\]/,
  // Null byte injection
  /\x00/,
  // LDAP injection
  /[()=*|!&\\]/,
  // Template injection
  /\$\{.*\}/,
  /\{\{.*\}\}/,
];

export function detectAttacks(req: Request, res: Response, next: NextFunction) {
  // Skip attack detection for file upload endpoints — checked separately
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next();
  }

  const suspect = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of ATTACK_PATTERNS) {
    if (pattern.test(suspect)) {
      const requestId = req.headers['x-request-id'];
      console.warn(
        `[SECURITY] Attack pattern detected. RequestID: ${requestId}, IP: ${req.ip}, ` +
        `Method: ${req.method}, URL: ${req.url}, Pattern: ${pattern.toString()}`
      );
      return res.status(400).json({ error: 'Invalid request' });
    }
  }

  next();
}

// Enhanced security headers beyond helmet defaults
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.anthropic.com https://accounts.google.com https://exp.host",
      "frame-src https://accounts.google.com",
      "font-src 'self' data:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  next();
}

// Prevent HTTP Parameter Pollution — keep only the last value for each query param
export function preventParamPollution(req: Request, _res: Response, next: NextFunction) {
  for (const key of Object.keys(req.query)) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = (req.query[key] as string[]).at(-1) as string;
    }
  }
  next();
}

// Block clearly malicious User-Agents (scanners, bots, exploit frameworks)
const BLOCKED_AGENTS = [
  'sqlmap',
  'nikto',
  'nessus',
  'openvas',
  'masscan',
  'zgrab',
  'python-requests/2.', // mass scrapers — narrow pattern
  'go-http-client/1.1', // generic scanners
  'curl/7.', // CLI scanners — remove if your legitimate users use curl
];

export function blockMaliciousAgents(req: Request, res: Response, next: NextFunction) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (BLOCKED_AGENTS.some(blocked => ua.includes(blocked))) {
    console.warn(`[SECURITY] Blocked agent: ${ua}, IP: ${req.ip}`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

// Enforce maximum request body size for JSON (belt-and-suspenders over express.json limit)
export function enforceBodySize(maxBytes: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      return res.status(413).json({ error: 'Request body too large' });
    }
    return next();
  };
}
