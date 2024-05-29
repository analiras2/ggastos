import React from 'react';
import MonthHeader from '../headers/month';
import * as St from './styles';

enum HEADER_TYPE {
  SIMPLE,
  MONTH,
  DETAILS,
}

type Props = {
  children: React.ReactNode | React.ReactNode[];
  title?: string;
  headerType?: HEADER_TYPE;
  noScroll?: boolean;
  noPadding?: boolean;
};

const SimpleHeader = () => (
  <MonthHeader currentBalance={0} expectedBalance={0} /> // TODO
);
const MonthHeaderComponent = () => (
  <MonthHeader currentBalance={50} expectedBalance={10} />
);
const DetailsHeader = () => (
  <MonthHeader currentBalance={0} expectedBalance={0} /> // TODO
);

const getHeaderComponent = (headerType?: HEADER_TYPE) => {
  const headerMap = {
    [HEADER_TYPE.SIMPLE]: SimpleHeader,
    [HEADER_TYPE.MONTH]: MonthHeaderComponent,
    [HEADER_TYPE.DETAILS]: DetailsHeader,
  };

  return headerType ? headerMap[headerType] : SimpleHeader;
};

const BaseScreen = ({
  title,
  headerType,
  noScroll,
  noPadding,
  children,
}: Props) => {
  const HeaderComponent = getHeaderComponent(headerType);

  return (
    <St.StatusBar>
      <St.Container>
        <HeaderComponent />
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

BaseScreen.headerType = HEADER_TYPE;

export default BaseScreen;
