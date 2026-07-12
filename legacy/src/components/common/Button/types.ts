import { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { IconName } from '@common/types/icon'
import { Theme } from '@theme/types'

export type ButtonVariant = 'contained' | 'text' | 'outlined' | 'fab'

export interface ButtonProps {
  text?: string
  textColor?: string
  variant?: ButtonVariant
  color?: string
  icon?: IconName
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  iconPosition?: 'left' | 'right'
}

export interface ButtonStyleProps {
  variant: ButtonVariant
  color: string
  disabled: boolean
  theme: Theme
}
