import React from 'react';
import {TSimpleHeader} from '~components/headers/types/header';
import {BaseScreen, Text} from '~components/index';

type SettingsScreenProps = {
  headerData: TSimpleHeader;
};

const SettingsScreen = ({headerData}: SettingsScreenProps) => (
  <BaseScreen header={headerData}>
    <Text>Screen</Text>
  </BaseScreen>
);

export default SettingsScreen;
