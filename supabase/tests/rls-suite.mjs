#!/usr/bin/env node
// RLS / multi-user isolation test suite for GGastos (Milestone 4, T6, requirement CLS-04).
//
// Verifies:
//   1. User A's rows in every owner-scoped table are invisible to User B (table isolation).
//   2. RPCs (`get_month_dashboard`, `generate_planned_entries`, `get_annual_summary` if present)
//      only ever reflect the calling user's own data.
//   3. Edge Functions validate resource ownership before acting on foreign ids.
//   4. `categories` is the one deliberately GLOBAL, shared-read table — both users must see it.
//
// Run against a local Supabase stack:
//   supabase start
//   node supabase/tests/rls-suite.mjs
//
// Configuration (env vars, sane local defaults provided):
//   SUPABASE_URL         defaults to http://127.0.0.1:54321
//   SUPABASE_ANON_KEY     defaults to the well-known Supabase local/demo anon key
//
// The service-role key is never read from env: it is pulled straight from
// `supabase status -o env` (the same machine this script runs on), so nothing
// sensitive needs to be typed in or committed. This only works against a local stack.
//
// No dependencies beyond Node's built-ins (fetch, child_process). Node 18+.

import { execSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Environment / config helpers
// ---------------------------------------------------------------------------

function getEnvOrDefault(name, fallback) {
  const value = process.env[name];
  if (value && value.trim().length > 0) {
    return value;
  }
  return fallback;
}

// Well-known local/demo Supabase anon key (same one shipped in the Supabase CLI's
// default `.env` for `supabase start`). A real deployment MUST set SUPABASE_ANON_KEY
// (and this script must never be pointed at a non-local project).
const DEFAULT_LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";

const SUPABASE_URL = getEnvOrDefault("SUPABASE_URL", "http://127.0.0.1:54321");
const SUPABASE_ANON_KEY = getEnvOrDefault("SUPABASE_ANON_KEY", DEFAULT_LOCAL_ANON_KEY);

function readServiceRoleKey() {
  // Shells out to the Supabase CLI on this machine, exactly like a developer would.
  // We deliberately avoid accepting the service-role key via env var input here so
  // this script can never be copy/pasted against a remote project by mistake.
  const output = execSync("supabase status -o env", { encoding: "utf8" });
  const match = output.match(/^SERVICE_ROLE_KEY="?([^"\n]+)"?$/m);
  if (!match) {
    throw new Error(
      "Could not find SERVICE_ROLE_KEY in `supabase status -o env` output. Is `supabase start` running?",
    );
  }
  return match[1];
}

// ---------------------------------------------------------------------------
// REST / RPC / Function helpers
// ---------------------------------------------------------------------------

async function httpJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let body;
  try {
    body = text.length > 0 ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  return { status: response.status, ok: response.ok, body };
}

function authHeaders(token) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
}

async function restGet(token, path) {
  return httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });
}

async function restPost(token, path, payload, extraHeaders = {}) {
  return httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  });
}

async function restPatch(token, path, payload) {
  return httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
}

