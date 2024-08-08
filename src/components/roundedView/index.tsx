import React from 'react';
import Text from '~components/text';
import {Strings} from '~constants/index';
import {IBalanceData} from '~types/balance';
import LabeledValue from '~components/labeledValue';
import * as St from './styles';

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
    <LabeledValue
      label={Strings.expectedBalance}
      value={data.expected}
      valueIsMoney
    />
    <St.Divider />
    <LabeledValue
      label={Strings.currentBalance}
      value={data.current}
      valueIsMoney
    />
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
