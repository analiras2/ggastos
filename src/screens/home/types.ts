import {TMonthHeader} from '~components/headers/types/header';
import {CategoryModel} from '~models/index';
import {IPurchaseSaveItem} from '~models/types/purchase';

export type THomeProps = {
  headerData: TMonthHeader;
  categories: CategoryModel[];
  onSaveNewItem: (item: IPurchaseSaveItem) => void;
  goToCategoryDetails: (category: CategoryModel) => void;
  isNewItemModalVisible: boolean;
  onShowNewItemModal: () => void;
  onHideNewItemModal: () => void;
};
