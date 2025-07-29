import { MonthHeader } from '@components/headers/MonthHeader'
import { BaseScreen } from '@components/layout'
import { Button } from '@components/ui'
import { useAppTheme } from '@theme/hooks/useAppTheme'

const HomeScreen = () => {
  const { colors } = useAppTheme()

  return (
    <BaseScreen paddingHorizontal={40} headerComponent={<MonthHeader />}>
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
