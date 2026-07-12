import { StyleSheet } from 'react-native'
import { Theme } from '@theme/types'

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    formContainer: {
      width: '100%',
      gap: 16,
    },
    datePicker: {
      alignSelf: 'flex-end',
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
    priceContainer: {
      flexDirection: 'row',
    },
    priceInput: {
      flex: 2,
    },
    withMargin: {
      marginRight: 20,
    },
    installmentsInput: {
      flex: 1,
    },
  })
