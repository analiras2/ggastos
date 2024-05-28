import NavigationBar from '@components/navigationBar';
import {HomeScreen} from '@screens/index';
import {FunctionComponent} from 'react';

export type RootStackParamList = {
  [StackRoutes.CHART]: FunctionComponent<{}>;
  [StackRoutes.HOME]: FunctionComponent<{}>;
  [StackRoutes.SETTINGS]: FunctionComponent<{}>;
};

export enum StackRoutes {
  HOME = 'home',
  BOTTOM_TABS = 'bottom tabs',
  SETTINGS = 'settings',
  CHART = 'chart',
}

const Stacks = () => [
  {
    name: StackRoutes.BOTTOM_TABS,
    component: NavigationBar,
    options: {headerShown: false},
  },
  {
    name: StackRoutes.HOME,
    component: HomeScreen,
    options: {headerShown: false},
  },
];

export default Stacks;
