import type { CsvRow } from "./nubank-csv.ts";
import { parseAmountCents, parseDirection, parseInstallment } from "./csv-utils.ts";
import type { ParsedStatementTransaction, StatementParserError } from "./types.ts";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Nubank sometimes writes the sign apart from the digits ("- 12,50").
function normalizeAmount(rawAmount: string): string {
  return rawAmount.trim().replace(/^-\s+/, "-");
}

function buildFingerprintInput(row: CsvRow): string {
  return ["NUBANK", row.sourceRowNumber.toString(), ...row.fields].join("|");
}

export function toTransaction(row: CsvRow): {
  transaction: ParsedStatementTransaction | null;
  error: StatementParserError | null;
} {
  const [postedAt, rawDescription, rawAmount] = row.fields.map((field) => field.trim());

  if (!ISO_DATE_PATTERN.test(postedAt)) {
    return {
      transaction: null,
      error: {
        code: "invalid_date",
        message: `Invalid Nubank transaction date at row ${row.sourceRowNumber}.`,
        sourceRowNumber: row.sourceRowNumber,
      },
    };
  }

  const amountCents = parseAmountCents(normalizeAmount(rawAmount));
  if (amountCents === null) {
    return {
      transaction: null,
      error: {
        code: "invalid_amount",
        message: `Invalid Nubank transaction amount at row ${row.sourceRowNumber}.`,
        sourceRowNumber: row.sourceRowNumber,
      },
    };
  }

  return {
    transaction: {
      sourceRowNumber: row.sourceRowNumber,
      section: "CURRENT_INVOICE",
      postedAt,
      competencyMonth: postedAt.slice(0, 7),
      description: rawDescription,
      descriptionRaw: rawDescription,
      amountCents,
      currencyCode: "BRL",
      direction: parseDirection(normalizeAmount(rawAmount)),
      impactType: "EXPENSE",
      installment: parseInstallment(rawDescription),
      defaultImportMode: "IMPORT",
      fingerprintInput: buildFingerprintInput(row),
      raw: {
        date: row.fields[0],
        title: row.fields[1],
        amount: row.fields[2],
      },
    },
    error: null,
  };
}
