export interface CategoryData {
  id: string
  title: string
  color: string
  totalExpected: number
  totalSpent: number
}

export interface CategoryItemProps {
  data: CategoryData
  index: number
  onPress: () => void
}
