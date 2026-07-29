import { useCallback, useState } from 'react';

import { useConnectionsStatus, type ConnectionStatusRecord } from '@/features/settings/use-connections-status';
import type { ConnectAccountMode } from '@/features/settings/use-connect-account-view-model';

type ConnectSheetState = {
  visible: boolean;
  mode: ConnectAccountMode;
  connectionId: string | null;
  institutionName: string | null;
};

const CLOSED_SHEET_STATE: ConnectSheetState = {
  visible: false,
  mode: 'create',
  connectionId: null,
  institutionName: null,
};

interface ConnectionsSectionViewModel {
  connections: ConnectionStatusRecord[];
  isLoading: boolean;
  connectSheet: ConnectSheetState;
  handleOpenConnect: () => void;
  handleOpenReconnect: (connectionId: string, institutionName: string) => void;
  handleCloseSheet: () => void;
}

export function useConnectionsSectionViewModel(): ConnectionsSectionViewModel {
  const { data: connections, isLoading } = useConnectionsStatus();
  const [connectSheet, setConnectSheet] = useState<ConnectSheetState>(CLOSED_SHEET_STATE);

  const handleOpenConnect = useCallback(() => {
    setConnectSheet({ visible: true, mode: 'create', connectionId: null, institutionName: null });
  }, []);

  const handleOpenReconnect = useCallback((connectionId: string, institutionName: string) => {
    setConnectSheet({ visible: true, mode: 'reconnect', connectionId, institutionName });
  }, []);

  const handleCloseSheet = useCallback(() => {
    setConnectSheet(CLOSED_SHEET_STATE);
  }, []);

  return {
    connections: connections ?? [],
    isLoading,
    connectSheet,
    handleOpenConnect,
    handleOpenReconnect,
    handleCloseSheet,
  };
}
