import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import DealerNavigator from './DealerNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import api from '../services/api';

// Deep linking config: hub4estate://track?number=HUB-0001
const linking = {
  prefixes: [Linking.createURL('/'), 'hub4estate://'],
  config: {
    screens: {
      TrackInquiry: 'track',
    },
  },
};

// Configure notifications to show while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootNavigator() {
  const { user, isAuthenticated, isBootstrapped, setAuth, setBootstrapped, logout } = useAuthStore();

  // Bootstrap: check stored token on app start
  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await authService.getAccessToken();

        if (!token) {
          setBootstrapped(true);
          return;
        }

        // Attach to API instance
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Validate token with backend
        const me = await authService.getMe();

        if (me) {
          setAuth(me, token);
        } else {
          // Try to refresh
          const newToken = await authService.refreshAccessToken();
          if (newToken) {
            const freshMe = await authService.getMe();
            if (freshMe) {
              setAuth(freshMe, newToken);
            } else {
              await authService.logout();
              logout();
            }
          } else {
            await authService.logout();
            logout();
          }
        }
      } catch {
        logout();
      } finally {
        setBootstrapped(true);
      }
    }

    bootstrap();
  }, []);

  // Register push notification token after auth
  useEffect(() => {
    if (!isAuthenticated) return;
    registerPushToken();
  }, [isAuthenticated]);

  if (!isBootstrapped) {
    return <LoadingScreen />;
  }

  let Navigator: React.ComponentType;

  if (!isAuthenticated) {
    Navigator = AuthNavigator;
  } else if (user?.type === 'dealer') {
    Navigator = DealerNavigator;
  } else {
    Navigator = UserNavigator;
  }

  return (
    <NavigationContainer linking={linking}>
      <Navigator />
    </NavigationContainer>
  );
}

async function registerPushToken() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const platform = require('react-native').Platform.OS as 'ios' | 'android';

    await api.post('/notifications/register-token', {
      token: tokenData.data,
      platform,
    });
  } catch {
    // Non-critical — don't crash the app
  }
}
