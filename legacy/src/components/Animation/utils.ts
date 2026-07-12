import { Animated } from 'react-native'
import { AnimationType } from './types'

export const DEFAULT_DURATION = 500
export const DEFAULT_DELAY = 0

export const getAnimationStyle = (animationValue: Animated.Value, animationType: AnimationType) => {
  const baseStyles = {
    fade: {
      opacity: animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    },
    scale: {
      opacity: animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          scale: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
      ],
    },
    slideUp: {
      opacity: animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateY: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0],
          }),
        },
      ],
    },
    slideDown: {
      opacity: animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateY: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0],
          }),
        },
      ],
    },
    slideLeft: {
      opacity: animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateX: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0],
          }),
        },
      ],
    },
    slideRight: {
      opacity: animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateX: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0],
          }),
        },
      ],
    },
  }

  return baseStyles[animationType]
}
