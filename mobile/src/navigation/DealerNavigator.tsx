import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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

const TAB_ICONS: Record<string, { focused: string; default: string }> = {
  DashboardTab: { focused: 'stats-chart', default: 'stats-chart-outline' },
  InquiriesTab: { focused: 'clipboard', default: 'clipboard-outline' },
};

export default function DealerNavigator() {
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackNav} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="InquiriesTab" component={InquiriesStackNav} options={{ tabBarLabel: 'Inquiries' }} />
    </Tab.Navigator>
  );
}
