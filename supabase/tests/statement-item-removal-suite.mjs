#!/usr/bin/env node
// Integration tests for removing a statement item and for recategorizing every similar item:
// the `remove_imported_transaction`, `restore_imported_transaction`,
// `count_similar_imported_transactions` and `recategorize_similar_imported_transactions` RPCs.
//
// Run against a LOCAL Supabase stack only (fixtures are written with the local service-role key):
//   supabase start
//   node supabase/tests/statement-item-removal-suite.mjs

import { execSync } from "node:child_process";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim() || "http://127.0.0.1:54321";

function readLocalKeys() {
  const output = execSync("supabase status -o env", { encoding: "utf8" });
  const read = (name) => output.match(new RegExp(`^${name}="?([^"\\n]+)"?$`, "m"))?.[1];
  return { anonKey: read("ANON_KEY"), serviceRoleKey: read("SERVICE_ROLE_KEY") };
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

const callRpc = (token, name, params) =>
  httpJson(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

async function service(method, path, payload, prefer = "return=representation") {
  const response = await httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
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
    body: JSON.stringify({ email, password: "Removal-Test-Password-1!" }),
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

async function seedUser(user, runId, label, expenseRootId) {
  await service("POST", "profiles", { id: user.userId, email: `${label}-${runId}@example.com`, display_name: label });
  const [connection] = await service("POST", "financial_connections", {
    user_id: user.userId, source_provider: "LEGACY", source_connection_id: `${label}-conn-${runId}`,
    institution_name: "Removal Test Bank", status: "UPDATED",
  });
  const [account] = await service("POST", "financial_accounts", {
    user_id: user.userId, connection_id: connection.id, source_provider: "LEGACY",
    source_account_id: `${label}-acc-${runId}`, type: "BANK", subtype: "CHECKING_ACCOUNT",
    name: "Removal Test Account", currency_code: "BRL",
  });
  const makeCategory = async (suffix, impactType) => {
    const [category] = await service("POST", "categories", {
      code: `${label}-${suffix}-${runId}`, name: `${label} ${suffix}`, impact_type: impactType,
      parent_id: expenseRootId, user_id: user.userId, is_active: true,
    });
    return category.id;
  };
  return {
    ...user, connectionId: connection.id, accountId: account.id,
    foodCategoryId: await makeCategory("food", "EXPENSE"),
    gymCategoryId: await makeCategory("gym", "EXPENSE"),
    incomeCategoryId: await makeCategory("income", "INCOME"),
  };
}

let counter = 0;

async function createTransaction(owner, runId, overrides = {}) {
  counter += 1;
  const [row] = await service("POST", "imported_transactions", {
    user_id: owner.userId, connection_id: owner.connectionId, account_id: owner.accountId,
    source_provider: "LEGACY", source_transaction_id: `tx-${runId}-${counter}`,
    posted_at: "2026-07-10T12:00:00Z", competency_month: "2026-07", description: `Purchase ${counter}`,
    amount_cents: 1000, currency_code: "BRL", status: "POSTED", direction: "DEBIT", impact_type: "EXPENSE",
    ...overrides,
  });
  return row.id;
}

async function readRow(id) {
  const [row] = await service("GET", `imported_transactions?select=id,deleted_at,internal_category_id&id=eq.${id}`);
  return row;
}

function buildTests({ userA, userB, runId }) {
  const tests = [];
  const test = (name, run) => tests.push({ name, run });
  const remove = (user, id) => callRpc(user.accessToken, "remove_imported_transaction", { p_transaction_id: id });
  const recategorize = (user, id, categoryId, ruleValue) =>
    callRpc(user.accessToken, "recategorize_similar_imported_transactions", {
      p_transaction_id: id, p_category_id: categoryId, p_rule_value: ruleValue,
    });
  const merchant = `Academia ${runId}`;

  test("removing a row keeps it stored as deleted", async () => {
    const id = await createTransaction(userA, runId);
    const response = await remove(userA, id);
    assert(response.ok, `expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    assert((await readRow(id)).deleted_at !== null, "the row must be marked as deleted");
  });

  test("a removed row stays removed when the same file is imported again", async () => {
    const id = await createTransaction(userA, runId);
    await remove(userA, id);
    // The import upserts the row by its source key without sending deleted_at (as the Edge Function does).
    const [{ source_transaction_id: sourceTransactionId }] = await service(
      "GET",
      `imported_transactions?select=source_transaction_id&id=eq.${id}`,
    );
    await service("POST", "imported_transactions?on_conflict=user_id,source_provider,source_transaction_id", [{
      user_id: userA.userId, connection_id: userA.connectionId, account_id: userA.accountId,
      source_provider: "LEGACY", source_transaction_id: sourceTransactionId,
      posted_at: "2026-07-10T12:00:00Z", competency_month: "2026-07", description: "Purchase again",
      amount_cents: 1000, currency_code: "BRL", status: "POSTED", direction: "DEBIT", impact_type: "EXPENSE",
    }], "resolution=merge-duplicates,return=representation");
    assert((await readRow(id)).deleted_at !== null, "a re-import must not bring the row back");
  });

  test("removing releases an active match with a planned entry", async () => {
    const id = await createTransaction(userA, runId);
    const [entry] = await service("POST", "planned_entries", {
      user_id: userA.userId, month: "2026-07", title: "Planned", impact_type: "EXPENSE",
      category_id: userA.foodCategoryId, amount_cents: 1000,
    });
    const [match] = await service("POST", "reconciliation_matches", {
      user_id: userA.userId, planned_entry_id: entry.id, imported_transaction_id: id,
      status: "MANUAL_MATCHED", matched_by: "USER",
    });
    await remove(userA, id);
    const [after] = await service("GET", `reconciliation_matches?select=status&id=eq.${match.id}`);
    assertEqual(after.status, "UNMATCHED", "match status");
  });

  test("removing twice, or an unknown row, is rejected", async () => {
    const id = await createTransaction(userA, runId);
    await remove(userA, id);
    assert(!(await remove(userA, id)).ok, "a row that is already removed cannot be removed again");
    assert(!(await remove(userA, "00000000-0000-4000-8000-000000000000")).ok, "an unknown row must be rejected");
  });

  test("another user cannot remove or restore the row", async () => {
    const id = await createTransaction(userA, runId);
    assert(!(await remove(userB, id)).ok, "user B must not remove user A's row");
    assertEqual((await readRow(id)).deleted_at, null, "deleted_at");
    await remove(userA, id);
    const restoreByB = await callRpc(userB.accessToken, "restore_imported_transaction", { p_transaction_id: id });
    assert(!restoreByB.ok, "user B must not restore user A's row");
  });

  test("restoring brings a removed row back", async () => {
    const id = await createTransaction(userA, runId);
    await remove(userA, id);
    const response = await callRpc(userA.accessToken, "restore_imported_transaction", { p_transaction_id: id });
    assert(response.ok, `expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    assertEqual((await readRow(id)).deleted_at, null, "deleted_at");
  });

  test("counts similar rows, ignoring removed, hidden and other users' rows", async () => {
    const kept = await Promise.all([1, 2].map((n) => createTransaction(userA, runId, { description: `${merchant} - Parcela ${n}/6` })));
    const removed = await createTransaction(userA, runId, { description: merchant });
    await createTransaction(userA, runId, { description: merchant, is_hidden_from_budget: true });
    await createTransaction(userB, runId, { description: merchant });
    await remove(userA, removed);
    const response = await callRpc(userA.accessToken, "count_similar_imported_transactions", { p_rule_value: merchant });
    assertEqual(response.body, kept.length, "count");
  });

  test("recategorizing moves every similar row, even the ones already categorized", async () => {
    const description = `Loja Azul ${runId}`;
    const first = await createTransaction(userA, runId, { description: `${description} - Parcela 1/3` });
    const second = await createTransaction(userA, runId, { description, internal_category_id: userA.foodCategoryId });
    const other = await createTransaction(userA, runId, { description: `Outro lugar ${runId}` });
    const response = await recategorize(userA, first, userA.gymCategoryId, description);
    assert(response.ok, `expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    assertEqual(response.body, [{ updated_count: 2, rules_upserted: 1 }], "counts");
    assertEqual((await readRow(first)).internal_category_id, userA.gymCategoryId, "first");
    assertEqual((await readRow(second)).internal_category_id, userA.gymCategoryId, "second");
    assertEqual((await readRow(other)).internal_category_id, null, "unrelated row");
  });

  test("recategorizing saves a rule for the next statements and replaces an older one", async () => {
    const description = `Cafe Verde ${runId}`;
    const id = await createTransaction(userA, runId, { description });
    await recategorize(userA, id, userA.foodCategoryId, description);
    await recategorize(userA, id, userA.gymCategoryId, description);
    const rules = await service("GET", `user_category_rules?select=target_category_id&user_id=eq.${userA.userId}&is_active=eq.true&rule_value=eq.${encodeURIComponent(description.toLowerCase())}`);
    assertEqual(rules.map((rule) => rule.target_category_id), [userA.gymCategoryId], "rule target");
  });

  test("recategorizing never touches removed rows or another user's rows", async () => {
    const description = `Posto Sol ${runId}`;
    const chosen = await createTransaction(userA, runId, { description });
    const removed = await createTransaction(userA, runId, { description });
    const foreign = await createTransaction(userB, runId, { description });
    await remove(userA, removed);
    await recategorize(userA, chosen, userA.foodCategoryId, description);
    assertEqual((await readRow(removed)).internal_category_id, null, "removed row");
    assertEqual((await readRow(foreign)).internal_category_id, null, "other user's row");
  });

  test("recategorizing rejects a category of another type, a generic value and a row that is not yours", async () => {
    const description = `Mercado Lua ${runId}`;
    const id = await createTransaction(userA, runId, { description });
    assert(!(await recategorize(userA, id, userA.incomeCategoryId, description)).ok, "an income category must be rejected");
    assert(!(await recategorize(userA, id, userA.foodCategoryId, "ab")).ok, "a too short rule value must be rejected");
    assert(!(await recategorize(userB, id, userB.foodCategoryId, description)).ok, "another user's row must be rejected");
    assertEqual((await readRow(id)).internal_category_id, null, "category after the rejections");
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
  const [signedA, signedB] = await Promise.all([signUp(`rm-a-${runId}@example.com`), signUp(`rm-b-${runId}@example.com`)]);
  const userA = await seedUser(signedA, runId, "rm-a", expenseRoot.id);
  const userB = await seedUser(signedB, runId, "rm-b", expenseRoot.id);

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
  console.error("Statement item removal suite crashed:", error);
  process.exit(1);
});
