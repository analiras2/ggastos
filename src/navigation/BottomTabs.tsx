import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppTheme } from '@theme/hooks/useAppTheme';
import { Theme } from '@theme/index';
import HomeScreen from '@screens/home';
import ChartScreen from '@screens/chart';
import SettingsScreen from '@screens/settings';
import { ROUTES } from './routes';


const Tab = createBottomTabNavigator();

const screenOptions = (theme: Theme) => ({
  headerShown: false,
  tabBarStyle: {
    height: theme.metrics.bottomTabHeight,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tabBarLabelStyle: {
    fontSize: theme.typography.sizes.sm,
  },
  tabBarInactiveTintColor: theme.colors.icon,
  tabBarActiveTintColor: theme.colors.iconLight,
});


export const BottomTabs = () => {
  const theme = useAppTheme()

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={() => screenOptions(theme)}>
      <Tab.Screen 
         name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
         name={ROUTES.CHARTS}
        component={ChartScreen}
        options={{
          tabBarLabel: 'Charts',
        }}
      />
      <Tab.Screen 
         name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};
