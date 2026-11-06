#!/usr/bin/env node
// Integration tests for the wallet: `wallet_settings`, `get_wallet` and `set_wallet_balance`.
// The wallet starts when the user informs their balance and follows the settled movement from
// that month on; earlier months (old statements) never change it.
//
// Run against a LOCAL Supabase stack only:
//   supabase start
//   node supabase/tests/wallet-suite.mjs

import { execSync } from "node:child_process";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim() || "http://127.0.0.1:54321";
const CONFIRMED_AT = "2026-11-03T12:00:00Z";
const CURRENT_MONTH = "2026-11";

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

const callRpc = (token, name, params) =>
  httpJson(`${SUPABASE_URL}/rest/v1/rpc/${name}`, { method: "POST", headers: userHeaders(token), body: JSON.stringify(params) });

const userRest = (user, method, path, payload) =>
  httpJson(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers: userHeaders(user.accessToken), body: payload ? JSON.stringify(payload) : undefined });

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
    body: JSON.stringify({ email, password: "Wallet-Suite-Password-1!" }),
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
  const [category] = await service("POST", "categories", {
    code: `${label}-food-${runId}`, name: `${label} food`, impact_type: "EXPENSE", parent_id: expenseRootId, user_id: user.userId,
  });
  return { ...user, categoryId: category.id };
}

// An entry that was already paid or received, as the add form saves it.
const settledEntry = (owner, month, amountCents, impactType) => ({
  user_id: owner.userId, month, title: "Settled", is_title_manual: true, impact_type: impactType, category_id: owner.categoryId,
  amount_cents: amountCents, due_date: `${month}-10`, status: "RECONCILED", manually_confirmed_at: CONFIRMED_AT, payment_method: "PIX",
});

function buildTests({ userA, userB }) {
  const tests = [];
  const test = (name, run) => tests.push({ name, run });
  const wallet = async (user) => {
    const response = await callRpc(user.accessToken, "get_wallet", { p_current_month: CURRENT_MONTH });
    assert(response.ok, `get_wallet: expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    return response.body;
  };
  const setBalance = async (user, cents) => {
    const response = await callRpc(user.accessToken, "set_wallet_balance", { p_current_month: CURRENT_MONTH, p_balance_cents: cents });
    assert(response.ok, `set_wallet_balance: expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);
    return response.body;
  };
  const addEntry = async (month, cents, type) => {
    const response = await userRest(userA, "POST", "planned_entries", settledEntry(userA, month, cents, type));
    assert(response.ok, `entry: expected 201, got ${response.status}: ${JSON.stringify(response.body)}`);
  };

  test("a user who never informed the balance has no wallet yet", async () => {
    const result = await wallet(userA);
    assertEqual([result.isConfigured, result.startsOnMonth, result.balanceCents], [false, null, 0], "wallet");
  });

  test("informing the balance makes the wallet show exactly that value, from the current month", async () => {
    await addEntry(CURRENT_MONTH, 5000, "INCOME");
    const result = await setBalance(userA, 20000);
    assertEqual([result.isConfigured, result.startsOnMonth, result.balanceCents], [true, CURRENT_MONTH, 20000], "wallet after setting");
    assertEqual(result.initialBalanceCents, 15000, "the movement already in the month is not counted twice");
  });

  test("what is paid after the start moves the wallet", async () => {
    await addEntry(CURRENT_MONTH, 3000, "EXPENSE");
    assertEqual((await wallet(userA)).balanceCents, 17000, "wallet after a paid expense");
  });

  test("old months, such as imported past statements, never change the wallet", async () => {
    await addEntry("2026-05", 99999, "EXPENSE");
    await addEntry("2026-10", 88888, "INCOME");
    assertEqual((await wallet(userA)).balanceCents, 17000, "wallet with entries before the start month");
  });

  test("adjusting the balance later keeps the start month and shows the new value", async () => {
    const result = await setBalance(userA, 12345);
    assertEqual([result.startsOnMonth, result.balanceCents], [CURRENT_MONTH, 12345], "wallet after adjusting");
  });

  test("a negative balance is allowed", async () => {
    assertEqual((await setBalance(userA, -2500)).balanceCents, -2500, "negative wallet");
  });

  test("a user does not see the wallet of another user", async () => {
    assertEqual((await wallet(userB)).isConfigured, false, "other user's wallet");
    const response = await userRest(userB, "GET", `wallet_settings?user_id=eq.${userA.userId}`);
    assertEqual(response.body, [], "rows of another user");
  });

  test("rejects an invalid month", async () => {
    const response = await callRpc(userA.accessToken, "get_wallet", { p_current_month: "2026-13" });
    assert(!response.ok, "expected an error for month 2026-13");
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
  const [signedA, signedB] = await Promise.all([signUp(`wallet-a-${runId}@example.com`), signUp(`wallet-b-${runId}@example.com`)]);
  const userA = await seedUser(signedA, runId, "wallet-a", expenseRoot.id);
  const userB = await seedUser(signedB, runId, "wallet-b", expenseRoot.id);

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
  console.error("Wallet suite crashed:", error);
  process.exit(1);
});
