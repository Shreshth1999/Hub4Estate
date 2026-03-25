# 📱 Hub4Estate Mobile App - Complete Plan

## 🎯 Project Overview

**Goal**: Build a cross-platform mobile app (iOS + Android) for Hub4Estate electrical marketplace

**Approach**: **ONE APP** with role-based UI (Buyer mode + Dealer mode)

**Tech Stack**: React Native + Expo + TypeScript

---

## 🏗️ Architecture Decision

### Why ONE APP (Not Two Separate Apps)?

✅ **Easier Maintenance** - Single codebase, shared components
✅ **Code Reusability** - 80% code shared between roles
✅ **User Flexibility** - Users can switch to dealer mode if they start selling
✅ **Faster Development** - Build once, deploy for both roles
✅ **Consistent Experience** - Same design language, shared features

### Tech Stack Rationale

| Technology | Why? |
|------------|------|
| **React Native** | Cross-platform (iOS + Android), shares React knowledge from web app |
| **Expo** | Simplifies development, provides camera/notifications/storage APIs out-of-box |
| **TypeScript** | Type safety, same as web app, better developer experience |
| **React Navigation** | Industry standard for navigation, deep linking support |
| **Axios** | Same API client as web app, reuse interceptors |
| **Expo Camera** | Native camera access for AI scan feature |
| **AsyncStorage** | Local data persistence (user preferences, offline cache) |
| **Expo Notifications** | Push notifications for quotes and inquiries |

---

## 📱 App Structure

### Navigation Architecture

```
App
├── Auth Stack (Not Logged In)
│   ├── Welcome Screen
│   ├── Login Screen
│   └── Signup Screen (with role selection)
│
├── Buyer Stack (Logged in as Buyer)
│   ├── Home (Submit Inquiry with AI Scan)
│   ├── My Inquiries (Track requests)
│   ├── Quotes (View dealer quotes)
│   ├── Products/Categories
│   └── Profile
│
└── Dealer Stack (Logged in as Dealer)
    ├── Dashboard (Available inquiries)
    ├── Submit Quote
    ├── My Quotes (History)
    ├── My Products (Inventory management)
    └── Profile

Bottom Tab Navigator for each stack
```

---

## 🎨 Key Features

### For Buyers (Users):

1. **AI Scan Inquiry Submission** ⭐ FLAGSHIP FEATURE
   - Open camera
   - Capture contractor slip/product photo
   - AI extracts products, quantities, brands
   - Auto-fill inquiry form
   - Submit to dealers

2. **Track Inquiries**
   - View all submitted inquiries
   - See quote count per inquiry
   - Filter by status

3. **View Quotes**
   - Compare quotes from multiple dealers
   - See dealer ratings
   - Accept/reject quotes
   - Chat with dealers

4. **Browse Products**
   - Category browsing
   - Product search
   - Product details

5. **Profile**
   - Edit personal info
   - View purchase history
   - Settings
   - Switch to dealer mode (if registered)

### For Dealers:

1. **View Available Inquiries**
   - Browse new buyer inquiries
   - Filter by category/location
   - See inquiry details

2. **Submit Quotes**
   - Enter price per item
   - Add delivery time
   - Include notes/terms
   - Submit to buyer

3. **Manage Quotes**
   - View submitted quotes
   - Track quote status
   - Quote history

4. **Inventory Management**
   - Add/edit products
   - Set prices
   - Stock management

5. **Dashboard & Analytics**
   - Total quotes submitted
   - Acceptance rate
   - Revenue tracking

---

## 🛠️ Project Structure

