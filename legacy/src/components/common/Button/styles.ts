import { StyleSheet } from 'react-native'
import { ButtonStyleProps } from './types'

export const getButtonStyles = ({ variant, color, disabled, theme }: ButtonStyleProps) => {
  const baseStyles = {
    contained: {
      container: {
        backgroundColor: color,
        borderRadius: 8,
        padding: 8,
        ...theme.shadowStyle,
      },
    },
    outlined: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: color,
        borderRadius: 8,
      },
    },
    text: {
      container: {
        backgroundColor: 'transparent',
        borderRadius: 8,
      },
    },
    fab: {
      container: {
        backgroundColor: color,
        height: 54,
        width: 54,
        borderRadius: 28,
        position: 'absolute' as const,
        bottom: 20,
        right: 10,
        ...theme.shadowStyle,
      },
    },
  }

  return StyleSheet.create({
    container: {
      ...baseStyles[variant].container,
      opacity: disabled ? 0.6 : 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}
