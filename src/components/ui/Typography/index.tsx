import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Text, TextStyle } from 'react-native'
import React, { memo } from 'react'
import { getTypographyStyle } from './styles'
import { TypographyProps, ValueFormat } from './types'

export const Typography: React.FC<TypographyProps> = memo(
  ({
    variant = 'body',
    children,
    format = ValueFormat.TEXT,
    color,
    style,
    marginTop,
    marginBottom,
    paddingHorizontal,
    bold,
    align,
    testID,
  }) => {
    const theme = useAppTheme()

    const fontWeight: TextStyle['fontWeight'] = bold ? 'bold' : 'normal'

    const textStyle = [
      getTypographyStyle(variant),
      {
        color: color || theme.colors.text,
        marginTop,
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
        const value = content.toFixed(2).split('.')

        return (
          <>
            <Typography color={color || theme.colors.text} variant="body">
              R${value[0]}
            </Typography>
            <Typography color={color || theme.colors.text} variant="label">
              ,{value[1]}
            </Typography>
          </>
        )
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
