import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";
import {
  PLANNED_ENTRY_COLUMNS,
  TRANSACTION_COLUMNS,
  type PlannedEntryRow,
  type ReconciliationMatchRow,
  type TransactionRow,
} from "./rows.ts";

// Filters are PostgREST query parameters, e.g. { competency_month: "eq.2026-11" }.
type Filters = Record<string, string>;

function excludeIdsFilter(excludeIds: string[]): Filters {
  return excludeIds.length > 0 ? { id: `not.in.(${excludeIds.join(",")})` } : {};
}

function get<T>(config: SupabaseRestConfig, table: string, params: Filters): Promise<T> {
  return supabaseRest<T>(config, `/rest/v1/${table}?${new URLSearchParams(params).toString()}`, {
    method: "GET",
  });
}

// Matches of the user in the given status, e.g. "in.(AUTO_MATCHED,MANUAL_MATCHED)" or "eq.REJECTED".
export function fetchMatches(
  config: SupabaseRestConfig,
  userId: string,
  statusFilter: string,
): Promise<ReconciliationMatchRow[]> {
  return get(config, "reconciliation_matches", {
    select: "imported_transaction_id,planned_entry_id",
    user_id: `eq.${userId}`,
    status: statusFilter,
  });
}

// Transactions that count toward the budget and are not already matched.
export function fetchCandidateTransactions(
  config: SupabaseRestConfig,
  filters: Filters,
  excludeIds: string[],
): Promise<TransactionRow[]> {
  return get(config, "imported_transactions", {
    select: TRANSACTION_COLUMNS,
    ...filters,
    deleted_at: "is.null",
    is_hidden_from_budget: "eq.false",
    is_internal_transfer: "eq.false",
    ...excludeIdsFilter(excludeIds),
  });
}

// Planned entries still waiting for a transaction and not already matched.
export function fetchCandidatePlannedEntries(
  config: SupabaseRestConfig,
  filters: Filters,
  excludeIds: string[],
): Promise<PlannedEntryRow[]> {
  return get(config, "planned_entries", {
    select: PLANNED_ENTRY_COLUMNS,
    ...filters,
    status: "in.(PLANNED,PROJECTED)",
    ...excludeIdsFilter(excludeIds),
  });
}

export async function fetchCategoryNames(
  config: SupabaseRestConfig,
  categoryIds: string[],
): Promise<Map<string, string>> {
  if (categoryIds.length === 0) {
    return new Map();
  }

  const rows = await get<Array<{ id: string; name: string }>>(config, "categories", {
    select: "id,name",
    id: `in.(${categoryIds.join(",")})`,
  });
  return new Map(rows.map((row) => [row.id, row.name]));
}
