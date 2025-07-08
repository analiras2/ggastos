import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomTabs } from '@navigation/BottomTabs';
import { theme } from '@theme/index';
import { SnackbarProvider } from '@contexts/SnackbarContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme as any}>
        <SnackbarProvider>
          <BottomTabs />
        </SnackbarProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
