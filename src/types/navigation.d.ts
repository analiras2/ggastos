import {Category, Month} from '~models/index';
import {FunctionComponent} from 'react';

export interface IHomeStackProps {
  monthModel: Month;
  goToCategoryDetails: (item: Category) => void;
}

export type RootStackParamList = {
  [StackRoutes.CHART]: FunctionComponent<{}>;
  [StackRoutes.HOME]: FunctionComponent<HomeStackProps>;
  [StackRoutes.SETTINGS]: FunctionComponent<{}>;
};
