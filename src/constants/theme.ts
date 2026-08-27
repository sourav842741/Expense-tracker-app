export const Palette = {
  light: {
    background: '#F7F7F5',
    card: '#FFFFFF',
    surfaceSecondary: '#F2F2EF',
    inputBackground: '#F5F5F3',
    textPrimary: '#171717',
    textSecondary: '#737373',
    textMuted: '#A3A3A3',
    border: '#E8E8E5',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8E8E5',
    success: '#2F9E63',
    successBg: '#EAF7EE',
    warning: '#D9912B',
    warningBg: '#FEF6E9',
    danger: '#D95757',
    dangerBg: '#FDF0F0',
    info: '#5D7EDB',
    infoBg: '#EEF2FC',
    accent: '#171717',
    accentInverted: '#FFFFFF',
  },
  dark: {
    background: '#111111',
    card: '#1A1A1A',
    surfaceSecondary: '#222222',
    inputBackground: '#1E1E1E',
    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textMuted: '#666666',
    border: '#2C2C2C',
    tabBar: '#181818',
    tabBarBorder: '#282828',
    success: '#38B572',
    successBg: '#152C1F',
    warning: '#E8A33E',
    warningBg: '#33230C',
    danger: '#E06565',
    dangerBg: '#331515',
    info: '#7292EE',
    infoBg: '#17223D',
    accent: '#FFFFFF',
    accentInverted: '#111111',
  },
};

export const Spacing = {
  micro: 4,
  tight: 8,
  small: 12,
  standard: 16,
  section: 20,
  large: 24,
  major: 32,
  screenSeparation: 40,
};

export const Radius = {
  chip: 12,
  input: 14,
  button: 15,
  smallCard: 16,
  card: 20,
  sheet: 26,
  full: 9999,
};

export const Typography = {
  fontFamily: 'System',
  largeBalance: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  screenHeading: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  secondary: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
};

export const Shadows = {
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};
