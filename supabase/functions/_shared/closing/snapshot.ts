import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

export type MonthDashboardSummary = {
  plannedIncomeCents: number;
  actualIncomeCents: number;
  plannedExpenseCents: number;
  actualExpenseCents: number;
  plannedInvestmentCents: number;
  actualInvestmentCents: number;
  expectedBalanceCents: number;
  currentBalanceCents: number;
  committedRemainingCents: number;
};

export type MonthDashboard = {
  month: string;
  summary: MonthDashboardSummary;
  categories: unknown[];
};

export type MonthSnapshotRow = {
  id: string;
  month: string;
  status: "OPEN" | "CLOSED";
  computed_at: string;
};

/**
 * get_month_dashboard is `security invoker` and reads `auth.uid()`, so it
 * must be called with the requesting user's own access token — the service
 * role has no `auth.uid()` and would hit the function's "authentication
 * required" guard.
 */
export async function fetchMonthDashboardAsUser(
  supabaseUrl: string,
  anonKey: string,
  userAccessToken: string,
  month: string,
): Promise<MonthDashboard> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_month_dashboard`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${userAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_month: month }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`get_month_dashboard failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as MonthDashboard;
}

/**
 * Upserts on (user_id, month) without ever sending `status`, so an existing
 * OPEN/CLOSED value survives recalculation untouched — PostgREST's upsert
 * only overwrites columns present in the payload.
 */
export async function upsertMonthSnapshot(
  config: SupabaseRestConfig,
  userId: string,
  dashboard: MonthDashboard,
): Promise<MonthSnapshotRow> {
  const { summary } = dashboard;

  const rows = await supabaseRest<MonthSnapshotRow[]>(
    config,
    "/rest/v1/month_snapshots?on_conflict=user_id,month&select=id,month,status,computed_at",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        month: dashboard.month,
        planned_income_cents: summary.plannedIncomeCents,
        actual_income_cents: summary.actualIncomeCents,
        planned_expense_cents: summary.plannedExpenseCents,
        actual_expense_cents: summary.actualExpenseCents,
        planned_investment_cents: summary.plannedInvestmentCents,
        actual_investment_cents: summary.actualInvestmentCents,
        expected_balance_cents: summary.expectedBalanceCents,
        current_balance_cents: summary.currentBalanceCents,
        committed_remaining_cents: summary.committedRemainingCents,
        snapshot_payload: dashboard,
        computed_at: new Date().toISOString(),
      }),
    },
  );

  if (rows.length !== 1) {
    throw new Error("Expected exactly one month_snapshots row from upsert.");
  }

  return rows[0];
}
