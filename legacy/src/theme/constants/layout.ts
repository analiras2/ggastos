import { Dimensions, Platform } from 'react-native'

const { width, height } = Dimensions.get('window')

export const layout = {
  width,
  height,
  bottomTabHeight: Platform.OS === 'ios' ? 90 : 64,
  headerHeight: Platform.OS === 'ios' ? 44 : 56,
} as const
