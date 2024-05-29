import React from 'react';
import {BaseScreen, Text} from '@components/index';

const HomeScreen = () => {
  return (
    <BaseScreen headerType={BaseScreen.headerType.MONTH}>
      <Text>Home</Text>
    </BaseScreen>
  );
};

export default HomeScreen;
