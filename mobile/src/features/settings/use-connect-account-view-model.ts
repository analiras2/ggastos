import { useCallback, useState } from 'react';
import type { Item } from 'pluggy-js';

import {
  useLinkPluggyItem,
  usePluggyConnectToken,
} from '@/features/settings/use-connect-pluggy-item';

export type ConnectAccountMode = 'create' | 'reconnect';

interface ConnectAccountViewModel {
  connectToken: string | null;
  updateItemId: string | undefined;
  isLoadingToken: boolean;
  tokenErrorMessage: string | null;
  errorMessage: string | null;
  isLinking: boolean;
  handleWidgetSuccess: (data: { item: Item }) => void;
  handleWidgetError: (error: { message: string }) => void;
  handleWidgetClose: () => void;
}

export function useConnectAccountViewModel(
  visible: boolean,
  mode: ConnectAccountMode,
  connectionId: string | null,
  onSuccess: () => void
): ConnectAccountViewModel {
  const tokenQuery = usePluggyConnectToken(
    visible,
    mode === 'reconnect' ? connectionId : undefined
  );
  const linkMutation = useLinkPluggyItem();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleWidgetSuccess = useCallback(
    (data: { item: Item }) => {
      setErrorMessage(null);
      linkMutation.mutate(data.item.id, {
        onSuccess: () => onSuccess(),
        onError: (error) => setErrorMessage(error.message),
      });
    },
    [linkMutation, onSuccess]
  );

  const handleWidgetError = useCallback((error: { message: string }) => {
    setErrorMessage(error.message || 'Não foi possível conectar a conta.');
  }, []);

  const handleWidgetClose = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  return {
    connectToken: tokenQuery.data?.connectToken ?? null,
    updateItemId: tokenQuery.data?.itemId,
    isLoadingToken: tokenQuery.isLoading,
    tokenErrorMessage: tokenQuery.isError ? tokenQuery.error.message : null,
    errorMessage,
    isLinking: linkMutation.isPending,
    handleWidgetSuccess,
    handleWidgetError,
    handleWidgetClose,
  };
}
