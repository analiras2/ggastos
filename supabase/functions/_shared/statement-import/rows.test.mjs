import assert from "node:assert/strict";
import test from "node:test";

import { buildImportedTransactions, upsertStatementTransactions } from "./rows.ts";
import { sha256Hex } from "./text.ts";

const CATEGORY_ID = "00000000-0000-4000-8000-000000000001";

const context = (overrides = {}) => ({
  userId: "user-1",
  connectionId: "connection-1",
  accountId: "account-1",
  batchId: "batch-1",
  bank: "NUBANK",
  now: "2026-11-05T10:00:00.000Z",
  rowStatus: "POSTED",
  categoryRules: [],
  ...overrides,
});

const transaction = (overrides = {}) => ({
  sourceRowNumber: 2,
  section: "CURRENT_INVOICE",
  postedAt: "2026-11-03",
  competencyMonth: "2026-11",
  description: "Netflix.com",
  descriptionRaw: "Netflix.com",
  amountCents: 5590,
  currencyCode: "BRL",
  direction: "DEBIT",
  impactType: "EXPENSE",
  installment: null,
  defaultImportMode: "IMPORT",
  fingerprintInput: "nubank|2026-11-03|netflix|5590|1",
  raw: { title: "Netflix.com" },
  ...overrides,
});

const parsed = (transactions) => ({ transactions });

test("rows that the parser marked to skip are never imported", async () => {
  const rows = await buildImportedTransactions(
    parsed([transaction(), transaction({ defaultImportMode: "SKIP", fingerprintInput: "other" })]),
    context(),
  );

  assert.equal(rows.length, 1);
});

test("an imported row carries the batch, the bank and the owner", async () => {
  const [row] = await buildImportedTransactions(parsed([transaction()]), context());

  assert.equal(row.user_id, "user-1");
  assert.equal(row.statement_import_batch_id, "batch-1");
  assert.equal(row.statement_source_bank, "NUBANK");
  assert.equal(row.source_provider, "CARD_STATEMENT");
  assert.equal(row.payment_method, "CREDIT_CARD");
  assert.equal(row.amount_cents, 5590);
  assert.equal(row.status, "POSTED");
});

test("the fingerprint is the SHA-256 of the row's input, so a re-import maps to the same row", async () => {
  const [first] = await buildImportedTransactions(parsed([transaction()]), context());
  const [again] = await buildImportedTransactions(parsed([transaction()]), context({ batchId: "batch-2" }));
  const expected = await sha256Hex("nubank|2026-11-03|netflix|5590|1");

  assert.equal(first.statement_source_fingerprint, expected);
  assert.equal(first.source_transaction_id, `NUBANK:${expected}`);
  assert.equal(again.source_transaction_id, first.source_transaction_id);
});

test("a different row input gets a different fingerprint", async () => {
  const rows = await buildImportedTransactions(
    parsed([transaction(), transaction({ fingerprintInput: "nubank|2026-11-03|netflix|5590|2" })]),
    context(),
  );

  assert.notEqual(rows[0].source_transaction_id, rows[1].source_transaction_id);
});

test("only rows in IMPORT mode count toward the budget", async () => {
  const rows = await buildImportedTransactions(
    parsed([transaction(), transaction({ defaultImportMode: "PREVIEW_ONLY", fingerprintInput: "preview" })]),
    context(),
  );

  assert.equal(rows[0].is_hidden_from_budget, false);
  assert.equal(rows[1].is_hidden_from_budget, true);
});

test("the category comes from the user's rules", async () => {
  const rules = [
    { ruleType: "DESCRIPTION_CONTAINS", ruleValue: "netflix", targetCategoryId: CATEGORY_ID, priority: 10 },
  ];
  const [categorized] = await buildImportedTransactions(parsed([transaction()]), context({ categoryRules: rules }));
  const [plain] = await buildImportedTransactions(parsed([transaction()]), context());

  assert.equal(categorized.internal_category_id, CATEGORY_ID);
  assert.equal(plain.internal_category_id, null);
});

test("the installment of a purchase is stored on the row", async () => {
  const [row] = await buildImportedTransactions(
    parsed([transaction({ installment: { index: 2, total: 6 } })]),
    context(),
  );
  const [single] = await buildImportedTransactions(parsed([transaction()]), context());

  assert.equal(row.statement_installment_index, 2);
  assert.equal(row.statement_installment_total, 6);
  assert.equal(single.statement_installment_index, null);
});

test("upsertStatementTransactions does not call the API when there is nothing to save", async (t) => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("[]");
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const saved = await upsertStatementTransactions({ supabaseUrl: "http://db", serviceRoleKey: "key" }, []);

  assert.equal(saved, 0);
  assert.equal(called, false);
});

test("upsertStatementTransactions merges on the idempotency key and returns how many rows were saved", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify([{ id: "a" }, { id: "b" }]), { status: 201 });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const saved = await upsertStatementTransactions({ supabaseUrl: "http://db", serviceRoleKey: "key" }, [
    { id: 1 },
    { id: 2 },
  ]);

  assert.equal(saved, 2);
  assert.match(calls[0].url, /on_conflict=user_id,source_provider,source_transaction_id/);
  assert.equal(calls[0].init.headers.Prefer, "resolution=merge-duplicates,return=representation");
});
