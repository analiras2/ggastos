import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/constants/ggastos-theme';

type AnnualMonthRowProps = {
  label: string;
  hasSnapshot: boolean;
  status: 'OPEN' | 'CLOSED' | null;
  plannedIncome: string;
  actualIncome: string;
  plannedExpense: string;
  actualExpense: string;
};

export function AnnualMonthRow({
  label,
  hasSnapshot,
  status,
  plannedIncome,
  actualIncome,
  plannedExpense,
  actualExpense,
}: AnnualMonthRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelColumn}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.status, status === 'CLOSED' && styles.statusClosed]}>
          {hasSnapshot ? (status === 'CLOSED' ? 'Fechado' : 'Aberto') : '—'}
        </Text>
      </View>
      <View style={styles.valuesColumn}>
        <Text style={styles.valueLine}>
          Receita {actualIncome} <Text style={styles.valueMuted}>/ {plannedIncome}</Text>
        </Text>
        <Text style={styles.valueLine}>
          Despesa {actualExpense} <Text style={styles.valueMuted}>/ {plannedExpense}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  labelColumn: {
    width: 64,
    gap: 2,
  },
  label: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: GgastosColors.inkStrong,
  },
  status: {
    ...GgastosType.micro,
    color: GgastosColors.income,
  },
  statusClosed: {
    color: GgastosColors.inkFaint,
  },
  valuesColumn: {
    flex: 1,
    gap: 2,
  },
  valueLine: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkStrong,
  },
  valueMuted: {
    color: GgastosColors.inkFaint,
  },
});
