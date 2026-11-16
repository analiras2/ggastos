import { requireSupabase } from '@/shared/lib/supabase/require-supabase';

export type UpdatePlannedEntryInput = { id: string; values: Record<string, unknown> };

// Writes the columns of one planned entry (see buildPlanEditUpdate).
export async function updatePlannedEntryColumns({ id, values }: UpdatePlannedEntryInput): Promise<void> {
  const { error } = await requireSupabase().from('planned_entries').update(values).eq('id', id);

  if (error) {
    throw error;
  }
}

export type RemovalMode = 'DELETE' | 'CANCEL';

export type RemovePlannedEntryInput = { id: string; mode: RemovalMode };

// An entry typed in by hand is deleted. One a recurrence or installment plan generated is cancelled instead,
// because deleting it would only make the plan generate it again.
export async function removePlannedEntry({ id, mode }: RemovePlannedEntryInput): Promise<void> {
  const table = requireSupabase().from('planned_entries');
  const { error } =
    mode === 'DELETE'
      ? await table.delete().eq('id', id)
      : await table.update({ status: 'CANCELLED', cancelled_at: new Date().toISOString() }).eq('id', id);

  if (error) {
    throw error;
  }
}
