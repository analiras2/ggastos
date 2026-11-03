import assert from "node:assert/strict";
import test from "node:test";

import {
  SELECTABLE_PAYMENT_METHODS,
  buildPaidFields,
  isFutureDate,
  paymentMethodLabel,
  resolveEntryTitle,
  settlementLabel,
} from "../../mobile/src/features/planning/paid-entry-rules.ts";
import { formatIsoDateToBrazilian } from "../../mobile/src/features/planning/planning-form-utils.ts";

test("a planned entry carries no confirmation and no payment method, even if one was picked", () => {
  assert.deepEqual(buildPaidFields("PLANNED", "PIX", "2026-11-03"), {
    status: "PLANNED",
    manuallyConfirmedAt: null,
    paymentMethod: null,
  });
});

test("a paid entry is reconciled and confirmed at midday UTC of the chosen date", () => {
  assert.deepEqual(buildPaidFields("PAID", "PIX", "2026-11-03"), {
    status: "RECONCILED",
    manuallyConfirmedAt: "2026-11-03T12:00:00Z",
    paymentMethod: "PIX",
  });
});

test("a paid entry may have no payment method", () => {
  assert.equal(buildPaidFields("PAID", null, "2026-11-03").paymentMethod, null);
});

test("the confirmation date keeps the chosen day in every time zone", () => {
  const confirmedAt = new Date(buildPaidFields("PAID", "CASH", "2026-11-03").manuallyConfirmedAt);
  for (const offsetHours of [-11, -3, 0, 5, 11]) {
    const local = new Date(confirmedAt.getTime() + offsetHours * 3_600_000);
    assert.equal(local.toISOString().slice(0, 10), "2026-11-03");
  }
});

test("credit card is not offered in the form", () => {
  assert.deepEqual([...SELECTABLE_PAYMENT_METHODS], ["CASH", "PIX", "DEBIT_TRANSFER", "OTHER"]);
});

test("the title typed by the user wins and is trimmed", () => {
  assert.equal(resolveEntryTitle("  Feira  ", "Mercado", "PAID"), "Feira");
  assert.equal(resolveEntryTitle("  Feira  ", "Mercado", "PLANNED"), "Feira");
});

test("a paid entry without a title takes the category name", () => {
  assert.equal(resolveEntryTitle("   ", "Mercado", "PAID"), "Mercado");
});

test("a planned entry without a title stays empty for the import to name", () => {
  assert.equal(resolveEntryTitle("", "Mercado", "PLANNED"), null);
});

test("the settlement label follows the kind of entry", () => {
  assert.equal(settlementLabel("INCOME"), "Já recebi");
  assert.equal(settlementLabel("EXPENSE"), "Já paguei");
  assert.equal(settlementLabel("INVESTMENT"), "Já paguei");
});

test("only a date after today is in the future", () => {
  assert.equal(isFutureDate("2026-11-04", "2026-11-03"), true);
  assert.equal(isFutureDate("2026-11-03", "2026-11-03"), false);
  assert.equal(isFutureDate("2026-11-02", "2026-11-03"), false);
});

test("payment methods have a label, including credit card, and unknown ones have none", () => {
  assert.equal(paymentMethodLabel("PIX"), "Pix");
  assert.equal(paymentMethodLabel("CREDIT_CARD"), "Cartão de crédito");
  assert.equal(paymentMethodLabel("DEBIT_TRANSFER"), "Débito/transferência");
  assert.equal(paymentMethodLabel(null), null);
  assert.equal(paymentMethodLabel("CHEQUE"), null);
});

test("an ISO date is formatted without shifting the day", () => {
  assert.equal(formatIsoDateToBrazilian("2026-11-03"), "03/11/2026");
  assert.equal(formatIsoDateToBrazilian("2026-01-01"), "01/01/2026");
});
