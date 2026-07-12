import { useMemo } from 'react'
import { CategoryModel } from '@models/category'
import { usePurchaseData } from './usePurchaseData'

export const useCategoryData = () => {
  const { purchases, loading } = usePurchaseData()

  const categoriesWithData = useMemo(() => {
    const categories = CategoryModel.getCategories()

    return categories.map(category => {
      const categoryPurchases = purchases.filter(p => p.category === category.id)
      
      const totalSpent = categoryPurchases
        .filter(purchase => purchase.paid)
        .reduce((sum, p) => sum + p.price, 0)
      
      const totalExpected = categoryPurchases
        .reduce((sum, p) => sum + p.price, 0)

      return {
        ...category,
        totalSpent,
        totalExpected,
        purchasesCount: categoryPurchases.length,
        purchases: categoryPurchases,
        paidPurchases: categoryPurchases.filter(p => p.paid).length,
        pendingPurchases: categoryPurchases.filter(p => !p.paid).length,
        pendingAmount: totalExpected - totalSpent,
      }
    })
  }, [purchases])

  return {
    categories: categoriesWithData,
    loading,
    totals: useMemo(() => ({
      totalSpentAllCategories: categoriesWithData.reduce((sum, cat) => sum + cat.totalSpent, 0),
      totalExpectedAllCategories: categoriesWithData.reduce((sum, cat) => sum + cat.totalExpected, 0),
      totalPendingAllCategories: categoriesWithData.reduce((sum, cat) => sum + (cat.totalExpected - cat.totalSpent), 0),
    }), [categoriesWithData])
  }
}

type CategoryWithData = ReturnType<typeof useCategoryData>['categories'][0]

export type { CategoryWithData }
