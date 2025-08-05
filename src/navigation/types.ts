import { ICategory } from '@models/category'

export type RootStackParamList = {
  MainTabs: undefined
  CategoryDetails: {
    category: ICategory
  }
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
