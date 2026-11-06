import { StyleSheet, Text, View } from 'react-native';

import { PlannedEntryRow } from '@/components/ggastos/rows/planned-entry-row';
import { TransactionRow } from '@/components/ggastos/rows/transaction-row';
import { GgastosColors, GgastosType } from '@/constants/ggastos-theme';
import type { CategoryDetailsView } from '@/features/dashboard/format-category-details';

type CategoryDetailsListProps = {
  details: CategoryDetailsView;
  togglingEntryId: string | null;
  onToggleEntryStatus: (entryId: string, isUndo: boolean) => void;
};

// The planned entries and the imported transactions of one category in the month.
export function CategoryDetailsList({ details, togglingEntryId, onToggleEntryStatus }: CategoryDetailsListProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 4,
  },
  sectionTitle: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
    marginBottom: 4,
  },
});
