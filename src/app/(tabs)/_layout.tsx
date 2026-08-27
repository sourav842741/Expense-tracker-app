import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Home, CreditCard, Users, Target, User } from 'lucide-react-native';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { supabaseService } from '@/services/supabaseService';

export default function TabLayout() {
  const { colors } = useTheme();
  const user = useAppStore(state => state.user);
  const setUserPlansAndCircles = useAppStore(state => state.setUserPlansAndCircles);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    async function syncData() {
      if (user?.id) {
        try {
          const [plans, circles, goals] = await Promise.all([
            supabaseService.getUserPaymentPlans(user.id),
            supabaseService.getUserCircles(user.id),
            supabaseService.getUserGoals(user.id),
          ]);
          setUserPlansAndCircles(plans, circles, goals);
        } catch (e) {
          console.warn('Failed to sync data from supabase:', e);
        }
      }
      setIsSyncing(false);
    }
    syncData();
  }, [user?.id]);

  if (isSyncing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size }) => <CreditCard size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          title: 'Circles',
          tabBarIcon: ({ color, size }) => <Users size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => <Target size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