```
mobile/
├── App.tsx                      # Entry point
├── app.json                     # Expo config
├── package.json
├── tsconfig.json
│
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx    # Main navigation logic
│   │   ├── AuthStack.tsx        # Auth screens navigation
│   │   ├── BuyerStack.tsx       # Buyer screens navigation
│   │   └── DealerStack.tsx      # Dealer screens navigation
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   │
│   │   ├── buyer/
│   │   │   ├── HomeScreen.tsx           # Submit inquiry with AI scan
│   │   │   ├── InquiriesScreen.tsx      # Track inquiries
│   │   │   ├── QuotesScreen.tsx         # View quotes
│   │   │   ├── ProductsScreen.tsx       # Browse products
│   │   │   └── ProfileScreen.tsx        # User profile
│   │   │
│   │   └── dealer/
│   │       ├── DashboardScreen.tsx      # Available inquiries
│   │       ├── SubmitQuoteScreen.tsx    # Submit quote form
│   │       ├── MyQuotesScreen.tsx       # Quote history
│   │       ├── InventoryScreen.tsx      # Manage products
│   │       └── ProfileScreen.tsx        # Dealer profile
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   ├── buyer/
│   │   │   ├── AIScanCamera.tsx         # Camera component for AI scan
│   │   │   ├── InquiryCard.tsx          # Inquiry item display
│   │   │   └── QuoteCard.tsx            # Quote item display
│   │   │
│   │   └── dealer/
│   │       ├── InquiryItem.tsx          # Inquiry list item
│   │       └── QuoteForm.tsx            # Quote submission form
│   │
│   ├── services/
│   │   ├── api.ts                       # Axios API client
│   │   ├── auth.ts                      # Authentication service
│   │   ├── inquiry.ts                   # Inquiry API calls
│   │   ├── quote.ts                     # Quote API calls
│   │   └── aiScan.ts                    # AI scan API integration
│   │
│   ├── store/                           # State management
│   │   ├── authContext.tsx              # Auth state
│   │   ├── userContext.tsx              # User data
│   │   └── notificationContext.tsx      # Notifications
│   │
│   ├── utils/
│   │   ├── storage.ts                   # AsyncStorage helpers
│   │   ├── notifications.ts             # Push notification setup
│   │   └── validators.ts                # Form validation
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── inquiry.ts
│   │   ├── quote.ts
│   │   └── user.ts
│   │
│   └── theme/
│       ├── colors.ts                    # Color palette (match web)
│       ├── typography.ts                # Font styles
│       └── spacing.ts                   # Spacing constants
│
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

---

## 🎨 Design System

### Colors (Match Web App)

```typescript
export const colors = {
  primary: {
    50: '#FFF7ED',
    500: '#F97316',  // accent-500
    600: '#EA580C',  // accent-600
    900: '#1C1917',  // neutral-900
  },
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },
  purple: {
    50: '#FAF5FF',
    500: '#A855F7',
    600: '#9333EA',
  },
  blue: {
    500: '#3B82F6',
    600: '#2563EB',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    900: '#1C1917',
  },
  white: '#FFFFFF',
  black: '#000000',
};
```

### Typography

```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: '900' },  // font-black
  h2: { fontSize: 24, fontWeight: '900' },
  h3: { fontSize: 20, fontWeight: '700' },  // font-bold
  body: { fontSize: 16, fontWeight: '400' },
  small: { fontSize: 14, fontWeight: '400' },
  xs: { fontSize: 12, fontWeight: '400' },
};
```

---

## 🚀 Development Phases

### Phase 1: Foundation (Day 1)
- ✅ Initialize Expo project
- ✅ Set up TypeScript
- ✅ Configure navigation structure
- ✅ Create basic UI components
- ✅ Set up API service

### Phase 2: Authentication (Day 1-2)
- ✅ Login screen
- ✅ Signup screen with role selection
- ✅ Auth context/state management
- ✅ Token storage (AsyncStorage)
- ✅ Protected routes

### Phase 3: Buyer Features (Day 2-3)
- ✅ Home screen with AI scan
- ✅ Expo Camera integration
- ✅ AI scan API integration
- ✅ Inquiry submission
- ✅ Track inquiries screen
- ✅ View quotes screen

### Phase 4: Dealer Features (Day 3-4)
- ✅ Dashboard with inquiries
- ✅ Submit quote screen
- ✅ Quote history
- ✅ Basic inventory management

### Phase 5: Polish & Features (Day 4-5)
- ✅ Push notifications setup
- ✅ Offline support basics
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation

### Phase 6: Testing & Deployment (Day 5)
- ✅ Test on iOS simulator
- ✅ Test on Android emulator
- ✅ Build standalone apps
- ✅ Deployment guide

---

## 📸 AI Scan Feature (Mobile)

### Implementation

```typescript
// Using Expo Camera
import { Camera } from 'expo-camera';

