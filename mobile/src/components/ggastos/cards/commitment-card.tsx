import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type CommitmentCardProps = {
  remainingIncome: string;
  remainingExpenses: string;
  subtitle: string;
  level?: 'normal' | 'high';
};

export function CommitmentCard({
  remainingIncome,
  remainingExpenses,
  subtitle,
  level = 'normal',
}: CommitmentCardProps) {
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
      <View style={styles.summaryList}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ainda vai entrar</Text>
          <Text style={[styles.summaryValue, styles.incomeValue]}>{remainingIncome}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gastos futuros</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>{remainingExpenses}</Text>
        </View>
      </View>
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
  summaryList: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
  },
  summaryValue: {
    ...GgastosType.displaySm,
  },
  incomeValue: {
    color: GgastosColors.income,
  },
  expenseValue: {
    color: GgastosColors.expense,
  },
  subtitle: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
    maxWidth: 320,
  },
});
