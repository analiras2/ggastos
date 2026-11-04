#!/usr/bin/env node
// Integration tests for bulk categorization: the `categorize_imported_transactions` RPC, the
// `normalize_rule_value` function and the unique index on active category rules.
//
// Run against a LOCAL Supabase stack only (fixtures are written with the local service-role key):
//   supabase start
//   node supabase/tests/bulk-categorization-suite.mjs
//
// Node 24+ (it imports the TypeScript merchant-key module directly).

import { execSync } from "node:child_process";

import { normalizeMerchantText } from "../functions/_shared/statements/merchant-key.ts";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim() || "http://127.0.0.1:54321";
const MAX_TRANSACTION_IDS = 500;

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

function authHeaders(token) {
  return { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function callRpc(token, name, params) {
  return httpJson(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(params),
  });
}

async function service(method, path, payload) {
  const response = await httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
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
    body: JSON.stringify({ email, password: "Bulk-Test-Password-1!" }),
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

// A rejection must come from the function itself: 404 means the function does not exist.
function assertRejected(response, label, allowedStatuses = [400]) {
  assert(
    allowedStatuses.includes(response.status),
    `${label}: expected status ${allowedStatuses.join("/")}, got ${response.status}: ${JSON.stringify(response.body)}`,
  );
}

function assertEqual(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function seedUser(user, runId, label, expenseRootId) {
  await service("POST", "profiles", { id: user.userId, email: `${label}-${runId}@example.com`, display_name: label });
  const [connection] = await service("POST", "financial_connections", {
    user_id: user.userId, source_provider: "LEGACY", source_connection_id: `${label}-conn-${runId}`,
    institution_name: "Bulk Test Bank", status: "UPDATED",
  });
  const [account] = await service("POST", "financial_accounts", {
    user_id: user.userId, connection_id: connection.id, source_provider: "LEGACY",
    source_account_id: `${label}-acc-${runId}`, type: "BANK", subtype: "CHECKING_ACCOUNT",
    name: "Bulk Test Account", currency_code: "BRL",
  });
  const makeCategory = async (suffix, impactType, isActive = true) => {
    const [category] = await service("POST", "categories", {
      code: `${label}-${suffix}-${runId}`, name: `${label} ${suffix}`, impact_type: impactType,
      parent_id: expenseRootId, user_id: user.userId, is_active: isActive,
    });
    return category.id;
  };
  return {
    ...user,
    connectionId: connection.id,
    accountId: account.id,
    expenseCategoryId: await makeCategory("expense", "EXPENSE"),
    otherExpenseCategoryId: await makeCategory("expense-2", "EXPENSE"),
    incomeCategoryId: await makeCategory("income", "INCOME"),
    inactiveCategoryId: await makeCategory("inactive", "EXPENSE", false),
  };
}

let transactionCounter = 0;

async function createTransactions(owner, runId, count, overrides = {}) {
  const rows = Array.from({ length: count }, () => {
    transactionCounter += 1;
    return {
      user_id: owner.userId, connection_id: owner.connectionId, account_id: owner.accountId,
      source_provider: "LEGACY", source_transaction_id: `tx-${runId}-${transactionCounter}`,
      posted_at: "2026-07-10T12:00:00Z", competency_month: "2026-07", description: `Test purchase ${transactionCounter}`,
      amount_cents: 1000, currency_code: "BRL", status: "POSTED", direction: "DEBIT", impact_type: "EXPENSE",
      ...overrides,
    };
  });
  const created = await service("POST", "imported_transactions", rows);
  return created.map((row) => row.id);
}

async function readCategories(ids) {
  const rows = await service("GET", `imported_transactions?select=id,internal_category_id&id=in.(${ids.join(",")})`);
  return new Map(rows.map((row) => [row.id, row.internal_category_id]));
}

async function activeRules(userId, value) {
  return service(
    "GET",
    `user_category_rules?select=id,rule_value,target_category_id&user_id=eq.${userId}&is_active=eq.true&rule_value=eq.${encodeURIComponent(value)}`,
  );
}

function buildTests({ userA, userB, runId }) {
  const tests = [];
  const test = (name, run) => tests.push({ name, run });
  const categorize = (user, ids, categoryId, ruleValues) =>
    callRpc(user.accessToken, "categorize_imported_transactions", {
      p_transaction_ids: ids,
      p_category_id: categoryId,
      ...(ruleValues ? { p_rule_values: ruleValues } : {}),
    });

  test("updates only pending visible rows and reports counts", async () => {
    const pending = await createTransactions(userA, runId, 3);
    const [alreadyCategorized] = await createTransactions(userA, runId, 1, { internal_category_id: userA.otherExpenseCategoryId });
    const [hidden] = await createTransactions(userA, runId, 1, { is_hidden_from_budget: true });
    const response = await categorize(userA, [...pending, alreadyCategorized, hidden], userA.expenseCategoryId);
    assert(response.ok, `expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    assertEqual(response.body, [{ updated_count: 3, skipped_count: 2, rules_upserted: 0 }], "counts");
    const categories = await readCategories([...pending, alreadyCategorized, hidden]);
    assert(pending.every((id) => categories.get(id) === userA.expenseCategoryId), "pending rows must be categorized");
    assertEqual(categories.get(alreadyCategorized), userA.otherExpenseCategoryId, "already categorized row");
    assertEqual(categories.get(hidden), null, "hidden row");
  });

  test("counts a repeated id only once", async () => {
    const [id] = await createTransactions(userA, runId, 1);
    const response = await categorize(userA, [id, id], userA.expenseCategoryId);
    assertEqual(response.body, [{ updated_count: 1, skipped_count: 0, rules_upserted: 0 }], "counts");
  });

  test("never touches another user's transactions", async () => {
    const ids = await createTransactions(userA, runId, 2);
    const response = await categorize(userB, ids, userB.expenseCategoryId);
    assert(response.ok, `expected 200, got ${response.status}`);
    assertEqual(response.body, [{ updated_count: 0, skipped_count: 2, rules_upserted: 0 }], "counts");
    const categories = await readCategories(ids);
    assert(ids.every((id) => categories.get(id) === null), "user A's rows must stay uncategorized");
  });

  test("rejects an income category", async () => {
    const [id] = await createTransactions(userA, runId, 1);
    const response = await categorize(userA, [id], userA.incomeCategoryId);
    assertRejected(response, "income category");
    assertEqual((await readCategories([id])).get(id), null, "row");
  });

  test("rejects an inactive category", async () => {
    const [id] = await createTransactions(userA, runId, 1);
    assertRejected(await categorize(userA, [id], userA.inactiveCategoryId), "inactive category");
  });

  test("rejects another user's private category", async () => {
    const [id] = await createTransactions(userA, runId, 1);
    assertRejected(await categorize(userA, [id], userB.expenseCategoryId), "foreign category");
  });

  test("rejects an empty list and a list above the limit", async () => {
    assertRejected(await categorize(userA, [], userA.expenseCategoryId), "empty list");
    const tooMany = Array.from({ length: MAX_TRANSACTION_IDS + 1 }, () => crypto.randomUUID());
    assertRejected(await categorize(userA, tooMany, userA.expenseCategoryId), "oversized list");
  });

  test("rejects calls without a signed-in user", async () => {
    const [id] = await createTransactions(userA, runId, 1);
    const response = await categorize({ accessToken: ANON_KEY }, [id], userA.expenseCategoryId);
    assertRejected(response, "anonymous role", [401, 403]);
  });

  test("creates one normalized rule and updates it on a later call", async () => {
    const [first] = await createTransactions(userA, runId, 1);
    const [second] = await createTransactions(userA, runId, 1);
    const value = `Café da Ana ${runId} 3/10`;
    const created = await categorize(userA, [first], userA.expenseCategoryId, [value]);
    assertEqual(created.body[0].rules_upserted, 1, "first call rules_upserted");
    const key = normalizeMerchantText(value);
    const [rule] = await activeRules(userA.userId, key);
    assert(rule && rule.target_category_id === userA.expenseCategoryId, "rule must exist with the first category");

    const updated = await categorize(userA, [second], userA.otherExpenseCategoryId, [`CAFE DA ANA ${runId} 4/10`]);
    assertEqual(updated.body[0].rules_upserted, 1, "second call rules_upserted");
    const rules = await activeRules(userA.userId, key);
    assertEqual(rules.length, 1, "number of active rules");
    assertEqual(rules[0].target_category_id, userA.otherExpenseCategoryId, "rule target");
  });

  test("rolls everything back when a rule value is invalid", async () => {
    const [id] = await createTransactions(userA, runId, 1);
    const response = await categorize(userA, [id], userA.expenseCategoryId, ["ab"]);
    assertRejected(response, "too short rule value");
    assertEqual((await readCategories([id])).get(id), null, "row after rollback");
  });

  test("the unique index blocks equivalent active rules but allows inactive ones", async () => {
    const base = { user_id: userA.userId, rule_type: "DESCRIPTION_CONTAINS", target_category_id: userA.expenseCategoryId, priority: 0 };
    await service("POST", "user_category_rules", { ...base, rule_value: `loja unica ${runId}` });
    let duplicateRejected = false;
    try {
      await service("POST", "user_category_rules", { ...base, rule_value: `LOJA ÚNICA ${runId} 3/10`.replace("Ú", "U") });
    } catch (error) {
      duplicateRejected = /409|23505/.test(String(error));
    }
    assert(duplicateRejected, "expected an equivalent active rule to violate the unique index");
    await service("POST", "user_category_rules", { ...base, rule_value: `loja unica ${runId}`, is_active: false });
  });

  test("normalize_rule_value matches the TypeScript normalizeMerchantText", async () => {
    const samples = [
      "Netflix.com", "  CAFÉ   da  Ana 3/10 ", "Jim.Com* Enos Massare - Parcela 4/10", "LOJA XYZ 10/12",
      "LOJA XYZ10/12", "MP*UBER TRIP", "MP *Loja Legal 2/3", "IFD*RESTAURANTE X", "PICPAY*Padaria",
      "UBER *TRIP", "Compra em 10/12/2025", "PIX", "3/10", "Pão de Açúcar", "Ñandú Bar",
    ];
    for (const sample of samples) {
      const response = await callRpc(userA.accessToken, "normalize_rule_value", { p_value: sample });
      assert(response.ok, `normalize_rule_value failed for ${JSON.stringify(sample)}: ${response.status}`);
      assertEqual(response.body, normalizeMerchantText(sample), `normalize_rule_value(${JSON.stringify(sample)})`);
    }
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
  const [signedA, signedB] = await Promise.all([signUp(`bulk-a-${runId}@example.com`), signUp(`bulk-b-${runId}@example.com`)]);
  const userA = await seedUser(signedA, runId, "bulk-a", expenseRoot.id);
  const userB = await seedUser(signedB, runId, "bulk-b", expenseRoot.id);

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
  console.error("Bulk categorization suite crashed:", error);
  process.exit(1);
});
