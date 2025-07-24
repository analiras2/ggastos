import { SnackbarType } from '@components/common/SnackBar/types'
import { BaseScreen } from '@components/layout'
import { Strings } from '@constants/strings'
import { useSnackbar } from '@contexts/SnackbarContext'
import { useTheme } from '@theme/hooks/useTheme'
import { Button, StyleSheet, Text } from 'react-native'

const HomeScreen = () => {
  const theme = useTheme()
  const { showSnackbar } = useSnackbar()

  const handleSuccess = () => {
    showSnackbar({
      message: 'Operação realizada com sucesso!',
      type: SnackbarType.SUCCESS,
    })
  }

  return (
    <BaseScreen scrollable safeArea>
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
