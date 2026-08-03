import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { currentMonthKey } from '@/features/dashboard/month-utils';
import {
  formatPlanningEntries,
  formatPlanningTemplates,
  type PlanningEntryItem,
  type PlanningTemplateItem,
} from '@/features/planning/format-planning-screen';
import { useCategories } from '@/features/planning/use-categories';
import { useCancelPlannedEntry, usePlannedEntries } from '@/features/planning/use-planned-entries';
import { usePlanningTemplates } from '@/features/planning/use-planning-templates';

interface PlanningScreenViewModel {
  entries: PlanningEntryItem[];
  templates: PlanningTemplateItem[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  cancellingEntryId: string | null;
  isAddPlanVisible: boolean;
  isAddTemplateVisible: boolean;
  handleCancelEntry: (entry: PlanningEntryItem) => void;
  handleAddPlan: () => void;
  handleCloseAddPlan: () => void;
  handleAddTemplate: () => void;
  handleCloseAddTemplate: () => void;
}

export function usePlanningScreenViewModel(): PlanningScreenViewModel {
  const month = currentMonthKey();
  const categoriesQuery = useCategories();
  const entriesQuery = usePlannedEntries(month);
  const templatesQuery = usePlanningTemplates();
  const cancelMutation = useCancelPlannedEntry(month);

  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [isAddTemplateVisible, setIsAddTemplateVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      entriesQuery.refetch();
      templatesQuery.refetch();
      categoriesQuery.refetch();
    }, [categoriesQuery, entriesQuery, templatesQuery])
  );

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const entries = useMemo(
    () => formatPlanningEntries(entriesQuery.data ?? [], categoryNames),
    [entriesQuery.data, categoryNames]
  );

  const templates = useMemo(
    () => formatPlanningTemplates(templatesQuery.data ?? [], categoryNames),
    [templatesQuery.data, categoryNames]
  );

  const handleCancelEntry = useCallback(
    (entry: PlanningEntryItem) => {
      Alert.alert(
        'Cancelar planejamento',
        `Tem certeza que quer cancelar "${entry.title}"?`,
        [
          { text: 'Voltar', style: 'cancel' },
          {
            text: 'Cancelar planejamento',
            style: 'destructive',
            onPress: () => cancelMutation.mutate(entry.id),
          },
        ]
      );
    },
    [cancelMutation]
  );

  return {
    entries,
    templates,
    isLoading: entriesQuery.isLoading || templatesQuery.isLoading || categoriesQuery.isLoading,
    isError: entriesQuery.isError || templatesQuery.isError,
    isEmpty: entries.length === 0 && templates.length === 0,
    cancellingEntryId: cancelMutation.isPending ? cancelMutation.variables ?? null : null,
    isAddPlanVisible,
    isAddTemplateVisible,
    handleCancelEntry,
    handleAddPlan: () => setIsAddPlanVisible(true),
    handleCloseAddPlan: () => setIsAddPlanVisible(false),
    handleAddTemplate: () => setIsAddTemplateVisible(true),
    handleCloseAddTemplate: () => setIsAddTemplateVisible(false),
  };
}
