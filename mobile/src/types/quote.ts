export interface QuoteItem {
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  inquiryId: string;
  dealerId: string;
  dealerName: string;
  dealerPhone: string;
  dealerRating?: number;
  items: QuoteItem[];
  totalAmount: number;
  deliveryTime: string; // e.g., "2-3 days"
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CreateQuoteData {
  inquiryId: string;
  items: QuoteItem[];
  deliveryTime: string;
  notes?: string;
}
