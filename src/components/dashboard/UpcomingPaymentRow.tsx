import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  CreditCard,
  Home,
  Shield,
  Wifi,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { formatINR } from '@/utils/currency';
import { formatDateShort, getDueStatusInfo } from '@/utils/dates';
import { PaymentPlan, PaymentCategory } from '@/types/payment';

interface UpcomingPaymentRowProps {
  plan: PaymentPlan;
  onPress: () => void;
}

export const UpcomingPaymentRow: React.FC<UpcomingPaymentRowProps> = ({
  plan,
  onPress,
}) => {
  const { colors, radius } = useTheme();

  // Find the first non-paid cycle or the next due cycle
  const nextCycle = plan.cycles.find((c) => c.status !== 'paid') || plan.cycles[0];
  const dueDateStr = nextCycle?.dueDate || plan.startDate;
  const isPaid = nextCycle?.status === 'paid';
  const statusInfo = getDueStatusInfo(dueDateStr, isPaid);

  const getCategoryIcon = (category: PaymentCategory) => {
    switch (category) {
      case 'emi':
        return <CreditCard size={18} color={colors.accent} />;
      case 'housing':
        return <Home size={18} color={colors.accent} />;
      case 'insurance':
        return <Shield size={18} color={colors.accent} />;
      case 'utility':
        return <Wifi size={18} color={colors.accent} />;
      case 'contribution':
        return <Users size={18} color={colors.accent} />;
      case 'education':
        return <GraduationCap size={18} color={colors.accent} />;
      default:
        return <Sparkles size={18} color={colors.accent} />;
    }
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.smallCard,
            },
          ]}
        >
          {getCategoryIcon(plan.category)}
        </View>

        <View style={styles.mainInfo}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {plan.title}
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            Due {formatDateShort(dueDateStr)}
          </Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>
            {formatINR(plan.amount)}
          </Text>
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
            size="sm"
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
