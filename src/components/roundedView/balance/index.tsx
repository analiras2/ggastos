import React from 'react';
import * as St from './styles';
import Text from '~components/text';
import {Colors, Strings} from '~constants/index';
import {IBalanceData} from 'src/types/balance';

type Props = {
  data: IBalanceData;
};

const Balance = ({data}: Props) => (
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

export default Balance;
