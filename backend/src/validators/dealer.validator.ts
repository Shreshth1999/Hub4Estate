import { z } from 'zod';

export const dealerRegistrationSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain digit')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  businessName: z.string().min(2).max(200),
  ownerName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?91?\d{10}$/, 'Invalid phone number'),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number'),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number'),
  shopAddress: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  dealerType: z.enum([
    'RETAILER',
    'DISTRIBUTOR',
    'SYSTEM_INTEGRATOR',
    'CONTRACTOR',
    'OEM_PARTNER',
    'WHOLESALER',
  ]).default('RETAILER'),
  yearsInOperation: z.number().int().min(0).max(100).optional(),
}).strict();

export const dealerProfileUpdateSchema = z.object({
  businessName: z.string().min(2).max(200).optional(),
  ownerName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?91?\d{10}$/).optional(),
  shopAddress: z.string().min(5).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().nullable(),
  establishedYear: z.number().int().min(1900).max(2030).optional(),
  certifications: z.array(z.string().max(100)).max(20).optional(),
}).strict();

export const dealerVerificationSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  verificationNotes: z.string().max(2000).optional(),
  rejectionReason: z.string().max(1000).optional(),
}).strict();
