import {Colors, Layout} from '~constants/index';
import styled from 'styled-components/native';
import {FAB as RNPFAB} from 'react-native-paper';

type CBXProps = {
  isPaid: boolean;
  accentColor: string;
};

type RowProps = {
  spaceBetween?: boolean;
  mb?: number;
};

export const Container = styled.View`
  position: relative;
  padding: ${Layout.SCREEN_PADDING}px;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.border};
`;

export const Date = styled.View`
  position: absolute;
  top: 6px;
  right: 20px;
`;

export const FAB = styled(RNPFAB)`
  position: absolute;
  justify-content: center;
  bottom: 12px;
  right: 12px;
  border-radius: 50px;
`;

export const Row = styled.View<RowProps>`
  flex-direction: row;
  align-items: center;
  justify-content: ${({spaceBetween}) =>
    spaceBetween ? 'space-between' : 'flex-start'};
  margin-bottom: ${({mb}) => mb}px;
`;

export const CheckButton = styled.TouchableOpacity<CBXProps>`
  width: 20px;
  height: 20px;
  background-color: ${({isPaid, accentColor}) =>
    isPaid ? accentColor : 'transparent'};
  border-color: ${({isPaid, accentColor}) =>
    isPaid ? accentColor : Colors.border};
  border-width: 1px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;

export const Dot = styled.View<CBXProps>`
  width: 16px;
  height: 16px;
  border-width: 3px;
  border-radius: 8px;
  border-color: white;
  background-color: ${({isPaid, accentColor}) =>
    isPaid ? accentColor : 'transparent'};
`;
