import { useTheme } from '@theme/hooks/useTheme'
import { formatCurrency } from '@utils/currency'
import { Text, TextStyle } from 'react-native'
import React, { memo } from 'react'
import { getTypographyStyle } from './styles'
import { TypographyProps, TypographyVariant, ValueFormat } from './types'

export const Typography: React.FC<TypographyProps> = memo(
  ({
    variant = TypographyVariant.BODY,
    children,
    format = ValueFormat.TEXT,
    color,
    style,
    marginBottom,
    paddingHorizontal,
    bold,
    align,
    testID,
  }) => {
    const theme = useTheme()

    const fontWeight: TextStyle['fontWeight'] = bold ? 'bold' : 'normal'

    const textStyle = [
      getTypographyStyle(variant),
      {
        color: color || theme.colors.text,
        marginBottom,
        paddingHorizontal,
        textAlign: align,
        fontWeight,
      },
      style,
    ]

    const formatContent = (
      content: React.ReactNode | number
    ): React.ReactNode => {
      if (format === ValueFormat.CURRENCY && typeof content === 'number') {
        return formatCurrency(content)
      }
      return content
    }

    return (
      <Text style={textStyle} testID={testID}>
        {formatContent(children)}
      </Text>
    )
  }
)
