import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { invalidateMonthData } from '@/shared/lib/query/invalidate-month-data';
import {
  archivePlanningTemplate,
  createPlanningTemplate,
  listPlanningTemplates,
  planningTemplatesKey,
  updatePlanningTemplate,
  type ArchiveTemplateInput,
  type UpdateTemplateInput,
} from '@/features/templates/planning-templates-api';
import type { CreatePlanningTemplateInput, PlanningTemplate } from '@/features/templates/contract';

export type { UpdateTemplateInput } from '@/features/templates/planning-templates-api';

export function usePlanningTemplates(month?: string): UseQueryResult<PlanningTemplate[], Error> {
  return useQuery({
    queryKey: planningTemplatesKey(month),
    queryFn: () => listPlanningTemplates(month),
  });
}

// A template change reshapes the generated entries too, so refresh both sets of data.
function useTemplateMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>
): UseMutationResult<TResult, Error, TInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['planning-templates'] }),
        invalidateMonthData(queryClient),
      ]);
    },
  });
}

export function useCreatePlanningTemplate(): UseMutationResult<
  PlanningTemplate,
  Error,
  CreatePlanningTemplateInput
> {
  return useTemplateMutation(createPlanningTemplate);
}

export function useArchivePlanningTemplate(): UseMutationResult<void, Error, ArchiveTemplateInput> {
  return useTemplateMutation(archivePlanningTemplate);
}

export function useUpdatePlanningTemplate(): UseMutationResult<void, Error, UpdateTemplateInput> {
  return useTemplateMutation(updatePlanningTemplate);
}
