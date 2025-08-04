import { TCategory } from '@models/category'

export type RootStackParamList = {
  MainTabs: undefined
  CategoryDetails: {
    category: TCategory
  }
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