async function callRpc(token, fnName, params) {
  return httpJson(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

async function callFunction(token, fnName, payload) {
  return httpJson(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: "POST",
    headers: {
      ...(token ? authHeaders(token) : { apikey: SUPABASE_ANON_KEY }),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// Service-role fixture writes bypass RLS entirely, mirroring how every Edge
// Function in this codebase already talks to Postgres (see
// supabase/functions/_shared/supabase-rest.ts). Preferred over a raw psql
// shell-out because it needs no extra Postgres-client dependency and stays
// consistent with the rest of the backend's access pattern.
function serviceRest(serviceRoleKey) {
  return async function serviceRequest(method, path, payload) {
    const response = await httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `Service-role ${method} ${path} failed (${response.status}): ${JSON.stringify(response.body)}`,
      );
    }
    return response.body;
  };
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function signUp(email, password) {
  const response = await httpJson(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok || !response.body?.access_token || !response.body?.user?.id) {
    throw new Error(`Signup failed for ${email} (${response.status}): ${JSON.stringify(response.body)}`);
  }
  return { userId: response.body.user.id, accessToken: response.body.access_token };
}

// ---------------------------------------------------------------------------
// Fixture seeding (as service role, for User A only)
// ---------------------------------------------------------------------------

async function seedFixturesForUserA(request, userAId, userBId) {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const month = "2026-07";

  await request("POST", "profiles", { id: userAId, email: `rls-a-${runId}@example.com`, display_name: "RLS Test User A" });
  await request("POST", "profiles", { id: userBId, email: `rls-b-${runId}@example.com`, display_name: "RLS Test User B" });

  const [salaryCategory] = await request("GET", "categories?select=id&code=eq.salary");
  const [housingCategory] = await request("GET", "categories?select=id&code=eq.housing");
  if (!salaryCategory || !housingCategory) {
    throw new Error("Expected seeded categories 'salary' and 'housing' to exist. Run `supabase db reset` first.");
  }

  const [connection] = await request("POST", "financial_connections", {
    user_id: userAId,
    institution_name: "RLS Test Bank",
    status: "UPDATED",
  });

  const [account] = await request("POST", "financial_accounts", {
    user_id: userAId,
    connection_id: connection.id,
    pluggy_account_id: `rls-account-${runId}`,
    type: "BANK",
    subtype: "CHECKING_ACCOUNT",
    name: "RLS Test Checking",
    currency_code: "BRL",
  });

  const [transaction] = await request("POST", "imported_transactions", {
    user_id: userAId,
    connection_id: connection.id,
    account_id: account.id,
    pluggy_transaction_id: `rls-transaction-${runId}`,
    posted_at: `${month}-10T12:00:00Z`,
    competency_month: month,
    description: "RLS test salary deposit",
    amount_cents: 500000,
    currency_code: "BRL",
    status: "POSTED",
    direction: "CREDIT",
    internal_category_id: salaryCategory.id,
    impact_type: "INCOME",
  });

  const [plannedEntry] = await request("POST", "planned_entries", {
    user_id: userAId,
    month,
    title: "RLS test rent",
    impact_type: "EXPENSE",
    category_id: housingCategory.id,
    amount_cents: 150000,
    status: "PLANNED",
  });

  const [reconciliationMatch] = await request("POST", "reconciliation_matches", {
    user_id: userAId,
    planned_entry_id: plannedEntry.id,
    imported_transaction_id: transaction.id,
    status: "MANUAL_MATCHED",
    matched_by: "USER",
  });

  const [syncEvent] = await request("POST", "sync_events", {
    user_id: userAId,
    event_type: "item/updated",
    connection_id: connection.id,
    processing_status: "PROCESSED",
    payload: { source: "rls-suite" },
  });

  const [monthSnapshot] = await request("POST", "month_snapshots", {
    user_id: userAId,
    month,
    planned_income_cents: 500000,
    planned_expense_cents: 150000,
    status: "OPEN",
  });

  return {
    month,
    connection,
    account,
    transaction,
    plannedEntry,
    reconciliationMatch,
    syncEvent,
    monthSnapshot,
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const OWNER_SCOPED_TABLES = [
  "financial_connections",
  "financial_accounts",
  "imported_transactions",
  "planned_entries",
  "reconciliation_matches",
  "sync_events",
  "month_snapshots",
];

function buildTests({ userA, userB, fixtures }) {
  const tests = [];

  // --- 1. Table isolation: User B must never see User A's rows -----------
  for (const table of OWNER_SCOPED_TABLES) {
    tests.push({
      name: `table isolation: user B cannot read user A's rows in ${table}`,
      run: async () => {
        const response = await restGet(userB.accessToken, `${table}?select=id`);
        assert(response.ok, `expected 200 from ${table}, got ${response.status}: ${JSON.stringify(response.body)}`);
        assert(Array.isArray(response.body), `expected an array response from ${table}`);
        assert(
          response.body.length === 0,
          `expected zero rows visible to user B in ${table}, got ${response.body.length}`,
        );
      },
    });
  }

  tests.push({
    name: "table isolation: anonymous client cannot read planned_entries at all",
    run: async () => {
      const response = await httpJson(`${SUPABASE_URL}/rest/v1/planned_entries?select=id`, {
        method: "GET",
        headers: { apikey: SUPABASE_ANON_KEY },
      });
      assert(
        response.status === 401 || response.status === 403 || (response.ok && response.body.length === 0),
        `expected anonymous read of planned_entries to be rejected or empty, got ${response.status}: ${JSON.stringify(response.body)}`,
      );
    },
  });

  // --- 2. RPCs respect the authenticated user ------------------------------
  tests.push({
    name: "rpc get_month_dashboard: user B sees zeros, not user A's amounts",
    run: async () => {
      const response = await callRpc(userB.accessToken, "get_month_dashboard", { p_month: fixtures.month });
      assert(response.ok, `expected 200 from get_month_dashboard, got ${response.status}: ${JSON.stringify(response.body)}`);
      const summary = response.body.summary;
      assert(summary.plannedIncomeCents === 0, `expected user B plannedIncomeCents to be 0, got ${summary.plannedIncomeCents}`);
      assert(summary.actualIncomeCents === 0, `expected user B actualIncomeCents to be 0, got ${summary.actualIncomeCents}`);
      assert(summary.plannedExpenseCents === 0, `expected user B plannedExpenseCents to be 0, got ${summary.plannedExpenseCents}`);
      assert(Array.isArray(response.body.categories) && response.body.categories.length === 0, "expected user B categories breakdown to be empty");
    },
  });

  tests.push({
    name: "rpc get_month_dashboard: user A still sees their own seeded amounts",
    run: async () => {
      const response = await callRpc(userA.accessToken, "get_month_dashboard", { p_month: fixtures.month });
      assert(response.ok, `expected 200 from get_month_dashboard for user A, got ${response.status}`);
      assert(
        response.body.summary.plannedExpenseCents === 150000,
        `expected user A plannedExpenseCents to be 150000, got ${response.body.summary.plannedExpenseCents}`,
      );
    },
  });

  tests.push({
    name: "rpc generate_planned_entries: user B runs it without error and without touching user A's data",
    run: async () => {
      const response = await callRpc(userB.accessToken, "generate_planned_entries", { p_month: fixtures.month });
      assert(response.ok, `expected 200 from generate_planned_entries, got ${response.status}: ${JSON.stringify(response.body)}`);
      assert(response.body === 0, `expected user B (no templates) to generate 0 entries, got ${JSON.stringify(response.body)}`);

      const afterState = await restGet(userB.accessToken, `planned_entries?select=id`);
      assert(afterState.ok && afterState.body.length === 0, "user B must still see zero planned_entries after running generate_planned_entries");
    },
  });

  tests.push({
    name: "rpc get_annual_summary: user B sees zeroed months and no categories for user A's year",
    run: async () => {
      const year = Number.parseInt(fixtures.month.slice(0, 4), 10);
      const response = await callRpc(userB.accessToken, "get_annual_summary", { p_year: year });
      assert(response.ok, `expected 200 from get_annual_summary, got ${response.status}: ${JSON.stringify(response.body)}`);
      assert(response.body.year === year, `expected year ${year} in response, got ${response.body.year}`);
      assert(Array.isArray(response.body.months) && response.body.months.length === 12, "expected 12 months in get_annual_summary response");

      const seededMonthRow = response.body.months.find((row) => row.month === fixtures.month);
      assert(seededMonthRow, `expected a row for month ${fixtures.month} in get_annual_summary response`);
      assert(seededMonthRow.hasSnapshot === false, `expected user B to have no snapshot for ${fixtures.month}, got hasSnapshot=${seededMonthRow.hasSnapshot}`);
      assert(seededMonthRow.plannedIncomeCents === 0, `expected user B plannedIncomeCents to be 0, got ${seededMonthRow.plannedIncomeCents}`);
      assert(seededMonthRow.plannedExpenseCents === 0, `expected user B plannedExpenseCents to be 0, got ${seededMonthRow.plannedExpenseCents}`);
      assert(seededMonthRow.currentBalanceCents === 0, `expected user B currentBalanceCents to be 0, got ${seededMonthRow.currentBalanceCents}`);

      for (const monthRow of response.body.months) {
        assert(monthRow.plannedExpenseCents !== 150000, `user B's get_annual_summary leaked user A's seeded plannedExpenseCents (150000) in month ${monthRow.month}`);
      }

      assert(Array.isArray(response.body.categories) && response.body.categories.length === 0, `expected user B's get_annual_summary categories to be empty, got ${JSON.stringify(response.body.categories)}`);
    },
  });

  // --- 3. Edge Functions validate resource ownership -----------------------
  tests.push({
    name: "edge function reconcile-transactions: user B confirming user A's pair is rejected with 404 not_found",
    run: async () => {
      const response = await callFunction(userB.accessToken, "reconcile-transactions", {
        action: "confirm",
        plannedEntryId: fixtures.plannedEntry.id,
        transactionId: fixtures.transaction.id,
      });
      assert(response.status === 404, `expected 404 from reconcile-transactions, got ${response.status}: ${JSON.stringify(response.body)}`);
      assert(response.body?.error === "not_found", `expected error code 'not_found', got ${JSON.stringify(response.body)}`);
    },
  });

  tests.push({
    name: "edge function reconcile-transactions: rejects requests with no bearer token",
    run: async () => {
      const response = await callFunction(null, "reconcile-transactions", {
        action: "confirm",
        plannedEntryId: fixtures.plannedEntry.id,
        transactionId: fixtures.transaction.id,
      });
      assert(response.status === 401, `expected 401 for unauthenticated reconcile-transactions call, got ${response.status}`);
    },
  });

  tests.push({
    name: "edge function recalculate-month-snapshot: user B's snapshot belongs to user B and never touches user A's row",
    run: async () => {
      const userASnapshotBefore = await restGet(userA.accessToken, `month_snapshots?select=id,user_id,month,planned_expense_cents&id=eq.${fixtures.monthSnapshot.id}`);
      assert(userASnapshotBefore.ok && userASnapshotBefore.body.length === 1, "expected to read user A's seeded month_snapshots row before user B's call");

      const response = await callFunction(userB.accessToken, "recalculate-month-snapshot", { month: fixtures.month });
      assert(response.ok, `expected recalculate-month-snapshot to succeed for user B, got ${response.status}: ${JSON.stringify(response.body)}`);
      assert(typeof response.body.id === "string" && response.body.id.length > 0, `expected recalculate-month-snapshot to return an id, got ${JSON.stringify(response.body)}`);
      assert(response.body.month === fixtures.month, `expected returned month to be ${fixtures.month}, got ${response.body.month}`);

      const returnedSnapshot = await restGet(userB.accessToken, `month_snapshots?select=id,user_id,month&id=eq.${response.body.id}`);
      assert(returnedSnapshot.ok && returnedSnapshot.body.length === 1, "expected user B to be able to read back the snapshot it just created");
      assert(returnedSnapshot.body[0].user_id === userB.userId, `expected returned month_snapshots row to belong to user B, got user_id ${returnedSnapshot.body[0].user_id}`);
      assert(returnedSnapshot.body[0].id !== fixtures.monthSnapshot.id, "user B's recalculated snapshot must not be the same row as user A's snapshot");

      const userBCannotSeeUserASnapshot = await restGet(userB.accessToken, `month_snapshots?select=id&id=eq.${fixtures.monthSnapshot.id}`);
      assert(userBCannotSeeUserASnapshot.ok && userBCannotSeeUserASnapshot.body.length === 0, "user B must not be able to read user A's month_snapshots row");

      const userASnapshotAfter = await restGet(userA.accessToken, `month_snapshots?select=id,user_id,month,planned_expense_cents&id=eq.${fixtures.monthSnapshot.id}`);
      assert(userASnapshotAfter.ok && userASnapshotAfter.body.length === 1, "expected user A's month_snapshots row to still exist after user B's recalculation");
      assert(
        userASnapshotAfter.body[0].planned_expense_cents === userASnapshotBefore.body[0].planned_expense_cents,
        "user A's month_snapshots row values must be unchanged by user B's recalculation",
      );
    },
  });

  // --- 4. categories: the one deliberately GLOBAL, shared-read table -------
  tests.push({
    name: "categories: user A and user B both see the same full, non-empty category list",
    run: async () => {
      const [responseA, responseB] = await Promise.all([
        restGet(userA.accessToken, "categories?select=id,code"),
        restGet(userB.accessToken, "categories?select=id,code"),
      ]);
      assert(responseA.ok, `expected 200 reading categories as user A, got ${responseA.status}`);
      assert(responseB.ok, `expected 200 reading categories as user B, got ${responseB.status}`);
      assert(responseA.body.length > 0, "expected categories list to be non-empty");
      assert(
        responseA.body.length === responseB.body.length,
        `expected identical category counts for both users, got A=${responseA.body.length} B=${responseB.body.length}`,
      );
      const codesA = new Set(responseA.body.map((row) => row.code));
      assert(codesA.has("salary"), "expected seeded category code 'salary' to be visible");
      assert(codesA.has("housing"), "expected seeded category code 'housing' to be visible");
      const codesB = new Set(responseB.body.map((row) => row.code));
      assert(codesA.size === codesB.size && [...codesA].every((code) => codesB.has(code)), "expected both users to see the exact same set of category codes");
    },
  });

  tests.push({
    name: "categories: user B cannot write to the globally-readable table",
    run: async () => {
      const response = await restPost(userB.accessToken, "categories", {
        code: `rls-test-should-fail-${Date.now()}`,
        name: "Should not be allowed",
        impact_type: "EXPENSE",
      });
      assert(!response.ok, `expected categories insert by a regular user to be rejected, got ${response.status}`);
    },
  });

  return tests;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
  const results = [];
  const runStamp = Date.now();

  console.log(`Using SUPABASE_URL=${SUPABASE_URL}`);

  const serviceRoleKey = readServiceRoleKey();
  const request = serviceRest(serviceRoleKey);

  const [userA, userB] = await Promise.all([
    signUp(`rls-a-${runStamp}@example.com`, "Rls-Test-Password-1!"),
    signUp(`rls-b-${runStamp}@example.com`, "Rls-Test-Password-2!"),
  ]);

  const fixtures = await seedFixturesForUserA(request, userA.userId, userB.userId);

  const tests = buildTests({ userA, userB, fixtures });

  for (const test of tests) {
    try {
      await test.run();
      results.push({ name: test.name, passed: true });
      console.log(`PASS  ${test.name}`);
    } catch (error) {
      results.push({ name: test.name, passed: false, error });
      console.log(`FAIL  ${test.name}`);
      console.log(`      ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  console.log("");
  console.log(`${passed}/${results.length} passed, ${failed} failed`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("RLS suite crashed before completing:", error);
  process.exit(1);
});
