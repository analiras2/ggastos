import { IPurchase } from '@models/purchase/type'
import Icon from '@react-native-vector-icons/ionicons'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { StyleSheet, View } from 'react-native'
import React from 'react'
import { CheckBox, Typography } from '../ui'

interface HeaderProps {
  data: IPurchase
  color: string
  onPress: () => void
}

export const Header: React.FC<HeaderProps> = ({ data, color, onPress }) => {
  const theme = useAppTheme()

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <CheckBox checked={data.paid} accentColor={color} onPress={onPress} />

        <Typography variant="title" bold style={styles.title}>
          {data.title}
        </Typography>
      </View>

      {data.note && (
        <Icon
          name="reader-outline"
          color={theme.colors.iconDark}
          size={20}
          onPress={() => console.log('Note', data.note)}
          style={styles.icon}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  title: {
    marginLeft: 4,
  },
  icon: {
    marginTop: 8,
  },
})
