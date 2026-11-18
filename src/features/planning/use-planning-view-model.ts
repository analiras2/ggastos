import { Alert } from 'react-native';
import { useCallback, useMemo, useState } from 'react';

import { currentMonthKey, monthLabel, shiftMonthKey } from '@/shared/lib/month';
import {
  useCancelPlannedEntry,
  useConfirmPlannedEntryManually,
  usePlannedEntries,
  useUndoManualConfirmation,
} from '@/features/planned-entries';
import { useArchivePlanningTemplate, usePlanningTemplates } from '@/features/templates';
import { useCategoryNames } from '@/features/categories';
import type { PlanningTemplate } from '@/features/templates';
import { mapPlanningEntry, type PlanningEntryView } from '@/features/planning/map-planning-entry';

export function usePlanningViewModel() {
  const [month, setMonth] = useState(currentMonthKey);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanningTemplate | null>(null);
  const [updatingEntryId, setUpdatingEntryId] = useState<string | null>(null);
  const entriesQuery = usePlannedEntries(month);
  const categoryNamesQuery = useCategoryNames();
  const templatesQuery = usePlanningTemplates(month);
  const cancelEntry = useCancelPlannedEntry();
  const confirmEntry = useConfirmPlannedEntryManually();
  const undoConfirmation = useUndoManualConfirmation();
  const archiveTemplate = useArchivePlanningTemplate();

  const entries = useMemo(
    () => (entriesQuery.data ?? []).map((entry) => mapPlanningEntry(entry, categoryNamesQuery.data ?? [])),
    [categoryNamesQuery.data, entriesQuery.data]
  );

  const handleToggleEntryStatus = useCallback((entry: PlanningEntryView) => {
    const sourceEntry = entriesQuery.data?.find((item) => item.id === entry.id);
    if (!sourceEntry) return;

    setUpdatingEntryId(entry.id);
    const mutation = entry.status === 'REALIZADO' ? undoConfirmation : confirmEntry;
    mutation.mutate(
      { id: entry.id, month, categoryId: sourceEntry.categoryId },
      { onSettled: () => setUpdatingEntryId(null) }
    );
  }, [confirmEntry, entriesQuery.data, month, undoConfirmation]);

  const handleCancelEntry = useCallback((entry: PlanningEntryView) => {
    Alert.alert('Cancelar planejamento?', `${entry.title} deixará de contar no mês.`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar planejamento',
        style: 'destructive',
        onPress: () => {
          setUpdatingEntryId(entry.id);
          cancelEntry.mutate(entry.id, { onSettled: () => setUpdatingEntryId(null) });
        },
      },
    ]);
  }, [cancelEntry]);

  const handleArchiveTemplate = useCallback((id: string, title: string) => {
    Alert.alert('Arquivar template?', `${title} não gerará novos planejamentos.`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Arquivar', style: 'destructive', onPress: () => archiveTemplate.mutate({ id, archiveFromMonth: month }) },
    ]);
  }, [archiveTemplate, month]);

  return {
    monthLabel: monthLabel(month),
    month,
    isCurrentMonth: month === currentMonthKey(),
    entries,
    templates: templatesQuery.data ?? [],
    isLoading: entriesQuery.isLoading || categoryNamesQuery.isLoading,
    isError: entriesQuery.isError || categoryNamesQuery.isError,
    isAddPlanVisible,
    selectedTemplate,
    updatingEntryId,
    archivingTemplateId: archiveTemplate.isPending ? archiveTemplate.variables.id : null,
    handlePreviousMonth: () => setMonth((value) => shiftMonthKey(value, -1)),
    handleNextMonth: () => setMonth((value) => shiftMonthKey(value, 1)),
    handleCurrentMonth: () => setMonth(currentMonthKey()),
    handleSelectMonth: setMonth,
    handleOpenAddPlan: () => setIsAddPlanVisible(true),
    handleCloseAddPlan: () => setIsAddPlanVisible(false),
    handleOpenEditTemplate: (template: PlanningTemplate) => setSelectedTemplate(template),
    handleCloseEditTemplate: () => setSelectedTemplate(null),
    handleToggleEntryStatus,
    handleCancelEntry,
    handleArchiveTemplate,
  };
}
