import { useState } from 'react'
import { IPurchaseItem } from '@/models/purchase/types'
import { useCategoryData } from '@hooks/useCategoryData'
import { usePurchaseData } from '@hooks/usePurchaseData'
import { ICategory } from '@models/category'
import { useAppNavigation } from '@navigation/hooks/useAppNavigation'
import { ROUTES } from '@navigation/routes'

export const useHomeScreen = () => {
  const navigation = useAppNavigation()
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false)

  const { categories, loading: categoriesLoading } = useCategoryData()
  const { savePurchase, loading: purchaseLoading } = usePurchaseData()

  const handleCategoryPress = (category: ICategory) => {
    navigation.navigate(ROUTES.CATEGORY_DETAILS, { category })
  }

  const handleSavePurchase = async (formData: IPurchaseItem) => {
    const success = await savePurchase(formData)
    if (success) {
      setShowNewPurchaseModal(false)
    }
  }

  return {
    categories,
    loading: categoriesLoading || purchaseLoading,
    showNewPurchaseModal,
    handleCategoryPress,
    handleSavePurchase,
    openNewPurchaseModal: () => setShowNewPurchaseModal(true),
    closeNewPurchaseModal: () => setShowNewPurchaseModal(false),
  }
}
