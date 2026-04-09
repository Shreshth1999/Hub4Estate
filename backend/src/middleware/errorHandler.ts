import { Request, Response, NextFunction } from 'express';
import { Sentry } from '../config/sentry';

/**
 * Custom error class for application errors with HTTP status codes.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, id ? `${resource} with id '${id}' not found` : `${resource} not found`, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, message, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Global error handler — MUST be registered last in the middleware chain.
 * Formats all errors consistently, reports to Sentry in production.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Report to Sentry (skips known/expected errors via ignoreErrors config)
  Sentry.captureException(err, {
    tags: { method: req.method, path: req.path },
    extra: { requestId: req.headers['x-request-id'] },
  });

  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof AppError) {
    // Known application errors — log at warn level
    const logEntry = {
      level: 'warn',
      event: 'app_error',
      requestId,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      method: req.method,
      path: req.path,
    };
    process.stdout.write(JSON.stringify(logEntry) + '\n');

    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Unknown errors — log at error level with stack trace
  const logEntry = {
    level: 'error',
    event: 'unhandled_error',
    requestId,
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  };
  process.stdout.write(JSON.stringify(logEntry) + '\n');

  // Never expose internal error details to client
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId,
  });
}

/**
 * 404 handler for unmatched routes — registered after all routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
}
