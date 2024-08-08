import React from 'react';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Text from '~components/text';
import {Colors} from '~constants/index';
import {IPurchase} from '~types/purchase';
import * as St from './styles';

type HeaderProps = {
  item: IPurchase;
  color: string;
  onPress: () => void;
};

const Header = ({item, color, onPress}: HeaderProps) => {
  return (
    <St.Row spaceBetween mb={8}>
      <St.Row>
        <St.CheckButton
          onPress={onPress}
          isPaid={item.paid}
          accentColor={color}>
          <St.Dot isPaid={item.paid} accentColor={color} />
        </St.CheckButton>
        <Text type="TITLE" bold ph={12}>
          {item.title}
        </Text>
      </St.Row>
      {item.note && (
        <Icon
          name="notebook"
          color={Colors.iconDark}
          size={20}
          onPress={() => console.log('Note', item.note)}
        />
      )}
    </St.Row>
  );
};

export default Header;
