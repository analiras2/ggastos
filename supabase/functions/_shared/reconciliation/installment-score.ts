import type { PlannedEntryForScoring, TransactionForScoring } from "./score-types.ts";

type InstallmentSignal = {
  index: number;
  total: number;
};

function installmentFromText(text: string): InstallmentSignal | null {
  const match = text.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (!match) {
    return null;
  }

  const index = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isInteger(index) || !Number.isInteger(total) || index <= 0 || total <= 0) {
    return null;
  }
  if (index > total) {
    return null;
  }

  return { index, total };
}

function installmentFromFields(
  index: number | null | undefined,
  total: number | null | undefined,
): InstallmentSignal | null {
  if (!index || !total) {
    return null;
  }
  if (index <= 0 || total <= 0 || index > total) {
    return null;
  }

  return { index, total };
}

export function installmentScore(
  transaction: TransactionForScoring,
  plannedEntry: PlannedEntryForScoring,
): { available: boolean; value: number } {
  const transactionInstallment =
    installmentFromFields(
      transaction.statementInstallmentIndex,
      transaction.statementInstallmentTotal,
    ) ?? installmentFromText(transaction.description);
  const plannedInstallment =
    installmentFromFields(plannedEntry.installmentIndex, plannedEntry.installmentTotal) ??
      installmentFromText(plannedEntry.title);

  if (!transactionInstallment && !plannedInstallment) {
    return { available: false, value: 0 };
  }

  if (!transactionInstallment || !plannedInstallment) {
    return { available: true, value: 0 };
  }

  if (
    transactionInstallment.index === plannedInstallment.index &&
    transactionInstallment.total === plannedInstallment.total
  ) {
    return { available: true, value: 1 };
  }

  if (transactionInstallment.total === plannedInstallment.total) {
    return { available: true, value: 0.35 };
  }

  return { available: true, value: 0 };
}
