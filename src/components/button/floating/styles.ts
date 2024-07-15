import styled from 'styled-components/native';
import {Colors, Layout} from '~constants/index';
import {FadeAnimation} from '~components/index';

export const AnimationContainer = styled(FadeAnimation)`
  height: 54px;
  width: 54px;
  border-radius: 28px;
  background-color: ${Colors.primary};
  position: absolute;
  justify-content: center;
  align-items: center;
  bottom: 12px;
  right: 12px;
  ${Layout.shadowStyle}
`;
