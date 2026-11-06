#!/usr/bin/env node
// Integration tests for entries that were already paid or received (cash, Pix, ...): the
// `payment_method` column, its constraints and how `get_month_dashboard` counts them.
//
// Run against a LOCAL Supabase stack only:
//   supabase start
//   node supabase/tests/paid-entries-suite.mjs

import { execSync } from "node:child_process";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim() || "http://127.0.0.1:54321";
const CONFIRMED_AT = "2026-11-03T12:00:00Z";

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

const userHeaders = (token) => ({ apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" });

function callRpc(token, name, params) {
  return httpJson(`${SUPABASE_URL}/rest/v1/rpc/${name}`, { method: "POST", headers: userHeaders(token), body: JSON.stringify(params) });
}

// Same calls the app makes: with the signed-in user's token, so row level security applies.
function userRest(user, method, path, payload) {
  return httpJson(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers: userHeaders(user.accessToken), body: payload ? JSON.stringify(payload) : undefined });
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
    body: JSON.stringify({ email, password: "Paid-Entries-Password-1!" }),
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

async function seedUser(user, runId, label, expenseRootId, incomeRootId) {
  await service("POST", "profiles", { id: user.userId, email: `${label}-${runId}@example.com`, display_name: label });
  const [expenseCategory] = await service("POST", "categories", {
    code: `${label}-food-${runId}`, name: `${label} food`, impact_type: "EXPENSE", parent_id: expenseRootId, user_id: user.userId,
  });
  const [incomeCategory] = await service("POST", "categories", {
    code: `${label}-salary-${runId}`, name: `${label} salary`, impact_type: "INCOME", parent_id: incomeRootId, user_id: user.userId,
  });
  return { ...user, expenseCategoryId: expenseCategory.id, incomeCategoryId: incomeCategory.id };
}

// What the add form sends for an entry that is already paid, in a single insert.
function paidEntry(owner, month, amountCents, overrides = {}) {
  return {
    user_id: owner.userId, month, title: "Paid entry", is_title_manual: true, impact_type: "EXPENSE", category_id: owner.expenseCategoryId,
    amount_cents: amountCents, due_date: `${month}-10`, status: "RECONCILED", manually_confirmed_at: CONFIRMED_AT, payment_method: "PIX", ...overrides,
  };
}

const plannedEntry = (owner, month, amountCents, overrides = {}) => ({
  user_id: owner.userId, month, title: "Planned entry", impact_type: "EXPENSE", category_id: owner.expenseCategoryId,
  amount_cents: amountCents, status: "PLANNED", ...overrides,
});

const readEntry = async (id) => (await service("GET", `planned_entries?select=status,manually_confirmed_at,payment_method&id=eq.${id}`))[0];

function buildTests({ userA, userB }) {
  const tests = [];
  const test = (name, run) => tests.push({ name, run });
  const dashboard = async (month) => {
    const response = await callRpc(userA.accessToken, "get_month_dashboard", { p_month: month });
    assert(response.ok, `expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    return response.body;
  };

  test("an entry can be created already paid, in one insert, with a payment method", async () => {
    const response = await userRest(userA, "POST", "planned_entries", paidEntry(userA, "2026-06", 4500, { payment_method: "CASH" }));
    assert(response.ok, `expected 201, got ${response.status}: ${JSON.stringify(response.body)}`);
    const stored = await readEntry(response.body[0].id);
    assertEqual([stored.status, stored.payment_method], ["RECONCILED", "CASH"], "status and method");
    assertEqual(new Date(stored.manually_confirmed_at).toISOString(), new Date(CONFIRMED_AT).toISOString(), "manually_confirmed_at");
  });

  test("every offered payment method is accepted", async () => {
    for (const method of ["CASH", "PIX", "DEBIT_TRANSFER", "OTHER"]) {
      const response = await userRest(userA, "POST", "planned_entries", paidEntry(userA, "2026-06", 100, { payment_method: method }));
      assert(response.ok, `${method}: expected 201, got ${response.status}: ${JSON.stringify(response.body)}`);
    }
  });

  test("a paid entry may have no payment method (entries confirmed before the column existed)", async () => {
    const response = await userRest(userA, "POST", "planned_entries", paidEntry(userA, "2026-06", 100, { payment_method: null }));
    assert(response.ok, `expected 201, got ${response.status}: ${JSON.stringify(response.body)}`);
  });

  test("rejects a payment method that is not offered", async () => {
    assertRejected(await userRest(userA, "POST", "planned_entries", paidEntry(userA, "2026-06", 100, { payment_method: "CHEQUE" })), "unknown method");
    assertRejected(await userRest(userA, "POST", "planned_entries", paidEntry(userA, "2026-06", 100, { payment_method: "pix" })), "lower case");
  });

  test("credit card is a valid method in the database even though the form does not offer it", async () => {
    const response = await userRest(userA, "POST", "planned_entries", paidEntry(userA, "2026-06", 100, { payment_method: "CREDIT_CARD" }));
    assert(response.ok, `expected 201, got ${response.status}: ${JSON.stringify(response.body)}`);
  });

  test("imported rows can carry a payment method, and only a known one", async () => {
    const [connection] = await service("POST", "financial_connections", {
      user_id: userA.userId, source_provider: "LEGACY", source_connection_id: `paid-conn-${userA.userId}`, institution_name: "Paid Test Bank", status: "UPDATED",
    });
    const [account] = await service("POST", "financial_accounts", {
      user_id: userA.userId, connection_id: connection.id, source_provider: "LEGACY", source_account_id: `paid-acc-${userA.userId}`,
      type: "CREDIT", subtype: "CREDIT_CARD", name: "Paid Test Card", currency_code: "BRL",
    });
    const row = (method, id) => ({
      user_id: userA.userId, connection_id: connection.id, account_id: account.id, source_provider: "LEGACY", source_transaction_id: `paid-tx-${id}-${userA.userId}`,
      posted_at: "2026-06-10T12:00:00Z", competency_month: "2026-06", description: "Method test", amount_cents: 100, currency_code: "BRL",
      status: "POSTED", direction: "DEBIT", impact_type: "EXPENSE", payment_method: method,
    });
    const stored = await service("POST", "imported_transactions", row("CREDIT_CARD", "ok"));
    assertEqual(stored[0].payment_method, "CREDIT_CARD", "stored method");
    let rejected = false;
    try {
      await service("POST", "imported_transactions", row("CHEQUE", "bad"));
    } catch (error) {
      rejected = /23514/.test(String(error));
    }
    assert(rejected, "expected the check constraint to reject an unknown payment method");
  });

  test("rejects a payment method on an entry that is still planned", async () => {
    assertRejected(await userRest(userA, "POST", "planned_entries", plannedEntry(userA, "2026-06", 100, { payment_method: "PIX" })), "planned with method");
  });

  test("undoing the confirmation must clear the payment method too", async () => {
    const created = (await userRest(userA, "POST", "planned_entries", paidEntry(userA, "2026-06", 100))).body[0];
    assertRejected(
      await userRest(userA, "PATCH", `planned_entries?id=eq.${created.id}`, { status: "PLANNED", manually_confirmed_at: null }),
      "undo that keeps the method",
    );
    const undo = await userRest(userA, "PATCH", `planned_entries?id=eq.${created.id}`, { status: "PLANNED", manually_confirmed_at: null, payment_method: null });
    assert(undo.ok, `expected 200, got ${undo.status}: ${JSON.stringify(undo.body)}`);
    assertEqual(await readEntry(created.id), { status: "PLANNED", manually_confirmed_at: null, payment_method: null }, "after undo");
  });

  test("dashboard: a paid expense enters the actuals, the balance and the category, not the commitments", async () => {
    const month = "2026-07";
    await service("POST", "planned_entries", paidEntry(userA, month, 3000));
    await service("POST", "planned_entries", plannedEntry(userA, month, 2000));
    const { summary, categories } = await dashboard(month);
    assertEqual(summary.actualExpenseCents, 3000, "actualExpenseCents");
    assertEqual(summary.currentBalanceCents, -3000, "currentBalanceCents");
    assertEqual(summary.plannedExpenseCents, 5000, "plannedExpenseCents");
    assertEqual(summary.committedRemainingCents, 2000, "only the still-planned entry is committed");
    assertEqual(categories.find((row) => row.categoryId === userA.expenseCategoryId).actualCents, 3000, "category actualCents");
  });

  test("dashboard: a received income enters the actuals and the balance", async () => {
    const month = "2026-08";
    await service("POST", "planned_entries", paidEntry(userA, month, 90000, { impact_type: "INCOME", category_id: userA.incomeCategoryId }));
    await service("POST", "planned_entries", paidEntry(userA, month, 1500, { payment_method: "CASH" }));
    const { summary } = await dashboard(month);
    assertEqual(summary.actualIncomeCents, 90000, "actualIncomeCents");
    assertEqual(summary.currentBalanceCents, 90000 - 1500, "currentBalanceCents");
  });

  test("dashboard: undoing a paid entry takes it back out of the actuals", async () => {
    const month = "2026-09";
    const entry = await service("POST", "planned_entries", paidEntry(userA, month, 2500));
    assertEqual((await dashboard(month)).summary.actualExpenseCents, 2500, "before undo");
    await userRest(userA, "PATCH", `planned_entries?id=eq.${entry[0].id}`, { status: "PLANNED", manually_confirmed_at: null, payment_method: null });
    const { summary } = await dashboard(month);
    assertEqual([summary.actualExpenseCents, summary.committedRemainingCents], [0, 2500], "after undo");
  });

  test("a paid entry is not a candidate for reconciliation with a statement row", async () => {
    const month = "2026-10";
    await service("POST", "planned_entries", paidEntry(userA, month, 700));
    const planned = await service("POST", "planned_entries", plannedEntry(userA, month, 800));
    // Same filter the reconciliation engine uses to find candidates.
    const candidates = await service("GET", `planned_entries?select=id&user_id=eq.${userA.userId}&month=eq.${month}&status=in.(PLANNED,PROJECTED)`);
    assertEqual(candidates.map((row) => row.id), [planned[0].id], "candidates");
  });

  test("a user cannot create a paid entry for another user", async () => {
    // B's own category, so the only thing wrong with the row is the owner: it must be row level security.
    const response = await userRest(userB, "POST", "planned_entries", paidEntry(userA, "2026-06", 100, { category_id: userB.expenseCategoryId }));
    assertRejected(response, "foreign insert", [401, 403]);
  });

  test("a user cannot read the paid entries of another user", async () => {
    const created = await service("POST", "planned_entries", paidEntry(userA, "2026-06", 321));
    const response = await userRest(userB, "GET", `planned_entries?select=id&id=eq.${created[0].id}`);
    assertEqual(response.body, [], "foreign read");
  });

  test("dashboard: the entry type does not follow its category, so each type gets its own category row", async () => {
    const month = "2026-11";
    const expense = await userRest(userA, "POST", "planned_entries", plannedEntry(userA, month, 3000));
    const income = await userRest(userA, "POST", "planned_entries", plannedEntry(userA, month, 700, { impact_type: "INCOME" }));
    assert(expense.ok && income.ok, `expected 201, got ${expense.status}/${income.status}`);
    const rows = (await dashboard(month)).categories.filter((row) => row.categoryId === userA.expenseCategoryId);
    assertEqual(
      rows.map((row) => [row.impactType, row.plannedCents]).sort(),
      [["EXPENSE", 3000], ["INCOME", 700]],
      "one row per entry type, never summed together",
    );
  });

  return tests;
}

async function main() {
  const runId = `${Date.now()}`.slice(-8);
  console.log(`Using SUPABASE_URL=${SUPABASE_URL}`);
  const [expenseRoot] = await service("GET", "categories?select=id&code=eq.expense");
  const [incomeRoot] = await service("GET", "categories?select=id&code=eq.income");
  if (!expenseRoot || !incomeRoot) {
    throw new Error("Expected the root `expense` and `income` categories. Run `supabase db reset` first.");
  }
  const [signedA, signedB] = await Promise.all([signUp(`paid-a-${runId}@example.com`), signUp(`paid-b-${runId}@example.com`)]);
  const userA = await seedUser(signedA, runId, "paid-a", expenseRoot.id, incomeRoot.id);
  const userB = await seedUser(signedB, runId, "paid-b", expenseRoot.id, incomeRoot.id);

  let failed = 0;
  const tests = buildTests({ userA, userB });
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
  console.error("Paid entries suite crashed:", error);
  process.exit(1);
});
