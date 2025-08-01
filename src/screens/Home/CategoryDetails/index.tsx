import { BaseScreen } from '@components/layout'
import { RootStackParamList } from '@navigation/types'
import { RouteProp, useRoute } from '@react-navigation/native'
import { Text } from 'react-native'
import React from 'react'

type CategoryDetailsRouteProp = RouteProp<RootStackParamList, 'CategoryDetails'>

export const CategoryDetails: React.FC = () => {
  const route = useRoute<CategoryDetailsRouteProp>()
  const { categoryId, categoryName } = route.params

  return (
    <BaseScreen>
      <Text>
        Category Details: {categoryId} - {categoryName}
      </Text>
    </BaseScreen>
  )
}

export default CategoryDetails
