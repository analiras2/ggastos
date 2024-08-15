import {createElement, useState} from 'react';
import {useMonthContext} from '~contexts/monthContext';
import {CategoryModel, PurchaseModel} from '~models/index';
import {StackRoutes} from '~navigation/stacks';
import {RootStackScreenProps} from '~navigation/types';
import {IPurchaseSaveItem} from '~models/types/purchase';
import {parseCurrency} from '~utils/index';
import HomeView from './view';
import {HeaderType} from '~components/headers/types/header';
import {THomeProps} from './types';

const HomeScreen = ({navigation}: RootStackScreenProps<StackRoutes.HOME>) => {
  const {monthModel, updateCategories} = useMonthContext();
  const [isNewItemModalVisible, setIsNewItemModalVisible] = useState(false);

  const goToCategoryDetails = (category: CategoryModel) => {
    navigation.navigate(StackRoutes.CATEGORY_DETAILS, {category});
  };

  const onSaveNewItem = async (item: IPurchaseSaveItem) => {
    const newItem = {
      ...item,
      price: parseCurrency(item.price),
      installments: Number(item.installments),
    };

    await PurchaseModel.addPurchase(newItem);
    updateCategories();
  };

  const HomeViewProps: THomeProps = {
    headerData: {
      type: HeaderType.MONTH,
      balance: {
        expected: monthModel.totalExpected,
        current: monthModel.currentBalance,
      },
    },
    isNewItemModalVisible,
    onSaveNewItem,
    onShowNewItemModal: () => setIsNewItemModalVisible(true),
    onHideNewItemModal: () => setIsNewItemModalVisible(false),
    categories: monthModel.categories,
    goToCategoryDetails,
  };

  return createElement(HomeView, HomeViewProps);
};

export default HomeScreen;
