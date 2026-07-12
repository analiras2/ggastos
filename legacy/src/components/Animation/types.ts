import { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export type AnimationType = 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight'

export interface AnimationConfig {
  duration?: number
  delay?: number
  initialValue?: number
  finalValue?: number
}

export interface AnimationProps {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  type?: AnimationType
  duration?: number
  delay?: number
  onAnimationComplete?: () => void
  disabled?: boolean
}
