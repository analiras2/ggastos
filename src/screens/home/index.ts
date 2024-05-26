import {createElement} from 'react';
import HomeView from './view';

type Props = {
  title: string;
};

const HomeScreen = ({title}: Props) => {
  const viewProps = {title};

  return createElement(HomeView, viewProps);
};

export default HomeScreen;
