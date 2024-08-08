import React from 'react';
import Text from '~components/text';
import {Colors} from '~constants/index';
import * as St from './styles';

type Props = {
  label: string;
  value: number | string;
  align?: 'left' | 'center' | 'right' | 'justify';
  light?: boolean;
  valueIsMoney?: boolean;
  flex?: number;
};

const LabeledValue = ({
  label,
  value,
  align = 'center',
  light,
  valueIsMoney,
  flex = 1,
}: Props) => (
  <St.Container flex={flex}>
    <Text
      color={light ? Colors.textLight : Colors.label}
      type="LABEL"
      textAlign={align}>
      {label}
    </Text>
    <Text
      type="TITLE"
      color={light ? Colors.textLight : Colors.text}
      textAlign={align}
      money={valueIsMoney}>
      {value}
    </Text>
  </St.Container>
);

export default LabeledValue;
