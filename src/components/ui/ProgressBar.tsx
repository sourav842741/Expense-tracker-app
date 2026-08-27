import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  progress: number; // 0 to 1 or 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color,
  backgroundColor,
  style,
}) => {
  const { colors, radius } = useTheme();

  // Normalize progress to 0-100%
  const normalized = progress > 1 ? Math.min(100, Math.max(0, progress)) : Math.min(100, Math.max(0, progress * 100));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: radius.full,
          backgroundColor: backgroundColor || colors.surfaceSecondary,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${normalized}%`,
            height,
            borderRadius: radius.full,
            backgroundColor: color || colors.accent,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
