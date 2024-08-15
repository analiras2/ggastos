import React from 'react';
import {TSimpleHeader} from '~components/headers/types/header';
import {BaseScreen, Text} from '~components/index';

type ChartScreenProps = {
  headerData: TSimpleHeader;
};

const ChartScreen = ({headerData}: ChartScreenProps) => (
  <BaseScreen header={headerData}>
    <Text>Screen</Text>
  </BaseScreen>
);

export default ChartScreen;
