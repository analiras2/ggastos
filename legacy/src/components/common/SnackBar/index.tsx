import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, LayoutAnimation, Text, TouchableOpacity, UIManager } from 'react-native'
import Icon from '@react-native-vector-icons/ionicons'
import { theme } from '@theme/index'
import { styles } from './styles'
import { SNACKBAR_CONFIGS, SnackbarProps } from './types'

if (theme.platform.isAndroid && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const SnackBar: React.FC<SnackbarProps> = ({
  testID,
  visible,
  message,
  type = 'info',
  duration,
  onDismiss,
  position = 'bottom',
  style,
  textStyle,
}) => {
  const animations = useRef({
    translateY: new Animated.Value(100),
    opacity: new Animated.Value(0),
  }).current

  const config = SNACKBAR_CONFIGS[type]
  const actualDuration = duration || config.duration

  const dismiss = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    onDismiss()
  }

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(animations.translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }),
      Animated.spring(animations.opacity, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start()
  }, [animations])

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(animations.translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animations.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(dismiss)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animations])

  useEffect(() => {
    if (!visible) {
      animations.translateY.setValue(100)
      animations.opacity.setValue(0)
      return
    }

    animateIn()
    const timer = setTimeout(animateOut, actualDuration)
    return () => clearTimeout(timer)
  }, [visible, actualDuration, animateIn, animateOut, animations])

  if (!visible) return null

  const animatedStyle = {
    transform: [{ translateY: animations.translateY }],
    opacity: animations.opacity,
    [position]: 100,
  }

  return (
    <Animated.View
      testID={testID || 'snackbar'}
      style={[styles.container, { backgroundColor: config.backgroundColor }, animatedStyle, style]}
    >
      <Icon
        testID="snackbar-icon"
        name={config.icon}
        size={20}
        color={config.textColor}
        style={styles.icon}
      />

      <Text
        testID="snackbar-message"
        style={[styles.message, { color: config.textColor }, textStyle]}
        numberOfLines={2}
      >
        {message}
      </Text>

      <TouchableOpacity
        testID="snackbar-dismiss"
        onPress={dismiss}
        style={styles.dismissButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="close-outline" size={20} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  )
}
