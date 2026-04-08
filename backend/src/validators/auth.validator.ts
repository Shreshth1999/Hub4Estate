import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?91?\d{10}$/, 'Invalid Indian phone number'),
}).strict();

export const verifyOtpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
}).strict();

export const userSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum([
    'INDIVIDUAL_HOME_BUILDER',
    'RENOVATION_HOMEOWNER',
    'ARCHITECT',
    'INTERIOR_DESIGNER',
    'CONTRACTOR',
    'ELECTRICIAN',
    'SMALL_BUILDER',
    'DEVELOPER',
  ]).optional(),
  city: z.string().optional(),
  purpose: z.string().optional(),
}).strict();

export const dealerLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
}).strict();

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().length(6).optional(),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  newPassword: passwordSchema,
}).strict();
