import assert from "node:assert/strict";
import test from "node:test";

import { preserveUserEdits } from "../functions/_shared/statements/preserve-user-edits.ts";

const CATEGORY_FOOD = "00000000-0000-4000-8000-000000000001";
const CATEGORY_RULE = "00000000-0000-4000-8000-000000000002";

function row(fingerprint, overrides = {}) {
  return { statement_source_fingerprint: fingerprint, internal_category_id: null, note: null, description: fingerprint, ...overrides };
}

test("keeps the category the user already set instead of the rule result", () => {
  const existing = new Map([["a", { internal_category_id: CATEGORY_FOOD, note: null }]]);

  const [result] = preserveUserEdits([row("a", { internal_category_id: CATEGORY_RULE })], existing);

  assert.equal(result.internal_category_id, CATEGORY_FOOD);
});

test("keeps a category even when the new import would leave it empty", () => {
  const existing = new Map([["a", { internal_category_id: CATEGORY_FOOD, note: null }]]);

  assert.equal(preserveUserEdits([row("a")], existing)[0].internal_category_id, CATEGORY_FOOD);
});

test("fills an uncategorized existing row from the rules", () => {
  const existing = new Map([["a", { internal_category_id: null, note: null }]]);

  assert.equal(preserveUserEdits([row("a", { internal_category_id: CATEGORY_RULE })], existing)[0].internal_category_id, CATEGORY_RULE);
});

test("keeps the note the user wrote", () => {
  const existing = new Map([["a", { internal_category_id: null, note: "Presente da Ana" }]]);

  assert.equal(preserveUserEdits([row("a")], existing)[0].note, "Presente da Ana");
});

test("leaves new rows untouched", () => {
  const existing = new Map([["a", { internal_category_id: CATEGORY_FOOD, note: "x" }]]);
  const fresh = row("b", { internal_category_id: CATEGORY_RULE });

  assert.deepEqual(preserveUserEdits([fresh], existing), [fresh]);
});

test("does not change any other column and does not mutate the input", () => {
  const input = row("a", { internal_category_id: CATEGORY_RULE, description: "Loja" });
  const existing = new Map([["a", { internal_category_id: CATEGORY_FOOD, note: null }]]);

  const [result] = preserveUserEdits([input], existing);

  assert.equal(result.description, "Loja");
  assert.equal(input.internal_category_id, CATEGORY_RULE);
});

test("works with an empty existing map", () => {
  const rows = [row("a"), row("b")];

  assert.deepEqual(preserveUserEdits(rows, new Map()), rows);
});
