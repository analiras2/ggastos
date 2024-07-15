import NavigationBar from '~components/navigationBar';

export enum StackRoutes {
  HOME = 'home',
  BOTTOM_TABS = 'bottom_tabs',
  SETTINGS = 'settings',
  CHART = 'chart',
}

const Stacks = () => [
  {
    name: StackRoutes.BOTTOM_TABS,
    component: NavigationBar,
    options: {headerShown: false},
  },
];

export default Stacks;
