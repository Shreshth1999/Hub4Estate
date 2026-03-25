import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get API Base URL - Works on simulators AND physical devices
const getApiUrl = () => {
  if (!__DEV__) {
    // Production
    return 'https://hub4estate.com/api';
  }

  // Development - Get Expo dev server IP (works on physical devices!)
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (!debuggerHost) {
    console.warn('Could not detect Expo host, using localhost');
    return 'http://localhost:3001/api';
  }

  // Use same IP as Expo dev server
  const apiUrl = `http://${debuggerHost}:3001/api`;
  console.log('📡 API URL:', apiUrl);
  return apiUrl;
};

const API_BASE_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token from SecureStore
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear secure token and user data
      try {
        await SecureStore.deleteItemAsync('authToken');
        await AsyncStorage.removeItem('user');
      } catch (cleanupError) {
        console.error('Error during unauthorized cleanup:', cleanupError);
      }
      // You can emit an event here to trigger logout in the app
    }

    // Enhanced error messages
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
