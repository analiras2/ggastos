import styled from 'styled-components/native';
import {Colors} from '@constants/index';

export const Btn = styled.TouchableOpacity`
  align-self: flex-start;
  height: 40px;
  padding-horizontal: 20px;
  justify-content: center;
  background-color: ${Colors.primary};
  border-radius: 8px;
`;

export const Link = styled.TouchableOpacity`
  height: 40px;
`;
