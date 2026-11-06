import type { ImportedRowStatus } from "../statements/payment-status.ts";
import type { ExistingUserEdits } from "../statements/preserve-user-edits.ts";
import type { StatementBank } from "../statements/types.ts";
import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

export type StoredImportedRow = ExistingUserEdits & { status: ImportedRowStatus };

type ExistingImportedRow = {
  statement_source_fingerprint: string;
  internal_category_id: string | null;
  note: string | null;
  status: ImportedRowStatus;
};

const FINGERPRINT_LOOKUP_CHUNK_SIZE = 50;

// Rows already stored for these fingerprints, with the columns a user may have edited.
export async function findExistingImportedRows(
  config: SupabaseRestConfig,
  context: { userId: string; bank: StatementBank; fingerprints: string[] },
): Promise<Map<string, StoredImportedRow>> {
  const existing = new Map<string, StoredImportedRow>();

  // Chunked so the fingerprint list never makes the request URL too long.
  for (let start = 0; start < context.fingerprints.length; start += FINGERPRINT_LOOKUP_CHUNK_SIZE) {
    const chunk = context.fingerprints.slice(start, start + FINGERPRINT_LOOKUP_CHUNK_SIZE);
    const params = new URLSearchParams({
      select: "statement_source_fingerprint,internal_category_id,note,status",
      user_id: `eq.${context.userId}`,
      statement_source_bank: `eq.${context.bank}`,
      statement_source_fingerprint: `in.(${chunk.join(",")})`,
    });
    const rows = await supabaseRest<ExistingImportedRow[]>(
      config,
      `/rest/v1/imported_transactions?${params.toString()}`,
      { method: "GET" },
    );

    for (const row of rows) {
      existing.set(row.statement_source_fingerprint, {
        internal_category_id: row.internal_category_id,
        note: row.note,
        status: row.status,
      });
    }
  }

  return existing;
}
