import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";
import { AUTO_MATCH_THRESHOLD, scoreMatch, type ImpactType, type MatchScore } from "./score.ts";

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

export type AutoMatchOutcome = {
  transactionId: string;
  plannedEntryId: string;
  score: number;
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

async function fetchCandidateTransactions(
  config: SupabaseRestConfig,
  accountId: string,
  excludeIds: string[],
): Promise<TransactionRow[]> {
  const params = new URLSearchParams({
    select:
      "id,description,merchant_name,impact_type,amount_cents,posted_at,competency_month,account_id,internal_category_id",
    account_id: `eq.${accountId}`,
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

async function fetchCandidatePlannedEntries(
  config: SupabaseRestConfig,
  userId: string,
  months: string[],
  excludeIds: string[],
): Promise<PlannedEntryRow[]> {
  if (months.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    select: "id,title,impact_type,amount_cents,due_date,month,expected_account_id,category_id",
    user_id: `eq.${userId}`,
    month: `in.(${months.join(",")})`,
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
    context.accountId,
    activeMatches.map((match) => match.imported_transaction_id),
  );

  if (transactions.length === 0) {
    return [];
  }

  const months = [...new Set(transactions.map((transaction) => transaction.competency_month))];
  const plannedEntries = await fetchCandidatePlannedEntries(
    config,
    context.userId,
    months,
    activeMatches.map((match) => match.planned_entry_id),
  );

  if (plannedEntries.length === 0) {
    return [];
  }

  const rejectedPairs = new Set(
    rejectedMatches.map((match) => `${match.imported_transaction_id}:${match.planned_entry_id}`),
  );

  const outcomes: AutoMatchOutcome[] = [];

  for (const transaction of transactions) {
    let best: { plannedEntry: PlannedEntryRow; score: MatchScore } | null = null;

    for (const plannedEntry of plannedEntries) {
      if (plannedEntry.month !== transaction.competency_month) {
        continue;
      }
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

    if (!best || best.score.score < AUTO_MATCH_THRESHOLD) {
      continue;
    }

    const created = await insertAutoMatch(config, context.userId, transaction, best.plannedEntry, best.score);
    if (!created) {
      continue;
    }

    const matchedIndex = plannedEntries.indexOf(best.plannedEntry);
    if (matchedIndex !== -1) {
      plannedEntries.splice(matchedIndex, 1);
    }

    outcomes.push({
      transactionId: transaction.id,
      plannedEntryId: best.plannedEntry.id,
      score: best.score.score,
    });
  }

  return outcomes;
}
