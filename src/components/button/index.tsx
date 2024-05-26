import React from 'react';
import * as St from './styles';
import Text from '../text';
import {Colors} from '@constants/index';

enum TYPE {
  DEFAULT,
  LINK,
}

type Props = {
  type?: TYPE;
  text: string;
  onPress: () => void;
};

const Button = ({type = TYPE.DEFAULT, text, onPress}: Props) => {
  const Component = type === TYPE.DEFAULT ? St.Btn : St.Link;
  const textColor = type === TYPE.DEFAULT ? Colors.title : Colors.text;

  return (
    <Component onPress={onPress} activeOpacity={0.8}>
      <Text type={Text.styles.TITLE} color={textColor}>
        {text.toUpperCase()}
      </Text>
    </Component>
  );
};

Button.types = TYPE;

export default Button;
