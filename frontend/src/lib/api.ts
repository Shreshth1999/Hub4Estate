import axios from 'axios';

// Use relative URL to go through Vite proxy in development
// This avoids CORS issues entirely
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout to prevent hanging
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // Verify current token and get user data - call this on app mount
  getMe: () => api.get('/auth/me'),

  // User Auth - OTP based
  sendOTP: (data: { phone?: string; email?: string; type: 'login' | 'signup' }) =>
    api.post('/auth/send-otp', data),
  verifyOTP: (data: { phone?: string; email?: string; otp: string; type: 'login' | 'signup' }) =>
    api.post('/auth/verify-otp', data),

  // User signup completion (after OTP verification)
  userSignup: (data: { name: string; phone?: string; email?: string; city?: string }) =>
    api.post('/auth/user/signup', data),

  // Google OAuth
  googleCallback: (token: string) => api.post('/auth/google/callback', { token }),

  // Complete profile (for both OAuth and OTP users)
  completeProfile: (data: any) => api.post('/auth/complete-profile', data),

  // Dealer Auth - Email/Password based
  dealerRegister: (data: any) => api.post('/auth/dealer/register', data),
  dealerLogin: (data: { email: string; password: string }) =>
    api.post('/auth/dealer/login', data),

  // Admin Auth
  adminLogin: (data: { email: string; password: string }) =>
    api.post('/auth/admin/login', data),

  // Password reset
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
};

// Products API
export const productsApi = {
  getCategories: () => api.get('/products/categories'),
  getCategory: (slug: string) => api.get(`/products/categories/${slug}`),
  getCategoryBySlug: (slug: string) => api.get(`/products/categories/${slug}`),
  getProduct: (id: string) => api.get(`/products/${id}`),
  searchProducts: (params: any) => api.get('/products/search/query', { params }),
  saveProduct: (id: string, notes?: string) => api.post(`/products/${id}/save`, { notes }),
  getSavedProducts: () => api.get('/products/saved/list'),
};

// RFQ API
export const rfqApi = {
  create: (data: any) => api.post('/rfq', data),
  createRFQ: (data: any) => api.post('/rfq', data),
  publish: (id: string) => api.post(`/rfq/${id}/publish`),
  publishRFQ: (id: string) => api.post(`/rfq/${id}/publish`),
  list: (params?: any) => api.get('/rfq', { params }),
  getMyRFQs: (params?: any) => api.get('/rfq', { params }),
  getRFQ: (id: string) => api.get(`/rfq/${id}`),
  getById: (id: string) => api.get(`/rfq/${id}`),
  selectQuote: (rfqId: string, quoteId: string) =>
    api.post(`/rfq/${rfqId}/select-quote`, { quoteId }),
  cancelRFQ: (id: string) => api.post(`/rfq/${id}/cancel`),
};

// Quotes API (Dealer)
export const quotesApi = {
  getAvailableRFQs: () => api.get('/quotes/available-rfqs'),
  submitQuote: (data: any) => api.post('/quotes/submit', data),
  getMyQuotes: (params?: any) => api.get('/quotes/my-quotes', { params }),
  getAnalytics: () => api.get('/quotes/analytics'),
};

// Dealer API
export const dealerApi = {
  getProfile: () => api.get('/dealer/profile'),
  updateProfile: (data: any) => api.patch('/dealer/profile', data),
  addBrand: (data: any) => api.post('/dealer/brands', data),
  addCategory: (data: any) => api.post('/dealer/categories', data),
  addServiceArea: (data: any) => api.post('/dealer/service-areas', data),
  removeServiceArea: (id: string) => api.delete(`/dealer/service-areas/${id}`),
  getInsights: () => api.get('/dealer/insights'),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getPendingDealers: () => api.get('/admin/dealers/pending'),
  verifyDealer: (id: string, action: 'verify' | 'reject', notes?: string) =>
    api.post(`/admin/dealers/${id}/verify`, { action, notes }),
  suspendDealer: (id: string, reason: string) =>
    api.post(`/admin/dealers/${id}/suspend`, { reason }),
  createCategory: (data: any) => api.post('/admin/categories', data),
  createBrand: (data: any) => api.post('/admin/brands', data),
  createProduct: (data: any) => api.post('/admin/products', data),
  getFraudFlags: () => api.get('/admin/fraud-flags'),
  resolveFraudFlag: (id: string, status: string, notes?: string) =>
    api.post(`/admin/fraud-flags/${id}/resolve`, { status, notes }),
};

