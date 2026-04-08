import { z } from 'zod';

export const createInquirySchema = z.object({
  name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  phone: z.string().regex(/^\+?91?\d{10}$/, 'Invalid phone number'),
  email: z.string().email().optional().nullable(),
  modelNumber: z.string().max(100).optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100000),
  deliveryCity: z.string().min(2, 'City required').max(100),
  notes: z.string().max(2000).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  source: z.enum(['web_form', 'ai_assistant', 'slip_scan', 'mobile']).default('web_form'),
}).strict();

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'closed']),
  internalNotes: z.string().max(5000).optional(),
}).strict();

export const submitQuoteResponseSchema = z.object({
  inquiryId: z.string().uuid(),
  quotedPrice: z.number().positive('Price must be positive'),
  shippingCost: z.number().min(0).default(0),
  estimatedDelivery: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const inquirySearchSchema = z.object({
  status: z.string().optional(),
  city: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'status', 'deliveryCity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
