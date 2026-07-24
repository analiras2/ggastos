import type { ConnectionStatusRecord } from '@/features/settings/use-connections-status';

export type ConnectionStatusTone = 'ok' | 'actionable' | 'info' | 'pending';

export type FormattedConnectionStatus = {
  id: string;
  institutionName: string;
  message: string;
  tone: ConnectionStatusTone;
};

const SYNC_ERROR_CODE = 'SYNC_ERROR';

function formatLastSyncedAt(lastSyncedAt: string): string {
  return new Date(lastSyncedAt).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function formatConnectionStatus(
  connection: ConnectionStatusRecord
): FormattedConnectionStatus {
  const { id, institutionName, status, lastSyncedAt, lastErrorCode } = connection;

  if (status === 'LOGIN_ERROR' || status === 'WAITING_USER_INPUT') {
    return {
      id,
      institutionName,
      tone: 'actionable',
      message: 'Conexão perdeu a autorização. Reconecte para continuar sincronizando.',
    };
  }

  if (status === 'OUTDATED') {
    return {
      id,
      institutionName,
      tone: 'info',
      message: 'Sincronização desatualizada. Tentando novamente em breve.',
    };
  }

  if (status === 'UPDATING') {
    return {
      id,
      institutionName,
      tone: 'pending',
      message: 'Sincronizando...',
    };
  }

  if (lastErrorCode === SYNC_ERROR_CODE) {
    return {
      id,
      institutionName,
      tone: 'info',
      message: 'Última tentativa de sincronização falhou. Vamos tentar de novo automaticamente.',
    };
  }

  if (status === 'UPDATED' && lastSyncedAt) {
    return {
      id,
      institutionName,
      tone: 'ok',
      message: `Última sincronização: ${formatLastSyncedAt(lastSyncedAt)}`,
    };
  }

  return {
    id,
    institutionName,
    tone: 'info',
    message: 'Ainda não sincronizado.',
  };
}
