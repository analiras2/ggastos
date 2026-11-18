import type { StatementInstallment } from "./types.ts";

// Helpers shared by the bank statement parsers.

const INSTALLMENT_PATTERN = /\b(\d{1,2})\/(\d{1,2})\b/;

export type LineEnding = "LF" | "CRLF" | "CR" | "UNKNOWN";

// Text is used as is; bytes are decoded with the encoding the bank writes its files in.
export function decodeContents(contents: string | Uint8Array, encoding: "utf-8" | "iso-8859-1"): string {
  if (typeof contents === "string") {
    return contents;
  }

  return new TextDecoder(encoding).decode(contents);
}

export function detectLineEnding(text: string): LineEnding {
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

// Brazilian amount (1.234,56) to cents, ignoring the sign. Null when it is not a number.
export function parseAmountCents(rawAmount: string): number | null {
  const normalized = rawAmount.trim().replace(/\./g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  return Math.round(Math.abs(Number(normalized)) * 100);
}

// A leading minus is a credit (refund); anything else is a debit.
export function parseDirection(rawAmount: string): "DEBIT" | "CREDIT" {
  return rawAmount.trim().startsWith("-") ? "CREDIT" : "DEBIT";
}

// "3/10" in a description means installment 3 of 10; impossible values are ignored.
export function parseInstallment(description: string): StatementInstallment | null {
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
