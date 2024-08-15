import React from 'react';
import Text from '~components/text';
import {IPurchase} from '~models/types/purchase';
import {formatDate} from '~utils/index';
import * as St from './styles';
import Header from './header';
import Footer from './footer';

type CategoryDetailListItemProps = {
  item: IPurchase;
  color: string;
  onPress: () => void;
};

const CategoryDetailListItem = ({
  item,
  color,
  onPress,
}: CategoryDetailListItemProps) => {
  return (
    <St.Container>
      <St.Date>
        <Text type="LABEL">{formatDate(new Date(item.date))}</Text>
      </St.Date>
      <Header item={item} color={color} onPress={onPress} />
      <Footer item={item} />
    </St.Container>
  );
};

export default CategoryDetailListItem;
