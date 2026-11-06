import { resolveStatementCategory, type StatementCategoryRule } from "../statements/category-rules.ts";
import type { ImportedRowStatus } from "../statements/payment-status.ts";
import type {
  ParsedStatement,
  ParsedStatementTransaction,
  StatementBank,
} from "../statements/types.ts";
import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";
import type { StatementTransactionUpsert } from "./row-types.ts";
import { sha256Hex } from "./text.ts";

type RowContext = {
  userId: string;
  connectionId: string;
  accountId: string;
  batchId: string;
  bank: StatementBank;
  now: string;
  rowStatus: ImportedRowStatus;
  categoryRules: readonly StatementCategoryRule[];
};

function buildImportedTransaction(
  transaction: ParsedStatementTransaction,
  context: RowContext & { fingerprint: string },
): StatementTransactionUpsert {
  return {
    user_id: context.userId,
    connection_id: context.connectionId,
    account_id: context.accountId,
    source_provider: "CARD_STATEMENT",
    source_transaction_id: `${context.bank}:${context.fingerprint}`,
    provider_created_at: context.now,
    provider_updated_at: context.now,
    posted_at: transaction.postedAt,
    competency_month: transaction.competencyMonth,
    description: transaction.description,
    description_raw: transaction.descriptionRaw,
    amount_cents: transaction.amountCents,
    currency_code: transaction.currencyCode,
    status: context.rowStatus,
    direction: transaction.direction,
    merchant_name: null,
    merchant_legal_name: null,
    merchant_cnpj: null,
    internal_category_id: resolveStatementCategory(
      transaction.description,
      context.categoryRules,
    ),
    impact_type: transaction.impactType,
    is_internal_transfer: false,
    is_hidden_from_budget: transaction.defaultImportMode !== "IMPORT",
    note: null,
    provider_payload: {
      source: "CARD_STATEMENT",
      bank: context.bank,
      section: transaction.section,
      importMode: transaction.defaultImportMode,
      row: transaction.raw,
      sourceRowNumber: transaction.sourceRowNumber,
      installment: transaction.installment,
    },
    payment_method: "CREDIT_CARD",
    statement_import_batch_id: context.batchId,
    statement_source_bank: context.bank,
    statement_source_fingerprint: context.fingerprint,
    statement_source_section: transaction.section,
    statement_installment_index: transaction.installment?.index ?? null,
    statement_installment_total: transaction.installment?.total ?? null,
    statement_import_mode: transaction.defaultImportMode,
  };
}

// Turns every parsed row that should be imported into a database row, fingerprinted for idempotency.
export async function buildImportedTransactions(
  parsed: ParsedStatement,
  context: RowContext,
): Promise<StatementTransactionUpsert[]> {
  const transactions: StatementTransactionUpsert[] = [];

  for (const transaction of parsed.transactions) {
    if (transaction.defaultImportMode === "SKIP") {
      continue;
    }

    const fingerprint = await sha256Hex(transaction.fingerprintInput);
    transactions.push(buildImportedTransaction(transaction, { ...context, fingerprint }));
  }

  return transactions;
}

export async function upsertStatementTransactions(
  config: SupabaseRestConfig,
  transactions: StatementTransactionUpsert[],
): Promise<number> {
  if (transactions.length === 0) {
    return 0;
  }

  const rows = await supabaseRest<Array<{ id: string }>>(
    config,
    "/rest/v1/imported_transactions?on_conflict=user_id,source_provider,source_transaction_id&select=id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(transactions),
    },
  );

  return rows.length;
}
