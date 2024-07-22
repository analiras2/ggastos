import React from 'react';
import {TextInputProps} from 'react-native-paper';
import * as St from './styles';
import {TextInputMask} from 'react-native-masked-text';

type Props = TextInputProps & {
  onChangeText: ((value: number) => void) & Function;
};

const MoneyInput = ({value, ...props}: Props) => {
  return (
    <St.Input
      {...props}
      render={props => (
        <TextInputMask
          type={'money'}
          options={{
            precision: 2,
            separator: ',',
            delimiter: '.',
            unit: 'R$ ',
            suffixUnit: '',
          }}
          keyboardType="numeric"
          value={value}
          {...props}
        />
      )}
    />
  );
};

export default MoneyInput;
