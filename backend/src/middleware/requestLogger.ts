import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Structured request/response logger.
 * Logs request on entry, response on finish with duration.
 * Hashes IP for privacy (never logs raw IP).
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request entry
  const reqLog = {
    level: 'info',
    event: 'request_start',
    requestId,
    method: req.method,
    path: req.path,
    ipHash: crypto.createHash('sha256').update(req.ip || '').digest('hex').slice(0, 12),
    userAgent: (req.headers['user-agent'] || '').slice(0, 100),
  };
  process.stdout.write(JSON.stringify(reqLog) + '\n');

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const resLog = {
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      event: 'request_end',
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    };
    process.stdout.write(JSON.stringify(resLog) + '\n');
  });

  next();
}
