import assert from "node:assert/strict";
import test from "node:test";

import { confirmMatch, ReconciliationDecisionError, rejectMatch, undoMatch } from "./decisions.ts";

const config = { supabaseUrl: "http://db", serviceRoleKey: "key" };
const pair = { plannedEntryId: "entry-1", transactionId: "tx-1" };

// A tiny fake database: tables answer GETs, writes are recorded.
function stubDatabase(t, { ownsPlanned = true, ownsTransaction = true, match = null, insertFails = false,
  isTitleManual = true, description = "NETFLIX.COM" } = {}) {
  const originalFetch = globalThis.fetch;
  const writes = [];

  globalThis.fetch = async (url, init = {}) => {
    const parsed = new URL(url);
    const method = init.method ?? "GET";
    const json = (body) => new Response(JSON.stringify(body));

    if (method !== "GET") {
      writes.push({ method, path: parsed.pathname, search: parsed.search, body: JSON.parse(init.body) });
      return insertFails && method === "POST" ? new Response("conflict", { status: 409 }) : new Response(null, { status: 204 });
    }
    if (parsed.pathname.endsWith("/planned_entries")) {
      const select = parsed.searchParams.get("select");
      if (select === "id") return json(ownsPlanned ? [{ id: "entry-1" }] : []);
      return json([{ id: "entry-1", is_title_manual: isTitleManual }]);
    }
    if (parsed.pathname.endsWith("/imported_transactions")) {
      const select = parsed.searchParams.get("select");
      if (select === "id") return json(ownsTransaction ? [{ id: "tx-1" }] : []);
      return json([{ description }]);
    }
    if (parsed.pathname.endsWith("/reconciliation_matches")) return json(match ? [match] : []);
    throw new Error(`Unexpected request to ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  return writes;
}

test("every decision checks that both sides belong to the user", async (t) => {
  stubDatabase(t, { ownsTransaction: false });

  for (const decide of [confirmMatch, rejectMatch, undoMatch]) {
    await assert.rejects(decide(config, "user-1", pair), (error) => {
      assert.ok(error instanceof ReconciliationDecisionError);
      assert.equal(error.code, "not_found");
      return true;
    });
  }
});

test("confirming records a manual match made by the user", async (t) => {
  const writes = stubDatabase(t);

  await confirmMatch(config, "user-1", pair);

  assert.equal(writes.length, 1);
  assert.equal(writes[0].method, "POST");
  assert.deepEqual(writes[0].body, {
    user_id: "user-1",
    planned_entry_id: "entry-1",
    imported_transaction_id: "tx-1",
    status: "MANUAL_MATCHED",
    matched_by: "USER",
  });
});

test("confirming gives an untitled planned entry the transaction's description", async (t) => {
  const writes = stubDatabase(t, { isTitleManual: false });

  await confirmMatch(config, "user-1", pair);

  const patch = writes.find((write) => write.method === "PATCH");
  assert.deepEqual(patch.body, { title: "NETFLIX.COM", is_title_manual: true });
});

test("confirming keeps a title the user wrote", async (t) => {
  const writes = stubDatabase(t, { isTitleManual: true });

  await confirmMatch(config, "user-1", pair);

  assert.equal(writes.some((write) => write.method === "PATCH"), false);
});

test("confirming a side that already has an active match is a conflict", async (t) => {
  stubDatabase(t, { insertFails: true });

  await assert.rejects(confirmMatch(config, "user-1", pair), (error) => {
    assert.equal(error.code, "already_matched");
    return true;
  });
});

test("rejecting a pair with no match yet records a rejected match", async (t) => {
  const writes = stubDatabase(t);

  await rejectMatch(config, "user-1", pair);

  assert.equal(writes[0].method, "POST");
  assert.equal(writes[0].body.status, "REJECTED");
  assert.equal(writes[0].body.matched_by, "USER");
});

test("rejecting an existing match turns it into a rejected one", async (t) => {
  const writes = stubDatabase(t, { match: { id: "match-1", status: "AUTO_MATCHED" } });

  await rejectMatch(config, "user-1", pair);

  assert.equal(writes[0].method, "PATCH");
  assert.match(writes[0].search, /id=eq\.match-1/);
  assert.equal(writes[0].body.status, "REJECTED");
});

test("rejecting twice changes nothing the second time", async (t) => {
  const writes = stubDatabase(t, { match: { id: "match-1", status: "REJECTED" } });

  await rejectMatch(config, "user-1", pair);

  assert.equal(writes.length, 0);
});

test("undoing needs an active match", async (t) => {
  stubDatabase(t);
  await assert.rejects(undoMatch(config, "user-1", pair), (error) => {
    assert.equal(error.code, "no_active_match");
    return true;
  });

  stubDatabase(t, { match: { id: "match-1", status: "REJECTED" } });
  await assert.rejects(undoMatch(config, "user-1", pair), (error) => {
    assert.equal(error.code, "no_active_match");
    return true;
  });
});

test("undoing an auto or manual match releases both sides", async (t) => {
  for (const status of ["AUTO_MATCHED", "MANUAL_MATCHED"]) {
    const writes = stubDatabase(t, { match: { id: "match-1", status } });

    await undoMatch(config, "user-1", pair);

    assert.equal(writes[0].method, "PATCH");
    assert.equal(writes[0].body.status, "UNMATCHED");
  }
});
