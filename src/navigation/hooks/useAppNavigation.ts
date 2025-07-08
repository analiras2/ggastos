import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootBottomTabParamList } from '@navigation/types';

export const useAppNavigation = () => {
  return useNavigation<BottomTabNavigationProp<RootBottomTabParamList>>();
};
