import type { PluggyTransaction } from "../pluggy-client.ts";

export type ImportedTransactionUpsert = {
  user_id: string;
  connection_id: string;
  account_id: string;
  pluggy_transaction_id: string;
  provider_created_at: string;
  provider_updated_at: string;
  posted_at: string;
  competency_month: string;
  description: string;
  description_raw: string | null;
  amount_cents: number;
  currency_code: string;
  status: "PENDING" | "POSTED";
  direction: "DEBIT" | "CREDIT";
  pluggy_category_id: string | null;
  pluggy_category_name: string | null;
  merchant_name: string | null;
  merchant_legal_name: string | null;
  merchant_cnpj: string | null;
  internal_category_id: string | null;
  impact_type: "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";
  is_internal_transfer: boolean;
  provider_payload: Record<string, unknown>;
};

function toCents(amount: number): number {
  return Math.round(Math.abs(amount) * 100);
}

function competencyMonth(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function looksLikeTransfer(category: string | null): boolean {
  if (!category) {
    return false;
  }
  return category.toLowerCase().includes("transfer");
}

export function normalizeTransaction(
  transaction: PluggyTransaction,
  context: {
    userId: string;
    connectionId: string;
    accountId: string;
    categoryMap: Map<string, string>;
  },
): ImportedTransactionUpsert {
  const isInternalTransfer = looksLikeTransfer(transaction.category);
  const impactType = isInternalTransfer
    ? "TRANSFER"
    : transaction.type === "CREDIT"
      ? "INCOME"
      : "EXPENSE";

  return {
    user_id: context.userId,
    connection_id: context.connectionId,
    account_id: context.accountId,
    pluggy_transaction_id: transaction.id,
    provider_created_at: transaction.createdAt,
    provider_updated_at: transaction.updatedAt,
    posted_at: transaction.date,
    competency_month: competencyMonth(transaction.date),
    description: transaction.description,
    description_raw: transaction.descriptionRaw,
    amount_cents: toCents(transaction.amount),
    currency_code: transaction.currencyCode,
    status: transaction.status,
    direction: transaction.type,
    pluggy_category_id: transaction.categoryId,
    pluggy_category_name: transaction.category,
    merchant_name: transaction.merchant?.name ?? null,
    merchant_legal_name: transaction.merchant?.businessName ?? null,
    merchant_cnpj: transaction.merchant?.cnpj ?? null,
    internal_category_id: transaction.category
      ? context.categoryMap.get(transaction.category) ?? null
      : null,
    impact_type: impactType,
    is_internal_transfer: isInternalTransfer,
    provider_payload: transaction as unknown as Record<string, unknown>,
  };
}
