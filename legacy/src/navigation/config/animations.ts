import { Platform } from 'react-native'
import { CardStyleInterpolators } from '@react-navigation/stack'

const animationDuration = 500

export const screenAnimationConfigs = {
  fadeRoot: {
    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: animationDuration,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: animationDuration,
        },
      },
    },
  },

  slideUp: {
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: { duration: animationDuration },
      },
      close: {
        animation: 'timing',
        config: { duration: animationDuration / 2 },
      },
    },
  },

  slideHorizontal: {
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: { duration: animationDuration },
      },
      close: {
        animation: 'timing',
        config: { duration: animationDuration / 2 },
      },
    },
  },

  modal: {
    cardStyleInterpolator: Platform.select({
      ios: CardStyleInterpolators.forModalPresentationIOS,
      android: CardStyleInterpolators.forRevealFromBottomAndroid,
    }),
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 1000,
          damping: 500,
          mass: 3,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: animationDuration / 2,
        },
      },
    },
    gestureEnabled: true,
    gestureDirection: 'vertical',
  },
}
