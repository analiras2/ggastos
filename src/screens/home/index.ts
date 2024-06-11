import {createElement} from 'react';
import HomeView from './view';
import {Category, Month} from '@models/index';
import {HomeStackProps} from '@types/navigation';
import {useDateContext} from '@contexts/dateContext';

const HomeScreen = () => {
  const {currentMonth, currentYear} = useDateContext();

  const dateId = `${currentMonth}_${currentYear}`;

  const goToCategoryDetails = (item: Category) => {
    console.log('goToDetails', item);
  };

  const props: HomeStackProps = {
    monthModel: new Month(dateId),
    goToCategoryDetails,
  };

  return createElement(HomeView, props);
};

export default HomeScreen;
