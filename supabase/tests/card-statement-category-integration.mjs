#!/usr/bin/env node

import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const supabaseUrl = "http://127.0.0.1:54321";

function readStatusValue(name) {
  const output = execSync("supabase status -o env", { encoding: "utf8" });
  const match = output.match(new RegExp(`^${name}="?([^"\\n]+)"?$`, "m"));
  if (!match) {
    throw new Error(`Could not read ${name} from Supabase local status.`);
  }

  return match[1];
}

async function json(url, init) {
  const response = await fetch(url, init);
  const body = await response.json();
  return { response, body };
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

const anonKey = readStatusValue("ANON_KEY");
const serviceRoleKey = readStatusValue("SERVICE_ROLE_KEY");
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = `statement-category-${suffix}@example.com`;
const password = "LocalStatementCategory123!";

const { response: signUpResponse, body: signUp } = await json(`${supabaseUrl}/auth/v1/signup`, {
  method: "POST",
  headers: { apikey: anonKey, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
assert.equal(signUpResponse.status, 200, JSON.stringify(signUp));

const userId = signUp.user.id;
const accessToken = signUp.access_token;
assert.ok(userId);
assert.ok(accessToken);

const { response: profileResponse, body: profile } = await json(`${supabaseUrl}/rest/v1/profiles`, {
  method: "POST",
  headers: { ...headers(serviceRoleKey), Prefer: "return=representation" },
  body: JSON.stringify({ id: userId, email, display_name: "Statement Category Test" }),
});
assert.equal(profileResponse.status, 201, JSON.stringify(profile));

const { response: categoryResponse, body: categories } = await json(
  `${supabaseUrl}/rest/v1/categories?select=id&code=eq.food`,
  { headers: headers(serviceRoleKey) },
);
assert.equal(categoryResponse.status, 200, JSON.stringify(categories));
assert.equal(categories.length, 1);

const { response: ruleResponse, body: rule } = await json(`${supabaseUrl}/rest/v1/user_category_rules`, {
  method: "POST",
  headers: { ...headers(accessToken), Prefer: "return=representation" },
  body: JSON.stringify({
    user_id: userId,
    rule_type: "DESCRIPTION_CONTAINS",
    rule_value: "cafe jardim",
    target_category_id: categories[0].id,
    priority: 0,
  }),
});
assert.equal(ruleResponse.status, 201, JSON.stringify(rule));

const contents = await readFile(
  new URL("../../.specs/features/card-statement-import/fixtures/nubank-statement-sanitized.csv", import.meta.url),
  "utf8",
);
const { response: importResponse, body: imported } = await json(
  `${supabaseUrl}/functions/v1/import-card-statement`,
  {
    method: "POST",
    headers: headers(accessToken),
    body: JSON.stringify({
      bank: "NUBANK",
      fileName: "nubank-statement-sanitized.csv",
      contents,
      invoiceMonth: "2026-02",
    }),
  },
);
assert.equal(importResponse.status, 202, JSON.stringify(imported));

const { response: transactionsResponse, body: transactions } = await json(
  `${supabaseUrl}/rest/v1/imported_transactions?select=internal_category_id,source_provider,source_transaction_id,pluggy_transaction_id&user_id=eq.${userId}&description=eq.Cafe%20Jardim`,
  { headers: headers(accessToken) },
);
assert.equal(transactionsResponse.status, 200, JSON.stringify(transactions));
assert.equal(transactions.length, 2);
for (const transaction of transactions) {
  assert.equal(transaction.internal_category_id, categories[0].id);
  assert.equal(transaction.source_provider, "CARD_STATEMENT");
  assert.match(transaction.source_transaction_id, /^NUBANK:/);
  assert.equal(transaction.pluggy_transaction_id, null);
}

console.log("PASS card statement category and source identity integration");

const matchedEmail = `statement-match-${suffix}@example.com`;
const { response: matchedSignUpResponse, body: matchedSignUp } = await json(`${supabaseUrl}/auth/v1/signup`, {
  method: "POST",
  headers: { apikey: anonKey, "Content-Type": "application/json" },
  body: JSON.stringify({ email: matchedEmail, password }),
});
assert.equal(matchedSignUpResponse.status, 200, JSON.stringify(matchedSignUp));

const matchedUserId = matchedSignUp.user.id;
const matchedAccessToken = matchedSignUp.access_token;
await json(`${supabaseUrl}/rest/v1/profiles`, {
  method: "POST",
  headers: { ...headers(serviceRoleKey), Prefer: "return=representation" },
  body: JSON.stringify({ id: matchedUserId, email: matchedEmail }),
});

const { body: matchedConnections } = await json(`${supabaseUrl}/rest/v1/financial_connections`, {
  method: "POST",
  headers: { ...headers(serviceRoleKey), Prefer: "return=representation" },
  body: JSON.stringify({
    user_id: matchedUserId,
    source_provider: "CARD_STATEMENT",
    source_connection_id: "NUBANK",
    institution_name: "Nubank Card Statement",
    status: "UPDATED",
  }),
});
const { body: matchedAccounts } = await json(`${supabaseUrl}/rest/v1/financial_accounts`, {
  method: "POST",
  headers: { ...headers(serviceRoleKey), Prefer: "return=representation" },
  body: JSON.stringify({
    user_id: matchedUserId,
    connection_id: matchedConnections[0].id,
    source_provider: "CARD_STATEMENT",
    source_account_id: "NUBANK:CREDIT_CARD",
    type: "CREDIT",
    subtype: "CREDIT_CARD",
    name: "Nubank Credit Card",
    currency_code: "BRL",
  }),
});
const { body: matchedTransactions } = await json(`${supabaseUrl}/rest/v1/imported_transactions`, {
  method: "POST",
  headers: { ...headers(serviceRoleKey), Prefer: "return=representation" },
  body: JSON.stringify({
    user_id: matchedUserId,
    connection_id: matchedConnections[0].id,
    account_id: matchedAccounts[0].id,
    source_provider: "CARD_STATEMENT",
    source_transaction_id: `NUBANK:matched-${suffix}`,
    posted_at: "2026-02-22T12:00:00Z",
    competency_month: "2026-02",
    description: "Cafe Jardim",
    amount_cents: 1000,
    currency_code: "BRL",
    status: "POSTED",
    direction: "DEBIT",
    impact_type: "EXPENSE",
  }),
});
const { body: matchedPlans } = await json(`${supabaseUrl}/rest/v1/planned_entries`, {
  method: "POST",
  headers: { ...headers(serviceRoleKey), Prefer: "return=representation" },
  body: JSON.stringify({
    user_id: matchedUserId,
    month: "2026-02",
    title: "Cafe Jardim",
    impact_type: "EXPENSE",
    category_id: categories[0].id,
    amount_cents: 1000,
    due_date: "2026-02-22",
    status: "RECONCILED",
  }),
});
await json(`${supabaseUrl}/rest/v1/reconciliation_matches`, {
  method: "POST",
  headers: { ...headers(serviceRoleKey), Prefer: "return=representation" },
  body: JSON.stringify({
    user_id: matchedUserId,
    planned_entry_id: matchedPlans[0].id,
    imported_transaction_id: matchedTransactions[0].id,
    status: "AUTO_MATCHED",
    matched_by: "SYSTEM",
    match_score: 1,
  }),
});
const { response: dashboardResponse, body: dashboard } = await json(
  `${supabaseUrl}/rest/v1/rpc/get_month_dashboard`,
  {
    method: "POST",
    headers: headers(matchedAccessToken),
    body: JSON.stringify({ p_month: "2026-02" }),
  },
);
assert.equal(dashboardResponse.status, 200, JSON.stringify(dashboard));
const foodCategory = dashboard.categories.find((category) => category.categoryId === categories[0].id);
assert.equal(foodCategory.actualCents, 1000);

console.log("PASS matched CSV transaction inherits the planned category in the dashboard");
