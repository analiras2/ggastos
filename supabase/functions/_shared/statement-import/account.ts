import type { StatementBank } from "../statements/types.ts";
import type { SupabaseRestConfig } from "../supabase-rest.ts";
import {
  upsertFinancialAccount,
  upsertFinancialConnection,
  type FinancialAccountUpsert,
  type FinancialConnectionUpsert,
} from "../upsert.ts";

function bankDisplayName(bank: StatementBank): string {
  return bank === "NUBANK" ? "Nubank" : "Bradesco";
}

// One connection and one credit-card account per bank, created on first import.
export async function ensureStatementAccount(
  config: SupabaseRestConfig,
  context: { userId: string; bank: StatementBank; now: string },
): Promise<{ connectionId: string; accountId: string }> {
  const bankLabel = bankDisplayName(context.bank);
  const connection: FinancialConnectionUpsert = {
    user_id: context.userId,
    source_provider: "CARD_STATEMENT",
    source_connection_id: context.bank,
    institution_name: `${bankLabel} Card Statement`,
    status: "UPDATED",
    last_synced_at: context.now,
    last_error_code: null,
    last_error_message: null,
  };

  const connectionRow = await upsertFinancialConnection(config, connection);
  const account: FinancialAccountUpsert = {
    user_id: context.userId,
    connection_id: connectionRow.id,
    source_provider: "CARD_STATEMENT",
    source_account_id: `${context.bank}:CREDIT_CARD`,
    type: "CREDIT",
    subtype: "CREDIT_CARD",
    name: `${bankLabel} Credit Card`,
    marketing_name: `${bankLabel} CSV Import`,
    masked_number: null,
    owner_name: null,
    currency_code: "BRL",
    balance_cents: null,
    credit_limit_cents: null,
    due_date: null,
    close_date: null,
    provider_payload: {
      source: "CARD_STATEMENT",
      bank: context.bank,
    },
  };
  const accountRow = await upsertFinancialAccount(config, account);

  return {
    connectionId: connectionRow.id,
    accountId: accountRow.id,
  };
}
