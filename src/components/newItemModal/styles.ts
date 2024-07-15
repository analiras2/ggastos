import {Colors, Layout} from '~constants/index';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.modalBackground};
  align-items: center;
  padding: ${Layout.padding.SCREEN}px;
`;

export const Form = styled.View`
  margin-top: 112px;
  height: 362px;
  width: 100%;
  padding: 20px;
  background-color: ${Colors.card};
  border-radius: 8px;
`;

export const Row = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 28px;
`;
