import { StyleSheet, Text, TextInput, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { CategoryField } from '@/features/categories';
import { DateField } from '@/shared/ui/forms/date-field';
import { PaidEntryFields } from '@/features/planned-entries/paid-entry-fields';
import type { useAddPlanViewModel } from '@/features/planned-entries/use-add-plan-view-model';

type PlanFormFieldsProps = { form: ReturnType<typeof useAddPlanViewModel> };

const PAID_TITLE_PLACEHOLDER = 'Opcional — usa o nome da categoria';
const PLANNED_TITLE_PLACEHOLDER = 'Opcional — será preenchido pela importação';

// Every input of the "new entry" form, in order. The sheet owns the header and submit.
export function PlanFormFields({ form }: PlanFormFieldsProps) {
  const { paidEntry } = form;

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          onChangeText={form.setTitle}
          placeholder={paidEntry.settlement === 'PAID' ? PAID_TITLE_PLACEHOLDER : PLANNED_TITLE_PLACEHOLDER}
          placeholderTextColor={GgastosColors.inkFaint}
          style={styles.input}
          value={form.title}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Data</Text>
        <DateField value={form.selectedDate} onChange={form.setSelectedDate} />
      </View>

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

      <View style={styles.field}>
        <Text style={styles.label}>Valor</Text>
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
        />
      </View>

      <PaidEntryFields state={paidEntry} />
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
