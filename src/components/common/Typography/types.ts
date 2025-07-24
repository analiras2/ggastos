import { StyleProp, TextStyle } from 'react-native';

export enum TypographyVariant {
  LABEL = 'label',
  BODY = 'body',
  TITLE = 'title',
  HEADER = 'header'
}

export enum ValueFormat {
  TEXT = 'text',
  CURRENCY = 'currency'
}

export interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode | number;
  color?: string;
  format?: ValueFormat;
  marginBottom?: number;
  paddingHorizontal?: number;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

