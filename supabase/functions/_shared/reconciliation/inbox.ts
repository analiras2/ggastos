import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";
import { scoreMatch, SUGGESTION_THRESHOLD, type ImpactType, type MatchScore } from "./score.ts";

type TransactionRow = {
  id: string;
  description: string;
  merchant_name: string | null;
  impact_type: ImpactType;
  amount_cents: number;
  posted_at: string;
  competency_month: string;
  account_id: string;
  internal_category_id: string | null;
};

type PlannedEntryRow = {
  id: string;
  title: string;
  impact_type: ImpactType;
  amount_cents: number;
  due_date: string | null;
  month: string;
  expected_account_id: string | null;
  category_id: string;
};

type ReconciliationMatchRow = {
  imported_transaction_id: string;
  planned_entry_id: string;
};

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

async function fetchMatches(
  config: SupabaseRestConfig,
  userId: string,
  statusFilter: string,
): Promise<ReconciliationMatchRow[]> {
  const params = new URLSearchParams({
    select: "imported_transaction_id,planned_entry_id",
    user_id: `eq.${userId}`,
    status: statusFilter,
  });
  return supabaseRest<ReconciliationMatchRow[]>(
    config,
    `/rest/v1/reconciliation_matches?${params.toString()}`,
    { method: "GET" },
  );
}

async function fetchUnmatchedTransactionsForMonth(
  config: SupabaseRestConfig,
  userId: string,
  month: string,
  excludeIds: string[],
): Promise<TransactionRow[]> {
  const params = new URLSearchParams({
    select:
      "id,description,merchant_name,impact_type,amount_cents,posted_at,competency_month,account_id,internal_category_id",
    user_id: `eq.${userId}`,
    competency_month: `eq.${month}`,
    deleted_at: "is.null",
    is_hidden_from_budget: "eq.false",
    is_internal_transfer: "eq.false",
  });
  if (excludeIds.length > 0) {
    params.set("id", `not.in.(${excludeIds.join(",")})`);
  }
  return supabaseRest<TransactionRow[]>(
    config,
    `/rest/v1/imported_transactions?${params.toString()}`,
    { method: "GET" },
  );
}

async function fetchUnmatchedPlannedEntriesForMonth(
  config: SupabaseRestConfig,
  userId: string,
  month: string,
  excludeIds: string[],
): Promise<PlannedEntryRow[]> {
  const params = new URLSearchParams({
    select: "id,title,impact_type,amount_cents,due_date,month,expected_account_id,category_id",
    user_id: `eq.${userId}`,
    month: `eq.${month}`,
    status: "in.(PLANNED,PROJECTED)",
  });
  if (excludeIds.length > 0) {
    params.set("id", `not.in.(${excludeIds.join(",")})`);
  }
  return supabaseRest<PlannedEntryRow[]>(
    config,
    `/rest/v1/planned_entries?${params.toString()}`,
    { method: "GET" },
  );
}

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

  const transactions = await fetchUnmatchedTransactionsForMonth(
    config,
    context.userId,
    context.month,
    activeMatches.map((match) => match.imported_transaction_id),
  );

  if (transactions.length === 0) {
    return [];
  }

  const plannedEntries = await fetchUnmatchedPlannedEntriesForMonth(
    config,
    context.userId,
    context.month,
    activeMatches.map((match) => match.planned_entry_id),
  );

  if (plannedEntries.length === 0) {
    return [];
  }

  const rejectedPairs = new Set(
    rejectedMatches.map((match) => `${match.imported_transaction_id}:${match.planned_entry_id}`),
  );

  const suggestions: ReconciliationSuggestion[] = [];

  for (const transaction of transactions) {
    let best: { plannedEntry: PlannedEntryRow; score: MatchScore } | null = null;

    for (const plannedEntry of plannedEntries) {
      if (rejectedPairs.has(`${transaction.id}:${plannedEntry.id}`)) {
        continue;
      }

      const score = scoreMatch(
        {
          id: transaction.id,
          description: transaction.description,
          merchantName: transaction.merchant_name,
          impactType: transaction.impact_type,
          amountCents: transaction.amount_cents,
          postedAt: transaction.posted_at,
          competencyMonth: transaction.competency_month,
          accountId: transaction.account_id,
          internalCategoryId: transaction.internal_category_id,
        },
        {
          id: plannedEntry.id,
          title: plannedEntry.title,
          impactType: plannedEntry.impact_type,
          amountCents: plannedEntry.amount_cents,
          dueDate: plannedEntry.due_date,
          month: plannedEntry.month,
          expectedAccountId: plannedEntry.expected_account_id,
          categoryId: plannedEntry.category_id,
        },
      );

      if (!best || score.score > best.score.score) {
        best = { plannedEntry, score };
      }
    }

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
