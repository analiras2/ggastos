import { parseAmountCents } from "./csv-utils.ts";
import type {
  ParsedStatement,
  ParsedStatementSkippedRow,
  ParsedStatementTransaction,
  StatementParserError,
  StatementParserInput,
} from "./types.ts";

// Reads the text of a Mercado Pago card statement PDF. The page "Detalhes de consumo" lists first the
// payments received ("Movimentações na fatura"), then each card ("Cartão Visa [****1234]") with one
// line per purchase: "06/10 RAIA DROGASIL SA R$ 102,84", with "Parcela 3 de 4" before the amount.
const DUE_DATE_PATTERN = /vence em[\s\S]{0,40}?(\d{2})\/(\d{2})\/(\d{4})|vencimento:\s*(\d{2})\/(\d{2})\/(\d{4})/i;
const ISSUED_PATTERN = /emitida em:\s*(\d{2})\/(\d{2})\/(\d{4})/i;
const LINE_PATTERN = /^(\d{2})\/(\d{2})\s+(.+?)\s+(?:Parcela\s+(\d{1,2})\s+de\s+(\d{1,2})\s+)?(-?)\s*R\$\s*(-?[\d.]+,\d{2})$/;
const TOTAL_PATTERN = /^Total\s+R\$\s*([\d.]+,\d{2})$/;
const PAYMENTS_HEADING = /^Movimenta[çc][õo]es na fatura$/i;
const CARD_HEADING = /^Cart[ãa]o\s+.+\[[*\d\s]+\]$/i;
const PAYMENT_DESCRIPTION = /^pagamento/i;
const MONTH_LENGTH = 7;

type Section = "PAYMENTS" | "PURCHASES" | null;

function isoDate(day: string, month: string, year: string): string {
  return `${year}-${month}-${day}`;
}

function readDueDate(text: string): string | null {
  const match = text.match(DUE_DATE_PATTERN);
  return match ? isoDate(match[1] ?? match[4], match[2] ?? match[5], match[3] ?? match[6]) : null;
}

function readIssuedDate(text: string): string | null {
  const match = text.match(ISSUED_PATTERN);
  return match ? isoDate(match[1], match[2], match[3]) : null;
}

// The lines carry no year. A purchase is never after the due date, so a later month belongs to the year before.
function purchaseDate(day: string, month: string, dueDate: string): string {
  const dueYear = Number(dueDate.slice(0, 4));
  const year = Number(month) > Number(dueDate.slice(5, 7)) ? dueYear - 1 : dueYear;
  return isoDate(day, month, String(year));
}

export function parseMercadoPagoStatement(input: StatementParserInput): ParsedStatement {
  const text = typeof input.contents === "string" ? input.contents : new TextDecoder().decode(input.contents);
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const invoiceDueDate = readDueDate(text);
  const invoiceMonth = input.invoiceMonth ?? invoiceDueDate?.slice(0, MONTH_LENGTH) ?? null;
  const transactions: ParsedStatementTransaction[] = [];
  const skippedRows: ParsedStatementSkippedRow[] = [];
  const errors: StatementParserError[] = [];
  let section: Section = null;
  let statedTotalCents: number | null = null;
  let netCents = 0;
  let rowsRead = 0;

  for (const line of lines) {
    if (PAYMENTS_HEADING.test(line)) {
      section = "PAYMENTS";
      continue;
    }
    if (CARD_HEADING.test(line)) {
      section = "PURCHASES";
      continue;
    }
    const totalMatch = line.match(TOTAL_PATTERN);
    if (section === "PURCHASES" && totalMatch) {
      statedTotalCents = parseAmountCents(totalMatch[1]);
      section = null;
      continue;
    }
    const match = section ? line.match(LINE_PATTERN) : null;
    if (!match || !invoiceDueDate) {
      continue;
    }

    rowsRead += 1;
    const [, day, month, description, installmentIndex, installmentTotal, minus, amount] = match;
    const amountCents = parseAmountCents(amount) ?? 0;
    const raw = { date: `${day}/${month}`, description, amount };
    if (section === "PAYMENTS" && PAYMENT_DESCRIPTION.test(description)) {
      skippedRows.push({ sourceRowNumber: rowsRead, section: "CURRENT_INVOICE", reason: "payment_or_credit", raw });
      continue;
    }

    const postedAt = purchaseDate(day, month, invoiceDueDate);
    const isCredit = section === "PAYMENTS" || minus === "-" || amount.startsWith("-");
    netCents += isCredit ? -amountCents : amountCents;
    transactions.push({
      sourceRowNumber: rowsRead,
      section: "CURRENT_INVOICE",
      postedAt,
      // Installments belong to the invoice that charges them; single purchases keep their own month.
      competencyMonth: installmentIndex && invoiceMonth ? invoiceMonth : postedAt.slice(0, MONTH_LENGTH),
      description,
      descriptionRaw: description,
      amountCents,
      currencyCode: "BRL",
      direction: isCredit ? "CREDIT" : "DEBIT",
      impactType: "EXPENSE",
      installment: installmentIndex ? { index: Number(installmentIndex), total: Number(installmentTotal) } : null,
      defaultImportMode: "IMPORT",
      fingerprintInput: ["MERCADO_PAGO", rowsRead, postedAt, description, installmentIndex ?? "", amountCents].join("|"),
      raw,
    });
  }

  if (!invoiceDueDate || rowsRead === 0) {
    errors.push({
      code: "unsupported_format",
      message: "Não encontrei as compras nessa fatura do Mercado Pago.",
      sourceRowNumber: null,
    });
  } else if (statedTotalCents !== null && statedTotalCents !== netCents) {
    errors.push({
      code: "total_mismatch",
      message: "A soma das compras lidas não bate com o total da fatura. Nada foi importado.",
      sourceRowNumber: null,
    });
  }

  return {
    metadata: {
      bank: "MERCADO_PAGO",
      sourceEncoding: "utf-8",
      sourceLineEnding: "LF",
      delimiter: null,
      fileName: input.fileName ?? null,
      fileHash: input.fileHash ?? null,
      invoiceMonth,
      invoiceGeneratedAt: readIssuedDate(text),
      invoiceDueDate,
      detectedPaymentStatus: null,
    },
    rowsRead,
    transactions,
    skippedRows,
    errors,
  };
}
