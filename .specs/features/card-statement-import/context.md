# Importacao de Fatura de Cartao Context

**Gathered:** 2026-08-03
**Spec:** `.specs/features/card-statement-import/spec.md`
**Status:** Ready for implementation tasks

---

## Feature Boundary

Import CSV credit card statements from Nubank and Bradesco, normalize them into the existing planned-vs-actual model, and reuse reconciliation so planned installments are not duplicated when the real invoice row arrives.

---

## Sample Files Reviewed

The user provided real bank CSV exports from local `Downloads`. These files were inspected for structure only and must not be copied into the repository because they contain personal financial data.

| Bank | Local sample | Repository handling |
| --- | --- | --- |
| Nubank | `Nubank_2026-03-04.csv` | Do not commit raw file; create sanitized fixture before tests. |
| Bradesco | `Bradesco_832026_43646 PM.csv` | Do not commit raw file; create sanitized fixture before tests. |

---

## Implementation Decisions From Samples

### Nubank CSV

- Treat as a simple UTF-8 comma-delimited CSV.
- Expected columns are `date`, `title`, `amount`.
- Dates are already full ISO dates (`YYYY-MM-DD`).
- Amounts use decimal comma and may be quoted.
- Exact duplicate visible values can exist, so idempotency cannot be based only on date/title/amount.

### Bradesco CSV

- Decode as ISO-8859-1 before parsing or displaying text.
- Normalize `CR` line endings before splitting rows.
- Use semicolon delimiter.
- Ignore metadata before the transaction header.
- Parse the current invoice and `Lancamentos programados` as separate sections.
- Treat totals, summary rows, previous balance, debit/payment rows and fee tables as non-purchase rows unless explicitly classified.
- Infer missing year for `DD/MM` rows only from a trusted invoice context.

### Shared Import Rules

- Preserve raw row payload for audit and future parser fixes.
- Generate a source fingerprint that includes bank, file/import context and row identity, not only transaction visible fields.
- Extract installment markers from descriptions conservatively.
- Reuse reconciliation for matching imported invoice lines to existing planned installments.

### Sanitized Fixtures

- Created in `.specs/features/card-statement-import/fixtures/`.
- Fixtures are synthetic and safe to commit.
- Expected JSON files define parser behavior for duplicate visible Nubank rows, Bradesco skipped rows, installment extraction and scheduled Bradesco rows.

---

## Deferred Decisions

- Whether bank selection is manual before upload or auto-detected from file shape.
- Whether Bradesco `Lancamentos programados` should become planned entries, preview-only rows, or delayed imports.
- Whether `competency_month` for credit card rows should always be invoice month or purchase date month.
