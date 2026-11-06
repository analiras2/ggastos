import type { PaymentStatus } from "../statements/payment-status.ts";
import type { StatementBank } from "../statements/types.ts";
import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

type StatementBatchRow = {
  id: string;
};

export async function createImportBatch(
  config: SupabaseRestConfig,
  batch: {
    userId: string;
    bank: StatementBank;
    fileName: string;
    fileHash: string;
    invoiceMonth: string | null;
    paymentStatus: PaymentStatus;
    payload: Record<string, unknown>;
  },
): Promise<string> {
  const rows = await supabaseRest<StatementBatchRow[]>(
    config,
    "/rest/v1/statement_import_batches?select=id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: batch.userId,
        bank: batch.bank,
        file_name: batch.fileName,
        file_hash: batch.fileHash,
        invoice_month: batch.invoiceMonth,
        payment_status: batch.paymentStatus,
        status: "RECEIVED",
        payload: batch.payload,
      }),
    },
  );

  if (rows.length !== 1) {
    throw new Error("Expected exactly one statement_import_batches row.");
  }

  return rows[0].id;
}

export async function updateImportBatch(
  config: SupabaseRestConfig,
  batchId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await supabaseRest<void>(
    config,
    `/rest/v1/statement_import_batches?id=eq.${batchId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    },
  );
}
