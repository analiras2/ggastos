module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@theme': './src/theme',
          '@contexts': './src/contexts',
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@assets': './src/assets',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
