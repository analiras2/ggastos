import React from 'react';
import * as St from './styles';
import {DetailsHeader, MonthHeader, SimpleTitleHeader} from '~components/index';
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

export interface IMonthHeaderProps {
  type: typeof HEADER_TYPE.MONTH;
  balance: IBalanceData;
}

export interface IDetailsHeaderProps {
  type: typeof HEADER_TYPE.DETAILS;
  balance: IBalanceData;
  title: string;
  categoryColor: string;
  onBack: () => void;
}

type Props = {
  children: React.ReactNode | React.ReactNode[];
  header: ISimpleHeaderProps | IMonthHeaderProps | IDetailsHeaderProps;
  noScroll?: boolean;
  noPadding?: boolean;
};

const getHeaderComponent = (
  header: ISimpleHeaderProps | IMonthHeaderProps | IDetailsHeaderProps,
) => {
  switch (header.type) {
    case HEADER_TYPE.SIMPLE: {
      const {title} = header as ISimpleHeaderProps;
      return <SimpleTitleHeader title={title} />;
    }
    case HEADER_TYPE.DETAILS: {
      const {title, balance, categoryColor, onBack} =
        header as IDetailsHeaderProps;
      return (
        <DetailsHeader
          title={title}
          balance={balance}
          categoryColor={categoryColor}
          onBack={onBack}
        />
      );
    }
    case HEADER_TYPE.MONTH:
      const {balance} = header as IMonthHeaderProps;
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
