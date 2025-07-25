import { MonthHeader } from '@components/headers'
import { BaseScreen } from '@components/layout'
import { SnackbarType } from '@components/ui/SnackBar/types'
import { Strings } from '@constants/strings'
import { useSnackbar } from '@contexts/SnackbarContext'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Button, StyleSheet, Text } from 'react-native'

const HomeScreen = () => {
  const theme = useAppTheme()
  const { showSnackbar } = useSnackbar()

  const handleSuccess = () => {
    showSnackbar({
      message: 'Operação realizada com sucesso!',
      type: SnackbarType.SUCCESS,
    })
  }

  return (
    <BaseScreen paddingHorizontal={40} headerComponent={<MonthHeader />}>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {Strings.appName}
      </Text>
      <Button title="Testar Snackbar" onPress={handleSuccess} />
    </BaseScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
})

export default HomeScreen
