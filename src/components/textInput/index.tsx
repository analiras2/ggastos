import React, {useState} from 'react';
import {TextInputProps} from 'react-native-paper';
import {Colors} from '~constants/index';
import MoneyInput from './moneyInput';
import * as St from './styles';

interface IconData {
  name: string;
  size?: number;
  color?: string;
}

type Props = TextInputProps & {
  isMoney?: boolean;
  iconData?: IconData;
  errorMessage?: string;
};

const Icon = ({name, size = 16, color = Colors.iconDark}: IconData) => (
  <St.Icon name={name} size={size} color={color} />
);

const InputComponent = ({isMoney, ...props}: Props) =>
  isMoney ? <MoneyInput {...props} /> : <St.Input {...props} />;

const TextInput = ({iconData, errorMessage, ...props}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  const underlineStyle = {marginBottom: isFocused ? 0 : 4};
  const inputProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  return (
    <>
      <St.Row>
        {iconData && <Icon {...iconData} />}
        <InputComponent
          error={!!errorMessage}
          underlineStyle={underlineStyle}
          {...inputProps}
          {...props}
        />
      </St.Row>
      {errorMessage && (
        <St.HelperTxt type="error" visible={true}>
          {errorMessage}
        </St.HelperTxt>
      )}
    </>
  );
};

export default TextInput;
