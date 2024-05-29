import styled from 'styled-components/native';
import {Colors, Layout} from '@constants/index';
import Text from '@components/text';

export const Container = styled.View`
  height: 100px;
  background-color: ${Colors.primary};
  padding-bottom: ${Layout.padding.SMALL}px;
  padding-horizontal: ${Layout.padding.MEDIUM}px;
  margin-bottom: 32px;
`;

export const CurrentMonth = styled.TouchableOpacity`
  width: ${Layout.W_WIDTH / 2}px;
  align-items: center;
  margin-top: ${Layout.margin.MEDIUM}px;
`;

export const OtherMonth = styled(Text)`
  width: ${Layout.W_WIDTH / 5}px;
  margin-top: 28px;
  text-align: center;
`;
