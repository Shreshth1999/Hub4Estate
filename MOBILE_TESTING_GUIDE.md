# 🧪 Mobile App Testing Guide

## Testing Strategy Overview

### 1. Manual Testing (Start Here)
### 2. Automated Unit Tests
### 3. Integration Tests
### 4. End-to-End Tests
### 5. Device Testing

---

## 1. Manual Testing Setup

### Test the Foundation Without UI

Create a simple test screen to verify services work:

#### Create Test Screen: `App.tsx`

```typescript
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useState } from 'react';
import { authService } from './src/services/auth';
import { inquiryService } from './src/services/inquiry';
import { aiScanService } from './src/services/aiScan';

export default function App() {
  const [status, setStatus] = useState('Ready to test');
  const [loading, setLoading] = useState(false);

  // Test 1: API Connection
  const testApiConnection = async () => {
    setLoading(true);
    setStatus('Testing API connection...');

    try {
      // This will fail with 401, but confirms backend is reachable
      await authService.login({ email: 'test@test.com', password: 'test' });
      setStatus('✅ API is reachable!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setStatus('✅ API connected! (401 expected)');
      } else if (error.message?.includes('Network Error')) {
        setStatus('❌ Cannot reach API. Check backend is running.');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test 2: AsyncStorage
  const testStorage = async () => {
    setLoading(true);
    setStatus('Testing storage...');

    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
        (m) => m.default
      );

      await AsyncStorage.setItem('test_key', 'test_value');
      const value = await AsyncStorage.getItem('test_key');
      await AsyncStorage.removeItem('test_key');

      if (value === 'test_value') {
        setStatus('✅ Storage working!');
      } else {
        setStatus('❌ Storage failed');
      }
    } catch (error: any) {
      setStatus(`❌ Storage error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Image Picker
  const testImagePicker = async () => {
    setLoading(true);
    setStatus('Testing image picker...');

    try {
      const ImagePicker = await import('expo-image-picker');

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted) {
        setStatus('✅ Image picker permission granted!');
      } else {
        setStatus('⚠️ Image picker permission denied');
      }
    } catch (error: any) {
      setStatus(`❌ Image picker error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Camera
  const testCamera = async () => {
    setLoading(true);
    setStatus('Testing camera...');

    try {
      const { Camera } = await import('expo-camera');

      const permissionResult = await Camera.requestCameraPermissionsAsync();

      if (permissionResult.granted) {
        setStatus('✅ Camera permission granted!');
      } else {
        setStatus('⚠️ Camera permission denied');
      }
    } catch (error: any) {
      setStatus(`❌ Camera error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hub4Estate Mobile</Text>
      <Text style={styles.subtitle}>Foundation Testing</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Test API Connection"
          onPress={testApiConnection}
          disabled={loading}
        />
        <Button title="Test Storage" onPress={testStorage} disabled={loading} />
        <Button
          title="Test Image Picker"
          onPress={testImagePicker}
          disabled={loading}
        />
        <Button title="Test Camera" onPress={testCamera} disabled={loading} />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: '100%',
  },
  status: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
});
```

### Run Tests

```bash
# Start backend first
cd backend
npm run dev

# In another terminal, start mobile app
cd mobile
npx expo start
```

**Expected Results**:
1. ✅ API Connection: Should show "API connected! (401 expected)"
2. ✅ Storage: Should show "Storage working!"
3. ✅ Image Picker: Should ask for permission
4. ✅ Camera: Should ask for permission

---

## 2. Automated Unit Tests

### Setup Jest + React Native Testing Library

```bash
cd mobile
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### Configure Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

### Add Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### Test Examples

#### Test 1: Auth Service

```typescript
// __tests__/services/auth.test.ts
import { authService } from '../../src/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api';

jest.mock('../../src/services/api');
jest.mock('@react-native-async-storage/async-storage');

describe('authService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should store token and user on successful login', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'buyer',
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'authToken',
        'test-token-123'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.data.user)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failed login', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear auth data', async () => {
      await authService.logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getCurrentUser', () => {
    it('should return parsed user if exists', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser)
      );

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null if no user', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
```

**Run Test**:
```bash
npm test -- auth.test.ts
```

---

#### Test 2: AI Scan Service

```typescript
// __tests__/services/aiScan.test.ts
import { aiScanService } from '../../src/services/aiScan';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

describe('aiScanService', () => {
  describe('scanImage', () => {
    it('should upload image and return parsed results', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              productName: 'Eveready LED Bulb',
              quantity: 1,
              unit: 'piece',
              brand: 'Eveready',
              confidence: 0.92,
            },
          ],
          warnings: [],
          needsConfirmation: false,
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiScanService.scanImage('file:///path/to/image.jpg');

      expect(api.post).toHaveBeenCalledWith(
        '/slip-scanner/parse',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 45000,
        })
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productName).toBe('Eveready LED Bulb');
      expect(result.items[0].confidence).toBe(0.92);
    });

    it('should handle API errors', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('AI processing failed'));

      await expect(
        aiScanService.scanImage('file:///invalid.jpg')
      ).rejects.toThrow('AI processing failed');
    });
  });
});
```

---

#### Test 3: Type Validation

```typescript
// __tests__/types/auth.test.ts
import { User, AuthResponse, LoginCredentials } from '../../src/types/auth';

describe('Auth Types', () => {
  it('should allow valid user object', () => {
    const user: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+911234567890',
      role: 'buyer',
      createdAt: '2024-01-01T00:00:00Z',
    };

    expect(user.role).toBe('buyer');
  });

  it('should enforce role literal types', () => {
    // This will cause TypeScript error (compile-time test)
    // const invalidUser: User = {
    //   role: 'invalid' // ❌ TypeScript error
    // };
  });

  it('should allow valid login credentials', () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    expect(credentials.email).toBeDefined();
    expect(credentials.password).toBeDefined();
  });
});
```

