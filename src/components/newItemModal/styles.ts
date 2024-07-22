import {Colors, Layout} from '~constants/index';
import styled from 'styled-components/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {Dropdown as ElementDropdown} from 'react-native-element-dropdown';
import {DropdownProps} from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.modalBackground};
  align-items: center;
  padding: ${Layout.SCREEN_PADDING}px;
  position: absolute;
  bottom: -32px;
  top: 0;
  right: 0;
  left: 0;
`;

export const Dropdown = styled(ElementDropdown).attrs({
  itemContainerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemTextStyle: {
    marginVertical: -8,
  },
})<DropdownProps<any>>`
  width: 90%;
  border-bottom-width: 0.2px;
  border-bottom-color: ${Colors.underline};
  padding-bottom: 10px;
  padding-left: 14px;
`;

export const Form = styled.View`
  margin-top: 112px;
  height: 58%;
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

export const Icon = styled(SimpleLineIcons)`
  margin-right: 10px;
`;
