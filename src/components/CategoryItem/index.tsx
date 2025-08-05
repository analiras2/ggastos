import { Typography } from '@components/ui'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Theme } from '@theme/types'
import { TouchableOpacity, View } from 'react-native'
import { StyleSheet } from 'react-native'
import React from 'react'
import { FieldView } from '../FieldView'
import { CategoryItemProps } from './types'

export const CategoryItem: React.FC<CategoryItemProps> = ({
  data,
  onPress,
}) => {
  const theme = useAppTheme()
  const styles = createStyles(theme)

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Typography variant="title" bold color={data.color} style={styles.title}>
        {data.name}
      </Typography>
      <View style={styles.data}>
        <FieldView
          title="Gasto Previsto"
          value={data.totalExpected}
          color={theme.colors.label}
        />
        <FieldView
          title="Gasto Atual"
          value={data.totalSpent}
          color={theme.colors.label}
        />
      </View>
    </TouchableOpacity>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 8,
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      ...theme.shadowStyle,
    },
    data: {
      flex: 1,
      flexDirection: 'row',
      marginTop: 4,
    },
    title: {
      marginBottom: 4,
    },
  })