const AIScanCamera = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const captureAndScan = async () => {
    const photo = await cameraRef.current.takePictureAsync();

    // Upload to backend for AI processing
    const formData = new FormData();
    formData.append('image', {
      uri: photo.uri,
      type: 'image/jpeg',
      name: 'slip.jpg',
    });

    const response = await api.post('/slip-scanner/parse', formData);
    // Handle AI results...
  };

  return (
    <Camera ref={cameraRef} style={styles.camera}>
      {/* Frame guide overlay */}
      <TouchableOpacity onPress={captureAndScan}>
        <Text>Capture & Scan</Text>
      </TouchableOpacity>
    </Camera>
  );
};
```

---

## 🔔 Push Notifications

### Setup

```typescript
import * as Notifications from 'expo-notifications';

// Register for push notifications
const registerForPushNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync();
  // Send token to backend
  await api.post('/users/push-token', { token });
};

// Notification types:
// 1. Buyer: "You have a new quote!" (when dealer submits quote)
// 2. Dealer: "New inquiry available!" (when buyer submits inquiry)
// 3. Both: "Message from [user]" (chat notifications)
```

---

## 🔌 Backend Integration

### Reuse Existing APIs

The mobile app will use the **same backend** as the web app:

```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'  // Development
  : 'https://hub4estate.com/api'; // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Endpoints Used

- **Auth**: `/auth/login`, `/auth/signup`
- **Inquiries**: `/inquiry/submit`, `/inquiry/list`, `/inquiry/:id`
- **Quotes**: `/quotes/submit`, `/quotes/list`
- **AI Scan**: `/slip-scanner/parse` (existing!)
- **Products**: `/products`, `/categories`
- **User**: `/users/profile`, `/users/push-token`

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-camera": "~14.0.0",
    "expo-notifications": "~0.27.0",
    "react-native": "0.73.0",
    "react-native-safe-area-context": "4.8.0",
    "react-native-screens": "~3.29.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "axios": "^1.6.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "react-native-vector-icons": "^10.0.3",
    "expo-image-picker": "~14.7.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  }
}
```

---

## 🎯 Success Metrics

### MVP Completion Checklist

- ✅ User can login/signup as buyer or dealer
- ✅ Buyer can use AI scan to submit inquiry
- ✅ Buyer can view submitted inquiries
- ✅ Buyer can see quotes from dealers
- ✅ Dealer can view available inquiries
- ✅ Dealer can submit quotes
- ✅ Push notifications work
- ✅ App runs on iOS
- ✅ App runs on Android

### Post-MVP Features

- 📍 Location-based dealer filtering
- 💬 In-app chat between buyer and dealer
- ⭐ Rating and review system
- 📊 Advanced analytics dashboard
- 🔍 Advanced product search
- 📷 Multiple image upload per inquiry
- 💳 In-app payment integration

---

## 🚀 Getting Started

### Installation

```bash
# Create new Expo project
npx create-expo-app mobile --template expo-template-blank-typescript

cd mobile

# Install dependencies
npx expo install expo-camera expo-notifications \
  react-native-safe-area-context react-native-screens \
  @react-navigation/native @react-navigation/stack \
  @react-navigation/bottom-tabs axios \
  @react-native-async-storage/async-storage

# Start development
npx expo start
```

### Testing

```bash
# iOS (requires Mac + Xcode)
npx expo start --ios

# Android (requires Android Studio)
npx expo start --android

# Web (for quick testing)
npx expo start --web
```

---

## 📱 Deployment

### iOS (App Store)

1. Build with EAS: `eas build --platform ios`
2. Submit to App Store: `eas submit --platform ios`

### Android (Play Store)

1. Build APK/AAB: `eas build --platform android`
2. Submit to Play Store: `eas submit --platform android`

---

## 🎨 Screenshots (Planned)

### Buyer Flow
```
Welcome → Login → Home (AI Scan) → Camera → Results → Submit → Inquiries List → Quotes
```

### Dealer Flow
```
Welcome → Login → Dashboard → Inquiry Details → Submit Quote → Quote History
```

---

## ⏱️ Timeline

- **Day 1**: Setup + Auth + Basic UI
- **Day 2**: Buyer features (AI scan, inquiries)
- **Day 3**: Dealer features (quotes, dashboard)
- **Day 4**: Polish, notifications, testing
- **Day 5**: Build & deployment

**Total**: 5 days for MVP

---

## 🎯 Let's Build!

Ready to start Phase 1: Foundation

Next step: Initialize Expo project and set up basic structure.
