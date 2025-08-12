import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { AnimationType } from './types'
import { DEFAULT_DELAY, DEFAULT_DURATION, getAnimationStyle } from './utils'

export const useAnimation = (
  type: AnimationType = 'fade',
  config: {
    duration?: number
    delay?: number
    disabled?: boolean
  } = {}
) => {
  const { duration = DEFAULT_DURATION, delay = DEFAULT_DELAY, disabled = false } = config

  const animationValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (disabled) {
      animationValue.setValue(1)
      return
    }

    const animation = Animated.timing(animationValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      isInteraction: false,
    })

    animation.start()

    return () => {
      animation.stop()
      animationValue.setValue(0)
    }
  }, [animationValue, duration, delay, disabled])

  const getStyle = () => {
    return getAnimationStyle(animationValue, type)
  }

  return {
    animationValue,
    animationStyle: getStyle(),
  }
}
