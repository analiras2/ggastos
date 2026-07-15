import type { PluggyAccount } from "../pluggy-client.ts";

export type FinancialAccountUpsert = {
  user_id: string;
  connection_id: string;
  pluggy_account_id: string;
  type: "BANK" | "CREDIT";
  subtype: "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CREDIT_CARD" | "OTHER";
  name: string;
  marketing_name: string | null;
  masked_number: string | null;
  owner_name: string | null;
  currency_code: string;
  balance_cents: number | null;
  credit_limit_cents: number | null;
  due_date: string | null;
  close_date: string | null;
  provider_payload: Record<string, unknown>;
};

const KNOWN_SUBTYPES = new Set(["CHECKING_ACCOUNT", "SAVINGS_ACCOUNT", "CREDIT_CARD"]);

function normalizeSubtype(
  subtype: string,
): "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CREDIT_CARD" | "OTHER" {
  return KNOWN_SUBTYPES.has(subtype)
    ? (subtype as "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CREDIT_CARD")
    : "OTHER";
}

function toCents(amount: number | null | undefined): number | null {
  if (amount === null || amount === undefined) {
    return null;
  }
  return Math.round(amount * 100);
}

export function normalizeAccount(
  account: PluggyAccount,
  context: { userId: string; connectionId: string },
): FinancialAccountUpsert {
  const isCredit = account.type === "CREDIT";

  return {
    user_id: context.userId,
    connection_id: context.connectionId,
    pluggy_account_id: account.id,
    type: account.type,
    subtype: normalizeSubtype(account.subtype),
    name: account.name,
    marketing_name: account.marketingName,
    masked_number: account.number,
    owner_name: account.owner,
    currency_code: account.currencyCode,
    balance_cents: toCents(account.balance),
    credit_limit_cents: isCredit ? toCents(account.creditData?.creditLimit) : null,
    due_date: isCredit ? (account.creditData?.balanceDueDate ?? null) : null,
    close_date: isCredit ? (account.creditData?.balanceCloseDate ?? null) : null,
    provider_payload: account as unknown as Record<string, unknown>,
  };
}
