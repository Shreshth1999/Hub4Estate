import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: { body?: ZodSchema; params?: ZodSchema; query?: ZodSchema }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.params) req.params = schema.params.parse(req.params) as any;
      if (schema.query) req.query = schema.query.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
