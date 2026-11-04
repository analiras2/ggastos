import { StyleSheet, Text, View } from 'react-native';

import { SegmentedControl } from '@/components/ggastos/forms/segmented-control';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import type { PaymentChoice } from '@/features/statements/payment-status-labels';

type PaymentStatusFieldProps = {
  value: PaymentChoice;
  onChange: (value: string) => void;
};

const PAYMENT_OPTIONS = [
  { label: 'Automático', value: 'AUTO' },
  { label: 'Paga', value: 'PAID' },
  { label: 'Em aberto', value: 'OPEN' },
];

const PAYMENT_HINTS: Record<PaymentChoice, string> = {
  AUTO: 'Usa a situação do arquivo (Bradesco) ou o vencimento no nome do arquivo (Nubank).',
  PAID: 'As compras já saíram do saldo atual.',
  OPEN: 'As compras ficam em "Comprometido restante" até a fatura ser paga.',
};

export function PaymentStatusField({ value, onChange }: PaymentStatusFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Situação da fatura</Text>
      <SegmentedControl options={PAYMENT_OPTIONS} value={value} onChange={onChange} />
      <Text style={styles.hint}>{PAYMENT_HINTS[value]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: GgastosSpacing.space2,
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.inkSoft,
  },
  hint: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
});
