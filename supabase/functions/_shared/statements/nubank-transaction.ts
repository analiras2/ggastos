import type { CsvRow } from "./nubank-csv.ts";
import { parseAmountCents, parseDirection, parseInstallment } from "./csv-utils.ts";
import type { ParsedStatementSkippedRow, ParsedStatementTransaction, StatementParserError } from "./types.ts";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const COMBINING_MARKS_PATTERN = /[\u0300-\u036f]/g;
// The line Nubank adds when the previous invoice was paid. It is money going to the card, not a
// purchase or a refund, so it must not reduce the month's spending.
const PAYMENT_RECEIVED_TITLE = "pagamento recebido";

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

// A row that is part of the invoice but must not be imported, with the reason; null for a purchase.
export function skippedRowFor(row: CsvRow): ParsedStatementSkippedRow | null {
  const title = (row.fields[1] ?? "").normalize("NFD").replace(COMBINING_MARKS_PATTERN, "").trim().toLowerCase();
  if (!title.startsWith(PAYMENT_RECEIVED_TITLE)) {
    return null;
  }

  return {
    sourceRowNumber: row.sourceRowNumber,
    section: "CURRENT_INVOICE",
    reason: "payment_or_credit",
    raw: { fields: row.fields },
  };
}
