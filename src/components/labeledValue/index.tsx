import React from 'react';
import Text from '~components/text';
import {Colors} from '~constants/index';
import {FlexAlignType} from 'react-native';
import * as St from './styles';

type Props = {
  title: string;
  value: number;
  align?: FlexAlignType;
  color?: string;
  light?: boolean;
};

const LabeledValue = ({title, value, light, color}: Props) => (
  <St.Container>
    <Text type="LABEL" color={light ? Colors.textLight : color}>
      {title}
    </Text>
    <Text color={light ? Colors.textLight : Colors.text} money>
      {value}
    </Text>
  </St.Container>
);

export default LabeledValue;
