#!/usr/bin/env node
// Integration tests for the payment status of imported statements: the batch columns, the
// `set_statement_payment_status` function and the cash side of `get_month_dashboard`.
//
// Run against a LOCAL Supabase stack only:
//   supabase start
//   node supabase/tests/statement-payment-status-suite.mjs

import { execSync } from "node:child_process";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim() || "http://127.0.0.1:54321";
const PAID_AT = "2026-10-15T12:00:00Z";

function readLocalKeys() {
  const output = execSync("supabase status -o env", { encoding: "utf8" });
  const read = (name) => output.match(new RegExp(`^${name}="?([^"\\n]+)"?$`, "m"))?.[1];
  const anonKey = read("ANON_KEY");
  const serviceRoleKey = read("SERVICE_ROLE_KEY");
  if (!anonKey || !serviceRoleKey) {
    throw new Error("Could not read local keys from `supabase status -o env`. Is `supabase start` running?");
  }
  return { anonKey, serviceRoleKey };
}

const { anonKey: ANON_KEY, serviceRoleKey: SERVICE_ROLE_KEY } = readLocalKeys();

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

const userHeaders = (token) => ({ apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

function callRpc(token, name, params) {
  return httpJson(`${SUPABASE_URL}/rest/v1/rpc/${name}`, { method: "POST", headers: userHeaders(token), body: JSON.stringify(params) });
}

async function service(method, path, payload) {
  const response = await httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Service-role ${method} ${path} failed (${response.status}): ${JSON.stringify(response.body)}`);
  }
  return response.body;
}

async function signUp(email) {
  const response = await httpJson(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Payment-Test-Password-1!" }),
  });
  if (!response.ok || !response.body?.access_token) {
    throw new Error(`Signup failed for ${email}: ${JSON.stringify(response.body)}`);
  }
  return { userId: response.body.user.id, accessToken: response.body.access_token };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertRejected(response, label, allowedStatuses = [400]) {
  assert(allowedStatuses.includes(response.status), `${label}: expected status ${allowedStatuses.join("/")}, got ${response.status}: ${JSON.stringify(response.body)}`);
}

async function seedUser(user, runId, label, expenseRootId) {
  await service("POST", "profiles", { id: user.userId, email: `${label}-${runId}@example.com`, display_name: label });
  const [connection] = await service("POST", "financial_connections", {
    user_id: user.userId, source_provider: "LEGACY", source_connection_id: `${label}-conn-${runId}`, institution_name: "Payment Test Bank", status: "UPDATED",
  });
  const [account] = await service("POST", "financial_accounts", {
    user_id: user.userId, connection_id: connection.id, source_provider: "LEGACY", source_account_id: `${label}-acc-${runId}`,
    type: "CREDIT", subtype: "CREDIT_CARD", name: "Payment Test Card", currency_code: "BRL",
  });
  const [category] = await service("POST", "categories", {
    code: `${label}-food-${runId}`, name: `${label} food`, impact_type: "EXPENSE", parent_id: expenseRootId, user_id: user.userId,
  });
  return { ...user, connectionId: connection.id, accountId: account.id, categoryId: category.id };
}

let counter = 0;

async function createBatch(owner, runId, overrides = {}) {
  counter += 1;
  const [batch] = await service("POST", "statement_import_batches", {
    user_id: owner.userId, bank: "BRADESCO", file_name: `payment-${runId}-${counter}.csv`, file_hash: `hash-${runId}-${counter}`, status: "PROCESSED", ...overrides,
  });
  return batch;
}

async function createTransaction(owner, runId, month, overrides = {}) {
  counter += 1;
  const [transaction] = await service("POST", "imported_transactions", {
    user_id: owner.userId, connection_id: owner.connectionId, account_id: owner.accountId, source_provider: "LEGACY",
    source_transaction_id: `payment-tx-${runId}-${counter}`, posted_at: `${month}-10T12:00:00Z`, competency_month: month,
    description: `Payment test ${counter}`, amount_cents: 1000, currency_code: "BRL", status: "POSTED", direction: "DEBIT",
    impact_type: "EXPENSE", internal_category_id: owner.categoryId, ...overrides,
  });
  return transaction;
}

async function createPlanned(owner, month, amountCents, overrides = {}) {
  const [entry] = await service("POST", "planned_entries", {
    user_id: owner.userId, month, title: `Planned ${amountCents}`, impact_type: "EXPENSE", category_id: owner.categoryId,
    amount_cents: amountCents, status: "PLANNED", ...overrides,
  });
  return entry;
}

const statusesOf = async (batchId) => (await service("GET", `imported_transactions?select=status&statement_import_batch_id=eq.${batchId}`)).map((row) => row.status);
const readBatch = async (batchId) => (await service("GET", `statement_import_batches?select=payment_status,paid_at&id=eq.${batchId}`))[0];

function buildTests({ userA, userB, runId }) {
  const tests = [];
  const test = (name, run) => tests.push({ name, run });
  const setStatus = (user, batchId, status, paidAt) =>
    callRpc(user.accessToken, "set_statement_payment_status", { p_batch_id: batchId, p_payment_status: status, ...(paidAt ? { p_paid_at: paidAt } : {}) });

  test("a new batch is paid by default and has no payment date", async () => {
    const batch = await createBatch(userA, runId);
    assertEqual(await readBatch(batch.id), { payment_status: "PAID", paid_at: null }, "defaults");
  });

  test("an open batch cannot carry a payment date", async () => {
    let rejected = false;
    try {
      await createBatch(userA, runId, { payment_status: "OPEN", paid_at: PAID_AT });
    } catch (error) {
      rejected = /23514/.test(String(error));
    }
    assert(rejected, "expected the check constraint to reject an open batch with a payment date");
  });

  test("opening a batch marks the batch and every row as pending", async () => {
    const batch = await createBatch(userA, runId);
    await createTransaction(userA, runId, "2026-07", { statement_import_batch_id: batch.id });
    await createTransaction(userA, runId, "2026-07", { statement_import_batch_id: batch.id });
    const response = await setStatus(userA, batch.id, "OPEN");
    assert(response.ok, `expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    assertEqual(response.body, [{ rows_updated: 2 }], "rows_updated");
    assertEqual(await readBatch(batch.id), { payment_status: "OPEN", paid_at: null }, "batch");
    assertEqual(await statusesOf(batch.id), ["PENDING", "PENDING"], "rows");
  });

  test("paying a batch marks the batch and every row as posted and stores the date", async () => {
    const batch = await createBatch(userA, runId, { payment_status: "OPEN" });
    await createTransaction(userA, runId, "2026-07", { statement_import_batch_id: batch.id, status: "PENDING" });
    const response = await setStatus(userA, batch.id, "PAID", PAID_AT);
    assertEqual(response.body, [{ rows_updated: 1 }], "rows_updated");
    const stored = await readBatch(batch.id);
    assertEqual(stored.payment_status, "PAID", "payment_status");
    assertEqual(new Date(stored.paid_at).toISOString(), new Date(PAID_AT).toISOString(), "paid_at");
    assertEqual(await statusesOf(batch.id), ["POSTED"], "rows");
  });

  test("paying without a date uses the current time and reopening clears it", async () => {
    const batch = await createBatch(userA, runId, { payment_status: "OPEN" });
    await setStatus(userA, batch.id, "PAID");
    assert((await readBatch(batch.id)).paid_at !== null, "expected a payment date");
    await setStatus(userA, batch.id, "OPEN");
    assertEqual(await readBatch(batch.id), { payment_status: "OPEN", paid_at: null }, "reopened batch");
  });

  test("rows of other batches are not touched", async () => {
    const target = await createBatch(userA, runId);
    const other = await createBatch(userA, runId);
    await createTransaction(userA, runId, "2026-07", { statement_import_batch_id: target.id });
    await createTransaction(userA, runId, "2026-07", { statement_import_batch_id: other.id });
    await setStatus(userA, target.id, "OPEN");
    assertEqual(await statusesOf(other.id), ["POSTED"], "other batch rows");
    assertEqual((await readBatch(other.id)).payment_status, "PAID", "other batch");
  });

  test("rejects an invalid status", async () => {
    const batch = await createBatch(userA, runId);
    assertRejected(await setStatus(userA, batch.id, "MAYBE"), "invalid status");
  });

  test("rejects a batch that belongs to another user and leaves it untouched", async () => {
    const batch = await createBatch(userA, runId);
    await createTransaction(userA, runId, "2026-07", { statement_import_batch_id: batch.id });
    assertRejected(await setStatus(userB, batch.id, "OPEN"), "foreign batch", [400, 404]);
    assertEqual((await readBatch(batch.id)).payment_status, "PAID", "batch after the foreign call");
    assertEqual(await statusesOf(batch.id), ["POSTED"], "rows after the foreign call");
  });

  test("rejects an unknown batch and calls without a signed-in user", async () => {
    assertRejected(await setStatus(userA, crypto.randomUUID(), "OPEN"), "unknown batch", [400, 404]);
    const batch = await createBatch(userA, runId);
    assertRejected(await setStatus({ accessToken: ANON_KEY }, batch.id, "OPEN"), "anonymous role", [401, 403]);
  });

  test("dashboard: open statements leave the balance and enter the commitments", async () => {
    const month = "2026-03";
    await createTransaction(userA, runId, month, { amount_cents: 100000, impact_type: "INCOME", direction: "CREDIT" });
    await createTransaction(userA, runId, month, { amount_cents: 1000 });
    await createTransaction(userA, runId, month, { amount_cents: 5000, status: "PENDING" });
    const matched = await createTransaction(userA, runId, month, { amount_cents: 2000, status: "PENDING" });
    await createTransaction(userA, runId, month, { amount_cents: 500, status: "PENDING", direction: "CREDIT" });
    const matchedPlan = await createPlanned(userA, month, 2000);
    await createPlanned(userA, month, 3000);
    await service("POST", "reconciliation_matches", {
      user_id: userA.userId, planned_entry_id: matchedPlan.id, imported_transaction_id: matched.id, status: "MANUAL_MATCHED", matched_by: "USER",
    });

    const response = await callRpc(userA.accessToken, "get_month_dashboard", { p_month: month });
    assert(response.ok, `expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    const summary = response.body.summary;
    assertEqual(summary.actualExpenseCents, 7500, "actualExpenseCents counts every import");
    assertEqual(summary.currentBalanceCents, 99000, "currentBalanceCents counts only paid rows");
    assertEqual(summary.openExpenseCents, 6500, "openExpenseCents");
    assertEqual(summary.committedRemainingCents, 9500, "committed = planned 5000 + open unmatched 4500");
  });

  test("dashboard: categories keep counting every import, paid or not", async () => {
    const month = "2026-04";
    await createTransaction(userA, runId, month, { amount_cents: 1000 });
    await createTransaction(userA, runId, month, { amount_cents: 4000, status: "PENDING" });
    const response = await callRpc(userA.accessToken, "get_month_dashboard", { p_month: month });
    const category = response.body.categories.find((row) => row.categoryId === userA.categoryId);
    assertEqual(category.actualCents, 5000, "category actualCents");
  });

  test("dashboard: with everything paid the numbers are the same as before", async () => {
    const month = "2026-05";
    await createTransaction(userA, runId, month, { amount_cents: 80000, impact_type: "INCOME", direction: "CREDIT" });
    await createTransaction(userA, runId, month, { amount_cents: 3000 });
    await createTransaction(userA, runId, month, { amount_cents: 700, direction: "CREDIT" });
    await createPlanned(userA, month, 1200);
    const summary = (await callRpc(userA.accessToken, "get_month_dashboard", { p_month: month })).body.summary;
    assertEqual(summary.currentBalanceCents, 80000 - (3000 - 700), "currentBalanceCents");
    assertEqual(summary.currentBalanceCents, summary.actualIncomeCents - summary.actualExpenseCents - summary.actualInvestmentCents, "same as the client formula");
    assertEqual(summary.committedRemainingCents, 1200, "committedRemainingCents");
    assertEqual(summary.openExpenseCents, 0, "openExpenseCents");
  });

  return tests;
}

async function main() {
  const runId = `${Date.now()}`.slice(-8);
  console.log(`Using SUPABASE_URL=${SUPABASE_URL}`);
  const [expenseRoot] = await service("GET", "categories?select=id&code=eq.expense");
  if (!expenseRoot) {
    throw new Error("Expected the root `expense` category. Run `supabase db reset` first.");
  }
  const [signedA, signedB] = await Promise.all([signUp(`pay-a-${runId}@example.com`), signUp(`pay-b-${runId}@example.com`)]);
  const userA = await seedUser(signedA, runId, "pay-a", expenseRoot.id);
  const userB = await seedUser(signedB, runId, "pay-b", expenseRoot.id);

  let failed = 0;
  const tests = buildTests({ userA, userB, runId });
  for (const { name, run } of tests) {
    try {
      await run();
      console.log(`PASS  ${name}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${name}\n      ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`\n${tests.length - failed}/${tests.length} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Statement payment status suite crashed:", error);
  process.exit(1);
});
