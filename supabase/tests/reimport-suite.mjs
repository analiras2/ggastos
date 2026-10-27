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

function importStatement(token, overrides = {}) {
  return httpJson(`${SUPABASE_URL}/functions/v1/import-card-statement`, {
    method: "POST",
    headers: userHeaders(token),
    body: JSON.stringify({ bank: "NUBANK", fileName: "Nubank_2026-10-15.csv", contents: CONTENTS, ...overrides }),
  });
}

function nubankContents(merchant) {
  return ["date,title,amount", `2026-09-10,${merchant} A,"10,00"`, `2026-09-11,${merchant} B,"20,00"`].join("\n");
}

function bradescoContents(merchant, situation) {
  return [
    "Data: 22/10/2026 18:07:12",
    `Situação da Fatura: ${situation}`,
    "TITULAR TESTE ;;; 1234",
    "Data;Histórico;Valor(US$);Valor(R$);",
    "15/09;SALDO ANTERIOR;0,00;100,00",
    `20/09;${merchant};0,00;10,00`,
  ].join("\n");
}

async function paymentStateOf(batchId, merchant) {
  const [batch] = await service("GET", `statement_import_batches?select=payment_status&id=eq.${batchId}`);
  const rows = await service("GET", `imported_transactions?select=status&description=like.${encodeURIComponent(merchant)}*`);
  return { batch: batch.payment_status, rows: [...new Set(rows.map((row) => row.status))].sort() };
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

  // --- payment status -------------------------------------------------------------------------
  const openFirst = await importStatement(user.accessToken, { contents: nubankContents(`Aberta${runId}`), paymentStatus: "OPEN" });
  await check("an explicit OPEN beats the due date and leaves the rows pending", async () => {
    assertEqual([openFirst.status, openFirst.body.paymentStatus, openFirst.body.paymentStatusSource], [202, "OPEN", "USER"], "response");
    assertEqual(await paymentStateOf(openFirst.body.batchId, `Aberta${runId}`), { batch: "OPEN", rows: ["PENDING"] }, "state");
  });

  const reimportSuggested = await importStatement(user.accessToken, { contents: nubankContents(`Aberta${runId}`) });
  await check("importing again without a choice does not pay an open statement", async () => {
    assertEqual([reimportSuggested.body.paymentStatus, reimportSuggested.body.paymentStatusSource], ["OPEN", "DUE_DATE"], "response");
    assertEqual(await paymentStateOf(reimportSuggested.body.batchId, `Aberta${runId}`), { batch: "OPEN", rows: ["PENDING"] }, "state");
  });

  const reimportPaid = await importStatement(user.accessToken, { contents: nubankContents(`Aberta${runId}`), paymentStatus: "PAID" });
  await check("an explicit PAID pays the rows that already exist", async () => {
    assertEqual(await paymentStateOf(reimportPaid.body.batchId, `Aberta${runId}`), { batch: "PAID", rows: ["POSTED"] }, "state");
  });

  const reimportQuiet = await importStatement(user.accessToken, { contents: nubankContents(`Aberta${runId}`) });
  await check("importing a paid statement again without a choice never reopens it", async () => {
    assertEqual(await paymentStateOf(reimportQuiet.body.batchId, `Aberta${runId}`), { batch: "PAID", rows: ["POSTED"] }, "state");
  });

  const reimportReopen = await importStatement(user.accessToken, { contents: nubankContents(`Aberta${runId}`), paymentStatus: "OPEN" });
  await check("an explicit OPEN reopens a paid statement", async () => {
    assertEqual(await paymentStateOf(reimportReopen.body.batchId, `Aberta${runId}`), { batch: "OPEN", rows: ["PENDING"] }, "state");
  });

  const future = await importStatement(user.accessToken, { fileName: "Nubank_2027-01-15.csv", contents: nubankContents(`Futura${runId}`) });
  await check("a Nubank file with a future due date is suggested as open", async () => {
    assertEqual([future.body.paymentStatus, future.body.paymentStatusSource], ["OPEN", "DUE_DATE"], "response");
    assertEqual(await paymentStateOf(future.body.batchId, `Futura${runId}`), { batch: "OPEN", rows: ["PENDING"] }, "state");
  });

  const bradescoPaid = await importStatement(user.accessToken, { bank: "BRADESCO", fileName: "Bradesco_x.csv", contents: bradescoContents(`Pago${runId}`, "PAGO") });
  await check("a Bradesco file that says PAGO is imported as paid", async () => {
    assertEqual([bradescoPaid.status, bradescoPaid.body.paymentStatus, bradescoPaid.body.paymentStatusSource], [202, "PAID", "FILE"], "response");
    assertEqual(await paymentStateOf(bradescoPaid.body.batchId, `Pago${runId}`), { batch: "PAID", rows: ["POSTED"] }, "state");
  });

  const bradescoOpen = await importStatement(user.accessToken, { bank: "BRADESCO", fileName: "Bradesco_y.csv", contents: bradescoContents(`Fechada${runId}`, "ABERTA") });
  await check("a Bradesco file that is not paid is imported as open", async () => {
    assertEqual([bradescoOpen.body.paymentStatus, bradescoOpen.body.paymentStatusSource], ["OPEN", "FILE"], "response");
  });

  const bradescoNowPaid = await importStatement(user.accessToken, { bank: "BRADESCO", fileName: "Bradesco_y.csv", contents: bradescoContents(`Fechada${runId}`, "PAGO") });
  await check("downloading the Bradesco file again after paying it pays the open rows", async () => {
    assertEqual(await paymentStateOf(bradescoNowPaid.body.batchId, `Fechada${runId}`), { batch: "PAID", rows: ["POSTED"] }, "state");
  });

  const invalid = await importStatement(user.accessToken, { contents: nubankContents(`Invalida${runId}`), paymentStatus: "MAYBE" });
  await check("an invalid paymentStatus is rejected", async () => {
    assertEqual([invalid.status, invalid.body.error], [400, "invalid_payment_status"], "response");
  });

  const failed = results.filter((passed) => !passed).length;
  console.log(`\n${results.length - failed}/${results.length} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Reimport suite crashed:", error);
  process.exit(1);
});
