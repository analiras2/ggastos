import { SnackbarProvider } from '@contexts/SnackbarContext'
import { RootStack } from '@navigation/RootStack'
import { NavigationContainer } from '@react-navigation/native'
import { theme } from '@theme/index'
import 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import React from 'react'

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <SnackbarProvider>
          <RootStack />
        </SnackbarProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default App
