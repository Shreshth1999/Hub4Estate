import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../lib/logger';

/**
 * Structured request/response logger.
 * Logs request on entry, response on finish with duration.
 * Hashes IP for privacy (never logs raw IP).
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request entry
  logger.info('request_start', {
    requestId,
    method: req.method,
    path: req.path,
    ipHash: crypto.createHash('sha256').update(req.ip || '').digest('hex').slice(0, 12),
    userAgent: (req.headers['user-agent'] || '').slice(0, 100),
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('request_end', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}
