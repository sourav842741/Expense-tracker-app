import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, PiggyBank, Clock, ShieldAlert } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TrendLineChart } from '@/components/charts/TrendLineChart';
import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { formatINR } from '@/utils/currency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, RNStatusBar.currentHeight || 0, Platform.OS === 'android' ? 36 : 10);

  const user = useAppStore((state) => state.user);
  const paymentPlans = useAppStore((state) => state.paymentPlans);
  const goals = useAppStore((state) => state.goals);

  const [period, setPeriod] = useState('month');

  const periodOptions = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  // Payment trend data points
  const paymentTrendData = [
    { label: 'W1', value: 3000 },
    { label: 'W2', value: 8000 },
    { label: 'W3', value: 10000 },
    { label: 'W4', value: 13000 },
  ];

  // Savings trend data points
  const savingsTrendData = [
    { label: 'May', value: 4000 },
    { label: 'Jun', value: 6000 },
    { label: 'Jul', value: 8000 },
    { label: 'Aug', value: 10000 },
  ];

  // Calculate totals
  const totalPayments = paymentPlans.reduce((sum, p) => sum + p.amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const pendingPayments = paymentPlans
    .filter((p) => p.cycles.some((c) => c.status !== 'paid'))
    .reduce((sum, p) => sum + p.amount, 0);

  const savingsRate =
    user.monthlyIncome > 0
      ? Math.round((user.savingsTarget / user.monthlyIncome) * 100)
      : 20;

  // Category commitments
  const categoryItems = [
    { icon: '💳', name: 'EMI Plans', amount: 5000, percentage: 24, color: '#171717' },
    { icon: '🏠', name: 'Housing & Rent', amount: 10000, percentage: 48, color: '#5D7EDB' },
    { icon: '🛡️', name: 'Insurance', amount: 2000, percentage: 10, color: '#2F9E63' },
    { icon: '📱', name: 'Subscriptions', amount: 799, percentage: 4, color: '#D9912B' },
    { icon: '👥', name: 'Group Circles', amount: 3000, percentage: 14, color: '#8E54E9' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingHorizontal: spacing.standard, paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Money Insights</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl
          options={periodOptions}
          selected={period}
          onSelect={setPeriod}
          style={{ marginBottom: 16 }}
        />

        {/* 4 Summary Stat Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Payments
            </Text>
            <Text style={[styles.statVal, { color: colors.textPrimary }]}>
              {formatINR(totalPayments)}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Saved
            </Text>
            <Text style={[styles.statVal, { color: colors.success }]}>
              {formatINR(totalSaved)}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pending Due
            </Text>
            <Text style={[styles.statVal, { color: colors.warning }]}>
              {formatINR(pendingPayments)}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Savings Rate
            </Text>
            <Text style={[styles.statVal, { color: colors.accent }]}>
              {savingsRate}%
            </Text>
          </Card>
        </View>

        {/* Payment Trend Chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Payment Trend
          </Text>
          <Text style={[styles.chartSub, { color: colors.textSecondary }]}>
            Scheduled commitments across the month
          </Text>
          <TrendLineChart data={paymentTrendData} height={150} color={colors.accent} />
        </Card>

        {/* Savings Trend Chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Savings Growth
          </Text>
          <Text style={[styles.chartSub, { color: colors.textSecondary }]}>
            Consistent deposits over the last 4 months
          </Text>
          <TrendLineChart data={savingsTrendData} height={150} color={colors.success} />
        </Card>

        {/* Category Breakdown */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Monthly Commitments Breakdown
          </Text>
          <Text style={[styles.chartSub, { color: colors.textSecondary }]}>
            Distribution across loan, rent, bills, and pools
          </Text>
          <CategoryBarChart categories={categoryItems} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
});
