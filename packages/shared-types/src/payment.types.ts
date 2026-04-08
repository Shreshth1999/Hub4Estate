// ============================================
// Payment & Invoice Types
// ============================================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export interface Payment {
  id: string;
  /** Internal order reference */
  orderId: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  /** Amount in paise */
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** upi, card, netbanking, wallet */
  method: string | null;
  /** User or dealer ID */
  payerAccountId: string;
  /** "user" or "dealer" */
  payerAccountType: string;
  description: string | null;
  /** JSON string with additional metadata */
  metadata: string | null;
  failureReason: string | null;
  /** Refunded amount in paise */
  refundedAmount: number | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  /** Formatted invoice number, e.g. H4E-INV-2026-0001 */
  invoiceNumber: string;
  buyerName: string;
  buyerGstin: string | null;
  buyerAddress: string | null;
  sellerName: string;
  sellerGstin: string;
  /** JSON array of line items */
  items: string;
  /** Subtotal in paise */
  subtotalPaise: number;
  /** CGST in paise */
  cgstPaise: number;
  /** SGST in paise */
  sgstPaise: number;
  /** IGST in paise (0 for intra-state) */
  igstPaise: number;
  /** Total in paise */
  totalPaise: number;
  /** SAC code for GST classification */
  sacCode: string;
  isInterState: boolean;
  /** S3 key for the generated PDF */
  pdfUrl: string | null;
  createdAt: string;
}
