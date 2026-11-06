import { Text, TextInput, View } from 'react-native';

import { GgastosColors } from '@/shared/theme/ggastos-theme';
import { SegmentedToggle } from '@/shared/ui/forms/segmented-toggle';
import type { RecurrenceFrequency } from '@/shared/contracts/finance';
import { planFormStyles as styles } from '@/features/planned-entries/plan-form-styles';
import type { PlanKind, PlanRecurrenceState } from '@/features/planned-entries/use-plan-recurrence-state';

const KIND_OPTIONS: { value: PlanKind; label: string }[] = [
  { value: 'ONE_OFF', label: 'Pontual' },
  { value: 'RECURRING', label: 'Recorrente' },
  { value: 'INSTALLMENT', label: 'Parcelada' },
];

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
];

export function PlanKindField({ recurrence }: { recurrence: PlanRecurrenceState }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Frequência da compra</Text>
      <SegmentedToggle options={KIND_OPTIONS} value={recurrence.kind} onChange={recurrence.setKind} />
    </View>
  );
}

// Extra inputs of the recurring and installment modes.
export function PlanRecurrenceDetails({ recurrence }: { recurrence: PlanRecurrenceState }) {
  if (recurrence.kind === 'RECURRING') {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>Repete</Text>
        <SegmentedToggle options={FREQUENCY_OPTIONS} value={recurrence.frequency} onChange={recurrence.setFrequency} />
      </View>
    );
  }

  if (recurrence.kind === 'INSTALLMENT') {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>Número de parcelas</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={recurrence.handleInstallmentCountChange}
          placeholder="Ex: 6"
          placeholderTextColor={GgastosColors.inkFaint}
          style={styles.input}
          value={recurrence.installmentCountInput}
        />
      </View>
    );
  }

  return null;
}
