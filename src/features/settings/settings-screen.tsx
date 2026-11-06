import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { useSettingsViewModel } from '@/features/settings/use-settings-view-model';
import { Icon } from '@/shared/ui/core/icon';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { useWallet, WalletBalanceSheet } from '@/features/wallet';
import { CategoryManagementSheet } from '@/features/settings/category-management-sheet';

export function SettingsScreen() {
  const { accountLabel } = useSettingsViewModel();
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const walletQuery = useWallet();
  const wallet = { isConfigured: walletQuery.data?.isConfigured ?? false, balanceCents: walletQuery.data?.balanceCents ?? 0 };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.accountBox}>
        <Text style={styles.label}>Conta</Text>
        <Text style={styles.email}>{accountLabel}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => setIsWalletVisible(true)} style={styles.categoriesButton}>
        <View>
          <Text style={styles.categoriesTitle}>Saldo da carteira</Text>
          <Text style={styles.categoriesSubtitle}>
            {wallet.isConfigured ? `Hoje: ${formatCurrencyCents(wallet.balanceCents)}. Toque para ajustar.` : 'Informe quanto você tem hoje'}
          </Text>
        </View>
        <Icon name="chevron-right" size={20} />
      </Pressable>
      <WalletBalanceSheet
        visible={isWalletVisible}
        mode={wallet.isConfigured ? 'adjust' : 'setup'}
        currentCents={wallet.balanceCents}
        onClose={() => setIsWalletVisible(false)}
        onDone={() => setIsWalletVisible(false)}
      />
      <Pressable accessibilityRole="button" onPress={() => setIsCategoriesVisible(true)} style={styles.categoriesButton}>
        <View><Text style={styles.categoriesTitle}>Categorias</Text><Text style={styles.categoriesSubtitle}>Criar, editar e ocultar categorias pessoais</Text></View><Icon name="chevron-right" size={20} />
      </Pressable>
      <CategoryManagementSheet visible={isCategoriesVisible} onClose={() => setIsCategoriesVisible(false)} />
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
  categoriesButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: GgastosRadius.lg, borderWidth: 1, borderColor: GgastosColors.lineSofter, padding: GgastosSpacing.space4, backgroundColor: GgastosColors.bgSurfaceRaised },
  categoriesTitle: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  categoriesSubtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
