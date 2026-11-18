import assert from "node:assert/strict";
import test from "node:test";

import { parseDecisionRequest } from "./request.ts";

const valid = { action: "confirm", plannedEntryId: "entry-1", transactionId: "tx-1" };

test("accepts each reconciliation action", () => {
  for (const action of ["confirm", "reject", "undo"]) {
    const result = parseDecisionRequest({ ...valid, action });

    assert.equal(result.ok, true);
    assert.equal(result.value.action, action);
  }
});

test("returns the pair the decision is about", () => {
  assert.deepEqual(parseDecisionRequest(valid), { ok: true, value: valid });
});

test("rejects an unknown or missing action", () => {
  assert.equal(parseDecisionRequest({ ...valid, action: "delete" }).error, "invalid_action");
  assert.equal(parseDecisionRequest({ ...valid, action: undefined }).error, "invalid_action");
});

test("rejects a missing or empty planned entry id", () => {
  assert.equal(parseDecisionRequest({ ...valid, plannedEntryId: "" }).error, "invalid_planned_entry_id");
  assert.equal(parseDecisionRequest({ ...valid, plannedEntryId: 7 }).error, "invalid_planned_entry_id");
});

test("rejects a missing or empty transaction id", () => {
  assert.equal(parseDecisionRequest({ ...valid, transactionId: "" }).error, "invalid_transaction_id");
  assert.equal(parseDecisionRequest({ ...valid, transactionId: undefined }).error, "invalid_transaction_id");
});

test("checks the action before the ids", () => {
  assert.equal(parseDecisionRequest({}).error, "invalid_action");
});
