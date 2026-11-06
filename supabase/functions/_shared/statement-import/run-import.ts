import type { AuthUser } from "../auth.ts";
import type { JsonValue } from "../http.ts";
import { runAutoMatch } from "../reconciliation/auto-match.ts";
import { parseBradescoStatement } from "../statements/parse-bradesco.ts";
import { parseNubankStatement } from "../statements/parse-nubank.ts";
import { resolvePaymentStatus } from "../statements/payment-status.ts";
import type { ParsedStatement } from "../statements/types.ts";
import type { SupabaseRestConfig } from "../supabase-rest.ts";
import { ensureStatementAccount } from "./account.ts";
import { createImportBatch, updateImportBatch } from "./batch.ts";
import { planFutureInstallments } from "./installments.ts";
import { ensureProfile } from "./profile.ts";
import type { ImportRequest } from "./request.ts";
import { storeStatementRows } from "./store-rows.ts";
import { sha256Hex, todayInStatementTimeZone } from "./text.ts";

export type ImportOutcome = { status: number; body: Record<string, JsonValue> };

function parseStatement(request: ImportRequest): ParsedStatement {
  const input = {
    bank: request.bank,
    contents: request.contents,
    fileName: request.fileName,
    fileHash: request.fileHash,
    invoiceMonth: request.invoiceMonth,
  };

  return request.bank === "NUBANK" ? parseNubankStatement(input) : parseBradescoStatement(input);
}

// The whole import: parse, record the batch, store the rows, plan future installments and reconcile.
export async function runStatementImport(
  config: SupabaseRestConfig,
  user: AuthUser,
  importRequest: ImportRequest,
): Promise<ImportOutcome> {
  const fileHash = importRequest.fileHash ?? await sha256Hex(importRequest.contents);
  const parsed = parseStatement({ ...importRequest, fileHash });
  const now = new Date().toISOString();

  const resolvedPaymentStatus = resolvePaymentStatus({
    requested: importRequest.paymentStatus,
    detected: parsed.metadata.detectedPaymentStatus,
    dueDate: parsed.metadata.invoiceDueDate,
    today: todayInStatementTimeZone(),
  });

  await ensureProfile(config, user);
  const batchId = await createImportBatch(config, {
    userId: user.id,
    bank: importRequest.bank,
    fileName: importRequest.fileName,
    fileHash,
    invoiceMonth: parsed.metadata.invoiceMonth,
    paymentStatus: resolvedPaymentStatus.status,
    payload: {
      source: "CARD_STATEMENT",
      metadata: parsed.metadata,
    },
  });

  if (parsed.errors.length > 0) {
    const message = parsed.errors.map((error) => error.message).join(" ");
    await updateImportBatch(config, batchId, {
      status: "FAILED",
      rows_read: parsed.rowsRead,
      rows_skipped: parsed.skippedRows.length,
      rows_failed: parsed.errors.length,
      error_message: message,
      payload: {
        source: "CARD_STATEMENT",
        metadata: parsed.metadata,
        errors: parsed.errors,
        skippedRows: parsed.skippedRows,
      },
    });

    return {
      status: 422,
      body: {
        error: "invalid_statement",
        message,
        batchId,
        rowsRead: parsed.rowsRead,
        rowsImported: 0,
        rowsDuplicated: 0,
        rowsSkipped: parsed.skippedRows.length,
        rowsFailed: parsed.errors.length,
      },
    };
  }

  const accountContext = await ensureStatementAccount(config, {
    userId: user.id,
    bank: importRequest.bank,
    now,
  });
  const { rowsImported, rowsDuplicated, paymentStatus } = await storeStatementRows(config, {
    userId: user.id,
    bank: importRequest.bank,
    batchId,
    now,
    parsed,
    resolvedPaymentStatus,
    ...accountContext,
  });
  const installmentsPlanned = await planFutureInstallments(config, user.id, batchId);
  const matchOutcomes = await runAutoMatch(config, {
    userId: user.id,
    accountId: accountContext.accountId,
  });

  await updateImportBatch(config, batchId, {
    status: "PROCESSED",
    payment_status: paymentStatus,
    rows_read: parsed.rowsRead,
    rows_imported: rowsImported,
    rows_duplicated: rowsDuplicated,
    rows_skipped: parsed.skippedRows.length,
    rows_failed: 0,
    matches_created: matchOutcomes.length,
    payload: {
      source: "CARD_STATEMENT",
      metadata: parsed.metadata,
      skippedRows: parsed.skippedRows,
      matches: matchOutcomes,
    },
  });

  return {
    status: 202,
    body: {
      batchId,
      bank: importRequest.bank,
      accountId: accountContext.accountId,
      rowsRead: parsed.rowsRead,
      rowsImported,
      rowsDuplicated,
      rowsSkipped: parsed.skippedRows.length,
      rowsFailed: 0,
      matchesCreated: matchOutcomes.length,
      installmentsPlanned,
      paymentStatus,
      paymentStatusSource: resolvedPaymentStatus.source,
    },
  };
}
