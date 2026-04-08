// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  /** "user" or "dealer" */
  userType: string;
  title: string;
  body: string;
  /** JSON payload with navigation data, action type, etc. */
  data: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface DevicePushToken {
  id: string;
  /** Expo push token string */
  token: string;
  userId: string;
  /** "user" or "dealer" */
  userType: string;
  /** "ios" or "android" */
  platform: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
