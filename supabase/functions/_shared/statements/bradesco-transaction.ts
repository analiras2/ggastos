import { parseDate } from "./bradesco-dates.ts";
import { shouldReturnSkippedRow, skippedReason, type BradescoRow } from "./bradesco-rows.ts";
import { parseAmountCents, parseDirection, parseInstallment } from "./csv-utils.ts";
import type {
  ParsedStatementSkippedRow,
  ParsedStatementTransaction,
  StatementParserError,
  StatementSection,
  StatementSkippedReason,
} from "./types.ts";

function buildFingerprintInput(row: BradescoRow, section: StatementSection): string {
  return ["BRADESCO", section, row.sourceRowNumber.toString(), ...row.fields].join("|");
}

export function buildSkippedRow(
  row: BradescoRow,
  section: StatementSection | null,
  reason: StatementSkippedReason,
): ParsedStatementSkippedRow {
  return {
    sourceRowNumber: row.sourceRowNumber,
    section,
    reason,
    raw: {
      fields: row.fields,
    },
  };
}

export function toTransaction(
  row: BradescoRow,
  section: StatementSection,
  upperBound: string | null,
): {
  transaction: ParsedStatementTransaction | null;
  skippedRow: ParsedStatementSkippedRow | null;
  error: StatementParserError | null;
} {
  const [rawDate, rawDescription, rawUsdAmount, rawBrlAmount] = row.fields;
  const description = rawDescription.trim();
  const reason = skippedReason(description);
  if (reason) {
    return {
      transaction: null,
      skippedRow: shouldReturnSkippedRow(reason) ? buildSkippedRow(row, section, reason) : null,
      error: null,
    };
  }

  const postedAt = parseDate(rawDate.trim(), upperBound, section === "CURRENT_INVOICE");
  if (!postedAt) {
    return {
      transaction: null,
      skippedRow: null,
      error: {
        code: "invalid_date",
        message: `Invalid Bradesco transaction date at row ${row.sourceRowNumber}.`,
        sourceRowNumber: row.sourceRowNumber,
      },
    };
  }

  const amountCents = parseAmountCents(rawBrlAmount);
  if (amountCents === null) {
    return {
      transaction: null,
      skippedRow: null,
      error: {
        code: "invalid_amount",
        message: `Invalid Bradesco transaction amount at row ${row.sourceRowNumber}.`,
        sourceRowNumber: row.sourceRowNumber,
      },
    };
  }

  return {
    transaction: {
      sourceRowNumber: row.sourceRowNumber,
      section,
      postedAt,
      competencyMonth: postedAt.slice(0, 7),
      description,
      descriptionRaw: description,
      amountCents,
      currencyCode: "BRL",
      direction: parseDirection(rawBrlAmount),
      impactType: "EXPENSE",
      installment: parseInstallment(description),
      defaultImportMode: section === "SCHEDULED" ? "PREVIEW_ONLY" : "IMPORT",
      fingerprintInput: buildFingerprintInput(row, section),
      raw: {
        date: rawDate,
        description: rawDescription,
        amountUsd: rawUsdAmount,
        amountBrl: rawBrlAmount,
      },
    },
    skippedRow: null,
    error: null,
  };
}
