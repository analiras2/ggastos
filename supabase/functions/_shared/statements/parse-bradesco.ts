import type {
  ParsedStatement,
  ParsedStatementSkippedRow,
  ParsedStatementTransaction,
  StatementInstallment,
  StatementParserError,
  StatementParserInput,
  StatementSection,
  StatementSkippedReason,
} from "./types.ts";

const BRADESCO_HEADER = ["data", "historico", "valor(us$)", "valor(r$)"];
const BRADESCO_GENERATED_AT_PATTERN =
  /^Data:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/i;
const DATE_WITHOUT_YEAR_PATTERN = /^(\d{2})\/(\d{2})$/;
const DATE_WITH_YEAR_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const INSTALLMENT_PATTERN = /\b(\d{1,2})\/(\d{1,2})\b/;
const INVOICE_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const ISO_DATE_LENGTH = 10;
const YEAR_LENGTH = 4;

type BradescoRow = {
  sourceRowNumber: number;
  fields: string[];
};

type ActiveSection = StatementSection | "SUMMARY" | null;

function decodeContents(contents: string | Uint8Array): string {
  if (typeof contents === "string") {
    return contents;
  }

  return new TextDecoder("iso-8859-1").decode(contents);
}

function detectLineEnding(text: string): "LF" | "CRLF" | "CR" | "UNKNOWN" {
  if (text.includes("\r\n")) {
    return "CRLF";
  }
  if (text.includes("\n")) {
    return "LF";
  }
  if (text.includes("\r")) {
    return "CR";
  }
  return "UNKNOWN";
}

function normalizeToken(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function splitSemicolonLine(line: string): string[] {
  return line.split(";").map((field) => field.trim());
}

function parseRows(text: string): BradescoRow[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line, index) => ({ sourceRowNumber: index + 1, fields: splitSemicolonLine(line) }))
    .filter((row) => row.fields.some((field) => field.trim().length > 0));
}

