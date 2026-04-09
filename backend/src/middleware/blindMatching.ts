/**
 * Blind Matching Middleware
 *
 * Express middleware/helpers that strip identity fields from API responses
 * so that neither buyer nor dealer sees the other's identity until a quote
 * is selected.
 *
 * Usage in routes:
 *   import { stripBuyerIdentity, stripDealerIdentity } from '../middleware/blindMatching';
 *
 *   // Before sending inquiry data to a dealer:
 *   const safe = stripBuyerIdentity(inquiryData);
 *
 *   // Before sending quote/dealer data to a buyer:
 *   const safe = stripDealerIdentity(quoteData);
 *   const safe = stripDealerIdentity(quoteData, quoteData.status); // auto-reveal if SELECTED
 */

import {
  sanitizeBuyerData,
  sanitizeDealerData,
  sanitizeDealerInQuote,
  sanitizeInquiryInResponse,
  sanitizeUserInRFQ,
  isQuoteSelected,
  type ViewerType,
} from '../services/blind-matching.service';

// ---------------------------------------------------------------------------
// Convenience wrappers for direct use in route handlers
// ---------------------------------------------------------------------------

/**
 * Strip buyer identity fields (name, phone, email, address) from data.
 * Use this before returning inquiry/RFQ data to a dealer.
 *
 * @param data  The inquiry or RFQ object (or array of objects)
 * @returns     A new object with buyer PII replaced by '[hidden]'
 */
export function stripBuyerIdentity<T extends Record<string, any>>(data: T): T;
export function stripBuyerIdentity<T extends Record<string, any>>(data: T[]): T[];
export function stripBuyerIdentity<T extends Record<string, any>>(data: T | T[]): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeBuyerData(item, 'dealer'));
  }
  return sanitizeBuyerData(data, 'dealer');
}

/**
 * Strip dealer identity fields (businessName, GST, phone, email, etc.) from data.
 * Use this before returning quote/dealer data to a buyer.
 *
 * If quoteStatus is 'SELECTED' or 'ACCEPTED', the data is returned unmodified
 * (identity reveal is authorized).
 *
 * @param data         The quote or dealer object (or array)
 * @param quoteStatus  Optional — the quote's current status
 * @returns            A new object with dealer PII replaced by '[hidden]'
 */
export function stripDealerIdentity<T extends Record<string, any>>(
  data: T,
  quoteStatus?: string,
): T;
export function stripDealerIdentity<T extends Record<string, any>>(
  data: T[],
  quoteStatus?: string,
): T[];
export function stripDealerIdentity<T extends Record<string, any>>(
  data: T | T[],
  quoteStatus?: string,
): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => {
      const status = quoteStatus || (item as any).status;
      return sanitizeDealerData(item, 'buyer', status);
    });
  }
  return sanitizeDealerData(data, 'buyer', quoteStatus);
}

/**
 * Sanitize a quote object that has a nested `dealer` include.
 * Strips dealer identity from the nested `dealer` object unless quote is SELECTED.
 */
export function stripDealerFromQuote<T extends Record<string, any>>(quote: T): T;
export function stripDealerFromQuote<T extends Record<string, any>>(quotes: T[]): T[];
export function stripDealerFromQuote<T extends Record<string, any>>(data: T | T[]): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDealerInQuote(item, 'buyer'));
  }
  return sanitizeDealerInQuote(data, 'buyer');
}

/**
 * Sanitize a dealer response/quote that has a nested `inquiry` include.
 * Strips buyer identity from the nested `inquiry` object.
 */
export function stripBuyerFromInquiryResponse<T extends Record<string, any>>(data: T): T;
export function stripBuyerFromInquiryResponse<T extends Record<string, any>>(data: T[]): T[];
export function stripBuyerFromInquiryResponse<T extends Record<string, any>>(
  data: T | T[],
): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInquiryInResponse(item, 'dealer'));
  }
  return sanitizeInquiryInResponse(data, 'dealer');
}

/**
 * Sanitize an RFQ that has a nested `user` include.
 * Strips buyer identity from the nested `user` object.
 */
export function stripBuyerFromRFQ<T extends Record<string, any>>(rfq: T): T;
export function stripBuyerFromRFQ<T extends Record<string, any>>(rfqs: T[]): T[];
export function stripBuyerFromRFQ<T extends Record<string, any>>(data: T | T[]): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeUserInRFQ(item, 'dealer'));
  }
  return sanitizeUserInRFQ(data, 'dealer');
}

// Re-export the status check for convenience
export { isQuoteSelected };
