import LabeledValue from '~components/labeledValue';
import Text from '~components/text';
import {Colors, Strings} from '~constants/index';
import React from 'react';
import * as St from './styles';
import {CategoryModel} from '~models/category';

type Props = {
  index: number;
  data: CategoryModel;
  onPress: (item: CategoryModel) => void;
};

const CategoryListItem = ({index, data, onPress}: Props) => {
  const isFirst = index === 0;
  return (
    <St.Container onPress={() => onPress(data)} isFirst={isFirst}>
      <Text type="TITLE" color={data.color} bold>
        {data.name}
      </Text>
      <St.Data>
        <LabeledValue
          title={isFirst ? Strings.expectedGain : Strings.expectedSpend}
          value={data.totalExpected}
          color={Colors.label}
        />
        <LabeledValue
          title={isFirst ? Strings.currentGain : Strings.currentSpend}
          value={data.totalSpent}
          color={Colors.label}
        />
      </St.Data>
    </St.Container>
  );
};

export default CategoryListItem;
