import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Stacks from './src/navigation/stacks';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '~types/navigation';

const App = () => {
  const RootStack = createNativeStackNavigator<RootStackParamList>();

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {Stacks().map(stack => (
          <RootStack.Screen
            key={stack.name}
            name={stack.name}
            component={stack.component}
            options={stack.options || {}}
          />
        ))}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default App;
