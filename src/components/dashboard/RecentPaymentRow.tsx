import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { formatINR } from '@/utils/currency';
import { PaymentCycleStatus } from '@/types/payment';

interface RecentPaymentRowProps {
  title: string;
  amount: number;
  dateOrMethod: string;
  status: PaymentCycleStatus;
  onPress?: () => void;
}

export const RecentPaymentRow: React.FC<RecentPaymentRowProps> = ({
  title,
  amount,
  dateOrMethod,
  status,
  onPress,
}) => {
  const { colors, radius } = useTheme();

  const getStatusVisual = () => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle2 size={16} color={colors.success} />,
          color: colors.success,
          text: '✓ Paid',
        };
      case 'overdue':
        return {
          icon: <AlertCircle size={16} color={colors.danger} />,
          color: colors.danger,
          text: 'Overdue',
        };
      case 'due_soon':
      case 'due_today':
        return {
          icon: <Clock size={16} color={colors.warning} />,
          color: colors.warning,
          text: 'Due soon',
        };
      default:
        return {
          icon: <Clock size={16} color={colors.info} />,
          color: colors.info,
          text: 'Upcoming',
        };
    }
  };

  const visual = getStatusVisual();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderRadius: radius.card,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <View style={styles.iconWrap}>{visual.icon}</View>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.metadata, { color: colors.textSecondary }]}>
            {dateOrMethod}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>
          {formatINR(amount)}
        </Text>
        <Text style={[styles.statusText, { color: visual.color }]}>
          {visual.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 8,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  metadata: {
    fontSize: 12,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
