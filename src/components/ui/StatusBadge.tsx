import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type StatusType = 
  | 'paid' 
  | 'pending' 
  | 'due_soon' 
  | 'due_today' 
  | 'overdue' 
  | 'upcoming';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const { colors, radius } = useTheme();

  const getConfig = () => {
    switch (status) {
      case 'paid':
        return {
          bg: colors.successBg,
          text: colors.success,
          defaultLabel: '✓ Paid',
        };
      case 'due_today':
        return {
          bg: colors.warningBg,
          text: colors.warning,
          defaultLabel: 'Due today',
        };
      case 'due_soon':
        return {
          bg: colors.warningBg,
          text: colors.warning,
          defaultLabel: 'Due soon',
        };
      case 'overdue':
        return {
          bg: colors.dangerBg,
          text: colors.danger,
          defaultLabel: 'Overdue',
        };
      case 'pending':
        return {
          bg: colors.warningBg,
          text: colors.warning,
          defaultLabel: 'Pending',
        };
      case 'upcoming':
      default:
        return {
          bg: colors.infoBg,
          text: colors.info,
          defaultLabel: 'Upcoming',
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderRadius: radius.chip,
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 3 : 5,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: size === 'sm' ? 11 : 12,
          },
        ]}
      >
        {label || config.defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
