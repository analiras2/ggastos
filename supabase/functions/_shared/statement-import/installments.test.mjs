import assert from "node:assert/strict";
import test from "node:test";

import { planFutureInstallments } from "./installments.ts";

const config = { supabaseUrl: "http://db", serviceRoleKey: "key" };

function stubFetch(t, handler) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return handler();
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  return calls;
}

test("returns how many installments the RPC planned", async (t) => {
  const calls = stubFetch(t, () => new Response("5"));

  const created = await planFutureInstallments(config, "user-1", "batch-1");

  assert.equal(created, 5);
  assert.match(calls[0].url, /\/rest\/v1\/rpc\/plan_future_installments$/);
  assert.deepEqual(JSON.parse(calls[0].init.body), { p_user_id: "user-1", p_batch_id: "batch-1" });
});

test("counts zero when the RPC answers with something that is not a number", async (t) => {
  stubFetch(t, () => new Response('{"unexpected":true}'));

  assert.equal(await planFutureInstallments(config, "user-1", "batch-1"), 0);
});

test("a failure is logged and does not fail the import", async (t) => {
  stubFetch(t, () => new Response("boom", { status: 500 }));
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => logged.push(args);
  t.after(() => {
    console.error = originalError;
  });

  assert.equal(await planFutureInstallments(config, "user-1", "batch-1"), 0);
  assert.equal(logged.length, 1);
});
