import styled from 'styled-components/native';
import {Colors} from '~constants/index';

export const Balance = styled.View`
  flex-direction: row;
`;

export const BalanceItem = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Divider = styled.View`
  background-color: ${Colors.divider};
  height: 44px;
  width: 1px;
`;
