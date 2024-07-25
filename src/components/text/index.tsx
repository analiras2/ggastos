import React from 'react';
import {Text as Txt} from 'react-native-paper';
import {Colors} from '~constants/index';
import type {TextStyle} from 'react-native';

const STYLES = {
  LABEL: 'bodySmall',
  DEFAULT: 'bodyLarge',
  TITLE: 'titleMedium',
  HEADER: 'titleLarge',
} as const;

type typeKeys = keyof typeof STYLES;

type Props = {
  type?: typeKeys;
  children: string | number;
  color?: string;
  money?: boolean;
  mb?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
  style?: TextStyle;
};

const Text = ({
  type = 'DEFAULT',
  children,
  money,
  color = Colors.text,
  style,
  mb,
  bold,
  textAlign,
}: Props) => {
  const currentStyle = [
    {
      color,
      marginBottom: mb,
      textAlign,
      fontWeight: bold ? 'bold' : 'normal',
    },
    style,
  ] as TextStyle;

  if (money) {
    const formattedValue =
      typeof children === 'string'
        ? parseFloat(children).toFixed(2).split('.')
        : children.toFixed(2).split('.');

    return (
      <Txt style={currentStyle}>
        <Txt
          variant={STYLES.DEFAULT}
          style={currentStyle}>{`R$${formattedValue[0]}`}</Txt>
        <Txt
          variant={STYLES.LABEL}
          style={currentStyle}>{`,${formattedValue[1]}`}</Txt>
      </Txt>
    );
  }
  return (
    <Txt variant={STYLES[type]} style={currentStyle}>
      {children}
    </Txt>
  );
};

export default Text;
