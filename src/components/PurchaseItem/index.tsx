import React, { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { formatDate } from '@common/utils/dateUtils'
import { IPurchase } from '@models/purchase/type'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Theme } from '@theme/types'
import { Typography } from '../common'
import { Footer } from './Footer'
import { Header } from './Header'

interface PurchaseItemProps {
  data: IPurchase
  color: string
  onTogglePaid?: (id: number) => void
}

export const PurchaseItemComponent: React.FC<PurchaseItemProps> = ({
  data,
  color,
  onTogglePaid,
}) => {
  const theme = useAppTheme()
  const styles = createStyles(theme)

  const handleTogglePaid = useCallback(() => {
    onTogglePaid?.(data.id)
  }, [data.id, onTogglePaid])

  return (
    <View style={styles.container}>
      <View style={styles.date}>
        <Typography variant="label">{formatDate(new Date(data.date))}</Typography>
      </View>

      <Header data={data} color={color} onPress={handleTogglePaid} />

      <Footer data={data} />
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      padding: 16,
      backgroundColor: theme.colors.card,
      marginVertical: 1,
    },
    date: {
      position: 'absolute',
      top: 6,
      right: 20,
    },
  })

export const PurchaseItem = memo(PurchaseItemComponent, (prev, next) => {
  return (
    prev.data.date === next.data.date &&
    prev.data.paid === next.data.paid &&
    prev.data.title === next.data.title &&
    prev.data.note === next.data.note &&
    prev.data.paymentMethod === next.data.paymentMethod &&
    prev.data.currentInstallment === next.data.currentInstallment &&
    prev.data.installments === next.data.installments &&
    prev.data.installmentValue === next.data.installmentValue
  )
})
