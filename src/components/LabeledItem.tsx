import { Typography } from '@components/ui'
import { TypographyVariant, ValueFormat } from '@components/ui/Typography/types'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { View } from 'react-native'
import React from 'react'

interface LabeledItemProps {
  label: string
  value: number | string
  align?: 'left' | 'center' | 'right'
  variant?: TypographyVariant
  flex?: number
}

export const LabeledItem: React.FC<LabeledItemProps> = ({
  label,
  value,
  align = 'center',
  variant = 'title',
  flex = 1,
}) => {
  const { colors } = useAppTheme()

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ flex, justifyContent: 'center' }}>
      <Typography
        color={colors.label}
        marginBottom={2}
        variant="label"
        align={align}
      >
        {label}
      </Typography>
      <Typography variant={variant} format={ValueFormat.CURRENCY} align={align}>
        {value}
      </Typography>
    </View>
  )
}
