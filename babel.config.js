module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@constants': './src/constants',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
