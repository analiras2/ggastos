import {createElement} from 'react';
import ChartView from './view';
import {HeaderType} from '~components/headers/types/header';
import {Strings} from '~constants/index';

const ChartScreen = () => {
  return createElement(ChartView, {
    headerData: {
      type: HeaderType.SIMPLE,
      title: Strings.yearConsolidated,
    },
  });
};

export default ChartScreen;
