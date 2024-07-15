import React from 'react';
import * as St from './styles';
import Text from '~components/text';
import {Colors, Strings} from '~constants/index';
import {IBalanceData} from '~types/balance';

const LAYOUT_TYPES = {
  BALANCE: 'BALANCE',
  TITLE: 'TITLE',
} as const;

type BalanceProps = {
  type: typeof LAYOUT_TYPES.BALANCE;
  data: IBalanceData;
};

type TitleProps = {
  type: typeof LAYOUT_TYPES.TITLE;
  title: string;
};

type Props = BalanceProps | TitleProps;

const BalanceView = ({data}: {data: IBalanceData}) => (
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

const RoundedView = ({type, ...rest}: Props) => {
  if (type === LAYOUT_TYPES.BALANCE) {
    const {data} = rest as BalanceProps;

    return (
      <St.Container>
        <BalanceView data={data} />
      </St.Container>
    );
  } else {
    const {title} = rest as TitleProps;

    return (
      <St.Container>
        <TitleView title={title} />
      </St.Container>
    );
  }
};

export default RoundedView;
