import { skippedReason, type BradescoRow } from "./bradesco-rows.ts";

const BRADESCO_GENERATED_AT_PATTERN =
  /^Data:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/i;
export const DATE_WITHOUT_YEAR_PATTERN = /^(\d{2})\/(\d{2})$/;
export const DATE_WITH_YEAR_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const INVOICE_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const ISO_DATE_LENGTH = 10;
const YEAR_LENGTH = 4;
const MIN_MONTH = 1;
const MAX_MONTH = 12;

export function parseGeneratedAt(text: string): string | null {
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
export function referenceDate(invoiceGeneratedAt: string | null, invoiceMonth: string | null): string | null {
  const invoiceMonthEnd = invoiceMonth ? lastDayOfMonth(invoiceMonth) : null;
  if (invoiceMonthEnd) {
    return invoiceMonthEnd;
  }
  return invoiceGeneratedAt ? invoiceGeneratedAt.slice(0, ISO_DATE_LENGTH) : null;
}

// The invoice month is the month the invoice is paid. The previous balance row is dated with the due
// date of the previous invoice, so this invoice is due one month after it. The year is resolved
// against the generation date because the row carries only dd/mm.
export function inferInvoiceMonth(rows: BradescoRow[], invoiceGeneratedAt: string | null): string | null {
  if (!invoiceGeneratedAt) {
    return null;
  }

  const generatedDate = invoiceGeneratedAt.slice(0, ISO_DATE_LENGTH);
  for (const row of rows) {
    const rawDate = row.fields[0]?.trim() ?? "";
    const match = rawDate.match(DATE_WITHOUT_YEAR_PATTERN);
    if (!match || skippedReason(row.fields[1] ?? "") !== "previous_balance") {
      continue;
    }

    const [, day, month] = match;
    const monthNumber = Number(month);
    if (monthNumber < MIN_MONTH || monthNumber > MAX_MONTH) {
      return null;
    }

    let year = Number(generatedDate.slice(0, YEAR_LENGTH));
    if (`${year}-${month}-${day}` > generatedDate) {
      year -= 1;
    }
    const isDecember = monthNumber === MAX_MONTH;
    const invoiceYear = isDecember ? year + 1 : year;
    const invoiceMonthNumber = isDecember ? MIN_MONTH : monthNumber + 1;
    return `${invoiceYear}-${String(invoiceMonthNumber).padStart(2, "0")}`;
  }

  return null;
}

// Invoice rows are listed from the newest purchase to the oldest, so each date is bounded by the
// previous one. A dd/mm later than the bound belongs to the year before it (e.g. 10/12 listed after
// 05/01). Scheduled rows are future dates and keep the bound's year.
export function parseDate(rawDate: string, upperBound: string | null, rollBackYear: boolean): string | null {
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

export function isTransactionLikeRow(row: BradescoRow): boolean {
  return row.fields.length >= 4 &&
    (DATE_WITH_YEAR_PATTERN.test(row.fields[0].trim()) ||
      DATE_WITHOUT_YEAR_PATTERN.test(row.fields[0].trim()));
}
