import { Theme as NavigationTheme } from '@react-navigation/native'

export interface CustomTheme extends NavigationTheme {
  colors: NavigationTheme['colors'] & {
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
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
  width: number
  height: number
  bottomTabHeight: number
  headerHeight: number
  platform: {
    isIOS: boolean
    isAndroid: boolean
  }
  typography: {
    sizes: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
      xxl: number
    }
  }
}

export type Theme = CustomTheme
