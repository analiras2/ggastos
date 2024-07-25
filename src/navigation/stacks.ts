import NavigationBar from '~components/navigationBar';
import {CategoryDetailsScreen} from '~screens/index';

export enum StackRoutes {
  HOME = 'home',
  BOTTOM_TABS = 'bottom_tabs',
  SETTINGS = 'settings',
  CHART = 'chart',
  CATEGORY_DETAILS = 'category_details',
}

const Stacks = () => [
  {
    name: StackRoutes.BOTTOM_TABS,
    component: NavigationBar,
    options: {headerShown: false},
  },
  {
    name: StackRoutes.CATEGORY_DETAILS,
    component: CategoryDetailsScreen,
    options: {headerShown: false},
  },
];

export default Stacks;
