import { SnackbarProvider } from '@contexts/SnackbarContext'
import { BottomTabs } from '@navigation/BottomTabs'
import { NavigationContainer } from '@react-navigation/native'
import { theme } from '@theme/index'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import React from 'react'

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <SnackbarProvider>
          <BottomTabs />
        </SnackbarProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default App
