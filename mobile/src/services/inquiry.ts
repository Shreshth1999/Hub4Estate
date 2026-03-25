import api from './api';
import { Inquiry, CreateInquiryData } from '../types/inquiry';

export const inquiryService = {
  // Submit new inquiry
  submitInquiry: async (data: CreateInquiryData): Promise<Inquiry> => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('deliveryCity', data.deliveryCity);
    formData.append('quantity', data.quantity.toString());

    if (data.modelNumber) {
      formData.append('modelNumber', data.modelNumber);
    }

    if (data.productPhoto) {
      formData.append('productPhoto', data.productPhoto as any);
    }

    if (data.aiScanData) {
      formData.append('aiScanData', JSON.stringify(data.aiScanData));
    }

    const response = await api.post<Inquiry>('/inquiry/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get user's inquiries
  getMyInquiries: async (): Promise<Inquiry[]> => {
    const response = await api.get<Inquiry[]>('/inquiry/my-inquiries');
    return response.data;
  },

  // Get inquiry by ID
  getInquiryById: async (id: string): Promise<Inquiry> => {
    const response = await api.get<Inquiry>(`/inquiry/${id}`);
    return response.data;
  },

  // Track inquiry by phone and inquiry number
  trackInquiry: async (phone: string, inquiryNumber: string): Promise<Inquiry> => {
    const response = await api.get<Inquiry>('/inquiry/track', {
      params: { phone, inquiryNumber },
    });
    return response.data;
  },
};
