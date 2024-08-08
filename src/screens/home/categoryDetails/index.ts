import {createElement} from 'react';
import {
  ICategoryDetailsStackProps,
  RootStackScreenProps,
} from '~types/navigation';
import CategoryDetailsView from './view';
import {IPurchase} from '~types/purchase';
import {PurchaseModel} from '~models/purchase';

const CategoryDetailsScreen = ({navigation, route}: RootStackScreenProps) => {
  const onCheck = (item: IPurchase) => PurchaseModel.payPurchase(item);

  const onEdit = () => {
    // TODO
  };

  const props: ICategoryDetailsStackProps = {
    navigation,
    route,
    onCheck,
    onEdit,
  };

  return createElement(CategoryDetailsView, props);
};

export default CategoryDetailsScreen;
