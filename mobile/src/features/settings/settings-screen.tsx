import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { useSettingsViewModel } from '@/features/settings/use-settings-view-model';

export function SettingsScreen() {
  const { accountLabel } = useSettingsViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Ajustes</Text>

      <View style={styles.accountBox}>
        <Text style={styles.label}>Conta</Text>
        <Text style={styles.email}>{accountLabel}</Text>
      </View>
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
});