---

## 3. Integration Tests

### Test Full User Flow

```typescript
// __tests__/integration/userFlow.test.ts
import { authService } from '../../src/services/auth';
import { inquiryService } from '../../src/services/inquiry';

describe('User Flow Integration', () => {
  it('should complete full inquiry submission flow', async () => {
    // 1. Login
    const loginResponse = await authService.login({
      email: 'buyer@test.com',
      password: 'password123',
    });

    expect(loginResponse.user).toBeDefined();
    expect(loginResponse.token).toBeDefined();

    // 2. Submit inquiry
    const inquiryData = {
      name: 'Test Buyer',
      phone: '+911234567890',
      modelNumber: 'Test Product',
      quantity: 10,
      deliveryCity: 'Mumbai',
    };

    const inquiry = await inquiryService.submitInquiry(inquiryData);

    expect(inquiry.id).toBeDefined();
    expect(inquiry.inquiryNumber).toBeDefined();

    // 3. Get inquiries list
    const inquiries = await inquiryService.getMyInquiries();

    expect(inquiries).toBeInstanceOf(Array);
    expect(inquiries.some((i) => i.id === inquiry.id)).toBe(true);
  });
});
```

---

## 4. Component Tests

### Test Button Component

```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/common/Button';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Click Me" onPress={() => {}} />);

    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when clicked', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPress} />);

    fireEvent.press(getByText('Click Me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={onPress} loading={true} />
    );

    const button = getByText('Click Me').parent;

    expect(button?.props.accessibilityState?.disabled).toBe(true);
  });
});
```

---

## 5. Device Testing Checklist

### iOS Testing

#### Simulator
```bash
npx expo start --ios
```

**Test Cases**:
- [ ] App launches without crashes
- [ ] Navigation works
- [ ] Forms accept input
- [ ] Camera permission request
- [ ] Image picker works
- [ ] API calls succeed
- [ ] Push notifications (with physical device)

#### Physical Device
```bash
# Install Expo Go app from App Store
# Scan QR code from npx expo start
```

**Additional Tests**:
- [ ] Camera actually captures photos
- [ ] Real network conditions
- [ ] Background/foreground transitions
- [ ] Memory usage
- [ ] Battery impact

---

### Android Testing

#### Emulator
```bash
npx expo start --android
```

**Test Cases**:
- [ ] App launches
- [ ] Back button behavior
- [ ] Camera works
- [ ] Different screen sizes
- [ ] Different Android versions (test 9, 11, 13)

#### Physical Device
```bash
# Install Expo Go from Play Store
# Scan QR code
```

**Additional Tests**:
- [ ] Various manufacturers (Samsung, OnePlus, etc.)
- [ ] Different screen sizes
- [ ] Low-end devices (performance)

---

## 6. Performance Testing

### Test Metrics

```typescript
// utils/performance.ts
export const measurePerformance = async (fn: () => Promise<any>, label: string) => {
  const start = performance.now();
  await fn();
  const end = performance.now();

  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
};

// Usage
await measurePerformance(
  () => inquiryService.getMyInquiries(),
  'Get Inquiries'
);
```

**Benchmarks**:
- API calls: < 2 seconds
- AI scan: < 10 seconds
- Screen transitions: < 300ms
- Image upload: < 5 seconds (with compression)

---

## 7. Accessibility Testing

### Check Accessibility

```typescript
import { AccessibilityInfo } from 'react-native';

// Test screen reader support
const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();

// Ensure buttons have labels
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Submit inquiry"
  accessibilityHint="Double tap to submit your product inquiry"
>
  <Text>Submit</Text>
</TouchableOpacity>
```

**Checklist**:
- [ ] All buttons have accessibility labels
- [ ] Forms work with screen readers
- [ ] Sufficient color contrast
- [ ] Touch targets >= 44x44 points
- [ ] Error messages announced

---

## 8. Network Testing

### Test Offline Behavior

```typescript
// Simulate network failure
beforeEach(() => {
  jest.spyOn(api, 'post').mockRejectedValue(new Error('Network Error'));
});

it('should show friendly error when offline', async () => {
  await expect(authService.login(credentials)).rejects.toThrow(
    'Network error. Please check your connection.'
  );
});
```

### Test Slow Network

```typescript
// Add delay to simulate slow network
jest.spyOn(api, 'post').mockImplementation(
  () => new Promise((resolve) => setTimeout(() => resolve(mockData), 5000))
);
```

---

## Quick Testing Checklist

### Before Each Commit
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Tests pass (`npm test`)
- [ ] No console errors
- [ ] App runs on simulator

### Before Each Release
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on 1 physical iOS device
- [ ] Tested on 1 physical Android device
- [ ] AI scan works end-to-end
- [ ] Push notifications work
- [ ] Offline behavior graceful
- [ ] Performance acceptable

---

## Running All Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# E2E tests (if using Detox)
npm run e2e:ios
npm run e2e:android
```

---

## Test Coverage Goals

- Services: 80%+
- Components: 70%+
- Utils: 90%+
- Overall: 75%+

---

## Debugging Tests

```typescript
// Add console logs
console.log('Auth response:', response.data);

// Use debugger
debugger;

// React Native Debugger
// Install: https://github.com/jhen0409/react-native-debugger
```

---

**Next**: Create the test App.tsx and run the foundation tests!
