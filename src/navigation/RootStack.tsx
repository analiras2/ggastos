import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import CategoryDetails from '@screens/Home/components/CategoryDetails'
import { BottomTabs } from './BottomTabs'
import { ROUTES } from './routes'
import { RootStackParamList } from './types'

const Stack = createStackNavigator<RootStackParamList>()

export const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name={ROUTES.CATEGORY_DETAILS} component={CategoryDetails} />
    </Stack.Navigator>
  )
}
