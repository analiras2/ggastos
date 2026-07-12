import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDateContext } from '@/contexts/DateContext'
import { CategoryModel } from '@/models/category/CategoryModel'
import { IPurchase } from '@/models/purchase/types'
import { PurchaseService } from '@/services/PurchaseService'
import { RootStackParamList } from '@navigation/types'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'

type CategoryDetailsRouteProp = RouteProp<RootStackParamList, 'CategoryDetails'>

export const useCategoryDetails = () => {
  const navigation = useNavigation()
  const route = useRoute<CategoryDetailsRouteProp>()
  const { category: routeCategory } = route.params
  const { dateSelection } = useDateContext()
  const [categoryData, setCategoryData] = useState<CategoryModel | null>(null)

  const purchaseService = useMemo(() => {
    return new PurchaseService()
  }, [])

  const loadCategoryData = useCallback(async () => {
    try {
      const data = await CategoryModel.getCategoryWithData(
        routeCategory.id,
        dateSelection.selectedYear,
        dateSelection.selectedMonth.id
      )
      setCategoryData(data)
    } catch (err) {
      console.error(err)
    }
  }, [routeCategory.id, dateSelection])

  useEffect(() => {
    loadCategoryData()
  }, [loadCategoryData])

  const handleBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleTogglePaid = useCallback(
    async (purchase: IPurchase) => {
      try {
        await purchaseService.updatePurchase(
          purchase.id,
          dateSelection.selectedYear,
          dateSelection.selectedMonth.id,
          { paid: !purchase.paid }
        )

        loadCategoryData()
      } catch (err) {
        console.error('Erro ao atualizar status:', err)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateSelection, loadCategoryData]
  )

  return {
    category: categoryData,
    handleBackPress,
    handleTogglePaid,
  }
}
