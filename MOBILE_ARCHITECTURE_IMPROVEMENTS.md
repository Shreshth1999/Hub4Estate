# 🏗️ Mobile Architecture - Improvements & Alternatives

## Current Architecture vs Alternatives

### 1. State Management

#### Current: Context API ✅
```typescript
// Planned approach
<AuthContext.Provider value={{ user, login, logout }}>
  <App />
</AuthContext.Provider>
```

**Pros**:
- ✅ Built-in, no dependencies
- ✅ Simple for small apps
- ✅ Sufficient for our use case

**Cons**:
- ⚠️ Re-renders entire tree on updates
- ⚠️ No dev tools
- ⚠️ Boilerplate for complex state

#### Alternative 1: Redux Toolkit ⭐ RECOMMENDED FOR SCALE
```typescript
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    auth: authReducer,
    inquiries: inquiriesReducer,
  },
});
```

**When to switch**:
- App grows beyond 10 screens
- Need time-travel debugging
- Complex state updates
- Team grows

**Migration path**: Can add Redux later without rewriting everything

---

#### Alternative 2: Zustand (Modern, Lightweight)
```typescript
import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

**Pros**:
- Minimal boilerplate
- No providers needed
- TypeScript-friendly

**Recommendation**: Consider for next iteration

---

### 2. Data Fetching

#### Current: Manual Axios Calls ✅
```typescript
const inquiries = await inquiryService.getMyInquiries();
setInquiries(inquiries);
```

**Pros**:
- ✅ Simple and direct
- ✅ Full control
- ✅ No learning curve

**Cons**:
- ⚠️ Manual loading/error states
- ⚠️ No caching
- ⚠️ No automatic refetching

#### Alternative: React Query (TanStack Query) ⭐ RECOMMENDED
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['inquiries'],
  queryFn: inquiryService.getMyInquiries,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Benefits**:
- Auto caching
- Background refetching
- Optimistic updates
- Built-in loading/error states

**When to add**: If app feels slow or you need offline support

**Installation**:
```bash
npm install @tanstack/react-query
```

---

### 3. Navigation Structure

#### Current: Stack + Bottom Tabs (Planned)
```
RootNavigator
├── AuthStack (Login/Signup)
├── BuyerTabs (Home/Inquiries/Profile)
└── DealerTabs (Dashboard/Quotes/Profile)
```

**Recommendation**: ✅ This is correct!

#### Enhancement: Deep Linking
```typescript
const linking = {
  prefixes: ['hub4estate://', 'https://hub4estate.com'],
  config: {
    screens: {
      Buyer: {
        InquiryDetails: 'inquiry/:id',
        QuoteDetails: 'quote/:id',
      },
    },
  },
};

<NavigationContainer linking={linking}>
```

**Benefits**:
- Share inquiry links
- Push notification deep links
- Better UX

**Recommendation**: ⭐ Add this (easy win)

---

### 4. Form Management

#### Current: useState (Planned)
```typescript
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [errors, setErrors] = useState({});
```

**Works for**: Simple forms (2-3 fields)

#### Alternative: React Hook Form ⭐ RECOMMENDED
```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: { name: '', email: '' },
});

const onSubmit = (data) => {
  authService.signup(data);
};
```

**Benefits**:
- Less boilerplate
- Built-in validation
- Better performance (less re-renders)

**When to use**: Forms with 4+ fields (Signup, Submit Inquiry)

**Installation**:
```bash
npm install react-hook-form
```

---

### 5. Component Library

#### Current: Custom Components (Planned)
```typescript
// components/common/Button.tsx
export const Button = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);
```

**Pros**:
- Full control
- Matches web design exactly

**Cons**:
- Time-consuming
- Need to handle all edge cases

#### Alternative 1: React Native Paper
```typescript
import { Button } from 'react-native-paper';

<Button mode="contained" onPress={handlePress}>
  Submit
</Button>
```

**Pros**:
- Material Design out-of-box
- Accessibility built-in
- Theming support

**Cons**:
- Design might not match web

#### Alternative 2: NativeBase
```typescript
import { Button } from 'native-base';

<Button colorScheme="purple" variant="solid">
  Submit
</Button>
```

**Recommendation**:
- **MVP**: Build custom (full control, matches web)
- **Future**: Consider UI library if team grows

---

### 6. Image Handling

#### Current: expo-image-picker + Manual FormData

#### Enhancement 1: Image Compression ⭐ REQUIRED
```typescript
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (uri: string) => {
  return await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: 1920 } }, // Max width
    ],
    {
      compress: 0.7, // 70% quality
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
};

// Use before upload
const compressed = await compressImage(photoUri);
await aiScanService.scanImage(compressed.uri);
```

**Installation**:
```bash
npx expo install expo-image-manipulator
```

**Impact**: 80% smaller files, 5x faster uploads!

---

#### Enhancement 2: Image Caching (expo-image)
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: productImageUrl }}
  cachePolicy="memory-disk" // Auto caching!
  style={{ width: 200, height: 200 }}
/>
```

**Benefits**:
- Automatic caching
- Better performance
- Placeholder support

**Installation**:
```bash
npx expo install expo-image
```

---

### 7. API Configuration

#### Current Issue: Hardcoded localhost
```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'  // ⚠️ Won't work on devices
  : 'https://hub4estate.com/api';
```

