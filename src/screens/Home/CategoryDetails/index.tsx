import { PurchaseItem } from '@components/PurchaseItem'
import { BaseScreen } from '@components/layout'
import { PaymentMethod } from '@models/purchase/type'
import { RootStackParamList } from '@navigation/types'
import { RouteProp, useRoute } from '@react-navigation/native'
import { FlatList } from 'react-native'
import React from 'react'

const MOCK = [
  {
    id: 1,
    data: 'aaa',
    title: 'Bolacha',
    date: new Date(),
    category: 'food',
    paymentMethod: PaymentMethod.CREDIT,
    paid: false,
    installmentValue: 10,
    price: 10,
    installments: 3,
    currentInstallment: 2,
    note: 'Teste',
  },
  {
    id: 2,
    data: 'aaa',
    title: 'Tênis',
    date: new Date(),
    category: 'food',
    paymentMethod: PaymentMethod.CASH,
    paid: false,
    installmentValue: 20,
    price: 20,
    installments: 1,
    currentInstallment: 1,
  },
  {
    id: 3,
    data: 'aaa',
    title: 'Bala',
    date: new Date(),
    category: 'food',
    paymentMethod: PaymentMethod.CREDIT,
    paid: true,
    installmentValue: 52.5,
    price: 52.5,
    installments: 2,
    currentInstallment: 1,
  },
  {
    id: 4,
    data: 'aaa',
    title: 'Refri',
    date: new Date(),
    category: 'food',
    paymentMethod: PaymentMethod.PIX,
    paid: false,
    installmentValue: 2.5,
    price: 2.5,
    installments: 1,
    currentInstallment: 1,
  },
  {
    id: 5,
    data: 'aaa',
    title: 'Salgado',
    date: new Date(),
    category: 'food',
    paymentMethod: PaymentMethod.DEBIT,
    paid: true,
    installmentValue: 5,
    price: 5,
    installments: 1,
    currentInstallment: 1,
  },
]

type CategoryDetailsRouteProp = RouteProp<RootStackParamList, 'CategoryDetails'>

export const CategoryDetails: React.FC = () => {
  const route = useRoute<CategoryDetailsRouteProp>()
  const { category } = route.params

  return (
    <BaseScreen paddingHorizontal={0}>
      <FlatList
        data={MOCK}
        keyExtractor={({ title }) => title}
        renderItem={({ item }) => (
          <PurchaseItem data={item} color={category.color} />
        )}
      />
    </BaseScreen>
  )
}

export default CategoryDetails
