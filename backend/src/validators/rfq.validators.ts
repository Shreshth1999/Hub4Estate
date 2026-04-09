import { z } from 'zod';

export const createRfqSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  items: z.array(
    z.object({
      productName: z.string().min(1, 'Product name is required'),
      productId: z.string().uuid('Invalid product ID').optional(),
      quantity: z.number().int('Quantity must be a whole number').positive('Quantity must be positive'),
      unit: z.string().optional(),
      specifications: z.string().optional(),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one item is required').max(50, 'Maximum 50 items allowed'),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryPincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').optional(),
  deliveryAddress: z.string().optional(),
  deliveryPreference: z.enum(['delivery', 'pickup', 'both']).optional(),
  estimatedDate: z.string().optional(),
  urgency: z.enum(['normal', 'urgent']).optional(),
  deadline: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    },
    { message: 'Deadline must be a valid future date' }
  ).optional(),
});

export const rfqIdParamSchema = z.object({
  id: z.string().uuid('Invalid RFQ ID'),
});
