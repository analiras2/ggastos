import type { StatementImportMode, StatementBank, StatementSection } from "../statements/types.ts";

// One row of imported_transactions as the import writes it.
export type StatementTransactionUpsert = {
  user_id: string;
  connection_id: string;
  account_id: string;
  source_provider: "CARD_STATEMENT";
  source_transaction_id: string;
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
  merchant_name: string | null;
  merchant_legal_name: string | null;
  merchant_cnpj: string | null;
  internal_category_id: string | null;
  impact_type: "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";
  is_internal_transfer: boolean;
  is_hidden_from_budget: boolean;
  note: string | null;
  provider_payload: Record<string, unknown>;
  payment_method: "CREDIT_CARD";
  statement_import_batch_id: string;
  statement_source_bank: StatementBank;
  statement_source_fingerprint: string;
  statement_source_section: StatementSection;
  statement_installment_index: number | null;
  statement_installment_total: number | null;
  statement_import_mode: StatementImportMode;
};
