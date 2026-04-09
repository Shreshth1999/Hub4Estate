import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91\d{10}$/, 'Phone must be in +91XXXXXXXXXX format')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  type: z.enum(['login', 'signup']),
}).refine(data => data.phone || data.email, {
  message: 'Either phone or email is required',
});

export const verifyOtpSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
  type: z.enum(['login', 'signup']),
}).refine(data => data.phone || data.email, {
  message: 'Either phone or email is required',
});

export const dealerRegisterSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(200, 'Business name must be at most 200 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  ownerName: z.string().min(2, 'Owner name is required').optional(),
  gstNumber: z
    .string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/, 'Invalid GST number format')
    .optional(),
  panNumber: z.string().optional(),
  shopAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dealerType: z.enum(['RETAILER', 'DISTRIBUTOR', 'SYSTEM_INTEGRATOR', 'CONTRACTOR', 'OEM_PARTNER', 'WHOLESALER']).optional(),
  yearsInOperation: z.number().int().min(0).max(100).optional(),
});

export const dealerLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
