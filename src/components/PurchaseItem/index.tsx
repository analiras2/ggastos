import { formatDate } from '@common/utils/dateUtils'
import { IPurchase } from '@models/purchase/type'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Theme } from '@theme/types'
import { StyleSheet, View } from 'react-native'
import React, { useCallback } from 'react'
import { Typography } from '../ui'
import { Footer } from './Footer'
import { Header } from './Header'

interface PurchaseItemProps {
  data: IPurchase
  color: string
  onTogglePaid?: (id: number) => void
}

export const PurchaseItem: React.FC<PurchaseItemProps> = ({
  data,
  color,
  onTogglePaid,
}) => {
  const theme = useAppTheme()
  const st = styles(theme)

  const handleTogglePaid = useCallback(() => {
    onTogglePaid?.(data.id)
  }, [data.id, onTogglePaid])

  return (
    <View style={st.container}>
      <View style={st.date}>
        <Typography variant="label">
          {formatDate(new Date(data.date))}
        </Typography>
      </View>

      <Header data={data} color={color} onPress={handleTogglePaid} />

      <Footer data={data} />
    </View>
  )
}

const styles = (theme: Theme) =>
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
