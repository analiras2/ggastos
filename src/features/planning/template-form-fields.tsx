import { StyleSheet, Text, TextInput, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { CategoryField } from '@/features/planning/category-field';
import { DateField } from '@/features/planning/date-field';
import { SegmentedToggle } from '@/features/planning/segmented-toggle';
import type { RecurrenceFrequency } from '@/features/planning/planning-schema';
import type { TemplateMode, useAddTemplateViewModel } from '@/features/planning/use-add-template-view-model';

type TemplateFormFieldsProps = { form: ReturnType<typeof useAddTemplateViewModel> };

const MODE_OPTIONS: { value: TemplateMode; label: string }[] = [
  { value: 'RECURRING', label: 'Recorrente' },
  { value: 'INSTALLMENT', label: 'Parcelado' },
];

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
];

// Every input of the "new template" form, in order. The sheet owns the header and submit.
export function TemplateFormFields({ form }: TemplateFormFieldsProps) {
  const { mode } = form;

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Tipo</Text>
        <SegmentedToggle options={MODE_OPTIONS} value={mode} onChange={form.setMode} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          onChangeText={form.setTitle}
          placeholder="Ex: Conta de Luz, Compra Eletrônico..."
          placeholderTextColor={GgastosColors.inkFaint}
          style={styles.input}
          value={form.title}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Início</Text>
        <DateField value={form.startDate} onChange={form.setStartDate} />
      </View>

      {mode === 'RECURRING' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Frequência</Text>
          <SegmentedToggle
            options={FREQUENCY_OPTIONS}
            value={form.recurrenceFrequency}
            onChange={form.setRecurrenceFrequency}
          />
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>{mode === 'INSTALLMENT' ? 'Valor total' : 'Valor'}</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={form.handleAmountChange}
          style={styles.input}
          value={formatCurrencyCents(form.amountCents)}
        />
      </View>

      {mode === 'INSTALLMENT' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Número de parcelas</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={form.handleInstallmentCountChange}
            placeholder="Ex: 6"
            placeholderTextColor={GgastosColors.inkFaint}
            style={styles.input}
            value={form.installmentCountInput}
          />
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <CategoryField
          categories={form.categories}
          isLoading={form.isLoadingCategories}
          selectedCategoryId={form.selectedCategoryId}
          onSelect={form.setSelectedCategoryId}
        />
      </View>
    </>
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
  input: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
    backgroundColor: GgastosColors.bgSurface,
  },
});
