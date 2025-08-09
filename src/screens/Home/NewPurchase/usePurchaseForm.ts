import { Category } from '@models/category'
import { IPurchaseItem } from '@models/purchase/type'
import { useEffect, useState } from 'react'

const initialFormData: IPurchaseItem = {
  date: new Date(),
  installments: 1,
  price: 0,
  title: '',
  category: '',
  paymentMethod: '',
  note: '',
}

export const usePurchaseForm = (onSubmit: (data: IPurchaseItem) => void) => {
  const [isFormValid, setIsFormValid] = useState(false)
  const [formData, setFormData] = useState<IPurchaseItem>(initialFormData)

  const handleChange = (field: keyof IPurchaseItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const isValid =
      formData.title.trim() !== '' &&
      formData.category.trim() !== '' &&
      formData.price !== 0 &&
      formData.paymentMethod.trim() !== ''

    setIsFormValid(isValid)
  }, [formData])

  const resetForm = () => {
    setFormData(initialFormData)
  }

  return {
    categories: Category.getCategories(),
    formData,
    isFormValid,
    handleChange,
    handleSubmit: () => onSubmit(formData),
    resetForm,
  }
}
