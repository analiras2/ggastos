import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

export type ReconciliationDecisionErrorCode = "not_found" | "already_matched" | "no_active_match";

export class ReconciliationDecisionError extends Error {
  readonly code: ReconciliationDecisionErrorCode;

  constructor(code: ReconciliationDecisionErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export type PairOwnership = {
  plannedEntryId: string;
  transactionId: string;
};

export type MatchRow = {
  id: string;
  status: string;
};

type PlannedEntryTitleRow = { id: string; is_title_manual: boolean };
type ImportedTransactionTitleRow = { description: string };

// Both sides must belong to the user: the queries run with the service role, which skips RLS.
export async function assertPairOwnership(
  config: SupabaseRestConfig,
  userId: string,
  pair: PairOwnership,
): Promise<void> {
  const [plannedEntries, transactions] = await Promise.all([
    supabaseRest<Array<{ id: string }>>(
      config,
      `/rest/v1/planned_entries?select=id&id=eq.${pair.plannedEntryId}&user_id=eq.${userId}`,
      { method: "GET" },
    ),
    supabaseRest<Array<{ id: string }>>(
      config,
      `/rest/v1/imported_transactions?select=id&id=eq.${pair.transactionId}&user_id=eq.${userId}`,
      { method: "GET" },
    ),
  ]);

  if (plannedEntries.length === 0 || transactions.length === 0) {
    throw new ReconciliationDecisionError(
      "not_found",
      "Planned entry or imported transaction not found for this user.",
    );
  }
}

export async function findMatchForPair(
  config: SupabaseRestConfig,
  userId: string,
  pair: PairOwnership,
): Promise<MatchRow | null> {
  const params = new URLSearchParams({
    select: "id,status",
    user_id: `eq.${userId}`,
    planned_entry_id: `eq.${pair.plannedEntryId}`,
    imported_transaction_id: `eq.${pair.transactionId}`,
  });
  const rows = await supabaseRest<MatchRow[]>(
    config,
    `/rest/v1/reconciliation_matches?${params.toString()}`,
    { method: "GET" },
  );
  return rows[0] ?? null;
}

// A planned entry typed in without a name takes the description of the transaction matched to it.
export async function adoptTransactionTitle(
  config: SupabaseRestConfig,
  pair: PairOwnership,
): Promise<void> {
  const [plannedEntries, transactions] = await Promise.all([
    supabaseRest<PlannedEntryTitleRow[]>(
      config,
      `/rest/v1/planned_entries?select=id,is_title_manual&id=eq.${pair.plannedEntryId}`,
      { method: "GET" },
    ),
    supabaseRest<ImportedTransactionTitleRow[]>(
      config,
      `/rest/v1/imported_transactions?select=description&id=eq.${pair.transactionId}`,
      { method: "GET" },
    ),
  ]);

  if (plannedEntries[0] && !plannedEntries[0].is_title_manual && transactions[0]?.description) {
    await supabaseRest<void>(config, `/rest/v1/planned_entries?id=eq.${pair.plannedEntryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ title: transactions[0].description, is_title_manual: true }),
    });
  }
}
