import {Card} from 'react-native-paper';
import styled from 'styled-components/native';
import {Colors} from '~constants/index';

export const Container = styled(Card)<{isFirst: boolean}>`
  flex: 1;
  padding: 16px;
  margin-horizontal: 8px;
  margin-top: ${props => (props.isFirst ? 36 : 0)}px;
  margin-bottom: 16px;
  background-color: ${Colors.card};
  border-radius: 8px;
`;

export const Data = styled.View`
  flex: 1px;
  flex-direction: row;
  margin-top: 8px;
`;
