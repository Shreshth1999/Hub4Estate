import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(20),
  search: z.string().max(200, 'Search query must be at most 200 characters').optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});
