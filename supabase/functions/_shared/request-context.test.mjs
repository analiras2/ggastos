import assert from "node:assert/strict";
import test from "node:test";

import { authenticateRequest, readRequiredEnv } from "./request-context.ts";
import { isMonthKey } from "./validation.ts";
import { jsonResponse, preflightResponse, readJsonBody } from "./http.ts";

const env = new Map([
  ["SUPABASE_URL", "http://db"],
  ["SUPABASE_ANON_KEY", "anon"],
  ["SUPABASE_SERVICE_ROLE_KEY", "service"],
]);

const requestWith = (headers = {}) => new Request("http://fn", { method: "POST", headers });

function stubAuth(t, status, body = {}) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify(body), { status });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
}

test("readRequiredEnv returns the value or names the missing variable", () => {
  assert.equal(readRequiredEnv(env, "SUPABASE_URL"), "http://db");
  assert.throws(() => readRequiredEnv(env, "NOPE"), /Missing required environment variable: NOPE/);
});

test("a request without a bearer token gets a 401", async () => {
  const result = await authenticateRequest(requestWith(), env);

  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);
  assert.equal((await result.response.json()).error, "missing_authorization");
});

test("a token that Supabase does not accept gets a 401", async (t) => {
  stubAuth(t, 401);

  const result = await authenticateRequest(requestWith({ Authorization: "Bearer bad" }), env);

  assert.equal(result.ok, false);
  assert.equal((await result.response.json()).error, "invalid_token");
});

test("a valid token gives the user and the service role config", async (t) => {
  stubAuth(t, 200, { id: "user-1" });

  const result = await authenticateRequest(requestWith({ Authorization: "Bearer good" }), env);

  assert.equal(result.ok, true);
  assert.equal(result.value.user.id, "user-1");
  assert.equal(result.value.accessToken, "good");
  assert.deepEqual(result.value.restConfig, { supabaseUrl: "http://db", serviceRoleKey: "service" });
});

test("a missing setting is an error, not a 401", async () => {
  await assert.rejects(authenticateRequest(requestWith({ Authorization: "Bearer x" }), new Map()), /Missing required/);
});

test("isMonthKey accepts AAAA-MM only", () => {
  assert.equal(isMonthKey("2026-11"), true);
  assert.equal(isMonthKey("2026-13"), false);
  assert.equal(isMonthKey("2026-1"), false);
  assert.equal(isMonthKey(202611), false);
  assert.equal(isMonthKey(undefined), false);
});

test("readJsonBody returns the object or a 400", async () => {
  const good = await readJsonBody(new Request("http://fn", { method: "POST", body: '{"a":1}' }));
  const bad = await readJsonBody(new Request("http://fn", { method: "POST", body: "not json" }));

  assert.deepEqual(good, { ok: true, value: { a: 1 } });
  assert.equal(bad.ok, false);
  assert.equal(bad.response.status, 400);
});

test("the preflight advertises the method of the function", () => {
  assert.equal(preflightResponse("GET").headers.get("Access-Control-Allow-Methods"), "GET, OPTIONS");
  assert.equal(preflightResponse().status, 204);
});

test("jsonResponse sets the status and the JSON content type", async () => {
  const response = jsonResponse(201, { ok: true });

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("Content-Type"), "application/json");
  assert.deepEqual(await response.json(), { ok: true });
});
