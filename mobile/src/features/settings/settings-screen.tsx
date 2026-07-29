import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { useAuth } from '@/features/auth/use-auth';
import { ConnectionsSection } from '@/features/settings/connections-section';

export function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignOut() {
    setErrorMessage(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.';
      setErrorMessage(message);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Ajustes</Text>

      <View style={styles.accountBox}>
        <Text style={styles.label}>Conta</Text>
        <Text style={styles.email}>{session?.user.email ?? session?.user.id}</Text>
      </View>

      <ConnectionsSection />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSigningOut}
        onPress={handleSignOut}
        style={[styles.signOutButton, isSigningOut && styles.buttonDisabled]}
      >
        <Text style={styles.signOutButtonText}>
          {isSigningOut ? 'Saindo...' : 'Sair'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
    padding: GgastosSpacing.space6,
    gap: GgastosSpacing.space6,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  accountBox: {
    borderRadius: GgastosRadius.lg,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    padding: GgastosSpacing.space4,
    gap: GgastosSpacing.space1,
  },
  label: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
  },
  email: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: GgastosColors.inkStrong,
  },
  errorText: {
    ...GgastosType.bodySm,
    color: GgastosColors.expense,
  },
  signOutButton: {
    borderRadius: GgastosRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: GgastosColors.expenseSoft,
  },
  signOutButtonText: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: GgastosColors.expense,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
