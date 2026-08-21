import { Alert } from 'react-native';
import { useCallback, useMemo, useState } from 'react';

import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { currentMonthKey, monthLabel, shiftMonthKey } from '@/features/dashboard/month-utils';
import type { CategoryName } from '@/features/planning/use-categories';
import {
  useCancelPlannedEntry,
  useConfirmPlannedEntryManually,
  usePlannedEntries,
  useUndoManualConfirmation,
} from '@/features/planning/use-planned-entries';
import { useArchivePlanningTemplate, usePlanningTemplates } from '@/features/planning/use-planning-templates';
import { useCategoryNames } from '@/features/planning/use-categories';
import type { ImpactType, PlannedEntry, PlanningTemplate } from '@/features/planning/planning-schema';

type EntryKind = 'despesa' | 'receita' | 'investimento' | 'transferencia';

type PlanningEntryView = {
  id: string;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  dueDate: string;
  status: string;
  canConfirm: boolean;
  canCancel: boolean;
};

const ENTRY_KIND: Record<ImpactType, EntryKind> = {
  EXPENSE: 'despesa',
  INCOME: 'receita',
  INVESTMENT: 'investimento',
  TRANSFER: 'transferencia',
};

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return 'Sem vencimento';
  const [year, month, day] = dueDate.split('-');
  return `${day}/${month}/${year}`;
}

function mapEntry(entry: PlannedEntry, categories: CategoryName[]): PlanningEntryView {
  const category = categories.find((item) => item.id === entry.categoryId)?.name ?? 'Sem categoria';
  const isReconciled = entry.status === 'RECONCILED';
  const isCancelled = entry.status === 'CANCELLED';

  return {
    id: entry.id,
    title: entry.title,
    category,
    amount: formatCurrencyCents(entry.amountCents),
    kind: ENTRY_KIND[entry.impactType],
    dueDate: formatDueDate(entry.dueDate),
    status: isReconciled ? 'REALIZADO' : isCancelled ? 'CANCELADO' : 'PLANEJADO',
    canConfirm: entry.status === 'PLANNED',
    canCancel: entry.status === 'PLANNED',
  };
}

export function usePlanningViewModel() {
  const [month, setMonth] = useState(currentMonthKey);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [isAddTemplateVisible, setIsAddTemplateVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanningTemplate | null>(null);
  const [updatingEntryId, setUpdatingEntryId] = useState<string | null>(null);
  const entriesQuery = usePlannedEntries(month);
  const categoryNamesQuery = useCategoryNames();
  const templatesQuery = usePlanningTemplates(month);
  const cancelEntry = useCancelPlannedEntry(month);
  const confirmEntry = useConfirmPlannedEntryManually();
  const undoConfirmation = useUndoManualConfirmation();
  const archiveTemplate = useArchivePlanningTemplate();

  const entries = useMemo(
    () => (entriesQuery.data ?? []).map((entry) => mapEntry(entry, categoryNamesQuery.data ?? [])),
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
    isAddTemplateVisible,
    selectedTemplate,
    updatingEntryId,
    archivingTemplateId: archiveTemplate.isPending ? archiveTemplate.variables.id : null,
    handlePreviousMonth: () => setMonth((value) => shiftMonthKey(value, -1)),
    handleNextMonth: () => setMonth((value) => shiftMonthKey(value, 1)),
    handleCurrentMonth: () => setMonth(currentMonthKey()),
    handleOpenAddPlan: () => setIsAddPlanVisible(true),
    handleCloseAddPlan: () => setIsAddPlanVisible(false),
    handleOpenAddTemplate: () => setIsAddTemplateVisible(true),
    handleCloseAddTemplate: () => setIsAddTemplateVisible(false),
    handleOpenEditTemplate: (template: PlanningTemplate) => setSelectedTemplate(template),
    handleCloseEditTemplate: () => setSelectedTemplate(null),
    handleToggleEntryStatus,
    handleCancelEntry,
    handleArchiveTemplate,
  };
}