function parseGeneratedAt(text: string): string | null {
  const match = text.match(BRADESCO_GENERATED_AT_PATTERN);
  if (!match) {
    return null;
  }

  const [, day, month, year, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function lastDayOfMonth(invoiceMonth: string): string | null {
  const match = invoiceMonth.match(INVOICE_MONTH_PATTERN);
  if (!match) {
    return null;
  }

  const [, year, month] = match;
  const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  return `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
}

// Bradesco rows carry only dd/mm. The year is resolved against the latest date the statement
// can contain: the end of the invoice month when known, otherwise the file generation date.
function referenceDate(invoiceGeneratedAt: string | null, invoiceMonth: string | null): string | null {
  const invoiceMonthEnd = invoiceMonth ? lastDayOfMonth(invoiceMonth) : null;
  if (invoiceMonthEnd) {
    return invoiceMonthEnd;
  }
  return invoiceGeneratedAt ? invoiceGeneratedAt.slice(0, ISO_DATE_LENGTH) : null;
}

function isHeader(fields: string[]): boolean {
  return fields.length >= BRADESCO_HEADER.length &&
    BRADESCO_HEADER.every((expected, index) => normalizeToken(fields[index]) === expected);
}

// Invoice rows are listed from the newest purchase to the oldest, so each date is bounded by the
// previous one. A dd/mm later than the bound belongs to the year before it (e.g. 10/12 listed after
// 05/01). Scheduled rows are future dates and keep the bound's year.
function parseDate(rawDate: string, upperBound: string | null, rollBackYear: boolean): string | null {
  const withYear = rawDate.match(DATE_WITH_YEAR_PATTERN);
  if (withYear) {
    const [, day, month, parsedYear] = withYear;
    return `${parsedYear}-${month}-${day}`;
  }

  const withoutYear = rawDate.match(DATE_WITHOUT_YEAR_PATTERN);
  if (!withoutYear || !upperBound) {
    return null;
  }

  const [, day, month] = withoutYear;
  const boundYear = Number(upperBound.slice(0, YEAR_LENGTH));
  const sameYearDate = `${boundYear}-${month}-${day}`;
  if (!rollBackYear || sameYearDate <= upperBound) {
    return sameYearDate;
  }
  return `${boundYear - 1}-${month}-${day}`;
}

function parseAmountCents(rawAmount: string): number | null {
  const normalized = rawAmount.trim().replace(/\./g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  return Math.round(Math.abs(Number(normalized)) * 100);
}

function parseDirection(rawAmount: string): "DEBIT" | "CREDIT" {
  return rawAmount.trim().startsWith("-") ? "CREDIT" : "DEBIT";
}

function parseInstallment(description: string): StatementInstallment | null {
  const match = description.match(INSTALLMENT_PATTERN);
  if (!match) {
    return null;
  }

  const index = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isInteger(index) || !Number.isInteger(total) || index <= 0 || total <= 0) {
    return null;
  }
  if (index > total) {
    return null;
  }

  return { index, total };
}

function skippedReason(description: string): StatementSkippedReason | null {
  const normalized = normalizeToken(description);

  if (normalized.includes("saldo anterior")) {
    return "previous_balance";
  }

  if (
    normalized.includes("pagto") ||
    normalized.includes("pagamento") ||
    normalized.includes("creditos") ||
    normalized.includes("credito")
  ) {
    return "payment_or_credit";
  }

  if (normalized.startsWith("total ") || normalized.includes("total da fatura")) {
    return "total";
  }

  if (normalized.includes("taxa")) {
    return "fees";
  }

  if (
    normalized.includes("resumo") ||
    normalized.includes("despesas locais") ||
    normalized.includes("despesas no exterior")
  ) {
    return "summary";
  }

  return null;
}

function buildFingerprintInput(row: BradescoRow, section: StatementSection): string {
  return ["BRADESCO", section, row.sourceRowNumber.toString(), ...row.fields].join("|");
}

function buildSkippedRow(
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

function shouldReturnSkippedRow(reason: StatementSkippedReason): boolean {
  return reason !== "metadata" && reason !== "summary" && reason !== "total";
}

function toTransaction(
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

function isTransactionLikeRow(row: BradescoRow): boolean {
  return row.fields.length >= 4 &&
    (DATE_WITH_YEAR_PATTERN.test(row.fields[0].trim()) ||
      DATE_WITHOUT_YEAR_PATTERN.test(row.fields[0].trim()));
}

export function parseBradescoStatement(input: StatementParserInput): ParsedStatement {
  const text = decodeContents(input.contents);
  const rows = parseRows(text);
  const invoiceGeneratedAt = parseGeneratedAt(text);
  const statementReferenceDate = referenceDate(invoiceGeneratedAt, input.invoiceMonth ?? null);
  const transactions: ParsedStatementTransaction[] = [];
  const skippedRows: ParsedStatementSkippedRow[] = [];
  const errors: StatementParserError[] = [];
  let activeSection: ActiveSection = null;
  let hasHeader = false;
  let nextHeaderIsScheduled = false;
  let latestPostedAt = statementReferenceDate;

  for (const row of rows) {
    const firstField = normalizeToken(row.fields[0] ?? "");

    if (firstField === "lancamentos programados") {
      activeSection = null;
      nextHeaderIsScheduled = true;
      continue;
    }

    if (firstField.startsWith("resumo das despesas")) {
      activeSection = "SUMMARY";
      continue;
    }

    if (isHeader(row.fields)) {
      hasHeader = true;
      activeSection = nextHeaderIsScheduled ? "SCHEDULED" : "CURRENT_INVOICE";
      nextHeaderIsScheduled = false;
      latestPostedAt = statementReferenceDate;
      continue;
    }

    if (activeSection === "SUMMARY") {
      continue;
    }

    if (activeSection === null) {
      continue;
    }

    if (!isTransactionLikeRow(row)) {
      const reason = skippedReason(row.fields.join(" ")) ?? "metadata";
      if (shouldReturnSkippedRow(reason)) {
        skippedRows.push(buildSkippedRow(row, activeSection, reason));
      }
      continue;
    }

    const parsed = toTransaction(row, activeSection, latestPostedAt);
    if (parsed.transaction) {
      transactions.push(parsed.transaction);
      if (activeSection === "CURRENT_INVOICE") {
        latestPostedAt = parsed.transaction.postedAt;
      }
    }
    if (parsed.skippedRow) {
      skippedRows.push(parsed.skippedRow);
    }
    if (parsed.error) {
      errors.push(parsed.error);
    }
  }

  if (!hasHeader) {
    errors.push({
      code: "missing_header",
      message: "Bradesco CSV must include header: Data;Historico;Valor(US$);Valor(R$);",
      sourceRowNumber: null,
    });
  }

  return {
    metadata: {
      bank: "BRADESCO",
      sourceEncoding: typeof input.contents === "string" ? "utf-8" : "iso-8859-1",
      sourceLineEnding: detectLineEnding(text),
      delimiter: ";",
      fileName: input.fileName ?? null,
      fileHash: input.fileHash ?? null,
      invoiceMonth: input.invoiceMonth ?? null,
      invoiceGeneratedAt,
    },
    rowsRead: transactions.length + skippedRows.filter((row) => row.section !== null).length,
    transactions,
    skippedRows,
    errors,
  };
}
