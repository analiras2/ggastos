import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ggastos/core/button';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { useLoginViewModel } from '@/features/auth/use-login-view-model';

export function LoginScreen() {
  const viewModel = useLoginViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <Text style={styles.title}>GGastos</Text>
        <Text style={styles.message}>Entre com a sua conta para continuar.</Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          spellCheck={false}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={viewModel.setEmail}
          placeholder="E-mail"
          placeholderTextColor={GgastosColors.inkFaint}
          style={styles.input}
          textContentType="username"
          value={viewModel.email}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          spellCheck={false}
          onChangeText={viewModel.setPassword}
          onSubmitEditing={viewModel.handleSubmit}
          placeholder="Senha"
          placeholderTextColor={GgastosColors.inkFaint}
          secureTextEntry
          style={styles.input}
          textContentType="password"
          value={viewModel.password}
        />

        {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}

        <Button fullWidth disabled={!viewModel.canSubmit} onPress={viewModel.handleSubmit}>
          {viewModel.isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: GgastosColors.bgBase,
    padding: GgastosSpacing.space6,
  },
  card: {
    gap: GgastosSpacing.space4,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    padding: GgastosSpacing.space6,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  message: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkSoft,
  },
  input: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    backgroundColor: GgastosColors.bgSurface,
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  error: {
    ...GgastosType.bodySm,
    color: GgastosColors.expense,
  },
});
