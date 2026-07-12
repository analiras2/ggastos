import React, { useMemo } from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/ionicons'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Typography } from '../Typography'
import { getButtonStyles } from './styles'
import { ButtonProps } from './types'

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  text,
  textColor,
  icon,
  color,
  onPress,
  disabled = false,
  loading = false,
  style,
  testID = 'button',
  iconPosition = 'left',
}) => {
  const theme = useAppTheme()
  const buttonColor = color || theme.colors.primary

  const buttonStyles = useMemo(
    () =>
      getButtonStyles({
        variant,
        color: buttonColor,
        disabled,
        theme,
      }),
    [variant, buttonColor, disabled, theme]
  )

  const renderIcon = () => {
    if (!icon) return null
    return <Icon name={icon} size={24} color={theme.colors.icon} />
  }

  return (
    <TouchableOpacity
      style={[buttonStyles.container, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.icon} />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          {text && <Typography color={textColor}>{text.toUpperCase()}</Typography>}
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  )
}
