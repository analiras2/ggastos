import { DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';
import { colors } from './colors';
import { metrics } from './metrics';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  metrics: metrics,
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    weights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
};

export type Theme = typeof theme;