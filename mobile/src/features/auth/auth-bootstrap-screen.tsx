import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';

type AuthBootstrapScreenProps = {
  errorMessage?: string | null;
};

export function AuthBootstrapScreen({ errorMessage }: AuthBootstrapScreenProps) {
  const isError = Boolean(errorMessage);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.card}>
        {isError ? null : <ActivityIndicator color={GgastosColors.brandPrimary} size="large" />}
        <Text style={styles.title}>{isError ? 'Configuração pendente' : 'Abrindo GGastos'}</Text>
        <Text style={styles.message}>
          {errorMessage ?? 'Restaurando o acesso seguro da sua conta...'}
        </Text>
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
});
