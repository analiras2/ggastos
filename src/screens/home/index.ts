import {createElement, useState} from 'react';
import {useDateContext} from '~contexts/dateContext';
import {CategoryModel, ItemModel, MonthModel} from '~models/index';
import {IHomeStackProps, RootStackScreenProps} from '~types/navigation';
import HomeView from './view';
import {IPurchaseItem} from '~types/item';

const HomeScreen = ({navigation, route}: RootStackScreenProps) => {
  const {currentMonth, currentYear} = useDateContext();
  const [isNewItemModalVisible, setIsNewItemModalVisible] = useState(false);

  const dateId = `${currentMonth}_${currentYear}`;

  const goToCategoryDetails = (item: CategoryModel) => {
    console.log('goToDetails', item);
  };

  const onSaveNewItem = async (newItem: IPurchaseItem) => {
    await ItemModel.addItem(newItem);
  };

  const props: IHomeStackProps = {
    navigation,
    route,
    isNewItemModalVisible,
    onSaveNewItem,
    onShowNewItemModal: () => setIsNewItemModalVisible(true),
    onHideNewItemModal: () => setIsNewItemModalVisible(false),
    monthModel: new MonthModel(dateId),
    goToCategoryDetails,
  };

  return createElement(HomeView, props);
};

export default HomeScreen;
