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
import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR } from '@/utils/currency';

export default function CalendarScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, RNStatusBar.currentHeight || 0, Platform.OS === 'android' ? 36 : 10);

  const paymentPlans = useAppStore((state) => state.paymentPlans);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Calculate real days in month and start offset (Mon = 0, Sun = 6)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days with payments due
  const dueDaysMap: { [day: number]: { title: string; amount: number; isPaid: boolean }[] } = {};
  paymentPlans.forEach((plan) => {
    const d = plan.dueDay;
    if (!dueDaysMap[d]) dueDaysMap[d] = [];
    const isPaid = plan.cycles.some((c) => c.status === 'paid');
    dueDaysMap[d].push({
      title: plan.title,
      amount: plan.amount,
      isPaid,
    });
  });

  const selectedDayPayments = dueDaysMap[selectedDay] || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingHorizontal: spacing.standard, paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Payment Calendar</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Header with Working Navigation */}
        <Card style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
              {currentMonthName}
            </Text>
            <View style={styles.monthNav}>
              <TouchableOpacity
                style={[styles.monthNavBtn, { backgroundColor: colors.surfaceSecondary }]}
                onPress={goToPrevMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.monthNavBtn, { backgroundColor: colors.surfaceSecondary, marginLeft: 8 }]}
                onPress={goToNextMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronRight size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Days of Week */}
          <View style={styles.weekRow}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={[styles.weekDayText, { color: colors.textMuted }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {/* Real Offset for start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, emptyIdx) => (
              <View key={`empty_${emptyIdx}`} style={styles.dayCell} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasPayment = !!dueDaysMap[dayNum];
              const isSelected = selectedDay === dayNum;

              return (
                <TouchableOpacity
                  key={dayNum}
                  onPress={() => setSelectedDay(dayNum)}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: isSelected
                        ? colors.accent
                        : hasPayment
                        ? colors.surfaceSecondary
                        : 'transparent',
                      borderRadius: radius.chip,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: isSelected
                          ? colors.accentInverted
                          : colors.textPrimary,
                        fontWeight: isSelected || hasPayment ? '700' : '400',
                      },
                    ]}
                  >
                    {dayNum}
                  </Text>
                  {hasPayment && !isSelected && (
                    <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Selected Day Payments */}
        <View style={styles.scheduleHeader}>
          <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>
            Due on Day {selectedDay}
          </Text>
          <Text style={[styles.scheduleCount, { color: colors.textSecondary }]}>
            {selectedDayPayments.length} scheduled
          </Text>
        </View>

        {selectedDayPayments.length === 0 ? (
          <Card style={styles.emptyDayCard}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recurring payments scheduled on day {selectedDay}.
            </Text>
          </Card>
        ) : (
          selectedDayPayments.map((p, idx) => (
            <Card key={idx} style={styles.paymentRowCard}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <CreditCard size={18} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.paymentTitle, { color: colors.textPrimary }]}>
                    {p.title}
                  </Text>
                  <Text style={[styles.paymentDue, { color: colors.textSecondary }]}>
                    Due on {selectedDay}th of month
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <Text style={[styles.paymentAmount, { color: colors.textPrimary }]}>
                  {formatINR(p.amount)}
                </Text>
                <StatusBadge
                  status={p.isPaid ? 'paid' : 'due_soon'}
                  label={p.isPaid ? '✓ Paid' : 'Due soon'}
                  size="sm"
                />
              </View>
            </Card>
          ))
        )}
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
  calendarCard: {
    padding: 16,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    gap: 8,
  },
  monthNavBtn: {
    padding: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 5,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scheduleCount: {
    fontSize: 12,
  },
  emptyDayCard: {
    padding: 18,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  paymentRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentDue: {
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
