import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { CategoryField } from '@/features/planning/category-field';
import { DateField } from '@/features/planning/date-field';
import { useAddPlanViewModel } from '@/features/planning/use-add-plan-view-model';

type AddPlanSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddPlanSheet({ visible, onClose }: AddPlanSheetProps) {
  const {
    title,
    setTitle,
    tagsInput,
    setTagsInput,
    selectedDate,
    setSelectedDate,
    amountCents,
    handleAmountChange,
    categories,
    isLoadingCategories,
    selectedCategoryId,
    setSelectedCategoryId,
    errorMessage,
    isSubmitting,
    handleSubmit,
  } = useAddPlanViewModel(onClose);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Novo planejamento</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Icon name="x" size={18} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                onChangeText={setTitle}
                placeholder="Opcional — será preenchido pela importação"
                placeholderTextColor={GgastosColors.inkFaint}
                style={styles.input}
                value={title}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Data</Text>
              <DateField value={selectedDate} onChange={setSelectedDate} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Tags</Text>
              <TextInput onChangeText={setTagsInput} placeholder="#irmã #eletronico" placeholderTextColor={GgastosColors.inkFaint} style={styles.input} value={tagsInput} autoCapitalize="none" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Valor</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={handleAmountChange}
                style={styles.input}
                value={formatCurrencyCents(amountCents)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Categoria</Text>
              <CategoryField
                categories={categories}
                isLoading={isLoadingCategories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Salvando...' : 'Confirmar'}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  closeButton: {
    padding: 6,
  },
  content: {
    padding: GgastosSpacing.space5,
    gap: GgastosSpacing.space5,
  },
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
  errorText: {
    ...GgastosType.bodySm,
    color: GgastosColors.expense,
  },
  submitButton: {
    borderRadius: GgastosRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: GgastosColors.brandPrimary,
  },
  submitButtonText: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
