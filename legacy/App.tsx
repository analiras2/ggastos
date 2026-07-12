import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DateProvider } from '@/contexts/DateContext'
import { SnackbarProvider } from '@contexts/SnackbarContext'
import { RootStack } from '@navigation/RootStack'
import { NavigationContainer } from '@react-navigation/native'
import { theme } from '@theme/index'
import 'react-native-gesture-handler'

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <DateProvider>
          <SnackbarProvider>
            <RootStack />
          </SnackbarProvider>
        </DateProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default App
