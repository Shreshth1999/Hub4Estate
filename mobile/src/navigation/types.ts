import { NavigatorScreenParams } from '@react-navigation/native';

// ── Auth Stack ────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Welcome: undefined;
  Login: { type?: 'user' | 'dealer' };
  OTPVerify: {
    phone?: string;
    email?: string;
    otpType: 'login' | 'signup';
    identifierType: 'phone' | 'email';
  };
  ProfileComplete: {
    identifier: string;
    identifierType: 'phone' | 'email';
  };
  DealerLogin: undefined;
};

// ── User Tabs ─────────────────────────────────────────────────────────────────
export type UserTabParamList = {
  HomeTab: NavigatorScreenParams<UserHomeStackParamList>;
  InquiryTab: NavigatorScreenParams<UserInquiryStackParamList>;
  DashboardTab: NavigatorScreenParams<UserDashboardStackParamList>;
};

export type UserHomeStackParamList = {
  Home: undefined;
  Categories: undefined;
  ProductType: { slug: string; name: string };
  ProductDetail: { id: string };
};

export type UserInquiryStackParamList = {
  InquirySubmit: undefined;
  TrackInquiry: { inquiryNumber?: string; phone?: string };
};

export type UserDashboardStackParamList = {
  UserDashboard: undefined;
};

// ── Dealer Tabs ───────────────────────────────────────────────────────────────
export type DealerTabParamList = {
  DashboardTab: NavigatorScreenParams<DealerDashboardStackParamList>;
  InquiriesTab: NavigatorScreenParams<DealerInquiriesStackParamList>;
};

export type DealerDashboardStackParamList = {
  DealerDashboard: undefined;
};

export type DealerInquiriesStackParamList = {
  AvailableInquiries: undefined;
  QuoteSubmit: { inquiryId: string; inquiryNumber: string };
};
