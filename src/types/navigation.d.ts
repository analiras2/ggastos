import {Category, Month} from '~models/index';
import {FunctionComponent} from 'react';

export type RootStackScreenProps = NativeStackScreenProps<RootStackParamList>;

export type IHomeStackProps = RootStackScreenProps & {
  monthModel: Month;
  onSaveNewItem: () => void;
  goToCategoryDetails: (item: Category) => void;
  isNewItemModalVisible: () => boolean;
  onShowNewItemModal: boolean;
  onHideNewItemModal: boolean;
};

export type RootStackParamList = {
  [StackRoutes.CHART]: FunctionComponent<{}>;
  [StackRoutes.HOME]: FunctionComponent<HomeStackProps>;
  [StackRoutes.SETTINGS]: FunctionComponent<{}>;
};
