import { z } from 'zod';

/**
 * Indian phone number validation.
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
 * Normalizes to: +91XXXXXXXXXX
 */
export const phoneSchema = z
  .string()
  .transform((val) => val.replace(/[\s-()]/g, '')) // Strip formatting
  .refine((val) => {
    const normalized = normalizePhone(val);
    return normalized !== null;
  }, 'Invalid Indian phone number')
  .transform((val) => normalizePhone(val)!);

/**
 * Normalize an Indian phone number to +91XXXXXXXXXX format.
 * Returns null if invalid.
 */
export function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Match various Indian phone formats
  const patterns = [
    /^\+91(\d{10})$/, // +91XXXXXXXXXX
    /^91(\d{10})$/,   // 91XXXXXXXXXX
    /^0(\d{10})$/,    // 0XXXXXXXXXX
    /^(\d{10})$/,     // XXXXXXXXXX
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const number = match[1];
      // Indian mobile numbers start with 6-9
      if (/^[6-9]/.test(number)) {
        return `+91${number}`;
      }
    }
  }

  return null;
}

/**
 * Mask a phone number for display (e.g., +91XXXXXXX234).
 */
export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return '***';
  return `${normalized.slice(0, 3)}XXXXXXX${normalized.slice(-3)}`;
}
