import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native'
import CurrencyInput from 'react-native-currency-input'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { createStyles } from './styles'

interface TextInputProps extends Omit<RNTextInputProps, 'value' | 'onChangeText'> {
  label: string
  error?: string
  isCurrency?: boolean
  containerStyle?: ViewStyle
  value: string | number
  onChangeText: (value: string | number) => void
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  isCurrency,
  containerStyle,
  value,
  onChangeText,
  ...props
}) => {
  const { colors } = useAppTheme()
  const styles = createStyles(colors)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<RNTextInput>(null)
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current

  const handleFocus = () => {
    setIsFocused(true)
    animateLabelToTop()
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!value) {
      animateLabelToBottom()
    }
  }

  const animateLabelToTop = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const animateLabelToBottom = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  useEffect(() => {
    if (value && !isFocused) {
      animateLabelToTop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const labelStyle: Animated.AnimatedProps<TextStyle> = {
    position: 'absolute',
    left: 0,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 10],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.label, colors.label],
    }),
  }

  const InputComponent = isCurrency ? CurrencyInput : RNTextInput

  const currencyProps = isCurrency
    ? {
        prefix: 'R$ ',
        delimiter: '.',
        separator: ',',
        precision: 2,
        onChangeValue: onChangeText,
      }
    : {
        onChangeText: onChangeText,
      }

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={[styles.container, styles.underline, containerStyle]}>
        <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
        <InputComponent
          ref={inputRef}
          style={[styles.input, isFocused && styles.focusedInput, error && styles.errorInput]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...currencyProps}
          {...props}
        />
        <View style={[isFocused && styles.focusedUnderline, error && styles.errorUnderline]} />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </TouchableWithoutFeedback>
  )
}
