import styled from 'styled-components/native';
import {Colors, Layout} from '~constants/index';
import Text from '~components/text';

export const Container = styled.View`
  height: 100px;
  background-color: ${Colors.primary};
  padding-bottom: 8px;
  padding-horizontal: 16px;
`;

export const CurrentMonth = styled.TouchableOpacity`
  width: ${Layout.W_WIDTH / 2}px;
  align-items: center;
  margin-top: 16px;
`;

export const OtherMonth = styled(Text)`
  width: ${Layout.W_WIDTH / 5}px;
  margin-top: 28px;
  text-align: center;
`;
