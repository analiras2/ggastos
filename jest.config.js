module.exports = {
  preset: 'react-native',
  verbose: true,
  setupFilesAfterEnv: [
    '<rootDir>/__mocks__/setup/jest.setup.ts',
    '@testing-library/jest-native/extend-expect',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-safe-area-context|@react-native-vector-icons|@react-native-community|react-native-element-dropdown)/)',
  ],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/dist/', '/.bundle/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/**/*.styles.{js,jsx,ts,tsx}',
    '!src/constants/**/*',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
}
