import assert from "node:assert/strict";
import test from "node:test";

import { runAutoMatch } from "./auto-match.ts";

const config = { supabaseUrl: "http://db", serviceRoleKey: "key" };
const context = { userId: "user-1", accountId: "account-1" };

const transaction = (overrides = {}) => ({
  id: "tx-1",
  description: "NETFLIX",
  merchant_name: null,
  impact_type: "EXPENSE",
  amount_cents: 5590,
  posted_at: "2026-11-10T00:00:00.000Z",
  competency_month: "2026-11",
  account_id: "account-1",
  pluggy_category_name: null,
  statement_installment_index: null,
  statement_installment_total: null,
  ...overrides,
});

const plannedEntry = (overrides = {}) => ({
  id: "entry-1",
  title: "Netflix",
  impact_type: "EXPENSE",
  amount_cents: 5590,
  due_date: "2026-11-10",
  month: "2026-11",
  expected_account_id: null,
  category_id: "cat-1",
  installment_index: null,
  installment_total: null,
  ...overrides,
});

// Answers the REST calls of runAutoMatch from the given tables and records the inserts.
function stubDatabase(t, { transactions = [], plannedEntries = [], rejected = [], insertStatus = 201 }) {
  const originalFetch = globalThis.fetch;
  const inserts = [];
  const requested = [];

  globalThis.fetch = async (url, init) => {
    const parsed = new URL(url);
    requested.push(parsed.pathname);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

    if (parsed.pathname.endsWith("/reconciliation_matches")) {
      if (init.method === "POST") {
        inserts.push(JSON.parse(init.body));
        return insertStatus === 201 ? new Response(null, { status: 201 }) : new Response("conflict", { status: insertStatus });
      }
      return json(parsed.searchParams.get("status") === "eq.REJECTED" ? rejected : []);
    }
    if (parsed.pathname.endsWith("/imported_transactions")) return json(transactions);
    if (parsed.pathname.endsWith("/planned_entries")) return json(plannedEntries);
    if (parsed.pathname.endsWith("/categories")) return json([{ id: "cat-1", name: "Streaming" }]);
    throw new Error(`Unexpected request to ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  return { inserts, requested };
}

test("auto-matches a transaction with a planned entry that fits it exactly", async (t) => {
  const { inserts } = stubDatabase(t, { transactions: [transaction()], plannedEntries: [plannedEntry()] });

  const outcomes = await runAutoMatch(config, context);

  assert.deepEqual(outcomes, [{ transactionId: "tx-1", plannedEntryId: "entry-1", score: 1 }]);
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0].status, "AUTO_MATCHED");
  assert.equal(inserts[0].matched_by, "SYSTEM");
  assert.equal(inserts[0].user_id, "user-1");
});

test("does not fail when a planned entry has no title", async (t) => {
  const { inserts } = stubDatabase(t, { transactions: [transaction()], plannedEntries: [plannedEntry({ title: null })] });

  await runAutoMatch(config, context);

  assert.equal(inserts.length, 0);
});

test("leaves a weak match for the user to review", async (t) => {
  const { inserts } = stubDatabase(t, {
    transactions: [transaction({ description: "UBER TRIP", amount_cents: 5800 })],
    plannedEntries: [plannedEntry()],
  });

  assert.deepEqual(await runAutoMatch(config, context), []);
  assert.equal(inserts.length, 0);
});

test("never suggests a pair the user already rejected", async (t) => {
  const { inserts } = stubDatabase(t, {
    transactions: [transaction()],
    plannedEntries: [plannedEntry()],
    rejected: [{ imported_transaction_id: "tx-1", planned_entry_id: "entry-1" }],
  });

  assert.deepEqual(await runAutoMatch(config, context), []);
  assert.equal(inserts.length, 0);
});

test("only compares a transaction with planned entries of its own month", async (t) => {
  const { inserts } = stubDatabase(t, {
    transactions: [transaction()],
    plannedEntries: [plannedEntry({ month: "2026-12", due_date: "2026-12-10" })],
  });

  assert.deepEqual(await runAutoMatch(config, context), []);
  assert.equal(inserts.length, 0);
});

test("one planned entry is matched to a single transaction", async (t) => {
  const { inserts } = stubDatabase(t, {
    transactions: [transaction({ id: "tx-1" }), transaction({ id: "tx-2" })],
    plannedEntries: [plannedEntry()],
  });

  const outcomes = await runAutoMatch(config, context);

  assert.equal(outcomes.length, 1);
  assert.equal(inserts.length, 1);
});

test("picks the planned entry that scores best", async (t) => {
  stubDatabase(t, {
    transactions: [transaction()],
    plannedEntries: [plannedEntry({ id: "entry-far", title: "Spotify", amount_cents: 5700 }), plannedEntry()],
  });

  const [outcome] = await runAutoMatch(config, context);

  assert.equal(outcome.plannedEntryId, "entry-1");
});

test("skips a pair when someone else claimed it first instead of failing the batch", async (t) => {
  stubDatabase(t, { transactions: [transaction()], plannedEntries: [plannedEntry()], insertStatus: 409 });

  assert.deepEqual(await runAutoMatch(config, context), []);
});

test("does nothing more when there are no transactions to match", async (t) => {
  const { requested } = stubDatabase(t, { transactions: [] });

  assert.deepEqual(await runAutoMatch(config, context), []);
  assert.equal(requested.some((path) => path.endsWith("/planned_entries")), false);
});

test("does nothing more when there are no planned entries to match", async (t) => {
  const { inserts, requested } = stubDatabase(t, { transactions: [transaction()], plannedEntries: [] });

  assert.deepEqual(await runAutoMatch(config, context), []);
  assert.equal(inserts.length, 0);
  assert.equal(requested.some((path) => path.endsWith("/categories")), false);
});
