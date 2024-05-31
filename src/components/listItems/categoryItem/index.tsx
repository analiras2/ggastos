import LabeledValue from '@components/labeledValue';
import Text from '@components/text';
import {Colors, Strings} from '@constants/index';
import React from 'react';
import * as St from './styles';

type Data = {
  color: string;
  name: string;
  totalExpected: number;
  totalSpent: number;
};

type Props = {
  index: number;
  data: Data;
  onCallback: () => void;
};

const CategoryListItem = ({index, data, onCallback}: Props) => {
  return (
    <St.Container onPress={onCallback} isFirst={index === 0}>
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
