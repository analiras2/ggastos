import React from 'react';
import LabeledValue from '~components/labeledValue';
import Text from '~components/text';
import {Strings} from '~constants/index';
import {CategoryModel} from '~models/category';
import * as St from './styles';

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
          valueIsMoney
          label={isFirst ? Strings.expectedGain : Strings.expectedSpend}
          value={data.totalExpected}
        />
        <LabeledValue
          valueIsMoney
          label={isFirst ? Strings.currentGain : Strings.currentSpend}
          value={data.totalSpent}
        />
      </St.Data>
    </St.Container>
  );
};

export default CategoryListItem;
