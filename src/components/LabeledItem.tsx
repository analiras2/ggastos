import { Typography, TypographyVariant, ValueFormat } from '@components/ui'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { View } from 'react-native'
import React from 'react'

interface LabeledItemProps {
  testID?: string
  label: string
  textColor?: string
  value: number | string
  align?: 'left' | 'center' | 'right'
  variant?: TypographyVariant
  flex?: number
}

export const LabeledItem: React.FC<LabeledItemProps> = ({
  testID = 'labeled-item',
  label,
  textColor,
  value,
  align = 'center',
  variant = 'title',
  flex = 1,
}) => {
  const { colors } = useAppTheme()

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View testID={testID} style={{ flex, justifyContent: 'center' }}>
      <Typography
        color={textColor || colors.label}
        marginBottom={2}
        variant="label"
        align={align}
      >
        {label}
      </Typography>
      <Typography
        variant={variant}
        format={ValueFormat.CURRENCY}
        align={align}
        color={textColor}
      >
        {value}
      </Typography>
    </View>
  )
}
