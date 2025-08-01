export const mockTheme = {
  colors: {
    primary: '#333',
    background: '#f2f2f2',
    card: '#FFFFFF',
    text: '#000000',
    border: '#D5D5D5',
    secondary: '#757575',
    textLight: '#FFFFFF',
    label: '#828282',
    title: '#FFFFFF',
    backgroundLight: '#FFFFFF',
    modalBackground: '#00000080',
    iconLight: '#FFFFFF',
    iconDark: '#000000',
    icon: '#D5D5D5',
    divider: '#D5D5D5',
    shadow: '#000000',
    underline: 'rgba(72, 70, 73, 1)',
    alert: '#B43F3F',
    snackbar: {
      success: '#4CAF50',
      error: '#F44336',
      info: '#2196F3',
      warning: '#FF9800',
    },
  },
  width: 375,
  height: 812,
  bottomTabHeight: 64,
  headerHeight: 56,
  platform: {
    isIOS: false,
    isAndroid: true,
  },
}

jest.mock('@theme/hooks/useAppTheme', () => ({
  useAppTheme: () => mockTheme,
}))
