import { pairKey, toPlannedEntryForScoring, toTransactionForScoring } from "./rows.ts";
import type { PlannedEntryRow, TransactionRow } from "./rows.ts";
import { scoreMatch, type MatchScore } from "./score.ts";

export type BestMatch = { plannedEntry: PlannedEntryRow; score: MatchScore };

type BestMatchOptions = {
  // Pairs the user rejected, as `pairKey` values; they are never suggested again.
  rejectedPairs: Set<string>;
  categoryNames: Map<string, string>;
  // Only compare with planned entries of the transaction's own competency month.
  sameMonthOnly: boolean;
};

// The planned entry that fits the transaction best, or null when none can be compared.
export function findBestMatch(
  transaction: TransactionRow,
  plannedEntries: PlannedEntryRow[],
  options: BestMatchOptions,
): BestMatch | null {
  const scoredTransaction = toTransactionForScoring(transaction);
  let best: BestMatch | null = null;

  for (const plannedEntry of plannedEntries) {
    if (options.sameMonthOnly && plannedEntry.month !== transaction.competency_month) {
      continue;
    }
    if (options.rejectedPairs.has(pairKey(transaction.id, plannedEntry.id))) {
      continue;
    }

    const score = scoreMatch(scoredTransaction, toPlannedEntryForScoring(plannedEntry, options.categoryNames));
    if (!best || score.score > best.score.score) {
      best = { plannedEntry, score };
    }
  }

  return best;
}
