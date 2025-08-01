import { StyleSheet } from 'react-native'
import { TypographyVariant } from './types'

export const styles = StyleSheet.create({
  tiny: {
    fontSize: 8,
  },
  label: {
    fontSize: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
  },
  header: {
    fontSize: 20,
    lineHeight: 28,
  },
})

export const getTypographyStyle = (variant: TypographyVariant) =>
  styles[variant] || styles.body
