import { MonthHeader } from '@components/headers'
import { CategoryItem } from '@components/index'
import { BaseScreen } from '@components/layout'
import { Button } from '@components/ui'
import { Category, ICategory } from '@models/category'
import { useAppNavigation } from '@navigation/hooks/useAppNavigation'
import { ROUTES } from '@navigation/routes'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { FlatList, StyleSheet } from 'react-native'

const getRandomNumber = (): number => {
  const min = 10
  const max = 599
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const HomeScreen = () => {
  const navigation = useAppNavigation()
  const { colors } = useAppTheme()

  const categories = Category.getCategories.map((item) => {
    return {
      ...item,
      totalExpected: getRandomNumber(),
      totalSpent: getRandomNumber(),
    }
  })

  const handleCategoryPress = (category: ICategory) => {
    navigation.navigate(ROUTES.CATEGORY_DETAILS, { category })
  }

  return (
    <BaseScreen
      paddingHorizontal={16}
      headerComponent={<MonthHeader />}
      style={styles.container}
    >
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={({ name }) => name}
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
      <Button
        onPress={() => {}}
        icon="add"
        variant="fab"
        color={colors.primary}
      />
    </BaseScreen>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
})
