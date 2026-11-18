import assert from "node:assert/strict";
import test from "node:test";

import { AUTO_MATCH_THRESHOLD, scoreMatch, SUGGESTION_THRESHOLD } from "./score.ts";

const plannedEntry = (overrides = {}) => ({
  id: "entry-1",
  title: "Netflix",
  impactType: "EXPENSE",
  amountCents: 10000,
  dueDate: "2026-11-10",
  month: "2026-11",
  expectedAccountId: null,
  categoryName: "Streaming",
  ...overrides,
});

const transaction = (overrides = {}) => ({
  id: "tx-1",
  description: "NETFLIX",
  merchantName: null,
  impactType: "EXPENSE",
  amountCents: 10000,
  postedAt: "2026-11-10T00:00:00.000Z",
  competencyMonth: "2026-11",
  accountId: "account-1",
  pluggyCategoryName: null,
  ...overrides,
});

test("the thresholds keep auto-matching stricter than suggesting", () => {
  assert.ok(AUTO_MATCH_THRESHOLD > SUGGESTION_THRESHOLD);
});

test("a perfect amount, date and description match scores 1 and can auto-match", () => {
  const result = scoreMatch(transaction(), plannedEntry());

  assert.equal(result.score, 1);
  assert.ok(result.score >= AUTO_MATCH_THRESHOLD);
  assert.equal(result.amountDeltaCents, 0);
  assert.equal(result.dateDeltaDays, 0);
});

test("a different entry type never matches", () => {
  const result = scoreMatch(transaction({ impactType: "INCOME", amountCents: 9000 }), plannedEntry());

  assert.equal(result.score, 0);
  assert.equal(result.amountDeltaCents, 1000);
});

test("the amount score drops linearly and reaches zero at 20% off the plan", () => {
  assert.equal(scoreMatch(transaction({ amountCents: 11000 }), plannedEntry()).rationale.amount, 0.5);
  assert.equal(scoreMatch(transaction({ amountCents: 12000 }), plannedEntry()).rationale.amount, 0);
  assert.equal(scoreMatch(transaction({ amountCents: 30000 }), plannedEntry()).rationale.amount, 0);
});

test("the date score drops linearly and reaches zero at 10 days off the due date", () => {
  const fiveDaysLater = scoreMatch(transaction({ postedAt: "2026-11-15T00:00:00.000Z" }), plannedEntry());
  const tenDaysLater = scoreMatch(transaction({ postedAt: "2026-11-20T00:00:00.000Z" }), plannedEntry());

  assert.equal(fiveDaysLater.dateDeltaDays, 5);
  assert.equal(fiveDaysLater.rationale.date, 0.5);
  assert.equal(tenDaysLater.rationale.date, 0);
});

test("without a due date, the same competency month counts as on time and another month as far", () => {
  const sameMonth = scoreMatch(transaction(), plannedEntry({ dueDate: null }));
  const otherMonth = scoreMatch(transaction({ competencyMonth: "2026-12" }), plannedEntry({ dueDate: null }));

  assert.equal(sameMonth.rationale.date, 1);
  assert.equal(otherMonth.rationale.date, 0);
});

test("an expected account that differs lowers the score below auto-match", () => {
  const wrongAccount = scoreMatch(transaction(), plannedEntry({ expectedAccountId: "account-2" }));
  const rightAccount = scoreMatch(transaction(), plannedEntry({ expectedAccountId: "account-1" }));

  assert.ok(wrongAccount.score < AUTO_MATCH_THRESHOLD);
  assert.equal(rightAccount.score, 1);
});

test("a dimension with no signal does not penalize the score", () => {
  const withoutCategory = scoreMatch(transaction({ pluggyCategoryName: null }), plannedEntry());
  const withCategory = scoreMatch(transaction({ pluggyCategoryName: "Streaming" }), plannedEntry());

  assert.equal(withoutCategory.score, 1);
  assert.equal(withCategory.rationale.category, 1);
});

test("the description ignores case, accents and punctuation, and prefers the merchant name", () => {
  const accented = scoreMatch(
    transaction({ description: "PAG*XYZ", merchantName: "Padaria Pão Quente" }),
    plannedEntry({ title: "padaria pao quente!" }),
  );

  assert.equal(accented.rationale.description, 1);
});

test("an unrelated description scores zero", () => {
  const result = scoreMatch(transaction({ description: "UBER TRIP" }), plannedEntry());

  assert.equal(result.rationale.description, 0);
});

test("the same installment on both sides scores fully", () => {
  const result = scoreMatch(
    transaction({ description: "LOJA 2/6" }),
    plannedEntry({ title: "Loja", installmentIndex: 2, installmentTotal: 6 }),
  );

  assert.equal(result.rationale.installment, 1);
});

test("another installment of the same plan scores partially", () => {
  const result = scoreMatch(
    transaction({ statementInstallmentIndex: 3, statementInstallmentTotal: 6 }),
    plannedEntry({ title: "Loja", installmentIndex: 2, installmentTotal: 6 }),
  );

  assert.equal(result.rationale.installment, 0.35);
});

test("an installment on only one side counts against the match", () => {
  const result = scoreMatch(transaction({ description: "LOJA 2/6" }), plannedEntry({ title: "Loja" }));

  assert.equal(result.rationale.installment, 0);
  assert.ok(result.score < 1);
});

test("an impossible installment such as 7/6 is ignored", () => {
  const result = scoreMatch(transaction({ description: "LOJA 7/6" }), plannedEntry({ title: "Loja" }));

  assert.equal(result.rationale.installment, 0);
  assert.equal(result.score, 1);
});
