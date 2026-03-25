// Aligned with actual backend schema

export type UserType = 'user' | 'dealer' | 'admin';

export type UserRole =
  | 'INDIVIDUAL_HOME_BUILDER'
  | 'RENOVATION_HOMEOWNER'
  | 'ARCHITECT'
  | 'INTERIOR_DESIGNER'
  | 'CONTRACTOR'
  | 'ELECTRICIAN'
  | 'SMALL_BUILDER'
  | 'DEVELOPER';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role?: UserRole | null;
  city?: string | null;
  type: UserType;
  status?: string;
  profileComplete?: boolean;
  profileImage?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// OTP flow
export interface SendOTPParams {
  phone?: string;
  email?: string;
  type: 'login' | 'signup';
}

export interface VerifyOTPParams {
  phone?: string;
  email?: string;
  otp: string;
  type: 'login' | 'signup';
}

export interface OTPVerifyResult {
  requiresProfile?: boolean;
  identifier?: string;
  identifierType?: 'phone' | 'email';
  token?: string;
  refreshToken?: string;
  user?: AuthUser;
}

// Dealer login
export interface DealerLoginParams {
  email: string;
  password: string;
}
