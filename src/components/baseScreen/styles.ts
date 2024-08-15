import styled from 'styled-components/native';
import {Colors, Layout} from '~constants/index';

type Props = {
  noPadding?: boolean;
};

export const StatusBar = styled.SafeAreaView<Props>`
  background-color: ${Colors.primary};
`;

export const Container = styled.SafeAreaView<Props>`
  position: relative;
  height: 100%;
  width: 100%;
  background-color: ${Colors.backgroundLight};
`;

export const ScrollView = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
  },
}))``;

export const Body = styled.View<Props>`
  flex: 1;
  padding-horizontal: ${({noPadding}) =>
    noPadding ? 0 : Layout.SCREEN_PADDING}px;
  margin-bottom: ${({noPadding}) => (noPadding ? 0 : 44)}px;
`;
