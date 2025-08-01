jest.mock('@react-navigation/stack', () => {
  const actualStack = jest.requireActual('@react-navigation/stack')

  return {
    ...actualStack,
    createStackNavigator: () => ({
      Navigator: ({ children }: any) => children,
      Screen: ({ children }: any) => children,
    }),
    CardStyleInterpolators: {
      forHorizontalIOS: jest.fn(),
      forVerticalIOS: jest.fn(),
      forModalPresentationIOS: jest.fn(),
      forFadeFromBottomAndroid: jest.fn(),
      forFadeFromCenter: jest.fn(),
    },
    HeaderStyleInterpolators: {
      forUIKit: jest.fn(),
      forFade: jest.fn(),
      forStatic: jest.fn(),
    },
    TransitionPresets: {
      SlideFromRightIOS: {},
      ModalSlideFromBottomIOS: {},
      ModalPresentationIOS: {},
      DefaultTransition: {},
      ModalTransition: {},
    },
  }
})
