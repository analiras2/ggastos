import {createElement} from 'react';
import SettingsView from './view';
import {HeaderType} from '~components/headers/types/header';
import {Strings} from '~constants/index';

const SettingsScreen = () => {
  return createElement(SettingsView, {
    headerData: {
      type: HeaderType.SIMPLE,
      title: Strings.configuration,
    },
  });
};

export default SettingsScreen;
