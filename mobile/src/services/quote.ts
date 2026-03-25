import api from './api';
import { Quote, CreateQuoteData } from '../types/quote';

export const quoteService = {
  // Submit quote (dealer)
  submitQuote: async (data: CreateQuoteData): Promise<Quote> => {
    const response = await api.post<Quote>('/quotes/submit', data);
    return response.data;
  },

  // Get quotes for an inquiry (buyer)
  getQuotesForInquiry: async (inquiryId: string): Promise<Quote[]> => {
    const response = await api.get<Quote[]>(`/quotes/inquiry/${inquiryId}`);
    return response.data;
  },

  // Get dealer's submitted quotes
  getMyQuotes: async (): Promise<Quote[]> => {
    const response = await api.get<Quote[]>('/quotes/my-quotes');
    return response.data;
  },

  // Accept quote (buyer)
  acceptQuote: async (quoteId: string): Promise<Quote> => {
    const response = await api.post<Quote>(`/quotes/${quoteId}/accept`);
    return response.data;
  },

  // Reject quote (buyer)
  rejectQuote: async (quoteId: string): Promise<Quote> => {
    const response = await api.post<Quote>(`/quotes/${quoteId}/reject`);
    return response.data;
  },
};
