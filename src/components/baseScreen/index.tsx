import React from 'react';
import * as St from './styles';
import {MonthHeader, SimpleTitleHeader} from '~components/index';
import {IBalanceData} from '~types/balance';

const HEADER_TYPE = {
  SIMPLE: 'SIMPLE',
  MONTH: 'MONTH',
  DETAILS: 'DETAILS',
} as const;

export interface ISimpleHeaderProps {
  type: typeof HEADER_TYPE.SIMPLE;
  title: string;
}

export interface IBalanceHeaderProps {
  type: typeof HEADER_TYPE.MONTH | typeof HEADER_TYPE.DETAILS;
  balance: IBalanceData;
}

type Props = {
  children: React.ReactNode | React.ReactNode[];
  header: ISimpleHeaderProps | IBalanceHeaderProps;
  noScroll?: boolean;
  noPadding?: boolean;
};

const getHeaderComponent = (
  header: ISimpleHeaderProps | IBalanceHeaderProps,
) => {
  if (header.type === HEADER_TYPE.SIMPLE) {
    const {title} = header as ISimpleHeaderProps;
    return <SimpleTitleHeader title={title} />;
  } else {
    const {balance} = header as IBalanceHeaderProps;
    return (
      <MonthHeader
        currentBalance={balance.current}
        expectedBalance={balance.expected}
      />
    );
  }
};

const BaseScreen = ({header, noScroll, noPadding, children}: Props) => {
  const HeaderComponent = getHeaderComponent(header);

  return (
    <St.StatusBar>
      <St.Container>
        {HeaderComponent}
        {noScroll ? (
          <St.Body noPadding={noPadding}>{children}</St.Body>
        ) : (
          <St.ScrollView>
            <St.Body noPadding={noPadding}>{children}</St.Body>
          </St.ScrollView>
        )}
      </St.Container>
    </St.StatusBar>
  );
};

export default BaseScreen;
