#!/usr/bin/env node
// Integration test: importing the same statement again must not undo what the user did.
//
// Needs a LOCAL stack with the Edge Function served:
//   supabase start
//   supabase functions serve import-card-statement   # in another terminal
//   node supabase/tests/reimport-suite.mjs

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

const userHeaders = (token) => ({ apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
const serviceHeaders = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

async function service(method, path, payload) {
  const response = await httpJson(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: serviceHeaders,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Service-role ${method} ${path} failed (${response.status}): ${JSON.stringify(response.body)}`);
  }
  return response.body;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const CONTENTS = [
  "date,title,amount",
  '2026-09-10,Padaria Central,"12,50"',
  '2026-09-11,Mercado Bom Preco,"84,30"',
  '2026-09-12,Loja Parcelada - Parcela 2/3,"50,00"',
].join("\n");

async function signUp(email) {
  const response = await httpJson(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Reimport-Test-Password-1!" }),
  });
  if (!response.ok || !response.body?.access_token) {
    throw new Error(`Signup failed: ${JSON.stringify(response.body)}`);
  }
  return { userId: response.body.user.id, accessToken: response.body.access_token };
}

function importStatement(token) {
  return httpJson(`${SUPABASE_URL}/functions/v1/import-card-statement`, {
    method: "POST",
    headers: userHeaders(token),
    body: JSON.stringify({ bank: "NUBANK", fileName: "Nubank_2026-10-15.csv", contents: CONTENTS }),
  });
}

async function readRows(userId) {
  const rows = await service(
    "GET",
    `imported_transactions?select=description,internal_category_id,note,competency_month,statement_installment_index&user_id=eq.${userId}&order=posted_at`,
  );
  return new Map(rows.map((row) => [row.description, row]));
}

async function main() {
  const runId = `${Date.now()}`.slice(-8);
  const user = await signUp(`reimport-${runId}@example.com`);
  await service("POST", "profiles", { id: user.userId, email: `reimport-${runId}@example.com`, display_name: "Reimport test" });
  const [expenseRoot] = await service("GET", "categories?select=id&code=eq.expense");
  const makeCategory = async (suffix) =>
    (await service("POST", "categories", {
      code: `reimport-${suffix}-${runId}`, name: `Reimport ${suffix}`, impact_type: "EXPENSE", parent_id: expenseRoot.id, user_id: user.userId,
    }))[0].id;
  const userCategory = await makeCategory("chosen");
  const ruleCategory = await makeCategory("rule");
  const results = [];

  const check = async (name, run) => {
    try {
      await run();
      results.push(true);
      console.log(`PASS  ${name}`);
    } catch (error) {
      results.push(false);
      console.log(`FAIL  ${name}\n      ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const first = await importStatement(user.accessToken);
  await check("first import creates the rows", async () => {
    assertEqual(first.status, 202, "status");
    assertEqual([first.body.rowsImported, first.body.rowsDuplicated], [3, 0], "[imported, duplicated]");
  });

  await check("installments use the invoice month and single purchases keep their own", async () => {
    const rows = await readRows(user.userId);
    assertEqual(rows.get("Loja Parcelada - Parcela 2/3").competency_month, "2026-10", "installment");
    assertEqual(rows.get("Padaria Central").competency_month, "2026-09", "single purchase");
  });

  // The user categorizes two rows and writes a note, then a rule appears for a third merchant.
  const before = await readRows(user.userId);
  assert(before.size === 3, "expected three imported rows");
  await service("PATCH", `imported_transactions?user_id=eq.${user.userId}&description=eq.Padaria%20Central`, { internal_category_id: userCategory, note: "minha nota" });
  await service("PATCH", `imported_transactions?user_id=eq.${user.userId}&description=eq.Mercado%20Bom%20Preco`, { internal_category_id: userCategory });
  await service("POST", "user_category_rules", { user_id: user.userId, rule_type: "DESCRIPTION_CONTAINS", rule_value: "padaria", target_category_id: ruleCategory, priority: 0 });
  await service("POST", "user_category_rules", { user_id: user.userId, rule_type: "DESCRIPTION_CONTAINS", rule_value: "loja parcelada", target_category_id: ruleCategory, priority: 0 });

  const second = await importStatement(user.accessToken);
  const after = await readRows(user.userId);

  await check("second import reports every row as already imported", async () => {
    assertEqual(second.status, 202, "status");
    assertEqual([second.body.rowsImported, second.body.rowsDuplicated], [0, 3], "[imported, duplicated]");
    assertEqual(after.size, 3, "number of rows");
  });

  await check("a category chosen by the user survives, even when a rule disagrees", async () => {
    assertEqual(after.get("Padaria Central").internal_category_id, userCategory, "Padaria Central");
    assertEqual(after.get("Mercado Bom Preco").internal_category_id, userCategory, "Mercado Bom Preco");
  });

  await check("the note written by the user survives", async () => {
    assertEqual(after.get("Padaria Central").note, "minha nota", "note");
  });

  await check("an uncategorized row is still filled by the rules", async () => {
    assertEqual(after.get("Loja Parcelada - Parcela 2/3").internal_category_id, ruleCategory, "Loja Parcelada");
  });

  const failed = results.filter((passed) => !passed).length;
  console.log(`\n${results.length - failed}/${results.length} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Reimport suite crashed:", error);
  process.exit(1);
});
