import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search,
  Bell,
  TrendingUp,
  Calendar as CalendarIcon,
  PlusCircle,
  Users,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { AvailableMoneyCard } from '@/components/dashboard/AvailableMoneyCard';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { OnboardingGuideCard } from '@/components/dashboard/OnboardingGuideCard';
import { UpcomingPaymentRow } from '@/components/dashboard/UpcomingPaymentRow';
import { PaymentProgressCard } from '@/components/dashboard/PaymentProgressCard';
import { RecentPaymentRow } from '@/components/dashboard/RecentPaymentRow';
import { AddActionSheet } from '@/components/ui/AddActionSheet';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { calculateSafeToSpend } from '@/utils/safeToSpend';
import { formatINR } from '@/utils/currency';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const user = useAppStore((state) => state.user);
  const hideBalance = useAppStore((state) => state.hideBalance);
  const toggleHideBalance = useAppStore((state) => state.toggleHideBalance);
  const paymentPlans = useAppStore((state) => state.paymentPlans);
  const circles = useAppStore((state) => state.circles);
  const notifications = useAppStore((state) => state.notifications);

  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const latestNotification = notifications[0];

  // Calculate commitments & progress
  const totalUpcomingPayments = paymentPlans.reduce((sum, plan) => {
    const nextCycle = plan.cycles.find((c) => c.status !== 'paid');
    return sum + (nextCycle ? nextCycle.amount : 0);
  }, 0);

  const totalPaidThisMonth = paymentPlans.reduce((sum, plan) => {
    const paidCycles = plan.cycles.filter((c) => c.status === 'paid');
    return sum + paidCycles.reduce((cSum, c) => cSum + c.amount, 0);
  }, 0);

  const totalCommitted = totalUpcomingPayments + totalPaidThisMonth;
  const completedCount = paymentPlans.filter((p) =>
    p.cycles.some((c) => c.status === 'paid')
  ).length;

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });

  // Safe-to-Spend
  const safeBreakdown = calculateSafeToSpend(
    user.monthlyIncome,
    totalUpcomingPayments,
    user.plannedExpenses,
    user.savingsTarget
  );

  const handleActionSelect = (action: 'payment' | 'circle' | 'goal' | 'expense') => {
    switch (action) {
      case 'payment':
        router.push('/payments/create');
        break;
      case 'circle':
        router.push('/circles/create');
        break;
      case 'goal':
        router.push('/goals/create');
        break;
      case 'expense':
        router.push('/analytics');
        break;
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentDate.getHours();
  let timeGreeting = 'Good morning';
  let greetingEmoji = '🌅';

  if (hour >= 4 && hour < 12) {
    timeGreeting = 'Good morning';
    greetingEmoji = '🌅';
  } else if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
    greetingEmoji = '☀️';
  } else if (hour >= 17 && hour < 22) {
    timeGreeting = 'Good evening';
    greetingEmoji = '🌆';
  } else {
    timeGreeting = 'Good night';
    greetingEmoji = '🌙';
  }

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.standard, paddingBottom: spacing.standard, paddingTop: 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.dateBadge}>
              <CalendarIcon size={12} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.dateTimeText, { color: colors.textMuted }]}>
                {formattedDate} • {formattedTime}
              </Text>
            </View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {timeGreeting} {greetingEmoji}
            </Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
              {user.name || 'Friend'} 👋
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/search')}
              style={[styles.headerBtn, { backgroundColor: colors.surfaceSecondary }]}
              accessibilityLabel="Search"
            >
              <Search size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={[styles.headerBtn, { backgroundColor: colors.surfaceSecondary }]}
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color={colors.textPrimary} />
              {unreadNotificationsCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.danger }]} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              style={[styles.headerAvatarBtn, { borderColor: colors.border }]}
              accessibilityLabel="Profile"
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.headerAvatarImg} />
              ) : (
                <View style={[styles.headerAvatarPlaceholder, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.headerAvatarText, { color: colors.accentInverted }]}>
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Notification Alert Banner on Home (only when unread) */}
        {latestNotification && !latestNotification.read && (
          <TouchableOpacity
            style={[
              styles.notificationBanner,
              {
                backgroundColor: latestNotification.read ? colors.surfaceSecondary : colors.accent + '15',
                borderColor: latestNotification.read ? colors.border : colors.accent + '50',
              },
            ]}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}
          >
            <View style={[styles.notifIconWrap, { backgroundColor: colors.accent }]}>
              <Bell size={16} color={colors.accentInverted} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {latestNotification.title}
                </Text>
                {!latestNotification.read && (
                  <View style={[styles.newBadge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.newBadgeText, { color: colors.accentInverted }]}>NEW</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                {latestNotification.message}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}

        {/* 0. New User Onboarding Guide */}
        <OnboardingGuideCard />

        {/* 1. Available Money Card */}
        <AvailableMoneyCard
          totalAvailable={user.availableBalance}
          income={user.monthlyIncome}
          payments={totalUpcomingPayments}
          saved={user.savingsTarget}
          hideBalance={hideBalance}
          onToggleHideBalance={toggleHideBalance}
        />

        {/* 2. Safe-to-Spend Insight */}
        <SafeToSpendCard
          breakdown={safeBreakdown}
          hideBalance={hideBalance}
        />

        {/* Quick Shortcut Pills */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            onPress={() => router.push('/analytics')}
            style={[styles.shortcutPill, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <TrendingUp size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.shortcutText, { color: colors.textPrimary }]}>Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/calendar')}
            style={[styles.shortcutPill, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <CalendarIcon size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.shortcutText, { color: colors.textPrimary }]}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActionSheetVisible(true)}
            style={[styles.shortcutPill, { backgroundColor: colors.accent, borderColor: colors.accent }]}
          >
            <PlusCircle size={16} color={colors.accentInverted} style={{ marginRight: 6 }} />
            <Text style={[styles.shortcutText, { color: colors.accentInverted }]}>Add New</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Upcoming Payments Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Upcoming Payments
          </Text>
          {paymentPlans.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/payments')}>
              <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>
                See all
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {paymentPlans.length === 0 ? (
          <Card style={{ padding: 20, alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 4 }}>
              No commitments added yet
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
              Add your first EMI, rent, or recurring bill to track dues and safe limits.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/payments/create')}
              style={{
                backgroundColor: colors.accent,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: colors.accentInverted, fontWeight: '700', fontSize: 13 }}>
                + Add First Payment
              </Text>
            </TouchableOpacity>
          </Card>
        ) : (
          paymentPlans.slice(0, 3).map((plan) => (
            <UpcomingPaymentRow
              key={plan.id}
              plan={plan}
              onPress={() => router.push(`/payments/${plan.id}`)}
            />
          ))
        )}

        {/* 4. Payment Progress Card */}
        <PaymentProgressCard
          monthName={currentMonthName}
          totalPaid={totalPaidThisMonth}
          totalCommitted={totalCommitted}
          completedCount={completedCount}
          totalCount={paymentPlans.length}
        />

        {/* 5. Shared Circles Snapshot */}
        {circles.length > 0 && (
          <View style={styles.circleSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Money Circles
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/circles')}>
                <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {circles.slice(0, 1).map((circle) => {
              const pct = Math.round((circle.collectedAmount / circle.targetAmount) * 100);
              return (
                <Card
                  key={circle.id}
                  onPress={() => router.push(`/circles/${circle.id}`)}
                  style={styles.circleCard}
                >
                  <View style={styles.circleHeader}>
                    <View style={styles.circleTitleWrap}>
                      <Users size={16} color={colors.accent} style={{ marginRight: 6 }} />
                      <Text style={[styles.circleName, { color: colors.textPrimary }]}>
                        {circle.name}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </View>

                  <View style={styles.circleAmountRow}>
                    <Text style={[styles.circleCollected, { color: colors.textPrimary }]}>
                      {formatINR(circle.collectedAmount)}
                    </Text>
                    <Text style={[styles.circleTarget, { color: colors.textSecondary }]}>
                      / {formatINR(circle.targetAmount)}
                    </Text>
                    <Text style={[styles.circlePct, { color: colors.accent }]}>
                      {pct}%
                    </Text>
                  </View>

                  <ProgressBar progress={pct} height={6} style={{ marginVertical: 8 }} />

                  <Text style={[styles.circleSub, { color: colors.textSecondary }]}>
                    {circle.members.length} members · Due in {circle.dueDay}th of month
                  </Text>
                </Card>
              );
            })}
          </View>
        )}

        {/* 6. Recent Payments */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Payments
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/payments')}>
            <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <RecentPaymentRow
          title="Bike EMI"
          amount={5000}
          dateOrMethod="UPI · Today"
          status="paid"
          onPress={() => router.push('/payments/plan_bike_emi')}
        />
        <RecentPaymentRow
          title="Family Contribution"
          amount={3000}
          dateOrMethod="Bank Transfer · Yesterday"
          status="paid"
          onPress={() => router.push('/payments/plan_family_pool')}
        />
        <RecentPaymentRow
          title="Internet Bill"
          amount={799}
          dateOrMethod="Auto Debit · Due in 2 days"
          status="due_soon"
          onPress={() => router.push('/payments/plan_internet')}
        />

        {/* Recent Alerts & Notifications on Home */}
        {notifications.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Recent Alerts & Updates
              </Text>
              <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Text style={[styles.seeAllText, { color: colors.accent }]}>
                  View All ({notifications.length})
                </Text>
              </TouchableOpacity>
            </View>

            {notifications.slice(0, 3).map((n) => (
              <Card
                key={n.id}
                style={[
                  styles.homeNotifCard,
                  {
                    borderColor: n.read ? colors.border : colors.info,
                    backgroundColor: n.read ? colors.card : colors.infoBg,
                  },
                ]}
                onPress={() => router.push('/notifications')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.miniNotifDot,
                      { backgroundColor: n.read ? colors.textMuted : colors.info },
                    ]}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.homeNotifTitle, { color: colors.textPrimary }]}>
                      {n.title}
                    </Text>
                    <Text style={[styles.homeNotifMsg, { color: colors.textSecondary }]} numberOfLines={2}>
                      {n.message}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Action Sheet Modal */}
      <AddActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        onSelectAction={handleActionSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 4,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 9,
    right: 9,
  },
  headerAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  headerAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
    marginBottom: 16,
  },
  shortcutPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  circleSection: {
    marginVertical: 4,
  },
  circleCard: {
    padding: 16,
  },
  circleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleName: {
    fontSize: 15,
    fontWeight: '600',
  },
  circleAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  circleCollected: {
    fontSize: 18,
    fontWeight: '700',
  },
  circleTarget: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  circlePct: {
    fontSize: 14,
    fontWeight: '700',
  },
  circleSub: {
    fontSize: 12,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  notifIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  notifMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  homeNotifCard: {
    padding: 12,
    marginBottom: 8,
  },
  miniNotifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  homeNotifTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  homeNotifMsg: {
    fontSize: 11,
    marginTop: 2,
  },
});
