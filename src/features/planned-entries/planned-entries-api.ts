import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { buildPaidFields } from '@/features/planned-entries/paid-entry-rules';
import {
  createPlannedEntrySchema,
  plannedEntrySchema,
  type CreatePlannedEntryInput,
  type PlannedEntry,
} from '@/features/planned-entries/contract';

export const plannedEntriesKey = (month: string) => ['planned-entries', month];

export type PlannedEntryLocation = {
  id: string;
  month: string;
  categoryId: string;
};

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

export async function listPlannedEntries(month: string): Promise<PlannedEntry[]> {
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

export async function createPlannedEntry(input: CreatePlannedEntryInput): Promise<PlannedEntry> {
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

async function updatePlannedEntry(id: string, values: Record<string, unknown>): Promise<void> {
  const { error } = await requireSupabase().from('planned_entries').update(values).eq('id', id);

  if (error) {
    throw error;
  }
}

export type PlannedEntryDetailsInput = {
  id: string;
  categoryId: string;
  // Replaces the stored tags, so an empty list clears them.
  tags: string[];
};

export function updatePlannedEntryDetails({ id, categoryId, tags }: PlannedEntryDetailsInput): Promise<void> {
  return updatePlannedEntry(id, { category_id: categoryId, tags });
}

export function cancelPlannedEntry(id: string): Promise<void> {
  return updatePlannedEntry(id, { status: 'CANCELLED', cancelled_at: new Date().toISOString() });
}

export function confirmPlannedEntryManually({ id }: PlannedEntryLocation): Promise<void> {
  return updatePlannedEntry(id, { status: 'RECONCILED', manually_confirmed_at: new Date().toISOString() });
}

export function undoManualConfirmation({ id }: PlannedEntryLocation): Promise<void> {
  return updatePlannedEntry(id, { status: 'PLANNED', manually_confirmed_at: null, payment_method: null });
}
