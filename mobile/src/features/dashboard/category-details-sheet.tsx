import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';
import { EmptyStateCard } from '@/components/ggastos/cards/empty-state-card';
import { PlannedEntryRow } from '@/components/ggastos/rows/planned-entry-row';
import { TransactionRow } from '@/components/ggastos/rows/transaction-row';
import type { CategoryDetailsView } from '@/features/dashboard/format-category-details';

type CategoryDetailsSheetProps = {
  visible: boolean;
  isLoading: boolean;
  isError: boolean;
  details: CategoryDetailsView | null;
  togglingEntryId: string | null;
  onToggleEntryStatus: (entryId: string, isUndo: boolean) => void;
  onClose: () => void;
};

export function CategoryDetailsSheet({
  visible,
  isLoading,
  isError,
  details,
  togglingEntryId,
  onToggleEntryStatus,
  onClose,
}: CategoryDetailsSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{details?.name ?? 'Categoria'}</Text>
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
          {isLoading ? <Text style={styles.status}>Carregando categoria...</Text> : null}

          {isError ? (
            <Text style={styles.status}>Não foi possível carregar os itens desta categoria.</Text>
          ) : null}

          {!isLoading && !isError && details?.isEmpty ? (
            <EmptyStateCard
              icon="inbox"
              title="Nada por aqui ainda"
              description="Não há planejamentos ou transações desta categoria neste mês."
            />
          ) : null}

          {!isLoading && !isError && details && !details.isEmpty ? (
            <>
              {details.plannedItems.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Planejado</Text>
                  {details.plannedItems.map((item) => (
                    <PlannedEntryRow
                      key={item.id}
                      title={item.title}
                      category={item.category}
                      amount={item.amount}
                      kind={item.kind}
                      competence={item.competence}
                      status={item.status}
                      isConfirmable={item.isConfirmable}
                      isUndoable={item.isUndoable}
                      isTogglingStatus={togglingEntryId === item.id}
                      onToggleStatus={() => onToggleEntryStatus(item.id, item.isUndoable)}
                    />
                  ))}
                </View>
              ) : null}

              {details.transactionItems.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Realizado</Text>
                  {details.transactionItems.map((item) => (
                    <TransactionRow
                      key={item.id}
                      title={item.title}
                      category={item.category}
                      amount={item.amount}
                      kind={item.kind}
                      date={item.date}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
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
    paddingVertical: GgastosSpacing.space3,
  },
  title: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    backgroundColor: GgastosColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: GgastosSpacing.space5,
    gap: GgastosSpacing.space5,
  },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
    paddingVertical: 24,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
    marginBottom: 4,
  },
});
