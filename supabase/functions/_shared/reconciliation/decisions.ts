import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";
import {
  adoptTransactionTitle,
  assertPairOwnership,
  findMatchForPair,
  ReconciliationDecisionError,
  type PairOwnership,
} from "./decision-queries.ts";

export { ReconciliationDecisionError };

export type ReconciliationAction = "confirm" | "reject" | "undo";

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
    await adoptTransactionTitle(config, pair);
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
