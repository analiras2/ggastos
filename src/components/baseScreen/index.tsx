import React from 'react';
import * as St from './styles';
import {DetailsHeader, MonthHeader, SimpleTitleHeader} from '~components/index';
import {
  HeaderType,
  IDetailsHeaderProps,
  IMonthHeaderProps,
  ISimpleHeaderProps,
  THeader,
} from '~components/headers/types/header';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  header: THeader;
  noScroll?: boolean;
  noPadding?: boolean;
};

const getHeaderComponent = (
  header: ISimpleHeaderProps | IMonthHeaderProps | IDetailsHeaderProps,
) => {
  switch (header.type) {
    case HeaderType.SIMPLE: {
      const {title} = header as ISimpleHeaderProps;
      return <SimpleTitleHeader title={title} />;
    }
    case HeaderType.DETAILS: {
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
    case HeaderType.MONTH:
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
