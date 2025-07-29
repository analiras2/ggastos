import { useAppTheme } from '@theme/hooks/useAppTheme'
import { useCallback, useMemo } from 'react'
import { getButtonStyles } from './styles'
import { ButtonProps } from './types'

export const useButton = (props: ButtonProps) => {
  const theme = useAppTheme()
  const {
    variant = 'contained',
    color = theme.colors.primary,
    disabled = false,
    loading = false,
    onPress,
    fullWidth = false,
  } = props

  const styles = useMemo(
    () => getButtonStyles({ variant, color, disabled, fullWidth, theme }),
    [variant, color, disabled, fullWidth, theme]
  )

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress()
    }
  }, [disabled, loading, onPress])

  return {
    styles,
    handlePress,
  }
}
