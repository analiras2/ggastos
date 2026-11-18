import type { SupabaseRestConfig } from "../supabase-rest.ts";
import { findBestMatch } from "./best-match.ts";
import {
  fetchCandidatePlannedEntries,
  fetchCandidateTransactions,
  fetchCategoryNames,
  fetchMatches,
} from "./queries.ts";
import { pairKey } from "./rows.ts";
import { SUGGESTION_THRESHOLD, type MatchScore } from "./score.ts";

export type ReconciliationSuggestion = {
  transactionId: string;
  transactionDescription: string;
  transactionAmountCents: number;
  transactionPostedAt: string;
  plannedEntryId: string;
  plannedEntryTitle: string;
  plannedEntryAmountCents: number;
  score: number;
  rationale: MatchScore["rationale"];
};

/**
 * Lists the best-scoring unmatched planned entry for every unmatched
 * transaction in the month, sorted by score descending. Only pairs at or
 * above the suggestion threshold are worth showing; anything stronger would
 * already have been auto-matched during sync. Rejected pairs never resurface.
 */
export async function listReconciliationInbox(
  config: SupabaseRestConfig,
  context: { userId: string; month: string },
): Promise<ReconciliationSuggestion[]> {
  const [activeMatches, rejectedMatches] = await Promise.all([
    fetchMatches(config, context.userId, "in.(AUTO_MATCHED,MANUAL_MATCHED)"),
    fetchMatches(config, context.userId, "eq.REJECTED"),
  ]);

  const transactions = await fetchCandidateTransactions(
    config,
    { user_id: `eq.${context.userId}`, competency_month: `eq.${context.month}` },
    activeMatches.map((match) => match.imported_transaction_id),
  );

  if (transactions.length === 0) {
    return [];
  }

  const plannedEntries = await fetchCandidatePlannedEntries(
    config,
    { user_id: `eq.${context.userId}`, month: `eq.${context.month}` },
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

  const suggestions: ReconciliationSuggestion[] = [];

  for (const transaction of transactions) {
    const best = findBestMatch(transaction, plannedEntries, { rejectedPairs, categoryNames, sameMonthOnly: false });

    if (best && best.score.score >= SUGGESTION_THRESHOLD) {
      suggestions.push({
        transactionId: transaction.id,
        transactionDescription: transaction.description,
        transactionAmountCents: transaction.amount_cents,
        transactionPostedAt: transaction.posted_at,
        plannedEntryId: best.plannedEntry.id,
        plannedEntryTitle: best.plannedEntry.title,
        plannedEntryAmountCents: best.plannedEntry.amount_cents,
        score: best.score.score,
        rationale: best.score.rationale,
      });
    }
  }

  return suggestions.sort((a, b) => b.score - a.score);
}
