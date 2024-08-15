import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Stacks from './src/navigation/stacks';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '~navigation/types';
import {PaperProvider} from 'react-native-paper';
import Theme from '~constants/theme';
import {MonthProvider} from '~contexts/monthContext';

const App = () => {
  const RootStack = createNativeStackNavigator<RootStackParamList>();

  return (
    <PaperProvider theme={Theme}>
      <MonthProvider>
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
      </MonthProvider>
    </PaperProvider>
  );
};

export default App;
