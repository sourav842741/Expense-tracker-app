import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatINR } from '@/utils/currency';

interface PaymentProgressCardProps {
  monthName: string;
  totalPaid: number;
  totalCommitted: number;
  completedCount: number;
  totalCount: number;
}

export const PaymentProgressCard: React.FC<PaymentProgressCardProps> = ({
  monthName,
  totalPaid,
  totalCommitted,
  completedCount,
  totalCount,
}) => {
  const { colors, typography, spacing } = useTheme();

  const percentage = totalCommitted > 0 ? Math.min(100, Math.round((totalPaid / totalCommitted) * 100)) : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {monthName} Payments
        </Text>
        <Text style={[styles.percentage, { color: colors.accent }]}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.paidAmount, { color: colors.textPrimary }]}>
          {formatINR(totalPaid)}
        </Text>
        <Text style={[styles.totalAmount, { color: colors.textSecondary }]}>
          / {formatINR(totalCommitted)}
        </Text>
      </View>

      <ProgressBar
        progress={percentage}
        height={8}
        color={colors.accent}
        style={styles.progressBar}
      />

      <Text style={[styles.counterText, { color: colors.textSecondary }]}>
        {completedCount} of {totalCount} payments completed
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  paidAmount: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  totalAmount: {
    fontSize: 14,
    marginLeft: 6,
  },
  progressBar: {
    marginBottom: 8,
  },
  counterText: {
    fontSize: 12,
    marginTop: 2,
  },
});
