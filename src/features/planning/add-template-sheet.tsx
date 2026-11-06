import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { CategoryField } from '@/features/planning/category-field';
import { DateField } from '@/features/planning/date-field';
import { SegmentedToggle } from '@/features/planning/segmented-toggle';
import { useAddTemplateViewModel } from '@/features/planning/use-add-template-view-model';

type AddTemplateSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddTemplateSheet({ visible, onClose }: AddTemplateSheetProps) {
  const {
    mode,
    setMode,
    title,
    setTitle,
    startDate,
    setStartDate,
    amountCents,
    handleAmountChange,
    recurrenceFrequency,
    setRecurrenceFrequency,
    installmentCountInput,
    handleInstallmentCountChange,
    categories,
    isLoadingCategories,
    selectedCategoryId,
    setSelectedCategoryId,
    errorMessage,
    isSubmitting,
    handleSubmit,
  } = useAddTemplateViewModel(onClose);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Novo template</Text>
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
              <Text style={styles.label}>Tipo</Text>
              <SegmentedToggle
                options={[
                  { value: 'RECURRING', label: 'Recorrente' },
                  { value: 'INSTALLMENT', label: 'Parcelado' },
                ]}
                value={mode}
                onChange={setMode}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                onChangeText={setTitle}
                placeholder="Ex: Conta de Luz, Compra Eletrônico..."
                placeholderTextColor={GgastosColors.inkFaint}
                style={styles.input}
                value={title}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Início</Text>
              <DateField value={startDate} onChange={setStartDate} />
            </View>

            {mode === 'RECURRING' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Frequência</Text>
                <SegmentedToggle
                  options={[
                    { value: 'MONTHLY', label: 'Mensal' },
                    { value: 'YEARLY', label: 'Anual' },
                  ]}
                  value={recurrenceFrequency}
                  onChange={setRecurrenceFrequency}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>{mode === 'INSTALLMENT' ? 'Valor total' : 'Valor'}</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={handleAmountChange}
                style={styles.input}
                value={formatCurrencyCents(amountCents)}
              />
            </View>

            {mode === 'INSTALLMENT' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Número de parcelas</Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={handleInstallmentCountChange}
                  placeholder="Ex: 6"
                  placeholderTextColor={GgastosColors.inkFaint}
                  style={styles.input}
                  value={installmentCountInput}
                />
              </View>
            ) : null}

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
                {isSubmitting ? 'Salvando...' : 'Criar template'}
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
