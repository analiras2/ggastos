import { decodeContents, detectLineEnding } from "./csv-utils.ts";
import { dueDateFromFileName, headerMatches, parseCsvRows } from "./nubank-csv.ts";
import { skippedRowFor, toTransaction } from "./nubank-transaction.ts";
import type {
  ParsedStatement,
  ParsedStatementSkippedRow,
  ParsedStatementTransaction,
  StatementParserError,
  StatementParserInput,
} from "./types.ts";

const INVOICE_MONTH_LENGTH = 7;

export function parseNubankStatement(input: StatementParserInput): ParsedStatement {
  const invoiceDueDate = dueDateFromFileName(input.fileName);
  const invoiceMonth = input.invoiceMonth ?? invoiceDueDate?.slice(0, INVOICE_MONTH_LENGTH) ?? null;
  const text = decodeContents(input.contents, "utf-8").replace(/^\uFEFF/, "");
  const rows = parseCsvRows(text);
  const header = rows[0];
  const errors: StatementParserError[] = [];

  if (!header || !headerMatches(header.fields)) {
    return {
      metadata: {
        bank: "NUBANK",
        sourceEncoding: "utf-8",
        sourceLineEnding: detectLineEnding(text),
        delimiter: ",",
        fileName: input.fileName ?? null,
        fileHash: input.fileHash ?? null,
        invoiceMonth,
        invoiceGeneratedAt: null,
        invoiceDueDate,
        detectedPaymentStatus: null,
      },
      rowsRead: 0,
      transactions: [],
      skippedRows: [],
      errors: [
        {
          code: "missing_header",
          message: "Nubank CSV must start with header: date,title,amount.",
          sourceRowNumber: header?.sourceRowNumber ?? null,
        },
      ],
    };
  }

  const transactions: ParsedStatementTransaction[] = [];
  const skippedRows: ParsedStatementSkippedRow[] = [];

  for (const row of rows.slice(1)) {
    const skippedRow = skippedRowFor(row);
    if (skippedRow) {
      skippedRows.push(skippedRow);
      continue;
    }

    const parsed = toTransaction(row);
    if (parsed.transaction) {
      // Installments belong to the invoice that charges them; single purchases keep their own month.
      const { transaction } = parsed;
      transactions.push(
        invoiceMonth !== null && transaction.installment !== null
          ? { ...transaction, competencyMonth: invoiceMonth }
          : transaction,
      );
    }
    if (parsed.error) {
      errors.push(parsed.error);
    }
  }

  return {
    metadata: {
      bank: "NUBANK",
      sourceEncoding: "utf-8",
      sourceLineEnding: detectLineEnding(text),
      delimiter: ",",
      fileName: input.fileName ?? null,
      fileHash: input.fileHash ?? null,
      invoiceMonth,
      invoiceGeneratedAt: null,
      invoiceDueDate,
      detectedPaymentStatus: null,
    },
    rowsRead: rows.length - 1,
    transactions,
    skippedRows,
    errors,
  };
}
