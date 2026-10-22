import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { useSettingsViewModel } from '@/features/settings/use-settings-view-model';
import { Icon } from '@/components/ggastos/core/icon';
import { CategoryManagementSheet } from '@/features/settings/category-management-sheet';

export function SettingsScreen() {
  const { accountLabel } = useSettingsViewModel();
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Ajustes</Text>

      <View style={styles.accountBox}>
        <Text style={styles.label}>Conta</Text>
        <Text style={styles.email}>{accountLabel}</Text>
      </View>
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
