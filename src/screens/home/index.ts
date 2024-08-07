import {createElement, useState, useEffect} from 'react';
import {useDateContext} from '~contexts/dateContext';
import {CategoryModel, PurchaseModel, MonthModel} from '~models/index';
import {IHomeStackProps, RootStackScreenProps} from '~types/navigation';
import HomeView from './view';
import {IPurchaseSaveItem} from '~types/purchase';
import {parseCurrency} from '~utils/index';
import {StackRoutes} from '~navigation/stacks';
import Loading from '~components/loading';

const HomeScreen = ({navigation, route}: RootStackScreenProps) => {
  const {currentMonth, currentYear} = useDateContext();
  const [isNewItemModalVisible, setIsNewItemModalVisible] = useState(false);

  const dateId = `${currentMonth + 1}_${currentYear}`;

  const [monthModel, setMonthModel] = useState<MonthModel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const model = new MonthModel(dateId);
      await model.getCategories();
      setMonthModel(model);
    };
    fetchData();
  }, [dateId]);

  const goToCategoryDetails = (item: CategoryModel) => {
    navigation.navigate(StackRoutes.CATEGORY_DETAILS, item);
  };

  const onSaveNewItem = async (item: IPurchaseSaveItem) => {
    const Model = new PurchaseModel();

    const newItem = {
      ...item,
      price: parseCurrency(item.price),
      installments: Number(item.installments),
    };

    await Model.addPurchase(newItem);
  };

  const props: IHomeStackProps = {
    navigation,
    route,
    isNewItemModalVisible,
    onSaveNewItem,
    onShowNewItemModal: () => setIsNewItemModalVisible(true),
    onHideNewItemModal: () => setIsNewItemModalVisible(false),
    monthModel,
    goToCategoryDetails,
  };

  return monthModel ? createElement(HomeView, props) : createElement(Loading);
};

export default HomeScreen;
