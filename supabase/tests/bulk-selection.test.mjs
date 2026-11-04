import assert from "node:assert/strict";
import test from "node:test";

import {
  BulkCategorizationError,
  MAX_TRANSACTION_IDS_PER_CALL,
  chunkTransactionIds,
  collectRuleValues,
  describeBulkCategorizeError,
  runBulkCategorization,
} from "../../mobile/src/features/statements/bulk-categorization.ts";
import {
  pruneSelection,
  selectAllIds,
  selectRangeIds,
  signedAmountCents,
  sumSelectedCents,
  toggleSelection,
} from "../../mobile/src/features/statements/selection-state.ts";

const ORDERED_IDS = ["a", "b", "c", "d", "e"];

test("toggleSelection adds and removes an id without mutating the input", () => {
  const empty = new Set();
  const withA = toggleSelection(empty, "a");

  assert.deepEqual([...withA], ["a"]);
  assert.equal(empty.size, 0);
  assert.deepEqual([...toggleSelection(withA, "a")], []);
});

test("selectAllIds selects every id once", () => {
  assert.deepEqual([...selectAllIds(["a", "b", "a"])].sort(), ["a", "b"]);
});

test("selectRangeIds adds the range between the anchor and the target in either direction", () => {
  assert.deepEqual([...selectRangeIds(new Set(), ORDERED_IDS, "b", "d")].sort(), ["b", "c", "d"]);
  assert.deepEqual([...selectRangeIds(new Set(), ORDERED_IDS, "d", "b")].sort(), ["b", "c", "d"]);
  assert.deepEqual([...selectRangeIds(new Set(["a"]), ORDERED_IDS, "c", "d")].sort(), ["a", "c", "d"]);
});

test("selectRangeIds falls back to a toggle without a usable anchor", () => {
  assert.deepEqual([...selectRangeIds(new Set(), ORDERED_IDS, null, "c")], ["c"]);
  assert.deepEqual([...selectRangeIds(new Set(), ORDERED_IDS, "missing", "c")], ["c"]);
  assert.deepEqual([...selectRangeIds(new Set(["c"]), ORDERED_IDS, null, "c")], []);
});

test("pruneSelection drops ids that are no longer pending", () => {
  const selection = new Set(["a", "b", "z"]);

  assert.deepEqual([...pruneSelection(selection, ["a", "b", "c"])].sort(), ["a", "b"]);
  assert.equal(pruneSelection(selection, ["a", "b", "z"]), selection);
});

test("signedAmountCents counts credits as negative spending", () => {
  assert.equal(signedAmountCents({ id: "a", amountCents: 1000, direction: "DEBIT" }), 1000);
  assert.equal(signedAmountCents({ id: "b", amountCents: 250, direction: "CREDIT" }), -250);
});

test("sumSelectedCents adds only the selected items", () => {
  const items = [
    { id: "a", amountCents: 1000, direction: "DEBIT" },
    { id: "b", amountCents: 250, direction: "CREDIT" },
    { id: "c", amountCents: 500, direction: "DEBIT" },
  ];

  assert.equal(sumSelectedCents(items, new Set(["a", "b"])), 750);
  assert.equal(sumSelectedCents(items, new Set()), 0);
});

test("chunkTransactionIds splits at the RPC limit", () => {
  const ids = Array.from({ length: 1201 }, (_, index) => `id-${index}`);
  const chunks = chunkTransactionIds(ids);

  assert.deepEqual(chunks.map((chunk) => chunk.length), [MAX_TRANSACTION_IDS_PER_CALL, MAX_TRANSACTION_IDS_PER_CALL, 201]);
  assert.deepEqual(chunkTransactionIds([]), []);
  assert.equal(MAX_TRANSACTION_IDS_PER_CALL, 500);
});

test("collectRuleValues returns unique non-null keys in first-seen order", () => {
  const toKey = (description) => (description.length < 3 ? null : description.toLowerCase().replace(/ \d+\/\d+$/, ""));

  assert.deepEqual(collectRuleValues(["Loja A 1/3", "LOJA A 2/3", "ab", "Padaria"], toKey), ["loja a", "padaria"]);
});

