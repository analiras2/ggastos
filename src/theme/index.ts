import { DefaultTheme } from '@react-navigation/native'
import { colors } from './constants/colors'
import { layout } from './constants/layout'
import { platform } from './constants/platform'
import { spacing } from './constants/spacing'
import { typography } from './constants/typography'
import { CustomTheme } from './types'

export const theme: CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  ...layout,
  spacing,
  platform,
  typography,
}

export type Theme = typeof theme
