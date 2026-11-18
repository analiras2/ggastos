import {
  inferInvoiceMonth,
  isTransactionLikeRow,
  parseGeneratedAt,
  referenceDate,
} from "./bradesco-dates.ts";
import {
  detectPaymentStatus,
  isHeader,
  normalizeToken,
  parseRows,
  shouldReturnSkippedRow,
  skippedReason,
} from "./bradesco-rows.ts";
import { buildSkippedRow, toTransaction } from "./bradesco-transaction.ts";
import { decodeContents, detectLineEnding } from "./csv-utils.ts";
import type {
  ParsedStatement,
  ParsedStatementSkippedRow,
  ParsedStatementTransaction,
  StatementParserError,
  StatementParserInput,
  StatementSection,
} from "./types.ts";

type ActiveSection = StatementSection | "SUMMARY" | null;

export function parseBradescoStatement(input: StatementParserInput): ParsedStatement {
  const text = decodeContents(input.contents, "iso-8859-1");
  const rows = parseRows(text);
  const invoiceGeneratedAt = parseGeneratedAt(text);
  const invoiceMonth = input.invoiceMonth ?? inferInvoiceMonth(rows, invoiceGeneratedAt);
  const statementReferenceDate = referenceDate(invoiceGeneratedAt, invoiceMonth);
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
      // Installments belong to the invoice that charges them; single purchases keep their own month.
      const { transaction } = parsed;
      transactions.push(
        invoiceMonth !== null && transaction.installment !== null
          ? { ...transaction, competencyMonth: invoiceMonth }
          : transaction,
      );
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
      invoiceMonth,
      invoiceGeneratedAt,
      invoiceDueDate: null,
      detectedPaymentStatus: detectPaymentStatus(text),
    },
    rowsRead: transactions.length + skippedRows.filter((row) => row.section !== null).length,
    transactions,
    skippedRows,
    errors,
  };
}
