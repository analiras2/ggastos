import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TSimpleHeader} from '~components/headers/types/header';
import {CategoryModel} from '~models/index';
import {StackRoutes} from '~navigation/stacks';

export type RootStackParamList = {
  [StackRoutes.CHART]: undefined;
  [StackRoutes.HOME]: undefined;
  [StackRoutes.SETTINGS]: undefined;
  [StackRoutes.CATEGORY_DETAILS]: {category: CategoryModel};
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type IChartStackProps = {
  headerData: TSimpleHeader;
};

export type ICategoryDetailsStackProps =
  RootStackScreenProps<StackRoutes.CATEGORY_DETAILS>;
