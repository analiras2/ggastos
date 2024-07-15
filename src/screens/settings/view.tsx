import React from 'react';
import {BaseScreen, Text} from '~components/index';
import {Strings} from '~constants/index';

const SettingsScreen = () => {
  return (
    <BaseScreen header={{type: 'SIMPLE', title: Strings.configuration}}>
      <Text>Settings</Text>
    </BaseScreen>
  );
};

export default SettingsScreen;
