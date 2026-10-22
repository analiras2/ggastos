import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/constants/ggastos-theme';

type MetricHeroCardProps = {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  status?: 'healthy' | 'tight';
};

export function MetricHeroCard({ label, value, delta, deltaLabel, status = 'healthy' }: MetricHeroCardProps) {
  const accent = status === 'tight' ? GgastosColors.expense : GgastosColors.brandPrimary;
  const accentSoft = status === 'tight' ? GgastosColors.expenseSoft : GgastosColors.brandPrimarySoft;

  return (
    <View style={[styles.card, GgastosShadow.card, { backgroundColor: accentSoft }]}>
      <Text style={[styles.eyebrow, { color: accent }]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: GgastosRadius.lg,
    padding: 16,
    gap: 10,
  },
  eyebrow: {
    ...GgastosType.labelCaps,
  },
  value: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  delta: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
  },
  deltaLabel: {
    color: GgastosColors.inkFaint,
  },
});
