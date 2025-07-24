import React, { useEffect, useCallback, useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  LayoutAnimation, 
  UIManager,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { styles } from './styles';
import { SnackbarProps, SNACKBAR_CONFIGS } from './types';
import { theme } from '@theme/index';

if (theme.platform.isAndroid) {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const SnackBar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'info',
  duration,
  onDismiss,
  position = 'bottom',
  style,
  textStyle,
}) => {
  const translateYAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const config = SNACKBAR_CONFIGS[type];
  const actualDuration = duration || config.duration;

  const dismiss = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onDismiss?.();
  }, [onDismiss]);

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }),
      Animated.spring(opacityAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateYAnim, opacityAnim]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => dismiss());
  }, [translateYAnim, opacityAnim, dismiss]);

  useEffect(() => {
    if (visible) {
      animateIn();
      const timer = setTimeout(() => {
        animateOut();
      }, actualDuration);

      return () => clearTimeout(timer);
    } else {
      translateYAnim.setValue(100);
      opacityAnim.setValue(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, actualDuration, animateIn, animateOut]);

  const animatedStyle = {
    transform: [{ translateY: translateYAnim }],
    opacity: opacityAnim,
    [position]: 16,
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
        },
        animatedStyle,
        style,
      ]}
    >
      <Icon
        name={config.icon}
        size={20}
        color={config.textColor}
        style={styles.icon}
      />
      
      <Text
        style={[
          styles.message,
          { color: config.textColor },
          textStyle,
        ]}
        numberOfLines={2}
      >
        {message}
      </Text>

      <TouchableOpacity
        onPress={dismiss}
        style={styles.dismissButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon
          name="close-outline"
          size={20}
          color={config.textColor}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};
