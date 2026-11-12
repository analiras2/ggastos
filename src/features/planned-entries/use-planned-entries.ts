import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { invalidateMonthData } from '@/shared/lib/query/invalidate-month-data';
import {
  cancelPlannedEntry,
  confirmPlannedEntryManually,
  createPlannedEntry,
  listPlannedEntries,
  plannedEntriesKey,
  undoManualConfirmation,
  updatePlannedEntryDetails,
  type PlannedEntryDetailsInput,
  type PlannedEntryLocation,
} from '@/features/planned-entries/planned-entries-api';
import { updatePlannedEntryColumns, type UpdatePlannedEntryInput } from '@/features/planned-entries/update-planned-entry';
import type { CreatePlannedEntryInput, PlannedEntry } from '@/features/planned-entries/contract';

export function usePlannedEntries(month: string): UseQueryResult<PlannedEntry[], Error> {
  return useQuery({
    queryKey: plannedEntriesKey(month),
    queryFn: () => listPlannedEntries(month),
  });
}

// Every mutation below changes what the month, categories and reports show.
function useMonthDataMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>
): UseMutationResult<unknown, Error, TInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => invalidateMonthData(queryClient),
  });
}

export function useCreatePlannedEntry(): UseMutationResult<PlannedEntry, Error, CreatePlannedEntryInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlannedEntry,
    onSuccess: () => invalidateMonthData(queryClient),
  });
}

export function useCancelPlannedEntry(): UseMutationResult<unknown, Error, string> {
  return useMonthDataMutation(cancelPlannedEntry);
}

export function useConfirmPlannedEntryManually(): UseMutationResult<unknown, Error, PlannedEntryLocation> {
  return useMonthDataMutation(confirmPlannedEntryManually);
}

export function useUndoManualConfirmation(): UseMutationResult<unknown, Error, PlannedEntryLocation> {
  return useMonthDataMutation(undoManualConfirmation);
}

export function useUpdatePlannedEntryDetails(): UseMutationResult<unknown, Error, PlannedEntryDetailsInput> {
  return useMonthDataMutation(updatePlannedEntryDetails);
}

// Saves every editable field of one planned entry.
export function useUpdatePlannedEntry(): UseMutationResult<unknown, Error, UpdatePlannedEntryInput> {
  return useMonthDataMutation(updatePlannedEntryColumns);
}
