import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { invalidateMonthData } from '@/lib/query/invalidate-month-data';
import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { buildPaidFields } from '@/features/planning/paid-entry-rules';
import {
  createPlannedEntrySchema,
  plannedEntrySchema,
  type CreatePlannedEntryInput,
  type PlannedEntry,
} from '@/features/planning/planning-schema';

const plannedEntriesKey = (month: string) => ['planned-entries', month];

type PlannedEntryLocation = {
  id: string;
  month: string;
  categoryId: string;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }
  return supabase;
}

function mapPlannedEntryRow(row: Record<string, unknown>): PlannedEntry {
  return plannedEntrySchema.parse({
    id: row.id,
    templateId: row.template_id,
    month: row.month,
    title: row.title,
    impactType: row.impact_type,
    categoryId: row.category_id,
    expectedAccountId: row.expected_account_id,
    amountCents: row.amount_cents,
    dueDate: row.due_date,
    status: row.status,
    installmentIndex: row.installment_index,
    installmentTotal: row.installment_total,
    note: row.note,
    tags: Array.isArray(row.tags) ? row.tags : [],
    paymentMethod: row.payment_method ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
  });
}

async function listPlannedEntries(month: string): Promise<PlannedEntry[]> {
  const client = requireSupabase();

  const { data, error } = await client
    .from('planned_entries')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPlannedEntryRow);
}

async function createPlannedEntry(input: CreatePlannedEntryInput): Promise<PlannedEntry> {
  const client = requireSupabase();
  const parsedInput = createPlannedEntrySchema.parse(input);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('É preciso estar autenticado para criar um planejamento.');
  }

  const paidFields = buildPaidFields(parsedInput.settlement, parsedInput.paymentMethod ?? null, parsedInput.dueDate ?? '');

  const { data, error } = await client
    .from('planned_entries')
    .insert({
      user_id: user.id,
      month: parsedInput.month,
      title: parsedInput.title ?? null,
      is_title_manual: parsedInput.title != null,
      impact_type: parsedInput.impactType,
      category_id: parsedInput.categoryId,
      expected_account_id: parsedInput.expectedAccountId ?? null,
      amount_cents: parsedInput.amountCents,
      due_date: parsedInput.dueDate ?? null,
      note: parsedInput.note ?? null,
      tags: parsedInput.tags ?? [],
      status: paidFields.status,
      manually_confirmed_at: paidFields.manuallyConfirmedAt,
      payment_method: paidFields.paymentMethod,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapPlannedEntryRow(data);
}

async function cancelPlannedEntry(id: string): Promise<void> {
  const client = requireSupabase();

  const { error } = await client
    .from('planned_entries')
    .update({ status: 'CANCELLED', cancelled_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

async function confirmPlannedEntryManually({ id }: PlannedEntryLocation): Promise<void> {
  const client = requireSupabase();

  const { error } = await client
    .from('planned_entries')
    .update({ status: 'RECONCILED', manually_confirmed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

async function undoManualConfirmation({ id }: PlannedEntryLocation): Promise<void> {
  const client = requireSupabase();

  const { error } = await client
    .from('planned_entries')
    .update({ status: 'PLANNED', manually_confirmed_at: null, payment_method: null })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export function usePlannedEntries(month: string): UseQueryResult<PlannedEntry[], Error> {
  return useQuery({
    queryKey: plannedEntriesKey(month),
    queryFn: () => listPlannedEntries(month),
  });
}

export function useCreatePlannedEntry(): UseMutationResult<
  PlannedEntry,
  Error,
  CreatePlannedEntryInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlannedEntry,
    onSuccess: () => invalidateMonthData(queryClient),
  });
}

export function useCancelPlannedEntry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPlannedEntry,
    onSuccess: () => invalidateMonthData(queryClient),
  });
}

export function useConfirmPlannedEntryManually(): UseMutationResult<
  void,
  Error,
  PlannedEntryLocation
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmPlannedEntryManually,
    onSuccess: () => invalidateMonthData(queryClient),
  });
}

export function useUndoManualConfirmation(): UseMutationResult<
  void,
  Error,
  PlannedEntryLocation
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: undoManualConfirmation,
    onSuccess: () => invalidateMonthData(queryClient),
  });
}
