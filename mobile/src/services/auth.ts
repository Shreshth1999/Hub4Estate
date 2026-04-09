import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import type { AuthUser, OTPVerifyResult } from '../types/auth';

// Re-export for convenience
export type { AuthUser, OTPVerifyResult };

export interface OTPSendResult {
  message: string;
  debug_otp?: string; // dev only
}

// ── Storage helpers ───────────────────────────────────────────────────────────

const KEYS = {
  accessToken: 'h4e_access_token',
  refreshToken: 'h4e_refresh_token',
  user: 'h4e_user',
} as const;

async function storeSession(token: string, refreshToken: string, user: AuthUser) {
  await SecureStore.setItemAsync(KEYS.accessToken, token);
  await SecureStore.setItemAsync(KEYS.refreshToken, refreshToken);
  await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
}

async function clearSession() {
  await SecureStore.deleteItemAsync(KEYS.accessToken);
  await SecureStore.deleteItemAsync(KEYS.refreshToken);
  await AsyncStorage.removeItem(KEYS.user);
}

// ── Auth Service ──────────────────────────────────────────────────────────────

function handleAxiosError(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || fallback);
  }
  throw new Error(fallback);
}

export const authService = {
  // Step 1: Request OTP (phone or email)
  sendOTP: async (params: {
    phone?: string;
    email?: string;
    type: 'login' | 'signup';
  }): Promise<OTPSendResult> => {
    try {
      const res = await api.post<OTPSendResult>('/auth/send-otp', params);
      return res.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to send OTP');
    }
  },

  // Step 2: Verify OTP
  verifyOTP: async (params: {
    phone?: string;
    email?: string;
    otp: string;
    type: 'login' | 'signup';
  }): Promise<OTPVerifyResult> => {
    try {
      const res = await api.post<OTPVerifyResult>('/auth/verify-otp', params);

      if (res.data.token && res.data.user) {
        // Existing user — get refresh token too
        const refreshRes = await api.post<{ refreshToken: string }>('/auth/refresh-token', {}).catch(() => null);
        const refreshToken = refreshRes?.data?.refreshToken || '';
        await storeSession(res.data.token, refreshToken, res.data.user);
      }

      return res.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to verify OTP');
    }
  },

  // Step 3a: Complete signup (new user, after OTP verified)
  signupUser: async (params: {
    name: string;
    phone?: string;
    email?: string;
    city?: string;
  }): Promise<{ token: string; refreshToken: string; user: AuthUser }> => {
    try {
      const res = await api.post<{ token: string; user: AuthUser }>('/auth/user/signup', params);

      // Issue refresh token
      let refreshToken = '';
      try {
        const rt = await api.post<{ refreshToken: string }>('/auth/refresh-token', {});
        refreshToken = rt.data.refreshToken;
      } catch {}

      await storeSession(res.data.token, refreshToken, res.data.user);
      return { ...res.data, refreshToken };
    } catch (error) {
      handleAxiosError(error, 'Failed to create account');
    }
  },

  // Step 3b: Complete profile (role, city)
  completeProfile: async (params: {
    role?: string;
    city?: string;
    purpose?: string;
    phone?: string;
  }): Promise<{ token: string; user: AuthUser }> => {
    try {
      const res = await api.post<{ token: string; user: AuthUser }>('/auth/complete-profile', params);
      const stored = await authService.getStoredRefreshToken();
      await storeSession(res.data.token, stored || '', res.data.user);
      return res.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to complete profile');
    }
  },

  // Dealer login (email + password)
  dealerLogin: async (email: string, password: string): Promise<{ token: string; refreshToken: string; dealer: AuthUser }> => {
    try {
      const res = await api.post<{ token: string; dealer: any }>('/auth/dealer/login', { email, password });

      let refreshToken = '';
      try {
        const rt = await api.post<{ refreshToken: string }>('/auth/refresh-token', {});
        refreshToken = rt.data.refreshToken;
      } catch {}

      const user: AuthUser = {
        id: res.data.dealer.id,
        name: res.data.dealer.businessName,
        email: res.data.dealer.email,
        phone: res.data.dealer.phone,
        type: 'dealer',
        status: res.data.dealer.status,
        city: res.data.dealer.city,
      };

      await storeSession(res.data.token, refreshToken, user);
      return { token: res.data.token, refreshToken, dealer: user };
    } catch (error) {
      handleAxiosError(error, 'Login failed');
    }
  },

  // Rotate access token using refresh token
  refreshAccessToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
      if (!refreshToken) return null;

      const res = await api.post<{ token: string; refreshToken: string; user: AuthUser }>(
        '/auth/refresh-token',
        { refreshToken }
      );

      await SecureStore.setItemAsync(KEYS.accessToken, res.data.token);
      await SecureStore.setItemAsync(KEYS.refreshToken, res.data.refreshToken);
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(res.data.user));

      return res.data.token;
    } catch {
      return null;
    }
  },

  // Get stored access token
  getAccessToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(KEYS.accessToken);
  },

  getStoredRefreshToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(KEYS.refreshToken);
  },

  // Get current user from storage (no network call)
  getStoredUser: async (): Promise<AuthUser | null> => {
    try {
      const json = await AsyncStorage.getItem(KEYS.user);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  // Verify token with backend and get fresh user data
  getMe: async (): Promise<AuthUser | null> => {
    try {
      const res = await api.get<{ user: AuthUser }>('/auth/me');
      const user = res.data.user;
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },

  // Logout (revoke refresh token + clear local storage)
  logout: async (): Promise<void> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      await clearSession();
    }
  },

  // Check if user has a stored access token
  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync(KEYS.accessToken);
    return !!token;
  },
};
