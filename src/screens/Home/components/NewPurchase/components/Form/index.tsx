import React from 'react'
import { View } from 'react-native'
import { TextInput } from '@components/common'
import { Strings } from '@constants/index'
import { ICategory } from '@models/category'
import { IPurchaseItem, PaymentMethod } from '@models/purchase/type'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { DropdownForm } from '../DropdownForm'
import { createStyles } from './styles'

const paymentOptions = Object.entries(PaymentMethod).map(([key, value]) => ({
  id: key,
  title: value,
}))

interface PurchaseFormProps {
  categories: ICategory[]
  formData: IPurchaseItem
  onChange: (field: keyof IPurchaseItem, value: string | number | Date) => void
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ categories, formData, onChange }) => {
  const theme = useAppTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.formContainer}>
      <DateTimePicker
        testID="dateTimePicker"
        value={formData.date}
        mode="date"
        onChange={(event, selectedDate) => selectedDate && onChange('date', selectedDate)}
        maximumDate={new Date()}
        style={styles.datePicker}
      />

      <DropdownForm
        data={categories}
        label={Strings.selectCategory}
        value={formData.category}
        onChange={value => onChange('category', value.id)}
        placeholder={Strings.selectCategory}
      />

      <TextInput
        label={Strings.title}
        value={formData.title}
        onChangeText={value => onChange('title', value)}
      />

      <DropdownForm
        data={paymentOptions}
        label={Strings.paymentType}
        value={formData.paymentMethod}
        valueField="title"
        onChange={value => onChange('paymentMethod', value.title)}
        placeholder={Strings.paymentType}
      />

      <View style={styles.priceContainer}>
        <View
          style={[
            styles.priceInput,
            formData.paymentMethod === PaymentMethod.CREDIT && styles.withMargin,
          ]}
        >
          <TextInput
            label={Strings.value}
            value={formData.price.toString()}
            onChangeText={text => onChange('price', Number(text))}
            isCurrency
          />
        </View>

        {formData.paymentMethod === PaymentMethod.CREDIT && (
          <View style={styles.installmentsInput}>
            <TextInput
              label={Strings.installments}
              keyboardType="numeric"
              value={formData.installments.toString()}
              onChangeText={text => {
                const numValue = Number(text)
                onChange('installments', numValue === 0 ? 1 : numValue)
              }}
              onBlur={() => {
                if (!formData.installments) onChange('installments', 1)
              }}
            />
          </View>
        )}
      </View>

      <TextInput
        label={Strings.description}
        value={formData.note}
        onChangeText={value => onChange('note', value)}
        multiline
      />
    </View>
  )
}

export default PurchaseForm
