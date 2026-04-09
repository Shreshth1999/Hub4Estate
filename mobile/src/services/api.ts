import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Storage keys — must match auth.ts KEYS
const STORAGE_KEYS = {
  accessToken: 'h4e_access_token',
  refreshToken: 'h4e_refresh_token',
  user: 'h4e_user',
} as const;

// Get API Base URL - Works on simulators AND physical devices
const getApiUrl = () => {
  if (!__DEV__) {
    return 'https://hub4estate.com/api';
  }

  // Development - Get Expo dev server IP (works on physical devices!)
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (!debuggerHost) {
    return 'http://localhost:3001/api';
  }

  return `http://${debuggerHost}:3001/api`;
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - Add auth token from SecureStore
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore may fail on web — non-critical
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 + network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
      } catch {
        // cleanup is best-effort
      }
    }

    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
