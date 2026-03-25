import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme/colors';
import { DealerTabParamList, DealerDashboardStackParamList, DealerInquiriesStackParamList } from './types';

import DealerDashboardScreen from '../screens/dealer/DealerDashboardScreen';
import AvailableInquiriesScreen from '../screens/dealer/AvailableInquiriesScreen';
import QuoteSubmitScreen from '../screens/dealer/QuoteSubmitScreen';

const Tab = createBottomTabNavigator<DealerTabParamList>();
const DashboardStack = createNativeStackNavigator<DealerDashboardStackParamList>();
const InquiriesStack = createNativeStackNavigator<DealerInquiriesStackParamList>();

function DashboardStackNav() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DealerDashboard" component={DealerDashboardScreen} />
    </DashboardStack.Navigator>
  );
}

function InquiriesStackNav() {
  return (
    <InquiriesStack.Navigator screenOptions={{ headerShown: false }}>
      <InquiriesStack.Screen name="AvailableInquiries" component={AvailableInquiriesScreen} />
      <InquiriesStack.Screen name="QuoteSubmit" component={QuoteSubmitScreen} />
    </InquiriesStack.Navigator>
  );
}

export default function DealerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = { DashboardTab: '📊', InquiriesTab: '📋' };
          return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[route.name] || '•'}</Text>;
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackNav} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="InquiriesTab" component={InquiriesStackNav} options={{ tabBarLabel: 'Inquiries' }} />
    </Tab.Navigator>
  );
}
