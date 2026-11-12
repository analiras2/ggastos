import { requireSupabase } from '@/shared/lib/supabase/require-supabase';

export type UpdatePlannedEntryInput = { id: string; values: Record<string, unknown> };

// Writes the columns of one planned entry (see buildPlanEditUpdate).
export async function updatePlannedEntryColumns({ id, values }: UpdatePlannedEntryInput): Promise<void> {
  const { error } = await requireSupabase().from('planned_entries').update(values).eq('id', id);

  if (error) {
    throw error;
  }
}