// Community API
export const communityApi = {
  getPosts: (params?: any) => api.get('/community/posts', { params }),
  getPost: (id: string) => api.get(`/community/posts/${id}`),
  createPost: (data: any) => api.post('/community/posts', data),
  createComment: (data: any) => api.post('/community/comments', data),
  upvotePost: (id: string) => api.post(`/community/posts/${id}/upvote`),
};

// Knowledge API
export const knowledgeApi = {
  getArticles: (params?: any) => api.get('/knowledge/articles', { params }),
  getArticle: (slug: string) => api.get(`/knowledge/articles/${slug}`),
  getCategories: () => api.get('/knowledge/categories'),
};

// Contact API
export const contactApi = {
  submit: (data: {
    name: string;
    email: string;
    phone?: string;
    role: string;
    message: string;
  }) => api.post('/contact/submit', data),

  // Admin endpoints
  getSubmissions: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/contact/submissions', { params }),
  getSubmission: (id: string) => api.get(`/contact/submissions/${id}`),
  updateSubmission: (id: string, data: { status: string; notes?: string }) =>
    api.patch(`/contact/submissions/${id}`, data),
  deleteSubmission: (id: string) => api.delete(`/contact/submissions/${id}`),
  getStats: () => api.get('/contact/stats'),
};

// Chat API
export const chatApi = {
  createSession: (data?: { email?: string; name?: string }) =>
    api.post('/chat/sessions', data || {}),
  sendMessage: (sessionId: string, message: string) =>
    api.post('/chat/message', { sessionId, message }),
  getMessages: (sessionId: string) =>
    api.get(`/chat/sessions/${sessionId}/messages`),

  // Admin endpoints
  getSessions: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/chat/admin/sessions', { params }),
  getSession: (sessionId: string) => api.get(`/chat/admin/sessions/${sessionId}`),
  getChatStats: () => api.get('/chat/admin/stats'),
  updateSession: (sessionId: string, data: { status: string }) =>
    api.patch(`/chat/admin/sessions/${sessionId}`, data),
};

// CRM API
export const crmApi = {
  // Companies
  getCompanies: (params?: any) => api.get('/crm/companies', { params }),
  getCompany: (id: string) => api.get(`/crm/companies/${id}`),
  createCompany: (data: any) => api.post('/crm/companies', data),
  updateCompany: (id: string, data: any) => api.put(`/crm/companies/${id}`, data),
  deleteCompany: (id: string) => api.delete(`/crm/companies/${id}`),
  bulkImportCompanies: (companies: any[]) => api.post('/crm/companies/bulk-import', { companies }),

  // Contacts
  getContacts: (companyId: string) => api.get(`/crm/companies/${companyId}/contacts`),
  createContact: (data: any) => api.post('/crm/contacts', data),
  updateContact: (id: string, data: any) => api.put(`/crm/contacts/${id}`, data),
  deleteContact: (id: string) => api.delete(`/crm/contacts/${id}`),

  // Outreach
  getOutreaches: (params?: any) => api.get('/crm/outreaches', { params }),
  createOutreach: (data: any) => api.post('/crm/outreaches', data),
  updateOutreach: (id: string, data: any) => api.put(`/crm/outreaches/${id}`, data),
  markOutreachSent: (id: string) => api.post(`/crm/outreaches/${id}/sent`),
  recordResponse: (id: string, data: any) => api.post(`/crm/outreaches/${id}/response`, data),

  // Meetings
  getMeetings: (params?: any) => api.get('/crm/meetings', { params }),
  createMeeting: (data: any) => api.post('/crm/meetings', data),
  updateMeeting: (id: string, data: any) => api.put(`/crm/meetings/${id}`, data),
  completeMeeting: (id: string, data: any) => api.post(`/crm/meetings/${id}/complete`, data),

  // Email Templates
  getEmailTemplates: (category?: string) => api.get('/crm/email-templates', { params: { category } }),
  getEmailTemplate: (id: string) => api.get(`/crm/email-templates/${id}`),
  createEmailTemplate: (data: any) => api.post('/crm/email-templates', data),
  updateEmailTemplate: (id: string, data: any) => api.put(`/crm/email-templates/${id}`, data),

  // Pipeline
  getPipeline: () => api.get('/crm/pipeline'),
};
