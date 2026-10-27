// Rules for the payment status of an imported statement. Pure functions, no I/O.

import type { StatementPaymentStatus } from "./types.ts";

export type PaymentStatus = StatementPaymentStatus;
export type ImportedRowStatus = "POSTED" | "PENDING";

// Where the status that was applied came from, in order of priority.
export type PaymentStatusSource = "USER" | "FILE" | "DUE_DATE" | "DEFAULT";

export type ResolvedPaymentStatus = {
  status: PaymentStatus;
  source: PaymentStatusSource;
};

export function parsePaymentStatus(value: unknown): PaymentStatus | null {
  return value === "PAID" || value === "OPEN" ? value : null;
}

// imported_transactions.status: a paid statement is POSTED, an open one is PENDING.
export function rowStatusFor(paymentStatus: PaymentStatus): ImportedRowStatus {
  return paymentStatus === "PAID" ? "POSTED" : "PENDING";
}

// Priority: what the user chose, then what the file says, then the due date (past means paid),
// and finally paid, which is how every statement was treated before this existed.
// `dueDate` and `today` are YYYY-MM-DD strings.
export function resolvePaymentStatus(input: {
  requested: PaymentStatus | null;
  detected: PaymentStatus | null;
  dueDate: string | null;
  today: string;
}): ResolvedPaymentStatus {
  if (input.requested) {
    return { status: input.requested, source: "USER" };
  }
  if (input.detected) {
    return { status: input.detected, source: "FILE" };
  }
  if (input.dueDate) {
    return { status: input.dueDate < input.today ? "PAID" : "OPEN", source: "DUE_DATE" };
  }
  return { status: "PAID", source: "DEFAULT" };
}

// Status of a row when its statement is imported again. Only an explicit choice by the user can
// reopen a paid row; a file that says "paid" can pay open rows; a suggestion changes nothing.
export function resolveRowStatus(
  existing: ImportedRowStatus | null,
  chosen: PaymentStatus,
  source: PaymentStatusSource,
): ImportedRowStatus {
  if (existing === null || source === "USER") {
    return rowStatusFor(chosen);
  }
  if (source === "FILE" && chosen === "PAID") {
    return "POSTED";
  }
  return existing;
}

// The statement is paid only when every one of its rows is. Without rows, the chosen status stays.
export function batchPaymentStatus(
  rowStatuses: readonly ImportedRowStatus[],
  chosen: PaymentStatus,
): PaymentStatus {
  if (rowStatuses.length === 0) {
    return chosen;
  }
  return rowStatuses.every((status) => status === "POSTED") ? "PAID" : "OPEN";
}

// Applies the status rules to the rows about to be upserted. `existingStatuses` maps the
// fingerprint of every row that is already stored to its current status.
export function applyPaymentStatus<Row extends { statement_source_fingerprint: string; status: ImportedRowStatus }>(
  rows: readonly Row[],
  existingStatuses: ReadonlyMap<string, ImportedRowStatus>,
  resolved: ResolvedPaymentStatus,
): Row[] {
  return rows.map((row) => ({
    ...row,
    status: resolveRowStatus(existingStatuses.get(row.statement_source_fingerprint) ?? null, resolved.status, resolved.source),
  }));
}
