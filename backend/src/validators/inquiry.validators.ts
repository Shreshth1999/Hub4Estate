import { z } from 'zod';

export const createInquirySchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters').max(200, 'Product name must be at most 200 characters').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().min(10, 'Valid phone number is required').optional(),
  email: z.string().email().optional().nullable(),
  modelNumber: z.string().max(100).optional().nullable(),
  quantity: z.coerce.number().positive('Quantity must be positive').default(1),
  unit: z.string().optional(),
  deliveryCity: z.string().min(2, 'City is required').max(100).optional(),
  deliveryState: z.string().optional(),
  deliveryPincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').optional(),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  source: z.enum(['web_form', 'ai_assistant', 'slip_scan', 'mobile']).default('web_form'),
});

export const inquiryIdParamSchema = z.object({
  id: z.string().uuid('Invalid inquiry ID'),
});
