import { useTheme as useNavigationTheme } from '@react-navigation/native'
import type { CustomTheme } from '../types'

export const useAppTheme = () => {
  const theme = useNavigationTheme() as unknown as CustomTheme
  return theme
}
