import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {IBalanceData} from '~types/balance';
import * as St from './styles';
import {Colors, Strings} from '~constants/index';
import {Text} from '~components/index';
interface Props {
  title: string;
  balance: IBalanceData;
  categoryColor: string;
  onBack: () => void;
}
export const DetailsHeader = ({
  title,
  balance,
  categoryColor,
  onBack,
}: Props) => {
  return (
    <>
      <St.Header>
        <Text type="HEADER" textAlign="center" color={Colors.textLight}>
          {title}
        </Text>
        <St.HeaderData>
          <St.BalanceItem>
            <Text color={Colors.textLight} type="LABEL">
              {Strings.expectedSpend}
            </Text>
            <Text color={Colors.textLight} type="TITLE" money>
              {balance.expected}
            </Text>
          </St.BalanceItem>
          <St.BalanceItem>
            <Text color={Colors.textLight} type="LABEL">
              {Strings.currentSpend}
            </Text>
            <Text color={Colors.textLight} type="TITLE" money>
              {balance.current}
            </Text>
          </St.BalanceItem>
        </St.HeaderData>
      </St.Header>
      <St.CategoryColor color={categoryColor} />
      <St.BackButton onPress={onBack}>
        <Icon name="arrow-back" size={24} color={Colors.iconLight} />
      </St.BackButton>
    </>
  );
};

export default DetailsHeader;
