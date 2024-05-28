import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {StackRoutes} from '@navigation/stacks';
import {SettingsScreen, HomeScreen, ChartScreen} from '@screens/index';

import {Colors, Layout} from '@constants/index';

const Tab = createBottomTabNavigator();

const NavigationBar = () => (
  <Tab.Navigator
    initialRouteName={StackRoutes.HOME}
    screenOptions={() => ({
      tabBarStyle: {
        height: 90,
        paddingTop: Layout.padding.SMALL,
        backgroundColor: Colors.primary,
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: Layout.font.LABEL,
      },
      tabBarInactiveTintColor: Colors.icon,
      tabBarActiveTintColor: Colors.iconLight,
    })}>
    <Tab.Screen
      name={StackRoutes.SETTINGS}
      component={SettingsScreen}
      options={{
        headerShown: false,
        title: 'Settings',
        tabBarIcon: ({focused, color, size}) => (
          <Icon
            name={focused ? 'settings' : 'settings-outline'}
            color={color}
            size={size}
          />
        ),
      }}
    />
    <Tab.Screen
      name={StackRoutes.HOME}
      component={HomeScreen}
      options={{
        headerShown: false,
        title: 'Home',
        tabBarIcon: ({focused, color, size}) => (
          <Icon
            name={focused ? 'home' : 'home-outline'}
            color={color}
            size={size}
          />
        ),
      }}
    />
    <Tab.Screen
      name={StackRoutes.CHART}
      component={ChartScreen}
      options={{
        headerShown: false,
        title: 'Chart',
        tabBarIcon: ({focused, color, size}) => (
          <Icon
            name={focused ? 'pie-chart' : 'pie-chart-outline'}
            color={color}
            size={size}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

export default NavigationBar;
