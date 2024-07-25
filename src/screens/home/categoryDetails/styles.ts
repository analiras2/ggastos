import {Layout} from '~constants/index';
import styled from 'styled-components/native';
import {FAB as RNPFAB} from 'react-native-paper';

export const Container = styled.View`
  padding-horizontal: ${Layout.SCREEN_PADDING}px;
`;

export const FAB = styled(RNPFAB)`
  position: absolute;
  justify-content: center;
  bottom: 12px;
  right: 12px;
  border-radius: 50px;
`;
