import { Theme as NavigationTheme } from '@react-navigation/native'
import { ViewStyle } from 'react-native'

export type Colors = NavigationTheme['colors'] & {
  secondary: string
  textLight: string
  label: string
  title: string
  backgroundLight: string
  modalBackground: string
  iconLight: string
  iconDark: string
  icon: string
  divider: string
  shadow: string
  underline: string
  alert: string
  snackbar: {
    success: string
    error: string
    info: string
    warning: string
  }
}

export interface CustomTheme extends NavigationTheme {
  colors: Colors
  width: number
  height: number
  bottomTabHeight: number
  headerHeight: number
  platform: {
    isIOS: boolean
    isAndroid: boolean
  }
  shadowStyle: ViewStyle
}

export type Theme = CustomTheme
