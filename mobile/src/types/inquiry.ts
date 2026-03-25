export interface InquiryItem {
  productName: string;
  quantity: number;
  unit: string;
  brand?: string;
  modelNumber?: string;
  notes?: string;
  confidence?: number;
}

export interface Inquiry {
  id: string;
  inquiryNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: InquiryItem[];
  deliveryCity: string;
  status: 'pending' | 'quoted' | 'accepted' | 'completed';
  quoteCount: number;
  productPhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryData {
  name: string;
  phone: string;
  modelNumber?: string;
  quantity: number;
  deliveryCity: string;
  productPhoto?: {
    uri: string;
    type: string;
    name: string;
  };
  aiScanData?: InquiryItem[];
}
