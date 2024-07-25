import {createElement} from 'react';
import {RootStackScreenProps} from '~types/navigation';
import CategoryDetailsView from './view';

const CategoryDetailsScreen = (props: RootStackScreenProps) => {
  return createElement(CategoryDetailsView, props);
};

export default CategoryDetailsScreen;
