import { Button } from '@components/ui'
import { Strings } from '@constants/index'
import { IPurchaseItem } from '@models/purchase/type'
import { colors } from '@theme/constants/colors'
import React from 'react'
import { PurchaseForm } from './components/Form'
import { FormModal } from './components/FormModal'
import { usePurchaseForm } from './usePurchaseForm'

interface NewPurchaseProps {
  isVisible: boolean
  onSave: (formData: IPurchaseItem) => void
  onClose: () => void
}

export const NewPurchase: React.FC<NewPurchaseProps> = ({
  isVisible,
  onSave,
  onClose,
}) => {
  const {
    formData,
    categories,
    isFormValid,
    handleChange,
    handleSubmit,
    resetForm,
  } = usePurchaseForm((data) => {
    onSave(data)
    onClose()
    resetForm()
  })

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <FormModal
      isVisible={isVisible}
      onClose={handleClose}
      title={Strings.newItem}
      footer={
        <>
          <Button onPress={handleClose} variant="text" text={Strings.cancel} />
          <Button
            onPress={handleSubmit}
            variant="contained"
            disabled={!isFormValid}
            text={Strings.save}
            textColor={isFormValid ? colors.textLight : colors.label}
          />
        </>
      }
    >
      <PurchaseForm
        categories={categories}
        formData={formData}
        onChange={handleChange}
      />
    </FormModal>
  )
}
