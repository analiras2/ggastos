import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Metrics = {
  width,
  height,
  bottomTabHeight: Platform.OS === 'ios' ? 90 : 64,
  headerHeight: Platform.OS === 'ios' ? 44 : 56,
  platform: {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android'
  }
} as const