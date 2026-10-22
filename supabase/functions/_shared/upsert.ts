import { supabaseRest, type SupabaseRestConfig } from "./supabase-rest.ts";

export type ConnectionStatus =
  | "LOGIN_ERROR"
  | "UPDATING"
  | "UPDATED"
  | "OUTDATED"
  | "WAITING_USER_INPUT"
  | "DELETED";

export type FinancialConnectionUpsert = {
  user_id: string;
  source_provider: "PLUGGY" | "CARD_STATEMENT" | "LEGACY";
  source_connection_id: string;
  institution_name: string;
  status: ConnectionStatus;
  last_synced_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
};

export type FinancialAccountUpsert = {
  user_id: string;
  connection_id: string;
  source_provider: "PLUGGY" | "CARD_STATEMENT" | "LEGACY";
  source_account_id: string;
  type: "BANK" | "CREDIT";
  subtype: "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CREDIT_CARD" | "OTHER";
  name: string;
  marketing_name: string | null;
  masked_number: string | null;
  owner_name: string | null;
  currency_code: string;
  balance_cents: number | null;
  credit_limit_cents: number | null;
  due_date: string | null;
  close_date: string | null;
  provider_payload: Record<string, unknown>;
};

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
  return upsertOne(
    config,
    "financial_connections",
    "user_id,source_provider,source_connection_id",
    connection,
  );
}

export function upsertFinancialAccount(
  config: SupabaseRestConfig,
  account: FinancialAccountUpsert,
): Promise<{ id: string }> {
  return upsertOne(
    config,
    "financial_accounts",
    "user_id,source_provider,source_account_id",
    account,
  );
}
