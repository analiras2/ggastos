import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { AnnualMonthRow } from '@/features/reports/annual-month-row';
import type { AnnualMonthRowView } from '@/features/reports/format-annual-summary';

type AnnualMonthsSectionProps = {
  months: AnnualMonthRowView[];
  isVisible: boolean;
  onToggle: () => void;
};

// Month-by-month values stay collapsed until the user asks for the macro numbers.
export function AnnualMonthsSection({ months, isVisible, onToggle }: AnnualMonthsSectionProps) {
  return (
    <View>
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.header}>
        <Text style={styles.title}>Valores por mês</Text>
        <View style={styles.action}>
          <Text style={styles.actionLabel}>{isVisible ? 'Ocultar' : 'Ver valores'}</Text>
          <Icon name={isVisible ? 'chevron-down' : 'chevron-right'} size={16} />
        </View>
      </Pressable>
      {isVisible ? (
        <>
          <Text style={styles.note}>
            Os gastos incluem faturas ainda em aberto; o saldo atual só conta o que já foi pago.
          </Text>
          {months.map((month) => (
            <AnnualMonthRow
              key={month.month}
              label={month.label}
              hasSnapshot={month.hasSnapshot}
              status={month.status}
              plannedIncome={month.plannedIncome}
              actualIncome={month.actualIncome}
              plannedExpense={month.plannedExpense}
              actualExpense={month.actualExpense}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: GgastosSpacing.space2,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    ...GgastosType.label,
    color: GgastosColors.brandPrimary,
  },
  note: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
    marginBottom: GgastosSpacing.space2,
  },
});
