import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors, radius, spacing } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'secondary':
        return colors.surfaceSecondary;
      case 'danger':
        return colors.danger;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.accent;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.accentInverted;
      case 'secondary':
        return colors.textPrimary;
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return colors.textPrimary;
      case 'ghost':
        return colors.textSecondary;
      default:
        return colors.accentInverted;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 38;
      case 'md':
        return 46;
      case 'lg':
      default:
        return 52;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          borderRadius: radius.button,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
          paddingHorizontal: spacing.large,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? 13 : 15,
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
