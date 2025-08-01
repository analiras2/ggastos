import { Typography } from '@components/ui'
import { ValueFormat } from '@components/ui/Typography/types'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { StyleSheet, View } from 'react-native'
import React from 'react'

interface BalanceItemProps {
  label: string
  value: number
  variant?: 'title' | 'header'
}

export const BalanceItem: React.FC<BalanceItemProps> = ({
  label,
  value,
  variant = 'title',
}) => {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container}>
      <Typography color={colors.label} marginBottom={2} variant="label">
        {label}
      </Typography>
      <Typography variant={variant} format={ValueFormat.CURRENCY}>
        {value}
      </Typography>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
