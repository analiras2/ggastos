import React from 'react'
import { FlatList } from 'react-native'
import { BaseScreen, Button, CategoryItem, MonthHeader } from '@/components'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { NewPurchase } from './components/NewPurchase'
import { styles } from './styles'
import { useHomeScreen } from './useHomeScreen'

const HomeScreen = () => {
  const { colors } = useAppTheme()
  const {
    categories,
    showNewPurchaseModal,
    handleCategoryPress,
    handleSavePurchase,
    openNewPurchaseModal,
    closeNewPurchaseModal,
  } = useHomeScreen()

  return (
    <BaseScreen paddingHorizontal={16} headerComponent={<MonthHeader />} style={styles.container}>
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={({ title }) => title}
        renderItem={({ item, index }) => (
          <CategoryItem
            key={item.id}
            data={item}
            index={index}
            onPress={() => handleCategoryPress(item)}
          />
        )}
        columnWrapperStyle={styles.columnWrapper}
      />
      <Button onPress={openNewPurchaseModal} icon="add" variant="fab" color={colors.primary} />
      {showNewPurchaseModal && (
        <NewPurchase isVisible onSave={handleSavePurchase} onClose={closeNewPurchaseModal} />
      )}
    </BaseScreen>
  )
}

export default HomeScreen
