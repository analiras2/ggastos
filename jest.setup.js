// Mock para o React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native')
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useTheme: () => ({
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
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      typography: {
        sizes: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
        },
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 16,
      },
      width: 375,
      height: 812,
      bottomTabHeight: 64,
      headerHeight: 56,
      platform: {
        isIOS: false,
        isAndroid: true,
      },
    }),
  }
})

// Mock para o React Native Vector Icons
jest.mock('@react-native-vector-icons/ionicons', () => {
  const React = require('react')
  const MockIcon = (props) => React.createElement('Icon', props) // Or use your preferred mock component
  return MockIcon
})

// Mock para o React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 }
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaView: jest.fn(({ children }) => children),
    useSafeAreaInsets: jest.fn(() => inset),
  }
})

// Suprimir erros de console durante os testes
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
}
