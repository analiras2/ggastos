import {FunctionComponent} from 'react';
import {CategoryModel, MonthModel} from '~models/index';

export type RootStackScreenProps = NativeStackScreenProps<RootStackParamList>;

export type IHomeStackProps = RootStackScreenProps & {
  monthModel: MonthModel;
  onSaveNewItem: () => void;
  goToCategoryDetails: (item: CategoryModel) => void;
  isNewItemModalVisible: () => boolean;
  onShowNewItemModal: boolean;
  onHideNewItemModal: boolean;
};

export type RootStackParamList = {
  [StackRoutes.CHART]: FunctionComponent<{}>;
  [StackRoutes.HOME]: FunctionComponent<HomeStackProps>;
  [StackRoutes.SETTINGS]: FunctionComponent<{}>;
  [StackRoutes.CATEGORY_DETAILS]: FunctionComponent<ICategoryDetailsStackProps>;
};
