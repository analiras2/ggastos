import { ICategory } from '@models/category'

export type RootStackParamList = {
  MainTabs: undefined
  CategoryDetails: {
    category: ICategory
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
