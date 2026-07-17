import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

export type ReconciliationAction = "confirm" | "reject" | "undo";

export class ReconciliationDecisionError extends Error {
  constructor(
    public readonly code:
      | "not_found"
      | "already_matched"
      | "no_active_match",
    message: string,
  ) {
    super(message);
  }
}

type PairOwnership = {
  plannedEntryId: string;
  transactionId: string;
};

type MatchRow = {
  id: string;
  status: string;
};

async function assertPairOwnership(
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

async function findMatchForPair(
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

export async function confirmMatch(
  config: SupabaseRestConfig,
  userId: string,
  pair: PairOwnership,
): Promise<void> {
  await assertPairOwnership(config, userId, pair);

  try {
    await supabaseRest<void>(config, "/rest/v1/reconciliation_matches", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: userId,
        planned_entry_id: pair.plannedEntryId,
        imported_transaction_id: pair.transactionId,
        status: "MANUAL_MATCHED",
        matched_by: "USER",
      }),
    });
  } catch {
    throw new ReconciliationDecisionError(
      "already_matched",
      "One of the sides already has an active match.",
    );
  }
}

export async function rejectMatch(
  config: SupabaseRestConfig,
  userId: string,
  pair: PairOwnership,
): Promise<void> {
  await assertPairOwnership(config, userId, pair);

  const existing = await findMatchForPair(config, userId, pair);
  if (existing) {
    if (existing.status === "REJECTED") {
      return;
    }
    await supabaseRest<void>(
      config,
      `/rest/v1/reconciliation_matches?id=eq.${existing.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "REJECTED",
          matched_by: "USER",
          updated_at: new Date().toISOString(),
        }),
      },
    );
    return;
  }

  await supabaseRest<void>(config, "/rest/v1/reconciliation_matches", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      planned_entry_id: pair.plannedEntryId,
      imported_transaction_id: pair.transactionId,
      status: "REJECTED",
      matched_by: "USER",
    }),
  });
}

export async function undoMatch(
  config: SupabaseRestConfig,
  userId: string,
  pair: PairOwnership,
): Promise<void> {
  await assertPairOwnership(config, userId, pair);

  const existing = await findMatchForPair(config, userId, pair);
  if (!existing || (existing.status !== "AUTO_MATCHED" && existing.status !== "MANUAL_MATCHED")) {
    throw new ReconciliationDecisionError(
      "no_active_match",
      "There is no active match between this planned entry and transaction.",
    );
  }

  await supabaseRest<void>(
    config,
    `/rest/v1/reconciliation_matches?id=eq.${existing.id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        status: "UNMATCHED",
        updated_at: new Date().toISOString(),
      }),
    },
  );
}
