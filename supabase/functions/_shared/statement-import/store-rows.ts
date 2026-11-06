import {
  applyPaymentStatus,
  batchPaymentStatus,
  rowStatusFor,
  type PaymentStatus,
  type ResolvedPaymentStatus,
} from "../statements/payment-status.ts";
import { preserveUserEdits } from "../statements/preserve-user-edits.ts";
import type { ParsedStatement, StatementBank } from "../statements/types.ts";
import type { SupabaseRestConfig } from "../supabase-rest.ts";
import { loadStatementCategoryRules } from "./category-rules-loader.ts";
import { findExistingImportedRows } from "./existing-rows.ts";
import { buildImportedTransactions, upsertStatementTransactions } from "./rows.ts";

type StoreRowsInput = {
  userId: string;
  bank: StatementBank;
  batchId: string;
  now: string;
  connectionId: string;
  accountId: string;
  parsed: ParsedStatement;
  resolvedPaymentStatus: ResolvedPaymentStatus;
};

type StoreRowsResult = {
  rowsImported: number;
  rowsDuplicated: number;
  paymentStatus: PaymentStatus;
};

// Builds the rows, keeps what the user edited on earlier imports, and upserts them.
export async function storeStatementRows(
  config: SupabaseRestConfig,
  input: StoreRowsInput,
): Promise<StoreRowsResult> {
  const { userId, bank, parsed, resolvedPaymentStatus } = input;
  const categoryRules = await loadStatementCategoryRules(config, userId);
  const transactions = await buildImportedTransactions(parsed, {
    userId,
    bank,
    batchId: input.batchId,
    now: input.now,
    connectionId: input.connectionId,
    accountId: input.accountId,
    rowStatus: rowStatusFor(resolvedPaymentStatus.status),
    categoryRules,
  });
  const existingRows = await findExistingImportedRows(config, {
    userId,
    bank,
    fingerprints: transactions.map((transaction) => transaction.statement_source_fingerprint),
  });
  // Re-importing must not undo what the user did after the first import: categories and notes are
  // kept, and a paid row is only reopened when the user explicitly asks for it.
  const existingStatuses = new Map(
    [...existingRows].map(([fingerprint, row]) => [fingerprint, row.status] as const),
  );
  const rowsToUpsert = applyPaymentStatus(
    preserveUserEdits(transactions, existingRows),
    existingStatuses,
    resolvedPaymentStatus,
  );
  await upsertStatementTransactions(config, rowsToUpsert);

  return {
    rowsImported: transactions.length - existingRows.size,
    rowsDuplicated: existingRows.size,
    paymentStatus: batchPaymentStatus(
      rowsToUpsert.map((row) => row.status),
      resolvedPaymentStatus.status,
    ),
  };
}
