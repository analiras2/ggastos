import React from 'react';
import {BaseScreen, Text} from '~components/index';
import {Strings} from '~constants/index';

const ChartScreen = () => (
  <BaseScreen header={{type: 'SIMPLE', title: Strings.yearConsolidated}}>
    <Text>Screen</Text>
  </BaseScreen>
);

export default ChartScreen;
