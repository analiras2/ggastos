import React from 'react';
import {Text as Txt} from 'react-native';
import {Colors} from '@constants/index';

const STYLES = {
  LABEL: {fontSize: 12},
  DEFAULT: {fontSize: 14},
  TITLE: {fontSize: 16},
  TITLE_BOLD: {fontSize: 16, fontWeight: 'bold'},
  HEADER: {fontSize: 24},
};

type Props = {
  type?: {fontSize: number; fontWeight?: string};
  children: string;
  color?: string;
  money?: boolean;
  margin?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  style?: {};
};

const Text = ({
  type = STYLES.DEFAULT,
  children,
  money,
  color = Colors.text,
  margin = 0,
  marginVertical = 0,
  marginHorizontal = 0,
  style,
}: Props) => {
  const currentStyle = [
    type,
    {
      color,
      margin,
      marginVertical,
      marginHorizontal,
    },
    style,
  ];

  if (money) {
    const value = parseFloat(children).toFixed(2).split('.');

    return (
      <Txt style={currentStyle}>
        <Txt style={STYLES.TITLE}>{`R$${value[0]}`}</Txt>
        <Txt style={STYLES.LABEL}>{`,${value[1]}`}</Txt>
      </Txt>
    );
  }
  return <Txt style={currentStyle}>{children}</Txt>;
};

Text.styles = STYLES;

export default Text;
