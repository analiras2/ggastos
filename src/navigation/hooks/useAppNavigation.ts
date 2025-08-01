import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../RootStack'

export type AppNavigationProp = NavigationProp<RootStackParamList>

export const useAppNavigation = () => {
  return useNavigation<AppNavigationProp>()
}
