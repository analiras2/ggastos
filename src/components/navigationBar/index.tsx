import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import {StackRoutes} from '~navigation/stacks';
import {SettingsScreen, HomeScreen, ChartScreen} from '~screens/index';
import {Colors, Layout} from '~constants/index';

type TabBarIcon = {focused: boolean; color: string; size: number};

const Tab = createBottomTabNavigator();

const screenOptions = () => ({
  tabBarStyle: {
    height: Layout.IS_IOS ? 90 : 64,
    paddingTop: 8,
    backgroundColor: Colors.primary,
    borderTopWidth: 1,
  },
  tabBarLabelStyle: {
    fontSize: Layout.TAB_BAR_LABEL,
  },
  tabBarInactiveTintColor: Colors.icon,
  tabBarActiveTintColor: Colors.iconLight,
});

const getTabBarIcon =
  (iconName: string) =>
  ({focused, color, size}: TabBarIcon) =>
    <Icon name={focused ? iconName : iconName} color={color} size={size} />;

const NavigationBar = () => (
  <Tab.Navigator
    initialRouteName={StackRoutes.HOME}
    screenOptions={screenOptions}>
    <Tab.Screen
      name={StackRoutes.SETTINGS}
      component={SettingsScreen}
      options={{
        headerShown: false,
        title: 'Settings',
        tabBarIcon: getTabBarIcon('settings'),
      }}
    />
    <Tab.Screen
      name={StackRoutes.HOME}
      component={HomeScreen}
      options={{
        headerShown: false,
        title: 'Home',
        tabBarIcon: getTabBarIcon('home'),
      }}
    />
    <Tab.Screen
      name={StackRoutes.CHART}
      component={ChartScreen}
      options={{
        headerShown: false,
        title: 'Chart',
        tabBarIcon: getTabBarIcon('pie-chart'),
      }}
    />
  </Tab.Navigator>
);

export default NavigationBar;
