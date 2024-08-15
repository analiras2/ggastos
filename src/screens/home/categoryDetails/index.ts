import {createElement, useState} from 'react';
import {HeaderType} from '~components/headers/types/header';
import {useMonthContext} from '~contexts/monthContext';
import {CategoryModel, PurchaseModel} from '~models/index';
import {IPurchase} from '~models/types/purchase';
import {ICategoryDetailsStackProps} from '~navigation/types';
import {TCategoryDetailsProps} from './types';
import CategoryDetailsView from './view';

const CategoryDetailsScreen = ({
  navigation,
  route,
}: ICategoryDetailsStackProps) => {
  const {updateCategories} = useMonthContext();

  const {category} = route.params as {category: CategoryModel};
  const {name, totalExpected, totalSpent, items, color} = category;

  const [extraData, setExtraData] = useState(false);

  const onCheck = async (item: IPurchase) => {
    console.log('onCheck', item.paid);
    await PurchaseModel.payPurchase(item);
    await updateCategories();
    await category.getItems();
    setExtraData(!extraData);
  };

  const onEdit = () => {
    // TODO
  };

  const props: TCategoryDetailsProps = {
    headerData: {
      type: HeaderType.DETAILS,
      title: name,
      balance: {expected: totalExpected, current: totalSpent},
      categoryColor: color,
      onBack: () => navigation.goBack(),
    },
    extraData,
    items,
    color,
    onCheck,
    onEdit,
  };

  return createElement(CategoryDetailsView, props);
};

export default CategoryDetailsScreen;
