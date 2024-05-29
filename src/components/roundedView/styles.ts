import styled from 'styled-components/native';
import {Colors, Layout} from '@constants/index';

export const Container = styled.View`
  height: 44px;
  width: ${Layout.W_WIDTH - 40}px;
  border-radius: 50px;
  background-color: ${Colors.backgroundLight};
  align-items: center;
  justify-content: center;
  margin-horizontal: 20px;
  position: absolute;
  top: 76px;
  shadow-color: #000;
  shadow-opacity: 0.3;
  shadow-radius: 4.65px;
  elevation: 4;
`;

export const Balance = styled.View`
  flex-direction: row;
`;

export const BalanceItem = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Divider = styled.View`
  background-color: ${Colors.border};
  height: 44px;
  width: 1px;
`;
