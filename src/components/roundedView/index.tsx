import React from 'react';
import * as St from './styles';
import Text from '@components/text';
import {Colors, Strings} from '@constants/index';

enum LAYOUT_TYPES {
  BALANCE,
  TITLE,
}

type BalanceData = {
  expected: number;
  current: number;
};

type Props = {
  type: LAYOUT_TYPES;
  data?: BalanceData;
  title?: string;
};

const BalanceView = ({data}: {data: BalanceData}) => (
  <St.Balance>
    <St.BalanceItem>
      <Text color={Colors.label} type="LABEL">
        {Strings.expectedBalance}
      </Text>
      <Text type="TITLE" money>
        {data.expected}
      </Text>
    </St.BalanceItem>
    <St.Divider />
    <St.BalanceItem>
      <Text color={Colors.label} type="LABEL">
        {Strings.currentBalance}
      </Text>
      <Text type="HEADER" money>
        {data.current}
      </Text>
    </St.BalanceItem>
  </St.Balance>
);

const TitleView = ({title}: {title: string}) => (
  <Text type="HEADER">{title}</Text>
);

const RoundedView = ({type, data, title = ''}: Props) => {
  const renderByType = () => {
    switch (type) {
      case LAYOUT_TYPES.BALANCE:
        return data ? <BalanceView data={data} /> : null;
      case LAYOUT_TYPES.TITLE:
        return <TitleView title={title} />;
      default:
        return null;
    }
  };

  return <St.Container>{renderByType()}</St.Container>;
};

RoundedView.layoutType = LAYOUT_TYPES;

export default RoundedView;
