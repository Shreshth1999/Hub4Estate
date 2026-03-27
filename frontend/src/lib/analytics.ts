import posthog from 'posthog-js';

// ─── Init ─────────────────────────────────────────────────────────────────────
// Replace VITE_POSTHOG_KEY in Amplify env vars with your PostHog project API key
// Get it at: https://app.posthog.com → Project Settings → API Keys
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export function initAnalytics() {
  if (!POSTHOG_KEY) return; // Skip if no key set (local dev without key)

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,         // Auto-capture page views
    capture_pageleave: true,        // Capture when user leaves page (for time on page)
    autocapture: true,              // Auto-capture all clicks, form submits, inputs
    session_recording: {
      maskAllInputs: false,         // Record form inputs (mask if you want privacy)
      maskInputOptions: { password: true, creditCard: true },
    },
    persistence: 'localStorage',
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug(); // Debug logs in dev
    },
  });
}

// ─── Identify user ─────────────────────────────────────────────────────────────
export function identifyUser(user: {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  city?: string;
  type?: string;
}) {
  if (!POSTHOG_KEY) return;
  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
    role: user.role,
    city: user.city,
    userType: user.type,
  });
}

export function resetUser() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

// ─── Track events ──────────────────────────────────────────────────────────────
export function track(event: string, properties?: Record<string, any>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

// ─── Pre-built event helpers ───────────────────────────────────────────────────

// Inquiry
export const Analytics = {
  // Inquiry flow
  inquiryStarted: () => track('inquiry_started'),
  inquirySubmitted: (data: { city: string; hasPhoto: boolean; hasModel: boolean }) =>
    track('inquiry_submitted', data),
  inquiryTracked: (by: 'phone' | 'number') =>
    track('inquiry_tracked', { searchBy: by }),

  // Dealer
  dealerRegisterStarted: () => track('dealer_register_started'),
  dealerRegisterStep: (step: number, stepName: string) =>
    track('dealer_register_step', { step, stepName }),
  dealerRegisterCompleted: () => track('dealer_register_completed'),
  dealerLoginSuccess: () => track('dealer_login_success'),

  // AI Chat
  sparkOpened: () => track('spark_opened'),
  sparkMessageSent: (isVoice: boolean) =>
    track('spark_message_sent', { isVoice }),
  sparkSessionError: () => track('spark_session_error'),

  // Navigation
  navClicked: (item: string) => track('nav_clicked', { item }),
  ctaClicked: (cta: string, location: string) =>
    track('cta_clicked', { cta, location }),

  // Products
  productViewed: (productId: string, productName: string) =>
    track('product_viewed', { productId, productName }),
  categoryViewed: (category: string) =>
    track('category_viewed', { category }),
  productSearched: (query: string, resultsCount: number) =>
    track('product_searched', { query, resultsCount }),

  // RFQ
  rfqStarted: () => track('rfq_started'),
  rfqPublished: (itemCount: number, city: string) =>
    track('rfq_published', { itemCount, city }),
  rfqQuoteSelected: (rfqId: string) =>
    track('rfq_quote_selected', { rfqId }),

  // Auth
  loginStarted: (method: 'otp' | 'google' | 'dealer') =>
    track('login_started', { method }),
  loginCompleted: (method: string, userType: string) =>
    track('login_completed', { method, userType }),
  signupCompleted: (userType: string, city: string) =>
    track('signup_completed', { userType, city }),
};
