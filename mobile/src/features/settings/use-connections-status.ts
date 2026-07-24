import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

export type ConnectionStatusValue =
  | 'UPDATING'
  | 'UPDATED'
  | 'LOGIN_ERROR'
  | 'OUTDATED'
  | 'WAITING_USER_INPUT'
  | 'DELETED';

export type ConnectionStatusRecord = {
  id: string;
  institutionName: string;
  status: ConnectionStatusValue;
  lastSyncedAt: string | null;
  lastErrorCode: string | null;
};

const connectionsStatusKey = ['financial-connections', 'status'];

async function readConnectionsStatus(): Promise<ConnectionStatusRecord[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('financial_connections')
    .select('id,institution_name,status,last_synced_at,last_error_code')
    .order('institution_name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    institutionName: row.institution_name,
    status: row.status,
    lastSyncedAt: row.last_synced_at,
    lastErrorCode: row.last_error_code,
  }));
}

export function useConnectionsStatus(): UseQueryResult<ConnectionStatusRecord[], Error> {
  return useQuery({
    queryKey: connectionsStatusKey,
    queryFn: readConnectionsStatus,
  });
}
