import React from 'react';
import * as St from './styles';
import Text from '../text';
import {Colors} from '@constants/index';
import FabButton from './floating/fabButton';

const TYPE = {
  DEFAULT: 'DEFAULT',
  LINK: 'LINK',
  FLOATING: 'FLOATING',
} as const;

type DefaultProps = {
  type: typeof TYPE.DEFAULT | typeof TYPE.LINK;
  text: string;
  onPress: () => void;
};

type FloatingProps = {
  type: typeof TYPE.FLOATING;
  onPress: () => void;
};

type Props = DefaultProps | FloatingProps;

const Button = ({type, onPress, ...rest}: Props) => {
  switch (type) {
    case TYPE.FLOATING:
      return <FabButton onPress={onPress} />;

    case TYPE.LINK:
    case TYPE.DEFAULT:
      const Component = type === TYPE.DEFAULT ? St.Btn : St.Link;
      const textColor = type === TYPE.DEFAULT ? Colors.title : Colors.text;
      const {text} = rest as DefaultProps;

      return (
        <Component onPress={onPress} activeOpacity={0.8}>
          <Text color={textColor}>{text.toUpperCase()}</Text>
        </Component>
      );
  }
};

export default Button;
