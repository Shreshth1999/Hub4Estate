/**
 * Blind Matching Service
 *
 * Core principle: Neither buyer nor dealer sees the other's identity until
 * a quote is selected and payment is initiated.
 *
 * This service provides sanitization functions that strip PII from data objects
 * before they are sent to the opposite party.
 */

import prisma from '../config/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewerType = 'buyer' | 'dealer' | 'admin';

/** Fields that must never be exposed to a dealer before identity reveal. */
const BUYER_IDENTITY_FIELDS: ReadonlySet<string> = new Set([
  'name',
  'phone',
  'email',
  'address',
  'shopAddress',
  'deliveryAddress',
]);

/** Fields that must never be exposed to a buyer before identity reveal. */
const DEALER_IDENTITY_FIELDS: ReadonlySet<string> = new Set([
  'businessName',
  'ownerName',
  'gstNumber',
  'panNumber',
  'phone',
  'email',
  'shopAddress',
  'address',
  'shopPhoto',
  'shopImages',
  'brandAuthProofs',
  'gstDocument',
  'panDocument',
  'shopLicense',
  'cancelledCheque',
  'website',
]);

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

/**
 * Recursively strips the given fields from an object (or array of objects).
 * Returns a new object — never mutates the original.
 */
function stripFields<T extends Record<string, any>>(
  data: T,
  fields: ReadonlySet<string>,
): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map((item) => stripFields(item, fields)) as unknown as T;
  }

  if (typeof data !== 'object' || data instanceof Date) {
    return data;
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (fields.has(key)) {
      // Replace with a redacted placeholder so consumers know the field exists
      // but don't get the actual value.
      cleaned[key] = '[hidden]';
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      // Do NOT recurse into nested relations by default — only the top-level
      // object is sanitized. Nested objects (like `dealer`, `user`, `inquiry`)
      // are sanitized explicitly via their own sanitize* call below.
      cleaned[key] = value;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

// ---------------------------------------------------------------------------
// Sanitization functions
// ---------------------------------------------------------------------------

/**
 * Sanitize buyer/user data from a ProductInquiry or RFQ before sending to a dealer.
 * Strips name, phone, email, and address fields.
 */
export function sanitizeBuyerData<T extends Record<string, any>>(
  data: T,
  viewerType: ViewerType,
): T {
  // Admins see everything
  if (viewerType === 'admin') return data;

  // Buyers see their own data — no stripping needed
  if (viewerType === 'buyer') return data;

  // Dealer viewing → strip buyer identity
  return stripFields(data, BUYER_IDENTITY_FIELDS);
}

/**
 * Sanitize dealer data from a Quote or InquiryDealerResponse before sending to a buyer.
 * Strips businessName, GST, phone, email, etc.
 *
 * If the quote status is SELECTED or if `identityRevealed` is true, the full
 * dealer data is returned.
 */
export function sanitizeDealerData<T extends Record<string, any>>(
  data: T,
  viewerType: ViewerType,
  quoteStatus?: string,
): T {
  // Admins see everything
  if (viewerType === 'admin') return data;

  // Dealers see their own data — no stripping needed
  if (viewerType === 'dealer') return data;

  // If the quote was selected/accepted, reveal dealer identity
  const revealStatuses = new Set(['SELECTED', 'ACCEPTED', 'selected', 'accepted']);
  if (quoteStatus && revealStatuses.has(quoteStatus)) {
    return data;
  }

  // Buyer viewing a non-selected quote → strip dealer identity
  return stripFields(data, DEALER_IDENTITY_FIELDS);
}

/**
 * Sanitize the nested `dealer` object within a quote before sending to a buyer.
 * This specifically handles the include pattern: `dealer: { select: { ... } }`.
 */
export function sanitizeDealerInQuote<T extends Record<string, any>>(
  quote: T,
  viewerType: ViewerType,
): T {
  if (viewerType !== 'buyer') return quote;

  const revealStatuses = new Set(['SELECTED', 'ACCEPTED', 'selected', 'accepted']);
  const status = (quote as any).status;

  if (status && revealStatuses.has(status)) {
    return quote;
  }

  const result: any = { ...quote };

  // Sanitize nested dealer object if present
  if (result.dealer && typeof result.dealer === 'object') {
    result.dealer = stripFields(result.dealer, DEALER_IDENTITY_FIELDS);
  }

  return result as T;
}

/**
 * Sanitize the nested `inquiry` object within a dealer response / quote
 * before sending to a dealer.
 */
export function sanitizeInquiryInResponse<T extends Record<string, any>>(
  response: T,
  viewerType: ViewerType,
): T {
  if (viewerType !== 'dealer') return response;

  const result: any = { ...response };

  // Sanitize nested inquiry object if present
  if (result.inquiry && typeof result.inquiry === 'object') {
    result.inquiry = stripFields(result.inquiry, BUYER_IDENTITY_FIELDS);
  }

  return result as T;
}

/**
 * Sanitize the nested `user` object in an RFQ before sending to a dealer.
 */
export function sanitizeUserInRFQ<T extends Record<string, any>>(
  rfq: T,
  viewerType: ViewerType,
): T {
  if (viewerType !== 'dealer') return rfq;

  const result: any = { ...rfq };

  if (result.user && typeof result.user === 'object') {
    result.user = stripFields(result.user, BUYER_IDENTITY_FIELDS);
  }

  return result as T;
}

// ---------------------------------------------------------------------------
// Identity reveal logic
// ---------------------------------------------------------------------------

/**
 * Check whether identity can be revealed for a given inquiry+dealer pair.
 * Identity is revealed when:
 * - An InquiryDealerResponse exists with status = 'selected' or 'accepted', OR
 * - The inquiry itself has been closed with this dealer's quote selected.
 */
export async function canRevealIdentityForInquiry(
  inquiryId: string,
  dealerId: string,
): Promise<boolean> {
  const response = await prisma.inquiryDealerResponse.findFirst({
    where: {
      inquiryId,
      dealerId,
      status: { in: ['selected', 'accepted'] },
    },
  });

  return response !== null;
}

/**
 * Check whether identity can be revealed for a given RFQ+dealer pair.
 * Identity is revealed when a Quote exists with status SELECTED.
 */
export async function canRevealIdentityForRFQ(
  rfqId: string,
  dealerId: string,
): Promise<boolean> {
  const quote = await prisma.quote.findFirst({
    where: {
      rfqId,
      dealerId,
      status: 'SELECTED',
    },
  });

  return quote !== null;
}

/**
 * Generic check: can identity be revealed for a given quote (by its ID)?
 */
export async function canRevealIdentityForQuote(quoteId: string): Promise<boolean> {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { status: true },
  });

  if (!quote) return false;
  return quote.status === 'SELECTED';
}

/**
 * Check if a quote's status is one that allows identity reveal.
 */
export function isQuoteSelected(status: string): boolean {
  const revealStatuses = new Set(['SELECTED', 'ACCEPTED', 'selected', 'accepted']);
  return revealStatuses.has(status);
}
