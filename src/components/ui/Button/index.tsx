import Icon from '@react-native-vector-icons/ionicons'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import React from 'react'
import { Typography } from '../Typography'
import { TypographyVariant } from '../Typography/types'
import { getButtonStyles } from './styles'
import { ButtonProps } from './types'

export const Button: React.FC<ButtonProps> = (props) => {
  const theme = useAppTheme()
  const {
    variant = 'contained',
    text,
    textColor,
    icon,
    color = theme.colors.primary,
    onPress,
    disabled = false,
    loading,
    style,
    testID = 'button',
    iconPosition = 'left',
  } = props

  const buttonStyles = getButtonStyles({
    variant,
    color,
    disabled,
    theme,
  })

  const renderIcon = () => {
    if (!icon) return null

    return <Icon name={icon} size={24} color={theme.colors.icon} />
  }

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={theme.colors.icon} />
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        {text && (
          <Typography variant={TypographyVariant.TITLE} color={textColor}>
            {text.toUpperCase()}
          </Typography>
        )}
        {iconPosition === 'right' && renderIcon()}
      </>
    )
  }

  return (
    <TouchableOpacity
      style={[buttonStyles.container, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  )
}
