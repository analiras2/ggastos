import { ViewStyle, TextStyle } from 'react-native';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarConfig {
  backgroundColor: string;
  textColor: string;
  icon: 'checkmark-circle-outline' |
  'alert-circle-outline' |
  'information-circle-outline' |
  'warning-outline';
  duration: number;
}

export interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: SnackbarType;
  duration?: number;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SNACKBAR_CONFIGS: Record<SnackbarType, SnackbarConfig> = {
  success: {
    backgroundColor: '#4CAF50',
    textColor: '#FFFFFF',
    icon: 'checkmark-circle-outline',
    duration: 3000,
  },
  error: {
    backgroundColor: '#F44336',
    textColor: '#FFFFFF',
    icon: 'alert-circle-outline',
    duration: 4000,
  },
  info: {
    backgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    icon: 'information-circle-outline',
    duration: 3000,
  },
  warning: {
    backgroundColor: '#FF9800',
    textColor: '#FFFFFF',
    icon: 'warning-outline',
    duration: 3500,
  },
};
