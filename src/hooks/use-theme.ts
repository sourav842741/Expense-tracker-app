import { useColorScheme } from 'react-native';
import { Palette, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const userMode = useAppStore((state) => state.themeMode);

  const activeMode: 'light' | 'dark' =
    userMode === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : userMode;

  const colors = Palette[activeMode];
  const isDark = activeMode === 'dark';

  return {
    mode: activeMode,
    isDark,
    colors,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
    shadows: Shadows,
  };
}
