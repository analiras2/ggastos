import React from 'react';
import {Text as Txt} from 'react-native';
import {Colors} from '~constants/index';
import type {TextStyle} from 'react-native';

const STYLES = {
  LABEL: {fontSize: 12},
  DEFAULT: {fontSize: 14},
  TITLE: {fontSize: 16},
  HEADER: {fontSize: 24},
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
    STYLES[type],
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
        <Txt style={STYLES.TITLE}>{`R$${formattedValue[0]}`}</Txt>
        <Txt style={STYLES.LABEL}>{`,${formattedValue[1]}`}</Txt>
      </Txt>
    );
  }
  return <Txt style={currentStyle}>{children}</Txt>;
};

export default Text;
