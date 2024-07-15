import {createElement, useState} from 'react';
import {useDateContext} from '~contexts/dateContext';
import {Category, Month} from '~models/index';
import {IHomeStackProps, RootStackScreenProps} from '~types/navigation';
import HomeView from './view';

const HomeScreen = ({navigation, route}: RootStackScreenProps) => {
  const {currentMonth, currentYear} = useDateContext();
  const [isNewItemModalVisible, setIsNewItemModalVisible] = useState(false);

  const dateId = `${currentMonth}_${currentYear}`;

  const goToCategoryDetails = (item: Category) => {
    console.log('goToDetails', item);
  };

  const props: IHomeStackProps = {
    navigation,
    route,
    isNewItemModalVisible,
    onShowNewItemModal: () => setIsNewItemModalVisible(true),
    onHideNewItemModal: () => setIsNewItemModalVisible(false),
    monthModel: new Month(dateId),
    goToCategoryDetails,
  };

  return createElement(HomeView, props);
};

export default HomeScreen;
