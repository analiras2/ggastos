import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";
import { findBestMatch } from "./best-match.ts";
import {
  fetchCandidatePlannedEntries,
  fetchCandidateTransactions,
  fetchCategoryNames,
  fetchMatches,
} from "./queries.ts";
import { pairKey, type PlannedEntryRow, type TransactionRow } from "./rows.ts";
import { AUTO_MATCH_THRESHOLD, type MatchScore } from "./score.ts";

export type AutoMatchOutcome = {
  transactionId: string;
  plannedEntryId: string;
  score: number;
};

async function insertAutoMatch(
  config: SupabaseRestConfig,
  userId: string,
  transaction: TransactionRow,
  plannedEntry: PlannedEntryRow,
  score: MatchScore,
): Promise<boolean> {
  try {
    await supabaseRest<void>(config, "/rest/v1/reconciliation_matches", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: userId,
        planned_entry_id: plannedEntry.id,
        imported_transaction_id: transaction.id,
        status: "AUTO_MATCHED",
        matched_by: "SYSTEM",
        match_score: score.score,
        amount_delta_cents: score.amountDeltaCents,
        date_delta_days: Math.round(score.dateDeltaDays),
        rationale: score.rationale,
      }),
    });
    return true;
  } catch {
    // A concurrent sync/decision could have claimed either side first; the
    // unique-active-match constraints reject the insert. Skip, don't crash the batch.
    return false;
  }
}

/**
 * Scores every unmatched transaction on an account against unmatched planned
 * entries in the same month, and auto-conciliates pairs at or above the
 * conservative threshold. Rejected pairs are never re-suggested.
 */
export async function runAutoMatch(
  config: SupabaseRestConfig,
  context: { userId: string; accountId: string },
): Promise<AutoMatchOutcome[]> {
  const [activeMatches, rejectedMatches] = await Promise.all([
    fetchMatches(config, context.userId, "in.(AUTO_MATCHED,MANUAL_MATCHED)"),
    fetchMatches(config, context.userId, "eq.REJECTED"),
  ]);

  const transactions = await fetchCandidateTransactions(
    config,
    { account_id: `eq.${context.accountId}` },
    activeMatches.map((match) => match.imported_transaction_id),
  );

  if (transactions.length === 0) {
    return [];
  }

  const months = [...new Set(transactions.map((transaction) => transaction.competency_month))];
  const plannedEntries = await fetchCandidatePlannedEntries(
    config,
    { user_id: `eq.${context.userId}`, month: `in.(${months.join(",")})` },
    activeMatches.map((match) => match.planned_entry_id),
  );

  if (plannedEntries.length === 0) {
    return [];
  }

  const categoryNames = await fetchCategoryNames(
    config,
    [...new Set(plannedEntries.map((entry) => entry.category_id))],
  );
  const rejectedPairs = new Set(
    rejectedMatches.map((match) => pairKey(match.imported_transaction_id, match.planned_entry_id)),
  );

  const outcomes: AutoMatchOutcome[] = [];

  for (const transaction of transactions) {
    const best = findBestMatch(transaction, plannedEntries, { rejectedPairs, categoryNames, sameMonthOnly: true });
    if (!best || best.score.score < AUTO_MATCH_THRESHOLD) {
      continue;
    }

    const created = await insertAutoMatch(config, context.userId, transaction, best.plannedEntry, best.score);
    if (!created) {
      continue;
    }

    // A planned entry is matched to one transaction only.
    plannedEntries.splice(plannedEntries.indexOf(best.plannedEntry), 1);

    outcomes.push({
      transactionId: transaction.id,
      plannedEntryId: best.plannedEntry.id,
      score: best.score.score,
    });
  }

  return outcomes;
}
