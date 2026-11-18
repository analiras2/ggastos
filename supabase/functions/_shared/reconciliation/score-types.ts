export type ImpactType = "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";

export type PlannedEntryForScoring = {
  id: string;
  title: string;
  impactType: ImpactType;
  amountCents: number;
  dueDate: string | null;
  month: string;
  expectedAccountId: string | null;
  categoryName: string;
  installmentIndex?: number | null;
  installmentTotal?: number | null;
};

export type TransactionForScoring = {
  id: string;
  description: string;
  merchantName: string | null;
  impactType: ImpactType;
  amountCents: number;
  postedAt: string;
  competencyMonth: string;
  accountId: string;
  pluggyCategoryName: string | null;
  statementInstallmentIndex?: number | null;
  statementInstallmentTotal?: number | null;
};

export type MatchScore = {
  score: number;
  amountDeltaCents: number;
  dateDeltaDays: number;
  rationale: {
    amount: number;
    date: number;
    category: number;
    account: number;
    description: number;
    installment: number;
  };
};
