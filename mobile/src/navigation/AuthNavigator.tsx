import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import ProfileCompleteScreen from '../screens/auth/ProfileCompleteScreen';
import DealerLoginScreen from '../screens/auth/DealerLoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="ProfileComplete" component={ProfileCompleteScreen} />
      <Stack.Screen name="DealerLogin" component={DealerLoginScreen} />
    </Stack.Navigator>
  );
}
