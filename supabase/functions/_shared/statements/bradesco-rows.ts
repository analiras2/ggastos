import type { StatementPaymentStatus, StatementSkippedReason } from "./types.ts";

const BRADESCO_HEADER = ["data", "historico", "valor(us$)", "valor(r$)"];
const SITUATION_PATTERN = /situacao da fatura:[ \t]*([^\r\n;]*)/i;
const PAID_SITUATION = "PAGO";

export type BradescoRow = {
  sourceRowNumber: number;
  fields: string[];
};

export function normalizeToken(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function splitSemicolonLine(line: string): string[] {
  return line.split(";").map((field) => field.trim());
}

export function parseRows(text: string): BradescoRow[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line, index) => ({ sourceRowNumber: index + 1, fields: splitSemicolonLine(line) }))
    .filter((row) => row.fields.some((field) => field.trim().length > 0));
}

export function isHeader(fields: string[]): boolean {
  return fields.length >= BRADESCO_HEADER.length &&
    BRADESCO_HEADER.every((expected, index) => normalizeToken(fields[index]) === expected);
}

export function skippedReason(description: string): StatementSkippedReason | null {
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

export function shouldReturnSkippedRow(reason: StatementSkippedReason): boolean {
  return reason !== "metadata" && reason !== "summary" && reason !== "total";
}

// "Situação da Fatura: PAGO" is printed at the top of the file. Anything other than PAGO means the
// statement is still open; a missing or empty line tells nothing.
export function detectPaymentStatus(text: string): StatementPaymentStatus | null {
  const match = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(SITUATION_PATTERN);
  const situation = match?.[1]?.trim().toUpperCase() ?? "";
  if (situation.length === 0) {
    return null;
  }
  return situation === PAID_SITUATION ? "PAID" : "OPEN";
}
