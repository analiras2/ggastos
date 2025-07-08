import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/ionicons';
import { useAppTheme } from '@theme/hooks/useAppTheme';
import { Theme } from '@theme/index';
import HomeScreen from '@screens/Home';
import ChartScreen from '@screens/Charts';
import SettingsScreen from '@screens/Settings';
import { ROUTES } from './routes';

type IconNames = 'grid-outline' | 'pie-chart-outline' | 'settings-outline';

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

type TabScreenConfig = {
  name: string;
  component: React.ComponentType<any>;
  iconName: IconNames;
}

const Tab = createBottomTabNavigator();

const createTabBarIcon = (iconName: IconNames) => (props: TabBarIconProps) => (
  <TabBarIcon {...props} iconName={iconName} />
);

const TAB_SCREENS: TabScreenConfig[] = [
  {
    name: ROUTES.CHARTS,
    component: ChartScreen,
    iconName: 'pie-chart-outline',
  },
  {
    name: ROUTES.HOME,
    component: HomeScreen,
    iconName: 'grid-outline',
  },
  {
    name: ROUTES.SETTINGS,
    component: SettingsScreen,
    iconName: 'settings-outline',
  },
];

const createScreenOptions = (theme: Theme) => ({
  headerShown: false,
  tabBarStyle: {
    height: theme.metrics.bottomTabHeight,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tabBarShowLabel: false,
  tabBarInactiveTintColor: theme.colors.icon,
  tabBarActiveTintColor: theme.colors.iconLight,
});

const getIconName = (iconName: IconNames, focused: boolean): string => {
  if (!focused) return iconName;
  return iconName.replace('-outline', '');
};

const TabBarIcon = ({ iconName, focused, color, size }: TabBarIconProps & { iconName: IconNames }) => (
  <Icon
    name={getIconName(iconName, focused)}
    color={color}
    size={focused ? size : size - 4}
  />
);

export const BottomTabs = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={createScreenOptions(theme)}
    >
      {TAB_SCREENS.map(({ name, component, iconName }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: createTabBarIcon(iconName),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};
