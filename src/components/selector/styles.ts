import styled from 'styled-components/native';
import {Colors, Layout} from '@constants/index';
import {FlatList} from 'react-native';
import {GroupItem} from '@models/groupItem';

export const Container = styled.SafeAreaView`
  width: ${Layout.W_WIDTH}px;
  height: ${Layout.W_HEIGHT}px;
  background-color: ${Colors.modalBackground};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${Colors.divider};
  margin: 8px;
`;

export const View = styled.View`
  align-items: center;
  position: relative;
`;

export const Body = styled.View`
  width: 350px;
  max-height: 500px;
  background-color: ${Colors.background};
  border-radius: 6px;
  margin-top: 140px;
  padding-vertical: 20px;
  ${Layout.shadowStyle};
`;

export const List = styled(FlatList as new () => FlatList<GroupItem>)`
  padding-bottom: 20px;
`;
