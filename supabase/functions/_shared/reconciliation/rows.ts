import type { ImpactType, PlannedEntryForScoring, TransactionForScoring } from "./score.ts";

// Rows as the REST API returns them for the reconciliation queries.
export type TransactionRow = {
  id: string;
  description: string;
  merchant_name: string | null;
  impact_type: ImpactType;
  amount_cents: number;
  posted_at: string;
  competency_month: string;
  account_id: string;
  pluggy_category_name: string | null;
  statement_installment_index: number | null;
  statement_installment_total: number | null;
};

export type PlannedEntryRow = {
  id: string;
  title: string;
  impact_type: ImpactType;
  amount_cents: number;
  due_date: string | null;
  month: string;
  expected_account_id: string | null;
  category_id: string;
  installment_index: number | null;
  installment_total: number | null;
};

export type ReconciliationMatchRow = {
  imported_transaction_id: string;
  planned_entry_id: string;
};

export const TRANSACTION_COLUMNS =
  "id,description,merchant_name,impact_type,amount_cents,posted_at,competency_month,account_id,pluggy_category_name,statement_installment_index,statement_installment_total";

export const PLANNED_ENTRY_COLUMNS =
  "id,title,impact_type,amount_cents,due_date,month,expected_account_id,category_id,installment_index,installment_total";

export function toTransactionForScoring(row: TransactionRow): TransactionForScoring {
  return {
    id: row.id,
    description: row.description,
    merchantName: row.merchant_name,
    impactType: row.impact_type,
    amountCents: row.amount_cents,
    postedAt: row.posted_at,
    competencyMonth: row.competency_month,
    accountId: row.account_id,
    pluggyCategoryName: row.pluggy_category_name,
    statementInstallmentIndex: row.statement_installment_index,
    statementInstallmentTotal: row.statement_installment_total,
  };
}

export function toPlannedEntryForScoring(
  row: PlannedEntryRow,
  categoryNames: Map<string, string>,
): PlannedEntryForScoring {
  return {
    id: row.id,
    title: row.title,
    impactType: row.impact_type,
    amountCents: row.amount_cents,
    dueDate: row.due_date,
    month: row.month,
    expectedAccountId: row.expected_account_id,
    categoryName: categoryNames.get(row.category_id) ?? "",
    installmentIndex: row.installment_index,
    installmentTotal: row.installment_total,
  };
}

// Identifies a transaction and planned entry pair, e.g. to remember that it was rejected.
export function pairKey(transactionId: string, plannedEntryId: string): string {
  return `${transactionId}:${plannedEntryId}`;
}
