import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Circle,
  CreditCard,
  Users,
  Target,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function OnboardingGuideCard() {
  const router = useRouter();
  const { colors, typography, isDark } = useTheme();

  const user = useAppStore((state) => state.user);
  const paymentPlans = useAppStore((state) => state.paymentPlans);
  const circles = useAppStore((state) => state.circles);
  const goals = useAppStore((state) => state.goals);
  const onboardingDismissed = useAppStore((state) => state.onboardingDismissed);
  const dismissOnboarding = useAppStore((state) => state.dismissOnboarding);

  if (onboardingDismissed) return null;

  const steps = [
    {
      id: 'income',
      title: 'Set Monthly Budget',
      description: `Income: ₹${user.monthlyIncome.toLocaleString('en-IN')}`,
      completed: user.monthlyIncome > 0,
      action: () => router.push('/(tabs)/profile'),
    },
    {
      id: 'payment',
      title: 'Add First EMI or Bill',
      description: paymentPlans.length > 0 ? `${paymentPlans.length} plans added` : 'Track monthly dues',
      completed: paymentPlans.length > 0,
      action: () => router.push('/payments/create'),
    },
    {
      id: 'circle',
      title: 'Create a Money Circle',
      description: circles.length > 0 ? `${circles.length} pools active` : 'Shared group expenses',
      completed: circles.length > 0,
      action: () => router.push('/circles/create'),
    },
    {
      id: 'goal',
      title: 'Set a Savings Goal',
      description: goals.length > 0 ? `${goals.length} goals set` : 'Build your emergency fund',
      completed: goals.length > 0,
      action: () => router.push('/goals/create'),
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <Card
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: colors.accent,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
            <Sparkles size={14} color={colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>QUICK START GUIDE</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Welcome, {user.name || 'Friend'}! 👋
          </Text>
        </View>
        <TouchableOpacity
          onPress={dismissOnboarding}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {completedCount} of {steps.length} steps completed
        </Text>
        <Text style={[styles.progressPercent, { color: colors.accent }]}>
          {Math.round(progressPercent)}%
        </Text>
      </View>
      <ProgressBar progress={progressPercent} color={colors.accent} height={6} style={{ marginBottom: 16 }} />

      {/* Steps List */}
      <View style={styles.stepsList}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={step.id}
            style={[
              styles.stepRow,
              {
                borderBottomColor: colors.border,
                borderBottomWidth: index < steps.length - 1 ? 1 : 0,
              },
            ]}
            onPress={step.action}
            activeOpacity={0.7}
          >
            <View style={styles.stepLeft}>
              {step.completed ? (
                <CheckCircle2 size={20} color={colors.success} style={{ marginRight: 12 }} />
              ) : (
                <Circle size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
              )}
              <View>
                <Text
                  style={[
                    styles.stepTitle,
                    {
                      color: colors.textPrimary,
                      textDecorationLine: step.completed ? 'line-through' : 'none',
                      opacity: step.completed ? 0.7 : 1,
                    },
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  {step.description}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderWidth: 1.5,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepsList: {
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
