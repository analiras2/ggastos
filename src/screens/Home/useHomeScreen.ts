import { useState } from 'react'
import { Category, ICategory } from '@models/category'
import { IPurchaseItem } from '@models/purchase/type'
import { useAppNavigation } from '@navigation/hooks/useAppNavigation'
import { ROUTES } from '@navigation/routes'

const getRandomNumber = (min = 10, max = 599): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const useHomeScreen = () => {
  const navigation = useAppNavigation()
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false)

  const categories = Category.getCategories().map(item => ({
    ...item,
    totalExpected: getRandomNumber(),
    totalSpent: getRandomNumber(),
  }))

  const handleCategoryPress = (category: ICategory) => {
    navigation.navigate(ROUTES.CATEGORY_DETAILS, { category })
  }

  const handleSavePurchase = (formData: IPurchaseItem) => {
    // TODO
    console.log('Salvando compra:', formData)
    setShowNewPurchaseModal(false)
  }

  return {
    categories,
    showNewPurchaseModal,
    handleCategoryPress,
    handleSavePurchase,
    openNewPurchaseModal: () => setShowNewPurchaseModal(true),
    closeNewPurchaseModal: () => setShowNewPurchaseModal(false),
  }
}
