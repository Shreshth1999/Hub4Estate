import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { UserTabParamList, UserHomeStackParamList, UserInquiryStackParamList, UserDashboardStackParamList } from './types';

import HomeScreen from '../screens/user/HomeScreen';
import CategoriesScreen from '../screens/user/CategoriesScreen';
import InquirySubmitScreen from '../screens/user/InquirySubmitScreen';
import TrackInquiryScreen from '../screens/user/TrackInquiryScreen';
import UserDashboardScreen from '../screens/user/UserDashboardScreen';

const Tab = createBottomTabNavigator<UserTabParamList>();
const HomeStack = createNativeStackNavigator<UserHomeStackParamList>();
const InquiryStack = createNativeStackNavigator<UserInquiryStackParamList>();
const DashboardStack = createNativeStackNavigator<UserDashboardStackParamList>();

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Categories" component={CategoriesScreen} />
    </HomeStack.Navigator>
  );
}

function InquiryStackNav() {
  return (
    <InquiryStack.Navigator screenOptions={{ headerShown: false }}>
      <InquiryStack.Screen name="InquirySubmit" component={InquirySubmitScreen} />
      <InquiryStack.Screen name="TrackInquiry" component={TrackInquiryScreen} />
    </InquiryStack.Navigator>
  );
}

function DashboardStackNav() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="UserDashboard" component={UserDashboardScreen} />
    </DashboardStack.Navigator>
  );
}

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { focused: 'home', default: 'home-outline' },
  InquiryTab: { focused: 'cube', default: 'cube-outline' },
  DashboardTab: { focused: 'person', default: 'person-outline' },
};

export default function UserNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconSet = TAB_ICONS[route.name];
          const iconName = focused ? iconSet.focused : iconSet.default;
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNav} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="InquiryTab" component={InquiryStackNav} options={{ tabBarLabel: 'Inquiries' }} />
      <Tab.Screen name="DashboardTab" component={DashboardStackNav} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
