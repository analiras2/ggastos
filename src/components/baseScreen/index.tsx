import React from 'react';
import * as St from './styles';
import {MonthHeader, SimpleTitleHeader} from '@components/index';
import {Strings} from '@constants/index';

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

const getHeaderComponent = (headerType: HEADER_TYPE, title?: string) => {
  const currentTitle = title || Strings.appName;

  const headerMap = {
    [HEADER_TYPE.SIMPLE]: <SimpleTitleHeader title={currentTitle} />,
    [HEADER_TYPE.MONTH]: (
      <MonthHeader currentBalance={50} expectedBalance={10} />
    ),
    [HEADER_TYPE.DETAILS]: (
      <MonthHeader currentBalance={50} expectedBalance={10} />
    ), // TODO: insert correct component
  };

  return headerMap[headerType];
};

const BaseScreen = ({
  title,
  headerType = HEADER_TYPE.SIMPLE,
  noScroll,
  noPadding,
  children,
}: Props) => {
  return (
    <St.StatusBar>
      <St.Container>
        {getHeaderComponent(headerType, title)}
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
