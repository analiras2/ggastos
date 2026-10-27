import assert from "node:assert/strict";
import test from "node:test";

import {
  applyPaymentStatus,
  batchPaymentStatus,
  parsePaymentStatus,
  resolvePaymentStatus,
  resolveRowStatus,
  rowStatusFor,
} from "../functions/_shared/statements/payment-status.ts";

const TODAY = "2026-10-27";

function resolve(overrides = {}) {
  return resolvePaymentStatus({ requested: null, detected: null, dueDate: null, today: TODAY, ...overrides });
}

test("rowStatusFor maps a paid statement to POSTED and an open one to PENDING", () => {
  assert.equal(rowStatusFor("PAID"), "POSTED");
  assert.equal(rowStatusFor("OPEN"), "PENDING");
});

test("parsePaymentStatus accepts only PAID and OPEN", () => {
  assert.equal(parsePaymentStatus("PAID"), "PAID");
  assert.equal(parsePaymentStatus("OPEN"), "OPEN");
  for (const value of ["paid", "MAYBE", "", null, undefined, 1]) {
    assert.equal(parsePaymentStatus(value), null);
  }
});

test("the status chosen by the user wins over everything else", () => {
  assert.deepEqual(resolve({ requested: "OPEN", detected: "PAID", dueDate: "2026-01-15" }), { status: "OPEN", source: "USER" });
  assert.deepEqual(resolve({ requested: "PAID", detected: "OPEN", dueDate: "2027-01-15" }), { status: "PAID", source: "USER" });
});

test("the status found in the file wins over the due date", () => {
  assert.deepEqual(resolve({ detected: "PAID", dueDate: "2027-01-15" }), { status: "PAID", source: "FILE" });
  assert.deepEqual(resolve({ detected: "OPEN", dueDate: "2026-01-15" }), { status: "OPEN", source: "FILE" });
});

test("a due date in the past suggests paid and one that is today or later suggests open", () => {
  assert.deepEqual(resolve({ dueDate: "2026-10-26" }), { status: "PAID", source: "DUE_DATE" });
  assert.deepEqual(resolve({ dueDate: TODAY }), { status: "OPEN", source: "DUE_DATE" });
  assert.deepEqual(resolve({ dueDate: "2027-01-15" }), { status: "OPEN", source: "DUE_DATE" });
});

test("without any information the statement is paid, as before", () => {
  assert.deepEqual(resolve(), { status: "PAID", source: "DEFAULT" });
});

test("new rows always take the chosen status", () => {
  for (const source of ["USER", "FILE", "DUE_DATE", "DEFAULT"]) {
    assert.equal(resolveRowStatus(null, "OPEN", source), "PENDING");
    assert.equal(resolveRowStatus(null, "PAID", source), "POSTED");
  }
});

test("an explicit choice by the user is applied to existing rows in both directions", () => {
  assert.equal(resolveRowStatus("POSTED", "OPEN", "USER"), "PENDING");
  assert.equal(resolveRowStatus("PENDING", "PAID", "USER"), "POSTED");
});

test("a file that says paid pays existing open rows but never reopens paid ones", () => {
  assert.equal(resolveRowStatus("PENDING", "PAID", "FILE"), "POSTED");
  assert.equal(resolveRowStatus("POSTED", "OPEN", "FILE"), "POSTED");
  assert.equal(resolveRowStatus("PENDING", "OPEN", "FILE"), "PENDING");
});

test("a suggestion or default never changes the status of existing rows", () => {
  for (const source of ["DUE_DATE", "DEFAULT"]) {
    for (const chosen of ["PAID", "OPEN"]) {
      assert.equal(resolveRowStatus("POSTED", chosen, source), "POSTED");
      assert.equal(resolveRowStatus("PENDING", chosen, source), "PENDING");
    }
  }
});

test("a batch is paid only when every row is paid", () => {
  assert.equal(batchPaymentStatus(["POSTED", "POSTED"], "OPEN"), "PAID");
  assert.equal(batchPaymentStatus(["POSTED", "PENDING"], "PAID"), "OPEN");
  assert.equal(batchPaymentStatus(["PENDING"], "PAID"), "OPEN");
});

test("a batch without rows keeps the status that was chosen", () => {
  assert.equal(batchPaymentStatus([], "OPEN"), "OPEN");
  assert.equal(batchPaymentStatus([], "PAID"), "PAID");
});

function row(fingerprint, status = "POSTED") {
  return { statement_source_fingerprint: fingerprint, status, description: fingerprint };
}

test("applyPaymentStatus gives new rows the chosen status", () => {
  const rows = applyPaymentStatus([row("a"), row("b")], new Map(), { status: "OPEN", source: "DUE_DATE" });

  assert.deepEqual(rows.map((result) => result.status), ["PENDING", "PENDING"]);
});

test("applyPaymentStatus keeps existing rows as they are when only a suggestion exists", () => {
  const existing = new Map([["a", "PENDING"], ["b", "POSTED"]]);
  const rows = applyPaymentStatus([row("a", "POSTED"), row("b", "PENDING"), row("c", "POSTED")], existing, { status: "PAID", source: "DEFAULT" });

  assert.deepEqual(rows.map((result) => result.status), ["PENDING", "POSTED", "POSTED"]);
});

test("applyPaymentStatus lets an explicit choice reopen existing rows without touching other columns", () => {
  const existing = new Map([["a", "POSTED"]]);
  const input = row("a", "POSTED");
  const [result] = applyPaymentStatus([input], existing, { status: "OPEN", source: "USER" });

  assert.equal(result.status, "PENDING");
  assert.equal(result.description, "a");
  assert.equal(input.status, "POSTED");
});
