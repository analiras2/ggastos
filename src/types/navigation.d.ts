import {FunctionComponent} from 'react';
import {CategoryModel, MonthModel} from '~models/index';
import {IPurchase} from './purchase';

export type RootStackScreenProps = NativeStackScreenProps<RootStackParamList>;

export type IHomeStackProps = RootStackScreenProps & {
  monthModel: MonthModel;
  onSaveNewItem: () => void;
  goToCategoryDetails: (item: CategoryModel) => void;
  isNewItemModalVisible: () => boolean;
  onShowNewItemModal: boolean;
  onHideNewItemModal: boolean;
};

export type ICategoryDetailsStackProps = RootStackScreenProps & {
  onCheck: (item: IPurchase) => void;
  onEdit: (item: IPurchase) => void;
};

export type RootStackParamList = {
  [StackRoutes.CHART]: FunctionComponent<{}>;
  [StackRoutes.HOME]: FunctionComponent<HomeStackProps>;
  [StackRoutes.SETTINGS]: FunctionComponent<{}>;
  [StackRoutes.CATEGORY_DETAILS]: FunctionComponent<ICategoryDetailsStackProps>;
};
