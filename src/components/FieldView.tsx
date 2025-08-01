import { useAppTheme } from '@theme/hooks/useAppTheme'
import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Typography } from './ui'
import { ValueFormat } from './ui/Typography/types'

interface FieldViewProps {
  title: string
  value: string | number
  align?: 'center' | 'flex-start' | 'flex-end'
  color?: string
  light?: boolean
}

export const FieldView: React.FC<FieldViewProps> = (props) => {
  const { colors } = useAppTheme()
  const {
    title,
    value,
    align = 'flex-start',
    light = false,
    color = colors.text,
  } = props
  return (
    <View style={[styles.container, { alignItems: align }]}>
      <Typography variant="tiny" color={light ? colors.textLight : color}>
        {title}
      </Typography>
      <Typography
        variant="body"
        color={light ? colors.textLight : colors.text}
        format={
          typeof value === 'number' ? ValueFormat.CURRENCY : ValueFormat.TEXT
        }
      >
        {value}
      </Typography>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
