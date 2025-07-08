import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomTabs } from '@navigation/BottomTabs';
import { theme } from '@theme/index';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#FFFFFF"
      />
      <NavigationContainer theme={theme as any}>
        <BottomTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
