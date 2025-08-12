import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { AnimationProps } from './types'
import { DEFAULT_DELAY, DEFAULT_DURATION, getAnimationStyle } from './utils'

export const Animation: React.FC<AnimationProps> = ({
  children,
  style,
  type = 'fade',
  duration = DEFAULT_DURATION,
  delay = DEFAULT_DELAY,
  onAnimationComplete,
  disabled = false,
}) => {
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

    animation.start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete()
      }
    })

    return () => {
      animation.stop()
      animationValue.setValue(0)
    }
  }, [animationValue, duration, delay, disabled, onAnimationComplete])

  if (disabled) {
    return <Animated.View style={style}>{children}</Animated.View>
  }

  return (
    <Animated.View style={[getAnimationStyle(animationValue, type), style]}>
      {children}
    </Animated.View>
  )
}
