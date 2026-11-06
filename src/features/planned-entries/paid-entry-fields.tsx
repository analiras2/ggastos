import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import type { SelectablePaymentMethod } from '@/features/planned-entries/paid-entry-rules';
import { SegmentedToggle } from '@/shared/ui/forms/segmented-toggle';
import type { PaidEntryState } from '@/features/planned-entries/use-paid-entry-state';

type PaidEntryFieldsProps = {
  state: PaidEntryState;
};

const PAYMENT_METHOD_OPTIONS: { value: SelectablePaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'PIX', label: 'Pix' },
  { value: 'DEBIT_TRANSFER', label: 'Débito/transferência' },
  { value: 'OTHER', label: 'Outro' },
];

export function PaidEntryFields({ state }: PaidEntryFieldsProps) {
  const settlementOptions = [
    { value: 'PLANNED' as const, label: 'Planejado' },
    { value: 'PAID' as const, label: state.paidLabel },
  ];

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Situação</Text>
        <SegmentedToggle options={settlementOptions} value={state.settlement} onChange={state.setSettlement} />
        <Text style={styles.hint}>
          {state.settlement === 'PAID'
            ? 'O valor entra direto no realizado e no saldo atual, na data informada.'
            : 'Fica previsto até a fatura importada ou você marcar como realizado.'}
        </Text>
      </View>

      {state.settlement === 'PAID' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Forma de pagamento</Text>
          <SegmentedToggle
            options={PAYMENT_METHOD_OPTIONS}
            value={state.paymentMethod ?? ('' as SelectablePaymentMethod)}
            onChange={state.setPaymentMethod}
          />
          <Text style={styles.hint}>
            Compras no cartão de crédito entram pela fatura importada. Não lance aqui para não contar em dobro.
          </Text>
          {state.showFutureDateWarning ? (
            <Text style={styles.warning}>A data é futura. Confira se o pagamento já aconteceu.</Text>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  hint: { ...GgastosType.micro, color: GgastosColors.inkFaint },
  warning: { ...GgastosType.bodySm, color: GgastosColors.warning },
});
