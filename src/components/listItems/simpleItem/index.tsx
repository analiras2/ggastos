import React from 'react';
import {TouchableOpacity} from 'react-native';
import * as St from './styles';
import Text from '@components/text';
import {Data, Option} from '@components/selector';

type Props = {
  item: Option;
  onSelect: (data: Data) => void;
  showColor?: boolean;
};

const ListItem = ({item, showColor = false, onSelect}: Props) => (
  <TouchableOpacity onPress={() => onSelect(item.data)}>
    <St.Item>
      {showColor && <St.ColorDot color={item.data.color} />}
      <Text>{item.title}</Text>
    </St.Item>
  </TouchableOpacity>
);

export default ListItem;
