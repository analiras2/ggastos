export type RootStackParamList = {
  MainTabs: undefined
  CategoryDetails: {
    categoryId: string
    categoryName: string
  }
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
