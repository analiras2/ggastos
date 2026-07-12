import { IPurchase } from '@/models/purchase/types'
import { PurchaseService } from '@/services/PurchaseService'
import { ICategory, ICategoryData } from './types'

export class CategoryModel {
  private static readonly categories: ICategory[] = [
    {
      id: 'income',
      title: 'Renda',
      color: '#60af50',
    },
    {
      id: 'investiment',
      title: 'Investimento',
      color: '#e8c140',
    },
    {
      id: 'food',
      title: 'Alimentação',
      color: '#7c4baf',
    },
    {
      id: 'expenses',
      title: 'Desp. Pessoais',
      color: '#EF5350',
    },
    {
      id: 'transport',
      title: 'Transporte',
      color: '#329ed1',
    },
    {
      id: 'recreation',
      title: 'Lazer',
      color: '#e84c78',
    },
    {
      id: 'education',
      title: 'Educação',
      color: '#f76d47',
    },
    {
      id: 'health',
      title: 'Saúde',
      color: '#22b5c9',
    },
    {
      id: 'home',
      title: 'Moradia',
      color: '#5e5dba',
    },
    {
      id: 'bussines',
      title: 'Negócios',
      color: '#69c3acff',
    },
  ]

  id: string
  title: string
  color: string
  items: IPurchase[]
  totalSpent: number
  totalExpected: number

  constructor(category: ICategory, purchases: IPurchase[] = []) {
    this.id = category.id
    this.title = category.title
    this.color = category.color
    this.items = purchases
    this.totalSpent = this.calculateTotalSpent()
    this.totalExpected = this.calculateTotalExpected()
  }

  private calculateTotalSpent(): number {
    return this.items.reduce((total, purchase) => {
      if (purchase.paid && purchase.category === this.id) {
        return total + purchase.price
      }
      return total
    }, 0)
  }

  private calculateTotalExpected(): number {
    return this.items.reduce((total, purchase) => {
      if (purchase.category === this.id) {
        return total + purchase.installmentValue
      }
      return total
    }, 0)
  }

  updatePurchases(purchases: IPurchase[]): void {
    this.items = purchases.filter(purchase => purchase.category === this.id)
    this.totalSpent = this.calculateTotalSpent()
    this.totalExpected = this.calculateTotalExpected()
  }

  static getCategories(): ICategory[] {
    return this.categories
  }

  static getCategoryById(id: string): ICategory | undefined {
    return this.categories.find(category => category.id === id)
  }

  static async getCategoryWithData(
    categoryId: string,
    year: number,
    month: number
  ): Promise<CategoryModel | null> {
    const category = this.getCategoryById(categoryId)
    if (!category) return null

    const purchaseService = new PurchaseService()
    const monthPurchases = await purchaseService.getPurchasesByMonth(year, month)
  
    const categoryPurchases = monthPurchases.filter(
    purchase => purchase.category === categoryId
  )

  return new CategoryModel(category, categoryPurchases)
  }

  static async getAllCategoriesWithData(year: number, month: number): Promise<CategoryModel[]> {
    const purchaseService = new PurchaseService()
    const purchases = await purchaseService.getPurchasesByMonth(year, month)

    return this.categories.map(category => new CategoryModel(category, purchases))
  }

  toJSON(): ICategoryData {
    return {
      id: this.id,
      title: this.title,
      color: this.color,
      items: this.items,
      totalSpent: this.totalSpent,
      totalExpected: this.totalExpected,
    }
  }
}