#### Solution 1: Dynamic IP Detection ⭐ REQUIRED
```typescript
import Constants from 'expo-constants';

const getApiUrl = () => {
  if (!__DEV__) {
    return 'https://hub4estate.com/api';
  }

  // Get local network IP from Expo
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (!debuggerHost) {
    console.warn('Could not get debugger host, using localhost');
    return 'http://localhost:3001/api';
  }

  return `http://${debuggerHost}:3001/api`;
};

const API_BASE_URL = getApiUrl();
```

**How it works**:
- Expo dev server runs on your computer's IP (e.g., 192.168.1.100)
- App connects to that IP automatically
- Works on both simulator and physical devices

---

#### Solution 2: Environment Variables (Production)
```typescript
// .env.development
API_URL=http://192.168.1.100:3001/api

// .env.production
API_URL=https://hub4estate.com/api

// app.config.js
export default {
  extra: {
    apiUrl: process.env.API_URL,
  },
};

// Usage
import Constants from 'expo-constants';
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl;
```

**Recommendation**: Use Solution 1 for now, add env vars for production builds

---

### 8. Authentication Security

#### Current: AsyncStorage (Not Secure)
```typescript
await AsyncStorage.setItem('authToken', token);
```

**Problem**: AsyncStorage is NOT encrypted!

#### Solution: Expo SecureStore ⭐ REQUIRED
```typescript
import * as SecureStore from 'expo-secure-store';

// Store token securely
await SecureStore.setItemAsync('authToken', token);

// Retrieve token
const token = await SecureStore.getItemAsync('authToken');

// Delete token
await SecureStore.deleteItemAsync('authToken');
```

**Benefits**:
- Encrypted storage
- Uses Keychain (iOS) / Keystore (Android)
- Same API as AsyncStorage

**Installation**:
```bash
npx expo install expo-secure-store
```

**Migration**:
```typescript
// services/auth.ts - UPDATED
import * as SecureStore from 'expo-secure-store';

login: async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const { token, user } = response.data;

  // Secure token storage
  await SecureStore.setItemAsync('authToken', token);

  // User data can stay in AsyncStorage (not sensitive)
  await AsyncStorage.setItem('user', JSON.stringify(user));

  return response.data;
},
```

---

### 9. Error Handling Strategy

#### Current: No error handling

#### Recommended Pattern:
```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any): AppError => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'Something went wrong';
    const statusCode = error.response?.status;

    return new AppError(message, 'API_ERROR', statusCode);
  }

  if (error.message === 'Network Error') {
    return new AppError(
      'No internet connection. Please check your network.',
      'NETWORK_ERROR'
    );
  }

  return new AppError(error.message || 'Unknown error', 'UNKNOWN_ERROR');
};

// Usage in services
try {
  const response = await api.post('/auth/login', credentials);
  return response.data;
} catch (error) {
  throw handleApiError(error);
}
```

**Benefits**:
- Consistent error messages
- User-friendly text
- Easier debugging

---

### 10. Push Notifications Architecture

#### Planned: Expo Notifications

#### Enhanced Setup:
```typescript
// utils/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }

  // Get Expo push token
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;

  return token;
};

// Send token to backend
export const savePushToken = async (token: string) => {
  await api.post('/users/push-token', { token });
};
```

**Usage**:
```typescript
// On login
const pushToken = await registerForPushNotifications();
if (pushToken) {
  await savePushToken(pushToken);
}

// Listen for notifications
Notifications.addNotificationReceivedListener((notification) => {
  console.log('Notification received:', notification);
});

Notifications.addNotificationResponseReceivedListener((response) => {
  // Handle notification tap
  const data = response.notification.request.content.data;
  if (data.inquiryId) {
    navigation.navigate('InquiryDetails', { id: data.inquiryId });
  }
});
```

---

## Architecture Decisions Summary

### ✅ Keep As-Is (Good Decisions)
1. React Native + Expo
2. TypeScript
3. Axios for API calls
4. Context API for state (MVP)
5. Custom components (full control)
6. Stack + Tab navigation

### ⚠️ Must Change (Critical)
1. **localhost URL** → Dynamic IP detection
2. **AsyncStorage for tokens** → SecureStore
3. **No image compression** → Add ImageManipulator
4. **No error handling** → Centralized error handler

### 💡 Should Add (High Value)
1. React Query (data fetching)
2. Deep linking (better UX)
3. React Hook Form (complex forms)
4. Image caching (expo-image)
5. Proper error messages

### 🔮 Future Enhancements (Post-MVP)
1. Redux Toolkit (if app grows)
2. UI component library
3. Offline support
4. Analytics (Amplitude, Mixpanel)
5. Crash reporting (Sentry)

---

## Implementation Priority

### Phase 1: Critical Fixes (Do Now)
1. Dynamic API URL
2. SecureStore for tokens
3. Image compression
4. Error handling

### Phase 2: High Value (This Week)
1. Deep linking
2. React Hook Form
3. Image caching
4. Push notifications setup

### Phase 3: Nice to Have (Next Sprint)
1. React Query
2. Better offline handling
3. Analytics
4. Crash reporting

---

## Code Examples for Each Improvement

See `MOBILE_IMPROVEMENTS_CODE.md` for complete implementation examples.

---

## Recommendation

**For MVP Launch**:
1. Apply Phase 1 fixes (2 hours)
2. Build UI with current architecture (1 day)
3. Test thoroughly (1 day)
4. Launch MVP

**Post-MVP**:
1. Add Phase 2 improvements based on user feedback
2. Monitor performance and scale accordingly
3. Add Phase 3 features as needed

**Current architecture is 90% ready - just needs critical security/stability fixes!**
