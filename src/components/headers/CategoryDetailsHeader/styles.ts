import { StyleSheet } from 'react-native'
import { Colors } from '@/theme/types'

export const createStyles = (colors: Colors, accentColor: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomColor: accentColor,
      borderBottomWidth: 4,
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    balance: {
      flexDirection: 'row',
    },
    hiddenButton: {
      opacity: 0,
    },
  })
