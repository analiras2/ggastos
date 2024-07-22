import styled from 'styled-components/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {TextInput, TextInputProps, HelperText} from 'react-native-paper';

export const Input = styled(TextInput)<TextInputProps>`
  flex: 1;
  background-color: transparent;
`;

export const Row = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const Column = styled.View`
  flex: 1;
  flex-direction: column;
`;

export const HelperTxt = styled(HelperText)`
  margin-left: 16px;
`;

export const Icon = styled(SimpleLineIcons)`
  margin-right: 10px;
`;
