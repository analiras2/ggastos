import styled from 'styled-components/native';
import {Colors} from '~constants/index';

interface Props {
  color: string;
}

export const Header = styled.View`
  height: 112px;
  background-color: ${Colors.primary};
  padding-vertical: 20px;
  padding-horizontal: 16px;
`;

export const HeaderData = styled.View`
  flex: 1;
  flex-direction: row;
  margin-top: 8px;
  justify-content: space-between;
`;

export const CategoryColor = styled.View<Props>`
  height: 4px;
  width: 100%;
  background-color: ${({color}) => color};
`;

export const Column = styled.View`
  flex-direction: column;
  align-items: center;
`;

export const BackButton = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  align-items: center;
  position: absolute;
  left: 12px;
  top: 24px;
`;

export const BalanceItem = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
