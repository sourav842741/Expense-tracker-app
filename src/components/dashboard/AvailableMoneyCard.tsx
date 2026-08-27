import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '../ui/Card';
import { formatINR } from '@/utils/currency';

interface AvailableMoneyCardProps {
  totalAvailable: number;
  income: number;
  payments: number;
  saved: number;
  hideBalance: boolean;
  onToggleHideBalance: () => void;
}

export const AvailableMoneyCard: React.FC<AvailableMoneyCardProps> = ({
  totalAvailable,
  income,
  payments,
  saved,
  hideBalance,
  onToggleHideBalance,
}) => {
  const { colors, typography, isDark } = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderColor: isDark ? '#27272A' : '#E4E4E7',
        },
      ]}
    >
      {/* Top Header with Pulse Tag & Eye Toggle */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            TOTAL AVAILABLE BALANCE
          </Text>
        </View>

        <TouchableOpacity
          onPress={onToggleHideBalance}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.eyeBtn, { backgroundColor: isDark ? '#27272A' : '#F4F4F5' }]}
        >
          {hideBalance ? (
            <EyeOff size={15} color={colors.textSecondary} />
          ) : (
            <Eye size={15} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Balance Display */}
      <View style={styles.balanceContainer}>
        <Text
          style={[
            styles.balanceText,
            { color: colors.textPrimary },
          ]}
        >
          {hideBalance ? '••••••••' : formatINR(totalAvailable, { showDecimals: true })}
        </Text>
      </View>

      {/* 3 Metric Mini Cards */}
      <View style={styles.metricsRow}>
        {/* Income Card */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#1C241E' : '#F0FDF4',
              borderColor: isDark ? '#166534' : '#BBF7D0',
            },
          ]}
        >
          <View style={styles.metricHeader}>
            <TrendingUp size={13} color={colors.success} style={styles.metricIcon} />
            <Text style={[styles.metricLabel, { color: colors.success }]}>
              Income
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.success }]}>
            {hideBalance ? '••••' : formatINR(income, { sign: true })}
          </Text>
        </View>

        {/* Payments Card */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#2A1C1C' : '#FEF2F2',
              borderColor: isDark ? '#991B1B' : '#FECACA',
            },
          ]}
        >
          <View style={styles.metricHeader}>
            <TrendingDown size={13} color={colors.danger} style={styles.metricIcon} />
            <Text style={[styles.metricLabel, { color: colors.danger }]}>
              Bills & EMI
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.danger }]}>
            {hideBalance ? '••••' : formatINR(-payments, { sign: true })}
          </Text>
        </View>

        {/* Saved Card */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#1E2430' : '#EFF6FF',
              borderColor: isDark ? '#1E40AF' : '#BFDBFE',
            },
          ]}
        >
          <View style={styles.metricHeader}>
            <PiggyBank size={13} color={colors.info} style={styles.metricIcon} />
            <Text style={[styles.metricLabel, { color: colors.info }]}>
              Saved
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.info }]}>
            {hideBalance ? '••••' : formatINR(saved)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  eyeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    marginBottom: 18,
  },
  balanceText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricIcon: {
    marginRight: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
