import { Dimensions, Platform } from 'react-native'

const { width, height } = Dimensions.get('window')

export const layout = {
  width,
  height,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  bottomTabHeight: Platform.OS === 'ios' ? 90 : 64,
  headerHeight: Platform.OS === 'ios' ? 44 : 56,
} as const
