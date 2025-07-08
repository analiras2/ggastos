import { useTheme as useNavTheme } from '@react-navigation/native';
import { Theme } from '../index';

export const useAppTheme = () => {
  return useNavTheme() as unknown as Theme;
};