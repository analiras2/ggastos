import React from 'react';
import {TouchableOpacity} from 'react-native';
import * as St from './styles';
import Text from '~components/text';
import {GroupItem} from '~models/groupItem';

type Props = {
  item: GroupItem;
  onSelect: (item: GroupItem) => void;
  showColor?: boolean;
};

const ListItem = ({item, showColor = false, onSelect}: Props) => (
  <TouchableOpacity onPress={() => onSelect(item)}>
    <St.Item>
      {showColor && <St.ColorDot color={item.data?.color} />}
      <Text>{item.title}</Text>
    </St.Item>
  </TouchableOpacity>
);

export default ListItem;
