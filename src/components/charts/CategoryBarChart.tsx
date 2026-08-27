import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { formatINR } from '@/utils/currency';

interface CategoryItem {
  icon: string;
  name: string;
  amount: number;
  percentage: number;
  color?: string;
}

interface CategoryBarChartProps {
  categories: CategoryItem[];
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ categories }) => {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.container}>
      {categories.map((cat, idx) => (
        <View key={idx} style={styles.row}>
          <View style={styles.header}>
            <View style={styles.labelGroup}>
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{cat.name}</Text>
            </View>
            <View style={styles.amountGroup}>
              <Text style={[styles.amount, { color: colors.textPrimary }]}>
                {formatINR(cat.amount)}
              </Text>
              <Text style={[styles.percentage, { color: colors.textSecondary }]}>
                {cat.percentage}%
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.barTrack,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.full,
              },
            ]}
          >
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(100, Math.max(0, cat.percentage))}%`,
                  backgroundColor: cat.color || colors.accent,
                  borderRadius: radius.full,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginVertical: 8,
  },
  row: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 12,
  },
  barTrack: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
