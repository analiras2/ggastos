import assert from "node:assert/strict";
import test from "node:test";

import { listReconciliationInbox } from "./inbox.ts";

const config = { supabaseUrl: "http://db", serviceRoleKey: "key" };
const context = { userId: "user-1", month: "2026-11" };

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

const plannedEntry = {
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
};

function stubDatabase(t, { transactions = [], plannedEntries = [], rejected = [] }) {
  const originalFetch = globalThis.fetch;
  const queries = [];

  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    queries.push({ path: parsed.pathname, params: parsed.searchParams });
    const json = (body) => new Response(JSON.stringify(body));

    if (parsed.pathname.endsWith("/reconciliation_matches")) {
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
  return queries;
}

test("suggests the best planned entry for each transaction, strongest first", async (t) => {
  stubDatabase(t, {
    transactions: [transaction({ id: "tx-weaker", amount_cents: 6150 }), transaction({ id: "tx-exact" })],
    plannedEntries: [plannedEntry],
  });

  const suggestions = await listReconciliationInbox(config, context);

  assert.deepEqual(
    suggestions.map((suggestion) => suggestion.transactionId),
    ["tx-exact", "tx-weaker"],
  );
  assert.equal(suggestions[0].score, 1);
  assert.equal(suggestions[0].plannedEntryTitle, "Netflix");
  assert.ok(suggestions[1].score < 1);
});

test("leaves out transactions that do not reach the suggestion threshold", async (t) => {
  stubDatabase(t, {
    transactions: [transaction({ description: "UBER TRIP", amount_cents: 9000 })],
    plannedEntries: [plannedEntry],
  });

  assert.deepEqual(await listReconciliationInbox(config, context), []);
});

test("never brings back a pair the user rejected", async (t) => {
  stubDatabase(t, {
    transactions: [transaction()],
    plannedEntries: [plannedEntry],
    rejected: [{ imported_transaction_id: "tx-1", planned_entry_id: "entry-1" }],
  });

  assert.deepEqual(await listReconciliationInbox(config, context), []);
});

test("asks only for the user's transactions and planned entries of the month", async (t) => {
  const queries = stubDatabase(t, { transactions: [transaction()], plannedEntries: [plannedEntry] });

  await listReconciliationInbox(config, context);

  const transactionQuery = queries.find((query) => query.path.endsWith("/imported_transactions"));
  const plannedQuery = queries.find((query) => query.path.endsWith("/planned_entries"));
  assert.equal(transactionQuery.params.get("user_id"), "eq.user-1");
  assert.equal(transactionQuery.params.get("competency_month"), "eq.2026-11");
  assert.equal(plannedQuery.params.get("user_id"), "eq.user-1");
  assert.equal(plannedQuery.params.get("month"), "eq.2026-11");
  assert.equal(plannedQuery.params.get("status"), "in.(PLANNED,PROJECTED)");
});

test("is empty, without more queries, when there are no transactions", async (t) => {
  const queries = stubDatabase(t, { transactions: [] });

  assert.deepEqual(await listReconciliationInbox(config, context), []);
  assert.equal(queries.some((query) => query.path.endsWith("/planned_entries")), false);
});
