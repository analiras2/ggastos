import { Text, TextInput, View } from 'react-native';

import { GgastosColors } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { CategoryField } from '@/features/categories';
import { DateField } from '@/shared/ui/forms/date-field';
import { SegmentedToggle } from '@/shared/ui/forms/segmented-toggle';
import type { ImpactType } from '@/shared/contracts/finance';
import { PaidEntryFields } from '@/features/planned-entries/paid-entry-fields';
import { PlanKindField, PlanRecurrenceDetails } from '@/features/planned-entries/plan-recurrence-fields';
import { planFormStyles as styles } from '@/features/planned-entries/plan-form-styles';
import type { useAddPlanViewModel } from '@/features/planned-entries/use-add-plan-view-model';

type PlanFormFieldsProps = { form: ReturnType<typeof useAddPlanViewModel> };

const IMPACT_OPTIONS: { value: ImpactType; label: string }[] = [
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'INCOME', label: 'Receita' },
  { value: 'INVESTMENT', label: 'Investimento' },
  { value: 'TRANSFER', label: 'Transferência' },
];

const PAID_TITLE_PLACEHOLDER = 'Opcional — usa o nome da categoria';
const PLANNED_TITLE_PLACEHOLDER = 'Opcional — será preenchido pela importação';
const TEMPLATE_TITLE_PLACEHOLDER = 'Ex: Conta de luz, Celular com a Ana...';

// Every input of the "new entry" form, in order. The sheet owns the header and submit.
export function PlanFormFields({ form }: PlanFormFieldsProps) {
  const { paidEntry, recurrence } = form;
  const isOneOff = recurrence.kind === 'ONE_OFF';
  const isInstallment = recurrence.kind === 'INSTALLMENT';
  const titlePlaceholder = !isOneOff
    ? TEMPLATE_TITLE_PLACEHOLDER
    : paidEntry.settlement === 'PAID'
      ? PAID_TITLE_PLACEHOLDER
      : PLANNED_TITLE_PLACEHOLDER;

  return (
    <>
      <PlanKindField recurrence={recurrence} />

      <View style={styles.field}>
        <Text style={styles.label}>Tipo</Text>
        <SegmentedToggle options={IMPACT_OPTIONS} value={form.impactType} onChange={form.setImpactType} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          onChangeText={form.setTitle}
          placeholder={titlePlaceholder}
          placeholderTextColor={GgastosColors.inkFaint}
          style={styles.input}
          value={form.title}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{isOneOff ? 'Data' : isInstallment ? 'Primeira parcela' : 'Início'}</Text>
        <DateField value={form.selectedDate} onChange={form.setSelectedDate} />
      </View>

      <PlanRecurrenceDetails recurrence={recurrence} />

      <View style={styles.field}>
        <Text style={styles.label}>{isInstallment ? 'Valor total' : 'Valor'}</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={form.handleAmountChange}
          style={styles.input}
          value={formatCurrencyCents(form.amountCents)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <CategoryField
          categories={form.categories}
          isLoading={form.isLoadingCategories}
          selectedCategoryId={form.selectedCategoryId}
          onSelect={form.setSelectedCategoryId}
          newCategoryImpactType={form.impactType}
        />
      </View>

      {isOneOff ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={form.setTagsInput}
              placeholder="#irmã #eletronico"
              placeholderTextColor={GgastosColors.inkFaint}
              style={styles.input}
              value={form.tagsInput}
            />
          </View>
          <PaidEntryFields state={paidEntry} />
        </>
      ) : null}
    </>
  );
}
