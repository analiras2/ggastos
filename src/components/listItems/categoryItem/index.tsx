import LabeledValue from '@components/labeledValue';
import Text from '@components/text';
import {Colors, Strings} from '@constants/index';
import React from 'react';
import * as St from './styles';
import {Category} from '@models/category';

type Props = {
  index: number;
  data: Category;
  onPress: (item: Category) => void;
};

const CategoryListItem = ({index, data, onPress}: Props) => {
  return (
    <St.Container onPress={() => onPress(data)} isFirst={index === 0}>
      <Text type={Text.styles.TITLE_BOLD} color={data.color} mb={4}>
        {data.name}
      </Text>
      <St.Data>
        <LabeledValue
          title={Strings.expectedSpend}
          value={data.totalExpected}
          color={Colors.label}
        />
        <LabeledValue
          title={Strings.currentSpend}
          value={data.totalSpent}
          color={Colors.label}
        />
      </St.Data>
    </St.Container>
  );
};

export default CategoryListItem;
