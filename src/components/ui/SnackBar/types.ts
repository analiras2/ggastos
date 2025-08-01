import { theme } from '@theme/index'
import { TextStyle, ViewStyle } from 'react-native'

export type SnackbarType = 'success' | 'error' | 'info' | 'warning'

export interface SnackbarConfig {
  backgroundColor: string
  textColor: string
  icon:
    | 'checkmark-circle-outline'
    | 'alert-circle-outline'
    | 'information-circle-outline'
    | 'warning-outline'
  duration: number
}

export interface SnackbarProps {
  testID?: string
  visible: boolean
  message: string
  type?: SnackbarType
  duration?: number
  onDismiss: () => void
  position?: 'top' | 'bottom'
  style?: ViewStyle
  textStyle?: TextStyle
}

export const SNACKBAR_CONFIGS: Record<SnackbarType, SnackbarConfig> = {
  success: {
    backgroundColor: theme.colors.snackbar.success,
    textColor: theme.colors.textLight,
    icon: 'checkmark-circle-outline',
    duration: 3000,
  },
  error: {
    backgroundColor: theme.colors.snackbar.error,
    textColor: theme.colors.textLight,
    icon: 'alert-circle-outline',
    duration: 4000,
  },
  info: {
    backgroundColor: theme.colors.snackbar.info,
    textColor: theme.colors.textLight,
    icon: 'information-circle-outline',
    duration: 3000,
  },
  warning: {
    backgroundColor: theme.colors.snackbar.warning,
    textColor: theme.colors.textLight,
    icon: 'warning-outline',
    duration: 3500,
  },
}
