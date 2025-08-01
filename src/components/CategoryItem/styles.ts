import { Theme } from '@theme/types'
import { StyleSheet } from 'react-native'

export const styles = (theme: Theme) =>
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
