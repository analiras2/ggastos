import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PlannedEntryRow } from '@/shared/ui/rows/planned-entry-row';
import { TransactionRow } from '@/shared/ui/rows/transaction-row';
import { GgastosColors, GgastosType } from '@/shared/theme/ggastos-theme';
import { EditItemSheet } from '@/features/dashboard/edit-item-sheet';
import type { EditTarget } from '@/features/dashboard/format-item-details';
import { ItemDetailsPanel } from '@/features/dashboard/item-details-panel';
import type { CategoryDetailsView } from '@/features/dashboard/format-category-details';

type CategoryDetailsListProps = {
  details: CategoryDetailsView;
  togglingEntryId: string | null;
  onToggleEntryStatus: (entryId: string, isUndo: boolean) => void;
};

// The planned entries and the imported transactions of one category in the month.
export function CategoryDetailsList({ details, togglingEntryId, onToggleEntryStatus }: CategoryDetailsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const toggleExpanded = (id: string) => setExpandedId((current) => (current === id ? null : id));

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
              tags={item.tags}
              onPress={() => toggleExpanded(item.id)}
            >
              {expandedId === item.id ? <ItemDetailsPanel lines={item.details} onEdit={() => setEditTarget(item.editTarget)} /> : null}
            </PlannedEntryRow>
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
              tags={item.tags}
              onPress={() => toggleExpanded(item.id)}
            >
              {expandedId === item.id ? <ItemDetailsPanel lines={item.details} onEdit={() => setEditTarget(item.editTarget)} /> : null}
            </TransactionRow>
          ))}
        </View>
      ) : null}

      <EditItemSheet target={editTarget} onClose={() => setEditTarget(null)} />
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
