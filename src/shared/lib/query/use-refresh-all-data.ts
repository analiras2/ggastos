import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Marks every query as stale and refetches the ones on screen; the rest reload when opened.
export function useRefreshAllData(): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.invalidateQueries(), [queryClient]);
}
