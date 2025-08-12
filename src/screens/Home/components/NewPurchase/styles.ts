import { StyleSheet } from 'react-native'
import { Theme } from '@theme/types'

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.modalBackground,
      alignItems: 'center',
      padding: 20,
      ...StyleSheet.absoluteFillObject,
    },
    title: {
      marginTop: 102,
    },
    form: {
      marginTop: 20,
      width: '100%',
      padding: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 8,
    },
    dropdown: {
      height: 32,
      borderBottomWidth: 0.2,
      borderBottomColor: theme.colors.underline,
    },
    dropdownItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dropdownItemText: {
      marginVertical: -8,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 28,
    },
  })
