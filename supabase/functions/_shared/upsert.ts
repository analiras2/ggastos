import { supabaseRest, type SupabaseRestConfig } from "./supabase-rest.ts";
import type { PluggyItem } from "./pluggy-client.ts";
import type { FinancialAccountUpsert } from "./normalizers/normalize-account.ts";
import type { ImportedTransactionUpsert } from "./normalizers/normalize-transaction.ts";

export type FinancialConnectionUpsert = {
  user_id: string;
  pluggy_item_id: string;
  pluggy_connector_id: string;
  institution_name: string;
  status: PluggyItem["status"];
  last_synced_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
};

export function buildConnectionUpsert(
  item: PluggyItem,
  context: { userId: string },
): FinancialConnectionUpsert {
  const errorMessage =
    item.statusDetail?.accounts?.message ??
    item.statusDetail?.transactions?.message ??
    null;

  return {
    user_id: context.userId,
    pluggy_item_id: item.id,
    pluggy_connector_id: String(item.connector.id),
    institution_name: item.connector.name,
    status: item.status,
    last_synced_at: item.status === "UPDATED" ? item.lastUpdatedAt : null,
    last_error_code: item.status === "LOGIN_ERROR" || item.status === "OUTDATED"
      ? item.executionStatus
      : null,
    last_error_message: item.status === "LOGIN_ERROR" || item.status === "OUTDATED"
      ? errorMessage
      : null,
  };
}

async function upsertOne<TRow extends { id: string }>(
  config: SupabaseRestConfig,
  table: string,
  onConflict: string,
  payload: Record<string, unknown>,
): Promise<TRow> {
  const rows = await supabaseRest<TRow[]>(
    config,
    `/rest/v1/${table}?on_conflict=${onConflict}&select=id`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(payload),
    },
  );

  if (rows.length !== 1) {
    throw new Error(`Expected exactly one ${table} row from upsert.`);
  }

  return rows[0];
}

export function upsertFinancialConnection(
  config: SupabaseRestConfig,
  connection: FinancialConnectionUpsert,
): Promise<{ id: string }> {
  return upsertOne(config, "financial_connections", "pluggy_item_id", connection);
}

/**
 * Records a failed sync attempt directly on the connection row so
 * `last_error_code`/`last_error_message` reflect the most recent attempt
 * even when the failure happens before `upsertFinancialConnection` ever runs
 * (e.g. Pluggy auth/API errors thrown by `fetchItem` itself).
 */
export async function markConnectionSyncFailed(
  config: SupabaseRestConfig,
  connectionId: string,
  errorMessage: string,
): Promise<void> {
  await supabaseRest<void>(
    config,
    `/rest/v1/financial_connections?id=eq.${connectionId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        last_error_code: "SYNC_ERROR",
        last_error_message: errorMessage,
      }),
    },
  );
}

export function upsertFinancialAccount(
  config: SupabaseRestConfig,
  account: FinancialAccountUpsert,
): Promise<{ id: string }> {
  return upsertOne(config, "financial_accounts", "pluggy_account_id", account);
}

export async function upsertImportedTransactions(
  config: SupabaseRestConfig,
  transactions: ImportedTransactionUpsert[],
): Promise<number> {
  if (transactions.length === 0) {
    return 0;
  }

  const rows = await supabaseRest<Array<{ id: string }>>(
    config,
    `/rest/v1/imported_transactions?on_conflict=pluggy_transaction_id&select=id`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(transactions),
    },
  );

  return rows.length;
}

export async function markMissingTransactionsDeleted(
  config: SupabaseRestConfig,
  accountId: string,
  presentPluggyTransactionIds: string[],
): Promise<void> {
  const params = new URLSearchParams({
    account_id: `eq.${accountId}`,
    deleted_at: "is.null",
  });

  if (presentPluggyTransactionIds.length > 0) {
    params.set(
      "pluggy_transaction_id",
      `not.in.(${presentPluggyTransactionIds.join(",")})`,
    );
  }

  await supabaseRest<void>(
    config,
    `/rest/v1/imported_transactions?${params.toString()}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    },
  );
}
