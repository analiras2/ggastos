import React from 'react';
import * as St from './styles';

type Props = {
  title: string;
  children?: React.ReactNode | React.ReactNode[];
  noScroll?: boolean;
  noPadding?: boolean;
};

const BaseScreen = ({noScroll, noPadding, children}: Props) => {
  return (
    <St.StatusBar>
      <St.Container>
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
