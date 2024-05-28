import styled from 'styled-components/native';
import {Colors, Layout} from '@constants/index';

type Props = {
  noPadding?: boolean;
};

export const StatusBar = styled.SafeAreaView<Props>`
  background-color: ${Colors.primary};
`;

export const Container = styled.SafeAreaView<Props>`
  height: 100%;
  width: 100%;
  background-color: #fff;
`;

export const ScrollView = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
  },
}))``;

export const Body = styled.View<Props>`
  flex: 1;
  padding-horizontal: ${({noPadding}) =>
    noPadding ? 0 : Layout.padding.SCREEN}px;
  margin-bottom: 44px;
`;
