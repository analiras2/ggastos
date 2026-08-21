import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';

type KpiComparisonCardProps = {
  label: string;
  value: string;
  caption?: string;
  tone?: 'neutral' | 'accent';
};

export function KpiComparisonCard({ label, value, caption, tone = 'neutral' }: KpiComparisonCardProps) {
  const color = tone === 'accent' ? GgastosColors.brandPrimary : GgastosColors.inkStrong;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: GgastosColors.bgSurface,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    padding: 16,
    gap: 6,
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.inkSoft,
  },
  value: {
    ...GgastosType.displaySm,
  },
  caption: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
});
