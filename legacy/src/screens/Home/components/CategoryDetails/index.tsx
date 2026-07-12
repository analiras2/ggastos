import React from 'react'
import { FlatList, View } from 'react-native'
import { Typography } from '@components/common'
import { CategoryDetailsHeader } from '@components/headers'
import { BaseScreen } from '@components/layout'
import { PurchaseItem } from '@components/PurchaseItem'
import { styles } from './styles'
import { useCategoryDetails } from './useCategoryDetails'

export const CategoryDetails: React.FC = () => {
  const { category, handleBackPress, handleTogglePaid } = useCategoryDetails()

  const renderHeader = () => (
    <CategoryDetailsHeader
      title={category?.title ?? ''}
      balance={{
        totalSpent: category?.totalSpent ?? 0,
        totalExpected: category?.totalExpected ?? 0,
      }}
      color={category?.color ?? '#000'}
      onBackPress={handleBackPress}
    />
  )

  const renderContent = () => {
    if (!category?.items.length) {
      return (
        <View style={styles.centerContainer}>
          <Typography variant="title" style={styles.emptyText}>
            Nenhuma compra registrada nesta categoria
          </Typography>
        </View>
      )
    }

    return (
      <FlatList
        data={category.items}
        keyExtractor={({ title }) => title}
        renderItem={({ item }) => (
          <PurchaseItem
            data={item}
            color={category.color}
            onTogglePaid={() => handleTogglePaid(item)}
          />
        )}
      />
    )
  }

  return (
    <BaseScreen paddingHorizontal={0} paddingVertical={0} headerComponent={renderHeader()}>
      {renderContent()}
    </BaseScreen>
  )
}

export default CategoryDetails
