import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'surface' | 'outlined';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  noPadding = false,
}) => {
  const { colors, radius, shadows, spacing } = useTheme();

  const cardStyle: ViewStyle = {
    borderRadius: radius.card,
    backgroundColor: variant === 'surface' ? colors.surfaceSecondary : colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    padding: noPadding ? 0 : spacing.standard,
    ...(variant === 'default' ? shadows.subtle : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
