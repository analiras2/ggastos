module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '~components': './src/components',
          '~constants': './src/constants',
          '~contexts': './src/contexts',
          '~models': './src/models',
          '~navigation': './src/navigation',
          '~screens': './src/screens',
          '~service': './src/service',
          '~utils': './src/utils',
        },
      },
    ],
  ],
};
