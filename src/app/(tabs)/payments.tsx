import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, CreditCard, Calendar, Filter } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR } from '@/utils/currency';
import { formatDateShort, getDueStatusInfo } from '@/utils/dates';

export default function PaymentsScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const paymentPlans = useAppStore((state) => state.paymentPlans);
  const [filter, setFilter] = useState('all');

  // Filter cycles
  const filteredPlans = paymentPlans.filter((plan) => {
    const nextCycle = plan.cycles.find((c) => c.status !== 'paid') || plan.cycles[0];
    const isPaid = nextCycle?.status === 'paid';
    const statusInfo = getDueStatusInfo(nextCycle?.dueDate || plan.startDate, isPaid);

    if (filter === 'upcoming') return !isPaid && !statusInfo.isOverdue;
    if (filter === 'paid') return isPaid;
    if (filter === 'overdue') return !isPaid && statusInfo.isOverdue;
    return true;
  });

  const filterOptions = [
    { label: 'All', value: 'all', badgeCount: paymentPlans.length },
    {
      label: 'Upcoming',
      value: 'upcoming',
      badgeCount: paymentPlans.filter((p) => {
        const next = p.cycles.find((c) => c.status !== 'paid');
        return next && !getDueStatusInfo(next.dueDate, false).isOverdue;
      }).length,
    },
    {
      label: 'Paid',
      value: 'paid',
      badgeCount: paymentPlans.filter((p) => p.cycles.some((c) => c.status === 'paid')).length,
    },
    {
      label: 'Overdue',
      value: 'overdue',
      badgeCount: paymentPlans.filter((p) => {
        const next = p.cycles.find((c) => c.status !== 'paid');
        return next && getDueStatusInfo(next.dueDate, false).isOverdue;
      }).length,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { paddingHorizontal: spacing.standard }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Payments</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/calendar')}
              style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
              accessibilityLabel="Calendar"
            >
              <Calendar size={18} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/payments/create')}
              style={[styles.actionBtn, { backgroundColor: colors.accent }]}
              accessibilityLabel="Add Payment"
            >
              <Plus size={18} color={colors.accentInverted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Filter */}
        <SegmentedControl
          options={filterOptions}
          selected={filter}
          onSelect={setFilter}
          style={styles.segmented}
        />

        {/* Payments List */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredPlans.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={28} color={colors.textSecondary} />}
              title="No payments found"
              description="You have no commitments matching this filter. Add your recurring payments to stay ahead of due dates."
              actionTitle="+ Add Payment"
              onAction={() => router.push('/payments/create')}
            />
          ) : (
            filteredPlans.map((plan) => {
              const activeCycle =
                plan.cycles.find((c) => (filter === 'paid' ? c.status === 'paid' : c.status !== 'paid')) ||
                plan.cycles[0];
              const isPaid = activeCycle?.status === 'paid';
              const dueDateStr = activeCycle?.dueDate || plan.startDate;
              const statusInfo = getDueStatusInfo(dueDateStr, isPaid);

              return (
                <Card
                  key={plan.id}
                  onPress={() => router.push(`/payments/${plan.id}`)}
                  style={styles.planCard}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.planInfo}>
                      <Text style={[styles.planTitle, { color: colors.textPrimary }]}>
                        {plan.title}
                      </Text>
                      <Text style={[styles.planCategory, { color: colors.textSecondary }]}>
                        {plan.category.toUpperCase()} · {plan.frequency}
                      </Text>
                    </View>
                    <Text style={[styles.planAmount, { color: colors.textPrimary }]}>
                      {formatINR(plan.amount)}
                    </Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.cardBottom}>
                    <View style={styles.dueWrap}>
                      <Text style={[styles.dueLabel, { color: colors.textSecondary }]}>
                        {isPaid ? 'Paid on' : 'Due date'}:
                      </Text>
                      <Text style={[styles.dueDate, { color: colors.textPrimary }]}>
                        {formatDateShort(dueDateStr)}
                      </Text>
                    </View>

                    <StatusBadge
                      status={
                        isPaid
                          ? 'paid'
                          : statusInfo.isOverdue
                          ? 'overdue'
                          : statusInfo.isDueToday
                          ? 'due_today'
                          : statusInfo.isDueSoon
                          ? 'due_soon'
                          : 'upcoming'
                      }
                      label={statusInfo.label}
                    />
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
  },
  planCard: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    paddingRight: 10,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  planCategory: {
    fontSize: 12,
    marginTop: 3,
  },
  planAmount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueLabel: {
    fontSize: 13,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '600',
  },
});
