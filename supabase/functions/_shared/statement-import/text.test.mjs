import assert from "node:assert/strict";
import test from "node:test";

import { asNonEmptyString, sha256Hex, todayInStatementTimeZone } from "./text.ts";

test("asNonEmptyString trims text and rejects blanks and non-strings", () => {
  assert.equal(asNonEmptyString("  nubank "), "nubank");
  assert.equal(asNonEmptyString("   "), null);
  assert.equal(asNonEmptyString(""), null);
  assert.equal(asNonEmptyString(42), null);
  assert.equal(asNonEmptyString(null), null);
});

test("sha256Hex matches the known digest of a value", async () => {
  assert.equal(
    await sha256Hex("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("todayInStatementTimeZone is a YYYY-MM-DD date", () => {
  assert.match(todayInStatementTimeZone(), /^\d{4}-\d{2}-\d{2}$/);
});
