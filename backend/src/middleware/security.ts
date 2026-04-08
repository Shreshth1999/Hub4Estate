import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

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
// CRIT-20 FIX: applied to ALL routes including auth and chat
const ATTACK_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  // SQL Injection
  { pattern: /(\bSELECT\b.*\bFROM\b|\bINSERT\b.*\bINTO\b|\bDROP\b.*\bTABLE\b|\bUNION\b.*\bSELECT\b|\bDELETE\b.*\bFROM\b)/i, name: 'sql_injection' },
  // XSS
  { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i, name: 'xss_script' },
  { pattern: /javascript:/i, name: 'xss_javascript_proto' },
  // Path traversal
  { pattern: /\.\.[/\\]/, name: 'path_traversal' },
  // Null byte injection
  { pattern: /\x00/, name: 'null_byte' },
  // Template injection
  { pattern: /\$\{[^}]*\}/, name: 'template_injection' },
];

export function detectAttacks(req: Request, res: Response, next: NextFunction) {
  // Skip attack detection for file upload endpoints — binary data checked separately
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

  for (const { pattern, name } of ATTACK_PATTERNS) {
    if (pattern.test(suspect)) {
      const rid = req.headers['x-request-id'];
      // Structured log — no PII in log output
      const logEntry = {
        level: 'warn',
        event: 'attack_detected',
        requestId: rid,
        ipHash: crypto.createHash('sha256').update(req.ip || '').digest('hex').slice(0, 12),
        method: req.method,
        path: req.path,
        pattern: name,
      };
      process.stdout.write(JSON.stringify(logEntry) + '\n');
      return res.status(400).json({ error: 'Invalid request' });
    }
  }

  next();
}

// Enhanced security headers — CSP with per-request nonce
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Generate per-request nonce for CSP
  const nonce = crypto.randomBytes(16).toString('base64');
  (req as unknown as Record<string, unknown>).cspNonce = nonce;

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // Disabled in favor of CSP
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://accounts.google.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.anthropic.com https://accounts.google.com https://exp.host https://*.posthog.com",
      "frame-src https://accounts.google.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
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
  'dirbuster',
  'gobuster',
  'wpscan',
  'nuclei',
];

export function blockMaliciousAgents(req: Request, res: Response, next: NextFunction) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (BLOCKED_AGENTS.some(blocked => ua.includes(blocked))) {
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
