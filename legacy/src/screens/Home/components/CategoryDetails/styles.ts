import { StyleSheet } from 'react-native'
import { colors } from '@/theme/constants/colors'

export const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: colors.text,
  },
})
