import { DefaultTheme } from '@react-navigation/native'
import { colors } from './constants/colors'
import { layout } from './constants/layout'
import { platform } from './constants/platform'
import { CustomTheme } from './types'

const shadowStyle = {
  elevation: 4,
  shadowColor: colors.shadow,
  shadowOpacity: 0.3,
  shadowRadius: 2.5,
  shadowOffset: {
    width: 0,
    height: 3,
  },
}

export const theme: CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  ...layout,
  platform,
  shadowStyle,
}

export type Theme = typeof theme
