import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  icon,
  leftIcon,
  rightIcon,
  rightElement,
  prefix,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const effectiveLeft = icon || leftIcon;
  const effectiveRight = rightElement || rightIcon;
  const { colors, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderRadius: radius.input,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.accent
              : colors.border,
          },
        ]}
      >
        {effectiveLeft && <View style={styles.leftIconContainer}>{effectiveLeft}</View>}
        {prefix && (
          <Text style={[styles.prefix, { color: colors.textPrimary }]}>
            {prefix}
          </Text>
        )}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              paddingLeft: effectiveLeft || prefix ? 6 : spacing.standard,
              paddingRight: effectiveRight ? 6 : spacing.standard,
            },
            style,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {effectiveRight && <View style={styles.rightIconContainer}>{effectiveRight}</View>}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  leftIconContainer: {
    paddingLeft: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefix: {
    fontSize: 15,
    fontWeight: '600',
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
