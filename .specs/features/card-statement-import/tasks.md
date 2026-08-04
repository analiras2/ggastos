# Importacao de Fatura de Cartao Tasks

**Design**: `.specs/features/card-statement-import/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Parser Foundation

```
T1 -> T2 -> T3 -> T4
```

### Phase 2: Import Backend

```
T4 -> T5 -> T6 -> T7
```

### Phase 3: Mobile Import Flow

```
T7 -> T8 -> T9 -> T10
```

### Phase 4: Reconciliation and Cleanup

```
T7 -> T11 -> T12
T10 -> T13 -> T14 -> T15
T15 -> T16
```

---

## Task Breakdown

### T1: Create sanitized CSV fixtures

**What**: Add synthetic Nubank and Bradesco CSV fixtures plus expected parser output.
**Where**: `.specs/features/card-statement-import/fixtures/`
**Depends on**: None
**Reuses**: Real CSV shape documented in `context.md`
**Requirement**: CSV-01, CSV-02
**Tools**: Filesystem, `tlc-spec-driven`

**Done when**:

- [x] Nubank fixture exists with `date,title,amount`.
- [x] Bradesco fixture exists with metadata, current invoice and scheduled sections.
- [x] Expected JSON documents normalized rows, skipped rows and installment extraction.

**Commit**: `test(statements): add sanitized card statement fixtures`

---

### T2: Define statement parser types

**What**: Create shared TypeScript types for parsed statement batches, transactions, skipped rows and parser errors.
**Where**: `supabase/functions/_shared/statements/types.ts`
**Depends on**: T1
**Reuses**: Existing enum strings from `imported_transactions`
**Requirement**: CSV-01, CSV-02
**Tools**: Filesystem

**Done when**:

- [x] Types cover Nubank and Bradesco expected JSON.
- [x] Types avoid `any`.
- [ ] `deno check` or function typecheck passes for the new module. Not run: `deno` is not installed in this environment.

**Commit**: `feat(statements): define parser contracts`

---

### T3: Implement Nubank parser

**What**: Parse Nubank CSV text into the shared statement contract.
**Where**: `supabase/functions/_shared/statements/parse-nubank.ts`
**Depends on**: T2
**Reuses**: Fixture `nubank-statement-sanitized.csv`
**Requirement**: CSV-01
**Tools**: Filesystem

**Done when**:

- [x] Handles comma CSV, quoted decimal-comma amounts and ISO dates.
- [x] Preserves exact duplicate visible tuples as distinct source rows.
- [x] Extracts installment markers conservatively.
- [x] Parser output matches `nubank-statement-expected.json`.

**Commit**: `feat(statements): parse Nubank CSV`

---

### T4: Implement Bradesco parser

**What**: Parse Bradesco CSV text into current invoice, scheduled rows and skipped rows.
**Where**: `supabase/functions/_shared/statements/parse-bradesco.ts`
**Depends on**: T2
**Reuses**: Fixture `bradesco-statement-sanitized.csv`
**Requirement**: CSV-02
**Tools**: Filesystem

**Done when**:

- [x] Handles semicolon rows, metadata preamble and repeated transaction headers.
- [x] Handles ISO-8859-1/CR real export characteristics in tests.
- [x] Skips totals, previous balance, payment and summary rows explicitly.
- [x] Parses `Lancamentos programados` separately from current invoice rows.
- [x] Parser output matches `bradesco-statement-expected.json`.

**Commit**: `feat(statements): parse Bradesco CSV`

---

### T5: Add statement import tables

**What**: Create migration for import batches and source fingerprints without dropping legacy Pluggy columns.
**Where**: `supabase/migrations/`
**Depends on**: T2
**Reuses**: `profiles`, `imported_transactions`, RLS style from existing migrations
**Requirement**: CSV-01, CSV-02, CSV-04
**Tools**: Filesystem, Supabase CLI

**Done when**:

- [x] `statement_import_batches` exists with owner RLS.
- [x] Imported rows can store bank, batch and fingerprint metadata.
- [x] Reimporting same fingerprint is structurally idempotent.
- [ ] Local `supabase db reset` succeeds. Not run: local Postgres on `127.0.0.1:54322` is not running; destructive reset was not approved.

**Commit**: `feat(statements): add import batch schema`

---

### T6: Implement statement import Edge Function

**What**: Add authenticated Edge Function that parses a CSV, creates a batch and upserts imported transactions.
**Where**: `supabase/functions/import-card-statement/index.ts`
**Depends on**: T3, T4, T5
**Reuses**: `supabaseRest`, upsert helpers, auth helper
**Requirement**: CSV-01, CSV-02, CSV-04
**Tools**: Filesystem, Supabase CLI

**Done when**:

- [x] Accepts bank, file name, file contents and optional invoice month.
- [x] Returns rows read/imported/duplicated/skipped/failed.
- [x] Reimporting fixture content does not duplicate transactions structurally through source fingerprints. Not run end-to-end: local Postgres is not running.
- [x] Invalid format returns actionable error and persists failed batch when appropriate.

**Commit**: `feat(statements): import card statement batches`

---

### T7: Trigger reconciliation after import

**What**: Run existing auto-match after successful imported transaction upserts.
**Where**: `supabase/functions/import-card-statement/index.ts`
**Depends on**: T6
**Reuses**: `runAutoMatch`, `reconciliation_matches`
**Requirement**: CSV-03
**Tools**: Filesystem, Supabase CLI

**Done when**:

- [x] Import response includes matches created.
- [x] Planned installment plus matching CSV row creates or suggests a match through existing `runAutoMatch`. Not run end-to-end: local Postgres is not running.
- [x] Active-match constraints still prevent duplicate matches through existing `runAutoMatch` insert handling.
- [x] Rejected pairs are not suggested again through existing `runAutoMatch` rejected-pair filtering.

**Commit**: `feat(statements): reconcile imported statements`

---

### T8: Add mobile statement import hook

**What**: Create React Query mutation for calling `import-card-statement`.
**Where**: `mobile/src/features/statements/use-import-card-statement.ts`
**Depends on**: T6
**Reuses**: Existing Supabase function invocation patterns
**Requirement**: CSV-04
**Tools**: Filesystem

**Done when**:

- [x] Sends bearer token and import payload.
- [x] Invalidates dashboard and reconciliation inbox queries on success.
- [x] Formats backend errors for UI.
- [x] TypeScript check passes. `npm run lint` still fails on pre-existing React hook errors in `auth-provider.tsx` and `use-color-scheme.web.ts`.

**Commit**: `feat(mobile): add statement import mutation`

---

### T9: Add import statement UI

**What**: Build sheet/screen for selecting bank, choosing CSV and submitting import.
**Where**: `mobile/src/features/statements/`
**Depends on**: T8
**Reuses**: GGastos buttons, inputs, segmented control and status banner patterns
**Requirement**: CSV-01, CSV-02, CSV-04
**Tools**: Filesystem

**Done when**:

- [x] User can choose Nubank or Bradesco.
- [x] User can select a CSV file.
- [x] Loading, success and error states render clearly.
- [x] Import summary shows imported, duplicated, skipped and failed counts.

**Commit**: `feat(mobile): add statement import UI`

---

### T10: Replace dashboard sync action

**What**: Replace Pluggy sync CTA/banner language with card statement import entry points.
**Where**: `mobile/src/features/dashboard/use-dashboard-view-model.ts`, `mobile/src/features/dashboard/dashboard-screen.tsx`
**Depends on**: T9
**Reuses**: `QuickActionRow`, `SyncStatusBanner` visual pattern
**Requirement**: CSV-04, CSV-08
**Tools**: Filesystem

**Done when**:

- [x] Dashboard no longer calls `useSyncPluggy`.
- [x] Primary action opens statement import.
- [x] Copy references import status, not Pluggy sync.
- [x] Month dashboard still loads normally.

**Commit**: `refactor(mobile): replace Pluggy sync with statement import`

---

### T11: Adjust matching for card installments

**What**: Extend scoring inputs so installment index/total and statement description improve planned-entry matching.
**Where**: `supabase/functions/_shared/reconciliation/score.ts`
**Depends on**: T7
**Reuses**: Existing score dimensions and thresholds
**Requirement**: CSV-03
**Tools**: Filesystem

**Done when**:

- [ ] Matching considers amount, date/month, description and installment markers.
- [ ] Exact planned installment fixture reaches auto-match threshold.
- [ ] Ambiguous fixture lands in inbox, not auto-match.
- [ ] Existing reconciliation behavior remains compatible.

**Commit**: `feat(reconciliation): score card installments`

---

### T12: Decide and implement card credit treatment

**What**: Ensure card credits/estornos reduce expense correctly instead of becoming ordinary income.
**Where**: Parser, import function and dashboard SQL if needed
**Depends on**: T6
**Reuses**: `direction`, `impact_type`, dashboard summary logic
**Requirement**: CSV-01, CSV-02
**Tools**: Filesystem, Supabase CLI

**Done when**:

- [ ] Negative Nubank amount fixture has expected budget effect.
- [ ] Bradesco payment rows are skipped and not treated as income.
- [ ] Dashboard actual totals reflect card expense adjustments correctly.
- [ ] Behavior is documented in design notes.

**Commit**: `fix(statements): handle card credits as expense adjustments`

---

### T13: Remove Pluggy settings UI

**What**: Delete connection sheet/status components and remove Pluggy connection section from Settings.
**Where**: `mobile/src/features/settings/`
**Depends on**: T10
**Reuses**: Settings screen layout
**Requirement**: CSV-08
**Tools**: Filesystem

**Done when**:

- [ ] Settings no longer imports connection components.
- [ ] Connect/reconnect Pluggy UI files are removed.
- [ ] No active mobile route references Pluggy connection status.
- [ ] TypeScript check passes.

**Commit**: `refactor(settings): remove Pluggy connection UI`

---

### T14: Remove Pluggy mobile dependencies

**What**: Remove Pluggy-specific packages from mobile dependencies and lockfile.
**Where**: `mobile/package.json`, `mobile/package-lock.json`
**Depends on**: T13
**Reuses**: npm lockfile workflow
**Requirement**: CSV-08
**Tools**: npm

**Done when**:

- [ ] `pluggy-js` is removed.
- [ ] `react-native-pluggy-connect` is removed.
- [ ] `react-native-webview` is removed only if unused elsewhere.
- [ ] `npm install` completes and lockfile is updated.

**Commit**: `chore(mobile): remove Pluggy dependencies`

---

### T15: Remove active Pluggy backend functions

**What**: Delete Pluggy-only Edge Functions/shared clients or move them out of active deployment.
**Where**: `supabase/functions/`
**Depends on**: T7, T14
**Reuses**: `import-card-statement` as replacement ingestion path
**Requirement**: CSV-08
**Tools**: Filesystem, Supabase CLI

**Done when**:

- [ ] `sync-pluggy`, `pluggy-connect-token`, `connect-pluggy-item` are not active deploy targets.
- [ ] Pluggy client and sync-error helpers are removed if unreferenced.
- [ ] Cron job for `sync-pluggy` is unscheduled by a new migration or removed from reset flow.
- [ ] `rg "sync-pluggy|pluggy-connect|PluggyClient"` returns only docs/history.

**Commit**: `refactor(supabase): remove active Pluggy backend`

---

### T16: Remove manual login UI

**What**: Remove login/cadastro/sign-out UX while preserving owner auto sign-in and Auth/RLS.
**Where**: `mobile/src/app/index.tsx`, `mobile/src/features/auth/`, `mobile/src/features/settings/settings-screen.tsx`
**Depends on**: T13
**Reuses**: `AuthProvider`, `ownerCredentials`, Supabase session restore
**Requirement**: CSV-09
**Tools**: Filesystem

**Done when**:

- [ ] `IndexScreen` renders `AppShell` after owner session bootstrap, never `AuthScreen`.
- [ ] Manual `AuthScreen` and unused sign-in/sign-up methods are removed or isolated from production flow.
- [ ] Settings no longer shows sign out.
- [ ] Missing owner env vars show a setup error state, not a login form.
- [ ] Existing authenticated RPC/Edge Function calls still receive valid bearer tokens.

**Commit**: `refactor(auth): remove manual login flow`

---

## Parallel Execution Map

```
Phase 1:
  T1 -> T2 -> T3
            -> T4

Phase 2:
  T3 + T4 + T5 -> T6 -> T7

Phase 3:
  T6 -> T8 -> T9 -> T10

Phase 4:
  T7 -> T11
  T6 -> T12
  T10 -> T13 -> T14 -> T15 -> T16
```

## Scope Guardrails

- Do not remove Supabase Auth/RLS in this cleanup pass; remove only the manual login experience.
- Do not drop Pluggy-named columns until statement import has replacement identifiers and dashboard/reconciliation no longer need old assumptions.
- Do not commit raw bank CSV exports.
