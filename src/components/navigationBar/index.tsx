import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons/SimpleLineIcons';
import {StackRoutes} from '@navigation/stacks';
import {SettingsScreen, HomeScreen, ChartScreen} from '@screens/index';

import {Colors, Layout} from '@constants/index';

const Tab = createBottomTabNavigator();

const NavigationBar = () => (
  <Tab.Navigator
    screenOptions={() => ({
      tabBarStyle: {
        height: 86,
        paddingTop: Layout.padding.SMALL,
        backgroundColor: Colors.primary,
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: Layout.font.LABEL,
      },
      tabBarInactiveTintColor: Colors.iconLight,
      tabBarActiveTintColor: Colors.iconLight,
    })}>
    <Tab.Screen
      name={StackRoutes.SETTINGS}
      component={SettingsScreen}
      options={{
        headerShown: false,
        title: 'Settings',
        // tabBarIcon: ({focused, color, size}) => (
        //   <Icon
        //     name={focused ? 'settings' : 'account-outline'}
        //     color={color}
        //     size={size}
        //   />
        // ),
      }}
    />
    <Tab.Screen
      name={StackRoutes.HOME}
      component={HomeScreen}
      options={{
        headerShown: false,
        title: 'Home',
        // tabBarIcon: ({focused, color, size}) => (
        //   <Icon
        //     name={focused ? 'grid' : 'grid-outline'}
        //     color={color}
        //     size={size}
        //   />
        // ),
      }}
    />
    <Tab.Screen
      name={StackRoutes.CHART}
      component={ChartScreen}
      options={{
        headerShown: false,
        title: 'Chart',
        // tabBarIcon: ({focused, color, size}) => (
        //   <Icon
        //     name={focused ? 'pie-chart' : 'account-outline'}
        //     color={color}
        //     size={size}
        //   />
        // ),
      }}
    />
  </Tab.Navigator>
);

export default NavigationBar;
