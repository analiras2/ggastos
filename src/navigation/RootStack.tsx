import { createStackNavigator } from '@react-navigation/stack'
import CategoryDetails from '@screens/Home/CategoryDetails'
import React from 'react'
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
      <Stack.Screen
        name={ROUTES.CATEGORY_DETAILS}
        component={CategoryDetails}
        options={({ route }) => ({
          headerTitle: route.params.categoryName,
        })}
      />
    </Stack.Navigator>
  )
}
