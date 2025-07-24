import {StyleSheet} from 'react-native';
import { TypographyVariant } from './types';

export const styles = StyleSheet.create({
  [TypographyVariant.LABEL]: {
    fontSize: 12,
    lineHeight: 16,
  },
  [TypographyVariant.BODY]: {
    fontSize: 14,
    lineHeight: 20,
  },
  [TypographyVariant.TITLE]: {
    fontSize: 16,
    lineHeight: 24,
  },
  [TypographyVariant.HEADER]: {
    fontSize: 20,
    lineHeight: 28,
  },
});

export const getTypographyStyle = (variant: TypographyVariant) => styles[variant] || styles.body;
