import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, CreditCard, Users, Target, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { supabaseService } from '@/services/supabaseService';

export default function TabLayout() {
  const { colors } = useTheme();
  const user = useAppStore((state) => state.user);
  const setUserPlansAndCircles = useAppStore((state) => state.setUserPlansAndCircles);

  useEffect(() => {
    let isMounted = true;

    async function syncData() {
      if (!user?.id) return;
      try {
        const [remotePlans, remoteCircles, remoteGoals] = await Promise.all([
          supabaseService.getUserPaymentPlans(user.id),
          supabaseService.getUserCircles(user.id),
          supabaseService.getUserGoals(user.id),
        ]);

        if (!isMounted) return;

        // Set strictly what belongs to this specific user from the database
        setUserPlansAndCircles(
          remotePlans || [],
          remoteCircles || [],
          remoteGoals || []
        );
      } catch (e) {
        console.warn('Failed to sync user data from supabase:', e);
      }
    }

    syncData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

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
