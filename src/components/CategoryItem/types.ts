export interface CategoryData {
  id: string
  name: string
  color: string
  totalExpected: number
  totalSpent: number
}

export interface CategoryItemProps {
  data: CategoryData
  index: number
  onPress: () => void
}
