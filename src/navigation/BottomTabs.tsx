import Icon from '@react-native-vector-icons/ionicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import ChartScreen from '@screens/Charts'
import HomeScreen from '@screens/Home'
import SettingsScreen from '@screens/Settings'
import { useTheme } from '@theme/hooks/useTheme'
import { Theme } from '@theme/types'
import React from 'react'
import { ROUTES } from './routes'

type IconName = 'grid-outline' | 'grid' | 'pie-chart-outline' | 'pie-chart' | 'settings-outline' | 'settings';
type IconNameBase = 'grid-outline' | 'pie-chart-outline' | 'settings-outline';

interface TabBarIconProps {
  focused: boolean
  color: string
  size: number
}

type TabScreenConfig = {
  name: string
  component: React.ComponentType<any>
  iconName: IconNameBase
}

const Tab = createBottomTabNavigator()

const createTabBarIcon = (iconName: IconNameBase) => (props: TabBarIconProps) => (
  <TabBarIcon {...props} iconName={iconName} />
)

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
]

const createScreenOptions = (theme: Theme) => ({
  headerShown: false,
  tabBarStyle: {
    height: theme.bottomTabHeight,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tabBarShowLabel: false,
  tabBarInactiveTintColor: theme.colors.icon,
  tabBarActiveTintColor: theme.colors.iconLight,
})

const getIconName = (iconName: IconNameBase, focused: boolean): IconName => {
  if (!focused) return iconName
  return iconName.replace('-outline', '') as IconName
}

const TabBarIcon = ({
  iconName,
  focused,
  color,
  size,
}: TabBarIconProps & { iconName: IconNameBase }) => (
  <Icon
    name={getIconName(iconName, focused)}
    color={color}
    size={focused ? size : size - 4}
  />
)

export const BottomTabs = () => {
  const theme = useTheme()

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
  )
}
