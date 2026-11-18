import assert from "node:assert/strict";
import test from "node:test";

import { closeMonthSnapshot, fetchMonthDashboardAsUser, upsertMonthSnapshot } from "./snapshot.ts";

const config = { supabaseUrl: "http://db", serviceRoleKey: "service-key" };

const dashboard = {
  month: "2026-11",
  summary: {
    plannedIncomeCents: 1,
    actualIncomeCents: 2,
    plannedExpenseCents: 3,
    actualExpenseCents: 4,
    plannedInvestmentCents: 5,
    actualInvestmentCents: 6,
    expectedBalanceCents: 7,
    currentBalanceCents: 8,
    committedRemainingCents: 9,
  },
  categories: [],
};

const snapshotRow = { id: "snap-1", month: "2026-11", status: "OPEN", computed_at: "2026-11-30T00:00:00Z" };

function stubFetch(t, respond) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return respond();
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  return calls;
}

test("the dashboard is read with the user's own token, not the service role", async (t) => {
  const calls = stubFetch(t, () => new Response(JSON.stringify(dashboard)));

  const result = await fetchMonthDashboardAsUser("http://db", "anon-key", "user-token", "2026-11");

  assert.equal(result.month, "2026-11");
  assert.equal(calls[0].init.headers.Authorization, "Bearer user-token");
  assert.equal(calls[0].init.headers.apikey, "anon-key");
  assert.deepEqual(JSON.parse(calls[0].init.body), { p_month: "2026-11" });
});

test("a failed dashboard read reports the status and the body", async (t) => {
  stubFetch(t, () => new Response("authentication required", { status: 401 }));

  await assert.rejects(
    fetchMonthDashboardAsUser("http://db", "anon-key", "bad-token", "2026-11"),
    /get_month_dashboard failed \(401\): authentication required/,
  );
});

test("the snapshot upsert maps the summary and never sends the status", async (t) => {
  const calls = stubFetch(t, () => new Response(JSON.stringify([snapshotRow])));

  const row = await upsertMonthSnapshot(config, "user-1", dashboard);
  const body = JSON.parse(calls[0].init.body);

  assert.equal(row.id, "snap-1");
  assert.match(calls[0].url, /on_conflict=user_id,month/);
  assert.equal(body.user_id, "user-1");
  assert.equal(body.month, "2026-11");
  assert.equal(body.planned_income_cents, 1);
  assert.equal(body.committed_remaining_cents, 9);
  assert.deepEqual(body.snapshot_payload, dashboard);
  assert.equal("status" in body, false, "an existing OPEN/CLOSED value must survive recalculation");
});

test("the snapshot upsert fails unless exactly one row comes back", async (t) => {
  stubFetch(t, () => new Response("[]"));

  await assert.rejects(upsertMonthSnapshot(config, "user-1", dashboard), /exactly one month_snapshots row/);
});

test("closing a snapshot patches only its status to CLOSED", async (t) => {
  const calls = stubFetch(t, () => new Response(JSON.stringify([{ ...snapshotRow, status: "CLOSED" }])));

  const row = await closeMonthSnapshot(config, "snap-1");

  assert.equal(row.status, "CLOSED");
  assert.equal(calls[0].init.method, "PATCH");
  assert.match(calls[0].url, /id=eq\.snap-1/);
  assert.deepEqual(JSON.parse(calls[0].init.body), { status: "CLOSED" });
});

test("closing fails unless exactly one row was changed", async (t) => {
  stubFetch(t, () => new Response("[]"));

  await assert.rejects(closeMonthSnapshot(config, "missing"), /exactly one month_snapshots row while closing/);
});
