import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type CommitmentCardProps = {
  value: string;
  subtitle: string;
  level?: 'normal' | 'high';
};

export function CommitmentCard({ value, subtitle, level = 'normal' }: CommitmentCardProps) {
  const accent = level === 'high' ? GgastosColors.warning : GgastosColors.brandPrimary;
  const bg = level === 'high' ? GgastosColors.warningSoft : GgastosColors.bgSurfaceRaised;

  return (
    <View
      style={[
        styles.card,
        GgastosShadow.card,
        { backgroundColor: bg },
        level === 'normal' && styles.borderSubtle,
      ]}
    >
      <View style={styles.eyebrowRow}>
        <Icon name="shield-check" size={14} />
        <Text style={[styles.eyebrow, { color: accent }]}>Comprometido restante</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: GgastosRadius.lg,
    paddingVertical: 20,
    paddingHorizontal: 22,
    gap: 8,
  },
  borderSubtle: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
    ...GgastosType.labelCaps,
  },
  value: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  subtitle: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
    maxWidth: 320,
  },
});
