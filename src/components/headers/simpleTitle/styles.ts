import {Colors, Layout} from '@constants/index';
import styled from 'styled-components/native';

export const Container = styled.View`
  height: 100px;
  background-color: ${Colors.primary};
  padding-bottom: ${Layout.padding.SCREEN}px;
  padding-horizontal: ${Layout.padding.MEDIUM}px;
  justify-content: center;
`;