function fakeCall(behaviour = () => undefined) {
  const calls = [];
  const call = async (args) => {
    calls.push(args);
    behaviour(calls.length);
    return { updatedCount: args.transactionIds.length, skippedCount: 0, rulesUpserted: args.ruleValues.length };
  };
  return { call, calls };
}

test("runBulkCategorization sends the rules only with the first chunk and sums the results", async () => {
  const ids = Array.from({ length: 1100 }, (_, index) => `id-${index}`);
  const { call, calls } = fakeCall();

  const result = await runBulkCategorization(call, { transactionIds: ids, categoryId: "cat", ruleValues: ["loja a"] });

  assert.deepEqual(result, { updatedCount: 1100, skippedCount: 0, rulesUpserted: 1 });
  assert.deepEqual(calls.map((args) => args.ruleValues), [["loja a"], [], []]);
  assert.ok(calls.every((args) => args.categoryId === "cat"));
});

test("runBulkCategorization removes repeated ids and skips the call when there is nothing to do", async () => {
  const { call, calls } = fakeCall();

  assert.deepEqual(await runBulkCategorization(call, { transactionIds: [], categoryId: "cat", ruleValues: [] }), {
    updatedCount: 0,
    skippedCount: 0,
    rulesUpserted: 0,
  });
  assert.equal(calls.length, 0);

  await runBulkCategorization(call, { transactionIds: ["a", "a", "b"], categoryId: "cat", ruleValues: [] });
  assert.deepEqual(calls[0].transactionIds, ["a", "b"]);
});

test("runBulkCategorization reports what was already saved when a later chunk fails", async () => {
  const ids = Array.from({ length: 1100 }, (_, index) => `id-${index}`);
  const { call } = fakeCall((callNumber) => {
    if (callNumber === 2) {
      throw new Error("network down");
    }
  });

  await assert.rejects(
    runBulkCategorization(call, { transactionIds: ids, categoryId: "cat", ruleValues: [] }),
    (error) => {
      assert.ok(error instanceof BulkCategorizationError);
      assert.equal(error.partialResult.updatedCount, MAX_TRANSACTION_IDS_PER_CALL);
      assert.match(error.message, /network down/);
      return true;
    },
  );
});

test("runBulkCategorization reports zero saved rows when the first chunk fails", async () => {
  const { call } = fakeCall(() => {
    throw new Error("rejected");
  });

  await assert.rejects(
    runBulkCategorization(call, { transactionIds: ["a"], categoryId: "cat", ruleValues: [] }),
    (error) => error instanceof BulkCategorizationError && error.partialResult.updatedCount === 0,
  );
});

const EMPTY_PARTIAL = { updatedCount: 0, skippedCount: 0, rulesUpserted: 0 };

test("describeBulkCategorizeError explains network failures in Portuguese", () => {
  for (const message of ["Failed to fetch", "Network request failed", "Load failed"]) {
    assert.match(describeBulkCategorizeError(new Error(message)), /Sem conexão/);
  }
});

test("describeBulkCategorizeError explains an expired session and an invalid category", () => {
  assert.match(describeBulkCategorizeError({ message: "Authentication required." }), /sessão/);
  assert.match(
    describeBulkCategorizeError({ message: "The category must be an active expense category available to you." }),
    /categoria de despesa/,
  );
});

test("describeBulkCategorizeError unwraps the cause of a BulkCategorizationError", () => {
  const error = new BulkCategorizationError("wrapped", EMPTY_PARTIAL, new Error("Failed to fetch"));

  assert.match(describeBulkCategorizeError(error), /Sem conexão/);
});

test("describeBulkCategorizeError tells how many rows were saved before a partial failure", () => {
  const partial = { updatedCount: 500, skippedCount: 0, rulesUpserted: 1 };
  const message = describeBulkCategorizeError(new BulkCategorizationError("boom", partial, new Error("Failed to fetch")));

  assert.match(message, /500 lançamentos foram salvos/);
  assert.match(message, /Sem conexão/);
});

test("describeBulkCategorizeError falls back to a generic message", () => {
  assert.equal(describeBulkCategorizeError(undefined), "Não foi possível categorizar os lançamentos.");
  assert.equal(describeBulkCategorizeError(new Error("weird")), "Não foi possível categorizar os lançamentos.");
});
