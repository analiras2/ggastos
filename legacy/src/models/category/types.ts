import { IPurchase } from '../purchase/types'

export interface ICategory {
  id: string
  title: string
  color: string
}

export interface IBalance {
  totalSpent: number
  totalExpected: number
}

export interface ICategoryData extends ICategory, IBalance {
  items: IPurchase[]
}
