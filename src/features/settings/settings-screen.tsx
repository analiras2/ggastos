import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { FLOATING_NAV_CONTENT_CLEARANCE } from '@/shared/ui/navigation/floating-nav-metrics';
import { ChartViewToggle } from '@/shared/ui/forms/chart-view-toggle';
import { WalletBalanceSheet } from '@/features/wallet';
import { EditNameSheet } from '@/features/settings/edit-name-sheet';
import { CategoryManagementSheet } from '@/features/settings/category-management-sheet';
import { ProfileWalletCard } from '@/features/settings/profile-wallet-card';
import { SettingsGroup, SettingsRow } from '@/features/settings/settings-group';
import { useSettingsViewModel } from '@/features/settings/use-settings-view-model';

export function SettingsScreen() {
  const viewModel = useSettingsViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>

        <ProfileWalletCard
          isConfigured={viewModel.isWalletConfigured}
          balanceCents={viewModel.balanceCents}
          onPress={viewModel.openWallet}
        />

        <SettingsGroup title="Conta">
          <SettingsRow icon="user" title="Nome" subtitle={viewModel.name} onPress={viewModel.openEditName} />
          <View style={styles.divider} />
          <SettingsRow icon="mail" title="E-mail" subtitle={viewModel.email} />
        </SettingsGroup>

        <SettingsGroup title="Preferências">
          <SettingsRow
            icon="tags"
            title="Categorias"
            subtitle="Criar, editar e ocultar categorias pessoais"
            onPress={viewModel.openCategories}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="chart-pie"
            title="Gráfico padrão"
            subtitle="Como as estatísticas abrem"
            trailing={<ChartViewToggle value={viewModel.chartPreference} onChange={viewModel.setChartPreference} />}
          />
        </SettingsGroup>

        <Pressable
          accessibilityRole="button"
          disabled={viewModel.isSigningOut}
          onPress={viewModel.handleSignOut}
          style={styles.signOut}
        >
          <Icon name="log-out" size={20} color={GgastosColors.expense} />
          <Text style={styles.signOutLabel}>{viewModel.isSigningOut ? 'Saindo...' : 'Sair'}</Text>
        </Pressable>
        {viewModel.signOutError ? <Text style={styles.error}>{viewModel.signOutError}</Text> : null}
      </ScrollView>

      <WalletBalanceSheet
        visible={viewModel.isWalletVisible}
        mode={viewModel.isWalletConfigured ? 'adjust' : 'setup'}
        currentCents={viewModel.balanceCents}
        onClose={viewModel.closeWallet}
        onDone={viewModel.closeWallet}
      />
      <EditNameSheet visible={viewModel.isEditNameVisible} currentName={viewModel.name} onClose={viewModel.closeEditName} />
      <CategoryManagementSheet visible={viewModel.isCategoriesVisible} onClose={viewModel.closeCategories} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  content: {
    padding: GgastosSpacing.space5,
    paddingBottom: FLOATING_NAV_CONTENT_CLEARANCE,
    gap: GgastosSpacing.space5,
  },
  title: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
  divider: { height: 1, backgroundColor: GgastosColors.lineSofter },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GgastosSpacing.space2,
    minHeight: 52,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
  },
  signOutLabel: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.expense },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense, textAlign: 'center' },
});
