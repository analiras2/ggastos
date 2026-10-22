# Importacao de Fatura de Cartao Design

**Spec**: `.specs/features/card-statement-import/spec.md`
**Status**: Draft

---

## Architecture Overview

The active product flow moves from Pluggy sync to explicit statement imports. The mobile app selects a card statement file, sends the file contents and declared bank to a Supabase Edge Function, the function parses the bank-specific CSV into a shared statement row contract, upserts imported transactions idempotently, and then reuses the existing reconciliation engine and inbox.

Pluggy cleanup should happen after the CSV import route exists, so the app does not lose its only "actuals" ingestion path mid-refactor.

---

## Code Reuse Analysis

| Existing Component | Location | How to Use |
| --- | --- | --- |
| Monthly dashboard RPC | `supabase/migrations/20260713000000_create_get_month_dashboard.sql` | Keep as read model for actuals after CSV rows become `imported_transactions`. |
| Reconciliation engine | `supabase/functions/_shared/reconciliation/` | Reuse score, active-match constraints, inbox and decisions with statement-origin transactions. |
| Planning flows | `mobile/src/features/planning/` | Keep manual entries, recurring templates and installments as the source of planned future expenses. |
| Reconciliation UI | `mobile/src/features/reconciliation/` | Reuse for ambiguous CSV-to-planning matches. |
| Supabase Auth/RLS | `supabase/migrations/*`, `mobile/src/features/auth/auth-provider.tsx` | Keep backend auth/RLS; remove manual login UI only. |
| Sync banner | `mobile/src/components/ggastos/navigation/sync-status-banner.tsx` | Reuse visual pattern for import status. |

## New Components

### Statement Fixtures

- **Purpose**: Provide safe parser examples for Nubank and Bradesco without committing real personal financial data.
- **Location**: `.specs/features/card-statement-import/fixtures/`
- **Interfaces**: CSV fixture + expected JSON per bank.
- **Dependencies**: Real bank export shapes observed on 2026-08-03.

### Statement Parser Contract

- **Purpose**: Normalize bank-specific CSV rows before database upsert.
- **Location**: `supabase/functions/_shared/statements/`
- **Interfaces**:
  - `parseCardStatement(input): ParsedStatement`
  - `parseNubankStatement(input): ParsedStatement`
  - `parseBradescoStatement(input): ParsedStatement`
- **Dependencies**: File text/bytes, selected bank, optional invoice month context.

### Import Orchestrator

- **Purpose**: Validate an import request, create an import batch, upsert imported transactions and trigger matching.
- **Location**: `supabase/functions/import-card-statement/`
- **Interfaces**:
  - `POST /functions/v1/import-card-statement`
- **Dependencies**: Authenticated user, parser contract, imported transaction upsert, matching engine.

### Mobile Import Flow

- **Purpose**: Let the user select bank + CSV, submit import, and review the resulting batch summary.
- **Location**: `mobile/src/features/statements/`
- **Interfaces**:
  - `useImportStatementViewModel()`
  - `ImportStatementSheet`
  - `ImportSummaryCard`
- **Dependencies**: Document picker, Supabase functions invoke, dashboard invalidation.

---

## Data Model Decisions

### Card Credits and Expense Adjustments

Imported card rows keep `amount_cents` as an absolute value. Budget impact is computed from
`impact_type` plus `direction`:

- `EXPENSE` + `DEBIT` increases actual expenses.
- `EXPENSE` + `CREDIT` reduces actual expenses, covering card refunds, reversals and Nubank negative CSV amounts.
- Bradesco payment/credit rows such as invoice payment and previous balance are parser-skipped and never become ordinary income.

Monthly dashboard aggregates apply this signed interpretation before writing month snapshots, so card credits lower `actualExpenseCents` instead of inflating `actualIncomeCents`.

### `statement_import_batches`

Tracks every upload and its parse/upsert summary.

```typescript
interface StatementImportBatch {
  id: string;
  userId: string;
  bank: 'NUBANK' | 'BRADESCO';
  fileName: string;
  fileHash: string;
  invoiceMonth: string | null;
  status: 'RECEIVED' | 'PROCESSED' | 'FAILED';
  rowsRead: number;
  rowsImported: number;
  rowsDuplicated: number;
  rowsSkipped: number;
  rowsFailed: number;
  payload: Record<string, unknown>;
}
```

### Statement Transaction Row

Intermediate parser output before mapping to `imported_transactions`.

```typescript
interface ParsedStatementTransaction {
  sourceRowNumber: number;
  section: 'CURRENT_INVOICE' | 'SCHEDULED';
  postedAt: string;
  competencyMonth: string;
  description: string;
  descriptionRaw: string;
  amountCents: number;
  direction: 'DEBIT' | 'CREDIT';
  impactType: 'EXPENSE' | 'INCOME' | 'INVESTMENT' | 'TRANSFER';
  installment: { index: number; total: number } | null;
  fingerprint: string;
  raw: Record<string, unknown>;
}
```

## Cleanup Strategy

| Area | Decision |
| --- | --- |
| Pluggy mobile UI | Remove dashboard sync action, settings connection status and connect/reconnect sheets after statement import exists. |
| Pluggy dependencies | Remove `pluggy-js` and `react-native-pluggy-connect`; remove `react-native-webview` only if no other active feature uses it. |
| Pluggy Edge Functions | Stop deploying active Pluggy functions; delete source files in this branch once replacement import function is available. |
| Pluggy schema names | Do not drop old columns first. Add statement-specific columns/tables, migrate reads, then decide whether to rename/drop legacy Pluggy fields. |
| Login UI | Remove `AuthScreen` and sign-out UI from the user experience, but keep AuthProvider/owner auto sign-in and Supabase Auth/RLS. |

## Open Design Questions

- Should the mobile UI require manual bank selection before upload, or should the parser auto-detect from file shape?
- Should Bradesco `Lancamentos programados` create planned entries, stay preview-only, or be importable later?
- Should credit card `competency_month` be purchase month or selected invoice month for dashboard purposes?
- Should card credits reduce expenses directly, or remain separate adjustment rows with dedicated dashboard treatment?
