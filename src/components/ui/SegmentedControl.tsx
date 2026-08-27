import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface SegmentedControlProps {
  options: { label: string; value: string; badgeCount?: number }[];
  selected: string;
  onSelect: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selected,
  onSelect,
  style,
}) => {
  const { colors, radius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.chip,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.7}
            onPress={() => onSelect(option.value)}
            style={[
              styles.segment,
              {
                borderRadius: radius.chip - 2,
                backgroundColor: isSelected ? colors.card : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isSelected ? 0.08 : 0,
                shadowRadius: 2,
                elevation: isSelected ? 1 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isSelected ? colors.textPrimary : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}
            >
              {option.label}
            </Text>
            {option.badgeCount !== undefined && option.badgeCount > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isSelected ? colors.accentInverted : colors.textSecondary,
                    },
                  ]}
                >
                  {option.badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  badge: {
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
