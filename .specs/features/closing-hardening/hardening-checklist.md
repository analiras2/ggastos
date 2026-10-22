# MVP Hardening Checklist

**Requirement**: CLS-04
**Purpose**: Minimum set of checks that must pass before starting UAT. If any item fails, fix it first — do not proceed to UAT.

Two kinds of items here:
- **Automated** — covered by `supabase/tests/run-hardening-checklist.sh`. A failure aborts the script (non-zero exit) and blocks UAT by construction.
- **Manual** — no safe/cheap way to automate (needs a real Pluggy sandbox item or visual UI confirmation). Documented as an exact, repeatable procedure; run once per release and check off by hand.

## Prerequisites

```bash
supabase start
supabase functions serve --env-file supabase/functions/.env &
```

Both must be running for every item below (`db reset` only needs the first; every RLS/Edge Function/RPC check needs both).

---

## Automated gate

Run once, from the repo root:

```bash
supabase/tests/run-hardening-checklist.sh
```

- [ ] **Migrations** — every migration in `supabase/migrations/` applies cleanly to a fresh database, and seed data loads without error.
  Command (also what the script runs): `supabase db reset`
  Pass: exits 0, ends with `Finished supabase db reset on branch main.`

- [ ] **RLS** — table isolation, RPC scoping, and Edge Function ownership checks across two users (17 assertions, see `supabase/tests/rls-suite.mjs`'s own header comment for full coverage).
  Command: `node supabase/tests/rls-suite.mjs`
  Pass: `17/17 passed, 0 failed`, exits 0.

---

## Manual verification

Each procedure below was exercised at least once during Milestone 4 development (T1, T4, T12) and is safe to repeat. Use a throwaway test user (`<email>@example.com` / `Test1234!`) each time — every step here inserts/reads its own fixture data and none of it needs cleanup for correctness (though deleting the test user's rows afterward keeps the local DB tidy).

- [ ] **Sync** — manual sync imports data without duplicating on a second run.
  1. Sign up a test user (`POST /auth/v1/signup`).
  2. Create a real Pluggy sandbox item: `POST https://api.pluggy.ai/items` with `connectorId: 2` ("Pluggy Bank"), `parameters: { user: "user-ok", password: "password-ok" }` (auth via `POST /auth` with the `PLUGGY_CLIENT_ID`/`PLUGGY_CLIENT_SECRET` from `supabase/functions/.env`) — or point `PLUGGY_BASE_URL` at a local mock server returning fixed accounts/transactions (see the T12 session notes / `.specs/project/STATE.md` for the exact mock-server recipe if sandbox access isn't available).
  3. Insert a `financial_connections` row for the test user with that `pluggy_item_id`.
  4. `POST /functions/v1/sync-pluggy` with `{ "mode": "manual" }`, bearer = the user's access token. Note `transactionsProcessed`.
  5. Call it again with the identical body/token.
  Pass: second call reports the same `transactionsProcessed` count, and `select count(*) from imported_transactions where user_id = '<id>'` equals `count(distinct pluggy_transaction_id)` — no duplicates.

- [ ] **Dashboard** — `get_month_dashboard` reflects synced + manually-confirmed data for the competency month.
  Command: `POST /rest/v1/rpc/get_month_dashboard` with `{ "p_month": "<YYYY-MM>" }`, bearer = the user's access token.
  Pass: `summary.actualIncomeCents`/`actualExpenseCents` match the sum of that month's `imported_transactions` (plus any `planned_entries` with `manually_confirmed_at` set), independent of reconciliation status.

- [ ] **Conciliação** — auto-match fires on a strong pair, weaker pairs land in the inbox, and confirm/reject work.
  1. After a sync (above), seed a `planned_entries` row whose amount/date/description closely match one imported transaction and whose category has `pluggy_category_name IS NULL` on that transaction (category text mismatch between Pluggy's English taxonomy and this app's Portuguese catalog structurally caps the score below `AUTO_MATCH_THRESHOLD` otherwise — see `.specs/project/STATE.md` L-003).
  2. Re-run `sync-pluggy` (auto-match runs as part of every sync) or call `POST /functions/v1/reprocess-financial-data` with `{ "scope": "MATCHING", "connectionId": "<id>" }`.
  3. `GET /functions/v1/reconciliation-inbox?month=<YYYY-MM>` — confirm any remaining unmatched-but-close pairs appear, sorted by score.
  4. `POST /functions/v1/reconcile-transactions` with `{ "action": "confirm", ... }` on one inbox item, `{ "action": "reject", ... }` on another.
  Pass: `reconciliation_matches` shows one `AUTO_MATCHED`/`SYSTEM` row from step 2, one `MANUAL_MATCHED`/`USER` and one `REJECTED`/`USER` row from step 4; the inbox no longer lists the confirmed/rejected pair.

- [ ] **Fechamento** — closing a month persists a recalculable snapshot, and the annual view picks it up.
  1. `POST /functions/v1/recalculate-month-snapshot` with `{ "month": "<YYYY-MM>" }`.
  2. `POST /rest/v1/rpc/get_annual_summary` with `{ "p_year": <year> }`.
  Pass: step 1 returns `200` with `status: "OPEN"` (or `"CLOSED"` if manually closed beforehand — either way, unchanged by recalculation); step 2's `months` array has that month with `hasSnapshot: true` and the same cents values, and `categories` reflects the snapshot's category breakdown.

- [ ] **UI smoke** — the two Milestone 4 screens render real data, not just their empty states.
  With the fixtures from the steps above still in place, open the app (`mobile-web` launch config), sign in as the test user, and check:
  - "Anual" tab shows the closed month's totals (not the empty state).
  - "Ajustes" → Conexões shows the test connection's status (not "Nenhuma conexão bancária ainda").

---

## Sign-off

UAT may start only once every box above is checked for the release under test. Record the date and who ran it in `.specs/project/STATE.md`'s Recent Activity table.
