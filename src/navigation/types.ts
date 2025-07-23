import { ROUTES } from './routes'

export type RootBottomTabParamList = {
  [ROUTES.HOME]: undefined
  [ROUTES.CHARTS]: undefined
  [ROUTES.SETTINGS]: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootBottomTabParamList {}
  }
}
