import { z } from 'zod';

/**
 * Indian GST Number (GSTIN) validation.
 * Format: 2-digit state code + 10-digit PAN + 1 entity + 1 default "Z" + 1 checksum
 * Example: 08AATFH3466L1Z5
 */
export const gstSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (val) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
    'Invalid GST number format'
  );

/**
 * Indian PAN validation.
 * Format: 5 letters + 4 digits + 1 letter
 * Example: AATFH3466L
 */
export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
    'Invalid PAN number format'
  );

/**
 * Extract state code from GSTIN.
 */
export function getStateFromGST(gst: string): string {
  const stateCode = gst.substring(0, 2);
  return STATE_CODES[stateCode] || 'Unknown';
}

/**
 * Check if transaction is inter-state (IGST applies).
 */
export function isInterState(sellerGst: string, buyerGst: string): boolean {
  return sellerGst.substring(0, 2) !== buyerGst.substring(0, 2);
}

/**
 * Calculate GST components for electrical products (18% standard rate).
 */
export function calculateGST(
  amountPaise: number,
  isInterStateTransaction: boolean
): {
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
  gstRate: number;
} {
  const gstRate = 0.18; // 18% for electrical products (SAC 998314)
  const gstAmount = Math.round(amountPaise * gstRate);

  if (isInterStateTransaction) {
    return {
      subtotalPaise: amountPaise,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: gstAmount,
      totalPaise: amountPaise + gstAmount,
      gstRate: 18,
    };
  }

  const halfGst = Math.round(gstAmount / 2);
  return {
    subtotalPaise: amountPaise,
    cgstPaise: halfGst,
    sgstPaise: gstAmount - halfGst, // Handles odd paise
    igstPaise: 0,
    totalPaise: amountPaise + gstAmount,
    gstRate: 18,
  };
}

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh',
};
